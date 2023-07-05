<template>
    <div :class="[Dark.isActive ? 'bg-dark' : 'bg-grey-3']" v-if="secondHeader" style="height: 63px">
        <!-- desinfektionsheader -->
        <div class="row" v-show="secondHeader === 'Desinfektion'">
            <div class="col-12">
                <q-toolbar class="q-py-md">
                    <q-toolbar-title class="text-bold text-primary text-center">Timer: {{ diffTime || '00:00' }}</q-toolbar-title>
                    <q-btn unelevated color="negative" @click="setStartTimer" size="sm" icon="fas fa-history" />
                </q-toolbar>
            </div>
        </div>
        <!-- ungesendetedatensecondheader -->
        <div class="row" v-show="secondHeader === 'missingdata'">
            <div class="col-12">
                <q-toolbar class="q-py-md">
                    <q-btn unelevated class="col-4 text-body1 full-width" padding="6px" align="center" color="negative" @click="missingDataDialog = true" label="Alle Daten löschen" />
                </q-toolbar>
            </div>
            <Dialog type="delete" text="Möchten Sie die ungesendeten Daten wirklich löschen?" :modelValue="missingDataDialog" @update:modelValue="(val) => missingDataDialog = val" :func="deleteMissingData"   />
        </div>
        <!-- fahrberichteheader -->
        <div class="row q-pa-sm" v-show="secondHeader === 'Fahrberichte'">
            <div class="col-4 q-pr-xs">
                <q-btn unelevated align="center" class="full-width col-6 text-body1" padding="6px" :color="btnColorToday" @click="changeDay('today')" >
                <div class="ellipsis">
                        {{ setNextDayLabel('today') }}
                    </div>
                </q-btn>
            </div>
            <div class="col-4 text-body1 text-center ellipsis text-bold text-white bg-secondary" style="padding-top: 6px">
                {{actDay}}
            </div>
            <div class="col-4 q-pl-xs">  
                <q-btn unelevated align="center" class="full-width col-6 ellipsis text-body1" padding="6px" :color="btnColorNext" @click="changeDay('next')" >
                <div class="ellipsis">
                        {{ setNextDayLabel('next')}}
                    </div>
                </q-btn>
            </div>
            <div v-show="!progressBarLoad" class="col-12 text-primary">
                <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
            </div>
            <div v-show="progressBarLoad" class="col-12 text-primary">
                <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
            </div>
    
        </div>
        <!-- messagessecondheader -->
        <div class="row q-pa-sm" style="min-height: 65px" v-show="secondHeader=='messages'">
            <div class="col-6 q-pr-xs">
                <q-btn unelevated class="full-width ellipsis text-body1" padding="6px" color="negative" @click="messengerStore.setSelectedText({ type: 'messenger', text: 'Besatzung bittet um Rückruf!' })" >
                    <div class="ellipsis">
                        Rückruf anfordern
                    </div>
                </q-btn>
            </div>
            <div class="col-6 q-pl-xs">
                <q-btn unelevated class="full-width ellipsis text-body1" padding="6px" color="primary" @click="messengerStore._showTextSnippets = true" >
                <div class="ellipsis">
                        Textbausteine
                    </div>
                </q-btn>
            </div>
            <div v-show="!progressBarLoad" class="col-12 text-primary">
                <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
            </div>
            <div v-show="progressBarLoad" class="col-12 text-primary">
                <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
            </div>
        </div>
        <!-- dienstplansecondheader -->
        <div class="row q-pa-sm" v-if="secondHeader == 'dienstplan'">
            <div class="col-6 q-pr-xs">
                <q-btn unelevated class="full-width ellipsis text-body1" padding="6px" :color="pers == 'fahrer' ? 'negative' : 'primary'" @click="loadDienstplan('fahrer')" >
                <div class="ellipsis">
                        {{getKrz('fahrer')}}
                    </div>
                </q-btn>
            </div>
            <div class="col-6 q-pl-xs">
                <q-btn unelevated class="full-width ellipsis text-body1" padding="6px" :color="pers == 'beifahrer' ? 'negative' : 'primary'" @click="loadDienstplan('beifahrer')" >
                <div class="ellipsis">
                        {{getKrz('beifahrer')}}
                    </div>
                </q-btn>
            </div>
            <div v-show="!disableDienst" class="col-12 text-primary">
                <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
            </div>
            <div v-show="disableDienst" class="col-12 text-primary">
                <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
            </div>
        </div>
        <!-- kontaktsecondheader -->
        <q-toolbar v-show="secondHeader == 'contacts'">
            <div class="col-12 q-pt-xs">
                <q-input filled :modelValue="search" @update:model-value="($event) => searchContacts($event)" clearable label-color="primary" label="Suche" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']" >
                    <template v-slot:prepend>
                        <q-icon color="primary" name="place" />
                    </template>
                </q-input>
            </div>
        </q-toolbar>
        <!-- cardreadersubheader -->
        <q-toolbar v-show="secondHeader === 'cardreader'">
            <div class="col-12" v-if="isScanning">
                <q-btn unelevated color="negative" class="text-body1" padding="6px" @click="cardreaderStore.stopBarcodeScanning()" label="Abbrechen" />
            </div>
            <div class="col-6 q-pr-xs" v-if="!isScanning">
                <q-btn unelevated class="full-width ellipsis text-body1" padding="6px" color="primary" @click="cardreaderStore.startPairing">
                    <div class="ellipsis">
                        Gerät Koppeln
                    </div>
                </q-btn>
            </div>
            <div class="col-6 q-pl-xs" v-if="!isScanning">
                <q-btn unelevated class="full-width ellipsis text-body1" padding="6px"  color="primary" @click="cardreaderStore.readCard">
                    <div class="ellipsis">
                        EGK lesen
                    </div>
                </q-btn>
            </div>
        </q-toolbar>
        
        <Dialog 
            text="Soll der ausgewählte Tag wirklich geladen werden? Ihre mobile Datenmenge wird durch diese Funktion stark verbraucht!" 
            abortLabel="Nein" 
            okLabel="Ja" 
            :func="fahrberichteStore.loadDay" 
            :modelValue="changeDayDialog"  
            @update:modelValue="(val) => changeDayDialog = val"  
        />

        <TextSnippets type="messenger"/>
    </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount, watch }                      from 'vue'
