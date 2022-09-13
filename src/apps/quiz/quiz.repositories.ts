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
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import type {
  ResponseRows,
  ResponseRowsPayload,
} from '~/composables/types/interfaces'
import { useFirestore } from '~/plugins/firebase'
import { useAuthStore, useAuthUser } from '../auth/auth.repository'
import type { CreateQuizPayload, Quiz, UpdateQuizPayload } from './quiz.types'

export interface SearchPayload {
  query?: string
}

export interface QuizThumbnail {
  id: string
  thumbnail_url: string
  title: string
  author: string
  rate: number
  player: number
}

interface QuizSpesification {
  question_total: number
  max_score: number
  question_modes: ('a' | 'b')[]
  dificulty_level: number
  working_duration: number
  security_level: number
  time_limit_to_repeat: number
}

export interface QuizDetail extends QuizThumbnail {
  description: string
  guide: string
  spesification: QuizSpesification
  images_url: string[]
}

export interface QuizRateValue {
  star: 1 | 2 | 3 | 4 | 5
  users: number
  percentage: number
}

interface User {
  uid: string
  name: string
  email: string
}

export interface QuizStandingData {
  rank: number
  user: User
  score: number
}

////////////////////////////////////////////////////////////////

const QUIZS = 'quizs'

export const useQuizStore = defineStore('quiz', () => {
  const quiz = ref<Quiz>()

  return { quiz }
})

export function useQuizRef() {
  return collection(useFirestore(), QUIZS)
}

async function useQuizDoc(id: string): Promise<{
  docRef: DocumentReference
  snap: DocumentSnapshot
}> {
  const docRef = doc(useQuizRef(), id)
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    throw new Error('topic_not_found')
  }
  return { docRef, snap }
}

export async function getQuizs(
  payload: ResponseRowsPayload<
    Pick<Quiz, 'status' | 'grade' | 'level'>,
    'title' | 'status' | 'grade' | 'level' | 'topic.title'
  >
): Promise<ResponseRows<Quiz>> {
  const user = useAuthUser()

  const page = payload.page ?? 1
  const per_page = payload.per_page ?? 10

  let q = query(useQuizRef(), where('author.uid', '==', user.uid))

  if (payload.filter) {
    Object.entries(payload.filter).forEach(([path, value]) => {
      q = query(q, where(path, '==', value))
    })
  }

  if (payload.orders) {
    payload.orders.forEach(([path, dir]) => {
      q = query(q, orderBy(path, dir))
    })
  }

  const { size: count } = await getDocs(q)

  if (page > 1) {
    const prev = await getDocs(query(q, limit((page - 1) * per_page)))
    q = query(q, startAfter(prev.docs.slice(-1).pop()))
  }

  if (per_page > 0) {
    q = query(q, limit(per_page))
  }

  const rows: Quiz[] = []
  const snapshot = await getDocs(q)
  snapshot.forEach((doc) => {
    const data = doc.data() as Omit<Quiz, 'id'>
    rows.push({
      id: doc.id,
      ...data,
    })
  })

  return { count, rows }
}

export async function addQuiz(payload: CreateQuizPayload): Promise<Quiz> {
  const user = useAuthUser()

  const quiz: Omit<Quiz, 'id'> = {
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
  const doc = await addDoc(useQuizRef(), quiz)

  return { id: doc.id, ...quiz }
}

export async function getQuiz(id: string): Promise<Quiz> {
  useAuthUser()

  const { snap } = await useQuizDoc(id)
  const quizStore = useQuizStore()

  const quiz = { id: snap.id, ...(snap.data() as Omit<Quiz, 'id'>) }

  quizStore.quiz = quiz

  return quiz
}

export async function setQuiz(
  id: string,
  payload: UpdateQuizPayload
): Promise<Quiz> {
  useAuthUser()

  const { snap, docRef } = await useQuizDoc(id)

  await setDoc(
    docRef,
    { ...payload, updated_at: Timestamp.fromDate(new Date()) },
    { merge: true }
  )

  return { id: snap.id, ...(snap.data() as Omit<Quiz, 'id'>) }
}
