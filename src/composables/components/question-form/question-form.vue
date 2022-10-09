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

  const { values, errors, setValues, validate } = useForm<
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
  })
</script>

<template>
  <el-form label-position="top" :disabled="disabled">
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

      <question-choices-form
        v-if="values.mode == QuestionMode.Choices"
        v-model:value="values"
        :errors="errors"
      ></question-choices-form>
    </template>
  </el-form>
</template>
