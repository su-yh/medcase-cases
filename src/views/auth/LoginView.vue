<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="always">
      <h1>医生端登录</h1>
      <p>欢迎来到 MedCase 医生端</p>
      <el-form label-position="top" @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          登录
        </el-button>
      </el-form>
      <div class="auth-actions">
        <router-link to="/register">注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login(form)
    await router.replace(route.query.redirect || '/home')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
  color: #409eff;
}
</style>
