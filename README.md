# 计算器 · 前端（calculator-frontend）

前后端分离计算器系统的**前端仓库**：Vue 3 + Vite + axios 实现界面、表达式拼接与后端调用。

> **核心约束：前端零计算。**
> 前端只做两件事 —— 把用户点出来的字符**拼成表达式字符串**，再把字符串 `POST /api/calculate` 交给后端；
> 所有数值结果、历史条数、时间显示所需的一切数值，全部来自后端响应。
> 关掉后端服务，前端只会显示"无法连接后端服务"，**永远算不出新结果**。

| 仓库 | 地址 |
| --- | --- |
| 前端（本仓库） | <https://github.com/3054664804/calculator-frontend> |
| 后端 | <https://github.com/3054664804/calculator-backend> |
| 前端代码规范 | <https://github.com/3054664804/calculator-frontend/blob/main/codestyle.md> |
| 后端代码规范 | <https://github.com/3054664804/calculator-backend/blob/main/codestyle.md> |

---

## 1. 项目简介

- **定位**：计算器的"壳"。输入区、键盘区、历史面板、主题切换、Toast 提示、后端状态灯全部在前端；真正算数的是后端 FastAPI + `asteval`，历史写在 SQLite。
- **数据流（严格单向）**：

```text
用户点击按键 / 敲键盘
        ↓  仅字符串拼接（appendToken / backspace / toggleSign）
   expression: string
        ↓  POST /api/calculate { expression }
   后端 asteval 求值 + 写 SQLite
        ↓  { success, data: { expression, result, elapsed_ms } }
   界面显示 result ← 完全来自响应体
        ↓  触发 calculated 事件
HistoryPanel.load() → GET /api/history → 重新渲染列表
```

- **不做的事**：不做四则运算、不做括号匹配求值、不做 `%`/`^` 的本地计算、不在前端保存历史、不对历史做相对时间换算。

---

## 2. 作业硬性规则对照表

| # | 作业硬性规则 | 实现位置 | 具体做法 |
| --- | --- | --- | --- |
| 1 | **前端零计算**：不允许出现表达式求值 | 全仓库（尤其 `src/composables/useCalculator.js`、`src/utils/format.js`） | 源码中没有任何 `Math.*` 数值运算、`parseFloat` / `parseInt` / `Number(...)` 数值转换、`eval` / `new Function`；唯一的 `Number` 用法是 `Number.isNaN(date.getTime())` 的**类型判断** |
| 2 | 只做**表达式字符串拼接** | `src/composables/useCalculator.js` | `appendToken` 用 `+=` 与 `slice()` 拼接字符串；`backspace` 用 `slice(0, -1)` 删字符；`toggleSign` 用正则把末尾数字包成 `(-数字)` 或还原，是**字符串替换**而非取负运算；`clearAll` 置空字符串 |
| 3 | 只调 API 得到结果 | `src/api/calculator.js` → `src/api/client.js` | `evaluate()` 只做 `await calculateApi(submitted)`，把 `payload.data.result` 写进 `result.value` 显示；`elapsedMs` 也来自后端的 `elapsed_ms` |
| 4 | 关掉后端后前端算不出新结果 | `src/composables/useCalculator.js` + `src/api/client.js` | 请求失败时 `normalizeError` 返回 `NETWORK_ERROR`，`evaluate()` 把 `result` 清空并只显示错误文案；状态灯变红 |
| 5 | 历史必须后端持久化 | `src/composables/useHistory.js` → `GET /api/history` | 前端不落任何历史数据：`load()` 每次向后端取列表，删除后**重新拉取**而不是本地减总数；唯一使用 `localStorage` 的地方是 `src/composables/useTheme.js`，只存主题偏好（与计算历史无关） |
| 6 | 一键贡献/可验证 | 本 README 第 7 节 | 给出可复制的 `grep` 命令，直接证明"搜不到表达式计算" |
| 7 | 统一错误结构 | `src/api/client.js` 的 `normalizeError` | 后端失败响应统一是 `{"success": false, "error": {"code", "message"}}`，`normalizeError` 取出为 `{ code, message, status }`，再经响应拦截器 `Promise.reject` 抛出，组件只消费 `error.message` |

