---
title: Docker commit 简单使用
published: 2025-09-10
tags: [Docker, k8s, container]
category: app::docker
---
> 该命令用于提交现有 container 为镜像, 以便更好的复用和保存数据  
> <https://docs.docker.com/reference/cli/docker/container/commit>

## Basic Usage
`docker container commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]`

```shell
docker commit <container_id> <image_name> [-a <author>] [-m <message>] [-c <change>] [-p pauseContainer? (default: true)]
```

> 若要提交为本地镜像, `image_name` 请置为 `myImage:myTag` 而非 `username/myImage:myTag`

## Example
```shell
docker commit myContainer myImage:myTag
```

## Use local image
1. Run local Docker Registry (at `localhost:5000`)
```shell
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

2. Add the tag to local registry
```shell
docker tag <myImage>[:<myTag>] localhost:<any-port>/<any-name>[:<any-tag>]
```
Your image name: `localhost:5000/<any-name>[:<any-tag>]`

### See Also
> <https://docs.docker.com/reference/compose-file/services/#pull_policy>

```compose
# 从不拉取，如果本地不存在则报错
pull_policy: never
# -----------------------------
# 始终都会拉取
pull_policy: always
# 本地不存在时拉取
pull_policy: missing
# 如果已存在，重构镜像
pull_policy: build
```
