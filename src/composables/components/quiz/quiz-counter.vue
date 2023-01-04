<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'end'): void
  }>()

  const counter = ref<number>(3)
  const counterInterval = ref()

  function startCounter() {
    counterInterval.value = setInterval(() => {
      if (--counter.value == 0) {
        clearInterval(counterInterval.value)
        emit('end')
      }
    }, 1000)
  }

  onMounted(() => {
    startCounter()
  })
</script>

<template>
  <el-space fill wrap style="width: 100%">
    <p align="center">
      <em>We will getting started in:</em>
    </p>
    <p align="center" style="font-size: 48px">
      <strong>{{ counter }}</strong>
    </p>
  </el-space>
</template>
