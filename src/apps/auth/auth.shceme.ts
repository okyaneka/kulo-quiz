import type { ZodObjectDef, ZodType, ZodTypeDef } from 'zod'
import type {
  ForgotPasswordPayload,
  GuestLoginPayload,
  LoginPayload,
  RegisterPayload,
} from './auth.types'

export const name = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9 ]*$/, 'Alphanumeric only.')
  .min(1, 'Required')
export const email = z.string().email()
export const password = z.string().min(6)

const RegisterScheme = z
  .object({ email, password, password_confirmation: password })
  .refine(
    ({ password, password_confirmation }) => password === password_confirmation,
    { message: 'Password is not match.', path: ['password'] }
  )

const GuestLoginScheme = z.object({ name })

const LoginScheme = z.object({ email, password })

const ForgotPasswordScheme = z.object({ email })

export const useRegisterScheme = (): ZodType<
  RegisterPayload,
  typeof RegisterScheme._def
> => RegisterScheme

export const useGuestLoginScheme = (): ZodType<
  GuestLoginPayload,
  typeof GuestLoginScheme._def
> => GuestLoginScheme

export const useLoginScheme = (): ZodType<
  LoginPayload,
  typeof LoginScheme._def
> => LoginScheme

export const useForgotPasswordScheme = (): ZodType<
  ForgotPasswordPayload,
  typeof ForgotPasswordScheme._def
> => ForgotPasswordScheme
