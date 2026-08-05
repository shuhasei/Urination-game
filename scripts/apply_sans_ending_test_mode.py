from pathlib import Path

path = Path('game.js')
text = path.read_text(encoding='utf-8')

# 1) Enable test-play invincibility while leaving every attack visible.
text = text.replace('const TEST_PLAY_INVINCIBLE = false;', 'const TEST_PLAY_INVINCIBLE = true;')

# 2) Add defeat dialogue pages after the normal battle lines.
needle = """  const SANS_BATTLE_LINES = [
"""
# Insert the new constant after the SANS_BATTLE_LINES array using its final known line.
marker = """    'これが 最後の周回だ。'\n  ];\n"""
replacement = marker + """  const SANS_DEFEAT_DIALOGUE = [
    ['＊ サンズは 傷口を押さえながら笑った。', '＊ 「……そうか。ここまで、なんだな」'],
    ['＊ 「忠告しなかったとは 言わないでくれ」'],
    ['＊ 「それじゃあ……グリルビーズへ行くよ」'],
    ['＊ 「パピルス。何か ほしいものはあるか？」']
  ];
"""
if marker not in text:
    raise SystemExit('battle line marker not found')
text = text.replace(marker, replacement, 1)

# 3) Add ending state variables.
marker = """  let sansBattleComplete = false;\n"""
replacement = marker + """  let sansEndingPhase = 'none';
  let sansFinalDodgePending = false;
  let sansEndingAt = -10000;
  let sansFinalDialogueIndex = 0;
"""
if marker not in text:
    raise SystemExit('state variable marker not found')
text = text.replace(marker, replacement, 1)

# 4) Reset ending state whenever a stage starts.
marker = """    sansBattleComplete = false;\n    gravityDirection = 'down';\n"""
replacement = """    sansBattleComplete = false;
    sansEndingPhase = 'none';
    sansFinalDodgePending = false;
    sansEndingAt = -10000;
    sansFinalDialogueIndex = 0;
    gravityDirection = 'down';
"""
if marker not in text:
    raise SystemExit('stage reset marker not found')
text = text.replace(marker, replacement, 1)

# 5) Enhance Sans rendering for sleeping, wounded, and walking states.
marker = """  function drawSans(x, y, t) {\n    const idleBob = Math.round(Math.sin(t / 420));\n"""
replacement = """  function drawSans(x, y, t) {
    const idleBob = Math.round(Math.sin(t / 420));
    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const wounded = stage === 10
      && (sansEndingPhase === 'wounded' || sansEndingPhase === 'walking');
"""
if marker not in text:
    raise SystemExit('drawSans header marker not found')
text = text.replace(marker, replacement, 1)

marker = """    const footX = x;\n    const footY = y + 40 + idleBob;\n"""
replacement = """    const footX = x;
    const footY = y + 40 + idleBob + (resting ? 2 : 0);
"""
if marker not in text:
    raise SystemExit('drawSans foot marker not found')
text = text.replace(marker, replacement, 1)

marker = """    if (finalSpecial && poseBlend > .18) {\n      const glow = Math.floor(t / 110) % 2 ? '#45ecff' : '#75ff91';\n      const eyeX = horizontalPose\n        ? footX + (gestureFlip ? -5 : 5)\n        : footX + 7;\n      const eyeY = footY - 39 + moveY;\n      rect(eyeX, eyeY, 2, 2, glow);\n      rect(eyeX + 1, eyeY, 1, 1, '#fff');\n    }\n  }\n"""
replacement = """    if (finalSpecial && poseBlend > .18) {
      const glow = Math.floor(t / 110) % 2 ? '#45ecff' : '#75ff91';
      const eyeX = horizontalPose
        ? footX + (gestureFlip ? -5 : 5)
        : footX + 7;
      const eyeY = footY - 39 + moveY;
      rect(eyeX, eyeY, 2, 2, glow);
      rect(eyeX + 1, eyeY, 1, 1, '#fff');
    }

    if (resting) {
      // The video leaves Sans asleep during his final do-nothing turn.
      const cycle = Math.floor(t / 460) % 3;
      for (let i = 0; i < 3; i++) {
        const alpha = i <= cycle ? 1 : .28;
        g.globalAlpha = alpha;
        text('Z', footX + 12 + i * 7, footY - 43 - i * 7, 7 - i, '#fff', 'center');
      }
      g.globalAlpha = 1;
      // Two tiny dark lids make the existing sprite read as sleeping without
      // replacing the user's embedded Sans artwork.
      rect(footX - 7, footY - 39, 4, 2, '#000');
      rect(footX + 3, footY - 39, 4, 2, '#000');
      line(footX - 7, footY - 38, footX - 4, footY - 38, '#fff');
      line(footX + 3, footY - 38, footX + 6, footY - 38, '#fff');
    }

    if (wounded) {
      // Red diagonal wound and small drip seen after the automatic second hit.
      line(footX - 11, footY - 31, footX + 10, footY - 9, '#5a0008', 4);
      line(footX - 10, footY - 31, footX + 10, footY - 10, '#f12438', 2);
      rect(footX + 7, footY - 8, 3, 4, '#d8172c');
      rect(footX + 8, footY - 3, 2, 3, '#a70f1f');
    }
  }
"""
if marker not in text:
    raise SystemExit('drawSans tail marker not found')
