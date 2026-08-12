(() => {
  'use strict';

  const VERSION = '20260813-sans-reference-v24';
  window.__sansVoiceBlipV24Data = 'data:audio/mpeg;base64,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';

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

  function injectReferenceVoiceSupport(source) {
    if (source.includes('function playSansReferenceBlipV24()')) return source;
    const marker = '  function speechBlip() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  let sansReferenceBlipPoolV24 = [];
  let sansReferenceBlipDataV24 = '';
  let sansReferenceBlipIndexV24 = 0;
  let lastSansReferenceBlipAtV24 = -10000;
  let judgmentHallVoiceCharsV24 = 0;

  function sansReferenceBlipPoolV24() {
    const data = window.__sansVoiceBlipV24Data || '';
    if (!data) return [];
    if (data === sansReferenceBlipDataV24 && sansReferenceBlipPoolV24.length) {
      return sansReferenceBlipPoolV24;
    }
    sansReferenceBlipDataV24 = data;
    sansReferenceBlipPoolV24 = Array.from({ length: 8 }, () => {
      const sample = new Audio(data);
      sample.preload = 'auto';
      sample.volume = .30;
      sample.playbackRate = 1;
      sample.preservesPitch = true;
      return sample;
    });
    sansReferenceBlipIndexV24 = 0;
    return sansReferenceBlipPoolV24;
  }

  function playSansReferenceBlipV24(force = false) {
    const nowMs = performance.now();
    if (!force && nowMs - lastSansReferenceBlipAtV24 < 34) return true;
    const pool = sansReferenceBlipPoolV24();
    if (!pool.length) return false;
    lastSansReferenceBlipAtV24 = nowMs;
    const sample = pool[sansReferenceBlipIndexV24++ % pool.length];
    try {
      sample.pause();
      sample.currentTime = 0;
      sample.volume = .30;
      sample.playbackRate = 1;
      sample.preservesPitch = true;
      const promise = sample.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
      window.setTimeout(() => {
        try {
          sample.pause();
          sample.currentTime = 0;
        } catch (_) {}
      }, 105);
      return true;
    } catch (_) {
      return false;
    }
  }

`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchSansVoice(source) {
    let s = injectReferenceVoiceSupport(source);
    s = replaceFunction(s, 'speechBlip', `  function speechBlip() {
    const isSans = speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans';
    if (isSans && playSansReferenceBlipV24()) return;
    startAudio();
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

    s = s.split("      if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();\n")
      .join('      judgmentHallVoiceCharsV24 = 0;\n');
    s = s.split("      if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();")
      .join('      judgmentHallVoiceCharsV24 = 0;');
    return s;
  }

  function patchJudgmentHallTyping(source) {
    let s = source;
    s = replaceFunction(s, 'drawJudgmentDialogueV19', `  function drawJudgmentDialogueV19() {
    const value = JUDGMENT_HALL_DIALOGUE_V19[judgmentHallDialogueIndexV19] || '';
    const elapsed = performance.now() - judgmentHallDialogueStartedAtV23;
    const visibleChars = Math.min(value.length, Math.floor(elapsed / 31));
    if (visibleChars < judgmentHallVoiceCharsV24) judgmentHallVoiceCharsV24 = 0;
    if (visibleChars > judgmentHallVoiceCharsV24) {
      let shouldBlip = false;
      for (let i = judgmentHallVoiceCharsV24; i < visibleChars; i++) {
        const ch = value[i] || '';
        if (ch && !/\\s/.test(ch)) { shouldBlip = true; break; }
      }
      judgmentHallVoiceCharsV24 = visibleChars;
      if (shouldBlip) playSansReferenceBlipV24();
    }
    const visible = value.slice(0, visibleChars);
    rect(20, 12, 280, 67, '#000');
    frameBox(20, 12, 280, 67, '#fff', 2);
    const sad = judgmentHallDialogueIndexV19 === 1 || judgmentHallDialogueIndexV19 === 2
      || judgmentHallDialogueIndexV19 >= 6;
    drawJudgmentSansPortraitV19(50, 45, sad);
    const rows = String(visible).split('\\n');
    for (let i = 0; i < rows.length; i++) text(rows[i], 79, 22 + i * 14, 8, '#fff', 'left');
  }`);

    s = patchFunctionBody(s, 'advanceJudgmentDialogueV19', body => {
      let next = body;
      next = next.replace(
        '      judgmentHallDialogueStartedAtV23 = performance.now();',
        '      judgmentHallDialogueStartedAtV23 = performance.now();\n      judgmentHallVoiceCharsV24 = 0;'
      );
      next = next.split("      if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();\n").join('');
      return next;
    });
    return s;
  }

  function patchPassage(source) {
    let s = String(source || '');
    const radiusPatterns = [
      "const heartRadius = stage === 10 ? Math.max(1.05, battleSoulRadius() - 1.15) : 4;",
      "const heartRadius = stage === 10 ? Math.max(1.6, battleSoulRadius() - .75) : 4;",
      "const heartRadius = stage === 10 ? Math.max(1.8, battleSoulRadius() - .55) : 4;"
    ];
    for (const pattern of radiusPatterns) {
      s = s.split(pattern).join("const heartRadius = stage === 10 ? Math.max(.8, battleSoulRadius() - 1.3) : 4;");
    }
    const beamPatterns = [
      "const beamHitRadius = stage === 10 ? Math.max(.95, battleSoulRadius() - 1.05) : 6;",
      "const beamHitRadius = stage === 10 ? Math.max(1.55, battleSoulRadius() - .45) : 6;"
    ];
    for (const pattern of beamPatterns) {
      s = s.split(pattern).join("const beamHitRadius = stage === 10 ? Math.max(.65, battleSoulRadius() - 1.35) : 6;");
    }

    s = replaceFunction(s, 'enforceMinimumSansPassage', `  function enforceMinimumSansPassage(dt = 0) {
    if (stage !== 10 || state !== 'enemyTurn') return;
    const soulRadius = Math.max(1.8, battleSoulRadius());
    const activeBeam = bullets.some(b => b.kind === 'beam'
      && b.age >= (b.warning || 0) && b.age <= (b.life || 0));
    const requiredGap = Math.max(18, soulRadius * 2 + 10) + (activeBeam ? 3 : 0);
    const predictX = bullet => bullet.x + (bullet.vx || 0) * dt;
    const predictY = bullet => bullet.y + (bullet.vy || 0) * dt;

    const tops = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && b.fromTop);
    const bottoms = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && !b.fromTop);

    for (const top of tops) {
      let bottom = null;
      let bestDistance = Infinity;
      for (const candidate of bottoms) {
        const distance = Math.abs(predictX(top) - predictX(candidate));
        if (distance <= 8 && distance < bestDistance) {
          bottom = candidate;
          bestDistance = distance;
        }
      }
      if (!bottom) continue;
      const topEnd = predictY(top) + effectiveBoneExtent(top);
      const bottomStart = predictY(bottom) - effectiveBoneExtent(bottom);
      const gap = bottomStart - topEnd;
      if (gap >= requiredGap) continue;
      const need = requiredGap - gap + .5;
      const topTrim = Math.min(Math.max(0, top.h - 2), need / 2);
      const bottomTrim = Math.min(Math.max(0, bottom.h - 2), need - topTrim);
      top.h = Math.max(2, top.h - topTrim);
      bottom.h = Math.max(2, bottom.h - bottomTrim);
    }

    const horizontal = bullets.filter(b => b.kind === 'bone' && b.orientation === 'horizontal');
    const rows = new Map();
    for (const bone of horizontal) {
      const key = Math.round(predictY(bone) / 4) * 4;
      const row = rows.get(key) || [];
      row.push(bone);
      rows.set(key, row);
    }
    for (const row of rows.values()) {
      const segments = row.map(bone => {
        const extent = effectiveBoneExtent(bone);
        const x = predictX(bone);
        const left = bone.fromStart ? x : x - extent;
        return { bone, left, right: left + extent, extent };
      }).sort((a, b) => a.left - b.left);
      for (let i = 0; i + 1 < segments.length; i++) {
        const a = segments[i];
        const b = segments[i + 1];
        const gap = b.left - a.right;
        if (gap >= requiredGap || gap < -4) continue;
        const need = requiredGap - gap + .5;
        const aTrim = Math.min(Math.max(0, a.extent - 2), need / 2);
        const bTrim = Math.min(Math.max(0, b.extent - 2), need - aTrim);
        a.bone.length = Math.max(2, a.extent - aTrim);
        b.bone.length = Math.max(2, b.extent - bTrim);
      }
    }
  }`);
    return s;
  }

  function patchVideoPacing(source) {
    let s = String(source || '');
    s = s.replace('const JUDGMENT_HALL_WORLD_W_V19 = 790;', 'const JUDGMENT_HALL_WORLD_W_V19 = 812;');
    s = s.replace('const JUDGMENT_HALL_SANS_X_V19 = 620;', 'const JUDGMENT_HALL_SANS_X_V19 = 642;');
    s = s.replace('    const speed = 45;', '    const speed = 44;');
    return s;
  }

  window.applySansReferenceVideoV24 = source => {
    let result = String(source || '');
    result = patchSansVoice(result);
    result = patchJudgmentHallTyping(result);
    result = patchPassage(result);
    result = patchVideoPacing(result);
    return result;
  };

  console.info('Sans reference video v24 ready:', VERSION);
})();
