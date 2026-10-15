<template>
    <div class="regulation regulationEdit q-px-sm">
        <div class="row q-py-md q-px-sm">
            <div class="col-6">
                <div class="row">
                    <div class="col-12 text-h6 header">Verordnung einer</div>
                    <div class="col-12 text-h6 header">Krankenbeförderung</div>
                </div>
            </div>
            <div class="col-4 col-sm-6 text-right" v-if="!disable && VerordnungScanData.scanned">
                <q-btn unelevated color="primary" size="md" no-caps @click="updateAlleVerordnungsData" >
                    <template v-slot:default>
                        <span>Alle Daten aus der Verordnung übernehmen</span>
                    </template>
                </q-btn>
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-4 col-md-2 q-pa-sm">
                <q-select 
                    filled 
                    label-color="negative" 
                    transition-show="jump-down" 
                    v-model="editItem.eigenanteil"
                    transition-hide="jump-down" 
                    :options="optionsGebuehr" 
                    label="Gebühr" 
                    stack-label
                    emit-value
                    map-options
                    :disable="disable"
                    :hint=" editItem.eigenanteil == '10' ? 'Eigenanteil: ' + global.showEaSum(modelValue) : '' "
                    :hide-hint="true"
                >
                    <template v-slot:option="scope">
                        <q-item 
                            v-bind="scope.itemProps" 
                            v-on="scope.itemEvents"
                            v-if="scope.opt.value !== '30' && scope.opt.value !== '40'"
                        >
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                        </q-item>
                    </template>
                </q-select>
            </div>
            <div class="col-8 col-md-4 q-pa-sm">
                <q-select 
                    filled 
                    label-color="negative" 
                    transition-show="jump-down" 
                    v-model="editItem.transVorhanden" 
                    transition-hide="jump-down" 
                    :options="['Ja', 'Nein']" 
                    label="Transportschein vorhanden" 
                    stack-label
                />
            </div>
            <div class="col-12 col-md-6 q-pa-sm">
                <q-select filled  transition-show="jump-down" transition-hide="jump-down" label-color="negative" 
                    :model-value="editItem.krankenkasse"
                    @update:model-value="setInsertData($event, 'krankenkasse')"
                    :options="options" 
                    label="Krankenkasse bzw. Kostenträger" 
                    option-label="_id"
                    emit-value
                    use-input
                    input-debounce="0"
                    map-options
                    @filter="filterKK"
                    stack-label
                >
                    <template v-slot:option="scope">
                        <q-item
                            v-bind="scope.itemProps"
                            v-on="scope.itemEvents"
                        >
                            <q-item-section avatar >
                                <q-item-label>{{ scope.opt.ikKtNr }} </q-item-label>
                            </q-item-section>
                            <q-item-section  >
                                <q-item-label> {{ scope.opt.name }} </q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine text-black">
            <div class="col-12">
                <div class="row">
                    <div class="col-6 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patSurname" label="Name" stack-label/>
                        <regulation-button :value="editItem.patSurname" :Verordnung="VerordnungScanData" fieldName="Name" :label="VerordnungScanData.patSurname" @update:model-value="updateBtnValue" />
                    </div>
                    <div class="col-6 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patName" label="Vorname" stack-label />
                        <regulation-button :value="editItem.patName" :Verordnung="VerordnungScanData" fieldName="Vorname" :label="VerordnungScanData.patName" @update:model-value="updateBtnValue"/>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-8">
                <div class="row">
                    <div class="col-12 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patStreet" label="Straße, Haus-Nr." stack-label />
                        <regulation-button :value="editItem.patStreet" :Verordnung="VerordnungScanData" fieldName="Straße, Haus-Nr." :label="VerordnungScanData.patStreet" @update:model-value="updateBtnValue" />
                    </div>
                </div>
                <div class="row">
                    <div class="col-4 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patZip"  label="PLZ" stack-label/>
                        <regulation-button :value="editItem.patZip" :Verordnung="VerordnungScanData" fieldName="PLZ" :label="VerordnungScanData.patZip" @update:model-value="updateBtnValue" />
                    </div>
                    <div class="col-8 q-pa-sm">
                        <q-input filled  :disable="disable" label-color="negative" v-model="editItem.patCity" label="Ort" stack-label />
                        <regulation-button :value="editItem.patCity" :Verordnung="VerordnungScanData" fieldName="Ort" :label="VerordnungScanData.patCity" @update:model-value="updateBtnValue" />
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
                <q-input 
                    :disable="disable" 
                    filled 
                    label-color="negative" 
                    stack-label 
                    v-model="editItem.birthday" 
                    label="geb. am"
                    hide-bottom-space
                    mask="####-##-##"
                    :rules="[ (value) => global.isDateValid(value) ]"
                    :hide-hint="true"
                >
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="birthdayProxy" transition-show="jump-down" transition-hide="jump-down">
                            <q-date v-model="editItem.birthday" today-btn mask="YYYY-MM-DD">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Schliessen" color="negative" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <regulation-button :value="editItem.birthday" :Verordnung="VerordnungScanData" fieldName="geb. am" :label="VerordnungScanData.birthday" @update:model-value="updateBtnValue" />
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-12 col-md-5 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.versNr" label="Kostenträgerkennung" stack-label  />
                    <regulation-button :value="editItem.versNr" :Verordnung="VerordnungScanData" fieldName="Kostenträgerkennung" :label="VerordnungScanData.versNr" @update:model-value="updateBtnValue" />
                </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.stammVersNr" label="Versicherten-Nr." stack-label  />
                    <regulation-button :value="editItem.stammVersNr" :Verordnung="VerordnungScanData" fieldName="Versicherten-Nr" :label="VerordnungScanData.stammVersNr" @update:model-value="updateBtnValue" />
                </div>
            </div>
            <div class="col-12 col-md-3 q-pa-sm">
                <q-select 
                    filled 
                    :disable="disable"
                    label-color="negative" 
                    v-model="editItem.versStatus"
                    :options="[ '1', '3', '5' ]" 
                    transition-show="jump-down"
                    transition-hide="jump-down" 
                    label="Status" 
                    stack-label  
                />
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-12 col-md-5 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.betriebsstaettenNummer" label="Betriebsstätten-Nr." stack-label />
                    <regulation-button :value="editItem.betriebsstaettenNummer" :Verordnung="VerordnungScanData" fieldName="Betriebsstätten-Nr." :label="VerordnungScanData.betriebsstaettenNummer" @update:model-value="updateBtnValue" />

                </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.arztNummer" label="Arzt-Nr." stack-label />
                    <regulation-button :value="editItem.arztNummer" :Verordnung="VerordnungScanData" fieldName="Arzt-Nr." :label="VerordnungScanData.arztNummer" @update:model-value="updateBtnValue" />
                </div>
            </div>
            <div class="col-12 col-md-3 q-pa-sm">
                <q-input 
                    :disable="disable" 
                    filled 
                    mask="####-##-##"
                    label-color="negative" 
                    stack-label 
                    v-model="editItem.verordnungAusstellungsDatum" 
                    label="Datum"
                    :rules="[ (value) => global.isDateValid(value) ]"
                >
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="dateProxy" transition-show="jump-down" transition-hide="jump-down">
                            <q-date v-model="editItem.verordnungAusstellungsDatum" ref="date" today-btn mask="YYYY-MM-DD">
                                <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Schliessen" color="negative" flat />
                                </div>
                            </q-date>
                        </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>            
            </div>
        </div>
        <div class="row q-py-sm">
            <div class="col-12">
                <q-select 
                    filled 
                    class="q-pa-sm bg-white white"
                    label-color="primary" 
                    transition-show="jump-down" 
                    v-model="editItem.sonderleistungen"
                    transition-hide="jump-down" 
                    :options="sonderleistungen" 
                    label="Sonderleistungen" 
                    stack-label
                    emit-value
                    map-options
                    option-value="name"
                    option-label="name"
                    multiple
                >
                </q-select>
            </div>
        </div>
        <div class="row q-pa-sm bg-white">
            <div class="col-12" :class="[Screen.gt.sm ? 'q-pr-sm' : '']">
                <q-input type="textarea" autogrow class="bg-white white" filled label-color="primary" v-model="editItem.genNr"  label="Genehmigungs Nr." stack-label />
            </div>
        </div>
        <div class="row q-py-sm q-col-gutter-sm">
            <div class="col-12 col-md-4">
                <q-select 
                    filled 
                    class="q-pa-sm bg-white white"
                    label-color="primary" 
                    transition-show="jump-down" 
                    :model-value="editItem.verordnungsId"
                    @update:model-value="setValues('verordnungsart', $event)"
                    transition-hide="jump-down" 
                    :options="verordnungen" 
                    label="Verordnungsart" 
                    stack-label
                    map-options
                    option-value="_id"
                    option-label="name"
                    :hide-bottom-space="true"
                >
                </q-select>
                <regulation-button :value="verordnungsName" :disableChangeValue="true" :Verordnung="VerordnungScanData" fieldName="Verordnungsart" :label="VerordnungScanData.verordnungsartObj && VerordnungScanData.verordnungsartObj.name" @update:model-value="updateBtnValue"/>
            </div>
            <div class="col-12 col-md-4">
                <q-select 
                    filled 
                    class="q-pa-sm bg-white white"
                    label-color="primary" 
                    transition-show="jump-down" 
                    :model-value="editItem.transportart"
                    @update:model-value="setValues('transportart', $event)"
                    transition-hide="jump-down" 
                    :options="transportarten" 
                    label="Transportart" 
                    stack-label
                    map-options
                    option-value="_id"
                    option-label="transportart"
                    :hide-bottom-space="true"
                >
                </q-select>
                <regulation-button :value="transportName" :disableChangeValue="true" :Verordnung="VerordnungScanData" fieldName="Transportart" :label="VerordnungScanData.transportartObj && VerordnungScanData.transportartObj.name" @update:model-value="updateBtnValue"/>
            </div>
            <div class="col-12 col-md-4">
                <q-select 
                    filled 
                    class="q-pa-sm bg-white white"
                    label-color="primary" 
                    transition-show="jump-down" 
                    :model-value="editItem.serienKategorie"
                    @update:model-value="setValues('kategorie', $event)"
                    transition-hide="jump-down" 
                    :options="kategorien" 
                    label="Kategorie" 
                    stack-label
                    map-options
                    option-value="_id"
                    option-label="name"
                    :hide-bottom-space="true"
                >
                </q-select>
                <regulation-button :value="editItem.serienKategorie" :disableChangeValue="true" :Verordnung="VerordnungScanData" fieldName="Kategorie" :label="VerordnungScanData.serienKategorie" @update:model-value="updateBtnValue"/>
            </div>
        </div>
        <div class="row q-mb-sm q-pa-sm bg-white">
            <q-btn color="primary" unelevated :class="['col-12', 'col-md-3', Screen.gt.sm ? 'order-last' : '']" label="Textbausteine" @click="openTextSnippets('patient')" />
            <div class="col-12 col-md-9" :class="[Screen.gt.sm ? 'q-pr-sm' : '']">
                <q-input type="textarea" autogrow class="bg-white white" filled label-color="primary" v-model="editItem.newsPatient"  label="Besonderes Patient" stack-label />
            </div>
        </div>
        <div class="row q-mb-sm q-pa-sm bg-white">
            <q-btn color="primary" unelevated :class="[ 'col-12', 'col-md-3', Screen.gt.sm ? 'order-last' : '']" label="Textbausteine" @click="openTextSnippets('car')" />
            <div class="col-12 col-md-9" :class="[Screen.gt.sm ? 'q-pr-sm' : '']">
                <q-input type="textarea" autogrow class="bg-white white" filled label-color="primary" v-model="editItem.newsCar"  label="Besonderes Fahrzeug" stack-label />
            </div>
        </div>
        <div class="row q-py-sm q-col-gutter-sm">
            <div class="col-12 q-mb-sm" v-if="!disable && Settings.scan">
                <q-btn color="primary" no-caps unelevated icon="fa-solid fa-expand" class="full-width" @click="ScanDocument" > 
                    <template v-slot:default>
                        <span>&nbsp;Verordnung Scannen &nbsp;</span><span style="font-size:10px">powered by OMTO</span>
                    </template>
                </q-btn>
            </div>
            <div class="col-12">
                <q-uploader
                    auto-upload
                    ref="uploader"
                    hide-upload-btn
                    style="width: 100%"
                    :label="label"
                    :factory="factoryFn"
                    @added="setLabel('upload')"
                    @finish="uploadFinish"
                    @removed="removedFile"
                    no-thumbnails
                    hide-upload-progress
                    accept=".pdf, image/*"
                    flat
                />
            </div>
        </div>
        <text-snippets v-if="messengerStore._showTextSnippets" :type="type"/>
        <Dialog 
            text="Bitte kontrollieren Sie, ob die Verordnung unterschrieben ist." 
            :v-if="!VerordnungScanData.signature" 
            :modelValue="!VerordnungScanData.signature" 
            @update:modelValue="(val) => VerordnungScanData.signature = !val"  
            okLabel='Verstanden'
            :abortShow="false"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch }                                              from 'vue';
