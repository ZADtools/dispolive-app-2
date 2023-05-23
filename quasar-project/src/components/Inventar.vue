<template>
    <div :class="{fullHeight, fullHeightFooter}">
        <q-list separator>
            <div v-for="(item, key) in carItems" :key="key">
                <q-item class="text-grey-9 bg-amber-4" >
                    <q-item-section class="q-ml-sm col-6 col-md-7">
                        <q-item-label icon="car" class="ellipsis text-bold text-body1 q-pl-sm q-pr-md">{{key}}</q-item-label>
                    </q-item-section>
                    <q-btn class="q-ml-md ellipsis q-px-sm" size="md" color="brown-5" @click="checkGroup(item)" style="width: 144px"><div class="ellipsis">Gruppe prüfen</div></q-btn>
                </q-item>
                <q-separator />
                <q-item class="trip-item" v-for="obj in item" :key="obj._id">
                    <q-item-section class="q-ml-sm col-6 col-md-7">
                        <q-item-label icon="car" lines="1" style="min-height: 40px" class="text-body1 q-px-sm q-mb-md">{{obj.name}}</q-item-label>
                        <q-item-label icon="car" class="text-body3 q-px-sm">Stk.: {{obj.anzahl}}</q-item-label>
                        <q-item-label icon="car" class="text-body3 q-px-sm">Snr.: {{obj.seriennummer}}</q-item-label>
                        <q-item-label icon="car" :class="{ 'text-bold': checkDate(obj.ablaufDate), 'text-negative':  checkDate(obj.ablaufDate) }" class="text-body3 q-px-sm">Abl: {{obj.ablaufDate}}</q-item-label>
                    </q-item-section>
                    <q-item-section class="q-ml-sm col-6 col-md-5" >
                        <div class="q-ml-sm q-mb-md" >
                            <q-btn size="md" unelevated @click="event(true, obj)" :color="form.items && form.items[obj._id] && form.items[obj._id].status ? 'teal-5' : 'grey-5'" class="text-white q-mr-md cursor-pointer" icon="fas fa-check"></q-btn>
                            <q-btn size="md" unelevated @click="event(false, obj)" :color="form.items && form.items[obj._id] && !form.items[obj._id].status ? 'red-7' : 'grey-5'" class="text-white q-ml-md cursor-pointer" icon="fas fa-times"></q-btn>
                        </div>
                        <q-item-label 
                            aligne="left"
                            :class="{ 'text-bold': checkDate(obj.checkDate), 'text-negative':  checkDate(obj.checkDate) }" 
                            class="text-body3 q-px-sm white"
                        >   
                            STK: {{obj.checkDate}}
                        </q-item-label>
                        <q-item-label 
                            icon="car" 
                            :class="{ 'text-bold': checkDate(obj.checkDateMtk), 'text-negative':  checkDate(obj.checkDateMtk) }" 
                            class="text-body3 q-px-sm white"
                        >
                            MTK: {{obj.checkDateMtk}}
                        </q-item-label>
                        <q-item-label icon="car" :class="checkDate(obj.ausserbetriebnahmeDate) ? 'text-negative text-bold' : 'white'" class="text-body3 q-px-sm">AUß: {{obj.ausserbetriebnahmeDate}}</q-item-label>
                    </q-item-section>
                </q-item>
            </div>
        </q-list>
        <q-dialog
            v-model="errorDialog"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Fehlerbeschreibung
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                    <div class="col-12 text-body1">
                        Bitte geben Sie eine Fehlerbeschreibung ein.
                    </div>
                </div>
                <div class="row q-px-xl q-py-sm">
                 
                    <div class="col-12">
                        <q-input :autofocus="true" filled autogrow :color="!Dark.isActive ? 'primary' : 'white'" v-model="selectedItem.error" label="Beschreibung" :rules="[val => !!val || '*Pflichtfeld']"  >
                            <template v-slot:prepend>
                                <q-icon name="fa-regular fa-note-sticky" />
                            </template>
                        </q-input>
                    </div>
                    
                </div>
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm">
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="negative" @click="abortErrorDialog()" label="Abbrechen" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn  class="full-width text-body1" padding="6px" color="primary" @click="saveErrorDialog()" label="Speichern" />
                    </div>
                </q-card-actions>
            </q-card>
        </q-dialog>
        <q-dialog
            v-model="expiredDialog"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card class="bg-white" style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-negative">
                    Achtung
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                 
                    <div class="col-12 text-body1">
                        Bitte prüfen Sie die Gruppe manuell, das Datum des folgenden Inventars ist abgelaufen:
                    </div>
                    
                </div>
                <div class="row q-px-xl q-py-sm" >
                    <div class="col-12 text-body1 text-negative" v-for="(item, index) in  expired" :key="index">
                         {{item}}
                    </div>
                </div>
               
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm bg-grey-3">
                    <div class="col-12 q-px-sm">
                        <q-btn  align="center" class="full-width text-body1" padding="6px" color="primary" v-close-popup label="Ok" />
                    </div>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>
/* global _ */
import { ref }                                              from 'vue';
import dayjs                                                from 'dayjs';
import debug                                                from 'debug';
import { extend, Dark }                                     from 'quasar';
import { useAccountStore }                                  from 'src/stores/account.store';
import { storeToRefs } from 'pinia';

const log                                                   = debug('app:componente:CarItemList');

const props = defineProps({
    carItems: {
        type: Object
    },
    form: {
        type: Object
    },
    fullHeight: {
        type: Boolean,
        default: true
    },
    fullHeightFooter: {
        type: Boolean,
        default: false
    },
})

const   form = {...props.form};

const   errorDialog     = ref(false),
        selectedItem    = ref<any>({}),
        expiredDialog   = ref(false),
        expired         = ref([]);

const accountStore = useAccountStore();

function event(status:boolean, item: any) {
    if ( form ) {
        form.items[item._id] = {status, kategorie: item.kategorieName}

        if (!status) {
            errorDialog.value = true;
            if (form.items[item._id] && form.items[item._id].error)
                item.error = form.items._id.error;
        }

        selectedItem.value = extend(true, {}, {...item});
    }
}

function saveErrorDialog() {
    if (form) {
        form.items[selectedItem.value._id].error = selectedItem.value.error
    }
    
    if (selectedItem.value.error)
        errorDialog.value = false;
}

function abortErrorDialog() {
    if ( form ) {
        form.items[selectedItem.value._id] = {status: 'check'};
        errorDialog.value = false;
        selectedItem.value.error = '';
    }
}

function checkDate (date: string) {
    if ( date && date < dayjs().format('YYYY-MM-DD'))
        return true;
    else
        return false;
}

function checkGroup (item: any) {
    expired.value = []
    item.forEach((i: any) => {
        if (!checkDate(i.ablaufDate) && !checkDate(i.checkDate) && !checkDate(i.checkDateMtk) && !checkDate(i.ausserbetriebnahmeDate) )
            form.items[i._id] = {status: 'check', kategorie: item.kategorieName}
        else
            expired.value.push(i.name);
    })

    if ( expired.value.length > 0 )
        expiredDialog.value = true;
}

</script>

<style lang="scss" scoped>
    .fullHeight {
        height: 100%;
    }

    .fullHeightFooter {
        height: calc(100% - 54px);
    }
</style>
