<script setup lang="ts">
  import type { Result } from '~/apps/results/results.types'

  defineProps<{
    loading: boolean
    result: Result[]
  }>()

  const emit = defineEmits<{
    (e: 'click:score', value: string): void
  }>()

  function handleClickScore(id: string) {
    emit('click:score', id)
  }
</script>

<template>
  <el-skeleton v-if="loading" animated>
    <template #template>
      <el-skeleton-item variant="rect" style="height: 64px"> </el-skeleton-item>
    </template>
  </el-skeleton>

  <el-card v-else>
    <h1 align="center" style="margin-bottom: 16px">Recent Score!</h1>

    <el-table :data="result" style="width: 100%; margin-bottom: 16px">
      <el-table-column label="Date" :resizable="false">
        <template #default="{ row }">
          <span style="white-space: nowrap">
            {{ row.created_at.toDate().toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="Duration"
        prop="duration"
      ></el-table-column>
      <el-table-column label="Score" :resizable="false" align="right">
        <template #default="{ row }">
          <a href="#" @click.prevent="handleClickScore(row.id)">
            <strong>{{ row.score }}</strong>
          </a>
        </template>
      </el-table-column>
    </el-table>

    <slot name="footer"> </slot>
  </el-card>
</template>
