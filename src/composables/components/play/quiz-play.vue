<script setup lang="ts">
  import type { Config } from '~/apps/config/config.types'
  import {
    QuestionMode,
    type ChoicesQuestion,
  } from '~/apps/question/question.types'
  import { useQuizStore } from '~/apps/quiz/quiz.repositories'
  import type { Quiz, QuizData } from '~/apps/quiz/quiz.types'
  import type {
    AnswerPayload,
    AnswersPayload,
    ChoicesAnswerAnswerPayload,
    Result,
  } from '~/apps/results/results.types'
  import type QuizTimerIndicator from '../quiz/quiz-timer-indicator.vue'

  const props = defineProps<{
    loading: boolean
    submitLoading: boolean
    quiz?: QuizData
    answers: Partial<AnswersPayload>[]
  }>()

  const emit = defineEmits<{
    (e: 'update:answers', value: Partial<AnswersPayload>[]): void
    (e: 'started:quiz', value: Quiz): Promise<void>
    (e: 'ended:quiz', value: AnswersPayload[]): void
  }>()

  const quizTimer = ref<InstanceType<typeof QuizTimerIndicator> | null>(null)
  const questionTimer = ref<InstanceType<typeof QuizTimerIndicator> | null>(
    null
  )

  const { getQuestion } = useQuizStore()

  const answers = reactive<(number | null)[]>([])
  const num = ref(1)
  const showFinishDialog = ref(false)
  const showQuestionDrawer = ref(false)
  const hideContent = ref(false)
  const step = ref<1 | 2 | 3>(1)
  const result = ref<Result>()

  const config = computed(() => props.quiz?.config as Config)

  const question = computed(() => props.quiz?.questions[num.value - 1])

  // time used
  const questionTimeUsed = ref<number>(0)
  const quizTimeUsed = ref<number>(0)

  const quizDuration = computed<number>(
    () =>
      (useQuizTimer.value ? props.quiz?.max_duration : question.value?.timer) ??
      0
  )

  const timeUsed = computed<number>(() =>
    useQuizTimer.value ? quizTimeUsed.value : questionTimeUsed.value
  )

  const useQuestionTimer = computed<boolean>(
    () => config.value != undefined && [1, 2].includes(config.value.timer_mode)
  )

  const useQuizTimer = computed<boolean>(
    () => config.value != undefined && [0, 2].includes(config.value.timer_mode)
  )

  async function nextStep() {
    if (props.quiz == undefined) throw new Error('quiz_undefined')
    if (step.value + 1 == 3) await emit('started:quiz', props.quiz)
    if (step.value++) {
      await nextTick()
      if (useQuizTimer.value) quizTimer.value?.start()
      if (useQuestionTimer.value) questionTimer.value?.start()
    }
  }

  function endQuestion() {
    if (num.value == config.value.question_displayed) {
      if (config.value.timer_mode == 2) selectQuestion(1)
      else timeEnded()
    } else nextQuestion()
  }

  async function timeEnded() {
    emit('ended:quiz', props.answers as AnswersPayload[])
    hideContent.value = true
    showFinishDialog.value = true
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

  function finishQuiz() {
    showFinishDialog.value = true
  }

  function cancelFinish() {
    showFinishDialog.value = false
  }

  async function confirmFinishQuiz() {
    emit('ended:quiz', props.answers as AnswersPayload[])
  }

  watch(answers, (value) => {
    if (props.quiz == undefined) throw new Error('quiz_undefined')
    const answersPayload = props.quiz.questions.map((question, index) => {
      if (question.mode == QuestionMode.Choices) {
        const q = question as ChoicesQuestion
        return {
          answer: q.choices.find((v) => v.key == value[index]) ?? null,
          ...getQuestion(q),
        } as ChoicesAnswerAnswerPayload
      }
      return { answer: null, ...getQuestion(question) } as AnswerPayload
    })
    emit('update:answers', answersPayload)
  })

  defineExpose({ result })
</script>

<template>
  <el-col v-if="loading" style="margin: auto 20px">
    <el-progress
      :percentage="80"
      indeterminate
      :show-text="false"
    ></el-progress>
  </el-col>

  <template v-else-if="!hideContent && config != undefined">
    <el-col v-if="step == 1" style="margin: auto 20px">
      <quiz-summary
        :title="quiz?.title"
        :level="quiz?.level"
        :question-displayed="config.question_displayed"
        :timer-mode="config.timer_mode"
        :max-duration="quiz?.max_duration"
        @click:ready="nextStep"
      ></quiz-summary>
    </el-col>

    <!-- counter -->
    <el-col v-if="step == 2" style="margin: auto 20px">
      <quiz-counter @end="nextStep"></quiz-counter>
    </el-col>

    <!-- quiz -->
    <template v-if="step == 3">
      <el-col style="margin: auto 20px 0">
        <p align="center">
          <el-button circle size="large">
            <strong>{{ num }}</strong>
          </el-button>
        </p>
      </el-col>

      <el-col style="margin: 20px 20px auto">
        <quiz-question
          :question="question"
          v-model:answer="answers[num - 1]"
        ></quiz-question>
      </el-col>

      <el-col style="position: sticky; bottom: 0">
        <el-card shadow="never">
          <quiz-progress-indicator
            :num="num"
            :num-count="config.question_displayed"
            :duration="quizDuration"
            :time-used="timeUsed"
          ></quiz-progress-indicator>

          <!-- question timer -->
          <quiz-timer-indicator
            v-if="useQuestionTimer"
            ref="questionTimer"
            v-model:time-used="questionTimeUsed"
            :duration="question?.timer"
            @end="endQuestion"
          ></quiz-timer-indicator>

          <!-- quiz timer -->
          <quiz-timer-indicator
            v-if="useQuizTimer"
            ref="quizTimer"
            v-model:time-used="quizTimeUsed"
            :duration="quiz?.max_duration"
            @end="timeEnded"
          ></quiz-timer-indicator>
          <quiz-navigation
            :disable-next="num >= (config.question_displayed as number)"
            :disable-prev="num <= 1"
            :show-finish="num == (config.question_displayed as number)"
            @click:next="nextQuestion"
            @click:prev="prevQuestion"
            @click:finish="finishQuiz"
            @click:other="showQuestionDrawer = true"
          ></quiz-navigation>
        </el-card>
      </el-col>
    </template>
  </template>

  <quiz-finish-dialog
    v-model="showFinishDialog"
    :times-up="hideContent"
    :loading="submitLoading"
    @click:cancel="cancelFinish"
    @click:confirm="confirmFinishQuiz"
  ></quiz-finish-dialog>

  <quiz-question-drawer
    v-if="useQuizTimer"
    v-model="showQuestionDrawer"
    :num="num"
    :num-count="config.question_displayed"
    @click:num="selectQuestion"
  ></quiz-question-drawer>
</template>
