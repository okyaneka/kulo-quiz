<route lang="yaml">
meta:
  name: Guest Login
  noRequireAuth: true
</route>

<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'

  import { guestLogin } from '~/apps/auth/auth.repository'
  import { useGuestLoginScheme } from '~/apps/auth/auth.shceme'
  import type { GuestLoginPayload } from '~/apps/auth/auth.types'

  const router = useRouter()

  const { errors, validate, values } = useForm<GuestLoginPayload>({
    validationSchema: toFormValidator(
      z.object(useGuestLoginScheme()._def.shape())
    ),
  })
  const { value: name } = useField<string>('name')

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: GuestLoginPayload) => guestLogin(payload),
    onSuccess: () => {
      router.push('/home')
      ElMessage.success('Login successfully.')
    },
  })

  async function handleSubmit() {
    if ((await validate()).valid) {
      mutate(values)
    }
  }
</script>

<template>
  <el-row align="middle" justify="center" style="min-height: 100vh">
    <el-col :span="24" :md="20" style="max-width: 480px; padding: 20px">
      <el-card
        v-loading="isLoading"
        :body-style="{ padding: '2rem 1.5rem' }"
        style="margin-bottom: 20px"
      >
        <el-space :size="24" direction="vertical" fill style="width: 100%">
          <h1 align="center">Login as guest.</h1>

          <el-form @submit.prevent="handleSubmit()">
            <el-form-item :error="errors.name">
              <el-input v-model="name" placeholder="Just tell us your name." />
            </el-form-item>

            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%; margin-top: 18px"
            >
              <el-button type="primary" native-type="submit">Send</el-button>
            </el-space>
          </el-form>
        </el-space>
      </el-card>

      <p align="center">
        Or you can <router-link to="/login">Login</router-link> /
        <router-link to="/">Register</router-link>.
      </p>
    </el-col>
  </el-row>
</template>
