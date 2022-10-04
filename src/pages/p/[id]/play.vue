<route lang="yaml">
name: preview-quiz-play
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
  import {
    QuestionMode,
    type ChoicesQuestion,
  } from '~/apps/question/question.types'
  import { getQuizData, useQuizStore } from '~/apps/quiz/quiz.repositories'
  import { QuizLevel, QuizStatus } from '~/apps/quiz/quiz.schemes'
  import {
    addResultPreview,
    setResultPreview as __setResult,
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

  const answers = ref<(string | null)[]>([])
  const counter = ref<number>(1)
  const finishDialog = ref<boolean>(false)
  const no = ref<number>(1)
  const QuestionDrawer = ref<boolean>(false)
  const result = ref<Result>()
  const step = ref<1 | 2 | 3>(1)
  const timeElapsed = ref<number>(0)
  const timeInterval = ref()

  const questionTimer = ref()
  const quizTimer = ref()

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
    return questions.value[no.value - 1] as ChoicesQuestion
  })

  const answersPayload = computed(() => {
    return questions.value?.map((question, index) => {
      return {
        answer: answers.value[index] ?? null,
        ...getQuestion(question as ChoicesQuestion),
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

  const {
    data: quizData,
    isFetching: loading,
    refetch: fetchQuizData,
  } = useQuery({
    queryKey: ['quiz-data'],
    queryFn: () =>
      getQuizData(route.params.id as string).then((quiz) => {
        if (quiz.author.uid != user.value?.uid)
          throw new Error('bad_request: permission_denied')
        if (quiz.status != QuizStatus.Draft)
          throw new Error('bad_request: status_not_draft')
        return quiz
      }),
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    onError: (e: Error) => {
      ElMessage.error(e.message)
      router.push('/')
    },
  })

  const { mutateAsync: createResult } = useMutation({
    mutationFn: () => addResultPreview(),
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

  function startCountdown() {
    step.value = 2
    counter.value = 3
    timeInterval.value = setInterval(() => {
      if (--counter.value == 0) {
        clearInterval(timeInterval.value)
        timeInterval.value = undefined
        startQuiz()
      }
    }, 1000)
  }

  async function startQuiz() {
    if (quizData.value == undefined) throw new Error('quiz_is_undefined')

    const duration = quizData.value.max_duration
    step.value = 3
    timeInterval.value = setInterval(() => {
      if (++timeElapsed.value == duration) {
        clearInterval(timeInterval.value)
        timeInterval.value = undefined
        finishQuiz()
        endQuiz()
      }
    }, 1000)

    await nextTick()
    result.value = await createResult()

    startQuestionTimer()
    startQuizTimer(duration)
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
    router.push({ name: 'preview-quiz-review' })
  }

  async function endQuiz() {
    if (answersPayload.value == undefined)
      return ElMessage.error('some_question_or_answer_is_invalid')
    await setResult(answersPayload.value)
  }

  onMounted(() => {
    fetchQuizData.value()
  })
</script>

<template>
  {{ quizData?.max_duration }}
  <el-row style="padding: 20px 0; min-height: 100vh; flex-direction: column">
    <el-col v-if="loading" style="margin: auto 0">
      <el-progress
        :percentage="80"
        indeterminate
        :show-text="false"
      ></el-progress>
    </el-col>
    <template v-else-if="!timesUp">
      <!-- preparation -->
      <el-col v-if="step == 1" style="margin: auto 0">
        <el-space fill wrap style="width: 100%">
          <h1 align="center">{{ quizData?.title }}</h1>
          <ul
            style="
              color: var(--el-text-color-regular);
              text-align: center;
              margin-bottom: 20px;
            "
          >
            <li>
              dificulty_level:
              {{
                quizData?.level != undefined ? QuizLevel[quizData?.level] : ''
              }}
            </li>
            <li>question_total: {{ config?.question_displayed }}</li>
            <li>
              timer_mode:
              {{ config?.timer_mode ? TimerMode[config?.timer_mode] : '' }}
            </li>
            <li>
              quiz_duration:
              {{ quizData?.max_duration ?? 0 }} seconds
            </li>
          </ul>

          <p align="center">
            <strong><em> Are you ready? </em></strong>
          </p>
          <el-row justify="center">
            <el-button type="primary" size="large" @click="startCountdown"
              >READY</el-button
            >
          </el-row>
        </el-space>
      </el-col>

      <!-- counter -->
      <el-col v-if="step == 2" style="margin: auto 0">
        <el-space fill wrap style="width: 100%">
          <p align="center">
            <em>We will getting started in:</em>
          </p>
          <p align="center" style="font-size: 48px">
            <strong>{{ counter }}</strong>
          </p>
        </el-space>
      </el-col>

      <!-- quiz -->
      <template v-if="step == 3">
        <!-- question area -->
        <el-col style="margin: auto 0">
          <el-row>
            <el-col>
              <p align="center">
                <el-tooltip placement="auto" content="Mark an do it later.">
                  <el-button circle size="large">
                    <strong>{{ no }}</strong>
                  </el-button>
                </el-tooltip>
              </p>
            </el-col>
            <template
              v-if="
                question != undefined && question?.mode == QuestionMode.Choices
              "
            >
              <el-col>
                <p align="center">
                  <strong>{{ question.question }}</strong>
                </p>
              </el-col>
              <el-col>
                <el-space fill style="width: 100%">
                  <el-button
                    v-for="option in question.choices ?? []"
                    :type="
                      option.text == answers[no - 1] ? 'primary' : 'default'
                    "
                    :key="option.text"
                    size="large"
                    @click="setAnswer(option.text)"
                    >{{ option.text }}</el-button
                  >
                </el-space>
              </el-col>
            </template>
          </el-row>
        </el-col>

        <el-col>
          <el-space fill style="width: 100%">
            <el-row justify="space-between">
              <p>
                <strong>{{ no }}</strong
                ><span
                  style="
                    color: var(--el-text-color-secondary);
                    font-size: var(--el-font-size-extra-small);
                  "
                  >/{{ config?.question_displayed }}</span
                >
              </p>
              <p>- {{ timeLeftFormated }}</p>
            </el-row>
            <div
              v-if="useQuestionTimer"
              style="
                height: 6px;
                background-color: var(--el-fill-color);
                border-radius: 3px;
              "
            >
              <div
                ref="questionTimer"
                style="
                  border-radius: 3px;
                  height: 100%;
                  background-color: var(--el-color-primary);
                  width: 0%;
                "
              ></div>
            </div>
            <div
              v-if="useQuizTimer"
              style="
                height: 6px;
                background-color: var(--el-fill-color);
                border-radius: 3px;
              "
            >
              <div
                ref="quizTimer"
                style="
                  border-radius: 3px;
                  height: 100%;
                  background-color: var(--el-color-primary);
                  width: 0%;
                "
              ></div>
            </div>
          </el-space>
        </el-col>

        <el-col
          v-if="config?.timer_mode != TimerMode['Question timer']"
          style="position: sticky; bottom: 0"
        >
          <el-row>
            <el-col
              v-for="nav in navs"
              :key="nav.key"
              :span="24 / navs.length"
              style="text-align: center; margin: 0"
            >
              <el-tooltip placement="auto" :content="nav.title">
                <el-button
                  :disabled="!!nav?.disabled ? nav?.disabled() : false"
                  size="large"
                  :type="nav.type"
                  circle
                  :icon="nav.icon"
                  @click="nav.onClick"
                />
              </el-tooltip>
            </el-col>
          </el-row>
        </el-col>
      </template>
    </template>
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
