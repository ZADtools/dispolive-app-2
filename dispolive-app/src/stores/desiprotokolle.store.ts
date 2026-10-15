import { defineStore }                          from 'pinia';
import { accountService }                       from 'src/services/account.service';
import Debug                                    from 'debug';  
import dayjs                                    from 'dayjs';

const log       = Debug('app:desiprotokolle.module');

export interface IDesiprotokollItem {
    _id:            string;
}

export interface IDesiprotokolleState { 
    _data:           IDesiprotokollItem[];
    _startTimer:     boolean;
    _desiStartTimer: string;
    _diffTime:       string;
    _timer:          string | null;
}

export const useDesiprotokolleStore = defineStore('desiprotokolleStore', {
    state: (): IDesiprotokolleState => ({
        _data:          [],
        _startTimer:    false,
        _desiStartTimer: '',
        _timer:         null,
        _diffTime:      ''
    }),
    getters: {
        data:           state => state._data,
        startTimer:     state => state._startTimer,
        desiStartTimer: state => state._desiStartTimer,
        timer:          state => state._timer,
        diffTime:       state => state._diffTime
    },
    actions: {
        async getData( ) {
            log( 'getData' );
            
            if (this._data.length > 0)
                return;

            try {
                const items: any     = await accountService.getDataSocket( { event: 'getDefaultCol', param: { col: 'desi' } } );
                this._data = items.data || [];
            } catch (error) {
                log( 'Error getData', error );
                this._data = [];
            }
        },
        setDiffTime () {
            const end = dayjs(this._timer)
            const start = dayjs(this._desiStartTimer)

            const diff = end.diff(start, 'second')

            const minuten = Math.floor(diff / 60)
            const restSekunden = diff % 60
          
            this._diffTime = minuten.toString().padStart(2, '0') + ':' + restSekunden.toString().padStart(2, '0')
          }
    }
});
