<template>
    <div>
        <div class="row q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-white']">
            <div class="col-6" :key="showNav" :class="{ 'col-sm-4':  showNav, 'col-sm-6' : !showNav, 'q-pr-xs': $q.screen.gt.xs, 'q-pb-sm': $q.screen.lt.sm }">
                <q-btn align="center" class="full-width text-body1" padding="6px" @click="showTripAbort()" color="negative" label="Fahrt Abbrechen" />
            </div>
            <div class="col-6 q-pl-xs" :class="{ 'col-sm-4':  showNav, 'col-sm-6': !showNav, 'order-last': $q.screen.gt.xs  }">
                <q-btn align="center" class="full-width text-body1" padding="6px" @click="setStatus()" color="primary" :label="tripState[item._id] && tripState[item._id].text" />
            </div>
            <div class="col-12" v-if="showNav" :class="{ 'col-sm-4':  showNav, 'col-md-6' : !showNav }">
                <q-btn align="center" class="full-width text-body1" padding="6px" @click="startNavigation()" color="amber-7" label="Navigation Starten" />
            </div>
        </div>
        <Dialog 
            text="Sie müssen zuerst das Desinfektionsprotokoll ausfüllen!" 
            :abortShow="false" 
            v-if="showAskInfektionDialog" 
            okLabel="OK" 
            headertext="Fehlerbeschreibung" 
            :modelValue="showAskInfektionDialog" 
            @update:modelValue="(val) => showAskInfektionDialog = val"  
        />
        <Dialog 
            text="Möchten Sie wirklich Ihre aktuelle Fahrt abbrechen?" 
            v-if="tripCancel" 
            :modelValue="tripCancel" 
            :func="tripAbort" 
            @update:modelValue="(val) => tripCancel = val"  
        />

        <Dialog 
            text="Gibt es einen Transportschein?" 
            v-if="showTransportscheinDialog" 
            :modelValue="showTransportscheinDialog" 
            @update:modelValue="(val) => showTransportscheinDialog = val"  
            okLabel='Ja'
            abortLabel="Nein"
            :func="setTransportscheinOk"
            :funcAbort="setTransportscheinAbort"
        />
        <Dialog 
            text="Es fehlen Angaben zum Patienten oder zur Krankenkasse. Diese können Sie unter 'Daten ergänzen' eingeben. Wollen Sie dies noch tun?" 
            :v-i="showDialogDataComplete" 
            :modelValue="showDialogDataComplete" 
            @update:modelValue="(val) => showDialogDataComplete = val"  
            okLabel='Ja'
            abortLabel="Nein"
            :func="setDialogDataCompleteOk"
            :funcAbort="setDialogDataCompleteAbort"
        />

        <Dialog 
            text="Wurde der Zuzahlungsstatus des Patienten korrekt erfasst?" 
            :v-if="costStatusDialog" 
            :modelValue="costStatusDialog" 
            @update:modelValue="(val) => costStatusDialog = val"  
            okLabel='Ja'
            abortLabel="Nein"
            :func="costStatusDialogOk"
            :funcAbort="costStatusDialogAbort"
        />
    </div>
</template>

<script lang="ts" setup>
import { watch, ref }                                               from 'vue';
import { useRouter }                                                from 'vue-router';
import Dialog                                                       from '../components/Dialog.vue';
import Global                                                       from '../helpers/Global';
import { useFahrberichtStore }                                      from 'src/stores/fahrbericht.store';
import { useMenuStore }                                             from 'src/stores/menu.store';
import { useSettingsStore }                                         from 'src/stores/settings.store';
import { useAccountStore }                                          from 'src/stores/account.store';
import { useAuditStore }                                            from 'src/stores/audit.store';
import { useNavStore }                                              from 'src/stores/nav.store';
import debug                                                        from 'debug';
import { storeToRefs }                                              from 'pinia';
import { Dark }                                                     from 'quasar';

const log       = debug('app:FahrberichteStatusView');

const emit      = defineEmits(['insertDataDialog']);

const global = Global()
const router    = useRouter();

const fahrberichtStore  = useFahrberichtStore();
const { item }          = storeToRefs(fahrberichtStore);

const menuStore         = useMenuStore();
const { tripState }     = storeToRefs(menuStore);

const settingsStore     = useSettingsStore();
const { item: settings }          = storeToRefs(settingsStore);

const accountStore      = useAccountStore();
const { fahrer, beifahrer, geoPos, standartNavigation } = storeToRefs(accountStore);

const navStore          = useNavStore();
const { searchItem: searchNavPoint }    = storeToRefs(navStore);

const auditStore        = useAuditStore();

const   showAskInfektionDialog          = ref(false),
        showTransportscheinDialog       = ref(false),
        showNav                         = ref(false),
        tripCancel                      = ref(false),
        showDialogDataComplete          = ref(false),
        costStatusDialog                = ref(false);
        
let     transvorhanden  = false,
        costStatus      = false,
        dataComplete    = false;

