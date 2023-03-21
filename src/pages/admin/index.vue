<route lang="yaml">
name: admin
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { Collection } from '@element-plus/icons-vue'
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <h1 align="center">Welcome Admin!</h1>
    </el-col>

    <el-col :sm="8">
      <router-link to="/admin/topic">
        <el-card shadow="hover">
          <el-space direction="vertical" fill :size="8" style="width: 100%">
            <p align="center">
              <el-icon :size="48" color="var(--el-color-primary)"
                ><Collection />
              </el-icon>
            </p>
            <p align="center">Topic</p>
          </el-space>
        </el-card>
      </router-link>
    </el-col>
  </el-row>
</template>
