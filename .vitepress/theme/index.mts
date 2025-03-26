import { h } from "vue";
import DefaultTheme from "vitepress/theme-without-fonts";
import { useRoute } from "vitepress";

import PrimeVue from "primevue/config";
import Lara from "@primevue/themes/lara";
import Button from "primevue/button";

const passagePaths = [
    '/passages',
    '/weekly-articles'
]

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.use(PrimeVue, {
            theme: {
                preset: Lara,
            },
        });
    },
    Layout() {
        return h(DefaultTheme.Layout, null, {
            "doc-footer-before": () => {
                const route = useRoute()

                if (!!passagePaths.some(targetPath => route.path.startsWith(targetPath))) {
                    // 引入 CSS (TS LSP 没法识别路径)
                    // @ts-ignore
                    import('./passages.css')
                }
            },
        });
    },
};
