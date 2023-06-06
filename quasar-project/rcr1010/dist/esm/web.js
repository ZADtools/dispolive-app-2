import { WebPlugin } from '@capacitor/core';
export class Rcr1010Web extends WebPlugin {
    async isPaired() {
        return {
            value: false
        };
    }
    async isPairing() {
        return {
            value: false
        };
    }
    async isScanning() {
        return {
            value: false
        };
    }
    async startScan() {
    }
    async stopScan() {
    }
    async stopPairing() {
    }
    async startPairing(_options) {
        return {
            value: false
        };
    }
}
//# sourceMappingURL=web.js.map