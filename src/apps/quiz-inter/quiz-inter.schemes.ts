import { z } from 'zod'
import type { QuizMeta } from './quiz-inter.types'

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

export const QuizWithMetaScheme: z.ZodType<
  QuizMeta,
  z.ZodObjectDef<typeof QuizMetaShape>
> = z.object(QuizMetaShape)
