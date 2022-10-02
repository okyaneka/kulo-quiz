<script setup lang="ts">
  import QRCode from 'qrcode'
  import { z } from 'zod'
  import { useAuthStore } from '~/apps/auth/auth.repository'
  import { setGroup as _setGroup } from '~/apps/group/group.repositories'
  import type { GroupPayload } from '~/apps/group/group.types'
  import type { Quiz } from '~/apps/quiz/quiz.types'
  import { setShare } from '~/apps/share/share.repositories'

  enum ShareWith {
    'wa',
    'ig-feed',
    'ig-story',
    'fb-post',
    'fb-story',
    'twitter',
    'telegram',
  }

  const shares = [
    {
      key: ShareWith['wa'],
      color: '#25D366',
      icon: 'whatsapp',
      label: 'Whatsapp',
    },
    {
      key: ShareWith['ig-feed'],
      color: '#E1306C',
      icon: 'instagram',
      label: 'IG Feed',
    },
    {
      key: ShareWith['ig-story'],
      color: '#E1306C',
      icon: 'instagram',
      label: 'IG Story',
    },
    {
      key: ShareWith['fb-post'],
      color: '#4267B2',
      icon: 'facebook',
      label: 'FB Post',
    },
    {
      key: ShareWith['fb-story'],
      color: '#4267B2',
      icon: 'facebook',
      label: 'FB Story',
    },
    {
      key: ShareWith['twitter'],
      color: '#1DA1F2',
      icon: 'twitter',
      label: 'Twitter',
    },
    {
      key: ShareWith['telegram'],
      color: '#0088cc',
      icon: 'telegram',
      label: 'Telegram',
    },
  ] as const

  const props = defineProps<{
    modelValue: boolean
    quiz: Pick<Quiz, 'id' | 'title'>
  }>()
  defineEmits(['update:modelValue'])

  const { user } = storeToRefs(useAuthStore())

  const qrWrapper = ref<HTMLElement>()

  const qr_url = ref<string>()
  const loaded = ref<boolean>(false)
  const canShare = ref<boolean>(false)
  const shareAs = ref<'public' | 'group'>('public')

  const loaderHeight = computed<string>(
    () => (qrWrapper.value?.clientWidth ?? 0) + 'px'
  )

  const caption = computed<string>(() => {
    return `Take a look. This "${props.quiz.title}" quiz is quite interesting. Follow this link: ${shareUrl.value}`
  })

  const {
    values: group,
    errors,
    validate,
    resetForm,
  } = useForm<GroupPayload>({
    validationSchema: toFormValidator(
      z.object({
        name: z
          .string({
            required_error: 'Group name cannot be empty',
            invalid_type_error: 'Group name cannot be empty',
          })
          .min(1, 'Group name cannot be empty'),
      })
    ),
    initialValues: { name: '' },
  })
  useField<string>('name')

  const { mutateAsync: setGroup } = useMutation({
    mutationFn: (payload: GroupPayload) => _setGroup(props.quiz.id, payload),
  })

  const {
    data: shareUrl,
    mutate: getData,
    isLoading: loading,
  } = useMutation({
    mutationFn: async () => {
      canShare.value = !!navigator.share
      const url = new URL(location.origin)

      if (shareAs.value == 'public') {
        url.pathname = `/q/${props.quiz.id}`
      } else if (shareAs.value == 'group') {
        const groupData = await setGroup(group)
        url.pathname = `/g/${groupData.id}`
      }

      if (user.value != undefined) {
        url.searchParams.append('r', user.value.uid)
      }

      const share = await setShare({ urlin: url.href })

      qr_url.value = await QRCode.toDataURL(share.urlout, {
        margin: 0,
        width: 320,
      })
      return share.urlout
    },
    onSuccess: () => {
      loaded.value = true
    },
  })

  function setData(s?: typeof shareAs.value) {
    shareAs.value = s ?? 'public'
    getData()
  }

  function resetData() {
    loaded.value = false
  }

  function handleChange(val: string) {
    resetData()
    resetForm()
    if (val == 'public') getData()
  }

  async function handleSubmit() {
    if ((await validate()).valid) setData('group')
  }

  function shareTo(app: ShareWith) {
    console.log(app)

    if (app == ShareWith['wa']) return shareWithWa()
    if (app == ShareWith['ig-feed']) return
    if (app == ShareWith['ig-story']) return
    if (app == ShareWith['fb-post']) return
    if (app == ShareWith['fb-story']) return
    if (app == ShareWith['twitter']) return
    if (app == ShareWith['telegram']) return
  }

  function shareWithWa() {
    const anchor = document.createElement('a')
    anchor.target = '_blank'
    anchor.href = `https://wa.me/?text=${caption.value}`
    anchor.setAttribute('data-action', 'share/whatsapp/share')
    anchor.onclick = () => document.removeChild(anchor)
    anchor.click()
  }

  function copyLink() {
    console.log('copyLink')
  }

  function downloadQR() {
    console.log('downloadQR')
  }

  function moreShare() {
    console.log('moreShare')
  }
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue')"
    direction="btt"
    size="100%"
    @opened="setData"
    @close="resetData"
  >
    <template #title>
      <strong>Share Quiz!</strong>
    </template>

    <template #default>
      <el-card>
        <el-row justify="center">
          <el-col v-if="!!user">
            <el-space direction="vertical" fill :size="8" style="width: 100%">
              <p align="center">Share as:</p>
              <el-row justify="center">
                <el-switch
                  v-model="shareAs"
                  :loading="loading"
                  class="mb-2"
                  active-color="var(--el-color-primary)"
                  inactive-color="var(--el-color-primary)"
                  inactive-text="Public"
                  inactive-value="public"
                  active-text="Group"
                  active-value="group"
                  @change="handleChange($event as string)"
                />
              </el-row>
              <el-space v-if="shareAs == 'group'" direction="vertical">
                <el-form v-model="group" @submit.prevent="handleSubmit()">
                  <el-form-item :error="errors.name">
                    <el-input
                      :disabled="loaded || loading"
                      placeholder="Enter group name"
                      v-model="group.name"
                    >
                    </el-input>
                  </el-form-item>

                  <el-form-item v-if="!loading">
                    <el-row justify="center" style="width: 100%">
                      <el-button
                        v-if="loaded"
                        type="primary"
                        @click="loaded = false"
                      >
                        Create another group
                      </el-button>
                      <el-button v-else type="primary" native-type="submit">
                        Get Link
                      </el-button>
                    </el-row>
                  </el-form-item>
                </el-form>
                <template v-if="!loading"> </template>
              </el-space>
            </el-space>
          </el-col>

          <el-col v-if="loaded || loading" :span="18">
            <el-row justify="center">
              <el-card
                shadow="never"
                :body-style="{ padding: '12px' }"
                :style="{
                  width: '320px',
                  maxWidth: '100%',
                }"
              >
                <div ref="qrWrapper"></div>
                <el-skeleton
                  v-if="loading"
                  animated
                  style="width: 100%"
                  :style="{ height: loaderHeight }"
                >
                  <template #template>
                    <el-skeleton-item
                      variant="rect"
                      style="height: 100%"
                    ></el-skeleton-item>
                  </template>
                </el-skeleton>
                <el-image v-if="loaded" :src="qr_url"> </el-image>
              </el-card>
            </el-row>
          </el-col>

          <el-col>
            <h3 align="center">"{{ quiz.title }}"</h3>
          </el-col>

          <el-col>
            <p align="center" style="margin: 8px 0">Share to:</p>
            <el-space wrap style="width: 100%; justify-content: center">
              <el-space
                v-for="share in shares"
                :key="share.key"
                direction="vertical"
                :size="0"
                @click="shareTo(share.key)"
                style="padding: 8px"
              >
                <el-button
                  circle
                  plain
                  :disabled="!loaded"
                  :color="share.color"
                  style="padding: 6px; height: 32px; width: 32px"
                >
                  <el-icon style="width: 100%; height: 100%">
                    <svg-icon :name="share.icon" />
                  </el-icon>
                </el-button>
                <strong
                  style="
                    white-space: nowrap;
                    font-size: var(--el-font-size-small);
                  "
                >
                  {{ share.label }}
                </strong>
              </el-space>
            </el-space>

            <hr style="margin: 8px; border: var(--el-border)" />

            <el-space
              wrap
              alignment="start"
              style="width: 100%; justify-content: center"
            >
              <el-space
                direction="vertical"
                style="padding: 2px"
                :size="0"
                @click="copyLink()"
              >
                <el-button
                  circle
                  plain
                  :disabled="!loaded"
                  style="padding: 6px; height: 32px; width: 32px"
                >
                  <el-icon style="width: 100%; height: 100%">
                    <svg-icon name="duplicate" />
                  </el-icon>
                </el-button>
                <p align="center" style="font-size: var(--el-font-size-small)">
                  Copy Link
                </p>
              </el-space>
              <el-space
                direction="vertical"
                style="padding: 2px"
                :size="0"
                @click="downloadQR()"
              >
                <el-button
                  circle
                  plain
                  :disabled="!loaded"
                  style="padding: 6px; height: 32px; width: 32px"
                >
                  <el-icon style="width: 100%; height: 100%">
                    <svg-icon name="cloud-download" />
                  </el-icon>
                </el-button>
                <p align="center" style="font-size: var(--el-font-size-small)">
                  Download QR
                </p>
              </el-space>
              <el-space
                v-if="canShare"
                direction="vertical"
                style="padding: 2px"
                :size="0"
                @click="moreShare()"
              >
                <el-button
                  circle
                  plain
                  :disabled="!loaded"
                  style="padding: 6px; height: 32px; width: 32px"
                >
                  <el-icon style="width: 100%; height: 100%">
                    <svg-icon name="dots-horizontal" />
                  </el-icon>
                </el-button>
                <p align="center" style="font-size: var(--el-font-size-small)">
                  More
                </p>
              </el-space>
            </el-space>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </el-drawer>
</template>
