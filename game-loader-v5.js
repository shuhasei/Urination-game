(() => {
  'use strict';

  const VERSION = '20260810-sans-voice-fix1';
  const scripts = [
    `user-sans-video-addon.js?v=${VERSION}`,
    `user-battle-sync-v2.js?v=${VERSION}`,
    `user-undertale-sfx-final.js?v=${VERSION}`,
    `user-sans-voice-fix.js?v=${VERSION}`,
    `game-loader-v4.js?v=${VERSION}`
  ];

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

  (async () => {
    try {
      for (const src of scripts) await loadScript(src);
    } catch (error) {
      console.error('Sans battle sync loader failed:', error);
      const hint = document.getElementById('start-hint');
      if (hint) {
        hint.textContent = '追加演出の読み込みに失敗しました：' + (error?.message || String(error));
        hint.classList.add('visible');
      }
    }
  })();
})();