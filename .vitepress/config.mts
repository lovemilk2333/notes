import { defineConfig, DefaultTheme } from 'vitepress'
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import AutoSidebarPlugin from 'vitepress-auto-sidebar-plugin'
import footnotePlugin from "markdown-it-footnote";

const nav: DefaultTheme.NavItem[] = [
  { text: '主页', link: '/' },
]

const rootPath = './contents/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    [
      // Microsoft Clarity
      'script', { type: 'text/javascript' }, `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "my2muxb80z");`
    ],
    [
      // Google Analytics
      'script', { async: 'true', src: 'https://www.googletagmanager.com/gtag/js?id=G-V7BNXRCZVT' }, ``
    ],
    [
      // Google Analytics also
      'script', { type: 'text/javascript' }, `window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-V7BNXRCZVT');`
    ],
  ],
  lang: "zh-CN",
  title: "牛奶の笔记",
  description: "本项目用于备份和公开牛奶の笔记",
  themeConfig: {
    nav,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lovemilk2333/notes' }
    ],
    logo: '/favicons.svg'
  },
  markdown: {
    math: true,  // 支持数学公式
    lineNumbers: true, // 支持脚注
    config(md) {
      md.use(footnotePlugin)
    },
  },
  srcDir: rootPath,
  vite: {
    plugins: [
      AutoSidebarPlugin({
        srcDir: rootPath,
        // ignoreList: ['node_modules', '.vitepress', '.github', '.git', 'public'],
        ignoreList: ['p', 'docs', 'license', 'satisfaction-survey'],
        useH1Title: true,
      }),
      Components({
        resolvers: [
          PrimeVueResolver()
        ]
      })
    ]
  }
})
