# Schema 改进设计（学生资源分享站）

## 背景与目标

为了降低维护成本、减轻课程打分的敏感度，同时突出“资源价值 + 贡献排行榜”，我们对现有 schema 做以下思路上的升级：

1. **课程只记录红心（喜欢）与难度反馈**：取消课程评分表，把反馈简化为点赞 + 难度投票，聚焦正向互动。
2. **资源单独评分/计数**：对每个资源收集评分、点击/下载数据，以反映资源价值。
3. **用户贡献度可量化**：统计上传数量、资源被下载/评分情况，引入勋章系统，支持排行榜。
4. **查询场景导向的索引**：面向“最新课程”“按学院浏览”“热门资源”“贡献榜”优化索引。

以下内容对比“原始 schema”与“改进 schema” 的差异，并给出数据流与索引建议。

## 关键差异一览

| 模块     | 原始设计                                                            | 改进设计                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 课程反馈 | `course_rating` + `course_rating_like`，记录 overall / recommend 等 | 删除评分表，新增 `course_feedback`（字段：`liked`、`difficulty`、可选短评），课程实体保留 `heart_count`、`difficulty_avg` 聚合字段                                            |
| 资源反馈 | 只有 `upVotes/downVotes` 计数                                       | 新增 `resource_rating`（用户对资源的评分 + 文字），`resource_interaction`（点击/下载日志），`resource` 表维护 `rating_avg/rating_count/download_count/click_count` 去范式字段 |
| 用户统计 | `user` 只有基础信息                                                 | 新增 `resource_upload_count`、`resource_download_count`、`contribution_score`，以及 `user_badge`（多对多）支撑勋章体系                                                        |
| 课程指标 | `rating_avg`/`rating_count`                                         | 替换为 `heart_count`、`difficulty_avg`、`difficulty_votes`                                                                                                                    |
| 讨论区   | 仍然使用 `post/comment`                                             | 保持不变，但 `post` 可以区分“讨论”、“经验贴”通过枚举 `PostType`                                                                                                               |

> 后续迁移可以在 Prisma schema 里新增/替换字段，再通过 `prisma migrate dev` 生成 SQL。

## 数据流 & 表设计

### 1. 按学院浏览课程

- 请求：`GET /departments/:id/courses?sort=latest`
- 数据流：`Department -> Course`（按 `department_id` + `created DESC` 排序）
- 聚合字段：`Course` 现在包含 `heart_count`/`difficulty_avg`，可直接在列表展示。
- 索引：`CREATE INDEX idx_course_department_created ON course (department_id, created DESC);`

### 2. 最新课程 / 热门课程

- 最新：直接复用 `idx_course_department_created`；若需要全局最新可建 `idx_course_created`。
- 热门：
  - 依据 `heart_count` 排序 → 建 `CREATE INDEX idx_course_hearts_created ON course (heart_count DESC, created DESC);`
  - 若结合“最近 30 天红心”可做物化视图 `mv_hot_courses`（以 `course_feedback` + `created >= now()-30d` 为数据源）。

### 3. 最新/热门资源列表

- 数据流：`Resource` 查询 `status='published' AND visibility='public'`，按 `created` 或 `download_count` 排序。
- 新增字段：`resource.rating_avg`、`rating_count`、`download_count`、`click_count`。
- 新表 `resource_rating`：
  ```sql
  CREATE TABLE resource_rating (
    id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL REFERENCES resource(id),
    user_id INT NOT NULL REFERENCES app_user(id),
    score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    usefulness SMALLINT CHECK (usefulness BETWEEN 1 AND 5),
    comment TEXT,
    created TIMESTAMPTZ DEFAULT now(),
    updated TIMESTAMPTZ DEFAULT now(),
    UNIQUE(resource_id, user_id)
  );
  CREATE INDEX idx_resource_rating_resource ON resource_rating(resource_id);
  CREATE INDEX idx_resource_rating_user ON resource_rating(user_id);
  ```
- 新表 `resource_interaction`（记录点击/下载、用于 download_count）：
  ```sql
  CREATE TYPE resource_interaction_type AS ENUM ('click','download');
  CREATE TABLE resource_interaction (
    id BIGSERIAL PRIMARY KEY,
    resource_id INT NOT NULL REFERENCES resource(id),
    user_id INT REFERENCES app_user(id),
    interaction resource_interaction_type NOT NULL,
    created TIMESTAMPTZ DEFAULT now()
  );
  CREATE INDEX idx_resource_interaction_res_created ON resource_interaction(resource_id, created DESC);
  CREATE INDEX idx_resource_interaction_user_created ON resource_interaction(user_id, created DESC);
  ```
- 更新 `resource` 模型：增加 `rating_avg`、`rating_count`、`download_count`、`click_count`，并在触发器或应用层更新。

### 4. 课程红心 + 难度反馈

- `course_feedback`：
  ```sql
  CREATE TABLE course_feedback (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES course(id),
    user_id INT NOT NULL REFERENCES app_user(id),
    liked BOOLEAN NOT NULL DEFAULT false,
    difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
    comment TEXT,
    created TIMESTAMPTZ DEFAULT now(),
    updated TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, user_id)
  );
  CREATE INDEX idx_course_feedback_course ON course_feedback(course_id);
  CREATE INDEX idx_course_feedback_user ON course_feedback(user_id);
  CREATE INDEX idx_course_feedback_liked ON course_feedback(course_id) WHERE liked = true;
  ```
