import type {
  useAuthor,
  useId,
  useTimestamps,
} from '~/composables/types/interfaces'
import type { useQuiz } from '../quiz/quiz.types'

export enum QuestionMode {
  'Choices',
}

type QuestionExtends = useId & useQuiz & useAuthor & useTimestamps

interface QuestionPayload {
  point: number
  mode: QuestionMode
  seq: number
  guide: string | null
  image_url: string | null
  timer: number | null
}

interface Question extends QuestionExtends, QuestionPayload {}

interface AnswerChoices {
  text: string
  is_true: boolean
  image_url: string | null
}

export interface ChoicesQuestionPayload extends QuestionPayload {
  question: string
  choices: AnswerChoices[]
}

export interface ChoicesQuestion extends ChoicesQuestionPayload, Question {}

export type Questions = Question | ChoicesQuestion

export type QuestionsPayload = QuestionPayload | ChoicesQuestionPayload

export type QuestionOrderable = 'seq' | keyof useTimestamps

export type QuestionFilterable = Pick<
  Questions,
  'mode' | 'timer' | 'point' | 'guide'
> & {
  'author.id': string
  'quiz.id': string
}
// export interface Question extends QuestionExtends {
//   point: number
//   mode: typeof QuestionMode[number]
//   seq: number | null
//   guide: string | null
//   guide_image: string | null
//   timer: number | null
// }

// /**
//  * Options mode question
//  */
// export interface QuestionOption {
//   text: string
//   is_true: boolean | null
//   option_image?: string
// }

// export interface OptionsQuestion extends Question {
//   question: string
//   options: QuestionOption[]
// }

// export type OptionsQuestionPayload = Partial<OptionsQuestion> &
//   Omit<QuestionOption, keyof QuestionExtends>

// export type AllQuestion = OptionsQuestion

// export type QuestionPayload = OptionsQuestionPayload

// export type QuestionPayloadData = Partial<QuestionPayload>
