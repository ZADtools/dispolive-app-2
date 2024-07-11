import { defineStore, storeToRefs, getActivePinia }                 from 'pinia';
import { Network }                                  from '@capacitor/network';
import { Device }                                   from '@capacitor/device';
import { AppLauncher }                              from '@capacitor/app-launcher';
import { StatusBar, Style }                         from '@capacitor/status-bar';
import { Keyboard }                                 from '@capacitor/keyboard';
import { BackgroundGeolocationPlugin }              from '@capacitor-community/background-geolocation';
import debug                                        from 'debug';
import { LocalStorage, openURL, Notify, Dark, QSpinnerOval, Loading }      from 'quasar'
import { accountService }                           from '../services/account.service';
import { useFahrberichtStore }                      from './fahrbericht.store';
import { useNavStore }                              from './nav.store';
import { useInventarStore }                         from './inventar.store';
import { useFahrberichteStore }                     from './fahrberichte.store';
import { useDienstplanStore }                       from './dienstplan.store';
import { useAudioStore }                            from './audio.store';
import { useAuditStore }                            from './audit.store';
import { useMessengerStore }                        from './messenger.store';
import { useSocketStore }                           from './socket.store';
import { version }                                  from '../../package.json';
import { useFahrzeugeStore }                        from './fahrzeuge.store';
import { useMenuStore }                             from './menu.store';
import {registerPlugin}                             from '@capacitor/core';
import { platform } from 'os';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

const log                                           = debug('app:account.module');

export interface IDevice {
    uuid?:               string;
    model?:              string;
    manufacturer?:       string;
    operatingSystem?:    string;
    appVersion?:         string;
    platform?:           string;
    isVirtual?:          boolean;
}

export interface IUser {
    _id:                string;
    createTime:         string;
    department:         string;
    email:              string;
    firstname:          string;
    krz:                string;
    lastname:           string;
    mobile:             string;
    name:               string;
    right:              string;
    rights:             Array<string>;
    roName:             string;
    role:               string;
    surname:            string;
    telephone:          string;
    type:               string;
    updateTime:         string;
    firma:              Array<string>;
    persId:             string;
}

export interface INavigationItem {
    name:               string;
    software:           string;
}

export interface INavItem {
    street:             string;
    zip:                string;
    city:               string;
    lat:                number;
    lng:                number;
    adress:             string;
}

export interface IGeoPos {
    car: string,
    coords: {
        longitude: number | null,
        latitude: number | null
    }
    timestamp: number | null,
    sessionID: string | null
}

interface ILoadingDefault {
    spinner: any;
    spinnerColor: string;
    spinnerSize: number;
    backgroundColor: string;
    messageColor: string;
}
export interface IAccountState {
    _geolocationWatchId: string;
    _device:             IDevice;
    _version:            string | null;
    _loggedIn:           boolean;
    _sessionId:          string | null;
    _domain:             any;
    _title:              string;
    _user:               IUser | null;
    _fahrer:             IUser | null;
    _beifahrer:          IUser | null;
    _navigationItems:    Array<INavigationItem>
    _secondHeader:       string | null;
    _geoPos:             IGeoPos;
    _actVersion:         boolean;
    _checkVersion:       boolean;
    _connected:          boolean;
    _darkMode:           boolean | 'auto';
    _navApps:            any;
    _standartNavigation: any;
    _keyboardHeight:     number;
    _pauseDialog:        boolean;
    _appInForeground:    boolean;
    _lockDevice:         boolean;
    _callDialog:         boolean;
    _dispo6:             boolean;
    _errorVersion:       boolean;
    _packVersion:        string;
    _appCarNote:         any;
    _progressBarLoad:    boolean;
    _loadingDefault:     ILoadingDefault;
    _logoutDialog:       boolean;
    _BackgroundGeolocationId: string;
    _timer:              string | null;
}

