import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  
import { accountService }                           from 'src/services/account.service';

const log       = Debug('app:kostentraeger.module');

export interface IKostentraegerItem {
    _id:            string;
}

export interface IKostentraegerState { 
    _data:           IKostentraegerItem[];
}

export const useKostentraegerStore = defineStore('kostentraegerStore', {
    state: (): IKostentraegerState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data,
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const kostentraeger   = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'krankenkassen' } } );
                if ( Array.isArray(kostentraeger?.data) )
                    this._data = kostentraeger.data
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
