<script setup lang="ts">
  import type { ChoicesQuestion } from '~/apps/question/question.types'

  defineProps<{
    question: ChoicesQuestion
    answer: number | null
  }>()

  const emit = defineEmits<{
    (e: 'update:answer', value: number): void
  }>()

  function selectAnswer(value: number) {
    const activeElement = document.activeElement as HTMLElement
    activeElement.blur()
    emit('update:answer', value)
  }
</script>

<template>
  <el-space fill style="width: 100%">
    <p align="center">
      <strong>{{ question.question }}</strong>
    </p>
    <el-button
      v-for="option in question.choices ?? []"
      :type="option.key == answer ? 'primary' : 'default'"
      :key="option.key"
      size="large"
      @click="selectAnswer(option.key)"
      >{{ option.text }}</el-button
    >
  </el-space>
</template>
