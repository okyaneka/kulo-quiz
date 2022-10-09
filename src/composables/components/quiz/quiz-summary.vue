<script setup lang="ts">
  import { TimerMode, Units } from '~/apps/config/config.types'
  import { QuizLevel } from '~/apps/quiz/quiz.schemes'

  const props = defineProps<{
    title: string
    level: QuizLevel
    questionDisplayed: number
    timerMode: TimerMode
    maxDuration: number
  }>()

  defineEmits<{
    (e: 'click:ready'): void
  }>()

  const durationHumanized = computed(() => {
    let text = ''
    const maxDuration = props.maxDuration - 123
    if (maxDuration / 60 > 60) {
      const hours = Math.floor(maxDuration / 36e2)
      text += hours + ' ' + Units[2] + ' '
    }

    if (maxDuration % 36e2 >= 60) {
      const minutes = Math.floor((maxDuration % 36e2) / 60)
      text += minutes + ' ' + Units[1] + ' '
    } else if (maxDuration % 36e2 == 0) text += 60 + ' ' + Units[1] + ' '

    if (maxDuration % 60 != 0) {
      const seconds = maxDuration % 60
      text += seconds + ' ' + Units[0] + ' '
    }

    return text.trim()
  })
</script>

<template>
  <el-space fill wrap style="width: 100%">
    <h1 align="center">{{ title }}</h1>

    <div class="text-wrapper" style="margin: 8px">
      <p align="center">dificulty_level: {{ QuizLevel[level] }}</p>
      <p align="center">question_total: {{ questionDisplayed }}</p>
      <p align="center">timer_mode: {{ TimerMode[timerMode] }}</p>
      <p align="center">quiz_duration: {{ durationHumanized }}</p>
    </div>

    <p align="center">
      <strong><em> Are you ready? </em></strong>
    </p>
    <el-row justify="center">
      <el-button type="primary" size="large" @click="$emit('click:ready')"
        >READY</el-button
      >
    </el-row>
  </el-space>
</template>