import dayjs                                                from 'dayjs';
import { uid, extend, Screen, Platform }                              from 'quasar';
import {Global}                                             from '../helpers/Global';
import Dialog                                               from '../components/Dialog.vue';
import TextSnippets                                         from 'src/components/TextSnippets.vue';
import RegulationButton                                     from 'src/components/RegulationButton.vue';
import { DocumentScanner }                                  from 'capacitor-document-scanner'
import { useAccountStore }                                  from 'src/stores/account.store';
import { useAuditStore }                                    from 'src/stores/audit.store';
import { useKostentraegerStore }                            from 'src/stores/kostentraeger.store';
import { useMessengerStore }                                from 'src/stores/messenger.store';
import { useSonderleistungenStore }                         from 'src/stores/sonderleistungen.store';
import { useTransportartStore }                             from 'src/stores/transportart.store';
import { useVerordnungsartStore }                           from 'src/stores/verordnungsart.store';
import { useKategorienStore }                               from 'src/stores/kategorien.store';
import { storeToRefs } from 'pinia';
import { useSettingsStore }                                 from 'src/stores/settings.store';

const props = defineProps({
    modelValue: Object,
    disable: Boolean
})

const emit = defineEmits([
    'update:model-value',
])

const global        = Global();
const options       = ref([]),
    label           = ref('Dateiupload'),
    editItem        = ref<any>( extend( true, {}, props.modelValue) ),
    uploader        = ref(),
    optionsGebuehr  = ref([
        {
            label: 'Befreit',
            value: '20'
        },
        {
            label: 'Kassiert',
            value: '10'
        },
        {
            label: 'Rechnung',
            value: '00'
        },
        {
            label: 'Rechnung',
            value: '30'
        },
        {
            label: 'Rechnung',
            value: '40'
        }
    ]);

