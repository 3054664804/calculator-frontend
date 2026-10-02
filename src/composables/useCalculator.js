/**
 * 计算器状态（前端侧）。
 *
 * ★ 作业约束：前端不做任何计算 ★
 *   本文件里所有函数只做两件事：
 *     1) 往 expression 这个**字符串**上追加 / 删除字符；
 *     2) 把字符串 POST 给后端，把后端返回的结果显示出来。
 *   没有 + - * / 运算，没有 Math.*，没有 Number()/parseFloat()，
 *   表达式的结果只能由后端产生 —— 关掉后端，这里就永远算不出新结果。
 */
import { computed, ref } from 'vue'

import { calculate as calculateApi } from '@/api/calculator'

/** 可以直接追加到"末尾右括号之前"的字符（小数点与数字） */
const APPEND_BEFORE_TRAILING_PAREN = /^[0-9.]$/
/** 表达式末尾的那个数字，例如 "3+12.5" 里的 "12.5" */
const TRAILING_NUMBER = /(\d+\.?\d*)$/
/** 已经被 ± 包起来的负数，例如 "(-5)" */
const WRAPPED_NEGATIVE = /\(-(\d+\.?\d*)\)$/

export function useCalculator({ onSuccess, onError } = {}) {
  const expression = ref('')
  const result = ref('')
  const lastAnswer = ref('')
  const elapsedMs = ref(null)
  const errorMessage = ref('')
  const isCalculating = ref(false)

  const hasExpression = computed(() => expression.value.trim().length > 0)
  const canEvaluate = computed(() => hasExpression.value && !isCalculating.value)

  /** 追加一个字符（纯字符串拼接） */
  function appendToken(token) {
    if (typeof token !== 'string' || token === '') return

    // 计算器习惯：当前面是 ")"（± 或括号产生）时，继续点数字要插到括号里面
    if (APPEND_BEFORE_TRAILING_PAREN.test(token) && expression.value.endsWith(')')) {
      const closeIndex = expression.value.length - 1
      expression.value =
        expression.value.slice(0, closeIndex) + token + expression.value.slice(closeIndex)
      return
    }

    expression.value += token
  }

  /** AC：清空当前表达式与结果（不会删除后端历史） */
  function clearAll() {
    expression.value = ''
    result.value = ''
    elapsedMs.value = null
    errorMessage.value = ''
  }

  /** ⌫：删掉最后一个字符 */
  function backspace() {
    expression.value = expression.value.slice(0, -1)
    errorMessage.value = ''
  }

  /** ±：把末尾数字包成 (-数字)，再按一次还原（纯字符串替换，不做取负运算） */
  function toggleSign() {
    const current = expression.value
    if (!current) return

    const wrapped = current.match(WRAPPED_NEGATIVE)
    if (wrapped) {
      expression.value = current.slice(0, current.length - wrapped[0].length) + wrapped[1]
      return
    }

    const trailing = current.match(TRAILING_NUMBER)
    if (!trailing) return

    const numberStart = current.length - trailing[0].length
    expression.value = `${current.slice(0, numberStart)}(-${trailing[0]})`
  }

  /** Ans：把上一次后端返回的结果作为一段文本插入表达式 */
  function insertAnswer() {
    if (!lastAnswer.value) return
    appendToken(lastAnswer.value)
  }

  /** 把表达式提交给后端计算，结果显示到界面 */
  async function evaluate() {
    const submitted = expression.value.trim()
    if (!submitted) {
      errorMessage.value = '请先输入表达式，例如 3*(2+5)-4/2'
      return
    }

    isCalculating.value = true
    errorMessage.value = ''

    try {
      const payload = await calculateApi(submitted)
      const data = payload.data
      result.value = data.result
      lastAnswer.value = data.result
      elapsedMs.value = data.elapsed_ms ?? null
      onSuccess?.(data)
    } catch (error) {
      result.value = ''
      elapsedMs.value = null
      errorMessage.value = error.message
      onError?.(error)
    } finally {
      isCalculating.value = false
    }
  }

  /** 用历史记录里的表达式回填输入框（扩展功能） */
  function reuseExpression(text) {
    expression.value = String(text ?? '')
    errorMessage.value = ''
  }

  return {
    expression,
    result,
    lastAnswer,
    elapsedMs,
    errorMessage,
    isCalculating,
    hasExpression,
    canEvaluate,
    appendToken,
    clearAll,
    backspace,
    toggleSign,
    insertAnswer,
    evaluate,
    reuseExpression,
  }
}
