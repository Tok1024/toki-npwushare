/* eslint-disable no-console */
import { prisma } from '~/prisma'
import { hashPassword } from '~/app/api/utils/algorithm'

type SeedUser = {
  email: string
  name: string
  role: number
}

type SeedTeacher = {
  name: string
  title?: string
}

type SeedResource = {
  title: string
  type:
    | 'note'
    | 'slides'
    | 'assignment'
    | 'exam'
    | 'solution'
    | 'link'
    | 'other'
  links: string[]
  term?: string
  teacher?: string
  authorEmail?: string
  summary?: string
}

type SeedPost = {
  title: string
  content: string
  term?: string
  teacher?: string
  authorEmail: string
}

type SeedFeedback = {
  userEmail: string
  liked: boolean
  difficulty?: number
  comment?: string
}

type SeedComment = {
  userEmail: string
  content: string
}

type SeedCourse = {
  slug: string
  name: string
  code?: string
  description?: string
  instructor?: string
  tags: string[]
  teachers: { name: string; year: string }[]
  resources: SeedResource[]
  posts: SeedPost[]
  feedbacks: SeedFeedback[]
  courseComments?: SeedComment[]
  resourceComments?: { resourceTitle: string; comments: SeedComment[] }[]
}

type SeedDepartment = {
  slug: string
  name: string
  teachers: SeedTeacher[]
  courses: SeedCourse[]
}

const users: SeedUser[] = [
  { email: 'seed@example.com', name: 'seed-user', role: 3 },
  { email: 'alice@example.com', name: 'alice', role: 1 },
  { email: 'bob@example.com', name: 'bob', role: 1 },
  { email: 'carol@example.com', name: 'carol', role: 1 }
]

