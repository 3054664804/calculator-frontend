<script setup>
/**
 * 根组件：只负责"布局 + 事件串联"。
 *
 * 数据流（单向）：
 *   CalculatorPanel --计算成功--> App --触发--> HistoryPanel.load() --> GET /api/history
 *   HistoryPanel --点击回填--> App --> CalculatorPanel.reuseExpression()
 *
 * 注意：App 里没有任何计算结果的动作，它只搬运字符串与事件。
 */
import { ref } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import AppToast from '@/components/AppToast.vue'
import CalculatorPanel from '@/components/CalculatorPanel.vue'
import HistoryPanel from '@/components/HistoryPanel.vue'
import { useBackendStatus } from '@/composables/useBackendStatus'
import { useTheme } from '@/composables/useTheme'
import { useToast } from '@/composables/useToast'
import { REPO_LINKS } from '@/constants/links'

const { theme, toggleTheme } = useTheme()
const { status: backendStatus, info: backendInfo, check: recheckBackend } = useBackendStatus()
const { toasts, push, dismiss } = useToast()

const calculatorRef = ref(null)
const historyRef = ref(null)

/** 后端算完一条，让历史面板重新向后端要一次列表 */
function handleCalculated() {
  historyRef.value?.load()
  recheckBackend()
}

/** 历史记录的"回填"：把表达式字符串塞回计算区 */
function handleReuse(expression) {
  calculatorRef.value?.reuseExpression(expression)
  push({ type: 'info', text: '已把表达式回填到计算区' })
}
</script>

<template>
  <div class="app-shell">
    <AppHeader
      :theme="theme"
      :backend-status="backendStatus"
      :backend-version="backendInfo?.version || ''"
      @toggle-theme="toggleTheme"
      @recheck="recheckBackend"
    />

    <main class="layout">
      <CalculatorPanel ref="calculatorRef" @calculated="handleCalculated" @notify="push" />
      <HistoryPanel ref="historyRef" @notify="push" @reuse="handleReuse" />
    </main>

    <footer class="app-footer">
      <div class="app-footer__line">
        <strong>前后端分离计算器</strong>
        <span>·</span>
        <span>计算逻辑 100% 在后端（asteval 安全求值，无 eval/exec）</span>
        <span>·</span>
        <span>历史记录持久化在 SQLite</span>
      </div>
      <div class="app-footer__line app-footer__line--links">
        <a :href="REPO_LINKS.backend" target="_blank" rel="noreferrer">后端仓库</a>
        <a :href="REPO_LINKS.frontend" target="_blank" rel="noreferrer">前端仓库</a>
        <a :href="REPO_LINKS.backendCodeStyle" target="_blank" rel="noreferrer">后端代码规范</a>
        <a :href="REPO_LINKS.frontendCodeStyle" target="_blank" rel="noreferrer">前端代码规范</a>
        <a :href="`${REPO_LINKS.backend.replace(/\/$/, '')}#readme`" target="_blank" rel="noreferrer">
          部署说明
        </a>
      </div>
    </footer>

    <AppToast :toasts="toasts" @dismiss="dismiss" />
  </div>
</template>
