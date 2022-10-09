<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import {
    getResultData,
    getResultList,
    getStandingList,
  } from '~/apps/results/results.repositories'

  const route = useRoute()

  const result_id = ref()

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['results'],
    queryFn: () => getResultList(route.params.id as string),
    onSuccess: (data) => {
      result_id.value = data.rows[0].id
    },
  })

  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings'],
    queryFn: () => getStandingList(route.params.id as string),
  })

  const { data: result, isLoading: resultLoading } = useQuery({
    queryKey: ['result-data'],
    queryFn: () => getResultData(result_id.value),
    enabled: computed(() => result_id.value != undefined),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <quiz-score
        :loading="resultLoading || results == undefined"
        :score="result?.score"
      ></quiz-score>
    </el-col>

    <!-- recent score -->
    <el-col>
      <quiz-score-history
        :loading="resultsLoading"
        :result="results?.rows ?? []"
        @click:score="
          $router.push({
            name: 'q-id-review-resultId',
            params: { resultId: $event },
          })
        "
      >
        <template v-if="false" #footer>
          <p align="center">
            <router-link to="#">Show all my score</router-link>
          </p>
        </template>
      </quiz-score-history>
    </el-col>

    <!-- standings -->
    <el-col>
      <quiz-standing
        :loading="standingsLoading"
        :standing="standings?.rows ?? []"
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
    <el-col>
      <quiz-evaluation
        :loading="resultLoading || results == undefined"
        :answers="result?.answers ?? []"
      ></quiz-evaluation>
    </el-col>

    <el-col
      v-if="!resultLoading && !resultsLoading && !standingsLoading"
      style="position: sticky; bottom: 64px; z-index: 10"
    >
      <el-card :body-style="{ padding: '12px' }">
        <el-row justify="space-between" align="middle">
          <router-link :to="{ name: 'p-id' }">
            <el-button type="primary">Requiz?</el-button>
          </router-link>
          <router-link :to="{ name: 'home' }">
            <el-button>Find other quiz</el-button>
          </router-link>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>
