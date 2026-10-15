import { defineStore, storeToRefs }     from 'pinia';
import Debug                            from 'debug';
import { uid }                          from 'quasar';
import { useAccountStore }              from './account.store';
import { useFahrzeugeStore }            from './fahrzeuge.store';
import { useSocketStore }               from './socket.store';
import { useNavStore }                  from './nav.store';
import { useAuditStore }                from './audit.store';
import pack                             from '../../package.json'
import dayjs                            from 'dayjs';

const log       = Debug('app:fahrzeuge.module');

export interface IStopItem {
    _id:            string;
    timestamp:      string;
    street:        string;
    zip:          string;
    city:         string;
    lat:          number;
    lng:          number;
    adress:       string;
}
export interface IFahrbericht {
    _id:            string;
    fahrzeug:       string;
    startBegin:     string;
    startEnd:       string;
    zielBegin:      string;
    ziel:           string;
    frei:           string;
    startTime:      string;
    date:           string;
    sendStatusRead: boolean;
    patSurname:     string;
    patName:        string;
    type:           string;
    titel?:          string;
    materialfahrt?: boolean;
    stops?:         IStopItem[];
    startStreet?:   string;
    startZip?:      string;
    startCity?:     string;
    targetStreet?:    string;
    targetZip?:       string;
    targetCity?:      string;
    startLat?:        number;
    startLng?:        number;
    targetLat?:       number;
    targetLng?:       number;
    infektion?:       boolean;
    desiProt?:        boolean;
    ausrueckZeit?:    string;
    zuweisZeit?:      string;
    startTimeBis?:    string;
    sonderrechte?:    boolean;
    startInstitution?: string;
    targetInstitution?: string;
    color?:            string;
    einsatzNummer?:    string;
    changes?:          boolean;
    itName?:           string;
    infectionType?:    string;
    transVorhanden?:   string;
    newsPatient?:      string; 
    newsCar?:         string;
    time?:           string;
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
    _pauseTime:      string
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
        setAdressChange( status: boolean ) {
            log('setAdressChange', status)
            this._adressChange = status;
        },
        async setProgress( fb: IFahrbericht ) {
            let progress = 0
            let status = { key: 'startBegin', text: 'Anfahrt' }

            if (fb.startBegin) {
                progress = 0.25
                status = { key: 'startEnd', text: 'Ankunft Abholort' }
            }
            if (fb.startEnd) {
                progress = 0.5
                status = { key: 'ziel', text: 'Abfahrt' }
            }
            if (fb.ziel) {
                progress = 0.75
                status = { key: 'zielBegin', text: 'Ankunft Zielort' }
            }
            if (fb.zielBegin) {
                progress = 1
                status = { key: 'frei', text: 'Frei' }
            }
            if (fb.frei) {
                progress = 1
                status = { key: 'startBegin', text: 'Anfahrt' }
            }

            if (fb.type === 'Linie' && fb.time) 
                progress = 0.25 

            this._progress[fb._id] = progress
            this._tripState[fb._id] = status
        },
        async setStatus( { fbId, status }: { fbId?: string, status?: string } ) {
            const fahrzeugeStore    = useFahrzeugeStore();
            const { item }          = storeToRefs(fahrzeugeStore);

            const accountStore      = useAccountStore();
            const { sessionId, fahrer, beifahrer }     = storeToRefs(accountStore);

            const navStore          = useNavStore();
            const { data: navItem } = storeToRefs(navStore);

            if ( !item.value?._id)
                return {error: 'noCar'}

            if (status === 'pause' && navItem.value.length > 0)
                return {error: 'activeTrips'}

            if (status !== 'zielBegin' && status !== 'sonderrechte' && status !== 'pause' && navItem.value.length > 0) {
                status = 'besetzt';
            }
            if (status !== 'zielBegin' && status !== 'sonderrechte' && status !== 'pause' && navItem.value.length  === 0) {
                status = 'frei';
            }

            if (status !== 'zielBegin' && status !== 'sonderrechte' && status !== 'pause' && status === 'pause' && this._item.status === 'pause')
                status = 'frei';
            
            if ( status === 'logout' )
                status = '';

            if ( status === 'pause' ) {
                const stempel = {
                    _id:        uid(),
                    fahrer:     fahrer.value,
                    beifahrer:  beifahrer.value,
                    car:        item.value,
                    date:       dayjs().format('YYYY-MM-DD'),
                    time:       dayjs().format('HH:mm'),
                    pause:      status === 'pause' && this._item.status === 'pause'
                };

                const auditStore        = useAuditStore();

                auditStore.setItem({type: 'pauseStatus', value: stempel})
                auditStore.sendData()
            }

            if ( status === 'pause' && this._item.status === 'pause')
                status = 'frei';

            if (status === 'sonderrechte') {
                this._item.sonderrechte = true;
            }
    
            if ( status !== 'zielBegin' && status !== 'sonderrechte' )
                this._item.status = status || ''

            if (this._item.status === 'pause')
                this._pauseTime = dayjs().format('HH:mm')
            else
                this._pauseTime = ''

            const data: any = {
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

            const socketStore      = useSocketStore();
            const { io }           = storeToRefs(socketStore);

            if (status === 'zielBegin') {
                data.status.sonderrechte = 0;
                io.value.emit( 'setSonderrechte', data );
            }

            if ( status === 'sonderrechte' ) {
                data.status.sonderrechte = 1;
                navItem.value[0].sonderrechte = 1;
                io.value.emit( 'setSonderrechte', data );
            } else {
                io.value.emit('setCarStatus', data);
            }
        },
        createSocketRoom( ) {
            const fahrzeugeStore    = useFahrzeugeStore();
            const { item: car }          = storeToRefs(fahrzeugeStore);

            const accountStore      = useAccountStore();
            const { sessionId }     = storeToRefs(accountStore);
            
            const socketStore       = useSocketStore()
            const { io }            = storeToRefs(socketStore)

            if (car && io.value) {
                log('createSocketRoom')
                //erstelle einen chatroom oder benutze einen vorhandenen
                io.value.emit(
                    'setCarConn',
                    {
                        car:        car.value?._id,
                        conn:       'online',
                        sessionID:  sessionId.value,
                    }, () => {
                        log('setCarConn')
                    }
                )
            }
        }
    }
});