text = text.replace(marker, replacement, 1)

# 6) Move wounded Sans off the left side during the final walk.
marker = """        let drawX = enemy.x;\n        if (index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 650) {\n"""
replacement = """        let drawX = enemy.x;
        if (stage === 10 && index === 0 && sansEndingPhase === 'walking') {
          const walkProgress = clamp01((now - sansEndingAt) / 3200);
          drawX -= smoothstep01(walkProgress) * 205;
          drawX += Math.sin(walkProgress * Math.PI * 18) * 1.2;
        }
        if (index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 650) {
"""
if marker not in text:
    raise SystemExit('drawEnemies walk marker not found')
text = text.replace(marker, replacement, 1)

# 7) Add the automatic second slash overlay.
marker = """  function drawEnding(victory) {\n"""
insert = """  function drawSansDefeatOverlay(now) {
    if (state !== 'sansDefeatHit') return;
    const elapsed = now - sansEndingAt;
    const enemy = enemies[0];
    if (!enemy) return;

    if (elapsed < 760) {
      const slashProgress = smoothstep01(elapsed / 230);
      const sweep = -28 + slashProgress * 62;
      line(enemy.x - 25 + sweep, 20, enemy.x + 4 + sweep, 70, '#ffffff', 4);
      line(enemy.x - 22 + sweep, 19, enemy.x + 7 + sweep, 69, '#f02a3d', 2);
    }

    if (elapsed >= 170) {
      const rise = Math.min(9, (elapsed - 170) / 75);
      text('9999999', enemy.x, 21 - rise, 10, '#f32638', 'center');
    }

    if (elapsed < 150) {
      g.globalAlpha = Math.max(0, 1 - elapsed / 150) * .55;
      rect(0, 0, W, H, '#fff');
      g.globalAlpha = 1;
    }
  }

  function startSansDefeatSequence() {
    sansFinalDodgePending = false;
    sansEndingPhase = 'wounded';
    sansEndingAt = performance.now();
    bullets = [];
    damageEnemy = -1;
    damageAt = -10000;
    beep(980, .07);
    setTimeout(() => { if (state === 'sansDefeatHit') beep(185, .18); }, 85);
    setState('sansDefeatHit');
  }

  function showSansFinalDialogue(index) {
    sansFinalDialogueIndex = Math.max(0, Math.min(SANS_DEFEAT_DIALOGUE.length - 1, index));
    setState('sansFinalDialogue', SANS_DEFEAT_DIALOGUE[sansFinalDialogueIndex]);
  }

  function advanceSansFinalDialogue() {
    if (sansFinalDialogueIndex + 1 < SANS_DEFEAT_DIALOGUE.length) {
      showSansFinalDialogue(sansFinalDialogueIndex + 1);
      return;
    }
    sansEndingPhase = 'walking';
    sansEndingAt = performance.now();
    setState('sansWalkOff');
  }

  function updateSansEnding(now) {
    if (state === 'sansDefeatHit' && now - sansEndingAt >= 1350) {
      showSansFinalDialogue(0);
      return;
    }
    if (state === 'sansWalkOff' && now - sansEndingAt >= 3300) {
      const sans = enemies[0];
      if (sans) sans.hp = 0;
      sansEndingPhase = 'gone';
      finishVictory();
    }
  }

"""
if marker not in text:
    raise SystemExit('drawEnding marker not found')
text = text.replace(marker, insert + marker, 1)

