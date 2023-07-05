import { defineStore }                              from 'pinia';
import Debug                                        from 'debug'; 
import { accountService }                           from 'src/services/account.service'; 

const log       = Debug('app:transportart.module');

export interface ITransportart {
    _id:            string;
    transportart:   string;
}

export interface ITransportartState { 
    _data:           ITransportart[];
}

export const useTransportartStore = defineStore('transportartStore', {
    state: (): ITransportartState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'transportart' } } );
                if ( Array.isArray(data?.data) ) {
                    this._data = data.data
                    this.data.unshift( { _id: '', transportart: '' } )
                }
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
