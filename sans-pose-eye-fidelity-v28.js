(() => {
  'use strict';

  const VERSION = '20260814-sans-pose-eye-v28';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const paren = source.indexOf('(', at + marker.length);
    if (paren < 0) return null;
    const brace = source.indexOf('{', paren);
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
      if (ch === '"' || ch === "'" || ch.charCodeAt(0) === 96) {
        quote = ch;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function patchSansPose(source) {
    const lines = [
      '  function drawSans(x, y, t) {',
      '    // Scratch-style: costumes and positions change on 30 fps ticks.',
      '    const scratchFrame = Math.floor(t / (1000 / 30));',
      '    const scratchTime = scratchFrame * (1000 / 30);',
      "    const resting = stage === 10 && sansEndingPhase === 'sleeping';",
      "    const finalDodge = stage === 10 && sansEndingPhase === 'awake';",
      "    const woundedHit = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';",
      "    const woundedDialogue = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';",
      "    const walking = stage === 10 && sansEndingPhase === 'walking';",
      "    const attackPoseState = state === 'enemyTurn' || state === 'enemySpeak';",
      "    const finalSpecial = stage === 10 && attackPattern?.finalSpecial === true;",
      "    const finalAttack = finalSpecial && state === 'enemyTurn';",
      "    const finalElapsed = finalAttack ? (t - stateAt) / 1000 : -1;",
      '    const footX = Math.round(x);',
      '    const idleStep = !attackPoseState && scratchFrame % 24 >= 12 ? 1 : 0;',
      '    const footY = Math.round(y + 40 + idleStep + (resting ? 1 : 0));',
      '    const targetH = 22;',
      '',
      '    function drawPose(image, height = targetH, alpha = 1, flip = false) {',
      '      if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return false;',
      '      const width = height * image.naturalWidth / image.naturalHeight;',
      '      g.save();',
      '      g.globalAlpha = alpha;',
      '      g.translate(footX, footY);',
      '      if (flip) g.scale(-1, 1);',
      '      g.imageSmoothingEnabled = false;',
      '      g.drawImage(image, -width / 2, -height, width, height);',
      '      g.restore();',
      '      return true;',
      '    }',
      '',
      '    if (finalDodge && drawPose(sansFinalDodgeImage, 23)) return;',
      '    if (woundedHit && drawPose(sansWoundedSitImage, 22)) return;',
      '    if (woundedDialogue && drawPose(sansWoundedStandImage, 22)) return;',
      '    if (walking && drawPose(sansWoundedWalkGifImage, 22)) return;',
      '    if (resting && drawPose(sansSleepImage, 21)) {',
      '      const cycle = Math.floor(scratchFrame / 14) % 3;',
      '      for (let i = 0; i < 3; i++) {',
      '        g.globalAlpha = i <= cycle ? 1 : .28;',
      "        text('Z', footX + 8 + i * 5, footY - 21 - i * 5, 5, '#fff', 'center');",
      '      }',
      '      g.globalAlpha = 1;',
      '      return;',
      '    }',
      '',
      '    const gestureActive = attackPoseState',
      '      && scratchTime >= sansGestureStartedAt && scratchTime <= sansGestureUntil;',
      '    const direction = sansGestureDirection;',
      '    const horizontal = direction === GravityDirection.LEFT',
      '      || direction === GravityDirection.RIGHT;',
      '    let gesture = horizontal ? sansPointRightImage',
      '      : direction === GravityDirection.UP ? sansHandUpImage : sansHandDownImage;',
      '    let flip = direction === GravityDirection.LEFT;',
      '    let drawn = false;',
      '',
      '    // The reference keeps Sans in his pocket pose through the blaster ring.',
      '    // Directional hand poses resume with the rapid final wall slams.',
      '    const allowGesture = gestureActive && (!finalAttack || finalElapsed >= 29.05);',
      '    if (allowGesture) drawn = drawPose(gesture, 23, 1, flip);',
      '    if (!drawn) {',
      '      const exactIdle = sansReferenceImage.complete && sansReferenceImage.naturalWidth',
      '        ? sansReferenceImage',
      '        : window.__hqSansV17?.complete && window.__hqSansV17.naturalWidth',
      '          ? window.__hqSansV17 : sansIdleGifImage;',
      '      drawn = drawPose(exactIdle, targetH);',
      '    }',
      '',
      '    // Before the special attack Sans alternates between his normal face,',
      '    // a sweat bead, and closed tired eyes as in the supplied recording.',
      "    const tiredDialogue = finalSpecial && state === 'enemySpeak';",
      '    if (tiredDialogue && drawn) {',
      '      const tiredPhase = Math.floor((scratchTime - stateAt) / 720) % 3;',
      '      if (tiredPhase !== 0) {',
      "        rect(footX - 4, footY - 17, 3, 2, '#000');",
      "        rect(footX + 1, footY - 17, 3, 2, '#000');",
      "        line(footX - 4, footY - 16, footX - 1, footY - 15, '#fff', 1);",
      "        line(footX + 1, footY - 15, footX + 4, footY - 16, '#fff', 1);",
      '      }',
      '      if (tiredPhase === 1) {',
      "        rect(footX + 7, footY - 19, 1, 2, '#fff');",
      "        rect(footX + 8, footY - 16, 1, 1, '#fff');",
      '      }',
      '    }',
      '',
      '    // In the video the eye is dark during the ring barrage. It lights only',
      '    // when Sans starts throwing the soul around again (29.05 seconds).',
      '    if (finalAttack && finalElapsed >= 29.05 && drawn) {',
      '      const flash = Math.floor((finalElapsed - 29.05) / .125) % 2;',
      "      const glow = flash ? '#fff200' : '#00eaff';",
      '      const eyeX = footX + 2;',
      '      const eyeY = footY - 16;',
      "      rect(eyeX - 2, eyeY - 2, 5, 4, '#000');",
      "      rect(eyeX - 1, eyeY - 1, 3, 3, glow);",
      "      rect(eyeX, eyeY - 1, 1, 1, '#fff');",
      '    }',
      '  }'
    ];
    return replaceFunction(source, 'drawSans', lines.join('\n'));
  }

  function patchDodgeMotion(source) {
    const bounds = functionBounds(source, 'drawEnemies');
    if (!bounds) return source;
    let body = source.slice(bounds.start, bounds.end);
    body = body.replace(
      /if \(index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 650\) \{\s*const progress = dodgeElapsed \/ 650;\s*drawX \+= Math\.sin\(progress \* Math\.PI\) \* 34 \* dodgeDirection;\s*\}/,
      "if (index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 360) {\n          // Scratch motion blocks: fixed integer steps instead of easing.\n          const dodgeFrame = Math.floor(dodgeElapsed / (1000 / 30));\n          const dodgeSteps = [0, 14, 25, 31, 31, 31, 31, 31, 25, 14, 0];\n          drawX += dodgeSteps[Math.min(dodgeSteps.length - 1, dodgeFrame)] * dodgeDirection;\n        }"
    );
    return source.slice(0, bounds.start) + body + source.slice(bounds.end);
  }

  function patchScratchAttackClock(source) {
    const bounds = functionBounds(source, 'runSansScriptedTurn');
    if (!bounds) return source;
    let body = source.slice(bounds.start, bounds.end);
    body = body.replace(
      '    const elapsed = (now - stateAt) / 1000;',
      [
        '    // Scratch broadcast clock: launch every attack clone on a 30 fps tick.',
        '    const scratchNow = Math.floor((now - stateAt) / (1000 / 30)) * (1000 / 30);',
        '    const elapsed = scratchNow / 1000;'
      ].join('\n')
    );
    return source.slice(0, bounds.start) + body + source.slice(bounds.end);
  }

  window.applySansPoseEyeFidelityV28 = source => {
    let result = String(source || '');
    result = patchSansPose(result);
    result = patchDodgeMotion(result);
    result = patchScratchAttackClock(result);
    return result;
  };

  console.info('Sans pose/eye fidelity v28 ready:', VERSION);
})();