# 8) Draw cinematic states without an obsolete message box.
marker = """      drawEnemies(now);\n      if (state === 'attack') drawAttackGauge();\n      else if (state === 'enemyTurn') drawEnemyTurn();\n      else if (!(stage === 10 && state === 'command')) drawMessageBox();\n      drawStatus();\n"""
replacement = """      drawEnemies(now);
      if (state === 'attack') drawAttackGauge();
      else if (state === 'enemyTurn') drawEnemyTurn();
      else if (!(stage === 10 && state === 'command')
        && state !== 'sansDefeatHit' && state !== 'sansWalkOff') drawMessageBox();
      if (state === 'sansDefeatHit') drawSansDefeatOverlay(now);
      drawStatus();
"""
if marker not in text:
    raise SystemExit('draw state marker not found')
text = text.replace(marker, replacement, 1)

# 9) Replace the post-final-attack message with the sleeping special turn.
old = """      setState('command', [\n        '＊ 最後の攻撃は おわった。',\n        '＊ たたかうことも みのがすことも できる。'\n      ]);\n"""
new = """      sansEndingPhase = 'sleeping';
      sansFinalDodgePending = false;
      setState('command', [
        '＊ サンズは 何もしてこない。',
        '＊ そのまま 居眠りを始めた。'
      ]);
"""
if old not in text:
    raise SystemExit('beginEnemyTurn final message marker not found')
text = text.replace(old, new, 1)

old = """        setState('command', [\n          '＊ サンズの 最後の攻撃を くぐりぬけた。',\n          '＊ 「みのがす」を 選べるようになった。'\n        ]);\n"""
new = """        sansEndingPhase = 'sleeping';
        sansFinalDodgePending = false;
        setState('command', [
          '＊ サンズは 何もしてこない。',
          '＊ そのまま 居眠りを始めた。'
        ]);
"""
if old not in text:
    raise SystemExit('updateEnemyTurn final message marker not found')
text = text.replace(old, new, 1)

# 10) First hit after sleep is dodged; pressing confirm triggers the automatic second hit.
marker = """  function resolveAttack() {\n    const center = 183;\n    const accuracy = Math.max(0, 1 - Math.abs(attackX - center) / 101);\n"""
replacement = """  function resolveAttack() {
    const center = 183;
    const accuracy = Math.max(0, 1 - Math.abs(attackX - center) / 101);
    if (stage === 10 && sansBattleComplete
      && sansEndingPhase === 'sleeping' && !sansFinalDodgePending) {
      sansDodges++;
      sansEndingPhase = 'awake';
      sansFinalDodgePending = true;
      dodgeAt = performance.now();
      dodgeEnemy = attackTarget;
      dodgeDirection = sansDodges % 2 ? 1 : -1;
      beep(760, .07);
      setState('result', [
        '＊ サンズは 眠りから飛び起き、攻撃をかわした。',
        '＊ 「まさか これで当たると――」'
      ]);
      return;
    }
"""
if marker not in text:
    raise SystemExit('resolveAttack header marker not found')
text = text.replace(marker, replacement, 1)

# 11) Confirm advances the custom defeat sequence instead of starting another turn.
marker = """    if (state === 'result') {\n      if (!aliveEnemies().length) finishVictory();\n      else beginEnemyTurn();\n      return;\n    }\n"""
replacement = """    if (state === 'result') {
      if (sansFinalDodgePending) {
        startSansDefeatSequence();
        return;
      }
      if (!aliveEnemies().length) finishVictory();
      else beginEnemyTurn();
      return;
    }
    if (state === 'sansFinalDialogue') {
      advanceSansFinalDialogue();
      return;
    }
    if (state === 'sansDefeatHit' || state === 'sansWalkOff') return;
"""
if marker not in text:
    raise SystemExit('confirm result marker not found')
text = text.replace(marker, replacement, 1)

# 12) Update the cinematic states every animation frame.
marker = """    updateEnemySpeech(dt);\n    handlePressed();\n    if (state === 'opening') {\n"""
replacement = """    updateEnemySpeech(dt);
    handlePressed();
    updateSansEnding(now);
    if (state === 'opening') {
"""
if marker not in text:
    raise SystemExit('loop marker not found')
text = text.replace(marker, replacement, 1)

path.write_text(text, encoding='utf-8')
print(f'patched {path} ({len(text)} chars)')