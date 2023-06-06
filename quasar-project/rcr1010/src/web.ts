import { WebPlugin } from '@capacitor/core';

import type { Rcr1010Plugin } from './definitions';

export class Rcr1010Web extends WebPlugin implements Rcr1010Plugin {
  async isPaired(): Promise<{ value: boolean; }> {
    return {
      value: false
    };
  }
  
  async isPairing(): Promise<{ value: boolean; }> {
    return {
      value: false
    };
  }
  
  async isScanning(): Promise<{ value: boolean; }> {
    return {
      value: false
    };
  }
  
  async startScan(): Promise<void> {
  }
  
  async stopScan(): Promise<void> {
  }
  
  async stopPairing(): Promise<void> {
  }
  
  async startPairing(_options: { code: string }): Promise<{ value: boolean; }> {
    return {
      value: false
    };
  }
}
