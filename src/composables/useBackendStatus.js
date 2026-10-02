/**
 * 后端连接状态探测。
 *
 * 这是"前后端分离"最直观的证据：
 *   - 后端在线 → 能算，状态灯是绿色；
 *   - 后端下线 → 状态灯变红，点击"="只会得到"无法连接后端服务"的提示，
 *     前端绝不会自己算出答案。
 */
import { onMounted, onUnmounted, ref } from 'vue'

import { fetchHealth } from '@/api/calculator'

const HEARTBEAT_INTERVAL_MS = 30000

export function useBackendStatus() {
  /** checking | online | offline */
  const status = ref('checking')
  const info = ref(null)

  async function check() {
    try {
      const payload = await fetchHealth()
      info.value = payload.data
      status.value = 'online'
    } catch {
      info.value = null
      status.value = 'offline'
    }
  }

  let heartbeat = null

  onMounted(() => {
    check()
    heartbeat = setInterval(check, HEARTBEAT_INTERVAL_MS)
  })

  onUnmounted(() => {
    if (heartbeat) clearInterval(heartbeat)
  })

  return { status, info, check }
}
