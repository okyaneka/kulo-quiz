<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'

  const { user: authUser } = storeToRefs(useAuthStore())

  const active = ref<string>('my')
</script>

<template>
  <el-row style="padding: 20px">
    <el-col>
      <el-card>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-avatar :size="128" style="max-width: 100%"></el-avatar>
          </el-col>
          <el-col :span="16" style="margin: 0">
            <h3 style="margin-bottom: 8px">
              {{ authUser?.displayName ?? '-' }}
            </h3>
            <el-button>Edit Profil</el-button>
          </el-col>
        </el-row>
      </el-card>
    </el-col>

    <el-col>
      <el-card :body-style="{ padding: '8px 0' }">
        <el-tabs v-model="active" stretch>
          <el-tab-pane name="my" label="My Quiz"> </el-tab-pane>
          <el-tab-pane name="all" label="Draft"> </el-tab-pane>
          <el-tab-pane name="s" label="Saved"> </el-tab-pane>
        </el-tabs>
        <router-view />
      </el-card>
    </el-col>
  </el-row>
</template>
