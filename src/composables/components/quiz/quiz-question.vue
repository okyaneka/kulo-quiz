<script setup lang="ts">
  import {
    QuestionMode,
    type ChoicesQuestion,
    type Questions,
  } from '~/apps/question/question.types'

  defineProps<{
    question?: Questions
    answer: number | null
  }>()

  defineEmits<{
    (e: 'update:answer', value: number): void
  }>()
</script>

<template>
  <el-row v-if="question != undefined">
    <el-col v-if="question.guide">
      <p align="center">
        {{ question.guide }}
      </p>
    </el-col>
    <el-col>
      <question-choices-mode
        v-if="question.mode == QuestionMode.Choices"
        :question="(question as ChoicesQuestion)"
        :answer="answer"
        @update:answer="$emit('update:answer', $event)"
      >
      </question-choices-mode>
    </el-col>
  </el-row>
</template>
