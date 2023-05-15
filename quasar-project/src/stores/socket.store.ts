import { defineStore, storeToRefs }         from 'pinia';
import Debug                                from 'debug';
import { useAccountStore }                  from './account.store';
import { useMenuStore }                     from './menu.store';
import { useMessengerStore }                from './messenger.store';
import { useFahrberichteStore }             from './fahrberichte.store';
import { sock1 }                            from '@w4b/socket-1';
import { ISocket4, sock4 }                  from '@w4b/socket-4';
import { App }                              from '@capacitor/app';
import { LocalNotifications }               from '@capacitor/local-notifications';

const log       = Debug('app:socket.module');

let sockHdl: any = null;

export interface ISocketState {
    _socket:         ISocket4 | null;
    _connected:      boolean
}

export const useSocketStore = defineStore('socketStore', {
    state: (): ISocketState => ({
        _socket:         null,
        _connected:      false
    }),
    getters: {
        io: () => {
            return sockHdl;
        },
        connected: (state) => state._connected
    },
    actions: {
        async remove( ) {
            log('remove', sockHdl)
            sockHdl = await sockHdl.removeListener();
            sockHdl = null;
            log('remove done', sockHdl)
            this._connected = false;
        },

        async init( ) {
            const accountStore  = useAccountStore();
            const { version: accVersion, domain: accDomain, device } = storeToRefs(accountStore);

            const menuStore     = useMenuStore();
            const { item } = storeToRefs(menuStore);

            sockHdl = null;
            const version       = accVersion.value ? accVersion.value.split('.')[0] : 'X';

            const domain = `https://${accDomain.value}.dispolive.de`

            //switch here between different socket versions
            sockHdl   = version >= '6' ? await sock4.init(domain) : await sock1.init(domain);
            
            if ( device.value.platform === 'ios' )
                LocalNotifications.requestPermissions();

            App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
                log('appstate change')
                accountStore.setAppInForeground( isActive )
            });

            return new Promise( ( resolve, reject) => {
                try {
                    log( 'after init', sockHdl );

                    sockHdl.on('connect', () => {
                        this._connected = true;

                        const fahrberichteStore = useFahrberichteStore();
                        fahrberichteStore.getChangesFb();

                        menuStore.createSocketRoom()
                        menuStore.setStatus({})

                        const messengerStore = useMessengerStore();
                        messengerStore.getMessagesNow()

                        resolve(true)
                    })

                    sockHdl.on('disconnect', () => {
                        this._connected = false;
                        log('disconnect')
                        resolve(true)
                    })

                    sockHdl.on('receivedFb', () => {
                        log('receivedFb')
                        const fahrberichteStore = useFahrberichteStore();
                        fahrberichteStore.getChangesFb();
                    });
            
                    sockHdl.on( 'sendAppCarNote', async ( ) => {
                        const messengerStore = useMessengerStore();
                        messengerStore.getMessagesNow()
                    });

                    sockHdl.on( 'addCarToPause', async ( ) => {
                        if ( item.value?.status !== 'frei' )
                            return;

                        const stat = await menuStore.setStatus({status: 'pause'})

                        if ( stat?.error === 'activeTrips' ) {
                            accountStore.setPauseDialog(true)
                            return;
                        }

                        menuStore.informStatusPause(true)
                    });
                } catch (error) {
                    reject();
                }
            })
        }
    },
});
