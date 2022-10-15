<script setup lang="ts">
  import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types'
  import {
    QuizGrade,
    QuizLevel,
    QuizScheme,
    QuizValidator,
  } from '~/apps/quiz/quiz.schemes'
  import type { QuizPayload } from '~/apps/quiz/quiz.types'
  import { getTopicList } from '~/apps/topic/topic.repository'
  import { TopicStatus } from '~/apps/topic/topic.scheme'
  import type { Topic } from '~/apps/topic/topic.types'

  type QuizPayloadData = Partial<QuizPayload>

  const props = withDefaults(
    defineProps<{
      data: QuizPayloadData
      disabled?: boolean
      submitText?: string
      hideSubmit?: boolean
    }>(),
    { submitText: 'Submit' }
  )

  const emit = defineEmits<{
    (e: 'submit', payload: QuizPayload): void
    (e: 'update:data', payload: QuizPayloadData): void
  }>()

  const topic = ref<string>()
  const topicQuery = ref<string>('')

  // const modelData = computed<QuizPayloadData>({
  //   get() {
  //     return props.data ?? form.value
  //   },
  //   set(value) {
  //     emit('update:data', value)
  //   },
  // })

  const topicOptions = computed<OptionType<Topic>[]>(() => {
    return (
      topics.value?.rows
        .map((v) => ({
          label: v.fulltitle,
          value: v,
        }))
        .filter((v) => {
          return v.label.toLowerCase().includes(topicQuery.value.toLowerCase())
        }) ?? []
    )
  })

  const { values, validate, errors, setValues } = useForm<QuizPayload>({
    validationSchema: QuizValidator,
  })
  useField<QuizPayload['title']>('title')
  useField<QuizPayload['topic']>('topic')
  useField<QuizPayload['grade']>('grade')
  useField<QuizPayload['level']>('level')

  const { data: topics, isFetching: topicsLoading } = useQuery({
    retry: false,
    queryKey: ['topic-list'],
    queryFn: async () =>
      await getTopicList({
        per_page: 0,
        filter: {
          status: {
            value: TopicStatus.rejected,
            operator: '!=',
          },
        },
        orders: [['fulltitle', 'asc']],
      }),
  })

  function handleTopicChanged(id: string) {
    const topic = (topics.value?.rows ?? []).find((v) => v.id == id)
    if (topic) values.topic = { id: topic.id, title: topic.title }
  }

  async function handleSubmit() {
    if ((await validate()).valid) {
      emit('submit', QuizScheme.parse(values))
    }
  }

  watch(values, (value) => {
    emit('update:data', { ...props.data, ...value })
  })

  onMounted(() => {
    setValues(props.data)
    topic.value = props.data.topic?.id
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
        value-key="value.id"
        :remote-method="(e: string) => topicQuery = e"
        :options="topicOptions"
        @change="handleTopicChanged"
        style="width: 100%"
      >
        <template #default="{ item }">
          <el-row
            justify="space-between"
            align="middle"
            style="margin-right: 8px"
          >
            <span style="margin-right: 8px">{{ item.label }}</span>

            <el-tag
              v-if="(item.value as Topic).status != TopicStatus.approved"
              type="warning"
            >
              {{ TopicStatus[(item.value as Topic).status] }}
            </el-tag>
          </el-row>
        </template>

        <template #empty>
          <el-card shadow="never">
            <p style="font-size: var(--el-font-size-base)">
              Topic not found. You can ask for new topic
              <router-link
                target="_blank"
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
        <template v-for="i in QuizGrade" :key="`grade-${i}`">
          <el-option v-if="isNaN(i)" :label="i" :value="QuizGrade[i]" />
        </template>
      </el-select>
    </el-form-item>

    <el-form-item :error="errors.level" label="Level">
      <el-select v-model="values.level" style="width: 100%">
        <template v-for="i in QuizLevel" :key="`level-${i}`">
          <el-option v-if="isNaN(i)" :label="i" :value="QuizLevel[i]" />
        </template>
      </el-select>
    </el-form-item>

    <el-form-item v-if="!disabled && !hideSubmit" style="margin-bottom: 0">
      <el-button type="primary" native-type="submit">
        {{ submitText }}
      </el-button>
    </el-form-item>
  </el-form>
</template>