const baseDepartments: SeedDepartment[] = [
  {
    slug: 'cs',
    name: '计算机科学与技术学院',
    teachers: [
      { name: '张晓', title: '教授' },
      { name: '李倩', title: '副教授' },
      { name: '赵晨', title: '讲师' }
    ],
    courses: [
      {
        slug: 'signal-and-system',
        name: '信号与系统',
        code: 'CS2001',
        description:
          '围绕连续与离散信号展开，覆盖卷积、傅里叶、拉普拉斯等基础内容，帮助学生建立系统分析思维。',
        instructor: '张晓',
        tags: ['必修', '大二', '信号'],
        teachers: [
          { name: '张晓', year: '2024-Fall' },
          { name: '李倩', year: '2025-Spring' }
        ],
        resources: [
          {
            title: '2024 秋讲义全套',
            type: 'slides',
            term: '2024-Fall',
            teacher: '张晓',
            authorEmail: 'seed@example.com',
            summary: '课堂讲义+随堂小测答案 PDF 打包。',
            links: ['https://pan.example.com/s/cs-signal-lecture']
          },
          {
            title: '课程实验报告模板',
            type: 'assignment',
            term: '2024-Fall',
            teacher: '李倩',
            authorEmail: 'alice@example.com',
            summary: '包含封面、数据表与结论模板，适用于所有实验。',
            links: ['https://drive.example.com/file/exp-template']
          },
          {
            title: '思维导图速记版',
            type: 'note',
            term: '2024-Fall',
            teacher: '张晓',
            authorEmail: 'bob@example.com',
            summary: '将信号分类、系统性质整理成一张速记图，考前复习非常方便。',
            links: ['https://mirror.example.com/signal-mindmap']
          }
        ],
        posts: [
          {
            title: '信号与系统作业节奏与评分标准',
            content:
              '## 要点\n- 课堂作业 6 次，最难的是卷积手算\n- 期末老师会给题型边界，注意复习傅里叶性质',
            term: '2024-Fall',
            teacher: '张晓',
            authorEmail: 'carol@example.com'
          },
          {
            title: '复习资料整理思路',
            content:
              '- 先刷学校历年题\n- 再回到 Oppenheim 教材做信号分类\n- Laplace 题建议熟悉常用对偶关系',
            term: '2025-Spring',
            teacher: '李倩',
            authorEmail: 'alice@example.com'
          }
        ],
        feedbacks: [
          {
            userEmail: 'seed@example.com',
            liked: true,
            difficulty: 4,
            comment: '授课节奏紧凑但练习题充足，跟上节奏就很稳。'
          },
          {
            userEmail: 'bob@example.com',
            liked: true,
            difficulty: 3,
            comment: '实验要求较多，硬件基础薄弱的同学要提前准备。'
          }
        ],
        courseComments: [
          {
            userEmail: 'alice@example.com',
            content: '张老师的板书很清晰，推导完整。'
          },
          {
            userEmail: 'carol@example.com',
            content: '建议提前复习复变积分，期末大题会考。'
          }
        ],
        resourceComments: [
          {
            resourceTitle: '2024 秋讲义全套',
            comments: [
              {
                userEmail: 'bob@example.com',
                content: '讲义里有课堂随堂测答案，感谢分享！'
              }
            ]
          }
        ]
      },
      {
        slug: 'data-structures',
        name: '数据结构',
        tags: ['算法', '必修', '编程'],
        teachers: [
          { name: '赵晨', year: '2024-Fall' },
          { name: '李倩', year: '2025-Spring' }
        ],
        resources: [
          {
            title: 'OJ 模板代码合集',
            type: 'solution',
            term: '2024-Fall',
            teacher: '赵晨',
            authorEmail: 'alice@example.com',
            links: ['https://gist.example.com/ds-template']
          },
          {
            title: '期末模拟题（含答案）',
            type: 'exam',
            term: '2024-Fall',
            teacher: '赵晨',
            authorEmail: 'seed@example.com',
            links: ['https://pan.example.com/s/ds-mock']
          }
        ],
        posts: [
          {
            title: '如何准备链表与树结构题目',
            content:
              '链表题建议熟练画指针示意图，树结构可以通过递归 + 栈两种思路互相验证。',
            authorEmail: 'bob@example.com'
          }
        ],
        feedbacks: [
          {
            userEmail: 'alice@example.com',
            liked: true,
            difficulty: 4,
            comment: '项目驱动 + OJ 双轨制，非常锻炼代码能力。'
          }
        ],
        courseComments: [
          {
            userEmail: 'seed@example.com',
            content: '课程需要提前装好 VSCode + clang-format，作业统一检查。'
          }
        ]
      },
      {
        slug: 'operating-systems',
        name: '操作系统',
        tags: ['内核', 'C', 'Lab'],
        teachers: [
          { name: '张晓', year: '2024-Fall' },
          { name: '赵晨', year: '2025-Spring' }
        ],
        resources: [
          {
            title: 'Nachos Lab1-Lab4 指南',
            type: 'note',
            term: '2024-Fall',
            teacher: '张晓',
            authorEmail: 'carol@example.com',
            links: ['https://wiki.example.com/os-lab-guide']
          },
          {
            title: 'OS 期末题型总结',
            type: 'slides',
            term: '2024-Fall',
            teacher: '张晓',
            authorEmail: 'bob@example.com',
            links: ['https://slides.example.com/os-summary']
          }
        ],
        posts: [],
        feedbacks: [
          {
            userEmail: 'carol@example.com',
            liked: true,
            difficulty: 5,
            comment: 'Lab 占比非常大，建议组队完成，助教答疑响应快。'
          }
        ]
      }
    ]
  },
  {
    slug: 'ee',
    name: '电子信息工程学院',
    teachers: [
      { name: '王琪', title: '教授' },
      { name: '周航', title: '副教授' }
    ],
    courses: [
      {
        slug: 'digital-circuits',
        name: '数字电路',
        tags: ['电路', '实验', '硬件'],
        teachers: [
          { name: '王琪', year: '2024-Fall' },
          { name: '周航', year: '2025-Spring' }
        ],
        resources: [
          {
            title: 'Multisim 电路实验包',
            type: 'other',
            term: '2024-Fall',
            teacher: '王琪',
            authorEmail: 'bob@example.com',
            links: ['https://share.example.com/multisim-kit']
          },
          {
            title: '触发器与时序逻辑速查表',
            type: 'link',
            term: '2024-Fall',
            teacher: '王琪',
            authorEmail: 'seed@example.com',
            links: ['https://note.example.com/ff-cheatsheet']
          }
        ],
        posts: [
          {
            title: '实验课常见坑',
            content:
              '注意示波器探头接地、FPGA 下载线要提前自检，很多扣分来自硬件接线不规范。',
            authorEmail: 'alice@example.com'
          }
        ],
        feedbacks: [
          {
            userEmail: 'bob@example.com',
            liked: true,
            difficulty: 3,
            comment: '偏工程实践，报告写作要求细致。'
          }
        ],
        courseComments: [
          {
            userEmail: 'carol@example.com',
            content: '实验预习报告一定要画出完整波形，老师会抽查。'
          }
        ]
      }
    ]
  },
  {
    slug: 'math',
    name: '数学与统计学院',
    teachers: [
      { name: '陈奕', title: '教授' },
      { name: '孙远', title: '副教授' }
    ],
    courses: [
      {
        slug: 'probability-theory',
        name: '概率论与数理统计',
        tags: ['大二', '概率', '数学基础'],
        teachers: [
          { name: '陈奕', year: '2024-Fall' },
          { name: '孙远', year: '2025-Spring' }
        ],
        resources: [
          {
            title: '教材课后题详解',
            type: 'solution',
            term: '2024-Fall',
            teacher: '陈奕',
            authorEmail: 'seed@example.com',
            links: ['https://pan.example.com/s/prob-solution']
          },
          {
            title: '期末冲刺十题',
            type: 'exam',
            term: '2024-Fall',
            authorEmail: 'alice@example.com',
            links: ['https://note.example.com/prob-top10']
          }
        ],
        posts: [],
        feedbacks: [
          {
            userEmail: 'alice@example.com',
            liked: true,
            difficulty: 4,
            comment: '强调证明与推导，打牢数学基础。'
          },
          {
            userEmail: 'carol@example.com',
            liked: true,
            difficulty: 3,
            comment: '大作业需要写 LaTeX，第一次可能略痛苦。'
          }
        ],
        courseComments: [
          {
            userEmail: 'bob@example.com',
            content: '建议结合可视化工具理解极限定理。'
          }
        ]
      },
      {
        slug: 'linear-algebra',
        name: '线性代数',
        tags: ['矩阵', '必修', '数学基础'],
        teachers: [{ name: '孙远', year: '2024-Fall' }],
        resources: [
          {
            title: '线代知识图谱',
            type: 'note',
            authorEmail: 'seed@example.com',
            links: ['https://graph.example.com/la-map']
          }
        ],
        posts: [],
        feedbacks: [
          {
            userEmail: 'seed@example.com',
            liked: true,
            difficulty: 3,
            comment: '课堂例题覆盖考点，期末难度适中。'
          }
        ]
      }
    ]
  }
]

