(() => {
  'use strict';

  let rawUserPolish = null;
  let composed = null;

  function isLegacyWrapper(fn) {
    return Boolean(fn && (
      fn.__sansVideoWrapped
      || fn.__battleSyncV2Wrapped
      || fn.__undertaleSfxFinalWrapped
      || fn.__sansVoiceFixWrapped
      || fn.__sansFinalHardeningWrapped
      || fn.__sansFinalOrchestrated
    ));
  }

  function buildPipeline(base) {
    const wrapped = source => {
      let s = base(String(source || ''));
      if (typeof window.applySansVideoAddon === 'function') {
        s = window.applySansVideoAddon(s);
      }
      if (typeof window.applyBattleSyncV2 === 'function') {
        s = window.applyBattleSyncV2(s);
      }
      if (typeof window.applyUndertaleSfxFinal === 'function') {
        s = window.applyUndertaleSfxFinal(s);
      }
      if (typeof window.applySansFinalHardening === 'function') {
        s = window.applySansFinalHardening(s);
      }
      if (typeof window.applySansGapGifBalanceV6 === 'function') {
        s = window.applySansGapGifBalanceV6(s);
      }
      return s;
    };
    wrapped.__sansFinalOrchestrated = true;
    return wrapped;
  }

  // Throw away the competing legacy accessor chain. v4 later assigns the raw
  // user-polish function; that one assignment becomes the only base function.
  Object.defineProperty(window, 'applyUserPolishHotfix', {
    configurable: true,
    enumerable: true,
    get() {
      return composed;
    },
    set(value) {
      if (typeof value !== 'function') return;
      // The old add-ons still have short-lived timers. Ignore their attempts to
      // wrap the already-composed function; their transforms are invoked above
      // in a fixed order instead.
      if (isLegacyWrapper(value)) return;
      rawUserPolish = value;
      composed = buildPipeline(rawUserPolish);
      console.info('Sans final patch pipeline locked.');
    }
  });
})();