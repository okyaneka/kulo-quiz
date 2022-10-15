import type { TypeOf } from 'zod'
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

const ObjectScheme = {
  title: z.string(),
  topic: z.object({ id: z.string(), title: z.string() }),
  grade: z.nativeEnum(QuizGrade),
  level: z.nativeEnum(QuizLevel),
  status: z.nativeEnum(QuizStatus),
}

export const QuizScheme: z.ZodType<
  QuizPayload,
  z.ZodObjectDef<typeof ObjectScheme>
> = z.object(ObjectScheme)

export const QuizValidator = toFormValidator(z.object(ObjectScheme))
