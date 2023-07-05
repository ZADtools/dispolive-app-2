import { defineStore }                              from 'pinia';
import Debug                                        from 'debug'; 
import { accountService }                           from 'src/services/account.service'; 

const log       = Debug('app:verordnungsart.module');

export interface IVerordnungsart {
    _id:            string;
    name:           string;
}

export interface IVerordnungsartState { 
    _data:           IVerordnungsart[];
}

export const useVerordnungsartStore = defineStore('verordnungsartStore', {
    state: (): IVerordnungsartState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'keyFahrzeuge' } } );
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
