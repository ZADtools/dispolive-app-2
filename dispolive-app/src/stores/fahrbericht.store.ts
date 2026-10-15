import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  
import dayjs                                        from 'dayjs';
import { useNavStore, INav }                        from './nav.store';
import { IFahrbericht, IStopItem }                  from './menu.store';
import { useAccountStore }                          from './account.store';
import { accountService }                           from 'src/services/account.service';
import { Filesystem, Directory, Encoding }          from '@capacitor/filesystem';
import { FileOpener }                               from '@capacitor-community/file-opener';
import { extend, exportFile, openURL, Notify }                                   from 'quasar';

const log       = Debug('app:fahrbericht.store');

export interface IFahrberichtStore { 
    _exists:          boolean;
    _item:           IFahrbericht | null;
    _type:           string;
    _stops:          any[];
    _printInProgress: boolean;
}

export const fahrberichtModule = () => {
    return {
        state: (): IFahrberichtStore => ({
            _exists:        true,
            _item:          null,
            _type:          '',
            _stops:         [],
            _printInProgress: false
        }),
        getters: {
            item:           state => state._item,
            type:           state => state._type,
            stops:          state => state._stops,
        },
        actions: {
            clearData( ) {
                this._item = null;
                this._type = '';
            },
            async updateItem ( fahrbericht: IFahrbericht ) {
                this._item = extend(true, {}, this._item, fahrbericht );
            }, 
            removeSelectedItem (id?: string) {
                if ( id && this._item && this._item._id === id)
                    this._item = null;

                if (!id)
                    this._item = null;
            },
            setItem({ item, func, type }: { item: IFahrbericht, func?: string, type: string }) {
                if (func === 'resetTimestamps' && this._item) {
                    this._item.startBegin = '';
                    this._item.startEnd = '';
                    this._item.ziel = '';
                    this._item.zielBegin = ''; 
                    this._item.frei = '';

                    if (this._item.type === 'Linie' && this._item.stops)
                        this._item.stops.forEach((item: IStopItem) => {
                            item.timestamp = ''
                        })
                }

                let obj = extend(true, {}, item);

                if (this._item?._id === item._id)
                    obj = { ...this.item, ...item }

                this._item      = obj;
                this._type      = type;
            },
            async resetTimestamps () {
                if (this._item )
                    this.setItem({ item: this._item, func: 'resetTimestamps', type: 'dynamic' } );
            },
            async setTimestamp ( status: string ) {
                if ( this._item )
                    this._item = { ...this._item, ...{ [status]: dayjs().format('HH:mm') }};
            },
            async setShowItem( item: IFahrbericht ) {
                log( 'setShowItem', item );
                this.setItem({ item, type: 'static' } );
            },
            async setAcceptItem( item: IFahrbericht ) {
                this.setItem({ item, type: 'dynamic' } );

                const navStore = useNavStore();
                navStore.addNavPoint( item );
            },
            setActTrip( item: IFahrbericht ) {
                log( 'setActTrip', item );
                this.setItem({ item, type: 'dynamic' } );
            },
            async printEinsatzprotokoll( ) {
                if (!this._item)
                    return;

                const accountStore = useAccountStore();

                this._printInProgress = true;

                const params = {
                    filter: {
                        _id: {type: 'equals', filter: this._item._id}
                    },
                    query: {dateFrom: this._item.date, dateTo: this._item.date},
                    fahrer: accountStore._fahrer?.persId
                }

                const result: any = await accountService.printEinsatzprotokoll({ params })

                if ( result.data ) {
                    const uint8Array = new Uint8Array(result.data);
                    const base64String = btoa(String.fromCharCode.apply(null, uint8Array));

                    const file = await Filesystem.writeFile({
                        path: 'Einsatzprotokoll.pdf',
                        data: base64String,
                        directory: Directory.Cache
                    });

                    FileOpener.open({ filePath: file.uri});
                } else 
                    Notify.create({
                        type: 'negative',
                        message: 'Fehler beim laden des Einsatzprotokolls',
                        position: 'bottom',
                        progress: true,
                        timeout: 5000,
                        color: 'negative',
                        classes: 'glossy',
                    });

                this._printInProgress = false;
            }
        }
    }
};

export const useFahrberichtStore = defineStore('fahrberichtStore', fahrberichtModule() );
