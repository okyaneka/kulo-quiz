<script setup lang="ts">
  import QuizTimerIndicator from '../../composables/components/quiz/quiz-timer-indicator.vue'
</script>

<template>
  <el-row>
    <el-col>
      <quiz-timer-indicator autoStart :duration="10"></quiz-timer-indicator>
    </el-col>
  </el-row>
</template>
