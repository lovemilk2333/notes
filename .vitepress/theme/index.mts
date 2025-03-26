import { h, onMounted } from "vue";
import DefaultTheme from "vitepress/theme-without-fonts";
import { useRoute } from "vitepress";

import PrimeVue from "primevue/config";
import Lara from "@primevue/themes/lara";
import Button from "primevue/button";

import Layout from "./Layout.vue"
import "./passages.css";

export default {
    ...DefaultTheme,
    enhanceApp({ app }) {
        app.use(PrimeVue, {
            theme: {
                preset: Lara,
            },
        });
    },
    Layout
};
