import type { DocumentReference, CollectionReference } from 'firebase/firestore'
import type {
  ResponseRows,
  ResponseRowsPayload,
  useId,
} from './types/interfaces'
import { getAuthor, getTimestamps } from './helpers'

export const getDocumentList = async <T = unknown, F = unknown, O = unknown>(
  ref: CollectionReference<T>,
  payload: ResponseRowsPayload<F, O>
): Promise<ResponseRows<T>> => {
  const page = payload.page ?? 1
  const per_page = payload.per_page ?? 10
  const filter = payload.filter
  const orders = payload.orders

  let q = query(ref)

  if (filter)
    Object.entries(filter).forEach(([path, value]) => {
      q = query(q, where(path, '==', value))
    })

  const { size: count } = await getDocs(q)

  if (orders)
    orders.forEach(
      (order) => (q = query(q, orderBy(order[0] as string, order[1])))
    )

  if (page > 1) {
    const prev = await getDocs(query(q, limit((page - 1) * per_page)))
    q = query(q, startAfter(prev.docs.slice(-1).pop()))
  }

  if (per_page > 0) {
    q = query(q, limit(per_page))
  }

  const rows: T[] = []
  const snapshot = await getDocs(q)
  snapshot.forEach((doc) => {
    rows.push({ ...doc.data(), id: doc.id })
  })

  return { count, rows }
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
  return { ...document, id: doc.id } as T
}

export const getDocument = async <T = unknown>(
  ref: DocumentReference<T>
): Promise<T> => {
  const document = await getDoc(ref)
  if (!document.exists()) throw new Error('document_not_found')
  return { ...document.data(), id: document.id } as T
}

export const setDocument = async <T = unknown>(
  ref: DocumentReference<T>,
  payload: Partial<T>
): Promise<T> => {
  const doc = (await getDocument(ref)) as T & useId
  const document = { ...payload, updated_at: Timestamp.now() }
  await setDoc(ref, document, { merge: true })
  return { id: doc.id, ...document } as T
}

export const deleteDocument = async (ref: DocumentReference) => {
  return await deleteDoc(ref)
}
