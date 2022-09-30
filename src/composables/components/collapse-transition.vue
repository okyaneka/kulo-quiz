<script setup lang="ts">
  import anime from 'animejs'

  const props = withDefaults(
    defineProps<{
      triggerContent?: string
      duration?: number
    }>(),
    {
      duration: 300,
    }
  )

  const isExpand = ref<boolean>(false)
  const height = ref<string>('')
  const lastHeight = ref<string>('')
  const expandedWrapper = ref<HTMLElement>()

  function getAnimeOption(
    el: HTMLElement,
    height: string,
    onComplete: () => any
  ) {
    return {
      targets: el,
      duration: props.duration,
      height: height,
      easing: 'easeInOutQuad',
      complete: () => {
        onComplete()
      },
      update: () => {
        lastHeight.value = getComputedStyle(el).height
      },
    }
  }

  function onBeforeEnter(el: HTMLElement) {
    el.style.height = lastHeight.value != '' ? lastHeight.value : '0px'
  }

  function onEnter(el: HTMLElement, done: () => any) {
    anime(getAnimeOption(el, height.value, done))
  }

  function onAfterEnter(el: HTMLElement) {
    el.style.height = ''
  }
  function onBeforeLeave(el: HTMLElement) {
    el.style.height = lastHeight.value
  }
  function onLeave(el: HTMLElement, done: () => any) {
    anime(getAnimeOption(el, '0px', done))
  }
  onMounted(() => {
    height.value = expandedWrapper.value
      ? getComputedStyle(expandedWrapper.value).height
      : '0px'
  })
  function toggle() {
    isExpand.value = !isExpand.value
  }
</script>

<template>
  <div style="margin-bottom: 8px">
    <slot name="trigger" :toggle="toggle">
      <h3 @click="isExpand = !isExpand" style="cursor: default">
        {{ triggerContent }}
      </h3>
    </slot>
  </div>
  <transition
    :css="false"
    :duration="props.duration"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
  >
    <div ref="expandedWrapper" v-show="isExpand">
      <slot />
    </div>
  </transition>
</template>
