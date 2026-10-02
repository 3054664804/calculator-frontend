<script setup>
/**
 * 显示屏：只呈现"用户拼出来的表达式字符串"和"后端返回的结果字符串"。
 *
 * 表达式区域是**可直接编辑的输入框**：
 *   - 键盘敲入的字符直接改的就是这个字符串（仍然只是拼字符串，不做任何计算）；
 *   - 这样像 `- 5`、`2 ^ 10` 这种带空格 / 特殊符号的写法也能输入；
 *   - 键盘区的按键则通过父组件往同一个字符串末尾追加字符。
 *
 * 界面上刻意标注了 "由后端 API 计算"，提醒使用者：这里看到的每一个数字
 * 都来自 POST /api/calculate，前端没有算过任何东西。
 */
import { computed } from 'vue'

const props = defineProps({
  expression: { type: String, default: '' },
  result: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  elapsedMs: { type: Number, default: null },
  isCalculating: { type: Boolean, default: false },
  lastAnswer: { type: String, default: '' },
})

const emit = defineEmits(['update:expression'])

const hasElapsed = computed(() => props.elapsedMs !== null && props.elapsedMs !== undefined)

function handleInput(event) {
  emit('update:expression', event.target.value)
}
</script>

<template>
  <section class="display" :class="{ 'display--error': Boolean(errorMessage) }">
    <div class="display__row">
      <span class="display__label">表达式</span>
      <span v-if="hasElapsed" class="display__hint">后端耗时 {{ elapsedMs }} ms</span>
    </div>

    <input
      class="display__input"
      type="text"
      :value="expression"
      placeholder="0"
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
      aria-label="表达式输入框"
      @input="handleInput"
      @keydown.enter.prevent="$emit('submit')"
    />

    <div class="display__split"></div>

    <div class="display__row">
      <span class="display__label display__label--result">结果 · 由后端 API 计算</span>
      <span v-if="lastAnswer" class="display__hint">Ans = {{ lastAnswer }}</span>
    </div>

    <p v-if="errorMessage" class="display__error">
      <span class="display__error-icon">!</span>{{ errorMessage }}
    </p>
    <p v-else-if="isCalculating" class="display__result display__result--pending">正在请求后端…</p>
    <p v-else class="display__result">{{ result || '—' }}</p>
  </section>
</template>

<style scoped>
.display {
  padding: 18px 20px 20px;
  border: 1px solid var(--display-border);
  border-radius: var(--radius-lg);
  background: var(--display-bg);
  color: var(--display-text);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: border-color 0.2s ease;
}

.display--error {
  border-color: var(--danger);
}

.display__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.display__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--display-label);
}

.display__label--result {
  color: var(--display-accent);
}

.display__hint {
  font-size: 12px;
  color: var(--display-label);
  font-variant-numeric: tabular-nums;
}

.display__input {
  display: block;
  width: 100%;
  margin: 8px 0 0;
  padding: 4px 0;
  border: none;
  border-bottom: 1px dashed transparent;
  background: transparent;
  color: var(--display-text);
  font-size: 26px;
  font-weight: 600;
  line-height: 1.35;
  text-align: right;
  font-family: var(--font-mono);
  outline: none;
  transition: border-color 0.16s ease;
}

.display__input::placeholder {
  color: var(--display-label);
  opacity: 0.6;
}

.display__input:hover {
  border-bottom-color: var(--display-split);
}

.display__input:focus {
  border-bottom-color: var(--display-accent);
}

.display__split {
  height: 1px;
  margin: 14px 0 12px;
  background: var(--display-split);
}

.display__result {
  margin: 6px 0 0;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.25;
  min-height: 44px;
  word-break: break-all;
  text-align: right;
  color: var(--display-accent);
  font-family: var(--font-mono);
}

.display__result--pending {
  font-size: 20px;
  color: var(--display-label);
}

.display__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 6px 0 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  color: #fca5a5;
}

.display__error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border-radius: 50%;
  background: rgba(248, 113, 113, 0.22);
  font-size: 13px;
}
</style>
