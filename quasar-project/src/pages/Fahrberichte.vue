<template>
    <div>
        <q-list separator>
            <template v-for="index in 3">
                <q-item class="trip-item q-px-xs" v-if="getTrips === null" :key="index">
                    <q-item-section avatar >
                        <q-skeleton width="40px" height="55px" type="QBtn"/>
                    </q-item-section>
                    <q-item-section class="q-ml-sm">
                        <q-skeleton type="text"/>          
                        <q-skeleton type="text"/>
                        <q-skeleton type="text"/>
                    </q-item-section>
                </q-item>
            </template>
            <template v-for="item in getTrips">
                <q-item class="trip-item q-px-xs" @click="showTrip(item)" :key='item._id' clickable :class="{'bg-red-2': item.changes, 'disableTrip': item.frei}" v-if="item.frei ? (dayjs().format('YYYY-MM-DD') == actDay ? true : false) : true">
                    <q-item-section  v-if="activeItem(item)" avatar class="item-arrow q-pl-none q-mr-xs" :class="{ 'sendStatusRead': !item.sendStatusRead }">
                        <q-icon name="fas fa-angle-right" size="lg" class=" q-pr-none q-pl-xs" :class="{'text-primary': item.sendStatusRead, 'text-white': !item.sendStatusRead }" />
                    </q-item-section>
                    <q-item-section v-else avatar class="item-arrow rounded-borders q-mr-xs" :class="{ 'sendStatusRead': !item.sendStatusRead }"></q-item-section>
                    <q-item-section class="q-ml-sm">
                        <q-item-label :class="[item.infektion ? 'bg-orange text-white' : '', darkMode ? 'text-white' : 'text-negative']" class=" text-weight-medium text-body1 q-px-sm">{{setTimeText(item)}}</q-item-label>
                        <div class="row">
                            <div class="col" v-if="item.materialfahrt">
                                <q-item-label class="text-body1 q-pa-sm">Materialfahrt</q-item-label>
                            </div>  
                            <div class="col" v-if="!item.materialfahrt">
                                <q-item-label v-if="(item.type === 'Serie' || item.type === 'Spontan' || item.type === 'Konsil') && ( item.patName || item.patSurname )" class="text-body1 q-pa-sm">
                                    {{item.patSurname}}, {{item.patName}}
                                </q-item-label>
                                <q-item-label v-if="!item.patName && !item.patSurname && item.type !== 'Linie'" class="text-body1 q-pa-sm">Keine Patientenangaben vorhanden</q-item-label>
                                <q-item-label v-if="item.type == 'Linie'" class="text-body1 q-pa-sm">Linie: {{item.titel}}</q-item-label>
                                <q-item-label v-if="item.type === 'Materialfahrt'" class="text-body1 q-pa-sm">Materialfahrt</q-item-label>
                            </div>
                            <div class="col-4" v-if="item.type === 'Serie' || item.type === 'Spontan' || item.type === 'Konsil'">
                                <div class="row">
                                    <div class="col-2">
                                        <q-icon name="fas fa-circle" v-if="item.color" :style="{ color: item.color }" style="margin-top: 12px" />
                                    </div>
                                    <div class="col item-right text-body1 q-pa-sm text-weight-medium">
                                        {{item.einsatzNummer}}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <q-linear-progress size="10px" stripe rounded :color="setProgressColor(item)" :value="progress[item._id]"/>
                    </q-item-section>
                </q-item>
            </template>
        </q-list>
        <q-dialog
            :model-value="previewFb"
            @update:model-value="(val) => { fahrberichteStore.setPreviewFb(val); accountStore.setTitle('Fahrten'); }"
            persistent
            :maximized="true"
            transition-show="jump-down"
            transition-hide="jump-down">
            <q-card :class="[device.platform == 'android' ? 'saveAreaAndroid' : '']">
                <q-card-actions class="row q-px-sm q-pt-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                    <div class="q-pr-sm" :class="{'col-6': fbItem && fbItem.date === dayjs().format('YYYY-MM-DD'), 'col-12': fbItem && fbItem.date !== dayjs().format('YYYY-MM-DD')}">
                        <q-btn unelevated class="full-width text-body1" padding="6px" @click="closePreview()" color="negative" >
                            <div class="ellipsis">
                                Zurück
                            </div>
                        </q-btn>
                    </div>
                    <div class="col-6 q-pl-sm" v-if="fbItem && fbItem.date === dayjs().format('YYYY-MM-DD') && fbItem.frei && fbItem.type !== 'Linie'">
                        <q-btn unelevated class="full-width text-body1" padding="6px" @click="showInsertData" color="primary" >
                            <div class="ellipsis">
                                Daten ergänzen
                            </div>
                        </q-btn>
                    </div>
                    <div class="col-6 q-pl-sm" v-if="fbItem && fbItem.date === dayjs().format('YYYY-MM-DD') && !fbItem.frei">
                        <q-btn unelevated class="full-width text-body1" padding="6px" @click="showAskDialog()" color="primary" >
                            <div class="ellipsis">
                                Fahrt annehmen
                            </div>
                        </q-btn>
                    </div>
                </q-card-actions>
                <q-list class="default-maximized-modal">
                <fahrbericht-view v-if="fbItem"/>
                </q-list>
            </q-card>
        </q-dialog>
        <InsertDataDialog v-if="insertDataDialog" :insertDataDialog="insertDataDialog" :actItem="fbItem" @close="showInsertData" />
        <Dialog 
            v-if="askDialog"
            text="Diese Fahrt wurde schon begonnen. Möchten Sie die Fahrt fortsetzen oder neu beginnen?" 
            abortLabel="Neu beginnen" 
            okLabel="Fortsetzen" 
            :func="tripAccept" 
            :funcAbort="tripAccept" 
            :abortParam="true"
            :modelValue="askDialog"  
            @update:modelValue="(val) => askDialog = val"  
        />
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, ref }                      from 'vue';
import { useRouter }                                                from 'vue-router';
import Dialog                                                       from '../components/Dialog.vue';
import FahrberichtView                                              from 'src/components/FahrberichtView.vue';
import InsertDataDialog                                             from 'src/components/InsertDataDialog.vue';
import { useAccountStore }                                          from 'src/stores/account.store';
import * as FahrberichtModule                                       from 'src/stores/fahrbericht.store';
import { useFahrberichtStore }                                      from 'src/stores/fahrbericht.store';
import { useFahrberichteStore }                                     from 'src/stores/fahrberichte.store';
import { useMenuStore, IFahrbericht }                               from 'src/stores/menu.store';
import { useAuditStore }                                            from 'src/stores/audit.store';
import { useNavStore }                                              from 'src/stores/nav.store';
import { useSerienKategorienStore }                                 from 'src/stores/serienkategorien.store';
import { useSettingsStore }                                         from 'src/stores/settings.store';
import { extend, Dark }                                             from 'quasar';
import dayjs                                                        from 'dayjs';
import { storeToRefs, defineStore }                                 from 'pinia';
import debug                                                        from 'debug';
import axios                                                        from 'src/boot/axios';

