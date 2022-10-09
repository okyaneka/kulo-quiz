<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
  import type { TabsPaneContext } from 'element-plus'
  import type { SmoothScrollOptions } from 'vue3-smooth-scroll'

  defineProps<{
    title: string
    loading: boolean
    description: string
    userGuide: string
    spesification: any[]
  }>()

  const descriptionEl = ref<HTMLElement>()
  const userGuideEl = ref<HTMLElement>()
  const spesificationEl = ref<HTMLElement>()
  const active = ref<'description' | 'userGuide' | 'spesification'>()
  const smoothScroll: ((opt: SmoothScrollOptions) => void) | undefined =
    inject('smoothScroll')

  const elements = computed((): (HTMLElement | undefined)[] => {
    return [descriptionEl.value, userGuideEl.value, spesificationEl.value]
  })

  function handleTabClicked(data: TabsPaneContext) {
    disableScrollObserver()
    const el = (() => {
      switch (data.paneName) {
        case 'description':
          return descriptionEl
        case 'userGuide':
          return userGuideEl
        case 'spesification':
          return spesificationEl
        default:
          return descriptionEl
      }
    })()

    if (smoothScroll) {
      smoothScroll({
        scrollTo: el?.value ?? 0,
        duration: 300,
        offset: -54,
      })
    }

    setTimeout(() => {
      enableScrollObserver()
    }, 300)
  }

  function setActive() {
    for (let i = elements.value.length - 1; i >= 0; i--) {
      const element: HTMLElement | undefined = elements.value[i]
      const offsetTop = element?.offsetTop ?? 0

      if (window.scrollY >= offsetTop - 54 - 32) {
        active.value = (() => {
          switch (i) {
            case 0:
              return 'description'
            case 1:
              return 'userGuide'
            case 2:
              return 'spesification'
          }
        })()
        return active.value
      }
    }
    active.value = 'description'
    return active.value
  }

  function enableScrollObserver() {
    window.addEventListener('scroll', () => setActive())
  }

  function disableScrollObserver() {
    window.removeEventListener('scroll', () => setActive())
  }

  onMounted(() => {
    setActive()
    enableScrollObserver()
  })

  onUnmounted(() => {
    disableScrollObserver()
  })
</script>

<template>
  <el-row style="padding: 20px">
    <el-col>
      <h3>{{ title }}</h3>
    </el-col>

    <el-col v-if="loading">
      <el-skeleton animated :rows="6"></el-skeleton>
    </el-col>

    <template v-else>
      <el-col>
        <el-tabs
          v-model="active"
          style="position: sticky; top: 0; background-color: var(--el-bg-color)"
          @tab-click="handleTabClicked"
        >
          <el-tab-pane label="Description" name="description" />
          <el-tab-pane label="User Guide" name="userGuide" />
          <el-tab-pane label="Spesification" name="spesification" />
        </el-tabs>

        <el-space
          class="text-wrapper"
          fill
          wrap
          :size="20"
          style="width: 100%; max-width: 100%"
        >
          <!-- #description -->
          <div ref="descriptionEl">
            <h3>Description</h3>
            <div v-html="description"></div>
          </div>

          <!-- #user-guide -->
          <div ref="userGuideEl">
            <h3>User Guide</h3>
            <div v-html="userGuide"></div>
          </div>

          <!-- #spesification -->
          <div ref="spesificationEl">
            <h3>Spesification</h3>
            <el-table
              :data="spesification"
              :show-header="false"
              style="width: 100%; z-index: 0"
            >
              <el-table-column prop="name" />
              <el-table-column prop="value" />
            </el-table>
          </div>
        </el-space>
      </el-col>
    </template>
  </el-row>
  <slot name="footer" />
</template>
