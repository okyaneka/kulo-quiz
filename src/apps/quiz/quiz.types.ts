import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { Config } from '../config/config.types'
import type { Questions } from '../question/question.types'
import type { useTopic } from '../topic/topic.types'
import type { QuizGrade, QuizLevel, QuizStatus } from './quiz.schemes'

type QuizExtends = useId & useAuthor & useTimestamps

export interface QuizPayload extends useTopic {
  title: string
  grade: QuizGrade
  level: QuizLevel
  status: QuizStatus
}

export interface Quiz extends QuizPayload, QuizExtends {
  max_point: number
  max_duration: number
  config: Config | Partial<Config> | null
}

export interface QuizData extends Quiz {
  questions: Questions[]
}

export type QuizFilterable = Pick<Quiz, 'grade' | 'level' | 'status'> & {
  'author.uid': string
}

export type QuizOrderable =
  | keyof Pick<Quiz, 'title' | 'grade' | 'created_at' | 'level' | 'status'>
  | 'topic.title'

export interface useQuiz {
  quiz: Pick<Quiz, 'id' | 'title'>
}
