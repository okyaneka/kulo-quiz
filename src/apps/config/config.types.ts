import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { useQuiz } from '../quiz/quiz.types'

/**
 * Question mode config
 *
 * - 0: Random
 * - 1: Custom
 */
export enum QuestionMode {
  Random,
  Custom,
}

/**
 * Quiz mode config
 *
 * - 0: Classic
 */
export enum QuizMode {
  Classic,
}

/**
 * Timer mode config
 *
 * - 0: Quiz timer
 * - 1: Question timer
 * - 2: Combination timer
 */
export enum TimerMode {
  'Quiz timer',
  'Question timer',
  'Combination timer',
}

/**
 * Units
 *
 * - 0: Seconds
 * - 1: Minutes
 * - 2: Hours
 */
export enum Units {
  Seconds,
  Minutes,
  Hours,
}

type ConfigExtends = useId & useQuiz & useAuthor & useTimestamps

export interface ConfigPayload {
  description: string
  user_guide: string
  question_displayed: number
  question_mode: QuestionMode
  quiz_mode: QuizMode
  timer_mode: TimerMode
  timer: number
  timer_units: Units
  break: number
  break_units: Units
}

export interface Config extends ConfigExtends, ConfigPayload {}
