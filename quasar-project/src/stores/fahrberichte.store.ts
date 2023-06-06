import { defineStore, storeToRefs }     from 'pinia';
import Debug                            from 'debug';   
import dayjs                            from 'dayjs';
import { useMenuStore, IFahrbericht }                 from './menu.store';
import { useFahrberichtStore }          from './fahrbericht.store';
import { useNavStore }                  from './nav.store';
import { useAuditStore }                from './audit.store';
import { useFahrzeugeStore }            from './fahrzeuge.store';
import { accountService }               from 'src/services/account.service';
import { useAudioStore }                from './audio.store';
import { useAccountStore }              from './account.store';
import { useSocketStore }               from './socket.store';
import { LocalNotifications }           from '@capacitor/local-notifications';
import * as jsondiffpatch               from 'jsondiffpatch';
import Global                           from 'src/helpers/Global';

const global = Global()
const log       = Debug('app:fahrberichte.module');

export interface IFahrberichteState {
    _data:           IFahrbericht[];
    _actDay:         string;
    _previewFb:      boolean;
    _lastDeletedItem: string;
    _selectedDay:      string;
}

export const useFahrberichteStore = defineStore('fahrberichteStore', {
    state: (): IFahrberichteState => ({
        _data:                   [],
        _actDay:                 '',
        _previewFb:              false,
        _lastDeletedItem:        '',
        _selectedDay:            'today'
    }),
    getters: {
        data: (state) => state._data,
        actDay: (state) => state._actDay,
        previewFb: (state) => state._previewFb,
        lastDeletedItem: (state) => state._lastDeletedItem
    },
    actions: {
        clearData( ) {
            this._previewFb = false;
            this._data      = [];
        },
        setActDay( day: string ) {
            this._actDay = day;
        },
        async loadDay () {
            const day = this._selectedDay === 'next' ? dayjs(this._actDay, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
            switch (this._selectedDay) {
                case 'next':
                    this.setActDay(day);
                    await this.getData(day);
                    break;
                default:
                    this.setActDay(day);
                    await this.getData(day);
                    break;
            }
        },
        async getItemById( id: string ) {
            const fb: any = this._data.find(( item: IFahrbericht ) => {
                return item._id === id;
            })
            
            return fb || {};
        },
        setLastDeletedItem( item: string ) {
            this._lastDeletedItem = item;
        },
        async updateItem( fahrbericht: IFahrbericht ) {
            this._data = this._data.map(( item: IFahrbericht ) => {
                return item._id === fahrbericht._id ? { ...item, ...fahrbericht } : item;
            });

            this._data = this._data.sort((a: IFahrbericht, b: IFahrbericht) => a.startTime.localeCompare(b.startTime));
        },
        async insertItem( fahrbericht: IFahrbericht ) {
            this._data = [...this._data, fahrbericht];

            this._data = this._data.sort((a: IFahrbericht, b: IFahrbericht) => a.startTime.localeCompare(b.startTime));
        },
        async setSendungsStatus( item: IFahrbericht ) {
            const fahrzeugeStore    = useFahrzeugeStore();

            if (item.date !== dayjs().format('YYYY-MM-DD'))
                return
            
            if ( !item.sendStatusRead ) {
                const { item: car } = storeToRefs( fahrzeugeStore );
                const carId = car.value?._id || '';

                const sendungsData = {
                    carNo:              carId,
                    date:               dayjs().format('YYYY-MM-DD'),
                    fbId:               item._id,
                    _id:                item._id,
                    status:             'sendStatusRead'
                }
                const auditStore = useAuditStore();
                await auditStore.setItem( { type: 'sendungsstatus', value: sendungsData, fb:item } );
            }
        },
        setPreviewFb( bool: boolean) {
            log('setPreviewFb', bool)
            this._previewFb = bool;

            const fahrberichtStore = useFahrberichtStore();
            const { item } = storeToRefs( fahrberichtStore );

            if (item.value?.date !== dayjs().format('YYYY-MM-DD'))
                return
            
            if ( bool && !item.value?.sendStatusRead ) {
                const newItem =  { ...item.value, sendStatusRead: true }
                this.updateItem( newItem )
            }
        },
        deleteItem( id: string ) {
            const index    = this._data && this._data.findIndex( item => item._id === id );

            if ( index > -1 )
                this._data.splice( index, 1 );
        },
        async getChangesFb( ) {
            const fahrzeugeStore    = useFahrzeugeStore();
            const fahrberichtStore  = useFahrberichtStore();
            const navStore          = useNavStore();
            const menuStore         = useMenuStore();
            const audioStore        = useAudioStore();
            const auditStore        = useAuditStore();
            const accountStore      = useAccountStore();
            const { item: accCar }    = storeToRefs( fahrzeugeStore );
            const car = accCar.value?._id || '';

            const data: any     = await accountService.getDataSocket( { event: 'getFBChanges', param: { car } } );
            
            const sendungsData = {
                carNo:              car,
                date:               dayjs().format('YYYY-MM-DD'),
                fbId:               '',
                _id:                null,
                status:             ''
            }
            log(sendungsData)

            if ( data && data.length > 0 ) {
                data.forEach(( elm: any ) => {
                    if ( elm.delete ) {
                        try {
                            this.setPreviewFb(false)
                            this.deleteItem( elm.fbId )
                            global.removeStore(elm.fbId)
                            global.setSelectedNavPoint();
                            navStore.removeNavPoint({_id: elm.fbId});
                            
                            console.log(fahrberichtStore._item, elm.fbId)
                            if ( fahrberichtStore._item?._id === elm.fbId )
                                this.router.push({path: '/app/fahrberichte'})

                            fahrberichtStore.removeSelectedItem(elm.fbId);
                        } catch (error) {
                            console.log('error', error)
                        }

                        audioStore.play( 'entzogenFahrt' );

                        if ( !accountStore._appInForeground && accountStore._device.platform === 'ios' )
                            LocalNotifications.schedule({
                                notifications: [ 
                                    {
                                        id:     Math.floor(Math.random() * 1000000000),
                                        title:  'Fahrt entzogen',
                                        body:   'Es wurde Ihnen eine Fahrt entzogen'
                                    }
                                ]
                            });
                    } else {
                        const exists = this._data.find(( item ) => {
                            return item._id === elm.fbId
                        });
                        console.log('exists', exists, elm.item)

                        //check if item empty
                        const notEmpty = Object.keys(elm.item || {}).length > 0;

                        if ( notEmpty ) {
                            let  item;

                            if ( exists ) { 
                                item = jsondiffpatch.patch( {...exists}, elm.item);
                                item.sendStatusRead = '';
                                if (
                                    fahrberichtStore._item?._id &&
                                    ( 
                                        exists.startStreet !== item.startStreet ||
                                        exists.startZip !== item.startZip ||
                                        exists.startCity !== item.startCity ||
                                        exists.targetStreet !== item.targetStreet ||
                                        exists.targetZip !== item.targetZip ||
                                        exists.startInstitution !== item.startInstitution ||
                                        exists.targetInstitution !== item.targetInstitution 
                                    )
                                ) {
                                    audioStore.play('adresse')
                                    menuStore.setAdressChange(true)

                                    if ( accountStore._appInForeground && accountStore._device.platform === 'ios' )
                                        LocalNotifications.schedule({
                                            notifications: [ 
                                                {
                                                    id:     Math.floor(Math.random() * 1000000000),
                                                    title:  'Adressänderungen',
                                                    body:   'Es wurde die Adresse der Fahrt geändert'
                                                }
                                            ]
                                        });
                                }

                                sendungsData.fbId       = item._id;
                                sendungsData._id        = item._id;
                                sendungsData.status     = 'sendStatusArrived';

                                auditStore.setItem( { type: 'sendungsstatus', value: sendungsData, fb: item } );
                                this.updateItem( item )

                                if (!fahrberichtStore._item?._id)
                                    fahrberichtStore.setShowItem( item )
                                
                                accountStore.globalDispatcher( item )
                                navStore.updateNavPoint(item)
                            } else {     
                                const item = jsondiffpatch.patch({}, elm.item)

                                sendungsData.fbId       = item._id;
                                sendungsData._id        = item._id;
                                sendungsData.status     = 'sendStatusArrived';

                                auditStore.setItem( { type: 'sendungsstatus', value: sendungsData, fb: item } );

                                this.insertItem( item )
                                menuStore.setProgress(item)

                                audioStore.play('neueFahrt')

                                if ( !accountStore._appInForeground && accountStore._device.platform === 'ios' )
                                    LocalNotifications.schedule({
                                        notifications: [ 
                                            {
                                                id:     Math.floor(Math.random() * 1000000000),
                                                title:  'Neue Fahrt',
                                                body:   'Sie haben eine neue Fahrt'
                                            }
                                        ]
                                    });
                            }
                        }
                    }

                    const socketStore = useSocketStore();
                    const { io } = storeToRefs( socketStore );
                    // Änderung auf dem Server löschen
                    io.value.emit( 'removeFBChange', elm._id );
                });
            }
        },
        // getData
        async getData( date: string ) {
            const fahrzeugeStore = useFahrzeugeStore();
            const { item: accCar } = storeToRefs( fahrzeugeStore );

            const menuStore = useMenuStore();
            const auditStore = useAuditStore();

            const car = accCar.value?._id || '';
            log(date, car)
            try {
                let fahrberichte: any     = await accountService.getDataSocket( { event: 'getFahrberichte', param: { date, car }} );
                log('fahrberichte', fahrberichte)
                if (fahrberichte) {
                    for ( const fb of fahrberichte as any ) {
                        menuStore.setProgress(fb);

                        const sendungsData = {
                            carNo:              car,
                            date:               dayjs().format('YYYY-MM-DD'),
                            fbId:               fb._id,
                            _id:                fb._id,
                            status:             'sendStatusArrived'
                            
                        }

                        auditStore.setItem({ type: 'sendungsstatus', value: sendungsData, fb })
                    }
                }

                if (this._data) {
                    const drivedTrips: any = this._data.filter( (item : any) => {
                        return item.frei
                    } );

                    fahrberichte = [...fahrberichte, ...drivedTrips]

                    fahrberichte.sort(( a: any, b: any ) => { return b.startTime > a.startTime ? -1 : 1 } );
                }
                    
                this._data = fahrberichte;
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }

    },
});
