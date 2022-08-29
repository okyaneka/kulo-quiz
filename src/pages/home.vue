<route lang="yaml">
meta:
  requireAuth: true
</route>

<script setup lang="ts">
  import { useMutation } from 'vue-query'
  import { logout, useAuthStore } from '~/apps/auth/auth.repository'
  import LOGO from '~/assets/images/logo-text.png'

  const authStore = useAuthStore()
  const router = useRouter()

  const user = ref(authStore.user)

  const { mutate: handleLogout } = useMutation(() => logout(), {
    onSuccess: () => {
      router.push('/login')
      ElMessage.success('logged out')
    },
    onError: (error: Error) => {
      ElMessage.error(error.message)
    },
  })
</script>

<template>
  <el-row
    align="middle"
    justify="center"
    style="min-height: 100vh; padding: var(--el-main-padding) 0"
  >
    <el-col :span="24" :lg="16" :md="20">
      <el-card>
        <el-space :size="32" wrap fill style="width: 100%">
          <el-space />

          <el-image :src="LOGO" style="" />

          <h1 align="center">
            Welcome {{ user?.displayName ?? user?.email }}!
          </h1>

          <el-button type="primary" @click="handleLogout()">Logout</el-button>
        </el-space>
      </el-card>
    </el-col>
  </el-row>
</template>
