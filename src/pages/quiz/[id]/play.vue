<route lang="yaml">
name: quiz-play
meta:
  requireAuth: true
</route>

<script setup lang="ts">
  import {
    DArrowLeft,
    DArrowRight,
    Grid,
    SuccessFilled,
  } from '@element-plus/icons-vue'
  import type { Component } from 'vue'

  interface QuestionNav {
    key: string
    type: '' | 'primary'
    title: string
    icon: Component
    disabled?: () => boolean
    onClick?: () => void
  }

  const router = useRouter()

  /**
   * 1 = preparation
   * 2 = countdown
   * 3 = quiz time
   * 4 = done and recap
   */
  const step = ref<1 | 2 | 3 | 4>(3)
  const counter = ref<number>(1)
  const timeInterval = ref<any>()
  const no = ref<number>(1)
  const QuestionDrawer = ref<boolean>(false)
  const finishDialog = ref<boolean>(false)
  const timeDuration: number = 5 * 60
  const timeElapsed = ref<number>(0)
  const selectedAnswer = ref<number>()
  const navs = ref<QuestionNav[]>([
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
      onClick: gotoQuestion,
    },
    {
      key: 'next',
      type: 'primary',
      disabled: (): boolean => no.value == 50,
      icon: DArrowRight,
      title: 'Next Question',
      onClick: nextQuestion,
    },
    {
      key: 'finish',
      type: '',
      icon: SuccessFilled,
      title: 'Finish the Quiz',
      onClick: finishQuestion,
    },
  ])

  const timeLeftFormatted = computed(() => {
    const time = Math.round(timeDuration - timeElapsed.value)
    const sec = time % 60
    const min = Math.floor(time / 60)
    return `${min.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`
  })

  const timerStatus = computed(() => {
    const timeElapsedPercent = (timeElapsed.value / timeDuration) * 100
    if (timeElapsedPercent < 75) {
      return 'success'
    }
    if (timeElapsedPercent < 85) {
      return 'warning'
    }
    return 'exception'
  })

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

  function startQuiz() {
    step.value = 3
    timeInterval.value = setInterval(() => {
      timeElapsed.value += 1 / 100
    }, 10)
  }

  function prevQuestion() {
    no.value--
  }

  function gotoQuestion() {
    QuestionDrawer.value = true
  }

  function nextQuestion() {
    no.value++
  }
  function finishQuestion() {
    finishDialog.value = true
  }
  function confirmFinishQuestion() {
    router.push({ name: 'quiz-review' })
  }
</script>

<template>
  <el-row style="padding: 20px 0; min-height: 100vh; flex-direction: column">
    <!-- preparation -->
    <el-col v-if="step == 1" style="margin: auto 0">
      <el-space fill wrap style="width: 100%">
        <h1 align="center">Quiz panjat sosial</h1>
        <ul
          style="
            color: var(--el-text-color-regular);
            text-align: center;
            margin-bottom: 20px;
          "
        >
          <li>Dificulty Level: Easy</li>
          <li>Question Total: 50</li>
          <li>Quiz Duration: 60 minutes</li>
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
          <el-col>
            <p align="center">
              <strong>Apa itu?</strong>
            </p>
          </el-col>
          <el-col>
            <el-space fill style="width: 100%">
              <el-button
                v-for="i in 4"
                :type="i == selectedAnswer ? 'primary' : 'default'"
                :key="i"
                size="large"
                @click="selectedAnswer = selectedAnswer == i ? undefined : i"
                >a {{ i }}</el-button
              >
            </el-space>
          </el-col>
        </el-row>
      </el-col>

      <el-col>
        <el-space fill style="width: 100%">
          <el-row justify="space-between">
            <p>
              <strong>0</strong
              ><span
                style="
                  color: var(--el-text-color-secondary);
                  font-size: var(--el-font-size-extra-small);
                "
                >/50</span
              >
            </p>
            <p>- {{ timeLeftFormatted }}</p>
          </el-row>
          <el-progress
            :status="timerStatus"
            :percentage="(timeElapsed / timeDuration) * 100"
            :show-text="false"
          />
        </el-space>
      </el-col>

      <el-col style="position: sticky; bottom: 0">
        <el-row>
          <el-col
            v-for="nav in navs"
            :key="nav.key"
            :span="24 / navs.length"
            style="text-align: center; margin-top: 0"
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
  </el-row>

  <el-dialog v-model="finishDialog" :show-close="false" width="80%">
    <el-space fill style="width: 100%">
      <h1 align="center" style="margin-bottom: 16px; word-break: normal">
        Are you sure to finish this quiz?
      </h1>
    </el-space>
    <el-space style="width: 100%; justify-content: center">
      <el-button size="large" @click="finishDialog = false">Cancel</el-button>
      <el-button type="primary" size="large" @click="confirmFinishQuestion"
        >Finish</el-button
      >
    </el-space>
  </el-dialog>

  <el-drawer
    v-model="QuestionDrawer"
    direction="btt"
    :show-close="false"
    :withHeader="false"
  >
    <el-space :size="8" wrap style="justify-content: center">
      <el-button
        v-for="i in 50"
        :key="i"
        style="width: 3rem"
        @click=";(QuestionDrawer = false), (no = i)"
      >
        {{ i }}
      </el-button>
    </el-space>
  </el-drawer>
</template>
