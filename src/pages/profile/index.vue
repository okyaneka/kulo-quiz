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
                      :to="{ name: 'q-id-play', params: { id: quiz.id } }"
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
</template>

<style scoped>
  .quiz-card:hover {
    background-color: var(--el-fill-color);
  }
</style>
