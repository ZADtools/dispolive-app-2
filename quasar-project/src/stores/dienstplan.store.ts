import { defineStore }                  from 'pinia';
import Debug                            from 'debug';   
import { IUser }                        from './account.store';
import { IFahrbericht }                 from './menu.store';
import { accountService }               from 'src/services/account.service';

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
        remove ( ) {
            this._data = [];
        },
        groupBy (array: any, key: string) {
            const result: any =  {}
        
            array.forEach((item: any) => {
                const group = item[key];
        
                if (!result[group])
                    result[group] = [];
        
                result[group].push(item);
            });
        
            return result;
        },
        async getData( mitarbeiter: IUser ) {
            log( 'getData' );

            const param = {
                mitarbeiter: mitarbeiter._id,
                mitarbeiterName: `${mitarbeiter.surname} ${mitarbeiter.name}`
            };

            log(param)
            
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getBesatzungsplan', param } );

                const groupeData = this.groupBy(data, 'formatStart');
    
                this._data = groupeData || [];
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        },

    },
});
