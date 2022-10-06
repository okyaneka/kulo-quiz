import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { Choice, UseQuestion } from '../question/question.types'
import type { useQuiz } from '../quiz/quiz.types'

export interface Result extends useId, useTimestamps, useAuthor, useQuiz {
  score: number
  duration: number
}

export interface ResultData extends Result {
  answers: Answer[]
}

export interface useResult {
  result: Pick<Result, 'id' | 'quiz'>
}

interface AnswerCore extends useId, useTimestamps, useAuthor, useResult {
  is_correct: boolean
  correct_answer: Choice[]
  seq: number
  feedback_true?: string
  feedback_false?: string
}

export interface ChoicesAnswerAnswerPayload extends UseQuestion {
  answer: Choice | null
}

export type AnswerPayload = ChoicesAnswerAnswerPayload

export type ChoicesAnswer = AnswerCore & ChoicesAnswerAnswerPayload

export type Answer = ChoicesAnswer
