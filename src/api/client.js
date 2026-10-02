/**
 * axios 实例与统一错误处理。
 *
 * 前端与后端的唯一通道：所有计算都通过这里发给后端，
 * 前端不会、也不允许自己算出任何结果。
 *
 * 后端地址来自环境变量 VITE_API_BASE_URL：
 *   - 开发环境留空 → 走 vite.config.js 里的 /api 代理；
 *   - 生产环境填 Render 后端地址，例如 https://calculator-backend-xxxx.onrender.com
 */
import axios from 'axios'

/** 去掉结尾多余斜杠，避免拼出 //api/calculate */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 把 axios 的错误统一成 { code, message, status }。
 * 后端所有失败响应都是 {"success": false, "error": {code, message}}，这里直接取用。
 */
export function normalizeError(error) {
  if (error?.response) {
    const { status, data } = error.response
    const detail = data?.error || {}
    return {
      code: detail.code || `HTTP_${status}`,
      message: detail.message || `请求失败（HTTP ${status}）`,
      status,
    }
  }

  if (error?.code === 'ECONNABORTED') {
    return { code: 'TIMEOUT', message: '请求超时：后端服务响应过慢，请稍后重试', status: 0 }
  }

  return {
    code: 'NETWORK_ERROR',
    message: '无法连接后端服务：计算功能不可用（历史记录仍可查看）',
    status: 0,
  }
}

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
)

export default http
