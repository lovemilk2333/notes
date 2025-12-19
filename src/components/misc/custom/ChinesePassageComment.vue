<template>
    <div v-if="!!$slots.default"
        class="x-chinese-passage-comment-root x-chinese-passage-comment-text-wrap">
        <h2>
            {{ source }}{{ i18n(I18nKey.xPassageComment) }}
        </h2>
        <em v-if="!!score && score >= 0">
            <span class="x-chinese-passage-comment-text-red x-chinese-passage-comment-score">{{ score }}</span>
            <span class="x-chinese-passage-comment-total-score">/{{ totalScore ?? config.totalScore }}</span>
        </em>
        <blockquote>
            <slot />
        </blockquote>
    </div>
    <div v-else-if="isDev">
        <hr style="margin: 1rem 0;" />
        <p class="x-chinese-passage-comment-text-red x-chinese-passage-comment-text-wrap">
            WARNING: **Empty** score and/or content detected in component `ChinesePassageComment`! <br />
            This component will be removed in the production build if you still not provide any content.
        </p>
    </div>
</template>
<script setup lang="ts">
import { customConfigs } from '@/config';
import I18nKey from '@i18n/i18nKey';
import { i18n } from '@i18n/translation';
const { chinesePassageComment: config } = customConfigs;
const isDev = import.meta.env.DEV

const props = defineProps({
    score: { type: Number, default: null },
    source: { type: String, default: null },
    totalScore: { type: Number, default: null },
})
</script>
<style lang="css" scoped>
.x-chinese-passage-comment-text-red {
    color: #f49090;
}

.x-chinese-passage-comment-text-wrap {
    white-space: pre-wrap;
}

.x-chinese-passage-comment-score {
    font-size-adjust: 1.25;
}

.x-chinese-passage-comment-total-score {
    font-size-adjust: .75;
}
</style>