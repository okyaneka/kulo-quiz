import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { useQuiz } from '../quiz/quiz.types'

export enum QuestionMode {
  Choices,
}

type Core = useId & useQuiz & useAuthor & useTimestamps

export interface QuestionPayload {
  point: number
  mode: QuestionMode
  seq: number
  guide: string | null
  image_url: string | null
  timer: number | null
}

export interface Question extends Core, QuestionPayload {}

export interface Choice {
  text: string
  key: number
  image_url: string | null
}

export interface ChoicesQuestionPayload extends QuestionPayload {
  question: string
  choices: Choice[]
  correct_answer: number[]
}

export interface ChoicesQuestion extends Core, ChoicesQuestionPayload {}

export type QuestionPayloads = QuestionPayload | ChoicesQuestionPayload

export type Questions = Question | ChoicesQuestion

export type QuestionOrderable = 'seq' | keyof useTimestamps

export type QuestionFilterable = Pick<
  Question,
  'mode' | 'timer' | 'point' | 'guide'
> & {
  'author.id': string
  'quiz.id': string
}

export type useChoicesQuestion = {
  question: Pick<ChoicesQuestion, 'id' | 'mode' | 'image_url' | 'question'>
}

export type UseQuestion = useChoicesQuestion
