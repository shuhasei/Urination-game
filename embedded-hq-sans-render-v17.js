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

  const drawSansV17 = `  function drawSans(x, y, t) {
    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const finalDodge = stage === 10 && sansEndingPhase === 'awake';
    const woundedHit = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';
    const woundedDialogue = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';
    const walking = stage === 10 && sansEndingPhase === 'walking';
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
      const scale = Math.min(38 / sansSleepImage.naturalWidth, 48 / sansSleepImage.naturalHeight);
      drawAnchoredSprite(sansSleepImage, sansSleepImage.naturalWidth / 2,
        sansSleepImage.naturalHeight, footX, footY, 1, false, scale);
      return;
    }

    const gestureActive = attackPoseState
      && t >= sansGestureStartedAt && t <= sansGestureUntil
      && window.__hqHandUpV17?.complete && window.__hqHandUpV17.naturalWidth;
    const sprite = gestureActive ? window.__hqHandUpV17 : window.__hqSansV17;

    if (sprite?.complete && sprite.naturalWidth && sprite.naturalHeight) {
      // Reference recording is visibly smaller than the old 55px Sans.
      const targetH = gestureActive ? 49 : 46;
      const targetW = targetH * sprite.naturalWidth / sprite.naturalHeight;
      g.save();
      // HQ source is 2x; high-quality downsampling removes the chunky 1-bit look.
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(sprite, footX - targetW / 2, footY - targetH, targetW, targetH);
      g.restore();
      return;
    }

    const fallback = window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth
      ? window.__userSansGifPreloaded
      : (sansReferenceImage.complete && sansReferenceImage.naturalWidth ? sansReferenceImage : sansIdleGifImage);
    const scale = fallback.naturalWidth && fallback.naturalHeight
      ? Math.min(36 / fallback.naturalWidth, 46 / fallback.naturalHeight) : .5;
    drawAnchoredSprite(fallback, fallback.naturalWidth / 2, fallback.naturalHeight,
      footX, footY, 1, false, scale);
  }`;

  const drawBlasterV17 = `  function drawBlasterHead(bullet, active) {
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
        const recoil = Math.sin(Math.min(1, fire * 2.5) * Math.PI) * 3.4;
        headX -= Math.cos(bullet.angle) * recoil;
        headY -= Math.sin(bullet.angle) * recoil;
      }
    }

    const sprite = window.__hqGasterV17?.complete && window.__hqGasterV17.naturalWidth
      ? window.__hqGasterV17
      : (window.__userGasterGifPreloaded?.complete ? window.__userGasterGifPreloaded : blasterReferenceImage);
    if (!sprite?.complete || !sprite.naturalWidth || !sprite.naturalHeight) return;

    const sizeFactor = bullet.blasterSize >= 2 ? 1.65 : bullet.blasterSize <= 0 ? .72 : 1;
    const targetH = 43 * sizeFactor;
    const targetW = targetH * sprite.naturalWidth / sprite.naturalHeight;
    const appear = .86 + smoothstep01(charge) * .14;
    const vanish = active && fire > .84 ? Math.max(0, 1 - (fire - .84) / .16) : 1;

    g.save();
    g.translate(headX, headY);
    g.rotate(rotation);
    g.scale(appear, appear);
    g.globalAlpha = vanish;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(sprite, -targetW / 2, -targetH * .58, targetW, targetH);
    if (charge > .64 && fire < .92) {
      const core = Math.max(3, Math.round((bullet.thickness || 5) / Math.max(.5, appear)));
      g.globalAlpha = active ? vanish : smoothstep01((charge - .64) / .36) * .70;
      rect(-Math.floor(core / 2), Math.round(targetH * .18), core, active ? 4 : 2,
        active ? '#fff' : '#d7fbff');
    }
    g.restore();
  }`;

  window.applyEmbeddedHQSansRenderV17 = source => {
    let result = String(source || '');
    result = replaceFunction(result, 'drawSans', drawSansV17);
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterV17);
    return result;
  };
})();
