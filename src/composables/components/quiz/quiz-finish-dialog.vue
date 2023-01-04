<script setup lang="ts">
  defineProps<{
    modelValue: boolean
    timesUp: boolean
    loading: boolean
  }>()

  defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'click:cancel'): void
    (e: 'click:confirm'): void
  }>()
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="80%"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-space fill style="width: 100%">
      <h1 align="center" style="margin-bottom: 16px; word-break: normal">
        <template v-if="timesUp"> Time is up. Finish the Quiz! </template>
        <template v-else> Are you sure to finish this quiz? </template>
      </h1>
    </el-space>
    <el-space style="width: 100%; justify-content: center">
      <el-button
        v-if="!timesUp"
        :disabled="loading"
        size="large"
        @click="$emit('click:cancel')"
        >Cancel</el-button
      >
      <el-button
        :loading="loading"
        type="primary"
        size="large"
        @click="$emit('click:confirm')"
        >Finish</el-button
      >
    </el-space>
  </el-dialog>
</template>
