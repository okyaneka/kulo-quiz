<script setup lang="ts">
  import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types'
  import {
    getTopics,
    type QuizTopic,
  } from '~/apps/quiz-topic/quiz-topic.repository'
  import {
    QuizGradeOptions,
    QuizLevelOptions,
  } from '~/apps/quiz/quiz.constants'
  import { getLabel } from '~/apps/quiz/quiz.helpers'
  import { CreateQuizScheme } from '~/apps/quiz/quiz.schemes'
  import type { CreateQuizPayload } from '~/apps/quiz/quiz.types'

  const props = withDefaults(
    defineProps<{
      data?: CreateQuizPayload
      disabled?: boolean
      submitText?: string
      hideSubmit?: boolean
    }>(),
    { submitText: 'Submit' }
  )

  const emit = defineEmits<{
    (e: 'submit', payload: CreateQuizPayload): void
    (e: 'update:data', payload: CreateQuizPayload): void
  }>()

  const topicOptions = ref<OptionType[]>([])
  const topic = ref<string>()
  const topicQuery = ref<string>()

  const modelData = computed<CreateQuizPayload>({
    get() {
      return props.data
    },
    set(data) {
      emit('update:data', data)
    },
  })

  const { values, validate, errors, setFieldValue } =
    useForm<CreateQuizPayload>({
      validationSchema: CreateQuizScheme,
    })
  useField<CreateQuizPayload['title']>('title')
  useField<CreateQuizPayload['topic']>('topic')
  useField<CreateQuizPayload['grade']>('grade')
  useField<CreateQuizPayload['level']>('level')

  const { data: topics, isFetching: topicsLoading } = useQuery({
    retry: false,
    queryKey: ['quiz-topics'],
    queryFn: async () =>
      await getTopics({
        per_page: 0,
        filter: { status: 2 },
        orders: [
          ['parent', 'asc'],
          ['title', 'asc'],
        ],
      }),
    onSuccess(data) {
      setTopicOptions('', data.rows)
    },
  })

  function setTopicOptions(query?: string, __options?: QuizTopic[]) {
    topicQuery.value = query
    __options = __options ?? topics.value?.rows ?? []
    topicOptions.value = __options
      .filter((v) =>
        v.title.toLowerCase().includes((query ?? '').toLowerCase())
      )
      .map((v) => {
        const label = getLabel(v, __options ?? [])
        return { label, value: v.id }
      })
      .sort((a, b) => (a.label > b.label ? 1 : -1))
  }

  function handleTopicChanged(id: string) {
    const topic = (topics.value?.rows ?? []).find((v) => v.id == id)
    if (topic) values.topic = { id: topic.id, title: topic.title }
  }

  async function handleSubmit() {
    if ((await validate()).valid) {
      emit('submit', values)
    }
  }

  watch(modelData, (value) => {
    if (value.title != values.title) setFieldValue('title', value.title)
    if (value?.topic?.id != values?.topic?.id) {
      setFieldValue('topic', value.topic)
      topic.value = value.topic.id
    }
    if (value.grade != values.grade) setFieldValue('grade', value.grade)
    if (value.level != values.level) setFieldValue('level', value.level)
  })

  watch(values, (value) => {
    emit('update:data', {
      title: value.title,
      topic: value.topic,
      grade: value.grade,
      level: value.level,
    })
  })
</script>

<template>
  <el-form
    label-position="top"
    @submit.prevent="handleSubmit"
    :disabled="disabled"
  >
    <el-form-item :error="errors.title" label="Quiz Title">
      <el-input v-model="values.title" type="text" />
    </el-form-item>

    <el-form-item v-loading="topicsLoading" :error="errors.topic" label="Topic">
      <el-select-v2
        v-model="topic"
        filterable
        remote
        :remote-method="setTopicOptions"
        :options="topicOptions"
        @change="handleTopicChanged"
        @focusout="setTopicOptions()"
        style="width: 100%"
      >
        <template #empty>
          <el-card shadow="never">
            <p style="font-size: var(--el-font-size-base)">
              Topic not found. You can ask for new topic
              <router-link
                :to="{
                  name: 'create-quiz-topic',
                  query: { title: topicQuery },
                }"
                >here</router-link
              >.
            </p>
          </el-card>
        </template>
      </el-select-v2>
    </el-form-item>

    <el-form-item :error="errors.grade" label="Grade">
      <el-select v-model="values.grade" style="width: 100%">
        <el-option
          v-for="item in QuizGradeOptions"
          :key="`grade-${item.value}`"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item :error="errors.level" label="Level">
      <el-select v-model="values.level" style="width: 100%">
        <el-option
          v-for="item in QuizLevelOptions"
          :key="`level-${item.value}`"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="!disabled && !hideSubmit" style="margin-bottom: 0">
      <el-button type="primary" native-type="submit">{{
        submitText
      }}</el-button>
    </el-form-item>
  </el-form>
</template>
