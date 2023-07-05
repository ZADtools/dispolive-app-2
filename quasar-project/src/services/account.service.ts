import { Platform }                 from 'quasar';     
import axios                        from 'axios';
import debug                        from 'debug';
import { useSocketStore }           from 'src/stores/socket.store';
import { useFahrzeugeStore }        from 'src/stores/fahrzeuge.store';
import { useAccountStore }          from 'src/stores/account.store';
import { storeToRefs }              from 'pinia';
const log                           = debug('app:account.service');

export interface IRequest {
    withCredentials:        boolean;
}

const request: IRequest       = {
        withCredentials:    false,
    };

let domain: string,
    session: string;

async function setDomain( dom: string ) {
    domain      = `https://${dom}.dispolive.de`;
    const platform    = Platform.is;

    //*todoo /auth dev6

    try {
        log( 'domain', domain );
        axios.defaults.withCredentials      = true;
    } catch (err) {
        log( 'Error setting domain', err );
    }
}

async function login( data: any ) {
    data.version = 6
    try {
        const response  = await axios( {
            headers:    { 'Content-Type': 'application/json' },
            method:     'POST',
            url:        `${domain}/appLogin`, 
            data
        });
        
        if (response.data.session) {
            session = response.data.session
        }
    
        return response.data
    } catch (err: any) {
        if (err.status) {
            log( 'Error login', err.status, err.data );
        } else {
            log( 'Error login', err );
        }

        return err;
    }
}

function printEinsatzprotokoll( { params }: any ) {
    return new Promise((resolve, reject) => {
        try {
            const socketStore = useSocketStore()
            const { io } = storeToRefs(socketStore)

            const accountStore = useAccountStore();
            const { sessionId: sessionID } = storeToRefs(accountStore);

            io.value.emit('printEinsatzprotokoll', { sessionID: sessionID.value, params }, (err: any) => {
                if (!err || !err.error ) {
                    resolve(err)
                } else
                    reject(err.error)
            });
        } catch (err) {
            reject(err)
        }
    })
}

function logout( { sessionID }: any ) {
    return new Promise((resolve, reject) => {
        const socketStore = useSocketStore()
        const { io } = storeToRefs(socketStore)
        
        const fahrzeugeStore = useFahrzeugeStore();
        const  { item: car } = storeToRefs(fahrzeugeStore);
        
        io.value.emit('logout', { sessionID, car: car.value }, (err: any) => {
            if (err) {
                log('logout Error', err);
                reject(err);
            }

            if (!err || !err.error ) {
                resolve(true)
            }
        });

        if (Platform.is.mobile) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //(<any>window.cordova.plugins).backgroundMode.disable();
        }

        log( 'logout' );
    })
}

async function getData( { collection, filter }: { collection: string, filter?: unknown }) {
    try {
        const response  = await axios( {
            headers:    { 'Content-Type': 'application/json' },
            method:     'POST',
            url:        `${domain}/appLogin`, 
            data: { filter: filter || {} }
        });
    
        return response.data;
    } catch (err) {
        log( 'Error getData', collection, err );
    }
}

async function getCustomData( { path, param }: { path: string, param?: unknown }) {
    log( 'getCustomData', domain, path, param );

    try {
        const response  = await axios( {
            method:     'POST',
            url:        domain + `${path}`,
            data:          param,
        });
        log( 'getCustomData', path, response.data );
        return response.data;
    } catch (err) {
        log( 'Error getCustomData', path, err );
        return {error: err};
    }
}

