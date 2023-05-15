<template>
    <div >
        <q-layout view="lHh Lpr lFf" container :class="[device.platform === 'ios' ? 'layoutHeightIos' : 'layoutHeight', (isScanning ? 'bg-transparent' : '')]" >
           
            <q-dialog v-model="lockDevice" v-if="lockDevice" persistent class="unlockDialog">
                <q-card style="background: 'transparent'">
                    <q-card-actions vertical align="bottom">
                        <q-list >
                            <q-slide-item class="lock" left-color="secondary"  @left="setUnlockDevice">
                                <template v-slot:left>
                                    <q-icon name="fas fa-lock-open" />
                                </template>
                                <q-item style="height: 50px">
                                    <q-item-section avatar>
                                        <q-avatar color="primary" text-color="white" icon="fas fa-lock" />
                                    </q-item-section>
                                    <q-item-section class="text-body1 text-bold" > >> Entsperren</q-item-section>
                                </q-item>
                            </q-slide-item>
                        </q-list>
                    </q-card-actions>
                </q-card>
            </q-dialog>
            
            <q-header v-if='!isScanning' elevated >
                <q-toolbar class="bg-secondary">
                    <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
                    <q-badge align="bottom" v-if="unread" color="negative">{{unread}}</q-badge>
                    <q-separator class="q-ml-sm" dark vertical inset />
                    <q-toolbar-title class="text-weight-medium">{{ title }}</q-toolbar-title>
                    <q-space />
                    <q-btn flat dense round icon="lock" aria-label="Menu" @click="setLockDevice" />

                </q-toolbar>
                <q-toolbar class="bg-primary" v-if="timer && title === 'Desinfektion'">
                    <q-toolbar-title class="text-bold text-center">Timer: {{ timer }}</q-toolbar-title>
                    <q-btn  color="negative" @click="setStartTimer()" size="sm" icon="fas fa-history" />
                </q-toolbar>
                <div class="bg-white row q-pa-sm" style="min-height: 65px" v-show="secondHeader=='trips'">
       
                    <div class="col-4 q-pr-xs">
                        <q-btn align="center" class="full-width col-6 text-body1" padding="6px" :color="btnColorToday" @click="changeDay('today')" >
                        <div class="ellipsis">
                                {{ setNextDayLabel('today') }}
                            </div>
                        </q-btn>
                    </div>
                    <div class="col-4 text-body1 text-center ellipsis text-bold text-white bg-secondary" style="padding-top: 6px">
                        {{actDay}}
                    </div>
                    <div class="col-4 q-pl-xs">  
                        <q-btn align="center" class="full-width col-6 ellipsis text-body1" padding="6px" :color="btnColorNext" @click="changeDay('next')" >
                        <div class="ellipsis">
                                {{ setNextDayLabel('next')}}
                            </div>
                        </q-btn>
                    </div>
                    <div v-show="!disable" class="col-12 text-primary">
                        <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
                    </div>
                    <div v-show="disable" class="col-12 text-primary">
                        <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
                    </div>
              
                </div>
                <div class="bg-white row q-pa-sm" style="min-height: 65px" v-show="secondHeader=='messages'">
       
                   <div class="col-6 q-pr-xs">
                        <q-btn class="full-width ellipsis text-body1" padding="6px" color="negative" @click="setSelectedText('Besatzung bittet um Rückruf!')" >
                            <div class="ellipsis">
                                Rückruf anfordern
                            </div>
                        </q-btn>
                    </div>
                    <div class="col-6 q-pl-xs">
                        <q-btn class="full-width ellipsis text-body1" padding="6px" color="primary" @click="showTextSnippets = true" >
                        <div class="ellipsis">
                                Textbausteine
                            </div>
                        </q-btn>
                    </div>

                    <div v-show="!messengerLoad" class="col-12 text-primary">
                        <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
                    </div>
                    <div v-show="messengerLoad" class="col-12 text-primary">
                        <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
                    </div>
              
                </div>
                <div class="bg-white row q-pa-sm" v-if="secondHeader == 'employee'">
                    <div class="col-6 q-pr-xs">
                        <q-btn class="full-width ellipsis text-body1" padding="6px" :color="pers == 'fahrer' ? 'negative' : 'primary'" @click="loadDienstplan('fahrer')" >
                         <div class="ellipsis">
                                {{getKrz('fahrer')}}
                            </div>
                        </q-btn>
                    </div>
                    <div class="col-6 q-pl-xs">
                        <q-btn class="full-width ellipsis text-body1" padding="6px" :color="pers == 'beifahrer' ? 'negative' : 'primary'" @click="loadDienstplan('beifahrer')" >
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
                <q-toolbar class="bg-white" v-show="secondHeader == 'contacts'">
                    <div class="col-12 q-py-md">
                        <q-input filled v-model="search" @input="searchContacts()" clearable label-color="primary" label="Suche" >
                            <template v-slot:prepend>
                                <q-icon color="primary" name="place" />
                            </template>
                        </q-input>
                    </div>
                </q-toolbar>
    
                <q-toolbar class="bg-white row q-pa-sm" v-show="secondHeader == 'cardreader'">
                    <div class="col-6 q-pr-xs">
                        <q-btn class="full-width ellipsis text-body1" padding="6px" color="primary" @click="cardReaderStore.startPairing">
                            <div class="ellipsis">
                                Gerät Koppeln
                            </div>
                        </q-btn>
                    </div>
                    <div class="col-6 q-pl-xs">
                        <q-btn class="full-width ellipsis text-body1" padding="6px"  color="primary" @click="cardReaderStore.readCard">
                            <div class="ellipsis">
                                EGK lesen
                            </div>
                        </q-btn>
                    </div>
                </q-toolbar>
            </q-header>
            <q-drawer v-if="!isScanning" v-model="leftDrawerOpen" show-if-above bordered class="menu-drawer bg-grey-1">
                <div class="row bg-grey-1 logoCont">
                    <div class="col text-center q-pt-sm">
                        <img id="logo" src="~assets/dispologo.png" style="width: 100px;" />
                    </div>
                </div>
                <q-item class="menu-item bg-primary text-white q-pr-none absolut-top">
                    <q-item-section avatar>
                        <q-icon name="fas fa-ambulance" class="q-ml-md" />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label class="text-bold">{{selectedCar.name}}</q-item-label>
                    </q-item-section>

                    <q-item-section avatar :class="carStatus.status" class="text-white menu-status">
                        <q-icon style="margin-right: 15px; font-size: 35px"  :name="networkConnected ? 'wifi_tethering' : 'wifi_tethering_off'"  />
                    </q-item-section>
                </q-item>
                <q-list style="overflow-y: auto" class="scrollarea-default-height">
                    <MenuLink 
                        v-for="link in linksList" 
                        :key="link.title" 
                        :item="link" 
                        v-if="showMenuLink(link)"
                    />
                </q-list>
            </q-drawer>
            
            <q-page-container class="layoutHeightIos2" v-if="loadedData" :style="{ overflow: 'hidden'}" >
                
                <keep-alive include="Desinfection">
                    <router-view/>
                </keep-alive>
            </q-page-container>
        </q-layout>
        <Dialog text="Möchten Sie sich wirklich ausloggen?" :value="logoutDialog" :func="callLogout" @input="(val) => logoutDialog = val"  />
        <Dialog text="Möchten Sie wirklich den Rückruf eines Disponenten anfordern?" :value="callDialog" :func="menuStore.callDisposition" @input="(val) => accountStore.setCallDialog(val)"  />
        <Dialog v-if="specialrightDialog" :text="specialRightsDiaText" :value="specialrightDialog" okLabel="Ok" :abortShow="false" @input="(val) => specialrightDialog = val"  />
        <Dialog v-if="pauseDialog" text="Sie haben mindestens eine aktive Fahrt! Sie können nicht in die Pause gehen!" :value="pauseDialog" okLabel="Ok" :abortShow="false" @input="(val) => accountStore.setPauseDialog(val)"  />
        <Dialog v-if="informPause" text="Sie wurden von der Leitstelle in die Pause geschickt!" :value="informPause" okLabel="Ok" :abortShow="false" @input="(val) => menuStore.informStatusPause(val)"  />
        <Dialog text="Eine Ihrer Fahrten wurde geändert. Bitte prüfen!" :abortShow="false" okLabel="OK" :value="adressChange" @input="(val) => menuStore.setAdressChange(val)"  />
        <Dialog 
            v-if="sendAppCarNote.note" 
            headertext="Nachricht von Zentrale!" 
            :text="sendAppCarNote.note" 
            :abortShow="false" 
            okLabel="Gelesen" 
            :value="sendAppCarNote.note ? true : false" 
            @input="(val) => readAppCarNote()"  
        />
        <Dialog 
            v-if="lastDeletedItem && lastDeletedItem.item" 
            :value="lastDeletedItem.item ? true : false" 
            :text="setDeleteText(lastDeletedItem)" 
            okLabel="Ok" 
            :func="fahrberichteStore.setLastDeletedItem" 
            :abortShow="false" 
        />
        <Dialog v-if="noSpecialRightsAllowed" text="Während eines Linientransports können keine Sonderrechte gesetzt werden!" :value="pauseDialog" okLabel="Abbrechen" :abortShow="false" @input="(val) => noSpecialRightsAllowed = val"  />

        <Dialog 
            text="Soll der ausgewählte Tag wirklich geladen werden? Ihre mobile Datenmenge wird durch diese Funktion stark verbraucht!" 
            abortLabel="Nein" 
            okLabel="Ja" 
            :func="loadDay" 
            :value="changeDayDialog"  
            @input="(val) => changeDayDialog = val"  
        />

        <q-dialog
            v-model="confirmSpecialRights"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card class="bg-white" style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Sonderrechte
                </q-bar>
                <q-form greedy no-error-focus ref="specialRightsForm">
                    <div class="row q-px-xl q-py-sm" v-if="navItems.length > 1">
                        <div class="col-12">
                            <q-select 
                                filled 
                                use-chips
                                v-model="selectedFahrten" 
                                :options="navItems" 
                                label="Fahrten..."
                                emit-value
                                map-options
                                multiple
                                :rules="[ val => val.length > 0 || 'Bitte wählen Sie mindestens 1 Fahrt aus' ]"
                            >
                                <template v-slot:option="scope">
                                    <q-item
                                        v-if="scope.opt.item.type !== 'Linie'"
                                        v-bind="scope.itemProps"
                                        v-on="scope.itemEvents">
                                        <q-item-section >
                                            <q-item-label class="text-body1"> {{scope.opt.patSurname}} {{scope.opt.patName}} <span class="text-negative">{{scope.opt.sonderrechte ? '(bereits eingeschaltet)' : ''}}</span></q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </template>
                                <template v-slot:selected-item="scope">
                                    <q-chip
                                        @remove="scope.removeAtIndex(scope.index)"
                                        v-bind="scope.itemProps"
                                        v-on="scope.itemEvents"
                                        removable>
                                        {{scope.opt.patSurname}} {{scope.opt.patName}}
                                        
                                    </q-chip>
                                </template>
                            </q-select>
                        </div>
                    </div>
                    <div class="row q-px-xl q-py-sm">
                        <div class="col-12">
                            <q-input inputmode="text" type="textarea" filled label-color="primary" autogrow v-model="specialRightText" label="S. Bemerkung"/>
                        </div>
                    </div>
                    <q-separator />
                    <q-card-actions class="row q-px-lg q-py-sm bg-grey-3">
                        <div class="col-6 q-px-sm">
                            <q-btn class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Abbrechen" />
                        </div>
                        <div class="col-6 q-px-sm">
                            <q-btn class="full-width text-body1" padding="6px" color="primary" @click="setSpecialRights()" label="Einschalten" />
                        </div>
                    </q-card-actions>
                </q-form>
            </q-card>
        </q-dialog>

        <q-dialog
            :value="showTextSnippets"
            @input="showTextSnippets = false"
            persistent
            full-height
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card class="bg-white" style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Textbausteine
                </q-bar>
                <div class="row q-mx-sm bg-white" >
                    <q-list seperator style="width: 100vw" class="bg-white default-fullheight-modal">
                        <div class="col-12" v-for="(item, index) of textBausteine">
                            <q-btn :key="index" color="secondary" no-caps class="full-width q-my-sm q-px-xs ellipsis text-body1" padding="6px" :label="item.text" align="left" @click="clickTextbaustein(item.text)" />
                        </div>
                    </q-list>
                </div>
                <div class="row">
                    <div class="col-12 q-pa-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Schliessen" />
                    </div>
                </div>
            </q-card>
        </q-dialog>
    </div>
