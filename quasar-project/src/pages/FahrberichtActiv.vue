<template>
    <div :key="fbItem?._id">
        <q-card class="bg-white">
            <fahrbericht-view :showStatusButtons="true" @insertDataDialog="insertDataDialog = true" :insertDataDialog="insertDataDialog" @close="insertDataDialog = false" />
            <div class="row q-px-sm q-pt-sm bg-grey-3 q-card__actions" v-if="fbItem?.type !== 'Linie'">
                <div class="col-12 q-pb-sm" v-if="settings.ipadEventEdit !== 0">
                    <q-btn align="center" class="full-width text-body1" padding="6px" @click="insertData()" color="primary" label="Daten ergänzen" />
                </div>
            </div>
        </q-card>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeMount }                                from 'vue'
import { useRoute }                                                 from 'vue-router'
import debug                                                        from 'debug'
import { useSettingsStore }                                         from 'src/stores/settings.store'
import FahrberichtView                                              from 'src/components/FahrberichtView.vue'
import { storeToRefs, defineStore }                                 from 'pinia'

const log       = debug('app:fahrbrichtActiv');
const route     = useRoute();

const   insertDataDialog    = ref(false);

const settingsStore         = useSettingsStore();
const { item: settings }    = storeToRefs( settingsStore );

async function insertData () {
    insertDataDialog.value = !insertDataDialog.value
}

const fbItem = ref(null);
watch( route, (newVal: any) => {
    if ( newVal.params?.id ) {
        const dynamicStore = defineStore( newVal.params.id, {} )()
        const { item } = storeToRefs( dynamicStore )
        fbItem.value = item.value
    }
}, {immediate: true } )

</script>
