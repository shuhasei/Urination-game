(() => {
  'use strict';

  const VERSION = '20260807-room11-hotfix2';

  function replaceExact(source, before, after, label) {
    if (source.includes(after)) return source;
    if (!source.includes(before)) {
      console.warn('[ROOM11 hotfix] exact block not found:', label);
      return source;
    }
    return source.replace(before, after);
  }

  function replaceRegex(source, pattern, replacement, label) {
    const next = source.replace(pattern, replacement);
    if (next === source) console.warn('[ROOM11 hotfix] pattern not found:', label);
    return next;
  }

  function applyRoom11Hotfix(source) {
    let game = String(source || '');

    if (!game.includes('function loadProfileDatabase()')) {
      const profileHelpers = `  function loadProfileDatabase() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveProfileDatabase(database) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(database || {}));
  }

  function saveCurrentProfile() {
    if (!playerName) return;
    const database = loadProfileDatabase();
    database[playerName] = {
      name: playerName,
      playerLevel,
      hp,
      maxHp,
      items,
      reviveItems,
      stage,
      pendingStage,
      omegaCleared: state === 'omegaVictory' || Boolean(database[playerName]?.omegaCleared),
      updatedAt: Date.now()
    };
    saveProfileDatabase(database);
    localStorage.setItem('undertalePlayerName', playerName);
  }

  function loadCurrentProfile() {
    if (!playerName) return false;
    const profile = loadProfileDatabase()[playerName];
    if (!profile) return false;
    playerLevel = Math.max(1, Math.min(20, Number(profile.playerLevel) || 1));
    maxHp = levelMaxHp(playerLevel);
    hp = Math.max(1, Math.min(maxHp, Number(profile.hp) || maxHp));
    items = Math.max(0, Number(profile.items) || 0);
    reviveItems = Math.max(0, Number(profile.reviveItems) || 0);
    pendingStage = Math.max(1, Math.min(10, Number(profile.pendingStage) || 1));
    return true;
  }

  function createOrUpdateProfile() {
    const database = loadProfileDatabase();
    if (!database[playerName]) {
      database[playerName] = {
        name: playerName,
        playerLevel: 1,
        hp: 20,
        maxHp: 20,
        items: 3,
        reviveItems: 1,
        stage: 1,
        pendingStage: 1,
        omegaCleared: false,
        updatedAt: Date.now()
      };
      saveProfileDatabase(database);
    }
    saveCurrentProfile();
  }

  function logoutCurrentProfile() {
    saveCurrentProfile();
    playerName = '';
    nameDraft = '';
    localStorage.removeItem('undertalePlayerName');
    touch.classList.remove('show');
    hint.classList.remove('visible');
    setState('title');
  }

`;
      game = replaceExact(
        game,
        '  function sanitizePlayerName(value) {',
        profileHelpers + '  function sanitizePlayerName(value) {',
        'saved profile helpers'
      );
    }

    const oldTitle = `  function drawTitle(now) {
    rect(0, 0, W, H, '#000');
    if (titleImage.complete && titleImage.naturalWidth) {
      g.drawImage(titleImage, 0, 0, W, H);
    } else {
      text('UNDERTALE', 160, 68, 28, '#fff', 'center');
      heartShape(160, 90);
    }
    if (Math.floor(now / 500) % 2 === 0) text('ENTER / Z', 160, 142, 9, '#fff', 'center');
    if(playerName){text(playerName+' でログイン中',160,158,6,'#aaa','center');text('X：ログアウト',160,169,6,'#777','center');}
  }`;

    const newTitle = `  function drawTitle(now) {
    rect(0, 0, W, H, '#000');
    if (titleImage.complete && titleImage.naturalWidth) {
      g.drawImage(titleImage, 0, 0, W, H);
    } else {
      text('UNDERTALE', 160, 62, 28, '#fff', 'center');
      heartShape(160, 88);
    }

    g.globalAlpha = .86;
    rect(48, 124, 224, 52, '#000');
    g.globalAlpha = 1;
    frameBox(48, 124, 224, 52, '#2b2b2b', 1);
    if (Math.floor(now / 500) % 2 === 0) {
      text('ENTER / Z', 160, 130, 9, '#fff', 'center');
    }
    if (playerName) {
      text(playerName + ' でログイン中', 160, 148, 8, '#fff', 'center');
      text('X：ログアウト', 160, 163, 8, '#c8c8c8', 'center');
    } else {
      text('はじめに なまえを設定します', 160, 151, 8, '#d8d8d8', 'center');
    }
  }`;
    game = replaceExact(game, oldTitle, newTitle, 'readable title footer');

    game = replaceExact(
      game,
      `    if (stage === 10 && playerLevel === 1) {
      pacifistRoutePending = true;
      bullets = [];
      soulMode = 'red';
      setState('pacifistPass', [
        '＊ サンズは LV 1を たしかめた。',
        '＊ たたかわずに みちを あけた。'
      ]);
    } else if (stage === 10) {`,
      `    if (stage === 10 && playerLevel === 1) {
      startSansGuideSequence();
      return;
    } else if (stage === 10) {`,
      'LV1 route starts Sans guide'
    );

    game = replaceExact(
      game,
      "  function drawGuideDialogue(rows){frameBox(16,128,288,43,'#fff',2);rows.slice(0,3).forEach((r,i)=>text(r,25,135+i*10,7,'#fff'));}",
      `  function drawGuideDialogue(rows) {
    g.globalAlpha = .92;
    rect(16, 128, 288, 43, '#000');
    g.globalAlpha = 1;
    frameBox(16, 128, 288, 43, '#fff', 2);
    rows.slice(0, 3).forEach((row, index) => text(row, 25, 134 + index * 11, 8, '#fff'));
  }`,
      'guide dialogue contrast'
    );

    game = replaceRegex(
      game,
      /  function drawOmegaFlowey\(now\)\{[\s\S]*?\n  function startOmegaBattle/,
      `  function drawOmegaFlowey(now) {
    const bob = Math.round(Math.sin(now / 210) * 2);
    const center = 160;
    for (let index = 0; index < 12; index++) {
      const rootX = 8 + index * 28;
      line(rootX, 0, center + Math.sin(index * 1.7 + now / 900) * 72,
        48 + (index % 3) * 3, index % 2 ? '#5e4a59' : '#342a35', 5);
    }
    fillPolygon([[0, 54], [54, 42], [94, 55], [62, 72], [0, 72]], '#4f8d2c');
    fillPolygon([[320, 54], [266, 42], [226, 55], [258, 72], [320, 72]], '#4f8d2c');
    g.fillStyle = '#995a58';
    g.beginPath();
    g.ellipse(center, 54 + bob, 42, 34, 0, 0, Math.PI * 2);
    g.fill();
    for (const eyeX of [132, 188]) {
      g.fillStyle = '#f2e6c8';
      g.beginPath();
      g.arc(eyeX, 47 + bob, 11, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#171214';
      g.beginPath();
      g.arc(eyeX, 47 + bob, 4, 0, Math.PI * 2);
      g.fill();
    }
    fillPolygon([[143, 70 + bob], [154, 116], [160, 88], [166, 116], [177, 70 + bob]], '#b66d67');
    rect(127, 2 + bob, 66, 34, '#211b20');
    rect(132, 6 + bob, 56, 26, '#e7e2d1');
    rect(138, 10 + bob, 44, 18, '#fff');
    heartShape(center, 19 + bob, '#ed001f');
    line(146, 26 + bob, 156, 17 + bob, '#111', 2);
    line(174, 26 + bob, 164, 17 + bob, '#111', 2);
    line(149, 28 + bob, 171, 28 + bob, '#9c1016', 2);
  }
  function startOmegaBattle`,
      'Omega Flowey renderer'
    );

    game = replaceRegex(
      game,
      /  function drawOmegaIntro\(now\)\{[\s\S]*?\n  function drawOmegaVictory/,
      `  function drawOmegaIntro(now) {
    rect(0, 0, W, H, '#000');
    drawOmegaFlowey(now);
    g.globalAlpha = .9;
    rect(18, 119, 284, 56, '#000');
    g.globalAlpha = 1;
    frameBox(18, 119, 284, 56, '#fff', 1);
    text('ROOM 11', 160, 124, 10, '#fff', 'center');
    text('＊ 奥から ひどく ゆがんだ笑い声がする。', 160, 143, 8, '#fff', 'center');
    text('ENTER / Z', 160, 160, 8, '#ffff00', 'center');
  }
  function drawOmegaVictory`,
      'Omega intro contrast'
    );

    const cleanDraw = `  function draw(now) {
    if (state === 'title') {
      drawTitle(now);
    } else if (state === 'nameEntry') {
      drawNameEntry();
    } else if (state === 'sansGuide') {
      drawSansGuide(now);
    } else if (state === 'guideChoice') {
      drawGuideChoice();
    } else if (state === 'guideResponse') {
      drawGuideResponse();
    } else if (state === 'room11Walk') {
      drawRoom11Walk(now);
    } else if (state === 'omegaIntro') {
      drawOmegaIntro(now);
    } else if (state === 'omegaBattle') {
      drawOmegaBattle(now);
    } else if (state === 'omegaVictory') {
      drawOmegaVictory();
    } else if (state === 'pacifistPass' || state === 'nextBossPending') {
      drawPacifistPass();
    } else if (state === 'opening') {
      drawOpening(now);
    } else if (state === 'soulBreak') {
      drawSoulBreak(now);
    } else if (state === 'stageClear') {
      rect(0, 0, W, H, '#050505');
      rect(45, 38, 230, 102, '#3d3c49');
      rect(57, 50, 206, 78, '#111');
      frameBox(57, 50, 206, 78, '#77768a', 2);
      text('STAGE ' + stage + ' CLEAR', 160, 55, 14, '#fff000', 'center');
      text('LV ' + playerLevel + '　 HP ' + maxHp + ' / ' + maxHp, 160, 78, 9, '#fff', 'center');
      text('ケーキ 3こ　 ふっかつ 1こ', 160, 94, 9, '#62e8ff', 'center');
      const replayColor = clearChoice === 0 ? '#ffff00' : '#aaa';
      const nextColor = clearChoice === 1 ? '#ffff00' : '#aaa';
      text((clearChoice === 0 ? '♥ ' : '') + 'REPLAY', 108, 115, 9, replayColor, 'center');
      text((clearChoice === 1 ? '♥ ' : '') + (stage < 10 ? 'RETURN' : 'ENDING'), 214, 115, 9, nextColor, 'center');
      text('← → でえらぶ　 ENTER / Z', 160, 151, 8, '#fff', 'center');
    } else if (state === 'victory' || state === 'defeat') {
      drawEnding(state === 'victory');
    } else {
      rect(0, 0, W, H, '#000');
      if (stage !== 10) drawGrid();
      drawEnemies(now);
      if (state === 'attack') drawAttackGauge();
      else if (state === 'enemyTurn') drawEnemyTurn();
      else if (state === 'sansFinalBox') drawSansFinalBox();
      else if (!(stage === 10 && state === 'command')
        && state !== 'sansFinalBox'
        && state !== 'sansDefeatHit' && state !== 'sansWalkOff') drawMessageBox();
      if (state === 'sansDefeatHit') drawSansDefeatOverlay(now);
      if (stage === 10 && state === 'command' && sansEndingPhase === 'sleeping') {
        const pulse = Math.floor(now / 360) % 2 ? '#ffffff' : '#8f8f8f';
        text('こうげきを えらぶ', 160, 146, 7, pulse, 'center');
      }
      drawStatus();
      drawMenu();
      if (state === 'sansFinalBox') battleHeartShape(heart.x, heart.y, '#ed001f');
    }
    ctx.drawImage(view, 0, 0, canvas.width, canvas.height);
  }`;

    game = replaceRegex(
      game,
      /  function draw\(now\) \{[\s\S]*?\n  \}\n\n  function startAudio\(\) \{/,
      cleanDraw + `\n\n  function startAudio() {`,
      'repair main draw state machine'
    );

    const cleanConfirm = `  function confirm() {
    startAudio();
    if (spotifyController && state === 'title') spotifyController.play();

    if (state === 'title') {
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
      nameDraft = sanitizePlayerName(nameDraft);
      if (!nameDraft) { beep(120, .05); return; }
      playerName = nameDraft;
      localStorage.setItem('undertalePlayerName', playerName);
      playerLevel = 1;
      maxHp = levelMaxHp(playerLevel);
      hp = maxHp;
      items = 3;
      reviveItems = 1;
      turnCount = 0;
      pendingStage = 1;
      if (typeof createOrUpdateProfile === 'function') createOrUpdateProfile();
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

    if (state === 'guideChoice') {
      guideAccepted = guideChoice === 0;
      setState('guideResponse');
      beep(guideAccepted ? 760 : 180, .06);
      return;
    }
    if (state === 'guideResponse') {
      if (guideAccepted) startRoom11Walk();
      else setState('guideChoice');
      return;
    }
    if (state === 'omegaIntro') {
      startOmegaBattle();
      return;
    }
    if (state === 'omegaVictory') {
      if (typeof saveCurrentProfile === 'function') saveCurrentProfile();
      setState('title');
      touch.classList.remove('show');
      return;
    }
    if (state === 'pacifistPass' || state === 'nextBossPending') {
      startSansGuideSequence();
      return;
    }
    if (state === 'intro') {
      if (stage === 10 && sansTurn === 0) beginEnemyTurn();
      else setState('command', ['＊ どうする？']);
      return;
    }
    if (state === 'enemySpeak') {
      const fullLength = message.join('').length;
      if (speechChars < fullLength) speechChars = fullLength;
      else startEnemyAttack();
      return;
    }
    if (state === 'sansFinalBox') {
      if (sansFinalBox.fightReady) {
        target = 0;
        startAttack();
      } else beep(120, .04);
      return;
    }
    if (state === 'command') { commandAction(); return; }
    if (state === 'target') { startAttack(); return; }
    if (state === 'attack') { resolveAttack(); return; }
    if (state === 'result') {
      if (sansFinalDodgePending) { startSansDefeatSequence(); return; }
      if (!aliveEnemies().length) finishVictory();
      else beginEnemyTurn();
      return;
    }
    if (state === 'sansFinalDialogue') { advanceSansFinalDialogue(); return; }
    if (state === 'sansDefeatHit' || state === 'sansWalkOff' || state === 'sansGuide'
      || state === 'room11Walk' || state === 'omegaBattle') return;
    if (state === 'stageClear') {
      if (clearChoice === 0) { startStage(stage); return; }
      if (stage >= 10) { setState('victory'); return; }
      pendingStage = stage;
      openingPlayer.x = stage % 2 === 0 ? 198 : 130;
      openingPlayer.y = 112;
      openingPlayer.direction = 'down';
      openingPlayer.moving = false;
      openingDoorProgress = 0;
      openingDoorHold = 0;
      openingDoorActive = false;
      if (typeof saveCurrentProfile === 'function') saveCurrentProfile();
      setState('opening');
      return;
    }
    if (state === 'victory' || state === 'defeat') {
      if (spotifyController) spotifyController.pause();
      if (typeof saveCurrentProfile === 'function') saveCurrentProfile();
      setState('title');
      touch.classList.remove('show');
    }
  }`;

    game = replaceRegex(
      game,
      /  function confirm\(\) \{[\s\S]*?\n  \}\n\n  const KEY_ALIASES/,
      cleanConfirm + `\n\n  const KEY_ALIASES`,
      'repair confirm routing'
    );

    const cleanHandlePressed = `  function handlePressed() {
    const confirmPressed = pressed.has('Enter') || pressed.has('KeyZ') || pressed.has('Space');

    if (state === 'guideChoice') {
      if (pressed.has('ArrowLeft') || pressed.has('ArrowUp')) {
        guideChoice = 0;
        beep();
      }
      if (pressed.has('ArrowRight') || pressed.has('ArrowDown')) {
        guideChoice = 1;
        beep();
      }
    } else if (state === 'stageClear') {
      if (pressed.has('ArrowLeft')) { clearChoice = 0; beep(); }
      if (pressed.has('ArrowRight')) { clearChoice = 1; beep(); }
    } else if (state === 'command') {
      if (pressed.has('ArrowLeft')) { menu = (menu + 3) % 4; beep(); }
      if (pressed.has('ArrowRight')) { menu = (menu + 1) % 4; beep(); }
    } else if (state === 'target') {
      if (pressed.has('ArrowLeft') || pressed.has('ArrowUp')) { nextAliveTarget(-1); beep(); }
      if (pressed.has('ArrowRight') || pressed.has('ArrowDown')) { nextAliveTarget(1); beep(); }
    }

    if (state === 'title' && (pressed.has('Escape') || pressed.has('KeyX')) && playerName) {
      logoutCurrentProfile();
    } else if ((pressed.has('Escape') || pressed.has('KeyX'))
      && (state === 'target' || state === 'result')) {
      setState('command', ['＊ どうする？']);
    } else if (confirmPressed) {
      confirm();
    }
    pressed.clear();
  }`;

    game = replaceRegex(
      game,
      /  function handlePressed\(\) \{[\s\S]*?\n  \}\n\n  window\.addEventListener\('keydown'/,
      cleanHandlePressed + `\n\n  window.addEventListener('keydown'`,
      'repair guide and title input'
    );

    game = game.replace(/hint\.classList\.add\('visible'\);/g, "hint.classList.remove('visible');");

    const required = [
      "if (stage === 10 && playerLevel === 1) {\n      startSansGuideSequence();\n      return;",
      "if (state === 'omegaIntro') {\n      startOmegaBattle();",
      "const confirmPressed = pressed.has('Enter')",
      "function loadProfileDatabase()",
      "function logoutCurrentProfile()",
      "} else if (state === 'stageClear') {\n      rect(0, 0, W, H, '#050505');"
    ];
    const missing = required.filter(marker => !game.includes(marker));
    if (missing.length) {
      throw new Error('ROOM11 hotfix incomplete: ' + missing.join(' / '));
    }
    if (game.includes("state === 'victory' || state === 'defeat' || state === 'stageClear') {\n      if (state === 'guideChoice')")) {
      throw new Error('ROOM11 hotfix could not remove the corrupted draw branch.');
    }
    return game;
  }

  window.applyRoom11Hotfix = applyRoom11Hotfix;
  window.ROOM11_HOTFIX_VERSION = VERSION;
})();
