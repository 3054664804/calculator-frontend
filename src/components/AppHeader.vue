<script setup>
/**
 * 顶部栏：品牌信息、后端连接状态灯、主题切换、仓库链接。
 *
 * 状态灯直接反映 /api/health 的结果，是"后端挂了前端就算不出来"的现场证明。
 */
import { computed } from 'vue'

import { REPO_LINKS } from '@/constants/links'

const props = defineProps({
  theme: { type: String, default: 'light' },
  backendStatus: { type: String, default: 'checking' },
  backendVersion: { type: String, default: '' },
})

defineEmits(['toggle-theme', 'recheck'])

const STATUS_TEXT = {
  checking: '检测后端…',
  online: '后端在线',
  offline: '后端离线',
}

const statusText = computed(() => STATUS_TEXT[props.backendStatus] || STATUS_TEXT.checking)
const isDark = computed(() => props.theme === 'dark')
</script>

<template>
  <header class="app-header">
    <div class="app-header__brand">
      <span class="app-header__logo" aria-hidden="true">🧮</span>
      <div>
        <h1 class="app-header__title">计算器 · 前后端分离演示</h1>
        <p class="app-header__subtitle">
          Vue3 + Vite 前端 &nbsp;·&nbsp; FastAPI + SQLite 后端 &nbsp;·&nbsp; 计算全部在后端完成
        </p>
      </div>
    </div>

    <div class="app-header__actions">
      <button
        type="button"
        class="status-pill"
        :class="`status-pill--${backendStatus}`"
        :title="'点击重新检测后端健康状态（GET /api/health）'"
        @click="$emit('recheck')"
      >
        <span class="status-pill__dot"></span>
        <span>{{ statusText }}</span>
        <span v-if="backendVersion" class="status-pill__version">v{{ backendVersion }}</span>
      </button>

      <a class="link-btn" :href="REPO_LINKS.backend" target="_blank" rel="noreferrer">后端仓库</a>
      <a class="link-btn" :href="REPO_LINKS.frontend" target="_blank" rel="noreferrer">前端仓库</a>

      <button
        type="button"
        class="theme-toggle"
        :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
        @click="$emit('toggle-theme')"
      >
        {{ isDark ? '☀️ 浅色' : '🌙 深色' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--panel);
  box-shadow: var(--shadow-card);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.app-header__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex: none;
  border-radius: 14px;
  background: linear-gradient(150deg, var(--accent-soft), var(--panel-muted));
  border: 1px solid var(--border);
  font-size: 23px;
}

.app-header__title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text);
}

.app-header__subtitle {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.app-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--panel-muted);
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.16s ease;
}

.status-pill:hover {
  border-color: var(--border-strong);
}

.status-pill__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-pill--online {
  color: var(--success);
}

.status-pill--online .status-pill__dot {
  background: var(--success);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.16);
}

.status-pill--offline {
  color: var(--danger);
}

.status-pill--offline .status-pill__dot {
  background: var(--danger);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.16);
}

.status-pill--checking .status-pill__dot {
  background: var(--warning);
}

.status-pill__version {
  font-family: var(--font-mono);
  opacity: 0.75;
}

.link-btn {
  padding: 7px 11px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--panel-muted);
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.link-btn:hover {
  color: var(--accent-strong);
  border-color: var(--accent);
}

.theme-toggle {
  padding: 7px 12px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--panel-muted);
  color: var(--text);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.theme-toggle:hover {
  border-color: var(--border-strong);
}
</style>
