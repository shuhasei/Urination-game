(() => {
  'use strict';

  const GASTER_URL = 'https://www.myinstants.com/media/sounds/gaster_blaster_sound_effect_1.mp3';
  const CANONICAL_GASTER_CHARGE_SECONDS = .56;

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

  function replaceAllLiteral(source, before, after) {
    return source.split(before).join(after);
  }

  function patchBlueSoul(source) {
    return replaceFunction(source, 'adaptiveBlueJumpProfile', `  function adaptiveBlueJumpProfile(arena) {
    const vertical = gravityDirection === GravityDirection.DOWN
      || gravityDirection === GravityDirection.UP;
    const span = (vertical ? arena.bottom - arena.top : arena.right - arena.left)
      - battleSoulPadding() * 2;
    const compact = isCompactBattleSoul();
    const sansBattle = stage === 10;
    const platformPhase = Number.isInteger(attackPattern?.sansScriptIndex)
      && [4, 5, 6, 7, 8, 9].includes(attackPattern.sansScriptIndex);
    let clearance = span;
    if (vertical) {
      for (const bullet of bullets) {
        if (bullet.kind !== 'bone' || bullet.orientation === 'horizontal'
          || Math.abs(bullet.x - heart.x) > 20) continue;
        const extent = effectiveBoneExtent(bullet);
        const top = bullet.fromTop ? bullet.y : bullet.y - extent;
        const bottom = top + extent;
        if (gravityDirection === GravityDirection.DOWN && top > heart.y) {
          clearance = Math.min(clearance, top - heart.y - 4);
        } else if (gravityDirection === GravityDirection.UP && bottom < heart.y) {
          clearance = Math.min(clearance, heart.y - bottom - 4);
        }
      }
    }
    const maximumRise = compact ? 10.5 : sansBattle ? (platformPhase ? 18.5 : 15.5) : 23;
    const riseRatio = compact ? .31 : sansBattle ? (platformPhase ? .46 : .40) : .58;
    const rise = Math.max(6.5, Math.min(maximumRise, clearance - 2, span * riseRatio));
    const gravity = compact ? 270 : sansBattle ? (platformPhase ? 225 : 205) : 455;
    return {
      velocity: Math.max(compact ? 76 : sansBattle ? (platformPhase ? 86 : 80) : 132,
        Math.min(sansBattle ? (platformPhase ? 112 : 104) : 178, Math.sqrt(2 * gravity * rise))),
      holdAccel: compact ? 78 : sansBattle ? (platformPhase ? 106 : 88) : 205,
      holdTime: compact ? .095 : sansBattle ? (platformPhase ? .20 : .16) : .14,
      gravity,
      release: compact ? .38 : sansBattle ? .28 : .58
    };
  }`);
  }

  function patchBlueSoulLandingControl(source) {
    const block = `        // Holding jump while falling now queues the next landing. This makes
        // gravity changes and mobile controls dependable instead of requiring
        // a one-frame re-press at the exact moment the soul touches a wall.
        if (jumpHeld && !heart.isJumping && !heart.slamActive) {
          heart.jumpBuffer = BLUE_SOUL_JUMP_BUFFER_TIME;
        }`;
    return source.includes(block) ? source.replace(block, '') : source;
  }

  function patchBoneClearance(source) {
    let s = source;
    for (const oldValue of ['111', '101', '97']) {
      s = replaceAllLiteral(s, `const heightT = ${oldValue} - heightB;`, 'const heightT = 94 - heightB;');
    }
    for (const oldValue of ['20', '28', '32']) {
      s = replaceAllLiteral(s,
        `const opening = Math.max(${oldValue}, options.opening || ${oldValue});`,
        'const opening = Math.max(34, options.opening || 34);');
    }
    const openingMap = new Map([
      [14, 27], [15, 27], [16, 28], [17, 28], [18, 29], [19, 30],
      [20, 30], [21, 31], [22, 31], [23, 32], [24, 32], [25, 33],
      [26, 33], [27, 34], [28, 32], [29, 33], [30, 34], [31, 35]
    ]);
    for (const [from, to] of openingMap) {
      s = replaceAllLiteral(s, `opening: ${from},`, `opening: ${to},`);
    }
    s = replaceAllLiteral(s,
      "const heartRadius = stage === 10 ? battleSoulRadius() : 4;",
      "const heartRadius = stage === 10 ? Math.max(1.6, battleSoulRadius() - .75) : 4;");
    s = replaceAllLiteral(s,
      "const heartRadius = stage === 10 ? Math.max(1.8, battleSoulRadius() - .75) : 4;",
      "const heartRadius = stage === 10 ? Math.max(1.6, battleSoulRadius() - .75) : 4;");
    s = replaceAllLiteral(s,
      "const heartRadius = stage === 10 ? Math.max(1.8, battleSoulRadius() - .65) : 4;",
      "const heartRadius = stage === 10 ? Math.max(1.6, battleSoulRadius() - .75) : 4;");
    s = replaceAllLiteral(s,
      "const beamHitRadius = stage === 10 ? battleSoulRadius() : 6;",
      "const beamHitRadius = stage === 10 ? Math.max(1.55, battleSoulRadius() - .45) : 6;");
    return s;
  }

  function patchSansBeamWindows(source) {
    if (source.includes('function enforceSansBeamWindowV2()')) return source;
    const marker = '  function enforceMinimumSansPassage() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const helper = `  function enforceSansBeamWindowV2() {
    if (stage !== 10 || state !== 'enemyTurn') return;
    for (const bullet of bullets) {
      if (bullet.kind !== 'beam' || !Number.isFinite(bullet.warning) || !Number.isFinite(bullet.life)) continue;
      const maxActive = bullet.blasterSize >= 2 ? .30 : .255;
      if (bullet.life - bullet.warning > maxActive) bullet.life = bullet.warning + maxActive;
    }
  }

`;
    return source.slice(0, at) + helper + source.slice(at);
  }

  function patchMinimumPassageGuard(source) {
    let s = replaceFunction(source, 'enforceMinimumSansPassage', `  function enforceMinimumSansPassage() {
    if (stage !== 10 || state !== 'enemyTurn') return;
    const soulRadius = Math.max(1.55, battleSoulRadius() - .45);
    const requiredGap = soulRadius * 2 + (isCompactBattleSoul() ? 5.5 : 8.5);
    const columns = new Map();
    for (const bullet of bullets) {
      if (bullet.kind !== 'bone' || bullet.orientation === 'horizontal') continue;
      const key = Math.round(bullet.x / 3) * 3;
      const column = columns.get(key) || [];
      column.push(bullet);
      columns.set(key, column);
    }
    for (const column of columns.values()) {
      const top = column.find(bullet => bullet.fromTop);
      const bottom = column.find(bullet => !bullet.fromTop);
      if (!top || !bottom) continue;
      const topEdge = top.y + effectiveBoneExtent(top);
      const bottomEdge = bottom.y - effectiveBoneExtent(bottom);
      const gap = bottomEdge - topEdge;
      if (gap >= requiredGap) continue;
      const trim = (requiredGap - gap) / 2 + .25;
      top.h = Math.max(2, top.h - trim);
      bottom.h = Math.max(2, bottom.h - trim);
    }
    const rows = new Map();
    for (const bullet of bullets) {
      if (bullet.kind !== 'bone' || bullet.orientation !== 'horizontal') continue;
      const key = Math.round(bullet.y / 3) * 3;
      const row = rows.get(key) || [];
      row.push(bullet);
      rows.set(key, row);
    }
    for (const row of rows.values()) {
      const segments = row.map(bullet => {
        const extent = effectiveBoneExtent(bullet);
        const left = bullet.fromStart ? bullet.x : bullet.x - extent;
        return { bullet, left, right: left + extent };
      }).sort((a, b) => a.left - b.left);
      for (let i = 0; i + 1 < segments.length; i++) {
        const leftSeg = segments[i];
        const rightSeg = segments[i + 1];
        const gap = rightSeg.left - leftSeg.right;
        if (gap >= requiredGap || gap < -3) continue;
        const trim = (requiredGap - gap) / 2 + .25;
        leftSeg.bullet.length = Math.max(2, (leftSeg.bullet.length || effectiveBoneExtent(leftSeg.bullet)) - trim);
        rightSeg.bullet.length = Math.max(2, (rightSeg.bullet.length || effectiveBoneExtent(rightSeg.bullet)) - trim);
      }
    }
  }`);
    const call = '    enforceMinimumSansPassage();';
    if (s.includes(call) && !s.includes('enforceSansBeamWindowV2();')) {
      s = s.replace(call, `${call}\n    enforceSansBeamWindowV2();`);
    }
    return s;
  }

  function patchFinalSpiralTiming(source) {
    return source.replace(
      `          activeDuration: .45,\n          thickness: 6,`,
      `          activeDuration: .255,\n          thickness: 6,`
    );
  }

  function injectGasterSyncPool(source) {
    if (source.includes('const userGasterSyncPool =')) return source;
    const marker = '  function playBlasterChargeSound';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const userGasterSyncPool = Array.from({ length: 6 }, () => {
    const sample = new Audio(window.USER_GASTER_SOUND_URL || '${GASTER_URL}');
    sample.preload = 'auto';
    sample.volume = .42;
    return sample;
  });
  let userGasterSyncIndex = 0;
  let userGasterExternalPlayedAt = -10000;
  function playUserGasterSyncSound(visualWarning = ${CANONICAL_GASTER_CHARGE_SECONDS}) {
    if (!userGasterSyncPool.length) return false;
    const warning = Math.max(.18, Number.isFinite(visualWarning) ? visualWarning : ${CANONICAL_GASTER_CHARGE_SECONDS});
    const sample = userGasterSyncPool[userGasterSyncIndex++ % userGasterSyncPool.length];
    try {
      sample.pause();
      sample.currentTime = 0;
      sample.preservesPitch = false;
      sample.volume = .42;
      sample.playbackRate = Math.max(.82, Math.min(1.65,
        ${CANONICAL_GASTER_CHARGE_SECONDS} / warning));
      const result = sample.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
      userGasterExternalPlayedAt = performance.now();
      return true;
    } catch (_) {
      return false;
    }
  }

`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchGasterAudio(source) {
    let s = injectGasterSyncPool(source);
    s = replaceFunction(s, 'playBlasterChargeSound', `  function playBlasterChargeSound(visualWarning = .56) {
    const externalPlayed = playUserGasterSyncSound(visualWarning);
    playSweepSound('triangle', 125, 720, Math.min(.30, visualWarning * .72), externalPlayed ? .010 : .034);
    playSweepSound('sine', 220, 920, Math.min(.23, visualWarning * .58), externalPlayed ? .006 : .016);
    window.setTimeout(() => playNoiseBurst(.08, externalPlayed ? .004 : .013, 1200),
      Math.max(35, Math.min(95, visualWarning * 220)));
  }`);
    s = replaceFunction(s, 'playBlasterFireSound', `  function playBlasterFireSound() {
    const externalRecent = performance.now() - userGasterExternalPlayedAt < 1400;
    playNoiseBurst(.12, externalRecent ? .014 : .055, 420);
    playSweepSound('sawtooth', 760, 70, .15, externalRecent ? .013 : .050);
    window.setTimeout(() => playSweepSound('square', 250, 52, .11,
      externalRecent ? .007 : .030), 10);
  }`);
    return s;
  }

  function patchChargeCallTiming(source) {
    let s = source;
    const replacements = [
      ['spawnRecordedBlaster', 'playBlasterChargeSound();', 'playBlasterChargeSound(Math.max(.05, charge));'],
      ['spawnAimedRecordedBlaster', 'playBlasterChargeSound();', 'playBlasterChargeSound(Math.max(.05, charge));'],
      ['spawnHorizontalBlaster', 'playBlasterChargeSound();', 'playBlasterChargeSound(options.warning || .48);'],
      ['spawnVerticalBlaster', 'playBlasterChargeSound();', 'playBlasterChargeSound(options.warning || .48);'],
      ['spawnAngledBlasterRing', 'playBlasterChargeSound();', 'playBlasterChargeSound(options.warning || .42);'],
      ['spawnAngledBlasterShot', 'playBlasterChargeSound();', 'playBlasterChargeSound(options.warning || .36);']
    ];
    for (const [name, before, after] of replacements) {
      const bounds = functionBounds(s, name);
      if (!bounds) continue;
      const body = s.slice(bounds.start, bounds.end);
      if (!body.includes(before)) continue;
      s = s.slice(0, bounds.start) + body.replace(before, after) + s.slice(bounds.end);
    }
    return s;
  }

  function patchGasterVisualSync(source) {
    let s = source;
    const customBlock = `      const customBlasterReady = stage === 10\n        && customGasterBlasterImage.complete && customGasterBlasterImage.naturalWidth;\n      const frameImage = customBlasterReady\n        ? customGasterBlasterImage\n        : (blasterAnimationFrames[frameIndex] || blasterReferenceImage);`;
    if (s.includes(customBlock)) {
      s = s.replace(customBlock,
        `      const customBlasterReady = false;\n      const frameImage = blasterAnimationFrames[frameIndex] || blasterReferenceImage;`);
    }
    s = replaceAllLiteral(s,
      `      const targetHeight = Math.round(((customBlasterReady ? 42 : 36) + openAmount * 4) * sizeFactor);`,
      `      const targetHeight = Math.round((36 + openAmount * 4) * sizeFactor);`);
    s = replaceAllLiteral(s,
      '        const travelWindow = Math.max(.08, warning * .62);',
      '        const travelWindow = Math.max(.08, warning * .78);');
    return s;
  }

  function applyBattleSyncPatch(source) {
    let s = String(source || '');
    s = patchBlueSoul(s);
    s = patchBlueSoulLandingControl(s);
    s = patchBoneClearance(s);
    s = patchSansBeamWindows(s);
    s = patchMinimumPassageGuard(s);
    s = patchFinalSpiralTiming(s);
    s = patchGasterAudio(s);
    s = patchChargeCallTiming(s);
    s = patchGasterVisualSync(s);
    return s;
  }

  window.applyBattleSyncV2 = applyBattleSyncPatch;

  let observed = null;
  const timer = window.setInterval(() => {
    const current = window.applyUserPolishHotfix;
    if (typeof current !== 'function' || current === observed || current.__battleSyncV2Wrapped) return;
    const wrapped = source => applyBattleSyncPatch(current(source));
    wrapped.__battleSyncV2Wrapped = true;
    observed = wrapped;
    window.applyUserPolishHotfix = wrapped;
    window.clearInterval(timer);
  }, 10);
})();