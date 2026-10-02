<script setup>
/**
 * 计算器面板：显示屏 + 键盘 + 键盘快捷键。
 *
 * 计算状态来自 useCalculator（只拼字符串、只调后端接口）。
 * 计算成功后向上抛 calculated 事件，让历史面板去后端重新拉一次列表。
 */
import { onMounted, onUnmounted } from 'vue'

import DisplayBoard from '@/components/DisplayBoard.vue'
import KeyPad from '@/components/KeyPad.vue'
import { useCalculator } from '@/composables/useCalculator'
import { KEYBOARD_VALUE_MAP } from '@/constants/keypad'

const emit = defineEmits(['calculated', 'notify'])

const {
  expression,
  result,
  lastAnswer,
  elapsedMs,
  errorMessage,
  isCalculating,
  appendToken,
  clearAll,
  backspace,
  toggleSign,
  insertAnswer,
  evaluate,
  reuseExpression,
} = useCalculator({
  onSuccess: (data) => {
    emit('calculated', data)
    emit('notify', {
      type: 'success',
      text: `后端计算完成：${data.expression} = ${data.result}`,
    })
  },
  onError: (error) => {
    emit('notify', { type: 'error', text: error.message })
  },
})

function handleValue(token) {
  appendToken(token)
}

function handleAction(action) {
  const actions = {
    clear: clearAll,
    backspace,
    sign: toggleSign,
    answer: insertAnswer,
    evaluate,
  }
  actions[action]?.()
}

/** 物理键盘支持：把按键翻译成同一个 appendToken / evaluate 入口 */
function handleKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return

  const { key } = event

  // 焦点在输入框里时，字符输入交给浏览器原生行为（Vue 会同步回表达式字符串），
  // 全局快捷键一律不介入，避免出现"在搜索框里打字，表达式框跟着变"的串台。
  const target = event.target
  const isFormField = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  if (isFormField) {
    const isExpressionInput = target.classList.contains('display__input')
    if (key === 'Enter' && isExpressionInput) {
      event.preventDefault()
      evaluate()
    }
    return
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault()
    evaluate()
    return
  }
  if (key === 'Backspace') {
    event.preventDefault()
    backspace()
    return
  }
  if (key === 'Escape' || key === 'Delete') {
    event.preventDefault()
    clearAll()
    return
  }

  const isMapped = Object.prototype.hasOwnProperty.call(KEYBOARD_VALUE_MAP, key)
  if (isMapped) {
    event.preventDefault()
    appendToken(KEYBOARD_VALUE_MAP[key])
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

/** 供父组件调用：把历史里的表达式回填到输入框 */
defineExpose({ reuseExpression })
</script>

<template>
  <section class="card calculator">
    <header class="card__header">
      <div>
        <h2 class="card__title">计算区</h2>
        <p class="card__subtitle">
          支持四则运算、括号、小数、一元正负；表达式框可直接编辑，也可用键盘输入
        </p>
      </div>
      <span class="tag">POST /api/calculate</span>
    </header>

    <DisplayBoard
      v-model:expression="expression"
      :result="result"
      :error-message="errorMessage"
      :elapsed-ms="elapsedMs"
      :is-calculating="isCalculating"
      :last-answer="lastAnswer"
      @submit="evaluate"
    />

    <KeyPad :disabled="isCalculating" @value="handleValue" @action="handleAction" />

    <p class="calculator__footnote">
      提示：点击 <strong>=</strong> 后，浏览器会把这个表达式字符串发给后端，
      由后端的 asteval 求值并把结果写进 SQLite —— 关掉后端服务，这里就只会有错误提示。
    </p>
  </section>
</template>

<style scoped>
.calculator__footnote {
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px dashed var(--border);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-muted);
}

.tag {
  flex: none;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 11.5px;
  font-weight: 700;
  font-family: var(--font-mono);
}
</style>
