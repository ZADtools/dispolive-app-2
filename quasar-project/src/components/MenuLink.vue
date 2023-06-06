<template>
    <div>
        <q-item clickable @click="item.submenu !== 'forTrips' ? clicked(item) : ''" :class="[ selectedMenuPoint(item), 'overflow-hidden', 'text-no-wrap', Dark.isActive ? 'menu-itemDark' : 'bg-grey-1, menu-item']">
            <q-item-section avatar :class="['menu-item-section', item.menuType == 'sub' ? 'subMenu': '', item.submenu == 'forTrips' && navItems.length > 0 ? 'bg-primary' : iconColor, textColor]" >
                <q-icon :name="getStatus.status === 'pause' && item.title === 'Pausieren' ? item.activeIcon : item.icon" />
            </q-item-section>

            <q-item-section>
                <q-item-label 
                    class="menu-item-label ellipsis text-body1" 
                    :class="setLabelTextColor(item)" 
                    style="z-index:1"
                >
                    {{ item.title }} 
                    <span class="text-bold" v-if="item.title === 'Pausieren' && pauseTime">{{ `(${pauseTime})` }}</span> 
                    <span class="text-bold" v-if="item.title === 'Desinfektion' && diffTime">{{ `(${diffTime})` }}</span> 
                    <q-badge v-if="item.title == 'Messenger' && unread" align="top" color="negative">{{unread}}</q-badge>
                </q-item-label>
                <q-linear-progress style="margin-left: 0px; margin-top: -10px; position:absolute; z-index: 0; width: 233px" size="70px" v-if="item.menuType == 'sub'" :color="setProgressColor(item.item)" :value="progress[item.item._id]" />
                
            </q-item-section>
            
        </q-item>
        <div v-if="item.submenu == 'forTrips'">
            <MenuLink v-for="subitem in navItems" :key="subitem._id" :item="subitem" />
        </div>
        <Dialog v-if="noSpecialRightsAllowed" text="Während eines Linientransports können keine Sonderrechte gesetzt werden!" :value="modelValue" okLabel="Abbrechen" :abortShow="false" @update:modelValue="(val) => noSpecialRightsAllowed = val"  />
        <Dialog v-if="specialrightDialog" :text="specialRightsDiaText" :modelValue="specialrightDialog" okLabel="Ok" :abortShow="false" @update:modelValue="($event) => specialrightDialog = $event"  />
        <q-dialog
            v-model="confirmSpecialRights"
            persistent
            transition-show="jump-right"
            transition-hide="jump-right">
            <q-card style="width: 700px;">
                <q-bar class="q-pa-lg text-h6 text-white bg-primary">
                    Sonderrechte
                </q-bar>
                <q-form greedy no-error-focus ref="specialRightsForm">
                    <div class="row q-px-xl q-py-sm">
                        <div class="col-12">
                            <q-input inputmode="text" type="textarea" filled label-color="primary" autogrow v-model="specialRightText" label="S. Bemerkung"/>
                        </div>
                    </div>
                    <q-separator />
                    <q-card-actions class="row q-px-lg q-py-sm bg-grey-3">
                        <div class="col-6 q-px-sm">
                            <q-btn class="full-width text-body1" padding="6px" color="negative" v-close-popup label="Abbrechen" />
                        </div>
                        <div class="col-6 q-px-sm">
                            <q-btn class="full-width text-body1" padding="6px" color="primary" @click="setSpecialRights()" label="Einschalten" />
                        </div>
                    </q-card-actions>
                </q-form>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref}                                               from 'vue';
import debug                                                from 'debug';
import Dialog                                               from 'src/components/Dialog.vue';
import { useNavStore }                                      from 'src/stores/nav.store';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useMenuStore, IFahrbericht }                       from 'src/stores/menu.store';
import { useMessengerStore }                                from 'src/stores/messenger.store';
import { useFahrberichtStore }                              from 'src/stores/fahrbericht.store'
import { useFahrzeugeStore }                                from 'src/stores/fahrzeuge.store';
import { useAuditStore }                                    from 'src/stores/audit.store';
import { useDesiprotokolleStore }                           from 'src/stores/desiprotokolle.store';
import { useRouter }                                        from 'vue-router';
import { storeToRefs, defineStore }                         from 'pinia';
import { Dark }                                             from 'quasar';

const log                                                   = debug('app:MenuLink');

const navStore = useNavStore();
const { data: navItems, selected: selectedNavPoint } = storeToRefs(navStore);

const accountStore = useAccountStore();
const { title: getTitle, darkMode, timer: desiTimer } = storeToRefs(accountStore);

const menuStore = useMenuStore();
const { item: getStatus, pauseTime, progress } = storeToRefs(menuStore);

const messengerStore = useMessengerStore();
const { unread } = storeToRefs(messengerStore);

const fahrzeugeStore = useFahrzeugeStore();
const { item: selectedCar } = storeToRefs(fahrzeugeStore);

const desiprotokolleStore = useDesiprotokolleStore();
const { diffTime } = storeToRefs(desiprotokolleStore);

const auditStore = useAuditStore();
const fahrberichtStore = useFahrberichtStore();
const router = useRouter();

