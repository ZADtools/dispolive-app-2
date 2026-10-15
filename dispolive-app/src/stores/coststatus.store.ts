import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  
import { accountService }                           from 'src/services/account.service';
const log       = Debug('app:coststatus.module');

export interface ICoststatusItem {
    _id:            string;
    status:         string;
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
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'costStatus' } } );
                
                this._data = data.data;
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
