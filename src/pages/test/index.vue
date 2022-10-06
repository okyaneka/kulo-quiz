<script setup lang="ts">
  import type QuizTimerIndicator from '~/composables/components/quiz/quiz-timer-indicator.vue'

  const durationData = ref(3)
  const startData = ref(false)
  const timeUsedData = ref(0)
  const timer = ref<InstanceType<typeof QuizTimerIndicator> | null>(null)

  function start() {
    timer.value?.start()
    startData.value = true
  }

  function pause() {
    timer.value?.pause()
  }

  function end() {
    timer.value?.end()
    startData.value = false
  }

  function resume() {
    timer.value?.resume()
  }
</script>

<template>
  <el-row>
    <el-col>
      <el-button @click="start">start</el-button>
      <el-button @click="end">end </el-button>
      <el-button @click="pause">pause </el-button>
      <el-button @click="resume">resume</el-button>
    </el-col>

    <el-col>
      <div>duration: {{ durationData }}</div>
      <div>start: {{ startData }}</div>
      <div>timeUsed: {{ timeUsedData }}</div>
    </el-col>
    <el-col>
      <quiz-timer-indicator
        ref="timer"
        :duration="durationData"
        v-model:start="startData"
        v-model:timeUsed="timeUsedData"
      ></quiz-timer-indicator>
    </el-col>
  </el-row>
</template>
