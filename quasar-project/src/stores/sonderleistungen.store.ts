import { defineStore }                              from 'pinia';
import Debug                                        from 'debug'; 
import { accountService }                           from 'src/services/account.service'; 

const log       = Debug('app:sonderleistungen.module');

export interface ISonderleistung {
    _id:            string;
}

export interface ISonderleistungenState { 
    _data:           ISonderleistung[];
}

export const useSonderleistungenStore = defineStore('sonderleistungenStore', {
    state: (): ISonderleistungenState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'sonderleistungenKategorien' } } );
                
                if ( Array.isArray(data?.data) )
                    this._data = data.data
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
