<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { MoreFilled } from '@element-plus/icons-vue'
  import { getQuestionByQuiz } from '~/apps/question/question.repositories'
  import {
    QuestionMode,
    type ChoicesQuestionPayload,
    type Questions,
  } from '~/apps/question/question.types'
  import {
    getQuiz,
    setQuiz as _setQuiz,
    useQuizStore,
  } from '~/apps/quiz/quiz.repositories'
  import { setQuestions as _setQuestions } from '~/apps/question/question.repositories'
  import type { QuizPayload } from '~/apps/quiz/quiz.types'
  import { QuizScheme } from '~/apps/quiz/quiz.schemes'
  import { QuestionScheme } from '~/apps/question/question.schemes'
  import {
    getConfig,
    setConfig as _setConfig,
  } from '~/apps/config/config.repositories'
  import type { Config } from '~/apps/config/config.types'
  import { ConfigScheme } from '~/apps/config/config.scheme'

  const { quiz, questions, config } = storeToRefs(useQuizStore())
  const route = useRoute()
  const router = useRouter()

  const autoSaveInterval = ref()
  const active = ref<string>()
  const isShowNav = ref<boolean>(true)
  const isShowOption = ref<boolean>(false)
  const isShowDrawer = ref<boolean>(false)
  const lastScrollPos = ref<number>(window.scrollY)
  const isValidate = ref<boolean>(false)

  const routePath = computed(() => {
    return route.path
  })

  const pageLoading = computed<boolean>(() => {
    return (
      getQuizLoading.value ||
      setQuizLoading.value ||
      getQuestionsLoading.value ||
      getConfigLoading.value
    )
  })

  const isLoadQuestion = computed<boolean>(() => {
    return ['edit-questions', 'edit-config'].includes(route.name as string)
  })
  const isLoadConfig = computed<boolean>(() => {
    return route.name == 'edit-config'
  })

  // get quiz
  const { isFetching: getQuizLoading } = useQuery({
    queryKey: ['quiz', routePath],
    queryFn: () => getQuiz(route.params.id as string),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // set quiz
  const { mutateAsync: setQuiz, isLoading: setQuizLoading } = useMutation({
    mutationFn: (payload: QuizPayload) =>
      _setQuiz(route.params.id as string, payload),
  })

  // get questions
  const { isFetching: getQuestionsLoading } = useQuery({
    queryKey: ['question', routePath],
    queryFn: () => getQuestionByQuiz(route.params.id as string),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: isLoadQuestion,
  })

  // set questions
  const { mutateAsync: setQuestions } = useMutation({
    mutationFn: (payload: Partial<Questions>[]) => _setQuestions(payload),
  })

  // get config
  const { isFetching: getConfigLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => getConfig(route.params.id as string),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: isLoadConfig,
  })

  // set config
  const { mutateAsync: setConfig } = useMutation({
    mutationFn: (payload: Partial<Config>) =>
      _setConfig(route.params.id as string, payload),
  })

  function handleTabClick(name: string | number) {
    router.push({ name: name as string })
  }

  async function handleSaveDraft() {
    isShowOption.value = false

    if (route.name == 'edit-quiz' && quiz.value != undefined)
      await setQuiz(quiz.value)
    if (route.name == 'edit-questions' && questions.value != undefined)
      await setQuestions(questions.value)
    if (route.name == 'edit-config' && config.value != undefined)
      await setConfig(config.value)
    ElMessage.success('Saved to draft.')
  }

  function goTo(name: string) {
    isShowDrawer.value = false
    router.push({ name })
    active.value = name
  }

  async function handleNextFrom(step?: string) {
    let result
    isValidate.value = true
    isShowOption.value = false

    switch (step ?? route.name) {
      case 'edit-quiz':
        if (
          QuizScheme.safeParse(quiz.value).success &&
          quiz.value != undefined
        ) {
          await setQuiz(quiz.value)
          router.push({ name: 'edit-questions' })
          active.value = 'edit-questions'
        }
        break
      case 'edit-questions':
        for (let i = 0; i < questions.value.length; i++) {
          if (!questions.value[i].image_url) questions.value[i].image_url = null
          result = QuestionScheme(questions.value[i].mode).safeParse(
            questions.value[i]
          )
          if (!result.success) return ElMessage.error('some_questions_invalid')

          let question
          switch (result.data.mode) {
            case QuestionMode.Choices:
              question = result.data as ChoicesQuestionPayload
              if (!question.choices.some((v) => v.is_true))
                return ElMessage.error('options_at_least_hase_one_true')
              break
            default:
              break
          }
        }

        await setQuestions(questions.value)
        router.push({ name: 'edit-config' })
        active.value = 'edit-config'
        break
      case 'edit-config':
        result = ConfigScheme(questions.value.length).safeParse(config.value)
        if (!result.success) return ElMessage.error('some_configs_invalid')
        await setConfig(result.data)
        ElMessage.success('Quiz published.')

        break
      default:
        break
    }
  }

  function onscroll() {
    const currentScrollPos = window.scrollY
    const isBottomOfPage =
      window.scrollY + window.innerHeight == document.body.scrollHeight

    if (lastScrollPos.value > currentScrollPos || isBottomOfPage) {
      isShowNav.value = true
    } else {
      isShowNav.value = false
    }
    lastScrollPos.value = currentScrollPos
  }

  onMounted(() => {
    isShowDrawer.value = route.query.new == '1'
    active.value = route.name as string
    window.addEventListener('scroll', onscroll)
    autoSaveInterval.value = setInterval(() => {
      handleSaveDraft()
    }, 5 * 6 * 1e4)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onscroll)
  })