const makeSimpleCourses = (
  deptSlug: string,
  deptName: string,
  teacherNames: string[]
): SeedCourse[] => {
  const courses: SeedCourse[] = []
  const count = 5

  for (let i = 0; i < count; i += 1) {
    const teacherName = teacherNames[i % teacherNames.length]
    const index = i + 1
    courses.push({
      slug: `${deptSlug}-course-${index}`,
      name: `${deptName} 测试课程 ${index}`,
      code: undefined,
      description: `这是 ${deptName} 的第 ${index} 门示例课程，用于填充测试数据，方便在课程列表与详情页观察布局效果。`,
      instructor: teacherName,
      tags: ['测试数据', `${deptSlug}院`],
      teachers: [{ name: teacherName, year: '2024-Fall' }],
      resources: [
        {
          title: `课程 ${index} 讲义`,
          type: 'slides',
          term: '2024-Fall',
          teacher: teacherName,
          authorEmail: 'seed@example.com',
          summary: '自动生成的示例讲义链接，用于测试资源列表与卡片布局。',
          links: [
            `https://example.com/${deptSlug}/course-${index}/slides`,
            `https://backup.example.com/${deptSlug}/course-${index}/slides`
          ]
        },
        {
          title: `课程 ${index} 作业与答案`,
          type: 'assignment',
          term: '2024-Fall',
          teacher: teacherName,
          authorEmail: 'alice@example.com',
          summary: '包含若干自动生成的作业题目与参考答案，用于测试多资源展示。',
          links: [`https://example.com/${deptSlug}/course-${index}/assignment`]
        },
        {
          title: `课程 ${index} 往年试卷汇总`,
          type: 'exam',
          term: '2023-Fall',
          teacher: teacherName,
          authorEmail: 'bob@example.com',
          links: [`https://example.com/${deptSlug}/course-${index}/exam-pack`]
        }
      ],
      posts: [
        {
          title: `如何通过 ${deptName} 测试课程 ${index}`,
          content:
            '这是一条自动生成的课程经验贴：\n\n- 建议提前浏览课程讲义\n- 按章节整理高频题型\n- 期末前一周集中查漏补缺\n\n本内容主要用于测试帖子列表与详情页的排版。',
          term: '2024-Fall',
          teacher: teacherName,
          authorEmail: 'bob@example.com'
        }
      ],
      feedbacks: [
        {
          userEmail: 'seed@example.com',
          liked: true,
          difficulty: 2 + (index % 3),
          comment:
            '自动生成的反馈：整体难度适中，作业量合理，适合作为压力测试课程数据。'
        },
        {
          userEmail: 'carol@example.com',
          liked: index % 2 === 0,
          difficulty: 3,
          comment:
            '这是第二条自动生成的反馈，用于观察课程反馈区域在数据量较大时的表现。'
        }
      ],
      courseComments: [
        {
          userEmail: 'alice@example.com',
          content:
            '自动生成的课程评论：用来测试评论列表在课程详情页的显示效果。'
        }
      ]
    })
  }

  return courses
}

