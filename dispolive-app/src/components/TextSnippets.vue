<template>
    <q-dialog
        :modelValue="messengerStore._showTextSnippets"
        @update:modelValue="messengerStore._showTextSnippets = false"
        persistent
        full-height
        transition-show="jump-down"
        transition-hide="jump-down">
        <q-card :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']" style="width: 700px;">
            <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                Textbausteine
            </q-bar>
            <div class="row q-mx-sm" >
                <q-list seperator style="width: 100vw" class="default-fullheight-modal">
                    <div :key="item._id" class="col-12" v-for="(item, index) of textBausteine">
                        <q-btn unelevated :key="index" color="secondary" no-caps class="full-width q-my-sm q-px-xs ellipsis text-body1" padding="6px" :label="item.text" align="left" @click="clickTextbaustein(item.text)" />
                    </div>
                </q-list>
            </div>
            <div class="row">
                <div class="col-12 q-pa-sm">
                    <q-btn unelevated class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Schliessen" />
                </div>
            </div>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { useMessengerStore }                from 'src/stores/messenger.store'
import { storeToRefs }                      from 'pinia';
import { Dark }                             from 'quasar';

const messengerStore = useMessengerStore()
const { data: textBausteine } = storeToRefs(messengerStore)

const props = defineProps({
    type: {
        type: String,
        required: true,
    }
})

function clickTextbaustein ( text: string ) {
    messengerStore.setSelectedText({type: props.type, text})
    messengerStore._showTextSnippets = false;
}
</script>
