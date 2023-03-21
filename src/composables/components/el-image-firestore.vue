<script setup lang="ts">
  const props = defineProps<{
    src: string
  }>()

  const fullpath = computed(() => props.src)

  const { data: imageUrl } = useQuery({
    queryKey: ['image', fullpath],
    queryFn: () => {
      if (fullpath.value)
        return getFile(fullpath.value).catch(() => {
          return fullpath.value
        })
    },
    refetchOnWindowFocus: false,
  })
</script>

<template>
  <el-image :src="imageUrl" v-bind="$attrs" lazy class="img-firestore">
  </el-image>
</template>
