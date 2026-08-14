(() => {
  'use strict';

  const VERSION = '20260815-sans-dialogue-motion-v37';
  const idle = new Image();
  idle.src = 'sans-idle-v37.gif?v=20260815';
  const dodge = new Image();
  dodge.src = 'sans-dodge-generated-v37.gif?v=20260815';
  window.__SANS_MOTION_ASSETS_V37 = Object.freeze({ idle, dodge, version: VERSION });

  function functionBounds(source, name) {
    const marker = 'function ' + name + '(';
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const brace = source.indexOf('{', at + marker.length);
    let depth = 0, quote = null, escape = false;
    for (let index = brace; index < source.length; index++) {
      const ch = source[index];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, end: index + 1 };
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) throw new Error('v37 could not locate ' + name);
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  const drawMessageBoxV37 = String.raw`  function drawMessageBox() {
    if (stage === 10) {
      // Original-style white speech balloon beside Sans, not a full-width panel.
      const x = 184, y = 17, w = 124, h = 58;
      rect(x + 3, y, w - 6, h, '#fff');
      rect(x, y + 3, w, h - 6, '#fff');
      g.save();
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(x + 2, y + 31);
      g.lineTo(x - 11, y + 39);
      g.lineTo(x + 2, y + 44);
      g.closePath();
      g.fill();
      g.restore();
      visibleSpeechRows().forEach((row, index) => text(row, x + 9, y + 8 + index * 14, 7, '#000', 'left'));
      if (state === 'enemySpeak' && speechChars >= message.join('').length) {
        text('笆ｼ', x + w - 12, y + h - 14, 6, '#000', 'center');
      }
      return;
    }
    const x = 73, y = 91, w = 224, h = 53;
    rect(x, y, w, h, '#fff');
    rect(x + 3, y + 3, w - 6, h - 6, '#000');
    visibleSpeechRows().forEach((row, index) => text(row, x + 11, y + 6 + index * 13, 8));
    if (state === 'enemySpeak' && speechChars >= message.join('').length) {
      text('笆ｼ', x + w - 12, y + h - 15, 8, '#fff', 'center');
    }
  }`;

  const updateEnemySpeechV37 = String.raw`  function updateEnemySpeech(dt) {
    if (state !== 'enemySpeak') return;
    const fullText = message.join('');
    const key = fullText + '|' + stateAt;
    if (sansSpeechKeyV37 !== key) {
      sansSpeechKeyV37 = key;
      sansSpeechPauseUntilV37 = 0;
    }
    const now = performance.now();
    if (now < sansSpeechPauseUntilV37) return;
    const previous = Math.floor(speechChars);
    const isSans = speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans';
    speechChars = Math.min(fullText.length, speechChars + dt * (isSans ? 21 : 30));
    const current = Math.floor(speechChars);
    for (let index = previous; index < current; index++) {
      const character = fullText[index];
      if (!character) continue;
      if (/[^\s縲ゅ・ｼ・ｼ溪ｦ繝ｻ,.!?]/.test(character)) speechBlip();
      if (isSans && /[縲ゅ・.]/.test(character)) sansSpeechPauseUntilV37 = now + 115;
      if (isSans && /[・・ｼ溪ｦ!?]/.test(character)) sansSpeechPauseUntilV37 = now + 190;
    }
  }`;

  const drawBlasterHeadV37 = String.raw`  function drawBlasterHead(bullet, active) {
    const image = window.__SANS_ATTACK_ASSETS_V36?.blasterCharge;
    const arena = battleArena();
    const charge = Math.max(0, Math.min(1, bullet.age / Math.max(.01, bullet.warning)));
    const eased = 1 - Math.pow(1 - charge, 3);
    let beamAngle;
    if (Number.isFinite(bullet.angle)) beamAngle = bullet.angle;
    else if (bullet.orientation === 'horizontal') beamAngle = bullet.side === 'right' ? Math.PI : 0;
    else beamAngle = bullet.side === 'bottom' ? -Math.PI / 2 : Math.PI / 2;

    const dirX = Math.cos(beamAngle), dirY = Math.sin(beamAngle);
    let anchorX, anchorY;
    const explicitX = bullet.headX ?? bullet.originX ?? bullet.sourceX ?? bullet.blasterX;
    const explicitY = bullet.headY ?? bullet.originY ?? bullet.sourceY ?? bullet.blasterY;
    if (Number.isFinite(explicitX) && Number.isFinite(explicitY)) {
      anchorX = explicitX;
      anchorY = explicitY;
    } else if (bullet.orientation === 'horizontal') {
      anchorX = bullet.side === 'right' ? arena.right + 10 : arena.left - 10;
      anchorY = bullet.y;
    } else {
      anchorX = bullet.x;
      anchorY = bullet.side === 'bottom' ? arena.bottom + 10 : arena.top - 10;
    }

    const approach = (1 - eased) * 22;
    const recoil = active ? 3 + Math.sin((bullet.age - bullet.warning) * 36) * 1.2 : 0;
    const x = Math.round(anchorX - dirX * (approach + recoil));
    const y = Math.round(anchorY - dirY * (approach + recoil));
    const scale = bullet.size >= 2 ? 1.42 : bullet.size === 1 ? 1.16 : 1;
    g.save();
    g.imageSmoothingEnabled = false;
    g.translate(x, y);
    // Source mouth points down; rotate that vector onto the beam direction.
    g.rotate(beamAngle - Math.PI / 2);
    const chargeScale = (.74 + eased * .26) * scale;
    g.scale(chargeScale, chargeScale);
    if (image?.complete && image.naturalWidth) {
      g.globalAlpha = active ? 1 : .68 + Math.sin(bullet.age * 30) * .14;
      g.drawImage(image, -16, -22, 32, 43);
    } else if (blasterReferenceImage.complete && blasterReferenceImage.naturalWidth) {
      g.drawImage(blasterReferenceImage, -15, -19, 30, 38);
    }
    g.restore();
  }`;

  window.applySansDialogueMotionV37 = source => {
    let result = String(source || '');

    const oldDodge = `    // The supplied 19-frame MISS GIF becomes the non-looping dodge costume.
    if (dodgeElapsed >= 0 && dodgeElapsed < 2300) {
      const frame = library.frameAt(costume.idleWide, dodgeElapsed, false);
      if (switchCostume(costume.idleWide, frame, 54)) return;
    }`;
    const newDodge = `    // v37 generated dodge GIF: one 0.8 s sidestep, anchored at the feet.
    if (dodgeElapsed >= 0 && dodgeElapsed < 800) {
      const generatedDodgeV37 = window.__SANS_MOTION_ASSETS_V37?.dodge;
      if (drawImageCostume(generatedDodgeV37, 62, dodgeDirection > 0)) return;
    }`;
    if (!result.includes(oldDodge)) throw new Error('v37 could not replace dodge costume');
    result = result.replace(oldDodge, newDodge);

    const oldIdle = `    const originalIdleFramesV35 = window.__SANS_ORIGINAL_IDLE_V35 || [];
    const originalIdleFrameV35 = originalIdleFramesV35[Math.floor(scratchTime / 42) % originalIdleFramesV35.length];
    if (drawImageCostume(originalIdleFrameV35, 56)) return;`;
    const newIdle = `    const attachedIdleV37 = window.__SANS_MOTION_ASSETS_V37?.idle;
    if (drawImageCostume(attachedIdleV37, 64)) return;`;
    if (!result.includes(oldIdle)) throw new Error('v37 could not replace idle costume');
    result = result.replace(oldIdle, newIdle);

    result = replaceFunction(result, 'drawMessageBox', drawMessageBoxV37);
    const speechBounds = functionBounds(result, 'updateEnemySpeech');
    if (!speechBounds) throw new Error('v37 could not inject speech timing state');
    result = result.slice(0, speechBounds.start)
      + "  let sansSpeechPauseUntilV37 = 0;\n  let sansSpeechKeyV37 = '';\n"
      + result.slice(speechBounds.start);
    result = replaceFunction(result, 'updateEnemySpeech', updateEnemySpeechV37);
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterHeadV37);
    return result;
  };

  document.documentElement.dataset.sansV37 = 'ready';
  console.info('Sans dialogue/motion v37 ready:', VERSION);
})();
