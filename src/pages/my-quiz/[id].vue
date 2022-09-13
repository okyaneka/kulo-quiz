<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { MoreFilled } from '@element-plus/icons-vue'

  const route = useRoute()
  const router = useRouter()

  const active = ref<string>()
  const isShowNav = ref<boolean>(true)
  const isShowDrawer = ref<boolean>(false)
  const lastScrollPos = ref<number>(window.scrollY)

  function handleTabClick(name: string | number) {
    router.push({ name: name as string })
  }

  onMounted(() => {
    if (route.query.new == '1') {
      isShowDrawer.value = true
    }

    active.value = route.name as string
  })

  onscroll = () => {
    const currentScrollPos = window.scrollY
    const isBottomOfPage =
      window.scrollY + window.innerHeight == document.body.scrollHeight

    if (lastScrollPos.value > currentScrollPos || isBottomOfPage) {
      isShowNav.value = true
    } else {
      isShowNav.value = false
    }
    lastScrollPos.value = currentScrollPos
  }
</script>

<template>
  <el-row style="padding: 20px 0 56px">
    <el-col>
      <h1 align="center">Quiz Details</h1>
    </el-col>

    <el-col>
      <router-view />
    </el-col>
  </el-row>

  <el-button
    type="primary"
    :icon="MoreFilled"
    circle
    size="large"
    :style="{ bottom: isShowNav ? '112px' : '72px' }"
    style="
      z-index: 9999;
      position: fixed;
      right: 16px;
      transform: rotate(90deg);
      transition: bottom 0.3s ease-in;
    "
  />

  <el-tabs
    v-model="active"
    stretch
    @tab-change="handleTabClick"
    :style="{ bottom: isShowNav ? '56px' : '0' }"
    style="
      z-index: 9999;
      position: fixed;
      width: calc(100% - 2 * var(--global-layout-padding));
      margin-bottom: -15px;
      left: var(--global-layout-padding);
      transition: bottom 0.3s ease-in;
      background: var(--el-fill-color-blank);
      overflow-x: auto;
    "
  >
    <el-tab-pane name="edit-quiz-detail" label="Data"> </el-tab-pane>
    <el-tab-pane name="edit-quiz-config" label="Config"> </el-tab-pane>
    <el-tab-pane name="edit-quiz-questions" label="Questions"> </el-tab-pane>
  </el-tabs>

  <el-drawer v-model="isShowDrawer" direction="btt" :size="320">
    <el-result
      icon="success"
      title="Your Quiz has Created!"
      sub-title="Now let's add questions to your quiz and then share to all."
      style="padding: 0"
    >
      <template #extra>
        <el-space fill style="width: 100%">
          <el-button type="primary" @click="isShowDrawer = false"
            >Let's add questions!</el-button
          >
          <router-link to="/my-quiz">Back to my quiz</router-link>
        </el-space>
      </template>
    </el-result>
  </el-drawer>
</template>
