<route lang="yaml">
name: edit-quiz-config
meta:
  layout: private
  requireAuth: true
</route>

<script setup lang="ts">
  import {
    getQuizConfig,
    setQuizConfig,
  } from '~/apps/quiz-config/quiz-config.repositories'
  import { QuizConfigScheme } from '~/apps/quiz-config/quiz-config.scheme'
  import type { QuizConfigPayload } from '~/apps/quiz-config/quiz-config.types'

  const route = useRoute()

  const quizId = route.params.id as string

  const autosaveInterval = ref()

  const { values, errors, setFieldValue, setValues, validate } =
    useForm<QuizConfigPayload>({
      validationSchema: QuizConfigScheme,
    })
  useField<QuizConfigPayload['autosave']>('autosave')
  useField<QuizConfigPayload['description']>('description')
  useField<QuizConfigPayload['user_guide']>('user_guide')
  useField<QuizConfigPayload['question_displayed']>('question_displayed')
  useField<QuizConfigPayload['question_mode']>('question_mode')
  useField<QuizConfigPayload['quiz_mode']>('quiz_mode')
  useField<QuizConfigPayload['timer_mode']>('timer_mode')
  useField<QuizConfigPayload['timer']>('timer')
  useField<QuizConfigPayload['timer_units']>('timer_units')
  useField<QuizConfigPayload['break']>('break')
  useField<QuizConfigPayload['break_units']>('break_units')

  const { refetch: getQuizConfigData } = useQuery({
    enabled: false,
    queryKey: ['quiz-config'],
    queryFn: () => getQuizConfig(quizId),
    onSuccess: (data) => {
      setValues({ ...(data as QuizConfigPayload) })
      if (values.autosave == undefined) setFieldValue('autosave', true)
      setAutosave(values.autosave)
    },
  })

  const { mutate: autosave } = useMutation({
    mutationFn: (payload: QuizConfigPayload) => setQuizConfig(quizId, payload),
    onMutate: () => {
      ElMessage.info('Saving')
    },
  })

  const { mutate, isLoading: saveConfigLoading } = useMutation({
    mutationFn: (payload: QuizConfigPayload) => setQuizConfig(quizId, payload),
  })

  function setAutosave(isActive: boolean) {
    if (isActive) {
      autosaveInterval.value = setInterval(() => {
        autosave(values)
      }, 1000 * 60 * 5)
    } else {
      clearInterval(autosaveInterval.value)
      autosaveInterval.value = undefined
    }
  }

  async function handleSaveConfig() {
    if ((await validate()).valid) {
      mutate(values)
    }
  }

  onMounted(() => {
    getQuizConfigData.value()
  })
</script>

<template>
  <el-row>
    <el-col>
      <el-card v-loading="saveConfigLoading">
        <el-row
          justify="space-between"
          align="middle"
          style="margin-bottom: 16px"
        >
          <h3>Config</h3>
          <span>
            Autosave:
            <el-switch
              v-model="values.autosave"
              @change="(val) => setAutosave(val as boolean)"
            />
          </span>
        </el-row>

        <el-form
          v-model="values"
          label-position="top"
          @submit.prevent="handleSaveConfig"
        >
          <el-form-item :error="errors.description" label="Description">
            <editor v-model="values.description" style="width: 100%" />
          </el-form-item>

          <el-form-item :error="errors.user_guide" label="User guide">
            <editor v-model="values.user_guide" style="width: 100%" />
          </el-form-item>

          <el-form-item
            :error="errors.question_displayed"
            label="Question displayed"
          >
            <el-input-number v-model="values.question_displayed" />
          </el-form-item>

          <el-form-item :error="errors.question_mode" label="Question mode">
            <el-select v-model="values.question_mode" style="width: 100%">
              <el-option :value="0" label="Random" />
              <el-option :value="1" label="Custom" />
            </el-select>
          </el-form-item>

          <el-form-item :error="errors.quiz_mode" label="Quiz mode">
            <el-select v-model="values.quiz_mode" style="width: 100%">
              <el-option :value="0" label="Classic" />
            </el-select>
          </el-form-item>

          <el-form-item :error="errors.timer_mode" label="Timer mode">
            <el-select v-model="values.timer_mode" style="width: 100%">
              <el-option :value="0" label="Quiz timer" />
              <el-option :value="1" label="Question timer" />
              <el-option :value="2" label="Combination timer" />
            </el-select>
          </el-form-item>

          <el-form-item :error="errors.timer" label="Timer">
            <el-input
              v-model.number="values.timer"
              type="number"
              :disabled="![0, 2].includes(values.timer_mode)"
            >
              <template #append>
                <el-select
                  v-model="values.timer_units"
                  placeholder="Units"
                  style="width: 7rem"
                >
                  <el-option label="Seconds" :value="1" />
                  <el-option label="Minutes" :value="2" />
                  <el-option label="Hour" :value="3" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :error="errors.break" label="Break duration">
            <el-input v-model.number="values.break" type="number">
              <template #append>
                <el-select
                  v-model="values.break_units"
                  placeholder="Units"
                  style="width: 7rem"
                >
                  <el-option label="Seconds" :value="1" />
                  <el-option label="Minutes" :value="2" />
                  <el-option label="Hour" :value="3" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>

          <el-space :size="16">
            <el-button type="primary" native-type="submit">Save</el-button>
          </el-space>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>
