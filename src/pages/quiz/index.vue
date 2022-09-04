<route lang="yaml">
name: quiz
meta:
  requireAuth: true
  layout: private
</route>

<script setup lang="ts">
  import { Search, CircleCloseFilled, Filter } from '@element-plus/icons-vue'
  import type {
    QuizThumbnail,
    SearchPayload,
  } from '~/apps/quiz/quiz.repository'
  import QuizFilterDrawer from '~/components/quiz/quiz-filter-drawer.vue'
  import QuizProductThumbnail from '../../components/quiz/quiz-product-thumbnail.vue'

  const search = ref<SearchPayload>({})
  const query = ref<string>()
  const isShowFilter = ref<boolean>(false)
  const data = ref<QuizThumbnail>({
    id: '1',
    author: 'Kulo',
    player: 124,
    rate: 4.9,
    thumbnail_url: 'https://i.ytimg.com/vi/G0csLYhDiNk/maxresdefault.jpg',
    title: 'Quiz',
  })

  function showFilter() {
    isShowFilter.value = true
  }

  function handleSubmit() {
    query.value = search.value.query
    // console.log('code run here')
  }
</script>

<template>
  <el-row :gutter="20" style="position: sticky; padding: 20px 0">
    <el-col>
      <el-form
        action
        :model="search"
        label-position="top"
        @submit.prevent="handleSubmit()"
      >
        <el-form-item>
          <el-input
            type="search"
            v-model="search.query"
            placeholder="Browse a Quiz!"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #suffix>
              <el-button
                v-if="!!search.query"
                circle
                link
                type="primary"
                :icon="CircleCloseFilled"
                @click="search.query = undefined"
              />
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <div>
        <el-scrollbar :view-style="{ display: 'flex', width: 'fit-content' }">
          <el-button :icon="Filter" @click="showFilter()">
            Need more spesific?
          </el-button>
          <el-divider direction="vertical" style="height: auto" />
          <el-button v-for="i in 20" :key="i" style="">a {{ i }}</el-button>
        </el-scrollbar>
      </div>
    </el-col>

    <el-col>
      <p>Search result for "{{ query }}".</p>
    </el-col>

    <QuizProductThumbnail v-for="i in 20" :key="i" :data="data" />

    <el-col>
      <el-pagination
        hide-on-single-page
        layout="prev, pager, next"
        :total="5000"
        :pager-count="5"
        style="justify-content: center"
      ></el-pagination>
    </el-col>
  </el-row>

  <QuizFilterDrawer v-model="isShowFilter" />
</template>
