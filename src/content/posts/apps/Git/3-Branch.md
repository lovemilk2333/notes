---
title: Git 分支
published: 2025-09-10
tags: [Git, SVM]
category: app::git
---

## 创建与切换分支
* `git branch` 查看所有分支和当前已激活分支
* `git branch <branch>` 创建一个新分支
* `git checkout <branch>` 切换至指定分支
> 由于 `git checkout` 也可以用于恢复文件, 在 Git >= 2.23 版本, 提供了如下专用命令
* `git switch <branch>` 切换至指定分支 (Git >= 2.23)
> 注意: 在切换分支时, 工作区文件将会按照分支的最新提交被更改  
> 未追踪的文件将不会发生变化  
> 若位于暂存区的更改不会与目标分支冲突, Git 将允许切换分支, 这些更改会保留在新分支的工作区中  
> 否则, Git 将会会阻止分支切换

## 合并分支
* `git merge <branch>` 将 `branch` 合并至当前分支 (**不会**删除 `branch`), 运行会自动产生一次提交, 
* `git log --graph --oneline --decorate --all` 查看分支图


## 删除分支
* `git branch <flag> <branch>` `flag` 为 `-d` 时删除已经完成合并的 `branch`, `-D` 时强制删除 `branch` 无论其是否已被合并

## 分支冲突
若不同分支修改了同一文本文件的同一行 (或修改了同一二进制文件), 则会造成分支冲突

* `git merge <branch>` 自动合并失败后, 会在有冲突的文件内生成类似于如下格式的内容, 届时只要手动修改 (使用编辑器方可) 冲突内容, 后使用 `git add` 添加该文件至暂存区, 提交即可
```diff
<<<<<<< <current_branch>
edition on `current_branch`
=======
edition on `branch`
>>>>>>> <branch>
```
* `git merge --abort` 终止当前的合并, 回退至合并前的当前分支的状态


## 回退和 Rebase
### Rebase
在 `a` 分支上 `git rebase b`, 会将 `a` 分支与 `b` 分支的首个分叉点更新的 (不含分叉点) 所有 `commit` 变基 到 `b` 分支的最新 `commit` 后面  
  
[动画演示参见【GeekHour】一小时Git教程 p18 00:54 - 03:02](https://www.bilibili.com/video/BV1HM411377j?p=18&t=54s)
```
# after
a:5
a:4
b:2
b:1
a:3
a:2
a:1

-- 在 `a` 分支执行 `git rebase b` --

# before
a:5 b:2
a:4 b:1
a:3 /
a:2
a:1
```

### 回退
更详细的笔记参见 [Git 基本使用#回退版本与恢复文件](./0-BasicUseage/#回退版本与恢复文件)
* `git checkout -b <branch> [<commit>]` 恢复至 `branch` 分支的 `commit` 的状态
