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
        // v24's transformer is intentionally skipped: it produced a duplicate
        // identifier declaration at runtime. Its embedded voice sample remains
        // available as window.__sansVoiceBlipV24Data for the corrected v25 patch.
        if (typeof window.applySansStartupSizeFixV25 === 'function') {
          result = window.applySansStartupSizeFixV25(result);
          console.info('Sans startup/size fix v25 applied.');
        }
        if (typeof window.applySansVideoRebuildV26 === 'function') {
          result = window.applySansVideoRebuildV26(result);
          console.info('Sans video rebuild v26 applied.');
        }
        return result;
      };
      chained.__sansV26Chained = true;
    }
  });
})();