</template>

<script type="ts" setup>
import { onBeforeMount, ref, watch, onUnmounted }                               from 'vue';
import  { useRouter }                                                           from 'vue-router';
import MenuLink                                                                 from '../components/MenuLink.vue';
import Global                                                                   from '../helpers/Global';
import dayjs                                                                    from 'dayjs';
import Dialog                                                                   from '../components/Dialog.vue';
import { QSpinnerFacebook, Loading, Notify }                                    from 'quasar';
import { useAccountStore }                                                      from 'src/stores/account.store';
import { useFahrzeugeStore }                                                    from 'src/stores/fahrzeuge.store';
import { useInventarStore }                                                     from 'src/stores/inventar.store';
import { useMenuStore }                                                         from 'src/stores/menu.store';
import { useSocketStore }                                                       from 'src/stores/socket.store';
import { useFahrberichteStore }                                                 from 'src/stores/fahrberichte.store';
import { useNavStore }                                                          from 'src/stores/nav.store';
import { useDienstplanStore }                                                   from 'src/stores/dienstplan.store';
import { useSettingsStore }                                                     from 'src/stores/settings.store';
import { useMessangerStore }                                                    from 'src/stores/messanger.store';
import { usePatientenStore }                                                    from 'src/stores/patienten.store';
import { useKostentragerStore }                                                 from 'src/stores/kostentraeger.store';
import { useDesiprotokolleStore }                                               from 'src/stores/desiprotokolle.store';
import { useSerienKategorienStore }                                             from 'src/stores/serienkategorien.store';
import { useInfektionenStore }                                                  from 'src/stores/infektionen.store';
import { useCoststatusState }                                                   from 'src/stores/coststatus.store';
import { useSonderleistungenStore }                                             from 'src/stores/sonderleistungen.store';
import { useFahrberichtStore }                                                  from 'src/stores/fahrbericht.store';
import { useAudioStore }                                                        from 'src/stores/audio.store';
import { useAuditStore }                                                        from 'src/stores/audit.store';
import { useCardreaderStore }                                                   from 'src/stores/cardreader.store';
import { storeToRefs }                                                          from 'pinia';

