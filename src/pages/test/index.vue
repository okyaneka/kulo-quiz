<route lang="yaml">
meta:
  layout: private
</route>

<script setup lang="ts">
  import QuizFloatingActions from '../../composables/components/quiz/quiz-floating-actions.vue'

  function randomBackground(): string {
    function randomHex(): string {
      return Math.round(Math.random() * 256).toString(16)
    }
    const r = randomHex()
    const g = randomHex()
    const b = randomHex()
    return `#${r}${g}${b}`
  }

  onMounted(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory'
  })
</script>

<template>
  <el-row>
    <el-col
      class="content"
      v-for="i in 3"
      :key="i"
      style="
        height: calc(100vh - 56px);
        overflow: hidden;
        margin: 0;
        position: relative;
      "
      :style="{ backgroundColor: randomBackground() }"
    >
      <el-row>
        <el-col style="text-align: center">
          <el-button v-for="i in 100" :key="i" style="margin: 8px"
            >Angka {{ i }}</el-button
          >
        </el-col>
      </el-row>
      <quiz-floating-actions></quiz-floating-actions>
    </el-col>
  </el-row>
</template>

<style scoped>
  .content {
    scroll-snap-align: start;
  }
</style>
