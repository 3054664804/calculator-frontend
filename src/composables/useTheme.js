/**
 * 深色 / 浅色主题切换。
 *
 * 说明：这里用 localStorage 只存"主题偏好"这种纯 UI 设置，
 * 与计算历史无关 —— 计算历史必须存在后端数据库里（作业硬性要求）。
 */
import { onMounted, ref, watch } from 'vue'

const STORAGE_KEY = 'calculator-theme'
const THEMES = ['light', 'dark']

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(saved)) return saved
  } catch {
    /* 隐私模式下 localStorage 可能不可用，忽略即可 */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const theme = ref('light')

  function applyTheme(value) {
    document.documentElement.dataset.theme = value
  }

  onMounted(() => {
    theme.value = readInitialTheme()
    applyTheme(theme.value)
  })

  watch(theme, (value) => {
    applyTheme(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* 忽略写入失败 */
    }
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
