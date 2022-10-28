import type { ZodObjectDef, ZodType } from 'zod'
import * as z from 'zod'
import {
  QuestionMode,
  QuizMode,
  TimerMode,
  Units,
  type Config,
} from './config.types'

const ObjectScheme = (maxQuestion: number) => {
  return {
    image_url: z.preprocess(
      (arg) => (arg == undefined ? null : arg),
      z.string().nullable()
    ),
    description: z.preprocess((arg) => arg ?? '', z.string()),
    user_guide: z.preprocess((arg) => arg ?? '', z.string()),
    question_displayed: z.preprocess(
      (arg) => arg ?? 0,
      z.number().min(1).max(maxQuestion)
    ),
    question_mode: z.nativeEnum(QuestionMode),
    quiz_mode: z.nativeEnum(QuizMode),
    timer_mode: z.nativeEnum(TimerMode),
    timer: z.preprocess(
      (arg) => (arg == undefined ? null : arg),
      z.number().min(1).nullable()
    ),
    timer_units: z.preprocess(
      (arg) => (arg == undefined ? null : arg),
      z.nativeEnum(Units).nullable()
    ),
    break: z.number().min(1),
    break_units: z.nativeEnum(Units),
  }
}

export const ConfigScheme = (
  maxQuestion: number
): ZodType<Config, ZodObjectDef<ReturnType<typeof ObjectScheme>>> =>
  z.object(ObjectScheme(maxQuestion))

export const ConfigValidator = (maxQuestion: number) =>
  toFormValidator(z.object(ConfigScheme(maxQuestion)._def.shape()))
