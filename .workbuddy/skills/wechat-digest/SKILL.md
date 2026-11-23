---
name: wechat-digest
description: 生成微信公众号日报（微信读书订阅号聚合）。当用户在 wechat-digest 项目中说「继续生成 YYYY-MM-DD … 公众号日报」「生成 X 月 X 日日报」「全文模式」「补这几天日报」「生成日报并推送」等时使用。自动完成抓取→验证码处理→全文提取→摘要→Markdown→建站→推送全流程，遇腾讯点选验证码时由 WorkBuddy 看图自动点击，无需人工介入。
---

# wechat-digest 一键生成工作流

用户在这个项目里想要「生成某几天的公众号日报」时，**一句话就够**。你要自动跑完全流程，包括验证码——用户不需要也不能再手动点图标。

## 触发识别

用户常见说法：
- 「继续生成 2026-11-19 2026-11-20 2026-11-21 公众号日报，全文模式」
- 「生成 11-22 日报」
- 「补一下昨天的公众号日报」
- 「生成日报，不要 push」（→ 加 `--no-push`）

解析出：**日期列表**（YYYY-MM-DD）、**模式**（出现「全文」→ `--full`，否则默认摘要）、**是否 push**（出现「不 push / 本地」→ `--no-push`）。

## 一句话执行流程（严格遵守）

工作目录：`C:/Users/suzhiquan/privateProject/wechat-digest`，以下 node 命令均在此目录执行。

### 第 1 步：启动一键编排

```bash
node run-digest.mjs <日期...> [--full] [--no-push]
```

用 Bash 工具执行，仔细看 **stdout 的 JSON**（进度日志走 stderr，可以忽略）。可能结果：

- `status: "DONE"` → 跳到第 5 步
- `status: "ERROR"` → 把错误如实告诉用户，停止
- `status: "NEEDS_CAPTCHA_VISION"` 且退出码为 10 → 进入第 2 步（验证码）
- `status: "JOB"` / 提到「已存在任务」 → 先用 `node run-digest.mjs --status` 看状态，再决定是否 `--resume` 或 `--reset` 重来

### 第 2 步：处理验证码（关键，全自动）

第 1 步会输出验证码截图的绝对路径（如 `tmp/captcha-current.png`）、`scale`、`viewportCss`。

1. 用 **ViewImage** 工具打开这个截图（绝对路径），看清两件事：
   - 顶部的 **提示词**（例如「红色沙发」「黄色香蕉」）
   - 九宫格/图片网格里**哪张图符合描述**
2. 算出目标图片**中心点**在**截图上的像素坐标** `(px, py)`；如果验证码有「确定」按钮，也算它的中心点 `(cx, cy)`。
3. 换算成浏览器 CSS 坐标：`x = px / scale`，`y = py / scale`（scale 通常是 1）。
4. 依次点击（图片 → 确定）。用 `click-seq` 一次传入多个点（视口 CSS 坐标）：

```bash
node captcha-solver.mjs click-seq "x1,y1 x2,y2"
```

   例：`node captcha-solver.mjs click-seq "548,370 690,562"`

5. 验证是否已通过：

```bash
node captcha-solver.mjs verify
```

   - stdout 里 `passed: true` / `status: PASSED` → 验证码成功，进入第 3 步
   - `passed: false` → 图片可能已刷新，重新截图再识别：
     ```bash
     node captcha-solver.mjs shot
     ```
     拿到新截图路径，回到本步第 1 点重试（最多重试 3 次；仍失败就如实告诉用户并提供截图路径）
   - 有些验证码点完图后**无需**点确定就自动通过；若 `verify` 已 PASSED，无需再点确定

### 第 3 步：恢复编排

```bash
node run-digest.mjs --resume
```

同样看 stdout：
- `DONE` → 第 5 步
- 又一次 `NEEDS_CAPTCHA_VISION` → 回到第 2 步
- `ERROR` → 如实报告并停止

### 第 4 步：循环

第 2、3 步可重复多次（多个日期可能各自触发验证码）。直到 `status: DONE`。

### 第 5 步：汇报结果

告诉用户：生成了哪些日期、每篇篇数、文件路径 `output/wechat-digest-<日期>.md`、是否已 push。若用了 `--no-push`，提醒用户需要时可让你补 push。

## 重要约束

1. **绝不把验证码丢回给用户点**——必须用 ViewImage 看图 + `click-seq` 自动完成，这是本次改造的核心目标。
2. **坐标一定除以 scale**（截图像素 → 视口 CSS 坐标），否则点击位置偏移。
3. **不要修改** `accounts.txt`、`fetch.mjs` 的抓取逻辑、`gen-digest.mjs` 的摘要逻辑，除非用户明确要求。
4. 若 `verify` 反复失败（3 次以上），停止并说明：可能是验证码类型变化（如滑块）或账号被封，附上截图路径。
5. 验证码处理完必须 `run-digest.mjs --resume`，否则任务卡在 `captcha` 阶段。
6. 任务中断后可用 `node run-digest.mjs --status` 查看进度，`node run-digest.mjs --reset` 清空重来。

## 工具脚本速查

| 脚本 | 作用 |
|------|------|
| `run-digest.mjs` | 主编排器（状态机，可恢复） |
| `captcha-solver.mjs` | 验证码原子操作（prepare/shot/click/click-seq/verify/close） |
| `fetch.mjs` | 抓取（被编排器调用，自动注入 `--no-captcha`） |
| `gen-digest.mjs` | 全文提取 + Claude API 摘要（环境变量自动从 `~/.claude/settings.json` 注入） |
| `build-site.mjs` | 生成静态站点到 `site/` |

## 环境说明

- CDP proxy：`http://localhost:3488`，连用户日常 Chrome（9222），携带微信读书登录态；脚本会自动启动 proxy
- API 配置：`~/.claude/settings.json` 的 `env` 字段（`ANTHROPIC_*`），编排器自动注入，无需用户设置
- git push 用 `git -C "C:/Users/suzhiquan/privateProject/wechat-digest" push`（见 CLAUDE.md）
