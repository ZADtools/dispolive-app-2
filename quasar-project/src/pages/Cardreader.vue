<template>
    <div>
        <div v-show="!isScanning">
            <div>
                <div class="text-body1 text-bold q-ml-lg">In folgenden Fällen <b>MUSS</b> neu gekoppelt werden:</div>
                <ul>
                    <li>NACH einem UPDATE oder einer NEUINSTALLATION der dispolive-App</li>
                    <li>Wenn die Schlüsselkarte (NICHT die Gesundheitskarte!) VERSEHENTLICH in den Kartenleser gesteckt wurde</li>
                </ul>
            </div>
            <div>
                <q-btn color="primary" class="q-ml-lg text-body1" padding="6px" label="Zur Anleitung" @click="showSetup" />
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
//import { Rcr1010 }                                                          from '@w4b/rcr1010';
import debug                                                                from 'debug';
import { openURL, Dark }                                                    from 'quasar'
import { useCardreaderStore }                                               from 'src/stores/cardreader.store';
import { useAccountStore }                                                  from 'src/stores/account.store';
import { storeToRefs } from 'pinia';

const log = debug('app:cardreader');
const patientCard = ref({});
const development = ref(process.env.DEV);

const accountStore = useAccountStore();
const { darkMode } = storeToRefs(accountStore);

const cardreaderStore = useCardreaderStore();
const { isScanning, isReadingCard, cardResponse, readingCardMessage } = storeToRefs(cardreaderStore);

onBeforeMount(async () => {
    accountStore.setTitle('Kartenleser');
    accountStore.setSecondHeader('cardreader')
});

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
