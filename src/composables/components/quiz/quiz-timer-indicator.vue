<script setup lang="ts">
  import anime from 'animejs'

  const props = withDefaults(
    defineProps<{
      duration?: number
      start?: boolean
      timeUsed: number
    }>(),
    {
      duration: 0,
      start: false,
      timeUsed: 0,
    }
  )

  const emit = defineEmits<{
    (e: 'update:start', value: boolean): void
    (e: 'update:timeUsed', value: number): void
    (e: 'end'): void
  }>()

  const _start = ref(false)
  const timer = ref()
  const _timeUsed = ref(0)
  const timerEl = ref<HTMLDivElement>()
  const timerAnime = ref<anime.AnimeInstance>()

  const start = computed({
    get: () => props.start,
    set: (value) => {
      _start.value = value
      emit('update:start', value)
    },
  })

  const timeUsed = computed({
    get: () => props.timeUsed,
    set: (value) => {
      _timeUsed.value = value
      emit('update:timeUsed', value)
    },
  })

  function startInterval() {
    endInterval()
    timeUsed.value = 0
    timer.value = setInterval(() => {
      timeUsed.value++
    }, 1e3)
  }

  function endInterval() {
    clearInterval(timer.value)
    timer.value = undefined
  }

  function startTimer() {
    startInterval()
    timerAnime.value = anime({
      targets: timerEl.value,
      duration: props.duration * 1e3 - 100,
      width: '100%',
      easing: 'linear',
      complete: () => endQuizTimer(),
    })
  }

  function endQuizTimer() {
    timerAnime.value?.pause()
    anime({
      targets: timerEl.value,
      duration: 100,
      width: '0%',
      easing: 'linear',
      complete() {
        start.value = false
        endInterval()
        emit('end')
      },
    })
  }

  watchEffect(() => {
    if (start.value || _start.value) startTimer()
    else if (!start.value || !_start.value) endQuizTimer()
  })
</script>

<template>
  <div class="timer-wrapper">
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
