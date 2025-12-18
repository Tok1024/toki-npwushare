import { nwpushare } from '~/config/nwpushare'
import { touchgalTemplate } from './templates/touchgal'
import { announcementTemplate } from './templates/announcement'

export interface EmailTemplate {
  id: string
  name: string
  template: string
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'touchgal',
    name: `${nwpushare.titleShort} 全体消息`,
    template: touchgalTemplate(
      '{{title}}',
      '{{content}}',
      '{{email}}',
      '{{validateEmailCode}}'
    )
  },
  {
    id: 'announcement',
    name: `${nwpushare.titleShort} 重要公告`,
    template: announcementTemplate(
      '{{title}}',
      '{{content}}',
      '{{email}}',
      '{{validateEmailCode}}'
    )
  }
]
