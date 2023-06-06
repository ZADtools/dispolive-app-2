<template>
    <div>
        <q-btn-toggle
            unelevated
            v-model="form.art"
            spread
            no-wrap
            @click="clickArt()"
            toggle-color="primary"
            :color="Dark.isActive ? 'grey-10' : 'grey-4'"
            :text-color="Dark.isActive ? 'white' : 'primary'"
            :options="desiArt"
        >
            <template v-slot:regeldesinfektion>
                <div class="row no-wrap ellipsis">
                    <div class="text-center ellipsis">
                        <div class="ellipsis">
                            Regeldesinfektion
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:sonderdesinfektion>
                <div class="row no-wrap ellipsis">
                    <div class="text-center ellipsis">
                        <div class="ellipsis">
                            Sonderdesinfektion
                        </div>
                    </div>
                </div>
            </template>
            <template v-slot:abschlussdesinfektion>
                <div class="row no-wrap ellipsis">
                    <div class="text-center ellipsis">
                        <div class="ellipsis">
                            Abschlussdesinfektion
                        </div>
                    </div>
                </div>
            </template>
        </q-btn-toggle>
        <div v-show="selectedFahrten.length > 1">
            <q-select 
                filled 
                use-chips
                v-model="selectedFahrt" 
                :options="selectedFahrten" 
                label="Fahrten wählen..."
                emit-value
                map-options
                multiple
            >
                <template v-slot:option="scope">
                    <q-item
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents">
                        <q-item-section >
                            <q-item-label class="text-body1"> {{scope.opt.item.patSurname}} {{scope.opt.item.patName}} </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <template v-slot:selected-item="scope">
                    <q-chip
                        @remove="scope.removeAtIndex(scope.index)"
                        v-bind="scope.itemProps"
                        v-on="scope.itemEvents"
                        removable>
                        {{scope.opt.item.patSurname}} {{scope.opt.item.patName}}
                        
                    </q-chip>
                </template>
            </q-select>
        </div>

             <div v-for="(items, index) in desiBereich" :key="index" class="q-px-none q-py-none">
                 <div v-if="index == 3" class="row bg-orange text-body1 q-pa-sm text-bold text-white">
                    Geräte
                </div>
                <div v-if="index == 1" class="row bg-orange text-body1 q-pa-sm text-bold text-white">
                    Fahrerkabine
                </div>
                <div v-if="index == 2" class="row bg-orange text-body1 q-pa-sm text-bold text-white">
                    Patientenraum
                </div>

                <div v-for="item of items" :key="item._id">
                    <div class="row groupHeader" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-2']">
                        <div class="col-2">
                            <q-toggle
                                v-model="form.protokoll[item._id]"
                                class="text-primary"
                                keep-color
                            />
                        </div>
                        <div class="col-6 text-body1 q-pa-sm">
                            {{item.produkt}}
                        </div>
                        <div class="col-2 text-body1 q-pa-sm">
                            {{item.konzentration ? item.konzentration + ' %' : ''}}
                        </div>
                        <div class="col-2 text-body1 q-pa-sm">
                            {{item.zeit ? item.zeit + ' Min.' : ''}}
                        </div>
                    </div>
                    <div class="row" v-show="form.protokoll[item._id]">
                        <div class="col-12">
                            <q-linear-progress :value="progress[item._id].progress" :color="progress[item._id].progress < 1.0 ? 'negative' : 'secondary'" />
                        </div>
                    </div>
                    <div class="row logoCont">
                        <div class="col-2">
                        </div>
                        <div class="col-6 q-pa-sm">
                            {{item.teil}}
                        </div>
                        <div class="col-4">
                            <div class="row" style="min-height: 40px" v-show="form.protokoll[item._id]" >
                                <div class="col-6 text-bold q-pa-sm position-bottom text-negative">
                                    {{form.changes[item._id] && form.changes[item._id].konzentration ? form.changes[item._id].konzentration + ' %' : ''}}
                                </div>
                                <div class="col-6 text-bold q-pa-sm text-negative">
                                    {{form.changes[item._id] && form.changes[item._id].zeit ? form.changes[item._id].zeit + ' Min.' : ''}}
                                </div>
                            </div>
                            <div class="row" v-show="form.protokoll[item._id]">
                                <div class="col-6 q-mb-md" >
                                    <q-icon size="sm" class="text-white q-pa-sm q-mr-sm cursor-pointer bg-negative" v-show="form.changes[item._id] && (form.changes[item._id].zeit || form.changes[item._id].konzentration)" @click="removeChangeItemData(item)" name="fas fa-trash"></q-icon>
                                </div>
                                <div class="col-6 q-mb-md" >
                                    <q-icon size="sm" class="bg-primary text-white q-pa-sm q-mr-lg cursor-pointer" @click="changeData(item)" name="fas fa-pen"></q-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                    <q-separator />
                </div>
            </div>
            <div class="row">
                <div class="col-12 q-pa-md">
                    <q-input filled v-model="form.bemerkung" label-color="primary" label="Bemerkung"  >
                        <template v-slot:prepend>
                            <q-icon name="fa-regular fa-note-sticky" />
                        </template>
                    </q-input>
                </div>
            </div>
        <div class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']" >
            <div class="col-6 q-px-sm">
                <q-btn class="full-width text-body1" padding="6px" color="negative" @click="confirmAbort()" label="Abbrechen" />
            </div>
            <div class="col-6 q-px-sm">
                <q-btn class="full-width text-body1" padding="6px" color="primary" @click="confirmSave()" label="Speichern" />
            </div>
        </div>
        <q-dialog
            :selectedItem="changeItemData"
            v-model="changeDataDialog"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Daten ändern
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                    <div class="col-12">
                        <q-input mask="###" suffix="%" filled decimals v-model="changeItemData.item.konzentration" label-color="primary" label="Konzentration in %" />
                    </div>
                </div>
                <div class="row q-px-xl q-py-sm">
                 
                    <div class="col-12">
                        <q-input mask="##" suffix="min" filled decimals v-model="changeItemData.item.zeit" label-color="primary" label="Zeit in Min."  />
                    </div>
                    
                </div>
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width" padding="6px" color="negative" v-close-popup label="Abbrechen" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width" padding="6px" color="primary" @click="setChangeItemData" label="Ändern" />
                    </div>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-dialog
            v-model="saveDataDialog"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Speichern
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                 
                    <div class="col-12 text-body1">
                        <b>Möchten Sie das Desinfektionsprotokoll speichern?</b><br/><br/>Mit dem Absenden des Formulars bestätigt die Besatzung, die Desinfektion ordnungsgemäß durchgeführt zu haben.
                    </div>
                    
                </div>
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Abbrechen" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="primary" @click="saveData(changeItemData)" label="Speichern" />
                    </div>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-dialog
            v-model="errorDataDialog"
            :selectError="selectError"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-negative">
                    Achtung
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                 
                    <div class="col-12 text-body1">
                        {{selectError}}
                    </div>
                    
                </div>
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                    <div class="col-12 q-px-sm">
                        <q-btn align="center" class="full-width text-body1" padding="6px" color="primary" v-close-popup label="Ok" />
                    </div>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-dialog
            v-model="confirmAbortDialog"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-negative">
                    Achtung
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                 
                    <div class="col-12 text-body1">
                        Möchten Sie das Desinfektionsprotokoll wirklich abbrechen?
                    </div>
                    
                </div>
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                   
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="negative" @click="abort()" label="Ja" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="primary" v-close-popup label="Nein" />
                    </div>
                    
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onActivated }                            from 'vue';
import { useRouter }                                                    from 'vue-router';
import { uid, extend, Dark }                                            from 'quasar';
import Global                                                           from '../helpers/Global';
import { useDesiprotokolleStore }                                       from 'src/stores/desiprotokolle.store';
import { storeToRefs }                                                  from 'pinia';
import { useNavStore }                                                  from 'src/stores/nav.store';
import { useAccountStore }                                              from 'src/stores/account.store';
import { useFahrzeugeStore }                                            from 'src/stores/fahrzeuge.store';
import { useAuditStore }                                                from 'src/stores/audit.store';
import { useFahrberichtStore }                                          from 'src/stores/fahrbericht.store';
import { useFahrberichteStore }                                         from 'src/stores/fahrberichte.store';

