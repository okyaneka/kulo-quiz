import type { useAuthor, useTimestamp } from '~/composables/types/interfaces'
import type { Quiz } from '../quiz/quiz.types'

/**
 * Question mode config
 *
 * - 0: Random
 * - 1: Custom
 */
export type QuestionModeConfig = 0 | 1

/**
 * Quiz mode config
 *
 * - 0: Classic
 */
export type QuizModeConfig = 0

/**
 * Timer mode config
 *
 * - 0 Quiz timer
 * - 1: Question timer
 * - 2: Combination timer
 */
export type TimerModeConfig = 0 | 1 | 2

/**
 * UnitsConfig
 *
 * - 0: Seconds
 * - 1: Minutes
 * - 2: Hours
 */
export type UnitsConfig = 0 | 1 | 2

export interface QuizConfig extends useAuthor, useTimestamp {
  id: string
  quiz: Pick<Quiz, 'id' | 'title'>
  autosave: boolean
  description: string
  user_guide: string
  question_displayed: number
  question_mode: QuestionModeConfig
  quiz_mode: QuizModeConfig
  timer_mode: TimerModeConfig
  timer: number
  timer_units: UnitsConfig
  break: number
  break_units: UnitConfig
}

export type QuizConfigPayload = Omit<
  QuizConfig,
  'id' | 'quiz' | keyof useAuthor | keyof useTimestamp
>
