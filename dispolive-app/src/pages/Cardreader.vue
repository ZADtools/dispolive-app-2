<template>
    <div>
        <div v-show="!isScanning && !device">
            <div class="row">
                
                <div class="col text-center text-body1 text-bold q-my-xl">
                    Bitte wählen Sie, Welches Gerät verwendet wird?
                </div>
            </div>
            <div class="row q-pa-sm text-center">
                <!-- <div class="col-12 col-sm-6">
                    <q-img
                        @click="setDevice('bR301BLE')"
                        src="~assets/br301ble.png"
                        :ratio="16/9"
                        width="300px"
                    />
                    <div class="text-h6 q-mt-sm">bR301BLE</div>
                    <div class="text-secondary">Empfohlen</div>
                </div> -->
                <div class="col-12">
                    <q-img
                        @click="setDevice('RC1010')"
                        src="~assets/rc1010.png"
                        :ratio="16/9"
                        width="300px"
                    />
                    <div class="text-h6 q-mt-sm">RCR1010</div>
                    <div class="text-secondary">Aktuell</div>
                </div>
            </div>
        </div>
        <div v-show="!isScanning && device">
            <div class="q-ml-lg">
                <div class="text-h5 text-bold q-mb-sm">Kartenleser: {{ device }}</div>
                <div class="text-body1 text-bold">In folgenden Fällen <b>MUSS</b> neu gekoppelt werden:</div>
                <ul>
                    <li>NACH einem UPDATE oder einer NEUINSTALLATION der dispolive-App</li>
                    <li>Wenn die Schlüsselkarte (NICHT die Gesundheitskarte!) VERSEHENTLICH in den Kartenleser gesteckt wurde</li>
                </ul>
            </div>
            <div>
                <q-btn unelevated color="primary" class="q-ml-lg text-body1" padding="6px" label="Zur Anleitung" @click="showSetup" />
            </div>
            <div class="raw-data" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                <div class="text-body1 text-bold q-pb-sm">Patient</div>
                <div class="row">
                    <div class="col-4">Titel</div><div class="col-8">{{patientCard.titel}}</div>
                    <div class="col-4">Vorname, Nachname</div><div class="col-8">{{patientCard.vorname}} {{patientCard.nachname}}</div>
                    <div class="col-4">Nameszusatz</div><div class="col-8">{{patientCard.namenszusatz}}</div>
                    <div class="col-4">Straße, Haus-Nr.</div><div class="col-8">{{patientCard.strasse}} {{patientCard.hausnummer}}</div>
                    <div class="col-4">PLZ, Ort</div><div class="col-8">{{patientCard.postleitzahl}} {{patientCard.ort}}</div>
                    <div class="col-4">Land</div><div class="col-8">{{patientCard.land}}</div>
                    <div class="col-4">Geburtsdatum</div><div class="col-8">{{patientCard.geburtsdatum}}</div>
                    <div class="col-4">Geschlecht</div><div class="col-8">{{patientCard.geschlecht}}</div>
                </div>

                <div class="text-body1 text-bold q-pb-sm q-pt-md">Kostenträger</div>
                <div class="row">
                    <div class="col-4">Status</div><div class="col-8">{{patientCard.versichertenStatus}}</div>
                    <div class="col-4">Versicherten-Nr.</div><div class="col-8">{{patientCard.versichertenNummer}}</div>
                    <div class="col-4">Krankenkasse</div><div class="col-8">{{patientCard.kassenname}}</div>
                    <div class="col-4">Kostenträgerkennung</div><div class="col-8">{{patientCard.kostentraegerkennung}}</div>
                </div>
            </div>

            <div class="raw-data" v-if="development" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                <p class="title">rawPersonalData</p>
                <p class="content">{{patientCard}}</p>
            </div>
            <div class="raw-data" v-if="development" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-grey-3']">
                <p class="title">rawInsuranceData</p>
                <p class="content">{{patientCard.rawInsuranceData}}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineComponent, onBeforeMount, onUnmounted, onMounted, ref, watch }      from 'vue';
import debug                                                                from 'debug';
import { openURL, Dark }                                                    from 'quasar'
import { useCardreaderStore }                                               from 'src/stores/cardreader.store';
import { useAccountStore }                                                  from 'src/stores/account.store';
import { storeToRefs } from 'pinia';

const log = debug('app:cardreader');
const patientCard = ref({});
const development = ref(process.env.DEV || false);

const accountStore = useAccountStore();
const { darkMode } = storeToRefs(accountStore);

const cardreaderStore = useCardreaderStore();
const { isScanning, isReadingCard, cardResponse, readingCardMessage, device } = storeToRefs(cardreaderStore);

onBeforeMount(async () => {
    accountStore.setTitle('Kartenleser');
    accountStore.setSecondHeader('')
});

function setDevice( item: string ) {
    cardreaderStore._device = item;
    accountStore.setSecondHeader('cardreader')
}

function showSetup () {
    openURL('http://wiki.dispolive.de/doku.php?id=5appkartenleser#kartenleser_verbinden')
}

watch( cardResponse, ( newVal ) => {
    patientCard.value = newVal
} )

onMounted(() => {
    cardreaderStore.init()
});

onUnmounted(() => {
    cardreaderStore.remove()
});
  
</script>

<style lang="scss">

    .raw-data {
        margin: 20px;
        padding: 20px;
        border-color: #c9c7c7;
        border-width: 2;
        background-color: #dde7f8;

        table {
            width: 100%;
            border-spacing: 0;

            tr {
                td:first-of-type {
                    color: #444343;
                    font-weight: bold;
                    width: 50%;
                }
            }
        }

        .title {
            font-weight: bold;
            font-size: 1.2em;
            padding-top: 10px;
        }

        .content {
            font-size: 16;
        }
    }
</style>
