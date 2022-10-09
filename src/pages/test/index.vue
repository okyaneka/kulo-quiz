<script setup lang="ts">
  import QuizScore from '../../composables/components/result/quiz-score.vue'
  import QuizScoreHistory from '../../composables/components/result/quiz-score-history.vue'
  import {
    getResultPreviewData,
    getResultPreviewList,
    getStandingPreviewList,
  } from '~/apps/results/results.repositories'
  import QuizStanding from '../../composables/components/result/quiz-standing.vue'
  import QuizEvaluation from '../../composables/components/result/quiz-evaluation.vue'
  import { useColRef } from '~/plugins/firebase'

  const quiz_id = '6WFhxgiw3iTHoMH3dYDR'
  const result_id = ref<string>()

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['results'],
    queryFn: () => getResultPreviewList(quiz_id),
    onSuccess: (data) => {
      result_id.value = data.rows[1].id
    },
  })

  const { data: standing, isLoading: standingLoading } = useQuery({
    queryKey: ['standing'],
    queryFn: () => getStandingPreviewList(quiz_id),
  })

  const { data: result, isLoading: resultLoading } = useQuery({
    queryKey: ['result', result_id],
    queryFn: () => getResultPreviewData(result_id.value as string),
    enabled: computed(() => result_id.value != undefined),
  })

  const answers = computed(() => result.value?.answers ?? [])

  onMounted(() => {
    getDocs(query(useColRef('answers_preview'))).then((snap) => {
      console.log(snap.size)
    })
  })
</script>

<template>
  <el-row>
    <el-col> </el-col>

    <el-col>
      <quiz-score-history
        :loading="resultsLoading"
        :result="results?.rows ?? []"
      >
        <template #footer>
          <p align="center">
            <router-link to="#">Show all my score</router-link>
          </p>
        </template>
      </quiz-score-history>
    </el-col>

    <el-col>
      <quiz-standing
        :loading="standingLoading"
        :standing="standing?.rows ?? []"
      >
        <template #footer>
          <p v-if="standing != undefined && standing.count > 10" align="center">
            <router-link to="#">Show full standings</router-link>
          </p>
        </template>
      </quiz-standing>
    </el-col>

    <el-col>
      <quiz-evaluation :loading="resultLoading" :answers="answers">
      </quiz-evaluation>
    </el-col>
  </el-row>
</template>
