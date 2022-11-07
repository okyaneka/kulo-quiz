<route lang="yaml">
alias: ['/:username/draft', '/:username/saved']
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

  enum Tabs {
    index,
    draft,
    saved,
  }

  const route = useRoute()
  const router = useRouter()

  const active = ref<Tabs>(0)
  const avatar = ref<HTMLDivElement>()
  const avatarWidth = ref(0)
  const { user: authUser } = storeToRefs(useAuthStore())

  const isMe = computed(() => route.params.username == authUser.value?.username)

  const followLoading = computed(
    () => followingLoading.value || unfollowingLoading.value
  )

  const {
    data: user,
    isLoading,
    refetch: handleGetUserWithMeta,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      getUserWithMeta(route.params.username as string).then((res) => {
        const name = res.displayName
        setDocTitle(name ? `${name} Profiles` : undefined)
        return res
      }),
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

  function goToActive() {
    if (user.value) {
      const activeTab =
        active.value == Tabs.index ? '' : `-${Tabs[active.value]}`
      router.push({
        name: `u-username${activeTab}`,
        params: { username: user.value.username },
      })
    }
  }

  provide('user', user)

  watch(active, () => goToActive())

  onMounted(() => {
    const path = route.path.split('/').pop()

    if (path != undefined)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.keys(Tabs).some((key: any) => {
        if (path === Tabs[key]) {
          active.value = parseInt(key)
          return true
        }
      })
    goToActive()

    window.addEventListener('resize', setAvatarWidth)
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

  <el-card
    shadow="never"
    style="--el-card-border-radius: 0"
    :body-style="{ padding: 0 }"
  >
    <el-tabs v-model="active" stretch class="no-margin-tabs">
      <el-tab-pane :name="Tabs.index" label="Quiz"> </el-tab-pane>
      <el-tab-pane v-if="isMe" :name="Tabs.draft" label="Draft"> </el-tab-pane>
      <!-- <el-tab-pane v-if="isMe" :name="Tabs.saved" label="Saved"> </el-tab-pane> -->
    </el-tabs>
  </el-card>

  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"></component>
    </keep-alive>
  </router-view>
</template>
