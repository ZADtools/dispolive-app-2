import { defineStore }                 from 'pinia';
import Debug                                        from 'debug';  

const log       = Debug('app:coststatus.module');

export interface ICoststatusItem {
    _id:            string;
}

export interface ICoststatusState { 
    _data:           ICoststatusItem[];
}

export const useCoststatusStore = defineStore('coststatusStore', {
    state: (): ICoststatusState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                //TODO
                // const data: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'costStatus' } } );
    
                // commit( 'setData', data.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
