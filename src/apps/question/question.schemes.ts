import { toFormValidator } from '@vee-validate/zod'
import * as z from 'zod'
import { QuestionMode, type QuestionsPayload } from './question.types'

const ObjectScheme = (mode?: QuestionMode) => {
  const ObjectMode: any = {}

  switch (mode) {
    case QuestionMode.Choices:
      ObjectMode.question = z.string().min(1, 'Required')
      ObjectMode.choices = z
        .object({
          text: z.string().min(1, 'Required'),
          is_true: z.boolean(),
          image_url: z.string().nullable(),
        })
        .array()
        .nonempty()
      break
    default:
      break
  }

  return z.object({
    point: z.number().min(1, 'Required'),
    mode: z.nativeEnum(QuestionMode, { invalid_type_error: 'invalid' }),
    seq: z.number().min(0),
    guide: z.string().nullable(),
    image_url: z.string().nullable(),
    timer: z.number().min(1),
    ...ObjectMode,
  })
}

export const QuestionScheme = (mode?: QuestionMode) => {
  return ObjectScheme(mode) as unknown as z.ZodType<QuestionsPayload>
}

export const QuestionValidator = (mode?: QuestionMode) =>
  toFormValidator(ObjectScheme(mode))
