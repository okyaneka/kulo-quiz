import * as z from 'zod'
import { toFormValidator } from '@vee-validate/zod'

export const QuizConfigScheme = toFormValidator(
  z.object({
    autosave: z.optional(z.boolean()),
    description: z.optional(z.string().min(0)),
    user_guide: z.optional(z.string().min(0)),
    question_displayed: z.optional(z.number()),
    question_mode: z.optional(z.number().min(0).max(1)),
    quiz_mode: z.optional(z.number().min(0).max(0)),
    timer_mode: z.optional(z.number().min(0).max(2)),
    timer: z.optional(z.number()),
    timer_units: z.optional(z.number().min(0).max(2)),
    break: z.optional(z.number()),
    break_units: z.optional(z.number().min(0).max(2)),
  })
)
