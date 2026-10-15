<template>
    <cust-layout view="hHh lpR fFf" class="bg-teal-5" :header="false" custClass="q-mx-sm">        
        <template #content>
            <q-card class="col-10 col-md-6 self-center shadow-0">
                <q-card-section>
                    <div class="row">
                        <div class="text-h6 col">Domain-Konfiguration</div>
                    </div>
                </q-card-section>
                
                <q-separator />
                
                <q-card-section>
                    <q-form @submit.prevent.stop="doSave" class="q-gutter-xs">
                        <q-input name="domain" v-model="domain" lazy-rules filled class="full-width"
                            autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                            label="Domain"  suffix='.dispolive.de'
                            :rules="[ val => !!val || 'Domain muss angegeben werden!' ]"
                            />
                        <q-btn unelevated color="primary" label="Speichern" type="submit" class="full-width q-mt-md text-body1" padding="6px" />
                        <div class="text-body1 col q-pa-sm">Beispiel: Lautet Ihre Domain 'musterdomain.dispolive.de', dann tragen Sie bitte 'musterdomain' ein.</div>
                    </q-form>
                </q-card-section>
            </q-card>
        </template>
    </cust-layout>
</template>

<script setup lang="ts">
import { ref, onBeforeMount }                   from 'vue';
import { useRouter }                            from 'vue-router';
import { LocalStorage, Platform }               from 'quasar'
import CustLayout                               from 'src/components/Layout.vue';
import { useAccountStore }                      from 'src/stores/account.store';
import { storeToRefs }                          from 'pinia';
import debug                                    from 'debug';
const log       = debug('app:domain');

const domain    = ref('');
const router    = useRouter();

const accountStore = useAccountStore();
const { keyboardHeight } = storeToRefs(accountStore);

async function doSave() {
    LocalStorage.set('domain', domain.value);
    accountStore._domain = domain.value;
    router.push('/');
}

onBeforeMount( () => {
    accountStore.initKeyboardListener();
    log('DOMAIN:', LocalStorage.getItem('domain'))
    domain.value = LocalStorage.getItem('domain') || '';
} )
</script>
