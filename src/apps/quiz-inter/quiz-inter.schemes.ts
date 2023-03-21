import type { Timestamp } from 'firebase/firestore'
import { z, ZodType, type ZodObjectDef } from 'zod'
import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { QuizMeta, QuizWithMeta } from './quiz-inter.types'
import { quizShape } from '../quiz/quiz.schemes'

// like_count: number
// comment_count: number
// save_count: number
// share_count: number
// did_count: number
// has_like: boolean
// has_comment: boolean
// has_save: boolean
// has_share: boolean
// has_did: boolean

const preprocessString = () => z.preprocess((arg) => arg ?? '', z.string())
const preprocessNumber = () =>
  z.preprocess((arg) => (typeof arg == 'number' ? arg : 0), z.number())
const preprocessBoolean = () => z.preprocess((arg) => arg ?? false, z.boolean())

// type QuizExtends = useId & useAuthor & useTimestamps

// export interface QuizPayload extends useTopic {
//   title: string
//   grade: QuizGrade
//   level: QuizLevel
//   status: QuizStatus
// }

const QuizMetaShape = {
  like_count: preprocessNumber(),
  comment_count: preprocessNumber(),
  save_count: preprocessNumber(),
  share_count: preprocessNumber(),
  did_count: preprocessNumber(),
  has_like: preprocessBoolean(),
  has_save: preprocessBoolean(),
}

export const QuizMetaScheme: z.ZodType<
  QuizMeta,
  z.ZodObjectDef<typeof QuizMetaShape>
> = z.object(QuizMetaShape)
const coreShape = {
  id: preprocessString(),
  author: z.object({
    uid: preprocessString(),
    email: preprocessString(),
    displayName: preprocessString(),
    photoURL: preprocessString(),
  }),
  created_at: z.any() as ZodType<Timestamp>,
  updated_at: z.any() as ZodType<Timestamp>,
}

const quizWithMetaShape = {
  ...QuizMetaShape,
  ...coreShape,
  ...quizShape,
  image_url: z.preprocess(
    (arg) => (arg == undefined ? null : arg),
    z.string().nullable()
  ),
}

export const CoreScheme: ZodType<
  useId & useAuthor & useTimestamps,
  ZodObjectDef<typeof coreShape>
> = z.object(coreShape)

export const QuizWithMetaScheme: ZodType<
  QuizWithMeta,
  ZodObjectDef<typeof quizWithMetaShape>
> = z.object(quizWithMetaShape)
