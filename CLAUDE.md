# wechat-digest 项目规则

## Git push 约定

本机（Windows + Git Bash / PowerShell）执行 git push 时，必须使用带 `-C` 参数指定项目路径的形式：

```
git -C C:\Users\suzhiquan\privateProject\wechat-digest push
```

**原因**：2026-08-25 在普通 `cd` 进目录后执行 `git push`，连续报 `Interrupted system call`（exit 126）；改用 `git -C <绝对路径> push` 后一次成功。

**执行要点**：
- 所有 git push / 提交操作优先用 `git -C "完整项目路径" <命令>`，不要先 `cd` 再执行
- push 失败时先换用 `-C` 形式重试，不要反复重试相同命令
