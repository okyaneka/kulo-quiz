<script setup lang="ts">
  defineProps<{
    title: string
    level: string
    questionDisplayed: number
    timerMode: string
    maxDuration: number
  }>()

  defineEmits<{
    (e: 'click:ready'): void
  }>()
</script>

<template>
  <el-space fill wrap style="width: 100%">
    <h1 align="center">{{ title }}</h1>
    <ul
      style="
        color: var(--el-text-color-regular);
        text-align: center;
        margin-bottom: 20px;
      "
    >
      <li>dificulty_level: {{ level }}</li>
      <li>question_total: {{ questionDisplayed }}</li>
      <li>timer_mode: {{ timerMode }}</li>
      <li>quiz_duration: {{ maxDuration }} seconds</li>
    </ul>

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
