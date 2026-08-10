(() => {
  'use strict';

  const VERSION = '20260811-tenor-hd-v16';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(src + ' could not be loaded'));
      document.head.appendChild(script);
    });
  }

  function preloadImage(src, label, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error(label + ' data is empty'));
      const image = new Image();
      let settled = false;
      const finish = (ok, value) => {
        if (settled) return;
        settled = true;
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

  async function prepareEmbeddedMedia() {
    await loadScript(`user-media-data.js?v=${VERSION}`);
    await loadScript(`user-sans-gifs-v4.js?v=${VERSION}`);

    const primarySansGif = window.USER_SANS_IDLE_V4
      || window.USER_SANS_GIF_DATA
      || window.USER_SANS_ACTION_V4;
    if (primarySansGif) {
      try {
        window.__userSansGifPreloaded = await preloadImage(primarySansGif, 'embedded Sans GIF');
      } catch (error) {
        console.warn('Embedded Sans GIF fallback unavailable.', error);
      }
    }
    if (window.USER_GASTER_GIF_DATA) {
      try {
        window.__userGasterGifPreloaded = await preloadImage(window.USER_GASTER_GIF_DATA, 'embedded Gaster GIF');
      } catch (error) {
        console.warn('Embedded Gaster GIF fallback unavailable.', error);
      }
    }
  }

  async function prepareTenorMedia() {
    await loadScript(`tenor-sans-media-v16.js?v=${VERSION}`);
    const media = window.TENOR_SANS_MEDIA_V16;
    if (!media) throw new Error('Tenor media manifest is unavailable');

    const jobs = [
      ['__tenorSansBattleV16', media.battle, 'Tenor Sans battle GIF'],
      ['__tenorSansHandUpV16', media.handUp, 'Tenor Sans hand-up GIF'],
      ['__tenorGasterV16', media.gaster, 'Tenor Gaster Blaster GIF'],
      ['__tenorFightReferenceV16', media.fightReference, 'Tenor Sans fight reference GIF']
    ];

    for (const [key, item, label] of jobs) {
      try {
        const image = await preloadImage(item.url, label, 9000);
        window[key] = image;
        console.info(label + ' ready:', image.naturalWidth, image.naturalHeight);
      } catch (error) {
        console.warn(label + ' unavailable; fallback will be used.', error);
      }
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
          let rendered = baseTransformer(source);
          if (typeof window.applySansRasterRenderV13 === 'function') {
            rendered = window.applySansRasterRenderV13(rendered);
          }
          if (typeof window.applyTenorSansRenderV16 === 'function') {
            rendered = window.applyTenorSansRenderV16(rendered);
            console.info('HD Tenor Sans/Gaster renderer applied.');
          }
          return rendered;
        };
      }
    });
  }

  async function start() {
    try {
      console.info('UNDERTALE loader starting:', VERSION);
      await prepareEmbeddedMedia();
      await prepareTenorMedia();

      await loadScript(`sans-raster-frames-v13.js?v=${VERSION}`);
      await loadScript(`sans-raster-render-v13.js?v=${VERSION}`);
      await loadScript(`tenor-sans-render-v16.js?v=${VERSION}`);

      const sansCount = window.SANS_RASTER_V13?.frames?.length || 0;
      const gasterCount = window.GASTER_RASTER_V13?.frames?.length || 0;
      console.info(`Fallback animation frames: Sans=${sansCount}, Gaster=${gasterCount}`);

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
