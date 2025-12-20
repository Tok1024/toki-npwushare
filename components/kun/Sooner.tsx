'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@heroui/button'
import { textVariants, toastVariants } from '~/motion/sooner'
import type { Toast } from 'react-hot-toast'

interface ToastProps {
  message: string
  t: Toast
}

const KunSooner = ({ message, t }: ToastProps) => {
  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex justify-center w-full"
    >
      <div className="flex w-full max-w-md p-2 shadow-lg pointer-events-auto rounded-2xl bg-background ring-1 ring-foreground/5">
        <motion.div
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="flex-1 h-full p-4"
        >
          <p className="flex items-center font-medium">{message}</p>
        </motion.div>
        <div className="flex">
          <Button
            isIconOnly
            variant="light"
            className="flex items-center justify-center"
            onPress={() => toast.remove(t.id)}
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="size-5" />
            </motion.div>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export const showKunSooner = (message: string) => {
  toast.custom((t: Toast) => <KunSooner message={message} t={t} />, {
    position: 'bottom-center',
    duration: 5000
  })
}
