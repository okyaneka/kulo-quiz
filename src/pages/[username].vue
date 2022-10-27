<route lang="yaml">
meta:
  layout: prefer-private
</route>

<script setup lang="ts">
  import { logout, useAuthStore } from '~/apps/auth/auth.repository'
  import {
    followUser,
    unfollowUser,
    getUserWithMeta,
  } from '~/apps/user-inter/user-inter.repositories'

  const route = useRoute()
  const router = useRouter()
  const avatar = ref<HTMLDivElement>()
  const avatarWidth = ref(0)
  const { user: authUser } = storeToRefs(useAuthStore())

  const isMe = computed(() => route.params.username == authUser.value?.username)

  const {
    data: user,
    isLoading,
    refetch: handleGetUserWithMeta,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => getUserWithMeta(route.params.username as string),
  })

  // follow
  const { isLoading: followingLoading, mutateAsync: handleFollow } =
    useMutation({
      mutationFn: async () => {
        if (user.value) await followUser(user.value.id)
        await handleGetUserWithMeta.value()
      },
    })

  // unfollow
  const { isLoading: unfollowingLoading, mutateAsync: handleUnfollow } =
    useMutation({
      mutationFn: async () => {
        if (user.value) await unfollowUser(user.value.id)
        await handleGetUserWithMeta.value()
      },
    })

  const followLoading = computed(
    () => followingLoading.value || unfollowingLoading.value
  )

  // logout

  const { mutateAsync: handleLogout } = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      router.push('/login')
    },
  })

  function setAvatarWidth() {
    setTimeout(() => {
      avatarWidth.value = avatar.value?.clientWidth ?? 0
    }, 10)
  }

  onMounted(() => {
    window.addEventListener('resize', setAvatarWidth)
    const name = user.value?.displayName
    setDocTitle(name ? `${name} Profiles` : undefined)
    setAvatarWidth()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', setAvatarWidth)
  })
</script>

<template>
  <user-profile-card
    :follow="!isMe"
    :loading="isLoading"
    :user="user"
    :follow-loading="followLoading"
    @follow="handleFollow"
    @unfollow="handleUnfollow"
  >
    <el-dropdown
      v-if="isMe"
      trigger="click"
      placement="bottom-end"
      style="position: absolute; right: 0px"
    >
      <el-button circle text>
        <template #icon>
          <el-badge is-dot style="height: 100%" :hidden="user?.username_set">
            <svg-icon name="dots-horizontal" style="transform: rotate(90deg)" />
          </el-badge>
        </template>
      </el-button>

      <template #dropdown>
        <el-dropdown-menu>
          <router-link :to="{ name: 'edit' }">
            <el-dropdown-item>
              <el-badge is-dot style="height: 100%" :hidden="user?.username_set"
                >Edit Profile
              </el-badge>
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item @click="handleLogout">Logout</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </user-profile-card>
  <pre>{{ user }}</pre>
</template>
