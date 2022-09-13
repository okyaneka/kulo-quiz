import { toFormValidator } from '@vee-validate/zod'
import * as zod from 'zod'

export const CreateQuizScheme = toFormValidator(
  zod.object({
    title: zod.string().min(1, 'Required'),
    topic: zod.object({
      id: zod.string().min(1),
      title: zod.string().min(1),
    }),
    grade: zod.number().min(0).max(5),
    level: zod.number().min(0).max(4),
  })
)
