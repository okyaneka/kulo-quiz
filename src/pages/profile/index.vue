<route lang="yaml">
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useAuthStore, logout } from '~/apps/auth/auth.repository'
  import { getQuizList } from '~/apps/quiz/quiz.repositories'
  import { QuizStatus, QuizGrade, QuizLevel } from '~/apps/quiz/quiz.schemes'

  const router = useRouter()
  const { user: authUser } = storeToRefs(useAuthStore())

  const avatar = ref<HTMLDivElement>()

  const active = ref<string>('my')
  const avatarWidth = ref(0)

  const quizData = computed(() => {
    return quizList.value?.rows ?? []
  })

  const { data: quizList, isLoading } = useQuery({
    queryKey: ['quiz-list'],
    queryFn: () =>
      getQuizList({
        filter: { 'author.uid': authUser.value?.uid },
        orders: [
          ['status', 'asc'],
          ['created_at', 'desc'],
        ],
      }),
  })

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
    const name = authUser.value?.displayName
    setDocTitle(name ? `${name} Profiles` : undefined)
    setAvatarWidth()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', setAvatarWidth)
  })
</script>

<template>
  <el-card :body-style="{ padding: 0 }">
    <el-row style="padding: 20px">
      <el-dropdown
        trigger="click"
        placement="bottom-end"
        style="position: absolute; right: 20px"
      >
        <el-button circle text>
          <template #icon>
            <el-badge
              is-dot
              style="height: 100%"
              :hidden="!authUser?.username.includes('user')"
            >
              <svg-icon
                name="dots-horizontal"
                style="transform: rotate(90deg)"
              />
            </el-badge>
          </template>
        </el-button>

        <template #dropdown>
          <el-dropdown-menu>
            <router-link :to="{ name: 'profile-edit' }">
              <el-dropdown-item>
                <el-badge
                  is-dot
                  style="height: 100%"
                  :hidden="!authUser?.username.includes('user')"
                  >Edit Profile
                </el-badge>
              </el-dropdown-item>
            </router-link>
            <el-dropdown-item @click="handleLogout">Logout</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-col :span="8" style="padding-right: 20px">
        <div id="avatar" ref="avatar"></div>
        <el-avatar
          :size="avatarWidth"
          style="transition: all 0.3s; box-shadow: var(--el-box-shadow-light)"
        >
          <el-image-firestore
            referrerpolicy="no-referrer"
            fit="cover"
            style="height: 100%; width: 100%"
            :src="
              authUser?.photoURL
                ? authUser?.photoURL
                : 'https://kusonime.com/wp-content/uploads/2022/05/Ao-Ashi-605x340.jpg'
            "
          />
        </el-avatar>
      </el-col>
      <el-col :span="16" style="margin: 0">
        <h3>
          {{ authUser?.displayName ?? '-' }}
        </h3>
        <p style="margin-bottom: 16px; font-size: var(--el-font-size-small)">
          @{{ authUser?.username }}
        </p>

        <el-row justify="space-between">
          <p align="center">
            <strong>{count}</strong><br />
            <span style="font-size: var(--el-font-size-small)">Quizs</span>
          </p>
          <p align="center">
            <strong>{count}</strong><br />
            <span style="font-size: var(--el-font-size-small)">Followers</span>
          </p>
          <p align="center">
            <strong>{count}</strong><br />
            <span style="font-size: var(--el-font-size-small)">Following</span>
          </p>
        </el-row>
      </el-col>
    </el-row>

    <el-row style="margin: 0">
      <el-col>
        <el-tabs v-model="active" stretch class="no-margin-tabs">
          <el-tab-pane name="my" label="My Quiz">
            <el-row v-loading="isLoading" style="min-height: 256px">
              <template v-if="!isLoading">
                <el-col v-if="quizData.length == 0" :span="24">
                  <el-empty description="Let's add some quiz!">
                    <router-link :to="{ name: 'create-quiz' }">
                      <el-button type="primary">Add Quiz</el-button>
                    </router-link>
                  </el-empty>
                </el-col>
                <template v-else>
                  <el-col
                    v-for="quiz in quizData"
                    :key="quiz.id"
                    :span="12"
                    style="margin: 0"
                  >
                    <el-card
                      class="quiz-card"
                      shadow="never"
                      :style="{
                        borderRadius: '0',
                        position: 'relative',
                        width: '100%',
                        paddingTop: '133%',
                      }"
                      :body-style="{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                      }"
                    >
                      <el-space direction="vertical" style="width: 100%">
                        <div
                          :title="quiz.title"
                          style="
                            overflow: hidden;
                            text-overflow: ellipsis;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            line-clamp: 2;
                            -webkit-box-orient: vertical;
                          "
                        >
                          <h3 align="center">
                            {{ quiz.title }}
                          </h3>
                        </div>
                        <p>
                          <el-tag>
                            {{ QuizStatus[quiz.status] }}
                          </el-tag>
                        </p>
                        <p>{{ QuizGrade[quiz.grade] }}</p>
                        <p>{{ QuizLevel[quiz.level] }}</p>
                        <div>
                          <el-space :wrap="false">
                            <el-tooltip
                              v-if="quiz.status == QuizStatus.Draft"
                              content="Continue Edit Quiz"
                            >
                              <router-link
                                :to="{
                                  name: 'my-quiz-id-questions',
                                  params: { id: quiz.id },
                                }"
                              >
                                <el-button circle>
                                  <template #icon>
                                    <svg-icon name="edit" />
                                  </template>
                                </el-button>
                              </router-link>
                            </el-tooltip>

                            <el-tooltip
                              v-if="quiz.status == QuizStatus.Publish"
                              content="View Quiz"
                            >
                              <router-link
                                :to="{
                                  name: 'q-id-play',
                                  params: { id: quiz.id },
                                }"
                              >
                                <el-button circle>
                                  <template #icon>
                                    <svg-icon name="eye" />
                                  </template>
                                </el-button>
                              </router-link>
                            </el-tooltip>

                            <el-button circle>
                              <template #icon>
                                <svg-icon name="clipboard-tick" />
                              </template>
                            </el-button>
                            <el-button circle>
                              <template #icon>
                                <svg-icon name="chart-square" />
                              </template>
                            </el-button>
                          </el-space>
                        </div>
                      </el-space>
                    </el-card>
                  </el-col>
                </template>
              </template>
            </el-row>
          </el-tab-pane>
          <el-tab-pane name="all" label="Draft"> </el-tab-pane>
          <el-tab-pane name="s" label="Saved"> </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped>
  .quiz-card:hover {
    background-color: var(--el-fill-color);
  }
</style>