export const useAccountStore = defineStore('accountStore', {
    state: (): IAccountState => ({
        _geolocationWatchId: '',
        _device:             {platform: 'ios'},
        _appCarNote:         {},
        _version:            null,
        _packVersion:        version,
        _loggedIn:           false,
        _sessionId:          null,
        _domain:             {},
        _user:               null,
        _fahrer:             null,
        _dispo6:             false,
        _beifahrer:          null,
        _title:              'dispolive',
        _navigationItems:    [],
        _secondHeader:       null,
        _pauseDialog:        false,
        _geoPos:             { 
            car:        '',
            timestamp:  null,
            coords:     {
                longitude:  null,
                latitude:   null
            },
            sessionID:  null
        },
        _actVersion:         false,
        _checkVersion:       false,
        _connected:          false,
        _darkMode:           LocalStorage.getItem('darkmode') || false,
        _navApps:            [],
        _standartNavigation: {
            name: '',
            scheme: ''
        },
        _keyboardHeight:     0,
        _appInForeground:    true,
        _lockDevice:         false,
        _callDialog:         false,
        _errorVersion:       false,
        _progressBarLoad:    false,
        _loadingDefault:     {
            spinner: QSpinnerOval,
            spinnerColor: 'teal-8',
            spinnerSize: 100,
            backgroundColor: 'grey-9',
            messageColor: 'white'
        },
        _logoutDialog:       false,
        _BackgroundGeolocationId: '',
        _timer:              null
    }),
    getters: {
        device:             state => state._device,
        domain:             state => state._domain,
        appCarNote:         state => state._appCarNote,
        user:               state => state._user || {},
        beifahrer:          state => state._beifahrer,
        fahrer:             state => state._fahrer,
        sessionId:          state => state._sessionId,
        loggedIn:           state => state._loggedIn,
        title:              state => state._title,
        navigationItems:    state => state._navigationItems,
        timer:              state => state._timer,
        secondHeader:       state => state._secondHeader,
        geoPos:             state => state._geoPos,
        actVersion:         state => state._actVersion,
        checkVersion:       state => state._checkVersion,
        connected:          state => state._connected,
        darkMode:           state => state._darkMode,
        navApps:            state => state._navApps,
        standartNavigation: state => state._standartNavigation,
        keyboardHeight:     state => state._keyboardHeight,
        pauseDialog:        state => state._pauseDialog,
        appInForeground:    state => state._appInForeground,
        lockDevice:         state => state._lockDevice,
        callDialog:         state => state._callDialog,
        errorVersion:       state => state._errorVersion,
        version:            state => state._version,
        progressBarLoad:    state => state._progressBarLoad,
        loadingDefault:     state => state._loadingDefault,
        logoutDialog:       state => state._logoutDialog
    },
    actions: {
        loading (value: boolean) {
            if ( value )
                Loading.show(this._loadingDefault);
            else
                Loading.hide();
        },
        setPauseDialog ( value: boolean ) {
            this._pauseDialog = value;
        },
        setAppInForeground( value: boolean ) {
            this._appInForeground = value;
        },
        setCallDialog( value: boolean ) {
            this._callDialog = value;
        },
        startNavigation( { type, datId }: { type: string, datId: INavItem } ) {
            let target = '';

            switch ( type ) {
                case 'fahrbericht': {
                    const fahrberichtStore = useFahrberichtStore();
                    const { item }  = storeToRefs(fahrberichtStore);
               
                    target = `${item.value?.startStreet}, ${item.value?.startZip} ${item.value?.startCity}`;

                    if (  item.value?.startEnd )
                        target = `${item.value?.targetStreet}, ${item.value?.targetZip} ${item.value?.targetCity}`;

                    if ( this._standartNavigation.name === 'Here' ) {
                        target = `${item.value?.startLat}, ${item.value?.startLng}`;

                        if (  item.value?.startEnd )
                            target = `${item.value?.targetLat}, ${item.value?.targetLng}`;
                    }
                    
                    break;
                }
                case 'patient':
                    target = `${datId.street}, ${datId.zip} ${datId.city}`;

                    if ( this._standartNavigation.name === 'Here' )
                        target = `${datId.lat}, ${datId.lng}`;
                    break;

                case 'Linie':
                    target = datId.street && datId.zip && datId.city ? datId.street + ' ' + datId.zip + ' ' + datId.city : datId.adress;
                    break;
            }

            if ( this._standartNavigation.name !== 'Here' || type === 'Linie' )
                target = new URLSearchParams(target).toString().slice(0, -1);

            log('TARGET', target, this._standartNavigation.name, this._device.platform, this.geoPos.coords)

            if (this._standartNavigation.name === 'Karten' || (!this._standartNavigation.name && this._device.platform === 'ios') || (this._standartNavigation.name === 'Here' && this._device.platform === 'ios' && type === 'Linie') ) {
                log('maps://?daddr=' + target);
                openURL(`maps://?daddr=${target}&dirflg=d`)
                return 
            }

            if (this._standartNavigation.name === 'Google Maps' || (!this._standartNavigation.name && this._device.platform === 'android') || (this._standartNavigation.name === 'Here' && this._device.platform === 'android' && type === 'Linie' ) ) {
                openURL(`${'https://www.google.com/maps/dir/?api=1&destination='}${target}&dirflg=d`)
                return
            }

            if ( this._standartNavigation.name === 'Here' && this._geoPos.coords.longitude && type !== 'Linie' ) {
                log('HERE', this._standartNavigation.name, this._geoPos )
                openURL(`${this._device.platform === 'ios' ? 'here-route://mylocation/' : 'here-route://mylocation/'}${target}` )
            }
        },
        async setStatusbarColor( status: boolean ) {
            if ( !status && this._device.platform === 'ios' ) {
                await StatusBar.setStyle({ style: Style.Light });
            } else
                await StatusBar.setStyle({ style: Style.Dark });
        },
        setDarkMode( status: boolean ) {
            Dark.toggle();
            this._darkMode = Dark.mode;
            LocalStorage.set('darkmode', Dark.mode)
            this.setStatusbarColor( status );
        },
        setStandartNavigation( ) {
            this._standartNavigation = LocalStorage.getItem('navigation') || '';
        },
        sendPanicButton( ) {
            const fahrzeugeStore = useFahrzeugeStore();
            const { item: car } = storeToRefs(fahrzeugeStore);

            accountService.sendPanicButton( { data: car.value } );
        },
        async checkNavigationApps( ) {
            const googlemaps    = await AppLauncher.canOpenUrl({ url: this._device.platform === 'ios' ? 'comgooglemaps://' : 'com.google.android.apps.maps' });
            const here          = await AppLauncher.canOpenUrl({ url: this._device.platform === 'ios' ? 'here-route://' : 'com.here.app.maps' });
            const applemaps     = await AppLauncher.canOpenUrl({ url: 'mapitem://' });

            const navApps = [
                {
                    name:       '',
                    installed: true
                },
                {
                    name:       'Google Maps',
                    installed:  this._device.platform === 'ios' ? googlemaps.value : true,
                    scheme:     this._device.platform === 'ios' ? 'https://www.google.com/maps/dir/?api=1&destination=' : 'https://www.google.com/maps/dir/?api=1&destination='
                },
                {
                    name:       'Here',
                    installed:  this._device.platform === 'ios' ? here.value : true,
                    scheme:    this._device.platform === 'ios' ? 'here-route://mylocation/' : 'here.directions://v1.0/mylocation/'
                }
            ]

            if ( this._device.platform === 'ios' )
                navApps.push({
                    name:       'Karten',
                    installed:  applemaps.value,
                    scheme: 'maps.apple.com/'
                })

            this._navApps = navApps;
        },
        async getMyLocation( acknowledge: any ) {
            if ( !this._connected ) {
                Notify.create({
                    type: 'negative',
                    message: 'Es ist keine Internevebindung vorhanden',
                    position: 'bottom',
                    progress: true,
                    timeout: 2000,
                    color: 'negative',
                    classes: 'glossy',
                })

                return;
            }

            const socketStore = useSocketStore();
            const { io } = storeToRefs(socketStore);

            await io.value.emit( 'sendGeo', this.geoPos, acknowledge );

            Notify.create({
                type: 'postive',
                message: 'Standort wurde erfolgreich ermittelt',
                position: 'bottom',
                progress: true,
                timeout: 2000,
                color: 'secondary',
                classes: 'glossy',
            })
        },
        async initKeyboardListener () {
            Keyboard.addListener('keyboardWillShow', (keyboard: any) => {
                if (this.device.platform === 'android')
                    this._keyboardHeight = keyboard.keyboardHeight;
            });

            Keyboard.addListener('keyboardDidHide', () => {
                this._keyboardHeight = 0;
            });
        },
        async startGeoPosWatch( ) {
            log('startGeoPosWatch')
            const sendCoords = this.sendCoords
            BackgroundGeolocation.addWatcher(
                {
                    backgroundMessage: 'Cancel to prevent battery drain.',
                    backgroundTitle: 'Tracking You.',
                    requestPermissions: true,
                    distanceFilter: 0
                },
                function callback(location: any, error: any) {
                    if (error) {
                        if (error.code === 'NOT_AUTHORIZED') {
                            if (window.confirm(
                                'Geolocation ist ausgeschaltet.\n\n' +
                                'Bitte gehen Sie in die Einstellungen und schalten Sie\n\n' +
                                '"Standort -> Immer" an.'
                            )) {
                                BackgroundGeolocation.openSettings();
                            }
                        }
                        return console.error(error);
                    }
            
                    sendCoords({ location: { coords: location } })
                }
            ).then( (id) => {
                this._BackgroundGeolocationId = id;
            } );
        },
        setLockDevice ( data: boolean ) {
            this._lockDevice = data;
        },
        async sendCoords( data: { location: any } ) {
            const fahrzeugeStore = useFahrzeugeStore();
            const { item: car } = storeToRefs(fahrzeugeStore);

            const sessionID = this._sessionId;

            const location = data.location || data;

            if ( car.value && location ) {
                const cord = {
                    car:        car.value._id || '',
                    coords:     {
                        longitude:  location.coords && location.coords.longitude,
                        latitude:   location.coords && location.coords.latitude
                    },
                    timestamp:  location.coords.time,
                    sessionID
                }

                this._geoPos = cord;
                const socketStore = useSocketStore();
                const { io } = storeToRefs(socketStore);

                io.value.emit( 'getCarPos', cord )
            }
        },
        sendAppCarNote( data: { text: string, car: string  } ) {
            const fahrzeugeStore = useFahrzeugeStore();
            const { item: car } = storeToRefs(fahrzeugeStore);
            if ( car.value?._id === data.car )
                this._appCarNote = data
        },
        msgRead( data: any ) {
            const socketStore = useSocketStore();
            const { io } = storeToRefs(socketStore);
            io.value.emit( 'msgRead', data )
        },
        async startNetworkWatch( ) {
            const auditStore = useAuditStore();
            const stat = await Network.getStatus();
            this._connected = stat.connected;

            Network.addListener('networkStatusChange', async (status: any) => {
                log('networkStatusChange', status)
                this._connected = status.connected;

                if (status.connected)
                    await auditStore.sendData();
            });
        },
        async compareVersion( ) {
            const device = await Device.getInfo()
            this._device = device
            this._checkVersion = true
            this._errorVersion = false
            this.startNetworkWatch()
            const response = await accountService.getCustomData( { path: '/compareVersionAdmin', param: { platform: device.platform === 'ios' ? 'IOS' : 'ANDROID', version: this._packVersion } });
            if (response.error)
                this._errorVersion = true
            else
                //TODO
                this._actVersion = response

            this._checkVersion = false
        },
        async globalDispatcher ( item: any ) {
            log('globalDispatcher', item)
            const menuStore = useMenuStore();
            const fahrberichteStore = useFahrberichteStore();
            const navStore = useNavStore();
            if ( item._id ) {
                const allStores = getActivePinia()._s
                if (allStores.get(item._id)) {
                    const useDynamicstore = defineStore(item._id, {})
                    const dynamicStore: any = useDynamicstore();
                    if (dynamicStore._exists) {
                        dynamicStore.updateItem(item)
                        //dynamicStore.setAcceptItem(item)
                    }
                }
            }

            if ( item.status !== 'sonderrechte' )
                menuStore.setProgress(item)

            fahrberichteStore.updateItem(item)
            navStore.updateNavPoint(item)
        },
        async init( ) {
            try {
                const domain: string | null = await LocalStorage.getItem('domain')
                
                await accountService.setDomain( domain || '' )
                this._domain = domain || {}
            } catch (err) {
                this._domain = {}
                LocalStorage.remove('domain');
            }
        },
        async login( data: any ) {
            const response        = await accountService.login( data );
            if (!response?.session) {
                return;
            } else {
                this._loggedIn = true;
            }

            this._sessionId = response.session || null
            this._beifahrer = response.user || null
            this._fahrer = response.fahrer || null
            this._version = response.version || null
            this._dispo6 = response.dispo6 || false
        },
        loginFailure( ) {
            this._loggedIn              = false
            this._user                  = null
            this._geolocationWatchId    = ''
            this._device                = {}
            this._version               = null
            this._sessionId             = null
            this._domain                = {}
            this._user                  = null
            this._fahrer                = null
            this._beifahrer             = null
            this._title                 = 'dispolive'
            this._navigationItems       = []
            this._timer                 = null
            this._secondHeader          = ''
            this._geoPos                = { 
                car: '',
                timestamp: 0,
                sessionID: '',
                coords: {
                    longitude:  null,
                    latitude:   null
                }
            }
            this._actVersion            = false
            this._checkVersion          = false
            this._appCarNote            = {}
            this._darkMode              = LocalStorage.getItem('darkmode') || false
            this._navApps               = []
            this._standartNavigation    = {
                name: '',
                scheme: ''
            }
        },
        async logout() {
            const navStore = useNavStore();
            navStore._data = [];

            this._logoutDialog = false

            Network.removeAllListeners();
            
            const inventarStore = useInventarStore();
            inventarStore.clearData();

            const fahrzeugeStore = useFahrzeugeStore();
            fahrzeugeStore.clearData();

            const fahrberichtStore = useFahrberichtStore();
            fahrberichtStore.clearData();
            
            const fahrberichteStore = useFahrberichteStore();
            fahrberichteStore.clearData();

            const dienstplanStore = useDienstplanStore();
            dienstplanStore.remove();

            const auditStore = useAuditStore();
            auditStore._sendDataActive = false;
            
            const audioStore = useAudioStore();
            audioStore.unload();

            const messengerStore = useMessengerStore();
            messengerStore.deleteIndex();
            messengerStore.remove();

            BackgroundGeolocation.removeWatcher({id: this._BackgroundGeolocationId});  
            accountService.logout( { sessionID: this._sessionId } );
            const socketStore = useSocketStore();
            socketStore.remove();
            this.loginFailure();
        },
        // set fahrer
        setFahrer( fahrer: any ) {
            this._fahrer = fahrer
        },
        // set beifahrer
        setBeifahrer( beifahrer: any ) {
            this._beifahrer = beifahrer
        },

        // for handling navigation software
        addNavigationItem( navItem: any ) {
            this._navigationItems.push( navItem );
        },

        // title
        setTitle( title: string ) {
            this._title = title;
        },

        // set secondHeader
        setSecondHeader( link: string ) {
            this._secondHeader = link;
        }
    },
});
