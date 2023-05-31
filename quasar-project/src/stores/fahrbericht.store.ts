import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  
import dayjs                                        from 'dayjs';
import { useNavStore, INav }                        from './nav.store';
import { IFahrbericht, IStopItem }                  from './menu.store';
import { extend }                                   from 'quasar';

const log       = Debug('app:fahrbericht.module');

export interface IFahrberichtStore { 
    _exists:          boolean;
    _item:           IFahrbericht | null;
    _type:           string;
    _stops:          any[];
}

export const fahrberichtModule = {
    state: (): IFahrberichtStore => ({
        _exists:        true,
        _item:          null,
        _type:          '',
        _stops:         []
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
        removeSelectedItem () {
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
        }
    }
};

export const useFahrberichtStore = defineStore('fahrberichtStore', fahrberichtModule);
