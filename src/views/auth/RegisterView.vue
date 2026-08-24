<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h1>医生端注册</h1>
      <p>创建 MedCase 医生端账号。</p>
      <el-form label-position="top" @submit.prevent="handleRegister">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" maxlength="20" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="短信验证码">
          <el-input v-model="form.code" maxlength="4" placeholder="请输入短信验证码" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          注册
        </el-button>
      </el-form>
      <div class="auth-actions">
        <router-link to="/login">已有账号，去登录</router-link>
      </div>
    </el-card>

    <el-dialog
      v-model="registerSuccessVisible"
      class="register-success-dialog"
      title="注册成功"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      align-center
    >
      <p class="register-success-message">
        账号注册成功，{{ remainingSeconds }} 秒后自动跳转到登录页面。
      </p>
      <template #footer>
        <el-button type="primary" @click="goToLogin">去登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import { startCountdown } from '@/utils/countdown'
import { isPasswordConfirmed } from '@/utils/register'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const registerSuccessVisible = ref(false)
const remainingSeconds = ref(3)
let stopCountdown
let navigating = false

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  code: ''
})

async function handleRegister() {
  if (!isPasswordConfirmed(form.password, form.confirmPassword)) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    await userStore.register({
      username: form.username,
      password: form.password,
      phone: form.phone,
      code: form.code
    })
    registerSuccessVisible.value = true
    stopCountdown = startCountdown(
      3,
      (seconds) => {
        remainingSeconds.value = seconds
      },
      goToLogin
    )
  } finally {
    loading.value = false
  }
}

async function goToLogin() {
  if (navigating) {
    return
  }

  navigating = true
  stopCountdown?.()
  registerSuccessVisible.value = false
  await router.replace('/login')
}

onBeforeUnmount(() => {
  stopCountdown?.()
})
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  border: 1px solid #9adfd5;
  border-top: 4px solid #12a594;
  box-shadow: 0 16px 32px rgb(18 165 148 / 16%);
}

:deep(.el-button--primary) {
  --el-button-bg-color: #12a594;
  --el-button-border-color: #12a594;
  --el-button-hover-bg-color: #0e8c7e;
  --el-button-hover-border-color: #0e8c7e;
  --el-button-active-bg-color: #0b7369;
  --el-button-active-border-color: #0b7369;
}

h1 {
  margin: 0 0 8px;
}

p {
  margin: 0 0 20px;
  color: #666;
}

.auth-actions {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;

  :deep(a) {
    color: #0e8c7e;
  }
}

.register-success-message {
  margin: 0;
  line-height: 1.6;
  color: #2f6f67;
}

:global(.register-success-dialog .el-dialog) {
  border-top: 4px solid #12a594;
}

:global(.register-success-dialog .el-dialog__title) {
  color: #0b7369;
}
</style>
