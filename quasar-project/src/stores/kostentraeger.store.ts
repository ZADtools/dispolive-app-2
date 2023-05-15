import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  

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
                //TODO
                // const kostentraeger: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'krankenkassen' } } );

                // commit( 'setData', kostentraeger.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
