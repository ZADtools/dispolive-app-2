import { defineStore, storeToRefs }                              from 'pinia';
import Debug                                        from 'debug';  
import { NativeAudio }                              from '@capgo/native-audio'
import { useAccountStore }                          from './account.store'; 

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
            let path = 'assets/'

            const accountStore = useAccountStore()
            const { device } = storeToRefs(accountStore)

            //for android
            if ( accountStore.device.operatingSystem === 'android' )
                path = 'assets/'

            NativeAudio.configure({
                focus: false,
                background: true
            })

            if (device.value.isVirtual)
                return

            NativeAudio.preload({
                assetPath: path + 'adresse.mp3',
                assetId: 'adresse',
                volume: 1.0,
                audioChannelNum: 1
            });

            NativeAudio.preload({
                assetPath: path + 'entzogen.mp3',
                assetId: 'entzogenFahrt',
                volume: 1.0,
                audioChannelNum: 2
            });

            NativeAudio.preload({
                assetPath: path + 'neuefahrt.mp3',
                assetId: 'neueFahrt',
                volume: 1.0,
                audioChannelNum: 3
            });

            NativeAudio.preload({
                assetPath: path + 'neuenachricht.mp3',
                assetId: 'neueNachricht',
                volume: 1.0,
                audioChannelNum: 4
            });

            NativeAudio.preload({
                assetPath: path + 'pause.mp3',
                assetId: 'pause',
                volume: 1.0,
                audioChannelNum: 5
            });
        },

        unload() {
            NativeAudio.unload({
                assetId: 'adresse',
            });

            NativeAudio.unload({
                assetId: 'entzogenFahrt',
            });

            NativeAudio.unload({
                assetId: 'neueFahrt',
            });

            NativeAudio.unload({
                assetId: 'neueNachricht',
            });

            NativeAudio.unload({
                assetId: 'pause',
            });
        },

        async play ( file: string ) {
            log(file)
            try {
                await NativeAudio.play({assetId: file});
            } catch (error) {
                log(error)
            }
        }
    }
});
