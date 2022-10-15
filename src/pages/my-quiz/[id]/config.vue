<route lang="yaml">
name: edit-config
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import { ConfigValidator } from '~/apps/config/config.scheme'
  import {
    QuestionMode,
    QuizMode,
    TimerMode,
    Units,
    type Config,
  } from '~/apps/config/config.types'
  import { useQuizStore } from '~/apps/quiz/quiz.repositories'

  const props = defineProps<{ disabled?: boolean; validate?: boolean }>()
  const emit = defineEmits<{
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

  const { config, questions } = storeToRefs(useQuizStore())

  const { values, errors, validate } = useForm<Partial<Config>>({
    validationSchema: ConfigValidator(questions.value.length),
    initialValues: config.value,
  })
  useField('description', undefined, { initialValue: '' })
  useField('user_guide', undefined, { initialValue: '' })
  useField('question_displayed', undefined, { initialValue: null })
  useField('question_mode', undefined, { initialValue: null })
  useField('quiz_mode', undefined, { initialValue: null })
  useField('timer_mode', undefined, { initialValue: null })
  useField('timer', undefined, { initialValue: null })
  useField('timer_units', undefined, { initialValue: null })
  useField('break', undefined, { initialValue: null })
  useField('break_units', undefined, { initialValue: null })

  watch(values, (value) => {
    config.value = { ...config.value, ...value }
  })

  watch(isValidate, (value) => {
    if (value)
      validate().then(() => {
        isValidate.value = false
      })
    nextTick().then(() => {
      isValidate.value = false
    })
  })
</script>

<template>
  <el-row justify="space-between" align="middle" style="margin-bottom: 16px">
    <h3>Config</h3>
  </el-row>

  <el-form v-model="values" :disabled="disabled" label-position="top">
    <el-form-item :error="errors.description" label="Description">
      <editor v-model="values.description" style="width: 100%" />
    </el-form-item>

    <el-form-item :error="errors.user_guide" label="User guide">
      <editor v-model="values.user_guide" style="width: 100%" />
    </el-form-item>

    <el-form-item :error="errors.question_displayed" label="Question displayed">
      <el-input-number v-model="values.question_displayed" />
    </el-form-item>

    <el-form-item :error="errors.question_mode" label="Question mode">
      <el-select v-model="values.question_mode" style="width: 100%">
        <template
          v-for="(mode, index) in QuestionMode"
          :key="`question-${index}`"
        >
          <el-option
            v-if="isNaN(mode)"
            :value="QuestionMode[mode]"
            :label="mode"
          />
        </template>
      </el-select>
    </el-form-item>

    <el-form-item :error="errors.quiz_mode" label="Quiz mode">
      <el-select v-model="values.quiz_mode" style="width: 100%">
        <template v-for="(mode, index) in QuizMode" :key="`quiz-${index}`">
          <el-option v-if="isNaN(mode)" :value="QuizMode[mode]" :label="mode" />
        </template>
      </el-select>
    </el-form-item>

    <el-form-item :error="errors.timer_mode" label="Timer mode">
      <el-select v-model="values.timer_mode" style="width: 100%">
        <template v-for="(mode, index) in TimerMode" :key="`quiz-${index}`">
          <el-option
            v-if="isNaN(mode)"
            :value="TimerMode[mode]"
            :label="mode"
          />
        </template>
      </el-select>
    </el-form-item>

    <el-form-item :error="errors.timer && errors.timer_units" label="Timer">
      <el-input
        v-model.number="values.timer"
        type="number"
        :disabled="![0, 2].includes(values.timer_mode as number)"
      >
        <template #append>
          <el-select
            :disabled="![0, 2].includes(values.timer_mode as number)"
            v-model="values.timer_units"
            placeholder="Units"
            style="width: 7rem"
          >
            <template v-for="(unit, index) in Units" :key="`unit-${index}`">
              <el-option
                v-if="isNaN(unit)"
                :value="Units[unit]"
                :label="unit"
              />
            </template>
          </el-select>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item
      :error="errors.break ?? errors.break_units"
      label="Break duration"
    >
      <el-input v-model.number="values.break" type="number">
        <template #append>
          <el-select
            v-model="values.break_units"
            placeholder="Units"
            style="width: 7rem"
          >
            <template v-for="(unit, index) in Units" :key="`unit-${index}`">
              <el-option
                v-if="isNaN(unit)"
                :value="Units[unit]"
                :label="unit"
              />
            </template>
          </el-select>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>