const log                                  = debug('app:fahrberichte')
const accountStore                         = useAccountStore()
const { darkMode, device }                 = storeToRefs(accountStore)

const fahrberichtStore                     = useFahrberichtStore()
const { item: fbItem }                     = storeToRefs(fahrberichtStore)

const fahrberichteStore                    = useFahrberichteStore()
const {data: getTrips, previewFb, actDay } = storeToRefs(fahrberichteStore)

const menuStore                            = useMenuStore()
const {progress}                           = storeToRefs(menuStore)

const auditStore                           = useAuditStore()

const settingsStore                        = useSettingsStore()
const {item: settings}                     = storeToRefs(settingsStore)

const navStore                             = useNavStore()
const {searchItem: searchNavPoint}         = storeToRefs(navStore)

const serienKategorienStore                = useSerienKategorienStore()
const {data: serienKategorien}             = storeToRefs(serienKategorienStore)

const   askDialog             = ref(false),
        actItem               = ref({}),
        insertDataDialog      = ref(false),
        insertData            = ref({});

const router = useRouter()

onBeforeMount( async () => {
    accountStore.setSecondHeader('Fahrberichte')
    accountStore.setTitle('Fahrten')
})

function showInsertData () {
    if ( insertDataDialog.value ) 
        insertDataDialog.value = false;
    else    
        insertDataDialog.value = true;
}