import dayjs                                                            from 'dayjs';
import duration                                                         from 'dayjs/plugin/duration';
import debug                                                            from 'debug';

dayjs.extend(duration);
const log       = debug('app:trips');
const global        = Global();
const router    = useRouter();

const desiprotokolleStore   = useDesiprotokolleStore();
const { data: desiData, timer } = storeToRefs(desiprotokolleStore);

const navStore  = useNavStore();
const { data: selectedFahrten } = storeToRefs(navStore);  

const accountStore  = useAccountStore();
const { fahrer, beifahrer } = storeToRefs(accountStore);

const fahrzeugeStore  = useFahrzeugeStore();
const { item: car } = storeToRefs(fahrzeugeStore);

const auditStore  = useAuditStore();
const fahrberichteStore  = useFahrberichteStore();
const fahrberichtStore  = useFahrberichtStore();

const   desiArt                 = ref<Array<any>>([]),
        desiBereich             = ref<any>({}),
        changeDataDialog        = ref(false),
        changeItemData          = ref({_id: null, item: {}}),
        saveDataDialog          = ref(false),
        errorDataDialog         = ref(false),
        confirmAbortDialog      = ref(false),
        selectedFahrt           = ref<any>([]),
        progress                = ref<any>({}),
        selectError             = ref('');

