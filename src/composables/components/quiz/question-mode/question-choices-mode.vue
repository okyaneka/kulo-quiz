<script setup lang="ts">
  import type { ChoicesQuestion } from '~/apps/question/question.types'

  const props = defineProps<{
    question: ChoicesQuestion
    answer: number | null
  }>()

  const emit = defineEmits<{
    (e: 'update:answer', value: number): void
  }>()

  const randomizeChoices = computed(() => {
    const choices = props.question.choices.slice()
    const randomizeChoices = []
    while (choices.length > 0) {
      randomizeChoices.push(
        ...choices.splice(Math.floor(Math.random() * choices.length), 1)
      )
    }
    return randomizeChoices
  })

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
      v-for="option in randomizeChoices ?? []"
      :type="option.key == answer ? 'primary' : 'default'"
      :key="option.key"
      size="large"
      @click="selectAnswer(option.key)"
      >{{ option.text }}</el-button
    >
  </el-space>
</template>
