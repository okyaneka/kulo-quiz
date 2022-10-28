<script setup lang="ts">
  import type { RouteLocationRaw } from 'vue-router'
  import type { QuizWithMeta } from '~/apps/quiz-inter/quiz-inter.types'
  import { QuizGrade, QuizLevel } from '~/apps/quiz/quiz.types'
  import ElImageFirestore from '../el-image-firestore.vue'

  withDefaults(
    defineProps<{
      height: number
      quiz?: QuizWithMeta
      loading?: boolean
      draft?: boolean
      to: RouteLocationRaw
    }>(),
    { height: 400 }
  )
</script>

<template>
  <el-card
    class="quiz-card"
    shadow="never"
    style="--el-card-border-radius: 0"
    :body-style="{
      display: 'flex',
      padding: 0,
      height: height + 'px',
      position: 'relative',
    }"
  >
    <el-skeleton v-if="loading" animated>
      <template #template>
        <el-skeleton-item
          variant="rect"
          style="height: 100%"
        ></el-skeleton-item>
      </template>
    </el-skeleton>
    <template v-else>
      <div
        style="
          position: absolute;
          top: 0;
          left: 0;
          heihgt: 100%;
          width: 100%;
          opacity: 0.2;
          z-index: 0;
        "
      >
        <el-image-firestore
          v-if="quiz?.image_url"
          :src="quiz.image_url"
          fit="cover"
          style="width: 100%; height: 100%"
        ></el-image-firestore>
      </div>
      <el-space
        class="quiz-info"
        direction="vertical"
        fill
        :size="8"
        style="
          width: 100%;
          align-self: flex-end;
          z-index: 1;
          padding: 24px 8px 8px;
        "
      >
        <router-link v-if="quiz?.id" :to="to" style="color: white">
          <p>
            <strong> {{ quiz?.title }} </strong>
          </p>
        </router-link>

        <el-space wrap>
          <el-tag v-if="quiz?.grade != undefined" size="small" type="warning">{{
            QuizGrade[quiz.grade]
          }}</el-tag>
          <el-tag v-if="quiz?.level != undefined" size="small" type="danger">{{
            QuizLevel[quiz.level]
          }}</el-tag>
        </el-space>

        <el-space v-if="!draft" style="color: var(--el-color-white)">
          <el-space :size="4">
            <el-icon><svg-icon name="edit-2" /></el-icon>
            <strong>{{ quiz?.did_count }}</strong>
          </el-space>
          <el-space :size="4">
            <el-icon><svg-icon name="heart" /></el-icon>
            <strong>{{ quiz?.like_count }}</strong>
          </el-space>
        </el-space>
      </el-space>
    </template>
  </el-card>
</template>

<style scoped>
  .quiz-info {
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.15) 80%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  .quiz-card:hover {
    background-color: var(--el-fill-color);
  }
</style>