const props = defineProps({
    item: {
        type:       Object,
        default: () => {
            return {}
        }
    }
})

const   iconColor               = ref('bg-grey-1'),
        textColor               = ref('text-grey-1'),
        bM                      = ref(''),
        tM                      = ref(''),
        specialRightText        = ref(''),
        specialRightsDiaText    = ref(''),
        selectedFahrten         = ref<Array<IFahrbericht>>([]),
        specialrightDialog      = ref(false),
        confirmSpecialRights    = ref(false),
        specialRightsForm       = ref(),
        noSpecialRightsAllowed  = ref(false);

if (props.item.color) {
    iconColor.value         = `bg-${props.item.color}`;
}

if (props.item.bottomMargin)
    bM.value                = 'bM';

if (props.item.topMargin)
    tM.value                = 'tM';

if (props.item.fontColor)
    textColor.value         = `text-${props.item.fontColor}`;

function setProgressColor (item: any) {
    let color = 'teal-3';

    if (item.infektion && !item.desiProt)
        color = 'orange';

    return progress.value[item._id] >= 1 ? color : 'red-3'
}

function setSpecialRights () {
    specialRightsForm.value.validate().then( async (success: boolean) => {
        if ( success && selectedCar.value ) {
            confirmSpecialRights.value = false;

            if (navItems.value.length === 1 ) {
                const item = navItems.value[0].item;
                const data = {
                    _id:            item._id,
                    car:            selectedCar.value._id,
                    sonderrechte:   1,
                    status:         'sonderrechte'
                }

                const sonderBemerkung = {
                    _id:                item._id,
                    sonderBemerkung:    specialRightText.value
                }
                
                await auditStore.setItem({ type:'zeitstempel', value: data })
                await auditStore.setItem({ type:'sonderNotice', value: sonderBemerkung, noAlert: true })
                await menuStore.setStatus({status: 'sonderrechte'})
                menuStore.setSonderrechteApp()
            }
        }
    } )
}

function selectedMenuPoint ( item: any ) {
    let exists = getTitle.value === item.title;

    if ( item.item && selectedNavPoint.value?.item )
        exists =  selectedNavPoint.value.item._id === item.item._id

    if ( Dark.isActive )
        return exists ? 'selectedDark' : 'notSelected';

    return exists ? 'selected' : 'notSelected';
}

async function specialrights () {
    specialRightText.value = '';

    if (navItems.value.length === 0) {
        specialRightsDiaText.value  = 'Sonderrechte können nur während einer aktiven Fahrt gesetzt werden!'
        specialrightDialog.value    = true;
        return 
    }

    if (navItems.value.length === 1 && navItems.value[0].item.type === 'Linie') {
        specialRightsDiaText.value  = 'Sonderrechte können nicht für eine Linie eingeschaltet werden!'
        specialrightDialog.value    = true;
        return 
    }

    if (navItems.value.length === 1 && navItems.value[0].item.sonderrechte) {
        specialRightsDiaText.value  = 'Für diese Fahrt wurden bereits Sonderrechte eingeschaltet'
        specialrightDialog.value    = true;
        return 
    }

    if (navItems.value.length > 1 ) {
        specialRightsDiaText.value  = 'Sonderrechte können nicht gesetzt werden, wenn 2 oder mehr Fahrten angenommen wurden.'
        specialrightDialog.value    = true;
        return 
    }

    const selectedLinie = false;

    if (selectedLinie)
        noSpecialRightsAllowed.value = true;

    if (navItems.value.length === 1 && !selectedLinie) {
        confirmSpecialRights.value = true;
    }
}

async function clicked( item: any ) {
    navStore.setSelected( item )

    if (item.item && item.item._id) {
        fahrberichtStore.setActTrip( item.item );
    }

    if (item.function) {
        if ( item.function === 'specialrights' )
            specialrights()

        if ( item.function === 'pause' ) {
            const stat = await menuStore.setStatus({status: 'pause'});
            if (stat && stat.error) {
                accountStore.setPauseDialog(true)
            }
        }

        return true;
    }

    if (item.link)
        switch ( item.link) {
            case 'logout':
                accountStore._logoutDialog = true;
                break;
            default:
                router.push( `/app/${item.link}` )
                break;
        }
}

function setLabelTextColor(item: any) {
    if ( darkMode.value === true && item.item && progress.value[item.item._id] >= 1 && item.item.infektion )
        return 'text-white';
}
</script>

<style lang="scss">
        .menu-item {
            border-bottom: 1px solid $secondary;
            padding: 0px 5px 0 0px
        }

        .menu-itemDark {
            border-bottom: 1px solid $grey-9;
            padding: 0px 5px 0 0px
        }

        .menu-item-section i{
            padding-left: 11px;
        }

        .menu-item-label{
            margin-left: 5px;
            padding: 0px 5px 0 0px;
        }

        .login > div {
            height: calc( 100vh );
        }

        .bM {
            border-bottom: 10px solid $secondary;
            min-height: 53px;
        }

        .tM {
            border-top: 10px solid $secondary;
            min-height: 53px;
        }

        .subMenu{
            padding-left: 15px;
        }

        .selected {
            background-color: $grey-4 !important
        }

        .selectedDark {
            background-color: $grey-10 !important
        }
</style>
