<script lang="ts" setup>
  import type { Component, CSSProperties } from 'vue'
  import {
    House,
    Collection,
    CirclePlus,
    Document,
    User,
  } from '@element-plus/icons-vue'
  import { onBeforeRouteLeave } from 'vue-router'

  interface MenuItem {
    title: string
    slug: string
    icon: Component
    style?: CSSProperties | string
  }

  const activeIndex = ref<string>()
  const padding = ref<string>('0')
  const route = useRoute()
  const menus = ref<MenuItem[]>([
    {
      title: 'Home',
      slug: 'home',
      icon: House,
      style: { position: 'sticky', left: 0, zIndex: 1 },
    },
    { title: 'Quiz', slug: 'quiz', icon: Collection },
    { title: 'Add', slug: 'create-quiz', icon: CirclePlus },
    { title: 'My Quiz', slug: 'my-quiz', icon: Document },
    { title: 'Profile', slug: 'profile', icon: User },
  ])

  function setMinWidth() {
    if (
      window.matchMedia('(orientation: landscape)').matches &&
      window.innerWidth > 640
    ) {
      const p = Math.ceil(
        (window.innerWidth - (window.innerHeight * 9) / 16) / 2
      )
      padding.value = `0 ${p}px`
    } else {
      padding.value = '0'
    }
  }

  onBeforeRouteLeave((to) => {
    activeIndex.value = to.fullPath.split('/')[1]
  })

  onMounted(() => {
    activeIndex.value = route.fullPath.split('/')[1]
    setMinWidth()
    window.onresize = () => {
      setMinWidth()
    }
  })

  onUnmounted(() => {
    window.onresize = null
  })
</script>

<template>
  <el-container :style="{ padding, minHeight: '100vh' }">
    <el-main style="overflow: visible; max-width: 100%">
      <router-view />
    </el-main>
    <el-footer style="position: sticky; bottom: 0; padding: 0; z-index: 1">
      <el-menu
        :ellipsis="false"
        :default-active="activeIndex"
        mode="horizontal"
        style="border-bottom: none"
      >
        <el-scrollbar
          :view-style="{
            display: 'flex',
            justifyContent: 'space-between',
            minWidth: '100%',
            width: 'fit-content',
          }"
          style="min-width: 100%"
        >
          <router-link
            v-for="menu in menus"
            :key="menu.slug"
            :to="`/${menu.slug}`"
            :style="menu.style"
          >
            <el-menu-item :index="menu.slug">
              <span>
                <el-space
                  :size="4"
                  direction="vertical"
                  style="margin-bottom: 4px"
                >
                  <el-icon style="margin: 0"
                    ><component :is="menu.icon"
                  /></el-icon>
                  <div
                    style="
                      line-height: 1;
                      font-size: var(--el-font-size-extra-small);
                    "
                  >
                    {{ menu.title }}
                  </div>
                </el-space>
              </span>
            </el-menu-item>
          </router-link>
        </el-scrollbar>
      </el-menu>
    </el-footer>
  </el-container>
</template>

<style scoped>
  .el-menu--horizontal > .el-menu-item {
    border-bottom: none !important;
  }
  .el-menu-item {
    background-color: var(--el-fill-color-blank);
  }
</style>
