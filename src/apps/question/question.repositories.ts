import { runTransaction } from 'firebase/firestore'
import type { ResponseRowsPayload } from '~/composables/types/interfaces'
import { useColRef, useDocRef, useFirestore } from '~/plugins/firebase'
import { useQuizStore } from '../quiz/quiz.repositories'
import type {
  QuestionFilterable,
  QuestionOrderable,
  Questions,
} from './question.types'

const QUESTIONS = 'questions'

function useQuestionColRef() {
  return useColRef<Questions>(QUESTIONS)
}

function useQuestionDocRef(id: string) {
  return useDocRef<Questions>(QUESTIONS, id)
}

async function addEmptyQuestion(): Promise<Partial<Questions>> {
  const { getQuiz } = useQuizStore()

  return await addDocument(useQuestionColRef(), {
    ...getQuiz(),
    ...getAuthor(),
    ...getTimestamps(),
  })
}

export async function getQuestion(id: string) {
  return await getDocument(useQuestionDocRef(id))
}

export async function getQuestionByQuiz(quiz_id: string) {
  const { rows } = await getDocumentList<
    Partial<Questions>,
    QuestionFilterable,
    QuestionOrderable
  >(useQuestionColRef(), {
    filter: { 'quiz.id': quiz_id },
    // orders: [['seq', 'asc']],
  })

  const { questions } = storeToRefs(useQuizStore())
  if (rows.length == 0) questions.value = [{}]
  else questions.value = rows

  return rows
}

export async function getQuestionList(
  payload?: ResponseRowsPayload<QuestionFilterable, QuestionOrderable>
) {
  return await getDocumentList(useQuestionColRef(), {
    ...payload,
    orders: [['seq', 'asc']],
  })
}

export async function setQuestions(payload: Partial<Questions>[]) {
  payload.forEach((question, seq) => {
    payload[seq].seq = seq
  })

  // create if id is null
  await new Promise((res) => {
    const newQuestion = payload.filter((v) => !v.id)
    if (newQuestion.length == 0) res(true)
    let created = 0
    payload.forEach((question, index) => {
      if (!question.id) {
        addEmptyQuestion().then((doc) => {
          question = { ...question, ...doc }
          if (++created == newQuestion.length) res(true)
          payload[index].id = doc.id
        })
      }
    })
  })

  return await runTransaction(useFirestore(), async (transaction) => {
    const rows: Partial<Questions>[] = []
    payload.forEach(async (question) => {
      if (question.id == undefined) throw new Error('question_undefined')

      transaction.set(
        useQuestionDocRef(question.id),
        { ...Object.assign({}, question), updated_at: Timestamp.now() },
        { merge: true }
      )
      rows.push({ ...question, updated_at: Timestamp.now() })
    })
    return rows
  })
}

export async function deleteQuestion(id: string) {
  return await deleteDocument(useQuestionDocRef(id))
}
