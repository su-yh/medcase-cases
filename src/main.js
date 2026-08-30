import { createApp } from 'vue'
import {
  ElButton,
  ElCard,
  ElDialog,
  ElDatePicker,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElLoading,
  ElPagination,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  ElUpload
} from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component(ElButton.name, ElButton)
app.component(ElCard.name, ElCard)
app.component(ElDialog.name, ElDialog)
app.component(ElDatePicker.name, ElDatePicker)
app.component(ElEmpty.name, ElEmpty)
app.component(ElForm.name, ElForm)
app.component(ElFormItem.name, ElFormItem)
app.component(ElInput.name, ElInput)
app.component(ElPagination.name, ElPagination)
app.component(ElOption.name, ElOption)
app.component(ElSelect.name, ElSelect)
app.component(ElTable.name, ElTable)
app.component(ElTableColumn.name, ElTableColumn)
app.component(ElTag.name, ElTag)
app.component(ElUpload.name, ElUpload)
app.directive('loading', ElLoading)

app.mount('#app')
