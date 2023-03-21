<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      num: number
      numCount: number
      duration: number
      timeUsed: number
    }>(),
    {
      num: 1,
      numCount: 1,
      duration: 0,
      timeUsed: 0,
    }
  )

  const timeLeftFormated = computed(() => {
    const time = props.duration - props.timeUsed
    const sec = (time % 60).toString().padStart(2, '0')
    const min = Math.floor(time / 60)
      .toString()
      .padStart(2, '0')
    return `${min}:${sec}`
  })
</script>

<template>
  <el-row justify="space-between">
    <p>
      <strong>{{ num }}</strong>
      <span
        style="
          color: var(--el-text-color-secondary);
          font-size: var(--el-font-size-extra-small);
        "
        >/{{ numCount }}</span
      >
    </p>
    <p>- {{ timeLeftFormated }}</p>
  </el-row>
</template>
