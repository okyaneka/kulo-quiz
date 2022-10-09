<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import { getQuiz } from '~/apps/quiz/quiz.repositories'
  import { QuizLevel, QuizStatus } from '~/apps/quiz/quiz.schemes'
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

  const { data: quiz, isFetching: loading } = useQuery({
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
  <el-row>
    <el-col>
      <quiz-preview
        :title="quiz?.title"
        :loading="loading"
        :description="config?.description"
        :userGuide="config?.user_guide"
        :spesification="tableData"
      >
        <template #footer>
          <el-col style="position: sticky; bottom: 64px; top: 8px; z-index: 10">
            <el-card shadow="never">
              <router-link :to="{ name: 'p-id-play' }">
                <el-button type="primary" style="width: 100%"
                  >START PREVIEW QUIZ</el-button
                >
              </router-link>
            </el-card>
          </el-col>
        </template>
      </quiz-preview>
    </el-col>
  </el-row>
</template>
