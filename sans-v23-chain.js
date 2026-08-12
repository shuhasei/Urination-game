(() => {
  'use strict';

  let rawV22 = null;
  let chained = null;

  Object.defineProperty(window, 'applySansRecursionMediaFixV22', {
    configurable: true,
    enumerable: true,
    get() { return chained || rawV22; },
    set(value) {
      rawV22 = value;
      if (typeof value !== 'function') {
        chained = value;
        return;
      }
      chained = source => {
        let result = value(source);
        if (typeof window.applySansVideoFidelityV23 === 'function') {
          result = window.applySansVideoFidelityV23(result);
          console.info('Sans video-fidelity v23 applied.');
        }
        if (typeof window.applySansBirdReferenceV23 === 'function') {
          result = window.applySansBirdReferenceV23(result);
          console.info('Sans bird-reference v23 applied.');
        }
        return result;
      };
      chained.__sansV23Chained = true;
    }
  });
})();
