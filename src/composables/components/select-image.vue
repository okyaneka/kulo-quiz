<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      collection: string
      modelValue: string
      maxSize?: number
    }>(),
    {
      maxSize: 1024,
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const inputFile = ref<HTMLInputElement>()
  const isDragActive = ref(false)

  const { isLoading, mutateAsync: _uploadFile } = useMutation({
    mutationFn: (file: File) => {
      if (file.size > props.maxSize * 1024)
        throw new Error(`Max size is ${props.maxSize}KB`)

      return uploadFile(file, props.collection ?? '')
    },
    onSuccess: (data) => {
      model.value = data.metadata.fullPath
    },
  })

  function openSelectFile() {
    inputFile.value?.click()
  }

  async function handleFileChanged() {
    const files = inputFile.value?.files
    if (files != undefined && files.length > 0) _uploadFile(files[0])
  }

  function handleDrop(event: DragEvent) {
    isDragActive.value = false
    const files = event.dataTransfer?.files
    if (files != undefined && files.length > 0) _uploadFile(files[0])
  }

  function removeImageUrl() {
    model.value = ''
  }
</script>

<template>
  <el-card
    v-loading="isLoading"
    class="image-card"
    shadow="never"
    :body-style="{
      height: '160px',
      padding: '8px',
      background: isDragActive
        ? 'var(--el-fill-color)'
        : 'var(--el-fill-color-lighter)',
    }"
    @dragover.prevent="isDragActive = true"
    @dragexit="isDragActive = false"
    @drop.prevent="handleDrop"
  >
    <el-row
      :align="model ? 'bottom' : 'middle'"
      justify="center"
      style="position: relative; height: 100%"
    >
      <el-image-firestore
        v-if="model"
        :src="model"
        fit="contain"
        style="height: 100%"
      ></el-image-firestore>

      <el-space
        :size="0"
        direction="vertical"
        style="position: absolute; padding: 8px"
      >
        <el-space>
          <el-button
            size="large"
            :class="!model ? 'overlay' : ''"
            circle
            @click="openSelectFile"
          >
            <template #icon>
              <svg-icon
                :name="model ? 'arrow-swap-horizontal' : 'add-outline'"
              ></svg-icon>
            </template>
          </el-button>

          <el-button
            v-if="!!model"
            size="large"
            class="overlay"
            type="danger"
            circle
            @click="removeImageUrl"
          >
            <el-icon :size="32">
              <svg-icon
                name="add-outline"
                style="transform: rotate(45deg)"
              ></svg-icon>
            </el-icon>
          </el-button>
        </el-space>

        <span v-if="!model">Add picture or drop here!</span>
      </el-space>
    </el-row>
  </el-card>

  <input
    ref="inputFile"
    type="file"
    style="display: none"
    accept="image/*"
    @change="handleFileChanged"
  />
</template>

<style scoped>
  .image-card {
    transition: 'all .3s ease-in';
  }
  .image-card .overlay {
    opacity: 0.8;
  }
  .image-card:hover .overlay {
    opacity: 1;
  }
</style>
