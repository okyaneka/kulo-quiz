import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'

export interface SharePayload {
  urlin: string
}

export interface Share extends SharePayload, useId, useAuthor, useTimestamps {
  urlout: string
  click: number
}
