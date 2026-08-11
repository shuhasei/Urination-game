(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const brace = source.indexOf('{', source.indexOf('(', at));
    if (brace < 0) return null;
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
        if (depth === 0) return { start, end: i + 1 };
      }
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  const drawBlasterHeadV21 = `  function drawBlasterHead(bullet, active) {
    if (bullet.age < (bullet.visibleAt || 0)) return;
    const arena = battleArena();
    const warning = Math.max(.01, bullet.warning || .36);
    const chargeStart = Math.min(warning - .01, Math.max(0, bullet.chargeStart || 0));
    const chargeDuration = Math.max(.01, warning - chargeStart);
    const charge = clamp01((bullet.age - chargeStart) / chargeDuration);
    const chargeEase = smoothstep01(charge);
    const appear = smoothstep01((bullet.age - (bullet.visibleAt || 0)) / .11);
    const openAmount = active ? 1 : smoothstep01((charge - .18) / .82);
    const recoil = active ? Math.sin((bullet.age - warning) * 36) * 1.15 : 0;
    const approach = (1 - appear) * 6;

    g.save();
    g.imageSmoothingEnabled = false;
    if (bullet.orientation === 'horizontal') {
      const fromRight = bullet.side === 'right';
      g.translate(
        fromRight ? arena.right + 9 + approach + recoil : arena.left - 9 - approach - recoil,
        bullet.y
      );
      g.rotate(fromRight ? Math.PI / 2 : -Math.PI / 2);
    } else if (bullet.orientation === 'vertical') {
      const fromBottom = bullet.side === 'bottom';
      g.translate(
        bullet.x,
        fromBottom ? arena.bottom + 9 + approach + recoil : arena.top - 9 - approach - recoil
      );
      if (fromBottom) g.rotate(Math.PI);
    } else {
      const hasStart = Number.isFinite(bullet.blasterStartX) && Number.isFinite(bullet.blasterStartY);
      const travelWindow = Math.max(.08, warning * .62);
      const travel = hasStart
        ? smoothstep01((bullet.age - (bullet.visibleAt || 0)) / travelWindow)
        : 1;
      const headX = hasStart
        ? bullet.blasterStartX + (bullet.x - bullet.blasterStartX) * travel
        : bullet.x;
      const headY = hasStart
        ? bullet.blasterStartY + (bullet.y - bullet.blasterStartY) * travel
        : bullet.y;
      g.translate(
        headX - Math.cos(bullet.angle) * (approach + recoil),
        headY - Math.sin(bullet.angle) * (approach + recoil)
      );
      g.rotate(bullet.angle - Math.PI / 2);
    }

    const scale = (.58 + chargeEase * .20) * Math.max(.22, appear);
    g.scale(scale, scale);
    const pulseAlpha = active
      ? .98
      : bullet.brightHead
        ? (.96 + chargeEase * .02) * appear
        : (.34 + chargeEase * .58 + Math.sin(bullet.age * 28) * .06) * appear;

    const framesReady = Array.isArray(blasterAnimationFrames)
      && blasterAnimationFrames.length
      && blasterAnimationFrames[0]?.complete
      && blasterAnimationFrames[0].naturalWidth;
    if (framesReady) {
      const frameProgress = active ? 1 : clamp01((charge - .02) / .98);
      const frameIndex = Math.max(0, Math.min(
        blasterAnimationFrames.length - 1,
        Math.round(frameProgress * (blasterAnimationFrames.length - 1))
      ));
      const frameImage = blasterAnimationFrames[frameIndex] || blasterReferenceImage;
      const sizeFactor = bullet.blasterSize >= 2 ? 1.72 : bullet.blasterSize <= 0 ? .72 : 1;
      const targetHeight = Math.round((36 + openAmount * 4) * sizeFactor);
      const targetWidth = Math.max(14,
        Math.round(frameImage.naturalWidth / frameImage.naturalHeight * targetHeight));
      const drawX = -Math.round(targetWidth / 2);
      const drawY = -Math.round(targetHeight * .58) + Math.round(openAmount * 2);
      g.globalAlpha = pulseAlpha;
      g.drawImage(frameImage, drawX, drawY, targetWidth, targetHeight);

      if (charge > .42) {
        const coreAlpha = active ? 1 : smoothstep01((charge - .42) / .58);
        g.globalAlpha = coreAlpha * appear;
        const beamThickness = stage === 10 ? Math.max(7, (bullet.thickness || 5) + 2) : 9;
        const localBeamWidth = Math.max(3, Math.round(beamThickness / Math.max(.01, scale)));
        const visibleCoreWidth = active
          ? localBeamWidth
          : Math.max(2, Math.round(localBeamWidth * chargeEase * .55));
        const mouthY = drawY + Math.round(targetHeight * .72);
        rect(-Math.floor(visibleCoreWidth / 2), mouthY,
          visibleCoreWidth, active ? 3 : 2, active ? '#fff' : '#d7fbff');
      }
      g.restore();
      return;
    }

    // Procedural fallback: never draw the external Tenor rectangle as a head.
    g.globalAlpha = pulseAlpha;
    rect(-8, -8, 16, 15, '#fff');
    rect(-6, -6, 12, 9, '#000');
    rect(-5, -5, 4, 3, '#fff');
    rect(2, -5, 4, 3, '#fff');
    rect(-2, 0, 4, 3, '#fff');
    line(-7, 4, -13, 10, '#fff', 2);
    line(7, 4, 13, 10, '#fff', 2);
    g.restore();
  }`;

  function patchConfirm(source) {
    const bounds = functionBounds(source, 'confirm');
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    if (body.includes('__LOGIN_RESCUE_V21__')) return source;
    const brace = body.indexOf('{');
    const rescue = `
    const __LOGIN_RESCUE_V21__ = true;
    if (state === 'title') {
      startAudio();
      if (playerName) {
        if (typeof loadCurrentProfile === 'function') loadCurrentProfile();
        openingPlayer.x = 131;
        openingPlayer.y = 112;
        openingPlayer.direction = 'down';
        openingPlayer.moving = false;
        openingDoorProgress = 0;
        openingDoorHold = 0;
        openingDoorActive = false;
        setState('opening');
        hint.classList.remove('visible');
        touch.classList.add('show');
      } else {
        nameDraft = '';
        setState('nameEntry');
        hint.classList.remove('visible');
        touch.classList.remove('show');
      }
      return;
    }
    if (state === 'nameEntry') {
      startAudio();
      nameDraft = sanitizePlayerName(nameDraft);
      if (!nameDraft) { beep(120, .05); return; }
      playerName = nameDraft;
      localStorage.setItem('undertalePlayerName', playerName);
      const loaded = typeof loadCurrentProfile === 'function' ? loadCurrentProfile() : false;
      if (!loaded) {
        playerLevel = 1;
        maxHp = levelMaxHp(playerLevel);
        hp = maxHp;
        items = 3;
        reviveItems = 1;
        turnCount = 0;
        pendingStage = 1;
        if (typeof createOrUpdateProfile === 'function') createOrUpdateProfile();
      }
      openingPlayer.x = 131;
      openingPlayer.y = 112;
      openingPlayer.direction = 'down';
      openingPlayer.moving = false;
      openingDoorProgress = 0;
      openingDoorHold = 0;
      openingDoorActive = false;
      setState('opening');
      hint.classList.remove('visible');
      touch.classList.add('show');
      return;
    }
`;
    const patched = body.slice(0, brace + 1) + rescue + body.slice(brace + 1);
    return source.slice(0, bounds.start) + patched + source.slice(bounds.end);
  }

  window.applySansLoginGasterFixV21 = source => {
    let result = String(source || '');
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterHeadV21);
    result = patchConfirm(result);
    return result;
  };
})();