**"关掉后端"现场演示脚本**

1. 打开页面，Header 状态灯显示绿色「后端在线」；输入 `3*(2+5)-4/2`，点 `=`，结果区出现 `19`（由 `POST /api/calculate` 返回）。
2. 关闭后端进程（结束 uvicorn / 停掉 Render 服务）。
3. 在输入框里继续输入 `1+1`，点 `=`：
   - 结果区**不会**出现 `2`，而是红色提示「无法连接后端服务：计算功能不可用（历史记录仍可查看）」；
   - 状态灯在 30 秒心跳（`HEARTBEAT_INTERVAL_MS`）后转为红色，也可点状态灯立即重测 `GET /api/health`；
   - 已加载的历史列表仍然可见（那是上一次后端返回的数据），但刷新历史会同样报错。

---

## 3. 技术栈

| 分类 | 选型 | 版本（`package.json`） | 用途 |
| --- | --- | --- | --- |
| 框架 | `vue` | `^3.5.13` | 全部使用 `<script setup>` 组合式 API |
| 构建 | `vite` | `^5.4.11` | 开发服务器、`/api` 代理、生产构建 |
| 插件 | `@vitejs/plugin-vue` | `^5.2.1` | 编译 `.vue` 单文件组件 |
| 网络 | `axios` | `^1.7.9` | 唯一 HTTP 客户端，实例集中在 `src/api/client.js` |
| 后端（另一个仓库） | FastAPI + asteval + SQLite | — | 表达式求值与历史持久化 |

npm 脚本：

| 脚本 | 命令 | 说明 |
| --- | --- | --- |
| `npm run dev` | `vite` | 开发服务器，127.0.0.1:5173，启用 `/api` 代理 |
| `npm run build` | `vite build` | 产物输出到 `dist/`（`sourcemap: false`，`chunkSizeWarningLimit: 800`） |
| `npm run preview` | `vite preview --port 4173` | 本地预览构建产物 |
| `npm run lint` | `eslint src --ext .js,.vue` | 预留的 lint 入口，需自行安装 `eslint` 及相关插件后使用 |

---

## 4. 目录结构

```text
calculator-frontend/
├── index.html                  # 单页入口：首屏骨架 (#app-loading) + 挂载 /src/main.js
├── package.json                # 依赖与 npm 脚本（dev / build / preview / lint）
├── vite.config.js              # @ 别名、5173 开发端口、/api → http://127.0.0.1:8000 代理、4173 预览端口
├── vercel.json                 # Vercel 部署配置：framework=vite、输出 dist、静态资源长缓存
├── .env.example                # 环境变量模板：VITE_API_BASE_URL 的含义与填写示例
├── .env.development            # 开发环境变量：VITE_API_BASE_URL 留空，走 vite 代理
├── .gitignore                  # 忽略 node_modules / dist / .npm-cache / *.local 等
├── public/
│   └── favicon.svg             # 站点图标，被 index.html 引用
└── src/
    ├── main.js                 # 应用入口：createApp(App).mount('#app')，引入全局样式
    ├── App.vue                 # 根组件：布局 + 事件串联（calculated → 刷新历史，reuse → 回填表达式）
    ├── api/
    │   ├── client.js           # axios 实例、API_BASE_URL、normalizeError 统一错误结构
    │   └── calculator.js       # 5 个后端接口的封装（calculate/history/delete/clear/health）
    ├── components/             # 8 个展示型组件
    │   ├── AppHeader.vue       # 顶部栏：品牌、后端状态灯、仓库链接、主题切换按钮
    │   ├── AppToast.vue        # 右下角消息浮层容器（TransitionGroup 进出动画）
    │   ├── CalculatorPanel.vue  # 计算区：组装显示屏 + 键盘，绑定全局键盘快捷键
    │   ├── DisplayBoard.vue    # 显示屏：可编辑表达式输入框 + 结果/错误/耗时展示
    │   ├── KeyButton.vue       # 单个按键：只负责外观与 @press 事件
    │   ├── KeyPad.vue          # 键盘区：按 KEYPAD_ROWS 渲染 5×5 按键网格
    │   ├── HistoryPanel.vue    # 历史面板：搜索、刷新、清空、空状态，暴露 load()
    │   └── HistoryItem.vue     # 单条历史：表达式/结果/时间/复制/回填/两步确认删除
    ├── composables/            # 5 个组合式函数
    │   ├── useCalculator.js    # 表达式字符串状态与 evaluate()，纯拼接 + 调后端
    │   ├── useHistory.js       # 历史列表状态、搜索防抖、删除、清空
    │   ├── useTheme.js         # 深浅主题切换，偏好存 localStorage，写 html[data-theme]
    │   ├── useBackendStatus.js # 健康检查 + 30 秒心跳，维护 checking/online/offline
    │   └── useToast.js         # 轻量 Toast 队列（crypto.randomUUID 生成 key 并定时消失）
    ├── constants/
    │   ├── keypad.js           # KEYPAD_ROWS 键盘布局与 KEYBOARD_VALUE_MAP 物理键盘映射
    │   └── links.js            # GITHUB_USER 与 REPO_LINKS 仓库/规范外链
    ├── utils/
    │   └── format.js           # 展示层格式化：ISO 时间本地化、表达式与结果截断（不做任何计算）
    └── styles/
        └── main.css            # 全局样式入口：设计令牌（CSS 变量）、重置、页面骨架、card/btn 复用类
```

