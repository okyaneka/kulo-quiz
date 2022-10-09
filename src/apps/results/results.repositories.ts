import type { useId } from '~/composables/types/interfaces'
import { useColRef, useDocRef, useFirestore } from '~/plugins/firebase'
import { useQuizStore } from '../quiz/quiz.repositories'
import { useQuestionDocRef } from '~/apps/question/question.repositories'
import type {
  Answer,
  AnswersPayload,
  ChoicesAnswer,
  Result,
  ResultData,
} from './results.types'
import {
  QuestionMode,
  type Choice,
  type ChoicesQuestion,
  type Questions,
} from '../question/question.types'
import { useAuthUser } from '../auth/auth.repository'
import type { Quiz } from '../quiz/quiz.types'

interface ResultCollection {
  results: string
  unfinished_results: string
  answers: string
}

const results: ResultCollection = {
  results: 'results',
  unfinished_results: 'unfinished_results',
  answers: 'answers',
}

const preview: ResultCollection = {
  results: 'previews',
  unfinished_results: 'unfinished_previews',
  answers: 'answers_preview',
}

// function useResultColRef<T = unknown>(model: string) {
//   return useColRef<T>(model)
// }

// function useResultDocRef<T = unknown>(model: string, id: string) {
//   return useDocRef<T>(model, id)
// }

async function __addResult(quiz: Quiz, model: ResultCollection) {
  const { getQuiz } = useQuizStore()

  const payload: Omit<Result, 'id'> = {
    ...getAuthor(),
    ...getTimestamps(),
    ...getQuiz(quiz),
    score: 0,
    duration: 0,
  }

  return await addDocument(useColRef<Result>(model.unfinished_results), payload)
}

async function __setResult(
  model: ResultCollection,
  id: string,
  answers: AnswersPayload[]
) {
  const unfinishedResult = await __getUnfinishedResult(model, id)
  const result = await addDocument(
    useColRef<Result>(model.results),
    unfinishedResult
  )
  await deleteDocument(useDocRef(model.unfinished_results, result.id))

  const { getQuestion } = useQuizStore()
  const duration = Math.floor(
    (Date.now() - result.created_at.toMillis()) / 1000
  )

  // create id first
  const payloadWithId = await new Promise<(AnswersPayload & useId)[]>((res) => {
    const rows: (AnswersPayload & useId)[] = []
    let created = 0
    answers.forEach((answer) => {
      addDocument(useColRef<Answer>(model.answers), {}).then((doc) => {
        rows.push({ id: doc.id, ...answer })
        if (++created == answers.length) res(rows)
      })
    })
  })

  // then run transaction
  // rule transaction, set get to first
  const resultData = await runTransaction(
    useFirestore(),
    async (transaction) => {
      function validateAnswer(question: Questions, answer: AnswersPayload) {
        let correct_answer, is_correct
        if (question.mode == QuestionMode.Choices) {
          const q = question as ChoicesQuestion
          const a = answer as ChoicesAnswer
          correct_answer = q.correct_answer
          is_correct = correct_answer.includes(a.answer?.key as number)
          return { correct_answer, is_correct }
        }
        throw new Error('failed_to_validate_answer')
      }

      // get all question first
      const questions: Questions[] = await new Promise((res) => {
        const questions: Questions[] = []
        let created = 0
        for (let i = 0; i < payloadWithId.length; i++) {
          const answer = payloadWithId[i]
          transaction
            .get(useQuestionDocRef(answer.question.id))
            .then((question) => {
              const data = question.data()
              if (data == undefined) throw new Error('question_undefined')
              questions[i] = data
              if (++created == payloadWithId.length) res(questions)
            })
        }
      })

      // then set answer
      let score = 0
      payloadWithId.forEach(async (answer, index) => {
        if (answer.id == undefined) throw new Error('answer_undefined')
        const question = questions[index] as ChoicesQuestion
        // if (question == undefined) throw new Error('question_undefined')

        const { correct_answer, is_correct } = validateAnswer(question, answer)

        if (is_correct) score += question.point

        const payload: Answer = {
          ...answer,
          ...getAuthor(),
          ...getQuestion(question),
          ...getTimestamps(),
          seq: question.seq,
          correct_answer: correct_answer
            .map((v) => question.choices.find((w) => v == w.key))
            .filter((v) => v != undefined) as Choice[],
          is_correct,
          result: {
            id: result.id,
            quiz: result.quiz,
          },
        }

        transaction.set(useDocRef<Result>(model.answers, answer.id), payload, {
          merge: true,
        })
      })
      return {
        ...result,
        score,
        duration,
      }
    }
  )
  // answer has set

  // set the score
  await setDocument(useDocRef<Result>(model.results, result.id), resultData)

  // return result with score
  return result
}

async function __getResultList(model: ResultCollection, quiz_id?: string) {
  const user = useAuthUser()
  const filter: { [key: string]: string | number } = { 'author.uid': user.uid }
  if (quiz_id != undefined) filter['quiz.id'] = quiz_id
  return getDocumentList<Result>(useColRef(model.results), {
    filter,
    orders: [['created_at', 'desc']],
  })
}

async function __getUnfinishedResult(model: ResultCollection, id: string) {
  return await getDocument(useDocRef<Result>(model.unfinished_results, id))
}

async function __getResult(model: ResultCollection, id: string) {
  return await getDocument(useDocRef<Result>(model.results, id))
}

async function __getResultData(model: ResultCollection, id: string) {
  const result = await __getResult(model, id)
  const { rows: answers } = await getDocumentList(useColRef(model.answers), {
    filter: { 'result.id': id },
    orders: [['seq', 'asc']],
  })

  return { ...result, answers } as ResultData
}

async function __getStandingList(model: ResultCollection, quiz_id: string) {
  return await getDocumentList(useColRef<Result>(model.results), {
    filter: { 'quiz.id': quiz_id },
    orders: [['score', 'desc']],
  })
}

export async function addResult(quiz: Quiz) {
  return await __addResult(quiz, results)
}

export async function setResult(id: string, answers: AnswersPayload[]) {
  return await __setResult(results, id, answers)
}

export async function getResultList(quiz_id?: string) {
  return await __getResultList(results, quiz_id)
}

export async function getResultData(id: string) {
  return await __getResultData(results, id)
}

export async function getStandingList(quiz_id: string) {
  return await __getStandingList(results, quiz_id)
}

export async function addResultPreview(quiz: Quiz) {
  return await __addResult(quiz, preview)
}

export async function setResultPreview(id: string, answers: AnswersPayload[]) {
  return await __setResult(preview, id, answers)
}

export async function getResultPreviewList(quiz_id?: string) {
  return await __getResultList(preview, quiz_id)
}

export async function getResultPreviewData(id: string) {
  return await __getResultData(preview, id)
}

export async function getStandingPreviewList(quiz_id: string) {
  return await __getStandingList(preview, quiz_id)
}

export const useResultStore = defineStore('result', () => {
  const result = ref<Result>()

  return { result }
})
