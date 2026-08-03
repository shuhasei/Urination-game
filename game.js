(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const hint = document.getElementById('start-hint');
  const touch = document.getElementById('touch');
  const W = 320;
  const H = 180;
  const view = document.createElement('canvas');
  view.width = W;
  view.height = H;
  const g = view.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  g.imageSmoothingEnabled = false;

  const titleImage = new Image();
  titleImage.src = 'assets/title.png';
  const heroImage = new Image();
  heroImage.src = 'assets/hero.png';
  const flowersImage = new Image();
  flowersImage.src = 'assets/flowers.png';

  const keys = new Set();
  const pressed = new Set();
  const menuLabels = ['たたかう', 'こうどう', 'アイテム', 'みのがす'];
  const menuBoxes = [[73, 55], [132, 55], [191, 55], [250, 55]];
  const enemies = [
    { name: 'ヒカリメ', hp: 48, maxHp: 48, spared: false, x: 112, mood: 0 },
    { name: 'クラゲン', hp: 54, maxHp: 54, spared: false, x: 207, mood: 0 }
  ];

  let state = 'title';
  let menu = 0;
  let target = 0;
  let hp = 60;
  let maxHp = 60;
  let items = 2;
  let message = ['＊ 10しゅうねんの よる。', '＊ ふたりの ちょうせんしゃが あらわれた。'];
  let attackX = 82;
  let attackDirection = 1;
  let attackTarget = 0;
  let stateAt = performance.now();
  let last = stateAt;
  let heart = { x: 160, y: 117 };
  let bullets = [];
  let spawnAt = 0;
  let invincible = 0;
  let turnCount = 0;
  let synthTimer = null;
  let audio = null;
  let spotifyController = null;
  const openingPlayer = { x: 131, y: 112, moving: false, direction: 'down' };

  function rect(x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function line(x1, y1, x2, y2, color, width = 1) {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.beginPath();
    g.moveTo(Math.round(x1) + .5, Math.round(y1) + .5);
    g.lineTo(Math.round(x2) + .5, Math.round(y2) + .5);
    g.stroke();
  }

  function text(value, x, y, size = 8, color = '#fff', align = 'left') {
    g.fillStyle = color;
    g.font = 'bold ' + size + 'px "MS Gothic","Yu Gothic",monospace';
    g.textAlign = align;
    g.textBaseline = 'top';
    for (const [i, row] of String(value).split('\n').entries()) {
      g.fillText(row, Math.round(x), Math.round(y + i * (size + 3)));
    }
  }

  function frameBox(x, y, w, h, color = '#fff', width = 2) {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.strokeRect(x, y, w, h);
  }

  function heartShape(x, y, color = '#f5222d') {
    rect(x - 3, y - 2, 3, 3, color);
    rect(x, y - 2, 3, 3, color);
    rect(x - 4, y, 8, 3, color);
    rect(x - 3, y + 3, 6, 2, color);
    rect(x - 1, y + 5, 2, 2, color);
  }

  function drawGrid() {
    const x = 67, y = 11, w = 236, h = 78;
    frameBox(x, y, w, h, '#008a45', 1);
    for (let xx = x + 39; xx < x + w; xx += 39) line(xx, y, xx, y + h, '#008a45');
    line(x, y + 39, x + w, y + 39, '#008a45');
  }

  function drawEyeComet(x, y, t) {
    const bob = Math.round(Math.sin(t / 260) * 2);
    y += bob;
    const c = '#fff';
    line(x - 18, y + 7, x - 10, y - 20, c);
    line(x - 10, y - 20, x - 4, y - 4, c);
    line(x - 4, y - 4, x + 1, y - 28, c);
    line(x + 1, y - 28, x + 8, y - 5, c);
    line(x + 8, y - 5, x + 18, y - 15, c);
    line(x + 18, y - 15, x + 13, y + 7, c);
    line(x + 13, y + 7, x + 5, y + 13, c);
    line(x + 5, y + 13, x - 8, y + 12, c);
    line(x - 8, y + 12, x - 18, y + 7, c);
    rect(x - 8, y + 1, 17, 10, c);
    rect(x - 6, y + 3, 13, 6, '#000');
    rect(x - 2, y + 4, 5, 4, c);
    rect(x, y + 5, 2, 2, '#000');
    rect(x - 6, y + 14, 12, 2, c);
    rect(x - 3, y + 17, 6, 2, c);
  }

  function drawJellySage(x, y, t) {
    const bob = Math.round(Math.sin(t / 300 + 1) * 2);
    y += bob;
    const c = '#fff';
    rect(x - 12, y - 10, 24, 3, c);
    rect(x - 16, y - 7, 32, 12, c);
    rect(x - 19, y - 3, 38, 6, c);
    rect(x - 14, y + 5, 28, 3, c);
    rect(x - 12, y - 5, 24, 10, '#000');
    rect(x - 8, y - 2, 3, 3, c);
    rect(x + 5, y - 2, 3, 3, c);
    rect(x - 2, y + 2, 2, 2, c);
    rect(x + 2, y + 2, 2, 2, c);
    line(x - 2, y - 11, x - 4, y - 17, c);
    line(x + 3, y - 11, x + 5, y - 17, c);
    rect(x - 5, y - 18, 3, 3, c);
    rect(x + 4, y - 18, 3, 3, c);
    for (let i = -10; i <= 10; i += 5) line(x + i, y + 8, x + i + Math.sin(t / 230 + i) * 3, y + 17, c);
    line(x - 19, y, x - 27, y + 6, c);
    line(x - 27, y + 6, x - 31, y + 2, c);
    line(x + 19, y, x + 27, y + 6, c);
    line(x + 27, y + 6, x + 31, y + 2, c);
  }

  function aliveEnemies() {
    return enemies.map((enemy, index) => ({ enemy, index })).filter(({ enemy }) => enemy.hp > 0 && !enemy.spared);
  }

  function drawEnemies(now) {
    if (enemies[0].hp > 0 && !enemies[0].spared) drawEyeComet(enemies[0].x, 50, now);
    if (enemies[1].hp > 0 && !enemies[1].spared) drawJellySage(enemies[1].x, 51, now);
    if (state === 'target') {
      const selected = aliveEnemies()[target];
      if (selected) heartShape(selected.enemy.x, 75, '#f5222d');
    }
  }

  function drawStatus() {
    text('すけ', 74, 148, 7);
    text('LV 10', 96, 148, 8);
    text('HP', 155, 149, 6);
    rect(168, 149, 29, 8, '#5e1d24');
    rect(168, 149, Math.max(0, 29 * hp / maxHp), 8, '#fff000');
    text(hp + ' / ' + maxHp, 202, 148, 8);
  }

  function drawMenu() {
    for (let i = 0; i < menuBoxes.length; i++) {
      const [x, w] = menuBoxes[i];
      const selected = state === 'command' && menu === i;
      frameBox(x, 162, w, 16, selected ? '#ffff00' : '#ff7518', 1);
      if (selected) heartShape(x + 6, 168, '#f5222d');
      if (i === 0) {
        line(x + 7, 174, x + 13, 165, '#ff7518');
        line(x + 9, 175, x + 15, 165, '#ff7518');
      } else if (i === 1) {
        rect(x + 7, 167, 2, 7, '#ff7518');
        rect(x + 10, 166, 2, 8, '#ff7518');
      } else if (i === 2) {
        rect(x + 7, 166, 7, 3, '#ff7518');
        rect(x + 9, 169, 4, 6, '#ff7518');
      } else {
        line(x + 7, 166, x + 14, 174, '#ff7518');
        line(x + 14, 166, x + 7, 174, '#ff7518');
      }
      text(menuLabels[i], x + 18, 166, 7, '#ff7518');
    }
  }

  function drawMessageBox() {
    rect(73, 91, 224, 53, '#fff');
    rect(76, 94, 218, 47, '#000');
    message.slice(0, 3).forEach((row, index) => text(row, 84, 99 + index * 12, 8));
  }

  function drawAttackGauge() {
    rect(73, 91, 224, 53, '#fff');
    rect(76, 94, 218, 47, '#000');
    const left = 82, top = 104, width = 202;
    const colors = ['#a8d51d', '#e8e61c', '#d92131', '#d92131', '#e8e61c', '#a8d51d'];
    const spans = [30, 33, 20, 20, 33, 30];
    let x = left;
    for (let i = 0; i < spans.length; i++) {
      rect(x, top + 7, spans[i], 20, colors[i]);
      x += spans[i] + 1;
    }
    rect(154, top + 2, 12, 30, '#42b95a');
    rect(158, top, 4, 34, '#113d2a');
    for (let xx = left + 8; xx < left + width; xx += 15) rect(xx, top + 15, 5, 2, '#111');
    rect(attackX - 2, top - 2, 4, 37, '#fff');
  }

  function drawEnemyTurn() {
    rect(73, 91, 224, 53, '#fff');
    rect(76, 94, 218, 47, '#000');
    heartShape(heart.x, heart.y);
    for (const bullet of bullets) {
      rect(bullet.x - 3, bullet.y - 3, 7, 7, '#fff');
      rect(bullet.x - 1, bullet.y - 1, 3, 3, '#000');
    }
  }

  function drawOpening(now) {
    rect(0, 0, W, H, '#050505');

    g.fillStyle = '#3d3c49';
    g.beginPath();
    g.moveTo(42, 35);
    g.lineTo(205, 35);
    g.lineTo(205, 52);
    g.lineTo(230, 52);
    g.lineTo(230, 91);
    g.lineTo(320, 91);
    g.lineTo(320, 133);
    g.lineTo(218, 133);
    g.lineTo(218, 146);
    g.lineTo(55, 146);
    g.lineTo(55, 137);
    g.lineTo(42, 137);
    g.closePath();
    g.fill();

    rect(52, 24, 18, 42, '#000');
    rect(177, 24, 18, 42, '#000');
    rect(176, 98, 144, 28, '#474656');

    g.fillStyle = '#68677c';
    g.beginPath();
    g.ellipse(130, 102, 67, 30, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#d8d5e4';
    g.beginPath();
    g.ellipse(130, 102, 52, 27, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#20bd50';
    g.beginPath();
    g.ellipse(130, 102, 37, 24, 0, 0, Math.PI * 2);
    g.fill();

    if (flowersImage.complete && flowersImage.naturalWidth) {
      g.drawImage(flowersImage, 94, 81, 72, 42);
    } else {
      for (let yy = 87; yy < 119; yy += 6) {
        for (let xx = 103; xx < 159; xx += 7) {
          rect(xx, yy, 5, 4, (xx + yy) % 3 ? '#ffe523' : '#e4a900');
          rect(xx + 2, yy + 1, 2, 2, '#6f4b00');
        }
      }
    }

    const bob = openingPlayer.moving && Math.floor(now / 130) % 2 ? 1 : 0;
    if (heroImage.complete && heroImage.naturalWidth) {
      g.drawImage(heroImage, Math.round(openingPlayer.x - 6), Math.round(openingPlayer.y - 14 + bob), 12, 20);
    } else {
      rect(openingPlayer.x - 4, openingPlayer.y - 10 + bob, 8, 7, '#5c2633');
      rect(openingPlayer.x - 4, openingPlayer.y - 3 + bob, 8, 6, '#394d85');
      rect(openingPlayer.x - 4, openingPlayer.y - 1 + bob, 8, 2, '#bf4dc8');
      rect(openingPlayer.x - 3, openingPlayer.y + 3 + bob, 3, 5, '#2b2029');
      rect(openingPlayer.x + 1, openingPlayer.y + 3 + bob, 3, 5, '#2b2029');
    }

    rect(304, 96, 16, 2, '#555463');
    rect(304, 124, 16, 2, '#31303c');
  }

  function updateOpening(dt) {
    const speed = 54;
    let dx = 0;
    let dy = 0;
    if (keys.has('ArrowLeft')) dx -= speed * dt;
    if (keys.has('ArrowRight')) dx += speed * dt;
    if (keys.has('ArrowUp')) dy -= speed * dt;
    if (keys.has('ArrowDown')) dy += speed * dt;

    openingPlayer.moving = dx !== 0 || dy !== 0;
    if (Math.abs(dx) > Math.abs(dy)) openingPlayer.direction = dx < 0 ? 'left' : 'right';
    else if (dy !== 0) openingPlayer.direction = dy < 0 ? 'up' : 'down';

    const nextX = openingPlayer.x + dx;
    const nextY = openingPlayer.y + dy;
    const inChamber = nextX >= 48 && nextX <= 222 && nextY >= 58 && nextY <= 139;
    const inCorridor = nextX >= 170 && nextX <= 325 && nextY >= 98 && nextY <= 126;
    if (inChamber || inCorridor) {
      openingPlayer.x = nextX;
      openingPlayer.y = nextY;
    }

    if (openingPlayer.x > 313) resetGame();
  }

  function drawTitle(now) {
    rect(0, 0, W, H, '#000');
    if (titleImage.complete && titleImage.naturalWidth) {
      g.drawImage(titleImage, 0, 0, W, H);
    } else {
      text('UNDERTALE', 160, 68, 28, '#fff', 'center');
      heartShape(160, 90);
    }
    if (Math.floor(now / 500) % 2 === 0) text('ENTER / Z', 160, 142, 9, '#fff', 'center');
  }

  function drawEnding(victory) {
    rect(0, 0, W, H, '#000');
    text(victory ? 'BATTLE COMPLETE' : 'GAME OVER', 160, 58, 15, victory ? '#fff000' : '#f5222d', 'center');
    text(victory ? '10しゅうねんの しょうり！' : 'もういちど ちょうせん', 160, 88, 9, '#fff', 'center');
    text('ENTER / Z', 160, 125, 8, '#aaa', 'center');
  }

  function draw(now) {
    if (state === 'title') {
      drawTitle(now);
    } else if (state === 'opening') {
      drawOpening(now);
    } else if (state === 'victory' || state === 'defeat') {
      drawEnding(state === 'victory');
    } else {
      rect(0, 0, W, H, '#000');
      drawGrid();
      drawEnemies(now);
      if (state === 'attack') drawAttackGauge();
      else if (state === 'enemyTurn') drawEnemyTurn();
      else drawMessageBox();
      drawStatus();
      drawMenu();
    }
    ctx.drawImage(view, 0, 0, canvas.width, canvas.height);
  }

  function startAudio() {
    if (audio) {
      if (audio.state === 'suspended') audio.resume();
      return;
    }
    audio = new (window.AudioContext || window.webkitAudioContext)();
    let step = 0;
    const melody = [64, 67, 71, 72, 71, 67, 64, 59, 62, 66, 69, 71, 69, 66, 62, 59];
    synthTimer = setInterval(() => {
      if (!audio || audio.state !== 'running' || state === 'title') return;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = step % 4 === 0 ? 'square' : 'triangle';
      oscillator.frequency.value = 440 * Math.pow(2, (melody[step % melody.length] - 69) / 12);
      gain.gain.setValueAtTime(.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .13);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + .14);
      step++;
    }, 145);
  }

  function beep(frequency = 660, duration = .06) {
    startAudio();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.055, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById('spotify-embed');
    IFrameAPI.createController(element, {
      uri: 'spotify:track:3T6YlBv3O3CHw01Xy0fX8R',
      width: 1,
      height: 1
    }, controller => {
      spotifyController = controller;
      controller.addListener('playback_update', event => {
        if (event.data && event.data.duration && event.data.position >= event.data.duration - 900) {
          controller.seek(0);
          controller.play();
        }
      });
    });
  };

  function setState(next, lines) {
    state = next;
    stateAt = performance.now();
    if (lines) message = lines;
  }

  function resetGame() {
    enemies[0].hp = enemies[0].maxHp;
    enemies[0].spared = false;
    enemies[0].mood = 0;
    enemies[1].hp = enemies[1].maxHp;
    enemies[1].spared = false;
    enemies[1].mood = 0;
    hp = maxHp;
    items = 2;
    menu = 0;
    turnCount = 0;
    bullets = [];
    setState('intro', ['＊ 10しゅうねんの よる。', '＊ ヒカリメと クラゲンが あらわれた。']);
  }

  function nextAliveTarget(direction) {
    const alive = aliveEnemies();
    if (!alive.length) return;
    target = (target + direction + alive.length) % alive.length;
  }

  function commandAction() {
    const alive = aliveEnemies();
    if (!alive.length) return finishVictory();
    if (menu === 0) {
      target = 0;
      setState('target', ['＊ こうげきする あいてを えらんでください。']);
    } else if (menu === 1) {
      const chosen = alive[turnCount % alive.length];
      chosen.enemy.mood++;
      if (chosen.enemy.mood >= 2) {
        setState('result', ['＊ ' + chosen.enemy.name + 'を ほめた。', '＊ たたかう きもちが なくなったようだ。']);
      } else {
        setState('result', ['＊ ' + chosen.enemy.name + 'の ひかりを ほめた。', '＊ すこし てれている。']);
      }
    } else if (menu === 2) {
      if (items > 0) {
        items--;
        const healed = Math.min(18, maxHp - hp);
        hp += healed;
        setState('result', ['＊ きねんの ケーキを たべた。', '＊ HPが ' + healed + ' かいふくした。 のこり ' + items + 'こ。']);
      } else {
        setState('command', ['＊ アイテムは もう のこっていない。']);
      }
    } else {
      const spareable = alive.filter(({ enemy }) => enemy.mood >= 2 || enemy.hp <= 10);
      if (spareable.length) {
        spareable.forEach(({ enemy }) => enemy.spared = true);
        setState('result', ['＊ ' + spareable.map(({ enemy }) => enemy.name).join('と') + 'を みのがした。']);
      } else {
        setState('result', ['＊ まだ みのがすことは できない。']);
      }
    }
  }

  function startAttack() {
    const alive = aliveEnemies();
    if (!alive[target]) return;
    attackTarget = alive[target].index;
    attackX = 82;
    attackDirection = 1;
    setState('attack');
  }

  function resolveAttack() {
    const center = 160;
    const accuracy = Math.max(0, 1 - Math.abs(attackX - center) / 80);
    const damage = Math.max(4, Math.round(8 + accuracy * 25));
    enemies[attackTarget].hp = Math.max(0, enemies[attackTarget].hp - damage);
    beep(150 + accuracy * 500, .12);
    const defeated = enemies[attackTarget].hp <= 0;
    setState('result', [
      '＊ ' + enemies[attackTarget].name + 'に ' + damage + ' ダメージ！',
      defeated ? '＊ ' + enemies[attackTarget].name + 'は ひかりになった。' : '＊ のこりHP ' + enemies[attackTarget].hp + '。'
    ]);
  }

  function beginEnemyTurn() {
    if (!aliveEnemies().length) return finishVictory();
    turnCount++;
    heart.x = 160;
    heart.y = 117;
    bullets = [];
    spawnAt = 0;
    invincible = 0;
    setState('enemyTurn');
  }

  function finishVictory() {
    if (spotifyController) spotifyController.pause();
    setState('victory');
  }

  function finishDefeat() {
    if (spotifyController) spotifyController.pause();
    setState('defeat');
  }

  function updateEnemyTurn(dt, now) {
    const speed = 72;
    if (keys.has('ArrowLeft')) heart.x -= speed * dt;
    if (keys.has('ArrowRight')) heart.x += speed * dt;
    if (keys.has('ArrowUp')) heart.y -= speed * dt;
    if (keys.has('ArrowDown')) heart.y += speed * dt;
    heart.x = Math.max(81, Math.min(231, heart.x));
    heart.y = Math.max(99, Math.min(135, heart.y));
    if (now >= spawnAt) {
      const fromLeft = Math.random() > .5;
      bullets.push({
        x: fromLeft ? 79 : 233,
        y: 101 + Math.random() * 32,
        vx: (fromLeft ? 1 : -1) * (35 + Math.random() * 25),
        vy: (Math.random() - .5) * 14
      });
      spawnAt = now + Math.max(230, 520 - turnCount * 20);
    }
    for (const bullet of bullets) {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      if (invincible <= 0 && Math.abs(bullet.x - heart.x) < 6 && Math.abs(bullet.y - heart.y) < 7) {
        hp = Math.max(0, hp - 5);
        invincible = .7;
        beep(110, .1);
      }
    }
    bullets = bullets.filter(b => b.x > 75 && b.x < 237 && b.y > 94 && b.y < 141);
    invincible -= dt;
    if (hp <= 0) finishDefeat();
    else if (now - stateAt > 4300) setState('command', ['＊ どうする？']);
  }

  function confirm() {
    startAudio();
    if (spotifyController && state === 'title') spotifyController.play();
    if (state === 'title') {
      openingPlayer.x = 131;
      openingPlayer.y = 112;
      openingPlayer.moving = false;
      setState('opening');
      hint.classList.remove('visible');
      touch.classList.add('show');
      return;
    }
    if (state === 'intro') {
      setState('command', ['＊ どうする？']);
      return;
    }
    if (state === 'command') {
      commandAction();
      return;
    }
    if (state === 'target') {
      startAttack();
      return;
    }
    if (state === 'attack') {
      resolveAttack();
      return;
    }
    if (state === 'result') {
      if (!aliveEnemies().length) finishVictory();
      else beginEnemyTurn();
      return;
    }
    if (state === 'victory' || state === 'defeat') {
      setState('title');
      hint.classList.add('visible');
    }
  }

  function keyDown(code) {
    if (!keys.has(code)) pressed.add(code);
    keys.add(code);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) return false;
    return true;
  }

  function handlePressed() {
    if (pressed.has('Enter') || pressed.has('KeyZ') || pressed.has('Space')) confirm();
    if (state === 'command') {
      if (pressed.has('ArrowLeft')) {
        menu = (menu + 3) % 4;
        beep();
      }
      if (pressed.has('ArrowRight')) {
        menu = (menu + 1) % 4;
        beep();
      }
    } else if (state === 'target') {
      if (pressed.has('ArrowLeft') || pressed.has('ArrowUp')) {
        nextAliveTarget(-1);
        beep();
      }
      if (pressed.has('ArrowRight') || pressed.has('ArrowDown')) {
        nextAliveTarget(1);
        beep();
      }
    }
    if ((pressed.has('Escape') || pressed.has('KeyX')) && (state === 'target' || state === 'result')) {
      setState('command', ['＊ どうする？']);
    }
    pressed.clear();
  }

  window.addEventListener('keydown', event => {
    if (!keyDown(event.code)) event.preventDefault();
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  canvas.addEventListener('pointerdown', () => {
    if (state !== 'enemyTurn') confirm();
  });

  document.querySelectorAll('.touch-button').forEach(button => {
    const code = button.dataset.key;
    const down = event => {
      event.preventDefault();
      keyDown(code);
    };
    const up = event => {
      event.preventDefault();
      keys.delete(code);
    };
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointerup', up);
    button.addEventListener('pointercancel', up);
  });

  function loop(now) {
    const dt = Math.min(.035, (now - last) / 1000);
    last = now;
    handlePressed();
    if (state === 'opening') {
      updateOpening(dt);
    } else if (state === 'attack') {
      attackX += attackDirection * 125 * dt;
      if (attackX >= 284) attackDirection = -1;
      if (attackX <= 82 && attackDirection < 0) resolveAttack();
    } else if (state === 'enemyTurn') {
      updateEnemyTurn(dt, now);
    }
    draw(now);
    requestAnimationFrame(loop);
  }

  hint.classList.add('visible');
  requestAnimationFrame(loop);
})();