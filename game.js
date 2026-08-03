(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const hint = document.getElementById('start-hint');
  const touch = document.getElementById('touch');
  const W = 320;
  const H = 180;
  const view = document.createElement('canvas');
  view.width = W * 2;
  view.height = H * 2;
  const g = view.getContext('2d');
  g.setTransform(2, 0, 0, 2, 0, 0);
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
  const STAGES = [
    [{ name: 'ヒカリメ', type: 'eye', maxHp: 26 }],
    [{ name: 'クラゲン', type: 'jelly', maxHp: 30 }],
    [{ name: 'ヒカリメ', type: 'eye', maxHp: 32 }, { name: 'クラゲン', type: 'jelly', maxHp: 34 }],
    [{ name: 'ホシノコ', type: 'eye', maxHp: 40 }],
    [{ name: 'ミズクラゲ', type: 'jelly', maxHp: 44 }],
    [{ name: 'ヒカリメ改', type: 'eye', maxHp: 46 }, { name: 'ミズクラゲ', type: 'jelly', maxHp: 42 }],
    [{ name: 'セキガン', type: 'eye', maxHp: 58 }],
    [{ name: 'オオクラゲ', type: 'jelly', maxHp: 62 }],
    [{ name: '記念祭の双星', type: 'eye', maxHp: 58 }, { name: '記念祭の賢者', type: 'jelly', maxHp: 64 }],
    [{ name: 'サンズ', type: 'sans', maxHp: 1 }]
  ];
  const BATTLE_TRACKS = [
    'spotify:track:5iOTHhi2C3mHSn007Neqcg',
    'spotify:track:2bvbLvGD7YnS4Nhf9E4hUl',
    'spotify:track:2AtC6i0b8TjpjhWBZYLprX',
    'spotify:track:0wae8KoprNjfrXWjYYHGy9',
    'spotify:track:0ROETpoLOKjq61LjwxNz92',
    'spotify:track:3aiGshuqYhdBBBhHqRf6jn',
    'spotify:track:7BGZ27yeaKR5OZOIxyegZi',
    'spotify:track:0ybMBs8mKdAP9WSnFTiZvs',
    'spotify:track:6YnPqvc66bdYGGOJIlDEz1'
  ];
  const MEGALOVANIA = 'spotify:track:1J03Vp93ybKIxfzYI4YJtL';
  function createAttackPatterns(type, seed) {
    return Array.from({ length: 60 }, (_, index) => {
      const level = Math.floor(index / 3) + 1;
      const variant = index % 3;
      const typeOffset = type === 'eye' ? 0 : type === 'jelly' ? 5 : 11;
      return {
        id: index + 1,
        level,
        variant,
        formation: (level * 3 + variant * 7 + seed + typeOffset) % 20,
        kind: type === 'eye' ? 'star' : type === 'jelly' ? 'drop' : 'bone',
        speed: (type === 'sans' ? 58 : 31) + level * (type === 'sans' ? 2.6 : 1.9) + variant * 6 + seed % 5,
        interval: Math.max(type === 'sans' ? 105 : 175, (type === 'sans' ? 350 : 600) - level * (type === 'sans' ? 9 : 15) - variant * 35 - seed % 20),
        burst: 1 + Math.floor((level - 1) / 6) + (variant === 2 ? 1 : 0),
        wave: 5 + level * 1.1 + variant * 3 + seed % 4,
        damage: type === 'sans' ? 3 + Math.floor(level / 6) : 2 + Math.floor(level / 5),
        gravity: type === 'sans' && (level + variant) % 3 !== 1,
        duration: 3400 + Math.min(2500, level * 95 + variant * 180)
      };
    });
  }

  let enemies = [];

  let state = 'title';
  let menu = 0;
  let target = 0;
  let playerLevel = 1;
  let hp = 20;
  let maxHp = 20;
  let items = 2;
  let clearChoice = 1;
  let pendingStage = 1;
  let attackPattern = null;
  let defeatAt = -10000;
  let defeatFragments = [];
  let message = ['＊ 10しゅうねんの よる。', '＊ ふたりの ちょうせんしゃが あらわれた。'];
  let attackX = 82;
  let attackDirection = 1;
  let attackTarget = 0;
  let stateAt = performance.now();
  let last = stateAt;
  let heart = { x: 160, y: 117, vy: 0 };
  let bullets = [];
  let spawnAt = 0;
  let invincible = 0;
  let turnCount = 0;
  let stage = 1;
  let sansDodges = 0;
  let reviveItems = 1;
  let dodgeAt = -10000;
  let dodgeEnemy = -1;
  let damageAt = -10000;
  let damageEnemy = -1;
  let damageValue = 0;
  let lastTrack = '';
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
    const readableSize = Math.max(8, size);
    g.font = '700 ' + readableSize + 'px "Meiryo","Yu Gothic UI","Noto Sans JP",sans-serif';
    g.textAlign = align;
    g.textBaseline = 'top';
    for (const [i, row] of String(value).split('\n').entries()) {
      const tx = Math.round(x);
      const ty = Math.round(y + i * (readableSize + 3));
      g.strokeStyle = 'rgba(0,0,0,.9)';
      g.lineJoin = 'round';
      g.lineWidth = .75;
      g.strokeText(row, tx, ty);
      g.fillStyle = color;
      g.fillText(row, tx, ty);
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

  function drawSans(x, y, t) {
    const c = '#fff', shade = '#cfcfcf', dark = '#000';
    rect(x - 10, y - 21, 20, 3, c);
    rect(x - 15, y - 18, 30, 18, c);
    rect(x - 12, y, 24, 5, c);
    rect(x - 10, y - 15, 8, 9, dark);
    rect(x + 3, y - 15, 8, 9, dark);
    rect(x - 7, y - 12, 3, 4, c);
    rect(x + 6, y - 12, 3, 4, stage === 10 && Math.floor(t / 180) % 2 ? '#45eaff' : c);
    rect(x - 2, y - 7, 4, 4, dark);
    rect(x - 9, y - 3, 18, 2, dark);
    for(let tooth=-7;tooth<=7;tooth+=4) rect(x + tooth, y - 2, 2, 3, dark);
    rect(x - 18, y + 5, 36, 18, c);
    rect(x - 14, y + 7, 28, 15, dark);
    rect(x - 8, y + 8, 16, 12, shade);
    rect(x - 5, y + 10, 10, 10, dark);
    rect(x - 18, y + 12, 5, 17, c);
    rect(x + 14, y + 12, 5, 17, c);
    rect(x - 12, y + 22, 10, 13, c);
    rect(x + 3, y + 22, 10, 13, c);
    rect(x - 10, y + 23, 7, 10, dark);
    rect(x + 4, y + 23, 7, 10, dark);
    rect(x - 15, y + 34, 14, 4, c);
    rect(x + 2, y + 34, 14, 4, c);
    rect(x - 14, y + 35, 8, 2, dark);
    rect(x + 7, y + 35, 8, 2, dark);
  }

  function levelMaxHp(level) {
    return 20 + Math.round((Math.max(1, Math.min(20, level)) - 1) * 60 / 19);
  }

  function drawEnemyHealth(enemy) {
    if (enemy.spared) return;
    const width = enemy.type === 'sans' ? 64 : 50;
    const x = enemy.x - width / 2;
    const y = 80;
    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    const color = ratio > .55 ? '#55d85a' : ratio > .25 ? '#ffe32c' : '#f13838';
    text(enemy.hp + ' / ' + enemy.maxHp, enemy.x, 70, 7, '#fff', 'center');
    rect(x - 1, y - 1, width + 2, 7, '#fff');
    rect(x, y, width, 5, '#171717');
    if (ratio > 0) rect(x, y, width * ratio, 5, color);
    for (let tick = 1; tick < 4; tick++) rect(x + width * tick / 4, y, 1, 5, '#111');
  }

  function aliveEnemies() {
    return enemies.map((enemy, index) => ({ enemy, index })).filter(({ enemy }) => enemy.hp > 0 && !enemy.spared);
  }

  function drawEnemies(now) {
    const dodgeElapsed = now - dodgeAt;
    for (const [index, enemy] of enemies.entries()) {
      if (enemy.hp > 0 && !enemy.spared) {
        let drawX = enemy.x;
        if (index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 650) {
          const progress = dodgeElapsed / 650;
          drawX += Math.sin(progress * Math.PI) * 34;
        }
        if (enemy.type === 'eye') drawEyeComet(drawX, 50, now);
        else if (enemy.type === 'jelly') drawJellySage(drawX, 51, now);
        else drawSans(drawX, 45, now);
      }
      drawEnemyHealth(enemy);
      if (index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 900) {
        text('MISS', enemy.x + 29, 30, 11, '#fff');
      }
    }

    const damageElapsed = now - damageAt;
    if (damageEnemy >= 0 && damageElapsed >= 0 && damageElapsed < 1000) {
      const enemy = enemies[damageEnemy];
      const rise = Math.min(10, damageElapsed / 70);
      text('-' + damageValue, enemy.x + 24, 42 - rise, 11, '#fff000', 'center');
      if (damageElapsed < 260) {
        line(enemy.x - 14, 25, enemy.x + 14, 66, '#fff', 2);
        line(enemy.x - 9, 23, enemy.x + 19, 64, '#f33', 1);
      }
    }

    text('STAGE ' + stage + ' / 10', 70, 13, 7, '#62d98c');
    text('PATTERN ' + (attackPattern ? attackPattern.id : (playerLevel - 1) * 3 + 1) + ' / 60', 160, 13, 7, '#fff', 'center');
    text('REVIVE ' + reviveItems, 298, 13, 7, reviveItems ? '#fff000' : '#777', 'right');
    if (state === 'target') {
      const selected = aliveEnemies()[target];
      if (selected) heartShape(selected.enemy.x, 66, '#f5222d');
    }
  }

  function drawStatus() {
    text('すけ', 74, 148, 7);
    text('LV ' + playerLevel, 96, 148, 8);
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
      text(menuLabels[i], x + 17, 165, 8, '#ff7518');
    }
  }

  function drawMessageBox() {
    rect(73, 91, 224, 53, '#fff');
    rect(76, 94, 218, 47, '#000');
    message.slice(0, 3).forEach((row, index) => text(row, 84, 98 + index * 13, 9));
  }

  function drawAttackGauge() {
    rect(72, 90, 226, 55, '#fff');
    rect(75, 93, 220, 49, '#050505');

    const left = 82;
    const right = 288;
    const center = 183;
    const top = 103;
    const bottom = 136;
    const gradient = g.createLinearGradient(left, 0, right, 0);
    gradient.addColorStop(0, '#9fd81c');
    gradient.addColorStop(.14, '#d8e624');
    gradient.addColorStop(.28, '#eb252f');
    gradient.addColorStop(.41, '#ffd928');
    gradient.addColorStop(.48, '#52d35a');
    gradient.addColorStop(.5, '#27b99e');
    gradient.addColorStop(.52, '#52d35a');
    gradient.addColorStop(.59, '#ffd928');
    gradient.addColorStop(.72, '#eb252f');
    gradient.addColorStop(.86, '#d8e624');
    gradient.addColorStop(1, '#9fd81c');

    g.save();
    g.beginPath();
    g.moveTo(left, 119);
    g.lineTo(left + 22, top + 5);
    g.lineTo(center - 22, top);
    g.lineTo(center + 22, top);
    g.lineTo(right - 22, top + 5);
    g.lineTo(right, 119);
    g.lineTo(right - 22, bottom - 5);
    g.lineTo(center + 22, bottom);
    g.lineTo(center - 22, bottom);
    g.lineTo(left + 22, bottom - 5);
    g.closePath();
    g.clip();
    g.fillStyle = gradient;
    g.fillRect(left, top, right - left, bottom - top);
    rect(left + 6, top + 9, right - left - 12, bottom - top - 18, '#070707');

    for (let xx = left + 11; xx < right - 8; xx += 10) {
      const distance = Math.abs(xx - center);
      const color = distance < 22 ? '#54dc62' : distance < 58 ? '#f3da26' : '#e92a35';
      rect(xx, top + 12, 5, 2, color);
      rect(xx + 1, top + 19, 4, 2, color);
    }
    g.restore();

    g.strokeStyle = '#a7df1d';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(left, 119);
    g.lineTo(left + 22, top + 5);
    g.lineTo(center - 22, top);
    g.lineTo(center + 22, top);
    g.lineTo(right - 22, top + 5);
    g.lineTo(right, 119);
    g.lineTo(right - 22, bottom - 5);
    g.lineTo(center + 22, bottom);
    g.lineTo(center - 22, bottom);
    g.lineTo(left + 22, bottom - 5);
    g.closePath();
    g.stroke();

    for (const offset of [-68, -32, 32, 68]) {
      rect(center + offset - 1, top + 3, 3, bottom - top - 6, Math.abs(offset) < 40 ? '#f5e82b' : '#ef3038');
    }
    rect(center - 7, top - 1, 14, bottom - top + 2, '#56d85e');
    rect(center - 3, top - 3, 6, bottom - top + 6, '#174f40');
    rect(center - 1, top - 3, 2, bottom - top + 6, '#8dfff0');

    rect(attackX - 3, top - 5, 7, bottom - top + 10, '#555');
    rect(attackX - 2, top - 5, 5, bottom - top + 10, '#fff');
    rect(attackX - 1, top - 5, 2, bottom - top + 10, '#d9ffff');
  }

  function drawEnemyTurn() {
    rect(73, 91, 224, 53, '#fff');
    rect(76, 94, 218, 47, '#000');
    heartShape(heart.x, heart.y, stage === 10 ? '#168bff' : '#f5222d');
    for (const bullet of bullets) {
      if (bullet.kind === 'bone') {
        rect(bullet.x - 2, bullet.y - bullet.h, 5, bullet.h, '#fff');
        rect(bullet.x - 4, bullet.y - bullet.h, 9, 3, '#fff');
        rect(bullet.x - 4, bullet.y - 3, 9, 3, '#fff');
      } else if (bullet.kind === 'drop') {
        rect(bullet.x - 2, bullet.y - 5, 5, 10, '#bffcff');
        rect(bullet.x - 1, bullet.y - 7, 3, 2, '#fff');
        rect(bullet.x - 1, bullet.y + 5, 3, 2, '#fff');
      } else {
        rect(bullet.x - 1, bullet.y - 5, 3, 11, '#fff');
        rect(bullet.x - 5, bullet.y - 1, 11, 3, '#fff');
        rect(bullet.x - 2, bullet.y - 2, 5, 5, '#d8fff3');
      }
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
    text('STAGE ' + pendingStage, 264, 72, 9, '#fff000', 'center');
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

    if (openingPlayer.x > 313) {
      openingPlayer.x = 70;
      startStage(pendingStage);
    }
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

  const SOUL_PIXELS = [
    '001110011100',
    '011111111110',
    '111111111111',
    '111111111111',
    '111111111111',
    '011111111110',
    '001111111100',
    '000111111000',
    '000011110000',
    '000001100000'
  ];

  function drawLargeSoul(cx, cy, split = 0, cracked = false) {
    const scale = 3;
    const width = SOUL_PIXELS[0].length * scale;
    const height = SOUL_PIXELS.length * scale;
    for (let row = 0; row < SOUL_PIXELS.length; row++) {
      for (let col = 0; col < SOUL_PIXELS[row].length; col++) {
        if (SOUL_PIXELS[row][col] !== '1') continue;
        const side = col < SOUL_PIXELS[row].length / 2 ? -1 : 1;
        const x = cx - width / 2 + col * scale + side * split;
        const y = cy - height / 2 + row * scale + Math.abs(split) * .12;
        const shade = row < 2 ? '#ff4b56' : row > 7 ? '#c80f21' : '#f51d31';
        rect(x, y, scale, scale, shade);
        if (col === 2 && row === 2) rect(x, y, scale, 1, '#ff9ba2');
      }
    }
    if (cracked) {
      const crack = [[0,-13],[-2,-9],[1,-6],[-2,-2],[1,2],[-1,6],[2,10],[0,14]];
      for (let i = 0; i < crack.length - 1; i++) {
        line(cx + crack[i][0], cy + crack[i][1], cx + crack[i + 1][0], cy + crack[i + 1][1], '#050505', 2);
      }
    }
  }

  function drawSoulBreak(now) {
    rect(0, 0, W, H, '#000');
    const elapsed = now - defeatAt;
    const cx = 160;
    const cy = 90;

    if (elapsed < 520) {
      const pulse = 1 + Math.sin(elapsed / 45) * .04;
      g.save();
      g.translate(cx, cy);
      g.scale(pulse, pulse);
      g.translate(-cx, -cy);
      drawLargeSoul(cx, cy, 0, elapsed > 170);
      g.restore();
      if (elapsed > 170) {
        const flash = Math.max(0, 1 - (elapsed - 170) / 250);
        g.globalAlpha = flash * .45;
        rect(0, 0, W, H, '#fff');
        g.globalAlpha = 1;
      }
    } else if (elapsed < 880) {
      const progress = (elapsed - 520) / 360;
      const separation = 2 + progress * 13;
      drawLargeSoul(cx, cy + progress * 3, separation, true);
    } else {
      const seconds = (elapsed - 880) / 1000;
      for (const fragment of defeatFragments) {
        const x = cx + fragment.x + fragment.vx * seconds;
        const y = cy + fragment.y + fragment.vy * seconds + 58 * seconds * seconds;
        const alpha = Math.max(0, 1 - seconds / 1.35);
        g.globalAlpha = alpha;
        rect(x, y, fragment.size, fragment.size, fragment.light ? '#ff6570' : '#e9182c');
      }
      g.globalAlpha = 1;
      if (elapsed < 1080) {
        const burst = Math.max(0, 1 - (elapsed - 880) / 200);
        g.globalAlpha = burst * .55;
        rect(0, 0, W, H, '#fff');
        g.globalAlpha = 1;
      }
    }

    if (elapsed > 1450) {
      const alpha = Math.min(1, (elapsed - 1450) / 500);
      g.globalAlpha = alpha;
      text('SOUL LOST', 160, 123, 10, '#8d8d8d', 'center');
      g.globalAlpha = 1;
    }
  }

  function playDefeatSound() {
    beep(246, .12);
    setTimeout(() => { if (state === 'soulBreak') beep(174, .16); }, 220);
    setTimeout(() => { if (state === 'soulBreak') beep(92, .28); }, 520);
    setTimeout(() => {
      if (state !== 'soulBreak' || !audio) return;
      for (let i = 0; i < 5; i++) {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = 420 + i * 115;
        gain.gain.setValueAtTime(.035, audio.currentTime + i * .018);
        gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .11 + i * .018);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(audio.currentTime + i * .018);
        oscillator.stop(audio.currentTime + .13 + i * .018);
      }
    }, 860);
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
    } else if (state === 'soulBreak') {
      drawSoulBreak(now);
    } else if (state === 'victory' || state === 'defeat' || state === 'stageClear') {
      if (state === 'stageClear') {
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
        text((clearChoice === 1 ? '♥ ' : '') + (stage < 10 ? 'NEXT' : 'ENDING'), 214, 115, 9, nextColor, 'center');
        text('← → でえらぶ　 ENTER / Z', 160, 151, 8, '#fff', 'center');
      } else drawEnding(state === 'victory');
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
      if (!audio || audio.state !== 'running' || state === 'title' || spotifyController) return;
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

  function stageTrack() {
    if (stage === 10) return MEGALOVANIA;
    const choices = BATTLE_TRACKS.filter(track => track !== lastTrack);
    lastTrack = choices[Math.floor(Math.random() * choices.length)];
    return lastTrack;
  }

  function playStageMusic() {
    if (!spotifyController || state === 'opening' || state === 'title') return;
    const uri = stage === 10 ? MEGALOVANIA : stageTrack();
    spotifyController.loadUri(uri);
    spotifyController.play();
  }

  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById('spotify-embed');
    IFrameAPI.createController(element, {
      uri: BATTLE_TRACKS[0],
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
      if (!['title', 'opening'].includes(state)) playStageMusic();
    });
  };

  function setState(next, lines) {
    state = next;
    stateAt = performance.now();
    if (lines) message = lines;
  }

  function startStage(number) {
    stage = number;
    const template = STAGES[stage - 1];
    enemies = template.map((enemy, index) => ({
      ...enemy,
      hp: enemy.maxHp,
      spared: false,
      mood: 0,
      x: template.length === 1 ? 160 : (index === 0 ? 112 : 207),
      patterns: createAttackPatterns(enemy.type, number * 7 + index * 11)
    }));
    hp = maxHp;
    menu = 0;
    target = 0;
    bullets = [];
    sansDodges = 0;
    dodgeAt = -10000;
    dodgeEnemy = -1;
    setState('intro', [
      '＊ STAGE ' + stage + ' / 10',
      '＊ ' + enemies.map(enemy => enemy.name).join('と') + 'が あらわれた。'
    ]);
    playStageMusic();
  }

  function resetGame() {
    playerLevel = 1;
    maxHp = levelMaxHp(playerLevel);
    hp = maxHp;
    items = 3;
    reviveItems = 1;
    clearChoice = 1;
    turnCount = 0;
    lastTrack = '';
    startStage(1);
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
      if (stage === 10) {
        setState('result', ['＊ サンズの ようすを みた。', '＊ こちらの うごきを よんでいる。']);
      } else {
        chosen.enemy.mood++;
        if (chosen.enemy.mood >= 2) {
          setState('result', ['＊ ' + chosen.enemy.name + 'を ほめた。', '＊ たたかう きもちが なくなったようだ。']);
        } else {
          setState('result', ['＊ ' + chosen.enemy.name + 'の ひかりを ほめた。', '＊ すこし てれている。']);
        }
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
      const spareable = stage === 10 ? [] : alive.filter(({ enemy }) => enemy.mood >= 2 || enemy.hp <= 10);
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
    const center = 183;
    const accuracy = Math.max(0, 1 - Math.abs(attackX - center) / 101);
    if (stage === 10 && sansDodges < 2) {
      sansDodges++;
      dodgeAt = performance.now();
      dodgeEnemy = attackTarget;
      beep(760, .07);
      setState('result', ['＊ サンズは こうげきを よけた。', '＊ よこに MISS の文字が うかんだ。']);
      return;
    }
    const damage = stage === 10 ? 1 : Math.max(3, Math.round(5 + accuracy * (9 + playerLevel * 1.2)));
    enemies[attackTarget].hp = Math.max(0, enemies[attackTarget].hp - damage);
    damageAt = performance.now();
    damageEnemy = attackTarget;
    damageValue = damage;
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
    const attackers = aliveEnemies();
    const attacker = attackers[(turnCount - 1) % attackers.length].enemy;
    const patternIndex = (playerLevel - 1) * 3 + ((turnCount - 1) % 3);
    attackPattern = attacker.patterns[patternIndex];
    heart.x = 160;
    heart.y = 117;
    heart.vy = 0;
    bullets = [];
    spawnAt = 0;
    invincible = 0;
    setState('enemyTurn');
  }

  function finishVictory() {
    if (spotifyController) spotifyController.pause();
    playerLevel = Math.min(20, playerLevel + 1);
    maxHp = levelMaxHp(playerLevel);
    hp = maxHp;
    items = 3;
    reviveItems = 1;
    clearChoice = stage < 10 ? 1 : 0;
    setState('stageClear');
  }

  function finishDefeat() {
    if (state === 'soulBreak' || state === 'defeat') return;
    if (spotifyController) spotifyController.pause();
    defeatAt = performance.now();
    defeatFragments = Array.from({ length: 24 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 24 + (index % 3) * .12;
      const force = 24 + (index * 17) % 35;
      return {
        x: ((index * 7) % 17) - 8,
        y: ((index * 11) % 15) - 7,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - 24,
        size: 2 + index % 3,
        light: index % 4 === 0
      };
    });
    setState('soulBreak');
    playDefeatSound();
  }

  function addProjectile(kind, x, y, vx, vy, extras = {}) {
    bullets.push({
      kind,
      x,
      y,
      vx,
      vy,
      h: extras.h || 0,
      curve: extras.curve || 0,
      homing: extras.homing || 0,
      age: 0
    });
  }

  function aimedVelocity(x, y, speed, angleOffset = 0) {
    const angle = Math.atan2(heart.y - y, heart.x - x) + angleOffset;
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  }

  function spawnPatternVolley(pattern, now) {
    const kind = pattern.kind;
    const speed = pattern.speed;
    const formation = pattern.formation;
    const left = 79, right = 291, top = 96, bottom = 140;
    const centerX = 185, centerY = 117;
    const count = Math.min(7, pattern.burst + (formation % 3));
    const lane = 12;

    const sideShot = (fromRight, y, extras = {}) => {
      addProjectile(kind, fromRight ? right : left, y, fromRight ? -speed : speed, extras.vy || 0, extras);
    };
    const verticalShot = (fromBottom, x, extras = {}) => {
      addProjectile(kind, x, fromBottom ? bottom : top, extras.vx || 0, fromBottom ? -speed : speed, extras);
    };
    const aimedShot = (x, y, offset = 0, extras = {}) => {
      const velocity = aimedVelocity(x, y, speed, offset);
      addProjectile(kind, x, y, velocity.vx, velocity.vy, extras);
    };

    switch (formation) {
      case 0:
        for (let i = 0; i < count; i++) sideShot(false, centerY + (i - (count - 1) / 2) * lane);
        break;
      case 1:
        for (let i = 0; i < count; i++) sideShot(true, centerY + (i - (count - 1) / 2) * lane);
        break;
      case 2:
        for (let i = 0; i < count + 1; i++) verticalShot(false, 90 + i * 190 / count);
        break;
      case 3:
        for (let i = 0; i < count + 1; i++) verticalShot(true, 90 + i * 190 / count);
        break;
      case 4:
        for (let i = 0; i < count; i++) {
          const y = 102 + i * 31 / Math.max(1, count - 1);
          sideShot(false, y);
          sideShot(true, bottom - (y - top));
        }
        break;
      case 5:
        for (let i = 0; i < count + 1; i++) {
          addProjectile(kind, 88 + i * 195 / count, top, speed * .45, speed, { curve: .22 });
        }
        break;
      case 6:
        for (let i = 0; i < count; i++) {
          sideShot(i % 2 === 1, 101 + i * 34 / Math.max(1, count - 1), { vy: (i % 2 ? -1 : 1) * pattern.wave, curve: (i % 2 ? 1 : -1) * .35 });
        }
        break;
      case 7: {
        const safeLane = (pattern.id + turnCount) % 5;
        for (let laneIndex = 0; laneIndex < 5; laneIndex++) {
          if (laneIndex === safeLane) continue;
          sideShot(turnCount % 2 === 0, 101 + laneIndex * 8);
        }
        break;
      }
      case 8:
        for (let i = 0; i < 8; i++) {
          const angle = Math.PI * 2 * i / 8 + now / 900;
          addProjectile(kind, centerX + Math.cos(angle) * 96, centerY + Math.sin(angle) * 28, -Math.cos(angle) * speed, -Math.sin(angle) * speed);
        }
        break;
      case 9:
        for (let i = 0; i < count; i++) aimedShot(i % 2 ? right : left, 101 + i * 31 / Math.max(1, count - 1), (i - (count - 1) / 2) * .055, { homing: .16 });
        break;
      case 10: {
        const gap = 1 + (pattern.id + turnCount) % 4;
        for (let i = 0; i < 6; i++) {
          if (i === gap || i === gap + 1) continue;
          sideShot(turnCount % 2 === 0, 97 + i * 8.2);
        }
        break;
      }
      case 11:
        for (let i = 0; i < count; i++) {
          sideShot(i % 2 === 0, centerY + (i - count / 2) * 7);
          verticalShot(i % 2 === 1, centerX + (i - count / 2) * 16);
        }
        break;
      case 12:
        for (let i = 0; i < 10; i++) {
          const angle = now / 370 + i * Math.PI * 2 / 10;
          addProjectile(kind, centerX, centerY, Math.cos(angle) * speed, Math.sin(angle) * speed * .55, { curve: .45 });
        }
        break;
      case 13:
        for (let i = 0; i < 7; i++) {
          if ((i + turnCount) % 2 === 0) verticalShot(turnCount % 2 === 0, 89 + i * 31);
        }
        break;
      case 14:
        for (let i = 0; i < count + 2; i++) {
          addProjectile(kind, left + i * 205 / (count + 1), top, speed * .18, speed, { curve: -.18 });
        }
        break;
      case 15:
        for (let i = 0; i < count + 2; i++) {
          addProjectile(kind, right - i * 205 / (count + 1), bottom, -speed * .18, -speed, { curve: .18 });
        }
        break;
      case 16:
        aimedShot(left, top, 0);
        aimedShot(right, top, 0);
        aimedShot(left, bottom, 0);
        aimedShot(right, bottom, 0);
        if (count > 3) {
          aimedShot(left, centerY, .12);
          aimedShot(right, centerY, -.12);
        }
        break;
      case 17:
        for (let i = 0; i < 6; i++) {
          const angle = now / 280 + i * Math.PI / 3;
          const x = centerX + Math.cos(angle) * 103;
          const y = centerY + Math.sin(angle) * 30;
          addProjectile(kind, x, y, -Math.cos(angle) * speed, -Math.sin(angle) * speed, { curve: i % 2 ? .6 : -.6 });
        }
        break;
      case 18:
        for (let i = -3; i <= 3; i++) aimedShot(turnCount % 2 ? right : left, centerY, i * .11);
        break;
      case 19:
        for (let i = 0; i < count + 2; i++) {
          const edge = (i + turnCount) % 4;
          if (edge === 0) sideShot(false, 100 + Math.random() * 34, { curve: .3 });
          else if (edge === 1) sideShot(true, 100 + Math.random() * 34, { curve: -.3 });
          else if (edge === 2) verticalShot(false, 88 + Math.random() * 194, { homing: .1 });
          else verticalShot(true, 88 + Math.random() * 194, { homing: .1 });
        }
        break;
    }
  }

  function updateEnemyTurn(dt, now) {
    const fallbackIndex = (playerLevel - 1) * 3;
    const pattern = attackPattern || enemies[0].patterns[fallbackIndex];
    const moveSpeed = pattern.gravity ? 86 : 72;

    if (keys.has('ArrowLeft')) heart.x -= moveSpeed * dt;
    if (keys.has('ArrowRight')) heart.x += moveSpeed * dt;
    if (pattern.gravity) {
      heart.vy += 190 * dt;
      if (keys.has('ArrowUp') && heart.y >= 133) heart.vy = -92;
      heart.y += heart.vy * dt;
      if (heart.y > 135) { heart.y = 135; heart.vy = 0; }
      if (heart.y < 99) { heart.y = 99; heart.vy = 0; }
    } else {
      if (keys.has('ArrowUp')) heart.y -= moveSpeed * dt;
      if (keys.has('ArrowDown')) heart.y += moveSpeed * dt;
    }
    heart.x = Math.max(81, Math.min(289, heart.x));
    heart.y = Math.max(99, Math.min(135, heart.y));

    if (now >= spawnAt) {
      spawnPatternVolley(pattern, now);
      spawnAt = now + pattern.interval;
    }

    for (const bullet of bullets) {
      bullet.age += dt;
      if (bullet.homing > 0 && bullet.age < .85) {
        const desired = aimedVelocity(bullet.x, bullet.y, pattern.speed, 0);
        bullet.vx += (desired.vx - bullet.vx) * bullet.homing;
        bullet.vy += (desired.vy - bullet.vy) * bullet.homing;
      }
      if (bullet.curve) {
        const angle = bullet.curve * dt;
        const vx = bullet.vx;
        bullet.vx = bullet.vx * Math.cos(angle) - bullet.vy * Math.sin(angle);
        bullet.vy = vx * Math.sin(angle) + bullet.vy * Math.cos(angle);
      }
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      const hit = bullet.kind === 'bone'
        ? Math.abs(bullet.x - heart.x) < 6 && heart.y > bullet.y - bullet.h - 4 && heart.y < bullet.y + 5
        : Math.abs(bullet.x - heart.x) < 6 && Math.abs(bullet.y - heart.y) < 7;
      if (invincible <= 0 && hit) {
        hp = Math.max(0, hp - pattern.damage);
        invincible = bullet.kind === 'bone' ? .34 : .58;
        beep(110, .1);
      }
    }

    bullets = bullets.filter(bullet => bullet.x > 68 && bullet.x < 302 && bullet.y > 84 && bullet.y < 155);
    invincible -= dt;
    if (hp <= 0) {
      if (reviveItems > 0) {
        reviveItems--;
        hp = maxHp;
        bullets = [];
        heart.x = 160;
        heart.y = 117;
        heart.vy = 0;
        beep(880, .18);
        setState('result', ['＊ ふっかつのしずくが かがやいた！', '＊ HPが ぜんかいした。']);
      } else finishDefeat();
    } else if (now - stateAt > pattern.duration) {
      setState('command', ['＊ どうする？']);
    }
  }

  function confirm() {
    startAudio();
    if (spotifyController && state === 'title') spotifyController.play();
    if (state === 'title') {
      playerLevel = 1;
      maxHp = levelMaxHp(playerLevel);
      hp = maxHp;
      items = 3;
      reviveItems = 1;
      turnCount = 0;
      pendingStage = 1;
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
    if (state === 'stageClear') {
      if (clearChoice === 1 && stage >= 10) {
        setState('victory');
        return;
      }
      pendingStage = clearChoice === 0 ? stage : stage + 1;
      openingPlayer.x = 70;
      openingPlayer.y = 112;
      openingPlayer.moving = false;
      setState('opening');
      return;
    }
    if (state === 'victory' || state === 'defeat') {
      if (spotifyController) spotifyController.pause();
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
    if (state === 'stageClear') {
      if (pressed.has('ArrowLeft')) { clearChoice = 0; beep(); }
      if (pressed.has('ArrowRight')) { clearChoice = 1; beep(); }
    } else if (state === 'command') {
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
    } else if (state === 'soulBreak') {
      if (now - defeatAt > 2250) setState('defeat');
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