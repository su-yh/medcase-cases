<template>
  <main class="profile-page">
    <el-card v-loading="loadingProfile" class="profile-card" shadow="never">
      <template v-if="pendingReview">
        <div class="profile-state">
          <h1>资料已提交</h1>
          <p>资料正在等待管理员审核，通过后即可进入病例工作台。</p>
          <div class="profile-actions">
            <el-button @click="handleLogout">退出登录</el-button>
            <el-button
              v-if="canDeleteAccount"
              type="danger"
              plain
              :loading="deleting"
              @click="handleDeleteAccount"
            >
              删除账号
            </el-button>
          </div>
        </div>
      </template>

      <template v-else>
        <header class="profile-heading">
          <span v-if="reviewFailed" class="profile-state-label">审核未通过</span>
          <h1>{{ reviewFailed ? '重新提交资料' : '完善医生资料' }}</h1>
          <p>{{ reviewFailed ? '请更新资料后重新提交审核。' : '请填写基本资料后提交管理员审核。' }}</p>
        </header>

        <el-form label-position="top" @submit.prevent="handleSubmit">
          <el-form-item label="姓名" required>
            <el-input v-model="form.name" maxlength="30" show-word-limit placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号" required>
            <el-input v-model="form.phone" maxlength="20" placeholder="请输入手机号" />
          </el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="submitting"
            style="width: 100%"
          >
            提交审核
          </el-button>
        </el-form>

        <div class="profile-footer">
          <el-button text @click="handleLogout">退出登录</el-button>
          <el-button
            v-if="canDeleteAccount"
            text
            type="danger"
            :loading="deleting"
            @click="handleDeleteAccount"
          >
            删除账号
          </el-button>
        </div>
      </template>
    </el-card>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loadingProfile = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const form = reactive({
  name: '',
  phone: ''
})

const profileStatus = computed(() => userStore.userInfo?.status)
const pendingReview = computed(() => profileStatus.value === '3')
const reviewFailed = computed(() => profileStatus.value === '4')
const canDeleteAccount = computed(() => ['3', '4', '5'].includes(profileStatus.value))

async function loadProfile() {
  loadingProfile.value = true
  try {
    const profile = await userStore.loadProfile()
    form.name = profile?.name || ''
    form.phone = profile?.phone || ''
  } finally {
    loadingProfile.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    await userStore.submitProfile({
      name: form.name,
      phone: form.phone
    })
    ElMessage.success('资料已提交，等待管理员审核')
  } finally {
    submitting.value = false
  }
}

async function handleLogout() {
  await userStore.logout()
  await router.replace('/login')
}

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm(
      '删除账号后将无法恢复，确定要删除当前账号吗？',
      '删除账号',
      {
        confirmButtonText: '删除账号',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  deleting.value = true
  try {
    await userStore.deleteAccount()
    ElMessage.success('账号已删除')
    await router.replace('/login')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  if (!userStore.userInfo) {
    await loadProfile()
    return
  }
  form.name = userStore.userInfo.name || ''
  form.phone = userStore.userInfo.phone || ''
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--el-bg-color-page);
}

.profile-card {
  width: min(100%, 520px);
  border-radius: 8px;
}

.profile-heading {
  margin-bottom: 28px;

  h1 {
    margin: 6px 0 8px;
    color: var(--el-text-color-primary);
    font-size: 24px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

.profile-state-label {
  color: var(--el-color-danger);
  font-size: 13px;
}

.profile-state {
  padding: 20px 4px;
  text-align: center;

  h1 {
    margin: 0 0 12px;
    font-size: 24px;
  }

  p {
    margin: 0 0 28px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.profile-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
