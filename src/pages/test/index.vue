<script setup lang="ts">
  const img_url = ref()
</script>

<template>
  <el-row>
    <el-col>
      <select-image v-model="img_url"></select-image>
    </el-col>
  </el-row>
</template>
