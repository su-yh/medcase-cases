import { createApp } from 'vue'
import { ElButton, ElCard, ElEmpty, ElForm, ElFormItem, ElInput } from 'element-plus'
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
app.component(ElEmpty.name, ElEmpty)
app.component(ElForm.name, ElForm)
app.component(ElFormItem.name, ElFormItem)
app.component(ElInput.name, ElInput)

app.mount('#app')
