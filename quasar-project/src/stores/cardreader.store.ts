import { defineStore }  from 'pinia';
import Debug            from 'debug';

const log       = Debug('app:fahrzeuge.module');

export interface ICardreaderState {
    _isScanning: boolean;
}

export const useCardreaderStore = defineStore('cardreaderStore', {
    state: (): ICardreaderState => ({
        _isScanning: false,
    }),
    getters: {
        isScanning: (state) => state._isScanning,
    },
    actions: {
        startPairing() {
            log('startPairing');
        },
        readCard() {
            log('readCard');
        }
    },
});
