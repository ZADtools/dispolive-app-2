import { defineStore }                  from 'pinia';
import Debug                            from 'debug';   
import { IUser }                        from './account.store';
import { IFahrbericht }                 from './menu.store';

const log       = Debug('app:dienstpaln.module');

export interface IDienstplanItem {
    link?:          string;
    icon:           string;
    color:          string;
    name?:          string;
    menuType:       string;
    type:           string;
    item?:          IFahrbericht;
    title:          string;
}

export interface IDienstplanState {
    _data:          IDienstplanItem[]
    _pers:           string
}

export const useDienstplanStore = defineStore('dienstplanStore', {
    state: (): IDienstplanState => ({
        _data:                   [],
        _pers:                   '',
    }),
    getters: {
        data: (state) => state._data,
        pers: (state) => state._pers
    },
    actions: {
        setPers( pers: string ) {
            this._pers = pers;
        },
        async getData( mitarbeiter: IUser ) {
            log( 'getData' );

            const param = {
                mitarbeiter: mitarbeiter._id,
                mitarbeiterName: `${mitarbeiter.surname} ${mitarbeiter.name}`
            };

            log(param)
            
            try {
                //TODO
                // let data: any     = await accountService.getDataSocket( { rootGetters, event: 'getBesatzungsplan', param } );

                // const groupeData = _.groupBy(data, 'formatStart');
    
                // commit( 'setData', groupeData );

            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        },

    },
});