async function checkDialogs () {
    return new Promise( ( resolve, reject ) => {
        const existNavPoint = searchNavPoint.value(item.value._id);

        //Prüfe auf daten vollständig
        if ( !dataComplete && settings.value.dataNotCompleteWarn !== 0 && (existNavPoint.item.type === 'Spontan' || existNavPoint.item.type === 'Konsil') ) {
            //todoo every or some
            if (
                !existNavPoint.item.versStatus || existNavPoint.item.versStatus.length === 0 ||
                !existNavPoint.item.versNr || existNavPoint.item.versNr.length === 0 ||
                !existNavPoint.item.stammVersNr || existNavPoint.item.stammVersNr.length === 0 ||
                !existNavPoint.item.birthday || existNavPoint.item.birthday.length === 0 ||
                !existNavPoint.item.patCity || existNavPoint.item.patCity.length === 0 ||
                !existNavPoint.item.patZip || existNavPoint.item.patZip.length === 0 ||
                !existNavPoint.item.patStreet || existNavPoint.item.patStreet.length === 0 ||
                !existNavPoint.item.patName || existNavPoint.item.patName.length === 0 ||
                !existNavPoint.item.patSurname || existNavPoint.item.patSurname.length === 0 ||
                !existNavPoint.item.krankenkasse || existNavPoint.item.krankenkasse.length === 0
            ) {
                dataComplete = true;
            }

            if ( dataComplete ) {
                showDialogDataComplete.value = true
                reject()
                return
            }
        }

        //prüfe auf Transportschein
        if ( !transvorhanden && settings.value.transportscheinFalseWarn !== 0 && ( item.value?.type === 'Spontan' || item.value?.type === 'Konsil' ) && item.value?.transVorhanden !== 'Ja') {
            showTransportscheinDialog.value = true;
            transvorhanden = true
            reject();
            return
        }

        //prüfe auf kostenstatus
        if ( !costStatus && (item.value?.type === 'Spontan' || item.value?.type === 'Konsil') && settings.value.costStatusAnzeigen ) {
            costStatusDialog.value = true;
            costStatus = true
            reject()
            return
        }

        resolve(true)
    });
}

watch( tripState.value, (newVal) => {
    if ( newVal[item.value._id] && newVal[item.value._id].key ) {
        const key = newVal[item.value._id].key
        if ( key === 'startEnd' || key === 'zielBegin' )
            showNav.value = true;
        else
            showNav.value = false;
    }
}, {
    deep: true,
    immediate: true
})
        
async function setStatus( ) {
    const existNavPoint = searchNavPoint.value(item.value._id);

    const status = tripState.value[item.value._id].key;

    if ( settings.value.desiProtErz === 1 && status === 'frei' && item.value?.infektion && !item.value.desiProt) {
        showAskInfektionDialog.value = true;
        return;
    }

    if ( status === 'startBegin' || status === 'ziel' )
        showNav.value = true;
    else
        showNav.value = false;

    await fahrberichtStore.setTimestamp(status);

    const data = {
        fahrer:         fahrer.value?._id,
        beifahrer:      beifahrer.value?._id,
        _id:            item.value?._id,
        status,
        date:           item.value?.date,
        newsPatient:    item.value?.newsPatient || '',
        newsCar:        item.value?.newsCar || ''

    }

    if ( status === 'frei' )
        await checkDialogs()

    await auditStore.setItem({ type:'zeitstempel', value: data });

    if (status === 'frei') {
        global.tripAbort(item.value._id);
    }
}

function tripAbort () {
    showNav.value = false;
    global.tripAbort(item.value._id)
}

function startNavigation () {
    accountStore.startNavigation( { type: 'fahrbericht', datId: item.value._id } )
}

function showTripAbort () {
    log('showTripAbort')
    tripCancel.value = true;
}

async function setTransportscheinAbort () {
    const existNavPoint = searchNavPoint.value(item.value._id);

    const data = {
        gefahreneFirma: existNavPoint.item.gefahreneFirma,
        transVorhanden : 'Nein',
        _id: existNavPoint.item._id,
    }

    await auditStore.setItem({ type:'fahrbericht', value: data, fb: existNavPoint.item });

    tripCancel.value = false;

    setStatus( )
}

async function setTransportscheinOk () {
    const existNavPoint = searchNavPoint.value(item.value._id);

    const data = {
        gefahreneFirma: existNavPoint.item.gefahreneFirma,
        transVorhanden : 'Ja',
        _id: existNavPoint.item._id,
    }

    await auditStore.setItem({ type:'fahrbericht', value: data, fb: existNavPoint.item });

    tripCancel.value = false;

    setStatus()
}

function costStatusDialogOk () {
    setStatus()
    costStatus = true;
}

async function setDialogDataCompleteOk () {
    emit('insertDataDialog', true);
}

async function setDialogDataCompleteAbort () {
    dataComplete = true;
    setStatus()
}

async function costStatusDialogAbort () {
    costStatus = true;
    emit('insertDataDialog', true);
}
</script>
