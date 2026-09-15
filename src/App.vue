<template>
  <div class="app-shell" :style="themeStyle">
    <el-config-provider :locale="zhCn">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import { computed } from 'vue'
import useUserStore from '@/stores/user'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {
  getUserTypeThemeStyle,
  preferredUserType
} from '@/utils/userTypePreference'

const userStore = useUserStore()
const activeUserType = computed(() => userStore.userInfo?.userType || preferredUserType.value)
const themeStyle = computed(() => getUserTypeThemeStyle(activeUserType.value))
</script>

<style scoped>
.app-shell {
  min-height: 100%;
}
</style>
