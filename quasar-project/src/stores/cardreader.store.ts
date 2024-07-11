import { defineStore }              from 'pinia';
import Debug                        from 'debug';
import { BarcodeScanner }           from '@capacitor-community/barcode-scanner';
import { Dark, Notify, Loading, QSpinnerOval } from 'quasar';
import { useAccountStore }          from './account.store';
import { useKostentraegerStore }    from './kostentraeger.store';
import { BleClient, numberToUUID }                from '@capacitor-community/bluetooth-le';
import { Rcr1010 }                  from '@w4b/rcr1010';
import dayjs                        from 'dayjs';
const log                            = Debug('app:fahrzeuge.module');
import customParseFormat            from 'dayjs/plugin/customParseFormat'
import { accountService } from 'src/services/account.service';
dayjs.extend(customParseFormat)

const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_BATTERY = '00002a19-0000-1000-8000-00805f9b34fb';
const UUID_SERVICE_C4 = '46540001-0002-00C4-0000-465453414645';
const UUID_CHAR_WRITE_C4 = '46540002-0002-00C4-0000-465453414645';
const UUID_CHAR_NOTIF_C4 = '46540003-0002-00C4-0000-465453414645'
const UUID_SERVICE_FIRMWARE_VERSION_C4 = '465400F0-0002-00C4-0000-465453414645';
const UUID_CHAR_FIRMWARE_VERSION_C4 = '465400F1-0002-00C4-0000-465453414645';
export interface ICardreaderState {
    _isScanning: boolean;
    _device: string;
    _cardResponse: any;
    _scanning: boolean;
    _message: string;
    _readingCard: boolean;
    _cardDownloadedEventListener: any;
    _debugOutputEventListener: any;
    _pairingSucceededEventListener: any;
    _readingCardMessage: string;
    _loadingDefault: any;
    _loadingTimeout: any;
    _loadingTimeoutTime: number;
}

