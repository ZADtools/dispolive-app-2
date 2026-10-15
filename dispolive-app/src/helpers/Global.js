import { useSettingsStore }                                 from 'src/stores/settings.store';
import { useNavStore }                                      from 'src/stores/nav.store';
import { useRouter }                                        from 'vue-router';
import { useFahrberichtStore }                              from 'src/stores/fahrbericht.store';
import dayjs                                                from 'dayjs';
import debug                                                from 'debug';
import { storeToRefs, getActivePinia }                      from 'pinia';
const log                                                   = debug('app:Global');

export const Global = () => {
    const settingsStore = useSettingsStore();
    const { item: settingsData } = storeToRefs(settingsStore);

    const navStore = useNavStore();
    const fahrberichtStore = useFahrberichtStore();

    const router = useRouter();

    const navigation = [
        {
            title:      'Fahrten',
            icon:       'fas fa-tasks',
            link:       'fahrberichte',
            color:      'grey-5',
            fontColor:  'grey-1',
            bottomMargin: true
        },
        {
            title:      'Angenommene Fahrten',
            icon:       'fas fa-id-card',
            link:       'fahrbericht',
            color:      'grey-5',
            fontColor:  'grey-1',
            submenu:    'forTrips',
            bottomMargin: true
        },
        {
            title:      'Kontakte',
            icon:       'fas fa-users',
            link:       'contact',
            color:      'grey-5',
            fontColor:  'grey-1'
        },
        {
            title:      'Pausieren',
            icon:       'fas fa-pause',
            activeIcon: 'fas fa-play',
            link:       'pause',
            color:      'primary',
            fontColor:  'grey-1',
            bottomMargin: true,
            function:    'pause'
        },
        {
            title:      'Messenger',
            icon:       'fas fa-envelope',
            link:       'messenger',
            color:      'secondary',
            fontColor:  'grey-1',
            bottomMargin: true
        },
        {
            title:      'Sonderrechte',
            icon:       'fas fa-bell',
            link:       'sonderrechte',
            color:      'negative',
            fontColor:  'white',
            function:    'specialrights'
        },
        {
            title:      'Desinfektion',
            icon:       'fas fa-bug',
            link:       'desinfection',
            color:      'orange',
            fontColor:  'grey-1'
        },
        {
            title:      'Fahrzeugcheckliste',
            icon:       'fas fa-book',
            link:       'inventarIn',
            color:      'amber-4',
            fontColor:  'grey-1',
            bottomMargin: true
        },
        {
            title:      'Dienstplan',
            icon:       'fas fa-list-alt',
            link:       'dienstplan',
            color:      'grey-5',
            fontColor:  'grey-1',
            bottomMargin: true
        },
    
        {
            title:      'Ungesendete Daten',
            icon:       'fas fa-database',
            link:       'missingData',
            color:      'grey-5',
            fontColor:  'grey-1'
        },
        {
            title:      'Kartenleser',
            icon:       'fas fa-signal',
            link:       'cardreader',
            color:      'grey-5',
            fontColor:  'grey-1'
        },
        {
            title:      'Einstellungen',
            icon:       'fas fa-wrench',
            link:       'settings',
            color:      'grey-5',
            fontColor:  'grey-1'
        },
        {
            title:      'Panik-Buzzer',
            icon:       'fa-solid fa-person-harassing',
            link:       'panicButton',
            color:      'red-5',
            fontColor:  'grey-1',
            function:    'setPanicDialog'
        },
        {
            title:      'Logout',
            icon:       'fas fa-sign-out-alt',
            link:       'logout',
            color:      'grey-5',
            fontColor:  'grey-1'
        }
    ];

    function compareObjects (o1, o2) {
        return JSON.stringify(o1) === JSON.stringify(o2);
    }

    function showEaSum (actItem) {
        if ( settingsData.value?.eaAnzeigen && actItem.eigenanteil === '10' )
            return (actItem.eaSum * 1).toFixed(2).replace('.', ',') + ' €';
        else
            return '';
    } 

    function setSelectedNavPoint () {
        navStore.setSelected(navigation[0]);
    }

    function removeStore ( id ) { 
        const allStores = getActivePinia()._s
        const store = allStores.get(id)
        if ( store )
            store.$dispose()
    }

    function tripAbort ( id ) {
        if ( !id ) {
            console.log('tripAbort no ID')
            return
        }
        try {
            removeStore(id)
            setSelectedNavPoint();
            navStore.removeNavPoint({_id: id});
            fahrberichtStore.removeSelectedItem();
            router.push( '/app/fahrberichte' )
        } catch (error) { 
            console.log('tripAbort', error)
        }
    }

    function isDateValid(val) {
        const valid = dayjs( val, 'YYYY-MM-DD' ).isValid();
        log( 'isDateValid', val);
        if ( val && !valid ) {
            return 'Datum ungültig';
        }
        
        return true;
    }

    function groupBy (array, key) {
        const result =  {}
    
        array.forEach((item) => {
            const group = item[key];
    
            if (!result[group])
                result[group] = [];
    
            result[group].push(item);
        });
    
        return result;
    }

    function toPairs (obj) {
        return Object.keys(obj).map((key) => [key, obj[key]]);
    }

    return {
        navigation,
        showEaSum,
        tripAbort,
        setSelectedNavPoint,
        isDateValid,
        compareObjects,
        groupBy,
        toPairs,
        removeStore
    }
}
