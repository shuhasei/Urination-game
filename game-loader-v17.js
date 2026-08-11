(() => {
  'use strict';

  const VERSION = '20260811-sans-reference-v18';

  function loadScript(src, optional = false) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve(script);
      script.onerror = () => optional ? resolve(null) : reject(new Error(src + ' could not be loaded'));
      document.head.appendChild(script);
    });
  }

  function preloadImage(src, label, timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error(label + ' data is empty'));
      const image = new Image();
      let done = false;
      const finish = (ok, value) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        ok ? resolve(value) : reject(value);
      };
      const timer = setTimeout(() => finish(false, new Error(label + ' timed out')), timeoutMs);
      image.onload = () => image.naturalWidth && image.naturalHeight
        ? finish(true, image)
        : finish(false, new Error(label + ' decoded with zero size'));
      image.onerror = () => finish(false, new Error(label + ' could not be decoded'));
      image.src = src;
    });
  }

  async function prepareFallbackMedia() {
    await loadScript(`user-media-data.js?v=${VERSION}`);
    await loadScript(`user-sans-gifs-v4.js?v=${VERSION}`);
    const fallbackSans = window.USER_SANS_IDLE_V4 || window.USER_SANS_GIF_DATA || window.USER_SANS_ACTION_V4;
    if (fallbackSans) {
      try { window.__userSansGifPreloaded = await preloadImage(fallbackSans, 'fallback Sans GIF'); }
      catch (error) { console.warn(error); }
    }
    if (window.USER_GASTER_GIF_DATA) {
      try { window.__userGasterGifPreloaded = await preloadImage(window.USER_GASTER_GIF_DATA, 'fallback Gaster GIF'); }
      catch (error) { console.warn(error); }
    }
  }

  async function prepareTenorMedia() {
    const manifestLoaded = await loadScript(`tenor-sans-media-v18.js?v=${VERSION}`, true);
    const media = manifestLoaded ? window.TENOR_SANS_MEDIA_V18 : null;
    if (!media) return false;

    let sansReady = false;
    try {
      window.__hqSansV17 = await preloadImage(media.battle?.url, 'Tenor Sans battle GIF', 10000);
      sansReady = true;
    } catch (error) {
      console.warn('Tenor Sans GIF unavailable; local fallback will be used.', error);
    }

    try {
      window.__hqGasterV17 = await preloadImage(media.gaster?.url, 'Tenor Gaster Blaster GIF', 10000);
    } catch (error) {
      console.warn('Tenor Gaster GIF unavailable; local fallback will be used.', error);
    }

    if (media.handUp?.url) {
      try { window.__hqHandUpV17 = await preloadImage(media.handUp.url, 'Tenor Sans gesture GIF', 10000); }
      catch (error) { console.warn('Tenor Sans gesture GIF unavailable.', error); }
    }

    if (sansReady) {
      console.info('Tenor Sans media ready:', {
        sans: [window.__hqSansV17.naturalWidth, window.__hqSansV17.naturalHeight],
        gaster: window.__hqGasterV17
          ? [window.__hqGasterV17.naturalWidth, window.__hqGasterV17.naturalHeight] : null,
        handUp: window.__hqHandUpV17
          ? [window.__hqHandUpV17.naturalWidth, window.__hqHandUpV17.naturalHeight] : null
      });
    }
    return sansReady;
  }

  async function prepareEmbeddedHQFallback() {
    const generated = await loadScript(`generated-hq-media-v17.js?v=${VERSION}`, true);
    if (!generated || !window.GENERATED_HQ_MEDIA_V17) {
      console.warn('Embedded HQ media is unavailable; built-in fallback media remains active.');
      return false;
    }
    const media = window.GENERATED_HQ_MEDIA_V17;
    try {
      window.__hqSansV17 = await preloadImage(media.sans?.data, 'embedded HQ Sans GIF');
      window.__hqGasterV17 = await preloadImage(media.gaster?.data, 'embedded HQ Gaster GIF');
      if (media.handUp?.data) {
        try { window.__hqHandUpV17 = await preloadImage(media.handUp.data, 'embedded HQ Sans gesture GIF'); }
        catch (error) { console.warn('Embedded HQ gesture GIF unavailable.', error); }
      }
      return true;
    } catch (error) {
      console.warn('Embedded HQ media fallback failed.', error);
      return false;
    }
  }

  function installFinalRendererWrapper() {
    let wrappedTransformer = null;
    Object.defineProperty(window, 'applySansFidelityV12', {
      configurable: true,
      enumerable: true,
      get() { return wrappedTransformer; },
      set(baseTransformer) {
        if (typeof baseTransformer !== 'function') {
          wrappedTransformer = baseTransformer;
          return;
        }
        wrappedTransformer = source => {
          let result = baseTransformer(source);
          if (typeof window.applyEmbeddedHQSansRenderV17 === 'function') {
            result = window.applyEmbeddedHQSansRenderV17(result);
            console.info('HQ Sans/Gaster renderer applied.');
          }
          if (typeof window.applySansReferencePolishV18 === 'function') {
            result = window.applySansReferencePolishV18(result);
            console.info('Sans reference polish v18 applied.');
          }
          return result;
        };
      }
    });
  }

  async function start() {
    try {
      console.info('UNDERTALE loader starting:', VERSION);
      await prepareFallbackMedia();
      const tenorReady = await prepareTenorMedia();
      if (!tenorReady) await prepareEmbeddedHQFallback();
      await loadScript(`embedded-hq-sans-render-v17.js?v=${VERSION}`);
      await loadScript(`sans-reference-polish-v18.js?v=${VERSION}`);

      await loadScript(`user-sans-video-addon.js?v=${VERSION}`);
      await loadScript(`user-battle-sync-v2.js?v=${VERSION}`);
      await loadScript(`user-undertale-sfx-final.js?v=${VERSION}`);
      await loadScript(`sans-final-hardening.js?v=${VERSION}`);
      await loadScript(`sans-gap-gif-balance-v6.js?v=${VERSION}`);
      await loadScript(`sans-final-orchestrator.js?v=${VERSION}`);

      installFinalRendererWrapper();
      await loadScript(`game-loader-v4.js?v=${VERSION}`);
      window.__UNDERTALE_OUTER_LOADER__ = VERSION;
      console.info('UNDERTALE loader completed:', VERSION);
    } catch (error) {
      console.error('Sans battle loader failed:', error);
      const hint = document.getElementById('start-hint');
      if (hint) {
        hint.textContent = '追加演出の読み込みに失敗しました：' + (error?.message || String(error));
        hint.classList.add('visible');
      }
    }
  }

  start();
})();
