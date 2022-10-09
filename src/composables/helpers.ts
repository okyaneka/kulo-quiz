import { useAuthUser } from '~/apps/auth/auth.repository'
import { Units } from '~/apps/config/config.types'
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

export const durationHumanized = (maxDuration?: number) => {
  let text = ''
  maxDuration = maxDuration ?? 0
  if (maxDuration / 60 > 60) {
    const hours = Math.floor(maxDuration / 36e2)
    text += hours + ' ' + Units[2] + ' '
  }

  if (maxDuration % 36e2 >= 60) {
    const minutes = Math.floor((maxDuration % 36e2) / 60)
    text += minutes + ' ' + Units[1] + ' '
  } else if (maxDuration % 36e2 == 0) text += 60 + ' ' + Units[1] + ' '

  if (maxDuration % 60 != 0) {
    const seconds = maxDuration % 60
    text += seconds + ' ' + Units[0] + ' '
  }
  console.log(text)

  return text.trim()
}
