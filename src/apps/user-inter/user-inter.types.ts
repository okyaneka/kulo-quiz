import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { useQuiz } from '../quiz/quiz.types'

export interface UserInteraction extends useId, useAuthor, useQuiz {}

export interface QuizLiked extends useId, useTimestamps, useQuiz {}
