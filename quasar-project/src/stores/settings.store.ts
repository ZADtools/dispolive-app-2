import { defineStore }                  from 'pinia';
import Debug                            from 'debug';   

const log       = Debug('app:settings.module');

export interface ISettingsItem {
    _id?:           string;    
}

export interface ISettingsState {
    _item:          ISettingsItem
}

export const useSettingsStore = defineStore('settingsStore', {
    state: (): ISettingsState => ({
        _item:                   {}
    }),
    getters: {
        item: (state) => state._item,
    },
    actions: {
        async getData( ) {
            try {
                // const data: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'grundeinstellungen' } } );

                // commit( 'setData', data.data && data.data[0] );
            } catch (error) {
                log( 'Error getData', error )
                this._item = {}
            }
        }
    },
});
