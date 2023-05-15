import { defineStore }                 from 'pinia';
import Debug                                        from 'debug';  

const log       = Debug('app:desiprotokolle.module');

export interface IDesiprotokollItem {
    _id:            string;
}

export interface IDesiprotokolleState { 
    _data:           IDesiprotokollItem[];
    _startTimer:     boolean;
}

export const useDesiprotokolleStore = defineStore('desiprotokolleStore', {
    state: (): IDesiprotokolleState => ({
        _data:          [],
        _startTimer:    false
    }),
    getters: {
        data:           state => state._data,
        startTimer:     state => state._startTimer
    },
    actions: {
        startTimer ( data: boolean ) {
            this._startTimer = data;
        },
        async getData( ) {
            log( 'getData' );
            
            if (this._data.length > 0)
                return;

            try {
                //TODO
                // const items: any     = await accountService.getDataSocket( { rootGetters, event: 'getDefaultCol', param: { col: 'desi' } } );

                // commit( 'setData', items.data );
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        }
    }
});
