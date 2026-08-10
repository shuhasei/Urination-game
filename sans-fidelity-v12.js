(() => {
  'use strict';

  function replaceFunction(source, name, replacement) {
    const token = `function ${name}`;
    let searchFrom = 0;
    while (searchFrom < source.length) {
      const fnAt = source.indexOf(token, searchFrom);
      if (fnAt < 0) return source;
      const before = fnAt === 0 ? '\n' : source[fnAt - 1];
      const afterName = source.slice(fnAt + token.length).trimStart()[0];
      if ((before === '\n' || before === '\r' || /\s/.test(before)) && afterName === '(') {
        const start = source.lastIndexOf('\n', fnAt) + 1;
        const brace = source.indexOf('{', fnAt + token.length);
        if (brace < 0) return source;
        let depth = 0;
        let quote = null;
        let escape = false;
        let templateDepth = 0;
        for (let i = brace; i < source.length; i++) {
          const ch = source[i];
          if (quote) {
            if (escape) escape = false;
            else if (ch === '\\') escape = true;
            else if (quote === '`' && ch === '$' && source[i + 1] === '{') {
              templateDepth++;
              i++;
            } else if (quote === '`' && ch === '}' && templateDepth > 0) {
              templateDepth--;
            } else if (ch === quote && templateDepth === 0) quote = null;
            continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') {
            quote = ch;
            continue;
          }
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
          }
        }
        return source;
      }
      searchFrom = fnAt + token.length;
    }
    return source;
  }

  function injectSupport(source) {
    if (source.includes('const sansSheetV12 =')) return source;
    const marker = '  function drawSans(x, y, t) {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const support = `  const sansSheetV12 = window.__sansSheetV12 || null;\n  const gasterSheetV12 = window.__gasterSheetV12 || null;\n  const sansSheetMetaV12 = window.USER_SANS_SHEET_V12 || null;\n  const gasterSheetMetaV12 = window.USER_GASTER_SHEET_V12 || null;\n  const sansVoiceUrlV12 = window.USER_SANS_VOICE_URL\n    || 'https://www.myinstants.com/media/sounds/just-sans-talking.mp3';\n  const sansVoicePoolV12 = Array.from({ length: 6 }, () => {\n    const sample = new Audio(sansVoiceUrlV12);\n    sample.preload = 'auto';\n    sample.volume = .52;\n    sample.preservesPitch = false;\n    return sample;\n  });\n  let sansVoicePoolIndexV12 = 0;\n  let lastSansSpeechAtV12 = -10000;\n\n  function timedSheetFrameV12(meta, timeMs) {\n    if (!meta || !meta.frames) return 0;\n    const durations = meta.durations || [];\n    let total = 0;\n    for (let i = 0; i < meta.frames; i++) total += Math.max(20, durations[i] || 100);\n    if (total <= 0) return 0;\n    let cursor = ((timeMs % total) + total) % total;\n    for (let i = 0; i < meta.frames; i++) {\n      cursor -= Math.max(20, durations[i] || 100);\n      if (cursor < 0) return i;\n    }\n    return meta.frames - 1;\n  }\n\n  function drawSheetFrameV12(image, meta, frameIndex, dx, dy, dw, dh, alpha = 1) {\n    if (!image || !image.complete || !image.naturalWidth || !meta) return false;\n    const index = Math.max(0, Math.min(meta.frames - 1, frameIndex));\n    const sx = (index % meta.columns) * meta.frameWidth;\n    const sy = Math.floor(index / meta.columns) * meta.frameHeight;\n    g.save();\n    g.imageSmoothingEnabled = false;\n    g.globalAlpha = alpha;\n    g.drawImage(image, sx, sy, meta.frameWidth, meta.frameHeight, dx, dy, dw, dh);\n    g.restore();\n    return true;\n  }\n\n  function sansSpeechFallbackV12() {\n    startAudio();\n    if (!audio || audio.state !== 'running') return;\n    const osc = audio.createOscillator();\n    const gain = audio.createGain();\n    osc.type = 'square';\n    osc.frequency.setValueAtTime(112 + (Math.floor(speechChars) % 5) * 7, audio.currentTime);\n    gain.gain.setValueAtTime(.10, audio.currentTime);\n    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .075);\n    osc.connect(gain);\n    gain.connect(audio.destination);\n    osc.start();\n    osc.stop(audio.currentTime + .08);\n  }\n\n`;
    return source.slice(0, at) + support + source.slice(at);
  }

  const drawSansV12 = `  function drawSans(x, y, t) {
    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const finalDodge = stage === 10 && sansEndingPhase === 'awake';
    const woundedHit = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';
    const woundedDialogue = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';
    const walking = stage === 10 && sansEndingPhase === 'walking';
    const wounded = woundedHit || woundedDialogue || walking;
    const attackPoseState = state === 'enemyTurn' || state === 'enemySpeak';
    const finalSpecial = stage === 10 && attackPattern?.finalSpecial === true && attackPoseState;
    const sheetReady = Boolean(sansSheetV12?.complete && sansSheetV12.naturalWidth && sansSheetMetaV12);
    const gifReady = Boolean(window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth);
    const footX = Math.round(x);
    const footY = Math.round(y + 40 + ((sheetReady || gifReady) ? 0 : Math.sin(t / 420) * .5) + (resting ? 2 : 0));

    const endingPose = finalDodge && sansFinalDodgeImage.complete && sansFinalDodgeImage.naturalWidth
      ? { image: sansFinalDodgeImage, anchorX: 65.5, anchorY: 129 }
      : woundedHit && sansWoundedSitImage.complete && sansWoundedSitImage.naturalWidth
        ? { image: sansWoundedSitImage, anchorX: 47, anchorY: 106 }
        : woundedDialogue && sansWoundedStandImage.complete && sansWoundedStandImage.naturalWidth
          ? { image: sansWoundedStandImage, anchorX: 47, anchorY: 126 }
          : walking && sansWoundedWalkGifImage.complete && sansWoundedWalkGifImage.naturalWidth
            ? { image: sansWoundedWalkGifImage, anchorX: 49, anchorY: 132 }
            : null;

    const poseStarted = sansGestureStartedAt;
    const poseEnds = sansGestureUntil;
    const inBlend = smoothstep01((t - poseStarted) / 20);
    const outBlend = smoothstep01((poseEnds + 48 - t) / 48);
    const canGesture = attackPoseState && !resting && !finalDodge && !wounded;
    const poseBlend = canGesture && t >= poseStarted && t <= poseEnds + 48
      ? Math.min(inBlend, outBlend) : 0;
    const direction = sansGestureDirection;
    const horizontalPose = direction === GravityDirection.LEFT || direction === GravityDirection.RIGHT;
    const gestureImage = horizontalPose ? sansPointRightImage
      : direction === GravityDirection.UP ? sansHandUpImage : sansHandDownImage;
    const gestureFlip = direction === GravityDirection.LEFT;
    const moveX = direction === GravityDirection.LEFT ? -2 * poseBlend
      : direction === GravityDirection.RIGHT ? 2 * poseBlend : 0;
    const moveY = direction === GravityDirection.UP ? -2 * poseBlend
      : direction === GravityDirection.DOWN ? 2 * poseBlend : 0;

    if (endingPose) {
      drawAnchoredSprite(endingPose.image, endingPose.anchorX, endingPose.anchorY,
        footX, footY, 1, false, .5);
    } else if (!resting && !finalSpecial && sheetReady) {
      const frame = timedSheetFrameV12(sansSheetMetaV12, t);
      const h = 53;
      const w = Math.round(h * sansSheetMetaV12.frameWidth / sansSheetMetaV12.frameHeight);
      drawSheetFrameV12(sansSheetV12, sansSheetMetaV12, frame,
        footX - Math.round(w / 2), footY - h, w, h, 1 - poseBlend);
    } else {
      const baseImage = resting && sansSleepImage.complete ? sansSleepImage
        : finalSpecial && providedSansEyeImage.complete ? providedSansEyeImage
        : (window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth
          ? window.__userSansGifPreloaded
          : (sansIdleGifImage.complete && sansIdleGifImage.naturalWidth ? sansIdleGifImage : sansReferenceImage));
      const scale = baseImage.naturalWidth && baseImage.naturalHeight
        ? Math.min(40 / baseImage.naturalWidth, 53 / baseImage.naturalHeight) : .5;
      drawAnchoredSprite(baseImage, baseImage.naturalWidth / 2, baseImage.naturalHeight,
        footX, footY, 1 - poseBlend, false, scale);
    }

    if (poseBlend > .001) {
      if (horizontalPose) {
        drawAnchoredSprite(gestureImage, 46, 104, footX + moveX, footY + moveY,
          poseBlend, gestureFlip, .5);
      } else if (direction === GravityDirection.UP) {
        drawAnchoredSprite(gestureImage, 46, 108, footX + moveX, footY + moveY,
          poseBlend, false, .5);
      } else {
        drawAnchoredSprite(gestureImage, 47, 104, footX + moveX, footY + moveY,
          poseBlend, false, .5);
      }
    }

    if (finalSpecial) {
      const glow = Math.floor(t / 110) % 2 ? '#45ecff' : '#75ff91';
      const eyeX = horizontalPose ? footX + (gestureFlip ? -6 : 6) : footX + 5;
      const eyeY = footY - 39 + moveY;
      rect(eyeX, eyeY, 2, 2, glow);
      rect(eyeX + 1, eyeY, 1, 1, '#fff');
    }

    if (resting) {
      const cycle = Math.floor(t / 460) % 3;
      for (let i = 0; i < 3; i++) {
        g.globalAlpha = i <= cycle ? 1 : .28;
        text('Z', footX + 12 + i * 7, footY - 43 - i * 7, 7 - i, '#fff', 'center');
      }
      g.globalAlpha = 1;
    }
  }`;

  const speechBlipV12 = `  function speechBlip() {
    const isSans = speakingEnemy?.visual === 'sans';
    if (isSans) {
      const nowMs = performance.now();
      if (nowMs - lastSansSpeechAtV12 < 34) return;
      lastSansSpeechAtV12 = nowMs;
      const sample = sansVoicePoolV12[sansVoicePoolIndexV12++ % sansVoicePoolV12.length];
      try {
        sample.pause();
        sample.currentTime = 0;
        sample.volume = .52;
        sample.playbackRate = .96 + (Math.floor(speechChars) % 4) * .02;
        const promise = sample.play();
        if (promise?.catch) promise.catch(() => sansSpeechFallbackV12());
        window.setTimeout(() => {
          sample.pause();
          try { sample.currentTime = 0; } catch (_) {}
        }, 96);
      } catch (_) {
        sansSpeechFallbackV12();
      }
      return;
    }
    startAudio();
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = base + (Math.floor(speechChars) % 3) * 13;
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .045);
  }`;

  const drawBlasterHeadV12 = `  function drawBlasterHead(bullet, active) {
    if (bullet.age < (bullet.visibleAt || 0)) return;
    const arena = battleArena();
    const warning = Math.max(.05, bullet.warning || .36);
    const visibleAt = bullet.visibleAt || 0;
    const charge = clamp01((bullet.age - visibleAt) / Math.max(.05, warning - visibleAt));
    const activeLife = Math.max(.12, bullet.life - warning);
    const fire = active ? clamp01((bullet.age - warning) / activeLife) : 0;
    const hasRecordedStart = Number.isFinite(bullet.blasterStartX) && Number.isFinite(bullet.blasterStartY);
    let headX = bullet.x;
    let headY = bullet.y;
    let rotation = 0;

    if (bullet.orientation === 'horizontal') {
      const fromRight = bullet.side === 'right';
      headX = fromRight ? arena.right + 10 : arena.left - 10;
      headY = bullet.y;
      rotation = fromRight ? Math.PI / 2 : -Math.PI / 2;
    } else if (bullet.orientation === 'vertical') {
      const fromBottom = bullet.side === 'bottom';
      headX = bullet.x;
      headY = fromBottom ? arena.bottom + 10 : arena.top - 10;
      rotation = fromBottom ? Math.PI : 0;
    } else {
      const travel = hasRecordedStart ? 1 - Math.pow(1 - clamp01(charge / .78), 3) : 1;
      headX = hasRecordedStart ? bullet.blasterStartX + (bullet.x - bullet.blasterStartX) * travel : bullet.x;
      headY = hasRecordedStart ? bullet.blasterStartY + (bullet.y - bullet.blasterStartY) * travel : bullet.y;
      rotation = bullet.angle - Math.PI / 2;
      if (active) {
        const recoil = Math.sin(Math.min(1, fire * 2.4) * Math.PI) * 3.2;
        headX -= Math.cos(bullet.angle) * recoil;
        headY -= Math.sin(bullet.angle) * recoil;
      }
    }

    let frame;
    if (!active) frame = Math.min(7, Math.floor(charge * 8));
    else if (fire < .72) frame = 8 + Math.min(7, Math.floor(fire / .72 * 8));
    else frame = 16 + Math.min(5, Math.floor((fire - .72) / .28 * 6));

    const sizeFactor = bullet.blasterSize >= 2 ? 1.72 : bullet.blasterSize <= 0 ? .74 : 1;
    const targetHeight = Math.round(45 * sizeFactor);
    const targetWidth = Math.round(targetHeight * 220 / 321);
    const appear = smoothstep01(charge / .22);
    const disappear = active && fire > .82 ? 1 - smoothstep01((fire - .82) / .18) : 1;
    const pulseScale = (.88 + smoothstep01(charge) * .12) * (active && fire > .82 ? .88 + disappear * .12 : 1);

    g.save();
    g.translate(headX, headY);
    g.rotate(rotation);
    g.scale(pulseScale, pulseScale);
    const drawn = drawSheetFrameV12(gasterSheetV12, gasterSheetMetaV12, frame,
      -Math.round(targetWidth / 2), -Math.round(targetHeight * .60),
      targetWidth, targetHeight, appear * disappear);
    if (!drawn) {
      const directGif = window.__userGasterGifPreloaded?.complete && window.__userGasterGifPreloaded.naturalWidth
        ? window.__userGasterGifPreloaded : null;
      const fallback = directGif || blasterAnimationFrames[Math.min(blasterAnimationFrames.length - 1,
        Math.round(frame / 21 * (blasterAnimationFrames.length - 1)))] || blasterReferenceImage;
      if (fallback?.complete && fallback.naturalWidth) {
        g.globalAlpha = appear * disappear;
        g.drawImage(fallback, -targetWidth / 2, -targetHeight * .60, targetWidth, targetHeight);
      }
    }
    if (charge > .64 && fire < .92) {
      const mouthY = Math.round(targetHeight * .17);
      const core = Math.max(3, Math.round((bullet.thickness || 5) / Math.max(.4, pulseScale)));
      g.globalAlpha = active ? disappear : smoothstep01((charge - .64) / .36) * .75;
      rect(-Math.floor(core / 2), mouthY, core, active ? 4 : 2, active ? '#fff' : '#d7fbff');
    }
    g.restore();
  }`;

  const drawSoulBreakV12 = `  function drawSoulBreak(now) {
    rect(0, 0, W, H, '#000');
    const elapsed = now - defeatAt;
    const cx = 160;
    const cy = 90;
    const scale = 1;
    const width = SOUL_PIXELS[0].length * scale;
    const height = SOUL_PIXELS.length * scale;
    const drawPiece = (leftSide, ox, oy, alpha = 1) => {
      g.globalAlpha = alpha;
      for (let row = 0; row < SOUL_PIXELS.length; row++) {
        for (let col = 0; col < SOUL_PIXELS[row].length; col++) {
          if (SOUL_PIXELS[row][col] !== '1') continue;
          const isLeft = col < SOUL_PIXELS[row].length / 2;
          if (isLeft !== leftSide) continue;
          rect(cx - width / 2 + col * scale + ox,
            cy - height / 2 + row * scale + oy, scale, scale, '#f5222d');
        }
      }
      g.globalAlpha = 1;
    };

    if (elapsed < 430) {
      drawPiece(true, 0, 0);
      drawPiece(false, 0, 0);
      return;
    }
    if (elapsed < 760) {
      const p = smoothstep01((elapsed - 430) / 330);
      drawPiece(true, -Math.round(p * 4), Math.round(p * 2));
      drawPiece(false, Math.round(p * 4), Math.round(p * 2));
      return;
    }

    const t = (elapsed - 760) / 1000;
    const shards = [
      [-4,-3,-31,-34],[-1,-4,-10,-43],[2,-4,13,-40],[4,-2,35,-30],
      [-5,1,-43,2],[5,1,44,4],[-3,4,-25,35],[1,5,8,42],[4,4,31,32]
    ];
    const alpha = Math.max(0, 1 - t / .85);
    for (const [ox,oy,vx,vy] of shards) {
      g.globalAlpha = alpha;
      rect(cx + ox + vx * t, cy + oy + vy * t + 32 * t * t, 2, 2, '#f5222d');
    }
    g.globalAlpha = 1;
  }`;

  const defeatSoundV12 = `  function playDefeatSound() {
    startAudio();
    window.setTimeout(() => {
      if (state !== 'soulBreak') return;
      beep(235, .10);
      beep(176, .13);
    }, 420);
    window.setTimeout(() => {
      if (state !== 'soulBreak') return;
      if (audio && audio.state === 'running') {
        playNoiseBurst(.16, .07, 720);
        playSweepSound('square', 520, 92, .14, .05);
      } else {
        beep(92, .20);
      }
    }, 760);
  }`;

  function patchFirstAttack(source) {
    let s = source;
    s = s.replace("once('s0-slam', .36, () => {", "once('s0-slam', .30, () => {");
    s = s.replaceAll("spawnRecordedBlaster(1, ...args, .333, .266)",
      "spawnRecordedBlaster(1, ...args, .390, .245)");
    s = s.replace("spawnRecordedBlaster(2, 0, 240, 139, 306, 0, .666, .5);",
      "spawnRecordedBlaster(2, 0, 240, 139, 306, 0, .700, .470);");
    s = s.replace("spawnRecordedBlaster(2, 640, 240, 499, 306, 180, .666, .5);",
      "spawnRecordedBlaster(2, 640, 240, 499, 306, 180, .700, .470);");
    return s;
  }

  function patchDefeatDuration(source) {
    return source
      .replace("if (now - defeatAt > 2250) setState('defeat');",
        "if (now - defeatAt > 1800) setState('defeat');")
      .replace("if (now - defeatAt > 1750) setState('defeat');",
        "if (now - defeatAt > 1800) setState('defeat');");
  }

  window.applySansFidelityV12 = source => {
    let result = String(source || '');
    result = injectSupport(result);
    result = replaceFunction(result, 'drawSans', drawSansV12);
    result = replaceFunction(result, 'speechBlip', speechBlipV12);
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterHeadV12);
    result = replaceFunction(result, 'drawSoulBreak', drawSoulBreakV12);
    result = replaceFunction(result, 'playDefeatSound', defeatSoundV12);
    result = patchFirstAttack(result);
    result = patchDefeatDuration(result);
    return result;
  };
})();