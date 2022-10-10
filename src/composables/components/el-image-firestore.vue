<script setup lang="ts">
  const props = defineProps<{
    src: string
  }>()

  const fullpath = computed(() => props.src)

  const { data: imageUrl, isLoading: loading } = useQuery({
    queryKey: ['image', fullpath],
    queryFn: () => getFile(fullpath.value),
  })
</script>

<template>
  <el-skeleton v-if="loading" loading animated>
    <template #template>
      <el-skeleton-item variant="image" style="width: 240px; height: 240px" />
    </template>
  </el-skeleton>
  <el-image v-else :src="imageUrl"> </el-image>
</template>
