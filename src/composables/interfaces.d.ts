import type { User } from 'firebase/auth'

export interface ResponseRows<T = unknown> {
  count: number
  rows: T[]
}

export type Author = Pick<User, 'uid' | 'email' | 'displayName'>