> 统计：8 个组件、5 个 composable、2 个 api 模块、2 个 constants 模块、1 个 utils 模块。

---

## 5. 快速开始

### 5.1 前置条件

- Node.js ≥ 18（Vite 5 要求）
- 后端仓库已在本机 `http://127.0.0.1:8000` 运行（仅 `npm run dev` 的开发代理需要）

### 5.2 安装与运行

```bash
# 1) 安装依赖
npm install

# 2) 启动开发服务器（默认 http://127.0.0.1:5173）
npm run dev

# 3) 生产构建，产物在 dist/
npm run build

# 4) 本地预览构建产物（http://127.0.0.1:4173）
npm run preview
```

### 5.3 开发代理说明（重要）

`vite.config.js` 中配置了代理：

```js
server: {
  port: 5173,
  host: '127.0.0.1',
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
},
```

因此开发环境下：

- `.env.development` 里 `VITE_API_BASE_URL` **留空**，`src/api/client.js` 的 `API_BASE_URL` 为空串，axios 发出**相对路径**请求（如 `/api/calculate`）；
- 相对路径被 Vite dev server 代理到 `http://127.0.0.1:8000`，浏览器视角下前后端同源，**本地开发不依赖 CORS 配置**；
- 代理只在 `npm run dev` 下生效。`npm run preview` 与线上静态部署没有这层代理，必须通过 `VITE_API_BASE_URL` 直连后端。

---

## 6. 环境变量

| 变量 | 作用域 | 是否必需 | 说明 |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | 构建期注入（`import.meta.env`） | 生产环境**必需** | 后端 API 基地址。留空 = 使用相对路径（仅开发代理场景正确）；生产环境必须填写后端公网地址 |

读取逻辑（`src/api/client.js`）：

```js
/** 去掉结尾多余斜杠，避免拼出 //api/calculate */
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
```

各环境取值：

| 文件 / 场景 | 取值 | 结果 |
| --- | --- | --- |
| `.env.development`（提交到仓库） | `VITE_API_BASE_URL=`（空） | 走 Vite `/api` 代理 |
| `.env.example`（模板，提交到仓库） | `VITE_API_BASE_URL=` | 复制为 `.env.local` 后填写 |
| `.env.local`（本地，已被 `.gitignore` 忽略） | `http://127.0.0.1:8000` | 开发时绕过代理直连后端 |
| Vercel 环境变量（Production） | `https://<你的后端域名>` | 线上直连后端，例如 `https://calculator-backend-xxxx.onrender.com` |

注意事项：

