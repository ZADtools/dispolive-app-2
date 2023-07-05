<template>
    <div class="q-py-sm q-px-lg">
       
        <div class="row">
            <div class="col text-subtitle1 q-pb-sm">Unterstützende Navigationen (App vorher installieren)</div>
        </div>
        <div class="row">
            <div class="col-6 q-pr-sm"> 
                <q-select
                    dense
                    filled
                    :modelValue="navi"
                    @update:modelValue="setNavigation"
                    :options="navApps"
                    :option-label="opt => (`${opt.name}`)"
                    :option-disable="opt => ( opt.installed ? false : true )"
                    emit-value
                    map-options
                />
            </div>
            <div class="col-6 q-pl-sm q-pt-xs text-body1"> 
                <q-btn 
                    unelevated
                    align="center"
                    padding="6px" 
                    class="full-width text-body1" 
                    @click="refresh()" 
                    color="negative" 
                >
                    <div class="ellipsis">
                        Apps suchen
                    </div>
                </q-btn>
            </div>
        </div>

        <q-separator />

        <div class="row">
            <q-toggle
                :modelValue="darkMode"
                @update:modelValue="accountStore.setDarkMode"
                color="negative"
                label= 'Darkmode'
            />
        </div>

        <q-separator />

        <div class="row">
            <div class="col text-subtitle1 q-pb-sm">Standort (live)</div>
        </div>
        <div class="row">
            <div class="col-6">Longitude: {{ geoPos.coords.longitude }}</div>
            <div class="col-6">Latitude: {{ geoPos.coords.latitude }}</div>
        </div>

        <q-separator />

        <div class="row">
            <div class="col text-subtitle1 q-pb-sm">Geräteinformationen</div>
        </div>
        <div class="row">
            <div class="col-4">Modell:</div>
            <div class="col-8">{{ device.model }}</div>
        </div>
        <div class="row">
            <div class="col-4">Hersteller:</div>
            <div class="col-8">{{ device.manufacturer }}</div>
        </div>
        <div class="row">
            <div class="col-4">OS:</div>
            <div class="col-8">{{ device.operatingSystem }} {{ device.osVersion }}</div>
        </div>
        <div class="row">
            <div class="col-4">App-Version:</div>
            <div class="col-8">v{{ version }}</div>
        </div>
        <div class="row">
            <div class="col-4">Netzwerk:</div>
            <div class="col-8">{{ connected ? 'online' : 'offline' }}</div>
        </div>
        <div class="row">
            <div class="col-4">Socket:</div>
            <div class="col-8">{{ sockConnected ? 'online' : 'offline' }}</div>
        </div>
        <div class="row">
            <div class="col-4">Sendestatus:</div>
            <div class="col-8">{{ sendDataActive ? 'Übertragung läuft...' : 'Ok' }}</div>
        </div>
        <div class="row">
            <a clickable @click="datenschutz = !datenschutz" no-caps flat class="q-mt-md q-pa-none text-primary" >Datenschutzrichtlinien</a>
        </div>
        <datenschutz v-model="datenschutz" />
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref }                           from 'vue';
import { LocalStorage, Notify, Platform }               from 'quasar'
import { version }                                      from '../../package.json'
import Datenschutz                                      from 'src/components/Datenschutz.vue';
import { useAccountStore }                              from 'src/stores/account.store';
import { useSocketStore }                               from 'src/stores/socket.store';
import { useAuditStore }                                from 'src/stores/audit.store';
import { storeToRefs }                                  from 'pinia';
import debug                                            from 'debug';

const log                                               = debug('app:settings');

const datenschutz = ref(false);

const accountStore = useAccountStore();
const { connected, navigationItems, device, geoPos, darkMode, navApps, standartNavigation } = storeToRefs( accountStore );

const socketStore = useSocketStore();
const { connected: sockConnected } = storeToRefs( socketStore );

const auditStore = useAuditStore();
const { sendDataActive } = storeToRefs( auditStore );

const navi = ref('');

async function refresh() {
    await accountStore.checkNavigationApps();

    Notify.create({
        type: 'positive',
        message: 'Suche wurde erfolgreich beendet',
        position: 'bottom',
        progress: true,
        timeout: 2000,
        color: 'secondary',
        classes: 'glossy',
    })
}

onBeforeMount( async () => {
    navi.value = standartNavigation.value

    accountStore.setTitle( 'Einstellungen' );
    accountStore.setSecondHeader('')
});

function setNavigation ( value: any ) {
    LocalStorage.set('navigation', value );
    accountStore.setStandartNavigation();
    navi.value = value

    Notify.create({
        type: 'positive',
        message: 'Einstellung wurde gespeichert.',
        position: 'bottom',
        progress: true,
        timeout: 2000,
        color: 'secondary',
        classes: 'glossy',
    })
}
</script>
