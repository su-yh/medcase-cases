<template>
  <div class="submit-page">
    <div class="submit-heading">
      <div>
        <h1>提交病例</h1>
        <p>填写病例备注并添加附件后提交，后续在病例中心查看审核进度。</p>
      </div>
    </div>

    <el-card shadow="never" class="submit-card">
      <CaseForm
        :submitting="loading"
        :saving="saving"
        @cancel="router.push('/cases')"
        @save-draft="handleSaveDraft"
        @submit="handleSubmit"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { saveDraftCase, submitCase } from '@/api/doctor/cases'
import CaseForm from '@/components/cases/CaseForm.vue'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)

async function handleSaveDraft(payload) {
  saving.value = true
  try {
    await saveDraftCase(payload)
    ElMessage.success('病例草稿保存成功')
    await router.replace('/cases')
  } finally {
    saving.value = false
  }
}

async function handleSubmit(payload) {
  loading.value = true
  try {
    await submitCase(payload)
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

</style>
