# 处理端口位于域名中的反向代理

## 解决
```Caddyfile
*.your.domain.com {
    @subdomain {
        header_regexp Host ^(?P<port>\d+)\.your\.domain\.com(?::\d+)?$
    }
    
    handle @subdomain {
        reverse_proxy <target-ip>:{http.regexp.port}
    }
}
```

::: warning 注意
Code Server 会自动处理 Host 为 `<port>.your.domain.com` 的请求, 不需要手动设置路径 `/proxy/<port>`, 直接将 `*.your.domain.com` 反代至 Code Server 的主页面的端口即可  
:::

::: danger 危险
使用 Code Server 自带的反代的 CPU 使用率会很高, 特别是在 J1800 等低端设备上
:::
