(() => {
  'use strict';

  function replaceFunction(source, name, replacement) {
    const token = `function ${name}`;
    let from = 0;
    while (from < source.length) {
      const at = source.indexOf(token, from);
      if (at < 0) return source;
      const paren = source.indexOf('(', at + token.length);
      const brace = source.indexOf('{', paren);
      if (paren < 0 || brace < 0) return source;
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
          if (depth === 0) {
            const lineStart = source.lastIndexOf('\n', at) + 1;
            return source.slice(0, lineStart) + replacement + source.slice(i + 1);
          }
        }
      }
      from = at + token.length;
    }
    return source;
  }

  function injectHelpers(source) {
    if (source.includes('const sansRasterDecodedV13 =')) return source;
    const marker = '  function drawSans(x, y, t) {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const sansRasterDecodedV13 = [];\n  const gasterRasterDecodedV13 = [];\n\n  function decodeRasterFrameV13(encoded, width, height) {\n    const binary = atob(encoded);\n    const bytes = new Uint8Array(binary.length);\n    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);\n    const pixels = new Uint8Array(width * height);\n    for (let index = 0; index < pixels.length; index++) {\n      pixels[index] = (bytes[index >> 3] >> (7 - (index & 7))) & 1;\n    }\n    return pixels;\n  }\n\n  function ensureRasterFramesV13(meta, cache) {\n    if (!meta || cache.length === meta.frames.length) return cache;\n    cache.length = 0;\n    for (const encoded of meta.frames) cache.push(decodeRasterFrameV13(encoded, meta.width, meta.height));\n    return cache;\n  }\n\n  function timedRasterFrameIndexV13(meta, timeMs) {\n    if (!meta?.frames?.length) return 0;\n    let total = 0;\n    for (let i = 0; i < meta.frames.length; i++) total += Math.max(20, meta.durations?.[i] || 100);\n    let cursor = ((timeMs % total) + total) % total;\n    for (let i = 0; i < meta.frames.length; i++) {\n      cursor -= Math.max(20, meta.durations?.[i] || 100);\n      if (cursor < 0) return i;\n    }\n    return meta.frames.length - 1;\n  }\n\n  function drawRasterFrameV13(meta, cache, frameIndex, centerX, bottomY, scaleX = 1, scaleY = 1, alpha = 1) {\n    if (!meta?.frames?.length) return false;\n    ensureRasterFramesV13(meta, cache);\n    const frame = cache[Math.max(0, Math.min(cache.length - 1, frameIndex))];\n    if (!frame) return false;\n    const pixel = 1;\n    const drawW = meta.width * pixel * scaleX;\n    const drawH = meta.height * pixel * scaleY;\n    const left = centerX - drawW / 2;\n    const top = bottomY - drawH;\n    g.save();\n    g.globalAlpha = alpha;\n    g.fillStyle = '#fff';\n    for (let y = 0; y < meta.height; y++) {\n      let runStart = -1;\n      for (let x = 0; x <= meta.width; x++) {\n        const on = x < meta.width && frame[y * meta.width + x];\n        if (on && runStart < 0) runStart = x;\n        if ((!on || x === meta.width) && runStart >= 0) {\n          g.fillRect(\n            Math.round(left + runStart * scaleX),\n            Math.round(top + y * scaleY),\n            Math.max(1, Math.round((x - runStart) * scaleX)),\n            Math.max(1, Math.round(scaleY))\n          );\n          runStart = -1;\n        }\n      }\n    }\n    g.restore();\n    return true;\n  }\n\n`;
    return source.slice(0, at) + block + source.slice(at);
  }

  const drawSans = `  function drawSans(x, y, t) {
    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const finalDodge = stage === 10 && sansEndingPhase === 'awake';
    const woundedHit = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';
    const woundedDialogue = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';
    const walking = stage === 10 && sansEndingPhase === 'walking';
    const wounded = woundedHit || woundedDialogue || walking;
    const attackPoseState = state === 'enemyTurn' || state === 'enemySpeak';
    const footX = Math.round(x);
    const footY = Math.round(y + 40 + (resting ? 2 : 0));

    if (finalDodge && sansFinalDodgeImage.complete && sansFinalDodgeImage.naturalWidth) {
      drawAnchoredSprite(sansFinalDodgeImage, 65.5, 129, footX, footY, 1, false, .5);
      return;
    }
    if (woundedHit && sansWoundedSitImage.complete && sansWoundedSitImage.naturalWidth) {
      drawAnchoredSprite(sansWoundedSitImage, 47, 106, footX, footY, 1, false, .5);
      return;
    }
    if (woundedDialogue && sansWoundedStandImage.complete && sansWoundedStandImage.naturalWidth) {
      drawAnchoredSprite(sansWoundedStandImage, 47, 126, footX, footY, 1, false, .5);
      return;
    }
    if (walking && sansWoundedWalkGifImage.complete && sansWoundedWalkGifImage.naturalWidth) {
      drawAnchoredSprite(sansWoundedWalkGifImage, 49, 132, footX, footY, 1, false, .5);
      return;
    }

    if (resting && sansSleepImage.complete && sansSleepImage.naturalWidth) {
      const s = Math.min(40 / sansSleepImage.naturalWidth, 53 / sansSleepImage.naturalHeight);
      drawAnchoredSprite(sansSleepImage, sansSleepImage.naturalWidth / 2,
        sansSleepImage.naturalHeight, footX, footY, 1, false, s);
    } else {
      const frame = timedRasterFrameIndexV13(window.SANS_RASTER_V13, t);
      const drawn = drawRasterFrameV13(window.SANS_RASTER_V13, sansRasterDecodedV13,
        frame, footX, footY, 1, 1, 1);
      if (!drawn) {
        const fallback = window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth
          ? window.__userSansGifPreloaded
          : (sansReferenceImage.complete && sansReferenceImage.naturalWidth ? sansReferenceImage : sansIdleGifImage);
        const s = fallback.naturalWidth && fallback.naturalHeight
          ? Math.min(41 / fallback.naturalWidth, 53 / fallback.naturalHeight) : .5;
        drawAnchoredSprite(fallback, fallback.naturalWidth / 2, fallback.naturalHeight,
          footX, footY, 1, false, s);
      }
    }

    if (attackPoseState && t >= sansGestureStartedAt && t <= sansGestureUntil) {
      const direction = sansGestureDirection;
      const horizontal = direction === GravityDirection.LEFT || direction === GravityDirection.RIGHT;
      const gestureImage = horizontal ? sansPointRightImage
        : direction === GravityDirection.UP ? sansHandUpImage : sansHandDownImage;
      const flip = direction === GravityDirection.LEFT;
      if (gestureImage?.complete && gestureImage.naturalWidth) {
        const anchorY = direction === GravityDirection.UP ? 108 : 104;
        drawAnchoredSprite(gestureImage, 46, anchorY, footX, footY, .98, flip, .5);
      }
    }
  }`;

  const drawBlaster = `  function drawBlasterHead(bullet, active) {
    if (bullet.age < (bullet.visibleAt || 0)) return;
    const arena = battleArena();
    const warning = Math.max(.05, bullet.warning || .36);
    const visibleAt = bullet.visibleAt || 0;
    const charge = clamp01((bullet.age - visibleAt) / Math.max(.05, warning - visibleAt));
    const fire = active ? clamp01((bullet.age - warning) / Math.max(.12, bullet.life - warning)) : 0;
    const hasStart = Number.isFinite(bullet.blasterStartX) && Number.isFinite(bullet.blasterStartY);
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
      const travel = hasStart ? 1 - Math.pow(1 - clamp01(charge / .80), 3) : 1;
      headX = hasStart ? bullet.blasterStartX + (bullet.x - bullet.blasterStartX) * travel : bullet.x;
      headY = hasStart ? bullet.blasterStartY + (bullet.y - bullet.blasterStartY) * travel : bullet.y;
      rotation = bullet.angle - Math.PI / 2;
      if (active) {
        const recoil = Math.sin(Math.min(1, fire * 2.4) * Math.PI) * 3.1;
        headX -= Math.cos(bullet.angle) * recoil;
        headY -= Math.sin(bullet.angle) * recoil;
      }
    }

    let frame = 0;
    if (!active) frame = Math.min(7, Math.floor(charge * 8));
    else if (fire < .72) frame = 8 + Math.min(7, Math.floor(fire / .72 * 8));
    else frame = 16 + Math.min(5, Math.floor((fire - .72) / .28 * 6));

    const size = bullet.blasterSize >= 2 ? 1.65 : bullet.blasterSize <= 0 ? .72 : 1;
    const alpha = active && fire > .84 ? Math.max(0, 1 - (fire - .84) / .16) : 1;
    const scale = size * (.88 + smoothstep01(charge) * .12);

    g.save();
    g.translate(headX, headY);
    g.rotate(rotation);
    const drawn = drawRasterFrameV13(window.GASTER_RASTER_V13, gasterRasterDecodedV13,
      frame, 0, Math.round(45 * .60 * scale), scale, scale, alpha);
    if (!drawn) {
      const fallback = window.__userGasterGifPreloaded?.complete && window.__userGasterGifPreloaded.naturalWidth
        ? window.__userGasterGifPreloaded : blasterReferenceImage;
      if (fallback?.complete && fallback.naturalWidth) {
        g.globalAlpha = alpha;
        const h = 45 * scale;
        const w = h * fallback.naturalWidth / fallback.naturalHeight;
        g.drawImage(fallback, -w / 2, -h * .40, w, h);
      }
    }
    if (charge > .64 && fire < .92) {
      g.globalAlpha = active ? alpha : smoothstep01((charge - .64) / .36) * .7;
      const core = Math.max(3, Math.round((bullet.thickness || 5) / Math.max(.5, scale)));
      rect(-Math.floor(core / 2), Math.round(45 * .18 * scale), core, active ? 4 : 2,
        active ? '#fff' : '#d7fbff');
    }
    g.restore();
  }`;

  window.applySansRasterRenderV13 = source => {
    let result = String(source || '');
    result = injectHelpers(result);
    result = replaceFunction(result, 'drawSans', drawSans);
    result = replaceFunction(result, 'drawBlasterHead', drawBlaster);
    return result;
  };
})();