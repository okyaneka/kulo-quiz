import type { User } from 'firebase/auth'
import type { useId, useTimestamps } from '~/composables/types/interfaces'

export interface RegisterPayload {
  email: string
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

export enum Gender {
  Male,
  Female,
  Other,
}

export interface UserData extends useId, useTimestamps {
  user_id: string
  username: string
  gender?: Gender
}

export interface UserWithUserData extends User, UserData {}

export type EditProfilePayload = Partial<
  Pick<
    UserWithUserData,
    'displayName' | 'photoURL' | 'phoneNumber' | 'username' | 'gender'
  >
>
