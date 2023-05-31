<template>
    <div class="regulation regulationEdit q-px-sm">
        <div class="row q-py-md q-px-sm">
            <div class="col-12 text-h6 header">Verordnung einer</div>
            <div class="col12 text-h6 header">Krankenbeförderung</div>
        </div>
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-4 col-md-2 q-pa-sm">
                <q-select 
                    filled 
                    label-color="negative" 
                    transition-show="flip-up" 
                    v-model="editItem.eigenanteil"
                    transition-hide="flip-down" 
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
                    transition-show="flip-up" 
                    v-model="editItem.transVorhanden" 
                    transition-hide="flip-down" 
                    :options="['Ja', 'Nein']" 
                    label="Transportschein vorhanden" 
                    stack-label
                />
            </div>
            <div class="col-12 col-md-6 q-pa-sm">
                <q-select filled  transition-show="jump-bottom" transition-hide="jump-bottom" label-color="negative" 
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
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-12">
                <div class="row">
                    <div class="col-6 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patSurname" label="Name" stack-label/>
                    </div>
                    <div class="col-6 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patName" label="Vorname" stack-label />
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-7">
                <div class="row">
                    <div class="col-12 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patStreet" label="Straße, Haus-Nr." stack-label />
                    </div>
                </div>
                <div class="row">
                    <div class="col-4 q-pa-sm">
                        <q-input filled :disable="disable" label-color="negative" v-model="editItem.patZip"  label="PLZ" stack-label/>
                    </div>
                    <div class="col-8 q-pa-sm">
                        <q-input filled  :disable="disable" label-color="negative" v-model="editItem.patCity" label="Ort" stack-label />
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-5 q-pa-sm">
                <q-input 
                    :disable="disable" 
                    filled 
                    label-color="negative" 
                    stack-label 
                    v-model="editItem.birthday" 
                    label="geb. am"
                    mask="####-##-##"
                    :rules="[ (value) => global.isDateValid(value) ]"
                    :hide-hint="true"
                >
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="birthdayProxy" transition-show="flip-up" transition-hide="flip-down">
                            <q-date v-model="editItem.birthday" today-btn mask="YYYY-MM-DD">
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
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-12 col-md-5 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.versNr" label="Kostenträgerkennung" stack-label  />
                </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.stammVersNr" label="Versicherten-Nr." stack-label  />
                </div>
            </div>
            <div class="col-12 col-md-3 q-pa-sm">
                <q-select 
                    filled 
                    :disable="disable"
                    label-color="negative" 
                    v-model="editItem.versStatus"
                    :options="[ '1', '3', '5' ]" 
                    transition-show="flip-up" 
                    transition-hide="flip-down" 
                    label="Status" 
                    stack-label  
                />
            </div>
        </div>
        <div class="row whiteBg q-px-sm redLine">
            <div class="col-12 col-md-5 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.betriebsstaettenNummer" label="Betriebsstätten-Nr." stack-label />
                </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
                <div class="">
                    <q-input :disable="disable" filled label-color="negative" v-model="editItem.arztNummer" label="Arzt-Nr." stack-label />
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
                        <q-popup-proxy ref="dateProxy" transition-show="flip-up" transition-hide="flip-down">
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
                    transition-show="flip-up" 
                    v-model="editItem.sonderleistungen"
                    transition-hide="flip-down" 
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
            <q-input type="textarea" autogrow class="q-pa-sm col-12 col-md-6 bg-white white" filled label-color="primary" v-model="editItem.newsPatient"  label="Besonderes Patient" stack-label />
            <q-input type="textarea" autogrow class="q-pa-sm col-12 col-md-6 bg-white white" filled label-color="primary" v-model="editItem.newsCar" label="Besonderes Fahrzeug" stack-label />
        </div>
        <div class="row q-py-sm">
            <div class="col-12">
                <q-uploader
                    auto-upload
                    ref="uploader"
                    hide-upload-btn
                    style="width: 100%"
                    :label="label"
                    :factory="factoryFn"
                    @added="setLabel('upload')"
                    @finish="setLabel('add')"
                    @removed="removedFile"
                    no-thumbnails
                    hide-upload-progress
                    accept=".pdf, image/*"
                    flat
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch }                                              from 'vue';
import dayjs                                                from 'dayjs';
import { uid, extend }                                      from 'quasar';
import Global                                               from '../helpers/Global';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useAuditStore }                                    from 'src/stores/audit.store';
import { useKostentraegerStore }                            from 'src/stores/kostentraeger.store';
import { useSonderleistungenStore }                         from 'src/stores/sonderleistungen.store';
import { storeToRefs } from 'pinia';

const props = defineProps({
    modelValue: Object,
    disable: Boolean
})

const emit = defineEmits([
    'update:model-value',
])

const global        = Global();
const   options         = ref([]),
    label           = ref('Dateiupload'),
    editItem        = ref( extend( true, {}, props.modelValue) ),
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

const kostentraegerStore    = useKostentraegerStore();
const { data: kassen }       = storeToRefs(kostentraegerStore);

const sonderleistungenStore = useSonderleistungenStore();
const { data: sonderleistungen } = storeToRefs(sonderleistungenStore);

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

function setInsertData(val: any, field: string, ref: any) {
    if (ref)
        ref.hide();

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

async function factoryFn ( file: any ) {
        const formdata = new FormData();
        for (const item of fields) {
            formdata.append( item.name, item.value );
        }
        
        const id = uid()

        formdata.append( '_id', id);
        formdata.append( 'file', file[0]);
        
        await auditStore.sendFile(formdata);
        file[0].__progress = 100
        file[0].__progressLabel = '100.00%'
        file[0].__uploaded = 100

        return file
}

watch(editItem, (val) => {
    if (val)
        emit('update:model-value', editItem.value)
}, { deep: true })

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

function removedFile ( files ) {
    if (files.length === 1)
        setLabel('add')
}
</script>
<style scope lang="scss">

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
</style>
