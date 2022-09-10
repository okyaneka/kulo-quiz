<route lang="yaml">
name: admin-topic
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import {
    View,
    Check,
    Close,
    ArrowLeft,
    ArrowRight,
  } from '@element-plus/icons-vue'
  import {
    getTopic,
    getTopics,
    setTopic,
    getQuizTopicStatus,
    type QuizTopicStatusCode,
  } from '~/apps/quiz-topic/quiz-topic.repository'

  const page = ref<number>(1)
  const per_page = ref<number>(10)
  const isShowTopicDetail = ref<boolean>(false)
  const topicId = ref<string>()
  const history = ref<string[]>([])

  const topicEnabled = computed<boolean>(
    () => !!topicId.value && isShowTopicDetail.value
  )

  const {
    data: topicsData,
    isFetching: getTopicsLoading,
    refetch: getTopicsData,
  } = useQuery({
    queryKey: ['topics', page, per_page],
    keepPreviousData: true,
    queryFn: () =>
      getTopics({
        page: page.value,
        per_page: per_page.value,
        order: ['status', 'asc'],
      }),
  })

  const {
    data: topic,
    refetch: getTopicData,
    isFetching: getTopicLoading,
  } = useQuery({
    enabled: topicEnabled,
    queryKey: [topicId],
    queryFn: async () => await getTopic(topicId.value as string),
  })

  const { isLoading: approvingLoading, mutate: handleApprove } = useMutation({
    mutationFn: async (id: string) => {
      topicId.value = id
      return await setTopic(id, { status: 2 })
    },
    onSuccess: () => {
      ElMessage.success('Quiz topic approved.')
      getTopicsData.value()
      if (topicEnabled.value) {
        getTopicData.value()
      }
    },
  })

  const { isLoading: rejectingLoading, mutate: handleReject } = useMutation({
    mutationFn: async (id: string) => {
      topicId.value = id
      return await setTopic(id, { status: 1 })
    },
    onSuccess: () => {
      ElMessage.success('Quiz topic rejected.')
      getTopicsData.value()
      if (topicEnabled.value) {
        getTopicData.value()
      }
    },
  })

  function handleDetail(id: string, push?: boolean) {
    if (push) history.value.push(id)
    else history.value = [id]
    isShowTopicDetail.value = true
    topicId.value = id
    getTopicData.value()
  }

  function handleBack() {
    history.value.pop()
    handleDetail(history.value[history.value.length - 1])
  }

  function getType(code: QuizTopicStatusCode) {
    switch (code) {
      case 0:
        return 'info'
      case 1:
        return 'danger'
      case 2:
        return 'success'
    }
  }
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <el-card>
        <el-space fill :size="16" style="width: 100%; max-width: 100%">
          <h1 align="center">Manage Topic</h1>

          <el-table
            :data="topicsData?.rows ?? []"
            v-loading="getTopicsLoading || approvingLoading || rejectingLoading"
            style="width: 100%"
          >
            <el-table-column prop="title" label="Topic Title">
              <template #default="{ row }">
                <div>{{ row.title }}</div>
                <div
                  style="
                    font-size: var(--el-font-size-extra-small);
                    color: var(--el-text-color-secondary);
                  "
                >
                  Req at: {{ row.created_at?.toDate().toLocaleDateString() }}
                </div>
                <div
                  style="
                    font-size: var(--el-font-size-extra-small);
                    color: var(--el-text-color-secondary);
                  "
                >
                  By:
                  <strong v-if="row.author?.displayName">{{
                    row.author.displayName
                  }}</strong>
                  <strong v-else-if="row.author?.email">{{
                    row.author.email
                  }}</strong>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="Status" align="center">
              <template #default="{ row }">
                <div>
                  <el-tag :type="getType(row.status)">{{
                    getQuizTopicStatus(row.status)
                  }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Action" align="right" width="144">
              <template #default="{ row }">
                <el-button
                  type="info"
                  :icon="View"
                  circle
                  @click="handleDetail(row.id)"
                />

                <el-button
                  v-if="row.status != 2"
                  type="success"
                  :icon="Check"
                  circle
                  @click="handleApprove(row.id)"
                />

                <el-popconfirm
                  v-if="row.status == 0"
                  title="Rejecting this?"
                  @confirm="handleReject(row.id)"
                >
                  <template #reference>
                    <el-button type="danger" :icon="Close" circle />
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:currentPage="page"
            layout="prev, pager, next"
            :total="topicsData?.count"
            :page-size="per_page"
          />
        </el-space>
      </el-card>
    </el-col>
  </el-row>

  <el-dialog
    v-model="isShowTopicDetail"
    :width="480"
    @close="topicId = undefined"
    title="Topic Detail"
  >
    <template #header>
      <el-row
        align="middle"
        justify="space-between"
        style="padding-right: 1rem; margin-top: -4px; height: 32px"
      >
        <span class="el-dialog__title">Topic Detail</span>
        <el-button
          v-if="history.length > 1"
          circle
          :icon="ArrowLeft"
          @click="handleBack"
        />
      </el-row>
    </template>
    <el-row v-loading="getTopicLoading || rejectingLoading || approvingLoading">
      <el-col :span="8" style="margin: 0 0 20px">Title</el-col>
      <el-col :span="16" style="margin: 0 0 20px">
        <strong>{{ topic?.title }}</strong>
      </el-col>
      <el-col :span="8" style="margin: 0 0 20px">Parent</el-col>
      <el-col :span="16" style="margin: 0 0 20px">
        <template v-if="topic?.parent">
          <router-link
            to="#"
            @click="handleDetail(topic?.parent?.id as string, true)"
            >{{ topic.parent.title }}</router-link
          >
        </template>
      </el-col>
      <el-col :span="8" style="margin: 0 0 20px">Status</el-col>
      <el-col :span="16" style="margin: 0 0 20px">
        <el-tag v-if="topic?.status != undefined" :type="getType(topic.status)">
          {{ getQuizTopicStatus(topic.status) }}
        </el-tag>
      </el-col>
      <el-col :span="8" style="margin: 0 0 20px">Author</el-col>
      <el-col :span="16" style="margin: 0 0 20px">
        <div v-if="topic?.author?.displayName">
          <strong>{{ topic.author.displayName }}</strong>
        </div>
        <div v-if="topic?.author?.email">
          <strong>{{ topic.author.email }}</strong>
        </div>
      </el-col>
      <el-col :span="8" style="margin: 0 0 20px">Requested at</el-col>
      <el-col :span="16" style="margin: 0 0 20px">
        <strong>{{ topic?.created_at?.toDate().toLocaleDateString() }}</strong>
      </el-col>
    </el-row>
    <template #footer>
      <el-button
        :disabled="rejectingLoading || approvingLoading"
        @click="isShowTopicDetail = false"
        >Close</el-button
      >

      <el-popconfirm
        v-if="topic && topic.status == 0"
        title="Rejecting this?"
        @confirm="handleReject(topic?.id as string)"
      >
        <template #reference>
          <el-button
            :loading="rejectingLoading"
            :disabled="approvingLoading"
            type="danger"
          >
            Reject
          </el-button>
        </template>
      </el-popconfirm>

      <el-button
        v-if="topic && topic.status != 2"
        :disabled="rejectingLoading"
        :loading="approvingLoading"
        type="success"
        @click="handleApprove(topic?.id as string)"
        >Approve</el-button
      >
    </template>
  </el-dialog>
</template>
