import type {
  DocumentReference,
  CollectionReference,
  QueryConstraint,
} from 'firebase/firestore'
import type {
  CustomFilter,
  ResponseRows,
  ResponseRowsPayload,
  useId,
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
        console.log(path, order)
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

export const addDocument = async <T = unknown, P = unknown>(
  ref: CollectionReference<T>,
  payload: P
): Promise<T> => {
  const document = {
    ...getAuthor(),
    ...getTimestamps(),
    ...payload,
  }
  const doc = await addDoc(ref, document as never)
  return { ...document, id: doc.id } as unknown as T
}

export const getDocument = async <T = unknown>(
  ref: DocumentReference<T>
): Promise<T> => {
  const document = await getDoc(ref)
  if (!document.exists()) throw new Error('document_not_found')
  return { ...document.data(), id: document.id } as unknown as T
}

export const setDocument = async <T = unknown>(
  ref: DocumentReference<T>,
  payload: Partial<T>,
  createIfEmpty?: boolean
): Promise<T> => {
  if (createIfEmpty)
    return await addDocument(ref.parent, { ...payload, ...getTimestamps() })

  await getDocument(ref)
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

export const uploadFile = async (file: File) => {
  const storage = useStorage()
  const ref = storageRef(storage, 'test/' + file.name)

  return await uploadBytes(ref, file)
}

export const getFile = async (ref: string) => {
  const storage = useStorage()
  const sRef = storageRef(storage, ref)

  return await getDownloadURL(sRef)
}
