import type { ZodObjectDef, ZodType } from 'zod'
import type { UserMeta } from './user-inter.types'

const preprocessNumber = () =>
  z.preprocess((arg) => (typeof arg == 'number' ? arg : 0), z.number())
const preprocessBoolean = () =>
  z.preprocess((arg) => (arg ? true : false), z.boolean())

const UserMetaShape = {
  quiz_count: preprocessNumber(),
  follower_count: preprocessNumber(),
  following_count: preprocessNumber(),
  has_follow: preprocessBoolean(),
  has_following: preprocessBoolean(),
  has_notif: preprocessBoolean(),
}

export const UserMetaScheme: ZodType<
  UserMeta,
  ZodObjectDef<typeof UserMetaShape>
> = z.object(UserMetaShape)
