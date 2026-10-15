import { defineStore, storeToRefs }     from 'pinia';
import { LocalStorage }                 from 'quasar';
import Debug                            from 'debug';
import { useAccountStore }              from './account.store';
import { accountService }               from 'src/services/account.service';

const log       = Debug('app:fahrzeuge.module');

export interface ICar {
    _id?:            string;
    status?:         string;
    name:            string;
    key:             string;
    changes?:        string;
}

export interface IFahrzeugeState {
    _data:           ICar[];
    _item:           ICar | null;
    _status:         string | 'frei';
    _sonderrechte:   boolean | false;
    _loadData:       boolean;
}

export const useFahrzeugeStore = defineStore('fahrzeugeStore', {
    state: (): IFahrzeugeState => ({
        _data:           [],
        _item:           null,
        _status:         'frei',
        _sonderrechte:   false,
        _loadData:       true
    }),
    getters: {
        data:           state => state._data,
        item:           state => state._item,
        status:         state => state._status,
        sonderrechte:   state => state._sonderrechte,
        loadData:       state => state._loadData
    },
    actions: {
        clearData(  ) {
            this._item = null;
            this._data = [];
            this._sonderrechte = false;
        },
        async getDataFromStorage( ) {
            const car: any = await LocalStorage.getItem('selectedCar');
            
            if (car.value)
                this._item = JSON.parse( car.value );
        },
        async getData( ) {
            const accountStore = useAccountStore();
            const { beifahrer } = storeToRefs(accountStore);
            this._data = [];

            const param: any = { 
                filter: {
                    aktive: '1'
                } 
            }   

            if ( beifahrer.value && beifahrer.value.firma?.length > 0 ) {
                param.filter.$or = [
                    {firma: ''}, 
                    {firma:  {$exists: false}} 
                ]

                beifahrer.value.firma.forEach( (firma: string) => {
                    param.filter.$or.push({ firma })
                } )
            }

            try {
                this._loadData = true
                const fahrzeuge     = await accountService.getDataSocket( { event: 'getCars', param } )

                if (Array.isArray(fahrzeuge))
                    this._data          = fahrzeuge

                this._loadData      = false
            } catch (error) {
                log( 'Error getData', error )
                this._loadData = false;
                this._data = [];
            }
        },

        async setItem( item: ICar | null ) {
            log( 'setItem', item );
            if (item)
                LocalStorage.set('selectedCar', JSON.stringify(item));
                
            this._item = item;
        }
    },
});
