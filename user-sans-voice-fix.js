(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const parenAt = source.indexOf('(', markerAt + marker.length);
    if (parenAt < 0) return null;
    let quote = null;
    let escape = false;
    let parenDepth = 0;
    let closeParen = -1;
    for (let i = parenAt; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '(') parenDepth++;
      else if (ch === ')') {
        parenDepth--;
        if (parenDepth === 0) { closeParen = i; break; }
      }
    }
    if (closeParen < 0) return null;
    const brace = source.indexOf('{', closeParen + 1);
    if (brace < 0) return null;
    let depth = 0;
    quote = null;
    escape = false;
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

  function applySansVoiceFix(source) {
    return replaceFunction(String(source || ''), 'speechBlip', `  function speechBlip() {
    const isSans = speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans';

    // Sans uses the small WAV already embedded in game.js as the guaranteed
    // local voice. It is intentionally handled before the AudioContext state
    // check, because HTMLAudio can play even when Web Audio is still resuming.
    if (isSans) {
      startAudio();
      if (sansSpeechPool.length) {
        const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];
        sample.pause();
        sample.currentTime = 0;
        sample.preservesPitch = false;
        sample.volume = .52;
        sample.playbackRate = .90 + (Math.floor(speechChars) % 5) * .022;
        const promise = sample.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {
            // Last-resort audible feedback if media playback is rejected.
            startAudio();
            if (audio && audio.state === 'running') beep(145, .045);
          });
        }
        window.setTimeout(() => {
          sample.pause();
          sample.currentTime = 0;
        }, 96);
      }

      // Also try the verified MyInstants Sans sample when available. Keep it
      // quieter than the local voice so a slow network can never make dialogue
      // disappear or suddenly become much louder.
      if (typeof playUserUndertaleSfx === 'function' && Math.floor(speechChars) % 3 === 0) {
        playUserUndertaleSfx('sansTalk', {
          volume: .16,
          rate: .96 + (Math.floor(speechChars) % 4) * .015,
          stopAfter: .09,
          preservesPitch: false
        });
      }
      return;
    }

    startAudio();
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475, sans: 152
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const frequency = base + (Math.floor(speechChars) % 3) * 13;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.detune.setValueAtTime((Math.floor(speechChars) % 5 - 2) * 7, audio.currentTime);
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .045);
  }`);
  }

  window.applySansVoiceFix = applySansVoiceFix;

  // Loaded before game-loader-v4. Once the normal polish function appears,
  // compose this as the final source transform so no earlier patch can silence
  // or replace the guaranteed local Sans voice.
  let wrappedTarget = null;
  const timer = window.setInterval(() => {
    const current = window.applyUserPolishHotfix;
    if (typeof current !== 'function' || current === wrappedTarget || current.__sansVoiceFixWrapped) return;
    const wrapped = source => applySansVoiceFix(current(source));
    wrapped.__sansVoiceFixWrapped = true;
    wrappedTarget = wrapped;
    window.applyUserPolishHotfix = wrapped;
    window.clearInterval(timer);
  }, 10);
})();