- `course` 去范式字段：
  ```prisma
  model Course {
    heartCount      Int    @default(0) @map("heart_count")
    difficultyAvg   Float  @default(0) @map("difficulty_avg")
    difficultyVotes Int    @default(0) @map("difficulty_votes")
    feedbacks       CourseFeedback[]
  }
  ```
- 数据流：
  1. 学生在课程页点击“红心” → `course_feedback` upsert + 触发器更新 `heart_count`。
  2. 提交难度分数 → 同表 `difficulty` 字段更新 → 事务内重新聚合 `difficultyAvg`、`difficultyVotes`。

### 5. 用户贡献度与勋章

- `user` 新字段示例：
  ```prisma
  model User {
    resourceUploadCount   Int    @default(0) @map("resource_upload_count")
    resourceDownloadCount Int    @default(0) @map("resource_download_count")
    contributionScore     Int    @default(0) @map("contribution_score")
    badges                UserBadge[]
  }
  ```
- 勋章系统：
  ```sql
  CREATE TABLE badge (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    min_points INT NOT NULL
  );
  CREATE TABLE user_badge (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES app_user(id),
    badge_id INT NOT NULL REFERENCES badge(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, badge_id)
  );
  ```
- 贡献值计算示例：`contribution_score = resource_upload_count * 5 + resource_download_count * 1 + resource_rating_avg * 10`，可用定时作业或 SQL 视图计算。
- 排行榜查询：
  ```sql
  SELECT id, name, contribution_score
  FROM app_user
  ORDER BY contribution_score DESC
  LIMIT 50;
  ```
  对应索引：`CREATE INDEX idx_user_contribution ON app_user (contribution_score DESC);`

### 6. 资源上传 & 链接存储

- 上传流程：学生提交链接 URL、描述、课程 → `resource` 记录 `links[]`（或拆表 `resource_link`）。建议：
  - 若需要统计不同链接的点击，可把 `links` 拆成 `resource_link`，每条 link 有单独 ID，方便记录点击。
  - 简化方案：保留 `links[]`，把点击/下载事件记在 `resource_interaction`。

## 索引与查询建议总表

| 查询场景            | 建议索引/物化视图                                                                                  | 说明                             |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| 按学院/时间浏览课程 | `idx_course_department_created (department_id, created DESC)`                                      | 支持学院页最新课程列表           |
| Hot course 红心榜   | `idx_course_hearts_created (heart_count DESC, created DESC)` 或 `mv_hot_courses`                   | 直接排序 + 限制 TOP N            |
| 资源公共流          | Partial index `resource_status_visibility_created_idx`（已存在）+ 新增 `(course_id, created DESC)` | 降低回表次数，支持课程内资源分页 |
| 资源评分查询        | `idx_resource_rating_resource` + `idx_resource_rating_user`                                        | 支持资源详情/用户历史评分        |
| 资源点击/下载统计   | `idx_resource_interaction_res_created`                                                             | 用于按时间窗统计下载量           |
| 用户贡献榜          | `idx_user_contribution (contribution_score DESC)`                                                  | 排行榜查询走索引排序             |
| 红心/难度反馈       | `idx_course_feedback_course`（含 `WHERE liked=true` 的部分索引）                                   | 快速聚合点赞与难度               |

## 实施步骤（建议）

1. **Prisma schema 调整**：
   - 删除 `CourseRating*` 模型，新增 `CourseFeedback`, `ResourceRating`, `ResourceInteraction`, `Badge`, `UserBadge` 等模型。
   - 更新 `Course`、`Resource`、`User` 字段。
2. **迁移脚本**：通过 `prisma migrate dev` 生成 DDL，或在 `prisma/migrations` 中添加 raw SQL。
3. **数据回填**：
   - 如果已有课程评分数据，可迁移 `overall` > 4 视为 `liked=true`，`difficulty/workload` 平均后写入 `difficultyAvg`。
   - 初始化 `resource_*` 统计字段为 0。
4. **应用层逻辑**：
   - 替换课程评分 API → `course_feedback` upsert。
   - 新增资源评分 API、点击/下载埋点。
   - 每次资源上传/下载后更新用户贡献字段（或定时批处理）。
5. **排行榜 & 勋章**：
   - 编写每日 job，根据 `contribution_score` 与 `badge.min_points` 发放勋章。
   - 在前端展示 TOP N 用户及其勋章。

## 数据流总结

- **学生浏览首页**：
  1. 读取 `mv_hot_courses` 或 `course` 排序；
  2. 查询最新资源（partial index + course filter）；
  3. 统计勋章榜（`ORDER BY contribution_score DESC`）。
- **学生按学院钻取**：
  1. `GET /departments/:id` → `idx_course_department_created`；
  2. 点击课程 → `course_feedback` 聚合 + 资源列表。
- **上传资源**：
  1. 插入 `resource` 记录，默认 `download_count=0`；
  2. 更新 `user.resource_upload_count`，重新计算 `contribution_score`；
  3. 可触发异步审阅流程。
- **互动与统计**：
  1. 点红心/投难度 → upsert `course_feedback`，更新 `heart_count/difficulty_avg`；
  2. 资源被点击/下载 → 写 `resource_interaction`，触发 `download_count` 自增，累积到作者；
  3. 资源被评分 → 写 `resource_rating`，更新 `rating_avg/count`。

以上方案保留原有 Lab 架构（Prisma + Postgres），同时满足你提出的“更轻的课程反馈、更详细的资源价值、用户贡献排行榜和勋章”诉求。后续若需要我把这些模型真正替换进 `prisma/schema.prisma` 并调整 seed/脚本，可以继续交给我。EOF
