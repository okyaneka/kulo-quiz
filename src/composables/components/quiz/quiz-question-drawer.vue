<script setup lang="ts">
  defineProps<{
    modelValue: boolean
    num: number
    numCount: number
  }>()

  defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'click:num', value: number): void
  }>()
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    direction="btt"
    :show-close="false"
    :withHeader="false"
  >
    <el-space :size="8" wrap style="justify-content: center">
      <el-button
        v-for="i in numCount"
        :key="i"
        style="width: 3rem"
        :type="num == i ? 'primary' : undefined"
        @click="$emit('click:num', i)"
      >
        {{ i }}
      </el-button>
    </el-space>
  </el-drawer>
</template>