- Vite 只暴露 `VITE_` 前缀的变量，且是**构建期**注入 —— 改完环境变量必须**重新构建/重新部署**才生效；
- 末尾多余斜杠会被自动去掉，`https://api.example.com/` 与 `https://api.example.com` 等价；
- 不要把后端密钥写进前端变量：任何 `VITE_*` 都会打进 `dist/` 产物，公开可见。

---

## 7. "前端零计算"的自证方法

在仓库根目录逐条执行，输出应当与"结论"列一致。命令同时给出 Git Bash / macOS / Linux（`grep`）与 Windows PowerShell（`Select-String`）两种写法。

**① 禁用 API：应当搜不到任何有效调用**

```bash
# Git Bash / macOS / Linux
grep -rnE 'Math\.|parseFloat|parseInt|eval\s*\(|new Function' src/
```

```powershell
# Windows PowerShell
Get-ChildItem -Recurse src -Include *.js,*.vue |
  Select-String -Pattern 'Math\.|parseFloat|parseInt|eval\s*\(|new Function'
```

- 结论：仅命中 `src/composables/useCalculator.js`、`src/composables/useToast.js` 的**文件头注释**（注释里在声明"没有这些东西"），业务代码零命中。

**② 数值转换：应当只剩一处类型判断**

```bash
grep -rn 'Number(' src/
```

- 结论：只命中 `src/utils/format.js:13` 的 `Number.isNaN(date.getTime())` —— 判断日期是否合法（返回布尔值），不做任何数值转换。项目里**没有** `Number(x)`、`parseFloat`、`parseInt` 的调用。

**③ 运算符：应当只有索引运算与字符串拼接**

```bash
grep -rnE '[-+*/%^]' src/
```

- 结论：命中项全部是合法用法：
  - `src/composables/useCalculator.js` 里的 `expression.value.length - 1`、`current.length - trailing[0].length`（**字符串下标**运算，操作对象是字符串长度）；
  - `src/utils/format.js`、`src/constants/links.js` 的 `'2-digit'`、`https://`（模板字符串 / 字面量内部字符）；
  - `src/api/*.js` 的 `'/api/...'` 路径字符串。
  - **没有任何**对表达式或结果做的 `+ - * / % ^` 算术。

**④ 求值入口：全项目只允许一个**

```bash
grep -rn 'calculate' src/ | grep -v '//'
```

- 结论：只有 `src/api/calculator.js` 的 `calculate(expression)`（`POST /api/calculate`）与 `src/composables/useCalculator.js` 的 `evaluate()` 调用它，没有第二处"本地求值"分支。

**⑤ 顺手确认历史没有落前端**

```bash
grep -rn 'localStorage\|sessionStorage\|indexedDB' src/
```

- 结论：只命中 `src/composables/useTheme.js`，存的 key 是 `'calculator-theme'`，只保存**主题偏好**；历史记录一律走后端 `GET /api/history`。

### 7.1 为什么 `src/utils/format.js` 不做"3 分钟前"这种相对时间

文件头注释已经写明了原因，这里展开说明：

```js
/**
 * 注意：这里**只做文本展示格式化**，不做任何数学计算。
 * 也不做"3 分钟前"这类相对时间，因为那需要在前端做时间减法 —— 违反
 * "前端不做计算"的约束，所以时间统一由后端给出 ISO 字符串后直接本地化显示。
 */
```

- 相对时间必然要算 `Date.now() - new Date(created_at)`，再除以 60000、取整、比阈值 —— 这是**时间减法与除法**，属于前端计算，会直接破坏"前端零计算"这条硬性约束；
- 而且它会让同一份历史在不同客户端显示不一致（浏览器时钟不准就会算出"负数分钟"），可复现性差；
- 现在的做法：后端返回 ISO 字符串（`created_at`），前端只调用平台内建的本地化 API：

```js
return date.toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
})
```

- `truncateExpression` / `truncateResult` 同理：只做 `value.length <= maxLength` 的**长度比较**与 `slice()` 截断，最后拼一个省略号 `…`，不做宽度/数值计算。想要"相对时间"这种体验，应当由后端新增字段（例如 `created_at_human`）来提供。

