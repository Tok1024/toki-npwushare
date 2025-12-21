'use client'

import toast from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import { KunLoading } from '../Loading'

interface CaptchaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (code: string) => void
}

export const KunCaptchaModal = ({
  isOpen,
  onClose,
  onSuccess
}: CaptchaModalProps) => {
  const [sessionId, setSessionId] = useState<string>('')
  const [captchaImage, setCaptchaImage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const resetInput = () => setInputValue('')

  useEffect(() => {
    if (isOpen) {
      resetInput()
      loadCaptcha()
    }
  }, [isOpen])

  useEffect(() => {
    if (!loading && isOpen) {
      inputRef.current?.focus()
    }
  }, [loading, isOpen])

  const loadCaptcha = async () => {
    setLoading(true)
    try {
      const result = await kunFetchGet<{ sessionId: string; image: string }>('/auth/captcha')
      setSessionId(result.sessionId)
      setCaptchaImage(result.image)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (close?: () => void) => {
    const filtered = inputValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)

    if (!filtered) {
      toast.error('请输入验证码')
      return
    }

    const response = await kunFetchPost<KunResponse<{ code: string }>>(
      '/auth/captcha',
      { sessionId, captchaCode: filtered }
    )
    if (typeof response === 'string') {
      toast.error(response)
      resetInput()
      loadCaptcha()
    } else {
      onSuccess(response.code)
      close?.()
      onClose()
    }
  }

  const handleRefresh = () => {
    resetInput()
    loadCaptcha()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex-col gap-1">
              <h3 className="text-lg">人机验证</h3>
              <p className="text-sm text-gray-500">请输入下方验证码（不区分大小写）</p>
            </ModalHeader>
            <ModalBody className="gap-4">
              {loading && <KunLoading hint="正在加载验证码..." />}
              <div className="flex justify-center">
                <img
                  src={captchaImage}
                  alt="验证码"
                  className="rounded border border-gray-300"
                />
              </div>
              <Button
                size="sm"
                variant="light"
                onPress={handleRefresh}
                className="self-center"
                isDisabled={loading}
              >
                看不清？换一张
              </Button>
              <div className="space-y-2 w-full">
                <label className="text-small text-default-500">验证码</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleVerify(close)
                    }
                  }}
                  autoFocus
                  maxLength={4}
                  autoComplete="off"
                  className="w-full rounded-md border-2 border-default-300 bg-white px-3 py-2 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="请输入验证码"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={close}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={() => handleVerify(close)}
                isDisabled={loading}
              >
                确认
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
