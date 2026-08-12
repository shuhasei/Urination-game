(() => {
  'use strict';

  // MyInstants pages/MP3 targets verified from the user-specified Undertale search page.
  // Sans dialogue itself intentionally does NOT use the remote sansTalk sound: v23 uses
  // the user's uploaded MP3 bytes unchanged from the embedded local asset instead.
  window.USER_UNDERTALE_SFX = Object.freeze({
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
    slash: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/slash-undertale-81382/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-attack-slash-green-screen.mp3'
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
    }),
    gameOver: Object.freeze({
      page: 'https://www.myinstants.com/en/instant/undertale-game-over/',
      mp3: 'https://www.myinstants.com/media/sounds/undertale-game-over.mp3'
    })
  });
  window.USER_GASTER_SOUND_URL = window.USER_UNDERTALE_SFX.gaster.mp3;

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

  function patchFunctionBody(source, name, transform) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    const next = transform(body);
    if (next === body) return source;
    return source.slice(0, bounds.start) + next + source.slice(bounds.end);
  }

  function patchHallLengthAndSprite(source) {
    let s = String(source || '');
    s = s.replace('const JUDGMENT_HALL_WORLD_W_V19 = 720;', 'const JUDGMENT_HALL_WORLD_W_V19 = 790;');
    s = s.replace('const JUDGMENT_HALL_SANS_X_V19 = 568;', 'const JUDGMENT_HALL_SANS_X_V19 = 620;');
    s = s.replace('    const speed = 49;', '    const speed = 45;');

    const oldDraw = `    if (sansScreenX > -45 && sansScreenX < W + 45) {\n      drawSans(sansScreenX, 99, now);\n    }`;
    const newDraw = `    if (sansScreenX > -45 && sansScreenX < W + 45) {\n      const generatedSansV23 = judgmentHallPhaseV19 === 'walk'\n        ? window.__sansSideV23 : window.__sansFrontV23;\n      if (generatedSansV23?.complete && generatedSansV23.naturalWidth) {\n        const targetH = judgmentHallPhaseV19 === 'walk' ? 45 : 47;\n        const targetW = targetH * generatedSansV23.naturalWidth / generatedSansV23.naturalHeight;\n        g.save();\n        g.imageSmoothingEnabled = false;\n        g.drawImage(generatedSansV23, sansScreenX - targetW / 2, 139 - targetH, targetW, targetH);\n        g.restore();\n      } else {\n        drawSans(sansScreenX, 99, now);\n      }\n    }`;
    if (s.includes(oldDraw)) s = s.replace(oldDraw, newDraw);
    return s;
  }

  function patchHallDialogueTyping(source) {
    let s = String(source || '');
    if (!s.includes('let judgmentHallDialogueStartedAtV23')) {
      s = s.replace(
        '  let judgmentHallDialogueIndexV19 = 0;',
        '  let judgmentHallDialogueIndexV19 = 0;\n  let judgmentHallDialogueStartedAtV23 = performance.now();'
      );
      s = s.replace(
        '    judgmentHallDialogueIndexV19 = 0;\n    judgmentHallFadeV19 = 0;',
        '    judgmentHallDialogueIndexV19 = 0;\n    judgmentHallDialogueStartedAtV23 = performance.now();\n    judgmentHallFadeV19 = 0;'
      );
    }

    s = replaceFunction(s, 'drawJudgmentDialogueV19', `  function drawJudgmentDialogueV19() {
    const value = JUDGMENT_HALL_DIALOGUE_V19[judgmentHallDialogueIndexV19] || '';
    const elapsed = performance.now() - judgmentHallDialogueStartedAtV23;
    const visibleChars = Math.min(value.length, Math.floor(elapsed / 31));
    const visible = value.slice(0, visibleChars);
    rect(20, 12, 280, 67, '#000');
    frameBox(20, 12, 280, 67, '#fff', 2);
    const sad = judgmentHallDialogueIndexV19 === 1 || judgmentHallDialogueIndexV19 === 2
      || judgmentHallDialogueIndexV19 >= 6;
    drawJudgmentSansPortraitV19(50, 45, sad);
    const rows = String(visible).split('\\n');
    for (let i = 0; i < rows.length; i++) text(rows[i], 79, 22 + i * 14, 8, '#fff', 'left');
  }`);

    s = replaceFunction(s, 'advanceJudgmentDialogueV19', `  function advanceJudgmentDialogueV19() {
    if (judgmentHallPhaseV19 !== 'dialogue') return false;
    const value = JUDGMENT_HALL_DIALOGUE_V19[judgmentHallDialogueIndexV19] || '';
    const needed = value.length * 31;
    if (performance.now() - judgmentHallDialogueStartedAtV23 < needed) {
      judgmentHallDialogueStartedAtV23 = performance.now() - needed;
      return true;
    }
    if (judgmentHallDialogueIndexV19 + 1 < JUDGMENT_HALL_DIALOGUE_V19.length) {
      judgmentHallDialogueIndexV19++;
      judgmentHallDialogueStartedAtV23 = performance.now();
      if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();
    } else {
      judgmentHallPhaseV19 = 'fade';
      judgmentHallFadeV19 = 0;
      if (typeof playUserUndertaleSfx === 'function') {
        playUserUndertaleSfx('encounter', { volume: .28, rate: 1 });
      } else beep(92, .08);
    }
    return true;
  }`);

    s = patchFunctionBody(s, 'updateJudgmentHallV19', body => {
      const needle = `      judgmentHallPhaseV19 = 'dialogue';\n      judgmentHallDialogueIndexV19 = 0;`;
      if (!body.includes(needle)) return body;
      return body.replace(needle,
        `${needle}\n      judgmentHallDialogueStartedAtV23 = performance.now();\n      if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();`);
    });
    return s;
  }

  function patchOriginalSansVoice(source) {
    const marker = '  function speechBlip() {';
    let s = String(source || '');
    if (!s.includes('function playSansVoiceOriginalV23()')) {
      const at = s.indexOf(marker);
      if (at >= 0) {
        const helper = `  function playSansVoiceOriginalV23() {
    const data = window.__sansVoiceOriginalV23Data;
    if (!data) return false;
    let sample = window.__sansVoiceOriginalV23Audio;
    if (!sample) {
      sample = new Audio(data);
      sample.preload = 'auto';
      window.__sansVoiceOriginalV23Audio = sample;
    }
    try {
      // Exact uploaded MP3 playback: no rate, pitch, trimming, EQ, offset, or resampling changes.
      if (!sample.paused && !sample.ended) return true;
      sample.currentTime = 0;
      const promise = sample.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      return true;
    } catch (_) {
      return false;
    }
  }

`;
        s = s.slice(0, at) + helper + s.slice(at);
      }
    }

    s = replaceFunction(s, 'speechBlip', `  function speechBlip() {
    startAudio();
    const isSans = speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans';
    if (isSans && playSansVoiceOriginalV23()) return;
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475, sans: 152
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(base + (Math.floor(speechChars) % 3) * 13, audio.currentTime);
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .045);
  }`);
    return s;
  }

  function patchPassableBoneGasterGaps(source) {
    let s = String(source || '');
    s = s.split("const heartRadius = stage === 10 ? Math.max(1.6, battleSoulRadius() - .75) : 4;")
      .join("const heartRadius = stage === 10 ? Math.max(1.05, battleSoulRadius() - 1.15) : 4;");
    s = s.split("const beamHitRadius = stage === 10 ? Math.max(1.55, battleSoulRadius() - .45) : 6;")
      .join("const beamHitRadius = stage === 10 ? Math.max(.95, battleSoulRadius() - 1.05) : 6;");

    s = replaceFunction(s, 'enforceMinimumSansPassage', `  function enforceMinimumSansPassage(dt = 0) {
    if (stage !== 10 || state !== 'enemyTurn') return;
    const radius = Math.max(1.8, battleSoulRadius());
    // V23 guarantees a visible, controllable route even when a bone gate and
    // a Gaster beam overlap. The visual beam stays thick; its hit radius above
    // is slightly narrower so the drawn opening agrees with what the player can clear.
    const requiredGap = Math.max(14, radius * 2 + (isCompactBattleSoul() ? 7 : 9));
    const predictX = bullet => bullet.x + (bullet.vx || 0) * dt;
    const predictY = bullet => bullet.y + (bullet.vy || 0) * dt;

    const tops = bullets.filter(b => b.kind === 'bone' && b.orientation !== 'horizontal' && b.fromTop);
    const bottoms = bullets.filter(b => b.kind === 'bone' && b.orientation !== 'horizontal' && !b.fromTop);
    for (const top of tops) {
      let bottom = null;
      let distance = Infinity;
      for (const candidate of bottoms) {
        const d = Math.abs(predictX(top) - predictX(candidate));
        if (d <= 7 && d < distance) { bottom = candidate; distance = d; }
      }
      if (!bottom) continue;
      const topEnd = predictY(top) + effectiveBoneExtent(top);
      const bottomStart = predictY(bottom) - effectiveBoneExtent(bottom);
      const gap = bottomStart - topEnd;
      if (gap >= requiredGap) continue;
      const need = requiredGap - gap + .35;
      const topTrim = Math.min(Math.max(0, top.h - 2), need / 2);
      const bottomTrim = Math.min(Math.max(0, bottom.h - 2), need - topTrim);
      top.h = Math.max(2, top.h - topTrim);
      bottom.h = Math.max(2, bottom.h - bottomTrim);
    }

    const horizontal = bullets.filter(b => b.kind === 'bone' && b.orientation === 'horizontal');
    horizontal.sort((a, b) => predictX(a) - predictX(b));
    for (let i = 0; i + 1 < horizontal.length; i++) {
      const a = horizontal[i];
      const b = horizontal[i + 1];
      if (Math.abs(predictY(a) - predictY(b)) > 7) continue;
      const aExtent = effectiveBoneExtent(a);
      const bExtent = effectiveBoneExtent(b);
      const aStart = a.fromStart ? predictX(a) : predictX(a) - aExtent;
      const bStart = b.fromStart ? predictX(b) : predictX(b) - bExtent;
      const aEnd = aStart + aExtent;
      const gap = bStart - aEnd;
      if (gap >= requiredGap || gap < -4) continue;
      const need = requiredGap - gap + .35;
      const leftTrim = Math.min(Math.max(0, aExtent - 2), need / 2);
      const rightTrim = Math.min(Math.max(0, bExtent - 2), need - leftTrim);
      a.length = Math.max(2, aExtent - leftTrim);
      b.length = Math.max(2, bExtent - rightTrim);
    }
  }`);
    return s;
  }

  function patchExtraReferenceSfx(source) {
    let s = String(source || '');
    s = patchFunctionBody(s, 'resolveAttack', body => {
      const old = "    if (stage === 10) playUserUndertaleSfx('strike', { volume: .38, rate: 1 });";
      if (body.includes(old)) {
        return body.replace(old, `    if (stage === 10) {
      playUserUndertaleSfx('slash', { volume: .34, rate: 1 });
      window.setTimeout(() => playUserUndertaleSfx('strike', { volume: .38, rate: 1 }), 95);
    }`);
      }
      return body;
    });

    s = patchFunctionBody(s, 'finishDefeat', body => {
      if (body.includes('userGameOverSfxV23')) return body;
      const needle = '    defeatAt = performance.now();';
      if (!body.includes(needle)) return body;
      return body.replace(needle, `${needle}\n    // userGameOverSfxV23\n    window.setTimeout(() => {\n      if (typeof playUserUndertaleSfx === 'function') playUserUndertaleSfx('gameOver', { volume: .30, rate: 1 });\n    }, 1150);`);
    });
    return s;
  }

  function applySansVideoFidelityV23(source) {
    let s = String(source || '');
    s = patchHallLengthAndSprite(s);
    s = patchOriginalSansVoice(s);
    s = patchHallDialogueTyping(s);
    s = patchPassableBoneGasterGaps(s);
    s = patchExtraReferenceSfx(s);
    return s;
  }

  window.applySansVideoFidelityV23 = applySansVideoFidelityV23;
})();
