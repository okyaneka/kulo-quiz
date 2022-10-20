import type { Timestamp } from 'firebase/firestore'
import type { ZodAny, ZodRawShape, ZodType } from 'zod'
import type {
  CustomFilter,
  ResponseRows,
  ResponseRowsPayload,
  Subject,
  useAuthor,
  useId,
  useSubject,
  useTimestamps,
} from './interfaces'

const SubjectShape = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string(),
})
const useIdShape = z.object({ id: z.string() })
const useAuthorShape = z.object({ author: SubjectShape })
const useSubjectShape = z.object({ subject: SubjectShape })
const useTimestampsShape = z.object({
  created_at: z.any() as ZodType<Timestamp>,
  updated_at: z.any() as ZodType<Timestamp>,
})
const ResponseRowsShape = <T = unknown>(scheme: ZodAny | ZodType<T>) =>
  z.object({
    total: z.number(),
    count: z.number(),
    rows: z.array(scheme),
  })

const ResponseRowsPayloadShape = z.object({})

export const SubjectSchemes: ZodType<Subject, typeof SubjectShape._def> =
  SubjectShape

export const useIdSchemes: ZodType<useId, typeof useIdShape._def> = useIdShape

export const useAuthorSchemes: ZodType<useAuthor, typeof useAuthorShape._def> =
  useAuthorShape

export const useSubjectSchemes: ZodType<
  useSubject,
  typeof useSubjectShape._def
> = useSubjectShape

export const useTimestampsSchemes: ZodType<
  useTimestamps,
  typeof useTimestampsShape._def
> = useTimestampsShape

export const ResponseRowsSchemes = <T = unknown>(
  scheme: ZodAny | ZodType<T>
): ZodType<ResponseRows<T>> => ResponseRowsShape(scheme)

export const ResponseRowsPayloadSchemes: ZodType<
  ResponseRowsPayload,
  typeof ResponseRowsPayloadShape._def
> = ResponseRowsPayloadShape
