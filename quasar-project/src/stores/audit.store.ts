import { defineStore, storeToRefs }                 from 'pinia';
import Debug                                        from 'debug';  
import dayjs                                        from 'dayjs';
import advancedFormat                               from 'dayjs/plugin/advancedFormat';
import { openDB }                                   from 'idb';
import { uid, Notify, extend }                              from 'quasar';
import { IFahrbericht }                             from './menu.store';
import { useAccountStore }                          from './account.store';
import { useMessengerStore }                        from './messenger.store';
import { accountService }                           from 'src/services/account.service'; 
import { useNavStore }                              from './nav.store';

dayjs.extend(advancedFormat)
const log       = Debug('app:audit.module');

export interface IAuditItem {
    type:                string;
    _id?:                string;
    timestampIntern?:    string;
    item?:               any;
    value?:              any;
    desiProt?:           any;
    fb?:                 IFahrbericht;
    noAlert?:            boolean;
}

export interface IAuditStore { 
    _data:           IAuditItem[];
    _item:           unknown | null;
    _file:           boolean;
    _db:             any;
    _sendDataActive: boolean;
}

export const useAuditStore = defineStore('auditStore', {
    state: (): IAuditStore => ({
        _data:           [],
        _item:           null,
        _file:           false,
        _db:             null,
        _sendDataActive: false
    }),
    getters: {
        data:           state => state._data,
        item:           state => state._item,
        file:           state => state._file,
        db:             state => state._db,
        sendDataActive: state => state._sendDataActive
    },
    actions: {
        async init( ) {
            const db = await openDB('dispolive', 2, {
                upgrade(db) {
                    const store = db.createObjectStore('data', {
                        keyPath:        'id',
                        autoIncrement:  true
                    });

                    store.createIndex('id', 'id');
                },
            });
            
            this._db = db;

            log('initDb')
        },
        setSendDataActive ( data: boolean ) {
            this._sendDataActive = data;
        },
        async getData( ) {
            let result = await this._db.getAll( 'data' );

            if ( result )
                result = result.sort( (a: any, b: any) => { 
                    return a.timestamp > b.timestamp ? 1 : -1
                })

            this._data = result || [];
        },
        async actionDb( { item, methode }: { item?: any, methode: string } ) {
            let sql                     = '',
                data                    = null;

            if (!this._db)
                return;

            switch (methode) {
                case 'INSERT':
                    sql     = 'add';
                    data   = {
                        id:             uid(), 
                        date:           dayjs().format('YYYY-MM-DD HH:mm:ss'), 
                        timestamp:      item.timestampIntern, 
                        type:           item.type, 
                        item:           JSON.stringify(item.value)
                    };
                    break;
                case 'DELETE':
                    sql     = 'delete';
                    data    = item;
                    break;
                default: 
                    sql     = 'getAll';
                    break;
            }

            let result = await this._db[sql]( 'data', data ); 

            if ( methode === 'SELECT' ) {
                result = result.sort( ( a: any, b: any ) => {
                    if ( a.timestamp < b.timestamp )
                        return -1
                    else
                        return 1
                } )
                        
                if ( !result )
                    return false

                if (result.length > 0)
                    return result[0]
                else
                    return false
            } else
                return true
        },
        async dropDb() {
            log('Drop Db')

            const db = this._db

            db.clear('data')
        },
        async write( data: any ) {
            try {
                data.item = JSON.parse(data.item);
                const id: any = await accountService.transferItem({ item: data })

                if ( !id.error ) {
                    await this.removeItem(id)
                    if ( data.type === 'messages' ) {
                        const messengerStore = useMessengerStore()
                        messengerStore.setSend(data.item)
                    }
                    return true
                } else
                    return false
            } catch (err) {
                log('write', err);
                this.setSendDataActive(false);
            }
        },
        async sendDataOnce (  ) {
            try {
                const accountStore = useAccountStore()
                const { connected } = storeToRefs(accountStore)

                const connect       = connected.value;

                if ( !connect )
                    return false

                const data = await this.actionDb({ methode: 'SELECT'})

                if (data)
                    return await this.write( data );
                else 
                    return false
            } catch ( err ) {
                log('sendDataOnce', err);
                this.setSendDataActive(false);
            }
        },
        async sendData ( ) {
            const accountStore = useAccountStore()
            const { connected } = storeToRefs(accountStore)
            const connect       = connected.value;

            if ( !connect )
                return false

            // Wenn Daten schon gesendet werden abbrechen
            if ( this._sendDataActive )
                return 

            this.setSendDataActive(true);
            
            while ( true ) {
                try {
                    if ( !await this.sendDataOnce() ) {
                        this.setSendDataActive(false);
                        break;
                    }
                } catch ( err ) {
                    this.setSendDataActive(false);
                    break;
                }
            }
        },
        async setItem( item: IAuditItem ) {
            log( 'setItem', item.type, item );
            if (!item.type) {
                console.log("Datensatz hat kein 'type' ungültige Struktur'");
                return;
            }

            if (!item.value) {
                console.log("Datensatz hat kein 'value' ungültige Struktur");
                return;
            }

            if (!item.value._id) {
                console.log("Datensatz hat kein '_id' ungültige Struktur");
                return;
            }

            const accountStore = useAccountStore()
            const { geoPos } = storeToRefs(accountStore)

            const navStore = useNavStore()
            const { data: navItems, selected: selectedNav } = storeToRefs(navStore)

            //set timestamp
            item.timestampIntern = dayjs().format('x');

            try {
                //******HOOOK before DB Update
                if (item.type === 'sonderNotice') {
                    item.value.fbId                             = item.value._id;
                    item.value.sonderrechte                     = 1;

                    if (selectedNav.value)
                        selectedNav.value.sonderrechte              = 1;
                }

                if (item.type === 'zeitstempel') {
                    item.value.koords                           = geoPos.value;
                    item.value.time                             = dayjs().format('HH:mm');
                    item.value.fbId                             = item.value._id;
                }
                //******HOOOK Ende
                const data: any = extend(true, {}, item);

                //******HOOOK delete before DB Update
                if ( data.desiProt )
                    delete data.desiProt;
                //******HOOOK Ende

                //const tx = await dispatch('openTransaction');
                await this.actionDb({item: data, methode: 'INSERT'})

                //******HOOOK after DB Update
                if (item.type === 'zeitstempel') {
                    const fb = navItems.value.find((fb: any) => {
                        return item.value._id === fb.item._id;
                    }); 
                    
                    if (item.value.type !== 'Linie') {
                        item.value[item.value.status]               = item.value.time;
                        item.value[item.value.status + '_koords']   = item.value.koords;
                    } else {
                        item.value.stops = [];

                        fb.item.stops.forEach( ( stop: any ) => {
                            const cloneStop: any = extend(true, {}, stop);

                            if (stop._id === item.value.id) {
                                cloneStop.timestamp  = item.value.timestamp;
                                cloneStop.einstieg   = item.value.einstieg;
                            }

                            item.value.stops.push( cloneStop )
                        } )
                    }

                    //const data = fb.item.stops = item.value //{...fb.item, ...item.value};
                    
                    await accountStore.globalDispatcher(item.value)
                }

                //berechne den fortschritt der fahrt neu
                if (item.type === 'fahrbericht') {
                    if (item.value.frei)
                        item.value.gefahren = 1;

                    const data = {...item.fb, ...item.value};
                        
                    await accountStore.globalDispatcher(data)
                }
                //******HOOOK Ende
                
                if ( item.type !== 'sendungsstatus' && !item.noAlert && item.type !== 'messages' && item.type !== 'receiveChatMessage')
                    Notify.create({
                        type: 'positive',
                        message: 'Erfolgreich gespeichert',
                        position: 'bottom',
                        progress: true,
                        timeout: 2000,
                        color: 'secondary',
                        classes: 'glossy',
                    })

                if (item.type === 'sendungsstatus') {
                    log('sendungsStatus', item.value)
                    const data = {...item.fb, ...{[item.value.status]: true}};
                    
                    await accountStore.globalDispatcher(data)
                }

                if (item.type === 'pauseStatus') {
                    log('pauseStatus', item.value)
                    const data = {...item.fb, ...{[item.value.status]: true}};
                    //TODO prüfen ob das richtog ist
                    await accountStore.globalDispatcher(data)
                }
        
                await this.sendData();
            } catch (error) {
                log( 'Error setItem', error );
                Notify.create({
                    type: 'negative',
                    message: 'Fehler beim Speichern',
                    position: 'bottom',
                    progress: true,
                    timeout: 2000,
                    color: 'negative',
                    classes: 'glossy',
                })
            }
        },
        async removeItem( id: string) {
            await this.actionDb({item: id, methode: 'DELETE'})
        },

        async sendFile( data: any) {
            log( 'sendFile' );
            
            try {
                const file     = await accountService.transferFile( {path: '/custom/userFiles/userFiles', param: data});
                this._file = file
                Notify.create({
                    type: 'positive',
                    message: 'Erfolgreich gespeichert',
                    position: 'bottom',
                    progress: true,
                    timeout: 2000,
                    color: 'secondary',
                    classes: 'glossy',
                })
                return file.data
            } catch (error) {
                log( 'Error sendFile', error );
                Notify.create({
                    type: 'negative',
                    message: 'Fehler beim Speichern',
                    position: 'bottom',
                    progress: true,
                    timeout: 2000,
                    color: 'negative',
                    classes: 'glossy',
                })
            }
        }
    }
});
