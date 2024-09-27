import DefaultTheme from 'vitepress/theme-without-fonts'


import PrimeVue from "primevue/config";
import Lara from "@primevue/themes/lara";
import Button from "primevue/button"

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.use(PrimeVue, {
            theme: {
                preset: Lara
            }
        })
    },
}
