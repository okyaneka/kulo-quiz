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
  <el-row style="min-height: calc(100vh - 56px); flex-direction: column">
    <el-col style="padding: 20px 20px 0">
      <quiz-score
        :loading="loading"
        title="Score"
        :score="result?.score"
      ></quiz-score>
    </el-col>

    <el-col style="padding: 0 20px">
      <quiz-evaluation
        :loading="loading"
        :answers="result?.answers ?? []"
      ></quiz-evaluation>
    </el-col>

    <el-col style="position: sticky; bottom: 56px; margin-top: auto">
      <el-card shadow="never" :body-style="{ padding: '20px' }">
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
