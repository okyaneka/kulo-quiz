import type { ZodObjectDef, ZodType } from 'zod'
import {
  QuizGrade,
  QuizLevel,
  QuizStatus,
  type QuizPayload,
} from './quiz.types'

export const quizShape = {
  title: z.string(),
  topic: z.object({ id: z.string(), title: z.string() }),
  grade: z.nativeEnum(QuizGrade),
  level: z.nativeEnum(QuizLevel),
  status: z.nativeEnum(QuizStatus),
}

export const QuizScheme: ZodType<
  QuizPayload,
  ZodObjectDef<typeof quizShape>
> = z.object(quizShape)

export const QuizValidator = toFormValidator(z.object(quizShape))
