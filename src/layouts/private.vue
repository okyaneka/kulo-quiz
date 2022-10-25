<script lang="ts" setup>
  import type { Component, CSSProperties } from 'vue'
  import { onBeforeRouteLeave } from 'vue-router'
  import { useAuthStore } from '~/apps/auth/auth.repository'
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

  const { user } = storeToRefs(useAuthStore())

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
          <!-- Home -->
          <router-link to="/home">
            <el-menu-item index="home">
              <span>
                <el-space
                  :size="4"
                  direction="vertical"
                  style="margin-bottom: 4px"
                >
                  <el-icon style="margin: 0">
                    <svg-icon name="home" />
                  </el-icon>
                  <div
                    style="
                      line-height: 1;
                      font-size: var(--el-font-size-extra-small);
                    "
                  >
                    Home
                  </div>
                </el-space>
              </span>
            </el-menu-item>
          </router-link>

          <!-- Search -->
          <router-link to="/q">
            <el-menu-item index="q">
              <span>
                <el-space
                  :size="4"
                  direction="vertical"
                  style="margin-bottom: 4px"
                >
                  <el-icon style="margin: 0">
                    <svg-icon name="search-status" />
                  </el-icon>
                  <div
                    style="
                      line-height: 1;
                      font-size: var(--el-font-size-extra-small);
                    "
                  >
                    Search
                  </div>
                </el-space>
              </span>
            </el-menu-item>
          </router-link>

          <!-- Add -->
          <router-link to="/create-quiz">
            <el-menu-item index="create-quiz">
              <span>
                <el-space
                  :size="4"
                  direction="vertical"
                  style="margin-bottom: 4px"
                >
                  <el-icon style="margin: 0">
                    <svg-icon name="add" />
                  </el-icon>
                  <div
                    style="
                      line-height: 1;
                      font-size: var(--el-font-size-extra-small);
                    "
                  >
                    Add
                  </div>
                </el-space>
              </span>
            </el-menu-item>
          </router-link>

          <!-- Profile -->
          <router-link to="/profile">
            <el-menu-item index="profile">
              <span>
                <el-space
                  :size="4"
                  direction="vertical"
                  style="margin-bottom: 4px"
                >
                  <el-icon style="margin: 0">
                    <el-badge
                      is-dot
                      style="height: 100%"
                      :hidden="!user?.username.includes('user')"
                    >
                      <svg-icon name="profile-circle" />
                    </el-badge>
                  </el-icon>
                  <div
                    style="
                      line-height: 1;
                      font-size: var(--el-font-size-extra-small);
                    "
                  >
                    Profile
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
