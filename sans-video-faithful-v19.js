(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const parenAt = source.indexOf('(', markerAt + marker.length);
    if (parenAt < 0) return null;
    let quote = null;
    let escape = false;
    let parenDepth = 0;
    let closeParen = -1;
    for (let i = parenAt; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '(') parenDepth++;
      else if (ch === ')') {
        parenDepth--;
        if (parenDepth === 0) { closeParen = i; break; }
      }
    }
    if (closeParen < 0) return null;
    const brace = source.indexOf('{', closeParen + 1);
    if (brace < 0) return null;
    let depth = 0;
    quote = null;
    escape = false;
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
        if (depth === 0) return { start, brace, end: i + 1 };
      }
    }
    return null;
  }

  function patchFunctionBody(source, name, transform) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    const next = transform(body);
    if (next === body) return source;
    return source.slice(0, bounds.start) + next + source.slice(bounds.end);
  }

  function injectJudgmentHallSupport(source) {
    if (source.includes('const JUDGMENT_HALL_DIALOGUE_V19 =')) return source;
    const marker = '  function drawOpening(now) {';
    const at = source.indexOf(marker);
    if (at < 0) return source;

    const support = `  // Video-faithful ROOM10: Judgment Hall / Sans encounter.\n  const JUDGMENT_HALL_WORLD_W_V19 = 720;\n  const JUDGMENT_HALL_SANS_X_V19 = 568;\n  const JUDGMENT_HALL_DIALOGUE_V19 = Object.freeze([\n    '＊ よう。',\n    '＊ すくいようのない\\n   あくとうでも\\n   かわれると おもうか？',\n    '＊ どりょく さえすれば\\n   だれでも いいひとに\\n   なれると おもうか？',\n    '＊ へへへへ…',\n    '＊ しつもんを かえよう。',\n    '＊ …おまえ\\n   サイアクな めに\\n   あわされたいか？',\n    '＊ それいじょう\\n   ちかづくと…',\n    '＊ こころの そこから\\n   こうかい することに\\n   なるぜ？',\n    '＊ しかたないな。',\n    '＊ ゴメンよ おばさん。',\n    '＊ だから やくそくは\\n   キライなんだ。'\n  ]);\n  const SANS_BATTLE_PRELUDE_V19 = Object.freeze([\n    'きょうは ステキな日だ',\n    'はなが さいてる\\nことりたちも さえずってる',\n    'こんな日には\\nおまえみたいな やつは…',\n    'じごくで もえて\\nしまえば いい'\n  ]);\n  let judgmentHallActiveV19 = false;\n  let judgmentHallPhaseV19 = 'walk';\n  let judgmentHallDialogueIndexV19 = 0;\n  let judgmentHallFadeV19 = 0;\n  let judgmentHallCameraV19 = 0;\n  let sansBattlePreludeIndexV19 = 0;\n  let sansReferencePreludeCompleteV19 = false;\n\n  function resetJudgmentHallV19() {\n    judgmentHallActiveV19 = true;\n    judgmentHallPhaseV19 = 'walk';\n    judgmentHallDialogueIndexV19 = 0;\n    judgmentHallFadeV19 = 0;\n    judgmentHallCameraV19 = 0;\n    openingPlayer.x = 42;\n    openingPlayer.y = 139;\n    openingPlayer.direction = 'right';\n    openingPlayer.moving = false;\n    openingDoorActive = false;\n    openingDoorProgress = 0;\n    openingDoorHold = 0;\n  }\n\n  function resetSansBattlePreludeV19() {\n    sansBattlePreludeIndexV19 = 0;\n    sansReferencePreludeCompleteV19 = false;\n  }\n\n  function drawJudgmentArchV19(x) {\n    const base = 91;\n    const center = x + 35;\n    g.fillStyle = '#f9df82';\n    g.beginPath();\n    g.moveTo(x + 7, base);\n    g.lineTo(x + 7, 54);\n    g.quadraticCurveTo(center, 15, x + 63, 54);\n    g.lineTo(x + 63, base);\n    g.closePath();\n    g.fill();\n    g.strokeStyle = '#8e4d10';\n    g.lineWidth = 2;\n    g.stroke();\n    line(center, 31, center, 88, '#b36a17', 1);\n    line(x + 18, 50, x + 18, 88, '#b36a17', 1);\n    line(x + 52, 50, x + 52, 88, '#b36a17', 1);\n    line(x + 9, 64, x + 61, 64, '#b36a17', 1);\n    line(x + 9, 78, x + 61, 78, '#b36a17', 1);\n    g.fillStyle = '#e4a52b';\n    g.beginPath(); g.arc(center, 52, 6, 0, Math.PI * 2); g.fill();\n    fillPolygon([[center - 8, 70], [center, 79], [center + 8, 70], [center, 84]], '#dda126');\n  }\n\n  function drawJudgmentColumnV19(x) {\n    rect(x + 12, 16, 26, 7, '#5b2a0f');\n    rect(x + 8, 23, 34, 5, '#8a4713');\n    rect(x + 13, 28, 24, 64, '#3c1e10');\n    rect(x + 17, 28, 16, 64, '#1f1310');\n    rect(x + 13, 28, 4, 64, '#6e3410');\n    rect(x + 33, 28, 4, 64, '#140d0c');\n    rect(x + 8, 92, 34, 5, '#8d4813');\n    rect(x + 5, 97, 40, 5, '#4c2711');\n  }\n\n  function drawJudgmentHallBaseV19(cameraX) {\n    rect(0, 0, W, H, '#000');\n    rect(0, 18, W, 82, '#b86412');\n    rect(0, 22, W, 74, '#d8891f');\n    rect(0, 18, W, 5, '#6e3510');\n    rect(0, 23, W, 3, '#f0ad2a');\n    const tile = 18;\n    const floorTop = 99;\n    for (let row = 0; row < 5; row++) {\n      for (let col = -2; col < 22; col++) {\n        const worldX = col * tile + Math.floor(cameraX / tile) * tile;\n        const sx = worldX - cameraX;\n        const dark = (row + Math.floor(worldX / tile)) % 2 === 0;\n        rect(sx, floorTop + row * 16, tile + 1, 17, dark ? '#c96c17' : '#e49322');\n      }\n    }\n    rect(0, 97, W, 3, '#8d4812');\n    rect(0, 162, W, 18, '#090706');\n    for (let worldX = 18; worldX < JUDGMENT_HALL_WORLD_W_V19; worldX += 112) {\n      const sx = worldX - cameraX;\n      if (sx > -90 && sx < W + 20) drawJudgmentArchV19(sx);\n      const columnX = worldX + 72 - cameraX;\n      if (columnX > -55 && columnX < W + 20) drawJudgmentColumnV19(columnX);\n    }\n    const leftDoor = 2 - cameraX;\n    if (leftDoor > -50 && leftDoor < W) {\n      rect(leftDoor, 37, 24, 61, '#090909');\n      rect(leftDoor + 20, 30, 6, 68, '#4a250e');\n    }\n  }\n\n  function drawJudgmentSansPortraitV19(x, y, sad = false) {\n    g.save();\n    g.translate(x, y);\n    g.fillStyle = '#fff';\n    g.beginPath(); g.arc(0, 0, 14, 0, Math.PI * 2); g.fill();\n    rect(-9, -4, 7, 7, '#000');\n    rect(3, -4, 7, 7, '#000');\n    rect(-2, 2, 4, 4, '#000');\n    if (sad) {\n      line(-8, 7, -3, 5, '#000', 2);\n      line(-3, 5, 3, 5, '#000', 2);\n      line(3, 5, 8, 7, '#000', 2);\n    } else {\n      rect(-8, 7, 16, 3, '#000');\n      for (let tx = -6; tx <= 6; tx += 4) rect(tx, 7, 1, 3, '#fff');\n    }\n    g.restore();\n  }\n\n  function drawJudgmentDialogueV19() {\n    const value = JUDGMENT_HALL_DIALOGUE_V19[judgmentHallDialogueIndexV19] || '';\n    rect(20, 12, 280, 67, '#000');\n    frameBox(20, 12, 280, 67, '#fff', 2);\n    const sad = judgmentHallDialogueIndexV19 === 1 || judgmentHallDialogueIndexV19 === 2\n      || judgmentHallDialogueIndexV19 >= 6;\n    drawJudgmentSansPortraitV19(50, 45, sad);\n    const rows = String(value).split('\\n');\n    for (let i = 0; i < rows.length; i++) text(rows[i], 79, 22 + i * 14, 8, '#fff', 'left');\n  }\n\n  function drawJudgmentHallV19(now) {\n    if (!judgmentHallActiveV19) resetJudgmentHallV19();\n    const maxCamera = JUDGMENT_HALL_WORLD_W_V19 - W;\n    const targetCamera = Math.max(0, Math.min(maxCamera, openingPlayer.x - 118));\n    judgmentHallCameraV19 += (targetCamera - judgmentHallCameraV19) * .18;\n    drawJudgmentHallBaseV19(judgmentHallCameraV19);\n    const sansScreenX = JUDGMENT_HALL_SANS_X_V19 - judgmentHallCameraV19;\n    if (sansScreenX > -45 && sansScreenX < W + 45) {\n      drawSans(sansScreenX, 99, now);\n    }\n    const playerScreenX = openingPlayer.x - judgmentHallCameraV19;\n    const oldX = openingPlayer.x;\n    const oldY = openingPlayer.y;\n    openingPlayer.x = playerScreenX;\n    openingPlayer.y = 139;\n    drawOpeningHero(now);\n    openingPlayer.x = oldX;\n    openingPlayer.y = oldY;\n    if (judgmentHallPhaseV19 === 'dialogue') drawJudgmentDialogueV19();\n    if (judgmentHallPhaseV19 === 'fade') {\n      g.globalAlpha = Math.max(0, Math.min(1, judgmentHallFadeV19));\n      rect(0, 0, W, H, '#000');\n      g.globalAlpha = 1;\n    }\n  }\n\n  function updateJudgmentHallV19(dt) {\n    if (!judgmentHallActiveV19) resetJudgmentHallV19();\n    if (judgmentHallPhaseV19 === 'fade') {\n      openingPlayer.moving = false;\n      judgmentHallFadeV19 = Math.min(1, judgmentHallFadeV19 + dt * 2.25);\n      if (judgmentHallFadeV19 >= 1) {\n        resetSansBattlePreludeV19();\n        startStage(10);\n      }\n      return;\n    }\n    if (judgmentHallPhaseV19 === 'dialogue') {\n      openingPlayer.moving = false;\n      openingPlayer.direction = 'right';\n      return;\n    }\n    const speed = 49;\n    let dx = 0;\n    if (keys.has('ArrowLeft')) dx -= speed * dt;\n    if (keys.has('ArrowRight')) dx += speed * dt;\n    openingPlayer.moving = dx !== 0;\n    if (dx) openingPlayer.direction = dx < 0 ? 'left' : 'right';\n    openingPlayer.x = Math.max(18, Math.min(JUDGMENT_HALL_SANS_X_V19 - 48, openingPlayer.x + dx));\n    openingPlayer.y = 139;\n    if (openingPlayer.x <= 19 && keys.has('ArrowLeft')) {\n      judgmentHallActiveV19 = false;\n      navigateOpeningRoom(-1);\n      return;\n    }\n    if (openingPlayer.x >= JUDGMENT_HALL_SANS_X_V19 - 48) {\n      openingPlayer.x = JUDGMENT_HALL_SANS_X_V19 - 48;\n      openingPlayer.moving = false;\n      judgmentHallPhaseV19 = 'dialogue';\n      judgmentHallDialogueIndexV19 = 0;\n      beep(168, .055);\n    }\n  }\n\n  function advanceJudgmentDialogueV19() {\n    if (judgmentHallPhaseV19 !== 'dialogue') return false;\n    if (judgmentHallDialogueIndexV19 + 1 < JUDGMENT_HALL_DIALOGUE_V19.length) {\n      judgmentHallDialogueIndexV19++;\n      beep(168, .035);\n    } else {\n      judgmentHallPhaseV19 = 'fade';\n      judgmentHallFadeV19 = 0;\n      beep(92, .08);\n    }\n    return true;\n  }\n\n  function drawSansBattlePreludeV19() {\n    const value = SANS_BATTLE_PRELUDE_V19[sansBattlePreludeIndexV19] || '';\n    const boxX = 184;\n    const boxY = 19;\n    const boxW = 122;\n    const rows = String(value).split('\\n');\n    const boxH = Math.max(35, 20 + rows.length * 12);\n    rect(boxX, boxY, boxW, boxH, '#fff');\n    fillPolygon([[boxX, boxY + 15], [boxX - 8, boxY + 20], [boxX, boxY + 25]], '#fff');\n    for (let i = 0; i < rows.length; i++) text(rows[i], boxX + 8, boxY + 7 + i * 12, 7, '#000', 'left');\n  }\n\n  function advanceSansBattlePreludeV19() {\n    if (stage !== 10 || state !== 'intro') return false;\n    if (sansBattlePreludeIndexV19 + 1 < SANS_BATTLE_PRELUDE_V19.length) {\n      sansBattlePreludeIndexV19++;\n      stateAt = performance.now();\n      beep(168, .035);\n      return true;\n    }\n    sansReferencePreludeCompleteV19 = true;\n    return false;\n  }\n\n`;
    return source.slice(0, at) + support + source.slice(at);
  }

  function patchOpeningRenderer(source) {
    return patchFunctionBody(source, 'drawOpening', body => {
      if (body.includes('drawJudgmentHallV19(now)')) return body;
      return body.replace('{', `{\n    if (pendingStage === 10) {\n      drawJudgmentHallV19(now);\n      return;\n    }`);
    });
  }

  function patchOpeningNavigation(source) {
    return patchFunctionBody(source, 'navigateOpeningRoom', body => {
      if (body.includes('judgmentHallActiveV19')) return body;
      return body.replace(
        '    openingDoorActive = false;',
        `    openingDoorActive = false;\n    if (pendingStage === 10) resetJudgmentHallV19();\n    else judgmentHallActiveV19 = false;`
      );
    });
  }

  function patchOpeningUpdate(source) {
    return patchFunctionBody(source, 'updateOpening', body => {
      if (body.includes('updateJudgmentHallV19(dt)')) return body;
      return body.replace('{', `{\n    if (pendingStage === 10) {\n      updateJudgmentHallV19(dt);\n      return;\n    }`);
    });
  }

  function patchStageTenPrelude(source) {
    return patchFunctionBody(source, 'startStage', body => {
      let next = body;
      const oldIntro = `      setState('intro', [\n        '＊ 最後の審判役が 静かに道をふさいだ。',\n        '＊ 笑顔の骨人が ポケットに手を入れた。'\n      ]);`;
      const newIntro = `      resetSansBattlePreludeV19();\n      speakingEnemy = enemies[0] || null;\n      setState('intro', []);`;
      if (next.includes(oldIntro)) next = next.replace(oldIntro, newIntro);
      return next;
    });
  }

  function patchBattlePreludeRenderer(source) {
    return patchFunctionBody(source, 'drawMessageBox', body => {
      if (body.includes('drawSansBattlePreludeV19')) return body;
      return body.replace('{', `{\n    if (stage === 10 && state === 'intro') {\n      drawSansBattlePreludeV19();\n      return;\n    }`);
    });
  }

  function patchConfirm(source) {
    return patchFunctionBody(source, 'confirm', body => {
      let next = body;
      if (!next.includes('advanceJudgmentDialogueV19()')) {
        next = next.replace('{', `{\n    if (state === 'opening' && pendingStage === 10\n      && judgmentHallPhaseV19 === 'dialogue') {\n      advanceJudgmentDialogueV19();\n      return;\n    }`);
      }
      const oldIntro = `    if (state === 'intro') {\n      if (stage === 10 && sansTurn === 0) beginEnemyTurn();\n      else setState('command', ['＊ どうする？']);\n      return;\n    }`;
      const newIntro = `    if (state === 'intro') {\n      if (stage === 10) {\n        if (advanceSansBattlePreludeV19()) return;\n        if (sansTurn === 0) beginEnemyTurn();\n        else setState('command', ['＊ どうする？']);\n      } else {\n        setState('command', ['＊ どうする？']);\n      }\n      return;\n    }`;
      if (next.includes(oldIntro)) next = next.replace(oldIntro, newIntro);
      return next;
    });
  }

  function patchFirstAttackDialogue(source) {
    return patchFunctionBody(source, 'beginEnemyTurn', body => {
      if (body.includes('sansReferencePreludeCompleteV19 && sansTurn === 1')) return body;
      const marker = '    speakingEnemy = attacker;';
      if (!body.includes(marker)) return body;
      return body.replace(marker, `    if (attacker.type === 'sans'\n      && sansReferencePreludeCompleteV19 && sansTurn === 1) {\n      speakingEnemy = null;\n      speechChars = 0;\n      startEnemyAttack();\n      return;\n    }\n\n${marker}`);
    });
  }

  function patchReferencePlayback(source) {
    let result = source;
    result = result.replace(
      '    keepSansBattleMoving(now, pattern);',
      '    // v19 reference lock: preserve the recorded pause instead of adding filler.'
    );
    result = result.replace('  const TEST_PLAY_INVINCIBLE = true;', '  const TEST_PLAY_INVINCIBLE = false;');
    return result;
  }

  function applySansVideoFaithfulV19(source) {
    let result = String(source || '');
    result = injectJudgmentHallSupport(result);
    result = patchOpeningRenderer(result);
    result = patchOpeningNavigation(result);
    result = patchOpeningUpdate(result);
    result = patchStageTenPrelude(result);
    result = patchBattlePreludeRenderer(result);
    result = patchConfirm(result);
    result = patchFirstAttackDialogue(result);
    result = patchReferencePlayback(result);
    return result;
  }

  window.applySansVideoFaithfulV19 = applySansVideoFaithfulV19;
})();
