(() => {
  'use strict';

  const VERSION = '20260811-sans-raster-v15';

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

  function preloadImage(src, label) {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error(label + ' data is empty'));
        return;
      }
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth && image.naturalHeight) resolve(image);
        else reject(new Error(label + ' decoded with zero size'));
      };
      image.onerror = () => reject(new Error(label + ' could not be decoded'));
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
        window.__userSansGifPreloaded = await preloadImage(primarySansGif, 'Sans idle GIF');
        console.info('Sans source GIF ready:',
          window.__userSansGifPreloaded.naturalWidth,
          window.__userSansGifPreloaded.naturalHeight);
      } catch (error) {
        console.warn('Sans source GIF preload failed; embedded frames will be used.', error);
      }
    }

    if (window.USER_SANS_ACTION_V4) {
      try {
        window.__userSansActionGifV4 = await preloadImage(window.USER_SANS_ACTION_V4, 'Sans action GIF');
      } catch (error) {
        console.warn('Sans action GIF preload failed.', error);
      }
    }

    if (window.USER_GASTER_GIF_DATA) {
      try {
        window.__userGasterGifPreloaded = await preloadImage(window.USER_GASTER_GIF_DATA, 'Gaster GIF');
        console.info('Gaster source GIF ready:',
          window.__userGasterGifPreloaded.naturalWidth,
          window.__userGasterGifPreloaded.naturalHeight);
      } catch (error) {
        console.warn('Gaster source GIF preload failed; embedded frames will be used.', error);
      }
    }
  }

  function installRasterRendererWrapper() {
    let wrappedTransformer = null;

    try {
      Object.defineProperty(window, 'applySansFidelityV12', {
        configurable: true,
        enumerable: true,
        get() {
          return wrappedTransformer;
        },
        set(baseTransformer) {
          if (typeof baseTransformer !== 'function') {
            wrappedTransformer = baseTransformer;
            return;
          }
          wrappedTransformer = source => {
            const base = baseTransformer(source);
            if (typeof window.applySansRasterRenderV13 !== 'function') return base;
            const rendered = window.applySansRasterRenderV13(base);
            console.info('Sans/Gaster deterministic frame renderer applied.');
            return rendered;
          };
        }
      });
    } catch (error) {
      console.warn('Could not install Sans transformer wrapper; continuing without wrapper.', error);
    }
  }

  async function prepareRasterFrames() {
    await loadScript(`sans-raster-frames-v13.js?v=${VERSION}`);
    await loadScript(`sans-raster-render-v13.js?v=${VERSION}`);

    const sansCount = window.SANS_RASTER_V13?.frames?.length || 0;
    const gasterCount = window.GASTER_RASTER_V13?.frames?.length || 0;

    if (sansCount < 2 && !window.__userSansGifPreloaded) {
      throw new Error('Sans animation data is unavailable');
    }
    if (gasterCount < 2 && !window.__userGasterGifPreloaded) {
      throw new Error('Gaster animation data is unavailable');
    }

    console.info(`Animation frames ready: Sans=${sansCount}, Gaster=${gasterCount}`);
  }

  async function start() {
    try {
      console.info('UNDERTALE loader starting:', VERSION);
      await prepareEmbeddedMedia();
      await prepareRasterFrames();

      await loadScript(`user-sans-video-addon.js?v=${VERSION}`);
      await loadScript(`user-battle-sync-v2.js?v=${VERSION}`);
      await loadScript(`user-undertale-sfx-final.js?v=${VERSION}`);
      await loadScript(`sans-final-hardening.js?v=${VERSION}`);
      await loadScript(`sans-gap-gif-balance-v6.js?v=${VERSION}`);
      await loadScript(`sans-final-orchestrator.js?v=${VERSION}`);

      installRasterRendererWrapper();
      await loadScript(`game-loader-v4.js?v=${VERSION}`);
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

  window.__UNDERTALE_OUTER_LOADER__ = VERSION;
  start();
})();
