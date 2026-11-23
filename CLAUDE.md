# wechat-digest 项目规则

## 一句话生成日报（推荐入口）

用户说「继续生成 <日期...> 公众号日报，全文模式」等指令时，**不要再手工逐步调用 fetch.mjs / gen-digest.mjs，也不要把验证码丢回给用户点**。直接运行一键编排器：

```bash
node run-digest.mjs 2026-11-19 2026-11-20 2026-11-21 --full
```

- 出现「全文模式」→ 加 `--full`；出现「不 push / 只本地」→ 加 `--no-push`
- stdout 是 JSON：`DONE` 完成；`ERROR` 报错；`NEEDS_CAPTCHA_VISION`（退出码 10）表示需要你看图点验证码
- 验证码处理（全自动，见 `.workbuddy/skills/wechat-digest/SKILL.md`）：
  1. 用视觉能力打开输出里的 `screenshot` 截图，识别提示词对应的图片与「确定」按钮中心点
  2. `node captcha-solver.mjs click-seq "x,y x,y"`（坐标 = 截图像素坐标 / `scale`）
  3. `node captcha-solver.mjs verify` → `passed: true` 后
  4. `node run-digest.mjs --resume` 继续，直到 `DONE`
- 任务状态可用 `node run-digest.mjs --status` 查看，`--reset` 清空
- 完整工作流说明：`.workbuddy/skills/wechat-digest/SKILL.md`

## Git push 约定

本机（Windows + Git Bash / PowerShell）执行 git push 时，必须使用带 `-C` 参数指定项目路径的形式：

```
git -C C:\Users\suzhiquan\privateProject\wechat-digest push
```

**原因**：2026-08-25 在普通 `cd` 进目录后执行 `git push`，连续报 `Interrupted system call`（exit 126）；改用 `git -C <绝对路径> push` 后一次成功。

**执行要点**：
- 所有 git push / 提交操作优先用 `git -C "完整项目路径" <命令>`，不要先 `cd` 再执行
- push 失败时先换用 `-C` 形式重试，不要反复重试相同命令
