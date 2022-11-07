import * as z from 'zod'
import type { TopicPayload } from './topic.types'

export enum TopicStatus {
  Trial,
  Rejected,
  Approved,
}

const ObjectScheme = z.object({
  title: z.string().min(1, 'title_required'),
  parent: z.preprocess(
    (arg) => arg ?? null,
    z.nullable(
      z.object({
        id: z.string().min(1, 'required'),
        title: z.string().min(1, 'required'),
      })
    )
  ),
  description: z.string().nullable(),
  status: z.nativeEnum(TopicStatus),
})

export const TopicScheme: z.ZodType<TopicPayload> = ObjectScheme

export const TopicValidator = toFormValidator(ObjectScheme)
