# 一段高可读性的同时符合 Python 和 JavaScript 语法的代码
> > 题外话 \
> > 我找 BiliBili 如何跳转到指定评论的历程 ( \
> > <https://www.bilibili.com/opus/560310743264138945> \
> > <https://github.com/the1812/Bilibili-Evolved/issues/690> \
> > <https://www.bilibili.com/opus/257068374085096308> \
> > <https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/comment/list.md>
> 
> <https://www.bilibili.com/video/BV11NoCYmEkP/#reply259337516944>

## BiliBili 跳转到指定评论
打开开发者工具情况下找到请求 `https://api.bilibili.com/x/v2/reply/wbi/main`, 然后在负载页面的 `data.replies` 中筛选目标评论, 其 `rpid` 即为 `目标评论id`

链接则为: `<当前链接>#reply<目标评论id>`

## 代码
```py
1 // 1; """
// JavaScript code
console.log("Hello JavaScript")
/*
"""

# Python code
print("Hello Python!")
print("IN")
print("PY")
# */
```

```js
1 // 1; """
// JavaScript code
console.log("Hello JavaScript")
/*
"""

# Python code
print("Hello Python!")
print("IN")
print("PY")
# */
```
