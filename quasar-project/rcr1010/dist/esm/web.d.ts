import { WebPlugin } from '@capacitor/core';
import type { Rcr1010Plugin } from './definitions';
export declare class Rcr1010Web extends WebPlugin implements Rcr1010Plugin {
    isPaired(): Promise<{
        value: boolean;
    }>;
    isPairing(): Promise<{
        value: boolean;
    }>;
    isScanning(): Promise<{
        value: boolean;
    }>;
    startScan(): Promise<void>;
    stopScan(): Promise<void>;
    stopPairing(): Promise<void>;
    startPairing(_options: {
        code: string;
    }): Promise<{
        value: boolean;
    }>;
}
