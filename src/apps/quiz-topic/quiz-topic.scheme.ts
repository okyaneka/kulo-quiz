import * as zod from 'zod'
import { toFormValidator } from '@vee-validate/zod'

export const QuizTopicScheme = toFormValidator(
  zod.object({
    title: zod.string().min(1, 'Required'),
    parent: zod
      .object({
        id: zod.string().min(1),
        title: zod.string().min(1),
      })
      .nullable(),
  })
)
