/* global  */
import { io } from "socket.io-client";

import debug            from 'debug';
const log       = debug('app:w4b.socket-4');

log( 'start' );

export interface ISocket4 {
    socket:     null;
}
//Lordrepha
export const sock4 = {
    async init( domain: string ) {
        log( 'init' );

        try {
            const socketHdl        = io( domain );

            socketHdl.on( 'connect', () => {
                log( 'Socket CONNECT' );
            });
            socketHdl.on( 'disconnect', () => {
                log( 'Socket DISCONNECT' );
            });

            log( 'after init', socketHdl );
            return socketHdl;
        } catch (error) {
            log( 'error init', error );
            return {error, domain, io}
        }
    }
};
