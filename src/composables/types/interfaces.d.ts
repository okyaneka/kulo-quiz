import type { User } from 'firebase/auth'
import type {
  OrderByDirection,
  Timestamp,
  WhereFilterOp,
} from 'firebase/firestore'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export type Middleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => Promise<(() => void) | void | undefined>

export type Subject = Pick<User, 'uid' | 'email' | 'displayName' | 'photoURL'>

/**
 * Set id to object
 */
export interface useId {
  id: string
}

/**
 * Set author to object
 */
export interface useAuthor {
  author: Subject
}

/**
 * Set subject/user
 */
export interface useSubject {
  subject: Subject
}

/**
 * Set created at and updated at
 */
export interface useTimestamps {
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ResponseRows<T = unknown> {
  total: number
  total_filtered: number
  count: number
  rows: T[]
}

export interface ResponseRowsPayload<
  Filterable = unknown,
  Orderable = unknown
> {
  page?: number
  per_page?: number
  orders?: [Orderable, OrderByDirection][]
  filter?: Partial<Filterable>
}

export interface CustomFilter<T = string> {
  value: T
  operator: WhereFilterOp
}
