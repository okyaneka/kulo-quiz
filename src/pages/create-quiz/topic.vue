<route lang="yaml">
name: create-quiz-topic
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types'
  import { QuizTopicScheme } from '~/apps/quiz-topic/quiz-topic.scheme'
  import {
    getTopics,
    addTopic,
    type QuizTopic,
    type CreateQuizTopicPayload,
  } from '~/apps/quiz-topic/quiz-topic.repository'

  const route = useRoute()

  const isShowDrawer = ref<boolean>(false)

  const { data: parentTopics, isLoading: parentTopicLoading } = useQuery({
    retry: false,
    queryKey: ['quiz-topics'],
    queryFn: async () =>
      await getTopics({
        per_page: 0,
        filter: { status: 2 },
        orders: [
          ['parent', 'desc'],
          ['title', 'asc'],
        ],
      }),
    onSuccess(data) {
      setTopicOptions('', data.rows)
    },
  })

  const { mutate, isLoading: addTopicLoading } = useMutation({
    mutationFn: (payload: CreateQuizTopicPayload) => addTopic(payload),
    onSuccess: () => {
      isShowDrawer.value = true
      parent.value = undefined
      resetForm()
    },
  })

  const { validate, values, errors, resetForm } =
    useForm<CreateQuizTopicPayload>({
      validationSchema: QuizTopicScheme,
      initialValues: {
        parent: null,
        title: '',
      },
    })
  useField<string>('title')
  useField<QuizTopic['parent']>('parent')

  const parent = ref<string>()
  const options = ref<OptionType[]>([])

  function handleChangeParent(id: string) {
    const topic = parentTopics.value?.rows.find((topic) => topic.id == id)
    values.parent = topic ? { id: topic.id, title: topic.title } : null
    setTopicOptions()
  }

  function setTopicOptions(query?: string, __options?: QuizTopic[]) {
    __options = __options ?? parentTopics.value?.rows ?? []
    options.value = __options
      .filter((value) => {
        return value.title.toLowerCase().includes((query ?? '').toLowerCase())
      })
      .map((v) => {
        let label = v.title
        if (v.parent != null) label = v.parent.title + ' / ' + label
        return { label, value: v.id }
      })
      .sort((a, b) => (a.label > b.label ? 1 : -1))
  }

  async function handleSubmit() {
    if ((await validate()).valid) {
      mutate(values)
    }
  }

  onMounted(() => {
    values.title = (route.query.title ?? '') as string
  })
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <el-card v-loading="addTopicLoading">
        <el-space fill style="width: 100%; margin-bottom: 20px">
          <h1 align="center">Ask for New Topic</h1>
          <p
            align="center"
            style="color: var(--el-text-color-regular); padding: 0 20px"
          >
            New topic request will be verified by our team. The process will
            take for a while before you can use your topic. We will notify when
            the new topic you requested has been verified.
          </p>
        </el-space>

        <el-form label-position="top" @submit.prevent="handleSubmit">
          <el-form-item :error="errors.title" label="Topic title">
            <el-input v-model="values.title" type="text"></el-input>
          </el-form-item>

          <el-form-item :error="errors.parent" label="Parent Topic (if exists)">
            <el-select-v2
              v-model="parent"
              :disabled="!options.length"
              v-loading="parentTopicLoading"
              :options="options"
              filterable
              remote
              clearable
              :remote-method="setTopicOptions"
              @clear="values.parent = null"
              @change="handleChangeParent"
              style="width: 100%"
            >
            </el-select-v2>
          </el-form-item>

          <el-form-item style="margin-bottom: 0">
            <el-button type="primary" native-type="submit"
              >Request new Topic</el-button
            >
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>

  <el-drawer v-model="isShowDrawer" direction="btt" :size="320">
    <el-result
      icon="success"
      title="Request sent!"
      sub-title="Your request has been successfully forwarded."
      style="padding: 0"
    >
      <template #extra>
        <router-link to="/">
          <el-button type="primary">Back to home</el-button>
        </router-link>
      </template>
    </el-result>
  </el-drawer>
</template>
