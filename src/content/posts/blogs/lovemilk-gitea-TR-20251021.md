---
title: Lovemilk Gitea 发生重大数据安全事故通报
published: 2025-12-30
tags: [notice, Lovemilk, LovemilkGitea]
category: blog
---

## 过程
### 20251021 162404 (UTC+8)
本人发现 Gitea 网站发送了异常状态码 502, 故连接至服务器检查 Gitea 情况, 发现日志通报 Gitea 主服务无法连接至数据库

### 20251021 162523 (UTC+8)
经过对 Gitea 数据库容器的日志排查后, 发现 `[14] PANIC:  replication checkpoint has wrong magic 8914632 instead of 307747550`, 数据库文件发生损坏

我停止了 crontab 的定时备份服务 (每小时同步的备份)

### 20251021 164813 (UTC+8)
尝试对数据库修复无效, 开始尝试使用每小时同步的备份  
几分钟后, 每小时备份的同步恢复失败, 开始尝试使用 Syncthing 的历史记录备份

### 20251021 172423 (UTC+8)
首次使用 Syncthing 历史记录的较早数据库备份导出 SQL dump 成功, 并清空服务端数据库内容, 并从空白数据库恢复 dump 的 SQL 文件成功, 但由于数据丢失严重, 开始尝试使用更新的数据库备份

1. 由于 Syncthing 历史记录在我本地, 我第一时间禁用了 Syncthing 从服务器同步数据库数据, 以免恢复过程中被覆盖  
同时, 由于 Gitea 使用了 PostgresQL 14, 而我本地软件仓库内仅有最新的 PostgresQL 17, 尝试 docker 跑 14 版本的容器
```sh
sudo docker run --user <uid> --rm -it -p 5432:5432 -v /path/to/database/root:/var/lib/postgresql/data postgres:14
```

2. 本地的 PostgresQL 运行成功 (不 PANIC) 后, 我使用了 PyCharm 连接到数据库, 并使用 `pg_dump` 将整个数据库导出为 SQL 文件

3. 清空数据库文件夹后, 我先运行数据库容器使得其初始化, 后将导出的 SQL 文件以如下方式恢复
```sh
cat /path/to/dumped.sql | docker exec -e PGPASSWORD=<password> -i <container-name> \
  psql -U <username> -d <dbname> -h localhost
```

### 20251021 173644 (UTC+8)
使用 Syncthing 最近一个月数据库备份恢复成功, 但由于数据丢失仍然严重, 开始尝试使用更新的数据库备份

(步骤同上)

### 20251021 175311 (UTC+8)
使用 Syncthing 最新的数据库备份恢复成功, 受影响仓库减少到 1 个

(步骤同上)

### 20251021 180000 (UTC+8)
Gitea 服务恢复, 但仓库 `lovemilk-race/vue-zz039-0926-timesmode` 显示 404 页面, 无法正常读取

同时恢复 crontab 的定时备份服务

### 20251021 183536 (UTC+8)
经商讨, 现已将在备份的位于固态硬盘数据库作为主要数据库存储位置, 并将机械硬盘作为备份, Syncthing 也将同步固态硬盘数据库

## 原因分析
貌似因为机械硬盘敲盘, 造成 PostgresQL 数据库的某块文件发生损坏

### 20251230 (UTC+8) 补
2025年12月26日 UTC+8, 本人尝试彻底解决该硬盘问题.

半小时后, 本人最终确认硬盘并非因自身原因, 而是 SATA 数据连接线出现问题导致硬盘频繁断链或挂载无效, 故更换了 SATA 数据连接线

两小时后, `smartctl` 的 long test 成功 (先前总会被未知原因 Abort 该测试), 测试显示硬盘无异常情况

最终基本上确认了 "硬盘问题" (实质上并非为硬盘问题) 由 SATA 数据连接线导致


## 预防故障
1. 未来资金充裕时, 使用 RAID 阵列作为数据库存储位置进行透明备份
2. 使用多个数据库存储后端热备, 待某数据库出现故障时迁移到其他数据库后端
