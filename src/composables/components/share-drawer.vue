<!-- eslint-disable @typescript-eslint/no-explicit-any -->
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

  const shares: any[] = [
    {
      key: ShareWith['wa'],
      color: '#25D366',
      icon: 'whatsapp',
      label: 'Whatsapp',
    },
    {
      disabled: true,
      key: ShareWith['ig-feed'],
      color: '#E1306C',
      icon: 'instagram',
      label: 'IG Feed',
    },
    {
      disabled: true,
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
      disabled: true,
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
  ]

  const props = defineProps<{
    modelValue: boolean
    quiz: Pick<Quiz, 'id' | 'title'>
  }>()
  defineEmits(['update:modelValue'])

  const { user } = storeToRefs(useAuthStore())

  const qrWrapper = ref<HTMLElement>()

  const qrUrl = ref<string>()
  const loaded = ref<boolean>(false)
  const canShare = ref<boolean>(false)
  const shareAs = ref<'public' | 'group'>('public')

  const loaderHeight = computed<string>(
    () => (qrWrapper.value?.clientWidth ?? 0) - 24 + 'px'
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
      const url = new URL(import.meta.env.VITE_APP_BASE_URL ?? location.origin)

      if (shareAs.value == 'public') url.pathname = `/q/${props.quiz.id}`
      else if (shareAs.value == 'group')
        url.pathname = `/g/${(await setGroup(group)).id}`

      if (user.value != undefined) url.searchParams.append('r', user.value.uid)

      const share = await setShare({ urlin: url.href })

      qrUrl.value = await QRCode.toDataURL(share.urlout, {
        margin: 2,
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
    if (app == ShareWith['wa']) return shareToWa()
    if (app == ShareWith['ig-feed']) return
    if (app == ShareWith['ig-story']) return
    if (app == ShareWith['fb-post']) return shareToFb()
    if (app == ShareWith['fb-story']) return
    if (app == ShareWith['twitter']) return shareToTwitter()
    if (app == ShareWith['telegram']) return shareToTelegram()
  }

  function useAnchor() {
    const anchor = document.createElement('a')
    anchor.target = '_blank'
    anchor.onclick = () => document.removeChild(anchor)
    return anchor
  }

  function shareToWa() {
    const anchor = useAnchor()
    anchor.href = `https://wa.me/?text=${caption.value}`
    anchor.setAttribute('data-action', 'share/whatsapp/share')
    anchor.click()
  }

  function shareToFb() {
    const anchor = useAnchor()
    anchor.href = `https://www.facebook.com/dialog/share?app_id=${
      import.meta.env.VITE_FB_APP_ID
    }&display=true&href=${shareUrl.value}`
    anchor.click()
  }

  function shareToTwitter() {
    const anchor = useAnchor()
    anchor.href = `https://twitter.com/intent/tweet?text=${caption.value}`
    anchor.click()
  }

  function shareToTelegram() {
    const anchor = useAnchor()
    anchor.href = `https://t.me/share/url?url=${encodeURIComponent(
      caption.value ?? ''
    )}`
    anchor.click()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(caption.value)
    ElMessage.success('Link coppied!')
  }

  function downloadQR() {
    const anchor = useAnchor()
    anchor.href = qrUrl.value ?? ''
    anchor.target = 'download'
    anchor.download = props.quiz.title + ' quiz'
    anchor.click()
  }

  async function moreShare() {
    if (qrUrl.value == undefined) throw new Error('qr_code_not_generated')
    const blob = await (await fetch(qrUrl.value)).blob()
    const file = new File([blob], props.quiz.title + ' quiz.png')
    navigator.share({ text: caption.value, files: [file] })
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
                :body-style="{ padding: 0 }"
                :style="{
                  width: '320px',
                  maxWidth: '100%',
                }"
              >
                <div ref="qrWrapper"></div>
                <el-skeleton
                  v-if="loading"
                  animated
                  style="width: calc(100% - 24px); padding: 12px"
                  :style="{ height: loaderHeight }"
                >
                  <template #template>
                    <el-skeleton-item
                      variant="rect"
                      style="height: 100%"
                    ></el-skeleton-item>
                  </template>
                </el-skeleton>
                <el-image v-if="loaded" :src="qrUrl"> </el-image>
              </el-card>
            </el-row>
          </el-col>

          <el-col>
            <h3 align="center">"{{ quiz.title }}"</h3>
          </el-col>

          <el-col>
            <p align="center" style="margin: 8px 0">Share to:</p>
            <el-space wrap style="width: 100%; justify-content: center">
              <template v-for="share in shares" :key="share.key">
                <el-space
                  v-if="!share?.disabled"
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
              </template>
            </el-space>

            <hr style="margin: 8px; border: var(--el-border)" />

            <el-space
              wrap
              alignment="start"
              style="width: 100%; justify-content: center"
            >
              <el-space direction="vertical" style="padding: 2px" :size="0">
                <el-button
                  circle
                  plain
                  :disabled="!loaded"
                  style="padding: 6px; height: 32px; width: 32px"
                  @click="copyLink()"
                >
                  <el-icon style="width: 100%; height: 100%">
                    <svg-icon name="duplicate" />
                  </el-icon>
                </el-button>
                <p align="center" style="font-size: var(--el-font-size-small)">
                  Copy Link
                </p>
              </el-space>
              <el-space direction="vertical" style="padding: 2px" :size="0">
                <el-button
                  circle
                  plain
                  :disabled="!loaded"
                  style="padding: 6px; height: 32px; width: 32px"
                  @click="downloadQR()"
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
              >
                <el-button
                  circle
                  plain
                  @click="moreShare()"
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