async function showTrip ( item: IFahrbericht ) {
    if ( item.frei ) {
        if ( item.type === 'Spontan' || item.type === 'Konsil' )
            insertData.value = extend( true, {}, item );

        fahrberichteStore.setPreviewFb( true );
        fahrberichtStore.setShowItem( item );

        actItem.value = item;
        return;
    }

    const existNavPoint = searchNavPoint.value(item._id);

    await fahrberichteStore.setSendungsStatus( (existNavPoint && existNavPoint.item) || item );

    if (existNavPoint) {
        actItem.value = item;
        navStore.setSelected(existNavPoint)
        fahrberichtStore.setShowItem( item );
        router.push( `/app/fahrberichtactiv/${item._id}`)
    } else {
        fahrberichtStore.setShowItem( item );
        fahrberichteStore.setPreviewFb( true );
        actItem.value = item;
    }
}

function showAskDialog () {
    const fb = fbItem.value;
console.log('11111', fb)
    if ( fb && (fb.startBegin || fb.startEnd || fb.ziel || fb.zielBegin || fb.frei) )
        askDialog.value = true;
    else
        tripAccept();
}

async function tripAccept (removeTimestamps?: boolean) {
    // register dynamic module for data handling
    log( 'create dynamic trip', fbItem.value?._id );
    if (!fbItem.value)
        return

    try {
        navStore.setSelected({})
        fahrberichteStore.setPreviewFb(false);

        if (removeTimestamps) {
            await fahrberichtStore.resetTimestamps();
            await auditStore.setItem({type: 'fahrbericht', value: fbItem.value, fb: fbItem.value, noAlert: true });
        }
        //create dynamed store für fb
        const useDynamedStore = defineStore( fbItem.value._id, FahrberichtModule.fahrberichtModule());
        const dynamedStore: any = useDynamedStore();
        dynamedStore.setAcceptItem(fbItem.value);
        const title = navStore.setTitle(fbItem.value)
        accountStore.setTitle(title || '')
        router.push(`/app/fahrberichtactiv/${fbItem.value._id}`)
        setTimeout( async () => {
            await menuStore.setStatus({fbId: fbItem.value?._id})
        } )
    } catch (err) {
        log( 'Error creating trip', err );
    }
}

function activeItem (item: IFahrbericht) {
    return searchNavPoint.value(item._id);
}

function setProgressColor ( fb: IFahrbericht ) {
    let color =  'secondary';

    if ( progress.value[fb._id] < 1)
        color = 'negative'
    
    if ( progress.value[fb._id] === 1 && fb.infektion && !fb.desiProt)
        color = 'orange'

    return color;
}

function setTimeText( item: IFahrbericht ) {
    let displayTime = '';

    if (settings.value.showAusrueckzeit && item.ausrueckZeit && item.type !== 'Linie') {
        displayTime = 'Ausrückzeit: ' + item.ausrueckZeit;
    }

    if (displayTime) {
        displayTime += ' / ';
    } else {
        displayTime = '';
    }

    if (settings.value.zuweisZeit && item.zuweisZeit) {
        displayTime += 'Abholzeit: ' + item.zuweisZeit;
    } else {
        displayTime += 'Abholzeit: ' + item.startTime;

        if (item.startTimeBis) {
            displayTime += ' - ' + item.startTimeBis;
        }
    }

    return displayTime;
}

function closePreview () {
    fahrberichteStore.setPreviewFb( false );
    accountStore.setSecondHeader('Fahrberichte');
    accountStore.setTitle('Fahrten')
}
</script>

<style scoped lang="scss">
    .disableTrip, .disableTrip div{
        color: $blue-grey-6 !important;
        background-color: $blue-grey-2 !important
    }
    .item-arrow{
        min-width: 44px;
        min-height: 70px;

        max-width: 45px;
    }

    .horizon-line {
        min-width: 50px;
        min-height: 5px;
        background-color: $primary;
        display: inline-flex;
    }

    .sendStatusRead, .body--dark .sendStatusRead{
        background-color: $primary !important;
        color: black
    }

</style>
