<script setup lang="ts">
  import {
    QuestionMode,
    type ChoicesQuestion,
    type Questions,
  } from '~/apps/question/question.types'
  import ChoiceQuizQuestion from './question-mode/choice-quiz-question.vue'

  defineProps<{
    question?: Questions
    answer: null | string
  }>()

  defineEmits<{
    (e: 'update:answer', value: string): void
  }>()
</script>

<template>
  <el-row v-if="question != undefined">
    <el-col>
      <choice-quiz-question
        v-if="question.mode == QuestionMode.Choices"
        :question="(question as ChoicesQuestion)"
        :answer="answer"
        @update:answer="$emit('update:answer', $event)"
      >
      </choice-quiz-question>
    </el-col>
  </el-row>
</template>
