<script setup lang="ts">
  import { processAuth } from '~/apps/auth/auth.repository'

  const router = useRouter()

  const { isLoading } = useQuery({
    queryKey: ['process-auth'],
    queryFn: () => processAuth(),
    onSuccess: () => {
      router.push('/home')
    },
    onError: () => {
      router.push('/')
    },
  })
</script>

<template>
  <el-row
    align="middle"
    justify="center"
    style="min-height: 100vh; padding: var(--el-main-padding) 0"
  >
    <el-col :span="24" :md="20" style="max-width: 480px; padding: 20px">
      <el-card :body-style="{ padding: '20px' }">
        <el-row>
          <el-col v-loading="isLoading"></el-col>
        </el-row>
      </el-card>
    </el-col>
  </el-row>
</template>
