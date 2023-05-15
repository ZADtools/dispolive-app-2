<template>
    <q-dialog
        v-if="value"
        :value="value"
        @input="$emit('input', $event)"
        persistent
        transition-show="jump-right"
        transition-hide="jump-right">
        <q-card class="bg-white">
            <q-bar class="q-pa-lg text-h6 text-white" :class=" headertext == 'Achtung' ?  'bg-negative' : 'bg-primary'" >
                {{headertext}}
            </q-bar>
            <q-separator />
            <q-card-section class="text-left">
                <div class="text-body1" v-html="desc"></div>
            </q-card-section>
            <q-card-actions align="center" class="bg-grey-3 row" >
                <q-btn padding="6px" v-if="abortShow || abortShow === undefined" class="col-5 text-body1" :label="abortLabel ? abortLabel : 'Nein'" color="negative" @click="funcAbort ? funcAbort(abortParam) : ''" v-close-popup />
                <q-btn  padding="6px" v-if="okShow || okShow === undefined" class="col-5 text-body1" :label="okLabel ? okLabel : 'Ja'" color="primary" @click="func ? func() : ''"  v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { ref }                                              from 'vue';
import debug                                                from 'debug';
const log                                                   = debug('app:regulation');
log('start')
const props = defineProps({
    func: {
        type: Function,
    },
    funcAbort: {
        type: Function,
    },
    headertext: {
        tape: String,
        default: 'Achtung'
    },
    text: String,
    value: {
        type: Boolean
    },
    type: {
        type: String
    },
    okLabel:    String,
    okShow:     {
        type: Boolean,
        default: true
    },
    abortParam: Boolean,
    abortLabel: String,
    abortShow:  {
        type: Boolean,
        default: true
    },
})
    
const desc = ref(props.text || '')

if (!props.text && props.type === 'delete') {
    desc.value = 'Möchten Sie den Datensatz wirklich löschen?'
}
</script>
