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

  function patchSpeech(source) {
    return replaceFunction(source, 'speechBlip', `  function speechBlip() {
    const isSans = stage === 10 && (
      state === 'enemySpeak' || state === 'intro'
      || speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans'
    );

    if (isSans) {
      startAudio();
      if (sansSpeechPool.length) {
        const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];
        sample.pause();
        sample.currentTime = 0;
        sample.preload = 'auto';
        sample.preservesPitch = false;
        sample.volume = .38;
        sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .022;
        if (sample.readyState === 0) sample.load();
        const played = sample.play();
        if (played && typeof played.then === 'function') {
          played.then(() => {
            window.setTimeout(() => {
              sample.pause();
              sample.currentTime = 0;
            }, 76);
          }).catch(() => {
            startAudio();
            if (audio && audio.state === 'running') beep(148, .042);
          });
        }
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

  function patchSpeechCadence(source) {
    return patchFunctionBody(source, 'updateEnemySpeech', body => body
      .replace("speechChars + dt * (speakingEnemy?.visual === 'sans' ? 24 : 30)",
        "speechChars + dt * (speakingEnemy?.visual === 'sans' ? 21 : 30)"));
  }

  function patchStageTenReferenceState(source) {
    let s = source.replace('  const TEST_PLAY_INVINCIBLE = true;', '  const TEST_PLAY_INVINCIBLE = false;');
    s = patchFunctionBody(s, 'startStage', body => {
      if (body.includes('sansReferenceStageStateV3')) return body;
      let next = body.replace('    stage = number;', `    stage = number;
    // sansReferenceStageStateV3
    if (stage === 10) playerLevel = 19;`);
      next = next.replace('    maxHp = levelMaxHp(playerLevel);\n    hp = maxHp;', `    maxHp = stage === 10 ? 92 : levelMaxHp(playerLevel);
    hp = maxHp;
    if (stage === 10) {
      karmaHp = 0;
      practiceGuardTurns = 0;
      practiceGuardActive = false;
      reviveItems = 0;
      for (const sample of sansSpeechPool) {
        sample.preload = 'auto';
        try { sample.load(); } catch (_) {}
      }
    }`);
      return next;
    });
    return s;
  }

  function patchDialogue(source) {
    return patchFunctionBody(source, 'beginEnemyTurn', body => {
      const verbose = `    setState('enemySpeak', [\n      '＊ ' + attacker.name + '「' + battleLine + '」',\n      '＊ 黒い箱の空気が 低く震えた。'\n    ]);`;
      return body.includes(verbose)
        ? body.replace(verbose, `    setState('enemySpeak', [battleLine]);`)
        : body;
    });
  }

  function patchSansGif(source) {
    return patchFunctionBody(source, 'drawSans', body => {
      let next = body;
      if (!next.includes('userSansGifReadyV3')) {
        next = next.replace(
          '    const animatedIdleReady = sansIdleGifImage.complete && sansIdleGifImage.naturalWidth;',
          `    // userSansGifReadyV3
    const userSansGif = window.__userSansGifPreloaded;
    const userSansGifReady = Boolean(userSansGif && userSansGif.complete && userSansGif.naturalWidth);
    const animatedIdleReady = sansIdleGifImage.complete && sansIdleGifImage.naturalWidth;`
        );
      }
      next = next.replace(
        ': animatedIdleReady ? sansIdleGifImage\n          : sansReferenceImage.complete',
        ': userSansGifReady ? userSansGif\n          : animatedIdleReady ? sansIdleGifImage\n          : sansReferenceImage.complete'
      );
      next = next.replace(
        '      const baseScale = 40 / Math.max(1, baseImage.naturalWidth);',
        '      const baseScale = Math.min(40 / Math.max(1, baseImage.naturalWidth), 53 / Math.max(1, baseImage.naturalHeight));'
      );
      return next;
    });
  }

  function patchJump(source) {
    return replaceFunction(source, 'adaptiveBlueJumpProfile', `  function adaptiveBlueJumpProfile(arena) {
    const vertical = gravityDirection === GravityDirection.DOWN
      || gravityDirection === GravityDirection.UP;
    const span = (vertical ? arena.bottom - arena.top : arena.right - arena.left)
      - battleSoulPadding() * 2;
    const compact = isCompactBattleSoul();
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

    const maximumRise = compact ? 11 : platformPhase ? 18 : 15;
    const riseRatio = compact ? .32 : platformPhase ? .48 : .40;
    const rise = Math.max(7, Math.min(maximumRise, clearance - 2, span * riseRatio));
    const gravity = compact ? 245 : platformPhase ? 230 : 210;
    return {
      velocity: Math.max(compact ? 78 : platformPhase ? 88 : 82,
        Math.min(platformPhase ? 118 : 106, Math.sqrt(2 * gravity * rise))),
      holdAccel: compact ? 78 : platformPhase ? 110 : 92,
      holdTime: compact ? .10 : platformPhase ? .20 : .16,
      gravity,
      release: compact ? .38 : .31
    };
  }`);
  }

  function patchPassageEnforcer(source) {
    let s = replaceFunction(source, 'enforceMinimumSansPassage', `  function enforceMinimumSansPassage(dt = 0) {
    if (stage !== 10 || state !== 'enemyTurn') return;

    const radius = Math.max(1.8, battleSoulRadius() - .55);
    const requiredGap = radius * 2 + (isCompactBattleSoul() ? 3.2 : 4.6);
    const transitionOverlap = radius * 2 + 1.8;
    const predictX = bullet => bullet.x + bullet.vx * dt;
    const predictY = bullet => bullet.y + bullet.vy * dt;

    const trimVerticalPair = (top, bottom, extraGap = 0) => {
      const topEnd = predictY(top) + effectiveBoneExtent(top);
      const bottomStart = predictY(bottom) - effectiveBoneExtent(bottom);
      const target = requiredGap + extraGap;
      const gap = bottomStart - topEnd;
      if (gap >= target) return;
      const need = target - gap + .2;
      const topTrim = Math.min(Math.max(0, top.h - 2), need / 2);
      const bottomTrim = Math.min(Math.max(0, bottom.h - 2), need - topTrim);
      top.h = Math.max(2, top.h - topTrim);
      bottom.h = Math.max(2, bottom.h - bottomTrim);
    };

    const trimHorizontalPair = (left, right, extraGap = 0) => {
      const leftEnd = predictX(left) + effectiveBoneExtent(left);
      const rightStart = predictX(right) - effectiveBoneExtent(right);
      const target = requiredGap + extraGap;
      const gap = rightStart - leftEnd;
      if (gap >= target) return;
      const need = target - gap + .2;
      const leftTrim = Math.min(Math.max(0, left.length - 2), need / 2);
      const rightTrim = Math.min(Math.max(0, right.length - 2), need - leftTrim);
      left.length = Math.max(2, left.length - leftTrim);
      right.length = Math.max(2, right.length - rightTrim);
    };

    const verticalTops = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && b.fromTop);
    const verticalBottoms = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && !b.fromTop);
    const gates = [];

    for (const top of verticalTops) {
      let best = null;
      let bestDistance = Infinity;
      for (const bottom of verticalBottoms) {
        const distance = Math.abs(predictX(top) - predictX(bottom));
        if (distance <= 7.5 && distance < bestDistance) {
          best = bottom;
          bestDistance = distance;
        }
      }
      if (!best) continue;
      trimVerticalPair(top, best);
      const topEnd = predictY(top) + effectiveBoneExtent(top);
      const bottomStart = predictY(best) - effectiveBoneExtent(best);
      gates.push({
        x: (predictX(top) + predictX(best)) / 2,
        top, bottom: best,
        low: topEnd, high: bottomStart,
        vx: (top.vx + best.vx) / 2
      });
    }

    gates.sort((a, b) => a.x - b.x);
    for (let i = 1; i < gates.length; i++) {
      const a = gates[i - 1];
      const b = gates[i];
      const dx = Math.abs(b.x - a.x);
      if (dx > 30 || Math.abs(a.vx - b.vx) > 55) continue;
      const overlap = Math.min(a.high, b.high) - Math.max(a.low, b.low);
      if (overlap >= transitionOverlap) continue;
      const extra = Math.min(18, transitionOverlap - overlap);
      trimVerticalPair(a.top, a.bottom, extra / 2);
      trimVerticalPair(b.top, b.bottom, extra / 2);
    }

    const horizontalLeft = bullets.filter(b => b.kind === 'bone'
      && b.orientation === 'horizontal' && b.fromStart);
    const horizontalRight = bullets.filter(b => b.kind === 'bone'
      && b.orientation === 'horizontal' && !b.fromStart);
    for (const left of horizontalLeft) {
      let best = null;
      let bestDistance = Infinity;
      for (const right of horizontalRight) {
        const distance = Math.abs(predictY(left) - predictY(right));
        if (distance <= 7.5 && distance < bestDistance) {
          best = right;
          bestDistance = distance;
        }
      }
      if (best) trimHorizontalPair(left, best);
    }
  }`);

    s = s.replace('    enforceMinimumSansPassage();', '    enforceMinimumSansPassage(dt);');
    return s;
  }

  function patchCollisionMargin(source) {
    let s = source;
    s = s.replace(
      "        const heartRadius = stage === 10 ? battleSoulRadius() : 4;",
      "        const heartRadius = stage === 10 ? Math.max(1.8, battleSoulRadius() - .55) : 4;"
    );
    s = s.replace(
      "&& Math.abs(bullet.y - heart.y) < (stage === 10 ? battleSoulRadius() : 5)",
      "&& Math.abs(bullet.y - heart.y) < (stage === 10 ? Math.max(1.8, battleSoulRadius() - .55) : 5)"
    );
    s = s.replace(
      "&& Math.abs(bullet.x - heart.x) < (stage === 10 ? battleSoulRadius() : 5)",
      "&& Math.abs(bullet.x - heart.x) < (stage === 10 ? Math.max(1.8, battleSoulRadius() - .55) : 5)"
    );
    s = s.replace(
      "        const beamHitRadius = stage === 10 ? battleSoulRadius() : 6;",
      "        const beamHitRadius = stage === 10 ? Math.max(2, battleSoulRadius() - .45) : 6;"
    );
    return s;
  }

  function patchReferencePalette(source) {
    return source.replace(
      "        rect(bullet.x - bullet.w / 2, bullet.y, bullet.w, 2, '#55e69a');\n        rect(bullet.x - bullet.w / 2 + 2, bullet.y + 2, bullet.w - 4, 2, '#176641');",
      "        rect(bullet.x - bullet.w / 2, bullet.y, bullet.w, 2, '#b8b8b8');\n        rect(bullet.x - bullet.w / 2 + 2, bullet.y + 2, bullet.w - 4, 2, '#4a4a4a');"
    );
  }

  function patchDamageCadence(source) {
    return patchFunctionBody(source, 'applySansDamage', body => body
      .replace('if (now - lastSansDamageAt < 100) return;',
        'if (now - lastSansDamageAt < 34) return;'));
  }

  function applySansFinalHardening(source) {
    let s = String(source || '');
    s = patchSpeech(s);
    s = patchSpeechCadence(s);
    s = patchStageTenReferenceState(s);
    s = patchDialogue(s);
    s = patchSansGif(s);
    s = patchJump(s);
    s = patchPassageEnforcer(s);
    s = patchCollisionMargin(s);
    s = patchReferencePalette(s);
    s = patchDamageCadence(s);
    return s;
  }

  window.applySansFinalHardening = applySansFinalHardening;

  const previous = Object.getOwnPropertyDescriptor(window, 'applyUserPolishHotfix');
  let finalValue;
  const getPrevious = () => {
    if (previous && typeof previous.get === 'function') return previous.get.call(window);
    return finalValue;
  };
  const setPrevious = value => {
    if (previous && typeof previous.set === 'function') previous.set.call(window, value);
    else finalValue = value;
  };
  const wrap = fn => {
    if (typeof fn !== 'function') return fn;
    if (fn.__sansFinalHardeningWrapped) return fn;
    const wrapped = source => applySansFinalHardening(fn(source));
    wrapped.__sansFinalHardeningWrapped = true;
    return wrapped;
  };

  const existing = getPrevious();
  if (typeof existing === 'function') finalValue = wrap(existing);
  Object.defineProperty(window, 'applyUserPolishHotfix', {
    configurable: true,
    enumerable: true,
    get() {
      if (typeof finalValue === 'function') return finalValue;
      const base = getPrevious();
      finalValue = wrap(base);
      return finalValue;
    },
    set(value) {
      setPrevious(value);
      const base = previous && typeof previous.get === 'function'
        ? previous.get.call(window)
        : value;
      finalValue = wrap(base);
    }
  });
})();