
<template>
    <q-layout :view="view" container class="layoutFormat" :class="[isScanning ? 'transBG' : '', !Dark.isActive ? 'bg-teal-5' : 'bg-grey-10']" > 
        <q-header class="layoutHeader bg-primary text-white text-bold" :class="headerClass" v-if="header" >
            <slot name="header">

            </slot>  
        </q-header>
        <slot name="drawer">

        </slot>
        <q-page-container v-show="!isScanning">
            <q-page class="scroll" ref="content" :class="[!Dark.isActive ? 'bg-white' : 'bg-dark', custClass]">
                <slot name="content">

                </slot>
            </q-page>
        </q-page-container>
        <div class="row q-py-md" :class="[!Dark.isActive ? 'bg-grey-3' : 'bg-dark']" v-if="footer">
            <slot name="footer">

            </slot>
        </div>
    </q-layout>
</template>

<script setup lang="ts">
import { ref, watch }                   from 'vue'
import { Platform, Dark, uid }          from 'quasar'
import { useAccountStore }              from 'src/stores/account.store';
import { storeToRefs }                  from 'pinia';
import { useRouter }                    from 'vue-router';
import { useCardreaderStore }           from 'src/stores/cardreader.store';

const props = defineProps({
    view: String,
    header: {
        type: Boolean,
        default: true
    },
    footer: {
        type: Boolean,
        default: false
    },
    custClass: {
        type: String,
        default: ''
    },
    headerClass: {
        type: String,
        default: 'q-pa-md'
    }
})

const accountStore = useAccountStore()
const { secondHeader, title } = storeToRefs( accountStore )

const cardReaderStore = useCardreaderStore()
const { isScanning } = storeToRefs( cardReaderStore )

let secondHeaderHeight = 0
const firshHeaderHeight = 68
const foot = ref(false)
const content = ref<any>(null)
const router = useRouter()

router.beforeEach((to, from) => {
    if (content.value)
        content.value.$el.scrollTop = 0
})

watch([secondHeader, title], ( newVal ) => {
    if (  secondHeader.value === 'Fahrberichte' || secondHeader.value === 'contacts' || secondHeader.value === 'Messenger' || secondHeader.value === 'Desinfektion' || secondHeader.value === 'dienstplan' || secondHeader.value === 'missingdata' || secondHeader.value === 'cardreader' )
        secondHeaderHeight = 45
    else
        secondHeaderHeight = 0

    calcVar()
})

const paddingTop = ref('')
const paddingTopheader = ref('')
const height = ref('')
const contentHeight = ref('')
const paddingBottom = ref(Platform.is.ios ? 'env(safe-area-inset-bottom)' : '' )

function calcVar () {
    paddingTop.value = Platform.is.ios ? 'env(safe-area-inset-top)' : ''
    paddingTopheader.value = Platform.is.ios ? 'env(safe-area-inset-top)' : ''
    height.value = Platform.is.ios ? 'calc(100vh - env(safe-area-inset-bottom))' : '100vh'
    contentHeight.value = Platform.is.ios ? `calc(100vh - env(safe-area-inset-bottom) - env(safe-area-inset-top) - ${68 + secondHeaderHeight}px)` : `calc(100vh- ${68 + secondHeaderHeight}px)`

    if ( props.header )
        paddingTopheader.value = Platform.is.ios ? `calc(env(safe-area-inset-top) + ${firshHeaderHeight + secondHeaderHeight}px)` : `calc(${firshHeaderHeight + secondHeaderHeight}px)`

    if (props.footer)
        contentHeight.value = Platform.is.ios ? `calc(100vh - env(safe-area-inset-bottom) - env(safe-area-inset-top) - ${52 + secondHeaderHeight}px)` : `calc(100vh - ${52 + secondHeaderHeight}px)`

    if ( props.footer && props.header )
        contentHeight.value = Platform.is.ios ? `calc(100vh - env(safe-area-inset-bottom) - env(safe-area-inset-top) - ${136 + secondHeaderHeight}px)` : `calc(100vh  - ${136 + secondHeaderHeight}px)`
}

calcVar()
</script>

<style scoped>
    .layoutFormat {
        min-height: v-bind(height) !important;
        height: v-bind(height);
    }
    .layoutFormat :deep(.q-layout--containerized .q-page-container) {
        margin-top: v-bind(paddingTopheader) !important;
        padding-top: 0px !important;
        padding-bottom: v-bind(paddingBottom);
        min-height: v-bind(contentHeight) !important;
        height: v-bind(contentHeight);
        overflow: hidden;
    }

    .layoutFormat :deep(.q-layout--containerized .q-page-container .q-page)  {
        height: v-bind(contentHeight) !important;
        min-height: v-bind(contentHeight) !important;
    }

    .layoutHeader {
        margin-top: v-bind(paddingTop);
    }

    .transBG {
        background-color: transparent !important;
    }
</style>
