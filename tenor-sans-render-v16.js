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

  const drawSansV16 = `  function drawSans(x, y, t) {
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

    const tenorIdle = window.__tenorSansBattleV16;
    const tenorHandUp = window.__tenorSansHandUpV16;
    const useGesture = attackPoseState
      && t >= sansGestureStartedAt && t <= sansGestureUntil
      && tenorHandUp?.complete && tenorHandUp.naturalWidth;

    if (resting && sansSleepImage.complete && sansSleepImage.naturalWidth) {
      const scale = Math.min(42 / sansSleepImage.naturalWidth, 55 / sansSleepImage.naturalHeight);
      drawAnchoredSprite(sansSleepImage, sansSleepImage.naturalWidth / 2,
        sansSleepImage.naturalHeight, footX, footY, 1, false, scale);
      return;
    }

    const sprite = useGesture ? tenorHandUp : tenorIdle;
    if (sprite?.complete && sprite.naturalWidth && sprite.naturalHeight) {
      const targetH = useGesture ? 58 : 55;
      const targetW = Math.round(targetH * sprite.naturalWidth / sprite.naturalHeight);
      g.save();
      g.imageSmoothingEnabled = false;
      g.drawImage(sprite, footX - Math.round(targetW / 2), footY - targetH, targetW, targetH);
      g.restore();
      return;
    }

    const fallback = window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth
      ? window.__userSansGifPreloaded
      : (sansReferenceImage.complete && sansReferenceImage.naturalWidth ? sansReferenceImage : sansIdleGifImage);
    const scale = fallback.naturalWidth && fallback.naturalHeight
      ? Math.min(42 / fallback.naturalWidth, 55 / fallback.naturalHeight) : .5;
    drawAnchoredSprite(fallback, fallback.naturalWidth / 2, fallback.naturalHeight,
      footX, footY, 1, false, scale);
  }`;

  const drawBlasterV16 = `  function drawBlasterHead(bullet, active) {
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
        const recoil = Math.sin(Math.min(1, fire * 2.4) * Math.PI) * 3.4;
        headX -= Math.cos(bullet.angle) * recoil;
        headY -= Math.sin(bullet.angle) * recoil;
      }
    }

    const tenorGaster = window.__tenorGasterV16;
    const fallback = window.__userGasterGifPreloaded?.complete && window.__userGasterGifPreloaded.naturalWidth
      ? window.__userGasterGifPreloaded : blasterReferenceImage;
    const sprite = tenorGaster?.complete && tenorGaster.naturalWidth ? tenorGaster : fallback;
    if (!sprite?.complete || !sprite.naturalWidth || !sprite.naturalHeight) return;

    const sizeFactor = bullet.blasterSize >= 2 ? 1.70 : bullet.blasterSize <= 0 ? .74 : 1;
    const baseH = 48 * sizeFactor;
    const baseW = baseH * sprite.naturalWidth / sprite.naturalHeight;
    const appear = .86 + smoothstep01(charge) * .14;
    const vanish = active && fire > .84 ? Math.max(0, 1 - (fire - .84) / .16) : 1;

    g.save();
    g.translate(headX, headY);
    g.rotate(rotation);
    g.scale(appear, appear);
    g.globalAlpha = vanish;
    g.imageSmoothingEnabled = false;
    g.drawImage(sprite, -baseW / 2, -baseH * .58, baseW, baseH);

    if (charge > .62 && fire < .92) {
      const mouthY = Math.round(baseH * .18);
      const core = Math.max(3, Math.round((bullet.thickness || 5) / Math.max(.5, appear)));
      g.globalAlpha = active ? vanish : smoothstep01((charge - .62) / .38) * .72;
      rect(-Math.floor(core / 2), mouthY, core, active ? 4 : 2,
        active ? '#fff' : '#d7fbff');
    }
    g.restore();
  }`;

  window.applyTenorSansRenderV16 = source => {
    let result = String(source || '');
    result = replaceFunction(result, 'drawSans', drawSansV16);
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterV16);
    return result;
  };
})();
