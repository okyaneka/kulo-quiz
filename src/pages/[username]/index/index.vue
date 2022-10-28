<script setup lang="ts">
  import type { Ref } from 'vue'
  import type { ElRow } from 'element-plus'
  import type { QuizWithMeta } from '~/apps/quiz-inter/quiz-inter.types'
  import { getQuizList, getQuizWithMeta } from '~/apps/quiz/quiz.repositories'
  import { QuizStatus } from '~/apps/quiz/quiz.types'
  import type { UserWithMeta } from '~/apps/user-inter/user-inter.types'

  const user = inject<Ref<UserWithMeta | null>>('user', ref(null))
  const quizData = ref<
    { id: string; loading?: boolean; data?: QuizWithMeta }[]
  >([])
  const cursor = ref(6)
  const total = ref(0)
  const wrapper = ref<InstanceType<typeof ElRow> | null>(null)
  const wrapperEl = computed<HTMLDivElement | null>(() => {
    return wrapper.value?.$el ?? null
  })

  useQuery({
    queryKey: ['published-list', cursor, user],
    queryFn: () => {
      console.log('kpk ga jalan?')

      if (user.value != null) {
        return getQuizList(
          {
            per_page: cursor.value,
            filter: {
              'author.uid': user.value.user_id,
              status: QuizStatus.Publish,
            },
            orders: [['created_at', 'desc']],
          },
          true
        )
      }
    },
    onSuccess(res) {
      total.value = res?.total_filtered ?? 0
      res?.rows.forEach((id) => {
        if (typeof id == 'string')
          if (!quizData.value.some((data) => data.id == id)) {
            const index = quizData.value.push({ id, loading: true }) - 1
            handleGetQuizWithMeta(id).then((res) => {
              quizData.value[index].data = res
              quizData.value[index].loading = false
            })
          }
      })
    },
  })

  const { mutateAsync: handleGetQuizWithMeta } = useMutation({
    mutationFn: (id: string) => getQuizWithMeta(id),
  })

  const cardHeight = computed(() =>
    wrapperEl.value?.clientWidth
      ? Math.ceil(((wrapperEl.value.clientWidth / 2) * 4) / 3 - 2)
      : 0
  )

  function loadMore() {
    if (cursor.value + 1 <= total.value) cursor.value += 1
  }
</script>

<template>
  <el-row v-infinite-scroll="loadMore" ref="wrapper">
    <el-col
      v-for="quiz in quizData"
      :span="12"
      :key="quiz.id"
      style="margin: 0"
    >
      <quiz-thumbnail
        :loading="quiz.loading"
        :height="cardHeight"
        :quiz="quiz.data"
        :to="{ name: 'q-id', params: { id: quiz.id } }"
      >
      </quiz-thumbnail>
    </el-col>
  </el-row>
</template>
