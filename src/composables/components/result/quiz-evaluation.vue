<script setup lang="ts">
  import type { Answer } from '~/apps/results/results.types'

  defineProps<{
    loading: boolean
    answers: Answer[]
  }>()
</script>

<template>
  <el-skeleton v-if="loading" animated>
    <template #template>
      <el-skeleton-item variant="rect" style="height: 64px"> </el-skeleton-item>
    </template>
  </el-skeleton>

  <el-card v-else-if="answers.length > 0">
    <el-row>
      <el-col>
        <h1 align="center">Your Evaluation!</h1>
      </el-col>

      <el-col v-for="(answer, index) in answers" :key="`answer-${index}`">
        <el-card
          shadow="never"
          :style="`--el-card-border-color: ${
            answer.is_correct
              ? 'var(--el-color-success)'
              : 'var(--el-color-danger)'
          }`"
        >
          <h4 style="margin-bottom: 16px">Question #{{ index + 1 }}</h4>
          <el-space :size="16" fill style="width: 100%">
            <p v-if="answer.question.image_url" align="center">
              <el-image-firestore
                :src="answer.question.image_url"
              ></el-image-firestore>
            </p>
            <p>{{ answer.question.question }}</p>
            <el-card shadow="never" :body-style="{ padding: '12px' }">
              <el-space fill :size="8">
                <p>Your answer</p>
                <p>
                  <strong v-if="answer.answer">{{ answer.answer.text }}</strong>
                  <i v-else>Not answered</i>
                </p>
              </el-space>
            </el-card>

            <el-card shadow="never" :body-style="{ padding: '12px' }">
              <el-space fill :size="8">
                <p>Correct answer</p>
                <p>
                  <strong>{{
                    answer.correct_answer.map((v) => v.text).join(', ')
                  }}</strong>
                </p>
              </el-space>
            </el-card>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
