import { defineStore }                              from 'pinia';
import Debug                                        from 'debug'; 
import { accountService }                           from 'src/services/account.service'; 

const log       = Debug('app:kategorien.module');

export interface IKategorien {
    _id:            string;
    name:           string;
}

export interface IKategorienState { 
    _data:           IKategorien[];
}

export const useKategorienStore = defineStore('kategorienStore', {
    state: (): IKategorienState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'serienKategorien' } } );
                if ( Array.isArray(data?.data) ) {
                    this._data = data.data
                    this.data.unshift( { _id: '', name: '' } )
                }
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
