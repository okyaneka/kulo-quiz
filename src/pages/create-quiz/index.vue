<route lang="yaml">
name: create-quiz
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { addQuiz } from '~/apps/quiz/quiz.repositories'
  import { QuizStatus } from '~/apps/quiz/quiz.schemes'
  import type { QuizPayload } from '~/apps/quiz/quiz.types'
  import QuizForm from '../../components/quiz/quiz-form.vue'

  const router = useRouter()

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: QuizPayload) => addQuiz(payload),
    onSuccess: (data) => {
      router.push({ name: 'edit-quiz', params: { id: data.id } })
    },
  })

  const quiz = ref<Partial<QuizPayload>>({
    status: QuizStatus.Draft,
  })

  function handleSubmit() {
    mutate(quiz.value as QuizPayload)
  }
</script>

<template>
  <el-row style="padding: 20px">
    <el-col>
      <h1 align="center">Create Your Own Quiz</h1>
    </el-col>

    <el-col>
      <el-card v-loading="isLoading">
        <quiz-form
          v-model:data="quiz"
          submit-text="Next"
          @submit="handleSubmit"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
