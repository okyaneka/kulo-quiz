import type { User } from 'firebase/auth'
import type { OrderByDirection, Timestamp } from 'firebase/firestore'

export type Author = Pick<User, 'uid' | 'email' | 'displayName'>

/**
 * Set author to object
 */
export interface useAuthor {
  author: Author
}

/**
 * Set created at and updated at
 */
export interface useTimestamp {
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ResponseRows<T = unknown> {
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
