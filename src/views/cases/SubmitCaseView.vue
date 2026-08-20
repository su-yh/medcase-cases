<template>
  <div class="submit-page">
    <div class="submit-heading">
      <div>
        <h1>提交病例</h1>
        <p>填写病例文本后提交，后续在病例中心查看审核进度。</p>
      </div>
    </div>

    <el-card shadow="never" class="submit-card">
      <el-form label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="病例文本">
          <el-input
            v-model="form.caseContent"
            type="textarea"
            :rows="14"
            maxlength="10000"
            show-word-limit
            placeholder="请输入需要提交审核的病例内容"
          />
        </el-form-item>
        <div class="submit-footer">
          <el-button @click="router.push('/cases')">取消</el-button>
          <el-button type="primary" native-type="submit" :loading="loading">提交病例</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { submitCase } from '@/api/doctor/cases'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  caseContent: ''
})

async function handleSubmit() {
  if (!form.caseContent.trim()) {
    ElMessage.warning('请输入病例内容')
    return
  }

  loading.value = true
  try {
    await submitCase({
      caseContent: form.caseContent
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

.submit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
