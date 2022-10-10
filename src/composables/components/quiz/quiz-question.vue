<script setup lang="ts">
  import {
    QuestionMode,
    type ChoicesQuestion,
    type Questions,
  } from '~/apps/question/question.types'

  const props = defineProps<{
    question?: Questions
    answer: number | null
  }>()

  defineEmits<{
    (e: 'update:answer', value: number): void
  }>()

  const questionImageUrl = computed(() => {
    return props.question?.image_url
  })

  const { data: imageUrl } = useQuery({
    queryKey: ['image', questionImageUrl],
    queryFn: () => {
      if (questionImageUrl.value) return getFile(questionImageUrl.value)
    },
    refetchOnWindowFocus: false,
  })
</script>

<template>
  <el-row v-if="question != undefined">
    <el-col v-if="question.guide">
      <p align="center">
        {{ question.guide }}
      </p>
    </el-col>

    <el-col v-if="question.image_url" style="height: 33vh">
      <el-image
        :src="imageUrl"
        fit="contain"
        style="height: 100%; width: 100%"
      ></el-image>
    </el-col>

    <el-col>
      <question-choices-mode
        v-if="question.mode == QuestionMode.Choices"
        :question="(question as ChoicesQuestion)"
        :answer="answer"
        @update:answer="$emit('update:answer', $event)"
      >
      </question-choices-mode>
    </el-col>
  </el-row>
</template>
