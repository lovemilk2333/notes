# Jellyfin DOCKER 部署教程及后续问题修复方法

## 1. 按照 [官方文档](https://jellyfin.org/docs/general/installation/container/#docker) 部署

## 2. 修复局域网客户端只能访问第一次
1. 使用网页到服务端控制台
2. 转到 `网络` 选项 (URL 后缀为 `#/dashboard/networking`)
3. 将 `服务器地址设置` 的 `本地网络地址` 和 `局域网` 改为 容器的外部地址 (局域网地址) <br>
    例如我这里修改为 `192.168.255.3`
