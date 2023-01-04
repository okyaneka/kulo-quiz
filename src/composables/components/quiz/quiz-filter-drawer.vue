<script setup lang="ts">
  defineProps<{ modelValue: boolean }>()
  defineEmits(['update:modelValue'])
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    direction="btt"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    apa lu?
  </el-drawer>
</template>
