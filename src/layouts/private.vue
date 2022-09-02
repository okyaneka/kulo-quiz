<script lang="ts" setup>
  import type { Component } from 'vue'
  import {
    House,
    Collection,
    CirclePlus,
    Document,
    User,
  } from '@element-plus/icons-vue'

  interface MenuItem {
    title: string
    slug: string
    icon: Component
  }

  const activeIndex = ref<string>()
  const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
  }
  const padding = ref<string>('0')
  const route = useRoute()
  const menus = ref<MenuItem[]>([
    { title: 'Home', slug: 'home', icon: House },
    { title: 'Quiz', slug: 'quiz', icon: Collection },
    { title: 'Add', slug: 'create-quiz', icon: CirclePlus },
    { title: 'My Quiz', slug: 'my-quiz', icon: Document },
    { title: 'Profile', slug: 'profile', icon: User },
  ])

  function setMinWidth() {
    if (window.matchMedia('(orientation: landscape)').matches) {
      const p = Math.ceil(
        (window.innerWidth - (window.innerHeight * 9) / 16) / 2
      )
      padding.value = `0 ${p}px`
    } else {
      padding.value = '0'
    }
  }

  onMounted(() => {
    activeIndex.value = route.fullPath.split('/')[1]
    setMinWidth()
    window.onresize = () => {
      setMinWidth()
    }
  })
</script>

<template>
  <el-container :style="{ padding, minHeight: '100vh' }">
    <el-main>
      <router-view />
    </el-main>
    <el-footer style="position: sticky; bottom: 0; padding: 0">
      <el-menu
        :ellipsis="false"
        :default-active="activeIndex"
        mode="horizontal"
        @select="handleSelect"
        style="
          justify-content: space-between;
          padding: var(--el-footer-padding);
          border-bottom: none;
        "
      >
        <router-link
          v-for="menu in menus"
          :key="menu.slug"
          :to="`/${menu.slug}`"
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
      </el-menu>
    </el-footer>
  </el-container>
</template>

<style scoped>
  .el-menu--horizontal > .el-menu-item {
    border-bottom: none !important;
  }
</style>
