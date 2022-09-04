<route lang="yaml">
name: quiz-detail
meta:
  requireAuth: true
  layout: private
</route>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import type { TabsPaneContext } from 'element-plus'
  import { StarFilled } from '@element-plus/icons-vue'
  import type { SmoothScrollOptions } from 'vue3-smooth-scroll'
  import type { QuizRateValue } from '~/apps/quiz/quiz.repository'

  const router = useRouter()
  const smoothScroll: ((opt: SmoothScrollOptions) => void) | undefined =
    inject('smoothScroll')

  const images = [
    'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
    'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
    'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
    'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
    'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
    'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg',
  ]

  const tableData = [
    { name: 'question_total', value: 50 },
    { name: 'max_score', value: 100 },
    { name: 'question_modes', value: 'classic' },
    { name: 'dificulty_level', value: 'easy' },
    { name: 'working_duration', value: 15 },
    { name: 'security_level', value: 'weak' },
    { name: 'time_limit_to_repeat', value: 10 },
  ]

  // el
  const description = ref<HTMLElement>()
  const userGuide = ref<HTMLElement>()
  const spesification = ref<HTMLElement>()

  const ratings = ref<QuizRateValue[]>([
    { star: 5, users: 368, percentage: 64 },
    { star: 4, users: 121, percentage: 21 },
    { star: 3, users: 52, percentage: 9 },
    { star: 2, users: 11, percentage: 2 },
    { star: 1, users: 23, percentage: 4 },
  ])

  const index = ref<number>()
  const active = ref<'description' | 'userGuide' | 'spesification'>()
  const isShowPreview = ref<boolean>(false)

  const elements = computed((): Ref<HTMLElement | undefined>[] => {
    return [description, userGuide, spesification]
  })

  function handleBack() {
    if (window.history.length) {
      router.back()
    } else {
      router.push({ name: 'quiz' })
    }
  }

  function showPreview(idx: number) {
    index.value = idx
    isShowPreview.value = true
  }

  function setActive() {
    for (let i = elements.value.length - 1; i >= 0; i--) {
      const element: Ref<HTMLElement | undefined> = elements.value[i]
      const offsetTop = element.value?.offsetTop ?? 0

      if (window.scrollY >= offsetTop - 54 - 32) {
        active.value = (() => {
          switch (i) {
            case 0:
              return 'description'
            case 1:
              return 'userGuide'
            case 2:
              return 'spesification'
          }
        })()
        return active.value
      }
    }
    active.value = 'description'
    return active.value
  }

  function enableScrollObserver() {
    window.onscroll = () => {
      setActive()
    }
  }

  function disableScrollObserver() {
    window.onscroll = null
  }

  function handleTabClicked(data: TabsPaneContext) {
    disableScrollObserver()
    const el = (() => {
      switch (data.paneName) {
        case 'description':
          return description
        case 'userGuide':
          return userGuide
        case 'spesification':
          return spesification
        default:
          return description
      }
    })()

    if (smoothScroll) {
      smoothScroll({
        scrollTo: el?.value ?? 0,
        duration: 300,
        offset: -54,
      })
    }

    setTimeout(() => {
      enableScrollObserver()
    }, 300)
  }

  onMounted(() => {
    setActive()
    enableScrollObserver()
  })

  onUnmounted(() => {
    disableScrollObserver()
  })
</script>

