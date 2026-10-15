<template>
    <div class="row q-col-gutter-sm">
        <div :class="disableChangeValue ? 'col-12' : 'col-7'">
            <q-btn
                v-if="label"
                color="primary"
                class="q-mt-xs full-width ellipsis bg-white"
                no-caps
                outline
                dense
                unelevated
                @click="updateOneValue"
            >
                <template v-slot:default>

                    <q-icon :key="iconShow" :name="iconShow" :color="iconShow === 'check' ? 'green-8' : 'negative'" class="q-mr-sm" />
                    {{label}}
                </template>
            </q-btn>
        </div>
        <div class="col-5" v-if="!disableChangeValue">
            <q-btn
                v-if="label"
                @click="openDialog"
                color="primary"
                class="q-mt-xs full-width ellipsis"
                no-caps
                dense
                unelevated
            >
                <template v-slot:default>
                    Wert ändern
                </template>
            </q-btn>
        </div>
        <q-dialog v-model="open" persistent>
            <q-card style="width: 90%">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    {{ fieldName }}: {{fieldValue}}
                </q-bar>
                <q-card-section>
                    <template v-for="item of verordnung.checkbox"  :key="item.field">
                        <div class="row" v-if="verordnung[item.field]">
                            <div class="col-6">
                                {{ verordnung[item.field] }}
                            </div>
                            <div class="col-6 text-right">
                                <q-checkbox left-label v-model="item.value" @click="changeFieldValueArray(item)"/>
                            </div>
                        </div>
                    </template>
                </q-card-section>
                <q-card-section>
                    <div class="row q-col-gutter-sm">
                        <div class="col-6">
                            <q-btn class="full-width" unelevated label="Abbrechen" color="negative" v-close-popup />
                        </div>
                        <div class="col-6">
                            <q-btn class="full-width" unelevated label="Übernehmen" color="primary" v-close-popup @click="updateValue" />
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>

import { computed, ref, watch } from 'vue'

const open = ref(false)

const props = defineProps({
    value: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    show: {
        type: String,
        default: ''
    },
    Verordnung: {
        type: Object,
        default: () => ({})
    },
    disableChangeValue: {
        type: Boolean,
        default: false
    },
    fieldName: {
        type: String,
        default: ''
    }
})

const emit  = defineEmits(['update:model-value'])

const fieldValueArray = ref([])
const verordnung = ref(null)

function openDialog() {
    if (verordnung.value === null) {
        verordnung.value = {...props.Verordnung}
    }
    open.value = !open.value
    fieldValueArray.value = []

    verordnung.value.checkbox.forEach((item: any) => {
        item.value = false

        if (verordnung.value[item.field] === props.label) {
            item.value = true
            fieldValueArray.value.push(verordnung.value[item.field])
        }
    })
}

const fieldValue = computed(() => {
    return fieldValueArray.value.join(' ')
})

function updateOneValue( ) {
    const field = props.Verordnung.checkbox.find((item: any) => item.name === props.fieldName)
    emit('update:model-value', {fieldName: (field && field.field) || props.fieldName, fieldValue: props.label})
}

function updateValue() {
    const field = verordnung.value.checkbox.find((item: any) => item.name === props.fieldName)
    emit('update:model-value', {fieldName: field.field, fieldValue: fieldValue.value})
    open.value = false
}

const iconShow = computed(() => {
    return props.value === props.label ? 'check' : 'close'
})

function changeFieldValueArray( item: any ) {
    if (item.value) 
        fieldValueArray.value.push(verordnung.value[item.field])
    
    if (!item.value)
        fieldValueArray.value = fieldValueArray.value.filter((value: any) => value !== verordnung.value[item.field])
}

</script>
