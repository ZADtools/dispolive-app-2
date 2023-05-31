import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  

const log       = Debug('app:infektion.module');

export interface IInfektion {
    _id:            string;
    infektionsName: string;
    desc:           string;
    krz:            string;
}

export interface IInfektionenState { 
    _data:           IInfektion[];
}

export const useInfektionenStore = defineStore('infektionStore', {
    state: (): IInfektionenState => ({
        _data:          [],
    }),
    getters: {
        data:           state => state._data
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            //TODO
            try {
                // const data: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'infektionen' } } );
                
                // commit( 'setData', data.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