onActivated( () => {
    accountStore.setSecondHeader('Desinfektion')
    accountStore.setTitle('Desinfektion')
} )

// onBeforeUnmount( async () => {
//     accountStore.setTimer('00:00')
//     clearInterval(timerFunc)
// })

const  defaultProgress: {[key: string]: any} = {}

export interface IDefaultForm {
    _id?: string;
    art: string;
    changes: {[key: string]: any};
    protokoll: {[key: string]: any};
    desi: {[key: string]: any} | null;
    desiStartZeit: string;
    fahrer: string;
    beifahrer: string;
    car: string | null;
    bemerkung: string;
    appVersion: string;
    fbId: string | null;
    einsatzNummer: string | null;
}

const defaultForm: IDefaultForm =  {
    art: '',
    changes: {},
    protokoll: {},
    desi: null,
    desiStartZeit: dayjs().format('HH:mm'), //startzeit der desinfektion,
    fahrer: fahrer.value?.persId || '', //fahrer id
    beifahrer: beifahrer.value?.persId || '', //beifahrere id
    car: car.value?._id || null, //fahrzeug id
    bemerkung: '',
    appVersion: '6+',
    fbId: null, //findet die desinfektion bei einer Fahrt statt id des fahrberichts
    einsatzNummer: null, //findet die desinfektion bei einer Fahrt statt einsatznummer des fahrberichts,

};

//progressbar
watch( timer, function( newVal ) {
    if (newVal == null)
        return;

    let zeit = '0';

    for ( const key of Object.keys( progress.value ) ) {
        const item = progress.value[key]
        if (form.value.changes[key] && form.value.changes[key].zeit)
            zeit = form.value.changes[key].zeit
        else
            zeit = item.desiTime

        if (form.value.protokoll[key]) {
            const start = dayjs(desiprotokolleStore._desiStartTimer);
            const end = dayjs(timer.value);
            const seconds = end.diff(start, 'seconds')

            const timesplitSub = progress.value[key].subtractTime.split(':')
            const secondsSub = dayjs.duration({minutes: timesplitSub[0], seconds: timesplitSub[1] }).asSeconds();

            item.progress = (100 / ((parseInt(zeit || '0') * 60)) * ((seconds - secondsSub))) / 100
        }
    }
})

const form = ref<IDefaultForm>(extend(true, {}, defaultForm));

let timerFunc: any = null;

// watch( startTimer, ( newVal ) => {
//     form.value.desiStartZeit = dayjs().format('HH:mm');
//     if (newVal) {
//         clickArt();
//         desiprotokolleStore._startTimer = false;
//     }
// } )

//desinfektionsart auswählen
function clickArt ( stop?: boolean ) {
    form.value.desiStartZeit = dayjs().format('HH:mm');
    clearInterval(timerFunc)

    desiprotokolleStore._desiStartTimer = dayjs().format('YYYY-MM-DD HH:mm:ss')
    desiprotokolleStore._timer = dayjs().format('YYYY-MM-DD HH:mm:ss')

    if ( !stop )
        timerFunc = setInterval(() => {
            desiprotokolleStore._timer = dayjs().format('YYYY-MM-DD HH:mm:ss');
            desiprotokolleStore.setDiffTime()
        }, 1000);
}
//gibt es aktive Fahrten
const selTripsLength = computed( () => {
    return selectedFahrten.value.length
} )

watch( selTripsLength, () => {
        setDesiArt();
    },
    { immediate: true }
)

function setDesiArt() {
    if (selTripsLength.value === 0) {
        desiArt.value = [
            { 
                slot: 'regeldesinfektion',
                value: 'regeldesinfektion'
            },
            { 
                slot: 'sonderdesinfektion',
                value: 'sonderdesinfektion'
            },
            { 
                slot: 'abschlussdesinfektion',
                value: 'abschlussdesinfektion',
            } 
        ]

        //clickArt(true);
    } else {
        desiArt.value = [
            { 
                label: 'Fahrtdesinfektion',
                value: 'fahrtdesinfektion'
            }
        ]

        //form.value.art = 'fahrtdesinfektion';
        //clickArt();
    }

    //resetForm(true)
}

