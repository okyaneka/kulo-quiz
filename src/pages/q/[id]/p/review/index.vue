<route lang="yaml">
meta:
  layout: private
  requireAuth: true
  name: Review Kuis Preview
</route>

<script setup lang="ts">
  import {
    getResultPreviewData,
    getResultPreviewList,
    getStandingPreviewList,
  } from '~/apps/results/results.repositories'

  const route = useRoute()
  const router = useRouter()

  const result_id = ref()

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['results'],
    queryFn: () => getResultPreviewList(route.params.id as string),
    onSuccess: (data) => {
      if (typeof data.rows[0] != 'string') result_id.value = data.rows[0].id
    },
  })

  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings'],
    queryFn: () => getStandingPreviewList(route.params.id as string),
  })

  const { data: result, isLoading: resultLoading } = useQuery({
    queryKey: ['result-data', result_id],
    queryFn: () => getResultPreviewData(result_id.value),
    enabled: computed(() => result_id.value != undefined),
    refetchOnMount: true,
  })

  function handleDetail(resultId: string) {
    console.log('q-id-p-review-resultId')

    router.push({
      name: 'q-id-p-review-resultId',
      params: { resultId },
    })
  }
</script>

<template>
  <el-row>
    <el-col style="padding: 20px 20px 0">
      <quiz-score
        v-if="result"
        :loading="resultLoading"
        :score="result.score"
      ></quiz-score>
    </el-col>

    <!-- recent score -->
    <el-col v-if="results" style="padding: 0 20px">
      <quiz-score-history
        :loading="resultsLoading"
        :result="results.rows ?? []"
        @click:score="handleDetail"
      >
        <template v-if="false" #footer>
          <p align="center">
            <router-link to="#">Show all my score</router-link>
          </p>
        </template>
      </quiz-score-history>
    </el-col>

    <!-- standings -->
    <el-col v-if="standings" style="padding: 0 20px">
      <quiz-standing
        :loading="standingsLoading"
        :standing="standings.rows ?? []"
      >
        <template #footer>
          <p
            v-if="standings != undefined && standings.count > 10"
            align="center"
          >
            <router-link to="#">Show full standings</router-link>
          </p>
        </template>
      </quiz-standing>
    </el-col>

    <!-- evaluations -->
    <el-col style="padding: 0 20px">
      <quiz-evaluation
        :loading="resultLoading || results == undefined"
        :answers="result?.answers ?? []"
      ></quiz-evaluation>
    </el-col>

    <el-col
      v-if="!resultLoading && !resultsLoading && !standingsLoading"
      style="position: sticky; bottom: 56px; z-index: 10"
    >
      <el-card shadow="never" :bodyStyle="{ padding: '8px' }">
        <router-link :to="{ name: 'q-id-p' }">
          <el-button type="primary" style="width: 100%"
            >Retest Preview?</el-button
          >
        </router-link>
      </el-card>
    </el-col>
  </el-row>
</template>
