<script setup>
/**
 * 历史记录面板。
 *
 * 数据来源：GET /api/history（后端 SQLite）。
 * 刷新页面会重新拉取，所以历史不会丢 —— 这就是"必须后端持久化"的体现。
 *
 * 组件对外暴露 load()，父组件在每次计算成功后调用它刷新列表。
 */
import { onMounted, ref } from 'vue'

import HistoryItem from '@/components/HistoryItem.vue'
import { useHistory } from '@/composables/useHistory'

const emit = defineEmits(['notify', 'reuse'])

const {
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
} = useHistory({
  onError: (error) => emit('notify', { type: 'error', text: error.message }),
  onMessage: (message) => emit('notify', message),
})

const confirmingClear = ref(false)

function handleDelete(recordId) {
  remove(recordId)
}

function handleClear() {
  if (!confirmingClear.value) {
    confirmingClear.value = true
    return
  }
  confirmingClear.value = false
  clearAll()
}

onMounted(load)

defineExpose({ load })
</script>

<template>
  <section class="card history">
    <header class="card__header">
      <div>
        <h2 class="card__title">
          计算历史
          <span class="history__count">共 {{ total }} 条</span>
        </h2>
        <p class="card__subtitle">存放在后端 SQLite 数据库中，刷新页面 / 换浏览器都不会丢</p>
      </div>
      <span class="tag">GET /api/history</span>
    </header>

    <div class="history__toolbar">
      <label class="history__search">
        <span class="history__search-icon">🔍</span>
        <input
          v-model="keyword"
          type="search"
          class="history__search-input"
          placeholder="搜索表达式或结果，例如 100 或 3*"
          aria-label="搜索历史记录"
        />
      </label>

      <button type="button" class="btn btn--ghost" :disabled="isLoading" @click="load">
        {{ isLoading ? '刷新中…' : '刷新' }}
      </button>

      <button
        v-if="!confirmingClear"
        type="button"
        class="btn btn--ghost btn--danger"
        :disabled="!hasRecords || isClearing"
        @click="handleClear"
      >
        清空历史
      </button>
      <template v-else>
        <button type="button" class="btn btn--danger-solid" :disabled="isClearing" @click="handleClear">
          {{ isClearing ? '清空中…' : '确认清空' }}
        </button>
        <button type="button" class="btn btn--ghost" @click="confirmingClear = false">取消</button>
      </template>
    </div>

    <div class="history__body">
      <p v-if="isLoading && !records.length" class="history__state">正在从后端加载历史记录…</p>

      <div v-else-if="isEmpty" class="history__state history__state--empty">
        <p class="history__empty-title">还没有历史记录</p>
        <p class="history__empty-text">
          在左侧输入一个表达式并点击 <strong>=</strong>，计算结果会自动保存到后端数据库。
        </p>
      </div>

      <ul v-else class="history__list">
        <HistoryItem
          v-for="record in records"
          :key="record.id"
          :record="record"
          :deleting="deletingId === record.id"
          @delete="handleDelete"
          @reuse="$emit('reuse', $event)"
          @notify="$emit('notify', $event)"
        />
      </ul>
    </div>

    <p class="history__footnote">
      历史记录由后端持久化：即使刷新页面、清空浏览器缓存、换一台电脑，重新打开页面依然能查到。
    </p>
  </section>
</template>

<style scoped>
.history__count {
  margin-left: 8px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--panel-muted);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
  vertical-align: middle;
}

.history__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.history__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 200px;
  min-width: 180px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--panel-muted);
  transition: border-color 0.16s ease;
}

.history__search:focus-within {
  border-color: var(--accent);
  background: var(--panel);
}

.history__search-icon {
  font-size: 13px;
  opacity: 0.7;
}

.history__search-input {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 13.5px;
  font-family: inherit;
  outline: none;
}

.history__body {
  margin-top: 14px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.history__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.history__state {
  margin: 26px 0;
  text-align: center;
  font-size: 13.5px;
  color: var(--text-muted);
}

.history__state--empty {
  padding: 26px 16px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--panel-muted);
}

.history__empty-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.history__empty-text {
  margin: 8px 0 0;
  line-height: 1.7;
}

.history__footnote {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
  font-size: 12px;
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
