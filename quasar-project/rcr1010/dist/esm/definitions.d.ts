export interface Rcr1010Plugin {
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
    startPairing(options: {
        code: string;
    }): Promise<{
        value: boolean;
    }>;
    addListener(arg1: string, arg2: Function): Promise<any>;
}