const nwpuDepartments: SeedDepartment[] = [
  {
    slug: '1',
    name: '航空学院',
    teachers: [
      { name: '航空-张老师', title: '教授' },
      { name: '航空-李老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('1', '航空学院', ['航空-张老师', '航空-李老师'])
  },
  {
    slug: '2',
    name: '航天学院',
    teachers: [
      { name: '航天-王老师', title: '教授' },
      { name: '航天-赵老师', title: '讲师' }
    ],
    courses: makeSimpleCourses('2', '航天学院', ['航天-王老师', '航天-赵老师'])
  },
  {
    slug: '3',
    name: '航海学院',
    teachers: [
      { name: '航海-孙老师', title: '教授' },
      { name: '航海-周老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('3', '航海学院', ['航海-孙老师', '航海-周老师'])
  },
  {
    slug: '4',
    name: '材料学院',
    teachers: [
      { name: '材料-陈老师', title: '教授' },
      { name: '材料-刘老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('4', '材料学院', ['材料-陈老师', '材料-刘老师'])
  },
  {
    slug: '5',
    name: '机电学院',
    teachers: [
      { name: '机电-高老师', title: '教授' },
      { name: '机电-黄老师', title: '讲师' }
    ],
    courses: makeSimpleCourses('5', '机电学院', ['机电-高老师', '机电-黄老师'])
  },
  {
    slug: '6',
    name: '力学与土木建筑学院',
    teachers: [
      { name: '土木-朱老师', title: '教授' },
      { name: '土木-吴老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('6', '力学与土木建筑学院', [
      '土木-朱老师',
      '土木-吴老师'
    ])
  },
  {
    slug: '7',
    name: '动力与能源学院',
    teachers: [
      { name: '动力-何老师', title: '教授' },
      { name: '动力-郭老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('7', '动力与能源学院', [
      '动力-何老师',
      '动力-郭老师'
    ])
  },
  {
    slug: '8',
    name: '电子信息学院',
    teachers: [
      { name: '电子-邓老师', title: '教授' },
      { name: '电子-罗老师', title: '讲师' }
    ],
    courses: makeSimpleCourses('8', '电子信息学院', [
      '电子-邓老师',
      '电子-罗老师'
    ])
  },
  {
    slug: '9',
    name: '自动化学院',
    teachers: [
      { name: '自化-冯老师', title: '教授' },
      { name: '自化-潘老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('9', '自动化学院', [
      '自化-冯老师',
      '自化-潘老师'
    ])
  },
  {
    slug: '10',
    name: '计算机学院',
    teachers: [
      { name: '计科-张老师', title: '教授' },
      { name: '计科-李老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('10', '计算机学院', [
      '计科-张老师',
      '计科-李老师'
    ])
  },
  {
    slug: '11',
    name: '理学院',
    teachers: [
      { name: '理学-王老师', title: '教授' },
      { name: '理学-周老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('11', '理学院', ['理学-王老师', '理学-周老师'])
  },
  {
    slug: '12',
    name: '管理学院',
    teachers: [
      { name: '管理-杨老师', title: '教授' },
      { name: '管理-郑老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('12', '管理学院', ['管理-杨老师', '管理-郑老师'])
  },
  {
    slug: '13',
    name: '人文与经法学院',
    teachers: [
      { name: '人文-谢老师', title: '教授' },
      { name: '人文-胡老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('13', '人文与经法学院', [
      '人文-谢老师',
      '人文-胡老师'
    ])
  },
  {
    slug: '14',
    name: '软件与微电子学院',
    teachers: [
      { name: '软件-吕老师', title: '教授' },
      { name: '软件-段老师', title: '讲师' }
    ],
    courses: makeSimpleCourses('14', '软件与微电子学院', [
      '软件-吕老师',
      '软件-段老师'
    ])
  },
  {
    slug: '15',
    name: '生命学院',
    teachers: [
      { name: '生命-曹老师', title: '教授' },
      { name: '生命-蒋老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('15', '生命学院', ['生命-曹老师', '生命-蒋老师'])
  },
  {
    slug: 'wgy',
    name: '外国语学院',
    teachers: [
      { name: '外语-田老师', title: '教授' },
      { name: '外语-龚老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('wgy', '外国语学院', [
      '外语-田老师',
      '外语-龚老师'
    ])
  },
  {
    slug: 'hc',
    name: '教育实验学院',
    teachers: [
      { name: '书院-荣誉导师', title: '教授' },
      { name: '书院-班主任', title: '讲师' }
    ],
    courses: makeSimpleCourses('hc', '教育实验学院', [
      '书院-荣誉导师',
      '书院-班主任'
    ])
  },
  {
    slug: 'intl',
    name: '国际教育学院',
    teachers: [
      { name: '国际-刘老师', title: '教授' },
      { name: '国际-韩老师', title: '副教授' }
    ],
    courses: makeSimpleCourses('intl', '国际教育学院', [
      '国际-刘老师',
      '国际-韩老师'
    ])
  }
]

const departments: SeedDepartment[] = [...baseDepartments, ...nwpuDepartments]

async function ensureUsers() {
  const map = new Map<string, { id: number }>()
  for (const user of users) {
    const hashed = await hashPassword('123')
    const record = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        name: user.name,
        email: user.email,
        password: hashed,
        avatar: '',
        role: user.role
      },
      update: {
        name: user.name,
        role: user.role,
        password: hashed
      }
    })
    map.set(user.email, { id: record.id })
  }
  return map
}

async function main() {
  const userMap = await ensureUsers()

  for (const deptSeed of departments) {
    const department = await prisma.department.upsert({
      where: { slug: deptSeed.slug },
      update: { name: deptSeed.name },
      create: {
        slug: deptSeed.slug,
        name: deptSeed.name
      }
    })

    const teacherMap = new Map<string, { id: number }>()
    for (const teacherSeed of deptSeed.teachers) {
      let teacher = await prisma.teacher.findFirst({
        where: { name: teacherSeed.name, department_id: department.id }
      })
      if (!teacher) {
        teacher = await prisma.teacher.create({
          data: {
            name: teacherSeed.name,
            title: teacherSeed.title ?? null,
            department_id: department.id
          }
        })
      } else if (teacherSeed.title && teacher.title !== teacherSeed.title) {
        teacher = await prisma.teacher.update({
          where: { id: teacher.id },
          data: { title: teacherSeed.title }
        })
      }
      teacherMap.set(teacherSeed.name, { id: teacher.id })
    }

    for (const courseSeed of deptSeed.courses) {
      const course = await prisma.course.upsert({
        where: {
          department_id_slug: {
            department_id: department.id,
            slug: courseSeed.slug
          }
        },
        update: {
          name: courseSeed.name,
          tags: courseSeed.tags ? JSON.stringify(courseSeed.tags) : null
        },
        create: {
          department_id: department.id,
          slug: courseSeed.slug,
          name: courseSeed.name,
          tags: courseSeed.tags ? JSON.stringify(courseSeed.tags) : null
        }
      })

      for (const teacher of courseSeed.teachers) {
        const teacherInfo = teacherMap.get(teacher.name)
        if (!teacherInfo) continue
        await prisma.course_teacher.upsert({
          where: {
            course_id_teacher_id_year: {
              course_id: course.id,
              teacher_id: teacherInfo.id,
              year: teacher.year
            }
          },
          update: {},
          create: {
            course_id: course.id,
            teacher_id: teacherInfo.id,
            year: teacher.year
          }
        })
      }

      const resourceByTitle = new Map<
        string,
        Awaited<ReturnType<typeof prisma.resource.create>>
      >()
      for (const resource of courseSeed.resources) {
        await prisma.resource.deleteMany({
          where: { course_id: course.id, title: resource.title }
        })
        const teacherId = resource.teacher
          ? (teacherMap.get(resource.teacher)?.id ?? null)
          : null
        const authorId = userMap.get(
          resource.authorEmail ?? 'seed@example.com'
        )?.id
        if (!authorId) continue
        const created = await prisma.resource.create({
          data: {
            course_id: course.id,
            title: resource.title,
            type: resource.type,
            term: resource.term ?? null,
            teacher_id: teacherId,
            teacher_name: resource.teacher ?? null,
            summary: resource.summary ?? null,
            author_id: authorId,
            links: JSON.stringify(resource.links),  // 转换为JSON字符串
            status: 'published',
            visibility: 'public'
          }
        })
        resourceByTitle.set(resource.title, created)
      }

      for (const post of courseSeed.posts) {
        await prisma.post.deleteMany({
          where: { course_id: course.id, title: post.title }
        })
        const authorId = userMap.get(post.authorEmail)?.id
        if (!authorId) continue
        await prisma.post.create({
          data: {
            course_id: course.id,
            title: post.title,
            content: post.content,
            term: post.term ?? null,
            teacher_id: post.teacher
              ? (teacherMap.get(post.teacher)?.id ?? null)
              : null,
            author_id: authorId,
            status: 'published',
            visibility: 'public'
          }
        })
      }

      for (const feedback of courseSeed.feedbacks ?? []) {
        const userId = userMap.get(feedback.userEmail)?.id
        if (!userId) continue
        await prisma.course_feedback.upsert({
          where: {
            course_id_user_id: { course_id: course.id, user_id: userId }
          },
          update: {
            liked: feedback.liked,
            difficulty: feedback.difficulty ?? null,
            comment: feedback.comment ?? null
          },
          create: {
            course_id: course.id,
            user_id: userId,
            liked: feedback.liked,
            difficulty: feedback.difficulty ?? null,
            comment: feedback.comment ?? null
          }
        })
      }

      for (const courseComment of courseSeed.courseComments ?? []) {
        const authorId = userMap.get(courseComment.userEmail)?.id
        if (!authorId) continue
        await prisma.comment.create({
          data: {
            course_id: course.id,
            author_id: authorId,
            content: courseComment.content
          }
        })
      }

      for (const group of courseSeed.resourceComments ?? []) {
        const resource = resourceByTitle.get(group.resourceTitle)
        if (!resource) continue
        for (const comment of group.comments) {
          const authorId = userMap.get(comment.userEmail)?.id
          if (!authorId) continue
          await prisma.comment.create({
            data: {
              resource_id: resource.id,
              author_id: authorId,
              content: comment.content
            }
          })
        }
      }

      const [resourceCount, postCount, heartCount, difficultyAgg] =
        await Promise.all([
          prisma.resource.count({
            where: { course_id: course.id, status: 'published' }
          }),
          prisma.post.count({
            where: { course_id: course.id, status: 'published' }
          }),
          prisma.course_feedback.count({
            where: { course_id: course.id, liked: true }
          }),
          prisma.course_feedback.aggregate({
            _avg: { difficulty: true },
            _count: { difficulty: true },
            where: { course_id: course.id, difficulty: { not: null } }
          })
        ])

      await prisma.course.update({
        where: { id: course.id },
        data: {
          resource_count: resourceCount,
          post_count: postCount,
          heart_count: heartCount,
          difficulty_avg: difficultyAgg._avg.difficulty ?? 0,
          difficulty_votes: difficultyAgg._count.difficulty
        }
      })
    }
  }

  console.log(
    'Seed data has been populated for departments, courses, resources、posts、评论与课程反馈。'
  )
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
