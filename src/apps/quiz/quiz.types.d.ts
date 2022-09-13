import type { useAuthor, useTimestamp } from '~/composables/types/interfaces'
import type { QuizTopic } from '../quiz-topic/quiz-topic.repository'

/**
 * Quiz Level
 *
 * - 0: Novice
 * - 1: Elementary
 * - 2: Junior High
 * - 3: Senior High
 * - 4: College
 * - 5: Master
 */
export type QuizGrade = 0 | 1 | 2 | 3 | 4 | 5

/**
 * Quiz Level
 *
 * - 0: Very Easy
 * - 1: Easy
 * - 2: Medium
 * - 3: Hard
 * - 4: Very Hard
 */
export type QuizLevel = 0 | 1 | 2 | 3 | 4

/**
 * Quiz Status
 *
 * - 0: Draft
 * - 1: Publish
 */
export type QuizStatus = 0 | 1

export interface Quiz extends useTimestamp, useAuthor {
  id: string
  title: string
  topic: Pick<QuizTopic, 'id' | 'title'>
  grade: QuizGrade
  level: QuizLevel
  status: QuizStatus
}

export type CreateQuizPayload = Pick<
  Quiz,
  'title' | 'topic' | 'grade' | 'level'
>

export type UpdateQuizPayload = Partial<
  Quiz,
  'title' | 'topic' | 'grade' | 'level'
>