const accountStore          = useAccountStore();
const auditStore            = useAuditStore();

const settingsStore         = useSettingsStore();
const { item: Settings }    = storeToRefs(settingsStore);

const messengerStore        = useMessengerStore();
const { selectedText }     = storeToRefs(messengerStore);

const kostentraegerStore    = useKostentraegerStore();
const { data: kassen }       = storeToRefs(kostentraegerStore);

const sonderleistungenStore = useSonderleistungenStore();
const { data: sonderleistungen } = storeToRefs(sonderleistungenStore);

const transportartStore     = useTransportartStore();
const { data: transportarten } = storeToRefs(transportartStore);

const verordnungsartStore       = useVerordnungsartStore();
const { data: verordnungen } = storeToRefs(verordnungsartStore);

const kategorienStore       = useKategorienStore();
const { data: kategorien } = storeToRefs(kategorienStore);
const scannedDoc = ref(false)

const VerordnungScanData = ref({
    signature: true,
    scanned: false
})

options.value = extend(true, [], kassen.value)

const fields = [
    {name: 'coll', value: 'userFiles'},
    {name: 'einsatznummer', value: props.modelValue?.einsatzNummer},
    {name: 'dataId', value: props.modelValue?._id},
    {name: 'date', value: dayjs().format('YYYY-MM-DD HH:MM')},
    {name: 'uploadFromColl', value:'fahrberichte'}
]

