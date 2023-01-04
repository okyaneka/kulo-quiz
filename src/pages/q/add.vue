<route lang="yaml">
meta:
  layout: private
  requireAuth: true
  name: Tambah Kuis
</route>

<script setup lang="ts">
  import { addQuiz } from '~/apps/quiz/quiz.repositories'
  import { type QuizPayload, QuizStatus } from '~/apps/quiz/quiz.types'

  const router = useRouter()

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: QuizPayload) => addQuiz(payload),
    onSuccess: (data) => {
      router.push({
        name: 'q-id-o',
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
  <el-row>
    <el-col>
      <el-card v-loading="isLoading" shadow="never">
        <el-space :size="16" direction="vertical" style="width: 100%" fill>
          <h1 align="center">Tambah Kuis</h1>
          <quiz-form
            v-model:data="quiz"
            submit-text="Kirim"
            @submit="handleSubmit"
          />
        </el-space>
      </el-card>
    </el-col>
  </el-row>
</template>
