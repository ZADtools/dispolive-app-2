import { defineStore }  from 'pinia';
import Debug            from 'debug';

const log       = Debug('app:fahrzeuge.module');

export interface ICardreaderState {
    _isScanning: boolean;
    _cardResponse: any;
}

export const useCardreaderStore = defineStore('cardreaderStore', {
    state: (): ICardreaderState => ({
        _isScanning: false,
        _cardResponse: null,
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
        },
        stopReadCard() {

        },
        setCardData( item: any ) {
                return {}
        }
    },
});
