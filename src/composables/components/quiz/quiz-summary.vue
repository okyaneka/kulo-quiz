<script setup lang="ts">
  import { TimerMode } from '~/apps/config/config.types'
  import { QuizLevel, QuizGrade } from '~/apps/quiz/quiz.types'
  import { durationHumanized } from '~/composables/helpers'

  const props = defineProps<{
    title: string
    level: QuizLevel
    grade: QuizGrade
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
      <p align="center">Jenjang: {{ QuizGrade[grade] }}</p>
      <p align="center">Kesulitan: {{ QuizLevel[level] }}</p>
      <p align="center">Total Pertanyaan: {{ questionDisplayed }}</p>
      <p align="center">Mode Pewaktu: {{ TimerMode[timerMode] }}</p>
      <p align="center">
        Durasi Kuis: {{ durationHumanized(props.maxDuration) }}
      </p>
    </div>

    <p align="center">
      <strong><em> Kamu sudah siap? </em></strong>
    </p>
    <el-row justify="center">
      <el-button type="primary" size="large" @click="$emit('click:ready')"
        >SIAP</el-button
      >
    </el-row>

    <slot name="footer"></slot>
  </el-space>
</template>
