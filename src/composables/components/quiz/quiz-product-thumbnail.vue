<script setup lang="ts">
  import { StarFilled, UserFilled } from '@element-plus/icons-vue'
  import type { QuizThumbnail } from '~/apps/quiz/quiz.repositories'

  defineProps<{
    data: QuizThumbnail
  }>()
</script>

<template>
  <el-col :span="12">
    <router-link :to="{ name: 'quiz-detail', params: { id: data.id } }">
      <el-card shadow="hover" :body-style="{ padding: 0 }">
        <el-image :src="data.thumbnail_url" />

        <el-space wrap fill style="padding: 8px 12px 12px">
          <div style="font-size: var(--el-font-size-large)">
            {{ data.title }}
          </div>
          <div style="color: var(--el-text-color-secondary)">
            {{ data.author }}
          </div>
          <div
            style="
              font-size: var(--el-font-size-small);
              color: var(--el-text-color-secondary);
            "
          >
            <el-space v-if="data.rate" :size="4">
              <el-icon color="#ffc400"><StarFilled /></el-icon>
              {{ data.rate }}
            </el-space>
            <el-divider v-if="data.rate && data.player" direction="vertical" />
            <el-space v-if="data.player" :size="4">
              <el-icon><UserFilled /></el-icon>
              {{ data.player }}
            </el-space>
          </div>
        </el-space>
      </el-card>
    </router-link>
  </el-col>
</template>
