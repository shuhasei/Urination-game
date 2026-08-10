(() => {
  'use strict';

  function replaceFunction(source, name, replacement) {
    const marker = new RegExp(`(^|\n)\s*function\s+${name}\s*\(`);
    const match = marker.exec(source);
    if (!match) return source;
    const start = match.index + (match[1] ? match[1].length : 0);
    const brace = source.indexOf('{', start);
    if (brace < 0) return source;
    let depth = 0;
    let quote = null;
    let escape = false;
    for (let index = brace; index < source.length; index++) {
      const character = source[index];
      if (quote) {
        if (escape) escape = false;
        else if (character === '\\') escape = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'" || character === '`') {
        quote = character;
        continue;
      }
      if (character === '{') depth++;
      else if (character === '}') {
        depth--;
        if (depth === 0) {
          return source.slice(0, start) + replacement + source.slice(index + 1);
        }
      }
    }
    return source;
  }

  function injectRuntimeSupport(source) {
    if (source.includes('const sansGifFramesV9 = []')) return source;
    const marker = '  function drawSans(x, y, t) {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const support = `  // v9: decode the real GIF frames when WebCodecs is available.  The normal\n  // HTMLImageElement GIF remains the fallback, so animation still works on\n  // browsers without ImageDecoder.\n  const sansGifFramesV9 = [];\n  const sansGifDurationsV9 = [];\n  const gasterGifFramesV9 = [];\n  const gasterGifDurationsV9 = [];\n  let sansSpeechBufferV9 = null;\n  let sansSpeechDecodePromiseV9 = null;\n  let lastSansSpeechAtV9 = -10000;\n\n  function imageFrameDimensionsV9(image) {\n    return {\n      width: image?.naturalWidth || image?.videoWidth || image?.width || 1,\n      height: image?.naturalHeight || image?.videoHeight || image?.height || 1\n    };\n  }\n\n  function chooseTimedFrameV9(frames, durations, timeMs) {\n    if (!frames.length) return null;\n    let total = 0;\n    for (let index = 0; index < frames.length; index++) {\n      total += Math.max(20, durations[index] || 100);\n    }\n    if (total <= 0) return frames[0];\n    let cursor = ((timeMs % total) + total) % total;\n    for (let index = 0; index < frames.length; index++) {\n      cursor -= Math.max(20, durations[index] || 100);\n      if (cursor < 0) return frames[index];\n    }\n    return frames[frames.length - 1];\n  }\n\n  async function decodeGifFramesV9(image, frames, durations, label) {\n    if (!image?.src || !window.ImageDecoder || !window.createImageBitmap) return;\n    if (frames.length) return;\n    try {\n      const response = await fetch(image.src);\n      const data = await response.arrayBuffer();\n      const decoder = new ImageDecoder({ data, type: 'image/gif' });\n      await decoder.tracks.ready;\n      const track = decoder.tracks.selectedTrack;\n      const count = Math.max(1, track?.frameCount || 1);\n      for (let frameIndex = 0; frameIndex < count; frameIndex++) {\n        const result = await decoder.decode({ frameIndex });\n        const frame = result.image;\n        const bitmap = await createImageBitmap(frame);\n        frames.push(bitmap);\n        durations.push(Math.max(20, Math.round((frame.duration || 100000) / 1000)));\n        frame.close();\n      }\n      decoder.close();\n      console.info(label + ' decoded frames:', frames.length);\n    } catch (error) {\n      console.warn(label + ' frame decode fallback active.', error);\n    }\n  }\n\n  function prepareSansSpeechBufferV9() {\n    if (!audio || sansSpeechBufferV9 || sansSpeechDecodePromiseV9) return;\n    try {\n      const comma = sansSpeechBlipData.indexOf(',');\n      const binary = atob(comma >= 0 ? sansSpeechBlipData.slice(comma + 1) : sansSpeechBlipData);\n      const bytes = new Uint8Array(binary.length);\n      for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);\n      sansSpeechDecodePromiseV9 = audio.decodeAudioData(bytes.buffer.slice(0))\n        .then(buffer => { sansSpeechBufferV9 = buffer; return buffer; })\n        .catch(error => { console.warn('Sans speech decode fallback active.', error); return null; });\n    } catch (error) {\n      console.warn('Sans speech data preparation failed.', error);\n    }\n  }\n\n  function playSansSynthFallbackV9() {\n    if (!audio) return;\n    const now = audio.currentTime;\n    const oscillator = audio.createOscillator();\n    const overtone = audio.createOscillator();\n    const gain = audio.createGain();\n    const overtoneGain = audio.createGain();\n    oscillator.type = 'square';\n    overtone.type = 'triangle';\n    oscillator.frequency.setValueAtTime(118 + (Math.floor(speechChars) % 4) * 8, now);\n    overtone.frequency.setValueAtTime(72 + (Math.floor(speechChars) % 3) * 6, now);\n    gain.gain.setValueAtTime(.075, now);\n    gain.gain.exponentialRampToValueAtTime(.001, now + .065);\n    overtoneGain.gain.setValueAtTime(.035, now);\n    overtoneGain.gain.exponentialRampToValueAtTime(.001, now + .070);\n    oscillator.connect(gain);\n    overtone.connect(overtoneGain);\n    gain.connect(audio.destination);\n    overtoneGain.connect(audio.destination);\n    oscillator.start(now);\n    overtone.start(now);\n    oscillator.stop(now + .070);\n    overtone.stop(now + .074);\n  }\n\n  function playSansBufferedBlipV9() {\n    if (!audio || !sansSpeechBufferV9) return false;\n    const now = audio.currentTime;\n    const source = audio.createBufferSource();\n    const gain = audio.createGain();\n    source.buffer = sansSpeechBufferV9;\n    source.playbackRate.setValueAtTime(.66 + (Math.floor(speechChars) % 5) * .025, now);\n    gain.gain.setValueAtTime(.36, now);\n    gain.gain.exponentialRampToValueAtTime(.001, now + .085);\n    source.connect(gain);\n    gain.connect(audio.destination);\n    source.start(now, 0, Math.min(.095, sansSpeechBufferV9.duration));\n    source.stop(now + .10);\n    return true;\n  }\n\n  window.setTimeout(() => {\n    decodeGifFramesV9(sansIdleGifImage, sansGifFramesV9, sansGifDurationsV9, 'Sans GIF');\n    if (window.__userGasterGifPreloaded) {\n      decodeGifFramesV9(window.__userGasterGifPreloaded,\n        gasterGifFramesV9, gasterGifDurationsV9, 'Gaster Blaster GIF');\n    }\n  }, 0);\n\n`;
    return source.slice(0, at) + support + source.slice(at);
  }

  const drawSansV9 = `  function drawSans(x, y, t) {
    const decodedIdle = chooseTimedFrameV9(sansGifFramesV9, sansGifDurationsV9, t);
    const browserIdle = sansIdleGifImage.complete && sansIdleGifImage.naturalWidth
      ? sansIdleGifImage
      : (window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth
        ? window.__userSansGifPreloaded : null);
    const hasAnimatedIdle = Boolean(decodedIdle || browserIdle);
    // Do not fake animation by moving Sans vertically.  When a GIF is ready,
    // the actual GIF frames provide the motion.
    const idleBob = hasAnimatedIdle ? 0 : Math.round(Math.sin(t / 420));
    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const finalDodge = stage === 10 && sansEndingPhase === 'awake';
    const woundedHit = stage === 10
      && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';
    const woundedDialogue = stage === 10
      && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';
    const walking = stage === 10 && sansEndingPhase === 'walking';
    const wounded = woundedHit || woundedDialogue || walking;
    const attackPoseState = state === 'enemyTurn' || state === 'enemySpeak';
    const finalSpecial = stage === 10 && attackPattern?.finalSpecial === true && attackPoseState;

    const endingPose = finalDodge && sansFinalDodgeImage.complete && sansFinalDodgeImage.naturalWidth
      ? { image: sansFinalDodgeImage, anchorX: 65.5, anchorY: 129 }
      : woundedHit && sansWoundedSitImage.complete && sansWoundedSitImage.naturalWidth
        ? { image: sansWoundedSitImage, anchorX: 47, anchorY: 106 }
        : woundedDialogue && sansWoundedStandImage.complete && sansWoundedStandImage.naturalWidth
          ? { image: sansWoundedStandImage, anchorX: 47, anchorY: 126 }
          : walking && sansWoundedWalkGifImage.complete && sansWoundedWalkGifImage.naturalWidth
            ? { image: sansWoundedWalkGifImage, anchorX: 49, anchorY: 132 }
            : null;

    const fallbackIdle = browserIdle
      || (sansReferenceImage.complete && sansReferenceImage.naturalWidth ? sansReferenceImage : aiGeneratedSansFallbackImage);
    const baseImage = resting && sansSleepImage.complete
      ? sansSleepImage
      : finalSpecial && providedSansEyeImage.complete ? providedSansEyeImage
        : fallbackIdle;

    const poseStarted = sansGestureStartedAt;
    const poseEnds = sansGestureUntil;
    const inBlend = smoothstep01((t - poseStarted) / 18);
    const outBlend = smoothstep01((poseEnds + 42 - t) / 42);
    const canGesture = attackPoseState && !resting && !finalDodge && !wounded;
    const poseBlend = canGesture && t >= poseStarted && t <= poseEnds + 42
      ? Math.min(inBlend, outBlend) : 0;

    const direction = sansGestureDirection;
    const horizontalPose = direction === GravityDirection.LEFT || direction === GravityDirection.RIGHT;
    const gestureImage = horizontalPose
      ? sansPointRightImage
      : direction === GravityDirection.UP ? sansHandUpImage : sansHandDownImage;
    const gestureFlip = direction === GravityDirection.LEFT;
    const footX = Math.round(x);
    const footY = Math.round(y + 40 + idleBob + (resting ? 2 : 0));
    const moveX = direction === GravityDirection.LEFT ? -2 * poseBlend
      : direction === GravityDirection.RIGHT ? 2 * poseBlend : 0;
    const moveY = direction === GravityDirection.UP ? -2 * poseBlend
      : direction === GravityDirection.DOWN ? 2 * poseBlend : 0;

    if (endingPose) {
      drawAnchoredSprite(endingPose.image, endingPose.anchorX, endingPose.anchorY,
        footX, footY, 1, false, .5);
    } else if (decodedIdle && !resting && !finalSpecial) {
      g.save();
      g.imageSmoothingEnabled = false;
      g.globalAlpha = 1 - poseBlend;
      g.drawImage(decodedIdle, footX - 20, footY - 53, 40, 53);
      g.restore();
    } else {
      const dimensions = imageFrameDimensionsV9(baseImage);
      const baseScale = Math.min(40 / dimensions.width, 53 / dimensions.height);
      drawAnchoredSprite(baseImage, dimensions.width / 2, dimensions.height,
        footX, footY, 1 - poseBlend, false, baseScale);
    }

    if (poseBlend > .001 && horizontalPose) {
      drawAnchoredSprite(gestureImage, 46, 104, footX + moveX, footY + moveY,
        poseBlend, gestureFlip, .5);
    } else if (poseBlend > .001 && direction === GravityDirection.UP) {
      drawAnchoredSprite(gestureImage, 46, 108, footX + moveX, footY + moveY,
        poseBlend, false, .5);
    } else if (poseBlend > .001) {
      drawAnchoredSprite(gestureImage, 47, 104, footX + moveX, footY + moveY,
        poseBlend, false, .5);
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
      for (let index = 0; index < 3; index++) {
        g.globalAlpha = index <= cycle ? 1 : .28;
        text('Z', footX + 12 + index * 7, footY - 43 - index * 7,
          7 - index, '#fff', 'center');
      }
      g.globalAlpha = 1;
    }

    if (wounded && !endingPose) {
      line(footX - 11, footY - 31, footX + 10, footY - 9, '#5a0008', 4);
      line(footX - 10, footY - 31, footX + 10, footY - 10, '#f12438', 2);
      rect(footX + 7, footY - 8, 3, 4, '#d8172c');
      rect(footX + 8, footY - 3, 2, 3, '#a70f1f');
    }
  }`;

  const speechBlipV9 = `  function speechBlip() {
    startAudio();
    if (!audio) return;
    const isSans = speakingEnemy?.visual === 'sans';
    if (isSans) {
      const now = audio.currentTime;
      if (now - lastSansSpeechAtV9 < .030) return;
      lastSansSpeechAtV9 = now;
      prepareSansSpeechBufferV9();
      if (!playSansBufferedBlipV9()) playSansSynthFallbackV9();
      return;
    }

    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(base + (Math.floor(speechChars) % 3) * 13,
      audio.currentTime);
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .045);
  }`;

  const drawBlasterHeadV9 = `  function drawBlasterHead(bullet, active) {
    if (bullet.age < (bullet.visibleAt || 0)) return;
    const arena = battleArena();
    const warning = Math.max(.05, bullet.warning || .35);
    const visibleAt = bullet.visibleAt || 0;
    const chargeProgress = clamp01((bullet.age - visibleAt) / Math.max(.05, warning - visibleAt));
    const fireProgress = active
      ? clamp01((bullet.age - warning) / Math.max(.08, bullet.life - warning)) : 0;
    const hasRecordedStart = Number.isFinite(bullet.blasterStartX)
      && Number.isFinite(bullet.blasterStartY);

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
      const travel = hasRecordedStart
        ? 1 - Math.pow(1 - clamp01(chargeProgress / .82), 3)
        : 1;
      headX = hasRecordedStart
        ? bullet.blasterStartX + (bullet.x - bullet.blasterStartX) * travel
        : bullet.x;
      headY = hasRecordedStart
        ? bullet.blasterStartY + (bullet.y - bullet.blasterStartY) * travel
        : bullet.y;
      rotation = bullet.angle - Math.PI / 2;
    }

    const settle = smoothstep01(chargeProgress / .86);
    const recoil = active ? Math.sin(Math.min(1, fireProgress * 2.2) * Math.PI) * 2.6 : 0;
    if (bullet.orientation === 'angled') {
      headX -= Math.cos(bullet.angle) * recoil;
      headY -= Math.sin(bullet.angle) * recoil;
    }

    let referenceFrame = 0;
    if (!active) {
      referenceFrame = Math.min(7, Math.floor(chargeProgress * 8));
    } else if (fireProgress < .72) {
      referenceFrame = 8 + Math.min(6, Math.floor((fireProgress / .72) * 7));
    } else {
      referenceFrame = 15 + Math.min(6, Math.floor(((fireProgress - .72) / .28) * 7));
    }

    let frames = gasterGifFramesV9.length ? gasterGifFramesV9 : blasterAnimationFrames;
    if (!frames?.length) frames = [blasterReferenceImage];
    const mappedIndex = Math.max(0, Math.min(frames.length - 1,
      Math.round(referenceFrame / 21 * (frames.length - 1))));
    const frameImage = frames[mappedIndex] || blasterReferenceImage;
    const dimensions = imageFrameDimensionsV9(frameImage);
    const sizeFactor = bullet.blasterSize >= 2 ? 1.72 : bullet.blasterSize <= 0 ? .76 : 1;
    const targetHeight = Math.round(43 * sizeFactor);
    const targetWidth = Math.max(14, Math.round(dimensions.width / dimensions.height * targetHeight));
    const tailShrink = active && fireProgress > .76
      ? 1 - smoothstep01((fireProgress - .76) / .24) * .62 : 1;
    const entryScale = .88 + settle * .12;
    const alpha = active && fireProgress > .82
      ? Math.max(0, 1 - (fireProgress - .82) / .18) : 1;

    g.save();
    g.imageSmoothingEnabled = false;
    g.translate(headX, headY);
    g.rotate(rotation);
    g.scale(entryScale * tailShrink, entryScale * tailShrink);
    g.globalAlpha = alpha;
    g.drawImage(frameImage,
      -Math.round(targetWidth / 2), -Math.round(targetHeight * .58),
      targetWidth, targetHeight);

    if (chargeProgress > .68 && fireProgress < .90) {
      const mouthY = Math.round(targetHeight * .18);
      const coreWidth = Math.max(3, Math.round((bullet.thickness || 5) / Math.max(.4, entryScale)));
      g.globalAlpha = active ? 1 : smoothstep01((chargeProgress - .68) / .32) * .75;
      rect(-Math.floor(coreWidth / 2), mouthY, coreWidth, active ? 4 : 2,
        active ? '#fff' : '#d7fbff');
    }
    g.restore();
  }`;

  const drawSoulBreakV9 = `  function drawSoulBreak(now) {
    rect(0, 0, W, H, '#000');
    const elapsed = now - defeatAt;
    const cx = 160;
    const cy = 90;
    const scale = 1;
    const width = SOUL_PIXELS[0].length * scale;
    const height = SOUL_PIXELS.length * scale;

    const drawHalf = (side, offsetX, offsetY, alpha = 1) => {
      g.globalAlpha = alpha;
      for (let row = 0; row < SOUL_PIXELS.length; row++) {
        for (let col = 0; col < SOUL_PIXELS[row].length; col++) {
          if (SOUL_PIXELS[row][col] !== '1') continue;
          const leftHalf = col < SOUL_PIXELS[row].length / 2;
          if ((side < 0 && !leftHalf) || (side > 0 && leftHalf)) continue;
          const x = cx - width / 2 + col * scale + offsetX;
          const y = cy - height / 2 + row * scale + offsetY;
          rect(x, y, scale, scale, '#f51d31');
        }
      }
      g.globalAlpha = 1;
    };

    if (elapsed < 420) {
      drawHalf(-1, 0, 0);
      drawHalf(1, 0, 0);
      return;
    }

    if (elapsed < 700) {
      const split = smoothstep01((elapsed - 420) / 280);
      drawHalf(-1, -Math.round(split * 3), Math.round(split));
      drawHalf(1, Math.round(split * 3), Math.round(split));
      return;
    }

    const seconds = (elapsed - 700) / 1000;
    const fragments = [
      [-3,-3,-28,-34,2,2], [1,-4,10,-38,2,2], [4,-2,34,-24,2,2],
      [-5,0,-42,-5,2,2], [5,1,42,3,2,2], [-3,3,-26,31,2,2],
      [1,4,9,38,2,2], [4,3,31,27,2,2]
    ];
    const alpha = Math.max(0, 1 - seconds / .82);
    for (const [ox, oy, vx, vy, fw, fh] of fragments) {
      g.globalAlpha = alpha;
      rect(cx + ox + vx * seconds, cy + oy + vy * seconds, fw, fh, '#f51d31');
    }
    g.globalAlpha = 1;
  }`;

  const playDefeatSoundV9 = `  function playDefeatSound() {
    startAudio();
    if (!audio) return;
    window.setTimeout(() => {
      if (state !== 'soulBreak') return;
      playSweepSound('square', 245, 120, .10, .050);
    }, 390);
    window.setTimeout(() => {
      if (state !== 'soulBreak') return;
      playNoiseBurst(.16, .070, 520);
      playSweepSound('square', 520, 105, .14, .045);
      playSweepSound('triangle', 760, 170, .11, .025);
    }, 690);
  }`;

  function patchSoulBreakDuration(source) {
    return source.replace(
      "if (now - defeatAt > 2250) setState('defeat');",
      "if (now - defeatAt > 1750) setState('defeat');"
    );
  }

  function patchFirstSansAttack(source) {
    return source
      .replace(".forEach(args => spawnRecordedBlaster(1, ...args, .333, .266));",
        ".forEach(args => spawnRecordedBlaster(1, ...args, .380, .250));")
      .replace(".forEach(args => spawnRecordedBlaster(1, ...args, .333, .266));",
        ".forEach(args => spawnRecordedBlaster(1, ...args, .380, .250));")
      .replace(".forEach(args => spawnRecordedBlaster(1, ...args, .333, .266));",
        ".forEach(args => spawnRecordedBlaster(1, ...args, .380, .250));")
      .replace("spawnRecordedBlaster(2, 0, 240, 139, 306, 0, .666, .5);",
        "spawnRecordedBlaster(2, 0, 240, 139, 306, 0, .700, .480);")
      .replace("spawnRecordedBlaster(2, 640, 240, 499, 306, 180, .666, .5);",
        "spawnRecordedBlaster(2, 640, 240, 499, 306, 180, .700, .480);");
  }

  window.applySansFidelityV9 = source => {
    let result = String(source || '');
    result = injectRuntimeSupport(result);
    result = replaceFunction(result, 'drawSans', drawSansV9);
    result = replaceFunction(result, 'speechBlip', speechBlipV9);
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterHeadV9);
    result = replaceFunction(result, 'drawSoulBreak', drawSoulBreakV9);
    result = replaceFunction(result, 'playDefeatSound', playDefeatSoundV9);
    result = patchSoulBreakDuration(result);
    result = patchFirstSansAttack(result);
    return result;
  };
})();