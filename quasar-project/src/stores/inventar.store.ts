import { defineStore }  from 'pinia';
import Debug            from 'debug';

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
                //TODO
                // const items: any     = await accountService.getDataSocket( { rootGetters, event: 'getCarFittings', param: { car: carId, app: true } } );
                
                // if (items && items.data) {
                //     let countItems = 0;

                //     _.forEach(items.data, (items) => {
                //         countItems += items.length
                //     })

                //     commit( 'setCountItems', countItems );
                // }
                
                // commit( 'setData', items.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        },
        // getData
        async getCount(  ) {
            try {
                //TODO
                // const items     = await accountService.getDataSocket( { rootGetters, event: 'fetchInventarCount', param: {} } );
                // commit( 'setCount', items );

            } catch (error) {
                log( 'Error getData', error );
                this._count = {};
                throw error;
            }
        }
    },
});
