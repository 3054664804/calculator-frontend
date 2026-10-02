<script setup>
/** 消息提示容器：右下角浮层，自动消失 */
defineProps({
  toasts: { type: Array, default: () => [] },
})

defineEmits(['dismiss'])
</script>

<template>
  <div class="toast-stack" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        @click="$emit('dismiss', toast.id)"
      >
        <span class="toast__icon">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i' }}
        </span>
        <span class="toast__text">{{ toast.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: min(420px, calc(100vw - 40px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-left-width: 4px;
  border-radius: var(--radius-sm);
  background: var(--panel);
  box-shadow: 0 16px 32px -18px rgba(15, 23, 42, 0.6);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
  cursor: pointer;
  pointer-events: auto;
}

.toast__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 19px;
  height: 19px;
  margin-top: 1px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: var(--accent);
}

.toast--success {
  border-left-color: var(--success);
}

.toast--success .toast__icon {
  background: var(--success);
}

.toast--error {
  border-left-color: var(--danger);
}

.toast--error .toast__icon {
  background: var(--danger);
}

.toast--info {
  border-left-color: var(--accent);
}

.toast__text {
  word-break: break-word;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
