import { nwpushare } from '~/config/nwpushare'

interface IndexNow {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

export const postToIndexNow = async (url: string) => {
  const requestData: IndexNow = {
    host: nwpushare.domain.main,
    key: process.env.TOKI_NWPUSHARE_INDEX_NOW_KEY || '',
    keyLocation: `${nwpushare.domain.main}/${process.env.TOKI_NWPUSHARE_INDEX_NOW_KEY}.txt`,
    urlList: [url]
  }

  await fetch('https://www.bing.com/indexnow', {
    method: 'POST',
    headers: { 'User-Agent': nwpushare.titleShort },
    body: JSON.stringify(requestData)
  })
}
