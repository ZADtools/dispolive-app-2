import { defineStore }                              from 'pinia';
import Debug                                        from 'debug';  
//import { NativeAudio }                            from '@capacitor-community/native-audio'

const log       = Debug('app:audio.module');
log('start')

export const useAudioStore = defineStore('audioStore', {
    state: () => ({
    }),
    getters: {
    },
    actions: {
        async init ( ) {
            //for ios
            const path = 'sounds/'
            log(path)
            //TODO
            //for android
            // if ( rootState.account.device.operatingSystem == 'android' )
            //     path = ''

            // NativeAudio.preload({
            //     assetPath:path+'adresse.mp3',
            //     assetId: 'adresse',
            //     volume: 1.0,
            //     audioChannelNum: 1
            // });

            // NativeAudio.preload({
            //     assetPath: path+'entzogen.mp3',
            //     assetId: 'entzogenFahrt',
            //     volume: 1.0,
            //     audioChannelNum: 2
            // });

            // NativeAudio.preload({
            //     assetPath: path+'neuefahrt.mp3',
            //     assetId: 'neueFahrt',
            //     volume: 1.0,
            //     audioChannelNum: 3
            // });

            // NativeAudio.preload({
            //     assetPath:path+'neuenachricht.mp3',
            //     assetId: 'neueNachricht',
            //     volume: 1.0,
            //     audioChannelNum: 4
            // });
        },

        unload() {
            //TODO
            // NativeAudio.unload({
            //     assetId: 'adresse',
            // });

            // NativeAudio.unload({
            //     assetId: 'entzogenFahrt',
            // });

            // NativeAudio.unload({
            //     assetId: 'neueFahrt',
            // });

            // NativeAudio.unload({
            //     assetId: 'neueNachricht',
            // });

            // NativeAudio.unload({
            //     assetId: 'empty',
            // });

        },

        async play ( file: string ) {
            log(file)
            //TODO
            //await NativeAudio.play({assetId: file, time: 0.0});
        }
    }
});
