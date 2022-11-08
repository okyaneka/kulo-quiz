<route lang="yaml">
alias: ['/q/:id/o/config', '/q/:id/o/questions']
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { MoreFilled } from '@element-plus/icons-vue'
  import { getQuestionByQuiz } from '~/apps/question/question.repositories'
  import type {
    // ChoicesQuestionPayload,
    QuestionPayloads,
    Questions,
  } from '~/apps/question/question.types'
  import {
    getQuiz,
    setQuiz,
    useQuizStore,
    setConfig,
    setDraft,
  } from '~/apps/quiz/quiz.repositories'
  import { setQuestions } from '~/apps/question/question.repositories'
  import { type QuizPayload, QuizStatus } from '~/apps/quiz/quiz.types'
  import { QuizScheme } from '~/apps/quiz/quiz.schemes'
  import type { Config } from '~/apps/config/config.types'
  import { ConfigScheme } from '~/apps/config/config.scheme'
  import { QuestionPayloadSchemes } from '~/apps/question/question.schemes'
  import type { ZodError } from 'zod'

  const { quiz, questions, config } = storeToRefs(useQuizStore())
  const route = useRoute()
  const router = useRouter()

  const autoSaveInterval = ref()
  const active = ref<string>()
  const isShowNav = ref<boolean>(true)
  const isShowOption = ref<boolean>(false)
  const isShowDrawer = ref<boolean>(false)
  const isValidate = ref<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const view = ref<any>(null)

  const isPublish = computed(() => quiz.value?.status == QuizStatus.Publish)

  const routePath = computed(() => {
    return route.path
  })

  const pageLoading = computed(
    () => getQuizLoading.value || getQuestionsLoading.value || stepLoading.value
  )

  // get quiz
  const { isFetching: getQuizLoading } = useQuery({
    queryKey: ['quiz', routePath],
    queryFn: () => getQuiz(route.params.id as string),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // get questions
  const { isFetching: getQuestionsLoading } = useQuery({
    queryKey: ['question', routePath],
    queryFn: () => getQuestionByQuiz(route.params.id as string),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // set quiz
  const { mutateAsync: handleSetQuiz } = useMutation({
    mutationFn: (payload: Partial<QuizPayload>) =>
      setQuiz(route.params.id as string, payload),
    onSuccess: (data) => {
      quiz.value = data
    },
  })

  // set questions
  const { mutateAsync: handleSetQuestions } = useMutation({
    mutationFn: (payload: Partial<Questions>[]) =>
      setQuestions(route.params.id as string, payload),
    onSuccess: (data) => {
      questions.value = data
    },
  })

  // set config
  const { mutateAsync: handleSetConfig } = useMutation({
    mutationFn: (payload: Partial<Config>) =>
      setConfig(route.params.id as string, payload),
    onSuccess: (data) => {
      if (data != null) config.value = data
    },
  })

  // save draft
  const { mutateAsync: saveDraft } = useMutation({
    mutationFn: async () => {
      isShowOption.value = false
      if (quiz.value != undefined)
        return setDraft(route.params.id as string, quiz.value, questions.value)
    },
  })

  // next step
  const { mutateAsync: handleNextStep, isLoading: stepLoading } = useMutation({
    mutationFn: async () => {
      if (view.value && view.value.validate) view.value.validate()
      await saveDraft()
      const current = route.name as string
      isValidate.value = true
      isShowOption.value = false
      let parsed, successCallback, failedCallback

      if (current == 'q-id-o') {
        parsed = () => parseQuiz()
        successCallback = async (data: unknown) => {
          await handleSetQuiz(data as QuizPayload)
          router.push({ name: 'q-id-o-questions' })
          active.value = 'q-id-o-questions'
        }
        failedCallback = () => {
          ElMessage.error('quiz_is_not_valid')
        }
      } else if (current == 'q-id-o-questions') {
        parsed = () => parseQuestions()
        successCallback = async (data: unknown) => {
          await handleSetQuestions(data as Questions[])
          router.push({ name: 'q-id-o-config' })
          active.value = 'q-id-o-config'
        }
        failedCallback = (error: ZodError) => {
          const children = [
            h('p', null, h('strong', null, 'Some question is not valid')),
          ]
          const e = error as ZodError<QuestionPayloads[]>

          e.errors.forEach((v) => {
            children.push(
              h(
                'p',
                null,
                `Question ${(v.path[0] as number) + 1}: ${v.message}`
              )
            )
          })
          const el = h('div', { class: 'el-message__content' }, children)
          ElMessage.error({
            message: el,
          })
        }
      } else if (current == 'q-id-o-config') {
        parsed = () => parseConfig()
        successCallback = async (data: unknown) => {
          await handleSetConfig(data as Config)
          await handleSetQuiz({ status: QuizStatus.Publish })
          ElMessage.success('Quiz published.')
          router.push({
            name: 'q-id',
            params: { id: route.params.id },
            query: { share: 1 },
          })
        }
        failedCallback = () => {
          ElMessage.error('config_is_not_valid')
        }
      }

      if (!parsed || !successCallback || !failedCallback)
        return ElMessage.error('some_data_is_not_valid')

      const data = parsed()

      if (data.success) return await successCallback(data.data)
      return failedCallback(data.error)
    },
  })

  function handleTabClick(name: string | number) {
    router.push({ name: name as string })
  }

  async function handlePreview() {
    isValidate.value = true
    if (!parseQuiz().success) return ElMessage.error('quiz_is_not_valid')
    if (!parseQuestions().success)
      return ElMessage.error('questions_is_not_valid')
    if (!parseConfig().success) return ElMessage.error('config_is_not_valid')
    await saveDraft()

    const anchor = document.createElement('a')
    anchor.href = router.resolve({
      name: 'q-id-p',
      params: { id: route.params.id },
    }).href
    anchor.target = '_blank'
    anchor.click()
    document.removeChild(anchor)
  }

  function goTo(name: string) {
    isShowDrawer.value = false
    router.push({ name })
    active.value = name
  }

  function parseQuiz() {
    return QuizScheme.safeParse(quiz.value)
  }

  function parseQuestions() {
    return QuestionPayloadSchemes.safeParse(questions.value)
  }

  function parseConfig() {
    return ConfigScheme(questions.value.length).safeParse(config.value)
  }

  function handleSaveDraftClicked() {
    saveDraft().then(() => {
      ElMessage.success('Saved to draft.')
    })
  }

  onMounted(() => {
    isShowDrawer.value = route.query.new == '1'
    active.value = route.name as string
    autoSaveInterval.value = setInterval(async () => {
      await saveDraft()
      ElMessage.success('Saved to draft.')
    }, 5 * 6 * 1e4)
  })
</script>

<template>
  <el-row style="padding: 0 0 40px">
    <el-col>
      <el-card shadow="never">
        <el-skeleton v-if="pageLoading" animated>
          <template #template>
            <el-skeleton-item variant="rect" style="height: 240px">
            </el-skeleton-item>
          </template>
        </el-skeleton>
        <el-row v-else>
          <el-col>
            <h1 align="center">Quiz Details</h1>
          </el-col>
          <el-col>
            <router-view
              ref="view"
              v-model:validate="isValidate"
              :disabled="isPublish"
              v-slot="{ Component }"
            >
              <keep-alive>
                <component :is="Component"></component>
              </keep-alive>
            </router-view>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>

  <el-card
    shadow="never"
    style="
      --el-card-border-radius: 0;
      z-index: 998;
      position: fixed;
      width: calc(100% - 2 * var(--global-layout-padding));
      left: var(--global-layout-padding);
      transition: bottom 0.3s ease-in;
      background: var(--el-fill-color-blank);
      overflow-x: auto;
      border-bottom: none;
      border-left: none;
      border-right: none;
      bottom: 56px;
    "
    :body-style="{ padding: 0 }"
  >
    <el-tabs
      v-model="active"
      stretch
      @tab-change="handleTabClick"
      class="no-margin-tabs"
    >
      <el-tab-pane name="q-id-o" label="1. Data"> </el-tab-pane>
      <el-tab-pane name="q-id-o-questions" label="2. Questions"> </el-tab-pane>
      <el-tab-pane name="q-id-o-config" label="3. Config"> </el-tab-pane>
    </el-tabs>
  </el-card>

  <el-popover
    v-if="!isPublish"
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
      ></el-button>
    </template>
    <el-space direction="vertical" fill>
      <el-button style="width: 100%" @click="handleSaveDraftClicked()"
        >Simpan draft</el-button
      >
      <el-button style="width: 100%" @click="handlePreview()"
        >Preview</el-button
      >
      <el-button style="width: 100%" type="primary" @click="handleNextStep()"
        >Selanjutnya</el-button
      >
    </el-space>
  </el-popover>

  <el-drawer v-model="isShowDrawer" direction="btt" :size="360">
    <el-result
      icon="success"
      title="Your Quiz has been Created!"
      sub-title="Now let's add questions to your quiz and then share to all."
      style="padding: 0"
    >
      <template #extra>
        <el-space fill style="width: 100%">
          <el-button type="primary" @click="goTo('q-id-o-questions')"
            >Let's add questions!</el-button
          >
          <router-link to="/o">Back to my quiz</router-link>
        </el-space>
      </template>
    </el-result>
  </el-drawer>
</template>
