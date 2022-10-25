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
      photoURL: user.photoURL,
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
  return text.trim()
}

export const randomBackground = (): string => {
  function randomHex(): string {
    return Math.round(Math.random() * 256).toString(16)
  }
  const r = randomHex()
  const g = randomHex()
  const b = randomHex()
  return `#${r}${g}${b}`
}

export const XOR = (a: boolean, b: boolean) => {
  return (a || b) && !(a && b)
}
const AlphaNums =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' as const

export function ntan(number: number): string {
  const res = Math.floor(number / AlphaNums.length)
  const dig = AlphaNums[number % AlphaNums.length]
  if (res > 1) return dig + ntan(res)
  return dig
}

export function antn(text: string): number {
  if (!text.match(/^(?=.*^[0-9a-zA-Z]+$)/))
    throw new Error('unsupported_character')
  return text
    .split('')
    .reduce(
      (car, cur, i) =>
        car + Math.pow(AlphaNums.length, i) * AlphaNums.indexOf(cur),
      0
    )
}

export function setDocTitle(title?: string) {
  document.title = title
    ? title + ' - ' + import.meta.env.VITE_APP_NAME
    : import.meta.env.VITE_APP_NAME
}
