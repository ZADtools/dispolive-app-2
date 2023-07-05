import { defineStore }                from 'pinia';
import Debug                            from 'debug';   
import { IFahrbericht }                 from './menu.store';

const log       = Debug('app:nav.module');
log('start')
export interface INav {
    _id?:            string;
    link?:          string;
    icon:           string;
    color:          string;
    name?:          string;
    menuType:       string;
    type:           string;
    item?:          IFahrbericht;
    title:          string;
    sonderrechte?:  number;
}

export interface INavState {
    _data:       any | [];
    _selected:   INav | null;
}

export const useNavStore = defineStore('navStore', {
    state: (): INavState => ({
        _data:                   [],
        _selected:               null
    }),
    getters: {
        data: (state) => state._data,
        selected: (state) => state._selected,
        searchItem: state => {
            return (id: string) => {
                const exist = state._data.find( ( stat: any ) => stat.item._id === id);
                return exist || false;
            }
    }
    },
    actions: {
        async setSelected( point: INav ) {
            this._selected = point;
        },
        async updateNavPoint( fahrbericht: IFahrbericht ) {
            const newStateItem: any = [];
            
            this._data.forEach(( item: INav ) => {
                if ( item.item?._id === fahrbericht._id ) {
                    const fb = { ...item.item, ...fahrbericht };
                    const title      =  this.setTitle(fb);
                    const data = { ...item, ...{ item: fb }, title  };
                    newStateItem.push(data)
                } else 
                    newStateItem.push(item)
            });
            
            if ( this._data.length === 0 && newStateItem.length === 0 )
                return;
                
            this._data = [...newStateItem];
        },
        async addNavPoint( item: IFahrbericht ) {
            const exist = this._data.find( ( stat: any ) => stat.item._id === item._id);
            
            if (!exist) {
                const title      =  this.setTitle(item);

                const navPoint: INav = { 
                    type: item.type, 
                    item: { ...item },
                    icon:   'fas fa-angle-right',
                    color:  'primary',
                    menuType: 'sub',
                    title
                }

                if ( item )
                    navPoint.link       = `fahrberichtactiv/${item._id}`;
            
                this._selected  = { ...navPoint };
                this._data.push(navPoint);
            }
        },
        async removeNavPoint( item: { _id: string } ) {
            this._data = this._data.filter( ( obj: any ) => obj.item._id !== item._id )
        },
        setTitle ( item: IFahrbericht ) {
            let title = (item.patSurname ? item.patSurname : '') + (item.patName ? (', '  + item.patName) : '')

            if ( !item.patSurname && !item.patName )
                title = 'Keine Patientenangaben vorhanden'
console.log('tttt', title)
            if ( item.type === 'Linie' )
                title = item.titel || '';

            if ( item.materialfahrt )
                title = 'Materialfahrt'

            return title
        }
    }
});
