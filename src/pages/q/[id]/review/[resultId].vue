<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { getResultData } from '~/apps/results/results.repositories'

  const route = useRoute()
  const {
    data: result,
    isFetching: loading,
    refetch: getResult,
  } = useQuery({
    queryKey: ['result'],
    queryFn: () => getResultData(route.params.resultId as string),
    enabled: false,
  })

  onMounted(() => {
    getResult.value()
  })
</script>

<template>
  <el-row style="padding: 20px 0; min-height: 100vh; flex-direction: column">
    <el-col>
      <quiz-score :loading="loading" :score="result?.score"></quiz-score>
    </el-col>

    <el-col>
      <quiz-evaluation
        :loading="loading"
        :answers="result?.answers ?? []"
      ></quiz-evaluation>
    </el-col>

    <el-col style="position: sticky; bottom: 64px; margin-top: auto">
      <el-card :body-style="{ padding: '12px' }">
        <el-row justify="space-between" align="middle">
          <router-link :to="{ name: 'q-id-review' }">
            <el-button type="primary">Back</el-button>
          </router-link>
          <el-button>Find other quiz</el-button>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>
