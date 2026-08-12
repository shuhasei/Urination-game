(() => {
  'use strict';

  const VERSION = '20260813-sans-startup-size-v25';

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

  function injectVoiceSupport(source) {
    if (source.includes('function playSansReferenceBlipV25(')) return source;
    const marker = '  function speechBlip() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const support = `  let sansReferenceBlipAudioPoolV25 = [];
  let sansReferenceBlipDataV25 = '';
  let sansReferenceBlipIndexV25 = 0;
  let lastSansReferenceBlipAtV25 = -10000;
  let judgmentHallVoiceCharsV25 = 0;

  function getSansReferenceBlipAudioPoolV25() {
    const data = window.__sansVoiceBlipV24Data
      || window.__sansVoiceOriginalV23Data
      || window.USER_SANS_VOICE_URL
      || '';
    if (!data) return [];
    if (data === sansReferenceBlipDataV25 && sansReferenceBlipAudioPoolV25.length) {
      return sansReferenceBlipAudioPoolV25;
    }
    sansReferenceBlipDataV25 = data;
    sansReferenceBlipAudioPoolV25 = Array.from({ length: 8 }, () => {
      const sample = new Audio(data);
      sample.preload = 'auto';
      sample.volume = .30;
      sample.playbackRate = 1;
      sample.preservesPitch = true;
      return sample;
    });
    sansReferenceBlipIndexV25 = 0;
    return sansReferenceBlipAudioPoolV25;
  }

  function playSansReferenceBlipV25(force = false) {
    const nowMs = performance.now();
    if (!force && nowMs - lastSansReferenceBlipAtV25 < 34) return true;
    const pool = getSansReferenceBlipAudioPoolV25();
    if (!pool.length) return false;
    lastSansReferenceBlipAtV25 = nowMs;
    const sample = pool[sansReferenceBlipIndexV25++ % pool.length];
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
    return source.slice(0, at) + support + source.slice(at);
  }

  function patchSansVoice(source) {
    let s = injectVoiceSupport(source);
    s = replaceFunction(s, 'speechBlip', `  function speechBlip() {
    const isSans = speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans';
    if (isSans && playSansReferenceBlipV25()) return;
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

    s = s.split("if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();")
      .join('judgmentHallVoiceCharsV25 = 0;');
    return s;
  }

  function patchJudgmentHallVoice(source) {
    let s = replaceFunction(source, 'drawJudgmentDialogueV19', `  function drawJudgmentDialogueV19() {
    const value = JUDGMENT_HALL_DIALOGUE_V19[judgmentHallDialogueIndexV19] || '';
    const elapsed = performance.now() - judgmentHallDialogueStartedAtV23;
    const visibleChars = Math.min(value.length, Math.floor(elapsed / 31));
    if (visibleChars < judgmentHallVoiceCharsV25) judgmentHallVoiceCharsV25 = 0;
    if (visibleChars > judgmentHallVoiceCharsV25) {
      let shouldBlip = false;
      for (let i = judgmentHallVoiceCharsV25; i < visibleChars; i++) {
        const ch = value[i] || '';
        if (ch && !/\\s/.test(ch)) { shouldBlip = true; break; }
      }
      judgmentHallVoiceCharsV25 = visibleChars;
      if (shouldBlip) playSansReferenceBlipV25();
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
        '      judgmentHallDialogueStartedAtV23 = performance.now();\n      judgmentHallVoiceCharsV25 = 0;'
      );
      next = next.split("      if (typeof playSansVoiceOriginalV23 === 'function') playSansVoiceOriginalV23();\n").join('');
      return next;
    });
    return s;
  }

  function patchSansSize(source) {
    let s = String(source || '');

    // The opening protagonist is rendered in a 20x20 logical-pixel box.
    // Use that same visual height for Sans in the Judgment Hall.
    s = s.split("const targetH = judgmentHallPhaseV19 === 'walk' ? 45 : 47;")
      .join('const targetH = 20;');

    const drawSansV25 = `  function drawSans(x, y, t) {
    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const finalDodge = stage === 10 && sansEndingPhase === 'awake';
    const woundedHit = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';
    const woundedDialogue = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';
    const walking = stage === 10 && sansEndingPhase === 'walking';
    const attackPoseState = state === 'enemyTurn' || state === 'enemySpeak';
    const finalSpecial = stage === 10 && attackPattern?.finalSpecial === true && attackPoseState;
    const footX = Math.round(x);
    const footY = Math.round(y + 40 + (resting ? 1 : 0));
    const targetH = 20;

    function drawSansImageV25(image, height = targetH, alpha = 1, flip = false) {
      if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return false;
      const width = height * image.naturalWidth / image.naturalHeight;
      g.save();
      g.globalAlpha = alpha;
      g.translate(footX, footY);
      if (flip) g.scale(-1, 1);
      g.imageSmoothingEnabled = false;
      g.drawImage(image, -width / 2, -height, width, height);
      g.restore();
      return true;
    }

    if (finalDodge && drawSansImageV25(sansFinalDodgeImage)) return;
    if (woundedHit && drawSansImageV25(sansWoundedSitImage)) return;
    if (woundedDialogue && drawSansImageV25(sansWoundedStandImage)) return;
    if (walking && drawSansImageV25(sansWoundedWalkGifImage)) return;
    if (resting && drawSansImageV25(sansSleepImage)) {
      const cycle = Math.floor(t / 460) % 3;
      for (let i = 0; i < 3; i++) {
        g.globalAlpha = i <= cycle ? 1 : .28;
        text('Z', footX + 7 + i * 5, footY - 20 - i * 5, 5, '#fff', 'center');
      }
      g.globalAlpha = 1;
      return;
    }

    const gestureActive = attackPoseState
      && t >= sansGestureStartedAt && t <= sansGestureUntil
      && window.__hqHandUpV17?.complete && window.__hqHandUpV17.naturalWidth;
    const sprite = gestureActive ? window.__hqHandUpV17 : window.__hqSansV17;
    let drawn = drawSansImageV25(sprite);
    if (!drawn) {
      const fallback = window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth
        ? window.__userSansGifPreloaded
        : (sansReferenceImage.complete && sansReferenceImage.naturalWidth
          ? sansReferenceImage : sansIdleGifImage);
      drawn = drawSansImageV25(fallback);
    }

    if (finalSpecial && drawn) {
      const pulse = Math.floor(t / 150) % 2;
      const eyeX = footX + 2;
      const eyeY = footY - 15;
      rect(eyeX - 1, eyeY - 1, 3, 3, '#000');
      rect(eyeX, eyeY, 2, 2, pulse ? '#48efff' : '#58dfff');
      rect(eyeX + 1, eyeY, 1, 1, pulse ? '#72ff83' : '#fff');
    }
  }`;

    s = replaceFunction(s, 'drawSans', drawSansV25);
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
      s = s.split(pattern)
        .join("const heartRadius = stage === 10 ? Math.max(.8, battleSoulRadius() - 1.3) : 4;");
    }
    const beamPatterns = [
      "const beamHitRadius = stage === 10 ? Math.max(.95, battleSoulRadius() - 1.05) : 6;",
      "const beamHitRadius = stage === 10 ? Math.max(1.55, battleSoulRadius() - .45) : 6;"
    ];
    for (const pattern of beamPatterns) {
      s = s.split(pattern)
        .join("const beamHitRadius = stage === 10 ? Math.max(.65, battleSoulRadius() - 1.35) : 6;");
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

  window.applySansStartupSizeFixV25 = source => {
    let result = String(source || '');
    result = patchSansVoice(result);
    result = patchJudgmentHallVoice(result);
    result = patchSansSize(result);
    result = patchPassage(result);
    result = patchVideoPacing(result);
    return result;
  };

  console.info('Sans startup/size fix v25 ready:', VERSION);
})();
