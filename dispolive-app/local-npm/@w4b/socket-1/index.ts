/* global  */
import io               from 'socket.io-client';

import debug            from 'debug';
const log       = debug('app:w4b.socket-1');

log( 'start' );

export const sock1 = {
    async init() {
        log( 'init' );

        try {
            const socketHdl        = io( '/app' );

            socketHdl.on( 'connect', () => {
                log( 'Socket CONNECT' );
            });
            socketHdl.on( 'disconnect', () => {
                log( 'Socket DISCONNECT' );
            });

            log( 'after init', socketHdl );
            return socketHdl;
        }
        catch(error) {
            log( 'error init', error );
        }
    }
};
