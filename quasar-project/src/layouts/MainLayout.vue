<template>
    <div>
        <cust-layout view="lHh Lpr lFf" :class="[(isScanning ? 'bg-transparent' : '')]" :headerClass="'q-pa-none'" >
            <template #header>
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

                <q-toolbar class="bg-secondary"> 
                    <q-btn flat dense icon="menu" aria-label="Menu" @click="toogleLeftDrawer" />
                    <q-badge align="bottom" v-if="unread" color="negative">{{unread}}</q-badge>
                    <q-separator class="q-ml-sm" dark vertical inset />
                    <q-toolbar-title class="text-weight-medium">{{ title }}</q-toolbar-title>
                    
                    <q-btn flat dense round icon="lock" aria-label="Menu" @click="setLockDevice" />
                </q-toolbar>
                <second-header v-if="!isScanning && secondHeader" />
            </template>
            <template #drawer>
                <q-drawer v-if="!isScanning" v-model="leftDrawerOpen" show-if-above bordered class="menu-drawer">
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
                        <menu-link 
                            v-for="link in linksList" 
                            :key="link.title" 
                            :item="link" 
                            v-if="showMenuLink(link)"
                        />
                    </q-list>
                </q-drawer>
            </template>
            <template #content>
                <!-- TODO keepalive -->
                <router-view v-slot="{ Component }">
                    <KeepAlive include="Desinfection">
                        <component :is="Component" />
                    </KeepAlive>
                </router-view>
            </template>
        </cust-layout>
        <Dialog text="Möchten Sie sich wirklich ausloggen?" :modelValue="logoutDialog" :func="callLogout" @update:modelValue="(val) => logoutDialog = val"  />
        <Dialog text="Möchten Sie wirklich den Rückruf eines Disponenten anfordern?" :modelValue="callDialog" :func="menuStore.callDisposition" @update:modelValue="(val) => accountStore.setCallDialog(val)"  />
        <Dialog v-if="pauseDialog" text="Sie haben mindestens eine aktive Fahrt! Sie können nicht in die Pause gehen!" :modelValue="pauseDialog" okLabel="Ok" :abortShow="false" @input="(val) => accountStore.setPauseDialog(val)"  />
        <Dialog v-if="informPause" text="Sie wurden von der Leitstelle in die Pause geschickt!" :modelValue="informPause" okLabel="Ok" :abortShow="false" @update:modelValue="(val) => menuStore.informStatusPause(val)"  />
        <Dialog text="Eine Ihrer Fahrten wurde geändert. Bitte prüfen!" :abortShow="false" okLabel="OK" :modelValue="adressChange" @update:modelValue="(val) => menuStore.setAdressChange(val)"  />
        <Dialog 
            v-if="appCarNote.note" 
            headertext="Nachricht von Zentrale!" 
            :text="appCarNote.note" 
            :abortShow="false" 
            okLabel="Gelesen" 
            :modelValue="appCarNote.note ? true : false" 
            @update:modelValue="(val) => readAppCarNote()"  
        />
        <Dialog 
            v-if="lastDeletedItem && lastDeletedItem.item" 
            :modelValue="lastDeletedItem.item ? true : false" 
            :text="setDeleteText(lastDeletedItem)" 
            okLabel="Ok" 
            :func="fahrberichteStore.setLastDeletedItem" 
            :abortShow="false" 
        />
    </div>
</template>

<script type="ts" setup>
import { onBeforeMount, ref, watch, onUnmounted }                               from 'vue';
import  { useRouter }                                                           from 'vue-router';
import MenuLink                                                                 from '../components/MenuLink.vue';
import Global                                                                   from '../helpers/Global';
import dayjs                                                                    from 'dayjs';
import Dialog                                                                   from '../components/Dialog.vue';
import SecondHeader                                                             from 'src/components/SecondHeader.vue';
import { QSpinnerOval, Loading, Notify }                                        from 'quasar';
import { useAccountStore }                                                      from 'src/stores/account.store';
import { useFahrzeugeStore }                                                    from 'src/stores/fahrzeuge.store';
import { useInventarStore }                                                     from 'src/stores/inventar.store';
import { useMenuStore }                                                         from 'src/stores/menu.store';
import { useFahrberichteStore }                                                 from 'src/stores/fahrberichte.store';
import { useNavStore }                                                          from 'src/stores/nav.store';
import { useDienstplanStore }                                                   from 'src/stores/dienstplan.store';
import { useSettingsStore }                                                     from 'src/stores/settings.store';
import { useMessengerStore }                                                    from 'src/stores/messenger.store';
import { usePatientenStore }                                                    from 'src/stores/patienten.store';
import { useKostentraegerStore }                                                from 'src/stores/kostentraeger.store';
import { useDesiprotokolleStore }                                               from 'src/stores/desiprotokolle.store';
import { useSerienKategorienStore }                                             from 'src/stores/serienkategorien.store';
import { useInfektionenStore }                                                  from 'src/stores/infektionen.store';
import { useCoststatusStore }                                                   from 'src/stores/coststatus.store';
import { useSonderleistungenStore }                                             from 'src/stores/sonderleistungen.store';
import { useAudioStore }                                                        from 'src/stores/audio.store';
import { useCardreaderStore }                                                   from 'src/stores/cardreader.store';
import { storeToRefs }                                                          from 'pinia';
import CustLayout                                                               from 'src/components/Layout.vue';
import debug                                                                    from 'debug';
const log                                                                       = debug('app:MainLayout');