---

## 8. 后端 API 契约

- 基地址：`VITE_API_BASE_URL`（开发留空 + Vite `/api` 代理；生产填后端公网地址）。
- 请求头：`Content-Type: application/json`（由 `src/api/client.js` 的 axios 实例统一设置），超时 20 秒。
- 成功响应统一为 `{ "success": true, "data": ... }`；前端各 API 函数 `.then((response) => response.data)` 后直接取 `payload.data`。

### 8.0 统一错误结构

后端所有失败响应都应形如：

```json
{
  "success": false,
  "error": {
    "code": "ILLEGAL_CHARACTER",
    "message": "表达式包含非法字符：'a' 'b' 'c'；仅支持数字、小数点、+ - * / ( ) % ^ 和空格"
  }
}
```

`src/api/client.js` 的 `normalizeError` 会把它归一化为前端内部结构：

| 场景 | 判定依据 | 归一化结果 |
| --- | --- | --- |
| 后端返回结构化错误 | 响应体含 `error.{code,message}` | `{ code: detail.code \|\| 'HTTP_' + status, message: detail.message \|\| '请求失败（HTTP ' + status + '）', status }` |
| 后端返回非结构化错误（如 FastAPI 422 校验失败） | 响应体无 `error` 字段 | `{ code: 'HTTP_422', message: '请求失败（HTTP 422）', status: 422 }` |
| 请求超时 | axios `error.code === 'ECONNABORTED'` | `{ code: 'TIMEOUT', message: '请求超时：后端服务响应过慢，请稍后重试', status: 0 }` |
| 网络不可达 / 后端离线 | 无 `response` | `{ code: 'NETWORK_ERROR', message: '无法连接后端服务：计算功能不可用（历史记录仍可查看）', status: 0 }` |

响应拦截器把这套结构 `Promise.reject` 出去，因此组件里 `catch (error)` 拿到的 `error.message` 已经是**可直接展示的中文文案**。

### 8.1 `POST /api/calculate` — 计算表达式并写库

- 前端调用：`calculate(expression)`（`src/api/calculator.js`）
- 触发点：点击 `=`、输入框回车、键盘 `Enter` / `=`（`src/components/CalculatorPanel.vue`）

请求：

```http
POST /api/calculate
Content-Type: application/json
```

```json
{ "expression": "3*(2+5)-4/2" }
```

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": {
    "expression": "3*(2+5)-4/2",
    "result": "19",
    "elapsed_ms": 0.42
  }
}
```

前端消费的字段：

| 字段 | 前端用途 |
| --- | --- |
| `data.result` | 写入 `result` 与 `lastAnswer`（显示屏结果区、`Ans` 键回插、左上角 `Ans = …`） |
| `data.expression` | 成功 Toast 文案「后端计算完成：… = …」 |
| `data.elapsed_ms` | 显示屏「后端耗时 N ms」；用 `?? null` 兜底，字段缺失时不显示 |

失败响应示例（HTTP 400，例如把表达式换成 `1/0`）：

```json
{
  "success": false,
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "除数不能为 0"
  }
}
```

前端表现：`result` 清空、`errorMessage` 设为 `error.message`，显示屏边框变红并展示该文案。

### 8.2 `GET /api/history` — 查询历史

- 前端调用：`fetchHistory({ keyword, limit, offset })`
- 触发点：面板 `onMounted`、每次计算成功、点击「刷新」、搜索框输入（300ms 防抖 `SEARCH_DEBOUNCE_MS`）、删除成功后重新拉取
- 查询参数：`keyword`（可选，前端传 `keyword.trim() || undefined`，空白即不传）、`limit`、`offset`（当前组件未传，留给后端默认值与后续分页）

请求：

```http
GET /api/history?keyword=100
```

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "expression": "100/4",
      "result": "25",
      "created_at": "2026-10-02T09:31:20.512000"
    },
    {
      "id": 11,
      "expression": "100*3",
      "result": "300",
      "created_at": "2026-10-02T09:29:04.101000"
    }
  ],
  "total": 2
}
```

