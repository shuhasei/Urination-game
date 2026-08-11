(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name + '(';
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const brace = source.indexOf('{', at + marker.length);
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
        if (depth === 0) return { start, brace, end: i + 1 };
      }
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function repairJudgmentHallRecursion(source) {
    let result = String(source || '');
    const badHeroPrefix = `  function drawOpeningHero(now) {\n    if (pendingStage === 10) {\n      drawJudgmentHallV19(now);\n      return;\n    }`;
    if (result.includes(badHeroPrefix)) {
      result = result.replace(badHeroPrefix, '  function drawOpeningHero(now) {');
    }

    const openingMarker = '  function drawOpening(now) {';
    const safeOpeningPrefix = `  function drawOpening(now) {\n    if (pendingStage === 10) {\n      drawJudgmentHallV19(now);\n      return;\n    }`;
    if (result.includes(openingMarker) && !result.includes(safeOpeningPrefix)) {
      result = result.replace(openingMarker, safeOpeningPrefix);
    }
    return result;
  }

  function patchSansEyeGif(source) {
    const oldLine = '    const sprite = gestureActive ? window.__hqHandUpV17 : window.__hqSansV17;';
    if (!source.includes(oldLine)) return source;
    const replacement = `    const specialEyeActive = stage === 10\n      && state === 'enemyTurn'\n      && attackPattern?.finalSpecial === true\n      && window.__hqSansEyeV22?.complete\n      && window.__hqSansEyeV22.naturalWidth;\n    const sprite = specialEyeActive\n      ? window.__hqSansEyeV22\n      : (gestureActive ? window.__hqHandUpV17 : window.__hqSansV17);`;
    return source.replace(oldLine, replacement);
  }

  const speechBlipV22 = `  function speechBlip() {
    startAudio();
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475, sans: 152
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const isSans = speakingEnemy?.visual === 'sans';

    if (isSans && window.__sansVoiceV22Data) {
      if (!Array.isArray(window.__sansVoicePoolV22)) {
        window.__sansVoicePoolV22 = Array.from({ length: 8 }, () => {
          const sample = new Audio(window.__sansVoiceV22Data);
          sample.preload = 'auto';
          sample.volume = .34;
          sample.preservesPitch = false;
          return sample;
        });
        window.__sansVoicePoolIndexV22 = 0;
      }
      const pool = window.__sansVoicePoolV22;
      const index = (window.__sansVoicePoolIndexV22++ || 0) % pool.length;
      const sample = pool[index];
      try {
        sample.pause();
        const offset = (Math.floor(speechChars) % 12) * .075;
        sample.currentTime = sample.readyState > 0 ? Math.min(offset, Math.max(0, (sample.duration || 1.7) - .12)) : 0;
        sample.playbackRate = .93 + (Math.floor(speechChars) % 3) * .025;
        sample.play().catch(() => {});
        window.setTimeout(() => {
          sample.pause();
        }, 82);
      } catch (_) {}
      return;
    }

    if (isSans) {
      const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];
      sample.pause();
      sample.currentTime = 0;
      sample.preservesPitch = false;
      sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;
      sample.play().catch(() => {});
      window.setTimeout(() => {
        sample.pause();
        sample.currentTime = 0;
      }, 74);
      return;
    }

    const frequencies = [base + (Math.floor(speechChars) % 3) * 13];
    frequencies.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = index % 2 ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      oscillator.detune.setValueAtTime((Math.floor(speechChars) % 5 - 2) * 7, audio.currentTime);
      gain.gain.setValueAtTime(.045, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + .045);
    });
  }`;

  window.applySansRecursionMediaFixV22 = source => {
    let result = repairJudgmentHallRecursion(source);
    result = patchSansEyeGif(result);
    result = replaceFunction(result, 'speechBlip', speechBlipV22);
    return result;
  };
})();
