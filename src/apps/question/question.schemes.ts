import { z } from 'zod'
import {
  QuestionMode,
  type QuestionPayload,
  type ChoicesQuestionPayload,
  type Choice,
} from './question.types'

const QuestionPayloadShape = z.object({
  point: z.number().min(1),
  mode: z.nativeEnum(QuestionMode),
  seq: z.number().min(0),
  guide: z.string().nullable(),
  image_url: z.string().nullable(),
  timer: z.number().nullable(),
})

const QuestionPayloadScheme: z.ZodType<
  QuestionPayload,
  z.ZodObjectDef<typeof QuestionPayloadShape.shape>
> = QuestionPayloadShape

const ChoiceShape = z.object({
  text: z.string().min(1),
  key: z.number(),
  image_url: z.string().nullable(),
})

const ChoiceScheme: z.ZodType<
  Choice,
  z.ZodObjectDef<typeof ChoiceShape.shape>
> = ChoiceShape

const ChoicesQuestionPayloadShape = z.object({
  ...QuestionPayloadScheme._def.shape(),
  question: z.string().min(1),
  choices: z.preprocess((arg) => {
    if (!arg) return false
    const choices = arg as Choice[]
    const keys = choices.map((v) => v.key)
    if (new Set(keys).size != choices.length) return false
    return choices
  }, z.array(z.object(ChoiceScheme._def.shape()), { invalid_type_error: 'key_must_no_duplicate' }).min(1)),
  correct_answer: z.number().array().min(1, 'Correct answer is required'),
})

const ChoicesQuestionPayloadScheme: z.ZodType<
  ChoicesQuestionPayload,
  z.ZodObjectDef<typeof ChoicesQuestionPayloadShape.shape>
> = ChoicesQuestionPayloadShape

const QuestionPayloadSchemes = z.array(ChoicesQuestionPayloadScheme)

export {
  QuestionPayloadScheme,
  QuestionPayloadSchemes,
  ChoiceScheme,
  ChoicesQuestionPayloadScheme,
}
// const ObjectScheme = (mode?: QuestionMode) => {
//   const ObjectMode: any = {}

//   switch (mode) {
//     case QuestionMode.Choices:
//       ObjectMode.question = z.string().min(1, 'Required')
//       ObjectMode.choices = z
//         .object({
//           text: z.string().min(1, 'Required'),
//           is_true: z.boolean(),
//           image_url: z.string().nullable(),
//         })
//         .array()
//         .min(1)
//       break
//     default:
//       break
//   }

//   return z.object({
//     point: z.number().min(1, 'Required'),
//     mode: z.nativeEnum(QuestionMode, { invalid_type_error: 'invalid' }),
//     seq: z.number().min(0),
//     guide: z.string().nullable(),
//     image_url: z.string().nullable(),
//     timer: z.number().min(1, 'Required'),
//     ...ObjectMode,
//   })
// }

// const answerChoicesScheme: z.ZodType<AnswerChoices> = z.object({
//   text: z.string(),
//   is_true: z.boolean(),
//   image_url: z.string().nullable(),
// })

// const answerChoicesS = z.object({
//   text: z.string(),
//   is_true: z.boolean(),
//   image_url: z.string().nullable(),
// })

// const pshceme = answerChoicesScheme._def as z.ZodObjectDef

// export const validator = toFormValidator(z.object(pshceme.shape()))

// export const newObjectScheme = z.preprocess(val => {

// })

// object({
//   point: z.number(),
//   mode: z.nativeEnum(QuestionMode),
//   seq: z.number(),
//   guide: z.string().nullable(),
//   image_url: z.string().nullable(),
//   timer: z.number().nullable(),
//   question: z.string().optional(),
//   choices: z.array(answerChoicesScheme).optional(),
// })

// export const QuestionScheme = (mode?: QuestionMode) => {
//   return ObjectScheme(mode) as unknown as z.ZodType<QuestionsPayload>
// }

// export const QuestionValidator = (mode?: QuestionMode) =>
//   toFormValidator(ObjectScheme(mode))
