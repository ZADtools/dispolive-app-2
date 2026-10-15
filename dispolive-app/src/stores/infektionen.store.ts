import { defineStore }                              from 'pinia';
import Debug                                        from 'debug'; 
import { accountService }                           from 'src/services/account.service';

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
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'infektionen' } } );
                this._data          = data.data || [];
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
