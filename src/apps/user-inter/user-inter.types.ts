import type { Timestamp } from 'firebase/firestore'
import type {
  useAuthor,
  useId,
  useSubject,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { UserData } from '../auth/auth.types'
import type { useQuiz } from '../quiz/quiz.types'

export interface Follower extends useSubject {
  has_follow: boolean
  followed_at: Timestamp | null
  unfollowed_at: Timestamp | null
}

export interface Following extends useSubject {
  has_following: boolean
  following_at: Timestamp | null
  unfollowing_at: Timestamp | null
}

export interface UserMeta {
  quiz_count: number
  follower_count: number
  following_count: number
  has_follow: boolean
  has_following: boolean
  has_notif: boolean
}

export type UserWithMeta = UserData & UserMeta

export interface UserInteraction extends useId, useAuthor, useQuiz {}

export interface QuizLiked extends useId, useTimestamps, useQuiz {}
