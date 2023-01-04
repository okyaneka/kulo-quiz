/**
 * Question mode config
 *
 * - Sequences (Classic)
 * - Random
 */
export enum QuestionMode {
  'Sequences (Classic)',
  Random,
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

export interface Config {
  image_url: string | null
  description: string
  user_guide: string
  question_displayed: number
  question_mode: QuestionMode
  quiz_mode: QuizMode
  timer_mode: TimerMode
  timer: number | null
  timer_units: Units | null
  break: number
  break_units: Units
}
