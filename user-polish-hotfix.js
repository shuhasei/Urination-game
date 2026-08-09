(() => {
  'use strict';

  // MyInstants: undertale - sans talking. Keep the remote URL in code so the
  // game uses the published sound without duplicating the MP3 binary in this repo.
  window.USER_SANS_VOICE_URL = window.USER_SANS_VOICE_URL
    || 'https://www.myinstants.com/media/sounds/just-sans-talking.mp3';
  window.USER_SANS_VOICE_SOURCE_PAGE = window.USER_SANS_VOICE_SOURCE_PAGE
    || 'https://www.myinstants.com/en/instant/undertale-sans-talking-84135/';

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
    const block = `  const room11GuideSansImage = new Image();\n  room11GuideSansImage.src = window.USER_SANS_GIF_DATA || 'assets/sans-idle.png';\n  const customGasterBlasterImage = new Image();\n  customGasterBlasterImage.src = window.USER_GASTER_GIF_DATA || '';\n\n`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function injectSansVoice(source) {
    if (source.includes('const userSansSpeechPool =')) return source;
    const marker = '  function speechBlip() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const userSansSpeechPool = window.USER_SANS_VOICE_URL\n    ? Array.from({ length: 4 }, () => {\n      const sample = new Audio(window.USER_SANS_VOICE_URL);\n      sample.preload = 'auto';\n      sample.volume = .34;\n      return sample;\n    })\n    : [];\n  let userSansSpeechPoolIndex = 0;\n\n`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchSansVoice(source) {
    const original = `    if (isSans) {\n      const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];\n      sample.pause();\n      sample.currentTime = 0;\n      sample.preservesPitch = false;\n      sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;\n      sample.play().catch(() => {});\n      window.setTimeout(() => {\n        sample.pause();\n        sample.currentTime = 0;\n      }, 74);\n      return;\n    }`;
    const polished = `    if (isSans) {\n      const externalReady = userSansSpeechPool.length\n        && userSansSpeechPool.some(sample => sample.readyState >= 2);\n      const pool = externalReady ? userSansSpeechPool : sansSpeechPool;\n      const poolIndex = externalReady ? userSansSpeechPoolIndex++ : sansSpeechPoolIndex++;\n      const sample = pool[poolIndex % pool.length];\n      sample.pause();\n      sample.currentTime = 0;\n      sample.preservesPitch = false;\n      if (externalReady) {\n        sample.volume = .34;\n        sample.playbackRate = .96 + (Math.floor(speechChars) % 4) * .018;\n      } else {\n        sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;\n      }\n      sample.play().catch(() => {});\n      window.setTimeout(() => {\n        sample.pause();\n        sample.currentTime = 0;\n      }, externalReady ? 82 : 74);\n      return;\n    }`;
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
    const polished = `    const sansBattle = stage === 10;\n    const maximumRise = compact ? 15 : platformPhase ? 29 : sansBattle ? 27 : 23;\n    const riseRatio = compact ? .42 : platformPhase ? .72 : sansBattle ? .68 : .58;\n    const rise = Math.max(9, Math.min(maximumRise, clearance - 2, span * riseRatio));\n    const gravity = compact ? 365 : platformPhase ? 390 : sansBattle ? 300 : 455;\n    return {\n      velocity: Math.max(compact ? 102 : sansBattle ? 116 : 132,\n        Math.min(platformPhase ? 188 : sansBattle ? 166 : 178, Math.sqrt(2 * gravity * rise))),\n      holdAccel: compact ? 118 : platformPhase ? 245 : sansBattle ? 250 : 205,\n      holdTime: compact ? .12 : platformPhase ? .22 : sansBattle ? .31 : .14,\n      gravity,\n      release: compact ? .48 : sansBattle ? .36 : .58\n    };`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  function patchBlaster(source) {
    const original = `      const frameImage = blasterAnimationFrames[frameIndex] || blasterReferenceImage;\n      const sizeFactor = bullet.blasterSize >= 2\n        ? 1.72\n        : bullet.blasterSize <= 0 ? .72 : 1;\n      const targetHeight = Math.round((36 + openAmount * 4) * sizeFactor);`;
    const polished = `      const customBlasterReady = stage === 10\n        && customGasterBlasterImage.complete && customGasterBlasterImage.naturalWidth;\n      const frameImage = customBlasterReady\n        ? customGasterBlasterImage\n        : (blasterAnimationFrames[frameIndex] || blasterReferenceImage);\n      const sizeFactor = bullet.blasterSize >= 2\n        ? 1.72\n        : bullet.blasterSize <= 0 ? .72 : 1;\n      const targetHeight = Math.round(((customBlasterReady ? 42 : 36) + openAmount * 4) * sizeFactor);`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  function patchOmegaMotion(source) {
    const original = `    const t = now / 1000;\n    const amp = 1 + (mode === 'rage' ? .55 : 0) + (mode === 'glitch' ? .28 : 0);\n    omegaVideoBackfill(t, mode);\n    omegaVideoDrawBase(img, t, amp);\n    omegaVideoDrawArms(img, t, amp);\n    omegaVideoDrawCore(img, t, amp);\n    omegaVideoDrawEyes(img, t, amp);\n    omegaVideoDrawRibs(t, amp);\n    omegaVideoDrawTv(img, now, t, amp, mode);`;
    const polished = `    const t = now / 1000;\n    const amp = 1 + (mode === 'rage' ? .55 : 0) + (mode === 'glitch' ? .28 : 0);\n    const bodySway = Math.sin(t * 1.65) * (mode === 'rage' ? 2.1 : 1.25);\n    const bodyBob = Math.sin(t * 2.35) * (mode === 'rage' ? 1.6 : .9);\n    const breathe = 1 + Math.sin(t * 2.05) * (mode === 'rage' ? .012 : .007);\n    omegaVideoBackfill(t, mode);\n    g.save();\n    g.translate(160 + bodySway, 72 + bodyBob);\n    g.scale(breathe, 1 / breathe);\n    g.translate(-160, -72);\n    omegaVideoDrawBase(img, t, amp);\n    omegaVideoDrawArms(img, t, amp * 1.08);\n    omegaVideoDrawCore(img, t, amp * 1.06);\n    omegaVideoDrawEyes(img, t, amp * 1.04);\n    omegaVideoDrawRibs(t, amp * 1.10);\n    omegaVideoDrawTv(img, now, t, amp, mode);\n    g.restore();`;
    return source.includes(original) ? source.replace(original, polished) : source;
  }

  window.applyUserPolishHotfix = source => {
    let s = String(source || '');
    s = injectUserImages(s);
    s = injectSansVoice(s);
    s = patchSansVoice(s);
    s = patchSansScale(s);
    s = patchBlueSoul(s);
    s = patchBlaster(s);
    s = patchOmegaMotion(s);

    s = replaceFunction(s, 'drawOmegaMasterSans', `  function drawOmegaMasterSans(x,y,now,scale=.72) {
    g.save(); g.translate(x,y); g.scale(scale,scale);
    const image = room11GuideSansImage.complete && room11GuideSansImage.naturalWidth
      ? room11GuideSansImage : null;
    if (image) {
      const bob = Math.sin(now / 210) * 1.15;
      const sway = Math.sin(now / 340) * .65;
      const imageScale = Math.min(46 / image.naturalWidth, 58 / image.naturalHeight);
      drawAnchoredSprite(image, image.naturalWidth / 2, image.naturalHeight,
        sway, 40 + bob, 1, false, imageScale);
    } else {
      drawSans(0,0,now);
    }
    g.restore();
  }`);

    return s;
  };
})();