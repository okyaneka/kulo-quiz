<script setup lang="ts">
  import type { ChoicesQuestion } from '~/apps/question/question.types'

  defineProps<{
    question: ChoicesQuestion
    answer: null | string
  }>()

  defineEmits<{
    (e: 'update:answer', value: string): void
  }>()
</script>

<template>
  <el-space fill style="width: 100%">
    <p align="center">
      <strong>{{ question.question }}</strong>
    </p>
    <el-button
      v-for="option in question.choices ?? []"
      :type="option.text == answer ? 'primary' : 'default'"
      :key="option.text"
      size="large"
      @click="$emit('update:answer', option.text)"
      >{{ option.text }}</el-button
    >
  </el-space>
</template>
