(() => {
  'use strict';

  const VERSION = '20260813-sans-complete-fidelity-v27';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const paren = source.indexOf('(', at + marker.length);
    if (paren < 0) return null;
    const brace = source.indexOf('{', paren);
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
      if (ch === '"' || ch === "'" || ch.charCodeAt(0) === 96) {
        quote = ch;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, brace, end: i + 1 };
    }
    return null;
  }

  function injectFunctionStart(source, name, code, sentinel) {
    if (source.includes(sentinel)) return source;
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.brace + 1) + '\n' + code
      + source.slice(bounds.brace + 1);
  }

  function patchReferenceAudio(source) {
    let result = source;
    result = injectFunctionStart(result, 'speechBlip', [
      '    // sansCompleteMyinstantsTalkV27',
      "    if (stage === 10 && (speakingEnemy?.type === 'sans' || speakingEnemy?.visual === 'sans')) {",
      '      const rate = .96 + (Math.floor(speechChars) % 4) * .015;',
      "      if (playUserUndertaleSfx('sansTalk', { volume: .31, rate, stopAfter: .09, preservesPitch: false })) return;",
      '    }'
    ].join('\n'), 'sansCompleteMyinstantsTalkV27');

    result = injectFunctionStart(result, 'playBlasterChargeSound', [
      '    // sansCompleteMyinstantsBlasterV27',
      "    if (stage === 10 && playUserUndertaleSfx('gaster', { volume: .30, rate: 1, stopAfter: .82 })) return;"
    ].join('\n'), 'sansCompleteMyinstantsBlasterV27');
    return result;
  }

  function patchSlamCue(source) {
    const bounds = functionBounds(source, 'slamSoul');
    if (!bounds) return source;
    let body = source.slice(bounds.start, bounds.end);
    if (!body.includes('sansCompleteSlamSfxV27')) {
      body = body.replace(
        '    heart.slamActive = true;',
        "    heart.slamActive = true;\n    // sansCompleteSlamSfxV27\n    if (stage === 10) playUserUndertaleSfx('impact', { volume: .29, stopAfter: .26 });"
      );
    }
    // Visual hand cue and soul impulse must never disagree.
    body = body.replace('    sansGestureDirection = gestureDirection;',
      '    sansGestureDirection = direction;');
    return source.slice(0, bounds.start) + body + source.slice(bounds.end);
  }

  function patchVideoSequence(source) {
    let result = source.replace(
      /const SANS_ATTACK_SEQUENCE = Object\.freeze\(\[[^\]]*\]\);/,
      'const SANS_ATTACK_SEQUENCE = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);'
    );
    result = result.replace('TEST_PLAY_INVINCIBLE = true;',
      'TEST_PLAY_INVINCIBLE = false;');
    return result;
  }

  function patchCrispBattlePresentation(source) {
    let result = source;
    result = result.replace(
      "ctx.drawImage(view, 0, 0, canvas.width, canvas.height);",
      "ctx.imageSmoothingEnabled = false;\n    ctx.drawImage(view, 0, 0, canvas.width, canvas.height);"
    );
    return result;
  }

  window.applySansCompleteFidelityV27 = source => {
    let result = String(source || '');
    result = patchReferenceAudio(result);
    result = patchSlamCue(result);
    result = patchVideoSequence(result);
    result = patchCrispBattlePresentation(result);
    return result;
  };

  console.info('Sans complete fidelity v27 ready:', VERSION);
})();

