export interface SearchPayload {
  query?: string
}

export interface QuizThumbnail {
  id: string
  thumbnail_url: string
  title: string
  author: string
  rate: number
  player: number
}

interface QuizSpesification {
  question_total: number
  max_score: number
  question_modes: ('a' | 'b')[]
  dificulty_level: number
  working_duration: number
  security_level: number
  time_limit_to_repeat: number
}

export interface QuizDetail extends QuizThumbnail {
  description: string
  guide: string
  spesification: QuizSpesification
  images_url: string[]
}

export interface QuizRateValue {
  star: 1 | 2 | 3 | 4 | 5
  users: number
  percentage: number
}

interface User {
  uid: string
  name: string
  email: string
}

export interface QuizStandingData {
  rank: number
  user: User
  score: number
}
