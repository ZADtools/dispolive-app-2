import { defineStore }                  from 'pinia';
import Debug                            from 'debug';   
import { accountService }               from 'src/services/account.service';

const log       = Debug('app:settings.module');

export interface ISettingsItem {
    _id?:                       string;   
    inventarIntervall?:         number; 
    showAusrueckzeit?:          boolean;
    zuweisZeit?:                boolean;
    noCustomMessage?:           boolean;
    changeStartTarget?:         number;
    changeInfektion?:           number;
    adress?:                    string;
    dataNotCompleteWarn?:       number;
    transportscheinFalseWarn?:  number;
    costStatusAnzeigen?:        boolean;
    desiProtErz?:               number;
    ipadEventEdit?:             number;
}
export interface ISettingsState {
    _item:          ISettingsItem
}

export const useSettingsStore = defineStore('settingsStore', {
    state: (): ISettingsState => ({
        _item:                   {
            inventarIntervall:  0
        }
    }),
    getters: {
        item: (state) => state._item,
    },
    actions: {
        async getData( ) {
            try {
                const data: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'grundeinstellungen' } } );
                if ( data.data && data.data[0] )
                    this._item = data.data[0];
            } catch (error) {
                log( 'Error getData', error )
                this._item = {}
            }
        }
    },
});
