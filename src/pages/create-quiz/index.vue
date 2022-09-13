<route lang="yaml">
name: create-quiz
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import QuizForm from '../../components/quiz/quiz-form.vue'
  import { addQuiz } from '~/apps/quiz/quiz.repositories'
  import type { CreateQuizPayload } from '~/apps/quiz/quiz.types'

  const router = useRouter()

  const form = ref<CreateQuizPayload>()

  const { mutate, isLoading: addQuizLoading } = useMutation({
    mutationFn: (payload: CreateQuizPayload) => addQuiz(payload),
    onSuccess: (data) => {
      router.push({
        name: 'edit-quiz-detail',
        params: { id: data.id },
        query: { new: 1 },
      })
    },
  })

  function handleSubmit(payload: CreateQuizPayload) {
    mutate(payload)
  }
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <h1 align="center">Create Your Quiz</h1>
    </el-col>

    <el-col>
      <el-card v-loading="addQuizLoading">
        <el-space fill style="margin-bottom: 1rem; width: 100%">
          <h3>Quiz Information</h3>
          <p style="color: var(--el-text-color-secondary)">
            Used to help people find what they really need.
          </p>
        </el-space>

        <quiz-form
          v-model:data="form"
          submit-text="Next"
          @submit="handleSubmit"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
