<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import type { OptionType } from 'element-plus/es/components/select-v2/src/select.types'
  import { addTopic, getTopicList } from '~/apps/topic/topic.repository'
  import {
    TopicStatus,
    TopicScheme,
    TopicValidator,
  } from '~/apps/topic/topic.scheme'
  import type { Topic, TopicPayload } from '~/apps/topic/topic.types'

  const route = useRoute()

  const isShowDrawer = ref<boolean>(false)

  const options = computed<OptionType[]>(() => {
    return parentOptions.value?.rows
      ? parentOptions.value.rows.reduce((car: OptionType[], topic) => {
          if (typeof topic != 'string')
            car.push({
              value: topic,
              label: topic.fulltitle,
            })
          return car
        }, [])
      : []
  })

  const { data: parentOptions, isFetching: parentOptionsLoading } = useQuery({
    retry: false,
    queryKey: ['quiz-topics'],
    queryFn: async () =>
      await getTopicList({
        per_page: 0,
        filter: {
          status: {
            value: TopicStatus.Rejected,
            operator: '!=',
          },
        },
        orders: [['fulltitle', 'asc']],
      }),
  })

  const { mutate, isLoading: addTopicLoading } = useMutation({
    mutationFn: (payload: TopicPayload) => addTopic(payload),
    onSuccess: () => {
      isShowDrawer.value = true
      parent.value = undefined
      resetForm()
    },
  })

  const { validate, values, errors, resetForm } = useForm<TopicPayload>({
    validationSchema: TopicValidator,
    initialValues: {
      title: '',
      parent: null,
      description: null,
      status: TopicStatus.Trial,
    },
  })
  useField<Topic['title']>('title')
  useField<Topic['description']>('description')
  useField<Topic['parent']>('parent')

  const parent = ref<string>()

  function handleChangeParent(id: string) {
    const topic = parentOptions.value?.rows.find((topic) => {
      if (typeof topic != 'string') return topic.id == id
    })
    values.parent =
      topic && typeof topic != 'string'
        ? { id: topic.id, title: topic.title }
        : null
  }

  async function handleSubmit() {
    if ((await validate()).valid) {
      mutate(TopicScheme.parse(values))
    }
  }

  onMounted(() => {
    values.title = (route.query.title ?? '') as string
  })
</script>

<template>
  <el-card v-loading="addTopicLoading" shadow="never">
    <el-row>
      <el-col>
        <el-space fill style="width: 100%">
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
      </el-col>
      <el-col>
        <el-form label-position="top" @submit.prevent="handleSubmit">
          <el-form-item :error="errors.title" label="Topic title">
            <el-input v-model="values.title" type="text"></el-input>
          </el-form-item>

          <el-form-item :error="errors.parent" label="Parent Topic (if exists)">
            <el-select-v2
              v-model="parent"
              :disabled="!options.length"
              :loading="parentOptionsLoading"
              :options="options"
              value-key="value.id"
              filterable
              clearable
              @clear="values.parent = null"
              @change="handleChangeParent"
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
                    v-if="(item.value as Topic).status != TopicStatus.Approved"
                    type="warning"
                  >
                    {{ TopicStatus[(item.value as Topic).status] }}
                  </el-tag>
                </el-row>
              </template>
            </el-select-v2>
          </el-form-item>

          <el-form-item
            :error="errors.description"
            label="Description (reason why this topic should be exists)"
          >
            <el-input v-model="values.description" type="textarea"> </el-input>
          </el-form-item>

          <el-form-item style="margin-bottom: 0">
            <el-button type="primary" native-type="submit"
              >Request new Topic</el-button
            >
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-card>

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
