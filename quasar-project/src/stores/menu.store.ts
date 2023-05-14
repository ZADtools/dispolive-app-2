import { defineStore, storeToRefs }     from 'pinia';
import Debug                            from 'debug';
import { useAccountStore }              from './account.store';
import { useFahrzeugeStore }            from './fahrzeuge.store';
import pack                             from '../../package.json'
import dayjs                            from 'dayjs';

const log       = Debug('app:fahrzeuge.module');

export interface IFahrbericht {
    _id:            string;
    fahrzeug:       string;
    startBegin:     string;
    startEnd:       string;
    zielBegin:      string;
    ziel:           string;
    frei:           string;
}

export interface IMenuState {
    _progress:   any;
    _tripState:  any;
    _item: {
        status:         string | null,
        sonderrechte:   boolean
    },
    _adressChange:   boolean,
    _informPause:    boolean,
    _pauseTime:      String
}

export const useMenuStore = defineStore('menuStore', {
    state: (): IMenuState => ({
        _progress:   {},
        _tripState:  {},
        _item: { 
            status:         'frei', 
            sonderrechte:   false
        },
        _adressChange: false,
        _informPause: false,
        _pauseTime:  ''
    }),
    getters: {
        progress: (state) => state._progress,
        tripState: (state) => state._tripState,
        item: (state) => state._item,
        adressChange: (state) => state._adressChange,
        informPause: (state) => state._informPause,
        pauseTime: (state) => state._pauseTime
    },
    actions: {
        informStatusPause( data: boolean ) {
            this._informPause = data;
        },
        setSonderrechteApp( status: string ) {
            const accountStore      = useAccountStore();
            const { sessionId }     = storeToRefs(accountStore);

            const fahrzeugeStore    = useFahrzeugeStore();
            const { item }          = storeToRefs(fahrzeugeStore);
            
            let data: any = {
                sessionID: sessionId.value,
                status: { 
                    car:            item.value?._id,
                    carStatus:      this._item.status,
                    version:        pack.version
                }
            };
            //TODO
            //rootGetters['socket/io'].emit('setCarStatus', data);
            this._item.sonderrechte = false;
        },
        setAdressChange( status: boolean ) {
            log('setAdressChange', status)
            this._adressChange = status;
        },
        callDisposition( ) {
            //TODO
            //dispatch('setSelectedText', 'Rückruf angefordert', {root: true})
        },
        async setProgress( fb: IFahrbericht ) {
            
            let progress = 0;
            let status = { key: 'startBegin', text: 'Anfahrt' };

            if (fb.startBegin) {
                progress = 0.25;
                status = { key: 'startEnd', text: 'Ankunft Abholort' };
            }
            if (fb.startEnd) {
                progress = 0.5;
                status = { key: 'ziel', text: 'Abfahrt' };
            }
            if (fb.ziel) {
                progress = 0.75;
                status = { key: 'zielBegin', text: 'Ankunft Zielort' };
            }
            if (fb.zielBegin) {
                progress = 1;
                status = { key: 'frei', text: 'Frei' };
            }
            if (fb.frei) {
                progress = 1;
                status = { key: 'startBegin', text: 'Anfahrt' };
            }

            this._progress = { ...this._progress, [fb._id]: progress }
            this._tripState = { ...this._tripState, [fb._id]: status }
        },
        async setStatus( { fbId, status }: { fbId?: string, status?: string } ) {
            const fahrzeugeStore    = useFahrzeugeStore();
            const { item }          = storeToRefs(fahrzeugeStore);

            const accountStore      = useAccountStore();
            const { sessionId }     = storeToRefs(accountStore);

            if ( !item.value?._id)
                return {error: 'noCar'}
            //TODO
            // if (status == 'pause' && rootGetters['nav/item'].length > 0)
            //     return {error: 'activeTrips'}

            // if (status !== 'zielBegin' && status !== 'sonderrechte' && status !== 'pause' && rootGetters['nav/item'].length > 0) {
            //     status = 'besetzt';
            // }
            // if (status !== 'zielBegin' && status !== 'sonderrechte' && status !== 'pause' && rootGetters['nav/item'].length  === 0) {
            //     status = 'frei';
            // }

            // if (status !== 'zielBegin' && status !== 'sonderrechte' && status !== 'pause' && status == 'pause' && state.item.status == 'pause')
            //     status = 'frei';
            
            // if ( status === 'logout' )
            //     status = '';

            // if ( status == 'pause' ) {
            //     let stempel = {
            //         _id:        uid(),
            //         fahrer:     rootGetters['account/fahrer'],
            //         beifahrer:  rootGetters['account/beifahrer'],
            //         car:        rootGetters['fahrzeuge/item'],
            //         date:       moment().format('YYYY-MM-DD'),
            //         time:       moment().format('HH:mm'),
            //         pause:      status == 'pause' && state.item.status == 'pause' ? false : true
            //     };

            //     dispatch("audit/setItem", {type: 'pauseStatus', value: stempel}, {root: true});
            //     dispatch('audit/sendData', {}, {root: true});
            // }

            if ( status == 'pause' && this._item.status == 'pause')
                status = 'frei';

            if (status == 'sonderrechte') {
                this._item.sonderrechte = true;
                //return;
            }
    
            if ( status !== 'zielBegin' )
                this.item.status = status

            if (this._item.status === 'pause')
                this._pauseTime = dayjs().format('HH:mm')
            else
                this._pauseTime = ''

            let data: any = {
                sessionID:          sessionId.value,
                status: { 
                    car:            item.value?._id,
                    carStatus:      this._item.status,
                    version:        pack.version      
                }
            };

            if ( status === 'frei' )
                data.status.sonderrechte = 0;

            if ( fbId )
                data.status.fbId = fbId;

            log('setStatus', data, status)

            if (status == 'zielBegin'){
                data.status.sonderrechte = 0;
                //TODO
                //rootGetters['socket/io'].emit( 'setSonderrechte', data );
            }

            if ( status == 'sonderrechte' ) {
                data.status.sonderrechte = 1;
                //TODO
                //rootGetters['socket/io'].emit( 'setSonderrechte', data );
            }else {
                //rootGetters['socket/io'].emit('setCarStatus', data);
            }
        },
        createSocketRoom( ) {
            const fahrzeugeStore    = useFahrzeugeStore();
            const { item: car }          = storeToRefs(fahrzeugeStore);

            const accountStore      = useAccountStore();
            const { sessionId }     = storeToRefs(accountStore);
            //TODO
            // if (car && rootGetters['socket/io']) {
            //     log('createSocketRoom')
            //     //erstelle einen chatroom oder benutze einen vorhandenen
            //     rootGetters['socket/io'].emit(
            //         'setCarConn',
            //         {
            //             car:        car.value?._id,
            //             conn:       'online',
            //             sessionID:  sessionId.value,
            //         }, () => {
            //             log('setCarConn')
            //         }
            //     );
            // }
        }
        

    },
});