import debug                                                                    from 'debug';
const log                                                                       = debug('app:MainLayout');

const accountStore                                                             = useAccountStore();
const   { 
            title, 
            timer, 
            secondHeader, 
            sendAppCarNote, 
            connected:          networkConnected,
            device,
            pauseDialog,
            lockDevice,
            callDialog
        } = storeToRefs(accountStore);

const fahrzeugeStore  = useFahrzeugeStore();
const { item: selectedCar } = storeToRefs(fahrzeugeStore);

const inventarStore = useInventarStore();
const { countItems: carCountItems } = storeToRefs(inventarStore);

const menuStore = useMenuStore();
const { item: carStatus, adressChange, informPause } = storeToRefs(menuStore);

const fahrberichteStore = useFahrberichteStore();
const { actDay, lastDeletedItem } = storeToRefs(fahrberichteStore);

const navStore = useNavStore();
const { item: navItems, selected: selectedNavPoint } = storeToRefs(navStore);

const dienstplanStore = useDienstplanStore();
const { pers } = storeToRefs(dienstplanStore);

const settingsStore = useSettingsStore();

const messengerStore = useMessangerStore();
const { data: textBausteine, messengerLoad, unread} = storeToRefs(messengerStore);

const cardReaderStore = useCardreaderStore();
const { isScanning } = storeToRefs(cardReaderStore);

