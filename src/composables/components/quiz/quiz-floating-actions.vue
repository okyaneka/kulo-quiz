<script setup lang="ts">
  import anime from 'animejs'

  interface ButtonAction {
    key: string
    icon: string
    color: string
  }

  const props = defineProps<{
    hideLike?: boolean
    hideComment?: boolean
    hideSave?: boolean
    hideShare?: boolean
    hideOpen?: boolean
  }>()

  const hideButton = ref(false)
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

  /**
   * p: 136
   * c: 56
   * s = p - c = 80
   * pe = s - 56 = 24
   */
</script>

<template>
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
          "
        >
          <el-icon style="width: 36px; height: 36px">
            <svg-icon
              :name="button.icon"
              style="filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.5))"
            />
          </el-icon>
        </el-button>
        <p
          align="center"
          style="
            text-shadow: 0 0 2px rgb(0 0 0 / 0.5);
            font-size: var(--el-font-size-small);
            color: white;
          "
        >
          20k
        </p>
      </div>
    </template>
  </el-space>
</template>

<style scoped>
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