<template>
  <el-row style="padding: 20px 0">
    <el-col>
      <el-button type="primary" link @click="handleBack()">Back</el-button>
    </el-col>
    <el-col>
      <el-carousel indicator-position="none" arrow="hover" height="200px">
        <el-carousel-item
          v-for="(image, index) in images"
          :key="index"
          @click="showPreview(index)"
        >
          <el-image :src="image" fit="contain" />
        </el-carousel-item>
      </el-carousel>
      <el-image-viewer
        v-if="isShowPreview"
        :url-list="images"
        :initial-index="index"
        teleported
        @close="isShowPreview = false"
      />
    </el-col>
    <el-col>
      <h3>{title}</h3>
    </el-col>
    <el-col style="">
      <el-tabs
        v-model="active"
        style="position: sticky; top: 0; background-color: var(--el-bg-color)"
        @tab-click="handleTabClicked"
      >
        <el-tab-pane label="Description" name="description" />
        <el-tab-pane label="User Guide" name="userGuide" />
        <el-tab-pane label="Spesification" name="spesification" />
      </el-tabs>

      <el-space fill wrap :size="20" style="max-width: 100%">
        <!-- #description -->
        <div ref="description">
          <h3>Description</h3>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde
            veniam quisquam officia voluptatibus accusantium distinctio
            recusandae, debitis maxime vero, iure architecto vel sunt odio?
            Atque cumque voluptatem unde modi ex.
          </p>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde
            veniam quisquam officia voluptatibus accusantium distinctio
            recusandae, debitis maxime vero, iure architecto vel sunt odio?
            Atque cumque voluptatem unde modi ex.
          </p>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde
            veniam quisquam officia voluptatibus accusantium distinctio
            recusandae, debitis maxime vero, iure architecto vel sunt odio?
            Atque cumque voluptatem unde modi ex.
          </p>
        </div>

        <!-- #user-guide -->
        <div ref="userGuide">
          <h3>User Guide</h3>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde
            veniam quisquam officia voluptatibus accusantium distinctio
            recusandae, debitis maxime vero, iure architecto vel sunt odio?
            Atque cumque voluptatem unde modi ex.
          </p>
        </div>

        <!-- #spesification -->
        <div ref="spesification">
          <h3>Spesification</h3>
          <el-table
            :data="tableData"
            :show-header="false"
            style="width: 100%; z-index: 0"
          >
            <el-table-column prop="name" />
            <el-table-column prop="value" />
          </el-table>
        </div>
      </el-space>
    </el-col>

    <el-col style="position: sticky; bottom: 64px; top: 8px; z-index: 1">
      <el-button type="primary" style="width: 100%">START QUIZ</el-button>
    </el-col>
    <el-col>
      <el-button style="width: 100%">Do Later</el-button>
    </el-col>

    <el-col>
      <el-space :size="20" wrap fill style="width: 100%">
        <h3>Players Review</h3>
        <el-row align="middle">
          <el-col :sm="8" style="margin-bottom: 0">
            <h1 align="center" style="font-size: 36px">
              4.8
              <span
                style="
                  font-size: var(--el-font-size-base);
                  color: var(--el-text-color-secondary);
                "
                >/ 5.0</span
              >
            </h1>
            <p
              align="center"
              style="font-size: var(--el-font-size-extra-small)"
            >
              96% are satisfied
            </p>
          </el-col>
          <el-col :sm="16">
            <table style="width: 100%">
              <tr v-for="(row, index) in ratings" :key="index">
                <td>
                  <el-row align="middle" style="flex-wrap: nowrap">
                    <el-icon color="#ffc400"><StarFilled /></el-icon>
                    <span style="margin-right: 4px">{{ row.star }}</span>
                  </el-row>
                </td>
                <td style="width: 100%">
                  <el-progress
                    color="var(--el-color-primary)"
                    :percentage="row.percentage"
                    :show-text="false"
                  />
                </td>
                <td>{{ row.users }}</td>
              </tr>
            </table>
          </el-col>
        </el-row>
        <el-row v-for="i in 3" :key="i">
          <el-col v-if="i != 1">
            <el-divider style="margin: 0" />
          </el-col>
          <el-col style="margin-bottom: 12px">
            <el-space :size="2">
              <el-icon color="#ffc400"><StarFilled /></el-icon>
              <el-icon color="#ffc400"><StarFilled /></el-icon>
              <el-icon color="#ffc400"><StarFilled /></el-icon>
              <el-icon color="#ffc400"><StarFilled /></el-icon>
              <el-icon color="#ffc400"><StarFilled /></el-icon>
            </el-space>
          </el-col>
          <el-col>
            <el-space :size="8">
              <el-avatar
                :size="20"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <strong>Bambang {{ i }}</strong>
            </el-space>
          </el-col>
          <el-col>
            <p style="color: var(--el-text-color-secondary)">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Molestiae aliquam vitae error. Quibusdam exercitationem tempora,
              officiis numquam, similique, omnis laboriosam quo commodi ab
              inventore ex nam aspernatur? Harum, excepturi adipisci!
              <a href="#">Show full</a>
            </p>
          </el-col>
        </el-row>
      </el-space>
    </el-col>
  </el-row>
</template>
