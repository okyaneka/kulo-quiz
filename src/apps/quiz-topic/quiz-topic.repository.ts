import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  Timestamp,
  where,
  type OrderByDirection,
} from 'firebase/firestore'
import type { Author, ResponseRows } from '~/composables/types/interfaces'
import { useFirestore } from '~/plugins/firebase'
import { useAuthStore } from '../auth/auth.repository'
import { getLabel } from '../quiz/quiz.helpers'

/**
 * Quiz Topic Status
 *
 * - 0: requesting
 * - 1: rejected
 * - 2: approved
 */
export type QuizTopicStatusCode = 0 | 1 | 2

export function getQuizTopicStatus(code: QuizTopicStatusCode): string {
  switch (code) {
    case 0:
      return 'requesting'
    case 1:
      return 'rejected'
    case 2:
      return 'approved'
  }
}

export interface QuizTopic {
  id: string
  title: string
  parent: Pick<QuizTopic, 'id' | 'title'> | null
  author: Author
  status: QuizTopicStatusCode
  created_at: Timestamp
  updated_at: Timestamp
}

export type CreateQuizTopicPayload = Pick<QuizTopic, 'title' | 'parent'>

export type UpdateQuizTopicPayload = Partial<
  Pick<QuizTopic, 'title' | 'parent' | 'status'>
>

////////////////////////////////////////////////////////////////

const QUIZ_TOPICS = 'quiz_topics'

export function useQuizTopicRef() {
  return collection(useFirestore(), QUIZ_TOPICS)
}

export async function getTopics({
  page,
  per_page,
  orders,
  filter,
}: {
  page?: number
  per_page?: number
  orders?: ['title' | 'status' | 'created_at' | 'parent', OrderByDirection][]
  filter?: Partial<Pick<QuizTopic, 'title' | 'status'>>
}): Promise<ResponseRows<QuizTopic>> {
  page = page ?? 1
  per_page = per_page ?? 10

  let q = query(useQuizTopicRef())

  if (filter) {
    Object.entries(filter).forEach(([path, value]) => {
      q = query(q, where(path, '==', value))
    })
  }

  const { size: count } = await getDocs(q)

  if (orders) {
    orders.forEach((order) => {
      q = query(q, orderBy(order[0], order[1]))
    })
  }
  if (page > 1) {
    const prev = await getDocs(query(q, limit((page - 1) * per_page)))
    q = query(q, startAfter(prev.docs.slice(-1).pop()))
  }

  if (per_page > 0) {
    q = query(q, limit(per_page))
  }

  const rows: QuizTopic[] = []
  const snapshot = await getDocs(q)
  snapshot.forEach((doc) => {
    const data = doc.data() as Omit<QuizTopic, 'id'>
    rows.push({
      id: doc.id,
      ...data,
    })
  })

  return { count, rows }
}

export async function addTopic(
  payload: CreateQuizTopicPayload
): Promise<QuizTopic> {
  const { user } = useAuthStore()

  if (user == null) {
    throw new Error('Unauthorized.')
  }

  const quizTopic: Omit<QuizTopic, 'id'> = {
    author: {
      uid: user.uid,
      displayName: user.displayName as string,
      email: user.email as string,
    },
    status: 0,
    created_at: Timestamp.fromDate(new Date()),
    updated_at: Timestamp.fromDate(new Date()),
    ...payload,
  }
  const doc = await addDoc(useQuizTopicRef(), quizTopic)

  return { id: doc.id, ...quizTopic }
}

async function getTopicDoc(id: string): Promise<{
  docRef: DocumentReference
  snap: DocumentSnapshot
}> {
  const docRef = doc(useQuizTopicRef(), id)
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    throw new Error('topic_not_found')
  }
  return { docRef, snap }
}

export async function getTopic(id: string): Promise<QuizTopic> {
  const { snap } = await getTopicDoc(id)

  return { id: snap.id, ...(snap.data() as Omit<QuizTopic, 'id'>) }
}

export async function setTopic(
  id: string,
  payload: UpdateQuizTopicPayload
): Promise<QuizTopic> {
  const { docRef, snap } = await getTopicDoc(id)

  await setDoc(
    docRef,
    { ...payload, updated_at: Timestamp.fromDate(new Date()) },
    { merge: true }
  )

  return { id, ...(snap.data() as Omit<QuizTopic, 'id'>) }
}
