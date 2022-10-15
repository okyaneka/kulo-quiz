export interface RegisterPayload {
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface GuestLoginPayload {
  name: string
}

export interface ForgotPasswordPayload {
  email: string
}