function createObj( newVal: any ) {
    newVal.forEach((item: any) => {
        if (item.bereich === 'Fahrerkabine') {
            item.sort = 1;
            item.sortParam = 2;
        }

        if (item.bereich === 'Patientenraum') {
            item.sort = 2;
            item.sortParam = 3;
        }

        if (item.bereich === 'Geräte') {
            item.sort = 3;
            item.sortParam = 1;
        }

        defaultForm.protokoll[item._id] = false
        defaultProgress[item._id] = { subtractTime: '00:00', progress: 0, desiTime: item.zeit}
    });

    progress.value = extend(true, {}, defaultProgress);
    form.value = extend( true, {}, defaultForm);
    if (newVal) {
        const arr = global.groupBy(newVal, 'sort')
        desiBereich.value = arr;
    }
}

function changeData (item: any) {
    if (!form.value.changes[item._id])
        form.value.changes[item._id] = {};

    changeItemData.value = { _id: item._id, item: {...form.value.changes[item._id]}};
    changeDataDialog.value = true;
}

async function saveData () {
    if (selectedFahrten.value.length === 0 ) {
        log('keine aktive fahrt')
        form.value._id = uid();

        form.value.desi = form.value.protokoll;

        auditStore.setItem({type: 'desinfektion', value: form.value});
    }

    if (selectedFahrten.value.length > 0) {
        if ( selectedFahrten.value.length === 1 )
            selectedFahrt.value = selectedFahrten.value

        for (const fb of selectedFahrt.value ) {
            form.value._id = uid();
            form.value.desi             = form.value.protokoll;
            const data = { ...form.value, ...{fbId: fb.item._id, einsatzNummer: fb.item.einsatzNummer} } 

            await auditStore.setItem({type: 'desinfektion', value: data});
            
            const navPoint = { ...fb.item, desiProt: true  }
            fahrberichtStore.updateItem(navPoint)

            log('formdata', data)  
        }
    }

    saveDataDialog.value = false;
    
    //setzte form zurück
    resetForm()
}

// setzte daten zurück und stoppe timer
function resetForm( redirect?: boolean ) {
    form.value = extend(true, {}, defaultForm)
    progress.value = extend(true, {}, defaultProgress)

    clearInterval(timerFunc)
    desiprotokolleStore._desiStartTimer = ''
    desiprotokolleStore._timer = null
    desiprotokolleStore._diffTime = ''

    if ( !redirect )
        router.push( '/app/fahrberichte' )
}

//prüfe ob es eine desinfektion angehakt wurde
function protokollItemTrue () {
    if ( !form.value.art )
        return false;

    let exists = false;
    for ( const item of Object.keys(form.value.protokoll) ) {
        if ( form.value.protokoll[item] )
            exists = true;
    }

    return exists;
}

function confirmSave () {
    const count = selectedFahrten.value.length;
    if ((count === 0 && protokollItemTrue()) || (count === 1 && protokollItemTrue()) || ( count > 1 && protokollItemTrue() && selectedFahrt.value.length > 0 ) ) {
        saveDataDialog.value = true;
        return;
    }
    
    if (count > 1 && selectedFahrt.value.length === 0) {
        errorDataDialog.value = true;
        selectError.value = 'Bitte wählen Sie mindestens eine Fahrt aus!';
        return;
    }

    if (!form.value.art) {
        errorDataDialog.value = true;
        selectError.value = 'Bitte wählen Sie eine Protokollart aus!';
        return
    }

    if (!protokollItemTrue()) {
        errorDataDialog.value = true;
        selectError.value = 'Bitte führen Sie mindestens eine Desinfektion durch!';
    }
}

function confirmAbort () {
    if ( protokollItemTrue() )
        confirmAbortDialog.value = true;
    else
        abort()
}

function abort () {
    confirmAbortDialog.value = false;
    resetForm();
    // global.setSelectedNavPoint()
}

function setChangeItemData () {
    if (changeItemData.value?._id)
        form.value.changes[changeItemData.value._id] = changeItemData.value.item
    changeDataDialog.value = false;
}

function removeChangeItemData (data: any) {
    form.value.changes[data._id] = null
}

// watch( desiData, (newVal) => {
//     createObj(newVal)
// })

createObj(desiData.value);

form.value.art = selectedFahrten.value && selectedFahrten.value.length > 0 ? '' : '';
</script>
