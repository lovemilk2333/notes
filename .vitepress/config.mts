import { defineConfig, DefaultTheme } from 'vitepress'
import { extname } from 'path'
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
        ignoreList: ['node_modules', '.vitepress', '.github', '.git', 'public'],
        path: '.',
        titleFromFile: true,
        sideBarItemsResolved(data) {
          const res: DefaultTheme.SidebarItem[] = []

          for (let file of data) {
            let name = file.link?.toLocaleLowerCase() ?? '.md.html'
            let ext = extname(name.endsWith('.html') ? name.slice(0, -5) : name)
            console.log(file, ext)
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
