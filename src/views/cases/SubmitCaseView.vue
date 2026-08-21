<template>
  <div class="submit-page">
    <div class="submit-heading">
      <div>
        <h1>提交病例</h1>
        <p>填写病例备注并添加附件后提交，后续在病例中心查看审核进度。</p>
      </div>
    </div>

    <el-card shadow="never" class="submit-card">
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
          <el-button type="primary" native-type="submit" :loading="loading" :disabled="uploading || uploadedAttachments.length !== attachmentFiles.length">
            提交病例
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { submitCase, uploadCaseAttachments } from '@/api/doctor/cases'

const router = useRouter()
const loading = ref(false)
const uploading = ref(false)
const attachmentInput = ref(null)
const attachmentFiles = ref([])
const uploadedAttachments = ref([])

const allowedAttachmentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'jpg', 'jpeg', 'png']

const form = reactive({
  title: '',
  remark: ''
})

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
    uploading: true
  }))
  attachmentFiles.value = attachmentFiles.value.concat(newFiles)
  event.target.value = ''

  if (!newFiles.length) {
    return
  }

  uploading.value = true
  try {
    const uploaded = await uploadCaseAttachments(newFiles.map(item => item.raw))
    uploadedAttachments.value = uploadedAttachments.value.concat(uploaded)
    newFiles.forEach(file => {
      file.uploading = false
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
  const removed = attachmentFiles.value.splice(index, 1)[0]
  if (!removed?.uploading) {
    uploadedAttachments.value.splice(index, 1)
  }
}

async function handleSubmit() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入病例标题')
    return
  }
  if (uploading.value || uploadedAttachments.value.length !== attachmentFiles.value.length) {
    ElMessage.warning('请等待附件上传完成')
    return
  }

  loading.value = true
  try {
    await submitCase({
      title: form.title,
      remark: form.remark,
      attachments: uploadedAttachments.value
    })
    ElMessage.success('病例提交成功，请等待管理端审核')
    await router.replace('/cases')
  } finally {
    loading.value = false
  }
}
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
