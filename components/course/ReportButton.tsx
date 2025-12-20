'use client'

import { useState } from 'react'
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure
} from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPost } from '~/utils/kunFetch'

interface ReportButtonProps {
  resourceId: number
  resourceTitle: string
}

export const ReportButton = ({ resourceId, resourceTitle }: ReportButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('请填写举报理由')
      return
    }

    setSubmitting(true)
    try {
      const response = await kunFetchPost('/resource/report', {
        resourceId,
        reason: reason.trim()
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('举报已提交，我们会尽快处理')
      setReason('')
      onClose()
    } catch (error) {
      toast.error('提交失败，请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="light"
        color="danger"
        onPress={onOpen}
      >
        举报
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                举报资源
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3">
                  <div className="text-sm text-default-600">
                    资源：<span className="font-medium">{resourceTitle}</span>
                  </div>
                  <Textarea
                    label="举报理由"
                    placeholder="请详细描述该资源存在的问题，如：内容违规、虚假信息、侵权等"
                    value={reason}
                    onValueChange={setReason}
                    maxLength={500}
                    minRows={4}
                  />
                  <div className="text-tiny text-default-400">
                    我们会认真审核每一条举报，并采取相应措施
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="danger"
                  onPress={handleSubmit}
                  isLoading={submitting}
                  disabled={submitting || !reason.trim()}
                >
                  提交举报
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
