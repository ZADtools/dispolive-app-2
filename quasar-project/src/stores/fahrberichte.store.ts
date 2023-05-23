import { defineStore, storeToRefs }     from 'pinia';
import Debug                            from 'debug';   
import dayjs                            from 'dayjs';
import { useMenuStore, IFahrbericht }                 from './menu.store';
import { useFahrberichtStore }          from './fahrbericht.store';
import { useAuditStore }                from './audit.store';
import { useFahrzeugeStore }            from './fahrzeuge.store';
import { accountService }               from 'src/services/account.service';

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
            //TODO
            //const global = Global();
            const fahrzeugeStore    = useFahrzeugeStore();
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
            //TODO
            // if ( data && data.length > 0 ) {
            //     _.each(data, async ( elm ) => {
                
            //         const fbOpen = _.find( rootGetters['nav/item'], (item) => {
            //             return item.item._id == elm.fbId;
            //         } )

            //         if ( elm.delete ) {

            //             log('fbOpen', fbOpen)

            //             if (fbOpen) {
            //                 global.tripAbort(fbOpen.item._id, fbOpen.item);
            //                 commit( 'setLastDeletedItem', fbOpen )
            //             }

            //             //remove item from trips array
            //             dispatch('setPreviewFb', false)
            //             commit( 'deleteItem', elm.fbId )

            //             dispatch('nav/removeNavPoint', {_id: elm.fbId}, {root: true})
                   
            //             dispatch( 'audio/play', 'entzogenFahrt', { root: true } );

            //             if ( !rootState.account.appInForeground && rootState.account.device.platform === 'ios' )
            //                 await LocalNotifications.schedule({
            //                     notifications: [ 
            //                         {
            //                             id:     Math.floor(Math.random() * 1000000000),
            //                             title:  'Fahrt entzogen',
            //                             body:   'Es wurde Ihnen eine Fahrt entzogen'
            //                         }
            //                     ]
            //                 });
            //         } else {
            //             const exists = _.find( state.data, function( item ) {
            //                 return item._id == elm.fbId;
            //             });
            //             log('exists', exists, elm.item)

            //             //check if item empty
            //             const empty = _.isEmpty(elm.item);

            //             if ( !empty ) {
            //                 let  item;
            //                 if ( exists ) { 
                                
            //                     item = jsondiffpatch.patch( {...exists}, elm.item);
            //                     item.sendStatusRead = '';
            //                     if (
            //                         fbOpen &&
            //                         ( 
            //                             exists.startStreet !== item.startStreet ||
            //                             exists.startZip !== item.startZip ||
            //                             exists.startCity !== item.startCity ||
            //                             exists.targetStreet !== item.targetStreet ||
            //                             exists.targetZip !== item.targetZip ||
            //                             exists.startInstitution !== item.startInstitution ||
            //                             exists.targetInstitution !== item.targetInstitution 
            //                         )
            //                     ) {
            //                         dispatch( 'audio/play', 'adresse', { root: true } );
            //                         dispatch('mainmenu/setAdressChange', true, {root: true})

            //                         if ( !rootState.account.appInForeground && rootState.account.device.platform === 'ios' )
            //                             await LocalNotifications.schedule({
            //                                 notifications: [ 
            //                                     {
            //                                         id:     Math.floor(Math.random() * 1000000000),
            //                                         title:  'Adressänderungen',
            //                                         body:   'Es wurde die Adresse der Fahrt geändert'
            //                                     }
            //                                 ]
            //                             });
            //                     }

            //                     sendungsData.fbId       = item._id;
            //                     sendungsData._id        = item._id;
            //                     sendungsData.status     = 'sendStatusArrived';

            //                     dispatch('audit/setItem', { type: 'sendungsstatus', value: sendungsData, fb: item }, {root:true})
            //                     dispatch('updateItem', item);
            //                     if (!fbOpen)
            //                         dispatch('trip/setShowItem', item, {root: true});
            //                     dispatch('account/globalDispatcher', item, {root: true});
            //                     dispatch('nav/updateNavPoint', item, {root: true});

            //                 } else {
                                
            //                     let item = jsondiffpatch.patch({}, elm.item)

            //                     sendungsData.fbId       = item._id;
            //                     sendungsData._id       = item._id;
            //                     sendungsData.status     = 'sendStatusArrived';

            //                     dispatch('audit/setItem', { type: 'sendungsstatus', value: sendungsData, fb: item }, {root:true})

            //                     dispatch('insertItem', item)
            //                     dispatch('mainmenu/setProgress', item, {root: true});

            //                     dispatch( 'audio/play', 'neueFahrt', { root: true } );

            //                     if ( !rootState.account.appInForeground && rootState.account.device.platform === 'ios' )
            //                         await LocalNotifications.schedule({
            //                             notifications: [ 
            //                                 {
            //                                     id:     Math.floor(Math.random() * 1000000000),
            //                                     title:  'Neue Fahrt',
            //                                     body:   'Sie haben eine neue Fahrt'
            //                                 }
            //                             ]
            //                         });
            //                 }
            //             }
            //         }

            //         // Änderung auf dem Server löschen
            //         rootGetters['socket/io'].emit( 'removeFBChange', elm._id );
            //     });
            // }
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
