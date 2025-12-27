# 数据库原理大作业 - 演示文档

---

## 1. 项目整体介绍 

**项目名称**: NWPUShare (西北工业大学课程资源共享平台)
**核心目标**: 解决校园课程资料分散、获取难的问题，提供一个集中的资源分享与交流社区。

**技术架构**:
- **前端**: Next.js 15 (React) + HeroUI
- **后端**: Next.js API Routes (Serverless)
- **数据库**: MySQL 8.0
- **ORM**: Prisma (用于定义 Schema 和进行类型安全的数据库操作)

---

## 2. 功能演示与数据库结合

### 功能一：首页“最热课程”展示 (聚合与排序)

**演示路径**:
1. 打开首页 。
2. 指向“最热课程”板块。
3. 解释：这里展示的是收藏量(Heart Count)最高的课程。

**数据库/代码讲解**:

*   **数据模型 (`prisma/schema/course.prisma`)**:
    `Course` 表包含 `heart_count` 字段，用于存储收藏数。

*   **后端逻辑 (`app/api/course/list/route.ts`)**:
    系统通过 Prisma 的 `findMany` 方法查询课程，并使用 `orderBy` 进行排序。

    ```typescript
    // 伪代码/关键逻辑展示
    const orderBy = sort === 'popular'
      ? { heart_count: 'desc' } // 按收藏数降序
      : { created: 'desc' }     // 按时间降序

    prisma.course.findMany({
      where: { ... },
      orderBy: orderBy,
      take: 9 // 限制返回数量
    })
    ```

### 功能二：上传课程资源 (CRUD - Create & 关联)

**演示路径**:
1. 进入任意课程页面 (例如: `/course/cs/database-system`)。
2. 点击右上角 **“发布资源”** 按钮。
3. 填写表单：
    - 标题: "2024年期末复习重点"
    - 类型: "笔记"
    - 链接: (粘贴一个网盘链接)
4. 点击提交，提示成功。

**数据库/代码讲解**:

*   **数据模型 (`prisma/schema/course.prisma`)**:
    `Resource` 表是核心，它通过外键关联了 `Course` (课程) 和 `User` (作者)。

    ```prisma
    model resource {
      id          Int      @id @default(autoincrement())
      course_id   Int      // 外键：关联课程
      author_id   Int      // 外键：关联用户(作者)
      title       String
      links       String   @db.Text // 特点：使用 JSON 字符串存储多个链接
      status      content_status @default(published) // 状态机
      // ...
    }
    ```

*   **后端逻辑 (`app/api/course/[dept]/[slug]/resources/route.ts`)**:
    这是一个典型的 `INSERT` 操作，同时处理了数据关联。

    ```typescript
    // 关键代码逻辑
    const created = await prisma.resource.create({
      data: {
        course_id: course.id,      // 关联当前课程
        author_id: payload.uid,    // 关联当前登录用户
        title: input.title,
        type: input.type,
        links: JSON.stringify(input.links), // 序列化存储
        status: 'published',       // 默认发布状态
        visibility: 'public'
      }
    })
    ```

---

## 3. 总结 (30秒)

本项目通过合理的数据库设计（User-Course-Resource 关系模型），结合 Prisma ORM 的强类型特性，实现了高效的数据查询与管理。
- **查询优化**: 首页使用了索引和排序。
- **数据完整性**: 通过外键约束保证了资源必须归属于课程和用户。
- **扩展性**: 使用 JSON 字段存储复杂结构（如资源链接），避免了过多的关联表。
