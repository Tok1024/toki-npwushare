export interface CaptchaResponse {
  sessionId: string
  image: string
}

export interface CaptchaVerifyRequest {
  sessionId: string
  captchaCode: string
}

export interface AuthFormData {
  email: string
  password: string
}

export interface CaptchaVerifyResponse {
  success: boolean
  message: string
}
