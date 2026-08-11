(() => {
  'use strict';

  const VERSION = '20260811-user-sans-v21';

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
  }

  async function prepareUploadedSansMedia() {
    const loaded = await loadScript(`uploaded-sans-gifs-v21.js?v=${VERSION}`, true);
    const media = loaded ? window.UPLOADED_SANS_GIFS_V21 : null;
    if (!media?.idle || !media?.gesture) return false;
    try {
      window.__hqSansV17 = await preloadImage(media.idle, 'uploaded Sans idle GIF');
      window.__hqHandUpV17 = await preloadImage(media.gesture, 'uploaded Sans gesture GIF');
      // Never feed a full rectangular external GIF into the Gaster head renderer.
      window.__hqGasterV17 = null;
      window.__userGasterGifPreloaded = null;
      console.info('User supplied Sans GIFs ready:', {
        idle: [window.__hqSansV17.naturalWidth, window.__hqSansV17.naturalHeight],
        gesture: [window.__hqHandUpV17.naturalWidth, window.__hqHandUpV17.naturalHeight]
      });
      return true;
    } catch (error) {
      console.warn('User supplied Sans GIFs could not be prepared.', error);
      return false;
    }
  }

  async function prepareEmbeddedHQFallback() {
    const generated = await loadScript(`generated-hq-media-v17.js?v=${VERSION}`, true);
    if (!generated || !window.GENERATED_HQ_MEDIA_V17) {
      console.warn('Embedded HQ Sans fallback is unavailable; built-in Sans media remains active.');
      return false;
    }
    const media = window.GENERATED_HQ_MEDIA_V17;
    try {
      window.__hqSansV17 = await preloadImage(media.sans?.data, 'embedded HQ Sans GIF');
      if (media.handUp?.data) {
        try { window.__hqHandUpV17 = await preloadImage(media.handUp.data, 'embedded HQ Sans gesture GIF'); }
        catch (error) { console.warn('Embedded HQ gesture GIF unavailable.', error); }
      }
      // Gaster deliberately remains native/frame-based.
      window.__hqGasterV17 = null;
      window.__userGasterGifPreloaded = null;
      return true;
    } catch (error) {
      console.warn('Embedded HQ Sans fallback failed.', error);
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
            console.info('Uploaded Sans renderer applied.');
          }
          if (typeof window.applySansReferencePolishV18 === 'function') {
            result = window.applySansReferencePolishV18(result);
            console.info('Sans reference polish v18 applied.');
          }
          if (typeof window.applySansVideoFaithfulV19 === 'function') {
            result = window.applySansVideoFaithfulV19(result);
            console.info('Sans video-faithful v19 applied.');
          }
          if (typeof window.applySansLoginGasterFixV21 === 'function') {
            result = window.applySansLoginGasterFixV21(result);
            console.info('Sans login/Gaster fix v21 applied.');
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
      const uploadedReady = await prepareUploadedSansMedia();
      if (!uploadedReady) await prepareEmbeddedHQFallback();

      await loadScript(`embedded-hq-sans-render-v17.js?v=${VERSION}`);
      await loadScript(`sans-reference-polish-v18.js?v=${VERSION}`);
      await loadScript(`sans-video-faithful-v19.js?v=${VERSION}`);
      await loadScript(`sans-login-gaster-fix-v21.js?v=${VERSION}`);

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
