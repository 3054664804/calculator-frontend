/**
 * 历史记录状态：数据全部来自后端数据库。
 *
 * 前端的职责只有"请求 + 展示 + 转发删除指令"，
 * 刷新页面后会重新 GET /api/history，所以历史不会丢。
 */
import { computed, ref, watch } from 'vue'

import {
  clearAllHistory,
  fetchHistory,
  removeHistoryRecord,
} from '@/api/calculator'

const SEARCH_DEBOUNCE_MS = 300

export function useHistory({ onError, onMessage } = {}) {
  const records = ref([])
  const total = ref(0)
  const keyword = ref('')
  const isLoading = ref(false)
  const isClearing = ref(false)
  const deletingId = ref(null)

  const isEmpty = computed(() => !isLoading.value && records.value.length === 0)
  const hasRecords = computed(() => total.value > 0)

  /** 拉取历史（支持关键字搜索，服务端过滤） */
  async function load() {
    isLoading.value = true
    try {
      const payload = await fetchHistory({
        keyword: keyword.value.trim() || undefined,
      })
      records.value = payload.data
      total.value = payload.total
    } catch (error) {
      records.value = []
      total.value = 0
      onError?.(error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除单条。
   *
   * 删除成功后**重新向后端拉一次列表**，而不是在前端自己减总数 ——
   * 前端不做任何计数运算，展示的数据永远以服务端返回为准。
   */
  async function remove(recordId) {
    deletingId.value = recordId
    try {
      const payload = await removeHistoryRecord(recordId)
      onMessage?.({ type: 'success', text: `已删除：${payload.data.expression}` })
      await load()
    } catch (error) {
      onError?.(error)
    } finally {
      deletingId.value = null
    }
  }

  /** 清空全部（扩展功能） */
  async function clearAll() {
    isClearing.value = true
    try {
      const payload = await clearAllHistory()
      records.value = []
      total.value = 0
      onMessage?.({ type: 'success', text: `已清空 ${payload.data.deleted_count} 条历史记录` })
    } catch (error) {
      onError?.(error)
    } finally {
      isClearing.value = false
    }
  }

  // 搜索框输入防抖，避免每敲一个字符都打一次接口
  let searchTimer = null
  watch(keyword, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(load, SEARCH_DEBOUNCE_MS)
  })

  return {
    records,
    total,
    keyword,
    isLoading,
    isClearing,
    deletingId,
    isEmpty,
    hasRecords,
    load,
    remove,
    clearAll,
  }
}