export const useCardreaderStore = defineStore('cardreaderStore', {
    state: (): ICardreaderState => ({
        _isScanning: false,
        _device: '',
        _cardResponse: {},
        _scanning: false,
        _message: '',
        _readingCard: false,
        _cardDownloadedEventListener: null,
        _debugOutputEventListener: null,
        _pairingSucceededEventListener: null,
        _readingCardMessage: '',
        _loadingDefault:     {
            spinner: QSpinnerOval,
            spinnerColor: 'secondary',
            spinnerSize: 100,
            backgroundColor: 'grey-9',
            messageColor: 'white'
        },
        _loadingTimeout: null,
        _loadingTimeoutTime: 20000,
    }),
    getters: {
        isScanning: (state) => state._isScanning,
        cardResponse: (state) => state._cardResponse,
        message: (state) => state._message,
        isReadingCard: (state) => state._readingCard,
        readingCardMessage: (state) => state._readingCardMessage,
        device: (state) => state._device,
    },
    actions: {
        async parseRawPersonalData ( xmlString: string ) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            const keyObj: any = { 
                geburtsdatum: ['Geburtsdatum', 'geburtsdatum'],
                vorname: ['Vorname', 'vorname'],
                nachname: ['Nachname', 'nachname'],
                geschlecht: ['Geschlecht', 'geschlecht'],
                strasse: ['Strasse', 'strasse'],
                ort: ['Ort', 'ort'],
                hausnummer: ['Hausnummer', 'hausnummer'],
            }
            
            for (const key of Object.keys(keyObj)) {
                keyObj[key].forEach( (xmlKey: string) => {
                    const xmlValue = xmlDoc.getElementsByTagName( xmlKey )[0]?.childNodes[0]?.nodeValue;
                    
                    if (xmlValue)
                        this._cardResponse[key] = xmlValue;
                })
            }
        },
        async parseRawInsuranceData ( xmlString: string ) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

            const keyObj: any = { 
                versichertenStatus: ['Versichertenart', 'versichertenart'],
                kostentraegerkennung: ['Kostentraegerkennung', 'kostentraegerkennung'],
                kassenname: ['Name', 'name'],
            }
            
            for (const key of Object.keys(keyObj)) {
                keyObj[key].forEach( (xmlKey: string) => {
                    const xmlValue = xmlDoc.getElementsByTagName( xmlKey )[0]?.childNodes[0]?.nodeValue;
                    
                    if (xmlValue)
                        this._cardResponse[key] = xmlValue;
                })
            }
        },
        async init ( ) {
            this.remove()
            this._cardDownloadedEventListener = await Rcr1010.addListener('cardDownloaded', async ( result: any ) => {
                this.stopReadCard()
                
                const parsedResult = JSON.parse(result.result);

                let type = 'positive'

                if (parsedResult.error === 'NoError') {
                    this.parseRawPersonalData(parsedResult.rawPersonalData)
                    this.parseRawInsuranceData(parsedResult.rawInsuranceData)

                    this._cardResponse = parsedResult
                    this._message = 'Karte erfolgreich gelesen'
                } else {
                    this._cardResponse = {}
                    this._message = 'Fehler beim Lesen der Karte'
                    type = 'negative'
                }

                this._readingCard = false
                Loading.hide()

                Notify.create({
                    type,
                    message: this._message,
                    position: 'bottom',
                    progress: true,
                    timeout: 2000,
                    color: 'secondary',
                    classes: 'glossy',
                })
                
                this._debugOutputEventListener = await Rcr1010.addListener('debugOutput', async ( message: any ) => {
                    log('debugOutput', message);

                    if (message.message.indexOf('Removing Pairing because of wrong KeyVersion') >= 0) {
                        await Rcr1010.stopScan();
                        this._readingCard = false;
                        Loading.hide();
                        this._message = 'Fehler beim Lesen der Karte';
                        this.stopBarcodeScanning();
                    } else if (message.message.indexOf('Trying to download') >= 0) {
                        this._readingCardMessage = 'Gesundheitskarte wird gelesen. Bitte nicht entfernen.'
                        Loading.show({...this._loadingDefault, ...{message: this._readingCardMessage}})
                    }
                });
                
                this._pairingSucceededEventListener = await Rcr1010.addListener('pairingSucceeded', (uuid: any) => {
                    log('pairingSucceeded', uuid);
                });

                log('init done')
            });
        },
        remove () {
            this._cardDownloadedEventListener?.remove()
            this._debugOutputEventListener?.remove()
            this._pairingSucceededEventListener?.remove()
        },
        async startBarcodeScanning() {
            this._isScanning = true
            await BarcodeScanner.hideBackground()
            return await BarcodeScanner.startScan()
        },
        async stopBarcodeScanning() {
            const accountStore = useAccountStore()
            Dark.set(accountStore._darkMode)
            this._isScanning = false
            await BarcodeScanner.showBackground()
            await BarcodeScanner.stopScan()
        },
        async startPairing() {
            if ( this._device === 'bR301BLE' ) {
                const id = numberToUUID(0x180d)
                // const device = await BleClient.requestDevice({
                //     services: [],
                //     allowDuplicates: true,
                //     optionalServices: [BATTERY_SERVICE, UUID_SERVICE_C4, UUID_SERVICE_FIRMWARE_VERSION_C4],
                // });

                await BleClient.requestLEScan(
                    {
                      services: [],
                      allowDuplicates: true,
                    },
                    (result) => {
                      console.log('received new scan result', result);
                    }
                  );

                  setTimeout(async () => {
                    await BleClient.stopLEScan();
                  }, 2000)
                //console.log('device', device)
            }
            if ( this._device === 'RC1010' ) {
                const status = await BarcodeScanner.checkPermission({force: true});

                Dark.set(false);
                if (status.granted) {
                    const result = await this.startBarcodeScanning();
                    let type = 'negative'
                    await this.stopBarcodeScanning();
                    let message = '';

                    if (result.hasContent) {
                        const code = result.content;
                        const paired = await Rcr1010.startPairing({code});
                        log('paired', paired);
                        if (paired.value) {
                            type = 'positive';
                            message = 'Gerät wurde erfolgreich gekoppelt';
                        } else {
                            message = 'Gerät konnte nicht gekoppelt werden';
                        }
                    } else {
                        message = 'Barcode konnte nicht gelesen werden';
                    }

                    this._message = message;

                    const accountStore = useAccountStore();

                    Dark.set(accountStore._darkMode);

                    if (type === 'positive')
                        Notify.create({
                            type,
                            message,
                            position: 'bottom',
                            progress: true,
                            timeout: 2000,
                            color: 'secondary',
                            classes: 'glossy',
                        })
                }
            }
        },
        backToDevice () { 
            const accountStore = useAccountStore();
            this._device = '';
            accountStore.setSecondHeader('');
        },
        async readCard () {
            try {
                clearTimeout(this._loadingTimeout)
                this._cardResponse = {}
                const isPaired = await Rcr1010.isPaired();
                log('isPaired', isPaired.value)
                if (isPaired.value) {
                    this._readingCardMessage = 'Warte auf Gesundheitskarte...'
                    this._readingCard = true
                    Loading.show({...this._loadingDefault, ...{message: this._readingCardMessage}})
                    this._loadingTimeout = setTimeout( () => { 
                        Loading.hide() 
                        this._readingCard = true
                        this.stopReadCard()
                    }, 20000)
                    Rcr1010.startScan()
                } else {
                    const message = 'Das Gerät ist nicht mehr gekoppelt'
                    this._message = message;

                    Notify.create({
                        type: 'negative',
                        message,
                        position: 'bottom',
                        progress: true,
                        timeout: 2000,
                        color: 'negative',
                        classes: 'glossy',
                    })
                }

                log('readCard done')
            } catch (error) {
                log('readCard error', error)
                this._readingCard = false
                Loading.hide()
                this.stopReadCard()
                Notify.create({
                    type: 'negative',
                    message: 'Daten konnten nicht gelesen werden. Bitte versuchen Sie es erneut.',
                    position: 'bottom',
                    progress: true,
                    timeout: 5000,
                    color: 'negative',
                    classes: 'glossy',
                })
            }
        },
        async stopReadCard( ) {
            Rcr1010.stopScan()
            this._readingCard = false
        },
        setCardData ( data: any ) {
            try {
                const pat = this._cardResponse;
                const kostentraegerStore = useKostentraegerStore();
                
                //privat KK suchen
                if (pat.privat === 'true') {
                    const kk: any = kostentraegerStore._data?.find( ( kk ) => {
                        return kk._id === 'dd7e8e85-1c9b-4aee-9622-14680757de2d';
                    } )

                    if ( kk ) {
                        data.kkId =             kk._id;
                        data.krankenkasse =     kk.name;
                    }
                } else {
                    const kk: any = kostentraegerStore._data?.find( ( kk ) => {
                        return kk._id === pat.kostentraegerkennung;
                    } )

                    if ( kk ) {
                        data.kkId =             kk._id;
                        data.krankenkasse =     kk.name;
                    } else {
                        data.kkId =             'N/A';
                        data.krankenkasse =     pat.kassenname;
                    }
            
                    data.patSurname       = pat.nachname || data.patSurname;
                    data.patName          = pat.vorname  || data.patName;
                    data.patZip           = pat.postleitzahl || data.patZip;
                    data.patCity          = pat.ort || data.patCity;
            
                    const patStreet = pat.strasse || data.patStreet || '',
                        hausnummer = pat.hausnummer || '';
            
                    data.patStreet        = patStreet + ' ' + hausnummer;
            
                    data.rawInsuranceData = pat.rawInsuranceData ? pat.rawInsuranceData : 'Keine Daten';
                    data.rawPersonalData  = pat.rawPersonalData ? pat.rawPersonalData : 'Keine Daten';

                    if (pat.geburtsdatum) {
                        data.birthday = dayjs(pat.geburtsdatum, 'DD-MM-YYYY').format('YYYY-MM-DD')
                    }
            
                    data.stammVersNr      = pat.versichertenNummer ? pat.versichertenNummer : data.stammVersNr;
                    data.versNr           = pat.kostentraegerkennung;
            
                    data.versStatus       = pat.versichertenStatus ? pat.versichertenStatus : data.versStatus;
            
                    data.kkCard = true;
                }
                this.stopReadCard()
                return data;
            } catch (error) {
                log('setCardData error', error)
                this.stopReadCard()
                Notify.create({
                    type: 'negative',
                    message: 'Daten konnten nicht gelesen werden. Bitte versuchen Sie es erneut.',
                    position: 'bottom',
                    progress: true,
                    timeout: 5000,
                    color: 'negative',
                    classes: 'glossy',
                })
            }
        },
        setScanning( scanning: boolean ) {
            this._scanning = scanning;
        },
        setReadingCard( readingCard: boolean ) {
            this._readingCard = readingCard;
        }
    },
});
