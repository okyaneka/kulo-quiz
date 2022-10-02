import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { useQuiz } from '../quiz/quiz.types'

type core = useId & useTimestamps & useAuthor & useQuiz

export interface GroupPayload {
  name: string
}

export interface Group extends core, GroupPayload {}
