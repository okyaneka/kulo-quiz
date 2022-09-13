import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types'
import type { QuizGrade, QuizLevel } from './quiz.types'

export const QuizLevelOptions: OptionType<QuizLevel>[] = [
  { label: 'Very Easy', value: 0 },
  { label: 'Easy', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Hard', value: 3 },
  { label: 'Very Hard', value: 4 },
]

export const QuizGradeOptions: OptionType<QuizGrade>[] = [
  { label: 'Novice', value: 0 },
  { label: 'Elementary', value: 1 },
  { label: 'Junior High', value: 2 },
  { label: 'Senior High', value: 3 },
  { label: 'College', value: 4 },
  { label: 'Master', value: 5 },
]

export {}
