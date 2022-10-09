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

  const { throwNotFound } = useNotfoundStore()
  const { user } = storeToRefs(useAuthStore())
  const route = useRoute()
  const router = useRouter()

  const showShareDrawer = ref(false)

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
        if (quiz.status != QuizStatus.Publish) {
          throwNotFound()
          throw new Error('not_found')
        }
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
  <el-row style="padding: 20px 0">
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
            <el-row style="flex-wrap: nowrap">
              <router-link
                :to="{ name: 'q-id-play' }"
                style="width: 100%; margin-right: 16px"
              >
                <el-button type="primary" style="width: 100%"
                  >START QUIZ</el-button
                >
              </router-link>
              <el-button circle @click="showShareDrawer = true">
                <el-icon>
                  <svg-icon name="share"></svg-icon>
                </el-icon>
              </el-button>
            </el-row>
          </el-col>
        </template>
      </quiz-preview>
    </el-col>
  </el-row>

  <share-drawer
    v-model="showShareDrawer"
    :quiz-id="quiz?.id"
    :quizTitle="quiz?.title"
  ></share-drawer>
</template>
