'use client'

import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react'
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { useRouter } from '@bprogress/next'

interface ErrorComponentProps {
  error: string
  showReset?: boolean
  reset?: () => void
}

export const ErrorComponent = ({
  error,
  showReset = false,
  reset
}: ErrorComponentProps) => {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center p-8 size-full">
      <Card className="w-full max-w-lg border border-default-100 shadow-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="flex gap-4 px-8 pt-8">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-500">
            <AlertTriangle className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">出错了</h1>
            <p className="text-slate-500">发生了一些意外情况</p>
          </div>
        </CardHeader>
        <CardBody className="px-8 py-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
            <p className="font-mono text-sm text-rose-600 break-all">{error}</p>
          </div>
        </CardBody>
        <CardFooter className="flex flex-wrap gap-3 px-8 pb-8 pt-4">
          <Button
            startContent={<ArrowLeft className="size-4" />}
            variant="flat"
            className="bg-slate-100 text-slate-600 hover:bg-slate-200"
            onPress={() => router.back()}
          >
            返回上一页
          </Button>
          {showReset && (
            <Button
              startContent={<RefreshCw className="size-4" />}
              variant="flat"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              onPress={() => reset?.()}
            >
              重试
            </Button>
          )}
          <Button
            startContent={<Home className="size-4" />}
            className="bg-blue-600 text-white shadow-md hover:bg-blue-700"
            onPress={() => router.push('/')}
          >
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
