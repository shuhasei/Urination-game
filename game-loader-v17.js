(() => {
  'use strict';

  const VERSION = '20260811-embedded-hq-v17b';

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

  async function prepareRemoteHDFallback() {
    const manifestLoaded = await loadScript(`tenor-sans-media-v16.js?v=${VERSION}`, true);
    const media = manifestLoaded ? window.TENOR_SANS_MEDIA_V16 : null;
    if (!media) return false;
    try {
      window.__hqSansV17 = await preloadImage(media.battle?.url, 'temporary HD Sans GIF', 9000);
      window.__hqGasterV17 = await preloadImage(media.gaster?.url, 'temporary HD Gaster GIF', 9000);
      if (media.handUp?.url) {
        try { window.__hqHandUpV17 = await preloadImage(media.handUp.url, 'temporary HD Sans gesture GIF', 9000); }
        catch (error) { console.warn('Temporary HD gesture unavailable.', error); }
      }
      console.info('Temporary HD GIF fallback ready:', {
        sans: [window.__hqSansV17.naturalWidth, window.__hqSansV17.naturalHeight],
        gaster: [window.__hqGasterV17.naturalWidth, window.__hqGasterV17.naturalHeight]
      });
      return true;
    } catch (error) {
      console.warn('Temporary HD GIF fallback failed; embedded legacy media will be used.', error);
      return false;
    }
  }

  async function prepareHQMedia() {
    const generated = await loadScript(`generated-hq-media-v17.js?v=${VERSION}`, true);
    if (!generated || !window.GENERATED_HQ_MEDIA_V17) {
      console.warn('Embedded HQ media is not generated yet; using temporary HD fallback.');
      return prepareRemoteHDFallback();
    }
    const media = window.GENERATED_HQ_MEDIA_V17;
    window.__hqSansV17 = await preloadImage(media.sans?.data, 'embedded HQ Sans GIF');
    window.__hqGasterV17 = await preloadImage(media.gaster?.data, 'embedded HQ Gaster GIF');
    if (media.handUp?.data) {
      try { window.__hqHandUpV17 = await preloadImage(media.handUp.data, 'embedded HQ Sans gesture GIF'); }
      catch (error) { console.warn('HQ gesture GIF unavailable.', error); }
    }
    console.info('Embedded HQ GIFs ready:', {
      sans: [window.__hqSansV17.naturalWidth, window.__hqSansV17.naturalHeight, media.sans?.frames],
      gaster: [window.__hqGasterV17.naturalWidth, window.__hqGasterV17.naturalHeight, media.gaster?.frames],
      handUp: window.__hqHandUpV17 ? [window.__hqHandUpV17.naturalWidth, window.__hqHandUpV17.naturalHeight] : null
    });
    return true;
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
          return result;
        };
      }
    });
  }

  async function start() {
    try {
      console.info('UNDERTALE loader starting:', VERSION);
      await prepareFallbackMedia();
      await prepareHQMedia();
      await loadScript(`embedded-hq-sans-render-v17.js?v=${VERSION}`);

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
