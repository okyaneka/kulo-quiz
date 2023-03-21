import type { ZodObjectDef, ZodType } from 'zod'
import {
  Gender,
  type EditProfilePayload,
  type ForgotPasswordPayload,
  type GuestLoginPayload,
  type LoginPayload,
  type RegisterPayload,
} from './auth.types'

export const name = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9 ]*$/, 'Alphanumeric only.')
  .min(1, 'Required')
export const email = z.string().email()
export const password = z.string().min(6)

const RegisterScheme = z.object({ email })

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

const EditProfileScheme = {
  displayName: z.string().min(1, 'Display Name cannot be empty'),
  photoURL: z.preprocess((arg) => (arg ? arg : null), z.nullable(z.string())),
  // phoneNumber: z.preprocess(
  //   (arg) => (arg ? arg : null),
  //   z.nullable(z.string().regex(/^\d+$/, 'numeric'))
  // ),
  username: z
    .string()
    .min(1, 'Username cannot be empty.')
    .min(3, 'Username at least has 3 characters.')
    .regex(/^[a-z0-9_]*$/, 'Numeric and lowercase with underscore only.'),
  gender: z.nativeEnum(Gender).optional(),
  bio: z.preprocess(
    (arg) => arg ?? null,
    z
      .string()
      .max(160, 'Bio must less than or equal 160 characters.')
      .nullable()
  ),
}

export const useEditProfileScheme = (): ZodType<
  EditProfilePayload,
  ZodObjectDef<typeof EditProfileScheme>
> => z.object(EditProfileScheme)
