<route lang="yaml">
name: quiz-review
meta:
  requireAuth: true
</route>

<script setup lang="ts">
  import { gsap } from 'gsap'
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import type { QuizStandingData } from '~/apps/quiz/quiz.repository'

  const score = ref(0)
  const scoreInterval = ref<any>()
  const description = ref<string>()
  const standingsData = ref<QuizStandingData[]>([])
  const isShowDescription = ref<boolean>(false)
  const isShowstandingsData = ref<boolean>(false)
  const standings = ref()

  const authStore = useAuthStore()

  onMounted(() => {
    scoreInterval.value = setInterval(() => {
      score.value += 1
      if (score.value >= 87) {
        clearInterval(scoreInterval.value)
        scoreInterval.value = undefined
        score.value = 87
        description.value =
          'Great! You are doing better than more than 2K other players.'
        standingsData.value.push({
          rank: 1,
          user: {
            uid: authStore.user?.uid as string,
            name: authStore.user?.displayName as string,
            email: authStore.user?.email as string,
          },
          score: 87,
        })
      }
    }, 300 / 87)
  })
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <el-card>
        <el-space fill style="width: 100%">
          <h1 align="center">Your Score!</h1>

          <p align="center" style="font-size: 48px">
            <strong>{{ score }}</strong>
            <span style="font-size: 24px; color: var(--el-text-color-regular)"
              >/100</span
            >
          </p>
          <p class="after-score" align="center" style="padding: 0 48px">
            {{ description }}
          </p>
        </el-space>
      </el-card>
    </el-col>
    <el-col class="after-score">
      <el-card>
        <h1 align="center" style="margin-bottom: 16px">Your Standings!</h1>

        <el-table
          :data="standingsData"
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column
            prop="rank"
            label="#"
            :resizable="false"
            :width="48"
          />
          <el-table-column prop="name" label="Name" :resizable="false">
            <template #default="{ row }">
              <el-space :wrap="false">
                <span>{{ row.user.name ?? row.user.email }}</span>
                <el-button
                  v-if="row.user.uid == authStore.user?.uid"
                  plain
                  type="primary"
                  size="small"
                  >You</el-button
                >
              </el-space>
            </template>
          </el-table-column>
          <el-table-column
            prop="score"
            label="Score"
            :resizable="false"
            align="right"
          />
        </el-table>

        <p align="center">
          <router-link to="#">Show full standings</router-link>
        </p>
      </el-card>
    </el-col>
  </el-row>
</template>
