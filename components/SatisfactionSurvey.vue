<script setup lang="ts">
import {z} from "zod"
import Question from "./Question.vue";

const ans = {
    schema: z.map({
        A: "123",
        B: "456"
    }).describe('test')
}

</script>

<template>
    <form>
        <Question question="What is your name?" :answer="ans"/>
    </form>
</template>
