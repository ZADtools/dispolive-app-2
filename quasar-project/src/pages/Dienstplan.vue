<template>
    <q-list separator>
        <q-item v-if="!data">
            <q-item-section class="q-px-sm">
                Keine Daten vorhanden.
            </q-item-section>
        </q-item>
        <template v-for="(item, index) in data" :key='item._id'>
            <q-item class="q-pa-none text-body1 text-bold bg-grey-3 ">
                <q-item-section class="text-grey-9 q-px-sm q-ml-lg">
                    {{index}}
                </q-item-section>
            </q-item>
            <q-item v-for="(ind) in item" :key='ind._id' class="q-pa-none text-subtitle1 q-pl-lg">
                <q-item-section avatar class="q-px-sm">
                    <q-icon size="xs" name="fas fa-ambulance"/>
                </q-item-section>
                <q-item-section class="q-px-sm">
                    {{ind.carName}}
                </q-item-section>
                <q-item-section class="q-px-sm">
                    Von: {{ind.formatStartTime}}
                </q-item-section>
                <q-item-section class="q-px-sm">
                    Bis: {{ind.formatEndTime}}
                </q-item-section>
            </q-item>
        </template>
    </q-list>
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount }                   from 'vue';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useDienstplanStore }                               from 'src/stores/dienstplan.store';
import { storeToRefs }                                      from 'pinia';
import debug                                                from 'debug';
const log       = debug('app:trips');

const accountStore = useAccountStore();

const dienstplanStore = useDienstplanStore();
const { data } = storeToRefs(dienstplanStore);

onBeforeMount( async () => {
    accountStore.setTitle( 'Dienstplan' );
    accountStore.setSecondHeader('dienstplan')
});

</script>
