(() => {
  'use strict';

  // MyInstants sound sources. Audio is streamed by the browser; if the host is
  // unavailable the original synthesized effects remain as a fallback.
  window.USER_SANS_VOICE_URL = window.USER_SANS_VOICE_URL
    || 'https://www.myinstants.com/media/sounds/just-sans-talking.mp3';
  window.USER_SANS_VOICE_SOURCE_PAGE = window.USER_SANS_VOICE_SOURCE_PAGE
    || 'https://www.myinstants.com/en/instant/undertale-sans-talking-84135/';
  window.USER_GASTER_SOUND_URL = window.USER_GASTER_SOUND_URL
    || 'https://www.myinstants.com/media/sounds/gaster-blaster.mp3';

  // Avoid RegExp escaping here. This file rewrites another JavaScript source
  // string, so direct declaration lookup is more robust than a generated regex.
  function replaceFunction(source, name, replacement) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return source;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const brace = source.indexOf('{', markerAt + marker.length);
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

  function injectUserImages(source) {
    if (source.includes('const room11GuideSansImage = new Image();')) return source;
    const marker = '  const sansWoundedSitImage = new Image();';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const room11GuideSansImage = new Image();\n  room11GuideSansImage.src = window.USER_SANS_GIF_DATA || 'assets/sans-idle.png';\n  const alternateSansGifImage = new Image();\n  alternateSansGifImage.src = window.USER_SANS_ALT_GIF_DATA || window.USER_SANS_GIF_DATA || '';\n  const customGasterBlasterImage = new Image();\n  customGasterBlasterImage.src = window.USER_GASTER_GIF_DATA || '';\n  const userOmegaGifImage = new Image();\n  userOmegaGifImage.src = window.USER_OMEGA_GIF_DATA || '';\n\n`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function injectUserSounds(source) {
    if (source.includes('const userSansSpeechPool =')) return source;
    const marker = '  function speechBlip() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const userSansSpeechPool = window.USER_SANS_VOICE_URL\n    ? Array.from({ length: 4 }, () => {\n      const sample = new Audio(window.USER_SANS_VOICE_URL);\n      sample.preload = 'auto';\n      sample.volume = .34;\n      return sample;\n    })\n    : [];\n  let userSansSpeechPoolIndex = 0;\n  const userGasterSoundPool = window.USER_GASTER_SOUND_URL\n    ? Array.from({ length: 4 }, () => {\n      const sample = new Audio(window.USER_GASTER_SOUND_URL);\n      sample.preload = 'auto';\n      sample.volume = .24;\n      return sample;\n    })\n    : [];\n  let userGasterSoundPoolIndex = 0;\n  let userGasterLastPlayedAt = -10000;\n  function playUserGasterSound() {\n    if (!userGasterSoundPool.length) return false;\n    const now = performance.now();\n    if (now - userGasterLastPlayedAt < 65) return true;\n    userGasterLastPlayedAt = now;\n    const sample = userGasterSoundPool[userGasterSoundPoolIndex++ % userGasterSoundPool.length];\n    sample.pause();\n    sample.currentTime = 0;\n    sample.preservesPitch = false;\n    sample.playbackRate = .97 + (userGasterSoundPoolIndex % 3) * .018;\n    sample.volume = .24;\n    sample.play().catch(() => {});\n    return true;\n  }\n\n`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchSansVoice(source) {
    const original = `    if (isSans) {\n      const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];\n      sample.pause();\n      sample.currentTime = 0;\n      sample.preservesPitch = false;\n      sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;\n      sample.play().catch(() => {});\n      window.setTimeout(() => {\n        sample.pause();\n        sample.currentTime = 0;\n      }, 74);\n      return;\n    }`;
    const polished = `    if (isSans) {\n      const externalReady = userSansSpeechPool.length\n        && userSansSpeechPool.some(sample => sample.readyState >= 2);\n      const pool = externalReady ? userSansSpeechPool : sansSpeechPool;\n      const poolIndex = externalReady ? userSansSpeechPoolIndex++ : sansSpeechPoolIndex++;\n      const sample = pool[poolIndex % pool.length];\n      sample.pause();\n      sample.currentTime = 0;\n      sample.preservesPitch = false;\n      if (externalReady) {\n        sample.volume = .34;\n        sample.playbackRate = .96 + (Math.floor(speechChars) % 4) * .018;\n      } else {\n        sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;\n      }\n      sample.play().catch(() => {});\n      window.setTimeout(() => {\n        sample.pause();\n        sample.currentTime = 0;\n      }, externalReady ? 82 : 74);\n      return;\n    }`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  function patchGasterSound(source) {
    const original = `  function playBlasterFireSound() {\n    playNoiseBurst(.22, .055, 360);\n    playSweepSound('sawtooth', 760, 62, .22, .050);\n    window.setTimeout(() => playSweepSound('square', 250, 48, .17, .030), 18);\n  }`;
    const polished = `  function playBlasterFireSound() {\n    if (playUserGasterSound()) {\n      playNoiseBurst(.10, .018, 420);\n      return;\n    }\n    playNoiseBurst(.22, .055, 360);\n    playSweepSound('sawtooth', 760, 62, .22, .050);\n    window.setTimeout(() => playSweepSound('square', 250, 48, .17, .030), 18);\n  }`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  function patchSansScale(source) {
    return source
      .replace('    const footX = x;\n    const footY = y + 40 + idleBob + (resting ? 2 : 0);',
        "    const footX = Math.round(x + Math.sin(t / 340) * .35);\n    const footY = Math.round(y + 40 + idleBob + (resting ? 2 : 0));")
      .replace('      const baseScale = 40 / Math.max(1, baseImage.naturalWidth);',
        '      const baseScale = Math.min(40 / Math.max(1, baseImage.naturalWidth), 53 / Math.max(1, baseImage.naturalHeight));');
  }

  function patchBlueSoul(source) {
    const original = `    const maximumRise = compact ? 15 : platformPhase ? 29 : 23;\n    const riseRatio = compact ? .42 : platformPhase ? .72 : .58;\n    const rise = Math.max(9, Math.min(maximumRise, clearance - 2, span * riseRatio));\n    const gravity = compact ? 390 : platformPhase ? 430 : 455;\n    return {\n      velocity: Math.max(compact ? 105 : 132,\n        Math.min(platformPhase ? 190 : 178, Math.sqrt(2 * gravity * rise))),\n      holdAccel: compact ? 120 : platformPhase ? 250 : 205,\n      holdTime: compact ? .11 : platformPhase ? .18 : .14,\n      gravity,\n      release: compact ? .50 : .58\n    };`;
    const polished = `    const sansBattle = stage === 10;\n    const maximumRise = compact ? 14 : sansBattle ? (platformPhase ? 24 : 21) : 23;\n    const riseRatio = compact ? .40 : sansBattle ? (platformPhase ? .60 : .52) : .58;\n    const rise = Math.max(8, Math.min(maximumRise, clearance - 2, span * riseRatio));\n    const gravity = compact ? 345 : sansBattle ? (platformPhase ? 300 : 275) : 455;\n    return {\n      velocity: Math.max(compact ? 96 : sansBattle ? 104 : 132,\n        Math.min(sansBattle ? (platformPhase ? 150 : 140) : 178, Math.sqrt(2 * gravity * rise))),\n      holdAccel: compact ? 108 : sansBattle ? (platformPhase ? 175 : 150) : 205,\n      holdTime: compact ? .11 : sansBattle ? (platformPhase ? .26 : .22) : .14,\n      gravity,\n      release: compact ? .46 : sansBattle ? .34 : .58\n    };`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  function patchBoneGaps(source) {
    let s = source;
    // The recorded bone-gap attack previously left only about one soul-width.
    // Widen it in source coordinates before mapping to the current arena.
    s = s.split('const heightT = 111 - heightB;').join('const heightT = 101 - heightB;');
    s = s.split('const opening = Math.max(20, options.opening || 20);')
      .join('const opening = Math.max(28, options.opening || 28);');
    // Common Sans tunnel calls: keep a visible margin around the blue soul.
    s = s.split('opening: 18,').join('opening: 24,');
    s = s.split('opening: 19,').join('opening: 25,');
    s = s.split('opening: 20,').join('opening: 26,');
    s = s.split('opening: 21,').join('opening: 27,');
    return s;
  }

  function patchFairness(source) {
    let s = source;
    // Give the player slightly more recovery before the watchdog inserts a
    // replacement tunnel, and make beam collision match the visible core more closely.
    s = s.split("now - lastThreatAt > (stage === 10 ? 650 :")
      .join("now - lastThreatAt > (stage === 10 ? 780 :");
    s = s.split('spawnAt = Math.max(spawnAt, now + 620);')
      .join('spawnAt = Math.max(spawnAt, now + 720);');
    s = s.split("const beamHitRadius = stage === 10 ? battleSoulRadius() : 6;")
      .join("const beamHitRadius = stage === 10 ? Math.max(2.2, battleSoulRadius() - .45) : 6;");
    s = s.split("< Math.max(2.35, (bullet.thickness || 5) / 2);")
      .join("< (stage === 10 ? Math.max(2.0, (bullet.thickness || 5) / 2 - .45) : Math.max(2.35, (bullet.thickness || 5) / 2));");
    return s;
  }

  function patchBlaster(source) {
    const original = `      const frameImage = blasterAnimationFrames[frameIndex] || blasterReferenceImage;\n      const sizeFactor = bullet.blasterSize >= 2\n        ? 1.72\n        : bullet.blasterSize <= 0 ? .72 : 1;\n      const targetHeight = Math.round((36 + openAmount * 4) * sizeFactor);`;
    const polished = `      const customBlasterReady = stage === 10\n        && customGasterBlasterImage.complete && customGasterBlasterImage.naturalWidth;\n      const frameImage = customBlasterReady\n        ? customGasterBlasterImage\n        : (blasterAnimationFrames[frameIndex] || blasterReferenceImage);\n      const sizeFactor = bullet.blasterSize >= 2\n        ? 1.72\n        : bullet.blasterSize <= 0 ? .72 : 1;\n      const targetHeight = Math.round(((customBlasterReady ? 42 : 36) + openAmount * 4) * sizeFactor);`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  function patchOmegaMotion(source) {
    const original = `    const t = now / 1000;\n    const amp = 1 + (mode === 'rage' ? .55 : 0) + (mode === 'glitch' ? .28 : 0);\n    omegaVideoBackfill(t, mode);\n    omegaVideoDrawBase(img, t, amp);\n    omegaVideoDrawArms(img, t, amp);\n    omegaVideoDrawCore(img, t, amp);\n    omegaVideoDrawEyes(img, t, amp);\n    omegaVideoDrawRibs(t, amp);\n    omegaVideoDrawTv(img, now, t, amp, mode);`;
    const polished = `    const t = now / 1000;\n    const amp = 1 + (mode === 'rage' ? .55 : 0) + (mode === 'glitch' ? .28 : 0);\n    const bodySway = Math.sin(t * 1.65) * (mode === 'rage' ? 2.1 : 1.25);\n    const bodyBob = Math.sin(t * 2.35) * (mode === 'rage' ? 1.6 : .9);\n    const breathe = 1 + Math.sin(t * 2.05) * (mode === 'rage' ? .012 : .007);\n    omegaVideoBackfill(t, mode);\n    g.save();\n    g.translate(160 + bodySway, 72 + bodyBob);\n    g.scale(breathe, 1 / breathe);\n    g.translate(-160, -72);\n    omegaVideoDrawBase(img, t, amp);\n    omegaVideoDrawArms(img, t, amp * 1.08);\n    omegaVideoDrawCore(img, t, amp * 1.06);\n    omegaVideoDrawEyes(img, t, amp * 1.04);\n    omegaVideoDrawRibs(t, amp * 1.10);\n    omegaVideoDrawTv(img, now, t, amp, mode);\n    if (userOmegaGifImage.complete && userOmegaGifImage.naturalWidth && (mode === 'rage' || mode === 'glitch')) {\n      g.save();\n      g.globalAlpha = mode === 'rage' ? .10 : .16;\n      g.imageSmoothingEnabled = false;\n      g.drawImage(userOmegaGifImage, 92 + Math.sin(t * 4.1) * 1.5, 4, 136, 102);\n      g.restore();\n    }\n    g.restore();`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  window.applyUserPolishHotfix = source => {
    let s = String(source || '');
    s = injectUserImages(s);
    s = injectUserSounds(s);
    s = patchSansVoice(s);
    s = patchGasterSound(s);
    s = patchSansScale(s);
    s = patchBlueSoul(s);
    s = patchBoneGaps(s);
    s = patchFairness(s);
    s = patchBlaster(s);
    s = patchOmegaMotion(s);

    s = replaceFunction(s, 'drawOmegaMasterSans', `  function drawOmegaMasterSans(x,y,now,scale=.72) {\n    g.save(); g.translate(x,y); g.scale(scale,scale);\n    const image = room11GuideSansImage.complete && room11GuideSansImage.naturalWidth\n      ? room11GuideSansImage\n      : (alternateSansGifImage.complete && alternateSansGifImage.naturalWidth ? alternateSansGifImage : null);\n    if (image) {\n      const bob = Math.sin(now / 210) * 1.15;\n      const sway = Math.sin(now / 340) * .65;\n      const imageScale = Math.min(46 / image.naturalWidth, 58 / image.naturalHeight);\n      drawAnchoredSprite(image, image.naturalWidth / 2, image.naturalHeight,\n        sway, 40 + bob, 1, false, imageScale);\n    } else {\n      drawSans(0,0,now);\n    }\n    g.restore();\n  }`);

    return s;
  };
})();