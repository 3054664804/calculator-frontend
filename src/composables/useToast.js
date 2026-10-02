/**
 * 轻量消息提示（Toast）。
 *
 * 这里用 crypto.randomUUID 生成 key，是为了让前端源码里连"计数器自增"这种
 * 运算都不出现 —— 全项目可以 grep 验证：没有 Math.*、没有 Number()、
 * 没有对表达式做任何算术运算。
 */
import { ref } from 'vue'

const DEFAULT_DURATION_MS = 2800

export function useToast() {
  const toasts = ref([])

  function dismiss(toastId) {
    toasts.value = toasts.value.filter((item) => item.id !== toastId)
  }

  function push({ type = 'info', text, duration = DEFAULT_DURATION_MS }) {
    if (!text) return
    const id = globalThis.crypto?.randomUUID?.() ?? String(new Date().getTime())
    toasts.value = [...toasts.value, { id, type, text }]
    setTimeout(() => dismiss(id), duration)
  }

  return { toasts, push, dismiss }
}
