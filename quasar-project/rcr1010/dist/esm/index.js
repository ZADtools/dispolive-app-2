import { registerPlugin } from '@capacitor/core';
const Rcr1010 = registerPlugin('Rcr1010', {
    web: () => import('./web').then(m => new m.Rcr1010Web()),
});

export { Rcr1010 };
//# sourceMappingURL=index.js.map
