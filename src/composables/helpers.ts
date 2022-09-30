import { useAuthUser } from '~/apps/auth/auth.repository'
import type { useAuthor, useTimestamps } from './types/interfaces'

export const getAuthor = (): useAuthor => {
  const user = useAuthUser()
  return {
    author: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
  }
}

export const getTimestamps = (): useTimestamps => {
  return { updated_at: Timestamp.now(), created_at: Timestamp.now() }
}
