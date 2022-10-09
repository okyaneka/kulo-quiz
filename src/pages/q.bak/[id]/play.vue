<route lang="yaml">
meta:
  requireAuth: true
</route>

<script setup lang="ts">
  import anime from 'animejs'
  import {
    DArrowLeft,
    DArrowRight,
    Grid,
    SuccessFilled,
  } from '@element-plus/icons-vue'
  import type { Component } from 'vue'
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import { TimerMode, type Config } from '~/apps/config/config.types'
  import { getQuizData, useQuizStore } from '~/apps/quiz/quiz.repositories'
  import { QuizLevel, QuizStatus } from '~/apps/quiz/quiz.schemes'
  import {
    addResult,
    setResult as __setResult,
  } from '~/apps/results/results.repositories'
  import type { AnswerPayload, Result } from '~/apps/results/results.types'

  interface QuestionNav {
    key: string
    type: '' | 'primary'
    title: string
    icon: Component
    disabled?: () => boolean
    onClick?: () => void
  }

  const route = useRoute()
  const router = useRouter()
  const { getQuestion } = useQuizStore()
  const { user } = storeToRefs(useAuthStore())

  const questionTimer = ref()
  const quizTimer = ref()

  const answers = ref<(string | null)[]>([])
  const counter = ref<number>(1)
  const finishDialog = ref<boolean>(false)
  const no = ref<number>(1)
  const QuestionDrawer = ref<boolean>(false)
  const result = ref<Result>()
  const step = ref<1 | 2 | 3>(1)
  const timeElapsed = ref<number>(0)
  const timeInterval = ref()

  const title = computed(() => quizData.value?.title ?? '')
  const level = computed(() =>
    quizData.value?.level != undefined ? QuizLevel[quizData.value.level] : ''
  )
  const questionDisplayed = computed(
    () => config.value?.question_displayed ?? 0
  )
  const timerMode = computed(() =>
    config.value?.timer_mode ? TimerMode[config.value?.timer_mode] : ''
  )
  const maxDuration = computed(() => quizData.value?.max_duration ?? 0)

  const loadQuiz = computed<boolean>(() => !!user.value)
  const config = computed(() => quizData.value?.config as Config)
  const questions = computed(() => quizData.value?.questions)

  const timesUp = computed(
    () => (quizData.value?.max_duration ?? 0) <= timeElapsed.value
  )

  const useQuestionTimer = computed<boolean>(
    () => config.value != undefined && [1, 2].includes(config.value.timer_mode)
  )

  const useQuizTimer = computed<boolean>(
    () => config.value != undefined && [0, 2].includes(config.value.timer_mode)
  )

  const navs = computed<QuestionNav[]>(() => [
    {
      key: 'prev',
      type: 'primary',
      disabled: (): boolean => no.value == 1,
      icon: DArrowLeft,
      title: 'Previous Question',
      onClick: prevQuestion,
    },
    {
      key: 'go',
      type: '',
      icon: Grid,
      title: 'Go to spesific number',
      onClick: goSelectQuestion,
    },
    {
      key: 'next',
      type: 'primary',
      disabled: (): boolean => no.value == questions.value?.length,
      icon: DArrowRight,
      title: 'Next Question',
      onClick: nextQuestion,
    },
    {
      key: 'finish',
      type: '',
      icon: SuccessFilled,
      title: 'Finish the Quiz',
      onClick: finishQuiz,
    },
  ])

  const timeLeftFormated = computed(() => {
    let timer
    if (config.value.timer_mode == TimerMode['Question timer'])
      timer =
        questions.value
          ?.slice(0, no.value)
          .reduce((c, v) => c + (v.timer ?? 0), 0) ?? 0
    else timer = quizData.value?.max_duration ?? 0
    const time = timer - timeElapsed.value
    const sec = time % 60
    const min = Math.floor(time / 60)
    return `${min.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`
  })

  const question = computed(() => {
    if (questions.value == undefined) return undefined
    return questions.value[no.value - 1]
  })

  const answersPayload = computed(() => {
    return questions.value?.map((question, index) => {
      return {
        answer: answers.value[index] ?? null,
        ...getQuestion(question),
      } as AnswerPayload
    })
  })

  // const quizDuration = computed(() => {
  //   if (config.value == undefined) return undefined

  //   switch (config.value.timer_mode) {
  //     case TimerMode['Question timer']:
  //       return {
  //         counter:
  //           questions.value?.reduce((c, v) => c + (v.timer ?? 0), 0) ?? 0,
  //         unit: Units.Seconds,
  //       }
  //     default:
  //       return {
  //         counter: config.value.timer,
  //         unit: config.value.timer_units,
  //       }
  //   }
  // })

  const { data: quizData, isFetching: loading } = useQuery({
    queryKey: ['quiz-data'],
    queryFn: () =>
      getQuizData(route.params.id as string).then((quiz) => {
        if (quiz.author.uid != user.value?.uid)
          throw new Error('bad_request: permission_denied')
        if (quiz.status != QuizStatus.Publish)
          throw new Error('bad_request: status_not_publish')
        return quiz
      }),
    enabled: loadQuiz,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    onError: (e: Error) => {
      ElMessage.error(e.message)
      router.push('/')
    },
  })

  const { mutateAsync: createResult } = useMutation({
    mutationFn: () => addResult(),
  })

  const { mutateAsync: setResult, isLoading } = useMutation({
    mutationFn: (payload: AnswerPayload[]) => {
      if (result.value == undefined) throw new Error('result_undefined')
      return __setResult(result.value?.id, payload)
    },
  })

  function setAnswer(answer: string) {
    const index = no.value - 1
    answers.value[index] = answer == answers.value[index] ? null : answer
  }

  function nextStep() {
    step.value++
  }

  async function startQuiz() {
    if (quizData.value == undefined) throw new Error('quiz_is_undefined')

    const duration = quizData.value.max_duration
    step.value = 3
    // timeInterval.value = setInterval(() => {
    //   if (++timeElapsed.value == duration) {
    //     clearInterval(timeInterval.value)
    //     timeInterval.value = undefined
    //     finishQuiz()
    //     endQuiz()
    //   }
    // }, 1000)

    await nextTick()
    // result.value = await createResult()

    // startQuestionTimer()
    // startQuizTimer(duration)
  }

  function startQuestionTimer() {
    if (useQuestionTimer.value)
      anime({
        targets: questionTimer.value,
        duration: (question.value?.timer ?? 0) * 1e3 - 300,
        width: '100%',
        easing: 'linear',
        complete() {
          anime({
            targets: questionTimer.value,
            duration: 300,
            width: '0%',
            easing: 'linear',
            complete() {
              nextQuestion()
            },
          })
        },
      })
  }

  function startQuizTimer(duration: number) {
    if (useQuizTimer.value)
      anime({
        targets: quizTimer.value,
        duration: duration * 1e3 - 300,
        width: '100%',
        easing: 'linear',
        complete() {
          anime({
            targets: quizTimer.value,
            duration: 300,
            width: '0%',
            easing: 'linear',
          })
        },
      })
  }

  function goSelectQuestion() {
    QuestionDrawer.value = true
  }

  function goTo(question_no: number) {
    no.value = question_no
    QuestionDrawer.value = false
    nextTick().then(() => {
      const activeElement = document.activeElement as HTMLElement
      activeElement.blur()
      startQuestionTimer()
    })
  }

  function prevQuestion() {
    if (no.value == 1) goTo(config.value.question_displayed)
    else goTo(no.value - 1)
  }

  function nextQuestion() {
    if (no.value == config.value.question_displayed) finishQuiz()
    else goTo(no.value + 1)
  }

  function finishQuiz() {
    finishDialog.value = true
  }

  function cancelFinish() {
    finishDialog.value = false
    no.value = 1
  }

  async function confirmFinishQuiz() {
    if (!timesUp.value) endQuiz()
    router.push({ name: 'q-id-review' })
  }

  async function endQuiz() {
    if (answersPayload.value == undefined)
      return ElMessage.error('some_question_or_answer_is_invalid')
    await setResult(answersPayload.value)
  }
