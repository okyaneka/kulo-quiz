import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { Config } from '../config/config.types'
import type { Questions } from '../question/question.types'
import type { useTopic } from '../topic/topic.types'

export enum QuizGrade {
  'Novice',
  'Elementary',
  'Junior High',
  'Senior High',
  'College',
  'Master',
}

export enum QuizLevel {
  'Very Easy',
  'Easy',
  'Medium',
  'Hard',
  'Very Hard',
}

export enum QuizStatus {
  'Draft',
  'Publish',
}

type QuizExtends = useId & useAuthor & useTimestamps

export interface QuizPayload extends useTopic {
  title: string
  grade: QuizGrade
  level: QuizLevel
  status: QuizStatus
}

export interface QuizItem extends QuizPayload, QuizExtends {}

export interface Quiz extends QuizItem {
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