const accountStore                                                             = useAccountStore();
const   { 
            title, 
            secondHeader, 
            appCarNote, 
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
const { item: carStatus, adressChange, informPause, specialRightText } = storeToRefs(menuStore);

const fahrberichteStore = useFahrberichteStore();
const { actDay, lastDeletedItem } = storeToRefs(fahrberichteStore);

const navStore = useNavStore();
const { item: navItems, selected: selectedNavPoint } = storeToRefs(navStore);

const dienstplanStore = useDienstplanStore();
const { pers } = storeToRefs(dienstplanStore);

const settingsStore = useSettingsStore();
const { item: settings } = storeToRefs(settingsStore);

const messengerStore = useMessengerStore();
const { data: textBausteine, messengerLoad, unread} = storeToRefs(messengerStore);

const cardReaderStore = useCardreaderStore();
const { isScanning } = storeToRefs(cardReaderStore);

const audioStore = useAudioStore();
const patientenStore = usePatientenStore();
const kostentraegerStore = useKostentraegerStore();
const desiprotokolleStore = useDesiprotokolleStore();
const serienkategorienStore = useSerienKategorienStore();
const infektionenStore = useInfektionenStore();
const coststatusStore = useCoststatusStore();
const sonderleistungenStore = useSonderleistungenStore();

const   leftDrawerOpen          = ref(false),
        logoutDialog            = ref(false),
        loadedData              = ref(false);

const router                    = useRouter();
const global                    = Global();

const linksList = ref(global.navigation);

onBeforeMount( async () => {
    const progressData = {
        spinner: QSpinnerOval,
        spinnerColor: 'secondary',
        spinnerSize: 100,
        backgroundColor: 'grey-9',
        messageColor: 'white'
    }

    const day = dayjs().format('YYYY-MM-DD')

    Loading.show(progressData)
    
    try {
        dienstplanStore.setPers('')
        log('setPers')

        if ( device.value.platform === 'android' ) {
            await accountStore.initKeyboardListener();
            log('initKeyboardListener done')
        }
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
        await accountStore.checkNavigationApps();
        log('checkkNaviagtionApps done');
        audioStore.init();
        log('audioInit done');
        accountStore.setStandartNavigation();
        log('setStandartNavigation done')
        await messengerStore.getMessages({index: 0});
        log('getMessages done')
        await messengerStore.getData();
        log('getTextSnippets done');

        //get navigation points
        linksList.value = global.navigation.filter( (item) => {
            log(item)
            if ( settings.value.kontakte === 1 && item.link === 'contact' )
                return false
            else if ( settings.value.dienstplan === 1 && item.link === 'checklistEmployee' )
                return false
            else
                return true
        } );

        accountStore._progressBarLoad = true;
        await fahrberichteStore.loadDay(day);
        accountStore._progressBarLoad = false;

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
    //TODO
    //useSocketStore.remove();
} )

function toogleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value;
}

function setLockDevice () {
    accountStore.setLockDevice(true)
}

function setUnlockDevice () {
    accountStore.setLockDevice(false)
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

function showMenuLink ( link ) {
    if ( device.value.platform === 'android' && link?.link === 'cardreader' )
        return false

    if ( !carCountItems.value && link?.link === 'checklistCar')
        return false

    return true
}

function readAppCarNote() {
    accountStore.msgRead( appCarNote.value )
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

function callLogout() {
    accountStore.logout();
    router.push( '/' )
    //window.location.reload()
}
</script>

<style lang="scss" scoped>
    .logo {
        background-color: #fff;
    }

    .menu-item {
        font-size: 18px;
    }

    :deep(aside) {
        margin-top: env(safe-area-inset-top);
    }
    .pause {
        background-color: $primary !important;
    }

    .frei {
        background-color: $secondary !important;
    }

    .besetzt {
        background-color: $negative !important;
    }
</style>
