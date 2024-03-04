import { defineConfig, DefaultTheme } from 'vitepress'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';

const nav: DefaultTheme.NavItem[] = [
  { text: '主页', link: '/' },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    [
      'link', { rel: 'icon', 'href': '/favicons.svg' }
    ]
  ],
  lang: "zh-CN",
  title: "我的笔记",
  description: "本项目用于备份和公开我的笔记",
  themeConfig: {
    nav,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhuhansan666/notes' }
    ],
    logo: '/favicons.svg'
  },
  vite: {
    plugins: [
      AutoSidebar({
        path: '.',
        titleFromFile: true
      }),
    ]
  },
})
