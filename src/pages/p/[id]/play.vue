<route lang="yaml">
name: preview-quiz-play
meta:
  requireAuth: true
</route>

<script setup lang="ts">
  import { TimerMode, type Config } from '~/apps/config/config.types'
  import {
    QuestionMode,
    type ChoicesQuestion,
  } from '~/apps/question/question.types'
  import { getQuizData, useQuizStore } from '~/apps/quiz/quiz.repositories'
  import { QuizLevel } from '~/apps/quiz/quiz.schemes'
  import {
    addResultPreview,
    setResultPreview as __setResult,
  } from '~/apps/results/results.repositories'
  import type {
    AnswerPayload,
    ChoicesAnswerAnswerPayload,
    Result,
  } from '~/apps/results/results.types'
  import type QuizTimerIndicator from '~/composables/components/quiz/quiz-timer-indicator.vue'

  const quizTimer = ref<InstanceType<typeof QuizTimerIndicator> | null>(null)
  const questionTimer = ref<InstanceType<typeof QuizTimerIndicator> | null>(
    null
  )

  const route = useRoute()
  const router = useRouter()
  const { getQuestion } = useQuizStore()

  const step = ref<1 | 2 | 3>(2)
  const showFinishDialog = ref<boolean>(false)
  const showQuestionDrawer = ref<boolean>(false)
  const num = ref<number>(1)
  const result = ref<Result>()
  const answers = ref<(number | null)[]>([])
  const timesUp = ref(false)

  // time used
  const questionTimeUsed = ref<number>(0)
  const quizTimeUsed = ref<number>(0)

  const quizDuration = computed<number>(
    () =>
      (useQuizTimer.value
        ? quizData.value?.max_duration
        : question.value?.timer) ?? 0
  )

  const timeUsed = computed<number>(() =>
    useQuizTimer.value ? quizTimeUsed.value : questionTimeUsed.value
  )

  const config = computed(() => quizData.value?.config as Config)
  const questions = computed(() => quizData.value?.questions)

  const useQuestionTimer = computed<boolean>(
    () => config.value != undefined && [1, 2].includes(config.value.timer_mode)
  )

  const useQuizTimer = computed<boolean>(
    () => config.value != undefined && [0, 2].includes(config.value.timer_mode)
  )

  const question = computed(() => {
    if (questions.value == undefined) return undefined
    return questions.value[num.value - 1]
  })

  const {
    data: quizData,
    isFetching: loading,
    refetch: fetchQuizData,
  } = useQuery({
    queryKey: ['quiz-data'],
    queryFn: () => getQuizData(route.params.id as string),
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

  function nextStep() {
    switch (++step.value) {
      case 3:
        startQuiz()
        break

      default:
        break
    }
  }

  async function startQuiz() {
    result.value = await createResult()
    await nextTick()
    if (useQuizTimer.value) quizTimer.value?.start()
    if (useQuestionTimer.value) questionTimer.value?.start()
  }

  function nextQuestion() {
    if (num.value < config.value.question_displayed)
      selectQuestion(num.value + 1)
  }

  function prevQuestion() {
    if (num.value >= 1) selectQuestion(num.value - 1)
  }

  async function selectQuestion(_num: number) {
    num.value = _num
    questionTimer.value?.start()
  }

  function endQuestion() {
    if (num.value == config.value.question_displayed) {
      if (config.value.timer_mode == 2) selectQuestion(1)
      else endQuiz()
    } else nextQuestion()
  }

  async function endQuiz() {
    timesUp.value = true
    showFinishDialog.value = true
    await setAnswer()
  }

  function finishQuiz() {
    showFinishDialog.value = true
  }

  function cancelFinish() {
    showFinishDialog.value = false
  }

  async function confirmFinishQuiz() {
    await setAnswer()
    router.push({ name: 'preview-quiz-review' })
  }

  async function setAnswer() {
    if (questions.value != undefined) {
      const answersPayload = questions.value.map((question, index) => {
        if (question.mode == QuestionMode.Choices) {
          const q = question as ChoicesQuestion
          return {
            answer:
              q.choices.find((v) => v.key == answers.value[index]) ?? null,
            ...getQuestion(q),
          } as ChoicesAnswerAnswerPayload
        }
        return { answer: null, ...getQuestion(question) }
      })

      await setResult(answersPayload)
    }
  }

  onMounted(() => {
    fetchQuizData.value()
  })
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

    <template
      v-else-if="
        quizData != undefined &&
        config != undefined &&
        question != undefined &&
        !timesUp
      "
    >
      <el-col v-if="step == 1" style="margin: auto 0">
        <quiz-summary
          :title="quizData.title"
          :level="quizData.level ? QuizLevel[quizData.level] : ''"
          :question-displayed="config.question_displayed"
          :timer-mode="TimerMode[config.timer_mode]"
          :max-duration="quizData.max_duration"
          @click:ready="nextStep"
        ></quiz-summary>
      </el-col>

      <!-- counter -->
      <el-col v-if="step == 2" style="margin: auto 0">
        <quiz-counter @end="nextStep"></quiz-counter>
      </el-col>

      <!-- quiz -->
      <template v-if="step == 3">
        <el-col style="margin-top: auto">
          <p align="center">
            <el-button circle size="large">
              <strong>{{ num }}</strong>
            </el-button>
          </p>
        </el-col>

        <el-col style="margin-bottom: auto">
          <quiz-question
            :question="question"
            v-model:answer="answers[num - 1]"
          ></quiz-question>
        </el-col>

        <el-col>
          <quiz-progress-indicator
            :num="num"
            :num-count="config.question_displayed"
            :duration="quizDuration"
            :time-used="timeUsed"
          ></quiz-progress-indicator>
        </el-col>

        <el-col>
          <!-- question timer -->
          <quiz-timer-indicator
            v-if="useQuestionTimer"
            ref="questionTimer"
            v-model:time-used="questionTimeUsed"
            :duration="question.timer"
            @end="endQuestion"
          ></quiz-timer-indicator>

          <!-- quiz timer -->
          <quiz-timer-indicator
            v-if="useQuizTimer"
            ref="quizTimer"
            v-model:time-used="quizTimeUsed"
            :duration="quizData.max_duration"
            @end="endQuiz"
          ></quiz-timer-indicator>
        </el-col>

        <el-col style="position: sticky; bottom: 0">
          <quiz-navigation
            :disable-next="num >= (config.question_displayed as number)"
            :disable-prev="num <= 1"
            :show-finish="num == (config.question_displayed as number)"
            @click:next="nextQuestion"
            @click:prev="prevQuestion"
            @click:finish="finishQuiz"
            @click:other="showQuestionDrawer = true"
          ></quiz-navigation>
        </el-col>
      </template>
    </template>
  </el-row>

  <quiz-finish-dialog
    v-model="showFinishDialog"
    :times-up="timesUp"
    :loading="isLoading"
    @click:cancel="cancelFinish()"
    @click:confirm="confirmFinishQuiz()"
  ></quiz-finish-dialog>

  <quiz-question-drawer
    v-if="useQuizTimer"
    v-model="showQuestionDrawer"
    :num="num"
    :num-count="config.question_displayed"
    @click:num="selectQuestion"
  ></quiz-question-drawer>
</template>
