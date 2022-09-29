import * as z from 'zod'
import {
  QuestionMode,
  QuizMode,
  TimerMode,
  Units,
  type Config,
} from './config.types'

const ObjectScheme = (maxQuestion: number) => {
  return z.object({
    description: z.string().default(''),
    user_guide: z.string().default(''),
    question_displayed: z
      .number()
      .min(1)
      .max(maxQuestion)
      .nullable()
      .default(null),
    question_mode: z.nativeEnum(QuestionMode),
    quiz_mode: z.nativeEnum(QuizMode),
    timer_mode: z.nativeEnum(TimerMode),
    timer: z.number().min(1).nullable().default(null),
    timer_units: z.nativeEnum(Units).nullable().default(null),
    break: z.number().min(1),
    break_units: z.nativeEnum(Units),
  })
}

export const ConfigScheme = (maxQuestion: number) =>
  ObjectScheme(maxQuestion) as unknown as z.ZodType<Partial<Config>>

export const ConfigValidator = (maxQuestion: number) =>
  toFormValidator(ObjectScheme(maxQuestion))
