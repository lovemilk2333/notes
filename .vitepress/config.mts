import { defineConfig, DefaultTheme } from 'vitepress'
import { extname } from 'path'
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar';
import footnotePlugin from "markdown-it-footnote";

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
  title: "牛奶の笔记",
  description: "本项目用于备份和公开牛奶の笔记",
  themeConfig: {
    nav,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhuhansan666/notes' }
    ],
    logo: '/favicons.svg'
  },
  markdown: {  // 支持脚注
    config(md) {
        md.use(footnotePlugin)
    },
  },
  srcDir: './contents/',
  vite: {
    plugins: [
      AutoSidebar({
        ignoreList: ['node_modules', '.vitepress', '.github', '.git', 'public'],
        path: './contents/',
        // titleFromFile: true,
        sideBarItemsResolved(data) {
          const res: DefaultTheme.SidebarItem[] = []

          for (let file of data) {
            let name = file.link?.toLocaleLowerCase() ?? '.md.html'
            let ext = extname(name.endsWith('.html') ? name.slice(0, -5) : name)
            if (!['', '.html', '.md', '.markdown'].includes(ext)) {
              continue
            }

            res.push(file)
          }

          return res
        }
      }),
    ]
  },
})
