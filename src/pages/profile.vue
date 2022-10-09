<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'

  const { user: authUser } = storeToRefs(useAuthStore())

  const active = ref<string>('my')

  const avatar = ref<HTMLDivElement>()

  const avatarWidth = ref(0)

  function setAvatarWidth() {
    setTimeout(() => {
      avatarWidth.value = avatar.value?.clientWidth ?? 0
    }, 10)
  }

  onMounted(() => {
    window.addEventListener('resize', setAvatarWidth)
    setAvatarWidth()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', setAvatarWidth)
  })
</script>

<template>
  <el-card :body-style="{ padding: 0 }">
    <el-row :gutter="16" style="padding: 20px">
      <el-col :span="8">
        <div id="avatar" ref="avatar"></div>
        <el-avatar
          :src="
            authUser?.photoURL ??
            'https://kusonime.com/wp-content/uploads/2022/05/Ao-Ashi-605x340.jpg'
          "
          :size="avatarWidth"
          style="transition: all 0.3s"
        ></el-avatar>
      </el-col>
      <el-col :span="16" style="margin: 0">
        <h3 style="margin-bottom: 8px">
          {{ authUser?.displayName ?? '-' }}
        </h3>
        <el-button>Edit Profil</el-button>
        <el-button circle>
          <template #icon> <svg-icon name="setting-2" /> </template
        ></el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <el-tabs v-model="active" stretch class="no-margin-tabs">
          <el-tab-pane name="my" label="My Quiz"> </el-tab-pane>
          <el-tab-pane name="all" label="Draft"> </el-tab-pane>
          <el-tab-pane name="s" label="Saved"> </el-tab-pane>
        </el-tabs>
        <router-view />
      </el-col>
    </el-row>
  </el-card>
</template>
