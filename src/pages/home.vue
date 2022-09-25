<route lang="yaml">
meta:
  requireAuth: true
  layout: private
</route>

<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import LOGO from '~/assets/images/logo-text.png'
  import { Collection } from '@element-plus/icons-vue'

  const authStore = useAuthStore()

  const user = ref(authStore.user)
</script>

<template>
  <el-row :gutter="24" style="padding: 20px">
    <el-col :span="24">
      <el-card>
        <el-space :size="32" direction="vertical" fill style="width: 100%">
          <el-image :src="LOGO" style="height: 32px" fit="contain" />
        </el-space>
      </el-card>
    </el-col>
    <el-col :span="24">
      <h1 align="center">Welcome {{ user?.displayName ?? user?.email }}!</h1>
    </el-col>
    <el-col :span="24">
      <el-carousel trigger="click" height="150px">
        <el-carousel-item v-for="item in 4" :key="item">
          <h3 class="small justify-center">{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
    </el-col>
    <el-col :span="24" :md="12">
      <router-link to="/quiz">
        <el-card shadow="hover">
          <el-space direction="vertical" fill :size="8" style="width: 100%">
            <p align="center">
              <el-icon :size="48" color="var(--el-color-primary)"
                ><Collection />
              </el-icon>
            </p>
            <p align="center" style="color: var(--el-color-primary)">
              Browse Quiz
            </p>
          </el-space>
        </el-card>
      </router-link>
    </el-col>
  </el-row>
</template>

<style scoped>
  .el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
    text-align: center;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
  }
</style>
