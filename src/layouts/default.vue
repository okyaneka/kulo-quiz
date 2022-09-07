<script setup lang="ts">
  const padding = ref<string>('0')

  function setMinWidth() {
    if (window.matchMedia('(orientation: landscape)').matches) {
      const p = Math.ceil(
        (window.innerWidth - (window.innerHeight * 9) / 16) / 2
      )
      padding.value = `0 ${p}px`
    } else {
      padding.value = '0'
    }
  }

  onMounted(() => {
    setMinWidth()
    window.onresize = () => {
      setMinWidth()
    }
  })
</script>

<template>
  <el-container :style="{ padding }">
    <el-main style="padding-top: 0; padding-bottom: 0; overflow: visible">
      <router-view />
    </el-main>
  </el-container>
</template>
