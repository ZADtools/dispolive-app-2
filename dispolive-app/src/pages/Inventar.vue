<template>
    <div>
        <div v-if="inApp" style="margin-bottom: 50px;">
            <inventar :inApp="inApp" :carItems="carItems" :form="form" />  
            <q-page-sticky expand position="bottom" class="q-pl-sm q-pt-sm q-pb-sm row" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']" >
                <div class="col-6 q-px-sm">
                    <q-btn unelevated class="full-width text-body1" padding="6px" color="negative"  @click="confirmAbort()" label="Abbrechen" />
                </div>
                <div class="col-6 q-px-sm">
                    <q-btn unelevated class="full-width text-body1" padding="6px" color="primary" @click="saveDataDialog = true" label="Speichern" />
                </div>
            </q-page-sticky>
            <Dialog text="Bitte prüfen Sie das gesamte Inventar!" v-model="errorDataDialog" :abortShow="false" okLabel="OK" @input="(val) => errorDataDialog = val"  />
            <Dialog text="Sie haben bereits begonnen, das Inventar zu prüfen, möchten Sie wirklich abbrechen?" v-model="confirmAbortDialog"  :func="abort" @input="(val) => confirmAbortDialog = val"  />
            <Dialog 
                v-model="saveDataDialog"
                :text="'<b>Möchten Sie die Fahrzeugcheckliste speichern?</b><br/><br/>Mit dem Absenden des Formulars bestätigt die Besatzung, das Fahrzeug ordnungsgemäß geprüft zu haben.'"  
                :func="saveCarItemList" 
                @input="(val) => saveDataDialog = val"  
            />
        </div>
        <cust-layout view="hHh lpR fFf" :footer="true" v-if="!inApp">
            <template #header>
                <div class="row">
                    <div class="col-12 q-px-xs text-body1">
                        Fahrzeugcheckliste
                    </div>
                </div>
                <div v-show="!loadData" class="col-12 text-primary">
                    <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
                </div>
            </template>
            <template #content>
                <inventar :inApp="inApp" :carItems="carItems" :form="form" :fullHeight="false" :fullHeightFooter="true"/>  
                <Dialog text="Bitte prüfen Sie das gesamte Inventar!" v-model="errorDataDialog" :abortShow="false" okLabel="OK" @input="(val) => errorDataDialog = val"  />
                <Dialog text="Sie haben bereits begonnen, das Inventar zu prüfen, möchten Sie wirklich abbrechen?" v-model="confirmAbortDialog"  :func="abort" @input="(val) => confirmAbortDialog = val"  />
                <Dialog 
                    v-model="saveDataDialog"
                    :text="'<b>Möchten Sie die Fahrzeugcheckliste speichern?</b><br/><br/>Mit dem Absenden des Formulars bestätigt die Besatzung, das Fahrzeug ordnungsgemäß geprüft zu haben.'"  
                    :func="saveCarItemList" 
                    @input="(val) => saveDataDialog = val"  
                />
            </template>
            <template #footer>
                <div class="col-6 q-px-sm">
                    <q-btn unelevated class="full-width text-body1" padding="6px" color="negative"  @click="confirmAbort()" label="Abbrechen" />
                </div>
                <div class="col-6 q-px-sm">
                    <q-btn unelevated class="full-width text-body1" padding="6px" color="primary" @click="saveDataDialog = true" label="Speichern" />
                </div>
            </template>
        </cust-layout>
    </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount }                                   from 'vue';
import { useRouter }                                            from 'vue-router';
import Dialog                                                   from 'src/components/Dialog.vue'        
import Inventar                                                 from 'src/components/Inventar.vue';
import CustLayout                                               from 'src/components/Layout.vue';
import debug                                                    from 'debug';
import dayjs                                                    from 'dayjs';
import { uid, Dark }                                            from 'quasar';
import { useAccountStore }                                      from 'src/stores/account.store';
import { useAuditStore }                                        from 'src/stores/audit.store';
import { useFahrzeugeStore }                                    from 'src/stores/fahrzeuge.store';
import { useInventarStore }                                     from 'src/stores/inventar.store';
import { storeToRefs } from 'pinia';
const log       = debug('app:caritemlist');

const props = defineProps({
    inApp: {
        type: Boolean
    },
    disableFooter: {
        type: Boolean
    }
});

const   form                        = ref<any>( { items:{} } ),
        errorDataDialog             = ref(false),
        saveDataDialog              = ref(false),
        confirmAbortDialog          = ref(false);

const   router    = useRouter();

const auditStore        = useAuditStore();

const accountStore      = useAccountStore();
const { fahrer, beifahrer } = storeToRefs( accountStore );

const fahrzeugeStore    = useFahrzeugeStore();
const { item: selectedCar } = storeToRefs( fahrzeugeStore );

const inventarStore     = useInventarStore();
const { data: carItems, countItems } = storeToRefs( inventarStore );

onBeforeMount(() => {
    if (props.inApp) {
       accountStore.setSecondHeader('')
       accountStore.setTitle('Fahrzeugcheckliste')
    }
});

function confirmAbort() {
    if (Object.keys(form.value.items).length !== 0)
        confirmAbortDialog.value = true;
    else
        abort();
}

async function abort() {
    accountStore.loading(true)
    const data = {
        _id:        uid(),
        fahrer:     fahrer.value?.persId || '',
        beifahrer:  beifahrer.value?.persId || '',
        car:        selectedCar.value?._id,
        date:       dayjs().format('YYYY-MM-DD'),
        time:       dayjs().format('HH:mm')
    };

    auditStore.setItem({type: 'bestueckungslisteDecline', value: data});

    form.value.items = {};
    await router.push( '/app/fahrberichte' );
    confirmAbortDialog.value = false;
    accountStore.loading(false)
}

async function saveCarItemList() {
    accountStore.loading(true)
    const data: any = {
        _id:        uid(),
        fahrer:     fahrer.value?.persId || '',
        beifahrer:  beifahrer.value?.persId || '',
        car:        selectedCar.value?._id,
        date:       dayjs().format('YYYY-MM-DD'),
        time:       dayjs().format('HH:mm'),
        items:      []
    };

    for (const key in form.value.items) {
        console.log('key', key)
        if (Object.hasOwnProperty.call(form.value.items, key)) {
            const item = form.value.items[key];
            const obj: any = {
                itemId: key,
                status: item.status
            };

            if (item.error) {
                obj.error = item.error;
            }

            data.items.push(obj);
        }
    }

    if (data.items.length !== countItems.value) {
        errorDataDialog.value = true
        accountStore.loading(false)
        return
    }

    auditStore.setItem({type: 'bestueckungsliste', value: data})
    saveDataDialog.value = false;
    form.value.items = {};
    await router.push( '/app/fahrberichte' )
    accountStore.loading(false)
}
</script>

<style scope lang="scss">
    .trip-item {
        border-bottom: 1px solid $grey-5
    }
</style>