前端消费的字段：

| 字段 | 前端用途 |
| --- | --- |
| `data[]` | 整个赋给 `records`，用于渲染 `HistoryItem` 列表 |
| `data[].id` | `:key`、`#id` 展示、删除请求路径 |
| `data[].expression` | 列表展示（`truncateExpression` 截断）、复制、回填表达式 |
| `data[].result` | 列表展示（`truncateResult` 截断）、复制 |
| `data[].created_at` | 经 `formatDateTime` 本地化为 `YYYY/MM/DD HH:mm:ss` |
| `total` | 标题「共 N 条」与 `hasRecords`（`> 0`，仅比较不做运算），**不在前端做加减** |

失败/后端离线：`records` 置空、`total` 置 0，并通过 `onError` 抛出错误 Toast。

### 8.3 `DELETE /api/history/{id}` — 删除单条历史

- 前端调用：`removeHistoryRecord(recordId)`
- 触发点：`HistoryItem` 的「删除 → 确认删除」两步操作

请求：

```http
DELETE /api/history/12
```

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": {
    "id": 12,
    "expression": "100/4"
  }
}
```

前端消费 `data.expression` 生成 Toast「已删除：100/4」，随后**重新调用 `load()`** 让服务端返回权威列表。

### 8.4 `DELETE /api/history` — 清空历史（扩展功能）

- 前端调用：`clearAllHistory()`
- 触发点：历史面板「清空历史 → 确认清空」（同样两步确认）

请求：

```http
DELETE /api/history
```

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": {
    "deleted_count": 27
  }
}
```

前端消费 `data.deleted_count` 生成 Toast「已清空 27 条历史记录」，并把 `records` 置空、`total` 置 0（值直接取自响应，不在前端累减）。

### 8.5 `GET /api/health` — 健康检查（扩展功能）

- 前端调用：`fetchHealth()`
- 触发点：应用挂载时、每 30 秒心跳（`HEARTBEAT_INTERVAL_MS`）、点击顶部状态灯、每次计算成功后

请求：

```http
GET /api/health
```

