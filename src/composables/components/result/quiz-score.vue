<script setup lang="ts">
  import anime from 'animejs'

  const props = defineProps<{
    loading?: boolean
    title?: string
    score?: number | string
  }>()

  const score = ref(0)

  const propScore = computed(() => props.score)

  function animateScore() {
    score.value = 0
    anime({
      targets: score,
      value: props.score ?? 0,
      easing: 'linear',
      round: 1,
      duration: 300,
    })
  }

  watch(propScore, () => {
    animateScore()
  })

  onMounted(() => {
    animateScore()
  })
</script>

<template>
  <el-skeleton v-if="loading" animated>
    <template #template>
      <el-skeleton-item variant="rect" style="height: 64px"> </el-skeleton-item>
    </template>
  </el-skeleton>

  <el-card v-else>
    <el-space fill style="width: 100%">
      <h1 align="center">{{ title ?? 'Your Last Score!' }}</h1>

      <p
        v-if="score == undefined"
        align="center"
        style="color: var(--el-text-color-secondary)"
      >
        No Data
      </p>
      <template v-else>
        <p align="center" style="font-size: 48px">
          <strong>{{ score }}</strong>
          <!-- <span style="font-size: 24px; color: var(--el-text-color-regular)"
              >/{{ quiz?.max_point }}</span
            > -->
        </p>
        <!-- <p align="center" style="padding: 0 48px">
            {{ description }}
          </p> -->
      </template>
    </el-space>
  </el-card>
</template>
