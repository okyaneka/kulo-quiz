import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import type { useAuthor, useTimestamp } from '~/composables/types/interfaces'
import { useFirestore } from '~/plugins/firebase'
import { useAuthUser } from '../auth/auth.repository'
import { getQuiz } from '../quiz/quiz.repositories'
import type { Quiz } from '../quiz/quiz.types'
import type { QuizConfig, QuizConfigPayload } from './quiz-config.types'

const QUIZ_CONFIGS = 'quiz_configs'

export function useQuizConfigRef() {
  return collection(useFirestore(), QUIZ_CONFIGS)
}

async function createEmptyQuizConfig(id: string) {
  const user = useAuthUser()
  const quiz = await getQuiz(id)
  const payload: Pick<QuizConfig, 'quiz'> & useAuthor & useTimestamp = {
    author: {
      uid: user.uid,
      displayName: user.displayName as string,
      email: user.email as string,
    },
    quiz: {
      id: quiz.id,
      title: quiz.title,
    },
    created_at: Timestamp.fromDate(new Date()),
    updated_at: Timestamp.fromDate(new Date()),
  }

  await addDoc(useQuizConfigRef(), payload)
}

async function useQuizConfigDoc(id: string): Promise<{
  docRef: DocumentReference
  snap: DocumentSnapshot
}> {
  useAuthUser()

  const { empty, docs } = await getDocs(
    query(useQuizConfigRef(), where('quiz.id', '==', id))
  )

  if (empty) {
    await createEmptyQuizConfig(id)
    return await useQuizConfigDoc(id)
  } else {
    const snap = docs[0]
    const docRef = doc(useQuizConfigRef(), snap.id)

    return { docRef, snap }
  }
}

export async function getQuizConfig(id: string): Promise<QuizConfig> {
  const { snap } = await useQuizConfigDoc(id)

  return { id: snap.id, ...(snap.data() as Omit<QuizConfig, 'id'>) }
}

export async function setQuizConfig(
  id: string,
  payload: QuizConfigPayload
): Promise<QuizConfig> {
  const { snap, docRef } = await useQuizConfigDoc(id)

  await setDoc(
    docRef,
    { ...payload, updated_at: Timestamp.fromDate(new Date()) },
    { merge: true }
  )

  return { id: snap.id, ...(snap.data() as Omit<QuizConfig, 'id'>) }
}