成功响应（HTTP 200）：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "database": "ok"
  }
}
```

前端消费的字段：`data.version` 用于状态灯尾部显示 `v1.0.0`（`App.vue` 中 `backendInfo?.version || ''`，字段缺失则不显示）。其余字段前端不依赖，后端可自由扩展。

前端表现：请求失败 → `status = 'offline'`，状态灯变红；成功 → `'online'`，状态灯变绿。

---

## 9. Vercel 部署

### 9.1 `vercel.json` 说明

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

| 字段 | 作用 |
| --- | --- |
| `framework: "vite"` | 告诉 Vercel 按 Vite 预设处理（含 SPA 回退到 `index.html`） |
| `buildCommand: "npm run build"` | 构建命令，与本地一致 |
| `outputDirectory: "dist"` | 与 `vite.config.js` 的 `build.outDir` 一致 |
| `installCommand: "npm install"` | 依赖安装命令 |
| `headers` | 给带内容哈希的 `/assets/*` 加一年期不可变缓存，加速二次访问 |

> 部署后**没有** Vite 的 `/api` 代理，`/api/*` 请求会打到 Vercel 自己；必须靠下面的 `VITE_API_BASE_URL` 直连后端。

### 9.2 部署步骤

1. 确认后端已部署且可从公网访问（例如 Render），记录其 HTTPS 地址，形如 `https://calculator-backend-xxxx.onrender.com`。
2. 打开 <https://vercel.com/new>，选择 GitHub 仓库 `3054664804/calculator-frontend` 导入。
3. Framework Preset 选 **Vite**，Root Directory 保持仓库根目录，Build / Output 与 `vercel.json` 一致（Vercel 会自动读取）。
4. 在 **Environment Variables** 中添加：
   - Key：`VITE_API_BASE_URL`
   - Value：后端公网地址，例如 `https://calculator-backend-xxxx.onrender.com`（**不要**带结尾 `/`）
   - 环境：勾选 Production（如需 Preview 环境也能连通后端，一并勾选 Preview）
5. 点击 Deploy，等待构建完成，访问分配的 `https://<项目名>.vercel.app`。
6. 验证：
   - 页面顶部状态灯为绿色「后端在线」；
   - 输入 `2+3*4` 点 `=` 得到后端返回的结果，历史里出现新记录；
   - 浏览器 DevTools → Network 中 `/api/calculate` 的请求地址是后端域名而非 Vercel 域名。
7. 之后若修改 `VITE_API_BASE_URL`，需在 Vercel 上 **Redeploy** 才会生效（构建期注入）。

---

## 10. 常见问题（FAQ）

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 状态灯红色「后端离线」，点 `=` 只报「无法连接后端服务」 | 后端未启动 / 地址填错 / 后端休眠（Render 免费实例会冷启动） | 这是**预期行为**（前端零计算）。启动后端到 `127.0.0.1:8000`，或核对 `VITE_API_BASE_URL`；状态灯可点击立即重测，稍等冷启动完成再试 |
| 开发环境请求 404 / 502 | 后端没跑在 `127.0.0.1:8000`，Vite 代理无目标 | 启动后端（默认 8000 端口）；若后端换了端口，同步修改 `vite.config.js` 的 `proxy['/api'].target` 后重启 `npm run dev` |
| 线上部署后请求发到了 Vercel 域名，报 404 | 生产环境没有 Vite 代理，且 `VITE_API_BASE_URL` 为空或未配置 | 在 Vercel 配置 `VITE_API_BASE_URL` 为后端公网地址，并 Redeploy |
| 浏览器控制台出现 CORS 报错（`No 'Access-Control-Allow-Origin'`） | 生产环境跨域直连后端，后端未放行前端域名 | 在后端配置 CORS 允许前端来源（含 Vercel 域名）；开发环境用代理即可绕开，无需配置 |
| 改完 `.env` 变量没生效 | Vite 变量是构建期注入 | 重启 `npm run dev`；线上需重新构建 / Redeploy |
| 历史记录为空 | 还没有成功计算过（失败请求不写库）；或搜索关键字过滤掉了全部记录；或后端数据库被重建 | 清空搜索框后点「刷新」；确认后端能正常 `POST /api/calculate`；查看后端 SQLite 数据文件 |
| 历史里有记录，但刷新页面就没了 | 后端数据库是临时存储（容器重建、免费实例磁盘不持久） | 属于后端部署问题：为后端挂载持久磁盘或使用持久化数据库 |
| 点 `=` 提示「请求超时」 | 后端响应超过 20 秒（axios `timeout: 20000`），多为后端冷启动 | 稍后重试；如需更久可调整 `src/api/client.js` 的 `timeout` |
| 复制按钮提示「复制失败，请手动选中文字复制」 | 非 HTTPS 环境或浏览器禁用了 `navigator.clipboard` | 用 HTTPS / `localhost` 访问，或手动选中文本复制 |
| 中文输入法/搜索框里打字，表达式框跟着变 | 全局键盘监听会拦截按键 | 已处理：焦点在 `input`/`textarea` 时除表达式框回车外一律不介入；若仍复现请检查是否改动了 `CalculatorPanel.vue` 的 `handleKeydown` |
| `npm run lint` 报找不到 eslint | `package.json` 未内置 eslint 依赖（当前仅有脚本入口） | 按需安装 `eslint`、`eslint-plugin-vue` 等依赖后使用；编码规范见 [codestyle.md](https://github.com/3054664804/calculator-frontend/blob/main/codestyle.md) |

---

## 11. 相关链接

- 前端仓库：<https://github.com/3054664804/calculator-frontend>
- 后端仓库：<https://github.com/3054664804/calculator-backend>
- 前端代码规范：[codestyle.md](https://github.com/3054664804/calculator-frontend/blob/main/codestyle.md)
- 后端代码规范：<https://github.com/3054664804/calculator-backend/blob/main/codestyle.md>

---

**最后更新：2026-10-02**
