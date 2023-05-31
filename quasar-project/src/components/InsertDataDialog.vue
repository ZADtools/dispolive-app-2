<template>
    <q-dialog
        :class="[device.platform == 'android' ? 'saveAreaAndroid' : '']"
        :model-value="insertDataDialog"
        @update:model-value="closeDialog"
        persistent
        :maximized="true"
        transition-show="jump-right"
        transition-hide="jump-right"
    >

        <q-card class="bg-grey-3">
            <q-list :style="`height: 100vh`">
                <q-form ref="form">
                    <RegulationEdit :key="id" ref="regulation" v-model="editData" :disable="disable" />
                </q-form>
                <q-card-actions class="row q-px-xs q-py-sm bg-grey-3">
                    <div class="col-12 q-px-sm q-mb-sm" v-if="device.operatingSystem == 'ios' && actItem?.type !== 'Serie' && actItem?.type !== 'Linie'">
                        <q-btn color="amber-7 text-white" class="full-width text-body1" padding="6px" icon="fas fa-id-card" label="EGK einlesen" @click="readEGK" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="negative" @click="closeDialog" label="Abbrechen" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" @click="save()" color="primary" label="Speichern" />
                    </div>
                </q-card-actions>
            </q-list>
        </q-card>
        <q-overlay v-model="isReadingCard" z-index="5000">
            <template v-slot:body>
                <div class="fullscreen column justify-center items-center" >
                    <div class="row bg-white">
                        <div class="col-12 text-center"> 
                            <q-spinner-facebook align="center" color="primary" size="5em"></q-spinner-facebook>
                        </div>
                        <div class="col-12 text-center q-pa-sm text-h6 text-primary"> 
                            <!-- {{ readingCardMessage }} -->
                        </div>
                        <div class="col-12"> 
                            <q-btn padding="6px" class="q-mt-md full-width text-body1"  color="primary" label="Abbrechen" @click="stopReadCard()"></q-btn>
                        </div>
                    </div>
                </div>
            </template>
        </q-overlay>
    </q-dialog>
</template>

<script lang="ts" setup>
import { defineComponent, ref, onMounted, watch }                  from 'vue';
import Global                                               from '../helpers/Global';
import { extend, Notify, uid }                              from 'quasar';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useAuditStore }                                    from 'src/stores/audit.store';
import { useFahrberichtStore }                              from 'src/stores/fahrbericht.store';
import { useCardreaderStore }                               from 'src/stores/cardreader.store';
import debug                                                from 'debug';
import { storeToRefs }                                      from 'pinia';
import RegulationEdit                                       from 'src/pages/RegulationEdit.vue';

const log                                                   = debug('app:datenergänzenDialog');
const props = defineProps({
        insertDataDialog: Boolean,
        actItem: Object
})
const emits = defineEmits(['close'])
const   data        = ref( props.actItem ),
id          = ref(uid()),
editData    = ref({}),
disable     = ref(false),
regulation  = ref(),
form        = ref(),
item        = ref({
    verordnungAusstellungsDatum:    data.value.verordnungAusstellungsDatum || '',
    krankenkasse:                   data.value.krankenkasse || '',
    versNr:                         data.value.versNr || '',
    kkId:                           data.value.kkId || '',
    patSurname:                     data.value.patSurname || '',
    patName:                        data.value.patName || '',
    birthday:                       data.value.birthday || '',
    stammVersNr:                    data.value.stammVersNr || '',
    versStatus:                     data.value.versStatus || '',
    betriebsstaettenNummer:         data.value.betriebsstaettenNummer || '',
    arztNummer:                     data.value.arztNummer || '',
    patStreet:                      data.value.patStreet || '',
    patZip:                         data.value.patZip || '',
    patCity:                        data.value.patCity || '',
    eigenanteil:                    data.value.eigenanteil || '',
    eaSum:                          data.value.eaSum || '',
    newsPatient:                    data.value.newsPatient || '',
    newsCar:                        data.value.newsCar || '',
    transVorhanden:                 data.value.transVorhanden || 'Nein',
    _id:                            data.value._id,
    kkCard:                         data.value.kkCard || false,
    rawInsuranceData:               data.value.rawInsuranceData || '',
    rawPersonalData:                data.value.rawPersonalData || '',
    sonderleistungen:               data.value.sonderleistungen || '',
    einsatzNummer:                  data.value.einsatzNummer || '' 
});
const auditStore = useAuditStore();
const fahrberichtStore = useFahrberichtStore();

const accountStore = useAccountStore();
const { device, keyboardHeight } = storeToRefs(accountStore);

const cardreaderStore = useCardreaderStore();
//TODO
//const { isReadingCard, cardResponse, readingCardMessage } = storeToRefs(cardreaderStore);
//...useActions( 'cardreader', { readCard: 'readCard', stopReadCard: 'stopReadCard', setCardData: 'setCardData' } )

function closeDialog () { 
    emits( 'close', false );
}
async function save () {
    form.value.validate().then( async (success: boolean) => {
        console.log('3333')
        if (success) {
            console.log(editData.value.patName)
            const data = { ...props.actItem, ...editData.value }
            
            await auditStore.setItem({type: 'fahrbericht', value: data });
            await fahrberichtStore.setShowItem( data );
            await fahrberichtStore.updateItem( data )
            accountStore.setTitle( `${data.patSurname}, ${data.patName}` );
            emits( 'close' )
        } else {
            Notify.create({
                type: 'negative',
                message: 'Formular ungültig. Bitte prüfen Sie Ihre Eingabe',
                position: 'bottom',
                progress: true,
                timeout: 3000,
                color: 'negative',
                classes: 'glossy',
            })
        }
    })
}

        function setActItemData (val: any, field: string, ref: any) {
            if (ref)
                ref.hide();

            switch (field) {
                case 'krankenkasse': {
                    const obj = { 
                        krankenkasse:   val.name,
                        kkId:           val._id,
                        versNr:         val.ikKtNr
                    }

                    item.value      = { ...item.value, ...obj };
                    data.value      = { ...data.value, ...obj };
                    editData.value  = { ...data.value, ...obj };
                
                    break;
                }
                default: 
                    item.value      = {...item.value, ...{ [field]: val } };
                    data.value      = {...data.value, ...{ [field]: val } };
                    editData.value  = {...data.value, ...{ [field]: val } };
                    break;
            }
        }

        onMounted( () => {
            editData.value = extend( true, {}, item.value);

            if (props.actItem?.type === 'Serie')
                disable.value = true;
        } )

        async function readEGK () {
            cardreaderStore.readCard();
        }

        async function stopReadCard() {
            cardreaderStore.stopReadCard();
        }

        watch( cardreaderStore._cardResponse, async ( newVal ) => {
            if ( Object.keys(newVal).length > 0 ) {
                editData.value = { ...await cardreaderStore.setCardData( editData.value ) }
                id.value = uid();
            }
        } )
</script>
