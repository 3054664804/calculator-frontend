/**
 * 展示层格式化工具。
 *
 * 注意：这里**只做文本展示格式化**，不做任何数学计算。
 * 也不做"3 分钟前"这类相对时间，因为那需要在前端做时间减法 —— 违反
 * "前端不做计算"的约束，所以时间统一由后端给出 ISO 字符串后直接本地化显示。
 */

/** ISO 时间字符串 → 本地可读时间，例如 2026/10/7 15:04:05 */
export function formatDateTime(isoText) {
  if (!isoText) return '-'
  const date = new Date(isoText)
  if (Number.isNaN(date.getTime())) return isoText
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/** 表达式过长时中间省略，保证历史列表整齐 */
export function truncateExpression(text, maxLength = 28) {
  const value = String(text ?? '')
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}…`
}

/** 结果过长时同样省略（大整数结果往往几十位） */
export function truncateResult(text, maxLength = 22) {
  return truncateExpression(text, maxLength)
}
