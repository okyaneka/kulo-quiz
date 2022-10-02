import type { useId } from '~/composables/types/interfaces'
import { useColRef, useDocRef, useFirestore } from '~/plugins/firebase'
import { useQuizStore } from '../quiz/quiz.repositories'
import { useQuestionDocRef } from '~/apps/question/question.repositories'
import type { Answer, AnswerPayload, Result, ResultData } from './results.types'
import {
  QuestionMode,
  type ChoicesQuestion,
  type Questions,
} from '../question/question.types'
import { useAuthUser } from '../auth/auth.repository'

enum ResultModel {
  RESULTS = 'results',
  PREVIEW = 'results_preview',
}

enum AnswerModel {
  ANSWER = 'answers',
  PREVIEW = 'answers_preview',
}

function useResultColRef(model: ResultModel) {
  return useColRef<Result>(model)
}

function useResultDocRef(model: ResultModel, id: string) {
  return useDocRef<Result>(model, id)
}

function useAnswerColRef(model: AnswerModel) {
  return useColRef<Answer>(model)
}

function useAnswerDocRef(model: AnswerModel, id: string) {
  return useDocRef<Answer>(model, id)
}

async function __addResult(model: ResultModel) {
  const { getQuiz } = useQuizStore()
  const payload: Omit<Result, 'id'> = {
    ...getAuthor(),
    ...getTimestamps(),
    ...getQuiz(),
    score: 0,
    duration: 0,
  }

  return await addDocument(useResultColRef(model), payload)
}

async function __setResult(
  resultModel: ResultModel,
  answerModel: AnswerModel,
  id: string,
  answers: AnswerPayload[]
) {
  const result = await __getResult(resultModel, id)
  const { getQuestion } = useQuizStore()

  // create id first
  const answersWithId: (AnswerPayload & useId)[] = await new Promise((res) => {
    const rows: (AnswerPayload & useId)[] = []
    let created = 0
    answers.forEach((answer) => {
      addDocument(useAnswerColRef(answerModel), {}).then((doc) => {
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
      function validateAnswer(question: Questions, answer: AnswerPayload) {
        let correct_answer, is_correct
        if (question.mode == QuestionMode.Choices) {
          const q = question as ChoicesQuestion
          correct_answer = q.choices.filter((v) => v.is_true)
          if (!correct_answer) throw new Error('correct_answer_undefined')
          is_correct =
            correct_answer.some((v) => v.text == answer.answer) ?? false
          return { correct_answer, is_correct }
        }
        throw new Error('failed_to_validate_answer')
      }

      // get all question first
      const questions: Questions[] = await new Promise((res) => {
        const questions: Questions[] = []
        let created = 0
        for (let i = 0; i < answersWithId.length; i++) {
          const answer = answersWithId[i]
          transaction
            .get(useQuestionDocRef(answer.question.id))
            .then((question) => {
              const data = question.data()
              if (data == undefined) throw new Error('question_undefined')
              questions[i] = data
              if (++created == answersWithId.length) res(questions)
            })
        }
      })

      // then set answer
      let score = 0
      answersWithId.forEach(async (answer, index) => {
        if (answer.id == undefined) throw new Error('answer_undefined')
        const question = questions[index] as ChoicesQuestion
        if (question == undefined) throw new Error('question_undefined')

        const { correct_answer, is_correct } = validateAnswer(question, answer)

        if (is_correct) score += question.point

        const payload: Answer = {
          ...answer,
          ...getQuestion(question),
          ...getTimestamps(),
          seq: question.seq,
          correct_answer: correct_answer.map((v) => v.text),
          is_correct,
          result: {
            id: result.id,
            quiz: result.quiz,
          },
        }

        transaction.set(useAnswerDocRef(answerModel, answer.id), payload, {
          merge: true,
        })
      })
      return {
        ...result,
        score,
        duration: Math.round(
          (Date.now() - result.created_at.toMillis()) / 1000
        ),
      }
    }
  )
  // answer has set

  // set the score
  await setDocument(useResultDocRef(resultModel, result.id), resultData)

  // return result with score
  return resultData
}

async function __getResultList(model: ResultModel, quiz_id: string) {
  const user = useAuthUser()
  return getDocumentList(useResultColRef(model), {
    filter: {
      'quiz.id': quiz_id,
      'author.uid': user.uid,
      duration: {
        operator: '!=',
        value: 0,
      },
    },
    orders: [['created_at', 'desc']],
  })
}

async function __getResult(model: ResultModel, id: string) {
  return await getDocument(useResultDocRef(model, id))
}

async function __getResultData(
  resultModel: ResultModel,
  answerModel: AnswerModel,
  id: string
) {
  const result = await __getResult(resultModel, id)
  const { rows: answers } = await getDocumentList(
    useAnswerColRef(answerModel),
    {
      filter: { 'result.id': id },
      orders: [['seq', 'asc']],
    }
  )

  return { ...result, answers } as ResultData
}

async function __getStandingList(model: ResultModel, quiz_id: string) {
  return await getDocumentList(useResultColRef(model), {
    filter: {
      'quiz.id': quiz_id,
      duration: {
        operator: '!=',
        value: 0,
      },
    },
    orders: [['score', 'desc']],
  })
}

export async function addResultPreview() {
  return await __addResult(ResultModel.PREVIEW)
}

export async function addResult() {
  return await __addResult(ResultModel.RESULTS)
}

export async function setResultPreview(id: string, answers: AnswerPayload[]) {
  return await __setResult(
    ResultModel.PREVIEW,
    AnswerModel.PREVIEW,
    id,
    answers
  )
}

export async function setResult(id: string, answers: AnswerPayload[]) {
  return await __setResult(ResultModel.RESULTS, AnswerModel.ANSWER, id, answers)
}

export async function getResultPreviewList(quiz_id: string) {
  return await __getResultList(ResultModel.PREVIEW, quiz_id)
}

export async function getResultList(quiz_id: string) {
  return await __getResultList(ResultModel.RESULTS, quiz_id)
}

export async function getResultPreviewData(id: string) {
  return await __getResultData(ResultModel.PREVIEW, AnswerModel.PREVIEW, id)
}

export async function getResultData(id: string) {
  return await __getResultData(ResultModel.RESULTS, AnswerModel.ANSWER, id)
}

export async function getStandingPreviewList(quiz_id: string) {
  return await __getStandingList(ResultModel.PREVIEW, quiz_id)
}

export async function getStandingList(quiz_id: string) {
  return await __getStandingList(ResultModel.RESULTS, quiz_id)
}

export const useResultStore = defineStore('result', () => {
  const result = ref<Result>()

  return { result }
})
