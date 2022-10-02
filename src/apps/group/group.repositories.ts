import { useColRef } from '~/plugins/firebase'
import { useAuthStore } from '../auth/auth.repository'
import { getQuiz, useQuizStore } from '../quiz/quiz.repositories'
import type { Group, GroupPayload } from './group.types'

const GROUPS = 'groups'

function useGroupColRef() {
  return useColRef<Group>(GROUPS)
}

async function getGroupIfExist(
  quiz_id: string,
  payload: GroupPayload
): Promise<Group | undefined> {
  const { user } = useAuthStore()
  if (user != undefined) {
    const { rows } = await getDocumentList(useGroupColRef(), {
      filter: {
        'author.uid': user.uid,
        'quiz.id': quiz_id,
        name: payload.name,
      },
    })
    if (rows.length) return rows[0]
  }
}

export async function setGroup(quiz_id: string, payload: GroupPayload) {
  const group = await getGroupIfExist(quiz_id, payload)
  if (group != undefined) return group

  await getQuiz(quiz_id)
  const { getQuiz: useQuiz } = useQuizStore()
  const groupPayload = { ...useQuiz(), ...payload }
  return await addDocument(useGroupColRef(), groupPayload)
}
