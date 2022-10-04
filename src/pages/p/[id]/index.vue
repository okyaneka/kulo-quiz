<route lang="yaml">
name: preview-quiz
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import type { TabsPaneContext } from 'element-plus'
  import type { SmoothScrollOptions } from 'vue3-smooth-scroll'
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import { getQuizData } from '~/apps/quiz/quiz.repositories'
  import { QuizLevel, QuizStatus } from '~/apps/quiz/quiz.schemes'
  import { QuestionMode, TimerMode, Units } from '~/apps/config/config.types'

  const route = useRoute()
  const router = useRouter()
  const { user } = storeToRefs(useAuthStore())
  const smoothScroll: ((opt: SmoothScrollOptions) => void) | undefined =
    inject('smoothScroll')

  const description = ref<HTMLElement>()
  const userGuide = ref<HTMLElement>()
  const spesification = ref<HTMLElement>()
  const active = ref<'description' | 'userGuide' | 'spesification'>()

  const elements = computed((): Ref<HTMLElement | undefined>[] => {
    return [description, userGuide, spesification]
  })

  const loadQuiz = computed<boolean>(() => !!user.value)
  const config = computed(() => {
    return quizData.value?.config
  })
  const questions = computed(() => {
    return quizData.value?.questions
  })
  const tableData = computed(() => {
    let working_duration
    switch (config.value?.timer_mode) {
      case TimerMode['Question timer']:
        working_duration =
          questions.value?.reduce((c, v) => c + (v.timer ?? 0), 0) + ' seconds'
        break
      case TimerMode['Quiz timer']:
      default:
        working_duration =
          config.value?.timer +
          ' ' +
          (config.value?.timer_units != undefined
            ? Units[config.value.timer_units]
            : '')
        break
    }
    return [
      { name: 'question_total', value: config.value?.question_displayed },
      {
        name: 'max_score',
        value: quizData.value?.max_point,
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
          quizData.value?.level != undefined
            ? QuizLevel[quizData.value?.level]
            : '',
      },
      { name: 'working_duration', value: working_duration },
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

  const { data: quizData, isFetching: loading } = useQuery({
    queryKey: ['quiz-data'],
    queryFn: () =>
      getQuizData(route.params.id as string).then((quiz) => {
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

  function setActive() {
    for (let i = elements.value.length - 1; i >= 0; i--) {
      const element: Ref<HTMLElement | undefined> = elements.value[i]
      const offsetTop = element.value?.offsetTop ?? 0

      if (window.scrollY >= offsetTop - 54 - 32) {
        active.value = (() => {
          switch (i) {
            case 0:
              return 'description'
            case 1:
              return 'userGuide'
            case 2:
              return 'spesification'
          }
        })()
        return active.value
      }
    }
    active.value = 'description'
    return active.value
  }

  function handleTabClicked(data: TabsPaneContext) {
    disableScrollObserver()
    const el = (() => {
      switch (data.paneName) {
        case 'description':
          return description
        case 'userGuide':
          return userGuide
        case 'spesification':
          return spesification
        default:
          return description
      }
    })()

    if (smoothScroll) {
      smoothScroll({
        scrollTo: el?.value ?? 0,
        duration: 300,
        offset: -54,
      })
    }

    setTimeout(() => {
      enableScrollObserver()
    }, 300)
  }

  function enableScrollObserver() {
    window.addEventListener('scroll', () => setActive())
  }

  function disableScrollObserver() {
    window.removeEventListener('scroll', () => setActive())
  }

  onMounted(() => {
    setActive()
    enableScrollObserver()
  })

  onUnmounted(() => {
    disableScrollObserver()
  })
</script>

<template>
  <el-row style="padding: 20px">
    <el-col>
      <h3>{{ quizData?.title }}</h3>
    </el-col>

    <el-col v-if="loading">
      <el-skeleton animated :rows="6"></el-skeleton>
    </el-col>
    <template v-else>
      <el-col>
        <el-tabs
          v-model="active"
          style="position: sticky; top: 0; background-color: var(--el-bg-color)"
          @tab-click="handleTabClicked"
        >
          <el-tab-pane label="Description" name="description" />
          <el-tab-pane label="User Guide" name="userGuide" />
          <el-tab-pane label="Spesification" name="spesification" />
        </el-tabs>

        <el-space fill wrap :size="20" style="width: 100%; max-width: 100%">
          <!-- #description -->
          <div ref="description">
            <h3>Description</h3>
            <div v-html="config?.description"></div>
          </div>

          <!-- #user-guide -->
          <div ref="userGuide">
            <h3>User Guide</h3>
            <div v-html="config?.user_guide"></div>
          </div>

          <!-- #spesification -->
          <div ref="spesification">
            <h3>Spesification</h3>
            <el-table
              :data="tableData"
              :show-header="false"
              style="width: 100%; z-index: 0"
            >
              <el-table-column prop="name" />
              <el-table-column prop="value" />
            </el-table>
          </div>
        </el-space>
      </el-col>

      <el-col style="position: sticky; bottom: 64px; top: 8px; z-index: 1">
        <router-link :to="{ name: 'preview-quiz-play' }">
          <el-button type="primary" style="width: 100%"
            >START PREVIEW QUIZ</el-button
          >
        </router-link>
      </el-col>
    </template>
  </el-row>
</template>
