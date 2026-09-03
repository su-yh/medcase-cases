<template>
  <div class="case-layout">
    <aside class="case-sidebar">
      <div class="case-brand">
        <span class="case-brand-mark">M</span>
        <span>MedCase {{ userType }}端</span>
      </div>

      <nav class="case-nav" :aria-label="`${userType}端导航`">
        <router-link to="/cases">病例中心</router-link>
        <router-link to="/cases/submit">提交病例</router-link>
      </nav>
    </aside>

    <main class="case-main">
      <header class="case-topbar">
        <div>
          <strong>病例工作台</strong>
          <span>审核由管理端完成，{{ userType }}端只查看结果</span>
        </div>
        <el-dropdown trigger="hover" @command="handleAccountCommand">
          <button type="button" class="case-account-trigger">
            <span class="case-avatar">{{ userType.charAt(0) }}</span>
            <span>
              <strong>{{ userType }}账号</strong>
              <small>前端 v{{ appVersion }} / 后端 v{{ backendVersion }}</small>
            </span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <section class="case-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/stores/user'
import { APP_VERSION } from '@/utils/version'
import { getSystemVersion } from '@/api/system/version'
import { userTypeLabel } from '@/utils/userType'

const router = useRouter()
const userStore = useUserStore()
const userType = computed(() => userTypeLabel(userStore.userInfo?.userType))
const appVersion = APP_VERSION
const backendVersion = ref('unknown')

async function loadBackendVersion() {
  try {
    const result = await getSystemVersion()
    backendVersion.value = result?.version || 'unknown'
  } catch (error) {
    backendVersion.value = 'unknown'
  }
}

onMounted(loadBackendVersion)

async function handleAccountCommand(command) {
  if (command === 'profile') {
    await router.push('/account/profile')
    return
  }
  if (command === 'logout') {
    await handleLogout()
  }
}

async function handleLogout() {
  await userStore.logout()
  await router.replace('/login')
}
</script>

<style scoped>
.case-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 228px minmax(0, 1fr);
  background: var(--el-bg-color-page);
}

.case-sidebar {
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color);
}

.case-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 10px 30px;
  font-weight: 500;
}

.case-brand-mark,
.case-avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--el-color-primary);
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
}

.case-nav {
  display: grid;
  gap: 6px;
}

.case-nav a {
  width: 100%;
  padding: 11px 12px;
  color: var(--el-text-color-secondary);
  border: 0;
  border-radius: 9px;
  background: transparent;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  font: inherit;
}

.case-nav a:hover,
.case-nav a.router-link-active {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.case-account-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  color: inherit;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.case-account-trigger strong,
.case-account-trigger small {
  display: block;
}

.case-account-trigger small {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.case-main {
  min-width: 0;
}

.case-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 28px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.case-topbar > div > span {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin-top: 4px;
}

.case-content {
  padding: 30px;
}

@media (max-width: 760px) {
  .case-layout {
    grid-template-columns: 1fr;
  }

  .case-sidebar {
    padding: 16px;
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color);
  }

  .case-nav {
    display: flex;
    overflow-x: auto;
  }

  .case-nav a {
    min-width: max-content;
  }

  .case-topbar {
    align-items: flex-start;
    padding: 16px;
  }

  .case-account-trigger > span:last-child {
    display: none;
  }

  .case-content {
    padding: 22px 16px;
  }
}
</style>