const audioStore = useAudioStore();
const patientenStore = usePatientenStore();
const kostentraegerStore = useKostentragerStore();
const desiprotokolleStore = useDesiprotokolleStore();
const serienkategorienStore = useSerienKategorienStore();
const infektionenStore = useInfektionenStore();
const coststatusStore = useCoststatusState();
const sonderleistungenStore = useSonderleistungenStore();
const fahrberichtStore = useFahrberichtStore();
const auditStore = useAuditStore();

const   leftDrawerOpen          = ref(false),
        search                  = ref(''),
        disable                 = ref(true),
        disableDienst           = ref(false),
        btnColorToday           = ref('negative'),
        btnColorNext            = ref('primary'),
        specialrightDialog      = ref(false),
        confirmSpecialRights    = ref(false),
        specialRightsDiaText    = ref(''),
        selectedFahrten         = ref([]),
        specialRightText        = ref(''),
        specialRightsForm       = ref(),
        logoutDialog            = ref(false),
        changeDayDialog         = ref(false),
        noSpecialRightsAllowed  = ref(false), 
        selectedDay             = ref(''),
        showTextSnippets        = ref(false),
        loadedData              = ref(false);

const { router }                = useRouter();
const global                    = Global();

const linksList = ref(global.navigation);

onBeforeMount( async () => {
    const progressData = {
        spinner: QSpinnerFacebook,
        spinnerColor: 'primary',
        spinnerSize: 140,
        backgroundColor: 'grey-8',
        message: 'Daten für den Tag werden geladen...',
        messageColor: 'white'
    }

    const day = dayjs().format('YYYY-MM-DD')

    Loading.show(progressData)
    
    try {
        dienstplanStore.setPers('')
        log('setPers')

        if ( accountStore.device.value.platform === 'android' ) {
            await accountStore.initKeyboardListener();
            log('initKeyboardListener done')
        }

        await fahrzeugeStore.getCarFromStorage();
        log('getCarFromStorage done')
        await inventarStore.getData(selectedCar.value._id);
        log('getCarItems done')
        await serienkategorienStore.getData();
        log('getSerienKategorien done')
        await patientenStore.getData();
        log('getPatientenData done')
        await kostentraegerStore.getData();
        log('getKostentraegerData done')
        await sonderleistungenStore.getData();
        log('getSonderleistungen done')
        await desiprotokolleStore.getData();
        log('getDesiData done')
        await infektionenStore.getData();
        log('getInfektionsData done')
        await coststatusStore.getData();
        log('getCostStatusData done')
        await settingsStore.getData();
        log('getSettings done')
        await accountStore.checkkNaviagtionApps();
        log('checkkNaviagtionApps done');
        audioStore.init();
        log('audioInit done');
        await accountStore.setStandartNavigation();
        log('setStandartNavigation done')
        await messengerStore.getMessages({index: 0});
        log('getMessages done')
        await messengerStore.getData();
        log('getTextSnippets done');

        //get navigation points
        linksList.value = global.navigation.filter( (item) => {
            log(item)
            if ( settingsStore.settings.value.kontakte === 1 && item.link === 'contact' )
                return false
            else if ( settingsStore.settings.value.dienstplan === 1 && item.link === 'checklistEmployee' )
                return false
            else
                return true
        } );

        loadDay(day);

        loadedData.value = true;

        Loading.hide();

        const welcome = Notify.create({
            message: '<div class="text-bold">dispolive ist nun einsatzbereit.</div>Wir wünschen Ihnen einen angenehmen Arbeitstag.',
            position: 'center',
            progress: true,
            timeout: 3000,
            html: true,
            color: 'secondary',
            classes: 'glossy',
            actions: [
                { label: 'Schliessen', glossy:true, class:'bg-teal-8',  color: 'white', handler: () => { welcome(false) } }
            ]
        })
    } catch (err) {
        Loading.hide();

        Notify.create({
            message: '<div class="text-bold">Fehler beim laden der Daten!</div>Sie wurden zum Login weitergeleitet.',
            position: 'center',
            progress: true,
            timeout: 5000,
            html: true,
            color: 'negative',
            classes: 'glossy',
        })

        callLogout();
    }
});

