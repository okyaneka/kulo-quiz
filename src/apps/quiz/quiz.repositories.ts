import { defineStore } from 'pinia'
import type { ResponseRowsPayload } from '~/composables/types/interfaces'
import { useColRef, useDocRef } from '~/plugins/firebase'
import { TimerMode, type Config } from '../config/config.types'
import { getQuestionByQuiz } from '../question/question.repositories'
import type {
  ChoicesQuestion,
  Questions,
  UseQuestion,
} from '../question/question.types'
import type {
  QuizPayload,
  Quiz,
  QuizFilterable,
  QuizOrderable,
  useQuiz,
  QuizData,
} from './quiz.types'

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

const useQuizColRef = <T = Quiz>() => {
  return useColRef<T>(QUIZS)
}

export const useQuizDocRef = <T = Quiz>(id: string) => {
  return useDocRef<T>(QUIZS, id)
}

export async function addQuiz(payload: QuizPayload) {
  return await addDocument<Quiz, Partial<Quiz>>(useQuizColRef(), {
    ...payload,
    config: null,
  })
}

export async function getQuizList(
  payload?: ResponseRowsPayload<QuizFilterable, QuizOrderable>
) {
  return await getDocumentList(useQuizColRef(), payload)
}

export async function getQuiz(id: string) {
  const quiz = await getDocument(useQuizDocRef(id))
  const quizStore = useQuizStore()
  quizStore.quiz = quiz
  return quiz
}

export async function getQuizData(id: string): Promise<QuizData> {
  const quiz = await getQuiz(id)
  const questions = (await getQuestionByQuiz(id)) as Questions[]
  const quizData = { ...quiz, questions }
  return quizData
}

export async function setQuiz(id: string, payload: Partial<QuizPayload>) {
  return await setDocument(useQuizDocRef(id), payload)
}

export async function setConfig(id: string, payload: Partial<Config>) {
  const data: any = { config: payload }
  if (
    payload.timer_mode != undefined &&
    payload.timer != undefined &&
    payload.timer_units != undefined
  ) {
    if ([0, 2].includes(payload.timer_mode)) {
      const timers = [1, 6e1, 36e2]
      data.max_duration = payload.timer * timers[payload.timer_units]
    } else if (payload.timer_mode == TimerMode['Question timer']) {
      const questions = await getQuestionByQuiz(id)
      data.max_duration = questions.reduce((c, v) => c + (v?.timer ?? 0), 0)
    }
  }

  return await setDocument(useQuizDocRef<Quiz>(id), data)
}

export const useQuizStore = defineStore('quiz', () => {
  const quiz = ref<Quiz>()
  const questions = ref<Partial<Questions>[]>([])

  const config = computed<Partial<Config>>({
    get: () => quiz.value?.config ?? {},
    set: (value) => {
      if (quiz.value != undefined) quiz.value.config = value as Config
    },
  })

  function getQuiz(): useQuiz {
    if (quiz.value == undefined) throw new Error('quiz_undefined')
    return {
      quiz: {
        id: quiz.value.id,
        title: quiz.value.title,
      },
    }
  }

  function getQuestion(question: ChoicesQuestion): UseQuestion {
    return {
      question: {
        id: question.id,
        mode: question.mode,
        question: question.question,
      },
    }
  }

  return { quiz, config, questions, getQuiz, getQuestion }
})

// export function useQuizRef() {
//   return collection(useFirestore(), QUIZS)
// }

// async function useQuizDoc(id: string): Promise<{
//   docRef: DocumentReference
//   snap: DocumentSnapshot
// }> {
//   const docRef = doc(useQuizRef(), id)
//   const snap = await getDoc(docRef)
//   if (!snap.exists()) {
//     throw new Error('topic_not_found')
//   }
//   return { docRef, snap }
// }

// export async function getQuizs(
//   payload: ResponseRowsPayload<
//     Pick<Quiz, 'status' | 'grade' | 'level'>,
//     'title' | 'status' | 'grade' | 'level' | 'topic.title'
//   >
// ): Promise<ResponseRows<Quiz>> {
//   const user = useAuthUser()

//   const page = payload.page ?? 1
//   const per_page = payload.per_page ?? 10

//   let q = query(useQuizRef(), where('author.uid', '==', user.uid))

//   if (payload.filter) {
//     Object.entries(payload.filter).forEach(([path, value]) => {
//       q = query(q, where(path, '==', value))
//     })
//   }

//   if (payload.orders) {
//     payload.orders.forEach(([path, dir]) => {
//       q = query(q, orderBy(path, dir))
//     })
//   }

//   const { size: count } = await getDocs(q)

//   if (page > 1) {
//     const prev = await getDocs(query(q, limit((page - 1) * per_page)))
//     q = query(q, startAfter(prev.docs.slice(-1).pop()))
//   }

//   if (per_page > 0) {
//     q = query(q, limit(per_page))
//   }

//   const rows: Quiz[] = []
//   const snapshot = await getDocs(q)
//   snapshot.forEach((doc) => {
//     const data = doc.data() as Omit<Quiz, 'id'>
//     rows.push({
//       id: doc.id,
//       ...data,
//     })
//   })

//   return { count, rows }
// }

// export async function addQuiz(payload: QuizPayload): Promise<Quiz> {
//   const user = useAuthUser()

//   const quiz: Omit<Quiz, 'id'> = {
//     ...payload,
//     author: {
//       uid: user.uid,
//       displayName: user.displayName as string,
//       email: user.email as string,
//     },
//     status: 0,
//     created_at: Timestamp.fromDate(new Date()),
//     updated_at: Timestamp.fromDate(new Date()),
//   }
//   const doc = await addDoc(useQuizRef(), quiz)

//   return { id: doc.id, ...quiz }
// }

// export async function getQuiz(id: string): Promise<Quiz> {
//   useAuthUser()

//   const { snap } = await useQuizDoc(id)
//   const quizStore = useQuizStore()

//   const quiz = { id: snap.id, ...(snap.data() as Omit<Quiz, 'id'>) }

//   quizStore.quiz = quiz

//   return quiz
// }

// export async function setQuiz(id: string, payload: QuizPayload): Promise<Quiz> {
//   useAuthUser()

//   const { snap, docRef } = await useQuizDoc(id)

//   await setDoc(
//     docRef,
//     { ...payload, updated_at: Timestamp.fromDate(new Date()) },
//     { merge: true }
//   )

//   return { id: snap.id, ...(snap.data() as Omit<Quiz, 'id'>) }
// }
