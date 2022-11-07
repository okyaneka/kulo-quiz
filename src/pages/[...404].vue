<script setup lang="ts">
  const { isNotFound } = storeToRefs(useNotfoundStore())

  onMounted(() => {
    isNotFound.value = true
  })
</script>
