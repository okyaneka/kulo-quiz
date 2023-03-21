<script setup lang="ts">
  import anime from 'animejs'
  import type { QuizMeta } from '~/apps/quiz-inter/quiz-inter.types'

  type ButtonKey = 'like' | 'comment' | 'save' | 'share' | 'open'

  interface ButtonAction {
    key: ButtonKey
    icon: string
    color: string
  }

  const props = defineProps<{
    quizId: string
    navbar?: boolean
    hideLike?: boolean
    hideComment?: boolean
    hideSave?: boolean
    hideShare?: boolean
    hideOpen?: boolean
    meta?: QuizMeta
  }>()

  const emit = defineEmits<{
    (e: 'click:like', value: string): void
    (e: 'click:comment', value: string): void
    (e: 'click:save', value: string): void
    (e: 'click:share', value: string): void
    (e: 'click:open', value: string): void
  }>()

  const _anime = ref<anime.AnimeInstance>()
  const actions = ref<(HTMLDivElement | null)[]>([])

  const buttons = computed<ButtonAction[]>(() => {
    const b: ButtonAction[] = []
    if (!props.hideLike)
      b.push({ key: 'like', icon: 'heart', color: '#ef233c' })
    if (!props.hideComment)
      b.push({ key: 'comment', icon: 'messages-1', color: '#70e000' })
    if (!props.hideSave)
      b.push({ key: 'save', icon: 'archive-add', color: '#ffd60a' })
    if (!props.hideShare)
      b.push({ key: 'share', icon: 'send-2', color: '#4cc9f0' })
    if (!props.hideOpen)
      b.push({ key: 'open', icon: 'note-1', color: '#d557ff' })
    return b
  })

  function getCount(key: ButtonKey) {
    if (key == 'comment') return props.meta?.comment_count ?? 0
    if (key == 'like') return props.meta?.like_count ?? 0
    if (key == 'save') return props.meta?.save_count ?? 0
    if (key == 'share') return props.meta?.share_count ?? 0
    if (key == 'open') return props.meta?.did_count ?? 0
    return 0
  }

  function handleClickAction(key: ButtonKey) {
    if (key == 'like') emit('click:like', props.quizId)
    if (key == 'comment') emit('click:comment', props.quizId)
    if (key == 'save') emit('click:save', props.quizId)
    if (key == 'share') emit('click:share', props.quizId)
    if (key == 'open') emit('click:open', props.quizId)
  }

  function isActive(key: ButtonKey) {
    if (key == 'like') return props.meta?.has_like ?? false
    if (key == 'save') return props.meta?.has_save ?? false
    return false
  }

  function show() {
    _anime.value?.pause()
    _anime.value = anime({
      targets: actions.value,
      translateY: 0,
      easing: 'easeInOutQuint',
      delay: (el, i) => {
        return (actions.value.length - i) * 50
      },
    })
  }

  function hide() {
    _anime.value?.pause()
    _anime.value = anime({
      targets: actions.value,
      translateY: (el: HTMLElement, i: number) => {
        return 24 + 80 * (buttons.value.length - i)
      },
      easing: 'easeInOutQuint',
      delay: (el, i) => {
        return i * 50
      },
    })
  }

  defineExpose({ show, hide })

  onMounted(() => {
    show()
  })
</script>

<template>
  <div
    class="action-absolute"
    :style="{
      height: `calc(100vh - ${navbar ? 56 : 0}px)`,
    }"
  >
    <el-space :size="24" class="action-wrapper" direction="vertical">
      <template v-for="button in buttons" :key="button.key">
        <div ref="actions">
          <el-button
            circle
            type="primary"
            style="
              height: auto;
              border: none;
              background: none;
              padding: 0px;
              transition: all 0.3s;
              --el-button-hover-text-color: var(--el-color-primary-light-9);
            "
            @click="handleClickAction(button.key)"
          >
            <el-icon
              style="width: 36px; height: 36px"
              :color="
                isActive(button.key) ? 'var(--el-color-primary)' : undefined
              "
            >
              <svg-icon
                :name="button.icon"
                style="filter: drop-shadow(0 0 1px rgb(0 0 0 / 1))"
              />
            </el-icon>
          </el-button>
          <p
            align="center"
            style="
              font-size: var(--el-font-size-small);
              text-shadow: 0 0 1px white;
            "
          >
            {{ getCount(button.key) }}
          </p>
        </div>
      </template>
    </el-space>
  </div>
</template>

<style scoped>
  .action-absolute {
    position: absolute;
    width: 100%;
    pointer-events: none;
    overflow: hidden;
  }
  .action-wrapper {
    bottom: 0;
    right: 0;
    padding: 16px;
    position: absolute;
  }
  .action-wrapper .el-button {
    pointer-events: initial;
  }
</style>
