<script setup>
/**
 * 键盘区：渲染 25 个按键，把点击翻译成"数值字符"或"功能动作"抛给父组件。
 * 这里没有任何运算，连"按下 = 就出结果"也是父组件发请求达成的。
 */
import KeyButton from '@/components/KeyButton.vue'
import { KEYPAD_ROWS } from '@/constants/keypad'

defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['value', 'action'])

function handlePress(key) {
  if (key.action) {
    emit('action', key.action)
    return
  }
  emit('value', key.value)
}
</script>

<template>
  <div class="keypad">
    <KeyButton
      v-for="key in KEYPAD_ROWS.flat()"
      :key="key.id"
      :label="key.label"
      :type="key.type"
      :tone="key.tone || ''"
      :span="key.span || 1"
      :title="key.title || ''"
      :disabled="disabled"
      @press="handlePress(key)"
    />
  </div>
</template>

<style scoped>
.keypad {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 480px) {
  .keypad {
    gap: 8px;
  }
}
</style>
