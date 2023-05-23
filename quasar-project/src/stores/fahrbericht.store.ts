import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  
import dayjs                                        from 'dayjs';
import { useNavStore, INav }                        from './nav.store';
import { IFahrbericht, IStopItem }                  from './menu.store';

const log       = Debug('app:fahrbericht.module');

export interface IFahrberichtStore { 
    _item:           IFahrbericht | null;
    _type:           string;
}

export const useFahrberichtStore = defineStore('fahrberichtStore', {
    state: (): IFahrberichtStore => ({
        _item:          null,
        _type:          ''
    }),
    getters: {
        item:           state => state._item,
        type:           state => state._type
    },
    actions: {
        clearData( ) {
            this._item = null;
            this._type = '';
        },
        async updateItem ( fahrbericht: IFahrbericht ) {
            this._item = { ...this._item, ...fahrbericht };
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

            let obj = {...item};

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
            log( 'setAcceptItem', item );
            this.setItem({ item, type: 'dynamic' } );

            const navStore = useNavStore();
            navStore.addNavPoint( item );
        },
        async removeAcceptItem( item: INav ) {
            log( 'removeItem', item );
            const navStore = useNavStore();
            
            navStore.removeNavPoint( item );
        },
        setActTrip( item: IFahrbericht ) {
            log( 'setActTrip', item );
            this.setItem({ item, type: 'dynamic' } );
        }
    }
});
