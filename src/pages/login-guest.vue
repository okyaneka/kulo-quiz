<route lang="yaml">
meta:
  noRequireAuth: true
</route>

<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'

  import {
    guestLogin,
    type GuestLoginPayload,
  } from '~/apps/auth/auth.repository'
  import { GuestLoginScheme } from '~/apps/auth/auth.shceme'

  const router = useRouter()

  const { errors, validate, values } = useForm<GuestLoginPayload>({
    validationSchema: GuestLoginScheme,
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
  <el-row
    align="middle"
    justify="center"
    style="min-height: 100vh; padding: var(--el-main-padding) 0"
  >
    <el-col :span="24" :md="20">
      <el-card v-loading="isLoading">
        <el-space :size="32" direction="vertical" fill>
          <!-- <el-button @click="resetForm()">Reset</el-button> -->
          <el-space />
          <el-row justify="center">
            <el-col :span="16">
              <el-image :src="LOGO" style="" />
            </el-col>
          </el-row>

          <h1 align="center">You can enjoy us as a guest.</h1>

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
              <el-button type="primary" native-type="submit"
                >Login as a Guest</el-button
              >
            </el-space>
          </el-form>
        </el-space>
      </el-card>

      <p align="center" style="margin-top: 32px">
        Or you can <router-link to="/login">Login</router-link> /
        <router-link to="/">Register</router-link>.
      </p>
    </el-col>
  </el-row>
</template>