</script>

<template>
  <el-row style="padding: 20px 20px 56px">
    <el-col>
      <h1 align="center">Quiz Details</h1>
    </el-col>

    <el-col>
      <el-card v-if="pageLoading">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="rect" style="height: 240px">
            </el-skeleton-item>
          </template>
        </el-skeleton>
      </el-card>
      <router-view v-else v-model:validate="isValidate" />
    </el-col>
  </el-row>

  <el-popover
    v-model:visible="isShowOption"
    placement="top-end"
    width="auto"
    trigger="click"
  >
    <template #reference>
      <el-button
        type="primary"
        :icon="MoreFilled"
        circle
        size="large"
        :style="{ bottom: isShowNav ? '112px' : '72px' }"
        style="
          z-index: 998;
          position: fixed;
          right: 16px;
          transform: rotate(90deg);
          transition: bottom 0.3s ease-in;
        "
      />
    </template>
    <el-space direction="vertical" fill>
      <el-button style="width: 100%" @click="handleSaveDraft()"
        >Simpan draft</el-button
      >
      <el-button style="width: 100%">Preview</el-button>
      <el-button style="width: 100%" type="primary" @click="handleNextFrom()"
        >Selanjutnya</el-button
      >
    </el-space>
  </el-popover>

  <el-tabs
    v-model="active"
    stretch
    @tab-change="handleTabClick"
    :style="{ bottom: isShowNav ? '56px' : '0' }"
    style="
      z-index: 998;
      position: fixed;
      width: calc(100% - 2 * var(--global-layout-padding));
      margin-bottom: -15px;
      left: var(--global-layout-padding);
      transition: bottom 0.3s ease-in;
      background: var(--el-fill-color-blank);
      overflow-x: auto;
    "
  >
    <el-tab-pane name="edit-quiz" label="1. Data"> </el-tab-pane>
    <el-tab-pane name="edit-questions" label="2. Questions"> </el-tab-pane>
    <el-tab-pane name="edit-config" label="3. Config"> </el-tab-pane>
  </el-tabs>

  <el-drawer v-model="isShowDrawer" direction="btt" :size="320">
    <el-result
      icon="success"
      title="Your Quiz has Created!"
      sub-title="Now let's add questions to your quiz and then share to all."
      style="padding: 0"
    >
      <template #extra>
        <el-space fill style="width: 100%">
          <el-button type="primary" @click="goTo('edit-questions')"
            >Let's add questions!</el-button
          >
          <router-link to="/my-quiz">Back to my quiz</router-link>
        </el-space>
      </template>
    </el-result>
  </el-drawer>
</template>
