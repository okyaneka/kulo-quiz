<route lang="yaml">
# meta:
#   layout: private
</route>

<script setup lang="ts">
  import QuizFloatingActions from '../../composables/components/quiz/quiz-floating-actions.vue'
  import type { AnswersPayload } from '~/apps/results/results.types'
  import { getQuizData } from '~/apps/quiz/quiz.repositories'
  import type { Quiz } from '~/apps/quiz/quiz.types'
  import {
    addResultPreview,
    setResultPreview as __setResult,
  } from '~/apps/results/results.repositories'
  import {
    likeQuiz,
    unlikeQuiz,
  } from '~/apps/quiz-inter/quiz-inter.repositories'
  import type { QuizMeta } from '~/apps/quiz-inter/quiz-inter.types'

  const quiz_id = 'iY86BtGhKkdbEaqIZWuf'

  // const route = useRoute()
  const router = useRouter()
  const floatingActions = ref<InstanceType<typeof QuizFloatingActions> | null>(
    null
  )

  const showFloatingAction = ref(false)
  const answers = ref<Partial<AnswersPayload>[]>([])
  const quizMeta = ref<QuizMeta>()

  const {
    data: quiz,
    isFetching: loading,
    refetch: fetchQuizData,
  } = useQuery({
    queryKey: ['quiz'],
    queryFn: () => getQuizData(quiz_id),
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    onSuccess: () => {
      showFloatingAction.value = true
    },
    onError: (e: Error) => {
      ElMessage.error(e.message)
      // router.push('/')
    },
  })

  // const { refetch: handleGetQuizMeta } = useQuery({
  //   queryKey: ['quiz-meta'],
  //   queryFn: () => getQuizMeta(quiz_id),
  //   refetchIntervalInBackground: false,
  //   refetchOnWindowFocus: false,
  //   onSuccess(data) {
  //     quizMeta.value = data
  //   },
  // })

  const { data: result, mutateAsync: createResult } = useMutation({
    mutationFn: (payload: Quiz) => addResultPreview(payload),
    onSuccess: () => {
      floatingActions.value?.hide()
    },
  })

  const { mutateAsync: setResult, isLoading: submitLoading } = useMutation({
    mutationFn: async (payload: AnswersPayload[]) => {
      if (result.value == undefined) throw new Error('result_undefined')
      await __setResult(result.value.id, payload)
      ElMessage.success('answer_submitted')
      router.push({ name: 'p-id-review', params: { id: quiz_id } })
    },
  })

  const { mutateAsync: toggleLikeQuiz, isLoading } = useMutation({
    mutationFn: (quiz_id: string) => {
      if (quizMeta.value != undefined) {
        if (quizMeta.value.has_like) {
          quizMeta.value.has_like = false
          quizMeta.value.like_count--
          return unlikeQuiz(quiz_id)
        } else {
          quizMeta.value.has_like = true
          quizMeta.value.like_count++
          return likeQuiz(quiz_id)
        }
      }
      return Promise.resolve(undefined)
    },
    // onSuccess(data) {
    //   handleGetQuizMeta.value()
    // },
  })

  function handleLikeQuiz(quiz_id: string) {
    toggleLikeQuiz(quiz_id)
  }

  onMounted(() => {
    fetchQuizData.value()
  })
</script>

<template>
  <el-row style="min-height: calc(100vh - 56px); flex-direction: column">
    <el-col>
      <el-card v-loading="isLoading">
        <pre>{{ quizMeta }}</pre>
      </el-card>
    </el-col>
    <quiz-play
      v-model:answers="answers"
      :loading="loading"
      :submit-loading="submitLoading"
      :quiz="quiz"
      @started:quiz="createResult"
      @ended:quiz="setResult"
    >
    </quiz-play>
    <quiz-floating-actions
      v-if="showFloatingAction"
      :quiz-id="quiz_id"
      :meta="quizMeta"
      ref="floatingActions"
      @click:like="handleLikeQuiz"
    ></quiz-floating-actions>
  </el-row>
</template>

<style scoped>
  .content {
    scroll-snap-align: start;
  }
</style>
