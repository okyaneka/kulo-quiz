import * as z from 'zod'
import type { QuizPayload } from './quiz.types'

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

export const quizShape = {
  title: z.string(),
  topic: z.object({ id: z.string(), title: z.string() }),
  grade: z.nativeEnum(QuizGrade),
  level: z.nativeEnum(QuizLevel),
  status: z.nativeEnum(QuizStatus),
}

export const QuizScheme: z.ZodType<
  QuizPayload,
  z.ZodObjectDef<typeof quizShape>
> = z.object(quizShape)

export const QuizValidator = toFormValidator(z.object(quizShape))
