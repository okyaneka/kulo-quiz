<script setup lang="ts">
  import type { Component } from 'vue'
  import { QuestionValidator } from '~/apps/question/question.schemes'
  import {
    QuestionMode,
    type QuestionsPayload,
  } from '~/apps/question/question.types'
  import QuestionOptionsMode from './mode/question-options-mode.vue'

  const props = defineProps<{
    value: Partial<QuestionsPayload>
    validate?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: Partial<QuestionsPayload>): void
    (e: 'update:validate', value: boolean): void
  }>()

  const isValidate = computed({
    get: () => {
      return props.validate ?? false
    },
    set: (value: boolean) => {
      emit('update:validate', value)
    },
  })

  const validationSchema = computed(() => {
    return QuestionValidator(props.value?.mode)
  })

  const { values, errors, setValues, validate } = useForm<
    Partial<QuestionsPayload>
  >({
    validationSchema: validationSchema.value,
    initialValues: {
      image_url: null,
    },
  })
  useField<number>('point')
  useField<QuestionMode>('mode')
  useField<string>('guide', undefined, { initialValue: '' })
  useField<number>('timer')

  const questionFormComponent = computed<Component>(() => {
    switch (values.mode) {
      case QuestionMode.Choices:
        return QuestionOptionsMode
      default:
        return h('div', 'blank')
    }
  })

  watch(values, (value) => {
    emit('update:value', { ...props.value, ...value })
  })

  watch(isValidate, (value) => {
    if (value)
      validate().then(() => {
        isValidate.value = false
      })
  })

  onMounted(() => {
    setValues(props.value)
  })
</script>

<template>
  <el-form label-position="top">
    <el-form-item :error="errors.point" label="Point">
      <el-input-number v-model.number="values.point"></el-input-number>
    </el-form-item>

    <el-form-item :error="errors.mode" label="Question mode">
      <el-select v-model="values.mode" style="width: 100%">
        <template v-for="(option, i) in QuestionMode" :key="`option-${i}`">
          <el-option
            v-if="isNaN(option)"
            :label="option"
            :value="QuestionMode[option]"
          />
        </template>
      </el-select>
    </el-form-item>

    <el-form-item :error="errors.guide" label="Question guide">
      <el-input v-model="values.guide" type="textarea"></el-input>
    </el-form-item>

    <el-form-item :error="errors.timer" label="Timer">
      <el-input v-model.number="values.timer" type="number">
        <template #append>second</template>
      </el-input>
    </el-form-item>

    <template v-if="values.mode != undefined">
      <hr
        style="border: 1px solid var(--el-border-color); margin-bottom: 0.5rem"
      />
      <component
        :is="questionFormComponent"
        v-model:value="values"
        :errors="errors"
      ></component>
    </template>
  </el-form>
</template>
