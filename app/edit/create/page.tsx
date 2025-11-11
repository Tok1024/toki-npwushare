import { KunHeader } from '~/components/kun/Header'
import { UploadResourceForm } from '~/components/course/upload/UploadResourceForm'

export default function UploadResourcePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-10">
      <KunHeader
        name="上传课程资源"
        description="填写课程信息与链接，我们只保存外部地址，方便同学们集中浏览。若课程或学院尚未建档，系统会自动创建。"
      />
      <UploadResourceForm />
    </div>
  )
}
