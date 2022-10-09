<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { addQuiz } from '~/apps/quiz/quiz.repositories'
  import { QuizStatus } from '~/apps/quiz/quiz.schemes'
  import type { QuizPayload } from '~/apps/quiz/quiz.types'

  const router = useRouter()

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: QuizPayload) => addQuiz(payload),
    onSuccess: (data) => {
      router.push({
        name: 'edit-quiz',
        params: { id: data.id },
        query: { new: 1 },
      })
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
  <el-row style="padding: 20px 0">
    <el-col>
      <h1 align="center">Create Your Own Quiz</h1>
    </el-col>

    <el-col>
      <el-card v-loading="isLoading" style="margin: 0 20px">
        <quiz-form
          v-model:data="quiz"
          submit-text="Next"
          @submit="handleSubmit"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
