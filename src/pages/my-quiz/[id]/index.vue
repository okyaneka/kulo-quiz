<route lang="yaml">
name: edit-quiz
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useQuizStore } from '~/apps/quiz/quiz.repositories'
  import QuizForm from '../../../components/quiz/quiz-form.vue'

  defineProps<{
    disabled?: boolean
  }>()

  const { quiz } = storeToRefs(useQuizStore())
</script>

<template>
  <el-card>
    <h3 style="margin-bottom: 16px">Data</h3>

    <quiz-form
      v-if="quiz != undefined"
      v-model:data="quiz"
      :disabled="disabled"
      hide-submit
    />
  </el-card>
</template>
