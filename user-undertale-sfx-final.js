(() => {
  'use strict';

  // MyInstants Undertale SFX verified one-by-one from each sound page's
  // "Download MP3" target. We keep the source-page URL next to the MP3 URL
  // so every sound used by the Sans battle is traceable.
  const UNDERTALE_SFX = Object.freeze({
    sansTalk: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-sans-talking-84135/',
      mp3: 'https://www.myinstants.com/media/sounds/just-sans-talking.mp3'
    }),
    gaster: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-gaster-blaster/',
      mp3: 'https://www.myinstants.com/media/sounds/gaster_blaster_sound_effect_1.mp3'
    }),
    bone: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/bone-undertale-sound-effect-48282/',
      mp3: 'https://www.myinstants.com/media/sounds/bone-undertale-sound-effect.mp3'
    }),
    impact: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-impact-slam-48844/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-impact-slam.mp3'
    }),
    damage: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-damage-taken/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-damage-taken.mp3'
    }),
    move: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-move-selection-sound-effect-42223/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-move-selection-sound-effect.mp3'
    }),
    select: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-select-sound-42576/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-select-sound.mp3'
    }),
    strike: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-strike-sound/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-sound-effect-attack-hit.mp3'
    }),
    heal: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-heal-76518/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-heal.mp3'
    }),
    soulShatter: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-soul-shatter/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-soul-shatter.mp3'
    }),
    battleStart: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-battle-start-97295/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-battle-start.mp3'
    }),
    encounter: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/enemy-encounter-undertale-27206/',
      mp3: 'https://www.myinstants.com/media/sounds/enemy-encounter-undertale.mp3'
    })
  });

  // Prefer the verified local v27 registry when it is ready; retain the
  // traceable Myinstants URLs only as a network fallback.
  window.USER_UNDERTALE_SFX = Object.freeze({
    ...UNDERTALE_SFX,
    ...(window.USER_UNDERTALE_SFX || {})
  });
  window.USER_SANS_VOICE_URL = window.USER_UNDERTALE_SFX.sansTalk.mp3;
  window.USER_GASTER_SOUND_URL = window.USER_UNDERTALE_SFX.gaster.mp3;

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const parenAt = source.indexOf('(', markerAt + marker.length);
    if (parenAt < 0) return null;
    let parenDepth = 0;
    let quote = null;
    let escape = false;
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

  function patchFunctionBody(source, name, transform) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    const next = transform(body);
    if (next === body) return source;
    return source.slice(0, bounds.start) + next + source.slice(bounds.end);
  }

  function injectFunctionStart(source, name, snippet, sentinel) {
    if (source.includes(sentinel)) return source;
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.brace + 1) + '\n' + snippet + source.slice(bounds.brace + 1);
  }

  function injectSfxCore(source) {
    if (source.includes('function playUserUndertaleSfx(')) return source;
    const marker = '  function playBoneEmergeSound() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const userUndertaleSfxSpec = window.USER_UNDERTALE_SFX || {};
  const userUndertaleSfxPools = new Map();
  const userUndertaleSfxIndices = new Map();

  function userUndertaleSfxPool(name) {
    if (userUndertaleSfxPools.has(name)) return userUndertaleSfxPools.get(name);
    const spec = userUndertaleSfxSpec[name];
    if (!spec || !spec.mp3) return [];
    const pool = Array.from({ length: name === 'sansTalk' ? 5 : 3 }, () => {
      const sample = new Audio(spec.mp3);
      sample.preload = 'auto';
      return sample;
    });
    userUndertaleSfxPools.set(name, pool);
    return pool;
  }

  function playUserUndertaleSfx(name, options = {}) {
    const pool = userUndertaleSfxPool(name);
    if (!pool.length) return false;
    const index = userUndertaleSfxIndices.get(name) || 0;
    userUndertaleSfxIndices.set(name, index + 1);
    const sample = pool[index % pool.length];
    try {
      sample.pause();
      sample.currentTime = Math.max(0, options.offset || 0);
      sample.preservesPitch = options.preservesPitch !== false;
      sample.volume = Math.max(0, Math.min(1, options.volume ?? .28));
      sample.playbackRate = Math.max(.5, Math.min(2, options.rate || 1));
      const promise = sample.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      if (options.stopAfter > 0) {
        window.setTimeout(() => {
          sample.pause();
          sample.currentTime = 0;
        }, options.stopAfter * 1000);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchFinalSpecialSans(source) {
    let s = source;
    // The supplied final-special reference is the normal pocket pose with a
    // cyan/green glowing eye. Keep Sans in that pose rather than swapping to
    // directional hand sprites while the special attack is active.
    s = s.split(`      : finalSpecial && providedSansEyeImage.complete ? providedSansEyeImage\n        : animatedIdleReady ? sansIdleGifImage`)
      .join(`      : finalSpecial && sansReferenceImage.complete && sansReferenceImage.naturalWidth ? sansReferenceImage\n        : animatedIdleReady ? sansIdleGifImage`);
    s = s.split('    const canGesture = !resting && !finalDodge && !wounded;')
      .join('    const canGesture = !resting && !finalDodge && !wounded && !finalSpecial;');

    const oldEye = `    // The final-special eye remains visible over every directional pose.\n    if (finalSpecial) {\n      const glow = Math.floor(t / 110) % 2 ? '#45ecff' : '#75ff91';\n      const eyeX = horizontalPose\n        ? footX + (gestureFlip ? -6 : 6)\n        : footX + 5;\n      const eyeY = footY - 39 + moveY;\n      rect(eyeX, eyeY, 2, 2, glow);\n      rect(eyeX + 1, eyeY, 1, 1, '#fff');\n    }`;
    const newEye = `    // Final-special Sans: match the supplied reference — hands in pockets,\n    // one eye filled with a compact cyan/green glow.\n    if (finalSpecial) {\n      const eyeX = Math.round(footX + 5);\n      const eyeY = Math.round(footY - 39);\n      const pulse = Math.floor(t / 150) % 2;\n      rect(eyeX - 2, eyeY - 2, 6, 5, '#000');\n      rect(eyeX - 1, eyeY - 1, 4, 3, pulse ? '#48efff' : '#58dfff');\n      rect(eyeX, eyeY - 1, 3, 3, pulse ? '#72ff83' : '#55ef80');\n      rect(eyeX + 1, eyeY, 1, 1, '#fff');\n    }`;
    if (s.includes(oldEye)) s = s.replace(oldEye, newEye);
    return s;
  }

  function patchSansTalking(source) {
    return injectFunctionStart(source, 'speechBlip', `    // userUndertaleSansTalkingSfxV1\n    if (stage === 10 && speakingEnemy?.type === 'sans') {\n      const rate = .94 + (Math.floor(speechChars) % 5) * .018;\n      if (playUserUndertaleSfx('sansTalk', { volume: .33, rate, stopAfter: .085, preservesPitch: false })) return;\n    }`, 'userUndertaleSansTalkingSfxV1');
  }

  function patchBoneSound(source) {
    return replaceFunction(source, 'playBoneEmergeSound', `  function playBoneEmergeSound() {
    const external = stage === 10 && playUserUndertaleSfx('bone', { volume: .22, rate: 1.0, stopAfter: .18 });
    if (!external) playSweepSound('square', 150, 62, .11, .032);
  }`);
  }

  function patchDamageSound(source) {
    return patchFunctionBody(source, 'applySansDamage', body => body.split('      beep(110, .055);')
      .join("      if (!playUserUndertaleSfx('damage', { volume: .30, stopAfter: .22 })) beep(110, .055);"));
  }

  function patchDefeatSound(source) {
    return replaceFunction(source, 'playDefeatSound', `  function playDefeatSound() {
    if (playUserUndertaleSfx('soulShatter', { volume: .43, rate: 1 })) return;
    beep(246, .12);
    setTimeout(() => { if (state === 'soulBreak') beep(174, .16); }, 220);
    setTimeout(() => { if (state === 'soulBreak') beep(92, .28); }, 520);
  }`);
  }

  function patchFightSound(source) {
    let s = injectFunctionStart(source, 'resolveAttack', `    // userUndertaleStrikeSfxV1\n    if (stage === 10) playUserUndertaleSfx('strike', { volume: .38, rate: 1 });`, 'userUndertaleStrikeSfxV1');
    s = patchFunctionBody(s, 'commandAction', body => {
      let next = body;
      if (!next.includes('userUndertaleSelectSfxV1')) {
        const brace = next.indexOf('{');
        if (brace >= 0) next = next.slice(0, brace + 1)
          + "\n    // userUndertaleSelectSfxV1\n    if (stage === 10) playUserUndertaleSfx('select', { volume: .22, stopAfter: .18 });"
          + next.slice(brace + 1);
      }
      next = next.split('        if (stage === 10) karmaHp = Math.max(0, karmaHp - healed);')
        .join("        if (stage === 10) {\n          karmaHp = Math.max(0, karmaHp - healed);\n          playUserUndertaleSfx('heal', { volume: .28, rate: 1 });\n        }");
      return next;
    });
    return s;
  }

  function patchMenuMoveSound(source) {
    return patchFunctionBody(source, 'handlePressed', body => {
      if (body.includes('userUndertaleMoveSfxV1')) return body;
      return body.split('beep();').join("stage === 10 ? playUserUndertaleSfx('move', { volume: .18, stopAfter: .12 }) : beep();")
        .replace('{\n    if (pressed.has', '{\n    // userUndertaleMoveSfxV1\n    if (pressed.has');
    });
  }

  function patchImpactSound(source) {
    if (source.includes('userUndertaleImpactSfxV1')) return source;
    const needle = '    heart.slamActive = true;';
    const at = source.indexOf(needle);
    if (at < 0) return source;
    const replacement = `${needle}\n    // userUndertaleImpactSfxV1\n    if (stage === 10) playUserUndertaleSfx('impact', { volume: .29, stopAfter: .26 });`;
    return source.slice(0, at) + replacement + source.slice(at + needle.length);
  }

  function patchBattleStartSound(source) {
    return injectFunctionStart(source, 'beginEnemyTurn', `    // userUndertaleBattleStartSfxV1\n    if (stage === 10 && sansTurn === 0) {\n      playUserUndertaleSfx('battleStart', { volume: .28, stopAfter: .45 });\n    }`, 'userUndertaleBattleStartSfxV1');
  }

  function patchGasterRegistry(source) {
    // The synchronized Gaster patch already controls charge/fire timing. Point
    // its pool at the verified registry URL, preserving that timing logic.
    return source.split("const GASTER_URL = 'https://www.myinstants.com/media/sounds/gaster_blaster_sound_effect_1.mp3';")
      .join("const GASTER_URL = (window.USER_UNDERTALE_SFX?.gaster?.mp3 || 'https://www.myinstants.com/media/sounds/gaster_blaster_sound_effect_1.mp3');");
  }

  function applyUndertaleSfxFinal(source) {
    let s = String(source || '');
    s = injectSfxCore(s);
    s = patchFinalSpecialSans(s);
    s = patchSansTalking(s);
    s = patchBoneSound(s);
    s = patchDamageSound(s);
    s = patchDefeatSound(s);
    s = patchFightSound(s);
    s = patchMenuMoveSound(s);
    s = patchImpactSound(s);
    s = patchBattleStartSound(s);
    s = patchGasterRegistry(s);
    return s;
  }

  window.applyUndertaleSfxFinal = applyUndertaleSfxFinal;

  // game-loader-v5 loads this before game-loader-v4. Wrap the final source
  // patcher once it becomes available; preserve all earlier Sans/video/fairness
  // wrappers by composing around whatever function is current at that moment.
  let wrappedTarget = null;
  const timer = window.setInterval(() => {
    const current = window.applyUserPolishHotfix;
    if (typeof current !== 'function' || current === wrappedTarget || current.__undertaleSfxFinalWrapped) return;
    const wrapped = source => applyUndertaleSfxFinal(current(source));
    wrapped.__undertaleSfxFinalWrapped = true;
    wrappedTarget = wrapped;
    window.applyUserPolishHotfix = wrapped;
    window.clearInterval(timer);
  }, 10);
})();