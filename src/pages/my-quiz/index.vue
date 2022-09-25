<route lang="yaml">
name: my-quiz
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { getGrade, getLevel, getStatus } from '~/apps/quiz/quiz.helpers'
  import { getQuizList } from '~/apps/quiz/quiz.repositories'
  import { EditPen, Share } from '@element-plus/icons-vue'

  const page = ref<number>(1)
  const per_page = ref<number>(10)
  const isShowFullTitle = ref<Record<number, boolean>>({})

  const { data: quizsData, isFetching: getQuizListLoading } = useQuery({
    keepPreviousData: true,
    queryKey: ['quizs', page, per_page],
    queryFn: () => getQuizList({ page: page.value, per_page: per_page.value }),
  })

  function toggleFullTitle(index: number) {
    isShowFullTitle.value[index] = !isShowFullTitle.value[index]
  }
  function isTitleShow(index: number): boolean {
    return isShowFullTitle.value[index]
  }
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <h1 align="center">My Quiz</h1>
    </el-col>

    <el-col>
      <el-card>
        <!-- :show-header="false" -->
        <el-table
          v-loading="getQuizListLoading"
          :data="quizsData?.rows ?? []"
          :cell-style="{ verticalAlign: 'top' }"
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column label="Title" min-width="152">
            <template #default="{ row, $index }">
              <div style="max-width: 128px">
                <el-space fill :size="4" style="max-width: 100%">
                  <h3
                    :style="{
                      whiteSpace: isTitleShow($index) ? 'pre-wrap' : 'nowrap',
                    }"
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      max-width: 100%;
                    "
                    @click="toggleFullTitle($index)"
                  >
                    {{ row.title }}
                  </h3>
                  <p style="white-space: nowrap">
                    <router-link
                      title="Edit Quiz"
                      :to="{ name: 'edit-quiz-detail', params: { id: row.id } }"
                    >
                      <el-button
                        size="small"
                        circle
                        type="warning"
                        :icon="EditPen"
                      />
                    </router-link>
                  </p>
                  <p style="font-size: var(--el-font-size-extra-small)">
                    {{ row.created_at.toDate().toLocaleDateString() }}
                  </p>
                </el-space>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Status" align="center" min-width="96">
            <template #default="{ row }">
              <el-tag :type="row.status == 0 ? 'warning' : 'success'">{{
                getStatus(row.status)
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Info" align="center" min-width="124">
            <template #default="{ row }">
              <el-space :size="2" alignment="start" direction="vertical">
                <p>
                  Topic: <strong>{{ row.topic.title }}</strong>
                </p>
                <p>
                  Grade: <strong>{{ getGrade(row.grade) }}</strong>
                </p>
                <p>
                  Level: <strong>{{ getLevel(row.level) }}</strong>
                </p>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column
            v-if="false"
            label="Action"
            align="center"
            width="72"
            fixed="right"
          >
            <template #default="{ row }">
              <router-link
                :to="{ name: 'edit-quiz-detail', params: { id: row.id } }"
              >
                <el-button type="warning" :icon="EditPen" circle />
              </router-link>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:currentPage="page"
          layout="prev, pager, next"
          :total="quizsData?.count"
          :page-size="per_page"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
