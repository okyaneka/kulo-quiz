<route lang="yaml">
meta:
  noRequireAuth: true
</route>

<script setup lang="ts">
  import LOGO from '~/assets/images/logo-text.png'
  import { Hide, View } from '@element-plus/icons-vue'
  import { register, type RegisterPayload } from '~/apps/auth/auth.repository'
  import { RegisterScheme } from '~/apps/auth/auth.shceme'

  const router = useRouter()

  const { errors, validate, values } = useForm<RegisterPayload>({
    validationSchema: RegisterScheme,
  })
  const { value: email } = useField<string>('email')
  const { value: password } = useField<string>('password')
  const { value: password_confirmation } = useField<string>(
    'password_confirmation'
  )

  const { mutate, isLoading } = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      ElMessage.success('Register success.')
      router.push('/home')
    },
  })

  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)

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
          <el-space />
          <el-row justify="center">
            <el-col :span="16">
              <el-image :src="LOGO" style="" />
            </el-col>
          </el-row>

          <h1 align="center">Yeay! You're the choosen one! Come join us!</h1>

          <el-form @submit.prevent="handleSubmit()">
            <el-form-item :error="errors.email">
              <el-input v-model="email" placeholder="Email" type="email" />
            </el-form-item>

            <el-form-item :error="errors.password">
              <el-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
              >
                <template #suffix>
                  <el-button
                    circle
                    size="small"
                    text
                    :icon="showPassword ? Hide : View"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item :error="errors.password_confirmation">
              <el-input
                v-model="password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Password Confirmation"
              >
                <template #suffix>
                  <el-button
                    circle
                    size="small"
                    text
                    :icon="showConfirmPassword ? Hide : View"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </el-input>
            </el-form-item>

            <el-space
              direction="vertical"
              fill
              :fill-ratio="100"
              style="width: 100%; margin-top: 18px"
            >
              <el-button type="primary" native-type="submit"
                >Register</el-button
              >
              <p
                align="center"
                style="
                  color: var(--el-text-color-secondary);
                  font-size: var(--el-font-size-extra-small);
                "
              >
                or
              </p>
              <router-link to="/login-guest">
                <el-button style="width: 100%">Try as a guest</el-button>
              </router-link>
            </el-space>
          </el-form>
        </el-space>
      </el-card>

      <p align="center" style="margin-top: 32px">
        Already have an account?
        <router-link to="/login"> Login here. </router-link>
      </p>
    </el-col>
  </el-row>
</template>
