<route lang="yaml">
meta:
  requireAuth: true
</route>

<script setup lang="ts">
  import { getQuizData } from '~/apps/quiz/quiz.repositories'
  import type { Quiz } from '~/apps/quiz/quiz.types'
  import {
    addResultPreview,
    setResultPreview,
  } from '~/apps/results/results.repositories'
  import type { AnswersPayload } from '~/apps/results/results.types'

  const route = useRoute()
  const router = useRouter()

  const answers = ref<Partial<AnswersPayload>[]>([])

  const {
    data: quiz,
    isFetching: loading,
    refetch: fetchQuizData,
  } = useQuery({
    queryKey: ['quiz'],
    queryFn: () => getQuizData(route.params.id as string),
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    onError: (e: Error) => {
      ElMessage.error(e.message)
      router.push('/')
    },
  })

  const { data: result, mutateAsync: createResult } = useMutation({
    mutationFn: (payload: Quiz) => addResultPreview(payload),
  })

  const { mutateAsync: setResult, isLoading: submitLoading } = useMutation({
    mutationFn: async (payload: AnswersPayload[]) => {
      if (result.value == undefined) throw new Error('result_undefined')
      await setResultPreview(result.value.id, payload)
      ElMessage.success('answer_submitted')
      router.push({ name: 'q-id-p-review' })
    },
  })

  onMounted(() => {
    fetchQuizData.value()
  })
</script>

<template>
  <el-row style="min-height: 100vh; flex-direction: column">
    {{ result }}
    <quiz-play
      v-model:answers="answers"
      :loading="loading"
      :submit-loading="submitLoading"
      :quiz="quiz"
      @started:quiz="createResult"
      @ended:quiz="setResult"
    >
      <template #footer>
        <el-space style="width: 100%; justify-content: center" :wrap="false">
          <router-link :to="{ name: 'q-id-p-info' }"
            >Lihat info kuis</router-link
          >
          <router-link :to="{ name: 'q-id-p-review' }"
            >Lihat statistik kuis</router-link
          >
        </el-space>
      </template>
    </quiz-play>
  </el-row>
</template>
