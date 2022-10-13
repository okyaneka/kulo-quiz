<route lang="yaml">
meta:
  layout: private
</route>

<script setup lang="ts">
  import QuizFloatingActions from '../../composables/components/quiz/quiz-floating-actions.vue'
  import draggable from 'vuedraggable'

  function randomBackground(): string {
    function randomHex(): string {
      return Math.round(Math.random() * 256).toString(16)
    }
    const r = randomHex()
    const g = randomHex()
    const b = randomHex()
    return `#${r}${g}${b}`
  }

  const drag = ref(false)

  const list = ref<{ name: string; id: number }[]>([
    {
      name: 'Edgard',
      id: 6,
    },
    {
      name: 'Juan 7',
      id: 7,
    },
    {
      name: 'Juan 8',
      id: 8,
    },
  ])

  const dragOptions = ref({
    animation: 200,
    group: 'description',
    disabled: false,
    ghostClass: 'ghost',
  })
  onMounted(() => {
    document.documentElement.style.scrollSnapType = 'y mandatory'
  })
</script>

<template>
  <el-row>
    <el-col>
      <draggable v-model="list" tag="transition-group" item-key="order">
        <template #item="{ element }">
          <div>{{ element.name }}</div>
        </template>
      </draggable>
    </el-col>

    <el-col>
      <draggable v-model="list" tag="transition-group" :animation="200">
        <template #item="{ element }">
          <li class="list-group-item">
            <i
              :class="
                element.fixed ? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'
              "
              @click="element.fixed = !element.fixed"
              aria-hidden="true"
            ></i>
            {{ element.name }}
          </li>
        </template>
      </draggable>
    </el-col>
  </el-row>

  <el-row v-if="false">
    <el-col
      class="content"
      v-for="i in 3"
      :key="i"
      style="
        height: calc(100vh - 56px);
        overflow: hidden;
        margin: 0;
        position: relative;
      "
      :style="{ backgroundColor: randomBackground() }"
    >
      <el-row>
        <el-col style="text-align: center">
          <el-button v-for="i in 100" :key="i" style="margin: 8px"
            >Angka {{ i }}</el-button
          >
        </el-col>
      </el-row>
      <quiz-floating-actions></quiz-floating-actions>
    </el-col>
  </el-row>
</template>

<style scoped>
  .content {
    scroll-snap-align: start;
  }
</style>
