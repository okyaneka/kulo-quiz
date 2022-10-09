<script setup lang="ts">
  import { useColRef } from '~/plugins/firebase'
  import QuizTimerIndicator from '../../composables/components/quiz/quiz-timer-indicator.vue'

  const p = useQuery({
    queryKey: ['p'],
    queryFn: async () => {
      const { size } = await getDocs(query(useColRef('answers_preview')))
      return size
    },
  })
</script>

<template>
  <el-row>
    <el-col>
      {{ p.data }}
      <quiz-timer-indicator autoStart :duration="10"></quiz-timer-indicator>
    </el-col>
  </el-row>
</template>
