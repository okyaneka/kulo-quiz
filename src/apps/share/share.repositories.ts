import { useColRef, useDocRef } from '~/plugins/firebase'
import { useAuthStore } from '../auth/auth.repository'
import type { Share, SharePayload } from './share.types'

const SHARES = 'shares'
const AlphaNums =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' as const

function useShareColRef() {
  return useColRef<Share>(SHARES)
}

function useShareDocRef(id: string) {
  return useDocRef<Share>(SHARES, id)
}

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

async function getShareIfExist(
  payload: SharePayload
): Promise<Share | undefined> {
  const { user } = useAuthStore()
  if (user != undefined) {
    const { rows } = await getDocumentList(useShareColRef(), {
      filter: { 'author.uid': user.uid, urlin: payload.urlin },
    })
    if (rows.length) return rows[0]
  }
}

export async function setShare(payload: SharePayload) {
  const share = await getShareIfExist(payload)
  if (share != undefined) return share

  const { total } = await getDocumentList(useShareColRef())
  const id = ntan(total + 1).padStart(4, '0')

  const base_url = import.meta.env.VITE_APP_BASE_URL ?? location.origin

  const urlout = new URL(base_url)
  urlout.pathname = `s/${id}`

  const sharePayload = { ...payload, urlout: urlout.href, click: 0 }

  return setDocument(useShareDocRef(id), sharePayload, true)
}

export async function getShare(id: string) {
  return await getDocument(useShareDocRef(id))
}
