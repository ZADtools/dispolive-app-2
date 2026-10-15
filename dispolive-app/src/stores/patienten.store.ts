import { defineStore }                              from 'pinia';
import { accountService }                           from 'src/services/account.service';
import Debug                                        from 'debug';  

const log       = Debug('app:patienten.module');

export interface IPatient {
    _id:            string;
    name:           string;
    surname:        string;
    street:             string;
    zip:                string;
    city:               string;
    lat:                number;
    lng:                number;
    adress:             string;
}

export interface IPatientenState { 
    _data:           IPatient[];
    _search:         string;
}

export const usePatientenStore = defineStore('patientenStore', {
    state: (): IPatientenState => ({
        _data:          [],
        _search:        '',
    }),
    getters: {
        data:           state => state._data,
        search:         state => state._search
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            try {
                const patienten: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'patientenStammdaten', filter: { status_id: { $ne: '0'} } } } );
                this._data = patienten?.data || [];
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
