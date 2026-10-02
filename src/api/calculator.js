/**
 * 后端 API 封装：与 FastAPI 的 5 个接口一一对应。
 *
 * POST   /api/calculate        计算表达式并写库
 * GET    /api/history          查询历史
 * DELETE /api/history/{id}     删除单条历史
 * DELETE /api/history          清空历史（扩展功能）
 * GET    /api/health           健康检查（扩展功能）
 */
import http from './client'

/** 计算表达式：表达式送到后端，结果由后端算好返回 */
export function calculate(expression) {
  return http.post('/api/calculate', { expression }).then((response) => response.data)
}

/** 查询历史记录，可按关键字搜索、分页 */
export function fetchHistory({ keyword, limit, offset } = {}) {
  return http
    .get('/api/history', { params: { keyword, limit, offset } })
    .then((response) => response.data)
}

/** 删除指定 id 的单条历史 */
export function removeHistoryRecord(recordId) {
  return http.delete(`/api/history/${recordId}`).then((response) => response.data)
}

/** 清空全部历史（扩展功能，前端会先二次确认） */
export function clearAllHistory() {
  return http.delete('/api/history').then((response) => response.data)
}

/** 后端健康检查：用于界面上显示后端连接状态 */
export function fetchHealth() {
  return http.get('/api/health').then((response) => response.data)
}
