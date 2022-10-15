import { useColRef, useDocRef } from '~/plugins/firebase'
import { useAuthUser } from '../auth/auth.repository'
import { QUIZS } from '../quiz/quiz.repositories'
import { QuizWithMetaScheme } from './quiz-inter.schemes'
import type { QuizLikes, QuizMeta } from './quiz-inter.types'

const QUIZ_METAS = 'quiz_metas'

function useQuizMetaColRef() {
  return useColRef<QuizMeta>(QUIZ_METAS)
}

function useQuizLikesColRef(quiz_id: string) {
  return useColRef<QuizLikes>(`${QUIZS}/${quiz_id}/likes`)
}

function useQuizLikesDocRef(quiz_id: string, id: string) {
  return useDocRef<QuizLikes>(`${QUIZS}/${quiz_id}/likes`, id)
}

export async function fetchQuizMeta(quiz_id: string) {
  const user = useAuthUser()
  const queryLikes = query(
    useQuizLikesColRef(quiz_id),
    where('is_like', '==', true)
  )
  const { size: like_count } = await getDocs(queryLikes)
  const { empty: not_liked } = await getDocs(
    query(queryLikes, where('subject.uid', '==', user.uid))
  )

  return QuizWithMetaScheme.parse({ like_count, has_like: !not_liked })
}

export async function likeQuiz(quiz_id: string) {
  const user = useAuthUser()
  await setDoc(useQuizLikesDocRef(quiz_id, user.uid), {
    id: user.uid,
    subject: getAuthor().author,
    is_like: true,
  })
}

export async function unlikeQuiz(quiz_id: string) {
  const user = useAuthUser()
  await setDoc(useQuizLikesDocRef(quiz_id, user.uid), {
    id: user.uid,
    subject: getAuthor().author,
    is_like: false,
  })
}
