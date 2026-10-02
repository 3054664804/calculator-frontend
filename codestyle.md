# 前端代码规范（calculator-frontend）

本规范适用于 `calculator-frontend` 仓库的**全部前端源码**：`src/**/*.js`、`src/**/*.vue`、`index.html`、`vite.config.js`、`*.css`、`*.json`。

- 后端仓库规范见 [calculator-backend/codestyle.md](https://github.com/3054664804/calculator-backend/blob/main/codestyle.md)。
- 本规范与代码冲突时，以本规范为准；本规范与该项目的**头号硬性约束**（前端零计算）冲突时，以硬性约束为准。
- 提交 PR 前请逐条对照第 9 节《代码审查清单》。

---

## 1. 总则与工具

### 1.1 三条不可协商的原则

| # | 原则 | 说明 |
| --- | --- | --- |
| 1 | **前端零计算** | 前端只做 UI、字符串拼接、HTTP 调用。任何表达式求值都不允许出现在前端 |
| 2 | **单一数据源** | 计算结果与历史记录一律来自后端；前端不缓存、不推算、不"乐观更新"数值 |
| 3 | **错误必须归一化** | 所有 API 错误统一经 `src/api/client.js` 的 `normalizeError`，组件只消费 `error.message` |

### 1.2 Prettier 风格约定

| 项 | 约定 | 示例 |
| --- | --- | --- |
| 缩进 | 2 个空格（禁止 Tab） | `  const expression = ref('')` |
| 引号 | 单引号（JS / CSS / Vue 模板属性一致） | `import { ref } from 'vue'` |
| 分号 | **不写**（`semi: false`） | `const id = ref(null)` |
| 行宽 | 100 字符，超长自动换行 | 见下方多行示例 |
| 尾随逗号 | 多行结构全部加尾逗号（`trailingComma: 'all'`） | `{ id, type, text }` 展开成多行时末尾留逗号 |
| 对象花括号 | 始终留空格（`bracketSpacing: true`） | `{ type: 'success', text: '已复制' }` |
| 箭头函数参数 | 单参数省略括号（`arrowParens: 'avoid'`） | `records.map(record => record.id)` |
| 换行符 | LF（`.gitattributes` / 编辑器统一） | — |
| 文件末尾 | 保留一个空行 | — |

超长行换行的写法（缩进 2 空格，链式调用每级一行）：

```js
/** 查询历史记录，可按关键字搜索、分页 */
export function fetchHistory({ keyword, limit, offset } = {}) {
  return http
    .get('/api/history', { params: { keyword, limit, offset } })
    .then((response) => response.data)
}
```

### 1.3 ESLint 约定

- `package.json` 已提供入口：`"lint": "eslint src --ext .js,.vue"`（依赖需自行安装：`eslint`、`eslint-plugin-vue`，按项目需要补充 `@vue/eslint-config-prettier`）。
- 规则取向：
  - `vue/multi-word-component-names`：**关闭**（允许 `KeyPad.vue`、`AppHeader.vue` 这类单词/短名组件，但组件名必须 PascalCase）；
  - `vue/component-api-style`：锁定 `script-setup`；
  - `no-unused-vars`：`error`，下划线前缀的占位参数可豁免（如 `catch { /* 忽略 */ }` 优先于命名变量）；
  - `no-console`：提交代码中**不允许** `console.log`（调试完必须删除）；
  - `no-eval`、`no-implied-eval`、`no-new-func`：**error**，这是第 1 条原则的机器化保障；
  - `prefer-const`、`eqeqeq`（除 `== null` 场景，本项目统一写 `=== null` / `?? `）。
- 允许省略分号、允许单行 `if (x) return`（与 Prettier 输出保持一致）。

### 1.4 编辑器建议

- VS Code：安装 ESLint + Prettier，开启 `editor.formatOnSave`、`files.eol: "\n"`、`editor.tabSize: 2`。
- 提交前至少跑一次 `npm run build`，确保构建无警告阻塞。

---

## 2. 目录与文件命名规范

| 类型 | 目录 | 命名规则 | 示例 |
| --- | --- | --- | --- |
| Vue 组件 | `src/components/` | **PascalCase.vue**，多单词优先 | `CalculatorPanel.vue`、`HistoryItem.vue`、`KeyButton.vue` |
| 组合式函数 | `src/composables/` | **useXxx.js**，小驼峰，`use` 前缀 | `useCalculator.js`、`useHistory.js`、`useBackendStatus.js` |
| API 模块 | `src/api/` | 小写单词；`client.js` 固定承载 axios 实例与错误处理 | `client.js`、`calculator.js` |
| 常量模块 | `src/constants/` | 小写单词，按领域划分 | `keypad.js`、`links.js` |
| 工具模块 | `src/utils/` | 小写单词，按职责划分 | `format.js` |
| 样式 | `src/styles/` | 小写单词；全局入口固定为 `main.css` | `main.css` |
| 入口文件 | `src/` | 固定 `main.js`（应用入口）、`App.vue`（根组件） | — |
| 导出常量 | 任意 | **大写下划线**（`UPPER_SNAKE_CASE`） | `KEYPAD_ROWS`、`KEYBOARD_VALUE_MAP`、`REPO_LINKS`、`GITHUB_USER` |
| 局部常量 | 任意 | 大写下划线，带单位后缀更佳 | `SEARCH_DEBOUNCE_MS`、`HEARTBEAT_INTERVAL_MS`、`DEFAULT_DURATION_MS`、`STORAGE_KEY` |
| 变量 / 函数 | 任意 | 小驼峰；事件处理用 `handleXxx` | `appendToken`、`handleKeydown`、`handleDelete` |
| 布尔值 | 任意 | `is` / `has` / `can` 前缀 | `isLoading`、`isClearing`、`hasExpression`、`canEvaluate` |
| **CSS 类名** | 任意 | **kebab-case**，BEM 风格：`block`、`block__element`、`block--modifier` | `card__header`、`history-item__expression`、`key--primary`、`display--error` |
| 文件内路径引用 | 任意 | 一律用 `@` 别名（`vite.config.js` 中指向 `src`） | `import { REPO_LINKS } from '@/constants/links'` |

不建议出现的东西：

- 不要把 api 调用写进组件：组件只 `import` composable。
- 不要在 `src/` 下新增 `views/`、`store/`（本项目无路由、无 Pinia，状态用 composable + `ref`）。
- 不要用 `index.js` 做桶文件（barrel），保持显式导入路径，便于 grep 自证。

---

## 3. Vue 单文件组件（SFC）规范

### 3.1 块顺序（强制）

```vue
<script setup>
// 1) 依赖导入  2) defineProps / defineEmits  3) 本地状态  4) 计算属性  5) 函数  6) 生命周期  7) defineExpose
</script>

<template>
  <!-- 只做展示与事件绑定 -->
</template>

<style scoped>
/* 组件私有样式放最后 */
</style>
```

- `<script setup>` **必须在最前**，`<template>` 居中，`<style scoped>` **必须放在最后**。
- 不使用 Options API，不使用 `setup()` 函数形式，不使用 `mixins`。

### 3.2 props：对象式声明 + 类型 + 默认值

必填项用 `required: true`，其余一律给 `default`；对象/数组的默认值必须用工厂函数：

```js
const props = defineProps({
  record: { type: Object, required: true },
  deleting: { type: Boolean, default: false },
  toasts: { type: Array, default: () => [] },
  elapsedMs: { type: Number, default: null },
})
```

- 禁止数组式简写：`defineProps(['record'])` ❌。
- 需要响应式读取时接住返回值 `const props = defineProps({...})`；只在模板使用可省略 `const`。

### 3.3 emits：必须显式声明

```js
const emit = defineEmits(['delete', 'reuse', 'notify'])
```

- 命名用 kebab-case（`@toggle-theme`、`@update:expression`），与模板一致。
- 事件只传递**数据本身**（字符串、id、对象），不在事件里塞业务逻辑。
- `v-model` 组件使用 `update:xxx` 约定：

```js
const emit = defineEmits(['update:expression'])
function handleInput(event) {
  emit('update:expression', event.target.value)
}
```

### 3.4 组件职责：只做展示与事件上抛

- 组件**不得**直接 `import` axios 或 `@/api/*`；网络请求一律放在 composable 中。
- 组件**不得**做数值运算（连计数自增都不行，key 用 `crypto.randomUUID()`）。
- 组件对外暴露方法用 `defineExpose`，例如 `HistoryPanel.vue` 暴露 `load()`、`CalculatorPanel.vue` 暴露 `reuseExpression()`。
- 事件处理函数保持"薄"：

```js
function handleDelete(recordId) {
  remove(recordId)
}
```

- 父组件通过 `ref` 调用子组件方法（`App.vue` 的 `calculatorRef.value?.reuseExpression(...)`）时，可选项链 `?.` 必须保留，避免竞态下报错。

### 3.5 模板约定

| 项 | 约定 |
| --- | --- |
| 属性顺序 | `v-if`/`v-for` → `ref`/`key` → 静态属性（`type`、`class`）→ 动态绑定 → 事件（`@`） |
| 指令缩写 | 统一用 `:` 和 `@`，不用 `v-bind:` / `v-on:` |
| `v-for` | 必须配 `:key`，且 key 用稳定业务 id（`record.id`、`key.id`、`toast.id`） |
| 语义标签 | 结构用 `header` / `main` / `section` / `footer` / `ul` / `li` |
| 无障碍 | 交互元素带 `aria-label` 或可见文本；纯装饰图标加 `aria-hidden="true"`；Toast 容器 `role="status" aria-live="polite"` |
| 类名绑定 | 静态类写 `class="key"`，动态类用对象/数组语法 `:class="classList"` |
| 空值展示 | 结果为空显示 `—`，时间缺失显示 `-`，不要渲染 `undefined` / `null` 字面量 |

---

## 4. JavaScript 规范

### 4.1 【红线】禁止前端做任何表达式计算

**这是本项目的头号规则，任何 PR 违反一律拒绝。**

禁止：

| 禁止项 | 反例 |
| --- | --- |
| `eval` / `Function` / `setTimeout('...')` 字符串执行 | `eval('3+5')`、`new Function('return 3+5')()` |
| 任何表达式求值库 / 手写求值器（调度场、递归下降、正则凑答案） | `import { evaluate } from 'mathjs'` |
| 数值转换后再运算 | `Number(a) + Number(b)`、`parseFloat(x) * 2` |
| `Math.*` 数值运算 | `Math.round(...)`、`Math.pow(...)` |
| 对表达式/结果做算术 | `result.value = a + b`（其中 a、b 是数字） |
| 在前端"预测/校验"结果 | 提交前先本地算一遍用来加速 UI |

允许（且鼓励）：

| 允许项 | 说明与示例 |
| --- | --- |
| 字符串拼接 | `expression.value += token`、`` `${current.slice(0, numberStart)}(-${trailing[0]})` `` |
| 字符串切片/长度 | `expression.value.slice(0, -1)`、`value.length <= maxLength` |
| 正则做**文本**处理 | `TRAILING_NUMBER = /(\d+\.?\d*)$/`、把末尾数字包成 `(-5)` 的文本替换 |
| 类型判断 | `Number.isNaN(date.getTime())`、`typeof token !== 'string'` |
| 展示层截断 | `truncateExpression(text, 28)` 只做 `slice` + 拼 `…` |
| 下标运算 | `const closeIndex = expression.value.length - 1`（操作对象是**字符串长度**） |

**代码评审时的判定标准**：只要被运算的值的"来源"是用户输入的数字语义（表达式、结果、历史计数、时间差），就不允许在前端算。若确实需要，改由后端返回。

唯一的"结果来源"是 `POST /api/calculate` 的响应：

```js
const payload = await calculateApi(submitted)
const data = payload.data
result.value = data.result        // 直接展示后端字符串，不做任何加工
lastAnswer.value = data.result
elapsedMs.value = data.elapsed_ms ?? null
```

### 4.2 错误处理：统一走 `normalizeError`

- 禁止在业务代码里手工判断 `error.response.status`、拼错误文案。
- 错误对象在 `src/api/client.js` 的响应拦截器中已归一化：

```js
http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
)
```

- 业务侧只允许两种消费方式：

```js
// composable：把错误抛给上层回调
catch (error) {
  errorMessage.value = error.message
  onError?.(error)
}

// 组件：把错误转成 Toast
onError: (error) => emit('notify', { type: 'error', text: error.message }),
```

- `normalizeError` 的输出结构固定为 `{ code, message, status }`；需要按 `code` 分支时使用 `code`，**不要**依赖后端原始字段名。
- 新增错误类型时，只改 `normalizeError`，不要在调用点散落判断。

### 4.3 异步写法：`async/await` 优先，api 层可用 `.then`

- composable / 组件：一律 `async/await` + `try/catch/finally`：

```js
async function load() {
  isLoading.value = true
  try {
    const payload = await fetchHistory({ keyword: keyword.value.trim() || undefined })
    records.value = payload.data
    total.value = payload.total
  } catch (error) {
    records.value = []
    total.value = 0
    onError?.(error)
  } finally {
    isLoading.value = false
  }
}
```

- `src/api/calculator.js` 作为薄适配层，**允许**用 `.then` 链把响应裁剪成 `response.data`，保持一行一个接口：

```js
export function calculate(expression) {
  return http.post('/api/calculate', { expression }).then((response) => response.data)
}
```

- 禁止：回调地狱、`new Promise` 包 axios、`await` 写在循环里串行打接口（需要并发用 `Promise.all`）。
- 加载状态必须成对：进入前置 `true`，`finally` 置 `false`（参考 `isLoading`、`isCalculating`、`isClearing`、`deletingId`）。

### 4.4 避免魔法字符串，常量集中到 `src/constants/`

- 接口路径、键盘布局、仓库链接、时间常量都要有名字：

```js
const SEARCH_DEBOUNCE_MS = 300
const HEARTBEAT_INTERVAL_MS = 30000
const DEFAULT_DURATION_MS = 2800
const STORAGE_KEY = 'calculator-theme'
```

- 会被多个文件共用的常量放 `src/constants/`（`KEYPAD_ROWS`、`KEYBOARD_VALUE_MAP`、`REPO_LINKS`）；只有一个文件用的就近定义在文件顶部，紧跟注释。
- 禁止在模板/函数里硬编码 `30000`、`'/api/history'`、`'#2563eb'` 这类字面量（颜色见第 5 节：用 CSS 变量）。
- Toast 类型、后端状态等枚举值集中管理：`'success' | 'error' | 'info'`、`'checking' | 'online' | 'offline'`，不在多处重复拼写。

### 4.5 其它细节

- 导入顺序：`vue` → 第三方 → `@/` 内部模块，组间空一行。
- 一个模块一个职责；单文件超 200 行考虑拆分 composable。
- 注释写"为什么"而不是"做了什么"，文件头用块注释说明职责与约束（现有文件已统一这样写）。
- 禁止提交调试代码：`console.log`、`debugger`、`alert`。
- 形参解构带默认空对象，避免调用方必须传参：`export function useCalculator({ onSuccess, onError } = {})`。
- 可选链与空值合并优先：`payload.data.elapsed_ms ?? null`、`historyRef.value?.load()`。

---

## 5. CSS 规范

### 5.1 设计令牌集中在 `src/styles/main.css` 的 CSS 变量

- 颜色、圆角、字体、阴影一律用变量，**禁止**在组件里写死十六进制色值：

```css
:root {
  --font-sans: system-ui, -apple-system, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Cascadia Mono', Consolas, 'Courier New', monospace;

  --radius-lg: 20px;
  --radius-md: 14px;
  --radius-sm: 10px;

  --bg: #eef2f8;
  --panel: #ffffff;
  --panel-muted: #f8fafc;
  --border: #e3e8ef;
  --border-strong: #cbd5e1;
  --text: #0f172a;
  --text-muted: #64748b;

  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --accent-soft: #e0ecff;
  --success: #059669;
  --danger: #dc2626;
  --warning: #d97706;

  --shadow-card: 0 20px 45px -30px rgba(15, 23, 42, 0.55);

  --key-bg: #ffffff;
  --key-bg-hover: #f1f5f9;
  --key-operator-bg: #eff6ff;
  --key-function-bg: #f1f5f9;

  --display-bg: linear-gradient(158deg, #0f172a 0%, #1e293b 100%);
  --display-border: #1e293b;
  --display-text: #e2e8f0;
  --display-label: #94a3b8;
  --display-accent: #7dd3fc;
  --display-split: rgba(148, 163, 184, 0.25);
}
```

- 新增令牌时：先加浅色 `:root`，再加深色覆盖，命名沿用"语义 + 变体"（`--border-strong`、`--accent-soft`），不要出现 `--blue-500` 这类纯色号命名。

`main.css` 的组织顺序（新样式必须归入对应分区）：

1. 设计令牌（`:root` / `html[data-theme='dark']`）
2. 基础重置（`box-sizing`、`body`、标题、`button`）
3. 页面骨架（`.app-shell`、`.layout`、`.app-footer`）
4. 可复用类（`.card`、`.card__header`、`.card__title`、`.btn`、`.btn--ghost`、`.btn--danger`）
5. 细节（`::selection`、滚动条）

### 5.2 组件私有样式写在 `<style scoped>`

- 组件样式**必须**加 `scoped`，禁止裸 `<style>` 影响全局。
- 全局只保留真正的通用件（`.card`、`.btn`、骨架类）；一旦某样式只服务一个组件，就搬回该组件的 `<style scoped>`。
- 需要穿透子组件样式时优先改子组件 API（props/类名），而不是 `:deep()`。

### 5.3 类名语义化（kebab-case + BEM）

| 形态 | 写法 | 示例 |
| --- | --- | --- |
| 块 | `block` | `.key`、`.display`、`.history-item`、`.toast` |
| 元素 | `block__element` | `.display__input`、`.history-item__result`、`.card__subtitle` |
| 修饰符 | `block--modifier` | `.key--primary`、`.key--danger`、`.display--error`、`.btn--ghost` |

- 禁止无语义类名：`.red`、`.mt10`、`.box2`。
- 状态类用 JS 表达式生成时保持可读：`:class="`status-pill--${backendStatus}`"`、`:class="{ 'display--error': Boolean(errorMessage) }"`。
- 布局优先用 Flex / Grid，间距用 `gap`，避免用一堆 margin 硬凑。
- 过渡动画写成 `transition: border-color 0.16s ease, transform 0.16s ease`，多值换行保持一行一个。

### 5.4 深色主题：`[data-theme='dark']`

- 主题切换**只允许**改根元素属性，由 `useTheme.js` 完成：

```js
function applyTheme(value) {
  document.documentElement.dataset.theme = value
}
```

- 深色覆盖选择器统一写 `html[data-theme='dark']`（与 `main.css` 保持一致），在组件里**不写**主题分支，只消费变量。
- 组件里若必须区分主题（极少数情况），用 `:global`/变量而不是 JS 判断 `theme.value === 'dark'` 去改内联样式。
- 新增颜色令牌必须同时补两套值，避免深色模式下白底白字。
- 主题偏好存 `localStorage` 的 `'calculator-theme'`，读取失败要静默兜底（隐私模式），并回退到 `prefers-color-scheme`。

---

## 6. Git 提交规范

采用 **Conventional Commits**，格式：

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

| type | 用途 |
| --- | --- |
| `feat` | 新功能（新组件、新 composable、新接口接入） |
| `fix` | 缺陷修复 |
| `style` | 仅样式 / 格式化（不改逻辑） |
| `refactor` | 重构（不改行为） |
| `docs` | 文档（README、codestyle.md） |
| `chore` | 构建、依赖、配置（vite.config.js、vercel.json、package.json） |
| `perf` | 性能优化 |
| `test` | 测试相关 |

`scope` 建议取值：`calculator`、`history`、`keypad`、`display`、`theme`、`toast`、`header`、`api`、`styles`、`deps`、`docs`。

示例：

```text
feat(history): 支持按关键字搜索历史记录并做 300ms 防抖
fix(api): 修正 normalizeError 对超时错误的 code 判定
style(keypad): 统一按键圆角为 --radius-md
refactor(calculator): 将 toggleSign 的正负号处理改为纯字符串替换
docs(readme): 补充前端零计算的 grep 自证命令
chore(deps): 升级 vite 至 5.4.11
```

要求：

- 标题用中文、动词开头、不超过 50 字，结尾不加句号。
- 一次提交只做一件事；不要把"重排格式"和"改逻辑"混在一起。
- 正文说明**为什么**，涉及行为变化时写清前后差异。
- 破坏性变更在 footer 写 `BREAKING CHANGE:`。
- 禁止 `update`、`fix bug`、`修改` 这类无信息量的标题。
- 分支命名：`feat/xxx`、`fix/xxx`、`docs/xxx`。

---

## 7. 常见反例速查

| 反例 | 问题 | 正确做法 |
| --- | --- | --- |
| `result.value = eval(expression.value)` | 前端计算 + 安全风险 | `POST /api/calculate` |
| 前端用 mathjs 求值 | 违反零计算 | 由后端 `asteval` 求值 |
| `total.value -= 1`（删除后本地减） | 前端计数运算 + 与后端不一致 | 删除成功后重新 `load()` |
| `formatDateTime` 返回"3 分钟前" | 需要前端时间减法 | 后端给 ISO 字符串，前端只 `toLocaleString` |
| `catch (e) { alert('请求失败') }` | 绕过统一错误结构 | `emit('notify', { type: 'error', text: error.message })` |
| 组件里 `import http from '@/api/client'` | 组件承担网络职责 | 下沉到 composable |
| `defineProps(['label', 'span'])` | 无类型无默认值 | 对象式声明 + `default` |
| `<style>`（无 scoped）改 `.btn` 颜色 | 全局污染 | 用 CSS 变量或改 `main.css` 的令牌 |
| 模板里写 `#2563eb` | 绕过设计令牌 | `var(--accent)` |
| `console.log(payload)` 留在提交里 | 调试残留 | 删除 |

---

## 8. 代码审查清单

复制到 PR 描述里逐条勾选：

- [ ] **零计算**：新增代码中没有 `eval` / `new Function` / `parseFloat` / `parseInt` / `Number(x)` 数值转换 / `Math.*`；没有对表达式、结果、历史计数、时间差做任何算术
- [ ] 计算结果只来自 `POST /api/calculate` 的响应；关掉后端时新结果一定算不出来（只显示错误提示）
- [ ] 历史记录只从 `GET /api/history` 获取，前端没有任何形式的持久化（`localStorage` 只用于主题偏好）
- [ ] 所有 API 错误都经 `normalizeError`，组件只消费 `error.message`，没有手工拼 HTTP 状态判断
- [ ] api 层新增/修改的接口与 README《后端 API 契约》章节一致（路径、请求体、响应字段）
- [ ] 组件 `<script setup>` 在最前、`<style scoped>` 在最后；未使用 Options API / mixin
- [ ] props 为对象式声明且带 `type` 与 `default`（对象/数组用工厂函数）；emits 显式声明
- [ ] 组件只做展示与事件上抛，不直接 import `@/api/*`
- [ ] 文件命名合规：组件 `PascalCase.vue`、composable `useXxx.js`、常量 `UPPER_SNAKE_CASE`、CSS 类 kebab-case / BEM
- [ ] 魔法值已提取为常量（时间、接口路径、键盘布局、仓库链接集中在 `src/constants/`）
- [ ] 异步统一 `async/await` + `try/catch/finally`，加载态成对出现（api 层允许 `.then`）
- [ ] Prettier 约定满足：2 空格缩进、单引号、无分号、行宽 ≤ 100、多行尾逗号
- [ ] 无 `console.log` / `debugger` / 注释掉的死代码
- [ ] 颜色、圆角、阴影、字体全部使用 `main.css` 中的 CSS 变量；未新增硬编码色值
- [ ] 新增变量同时补齐 `html[data-theme='dark']` 覆盖，深色模式下无不可读文本
- [ ] 组件私有样式均在 `<style scoped>` 内，没有全局选择器污染
- [ ] 无障碍：交互按钮有可读文本或 `aria-label`，纯装饰图标 `aria-hidden`，列表 `v-for` 均有稳定 `:key`
- [ ] 环境变量未硬编码：后端地址只来自 `VITE_API_BASE_URL`（相对路径仅在开发代理场景使用）
- [ ] `npm run build` 通过；改动后端地址/环境变量时已在 README 或部署说明中同步
- [ ] 提交信息符合 Conventional Commits，一次提交只做一件事
- [ ] 文档同步：新增文件、脚本、环境变量、接口变化已更新 `README.md`

---

## 9. 参考

- 前端仓库：<https://github.com/3054664804/calculator-frontend>
- 后端仓库：<https://github.com/3054664804/calculator-backend>
- 项目说明：[README.md](https://github.com/3054664804/calculator-frontend/blob/main/README.md)
- 后端代码规范：<https://github.com/3054664804/calculator-backend/blob/main/codestyle.md>

---

**最后更新：2026-10-02**
