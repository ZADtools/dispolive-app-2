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
    _geoPos:             any;
    _actVersion:         boolean;
    _checkVersion:       boolean;
    _connected:          boolean;
    _sendAppCarNote:     any;
    _darkMode:           boolean;
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

export const useAccountStore = defineStore('useAccountStore', {
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
        beifahrer:          state => state._beifahrer || {},
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
        errorVersion:       state => state._errorVersion
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
    },
});
