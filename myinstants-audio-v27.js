(() => {
  'use strict';

  const VERSION = '20260813-myinstants-v27';
  const BASE = 'assets/myinstants-v27/';

  async function text(path) {
    const response = await fetch(BASE + path + '?v=' + VERSION, { cache: 'no-store' });
    if (!response.ok) throw new Error(path + ': HTTP ' + response.status);
    return (await response.text()).trim();
  }

  async function sha256Base64(base64) {
    if (!window.crypto?.subtle) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest),
      value => value.toString(16).padStart(2, '0')).join('');
  }

  window.__myinstantsV27Ready = (async () => {
    const manifest = JSON.parse(await text('audio.json'));
    const registry = {};
    for (const [name, spec] of Object.entries(manifest.sounds || {})) {
      const chunks = await Promise.all((spec.chunks || []).map(text));
      const base64 = chunks.join('');
      const hash = await sha256Base64(base64);
      if (hash && hash !== spec.sha256) {
        throw new Error(name + ': SHA-256 mismatch');
      }
      registry[name] = Object.freeze({
        page: spec.page,
        mp3: 'data:' + (spec.mime || 'audio/mpeg') + ';base64,' + base64,
        sha256: spec.sha256
      });
    }
    window.USER_UNDERTALE_SFX = Object.freeze(registry);
    window.USER_SANS_VOICE_URL = registry.sansTalk?.mp3 || '';
    window.USER_GASTER_SOUND_URL = registry.gaster?.mp3 || '';
    console.info('Verified local Myinstants SFX ready:', Object.keys(registry));
    return registry;
  })().catch(error => {
    console.error('Myinstants v27 audio preparation failed:', error);
    return null;
  });
})();

