<template>
    <cust-layout view="hHh lpR fFf" :footer="true" >
        <template #header>
            <div class="row flex">
                <div class="col-6 q-px-xs text-body1">
                    Fahrzeug wählen
                </div>
                <div class="col-6 flex justify-end">
                    <q-btn color="secondary" @click="fahrzeugeStore.getData()" size="sm" icon="fas fa-redo" />
                </div>
            </div>
            <div v-show="!loadData" class="col-12 text-primary">
                <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
            </div>
            <div v-show="loadData" class="col-12 text-primary">
                <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
            </div>
        </template>
        <template #content>
            <q-list separator class="overflow-y">
                <!-- SKETON BEGINN -->
                <template v-if="cars.length === 0">
                    <div class="row" v-for="index in 3" :key="index" >
                        <div class="col-1 q-pa-md">
                            <q-skeleton type="text" />
                        </div>
                        <div class="col-11 q-pa-md">
                            <q-skeleton type="text" />
                        </div>
                    </div>
                </template>
                <!-- SKETON END -->
                <q-item class="trip-item" v-for="item in cars" :key="item._id" @click="confirmSelectedCar(item)" clickable :class="item.changes ? 'bg-red-2' : ''">
                    <q-item-section class="q-ml-sm">
                        <q-item-label icon="car" class=" text-bold text-body1 q-px-sm" :class="[!item.status ? (Dark.isActive ? 'text-white' : 'text-primary') : 'text-negative' ]">
                            <q-icon name="fas fa-ambulance q-pr-sm" /> {{item.name}} {{item.key}}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
            <Dialog 
                v-if="showCarDialog"
                :text="`Sie wählen Fahrzeug ${selectedCar?.name || ''} aus. Dieses ist wahrscheinlich schon besetzt. Wollen Sie es trotzdem auswählen?`"
                okLabel="Ja" 
                headertext="Achtung" 
                v-model="showCarDialog"
                :func="confirmSelectedCar"
            />

            <q-dialog v-if="showGPSDialog" v-model="showGPSDialog" persistent>
                <q-card class="shadow-0">
                    <q-bar class="q-pa-lg text-h6 text-white bg-negative" >
                        Ortungsdienste
                    </q-bar>
                    <q-separator />
                    <q-card-section class="text-left">
                        <div class="text-body1 row">
                            <div class="col-12">
                                'dispolive' erfasst Standortdaten, um:
                            </div>
                            <div class="col-12 q-mt-sm">
                                - den Standort des Gerätes zu verfolgen und an die Leitstelle zu senden, auch wenn die App geschlossen ist oder wenn die App nicht verwendet wird.
                            </div>
                            <div class="col-12 q-mt-sm">
                                Informationen über die Verwendung von Standortdaten finden Sie in unseren Datenschutzrichtlinien.
                            </div>
                            <div class="col-12 text-center q-my-md">
                                <q-btn color="primary" size="16px" clickable @click="datenschutz = !datenschutz" no-caps class="q-mt-xs" label="Zu den Datenschutzrichtlinien"/>
                            </div>
                            <div class="col-12 text-grey5 text-center text-caption">
                                Ohne Ihr Einverständnis können Sie die App nicht im vollen Funktionsumfang nutzen!
                            </div>
                        </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-actions align="center" class="row" >
                        <q-btn class="col-5 text-body1" label="Ablehnen" color="negative" v-close-popup />
                        <q-btn class="col-5 text-body1" label="Aktzeptieren" color="primary" @click="setSelectedCar"  v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <datenschutz v-model="datenschutz" />
        </template>
        <template #footer>
            <div class="col-6 q-px-sm">
                <q-btn class="full-width text-body1" padding="6px" color="negative" @click="back()" label="Logout" />
            </div>
        </template>
    </cust-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref }                                   from 'vue';
import { useRouter }                                        from 'vue-router';
import Datenschutz                                          from 'src/components/Datenschutz.vue';
import Dialog                                               from 'src/components/Dialog.vue';
import CustLayout                                           from 'src/components/Layout.vue';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useFahrzeugeStore, ICar }                          from 'src/stores/fahrzeuge.store';
import { useInventarStore }                                 from 'src/stores/inventar.store';
import { useMenuStore }                                     from 'src/stores/menu.store';
import { useSocketStore }                                   from 'src/stores/socket.store';
import { useSettingsStore }                                 from 'src/stores/settings.store';
import debug                                                from 'debug';
import { storeToRefs }                                      from 'pinia';
import { Dark, QSpinnerOval }                               from 'quasar';
const log                                                   = debug('app:Cars');

const   router                  = useRouter();
const   showCarDialog           = ref(false);
const   showGPSDialog           = ref(false);
const   datenschutz             = ref(false);

const accountStore              = useAccountStore();

const fahrzeugeStore            = useFahrzeugeStore();
const {item: selectedCar, data: cars, loadData} = storeToRefs(fahrzeugeStore);

const inventarStore             = useInventarStore();
const { count: carItemsCount, data: carItems }     = storeToRefs(inventarStore);

const settingsStore             = useSettingsStore();
const { item: settings }        = storeToRefs(settingsStore);

const menuStore                 = useMenuStore();
const socketStore               = useSocketStore();

async function confirmSelectedCar ( car: ICar ) {
    await fahrzeugeStore.setItem(selectedCar.value?._id ? selectedCar.value : car);

    if ( car && car.status )
        showCarDialog.value = true;
    else
        showGPSDialog.value = true;
}

async function setSelectedCar () {
    try {
        accountStore.loading(true)
        await inventarStore.getData(selectedCar.value?._id || '');
        await inventarStore.getCount();

        menuStore.createSocketRoom();
        await menuStore.setStatus({});

        await accountStore.startGeoPosWatch();
        accountStore.loading(false)
        if ( selectedCar.value && settings.value && settings.value.inventarIntervall && settings.value.inventarIntervall > 0 && !carItemsCount.value[selectedCar.value.name] ) {
            router.push( '/inventar' )
        } else {
            //change view
            router.push( '/app/fahrberichte' )
        }
    } catch (error) {
        accountStore.loading(false)
        console.error('setSelectedCar', error)
    }
}

function back() {
    socketStore.remove()
    accountStore.logout()
    router.push('/')
}

onMounted( async ()  => {
    accountStore.loading(true)
    await accountStore.init()
    log('init account done')
    await socketStore.init()
    log('socketInit done')
    await fahrzeugeStore.getData()
    log('getCars Done')
    await settingsStore.getData()
    log('Settings Done')
    await inventarStore.getCount()
    log('itemsCount Done')
    accountStore.loading(false)
} )
</script>
