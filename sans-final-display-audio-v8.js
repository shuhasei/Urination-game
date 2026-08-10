(() => {
  'use strict';

  // Source page requested by the project owner. The runtime falls back to the
  // existing embedded Sans blip if the remote sample cannot be played.
  const MYINSTANTS_SANS_URL = 'https://www.myinstants.com/media/sounds/just-sans-talking.mp3';

  function replaceFunction(source, name, replacement) {
    const marker = new RegExp(`(^|\\n)\\s*function\\s+${name}\\s*\\(`);
    const match = marker.exec(source);
    if (!match) return source;
    const start = match.index + (match[1] ? match[1].length : 0);
    const brace = source.indexOf('{', start);
    if (brace < 0) return source;
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
        if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
      }
    }
    return source;
  }

  function injectAudio(source) {
    if (source.includes('const sansMyInstantsSpeechPoolV8 =')) return source;
    const marker = '  function drawSans(x, y, t) {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const sansMyInstantsSpeechPoolV8 = Array.from({ length: 5 }, () => {\n    const sample = new Audio('${MYINSTANTS_SANS_URL}');\n    sample.preload = 'auto';\n    sample.volume = .30;\n    return sample;\n  });\n  let sansMyInstantsSpeechIndexV8 = 0;\n\n`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchStateReset(source) {
    const marker = `  function setState(next, lines) {\n`;
    if (!source.includes(marker) || source.includes('SANS_DISPLAY_FIX_V8_RESET')) return source;
    return source.replace(marker, `  function setState(next, lines) {\n    // SANS_DISPLAY_FIX_V8_RESET: attack poses must never survive into menus.\n    if (stage === 10 && !['enemyTurn', 'enemySpeak'].includes(next)) {\n      sansGestureStartedAt = -10000;\n      sansGestureUntil = -10000;\n      sansGestureDirection = GravityDirection.DOWN;\n    }\n`);
  }

  const drawSansV8 = `  function drawSans(x, y, t) {
    const idleBob = Math.round(Math.sin(t / 420));
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

    const cleanIdle = sansReferenceImage.complete && sansReferenceImage.naturalWidth
      ? sansReferenceImage
      : (sansIdleGifImage.complete && sansIdleGifImage.naturalWidth ? sansIdleGifImage : aiGeneratedSansFallbackImage);
    const attackIdle = sansIdleGifImage.complete && sansIdleGifImage.naturalWidth
      ? sansIdleGifImage : cleanIdle;
    const baseImage = resting && sansSleepImage.complete
      ? sansSleepImage
      : finalSpecial && providedSansEyeImage.complete ? providedSansEyeImage
        : attackPoseState ? attackIdle : cleanIdle;

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
    } else {
      const baseScale = baseImage.naturalWidth && baseImage.naturalHeight
        ? Math.min(40 / baseImage.naturalWidth, 53 / baseImage.naturalHeight) : .5;
      drawAnchoredSprite(baseImage, baseImage.naturalWidth / 2, baseImage.naturalHeight,
        footX, footY, 1 - poseBlend, false, baseScale);
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

    if (wounded && !endingPose) {
      line(footX - 11, footY - 31, footX + 10, footY - 9, '#5a0008', 4);
      line(footX - 10, footY - 31, footX + 10, footY - 10, '#f12438', 2);
      rect(footX + 7, footY - 8, 3, 4, '#d8172c');
      rect(footX + 8, footY - 3, 2, 3, '#a70f1f');
    }
  }`;

  const speechBlipV8 = `  function speechBlip() {
    startAudio();
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475, sans: 152
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const isSans = speakingEnemy?.visual === 'sans';
    if (isSans && sansMyInstantsSpeechPoolV8.length) {
      const sample = sansMyInstantsSpeechPoolV8[
        sansMyInstantsSpeechIndexV8++ % sansMyInstantsSpeechPoolV8.length
      ];
      sample.pause();
      sample.currentTime = 0;
      sample.preservesPitch = false;
      sample.volume = .30;
      sample.playbackRate = .94 + (Math.floor(speechChars) % 5) * .022;
      sample.play().catch(() => {});
      window.setTimeout(() => { sample.pause(); sample.currentTime = 0; }, 92);
      return;
    }
    if (isSans && typeof sansSpeechPool !== 'undefined' && sansSpeechPool.length) {
      const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];
      sample.pause(); sample.currentTime = 0; sample.preservesPitch = false;
      sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;
      sample.play().catch(() => {});
      window.setTimeout(() => { sample.pause(); sample.currentTime = 0; }, 74);
      return;
    }
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = base + (Math.floor(speechChars) % 3) * 13;
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + .045);
  }`;

  window.applySansFinalDisplayAudioFixV8 = source => {
    let s = String(source || '');
    s = injectAudio(s);
    s = patchStateReset(s);
    s = replaceFunction(s, 'drawSans', drawSansV8);
    s = replaceFunction(s, 'speechBlip', speechBlipV8);
    return s;
  };
})();