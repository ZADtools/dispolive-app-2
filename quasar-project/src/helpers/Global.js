import { useSettingsStore }                                 from 'src/stores/settings.store';
import { useNavStore }                                      from 'src/stores/nav.store';
import { useFahrberichtStore }                              from 'src/stores/fahrbericht.store';
import dayjs                                                from 'dayjs';
import debug                                                from 'debug';
import { storeToRefs }                                      from 'pinia';
const log                                                   = debug('app:Global');

export default function Global() {
    const settingsStore = useSettingsStore();
    const { data: settingsData } = storeToRefs(settingsStore);

    const navStore = useNavStore();
    const fahrberichtStore = useFahrberichtStore();

    const navigation = [
        {
            title:      'Fahrten',
            icon:       'fas fa-tasks',
            link:       'trips',
            color:      'grey-5',
            fontColor:  'grey-1',
            bottomMargin: true
        },
        {
            title:      'Angenommene Fahrten',
            icon:       'fas fa-id-card',
            link:       'tripNow',
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
            link:       'messages',
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
            link:       'checklistCar',
            color:      'amber-4',
            fontColor:  'grey-1',
            bottomMargin: true
        },
        {
            title:      'Dienstplan',
            icon:       'fas fa-list-alt',
            link:       'checklistEmployee',
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
            title:      'Logout',
            icon:       'fas fa-sign-out-alt',
            link:       'logout',
            color:      'grey-5',
            fontColor:  'grey-1'
        }
    ];

    function showEaSum (actItem) {
        if ( settingsData.value.eaAnzeigen && actItem.eigenanteil === '10' )
            return (actItem.eaSum * 1).toFixed(2).replace('.', ',') + ' €';
        else
            return '';
    } 

    function setSelectedNavPoint () {
        navStore.setSelected(navigation[0]);
    }

    function tripAbort ( id ) {
        //TODO
        //store.value.unregisterModule( id );
        setSelectedNavPoint();
        
        fahrberichtStore.setShowItem()
        fahrberichtStore.removeNavPoint( {_id: id} );
    }

    function isDateValid(val) {
        const valid = dayjs( val, 'YYYY-MM-DD' ).isValid();
        log( 'isDateValid', val);
        if ( val && !valid ) {
            return 'Datum ungültig';
        }
        
        return true;
    }

    return {
        navigation,
        showEaSum,
        tripAbort,
        setSelectedNavPoint,
        isDateValid
    }
}