</script>

<template>
  <el-row style="padding: 20px 0; min-height: 100vh; flex-direction: column">
    <el-col v-if="loading" style="margin: auto 0">
      <el-progress
        :percentage="80"
        indeterminate
        :show-text="false"
      ></el-progress>
    </el-col>

    <el-col v-else-if="!timesUp">
      <quiz-summary
        v-if="step == 1"
        :title="title"
        :level="level"
        :question-displayed="questionDisplayed"
        :timer-mode="timerMode"
        :max-duration="maxDuration"
        @click:ready="nextStep"
      ></quiz-summary>

      <!-- counter -->
      <quiz-counter v-if="step == 2" @end="nextStep"></quiz-counter>

      <!-- quiz -->
      <el-row v-if="step == 3">
        <el-col>
          <p align="center">
            <el-button circle size="large">
              <strong>{{ no }}</strong>
            </el-button>
          </p>
        </el-col>

        <el-col>
          <quiz-question
            :question="question"
            v-model:answer="answers[no - 1]"
          ></quiz-question>
        </el-col>

        <el-col>
          <quiz-progress-indicator
            :num="no"
            :num-count="config?.question_displayed"
          ></quiz-progress-indicator>
        </el-col>

        <el-col>
          <quiz-timer-indicator v-if="useQuestionTimer"></quiz-timer-indicator>
          <quiz-timer-indicator v-if="useQuizTimer"></quiz-timer-indicator>
        </el-col>
        <el-col>
          <quiz-navigation
            :disable-next="no >= (config?.question_displayed as number)"
            :disable-prev="no <= 1"
            :show-finish="no == (config?.question_displayed as number)"
            @click:next="no++"
            @click:prev="no--"
            @click:finish="finishQuiz"
          ></quiz-navigation>
        </el-col>
      </el-row>
    </el-col>
  </el-row>

  <el-dialog
    v-model="finishDialog"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="80%"
  >
    <el-space fill style="width: 100%">
      <h1 align="center" style="margin-bottom: 16px; word-break: normal">
        <template v-if="timesUp"> Time is up. Finish the Quiz! </template>
        <template v-else> Are you sure to finish this quiz? </template>
      </h1>
    </el-space>
    <el-space style="width: 100%; justify-content: center">
      <el-button
        v-if="!timesUp"
        :disabled="isLoading"
        size="large"
        @click="cancelFinish()"
        >Cancel</el-button
      >
      <el-button
        :loading="isLoading"
        type="primary"
        size="large"
        @click="confirmFinishQuiz()"
        >Finish</el-button
      >
    </el-space>
  </el-dialog>

  <el-drawer
    v-if="config?.timer_mode != TimerMode['Question timer']"
    v-model="QuestionDrawer"
    direction="btt"
    :show-close="false"
    :withHeader="false"
  >
    <el-space :size="8" wrap style="justify-content: center">
      <el-button
        v-for="i in config?.question_displayed"
        :key="i"
        style="width: 3rem"
        @click="goTo(i)"
      >
        {{ i }}
      </el-button>
    </el-space>
  </el-drawer>
</template>
