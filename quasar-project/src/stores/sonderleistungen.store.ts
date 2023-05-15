import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  

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
                //TODO
                // const data: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'sonderleistungenKategorien' } } );
    
                // commit( 'setData', data.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
