<script setup>
/**
 * 单个按键：只负责"长什么样"和"被按下时把 key 抛出去"，
 * 完全不知道"计算"这件事存在。
 */
const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'digit' },
  tone: { type: String, default: '' },
  span: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

defineEmits(['press'])

const classList = [
  `key--${props.type}`,
  props.tone ? `key--${props.tone}` : '',
  props.span > 1 ? `key--span-${props.span}` : '',
]
</script>

<template>
  <button
    type="button"
    class="key"
    :class="classList"
    :title="title || label"
    :disabled="disabled"
    @click="$emit('press')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  padding: 0 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--key-bg);
  color: var(--text);
  font-size: 20px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.08s ease,
    background 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.key:hover:not(:disabled) {
  background: var(--key-bg-hover);
  border-color: var(--border-strong);
}

.key:active:not(:disabled) {
  transform: translateY(1px) scale(0.985);
}

.key:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.key:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.key--operator {
  background: var(--key-operator-bg);
  color: var(--accent-strong);
  font-size: 22px;
}

.key--function {
  background: var(--key-function-bg);
  color: var(--text-muted);
  font-size: 17px;
}

.key--danger {
  color: var(--danger);
}

.key--primary {
  background: linear-gradient(160deg, var(--accent), var(--accent-strong));
  border-color: transparent;
  color: #ffffff;
  font-size: 24px;
  box-shadow: 0 8px 18px -8px var(--accent);
}

.key--primary:hover:not(:disabled) {
  background: linear-gradient(160deg, var(--accent-strong), var(--accent-strong));
}

.key--span-2 {
  grid-column: span 2;
}
</style>
