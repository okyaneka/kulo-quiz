<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import type { Result } from '~/apps/results/results.types'

  defineProps<{
    loading: boolean
    standing: Result[]
  }>()

  const { user } = storeToRefs(useAuthStore())
</script>

<template>
  <el-skeleton v-if="loading" animated>
    <template #template>
      <el-skeleton-item variant="rect" style="height: 64px"> </el-skeleton-item>
    </template>
  </el-skeleton>

  <el-card v-else>
    <h1 align="center" style="margin-bottom: 16px">Your Standings!</h1>

    <el-table :data="standing" style="width: 100%; margin-bottom: 16px">
      <el-table-column prop="rank" label="#" :resizable="false" :width="48">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" :resizable="false">
        <template #default="{ row }">
          <el-space :wrap="false">
            <span>{{ row.author.name ?? row.author.email }}</span>
            <el-tag v-if="row.author.uid == user?.uid" size="small">You</el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column
        prop="score"
        label="Score"
        :resizable="false"
        align="right"
      />
    </el-table>

    <slot name="footer"></slot>
  </el-card>
</template>
