<script setup lang="ts">
  import {
    QuestionMode,
    type ChoicesQuestion,
    type Question,
    type QuestionPayloads,
  } from '~/apps/question/question.types'
  import {
    ChoicesQuestionPayloadScheme,
    QuestionPayloadScheme,
  } from '~/apps/question/question.schemes'
  import { z } from 'zod'

  const props = defineProps<{
    value: Partial<QuestionPayloads>
    disabled?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: Partial<QuestionPayloads>): void
  }>()

  const validator = computed(() => {
    let validator
    switch (props.value.mode) {
      case QuestionMode.Choices:
        validator = ChoicesQuestionPayloadScheme._def.shape()
        break
      default:
        validator = QuestionPayloadScheme._def.shape()
        break
    }
    return toFormValidator(z.object(validator))
  })

  const { values, errors, setValues, validate, setFieldValue } = useForm<
    Partial<QuestionPayloads>
  >({
    validationSchema: validator,
    initialValues: {
      image_url: null,
      correct_answer: null,
    },
  })
  useField<number>('point')
  useField<QuestionMode>('mode')
  useField<string>('guide')
  useField<number>('timer')

  watch(values, (value) => {
    if (value.mode == QuestionMode.Choices) {
      emit('update:value', {
        ...props.value,
        ...value,
      } as Partial<ChoicesQuestion>)
    } else {
      emit('update:value', { ...props.value, ...value } as Partial<Question>)
    }
  })

  defineExpose({ validate })

  onMounted(() => {
    setValues(props.value)
    if (props.value.point != undefined)
      quickPoint.value = quickValues.includes(props.value.point as number)
        ? props.value.point
        : 'custom'
    if (props.value.timer != undefined)
      quickTimer.value = quickValues.includes(props.value.timer as number)
        ? props.value.timer
        : 'custom'
  })

  const quickValues = [5, 10, 20, 50, 100, 'custom']
  const quickPoint = ref<string | number>()
  const quickTimer = ref<string | number | null>()
  watch(quickPoint, (value) => {
    if (value && typeof value == 'number') setFieldValue('point', value)
  })
  watch(quickTimer, (value) => {
    if (value && typeof value == 'number') setFieldValue('timer', value)
  })
</script>

<template>
  <el-form label-position="top" :disabled="disabled">
    <el-form-item :error="errors.point" label="Point">
      <el-row justify="space-between" style="width: 100%">
        <el-button
          v-for="(point, i) in quickValues"
          :type="quickPoint == point ? 'primary' : undefined"
          :key="`point-${i}`"
          round
          @click="quickPoint = point"
          >{{ point }}</el-button
        >
      </el-row>

      <el-input
        v-if="quickPoint == 'custom'"
        v-model.number="values.point"
        style="margin-top: 12px"
        placeholder="Input point"
      ></el-input>
    </el-form-item>

    <el-form-item :error="errors.mode" label="Question mode">
      <template v-for="(option, i) in QuestionMode" :key="`option-${i}`">
        <el-button
          v-if="!isNaN(option)"
          :type="values.mode == option ? 'primary' : undefined"
          @click="values.mode = option"
          round
        >
          {{ QuestionMode[option] }}
        </el-button>
      </template>
    </el-form-item>

    <el-form-item :error="errors.guide" label="Question guide">
      <el-input v-model="values.guide" type="textarea"></el-input>
    </el-form-item>

    <el-form-item label="Image guide">
      <el-col>
        <select-image
          v-model="values.image_url"
          style="width: 100%"
        ></select-image>
      </el-col>
    </el-form-item>

    <el-form-item :error="errors.timer" label="Timer (seconds)">
      <el-row justify="space-between" style="width: 100%">
        <el-button
          v-for="(point, i) in quickValues"
          :type="quickTimer == point ? 'primary' : undefined"
          :key="`point-${i}`"
          round
          @click="quickTimer = point"
          >{{ point }}</el-button
        >
      </el-row>

      <el-input
        v-if="quickTimer == 'custom'"
        v-model.number="values.timer"
        placeholder="Input timer"
        style="margin-top: 12px"
      >
      </el-input>
    </el-form-item>

    <template v-if="values.mode != undefined">
      <hr
        style="border: 1px solid var(--el-border-color); margin-bottom: 0.5rem"
      />

      <question-choices-form
        v-if="values.mode == QuestionMode.Choices"
        v-model:value="values"
        :errors="errors"
      ></question-choices-form>
    </template>
  </el-form>
</template>
