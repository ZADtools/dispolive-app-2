<template>
    <div>
        <q-list separator style="height: 100%" class="overflow-y default-maximized-modal">
            <q-item class="trip-item" @click="showContact(item)" v-for="item in patData.value" :key="item._id" clickable >
            
                <q-item-section class="q-ml-sm">

                    <q-item-label class="text-body1 q-pa-sm">{{item.surname}}, {{item.name}}</q-item-label>

                </q-item-section>
            </q-item>
        </q-list>
        <q-dialog
            :selectedItem="selectedItem"
            v-model="contact"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card class="bg-white" style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Kontakt
                </q-bar>
                <div class="row q-px-xl q-py-sm">
                    <div class="col-12">
                        <div class="row text-primary">Nachname, Vorname</div>
                        <div class="row text-body1">{{selectedItem.surname}}, {{selectedItem.name}}</div>
                    </div>
                </div>
                <div class="row q-px-xl q-py-sm">
                    <div class="col-12">
                        <div class="row text-primary">Straße, PLZ, Stadt</div>
                        <div class="row text-body1">{{selectedItem.street}}</div>
                        <div class="row text-body1">{{selectedItem.zip}} {{selectedItem.city}}</div>
                    </div>
                </div>
                <q-separator />
                <q-card-actions class="row q-px-lg q-py-sm bg-grey-3">
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Zurück" />
                    </div>
                    <div class="col-6 q-px-sm">
                        <q-btn class="full-width text-body1" padding="6px" @click="startNavigation()" color="amber-7" label="Navigation starten" />
                    </div>
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onBeforeUnmount, computed }        from 'vue';
import { Platform, Dialog }                                 from 'quasar';
import  { usePatientenStore, IPatient }                     from 'src/stores/patienten.store';
import  { useAccountStore }                                 from 'src/stores/account.store';
import { storeToRefs }                                      from 'pinia';
import debug                                                from 'debug';
const log       = debug('app:contact');

const accountStore = useAccountStore();

const patientenStore = usePatientenStore();
const { data: patienten, search } = storeToRefs(patientenStore);

const   contact = ref(false),
        selectedItem = ref(),
        patData = ref({});

onMounted( async () => {
    accountStore.setSecondHeader('contacts');
    accountStore.setTitle('Kontakte')
})

patData.value = computed(function() {
    if ( search.value )
        return patienten.value.filter((item: IPatient) => {
            const searchStr = search.value.toString().toLowerCase()
            const name =  item.name ? item.name.toString().toLowerCase() : ''
            const surname =  item.surname ? item.surname.toString().toLowerCase() : ''

            if ( ( name.search( searchStr ) > -1 ) || ( surname.search( searchStr ) > -1 ) ) {
                return true
            }

            return false
        })
    else
        return patienten.value
})

function showContact (item: IPatient) {
    log('click contact', item)
    selectedItem.value = item;
    contact.value          = true;
}

function startNavigation ()  {
    accountStore.startNavigation( { type: 'patient', datId: selectedItem.value } )
}
</script>

<style lang="scss">

</style>
