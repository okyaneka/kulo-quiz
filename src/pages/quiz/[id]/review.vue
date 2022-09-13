<route lang="yaml">
name: quiz-review
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { gsap } from 'gsap'
  import { Check, Close } from '@element-plus/icons-vue'
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import type { QuizStandingData } from '~/apps/quiz/quiz.repositories'

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
                <el-tag v-if="row.user.uid == authStore.user?.uid" size="small"
                  >You</el-tag
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

    <el-col>
      <el-card>
        <el-row>
          <el-col>
            <h1 align="center">Your Evaluation!</h1>
          </el-col>

          <el-col v-for="i in 10" :key="i">
            <el-card
              shadow="never"
              :style="`--el-card-border-color: ${
                i % 2 == 0
                  ? 'var(--el-color-danger)'
                  : 'var(--el-color-success)'
              }`"
            >
              <h4 style="margin-bottom: 16px">Question #{{ i }}</h4>
              <el-space :size="16" fill style="width: 100%">
                <!-- question area -->
                <el-image
                  src="https://img.freepik.com/premium-vector/cartoon-boy-holding-pencil_43633-3024.jpg"
                  style="max-height: 150px"
                  fit="contain"
                />
                <p>What is andi holding?</p>
                <el-card shadow="never" :body-style="{ padding: '12px' }">
                  <el-space fill :size="8">
                    <p>Your answer</p>
                    <p v-if="i % 2 == 0"><strong>Candy</strong></p>
                    <p v-else><strong>Pencil</strong></p>
                  </el-space>
                </el-card>

                <el-card
                  shadow="never"
                  :body-style="{ padding: '12px' }"
                  style="background-color: var(--el-)"
                >
                  <el-space fill :size="8">
                    <p>Correct answer</p>
                    <p><strong>Pencil</strong></p>
                  </el-space>
                </el-card>

                <el-card
                  shadow="never"
                  :body-style="{ padding: '12px' }"
                  style="background-color: var(--el-)"
                >
                  <el-space fill :size="8">
                    <p><strong>Explanation</strong></p>
                    <p>The kid is holding a pencil</p>
                  </el-space>
                </el-card>
              </el-space>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </el-col>

    <el-col style="position: sticky; bottom: 64px">
      <el-card :body-style="{ padding: '12px' }">
        <el-row justify="space-between" align="middle">
          <el-button type="primary">Requiz?</el-button>
          <el-button>Find other quiz</el-button>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>
