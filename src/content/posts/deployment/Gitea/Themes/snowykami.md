---
title: "部署 Gitea 主题: `snowykami` 和 `liteyuki-magipoke`"
published: 2025-09-10
tags: [Gitea, Git, Themes, UI, GUI]
category: deployment::gitea::themes
permalink: { base: https://aka.lovemilk.top/t/giteatheme/snowykam, placeholder: false }
---

> 主题项目仓库地址: <https://github.com/snowykami/gitea-themes>

## 复制文件

将上述仓库的 `data/custom` 下所有文件或目录复制至 `$GITEA_CUSTOM` 所指向的目录, 形成如下目录结构 (`...` 代表其他文件或目录)

> 如果是默认配置的 docker 部署, 则位于 container 内部的 `/data/gitea` (直接复制至 `</data映射的路径>/gitea` 即可)

```tree
.
├── git
│   └── ...
├── gitea
│   ├── public  # 仓库的 `data/custom/public` 文件夹
│   ├── templates  # 仓库的 `data/custom/templates` 文件夹
│   ├── conf
│   │   └── app.ini  # 下一步要修改的配置文件
│   └── ...
└── ssh
    └── ...
```

> 上述目录结构为 docker container 内部的 `/data` 映射文件夹的 `tree`, 其他方式部署的 Gitea 应保证 ` $GITEA_CUSTOM` 所指向目录的结构与上述 `gitea/` 目录下结构相同

## 修改配置文件 (位于 `$GITEA_CUSTOM/conf/app.ini`)

在 `ui.THEMES` 添加 `snowykami,liteyuki-magipoke`, 如果没有安装其他第三方主题, 复制粘贴如下内容即可

```ini
[ui]
THEMES = snowykami,liteyuki-magipoke,gitea-auto,gitea-light,gitea-dark
# 可选, 修改为你想要的默认主题 (liteyuki-magipoke 为蓝色系, snowykami 为粉色系)
DEFAULT_THEME = liteyuki-magipoke
```

## 重启 Gitea 即可应用配置

# 修改主题

## 禁用单击弹出文字

按照 HTML 格式删除 `templates/base/head.tmpl` 中的 64-113 行

> 如文件有变动请删除文件内 `// 创建雪花容器` 所在函数 即可禁用

## 修改页脚

按照 HTML 格式修改 `templates/base/footer_content.tmpl`
