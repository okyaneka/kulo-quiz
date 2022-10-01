<script lang="ts" setup>
  import type { Component, CSSProperties } from 'vue'
  import { onBeforeRouteLeave } from 'vue-router'
  import SvgIcon from '~/composables/components/svg-icon.vue'

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
      icon: () => h(SvgIcon, { name: 'home' }),
      style: { position: 'sticky', left: 0, zIndex: 1 },
    },
    {
      title: 'Search',
      slug: 'quiz',
      icon: () => h(SvgIcon, { name: 'search-status' }),
    },
    {
      title: 'Add',
      slug: 'create-quiz',
      icon: () => h(SvgIcon, { name: 'add' }),
    },
    {
      title: 'Profile',
      slug: 'profile',
      icon: () => h(SvgIcon, { name: 'profile-circle' }),
    },
    // { title: 'My Quiz', slug: 'my-quiz', icon: Document },
  ])

  function setMinWidth() {
    if (
      window.matchMedia('(orientation: landscape)').matches &&
      window.innerWidth > 640
    ) {
      const p = Math.ceil(
        (window.innerWidth - (window.innerHeight * 9) / 16) / 2
      )
      padding.value = `${p}px`
    } else {
      padding.value = '0px'
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
  <el-container
    style="padding: 0 var(--global-layout-padding); min-height: 100vh"
    :style="{
      '--global-layout-padding': padding,
      '--global-main-height': 'calc(100vh - 56px)',
    }"
  >
    <el-main style="overflow: visible; max-width: 100%">
      <router-view />
    </el-main>
    <el-footer style="position: sticky; bottom: 0; padding: 0; z-index: 999">
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
                  <el-icon style="margin: 0">
                    <component :is="menu.icon" />
                  </el-icon>
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
