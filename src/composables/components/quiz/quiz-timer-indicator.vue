<script setup lang="ts">
  import anime from 'animejs'

  const props = withDefaults(
    defineProps<{
      autoStart: boolean
      duration?: number
      timeUsed: number
    }>(),
    { duration: 0, timeUsed: 0 }
  )

  const emit = defineEmits<{
    (e: 'update:timeUsed', value: number): void
    (e: 'end'): void
  }>()

  const timerEl = ref<HTMLDivElement>()
  const timerAnime = ref<anime.AnimeInstance>()
  const timeUsedMs = ref(0)

  const timeUsed = computed({
    get: () => props.timeUsed,
    set: (value) => emit('update:timeUsed', value),
  })

  function start() {
    if (timerAnime.value == undefined) {
      timerAnime.value = anime({
        targets: timerEl.value,
        duration: props.duration * 1e3 - 200,
        width: '100%',
        easing: 'linear',
        update(anim) {
          timeUsedMs.value = Math.floor(anim.currentTime)
          timeUsed.value = Math.floor(timeUsedMs.value / 1e3)
        },
        complete: end,
      })
    } else {
      timerAnime.value.restart()
    }
  }

  function end() {
    timerAnime.value?.pause()
    timerAnime.value = undefined
    anime({
      targets: timerEl.value,
      duration: 100,
      width: '0%',
      easing: 'linear',
      complete() {
        emit('end')
      },
    })
  }

  function pause() {
    timerAnime.value?.pause()
  }
  function resume() {
    timerAnime.value?.play()
  }

  defineExpose({
    start,
    pause,
    resume,
    end,
  })

  onMounted(() => {
    if (props.autoStart) start()
  })
</script>

<template>
  <div class="timer-wrapper" style="margin: 8px 0 0">
    <div ref="timerEl" class="timer-progress"></div>
  </div>
</template>

<style scoped>
  .timer-wrapper {
    height: 6px;
    background-color: var(--el-fill-color);
    border-radius: 3px;
  }
  .timer-progress {
    border-radius: 3px;
    height: 100%;
    background-color: var(--el-color-primary);
    width: 0%;
  }
</style>
