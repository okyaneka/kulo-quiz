import { defineStore } from 'pinia'
import type { ResponseRowsPayload } from '~/composables/types/interfaces'
import { useColRef, useDocRef } from '~/plugins/firebase'
import {
  QuestionMode as ConfigQuestionMode,
  TimerMode,
  type Config,
} from '../config/config.types'
import {
  getQuestionByQuiz,
  setQuestions,
} from '../question/question.repositories'
import {
  QuestionMode,
  type ChoicesQuestion,
  type Questions,
  type UseQuestion,
} from '../question/question.types'
import { QuizWithMetaScheme } from '../quiz-inter/quiz-inter.schemes'
import type { QuizWithMeta } from '../quiz-inter/quiz-inter.types'
import { QuizStatus } from './quiz.types'
import { getQuizMeta } from '../quiz-inter/quiz-inter.repositories'
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

export const QUIZS = 'quizs'

export const useQuizColRef = <T = Quiz>() => {
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
  payload?: ResponseRowsPayload<QuizFilterable, QuizOrderable>,
  idOnly?: boolean
) {
  return await getDocumentList(useQuizColRef(), payload, idOnly)
}

export async function getQuiz(id: string) {
  const quiz = await getDocument(useQuizDocRef(id))
  const quizStore = useQuizStore()
  quizStore.quiz = quiz
  return quiz
}

export async function getQuizData(id: string): Promise<QuizData> {
  const quiz = await getQuiz(id)
  const config = quiz.config as Config
  const questions = await getQuestionByQuiz<Questions>(id)

  const selectedQuestions: Questions[] = []
  if (config.question_mode == ConfigQuestionMode.Random)
    for (let i = 0; i < (config.question_displayed ?? 0); i++) {
      selectedQuestions.push(
        ...questions.splice(Math.floor(Math.random() * questions.length), 1)
      )
    }
  else selectedQuestions.push(...questions.splice(0, config.question_displayed))

  const quizData = { ...quiz, questions: selectedQuestions }
  if (quizData.config?.timer_mode == TimerMode['Question timer'])
    quizData.max_duration = selectedQuestions.reduce(
      (c, v) => c + (v?.timer ?? 0),
      0
    )

  return quizData
}

export async function getQuizWithMeta(id: string): Promise<QuizWithMeta> {
  const quiz = await getQuiz(id)
  const quizMeta = await getQuizMeta(id)
  return QuizWithMetaScheme.parse({
    ...quiz,
    ...quizMeta,
    image_url: quiz.config?.image_url,
  })
}

export async function setQuiz(id: string, payload: Partial<QuizPayload>) {
  return await setDocument<Quiz>(useQuizDocRef(id), payload)
}

export async function setConfig(id: string, payload: Partial<Config>) {
  const data: Partial<Quiz> = { config: payload }

  let quiz_max_duration = 0,
    questions_max_duration = 0
  if ([0, 2].includes(payload.timer_mode as number)) {
    const timers = [1, 6e1, 36e2]
    quiz_max_duration =
      (payload.timer as number) * timers[payload.timer_units as number]
  }

  if ([1, 2].includes(payload.timer_mode as number)) {
    const questions = await getQuestionByQuiz(id)
    questions_max_duration = questions.reduce((c, v) => c + (v?.timer ?? 0), 0)
  }

  data.max_duration =
    quiz_max_duration > questions_max_duration
      ? quiz_max_duration
      : questions_max_duration

  return (await setDocument(useQuizDocRef<Quiz>(id), data)).config
}

export async function setDraft(
  id: string,
  quiz: Partial<Quiz>,
  questions: Partial<Questions>[]
) {
  const q = await getDocument(useQuizDocRef(id))
  if (q.status == QuizStatus.Publish) {
    await getQuiz(id)
    await getQuestionByQuiz(id)
  } else {
    await setQuiz(id, quiz)
    await setQuestions(id, questions)
    if (quiz.config != undefined) await setConfig(id, quiz.config)
  }
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

  function getQuiz(q?: Quiz): useQuiz {
    if (q == undefined) q = quiz.value
    if (q == undefined) throw new Error('quiz_undefined')
    return {
      quiz: {
        id: q.id,
        title: q.title,
      },
    }
  }

  function getQuestion(question: Questions): UseQuestion {
    if (question.mode == QuestionMode.Choices) {
      const q = question as ChoicesQuestion
      return {
        question: {
          id: q.id,
          mode: q.mode,
          question: q.question,
          image_url: q.image_url,
        },
      }
    }
    throw new Error('question_invalid')
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
