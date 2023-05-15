import { defineStore, storeToRefs }                 from 'pinia';
import Debug                                        from 'debug';  
import { useAccountStore }                          from './account.store'; 
import { extend }                                   from 'quasar';
import { useFahrzeugeStore }                        from './fahrzeuge.store';
import { LocalNotifications }                       from '@capacitor/local-notifications';

const log       = Debug('app:messenger.module');

export interface IMessage {
    _id?:            string;
    received:        boolean;
    note:            string;
}

export interface IMessengerState {
    _data:           IMessage[]
    _messages:       IMessage[];
    _lastAccess:     string | null
    _index:          number,
    _scrollEnd:      boolean,
    _lastItem:       string,
    _selectedText:   string,
    _messengerLoad:  boolean,
    _unread:         number   
}

export const useMessengerStore = defineStore('messengerStore', {
    state: (): IMessengerState => ({
        _data:           [],
        _messages:       [],
        _lastAccess:     null,
        _index:          0,
        _scrollEnd:      false,
        _lastItem:       '',
        _selectedText:   '',
        _messengerLoad:  false,
        _unread:         0
    }),
    getters: {
        data:           state => state._data,
        messages:       state => state._messages,
        lastAccess:     state => state._lastAccess,
        index:          state => state._index,
        scrollEnd:      state => state._scrollEnd,
        lastItem:       state => state._lastItem,
        selectedText:   state => state._selectedText,
        messengerLoad:  state => state._messengerLoad,
        unread:         state => state._unread
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                //TODO
                // const textbausteine: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'textbausteine', filter:{ app: true } } } );

                // commit( 'setData', textbausteine.data );
            } catch (error) {
                log( 'Error getData', error );
                throw error;
            }
        },
        remove( ) {
            this._index     = 0;
            this._messages  = [];
            this._unread    = 0;
        },
        setMessengerLoad( bool: boolean) {
            this._messengerLoad = bool
        },
        setSelectedText( text: string ) {
            this._selectedText = text
        },
        setUnread( count: number ) {
            this._unread = count
        },
        setMessage( message: IMessage ) {
            this._messages?.push(message);
            this._lastItem = message._id || '';

            const accountStore = useAccountStore();
            const { secondHeader } = storeToRefs(accountStore);

            if (secondHeader.value !== 'messages')
                this._unread = this._unread + 1
        },
        setSend( data: IMessage ) {
            this._messages.forEach(( item: any ) => {
                if ( item._id === data._id ) {
                    item.send = true
                }
            });

            this._messages = extend( true, [], this._messages )
        },
        setReceive( messages: { data: IMessage[] } ) {
            if ( messages.data )
                messages.data.forEach( async (message: IMessage) => {
                    if (!message.received) {
                        const item = { 
                            noSaveNotify: true,
                            type: 'receiveChatMessage', 
                            value: {
                                _id: message._id
                            }
                        }
                        log(item)
                        //TODO
                        //dispatch('audit/setItem', item, {root: true});
                    }
                } )
        },   
        deleteIndex( ) {
            this._index = 0
            this._messages = []
            this.setScrollEnd( false )
        },
        setScrollEnd( item: boolean ) {
            this._scrollEnd = item
        },
        async getMessages( { index }: { index: number } ) {
            log( 'getMessages', index);
            
            try {
                // const messages: any     = await accountService.getDataSocket( { 
                //     rootGetters, 
                //     event: 'getDefaultCol', 
                //     param: { 
                //         index, 
                //         col: 'messages', 
                //         filter:{  
                //             car: rootGetters['fahrzeuge/item']._id
                //         } 
                //     } 
                // } );

                // messages.data.forEach( ( message: any ) => {
                //     message.send = true
                // } )

                // commit( 'setMessages', messages.data )
                // commit('setIndex', index)
                // dispatch('setReceive', messages)

                // return messages
            } catch (error) {
                log( 'Error getData', error );
                this._messages = [];
            }
        },
        async getMessagesNow( data?: IMessage ) {
            log( 'getMessagesNow');
            const fahrzeugeStore = useFahrzeugeStore();
            const { item } = storeToRefs(fahrzeugeStore);
            log(item.value)
            const accountStore = useAccountStore();
            const { secondHeader, device } = storeToRefs(accountStore);

            if (!data)
                try {
                    // if ( item.value?._id ) {
                    //     const messages: any     = await accountService.getDataSocket( { 
                    //         rootGetters, 
                    //         event: 'getDefaultCol', 
                    //         param: { 
                    //             col: 'messages', 
                    //             filter:{  
                    //                 car: rootGetters['fahrzeuge/item']._id,
                    //                 received: { $exists: false }
                    //             } 
                    //         } 
                    //     } );

                    //     messages.data.forEach( async ( message: any ) => {
                    //         message.send = true
                    //         commit( 'setMessage', message );
                    //         dispatch('account/sendAppCarNote', message, { root: true });
                    //         dispatch('setReceive', {data: [message]})
                    //         console.log('11111111', rootState.account.device)
                    //         if ( !rootState.account.appInForeground && rootState.account.device.platform === 'ios' )
                    //             await LocalNotifications.schedule({
                    //                 notifications: [ 
                    //                     {
                    //                         id:     Math.floor(Math.random() * 1000000000),
                    //                         title:  'Nachricht von Zentrale',
                    //                         body:   message.note
                    //                     }
                    //                 ]
                    //             });
                    //     } )
                        
                    //     if ( messages && messages.data && messages.data.length > 0 )
                    //         dispatch( 'audio/play', 'neueNachricht', { root: true } );
                        
                    //     if (rootGetters['account/secondHeader'] !== 'messages' && messages.data)
                    //         commit( 'setUnread', state.unread + messages.data.length )

                    //     //dispatch('setReceive', messages)
                    //     return messages
                    // }
                } catch (error) {
                    log( 'Error getData', error );
                    //commit( 'setData', [] );
                    throw error;
                }
            else {
                this.setMessage(data)
                if (secondHeader.value !== 'messages')
                    this.setUnread( this._unread + 1 )
                
                accountStore.sendAppCarNote( data )

                if (device.value.platform === 'ios')
                    await LocalNotifications.schedule({
                        notifications: [ 
                            {
                                id:     Math.floor(Math.random() * 1000000000),
                                title:  'Nachricht von Zentrale',
                                body:   data.note
                            }
                        ]
                    });
                this.setReceive({data: [data]})
            }
            //TODO
            //dispatch( 'audio/play', 'neueNachricht', { root: true } );
        }
    },
});
