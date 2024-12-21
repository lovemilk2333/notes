# 修复 VSCode 中, `zsh` 终端无法找到某些从 `.zshrc` 中加载的命令

## 问题
本人在使用 `nvm` 安装的 `Node.JS` 的包管理器 `pnpm` 在 VSCode 中调试时, 发现环境变量没有被加载造成 `pnpm` 可执行文件无法被找到

## 修复
在 `zsh` 的 Shell Profile 中的 `args` 参数添加 `["-l", "-i"]` (`-i` 更为重要) 即可解决
> 参见 <https://github.com/microsoft/vscode/issues/143061#issuecomment-1042785423>
