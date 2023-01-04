<script setup lang="ts">
  import type { UserWithMeta } from '~/apps/user-inter/user-inter.types'

  const props = defineProps<{
    user?: UserWithMeta
    badge?: boolean
    loading?: boolean
    follow?: boolean
    followLoading?: boolean
  }>()

  defineEmits<{
    (e: 'follow'): void
    (e: 'unfollow'): void
  }>()

  const avatar = ref<HTMLDivElement | null>(null)
  const avatarWidth = ref(0)

  const user = computed(() => props.user)
  const photoURL = computed(() => {
    return user.value?.photoURL
      ? user.value.photoURL
      : 'https://kusonime.com/wp-content/uploads/2022/05/Ao-Ashi-605x340.jpg'
  })

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
  <el-card shadow="never" style="--el-card-border-radius: 0">
    <el-skeleton v-if="loading" animated>
      <template #template>
        <el-row>
          <el-col :span="8" style="margin: 0; padding-right: 24px">
            <div id="avatar" ref="avatar"></div>
            <el-skeleton-item
              variant="circle"
              :style="{ width: avatarWidth + 'px', height: avatarWidth + 'px' }"
            ></el-skeleton-item>
          </el-col>
          <el-col :span="16" style="margin: 0">
            <div style="margin-bottom: 4px">
              <el-skeleton-item
                variant="text"
                style="width: 50%; height: 32px"
              ></el-skeleton-item>
            </div>
            <div style="margin-bottom: 16px">
              <el-skeleton-item
                variant="text"
                style="width: 50%; height: 16px"
              ></el-skeleton-item>
            </div>
            <el-row justify="space-between">
              <el-skeleton-item
                v-for="i in 3"
                :key="i"
                variant="text"
                style="width: 64px; height: 20px"
              ></el-skeleton-item>
            </el-row>
            <el-row justify="space-between" style="margin-top: 8px">
              <el-skeleton-item
                v-for="i in 3"
                :key="i"
                variant="text"
                style="width: 64px; height: 14px"
              ></el-skeleton-item>
            </el-row>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <el-row v-else-if="user != undefined">
      <slot></slot>

      <el-col :span="8" style="padding-right: 24px">
        <div id="avatar" ref="avatar"></div>
        <el-avatar
          :size="avatarWidth"
          style="
            transition: all 0.3s;
            border: 1px solid var(--el-border-color-light);
          "
        >
          <el-image-firestore
            referrerpolicy="no-referrer"
            fit="cover"
            style="height: 100%; width: 100%"
            :src="photoURL"
          />
        </el-avatar>
      </el-col>

      <el-col :span="16" style="margin: 0">
        <h3 style="padding-right: 40px">
          {{ user.displayName ?? '-' }}
        </h3>
        <p style="margin-bottom: 16px; font-size: var(--el-font-size-small)">
          @{{ user.username }}
        </p>

        <div v-if="follow" style="margin-bottom: 8px">
          <el-button
            :loading="followLoading"
            @click="$emit('follow')"
            v-if="!user.has_follow"
            >Follow</el-button
          >
          <el-button :loading="followLoading" @click="$emit('unfollow')" v-else
            >Unfollow</el-button
          >
        </div>

        <el-row justify="space-between" style="margin-bottom: 8px">
          <p align="center">
            <strong>{{ user.quiz_count }}</strong>
            <br />
            <span style="font-size: var(--el-font-size-small)">Quizs</span>
          </p>
          <p align="center">
            <strong>{{ user.follower_count }}</strong>
            <br />
            <span style="font-size: var(--el-font-size-small)">Followers</span>
          </p>
          <p align="center">
            <strong>{{ user.following_count }}</strong>
            <br />
            <span style="font-size: var(--el-font-size-small)">Following</span>
          </p>
        </el-row>

        <p style="white-space: pre-line">{{ user.bio }}</p>
      </el-col>
    </el-row>
  </el-card>
</template>