import { useAccountStore }          from 'src/stores/account.store';
import { useDesiprotokolleStore }   from 'src/stores/desiprotokolle.store';
import { useFahrberichteStore }     from 'src/stores/fahrberichte.store';
import { useMessengerStore }        from 'src/stores/messenger.store';
import { useDienstplanStore }       from 'src/stores/dienstplan.store';
import { useCardreaderStore }       from 'src/stores/cardreader.store';
import { usePatientenStore }        from 'src/stores/patienten.store';
import { useAuditStore }            from 'src/stores/audit.store';
import Dialog                       from 'src/components/Dialog.vue';
import TextSnippets                 from 'src/components/TextSnippets.vue';
import { Dark }                     from 'quasar';

import { storeToRefs }              from 'pinia';
import dayjs                   from 'dayjs';

const accountStore = useAccountStore()
const { title, secondHeader, beifahrer, fahrer, progressBarLoad } = storeToRefs(accountStore)

const fahrberichteStore = useFahrberichteStore()
const { actDay } = storeToRefs(fahrberichteStore)

const cardreaderStore = useCardreaderStore()
const { isScanning } = storeToRefs(cardreaderStore)

const patientenStore = usePatientenStore()

const desiprotokolleStore = useDesiprotokolleStore()
const { diffTime } = storeToRefs(desiprotokolleStore)

const messengerStore = useMessengerStore()

const dienstplanStore = useDienstplanStore();
const { pers } = storeToRefs(dienstplanStore);

const auditStore = useAuditStore();

const btnColorToday           = ref('negative')
const btnColorNext            = ref('primary')
const search                  = ref('')
const disableDienst           = ref(false)
const changeDayDialog         = ref(false)
const day                     = dayjs().format('YYYY-MM-DD')
const missingDataDialog       = ref(false)

onBeforeMount(() => {
    fahrberichteStore._selectedDay = day
    fahrberichteStore.loadDay()
    search.value = ''
})

function setStartTimer() {
    desiprotokolleStore._desiStartTimer = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

function setNextDayLabel ( type: string ) {
    let label = 'Heute'

    if ( type === 'next' )
        label = 'Nächster Tag';

    if (type === 'next' && actDay.value !== dayjs().format('YYYY-MM-DD')) {
        btnColorToday.value = 'primary';
        btnColorNext.value = 'negative';
    }
    
    if (type === 'today' && actDay.value === dayjs().format('YYYY-MM-DD')) {
        btnColorToday.value = 'negative';
        btnColorNext.value = 'primary';
    }

    return label;
}

function changeDay ( item: string ) {
    changeDayDialog.value = true;
    fahrberichteStore._selectedDay = item;
}

watch( title, (val) => {
    if ( val === 'Kontakte' ) {
        search.value = '';
    }
})

function getKrz(pers: any) {
    let person = null;
    if ( pers === 'fahrer' )
        person = fahrer.value;
    else
        person = beifahrer.value;

    if ( person?.name )
        return `${person.surname}, ${person.name}`
}

async function loadDienstplan( pers: string ) {
    disableDienst.value = true;
    dienstplanStore.setPers(pers);
    
    let person = null;

    if ( pers === 'fahrer' )
        person = fahrer.value;
    else
        person = beifahrer.value;

    if (person)
        await dienstplanStore.getData(person);

    disableDienst.value = false;
}

function searchContacts (val: string) {
    search.value = val
    patientenStore._search = val
}

async function deleteMissingData() {
    await auditStore.dropDb();
    await auditStore.getData()
}

</script>
