import { defineStore } from 'pinia';
import { Network }                                  from '@capacitor/network';
import { Device }                                   from '@capacitor/device';
import { App }                                      from '@capacitor/app';
import { AppLauncher }                              from '@capacitor/app-launcher';
import { StatusBar, Style }                         from '@capacitor/status-bar';

import _, { result }                                from 'lodash'; 
import debug                                        from 'debug';
import { LocalStorage, openURL, Notify, Dialog }    from 'quasar'
import { useStore }                                 from '@u3u/vue-hooks';

import { IRootState }                               from './index';
import { accountService }                           from '../services/account.service';
import { Dark }                                     from 'quasar';
import BackgroundGeolocation                        from "@transistorsoft/capacitor-background-geolocation";

import { Keyboard }                                 from '@capacitor/keyboard';
import { version }                                  from '../../package.json';

const log                                           = debug('app:account.module');

export interface IDevice {
    uuid?:               string;
    model?:              string;
    manufacturer?:       string;
    operatingSystem?:    string;
    appVersion?:         string;
    platform?:           string;
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
    _timer:              string | null;
    _secondHeader:       any;
    _searchContacts:     string;
    _geoPos:             IGeoPos;
    _actVersion:         boolean;
    _checkVersion:       boolean;
    _connected:          boolean;
    _sendAppCarNote:     any;
    _darkMode:           boolean | "auto";
    _navApps:            any;
    _standartNavigation: any;
    _keyboardHeight:     number;
    _pauseDialog:        boolean;
    _appInForeground:    boolean;
    _lockDevice:         boolean;
    _callDialog:         boolean;
    _errorVersion:       boolean;
    _packVersion:        string;
}