function transferItem (  { item }: { item: any } ) {
    const socketStore = useSocketStore()
    const { io } = storeToRefs(socketStore)

    const accountStore = useAccountStore()
    const { sessionId } = storeToRefs(accountStore)

    return new Promise((resolve, reject) => {
        let id          = '';

        log('transferItem', item)

        const timeout = setTimeout( () => {
            reject({ error: 'no socket connection' })
        }, 10000 )

        //sende zeitstempel zum server
        if ( item.type === 'zeitstempel' ) {
            io.value.emit('setFBStatus', {doc: item.item, sessionID: sessionId.value}, (err: any) => {
                clearTimeout(timeout)
                
                if (err) {
                    log('setFBStatus Error', err);
                    reject({error: err});
                }

                if (!err || !err.error ) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende sonderrechte zum server
        if ( item.type === 'sonderNotice' ) {
            io.value.emit('sonderNotice', {doc: item.item, sessionID: sessionId.value}, (err: any) => {
                clearTimeout(timeout)

                if (err) {
                    log('sonderNotice Error', err);
                    reject(err);
                }

                if (!err || !err.error ) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende geänderte fahrberichte
        if ( item.type === 'fahrbericht' ) {
            io.value.emit('changeFbFromApp', { fb: item.item, sessionID: sessionId.value}, async (err: any) => {
                if (err) {
                    log('changeFbFromApp Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende desinfektionsprotokoll
        if ( item.type === 'desinfektion' ) {
            io.value.emit('desi', {sessionID: sessionId.value, desi: item.item}, (err: any) => {
                clearTimeout(timeout)

                if (err) {
                    log('desinfektion Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        // //sende bestückungsliste
        if ( item.type === 'bestueckungsliste' ) {
            io.value.emit( 'bestueckungsliste', {sessionID: sessionId.value, bestueckungsliste: item.item}, (err: any) => {
                clearTimeout(timeout)

                if (err) {
                    log('bestueckungsliste Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

         //sende bestückungsliste ablehnen
         if ( item.type === 'bestueckungslisteDecline' ) {
            io.value.emit('bestueckungslisteDecline', {sessionID: sessionId.value, bestueckungsliste: item.item}, (err: any) => {
                clearTimeout(timeout)

                if (err) {
                    log('bestueckungslisteDecline Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende sendungsstatus
        if ( item.type === 'sendungsstatus' ) {
            io.value.emit('sendungsstatus', {sessionID: sessionId.value, sendungsstatus: item.item}, ( err: any ) => {
                clearTimeout(timeout)

                if (err) {
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende pauseStatus
        if ( item.type === 'pauseStatus' ) {
            io.value.emit('savePauseStatus', {sessionID: sessionId.value, data: item.item}, ( err: any ) => {
                clearTimeout(timeout)

                if (err) {
                    log('sendungsstatus Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende messages
        if ( item.type === 'messages' ) {
            io.value.emit('saveMessage', {sessionID: sessionId.value, data: item.item}, ( err: any ) => {
                clearTimeout(timeout)

                if (err) {
                    log('saveMessage Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }

        //sende messages
        if ( item.type === 'receiveChatMessage' ) {
            io.value.emit('receiveChatMessage', {sessionID: sessionId.value, data: item.item}, ( err: any ) => {
                clearTimeout(timeout)
                
                if (err) {
                    log('receiveChatMessage Error', err);
                    reject(err);
                }

                if (!err || !err.error) {
                    id = item.id;
                    resolve(id)
                }
            });
        }
    })
}

async function transferFile( { path, param }: { path: string, param?: unknown }) {
    log( 'transferFile', domain, path, param );

    try {
        const response  = await axios( {
            method:     'POST',
            url:        domain + `${path}`,
            data:          param,
            headers:    {
                'Content-Type': 'multipart/form-data'
            }
        });
        log( 'transferFile', path, response.data );
        return response.data;
    } catch (err) {
        log( 'Error transferFile', path, err );
    }
}

function getDataSocket( { event, param }: { event: string, param?: any }) {
    let paramsData = {};
    if ( param )
        paramsData = {...param, version: 6}

    const socketStore = useSocketStore();
    const { io } = storeToRefs(socketStore);

    return new Promise( (resolve, reject) => {
        io.value.emit( event, paramsData, (data: any) => {
            log('fetchData', event, paramsData, data)

            resolve(data);
        });
    })
}

export const accountService = {
    setDomain,
    login,
    logout,
    getData,
    getCustomData,
    transferItem,
    transferFile,
    getDataSocket,
    printEinsatzprotokoll
};
