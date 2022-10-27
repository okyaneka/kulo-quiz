import { useColRef, useDocRef } from '~/plugins/firebase'
import { useAuthStore } from '../auth/auth.repository'
import type { Share, SharePayload } from './share.types'

const SHARES = 'shares'

function useShareColRef() {
  return useColRef<Share>(SHARES)
}

function useShareDocRef(id: string) {
  return useDocRef<Share>(SHARES, id)
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

export async function getShare(id?: string) {
  if (id != undefined) return await getDocument(useShareDocRef(id))
  const base_url = import.meta.env.VITE_APP_BASE_URL ?? location.origin

  const { count, rows } = await getDocumentList(useShareColRef(), {
    filter: { urlout: base_url + location.pathname },
  })

  if (count != 1) {
    const { isNotFound } = storeToRefs(useNotfoundStore())
    isNotFound.value = true
    throw new Error('document_not_found')
  }

  return rows[0]
}

export async function setClickShare(id: string) {
  const share = await getShare(id)
  return setDocument(useShareDocRef(id), { click: share.click + 1 })
}
