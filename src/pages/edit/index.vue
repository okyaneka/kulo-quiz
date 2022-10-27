<route lang="yaml">
meta:
  layout: private
  requireAuth: true
  name: Edit Profile
</route>

<script setup lang="ts">
  import {
    checkUsername,
    getAuthUser,
    updateProfile,
    useAuthStore,
  } from '~/apps/auth/auth.repository'
  import { useEditProfileScheme } from '~/apps/auth/auth.shceme'
  import { Gender, type EditProfilePayload } from '~/apps/auth/auth.types'

  const router = useRouter()
  const { user: user } = storeToRefs(useAuthStore())

  const isUsername = ref(true)

  const { errors, values, setValues, setFieldError, validate } =
    useForm<EditProfilePayload>({
      validationSchema: toFormValidator(
        z.object(useEditProfileScheme()._def.shape())
      ),
    })
  const { value: username } = useField<string>('username')
  useField('displayName')
  useField('photoURL')
  useField('bio')
  useField('gender')

  const { refetch: handleCheckUsername, isLoading } = useQuery({
    queryKey: ['username', username],
    queryFn: () => checkUsername(username.value),
    onSuccess: (value) => {
      if (!value) {
        isUsername.value = false
        setFieldError('username', 'Username is unavailable')
      } else isUsername.value = true
    },
    enabled: false,
  })

  const { mutateAsync: handleUpdateProfile, isLoading: loading } = useMutation({
    mutationFn: async (payload: EditProfilePayload) => {
      await updateProfile(useEditProfileScheme().parse(payload))
      await getAuthUser()
    },
  })

  const inputTimeout = ref()
  function handleInputUsername() {
    clearTimeout(inputTimeout.value)
    inputTimeout.value = undefined
    inputTimeout.value = setTimeout(() => {
      handleCheckUsername.value()
    }, 3e2)
  }

  async function handleSubmit() {
    if (isUsername.value && (await validate()).valid) {
      await handleUpdateProfile(values)
      ElMessage.success('Profile updated successfully 😄')
      router.push({
        name: 'username',
        params: { username: user.value?.username },
      })
    }
  }

  onMounted(() => {
    setValues(useEditProfileScheme().parse(user.value))
  })
</script>

<template>
  <el-card>
    <el-row>
      <el-col>
        <el-space fill style="width: 100%">
          <h3 align="center">Edit Profile</h3>
        </el-space>
      </el-col>

      <el-col>
        <el-form
          label-position="top"
          :disabled="loading"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="Username" :error="errors.username">
            <el-input v-model="values.username" @input="handleInputUsername()">
              <template #prepend>@</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Photo Profile">
            <el-col>
              <select-image
                v-model="values.photoURL"
                collection="public/avatar/"
                style="width: 100%"
              ></select-image>
            </el-col>
          </el-form-item>

          <el-form-item label="Display Name" :error="errors.displayName">
            <el-input v-model="values.displayName"></el-input>
          </el-form-item>

          <!-- <el-form-item label="Phone Number" :error="errors.phoneNumber">
            <el-input v-model="values.phoneNumber"></el-input>
          </el-form-item> -->

          <el-form-item label="Gender" :error="errors.gender">
            <el-select v-model="values.gender" style="width: 100%">
              <template v-for="gender in Gender" :key="gender">
                <el-option
                  v-if="typeof gender == 'number'"
                  :value="gender"
                  :label="Gender[gender]"
                >
                </el-option>
              </template>
            </el-select>
          </el-form-item>

          <el-form-item label="Bio" :error="errors.bio">
            <el-input
              v-model="values.bio"
              type="textarea"
              show-word-limit
            ></el-input>
          </el-form-item>

          <el-space style="margin-top: 8px">
            <el-button v-if="loading" disabled>Back</el-button>
            <router-link
              v-else
              :to="{ name: 'username', params: { username: user?.username } }"
            >
              <el-button>Back</el-button>
            </router-link>
            <el-button
              :disabled="isLoading"
              :loading="loading"
              type="primary"
              native-type="submit"
              >Save</el-button
            >
          </el-space>
        </el-form>
      </el-col>
    </el-row>
  </el-card>
</template>
