(() => {
  'use strict';

  const VERSION = '20260810-sans-hardening4';

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
    // Load Base64 media before the patch chain. The previous build waited for
    // game-loader-v4 to load this file, so the first Sans frames often chose a
    // PNG fallback before the GIF had decoded.
    await loadScript(`user-media-data.js?v=${VERSION}`);
    if (window.USER_SANS_GIF_DATA) {
      window.__userSansGifPreloaded = await preloadImage(window.USER_SANS_GIF_DATA, 'Sans GIF');
      console.info('Sans embedded GIF ready:',
        window.__userSansGifPreloaded.naturalWidth,
        window.__userSansGifPreloaded.naturalHeight);
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
      // Install source transformers before v4 constructs/executes game.js.
      await loadScript(`user-sans-video-addon.js?v=${VERSION}`);
      await loadScript(`user-battle-sync-v2.js?v=${VERSION}`);
      await loadScript(`user-undertale-sfx-final.js?v=${VERSION}`);
      // This is deliberately the final transformer. It replaces the older
      // voice-fix layer and guarantees the reference state, embedded GIF and
      // all-passage checks survive every earlier compatibility patch.
      await loadScript(`sans-final-hardening.js?v=${VERSION}`);
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