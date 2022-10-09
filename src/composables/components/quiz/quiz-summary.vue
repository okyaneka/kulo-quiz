<script setup lang="ts">
  import { TimerMode } from '~/apps/config/config.types'
  import { QuizLevel } from '~/apps/quiz/quiz.schemes'
  import { durationHumanized } from '~/composables/helpers'

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
</script>

<template>
  <el-space fill wrap style="width: 100%">
    <h1 align="center">{{ title }}</h1>

    <div class="text-wrapper" style="margin: 8px">
      <p align="center">dificulty_level: {{ QuizLevel[level] }}</p>
      <p align="center">question_total: {{ questionDisplayed }}</p>
      <p align="center">timer_mode: {{ TimerMode[timerMode] }}</p>
      <p align="center">
        quiz_duration: {{ durationHumanized(props.maxDuration) }}
      </p>
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
