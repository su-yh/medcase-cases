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
          <el-alert
            v-if="reviewFailed && userStore.userInfo?.reviewReason"
            class="review-reason"
            title="审核拒绝原因"
            :description="userStore.userInfo.reviewReason"
            type="error"
            :closable="false"
            show-icon
          />
        </header>

        <el-form label-position="top" @submit.prevent="handleSubmit">
          <el-form-item label="姓名" required>
            <el-input v-model="form.nickName" maxlength="30" show-word-limit placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="性别" required>
            <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%">
              <el-option label="男" value="0" />
              <el-option label="女" value="1" />
              <el-option label="未知" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" required>
            <el-input v-model="form.phone" maxlength="20" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="身份证号码" required>
            <el-input v-model="form.idCardNumber" maxlength="30" placeholder="请输入身份证号码" />
          </el-form-item>
          <el-form-item label="职称" required>
            <el-input v-model="form.title" maxlength="50" placeholder="请输入职称" />
          </el-form-item>
          <el-form-item label="身份证正面图片">
            <div class="profile-attachment">
              <span>{{ attachmentName(form.idCardFront) }}</span>
              <el-upload
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('idCardFront', file)"
              >
                <el-button :loading="fieldUploading === 'idCardFront'">上传</el-button>
              </el-upload>
              <el-button
                v-if="form.idCardFront?.filePath"
                text
                type="primary"
                @click="openPreview(form.idCardFront)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="身份证反面图片">
            <div class="profile-attachment">
              <span>{{ attachmentName(form.idCardBack) }}</span>
              <el-upload
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('idCardBack', file)"
              >
                <el-button :loading="fieldUploading === 'idCardBack'">上传</el-button>
              </el-upload>
              <el-button
                v-if="form.idCardBack?.filePath"
                text
                type="primary"
                @click="openPreview(form.idCardBack)"
              >
                预览
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="医师职业资格证图片">
            <div class="profile-attachment">
              <span>{{ attachmentName(form.qualificationCertificate) }}</span>
              <el-upload
                :limit="1"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="file => handleAttachmentChange('qualificationCertificate', file)"
              >
                <el-button :loading="fieldUploading === 'qualificationCertificate'">上传</el-button>
              </el-upload>
              <el-button
                v-if="form.qualificationCertificate?.filePath"
                text
                type="primary"
                @click="openPreview(form.qualificationCertificate)"
              >
                预览
              </el-button>
            </div>
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

    <AttachmentPreviewDialog
      v-model="previewOpen"
      :attachment="previewAttachment"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import AttachmentPreviewDialog from '@/components/attachments/AttachmentPreviewDialog.vue'
import { uploadProfileAttachment } from '@/api/doctor/profile'

const router = useRouter()
const userStore = useUserStore()
const loadingProfile = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const previewOpen = ref(false)
const previewAttachment = ref(null)
const fieldUploading = ref('')
const form = reactive({
  nickName: '',
  sex: '',
  phone: '',
  idCardNumber: '',
  title: '',
  idCardFront: null,
  idCardBack: null,
  qualificationCertificate: null
})

const profileStatus = computed(() => userStore.userInfo?.status)
const pendingReview = computed(() => profileStatus.value === '3')
const reviewFailed = computed(() => profileStatus.value === '4')
const canDeleteAccount = computed(() => ['3', '4', '5'].includes(profileStatus.value))

async function loadProfile() {
  loadingProfile.value = true
  try {
    const profile = await userStore.loadProfile()
    form.nickName = profile?.nickName || ''
    form.sex = profile?.sex || ''
    form.phone = profile?.phone || ''
    form.idCardNumber = profile?.idCardNumber || ''
    form.title = profile?.title || ''
    form.idCardFront = profile?.idCardFront || null
    form.idCardBack = profile?.idCardBack || null
    form.qualificationCertificate = profile?.qualificationCertificate || null
  } finally {
    loadingProfile.value = false
  }
}

async function handleSubmit() {
  if (fieldUploading.value) {
    ElMessage.warning('请等待证件图片上传完成')
    return
  }
  if (!form.idCardFront || !form.idCardBack || !form.qualificationCertificate) {
    ElMessage.warning('请先上传身份证和资格证图片')
    return
  }
  if (!form.sex) {
    ElMessage.warning('请选择性别')
    return
  }
  submitting.value = true
  try {
    await userStore.submitProfile({
      nickName: form.nickName,
      sex: form.sex,
      phone: form.phone,
      idCardNumber: form.idCardNumber,
      title: form.title,
      idCardFront: form.idCardFront,
      idCardBack: form.idCardBack,
      qualificationCertificate: form.qualificationCertificate
    })
    ElMessage.success('资料已提交，等待管理员审核')
  } finally {
    submitting.value = false
  }
}

function attachmentName(attachment) {
  return attachment?.originalFilename || attachment?.filePath || '未上传'
}

async function handleAttachmentChange(field, uploadFile) {
  const file = uploadFile?.raw
  if (!file) {
    return
  }

  const previousAttachment = form[field]
  fieldUploading.value = field
  try {
    form[field] = await uploadProfileAttachment(file)
  } catch (error) {
    form[field] = previousAttachment
    ElMessage.error(error.message || '附件上传失败')
  } finally {
    fieldUploading.value = ''
  }
}

function openPreview(attachment) {
  previewAttachment.value = attachment
  previewOpen.value = true
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
  form.nickName = userStore.userInfo.nickName || ''
  form.sex = userStore.userInfo.sex || ''
  form.phone = userStore.userInfo.phone || ''
  form.idCardNumber = userStore.userInfo.idCardNumber || ''
  form.title = userStore.userInfo.title || ''
  form.idCardFront = userStore.userInfo.idCardFront || null
  form.idCardBack = userStore.userInfo.idCardBack || null
  form.qualificationCertificate = userStore.userInfo.qualificationCertificate || null
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

.review-reason {
  margin-top: 16px;
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

.profile-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
}

.profile-attachment span {
  overflow: hidden;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
