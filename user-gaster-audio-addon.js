(() => {
  'use strict';

  const GASTER_URL = 'https://www.myinstants.com/media/sounds/gaster_blaster_sound_effect_1.mp3';
  window.USER_GASTER_SOUND_URL = window.USER_GASTER_SOUND_URL || GASTER_URL;

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const brace = source.indexOf('{', markerAt + marker.length);
    if (brace < 0) return null;
    let depth = 0;
    let quote = null;
    let escape = false;
    for (let i = brace; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return { start, end: i + 1 };
      }
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function injectAudioPool(source) {
    if (source.includes('const userGasterBlastPool =')) return source;
    const marker = '  function playBlasterFireSound() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const userGasterBlastPool = Array.from({ length: 4 }, () => {
    const sample = new Audio(window.USER_GASTER_SOUND_URL || '${GASTER_URL}');
    sample.preload = 'auto';
    sample.volume = .42;
    return sample;
  });
  let userGasterBlastIndex = 0;
  function playUserGasterBlastSound() {
    if (!userGasterBlastPool.length) return false;
    const sample = userGasterBlastPool[userGasterBlastIndex++ % userGasterBlastPool.length];
    try {
      sample.pause();
      sample.currentTime = 0;
      sample.volume = .42;
      sample.playbackRate = .98 + (userGasterBlastIndex % 3) * .012;
      const result = sample.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
      return true;
    } catch (_) {
      return false;
    }
  }

`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchGasterAudio(source) {
    let s = injectAudioPool(String(source || ''));
    s = replaceFunction(s, 'playBlasterFireSound', `  function playBlasterFireSound() {
    const externalPlayed = playUserGasterBlastSound();
    // Keep a quieter synthesized layer underneath, so firing is still audible
    // if the remote MP3 is temporarily unavailable.
    playNoiseBurst(.22, externalPlayed ? .018 : .055, 360);
    playSweepSound('sawtooth', 760, 62, .22, externalPlayed ? .018 : .050);
    window.setTimeout(() => playSweepSound('square', 250, 48, .17,
      externalPlayed ? .010 : .030), 18);
  }`);
    return s;
  }

  window.applyGasterAudioAddon = patchGasterAudio;

  let wrappedTarget = null;
  const timer = window.setInterval(() => {
    const current = window.applyUserPolishHotfix;
    if (typeof current !== 'function' || current === wrappedTarget || current.__gasterAudioWrapped) return;
    const wrapped = source => patchGasterAudio(current(source));
    wrapped.__gasterAudioWrapped = true;
    wrappedTarget = wrapped;
    window.applyUserPolishHotfix = wrapped;
    window.clearInterval(timer);
  }, 10);
})();