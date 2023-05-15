import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  

const log       = Debug('app:patienten.module');

export interface IPatient {
    _id:            string;
    firstname:      string;
    lastname:       string;
}

export interface IPatientenState { 
    _data:           IPatient[];
}

export const usePatientenStore = defineStore('patientenStore', {
    state: (): IPatientenState => ({
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
                // const patienten: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'patientenStammdaten', filter: { status_id: { $ne: '0'} } } } );

                // commit( 'setData', patienten.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
