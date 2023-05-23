import { defineStore }  from 'pinia';
import Debug            from 'debug';
import { accountService } from 'src/services/account.service';

const log       = Debug('app:fahrzeuge.module');
export interface IInventarItem {
    _id:            string;
}

export interface IInventarState {
    _data:           IInventarItem[];
    _count:          any;
    _countItems:     number;
}

export const useInventarStore = defineStore('inventarStore', {
    state: (): IInventarState => ({
        _data:           [],
        _count:          {},
        _countItems:     0
    }),
    getters: {
        data: (state) => state._data,
        count: (state) => state._count,
        countItems: (state) => state._countItems
    },
    actions: {
        clearData( ) {
            log('clearData caritemlist')
            this._data = [];
            this._count = {};
            this._countItems = 0;
        },
        // getData
        async getData( carId: string ) {
            log( 'getData', carId );
            
            if (this._data.length > 0)
                return;

            try {
                const items: any = await accountService.getDataSocket( { event: 'getCarFittings', param: { car: carId, app: true } } );

                if (items && items.data) {
                    let countItems = 0;

                    for ( const key in items.data ) {
                        console.log(key)
                        countItems += items.data[key].length
                    }

                    this._countItems = countItems;

                    this._data = items.data;
                }
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        },
        // getData
        async getCount(  ) {
            try {
                const items     = await accountService.getDataSocket( { event: 'fetchInventarCount', param: {} } );
                this._count = items
            } catch (error) {
                log( 'Error getData', error );
                this._count = {};
                throw error;
            }
        }
    },
});
