<script setup lang="ts">
  const props = defineProps<{
    disablePrev?: boolean
    disableNext?: boolean
    showFinish?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'click:prev'): void
    (e: 'click:next'): void
    (e: 'click:other'): void
    (e: 'click:finish'): void
  }>()

  const hold = ref()
  const isHolded = ref(false)

  function endFocus() {
    nextTick().then(() => {
      const activeElement = document.activeElement as HTMLElement
      activeElement.blur()
    })
  }

  function resetHold() {
    clearTimeout(hold.value)
    hold.value = undefined
    isHolded.value = false
  }

  function startHold() {
    hold.value = setTimeout(() => {
      isHolded.value = true
      emit('click:finish')
    }, 500)
  }

  function endHold() {
    if (!isHolded.value && !props.showFinish) emit('click:next')
    else emit('click:finish')
    endFocus()
    resetHold()
  }
</script>

<template>
  <el-row>
    <el-col :span="8" style="text-align: center; margin: 0">
      <el-button
        :disabled="disablePrev"
        size="large"
        type="primary"
        circle
        plain
        @click="$emit('click:prev')"
        @mouseup="endFocus"
        @touchend="endFocus"
      >
        <template #icon>
          <svg-icon name="chevron-left"></svg-icon>
        </template>
      </el-button>
    </el-col>
    <el-col :span="8" style="text-align: center; margin: 0">
      <el-button
        :disabled="disableNext && !showFinish"
        size="large"
        :type="isHolded || showFinish ? 'success' : 'primary'"
        circle
        plain
        @mousedown="startHold"
        @mousemove="resetHold"
        @mouseleave="resetHold"
        @mouseup="endHold"
        @touchstart="startHold"
        @touchmove="resetHold"
        @touchcancel="resetHold"
        @touchend="endHold"
      >
        <template #icon>
          <svg-icon
            :name="isHolded || showFinish ? 'check' : 'chevron-right'"
          ></svg-icon>
        </template>
      </el-button>
    </el-col>
    <el-col :span="8" style="text-align: center; margin: 0">
      <el-button
        size="large"
        type="primary"
        circle
        plain
        @click="$emit('click:other')"
        @mouseup="endFocus"
        @touchend="endFocus"
      >
        <template #icon>
          <svg-icon name="hashtag"></svg-icon>
        </template>
      </el-button>
    </el-col>
  </el-row>
</template>
