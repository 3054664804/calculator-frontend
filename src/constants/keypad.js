/**
 * 键盘布局定义。
 *
 * 每个按键只描述"往表达式字符串里追加什么"或"触发哪个 UI 动作"，
 * 不含任何计算逻辑。所有运算都发给后端。
 *
 * type 取值：digit（数字）| operator（运算符）| function（功能键）| primary（等号）
 * action 取值：clear | backspace | sign | answer | evaluate
 */
export const KEYPAD_ROWS = [
  [
    { id: 'clear', label: 'AC', type: 'function', tone: 'danger', action: 'clear', title: '清空表达式（Esc）' },
    { id: 'backspace', label: '⌫', type: 'function', action: 'backspace', title: '退格（Backspace）' },
    { id: 'lparen', label: '(', type: 'operator', value: '(', title: '左括号' },
    { id: 'rparen', label: ')', type: 'operator', value: ')', title: '右括号' },
    { id: 'divide', label: '÷', type: 'operator', value: '/', title: '除' },
  ],
  [
    { id: 'digit-7', label: '7', type: 'digit', value: '7' },
    { id: 'digit-8', label: '8', type: 'digit', value: '8' },
    { id: 'digit-9', label: '9', type: 'digit', value: '9' },
    { id: 'multiply', label: '×', type: 'operator', value: '*', title: '乘' },
    { id: 'modulo', label: '%', type: 'operator', value: '%', title: '取模（扩展）' },
  ],
  [
    { id: 'digit-4', label: '4', type: 'digit', value: '4' },
    { id: 'digit-5', label: '5', type: 'digit', value: '5' },
    { id: 'digit-6', label: '6', type: 'digit', value: '6' },
    { id: 'minus', label: '−', type: 'operator', value: '-', title: '减（也可当中负号用，如 3*-2）' },
    { id: 'answer', label: 'Ans', type: 'function', action: 'answer', title: '插入上一次的结果（扩展）' },
  ],
  [
    { id: 'digit-1', label: '1', type: 'digit', value: '1' },
    { id: 'digit-2', label: '2', type: 'digit', value: '2' },
    { id: 'digit-3', label: '3', type: 'digit', value: '3' },
    { id: 'plus', label: '+', type: 'operator', value: '+', title: '加' },
    { id: 'power', label: 'xʸ', type: 'operator', value: '^', title: '幂运算（扩展）' },
  ],
  [
    { id: 'sign', label: '±', type: 'function', action: 'sign', title: '切换正负号' },
    { id: 'digit-0', label: '0', type: 'digit', value: '0' },
    { id: 'dot', label: '.', type: 'digit', value: '.', title: '小数点' },
    {
      id: 'evaluate',
      label: '=',
      type: 'primary',
      action: 'evaluate',
      span: 2,
      title: '提交给后端计算（Enter）',
    },
  ],
]

/** 物理键盘 → 按键值的映射，让用户可以直接用键盘敲表达式 */
export const KEYBOARD_VALUE_MAP = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  '.': '.',
  '+': '+',
  '-': '-',
  '*': '*',
  x: '*',
  X: '*',
  '/': '/',
  '(': '(',
  ')': ')',
  '%': '%',
  '^': '^',
}
