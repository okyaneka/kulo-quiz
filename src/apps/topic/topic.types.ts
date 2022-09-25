import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { TopicStatus } from './topic.scheme'

type useStatus = { status: TopicStatus }

type TopicExtends = useId & useAuthor & useTimestamps

export interface TopicPayload extends useStatus {
  title: string
  parent: useTopic['topic'] | null
  description: string | null
}

export interface Topic extends TopicExtends, TopicPayload {
  fulltitle: string
}

export type TopicFilterable = Pick<Topic, 'title' | 'status'>

export type TopicOrderable =
  | 'title'
  | 'status'
  | 'fulltitle'
  | keyof useTimestamps

export interface useTopic {
  topic: Pick<Topic, 'id' | 'title'>
}
