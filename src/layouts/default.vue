<script setup lang="ts">
  const padding = ref<string>('0')

  function setMinWidth() {
    if (
      window.matchMedia('(orientation: landscape)').matches &&
      window.innerWidth > 640
    ) {
      const p = Math.ceil(
        (window.innerWidth - (window.innerHeight * 9) / 16) / 2
      )
      padding.value = `${p}px`
    } else {
      padding.value = '0px'
    }
  }

  onMounted(() => {
    setMinWidth()
    window.onresize = () => {
      setMinWidth()
    }
  })

  onUnmounted(() => {
    window.onresize = null
  })
</script>

<template>
  <el-container
    style="padding: 0 var(--global-layout-padding); min-height: 100vh"
    :style="{
      '--global-layout-padding': padding,
      '--global-main-height': 'calc(100vh - 56px)',
    }"
  >
    <el-main style="overflow: visible; max-width: 100%">
      <router-view />
    </el-main>
  </el-container>
</template>
