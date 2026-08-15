(() => {
  'use strict';

  const VERSION = '20260815-sans-dialogue-blaster-fairness-v38';
  const pixelFont = new FontFace(
    'DotGothic16',
    'url(https://fonts.gstatic.com/s/dotgothic16/v21/v6-QGYjBJFKgyw5nSoDAGE7L.ttf)',
    { style: 'normal', weight: '400', display: 'swap' }
  );
  pixelFont.load().then(font => document.fonts.add(font)).catch(() => {});

  function functionBounds(source, name) {
    const marker = 'function ' + name + '(';
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const brace = source.indexOf('{', at + marker.length);
    let depth = 0, quote = null, escape = false;
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
      else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) throw new Error('v38 could not locate ' + name);
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  const drawMessageBoxV38 = String.raw`  function drawMessageBox() {
    const sansSpeech = stage === 10 && state === 'enemySpeak' && speakingEnemy?.type === 'sans';
    if (sansSpeech) {
      const x = 184, y = 18, w = 122, h = 55;
      rect(x + 3, y, w - 6, h, '#fff');
      rect(x, y + 3, w, h - 6, '#fff');
      g.save();
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(x + 2, y + 30);
      g.lineTo(x - 12, y + 38);
      g.lineTo(x + 2, y + 43);
      g.closePath();
      g.fill();
      g.restore();
      visibleSpeechRows().forEach((row, index) =>
        text(row.replace(/^[^A-Za-z0-9\u3040-\u30ff\u3400-\u9fff]*/, ''),
          x + 8, y + 7 + index * 13, 8, '#000', 'left'));
      if (speechChars >= message.join('').length) {
        text(String.fromCharCode(0x25bc), x + w - 11, y + h - 13, 7, '#000', 'center');
      }
      return;
    }
    // Narration, warnings, MISS and the opening "bad time" premonition belong
    // in the lower battle text box, never in Sans' speech balloon.
    const x = stage === 10 ? 31 : 73;
    const y = stage === 10 ? 87 : 91;
    const w = stage === 10 ? 258 : 224;
    const h = stage === 10 ? 55 : 53;
    rect(x, y, w, h, '#fff');
    rect(x + 3, y + 3, w - 6, h - 6, '#000');
    visibleSpeechRows().forEach((row, index) => text(row, x + 11, y + 6 + index * 13, 8));
  }`;

  const textV38 = String.raw`  function text(value, x, y, size = 8, color = '#fff', align = 'left') {
    const readableSize = Math.max(8, Math.round(size));
    g.save();
    g.imageSmoothingEnabled = false;
    g.font = '400 ' + readableSize + 'px "DotGothic16","MS Gothic","Yu Gothic UI",monospace';
    g.textAlign = align;
    g.textBaseline = 'top';
    g.fillStyle = color;
    for (const [i, row] of String(value).split('\n').entries()) {
      g.fillText(row, Math.round(x), Math.round(y + i * (readableSize + 3)));
    }
    g.restore();
  }`;

  const rebuildBlockV38 = String.raw`  function rebuildSansBlockV36(block, attackIndex) {
    const rebuilt = { ...block, videoAttackIndexV36: attackIndex };
    if (block.options) rebuilt.options = { ...block.options };
    // One consistent playable corridor: about 1.8-3 heart widths. This removes
    // both impossible slits and empty, oversized lanes without changing timing.
    if (rebuilt.type === 'SINE') {
      rebuilt.options.opening = Math.max(27, Math.min(32, rebuilt.options.opening || 29));
      rebuilt.options.spacing = Math.max(15, Math.min(20, rebuilt.options.spacing || 17));
    }
    if (rebuilt.type === 'BONE_V_REPEAT' || rebuilt.type === 'BONE_H_REPEAT') {
      rebuilt.spacing = Math.max(26, Math.min(56, rebuilt.spacing || 34));
    }
    if (rebuilt.type === 'BONE_V') {
      const zoneHeights = { wide: 140, wideTall: 160, secondWide: 115, secondMid: 115, medium: 205, square: 165, sineSquare: 165 };
      const zoneHeight = zoneHeights[rebuilt.zone] || 140;
      rebuilt.height = Math.max(16, Math.min(zoneHeight * .70, rebuilt.height || 16));
    }
    if (rebuilt.type === 'BONE_V_GROUP') {
      const zoneHeights = { wide: 140, wideTall: 160, secondWide: 115, secondMid: 115, medium: 205, square: 165, sineSquare: 165 };
      const limit = (zoneHeights[rebuilt.zone] || 140) * .70;
      rebuilt.bones = rebuilt.bones.map(v => [v[0], v[1], Math.max(16, Math.min(limit, v[2])), ...v.slice(3)]);
    }
    if (rebuilt.type === 'FLOOR' || rebuilt.type === 'EDGE') {
      rebuilt.options.gapRadius = Math.max(11, Math.min(15, rebuilt.options.gapRadius || 13));
      rebuilt.options.spacing = Math.max(9, Math.min(13, rebuilt.options.spacing || 11));
    }
    if (rebuilt.type === 'TUNNEL') rebuilt.options.speed = Math.min(112, rebuilt.options.speed || 112);
    return Object.freeze(rebuilt);
  }`;

  const drawBlasterHeadV38 = String.raw`  function drawBlasterHead(bullet, active) {
    if (bullet.age < (bullet.visibleAt || 0)) return;
    const frames = blasterAnimationFrames;
    const fallback = window.__SANS_ATTACK_ASSETS_V36?.blasterCharge || blasterReferenceImage;
    const imageReady = frames[0]?.complete && frames[0]?.naturalWidth;
    const warning = Math.max(.01, bullet.warning);
    const chargeStart = Math.min(warning - .01, Math.max(0, bullet.chargeStart || 0));
    const charge = clamp01((bullet.age - chargeStart) / Math.max(.01, warning - chargeStart));
    const appear = smoothstep01((bullet.age - (bullet.visibleAt || 0)) / .11);
    const openAmount = active ? 1 : smoothstep01((charge - .18) / .82);
    const recoil = active ? Math.sin((bullet.age - warning) * 36) * 1.15 : 0;
    const approach = (1 - appear) * 6;
    const arena = battleArena();
    let beamAngle = 0, headX = bullet.x, headY = bullet.y;
    if (bullet.orientation === 'horizontal') {
      const fromRight = bullet.side === 'right';
      beamAngle = fromRight ? Math.PI : 0;
      headX = fromRight ? arena.right + 9 : arena.left - 9;
      headY = bullet.y;
    } else if (bullet.orientation === 'vertical') {
      const fromBottom = bullet.side === 'bottom';
      beamAngle = fromBottom ? -Math.PI / 2 : Math.PI / 2;
      headX = bullet.x;
      headY = fromBottom ? arena.bottom + 9 : arena.top - 9;
    } else {
      beamAngle = Number.isFinite(bullet.angle) ? bullet.angle : 0;
      const hasStart = Number.isFinite(bullet.blasterStartX) && Number.isFinite(bullet.blasterStartY);
      const travel = hasStart ? smoothstep01((bullet.age - (bullet.visibleAt || 0)) / Math.max(.08, warning * .62)) : 1;
      headX = hasStart ? bullet.blasterStartX + (bullet.x - bullet.blasterStartX) * travel : bullet.x;
      headY = hasStart ? bullet.blasterStartY + (bullet.y - bullet.blasterStartY) * travel : bullet.y;
    }
    g.save();
    g.imageSmoothingEnabled = false;
    g.translate(headX - Math.cos(beamAngle) * (approach + recoil), headY - Math.sin(beamAngle) * (approach + recoil));
    // The source head opens downward. Rotate its open mouth exactly onto the beam.
    g.rotate(beamAngle - Math.PI / 2);
    const scale = (.58 + smoothstep01(charge) * .20) * Math.max(.22, appear);
    g.scale(scale, scale);
    const frameProgress = active ? 1 : clamp01((charge - .02) / .98);
    const frameIndex = Math.max(0, Math.min(frames.length - 1, Math.round(frameProgress * (frames.length - 1))));
    const frame = imageReady ? frames[frameIndex] : fallback;
    if (frame?.complete && frame.naturalWidth) {
      const sizeFactor = bullet.blasterSize >= 2 ? 1.72 : bullet.blasterSize <= 0 ? .72 : 1;
      const h = Math.round((36 + openAmount * 4) * sizeFactor);
      const w = Math.max(14, Math.round(frame.naturalWidth / frame.naturalHeight * h));
      g.globalAlpha = active ? .98 : (.38 + smoothstep01(charge) * .58) * appear;
      g.drawImage(frame, -Math.round(w / 2), -Math.round(h * .58) + Math.round(openAmount * 2), w, h);
    }
    g.restore();
  }`;

  window.applySansDialogueBlasterFairnessV38 = source => {
    let result = String(source || '');
    result = replaceFunction(result, 'text', textV38);
    result = replaceFunction(result, 'drawMessageBox', drawMessageBoxV38);
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterHeadV38);
    result = replaceFunction(result, 'rebuildSansBlockV36', rebuildBlockV38);

    // Match the two-row construction structurally. Avoid localized literals so
    // repository or terminal encoding can never disable this separation.
    const mixedSpeech = /setState\('enemySpeak',\s*\[\s*'[^']*'\s*\+\s*attacker\.name\s*\+\s*'[^']*'\s*\+\s*battleLine\s*\+\s*'[^']*',\s*'[^']*'\s*\]\s*\);/;
    if (!mixedSpeech.test(result)) throw new Error('v38 could not separate Sans speech from narration');
    result = result.replace(mixedSpeech, "setState('enemySpeak', [battleLine]);");
    return result;
  };

  document.documentElement.dataset.sansV38 = 'ready';
  console.info('Sans dialogue/blaster/fairness v38 ready:', VERSION);
})();

