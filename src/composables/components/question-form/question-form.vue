<script setup lang="ts">
  import {
    QuestionMode,
    type QuestionPayload,
    type QuestionPayloads,
    type Questions,
  } from '~/apps/question/question.types'
  import { QuestionPayloadScheme } from '~/apps/question/question.schemes'

  const props = defineProps<{
    value: Partial<Questions>
    disabled?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:value', value: Partial<Questions>): void
  }>()

  const emitTimeout = ref()

  const quickValues = [5, 10, 20, 50, 'custom']
  const quickPoint = ref<string | number>()
  const quickTimer = ref<string | number | null>()

  const { values, errors, setValues } = useForm<QuestionPayload>({
    validationSchema: toFormValidator(
      z.object(QuestionPayloadScheme._def.shape())
    ),
  })
  const { value: point } = useField<number | null>('point')
  const { value: mode } = useField<QuestionMode | null>('mode')
  const { value: guide } = useField<string | null>('guide')
  const { value: timer } = useField<number | null>('timer')
  const { value: image_url } = useField<string | null>('image_url')

  function updateModel(data?: Partial<Questions>) {
    clearTimeout(emitTimeout.value)
    emitTimeout.value = undefined
    emitTimeout.value = setTimeout(() => {
      const value = Object.assign({}, props.value, values, data)
      emit('update:value', value)
    }, 3e2)
  }

  watch(quickPoint, (value) => {
    if (value && typeof value == 'number') point.value = value
  })

  watch(point, () => updateModel())

  watch(mode, () => updateModel())

  watch(image_url, () => updateModel())

  watch(guide, () => updateModel())

  watch(quickTimer, (value) => {
    if (value && typeof value == 'number') timer.value = value
  })

  watch(timer, () => updateModel())

  onMounted(() => {
    point.value = props.value?.point ?? null
    mode.value = props.value?.mode ?? null
    guide.value = props.value?.guide ?? null
    image_url.value = props.value?.image_url ?? null
    timer.value = props.value?.timer ?? null
    setValues(props.value)

    if (point.value != null)
      quickPoint.value = quickValues.includes(point.value)
        ? point.value
        : 'custom'
    if (timer.value != null)
      quickTimer.value = quickValues.includes(timer.value)
        ? timer.value
        : 'custom'
  })
</script>

<template>
  <el-form label-position="top" :disabled="disabled">
    <el-form-item :error="errors.point" label="Point">
      <el-row justify="space-between" style="width: 100%">
        <el-button
          v-for="point in quickValues"
          :key="point"
          :type="quickPoint == point ? 'primary' : undefined"
          round
          style="margin: 4px 0 !important"
          @click="quickPoint = point"
          >{{ point }}</el-button
        >
      </el-row>

      <el-input
        v-if="quickPoint == 'custom'"
        v-model.number="point"
        style="margin-top: 12px"
        placeholder="Input point"
      ></el-input>
    </el-form-item>

    <el-form-item :error="errors.mode" label="Question mode">
      <template v-for="option in QuestionMode" :key="option">
        <el-button
          v-if="!isNaN(option)"
          :type="mode == option ? 'primary' : undefined"
          round
          style="margin: 4px 0 !important"
          @click="mode = option"
        >
          {{ QuestionMode[option] }}
        </el-button>
      </template>
    </el-form-item>

    <el-form-item :error="errors.guide" label="Question guide">
      <el-input v-model="guide" type="textarea"></el-input>
    </el-form-item>

    <el-form-item label="Image guide">
      <el-col>
        <select-image v-model="image_url" style="width: 100%"></select-image>
      </el-col>
    </el-form-item>

    <el-form-item :error="errors.timer" label="Timer (seconds)">
      <el-row justify="space-between" style="width: 100%">
        <el-button
          v-for="point in quickValues"
          :type="quickTimer == point ? 'primary' : undefined"
          :key="point"
          round
          style="margin: 4px 0 !important"
          @click="quickTimer = point"
          >{{ point }}</el-button
        >
      </el-row>

      <el-input
        v-if="quickTimer == 'custom'"
        v-model.number="timer"
        placeholder="Input timer"
        style="margin-top: 12px"
      >
      </el-input>
    </el-form-item>

    <template v-if="mode != undefined">
      <hr
        style="border: 1px solid var(--el-border-color); margin-bottom: 0.5rem"
      />
      <question-choices-form
        v-if="mode == QuestionMode.Choices"
        :value="value"
        @update:value="updateModel($event)"
      ></question-choices-form>
    </template>
  </el-form>
</template>
