import { registerPlugin } from '@capacitor/core';

import type { Rcr1010Plugin } from './definitions';

const Rcr1010 = registerPlugin<Rcr1010Plugin>('Rcr1010', {
  web: () => import('./web').then(m => new m.Rcr1010Web()),
});

export * from './definitions';
export { Rcr1010 };
