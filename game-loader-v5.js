(() => {
  'use strict';

  const VERSION = '20260811-sans-fidelity-v11';

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
      window.__userSansGifPreloaded = await preloadImage(primarySansGif, 'Sans idle GIF');
      console.info('Sans idle GIF ready:',
        window.__userSansGifPreloaded.naturalWidth,
        window.__userSansGifPreloaded.naturalHeight);
    }
    if (window.USER_SANS_ACTION_V4) {
      try {
        window.__userSansActionGifV4 = await preloadImage(window.USER_SANS_ACTION_V4, 'Sans action GIF');
      } catch (error) {
        console.warn('Sans action GIF preload failed; idle Sans remains active.', error);
      }
    }
    if (window.USER_GASTER_GIF_DATA) {
      try {
        window.__userGasterGifPreloaded = await preloadImage(window.USER_GASTER_GIF_DATA, 'Gaster GIF');
      } catch (error) {
        console.warn('Gaster embedded GIF preload failed; frame sprites remain available.', error);
      }
    }
  }

  (async () => {
    try {
      await prepareEmbeddedMedia();
      await loadScript(`user-sans-video-addon.js?v=${VERSION}`);
      await loadScript(`user-battle-sync-v2.js?v=${VERSION}`);
      await loadScript(`user-undertale-sfx-final.js?v=${VERSION}`);
      await loadScript(`sans-final-hardening.js?v=${VERSION}`);
      await loadScript(`sans-gap-gif-balance-v6.js?v=${VERSION}`);
      await loadScript(`sans-final-orchestrator.js?v=${VERSION}`);
      // Install the guard before game-loader-v4 dynamically loads sans-fidelity-v9.js.
      await loadScript(`sans-fidelity-v11-regex-fix.js?v=${VERSION}`);
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