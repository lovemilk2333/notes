<script setup lang="ts">
import {Ref, ref, computed} from 'vue'
import {useData} from 'vitepress'
import {ZodTypeAny} from "zod";

const {isDark} = useData()

export interface Answer {
    schema?: ZodTypeAny,
    role?: string
}

const props = defineProps<{
    question: string,
    answer: Answer,
    visible?: () => boolean,
}>()

const typeName = props.answer.schema?._def?.typeName ?? 'ZodAny'

enum CompType {
    Editor,
    InputText,
    Password,
    RadioButton,
}

let compName: CompType = CompType.InputText

switch (typeName) {
    case 'ZodString': {
        switch (props.answer.role) {
            case 'textarea': {
                compName = CompType.Editor
                break
            }
            case 'input': {
                compName = CompType.InputText
                break
            }
            case 'password': {
                compName = CompType.Password
                break
            }
            default: {
                compName = CompType.InputText
                break
            }
        }
        break
    }
    case 'ZodNumber': {
        break
    }
    case 'ZodBigInt': {
        break
    }
    case 'ZodBoolean': {
        break
    }
    case 'ZodDate': {
        throw new Error("can't understand :(")
    }
    case 'ZodEnum': {
        break
    }
    case 'ZodUnion': {
        break
    }
    case 'ZodArray': {
        break
    }
    case 'ZodMap': {
        compName = CompType.RadioButton
        break
    }
}

let _value: Ref<any> = ref(null)
let lastError = ref<string>(null)


const value = computed<any>({
    set(newValue) {
        const result = props.answer.schema?.safeParse(newValue)
        console.log(newValue, result)
        if (!result || !result.success) {
            lastError.value = result?.error?.message ?? ''
        } else {
            _value.value = result.data
            lastError.value = null
        }
    },
    get(oldValue) {
        return _value.value
    }
})


const isVisible = computed(() => {
    const fn = props.visible ?? (() => true)
    return fn()
})

</script>

<template>
    <Card v-if="isVisible">
        <template #title>{{ props.question }}</template>
        <template #content>
            <div class="m-0">
                <div class="flex flex-col gap-2">
                    <Fluid>
                        <Editor v-if="compName === CompType.Editor" v-model="value" aria-describedby="describe"
                                editorStyle="height: 320px">
                            <template v-slot:toolbar>
                              <span class="ql-formats">
                                  <button v-tooltip.bottom="'Bold'" class="ql-bold"/>
                                  <button v-tooltip.bottom="'Italic'" class="ql-italic"/>
                                  <button v-tooltip.bottom="'Underline'" class="ql-underline"/>
                              </span>
                            </template>
                        </Editor>
                        <InputText v-if="compName === CompType.InputText" aria-describedby="describe" v-model="value"/>
                        <Password v-if="compName === CompType.Password" aria-describedby="describe" v-model="value"/>
                        <div v-if="compName === CompType.RadioButton">
                            <RadioButton v-model="value" />
                        </div>
                        <small id="describe" v-if="!!props.answer.schema?.description"
                               class="description-box">{{ props.answer.schema?.description }}</small>
                        <small v-if="lastError !== null" class="error-box">{{ lastError }}</small>
                    </Fluid>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>
.error-box {
    color: red;
}
</style>
