import * as zod from 'zod'
import { toFormValidator } from '@vee-validate/zod'

export const name = zod
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9 ]*$/, 'Alphanumeric only.')
  .min(1, 'Required')

export const email = zod.string().email()

export const password = zod.string().min(6)

export const RegisterScheme = toFormValidator(
  zod
    .object({ email, password, password_confirmation: password })
    .refine(
      ({ password, password_confirmation }) =>
        password === password_confirmation,
      { message: 'Password is not match.', path: ['password'] }
    )
)

export const GuestLoginScheme = toFormValidator(zod.object({ name }))

export const LoginScheme = toFormValidator(zod.object({ email, password }))

export const ForgotPasswordScheme = toFormValidator(zod.object({ email }))