if (!editItem.value.sonderleistungen)
    editItem.value.sonderleistungen = [];

const verordnungsName = computed(() => {
    let result = ''
    verordnungen.value.forEach((item: any) => {
        if (item._id === editItem.value.verordnungsId) {
            result = item.name
        }
    })
    return result
})

const transportName = computed(() => {
    let result = ''
    transportarten.value.forEach((item: any) => {
        if (item._id === editItem.value.transportart) {
            result = item.transportart
        }
    })
    return result
})

function updateBtnValue ({fieldName, fieldValue}: any) {
    if (fieldName === 'Transportart') {
        if (VerordnungScanData.value.transportartObj && VerordnungScanData.value.transportartObj._id) {
            editItem.value.transportart = VerordnungScanData.value.transportartObj._id
            editItem.value.transportName = VerordnungScanData.value.transportartObj.name
        }
        return
    }

    if (fieldName === 'Verordnungsart') {
        if (VerordnungScanData.value.verordnungsartObj && VerordnungScanData.value.verordnungsartObj._id) {
            editItem.value.verordnungsId = VerordnungScanData.value.verordnungsartObj._id
            editItem.value.verordnungsName = VerordnungScanData.value.verordnungsartObj.name
        }
        return
    }

    if (fieldValue) {
        VerordnungScanData.value[fieldName] = fieldValue
        editItem.value[fieldName] = fieldValue
    }
}

