<template>
    <div>
        <q-list separator>
            <q-item v-ripple v-bind:key="index" v-for="(item, index) in data">
                <q-item-section class="q-pr-md">{{item.type}}</q-item-section>
                <q-item-section>{{item.date}}</q-item-section>
                <q-item-section class="col-1">
                    <q-btn unelevated color="negative" dense size="sm" icon="fas fa-trash" label="" @click="showDeleteRow(item)" />
                </q-item-section>
            </q-item>
            <q-item v-if="data.length === 0">
                <q-item-section>Keine ungesendeten Daten auf dem Gerät</q-item-section>
            </q-item>
        </q-list>

        <cust-dialog type="deleteRowdata" text="Möchten Sie den ungesendet Datensatz wirklich löschen?" :modelValue="callDialogRow" @update:modelValue="(val) => callDialogRow = val" :func="deleteRow" />
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref }                       from 'vue';
import CustDialog                                   from 'src/components/Dialog.vue'
import { useAccountStore }                          from 'src/stores/account.store';
import { useAuditStore }                            from 'src/stores/audit.store';
import { storeToRefs }                              from 'pinia';
import debug                                        from 'debug';

const log       = debug('app:mingingdata');

const callDialog        = ref(false);
const callDialogRow     = ref(false);
const selectedRow       = ref<any>(null);

const auditStore = useAuditStore();
const { data } = storeToRefs(auditStore);

const accountStore = useAccountStore();

onBeforeMount(() => {
    setTimeout( () => {
        auditStore.getData();
    })
    accountStore.setTitle('Ungesendete Daten')
    accountStore.setSecondHeader('missingdata')
})

function showDeleteRow(item: any) {
    callDialogRow.value = true;
    selectedRow.value = item
}

function deleteRow () {
    if ( selectedRow.value )
        auditStore.actionDb({item: selectedRow.value.id, methode: 'DELETE'})
    
    auditStore.getData()
    selectedRow.value = null;
}
</script>
