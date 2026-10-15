<template>
    <div class="height">
        <div ref="scrollTarget" class="scrollHeight">
            <q-infinite-scroll 
                ref="scrollList" 
                @load="onLoad" 
                reverse 
                :offset="500"
                :initial-index="index" 
                :scroll-target="scrollTarget"
            >
                <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                        Daten werden geladen...
                    </div>
                </template>
                <div v-for="(item, index) in messages" :key="index" class="caption q-px-md">
                    <q-chat-message
                        class="text-body1 text-bold"
                        size="12"
                        v-if="checkDateIndex(index)"
                        :label="checkDateIndex(index) || ''"
                        text-color="negative"
                    />

                    <q-chat-message
                        :id="'scroll' + item._id"
                        :key="index + timestamp + item.send"
                        class="text-body1"
                        :name="item.user.name + ' ' + item.user.surname "
                        :text="[item.origNote]"
                        :stamp-html="true"
                        :sent="item.device"
                        :bg-color="!item.device ? 'primary' : 'secondary'"
                        :text-color="!item.device ? 'white' : 'white'"
                    >
                        <template v-slot:stamp>
                            <q-icon v-if="item.send && item.device" name="check" />
                            {{setStamp(item)}}
                        </template>
                    </q-chat-message>
                </div>
            </q-infinite-scroll>
        </div>
        <q-page-sticky expand position="bottom" style="z-index: 9999;" class="q-pl-sm q-pt-sm" :class="[Dark.isActive ? 'bg-grey-10' : 'bg-white']" >
                <q-input class="col" :readonly="settings.noCustomMessage ? true : false" bottom-slots autogrow filled label-color="primary" v-model="message" stack-label label="Nachricht schreiben...">
                    <template v-slot:after>
                        <q-btn round dense flat icon="send" @click="sendMessage" />
                    </template>
            </q-input>
        </q-page-sticky>
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, watch}                                         from 'vue';
import { Notify, uid, Dark }                                                from 'quasar';  
import { Keyboard }                                                         from '@capacitor/keyboard';
import { useMessengerStore }                                                from 'src/stores/messenger.store';
import { useFahrzeugeStore }                                                from 'src/stores/fahrzeuge.store';
import { useSettingsStore }                                                 from 'src/stores/settings.store';
import { useAccountStore }                                                  from 'src/stores/account.store';
import { useAuditStore }                                                    from 'src/stores/audit.store';
import { storeToRefs }                                                      from 'pinia';
import debug                                                                from 'debug';
import dayjs                                                                from 'dayjs';
import 'dayjs/locale/de'
import relativeTime                                                         from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
const log                                                                   = debug('app:messages');
dayjs.locale('de')

const   message         = ref(''),
        scrollList      = ref(),
        timestamp       = ref();

const scrollTarget      = ref();

const messengerStore    = useMessengerStore();
const { messages, index, scrollEnd, lastItem, selectedText } = storeToRefs(messengerStore);

const fahrzeugeStore    = useFahrzeugeStore();
const { item: car }     = storeToRefs(fahrzeugeStore);

const settingsStore     = useSettingsStore();
const { item: settings } = storeToRefs(settingsStore);

const accountStore      = useAccountStore();
const { beifahrer, keyboardHeight } = storeToRefs(accountStore);

const auditStore        = useAuditStore();

setInterval( () => {
    timestamp.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}, 60000 )

watch( lastItem, ( newVal ) => {
    if ( newVal ) {
        setTimeout( () => {
            const element = document.querySelector('.scrollHeight');
            if (element)
                element.scrollTop = element.scrollHeight;
        } )
    }
} )

watch( selectedText, ( newVal ) => {
    if ( newVal && newVal.type === 'messenger' )
        message.value = newVal.text
} )

async function onLoad (index: number, done: any) {
    messengerStore.setMessengerLoad(true)

    const count = await messengerStore.getMessages({ index: index + 1 })

    if ( count && count.count / 10 > index )
        done()
    else {
        done(true)
        messengerStore.setScrollEnd(true)
    }

    messengerStore.setMessengerLoad(false)
}

onBeforeMount( () => {
    // if ( scrollEnd.value )
    //     scrollList.value.stop()

    accountStore.setSecondHeader('messages');
    accountStore.setTitle('Messenger')
    messengerStore.setUnread(0);
    messengerStore.allRead();
} )

async function sendMessage () {
    if ( message.value === '' ) {
        Notify.create({
            type: 'negative',
            message: 'Nachricht darf nicht leer sein',
            position: 'bottom',
            progress: true,
            timeout: 3000,
            color: 'negative',
            classes: 'glossy'
        })
        return
    }
    
    const data = {
        _id:        uid(),
        origNote:   message.value,
        date:       dayjs().format('YYYY-MM-DD HH:mm:ss'),
        device:     true,
        car:        car.value?._id || '',
        name:       car.value?.name || '',
        user:       beifahrer.value || null,
        received:   true
    };

    messengerStore.setMessage(data);
    
    await auditStore.setItem({type: 'messages', value: data });

    message.value = '';
}

function calcStamp (date: string) {
    return dayjs(date).subtract(10, 'seconds').locale('de').from(timestamp.value)
}

function checkDateIndex ( index: number ) {
    if ( !messages.value )
        return 'Keine Nachrichten'

    if ( messages.value.length === 1 )
        return dayjs(messages.value[index].date ).locale('de').format('dddd, YYYY-MM-DD');
    if ( messages.value[index - 1] && dayjs(messages.value[index].date ).format('YYYY-MM-DD') !== dayjs(messages.value[index - 1].date ).format('YYYY-MM-DD'))
        return dayjs( messages.value[index].date ).locale('de').format('dddd, YYYY-MM-DD');
    else
        return false;
}

function setStamp ( item: { date: string } ) {
    if ( dayjs(item.date).format('YYYY-MM-DD HH:mm:ss') > dayjs().subtract(10, 'minutes').format('YYYY-MM-DD HH:mm:ss') )
        return calcStamp(item.date)
    else
        return dayjs(item.date).format('HH:mm')
}

Keyboard.addListener('keyboardDidShow', () => {
    setTimeout( () => {
        const element = document.querySelector('.scrollHeight');
        if (element)
            element.scrollTop = element.scrollHeight;
    } )
});
</script>

<style scoped>
    :deep(.scrollHeight) {
        padding-top: 50px;
        height: calc(100vh - 250px);
        width: 100%;
        overflow-y: scroll;
    }

    .height {
        padding-bottom: 100px;
        min-height: calc(100vh - 150px);
        width: 100%;
    }

    :deep(.q-field--dark .q-field__marginal) {
        color: rgba(255, 255, 255, 0.7);
    }
</style>
