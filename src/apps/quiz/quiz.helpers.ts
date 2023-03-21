import type { Topic } from '../topic/topic.types'
import type { QuizGrade, QuizStatus, QuizLevel } from './quiz.types'

export function getLabel(topic: Topic, __options: Topic[]): string {
  if (topic.parent != null) {
    const parent = __options.find((v) => v.id == topic.parent?.id)
    if (parent != undefined) {
      return getLabel(parent, __options) + ' / ' + topic.title
    }
  }
  return topic.title
}

export function getStatus(code: QuizStatus): string {
  switch (code) {
    case 0:
      return 'draft'
    case 1:
      return 'published'
    default:
      return ''
  }
}

export function getGrade(code: QuizGrade): string {
  switch (code) {
    case 0:
      return 'novice'
    case 1:
      return 'elementary'
    case 2:
      return 'junior high'
    case 3:
      return 'senior high'
    case 4:
      return 'college'
    case 5:
      return 'master'
    default:
      return ''
  }
}

export function getLevel(code: QuizLevel): string {
  switch (code) {
    case 0:
      return 'very easy'
    case 1:
      return 'easy'
    case 2:
      return 'medium'
    case 3:
      return 'hard'
    case 4:
      return 'very hard'
    default:
      return ''
  }
}
