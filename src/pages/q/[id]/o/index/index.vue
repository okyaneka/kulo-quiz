<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useQuizStore } from '~/apps/quiz/quiz.repositories'

  defineProps<{
    disabled?: boolean
  }>()

  const { quiz } = storeToRefs(useQuizStore())
</script>

<template>
  <h3 style="margin-bottom: 16px">Data</h3>

  <quiz-form
    v-if="quiz != undefined"
    v-model:data="quiz"
    :disabled="disabled"
    hide-submit
  />
</template>
