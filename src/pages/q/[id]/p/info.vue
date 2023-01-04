<route lang="yaml">
meta:
  layout: private
  requireAuth: true
  name: Info Preview Kuis
</route>

<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import { getQuiz } from '~/apps/quiz/quiz.repositories'
  import { QuizLevel, QuizStatus } from '~/apps/quiz/quiz.types'
  import { QuestionMode, Units } from '~/apps/config/config.types'

  const route = useRoute()
  const router = useRouter()
  const { user } = storeToRefs(useAuthStore())

  const loadQuiz = computed<boolean>(() => !!user.value)
  const config = computed(() => {
    return quiz.value?.config
  })
  const tableData = computed(() => {
    return [
      { name: 'question_total', value: config.value?.question_displayed },
      {
        name: 'max_score',
        value: quiz.value?.max_point,
      },
      {
        name: 'question_modes',
        value:
          config.value?.question_mode != undefined
            ? QuestionMode[config.value?.question_mode]
            : '',
      },
      {
        name: 'dificulty_level',
        value:
          quiz.value?.level != undefined ? QuizLevel[quiz.value?.level] : '',
      },
      {
        name: 'working_duration',
        value: durationHumanized(quiz.value?.max_duration),
      },
      {
        name: 'time_limit_to_repeat',
        value:
          config.value?.break +
          ' ' +
          (config.value?.break_units != undefined
            ? Units[config.value?.break_units]
            : ''),
      },
    ]
  })

  const { data: quiz, isLoading: loading } = useQuery({
    queryKey: ['quiz'],
    queryFn: () =>
      getQuiz(route.params.id as string).then((quiz) => {
        if (quiz.author.uid != user.value?.uid)
          throw new Error('bad_request: permission_denied')
        if (quiz.status != QuizStatus.Draft)
          throw new Error('bad_request: status_not_draft')
        return quiz
      }),
    enabled: loadQuiz,
    onError: (e: Error) => {
      ElMessage.error(e.message)
      router.push('/')
    },
  })
</script>

<template>
  <quiz-preview
    :title="quiz?.title"
    :loading="loading"
    :image-url="config?.image_url"
    :description="config?.description"
    :userGuide="config?.user_guide"
    :spesification="tableData"
  >
    <template #footer>
      <el-col style="position: sticky; bottom: 56px; z-index: 10; padding: 8px">
        <router-link :to="{ name: 'q-id-p' }">
          <el-button type="primary" style="width: 100%"
            >START PREVIEW QUIZ</el-button
          >
        </router-link>
      </el-col>
    </template>
  </quiz-preview>
</template>
