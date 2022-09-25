<route lang="yaml">
name: profile
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import { getQuizList } from '~/apps/quiz/quiz.repositories'
  import { QuizStatus, QuizGrade, QuizLevel } from '~/apps/quiz/quiz.schemes'

  const authStore = useAuthStore()

  const quizData = computed(() => {
    return quizList.value?.rows ?? []
  })

  const { data: quizList, isLoading } = useQuery({
    queryKey: ['quiz-list'],
    queryFn: () =>
      getQuizList({ filter: { 'author.uid': authStore.user?.uid } }),
  })
</script>

<template>
  <el-row v-loading="isLoading" style="min-height: 256px">
    <el-col v-for="i in quizData" :key="i.id" :span="12" style="margin: 0">
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
          <h3>{{ i.title }}</h3>
          <p>
            <el-tag>
              {{ QuizStatus[i.status] }}
            </el-tag>
          </p>
          <p>{{ QuizGrade[i.grade] }}</p>
          <p>{{ QuizLevel[i.level] }}</p>
          <div>
            <el-space :wrap="false">
              <router-link
                :to="{ name: 'edit-questions', params: { id: i.id } }"
              >
                <el-button circle>
                  <template #icon>
                    <svg-icon name="edit" />
                  </template>
                </el-button>
              </router-link>

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
  </el-row>
</template>

<style scoped>
  .quiz-card:hover {
    background-color: var(--el-fill-color);
  }
</style>
