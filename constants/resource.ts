export const resourceTypes = [
  {
    value: 'pc',
    label: '电子课件',
    description: '课堂使用的 PPT、PDF 或其他电子讲义'
  },
  {
    value: 'row',
    label: '原始资料',
    description: '教师原版资料、同学整理的扫描件或外文材料'
  },
  {
    value: 'chinese',
    label: '翻译/本地化',
    description: '自主翻译的课堂资料或补充讲义'
  },
  {
    value: 'tool',
    label: '学习工具',
    description: '学习辅助工具、脚本、软件配置等'
  },
  {
    value: 'mobile',
    label: '移动端资源',
    description: '可在移动设备使用的学习资料或应用'
  },
  {
    value: 'emulator',
    label: '实验环境',
    description: '虚拟机镜像、实验软件、模拟器配置'
  },
  {
    value: 'app',
    label: '独立应用',
    description: '可直接安装使用的学习类应用或便捷工具'
  },
  {
    value: 'exam',
    label: '备考资料',
    description: '往年试卷、复习资料、题库等'
  },
  {
    value: 'notice',
    label: '课程通知',
    description: '课程公告、注意事项、日程变动'
  },
  {
    value: 'other',
    label: '其它',
    description: '不便归类的学习资料'
  }
]

export const SUPPORTED_TYPE = [
  'pc',
  'chinese',
  'mobile',
  'emulator',
  'row',
  'app',
  'tool',
  'exam',
  'notice',
  'other'
]
export const SUPPORTED_TYPE_MAP: Record<string, string> = {
  all: '全部类型',
  pc: '电子课件',
  chinese: '翻译资料',
  mobile: '移动端资源',
  emulator: '实验环境',
  row: '原始资料',
  app: '独立应用',
  tool: '学习工具',
  exam: '备考资料',
  notice: '课程通知',
  other: '其它'
}
export const ALL_SUPPORTED_TYPE = ['all', ...SUPPORTED_TYPE]

export const SUPPORTED_LANGUAGE = ['zh-Hans', 'zh-Hant', 'ja', 'en', 'other']
export const ALL_SUPPORTED_LANGUAGE = ['all', ...SUPPORTED_LANGUAGE]
export const SUPPORTED_LANGUAGE_MAP: Record<string, string> = {
  all: '全部语言',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  ja: '日本語',
  en: 'English',
  other: '其它'
}

export const SUPPORTED_PLATFORM = [
  'windows',
  'android',
  'macos',
  'ios',
  'linux',
  'other'
]
export const ALL_SUPPORTED_PLATFORM = ['all', ...SUPPORTED_PLATFORM]
export const SUPPORTED_PLATFORM_MAP: Record<string, string> = {
  all: '全部平台',
  windows: 'Windows',
  android: 'Android',
  macos: 'MacOS',
  ios: 'iOS',
  linux: 'Linux',
  other: '其它'
}

export const SUPPORTED_RESOURCE_LINK = ['nwpushare', 's3', 'user']

export const storageTypes = [
  {
    value: 'nwpushare',
    label: '站内托管 (仅管理员)',
    description: '由管理员上传到受控空间的小型资料'
  },
  {
    value: 's3',
    label: '对象存储 (<100MB, 创作者可用)',
    description: '适合 <100MB 的文档/工具, 稳定且可长期访问'
  },
  {
    value: 'user',
    label: '自定义链接 (>100MB)',
    description: '常规方案, 作者可填写任意网盘 / GitHub / 私有地址'
  }
]

export const SUPPORTED_RESOURCE_LINK_MAP: Record<string, string> = {
  nwpushare: '站内托管',
  s3: '对象存储下载',
  user: '自定义链接下载'
}

export const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-lz4',
  'application/x-rar-compressed'
]

export const ALLOWED_EXTENSIONS = ['.zip', '.rar', '.7z']

export const SUPPORTED_RESOURCE_SECTION = ['course', 'supplement']

export const RESOURCE_SECTION_MAP: Record<string, string> = {
  course: '课程资料',
  supplement: '补充资料'
}