function updateAlleVerordnungsData() {
    for (const item of VerordnungScanData.value.checkbox) {
        if (VerordnungScanData.value[item.field])
            editItem.value[item.field] = VerordnungScanData.value[item.field]
    }

    if (VerordnungScanData.value.verordnungsartObj && VerordnungScanData.value.verordnungsartObj._id)
        editItem.value.verordnungsId = VerordnungScanData.value.verordnungsartObj._id

    if (VerordnungScanData.value.transportartObj && VerordnungScanData.value.transportartObj._id)
        editItem.value.transportart = VerordnungScanData.value.transportartObj._id
}

function compressBlob(blob: any, callback: any) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 1200;
            const scale = maxWidth / img.width;
            const newWidth = maxWidth;
            const newHeight = img.height * scale;

            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob(blob => {
                callback(blob);
            })
        };
    };
}

function uploadFinish (data: any) {
    setLabel('add')
}

async function ScanDocument () {
    // start the document scanner
    const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 2,
        responseType: 'base64',
    })

    // get back an array with scanned image file paths
    if (scannedImages.length > 0) {
        //let fileData = null
        scannedDoc.value = true
        // 🔄 Base64 in einen Blob konvertieren
        const byteCharacters = atob(scannedImages[0]);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpg' }); // oder passender MIME-Type

        compressBlob(blob, (compressedBlob: string) => {
            const finalFile = new File([compressedBlob], `Verordnung-Scan_${dayjs().format('YYYY-MM-DD_HH:mm:ss')}.jpg`, { type: 'image/jpg' });
            uploader.value.addFiles([finalFile])
        });
    }
}

function setInsertData(val: any, field: string) {
    if ( val )
        switch (field) {
            case 'krankenkasse': {
                const obj = { 
                    krankenkasse:   val.name,
                    kkId:           val._id,
                    versNr:         val.ikKtNr
                }

                editItem.value = { ...editItem.value, ...obj };
            
                break;
            }
        }
    else
        editItem.value.krankenkasse = ''
}

const type = ref('')

