import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { QuestionMode, UseQuestion } from '../question/question.types'
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

export interface AnswerPayload extends UseQuestion {
  answer: string | string[]
}

export interface Answer extends AnswerPayload, useId, useTimestamps, useResult {
  is_correct: boolean
  correct_answer: string | string[]
  seq: number
  feedback_true?: string
  feedback_false?: string
}
