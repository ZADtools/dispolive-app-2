<template>
    <cust-layout view="hHh lpR fFf"  v-if="appDevice && appDevice.platform" :header="false" :login="true" custClass="q-mx-sm" >
        <template #content>
            <q-card class="col-12 offset-0 col-sm-6 offset-sm-3 shadow-0">
                <q-card-section>
                    <div class="row">
                        <div class="text-h4 col text-grey-13">Willkommen</div>
                        <div class="col text-right">
                            <img alt="dispolive logo" src="~assets/dispologo.png" id="logo" />
                            <div class="full-width q-pr-sm">v{{version}}</div>
                        </div>
                    </div>
                </q-card-section>
                <q-card-section>
                    <div v-if="connected" class="text-secondary q-pa-sm text-h6 text-center">
                        Online
                    </div>
                    <div v-if="!connected" class="text-negative q-pa-sm text-h6 text-center">
                        Offline
                    </div>

                    <q-form @submit.prevent.stop="doLogin" class="q-gutter-xs" >
                        <q-input name="fahrer" filled v-model="form.fahrer" lazy-rules dense autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                            label="Benutzername Fahrer"
                            :rules="[ val => !!val || 'Fahrer muss angegeben werden!' ]"
                        />
                        <q-input name="beifahrer" filled v-model="form.username" lazy-rules dense autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                            label="Benutzername Beifahrer"
                            :rules="[ val => !!val || 'Beifahrer muss angegeben werden!' ]"
                        />
                        <q-input name="password" filled v-model="form.password" lazy-rules dense autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" :type="isPwd ? 'password' : 'text'"
                            label="Passwort"
                            :rules="[ val => !!val || 'Passwort muss angegeben werden!' ]"
                        >
                            <template v-slot:append>
                                <q-icon
                                    :name="isPwd ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                />
                            </template>
                        </q-input>
                        <q-btn color="primary" unelevated class="full-width q-mt-md text-body1" padding="6px" label="Login" type="submit" />
                        <div class="row">
                            <div class="col-6">
                                <q-btn color="primary" clickable @click="goToDomain()" flat class="q-mt-md" label="Domain ändern"/>
                            </div>
                            <div class="col-6 q-pt-md">
                                <q-toggle
                                    :model-value="darkMode"
                                    @update:model-value="accountStore.setDarkMode"
                                    color="negative"
                                    label= 'Darkmode'
                                    class="text-body1"
                                />
                            </div>
                        </div>
                    </q-form>
                    <datenschutz v-model="datenschutz" />
                    <q-btn color="primary" clickable @click="datenschutz = !datenschutz" no-caps flat class="q-mt-xs" label="Datenschutzrichtlinien"/>
                    <div class="full-width text-center text-body1">
                        <div v-show="!checkVersion" class="col-12 text-primary">
                            <q-linear-progress :value="0"  color="secondary" class="q-mt-sm" />
                        </div>
                        <div v-show="checkVersion" class="col-12 text-negative ">
                            <q-linear-progress indeterminate color="secondary" class="q-mt-sm" />
                            Version wird überprüft!
                        </div>
                        <div v-if="!checkVersion">
                            
                            <div v-if="!actVersion && !errorVersion" class="text-negative">
                                
                                Version {{version}} nicht aktuell,<br/>neue App verfügbar!
                            </div>
                            <div v-if="(actVersion && !errorVersion)" class="text-secondary">
                                Version {{version}} ist aktuell!
                            </div>
                            <div v-if="errorVersion" class="text-negative">
                                Versionsprüfung fehlgeschlagen!
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </template>
    </cust-layout>
</template>

<script setup lang="ts">
import { ref, onMounted }                                       from 'vue';
import { useRouter }                                            from 'vue-router';
import { LocalStorage, Notify, Dark }                           from 'quasar';
import CustLayout                                               from 'src/components/Layout.vue';
import { version }                                              from '../../package.json';
import { accountService }                                       from 'src/services/account.service';
import Datenschutz                                              from 'src/components/Datenschutz.vue';
import { useAccountStore }                                      from 'src/stores/account.store';
import { useAuditStore }                                        from 'src/stores/audit.store';
import debug                                                    from 'debug';
import { storeToRefs }                                          from 'pinia';

const log                                                       = debug('app:login');

log( 'start' );

const   isPwd       = ref(true),
        datenschutz = ref(false);

const form          = ref({
    fahrer:     '',
    username:   '',
    password:   ''
});

const router    = useRouter();

const accountStore  = useAccountStore();
const { 
    loggedIn, 
    checkVersion, 
    actVersion, 
    device: appDevice, 
    connected, 
    darkMode,
    errorVersion,
} = storeToRefs( accountStore )
const auditStore    = useAuditStore();

async function doLogin() {
    try {
        accountStore.loading(true)
        await accountStore.login(form.value);
        accountStore.loading(false)
        if (!loggedIn.value)
            Notify.create({
                type: 'negative',
                message: 'Fehler beim Login',
                position: 'bottom',
                progress: true,
                timeout: 3000,
                color: 'negative',
                classes: 'glossy',
            })
        else
            router.push('/carlist');
    } catch ( err ) {
        accountStore.loading(true)
        log( 'login error', err )
        let text = '';
        if (err === 'Error: Network Error')
            text = 'Keine Verbindung zum Internet'

        Notify.create({
            type: 'negative',
            message: text,
            position: 'bottom',
            progress: true,
            timeout: 3000,
            color: 'negative',
            classes: 'glossy',
        })

        log(text)
    }
}

function goToDomain() {
    router.push('/domain');
}

onMounted( async () => {
    const domain: string      = LocalStorage.getItem('domain') || '';

    if ( process.env.DEV ) {
        form.value       = {
            fahrer:       process.env.dev.fahrer,
            username:     process.env.dev.username,
            password:     process.env.dev.password
        }
    }

    if ( domain === 'dispo-beta' && process.env.beta && process.env.DEV ) {
        form.value       = {
            fahrer:       process.env.beta.fahrer,
            username:     process.env.beta.username,
            password:     process.env.beta.password
        }
    }

    accountStore.startNetworkWatch()

    //read/set darkmode
    const darkmode =  LocalStorage.getItem('darkmode')
    Dark.set(!!darkmode)
    accountStore.setStatusbarColor(!!darkmode)
    
    await auditStore.init();
    auditStore.setSendDataActive(false)

    if ( !domain) {
        goToDomain();
    } else 
        accountService.setDomain( domain )

    accountStore.compareVersion();
    accountStore.initKeyboardListener()
} )

</script>

<style scoped>
    #logo {
        margin-top: 10px;
        width: 100px
    }
</style>