function openTextSnippets( messageType: string ) {
    type.value = messageType
    messengerStore._showTextSnippets = true
}

function setValues (type, event: any) {
    switch (type) {
        case 'verordnungsart':
            editItem.value.verordnungsId = event._id
            editItem.value.verordnungsName = event.name
            break;
        case 'transportart':
            editItem.value.transportart = event._id
            editItem.value.transportName = event.transportart
            break;
        case 'kategorie':
            editItem.value.serienKategorie = event._id
            editItem.value.serienKategorName = event.name
            break;
    }
}

async function factoryFn ( file: any ) {
    const formdata = new FormData();
    for (const item of fields) {
        formdata.append( item.name, item.value );
    }
    
    const id = uid()
    formdata.append( '_id', id);
    formdata.append( 'file', file[0]);
    let scannedFinish = false
    try {
        if (Settings.value.scan && scannedDoc.value === true) {
            formdata.append('scannedDoc', scannedDoc.value)
            scannedDoc.value = false
            scannedFinish = true
            const errorTimeout = setTimeout(() => {
                accountStore.loading(false)
            }, 1000 * 30)
            accountStore.loading(true, 'Daten werden aus dem Transportschein ausgelesen...')
            clearTimeout(errorTimeout)
        }
        
        const result = await auditStore.scanFile(formdata);

        if (Settings.value.scan && scannedFinish === true) {
            scannedFinish = false
            if (result.data) {
                VerordnungScanData.value = result.data
                VerordnungScanData.value.scanned = true
            }
            accountStore.loading(false)
        }

        file[0].__progress = 100
        file[0].__progressLabel = '100.00%'
        file[0].__uploaded = 100

        //Setze Daten 
        editItem.value.transVorhanden = 'Ja'

        return file
    } catch (error) { 
        accountStore.loading(false)
    } finally {
        accountStore.loading(false)
    }
}

watch(editItem, (val) => {
    if (val)
        emit('update:model-value', editItem.value)
}, { deep: true })

watch(selectedText, (newVal) => {
    if (newVal && newVal.type === 'patient')
        editItem.value.newsPatient = newVal.text
    if (newVal && newVal.type === 'car')
        editItem.value.newsCar = newVal.text
})

function setLabel ( item: string ) {
    if ( item === 'upload' )
        label.value = 'Dateiupload'
    else
        label.value = 'Dateiupload'
} 

function filterKK (val: string, update: any) {
    if (val === '') {
        update(() => {
            options.value = extend(true, [], kassen.value)
        })
        return
    }

    update(() => {
        const needle = val.toLowerCase()
        options.value = kassen.value.filter( (v: any) => (v.ikKtNr + v.name).toLowerCase().indexOf(needle) > -1)
    })
}

function removedFile ( files: any ) {
    if (files.length === 1)
        setLabel('add')
}
</script>
<style lang="scss" scoped>

    .header {
        color: $negative
    }

    .redLabel {
        color: $negative
    }

    .regulation {
        background-color:   #D3EDFA;
        padding-bottom:     10px;
    }

    .whiteBg {
        background-color:   #fff;
        padding-top:        5px;
        padding-bottom:     5px;
    }

    .emptyLabel {
        min-height: 21px;
    }

    .q-uploader__header-content .q-uploader__subtitle{
        display:    none;
        color:      $secondary;
        font-size:  '14px'
    }

    .q-uploader__subtitle{
        color:          $primary;
        font-size:      14px;
        font-weight:    bold;
    }

    .q-field__messages{
        color:      $negative;
        font-weight:  bold;
    }

    :deep(.q-field--dark .q-field__native){
        color: black !important
    }

    :deep(.q-field--filled.q-field--dark .q-field__control, .q-field--filled.q-field--dark .q-field__control:before) {
        background: rgba(0, 0, 0, 0.07);
    }

    :deep(.q-field--dark .q-field__marginal) {
        color: rgba(0, 0, 0, 0.7);
    }

    :deep(.q-field--dark .q-field__bottom) {
        color: rgba(204, 91, 107, 0.7);
    }
    
</style>
