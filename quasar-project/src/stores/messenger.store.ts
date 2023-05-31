import { defineStore, storeToRefs }                 from 'pinia';
import Debug                                        from 'debug';  
import { useAccountStore, IUser }                   from './account.store'; 
import { extend }                                   from 'quasar';
import { useFahrzeugeStore }                        from './fahrzeuge.store';
import { LocalNotifications }                       from '@capacitor/local-notifications';
import { accountService }                           from 'src/services/account.service';
import { useAuditStore }                            from './audit.store';

const log       = Debug('app:messenger.module');

export interface IMessage {
    _id?:            string;
    received:        boolean;
    note?:            string;
    origNote:        string;
    date:            string;
    device:          boolean;
    car:             string;
    name:            string;
    user:            IUser | null;
}

export interface IMessengerState {
    _data:           IMessage[]
    _messages:       IMessage[];
    _lastAccess:     string | null
    _index:          number,
    _scrollEnd:      boolean,
    _lastItem:       string,
    _selectedText:   string,
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
        unread:         state => state._unread
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const textbausteine: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'textbausteine', filter:{ app: true } } } );
                this._data = textbausteine.data;
            } catch (error) {
                log( 'Error getData', error );
            }
        },
        remove( ) {
            this._index     = 0;
            this._messages  = [];
            this._unread    = 0;
        },
        setMessengerLoad( bool: boolean) {
            const accountStore = useAccountStore();
            accountStore._progressBarLoad = bool
        },
        setSelectedText( text: string ) {
            this._selectedText = text
        },
        setUnread( count: number ) {
            this._unread = count
        },
        setMessages( messages : IMessage[] ) {
            if ( !this._messages )
                this._messages = []

            messages.forEach((message: any, index: number) => {
                this._messages.unshift(message);
            })

            if ( this._messages && this._messages.length > 0 )
                this._lastItem = this._messages[this._messages.length - 1]?._id || '';
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
                        
                        const auditStore = useAuditStore();
                        auditStore.setItem(item);
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
            const fahrzeugeStore = useFahrzeugeStore();
            const { item } = storeToRefs(fahrzeugeStore);
    
            try {
                const messages: any     = await accountService.getDataSocket( { 
                    event: 'getDefaultCol', 
                    param: { 
                        index, 
                        col: 'messages', 
                        filter:{  
                            car: item.value?._id
                        } 
                    } 
                } );

                if (messages.data)
                    messages.data.forEach( ( message: any ) => {
                        message.send = true
                    } )

                this.setMessages( messages.data )
                this._index = index
                this.setReceive( messages )

                return messages
            } catch (error) {
                log( 'Error getData', error );
                this._messages = [];
            }
        },
        async getMessagesNow( data?: IMessage ) {
            log( 'getMessagesNow');
            const fahrzeugeStore = useFahrzeugeStore();
            const { item } = storeToRefs(fahrzeugeStore);

            const accountStore = useAccountStore();
            const { secondHeader, device, appInForeground } = storeToRefs(accountStore);

            if (!data)
                try {
                    if ( item.value?._id ) {
                        const messages: any     = await accountService.getDataSocket( { 
                            event: 'getDefaultCol', 
                            param: { 
                                col: 'messages', 
                                filter:{  
                                    car: item.value._id,
                                    received: { $exists: false }
                                } 
                            } 
                        } );

                        messages.data.forEach( async ( message: any ) => {
                            message.send = true
                            this.setMessage( message )
                            accountStore.sendAppCarNote(message)

                            this.setReceive( { data: [message] } )

                            if ( !appInForeground.value && device.value.platform === 'ios' )
                                await LocalNotifications.schedule({
                                    notifications: [ 
                                        {
                                            id:     Math.floor(Math.random() * 1000000000),
                                            title:  'Nachricht von Zentrale',
                                            body:   message.note
                                        }
                                    ]
                                });
                        } )
                        //TODO 
                        // if ( messages && messages.data && messages.data.length > 0 )
                        //     dispatch( 'audio/play', 'neueNachricht', { root: true } );
                        
                        if (secondHeader.value !== 'messages' && messages.data)
                        this.setUnread( this._unread + messages.data.length )

                        //dispatch('setReceive', messages)
                        return messages
                    }
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