onUnmounted( () => {
    useSocketStore.remove();
} )

function setLockDevice () {
    accountStore.setLockDevice(true)
}

function setUnlockDevice () {
    accountStore.setLockDevice(false)
}

async function loadDay () {
    disable.value = true;

    const day = selectedDay.value === 'next' ? dayjs(actDay.value, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
    switch (selectedDay.value) {
        case 'next':
            fahrberichteStore.setActDay(day);
            await fahrberichteStore.getData(day);
            break;
        default:
            fahrberichteStore.setActDay(day);
            await fahrberichteStore.getData(day);
            break;
    }

    disable.value = false;
}

function changeDay ( item ) {
    changeDayDialog.value = true;
    selectedDay.value = item;
}   

async function loadDienstplan( pers ) {
    disableDienst.value = true;

    dienstplanStore.setPers(pers);

    const person = [pers].value;

    await dienstplanStore.getData(person);

    disableDienst.value = false;
}

function searchContacts () {
    accountStore.setSearchContacts(search.value)
}

function setDeleteText ( item ) {
    let text = item.item.patSurname + ', ' + item.item.patName;

    if ( !item.item.patSurname && !item.item.patName && !item.item.materialfahrt)
        text = 'Keine Patientenangaben vorhanden'

    if ( item.item.type === 'Linie' )
        text = item.item.titel

    if ( item.item.materialfahrt )
        text = 'Materialfahrt'

    return `Die Fahrt <b>${text}</b> wurde Ihnen vom Disponenten entzogen!`
}

function setNextDayLabel ( type ) {
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

function getKrz(pers) {
    const person = [pers].value;
    
    if ( person.name )
        return `${person.surname}, ${person.name}`
}

function setSpecialRights () {
    specialRightsForm.value.validate().then( async (success) => {
        if ( success ) {
            confirmSpecialRights.value = false;

            for ( const fb of selectedFahrten.value ) {
                const data = {
                    _id:            fb._id,
                    car:            selectedCar.value._id,
                    sonderrechte:   1,
                    status:         'sonderrechte'
                }

                const sonderBemerkung = {
                    _id:                fb._id,
                    sonderBemerkung:    specialRightText.value
                }
    
                await auditStore.setItem({ type:'zeitstempel', value: data });
                await auditStore.setItem({ type:'sonderNotice', value: sonderBemerkung, noAlert: true });
                await menuStore.setStatus({status: 'sonderrechte'});   
            }
        }
    } )
}

async function specialrights () {
    specialRightText.value = '';

    if (navItems.value.length === 0) {
        specialRightsDiaText.value  = 'Sonderrechte können nur während einer aktiven Fahrt gesetzt werden!'
        specialrightDialog.value    = true;
        return 
    }

    if (navItems.value.length === 1 && navItems.value[0].item.type === 'Linie') {
        specialRightsDiaText.value  = 'Sonderrechte können nicht für eine Linie eingeschaltet werden!'
        specialrightDialog.value    = true;
        return 
    }

    if (navItems.value.length === 1 && navItems.value[0].item.sonderrechte) {
        specialRightsDiaText.value  = 'Für diese Fahrt wurden bereits Sonderrechte eingeschaltet'
        specialrightDialog.value    = true;
        return 
    }

    if (navItems.value.length > 1 ) {
        specialRightsDiaText.value  = 'Sonderrechte können nicht gesetzt werden, wenn 2 oder mehr Fahrten angenommen wurden.'
        specialrightDialog.value    = true;
        return 
    }

    selectedFahrten.value = [];

    let selectedLinie = false;

    if ( navItems.value.length === 1 ) {
        if (!selectedFahrten.value.sonderrechte && !selectedFahrten.value.type !== 'Linie')
            selectedFahrten.value.push(navItems.value[0].item);

        if ( selectedFahrten.value.type === 'Linie' )
            selectedLinie = true;
    } else {
        navItems.value.every( item => {
            if ( selectedFahrten.value.type === 'Linie' ) {
                selectedLinie = true;
                return false;
            }

            if (item.item && !item.item.sonderrechte && item.item.type !== 'Linie')
                selectedFahrten.value.push(item.item);

            return true;
        } )
    }

    if (selectedLinie)
        noSpecialRightsAllowed.value = true;

    if (navItems.value.length === 1 && !selectedLinie) {
        confirmSpecialRights.value = true;
    }
}

function showMenuLink ( link ) {
    if ( device.value.platform === 'android' && link.link === 'cardreader' )
        return false

    if ( !carCountItems.value && link.link === 'checklistCar')
        return false

    return true
}

async function pause () {
    const stat = await menuStore.setStatus({status: 'pause'});
    if (stat && stat.error) {
        accountStore.setPauseDialog(true)
    }
}

function readAppCarNote() {
    accountStore.msgRead( sendAppCarNote.value )
    accountStore.sendAppCarNote({car: selectedCar.value._id});
}

watch( navItems, ( newVal ) => {
    log('observe navItems length', newVal, carStatus.value)
    if ( carStatus.value.status === 'pause' )
        return

    if (newVal.length === 0)
        menuStore.setStatus({status: 'frei'});
    
    //check if navItem specalrights
    if ( carStatus.value.sonderrechte ) {
        let sonderrechteExists = false
        newVal.forEach( ( nav ) => {
            if ( nav.sonderrechte )
                sonderrechteExists = true
        } )

        if (!sonderrechteExists) {
            menuStore.setSonderrechteApp(false)
        }
    }

    if (newVal.length > 0) {
        const status = newVal.find( (item) => {
            if ( !item.item.zielBegin )
                return true
            else
                return false
        } )

        if (!status)
            menuStore.setStatus({status: 'zielBegin'});
    }
} )

watch( selectedNavPoint, async ( item ) => {
    if (item.item && item.item._id)
        fahrberichtStore.setActTrip( item.item );

    if (item.title && !item.function && item.title !== 'Logout')
        accountStore.setTitle( item.title );

    if (item.function) {
        if ( item.function === 'specialrights' )
            specialrights()

        if ( item.function === 'pause' ) {
            await pause()
        }

        return true;
    }

    if (item.link)
        switch ( item.link) {
            case 'logout':
                logoutDialog.value = true;
                break;
            default:
                router.push( `/app/${item.link}` ).catch(err => err);
                break;
        }
})

function callLogout() {
    accountStore.logout();
    router.push( '/' ).catch(err => err);
    window.location.reload()
}

function setStartTimer() {
    desiprotokolleStore.startTimer(true)
}

function clickTextbaustein ( text ) {
    messengerStore.setSelectedText(text)

    showTextSnippets.value = false;
}
</script>

<style lang="scss">
    .logo {
        background-color: #fff;
    }

    .menu-item {
        font-size: 18px;
    }

    // .menu-drawer > aside {
    //     background-color: $secondary !important;
    // }
</style>
