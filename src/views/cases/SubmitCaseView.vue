<template>
  <div class="submit-page">
    <div class="submit-heading">
      <div>
        <h1>{{ isEditMode ? '编辑草稿' : '提交病例' }}</h1>
        <p>
          {{ isEditMode
            ? '完善草稿内容并提交，提交后将进入管理端审核。'
            : '填写病例备注并添加附件后提交，后续在病例中心查看审核进度。' }}
        </p>
      </div>
    </div>

    <el-card v-loading="detailLoading" shadow="never" class="submit-card">
      <el-form label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="标题" required>
          <el-input
            v-model="form.title"
            maxlength="100"
            show-word-limit
            placeholder="请输入病例标题"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
        <el-form-item label="附件">
          <input
            ref="attachmentInput"
            class="attachment-input"
            type="file"
            multiple
            accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.pdf,.jpg,.jpeg,.png"
            @change="handleAttachmentChange"
          />
          <el-button type="primary" native-type="button" :loading="uploading" @click="openAttachmentPicker">
            选择附件
          </el-button>
          <div class="attachment-tip">最多上传 5 个附件，单个文件不超过 5 MB</div>
          <ul v-if="attachmentFiles.length" class="attachment-list">
            <li v-for="(file, index) in attachmentFiles" :key="file.uid">
              <span>{{ file.name }}</span>
              <el-button link type="danger" native-type="button" @click="removeAttachment(index)">
                删除
              </el-button>
            </li>
          </ul>
        </el-form-item>
        <div class="submit-footer">
          <el-button @click="router.push('/cases')">取消</el-button>
          <el-button
            v-if="!isEditMode"
            native-type="button"
            :loading="saving"
            :disabled="isBusy || hasUploadingAttachments"
            @click="handleSaveDraft"
          >
            保存草稿
          </el-button>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="isBusy || hasUploadingAttachments || uploadedAttachments.length !== attachmentFiles.length"
          >
            提交病例
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  getCaseDetail,
  saveDraftCase,
  submitCase,
  uploadCaseAttachments
} from '@/api/doctor/cases'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const detailLoading = ref(false)
const uploading = ref(false)
const attachmentInput = ref(null)
const attachmentFiles = ref([])

const allowedAttachmentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'jpg', 'jpeg', 'png']

const form = reactive({
  title: '',
  remark: ''
})

const editId = computed(() => {
  const id = route.query.id
  return Array.isArray(id) ? id[0] : id
})
const isEditMode = computed(() => Boolean(editId.value))
const uploadedAttachments = computed(() => attachmentFiles.value
  .filter(file => file.attachment && !file.uploading)
  .map(file => file.attachment))
const hasUploadingAttachments = computed(() => attachmentFiles.value.some(file => file.uploading))
const isBusy = computed(() => loading.value || saving.value || uploading.value || detailLoading.value)

function openAttachmentPicker() {
  attachmentInput.value?.click()
}

async function handleAttachmentChange(event) {
  const selectedFiles = Array.from(event.target.files || [])
  const remainingSlots = 5 - attachmentFiles.value.length
  if (selectedFiles.length > remainingSlots) {
    ElMessage.warning('最多上传 5 个附件')
  }

  const validFiles = selectedFiles.slice(0, remainingSlots).filter((file) => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!allowedAttachmentExtensions.includes(extension)) {
      ElMessage.error(`${file.name}：不支持该附件格式`)
      return false
    }
    if (file.size / 1024 / 1024 > 5) {
      ElMessage.error(`${file.name}：单个附件不能超过 5 MB`)
      return false
    }
    return true
  })

  const newFiles = validFiles.map((raw) => ({
    uid: `${raw.name}-${raw.lastModified}-${Math.random()}`,
    name: raw.name,
    raw,
    uploading: true,
    attachment: null
  }))
  attachmentFiles.value = attachmentFiles.value.concat(newFiles)
  event.target.value = ''

  if (!newFiles.length) {
    return
  }

  uploading.value = true
  try {
    const uploaded = await uploadCaseAttachments(newFiles.map(item => item.raw))
    if (uploaded.length !== newFiles.length) {
      throw new Error('附件上传结果异常')
    }
    newFiles.forEach((file, index) => {
      file.uploading = false
      file.attachment = uploaded[index]
    })
    ElMessage.success('附件上传成功')
  } catch (error) {
    attachmentFiles.value = attachmentFiles.value.filter(file => !newFiles.includes(file))
    ElMessage.error(error.message || '附件上传失败')
  } finally {
    uploading.value = false
  }
}

function removeAttachment(index) {
  attachmentFiles.value.splice(index, 1)
}

function validateForm() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入病例标题')
    return false
  }
  if (hasUploadingAttachments.value || uploadedAttachments.value.length !== attachmentFiles.value.length) {
    ElMessage.warning('请等待附件上传完成')
    return false
  }
  return true
}

function buildPayload() {
  const payload = {
    title: form.title,
    remark: form.remark,
    attachments: uploadedAttachments.value
  }
  if (isEditMode.value) {
    payload.id = editId.value
  }
  return payload
}

async function handleSaveDraft() {
  if (isEditMode.value || !validateForm()) {
    return
  }

  saving.value = true
  try {
    await saveDraftCase(buildPayload())
    ElMessage.success('病例草稿保存成功')
    await router.replace('/cases')
  } finally {
    saving.value = false
  }
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    await submitCase(buildPayload())
    ElMessage.success('病例提交成功，请等待管理端审核')
    await router.replace('/cases')
  } finally {
    loading.value = false
  }
}

function setCaseDetail(caseItem) {
  form.title = caseItem.title || ''
  form.remark = caseItem.remark || ''
  attachmentFiles.value = (caseItem.attachments || []).map((attachment, index) => ({
    uid: `existing-${attachment.url || index}`,
    name: attachment.originalFilename || attachment.newFileName || attachment.fileName || `附件${index + 1}`,
    raw: null,
    uploading: false,
    attachment
  }))
}

async function loadDraft() {
  detailLoading.value = true
  try {
    const caseItem = await getCaseDetail(editId.value)
    if (caseItem.status !== 'draft') {
      ElMessage.warning('当前病例不可修改')
      await router.replace('/cases')
      return
    }
    setCaseDetail(caseItem)
  } catch (error) {
    ElMessage.error(error.message || '病例详情加载失败')
    await router.replace('/cases')
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  if (isEditMode.value) {
    loadDraft()
  }
})
</script>

<style scoped>
.submit-heading {
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 500;
}

p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.submit-card {
  max-width: 860px;
  border: 1px solid var(--el-border-color);
}

.attachment-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.attachment-tip {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.attachment-list {
  max-width: 560px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.attachment-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.attachment-list li + li {
  margin-top: 8px;
}

.submit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
