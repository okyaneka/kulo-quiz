<route lang="yaml">
name: preview-quiz-review
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { gsap } from 'gsap'
  import { Check, Close } from '@element-plus/icons-vue'
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import {
    getQuiz,
    useQuizStore,
    type QuizStandingData,
  } from '~/apps/quiz/quiz.repositories'
  import {
    getResultPreviewData,
    getResultPreviewList,
    getStandingPreviewList,
  } from '~/apps/results/results.repositories'

  const route = useRoute()

  const description = ref<string>()
  const { user } = storeToRefs(useAuthStore())
  const { quiz } = storeToRefs(useQuizStore())

  const lastResult = computed(() => results.value?.rows[0])
  const loadLastResultData = computed(() => !!lastResult.value)
  const evaluations = computed(() => resultData.value?.answers)

  const { data: results } = useQuery({
    queryKey: ['results'],
    queryFn: () => getResultPreviewList(route.params.id as string),
  })

  const { data: standings } = useQuery({
    queryKey: ['standings'],
    queryFn: () => getStandingPreviewList(route.params.id as string),
  })

  const { data: resultData } = useQuery({
    queryKey: ['result-data'],
    queryFn: () => {
      if (lastResult.value == undefined) throw new Error('result_undefined')
      return getResultPreviewData(lastResult.value.id)
    },
    enabled: loadLastResultData,
  })

  // const { isFetching: getQuizLoading } =
  useQuery({
    queryKey: ['quiz'],
    queryFn: () => getQuiz(route.params.id as string),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <el-card>
        <el-space fill style="width: 100%">
          <h1 align="center">Your Last Result!</h1>
          <p
            v-if="lastResult == undefined"
            align="center"
            style="color: var(--el-text-color-secondary)"
          >
            No Data
          </p>
          <template v-else>
            <p align="center" style="font-size: 48px">
              <strong>{{ lastResult?.score }}</strong>
              <span style="font-size: 24px; color: var(--el-text-color-regular)"
                >/{{ quiz?.max_point }}</span
              >
            </p>
            <p align="center" style="padding: 0 48px">
              {{ description }}
            </p>
          </template>
        </el-space>
      </el-card>
    </el-col>

    <!-- recent score -->
    <el-col>
      <el-card>
        <h1 align="center" style="margin-bottom: 16px">Recent Score!</h1>

        <el-table
          :data="results?.rows"
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column label="Date" :resizable="false">
            <template #default="{ row }">
              {{ row.created_at?.toDate().toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="Duration"
            prop="duration"
          ></el-table-column>
          <el-table-column label="Score" :resizable="false" align="right">
            <template #default="{ row }">
              <router-link
                :to="{
                  name: 'preview-quiz-review-detail',
                  params: { result_id: row.id },
                }"
              >
                <strong>{{ row.score }}</strong>
              </router-link>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-col>

    <!-- standings -->
    <el-col>
      <el-card>
        <h1 align="center" style="margin-bottom: 16px">Your Standings!</h1>

        <el-table
          :data="standings?.rows"
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column prop="rank" label="#" :resizable="false" :width="48">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="Name" :resizable="false">
            <template #default="{ row }">
              <el-space :wrap="false">
                <span>{{ row.author?.name ?? row.author?.email }}</span>
                <el-tag v-if="row.author?.uid == user?.uid" size="small"
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

    <!-- evaluations -->
    <el-col>
      <el-card>
        <el-row>
          <el-col>
            <h1 align="center">Your Evaluation!</h1>
          </el-col>

          <el-col
            v-for="(answer, index) in evaluations"
            :key="`answer-${index}`"
          >
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
                <!-- question area -->
                <!-- <el-image
                  src="https://img.freepik.com/premium-vector/cartoon-boy-holding-pencil_43633-3024.jpg"
                  style="max-height: 150px"
                  fit="contain"
                /> -->
                <p>{{ answer.question.question }}</p>
                <el-card shadow="never" :body-style="{ padding: '12px' }">
                  <el-space fill :size="8">
                    <p>Your answer</p>
                    <p>
                      <strong v-if="answer.answer">{{ answer.answer }}</strong>
                      <i v-else>Not answered</i>
                    </p>
                  </el-space>
                </el-card>

                <el-card shadow="never" :body-style="{ padding: '12px' }">
                  <el-space fill :size="8">
                    <p>Correct answer</p>
                    <p>
                      <strong>{{
                        Array.isArray(answer.correct_answer)
                          ? answer.correct_answer.join(', ')
                          : answer.correct_answer
                      }}</strong>
                    </p>
                  </el-space>
                </el-card>

                <!-- <el-card
                  shadow="never"
                  :body-style="{ padding: '12px' }"
                  style="background-color: var(--el-)"
                >
                  <el-space fill :size="8">
                    <p><strong>Explanation</strong></p>
                    <p>The kid is holding a pencil</p>
                  </el-space>
                </el-card> -->
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
