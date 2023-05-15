<template>
    <div>
        <q-item clickable @click="item.submenu !== 'forTrips' ? clicked(item) : ''" :class="[ selectedMenuPoint(item), 'overflow-hidden', 'text-no-wrap', 'menu-item', 'bg-grey-1']">
            <q-item-section avatar :class="['menu-item-section', item.menuType == 'sub' ? 'subMenu': '', item.submenu == 'forTrips' && navItems.length > 0 ? 'bg-primary' : iconColor, textColor]" >
                <q-icon :name="getStatus.status == 'pause' && item.title == 'Pausieren' ? item.activeIcon : item.icon" />
            </q-item-section>

            <q-item-section>
                <q-item-label 
                    class="menu-item-label ellipsis text-body1" 
                    :class="setLabelTextColor(item)" 
                    style="z-index:1"
                >
                    {{ item.title }} 
                    <span class="text-bold" v-if="item.title === 'Pausieren' && pauseTime">{{ `(${pauseTime})` }}</span> 
                    <span class="text-bold" v-if="item.title === 'Desinfektion' && desiTimer && desiTimer !== '00:00'">{{ `(${desiTimer})` }}</span> 
                    <q-badge v-if="item.title == 'Messenger' && unread" align="top" color="negative">{{unread}}</q-badge>
                </q-item-label>
                <q-linear-progress style="margin-left: 0px; margin-top: -10px; position:absolute; z-index: 0; width: 233px" size="70px" v-if="item.menuType == 'sub'" :color="setProgressColor(item.item)" :value="progress[item.item._id]" />
                
            </q-item-section>
            
        </q-item>
        <div v-if="item.submenu == 'forTrips'">
            <MenuLink v-for="subitem in navItems" :key="subitem._id" :item="subitem" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref}                                               from 'vue';
import debug                                                from 'debug';
import { useNavStore }                                      from 'src/stores/nav.store';
import { useAccountStore }                                  from 'src/stores/account.store';
import { useMenuStore }                                     from 'src/stores/menu.store';
import { useMessengerStore }                                from 'src/stores/messenger.store';
import { storeToRefs }                                      from 'pinia';

const log                                                   = debug('app:MenuLink');

const navStore = useNavStore();
const { data: navItems, selected: selectedNavPoint } = storeToRefs(navStore);

const accountStore = useAccountStore();
const { title: getTitle, darkMode, timer: desiTimer } = storeToRefs(accountStore);

const menuStore = useMenuStore();
const { item: getStatus, pauseTime, progress } = storeToRefs(menuStore);

const messengerStore = useMessengerStore();
const { unread } = storeToRefs(messengerStore);

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
        tM                      = ref('');

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

function selectedMenuPoint ( item: any ) {
    let exists = getTitle.value === item.title;

    if ( item.item && selectedNavPoint.value.item )
        exists =  selectedNavPoint.value.item._id === item.item._id

    return exists ? 'selected' : 'notSelected';
}

function clicked( item: any ) {
    log('clicked', item)
    navStore.setSelected( item )
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
</style>