export const useAccountStore = defineStore('accountStore', {
    state: (): IAccountState => ({
        _geolocationWatchId: '',
        _device:             {},
        _version:            null,
        _packVersion:        version,
        _loggedIn:           false,
        _sessionId:          null,
        _domain:             {},
        _user:               null,
        _fahrer:             null,
        _beifahrer:          null,
        _title:              'dispolive',
        _navigationItems:    [],
        _timer:              null,
        _secondHeader:       {},
        _searchContacts:     '',
        _pauseDialog:        false,
        _geoPos:             { 
            coords:     {
                longitude:  null,
                latitude:   null
            }
        },
        _actVersion:         false,
        _checkVersion:       false,
        _connected:          false,
        _sendAppCarNote:     {},
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
        _errorVersion:       false
    }),
    getters: {
        device:             state => state._device,
        domain:             state => state._domain,
        user:               state => state._user || {},
        beifahrer:          state => state._beifahrer,
        fahrer:             state => state._fahrer || {},
        sessionId:          state => state._sessionId,
        loggedIn:           state => state._loggedIn,
        title:              state => state._title,
        navigationItems:    state => state._navigationItems,
        timer:              state => state._timer,
        secondHeader:       state => state._secondHeader,
        searchContacts:     state => state._searchContacts,
        geoPos:             state => state._geoPos,
        actVersion:         state => state._actVersion,
        checkVersion:       state => state._checkVersion,
        connected:          state => state._connected,
        sendAppCarNote:     state => state._sendAppCarNote,
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
    },
    actions: {
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
                case 'fahrbericht': 
                    //TODO
                    // const item = rootGetters['trip/item'];
               
                    // target = `${item.startStreet}, ${item.startZip} ${item.startCity}`;

                    // if (  item.startEnd )
                    //     target = `${item.targetStreet}, ${item.targetZip} ${item.targetCity}`;

                    // if ( state.standartNavigation.name === 'Here' ) {
                    //     target = `${item.startLat}, ${item.startLng}`;

                    //     if (  item.startEnd )
                    //         target = `${item.targetLat}, ${item.targetLng}`;
                    // }
                    
                    break;
                case 'patient':
                    target = `${datId.street}, ${datId.zip} ${datId.city}`;

                    if ( this._standartNavigation.name === 'Here' )
                        target = `${datId.lat}, ${datId.lng}`;
                    break;

                case 'Linie':
                    target = datId.street && datId.zip && datId.city ? datId.street + ' ' + datId.zip + ' ' + datId.city : datId.adress;
                    break;
            }

            if ( this._standartNavigation.name !== 'Here' || type == 'Linie' )
                target = new URLSearchParams(target).toString().slice(0, -1);

            log('TARGET', target, this._standartNavigation.name, this._device.platform, this.geoPos.coords)

            if (this._standartNavigation.name === 'Karten' || (!this._standartNavigation.name && this._device.platform == 'ios') || (this._standartNavigation.name == 'Here' && this._device.platform == 'ios' && type == 'Linie') ) {
                log('maps://?daddr=' + target);
                openURL(`maps://?daddr=${target}&dirflg=d`)
                return 
            }

            if (this._standartNavigation.name === 'Google Maps' || (!this._standartNavigation.name && this._device.platform == 'android') || (this._standartNavigation.name == 'Here' && this._device.platform == 'android' && type == 'Linie' ) ) {
                openURL(`${ 'https://www.google.com/maps/dir/?api=1&destination='}${target}&dirflg=d`)
                return
            }

            if ( this._standartNavigation.name === 'Here' && this._geoPos.coords.longitude && type !== 'Linie' ){
                log('HERE', this._standartNavigation.name, this._geoPos )
                openURL( `${this._device.platform == 'ios' ? 'here-route://mylocation/' : 'here-route://mylocation/'}${target}` )
                return
            }
        },
        async setDarkMode( status: boolean ) {
            Dark.toggle();
            this._darkMode = Dark.mode;
            LocalStorage.set('darkmode', Dark.mode)

            if ( status || this._device.platform === 'ios' ) {
                await StatusBar.setStyle({ style: Style.Default });
            } else
                await StatusBar.setStyle({ style: Style.Default });
        },
        setStandartNavigation( ) {
            this._standartNavigation = LocalStorage.getItem('navigation') || '';
        },
        async checkkNavigationApps( ) {
            const googlemaps    = await AppLauncher.canOpenUrl({ url: this._device.platform == 'ios' ? 'comgooglemaps://' : 'com.google.android.apps.maps' });
            const here          = await AppLauncher.canOpenUrl({ url: this._device.platform == 'ios' ? 'here-route://' : 'com.here.app.maps' });
            const applemaps     = await AppLauncher.canOpenUrl({ url: 'mapitem://' });

            const navApps = [
                {
                    name:       '',
                    installed: true
                },
                {
                    name:       'Google Maps',
                    installed:  this._device.platform == 'ios' ? googlemaps.value : true,
                    scheme:     this._device.platform == 'ios' ? 'https://www.google.com/maps/dir/?api=1&destination=' : 'https://www.google.com/maps/dir/?api=1&destination='
                },
                {
                    name:       'Here',
                    installed:  this._device.platform == 'ios' ? here.value : true,
                    scheme:    this._device.platform == 'ios' ? 'here-route://mylocation/' : 'here.directions://v1.0/mylocation/'
                }
            ]

            if ( this._device.platform == 'ios' )
                navApps.push({
                    name:       'Karten',
                    installed:  applemaps.value ? true : false,
                    scheme: 'maps.apple.com/'
                })

            this._navApps = navApps;
        },
        async getMyLocation( acknowledge: any ) {
            if ( !this._connected ) {
            
               Notify .create({
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
            //TODO
            // const socket = rootGetters['socket/io'];

            // await socket.emit( 'sendGeo', state.geoPos, acknowledge );

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
        async initKeyboardListener (){
            Keyboard.addListener('keyboardWillShow', (keyboard: any) => {
                if (this.device.platform === "android")
                    this._keyboardHeight = keyboard.keyboardHeight;
            });

            Keyboard.addListener('keyboardDidHide', () => {
                this._keyboardHeight = 0;
            });
        },
        setAlwaysGeolocation( ) {
            BackgroundGeolocation.setConfig({
                locationAuthorizationRequest: 'Always'
            });
        },
        async startGeoPosWatch( { commit, dispatch, state } : any ) {
            log('startGeoPosWatch')

            if ( this._device.platform == 'ios' ) {
                await BackgroundGeolocation.ready({
                    disableMotionActivityUpdates: true, //Fitness data
                    heartbeatInterval: 60,
                    stopTimeout: 14,
                    enableHeadless: true,
                    stopOnTerminate: false,
                    preventSuspend: true,
                    desiredOdometerAccuracy: 10,
                    distanceFilter: 0,
                    locationUpdateInterval: 1000,
                    disableStopDetection: true,
                    pausesLocationUpdatesAutomatically: false,
                    debug: false,
                    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
                    locationAuthorizationRequest: "Always",
                    backgroundPermissionRationale: {
                    title: "{applicationName} erlauben, die Standortdaten zu lesen?",
                        message: "",
                        positiveAction: "Ändern auf: {backgroundPermissionOptionLabel}",
                        negativeAction: "Abbrechen"
                    },
                    //disableLocationAuthorizationAlert: false
                    locationAuthorizationAlert: {
                        titleWhenNotEnabled: "Geolocation 'Immer' ist nicht aktiviert",
                        titleWhenOff: "Geolocation ist ausgeschaltet",
                        instructions: "Bitte gehen Sie in die Einstellungen und schalten Sie 'Standort -> immer' an",
                        cancelButton: "Abbrechen",
                        settingsButton: "Einstellungen"
                    }
                }).then( async (state) => {

                    BackgroundGeolocation.start();  

                    BackgroundGeolocation.setConfig({
                        locationAuthorizationRequest: 'Always'
                    });
                    //TODO
                    dispatch('getLocationNow')

                    //await BackgroundGeolocation.changePace(true);

                    // setInterval( async () => {
                    //     const justNowLocation = await BackgroundGeolocation.getCurrentPosition({});
                    //     sendCoords(justNowLocation)
                    // }, 1000)
                });
            } else {
                await BackgroundGeolocation.ready({
                    disableMotionActivityUpdates: true, //Fitness Tracker
                    heartbeatInterval: 60,
                    stopTimeout: 14,
                    enableHeadless: true,
                    stopOnTerminate: true,
                    preventSuspend: true,
                    desiredOdometerAccuracy: 10,
                    distanceFilter: 0,
                    locationUpdateInterval: 1000,
                    disableStopDetection: true,
                    pausesLocationUpdatesAutomatically: false,
                    debug: false,
                    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
                    locationAuthorizationRequest: "WhenInUse",
                    backgroundPermissionRationale: {
                    title: "{applicationName} erlauben, die Standortdaten zu lesen?",
                        message: "",
                        positiveAction: "Ändern auf: {backgroundPermissionOptionLabel}",
                        negativeAction: "Abbrechen"
                    },
                    //disableLocationAuthorizationAlert: false
                    locationAuthorizationAlert: {
                        titleWhenNotEnabled: "Geolocation 'Beim verwenden' ist nicht aktiviert",
                        titleWhenOff: "Geolocation ist ausgeschaltet",
                        instructions: "Bitte gehen Sie in die Einstellungen und schalten Sie 'Standort -> immer' an",
                        cancelButton: "Abbrechen",
                        settingsButton: "Einstellungen"
                    }
                }).then( async (state) => {

                    BackgroundGeolocation.start();  

                    BackgroundGeolocation.setConfig({
                        locationAuthorizationRequest: 'Always'
                    });
                    //TODO
                    dispatch('getLocationNow')

                });
            }

            BackgroundGeolocation.changePace(true);

            BackgroundGeolocation.onHeartbeat(({ location }: { location: any }) => {
                if ( this._loggedIn ) {
                    this.sendCoords(location)
                }
            });
        
            const geolocationWatchId =  BackgroundGeolocation.onLocation(async (location: any) => {
                this.sendCoords(location)

            }, ( error: any ) => {
                log("[location] ERROR: ", error);
            });

            this._geolocationWatchId = geolocationWatchId;
        },
        setLockDevice ( data: boolean ) {
            this._lockDevice = data;
        },
        async sendCoords( data: { location: string } ) {
            //TODO
            //const sessionID = rootGetters['account/sessionId'];

            // const location = data.location || data;

            // const cord = {
            //     car:        rootGetters['fahrzeuge/item']._id,
            //     coords:     {
            //         longitude:  location.coords && location.coords.longitude,
            //         latitude:   location.coords && location.coords.latitude
            //     },
            //     timestamp:  location.timestamp,
            //     sessionID
            // }

            //this._geoPos = cord;
            
            //TODO
            //rootGetters['socket/io'].emit( 'getCarPos', cord )

        },
        async getLocationNow( ) {
            const location = await BackgroundGeolocation.getCurrentPosition({});
            this.sendCoords(location)
        },
        sendAppCarNote( data: { text: string, car: string  } ) {
            //TODO
            //if ( rootGetters['fahrzeuge/item']._id == data.car )
                //this._sendAppCarNote = data
        },
        msgRead( data: any ) {
            //TODO
            //rootGetters['socket/io'].emit( 'msgRead', data )
        },
        async startNetworkWatch( ) {
            const stat = await Network.getStatus();
            this._connected = stat.connected;

            Network.addListener('networkStatusChange', (status: any) => {
                log('networkStatusChange', status)
                this._connected = status.connected;

                //TODO
                // if (status.connected)
                //     dispatch('audit/sendData', {}, {root: true});
            });
        },
        async compareVersion( ) {
            const device = await Device.getInfo()
            this._device = device
            this._checkVersion = true
            this._errorVersion = false
            this.startNetworkWatch()
            
            const response = await accountService.getCustomData( { path: '/compareVersionAdmin', param: { platform: device.platform == 'ios' ? 'IOS' : 'ANDROID', version: this._packVersion } });

            if (response.error)
                this._errorVersion = true
            else
                this._actVersion = response

            this._checkVersion = false
        },
        async globalDispatcher ( item: any ) {
            log('globalDispatcher', item)
            // await dispatch('mainmenu/setProgress', item, {root: true})
            // await dispatch('trips/updateItem', item, {root: true})
            // await dispatch('nav/updateNavPoint', item, {root: true})
            
            // await dispatch(item._id + '/updateItem', item, {root: true})
            // await dispatch(item._id + '/setAcceptItem', item, {root: true} );
        },
        async init( ) {
            try {
                const domain: any = await LocalStorage.getItem('domain')
                await accountService.setDomain( domain )
                this._domain = domain || {}
                return true;
            }
            catch(err) {
                this._domain = {}
                LocalStorage.remove('domain');
                return false;
            }
        },
        async login( data: any ) {

            let response        = await accountService.login( data );

            if (!_.get(response, 'session', null)){
                return;
            }else {
                this._loggedIn = true;
                //this._user = user
            }
            //TODO
            // commit( 'sessionId', _.get(response, 'session', null) )
            // commit( 'setBeifahrer', _.get(response, 'user', null) )
            // commit( 'setFahrer', _.get(response, 'fahrer', null) )
            // commit( 'setVersion', _.get(response, 'version', null) )
        },
        async logout() {
            //TODO
            // const sessionID = this._sessionId + '';

            // const   store = useStore(),
            //         trips = rootGetters['nav/item'];

            // trips.forEach( (trip: any) => {
            //     dispatch( `${trip.item._id}/removeAcceptItem`, trip.item, { root: true } );
            //     store.value.unregisterModule( trip.item._id );
            //     // dispatch( 'setSelectedNavPoint', navigation[0]);
            // });

            // Network.removeAllListeners();

            // dispatch('caritemlist/clearData', {}, {root:true});
            // dispatch('fahrzeuge/clearData', {}, {root:true});
            // dispatch('trip/clearData', {}, {root:true});
            // dispatch('socket/remove', {}, {root:true});
            // dispatch('trips/clearData', {}, {root:true});
            // dispatch('dienstplan/remove', {}, {root: true} )
            // dispatch('audit/setSendDataActive', false, {root: true} )
            // dispatch('audio/unload', null, { root: true })
            // dispatch('messages/deleteIndex', null, { root: true })
            // dispatch('messages/remove', null, { root: true })
            // Geolocation.clearWatch({ id: state.geolocationWatchId});
            // BackgroundGeolocation.stop();  
            // commit('loginFailure');
            // await accountService.logout( { rootGetters, sessionID } );
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

        // set timer desinfektionsprotokoll
        setTimer( time: string ) {
            this._timer = time;
        },

        // set secondHeader
        setSecondHeader( link: string ) {
            this._secondHeader = link;
        },
        // set secondHeader
        setSearchContacts( search: string ) {
            this._searchContacts = search;
        },
    },
});
