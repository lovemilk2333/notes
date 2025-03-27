<template>
    <Layout />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useRoute, useRouter } from "vitepress";

const passagePaths = ["/passages", "/weekly-articles"];

const Layout = DefaultTheme.Layout

const router = useRouter()

router.onAfterPageLoad = (to) => {
    const app = document.getElementById('app');

    if (!!passagePaths.some((targetPath) => to.startsWith(targetPath))) {
        // @ts-ignore
        app.classList.add("text-indent");
    } else {
        // @ts-ignore
        app.classList.remove("text-indent");
    }
}

// @ts-ignore
onMounted(() => router.onAfterPageLoad(useRoute().path))
</script>