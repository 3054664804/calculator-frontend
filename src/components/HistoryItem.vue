<script setup>
/**
 * 单条历史记录。
 *
 * 删除按钮做两步确认（点一次变成"确认删除"），避免助教演示时误删。
 * 结果只做展示与复制，前端不会基于它做任何运算。
 */
import { computed, ref } from 'vue'

import { formatDateTime, truncateExpression, truncateResult } from '@/utils/format'

const props = defineProps({
  record: { type: Object, required: true },
  deleting: { type: Boolean, default: false },
})

const emit = defineEmits(['delete', 'reuse', 'notify'])

const confirming = ref(false)

const displayExpression = computed(() => truncateExpression(props.record.expression, 34))
const displayResult = computed(() => truncateResult(props.record.result, 30))
const displayTime = computed(() => formatDateTime(props.record.created_at))

function requestDelete() {
  if (!confirming.value) {
    confirming.value = true
    return
  }
  confirming.value = false
  emit('delete', props.record.id)
}

function cancelDelete() {
  confirming.value = false
}

async function copyRecord() {
  const text = `${props.record.expression} = ${props.record.result}`
  try {
    await navigator.clipboard.writeText(text)
    emit('notify', { type: 'success', text: `已复制：${text}` })
  } catch {
    emit('notify', { type: 'error', text: '复制失败，请手动选中文字复制' })
  }
}
</script>

<template>
  <li class="history-item">
    <div class="history-item__main">
      <p class="history-item__expression" :title="record.expression">{{ displayExpression }}</p>
      <p class="history-item__result" :title="record.result">
        <span class="history-item__equals">=</span>{{ displayResult }}
      </p>
    </div>

    <div class="history-item__meta">
      <span class="history-item__time">{{ displayTime }}</span>
      <span class="history-item__id">#{{ record.id }}</span>
    </div>

    <div class="history-item__actions">
      <button type="button" class="mini-btn" title="复制这条记录" @click="copyRecord">复制</button>
      <button
        type="button"
        class="mini-btn"
        title="把表达式回填到计算区"
        @click="$emit('reuse', record.expression)"
      >
        回填
      </button>
      <button
        v-if="!confirming"
        type="button"
        class="mini-btn mini-btn--danger"
        :disabled="deleting"
        title="删除这条历史记录"
        @click="requestDelete"
      >
        {{ deleting ? '删除中…' : '删除' }}
      </button>
      <template v-else>
        <button
          type="button"
          class="mini-btn mini-btn--danger-solid"
          :disabled="deleting"
          @click="requestDelete"
        >
          确认删除
        </button>
        <button type="button" class="mini-btn" @click="cancelDelete">取消</button>
      </template>
    </div>
  </li>
</template>

<style scoped>
.history-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'main meta'
    'actions actions';
  gap: 6px 14px;
  padding: 13px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--panel-muted);
  transition:
    border-color 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.history-item:hover {
  border-color: var(--border-strong);
  box-shadow: 0 6px 16px -12px rgba(15, 23, 42, 0.5);
  transform: translateY(-1px);
}

.history-item__main {
  grid-area: main;
  min-width: 0;
}

.history-item__expression {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  word-break: break-all;
  font-family: var(--font-mono);
}

.history-item__result {
  margin: 4px 0 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--accent-strong);
  word-break: break-all;
  font-family: var(--font-mono);
}

.history-item__equals {
  margin-right: 6px;
  color: var(--text-muted);
  font-weight: 600;
}

.history-item__meta {
  grid-area: meta;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
}

.history-item__id {
  font-family: var(--font-mono);
  opacity: 0.75;
}

.history-item__actions {
  grid-area: actions;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mini-btn {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.mini-btn:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--border-strong);
}

.mini-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mini-btn--danger:hover:not(:disabled) {
  color: var(--danger);
  border-color: var(--danger);
}

.mini-btn--danger-solid {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}

.mini-btn--danger-solid:hover:not(:disabled) {
  color: #fff;
  filter: brightness(1.05);
}
</style>
