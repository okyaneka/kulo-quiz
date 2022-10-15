import type {
  DocumentReference,
  CollectionReference,
  QueryConstraint,
} from 'firebase/firestore'
import type {
  CustomFilter,
  ResponseRows,
  ResponseRowsPayload,
} from './types/interfaces'
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import { getAuthor, getTimestamps } from './helpers'
import { useStorage } from '~/plugins/firebase'

export const getDocumentList = async <T = unknown, F = unknown, O = string>(
  ref: CollectionReference<T>,
  payload?: ResponseRowsPayload<F, O>
): Promise<ResponseRows<T>> => {
  const page = payload?.page ?? 1
  const per_page = payload?.per_page ?? 10
  const filter = payload?.filter
  const orders = payload?.orders ?? []

  const q: QueryConstraint[] = []
  // query(ref)
  const { size: total } = await getDocs(query(ref))

  if (filter)
    Object.entries(filter).forEach(([path, value]: [string, unknown]) => {
      if (['number', 'string'].includes(typeof value))
        q.push(where(path, '==', value))
      else {
        const v = value as CustomFilter
        q.push(orderBy(path))
        q.push(where(path, v.operator, v.value))
      }
      const index = orders.findIndex(([p]) => path == (p as unknown as string))
      if (index != -1) {
        const order = orders.splice(index, 1)[0]
        q.push(orderBy(order[0] as unknown as string, order[1]))
      }
    })

  if (orders)
    orders.forEach((order) =>
      q.push(orderBy(order[0] as unknown as string, order[1]))
    )

  const { size: count } = await getDocs(query(ref, ...q))

  if (page > 1) {
    const prev = await getDocs(query(ref, ...q, limit((page - 1) * per_page)))
    q.push(startAfter(prev.docs.slice(-1).pop()))
  }

  if (per_page > 0) {
    q.push(limit(per_page))
  }

  const rows: T[] = []
  const snapshot = await getDocs(query(ref, ...q))
  snapshot.forEach((doc) => {
    rows.push({ ...doc.data(), id: doc.id })
  })

  return { total, count, rows }
}

export const addDocument = async <T = unknown, P = Partial<T>>(
  ref: CollectionReference<T>,
  payload: P,
  options?: {
    withSubject?: boolean
    withoutAuthor?: boolean
    withoutTimestamps?: boolean
  }
): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const document: any = payload

  if (!options?.withoutAuthor) Object.assign(document, getAuthor())
  if (options?.withSubject)
    Object.assign(document, { subject: getAuthor().author })
  if (!options?.withoutTimestamps) Object.assign(document, getTimestamps())

  const doc = await addDoc(ref, document)
  return { ...document, id: doc.id } as T
}

export const getDocument = async <T = unknown>(
  ref: DocumentReference<T>,
  throwNotFound?: boolean
): Promise<T> => {
  const document = await getDoc(ref)
  if (!document.exists()) {
    const { isNotFound } = storeToRefs(useNotfoundStore())
    if (throwNotFound == undefined || throwNotFound) isNotFound.value = true
    throw new Error('document_not_found')
  }
  return { ...document.data(), id: document.id } as unknown as T
}

export const setDocument = async <T = unknown>(
  ref: DocumentReference<T>,
  payload: Partial<T>,
  createIfEmpty?: boolean
): Promise<T> => {
  let is_empty = false

  try {
    await getDocument(ref, false)
  } catch (error) {
    is_empty = true
  }

  if (is_empty && createIfEmpty)
    return await addDocument(ref.parent, { ...payload, ...getTimestamps() })

  await setDoc(
    ref,
    { ...payload, updated_at: Timestamp.now() },
    { merge: true }
  )
  return await getDocument(ref)
}

export const deleteDocument = async (ref: DocumentReference) => {
  return await deleteDoc(ref)
}

export const uploadFile = async (file: File, _collection?: string) => {
  const storage = useStorage()
  const time = new Date().toISOString()
  const fullpath = `${_collection ?? ''}/${time
    .slice(0, 10)
    .replaceAll('-', '')}/${time.slice(11, 19).replaceAll(':', '')}-${
    file.name
  }`
  const ref = storageRef(storage, fullpath)

  return await uploadBytes(ref, file)
}

export const getFile = async (fullpath: string) => {
  const storage = useStorage()
  const ref = storageRef(
    storage,
    // import.meta.env.VITE_STORAGE_BUCKET + '/' +
    fullpath
  )

  return await getDownloadURL(ref)
}
