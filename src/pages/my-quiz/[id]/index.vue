<route lang="yaml">
name: edit-quiz-detail
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { getQuiz, setQuiz } from '~/apps/quiz/quiz.repositories'
  import type { CreateQuizPayload } from '~/apps/quiz/quiz.types'
  import QuizForm from '../../../components/quiz/quiz-form.vue'

  const route = useRoute()

  const quizUpdate = ref<CreateQuizPayload>()
  const isDisabled = ref<boolean>(true)

  const { data: quiz, isFetching: getQuizLoading } = useQuery({
    refetchOnWindowFocus: false,
    queryFn: () => getQuiz(route.params.id as string),
    onSuccess(data) {
      quizUpdate.value = {
        title: data.title,
        topic: data.topic,
        grade: data.grade,
        level: data.level,
      }
    },
  })

  const { mutate, isLoading: setQuizLoading } = useMutation({
    mutationFn: (payload: CreateQuizPayload) =>
      setQuiz(route.params.id as string, payload),
    onSuccess: () => {
      isDisabled.value = true
      ElMessage.success('Quiz updated successfully.')
    },
  })

  function handleSubmit() {
    if (quizUpdate.value) mutate(quizUpdate.value)
  }
</script>

<template>
  <el-row>
    <el-col>
      <el-card v-loading="getQuizLoading || setQuizLoading">
        <h3 style="margin-bottom: 16px">Data</h3>

        <quiz-form
          v-model:data="quizUpdate"
          :disabled="isDisabled"
          hide-submit
        />

        <el-space :size="16">
          <el-button
            v-if="isDisabled"
            type="primary"
            @click="isDisabled = false"
            >Edit</el-button
          >
          <template v-else>
            <el-button @click="isDisabled = true">Cancel</el-button>
            <el-button type="primary" @click="handleSubmit">Update</el-button>
          </template>
        </el-space>
      </el-card>
    </el-col>
  </el-row>
</template>
