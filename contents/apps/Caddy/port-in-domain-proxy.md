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
