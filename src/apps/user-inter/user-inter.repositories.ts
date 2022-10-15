import { useColRef, useDocRef } from '~/plugins/firebase'
import { useAuthUser } from '../auth/auth.repository'
import { getQuiz, useQuizStore } from '../quiz/quiz.repositories'
import type { QuizLiked, UserInteraction } from './user-inter.types'

const USER_INTERS = 'user_inters'

function useUserIntersCol() {
  return useColRef<UserInteraction>(USER_INTERS)
}

export async function getUserInter(quiz_id: string) {
  const { count, rows } = await getDocumentList(useUserIntersCol(), {
    filter: { 'quiz.id': quiz_id },
  })
  if (count) return rows[0]

  const quiz = await getQuiz(quiz_id)
  const { getQuiz: _getQuiz } = useQuizStore()
  return await addDocument(
    useUserIntersCol(),
    { ..._getQuiz(quiz) },
    { withoutTimestamps: true }
  )
}

export async function setLikesQuiz(quiz_id: string) {
  const userInter = await getUserInter(quiz_id)
  const _collection = `${USER_INTERS}/${userInter.id}/quiz_likes`
  const { empty, docs, size } = await getDocs<QuizLiked>(
    query(useColRef(_collection), where('quiz.uid', '==', quiz_id))
  )
  if (empty) {
    await addDocument<QuizLiked>(
      useColRef(_collection),
      { quiz: userInter.quiz },
      { withoutAuthor: true }
    )
    return size + 1
  } else {
    await deleteDoc(useDocRef(_collection, docs[0].id))
    return size - 1
  }
}
