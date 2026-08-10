(() => {
  'use strict';

  const VERSION = '20260811-sans-raster-v14';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(src + ' could not be loaded'));
      document.head.appendChild(script);
    });
  }

  function preloadImage(src, label) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error(label + ' data is empty'));
      const image = new Image();
      image.onload = () => image.naturalWidth && image.naturalHeight
        ? resolve(image)
        : reject(new Error(label + ' decoded with zero size'));
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
        console.warn('Sans source GIF preload failed; embedded raster frames will be used.', error);
      }
    }

    if (window.USER_SANS_ACTION_V4) {
      try {
        window.__userSansActionGifV4 = await preloadImage(window.USER_SANS_ACTION_V4, 'Sans action GIF');
      } catch (error) {
        console.warn('Sans action GIF preload failed; normal animation remains available.', error);
      }
    }

    if (window.USER_GASTER_GIF_DATA) {
      try {
        window.__userGasterGifPreloaded = await preloadImage(window.USER_GASTER_GIF_DATA, 'Gaster GIF');
        console.info('Gaster source GIF ready:',
          window.__userGasterGifPreloaded.naturalWidth,
          window.__userGasterGifPreloaded.naturalHeight);
      } catch (error) {
        console.warn('Gaster source GIF preload failed; embedded raster frames will be used.', error);
      }
    }
  }

  function installRasterRendererWrapper() {
    let wrapped = null;
    Object.defineProperty(window, 'applySansFidelityV12', {
      configurable: true,
      enumerable: true,
      get() {
        return wrapped;
      },
      set(baseTransformer) {
        if (typeof baseTransformer !== 'function') {
          wrapped = baseTransformer;
          return;
        }
        wrapped = source => {
          const base = baseTransformer(source);
          if (typeof window.applySansRasterRenderV13 !== 'function') return base;
          const rendered = window.applySansRasterRenderV13(base);
          console.info('Sans/Gaster embedded GIF-frame renderer applied.');
          return rendered;
        };
      }
    });
  }

  (async () => {
    try {
      await prepareEmbeddedMedia();

      await loadScript(`sans-raster-frames-v13.js?v=${VERSION}`);
      await loadScript(`sans-raster-render-v13.js?v=${VERSION}`);

      const sansFrameCount = window.SANS_RASTER_V13?.frames?.length || 0;
      const gasterFrameCount = window.GASTER_RASTER_V13?.frames?.length || 0;
      if (sansFrameCount < 2 && !window.__userSansGifPreloaded) {
        throw new Error('Sans animation data is unavailable');
      }
      if (gasterFrameCount < 2 && !window.__userGasterGifPreloaded) {
        throw new Error('Gaster animation data is unavailable');
      }
      console.info(`Animation frames ready: Sans=${sansFrameCount}, Gaster=${gasterFrameCount}`);

      await loadScript(`user-sans-video-addon.js?v=${VERSION}`);
      await loadScript(`user-battle-sync-v2.js?v=${VERSION}`);
      await loadScript(`user-undertale-sfx-final.js?v=${VERSION}`);
      await loadScript(`sans-final-hardening.js?v=${VERSION}`);
      await loadScript(`sans-gap-gif-balance-v6.js?v=${VERSION}`);
      await loadScript(`sans-final-orchestrator.js?v=${VERSION}`);

      installRasterRendererWrapper();
      await loadScript(`game-loader-v4.js?v=${VERSION}`);
    } catch (error) {
      console.error('Sans battle hardening loader failed:', error);
      const hint = document.getElementById('start-hint');
      if (hint) {
        hint.textContent = '追加演出の読み込みに失敗しました：' + (error?.message || String(error));
        hint.classList.add('visible');
      }
    }
  })();
})();