import type { useId, useSubject } from '~/composables/types/interfaces'
import type { QuizItem } from '../quiz/quiz.types'

export interface QuizMeta {
  like_count: number
  comment_count: number
  save_count: number
  share_count: number
  did_count: number
  has_like: boolean
  has_save: boolean
}

export interface QuizWithMeta extends QuizItem, QuizMeta {}

export interface QuizLikes extends useId, useSubject {
  is_like: boolean
}
