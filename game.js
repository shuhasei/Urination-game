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
    [{ name: 'ヒカリメ', type: 'eye', visual: 'comet', maxHp: 26 }],
    [{ name: 'クラゲン', type: 'jelly', visual: 'jelly', maxHp: 30 }],
    [{ name: 'ランタンナイト', type: 'eye', visual: 'lantern', maxHp: 38 }],
    [{ name: 'ツキノカメン', type: 'eye', visual: 'moon', maxHp: 42 }],
    [{ name: 'シロハネ', type: 'jelly', visual: 'moth', maxHp: 46 }],
    [{ name: 'カガミオウ', type: 'eye', visual: 'mirror', maxHp: 52 }],
    [{ name: 'トケイノメ', type: 'eye', visual: 'clock', maxHp: 58 }],
    [{ name: 'オオカンムリ', type: 'jelly', visual: 'crown', maxHp: 64 }],
    [{ name: 'ソウセイ・アカ', type: 'eye', visual: 'sun', maxHp: 58 }, { name: 'ソウセイ・アオ', type: 'jelly', visual: 'star', maxHp: 64 }],
    [{ name: 'サンズ', type: 'sans', visual: 'sans', maxHp: 1 }]
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
  const SANS_ATTACK_SEQUENCE = [1, 0, 5, 0, 2, 4, 1, 3, 6, 0, 5, 2, 4, 3, 6, 7];
  const SANS_BATTLE_LINES = [
    '最初から 速くいくぞ。',
    '青い心は 重さを覚える。',
    '横から来る。目を離すな。',
    '同じ流れには ならない。',
    '光る前に 音が変わる。',
    '円の動きは 止まらない。',
    '着地する場所を 選べ。',
    '縦の光が 道を切る。',
    '骨と光を 同時に見るんだ。',
    'まだ半分だ。続けよう。',
    '静かな場所ほど 怪しい。',
    '照準は ほんの一瞬だけだ。',
    '回る向きを 見失うな。',
    '次は上下も 見ておけ。',
    '最後の練習は 終わりだ。',
    'これで 記念戦の締めだ。'
  ];
  const ROOM_THEMES = [
    { name: 'FLOWER', floor: '#3d3c49', corridor: '#474656', light: '#68677c', glow: '#d8d5e4', center: '#20bd50', accent: '#ffe523' },
    { name: 'RIPPLE', floor: '#263f46', corridor: '#31535a', light: '#527984', glow: '#b7e4e8', center: '#1b7587', accent: '#86f0ff' },
    { name: 'LANTERN', floor: '#4b3b32', corridor: '#59483b', light: '#806955', glow: '#f2d7a4', center: '#865b28', accent: '#ffd45c' },
    { name: 'MOON', floor: '#323548', corridor: '#3c4058', light: '#5d6480', glow: '#d7def4', center: '#303852', accent: '#f2f5ff' },
    { name: 'FEATHER', floor: '#3e3846', corridor: '#51465b', light: '#74647f', glow: '#e4d8ea', center: '#55445f', accent: '#ffffff' },
    { name: 'MIRROR', floor: '#344343', corridor: '#405655', light: '#627878', glow: '#d7ece9', center: '#426462', accent: '#aaffed' },
    { name: 'CLOCK', floor: '#403d32', corridor: '#514c3a', light: '#716a4e', glow: '#e6dfb9', center: '#5b5536', accent: '#fff08b' },
    { name: 'CROWN', floor: '#473441', corridor: '#5b4052', light: '#785a70', glow: '#ead2e2', center: '#674057', accent: '#ffdf4f' },
    { name: 'TWINS', floor: '#413b4d', corridor: '#514960', light: '#756b85', glow: '#e3daef', center: '#51436b', accent: '#ff6d62' },
    { name: 'JUDGEMENT', floor: '#353535', corridor: '#454545', light: '#626262', glow: '#d8d8d8', center: '#181818', accent: '#ffffff' }
  ];

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
  let safeLaneAxis = 'y';
  let safeLaneValue = 117;
  let defeatAt = -10000;
  let defeatFragments = [];
  let speechChars = 0;
  let speakingEnemy = null;
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
  let sansTurn = 0;
  let reviveItems = 1;
  let dodgeAt = -10000;
  let dodgeEnemy = -1;
  let dodgeDirection = 1;
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

  const HEART_PIXELS = [
    '011101110',
    '111111111',
    '111111111',
    '111111111',
    '011111110',
    '001111100',
    '000111000',
    '000010000'
  ];

  function heartShape(x, y, color = '#ed001f') {
    for (let row = 0; row < HEART_PIXELS.length; row++) {
      for (let column = 0; column < HEART_PIXELS[row].length; column++) {
        if (HEART_PIXELS[row][column] === '1') {
          rect(x - 4 + column, y - 4 + row, 1, 1, color);
        }
      }
    }
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

  function drawRelicEnemy(enemy, x, y, t) {
    const c = '#fff';
    const bob = Math.round(Math.sin(t / 260 + x) * 2);
    y += bob;

    if (enemy.visual === 'lantern') {
      line(x - 12, y - 15, x + 12, y - 15, c);
      line(x - 12, y - 15, x - 16, y + 6, c);
      line(x + 12, y - 15, x + 16, y + 6, c);
      rect(x - 14, y - 10, 28, 21, c);
      rect(x - 11, y - 7, 22, 15, '#000');
      rect(x - 4, y - 4, 8, 9, '#ffe36b');
      line(x - 16, y + 6, x - 22, y + 14, c);
      line(x + 16, y + 6, x + 22, y + 14, c);
      rect(x - 7, y + 11, 14, 4, c);
    } else if (enemy.visual === 'moon') {
      g.strokeStyle = c; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y - 2, 18, .55, Math.PI * 1.55); g.stroke();
      g.beginPath(); g.arc(x + 8, y - 5, 14, Math.PI * 1.5, .7); g.stroke();
      rect(x - 9, y - 4, 4, 5, c);
      rect(x - 7, y - 2, 2, 2, '#000');
      line(x - 12, y + 15, x - 18, y + 22, c);
      line(x - 6, y + 16, x - 3, y + 24, c);
    } else if (enemy.visual === 'moth') {
      rect(x - 4, y - 17, 8, 31, c);
      rect(x - 2, y - 14, 4, 25, '#000');
      line(x - 3, y - 15, x - 9, y - 23, c);
      line(x + 3, y - 15, x + 9, y - 23, c);
      for (let wing = -1; wing <= 1; wing += 2) {
        g.strokeStyle = c; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x + wing * 4, y - 10); g.lineTo(x + wing * 23, y - 17); g.lineTo(x + wing * 19, y + 4); g.lineTo(x + wing * 5, y + 10); g.stroke();
        rect(x + wing * 13 - 2, y - 7, 5, 5, c);
      }
      rect(x - 2, y - 9, 2, 3, '#000'); rect(x + 1, y - 9, 2, 3, '#000');
    } else if (enemy.visual === 'mirror') {
      g.strokeStyle = c; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y - 23); g.lineTo(x + 17, y - 11); g.lineTo(x + 14, y + 12); g.lineTo(x, y + 22); g.lineTo(x - 14, y + 12); g.lineTo(x - 17, y - 11); g.closePath(); g.stroke();
      rect(x - 11, y - 8, 22, 18, c);
      rect(x - 8, y - 5, 16, 12, '#000');
      rect(x - 6, y - 2, 4, 4, c); rect(x + 3, y - 2, 4, 4, c);
      line(x - 5, y + 5, x + 5, y + 5, c);
      line(x - 18, y + 2, x - 27, y + 12, c); line(x + 18, y + 2, x + 27, y + 12, c);
    } else if (enemy.visual === 'clock') {
      g.strokeStyle = c; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y - 2, 19, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        rect(x + Math.cos(a) * 15 - 1, y - 2 + Math.sin(a) * 15 - 1, 3, 3, c);
      }
      line(x, y - 2, x, y - 13, c, 2); line(x, y - 2, x + 9, y + 4, c, 2);
      rect(x - 7, y + 19, 5, 5, c); rect(x + 3, y + 19, 5, 5, c);
    } else if (enemy.visual === 'crown') {
      line(x - 18, y - 6, x - 13, y - 22, c); line(x - 13, y - 22, x - 5, y - 10, c);
      line(x - 5, y - 10, x, y - 25, c); line(x, y - 25, x + 6, y - 10, c);
      line(x + 6, y - 10, x + 14, y - 22, c); line(x + 14, y - 22, x + 18, y - 6, c);
      rect(x - 18, y - 6, 36, 9, c); rect(x - 14, y - 3, 28, 17, c); rect(x - 11, y, 22, 11, '#000');
      rect(x - 7, y + 2, 4, 4, c); rect(x + 4, y + 2, 4, 4, c);
      line(x - 8, y + 15, x - 15, y + 23, c); line(x + 8, y + 15, x + 15, y + 23, c);
    } else if (enemy.visual === 'sun' || enemy.visual === 'star') {
      const points = enemy.visual === 'sun' ? 12 : 8;
      for (let i = 0; i < points; i++) {
        const a = i * Math.PI * 2 / points + t / 1200;
        line(x + Math.cos(a) * 12, y + Math.sin(a) * 12, x + Math.cos(a) * 23, y + Math.sin(a) * 23, c);
      }
      g.strokeStyle = c; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.stroke();
      rect(x - 6, y - 3, 4, 4, c); rect(x + 3, y - 3, 4, 4, c);
      line(x - 5, y + 5, x + 5, y + 5, c);
    }
  }

  function drawEnemyByVisual(enemy, x, now) {
    if (enemy.visual === 'comet') drawEyeComet(x, 50, now);
    else if (enemy.visual === 'jelly') drawJellySage(x, 51, now);
    else if (enemy.visual === 'sans') drawSans(x, 45, now);
    else drawRelicEnemy(enemy, x, 49, now);
  }

  function enemyBattleQuote(enemy) {
    const quotes = {
      comet: ['目を そらすな。', '光の軌道を よめるかな。', 'つぎは 速くいくぞ。'],
      jelly: ['水の流れに のってみな。', '足もとを よく見て。', '波は 同じ形では来ない。'],
      lantern: ['暗がりを 照らしてやろう。', '影の向きを 見きわめろ。', '灯りが 揺れたら 合図だ。'],
      moon: ['月の裏側を 見せよう。', '満ちて、そして欠ける。', '静かな夜ほど 危険だ。'],
      moth: ['羽音を 追ってみて。', '風向きが 変わるよ。', '白い羽には 触れないで。'],
      mirror: ['きみの動きを 映している。', '左右は 本当に同じかな。', '鏡像が 先に動く。'],
      clock: ['針が重なる時を 待て。', '一秒ごとに 速くなる。', '時間は 止まらない。'],
      crown: ['王冠の間を 進め。', '高い場所ほど 狭くなる。', '正面から 受けてみろ。'],
      sun: ['赤い星が 先に動く。', 'ふたつの光を 見くらべろ。', '交差する瞬間が来る。'],
      star: ['青い星は 後から追う。', '相棒と 軌道を合わせる。', '星のすきまを 探して。'],
      sans: ['準備は できたか。', '重力の向きが 変わるぞ。', '骨のすきまを よく見ろ。', '次は 休むひまがない。']
    };
    const list = quotes[enemy.visual] || ['次の攻撃を はじめる。'];
    return list[(turnCount - 1) % list.length];
  }

  function microPixelRect(x, y, width, height, color) {
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        rect(Math.round(x + px), Math.round(y + py), 1, 1, color);
      }
    }
  }

  function drawSans(x, y, t) {
    const talking = state === 'enemySpeak' && speakingEnemy?.visual === 'sans';
    const jaw = talking && Math.floor(speechChars) % 2 ? 1 : 0;
    const idle = Math.round(Math.sin(t / 420));
    const sy = Math.round(y - 8 + idle);
    const white = '#ffffff';
    const bone = '#dedede';
    const shade = '#949aa1';
    const black = '#050505';
    const glow = Math.floor(t / 170) % 2 ? '#45ecff' : '#75ff91';
    const p = (dx, dy, w, h, color) => microPixelRect(x + dx, sy + dy, w, h, color);

    // Stepped skull silhouette.
    p(-7, 0, 14, 1, bone);
    p(-10, 1, 20, 2, white);
    p(-12, 3, 24, 2, white);
    p(-14, 5, 28, 7, white);
    p(-13, 12, 26, 3, white);
    p(-11, 15, 22, 3, white);
    p(-8, 18, 16, 2, bone);
    p(-13, 6, 1, 5, bone);
    p(12, 6, 1, 5, bone);
    p(-10, 2, 4, 1, bone);
    p(6, 2, 4, 1, bone);

    // Uneven sockets, pupils and nose.
    p(-10, 5, 7, 7, black);
    p(-9, 4, 5, 1, black);
    p(3, 5, 7, 7, black);
    p(4, 4, 5, 1, black);
    p(-8, 6, 2, 2, white);
    p(6, 6, 2, 2, white);
    p(5, 7, 2, 3, glow);
    p(6, 7, 1, 1, white);
    p(-2, 10, 4, 3, black);
    p(-4, 12, 3, 2, black);
    p(2, 12, 3, 2, black);

    // Broad grin with individually separated teeth.
    p(-10, 14 + jaw, 20, 5 + jaw, black);
    p(-8, 14 + jaw, 16, 2, white);
    p(-7, 17 + jaw, 14, 1, white);
    for (let tooth = -7; tooth <= 7; tooth += 2) {
      p(tooth, 14 + jaw, 1, 4 + jaw, black);
    }
    p(-9, 18 + jaw, 2, 1, bone);
    p(7, 18 + jaw, 2, 1, bone);

    // Neck and hood rim.
    p(-3, 20, 6, 2, bone);
    p(-8, 21, 16, 2, white);
    p(-11, 22, 22, 2, white);
    p(-9, 23, 18, 2, black);
    p(-7, 24, 14, 1, shade);

    // Hoodie outline and dark interior.
    p(-13, 24, 26, 2, white);
    p(-15, 26, 30, 12, white);
    p(-13, 27, 26, 10, black);
    p(-10, 27, 20, 9, shade);
    p(-7, 27, 14, 9, black);
    p(-3, 26, 1, 10, white);
    p(2, 26, 1, 10, white);
    p(-5, 27, 2, 2, bone);
    p(3, 27, 2, 2, bone);
    p(-5, 31, 3, 1, shade);
    p(2, 31, 3, 1, shade);

    // Sleeves, folds and hands tucked into pockets.
    p(-17, 27, 3, 10, white);
    p(14, 27, 3, 10, white);
    p(-18, 30, 3, 8, white);
    p(15, 30, 3, 8, white);
    p(-16, 29, 2, 7, black);
    p(14, 29, 2, 7, black);
    p(-15, 32, 3, 1, shade);
    p(12, 32, 3, 1, shade);
    p(-14, 35, 7, 3, black);
    p(7, 35, 7, 3, black);
    p(-13, 35, 4, 2, bone);
    p(9, 35, 4, 2, bone);
    p(-10, 34, 3, 1, white);
    p(7, 34, 3, 1, white);

    // Hem and shorts.
    p(-12, 38, 24, 2, white);
    p(-10, 40, 9, 6, white);
    p(1, 40, 9, 6, white);
    p(-8, 40, 6, 5, black);
    p(2, 40, 6, 5, black);
    p(-7, 41, 4, 1, shade);
    p(3, 41, 4, 1, shade);
    p(-1, 40, 2, 4, black);

    // Thin legs, ankles and pixel slippers.
    p(-7, 46, 4, 4, bone);
    p(3, 46, 4, 4, bone);
    p(-6, 47, 2, 3, white);
    p(4, 47, 2, 3, white);
    p(-12, 50, 10, 3, white);
    p(2, 50, 11, 3, white);
    p(-14, 52, 12, 2, bone);
    p(2, 52, 13, 2, bone);
    p(-11, 51, 7, 2, black);
    p(5, 51, 8, 2, black);
    p(-13, 53, 4, 1, white);
    p(11, 53, 4, 1, white);
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
          drawX += Math.sin(progress * Math.PI) * 34 * dodgeDirection;
        }
        drawEnemyByVisual(enemy, drawX, now);
      }
      if (state === 'attack') drawEnemyHealth(enemy);
      if (index === dodgeEnemy && dodgeElapsed >= 0 && dodgeElapsed < 900) {
        text('MISS', stage === 10 ? enemy.x : enemy.x + 29, stage === 10 ? 18 : 30, 11, '#fff', stage === 10 ? 'center' : 'left');
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

    if (stage !== 10) {
      text('STAGE ' + stage + ' / 10', 70, 13, 7, '#62d98c');
      text('PATTERN ' + (attackPattern ? attackPattern.id : (playerLevel - 1) * 3 + 1) + ' / 60', 160, 13, 7, '#fff', 'center');
      text('REVIVE ' + reviveItems, 298, 13, 7, reviveItems ? '#fff000' : '#777', 'right');
    }
    if (state === 'target') {
      const selected = aliveEnemies()[target];
      if (selected) heartShape(selected.enemy.x, 66, '#f5222d');
    }
  }

  function drawStatus() {
    const sansLayout = stage === 10;
    const y = 148;
    text('すけ', sansLayout ? 53 : 74, y, 7);
    text('LV ' + playerLevel, sansLayout ? 78 : 96, y, 8);
    text('HP', sansLayout ? 127 : 155, y + 1, 6);
    const hpX = sansLayout ? 140 : 168;
    rect(hpX, y + 1, 36, 8, '#5e1d24');
    rect(hpX, y + 1, Math.max(0, 36 * hp / maxHp), 8, '#fff000');
    text(hp + ' / ' + maxHp, sansLayout ? 181 : 202, y, 8);
  }

  function drawPixelMenuIcon(index, x, y, color) {
    if (index === 0) {
      for (let p = 0; p < 7; p++) rect(x + p, y + 8 - p, 2, 2, color);
      rect(x + 1, y + 8, 7, 2, color);
      rect(x + 2, y + 10, 2, 2, color);
      rect(x + 8, y, 2, 3, color);
    } else if (index === 1) {
      rect(x, y + 4, 2, 5, color);
      rect(x + 2, y + 3, 2, 7, color);
      rect(x + 5, y + 4, 1, 1, color);
      rect(x + 6, y + 3, 1, 3, color);
      rect(x + 6, y + 8, 1, 2, color);
      rect(x + 8, y + 2, 1, 9, color);
    } else if (index === 2) {
      rect(x + 3, y + 1, 5, 2, color);
      rect(x + 2, y + 3, 7, 2, color);
      rect(x + 1, y + 5, 9, 6, color);
      rect(x + 3, y + 7, 2, 2, '#000');
      rect(x + 6, y + 7, 2, 2, '#000');
      rect(x + 4, y + 10, 3, 2, color);
    } else {
      for (let p = 0; p < 8; p++) {
        rect(x + p, y + 2 + p, 2, 2, color);
        rect(x + 7 - p, y + 2 + p, 2, 2, color);
      }
    }
  }

  function drawMenu() {
    const sansLayout = stage === 10;
    const boxes = sansLayout ? [[53, 51], [108, 51], [169, 51], [230, 51]] : menuBoxes;
    const menuY = 162;
    for (let i = 0; i < boxes.length; i++) {
      const [x, w] = boxes[i];
      const selected = state === 'command' && menu === i;
      const color = selected ? '#ffff00' : '#ff7518';
      frameBox(x, menuY, w, 16, color, 1);
      if (selected) heartShape(x + 6, menuY + 6, '#f5222d');
      else drawPixelMenuIcon(i, x + 5, menuY + 2, color);
      text(menuLabels[i], x + 17, menuY + 3, 8, color);
    }
  }

  function visibleSpeechRows() {
    if (state !== 'enemySpeak') return message.slice(0, 3);
    let remaining = Math.floor(speechChars);
    return message.slice(0, 3).map(row => {
      if (remaining <= 0) return '';
      const visible = row.slice(0, remaining);
      remaining -= row.length;
      return visible;
    });
  }

  function drawMessageBox() {
    const sansLayout = stage === 10;
    const x = sansLayout ? 31 : 73;
    const y = sansLayout ? 87 : 91;
    const w = sansLayout ? 258 : 224;
    const h = sansLayout ? 55 : 53;
    rect(x, y, w, h, '#fff');
    rect(x + 3, y + 3, w - 6, h - 6, '#000');
    visibleSpeechRows().forEach((row, index) => text(row, x + 11, y + 6 + index * 13, 8));
    if (state === 'enemySpeak' && speechChars >= message.join('').length) {
      text('▼', x + w - 12, y + h - 15, 8, '#fff', 'center');
    }
  }

  function drawAttackGauge() {
    rect(49, 88, 230, 57, '#fff');
    rect(52, 91, 224, 51, '#000');

    const left = 70;
    const right = 260;
    const center = 165;
    const top = 102;
    const bottom = 135;

    g.save();
    g.beginPath();
    g.moveTo(left, 118);
    g.lineTo(left + 5, 111);
    g.lineTo(left + 14, 111);
    g.lineTo(left + 14, 108);
    g.lineTo(left + 25, 108);
    g.lineTo(left + 25, 105);
    g.lineTo(left + 42, 105);
    g.lineTo(left + 42, 103);
    g.lineTo(center - 30, 101);
    g.lineTo(center - 12, 101);
    g.lineTo(center - 12, 99);
    g.lineTo(center + 12, 99);
    g.lineTo(center + 12, 101);
    g.lineTo(center + 30, 101);
    g.lineTo(right - 42, 103);
    g.lineTo(right - 42, 105);
    g.lineTo(right - 25, 105);
    g.lineTo(right - 25, 108);
    g.lineTo(right - 14, 108);
    g.lineTo(right - 14, 111);
    g.lineTo(right - 5, 111);
    g.lineTo(right, 118);
    g.lineTo(right, 123);
    g.lineTo(right - 5, 130);
    g.lineTo(right - 14, 130);
    g.lineTo(right - 14, 133);
    g.lineTo(right - 25, 133);
    g.lineTo(right - 25, 136);
    g.lineTo(right - 42, 136);
    g.lineTo(right - 42, 138);
    g.lineTo(center + 30, 140);
    g.lineTo(center + 12, 140);
    g.lineTo(center + 12, 142);
    g.lineTo(center - 12, 142);
    g.lineTo(center - 12, 140);
    g.lineTo(center - 30, 140);
    g.lineTo(left + 42, 138);
    g.lineTo(left + 42, 136);
    g.lineTo(left + 25, 136);
    g.lineTo(left + 25, 133);
    g.lineTo(left + 14, 133);
    g.lineTo(left + 14, 130);
    g.lineTo(left + 5, 130);
    g.lineTo(left, 123);
    g.closePath();
    g.fillStyle = '#b7ef25';
    g.fill();
    g.clip();

    g.beginPath();
    g.moveTo(left + 8, 118);
    g.lineTo(left + 17, 112);
    g.lineTo(left + 31, 108);
    g.lineTo(center - 31, 104);
    g.lineTo(center + 31, 104);
    g.lineTo(right - 31, 108);
    g.lineTo(right - 17, 112);
    g.lineTo(right - 8, 118);
    g.lineTo(right - 8, 123);
    g.lineTo(right - 17, 129);
    g.lineTo(right - 31, 133);
    g.lineTo(center + 31, 137);
    g.lineTo(center - 31, 137);
    g.lineTo(left + 31, 133);
    g.lineTo(left + 17, 129);
    g.lineTo(left + 8, 123);
    g.closePath();
    g.fillStyle = '#020302';
    g.fill();

    rect(left + 20, 107, 5, 28, '#ed092b');
    rect(right - 25, 107, 5, 28, '#ed092b');
    rect(left + 60, 102, 5, 38, '#f5f523');
    rect(right - 65, 102, 5, 38, '#f5f523');

    rect(center - 13, 100, 26, 41, '#b7ef25');
    rect(center - 9, 101, 18, 39, '#35c95d');
    for (let y = 104; y < 138; y += 5) {
      rect(center - 9, y, 5, 2, '#72ec43');
      rect(center + 4, y, 5, 2, '#72ec43');
    }
    rect(center - 4, 102, 8, 37, '#030504');

    for (let i = 0; i < 5; i++) {
      const y = 109 + i * 6;
      rect(left + 30 + (i % 2) * 4, y, 4, 1, '#e91a35');
      rect(left + 48 - (i % 2) * 3, y + 2, 3, 1, '#d91631');
      rect(right - 34 - (i % 2) * 4, y, 4, 1, '#e91a35');
      rect(right - 51 + (i % 2) * 3, y + 2, 3, 1, '#d91631');
    }

    for (let i = 0; i < 5; i++) {
      const y = 108 + i * 6;
      rect(left + 70 + (i % 2) * 4, y, 4, 1, '#f0ee35');
      rect(left + 83 - (i % 2) * 3, y + 3, 4, 1, '#e8e72c');
      rect(right - 74 - (i % 2) * 4, y, 4, 1, '#f0ee35');
      rect(right - 87 + (i % 2) * 3, y + 3, 4, 1, '#e8e72c');
    }
    g.restore();

    rect(center - 40, 97, 30, 1, '#b7ef25');
    rect(center - 47, 97, 4, 1, '#b7ef25');
    rect(center + 10, 97, 30, 1, '#b7ef25');
    rect(center + 43, 97, 4, 1, '#b7ef25');
    rect(center - 40, 143, 30, 1, '#b7ef25');
    rect(center - 47, 143, 4, 1, '#b7ef25');
    rect(center + 10, 143, 30, 1, '#b7ef25');
    rect(center + 43, 143, 4, 1, '#b7ef25');

    const gaugeX = left + 4 + (attackX - 82) / (284 - 82) * (right - left - 8);
    rect(gaugeX - 3, top - 4, 8, bottom - top + 12, '#050505');
    rect(gaugeX - 2, top - 3, 6, bottom - top + 10, '#a6a6a6');
    rect(gaugeX - 1, top - 3, 4, bottom - top + 10, '#fff');
    rect(gaugeX, top - 2, 2, bottom - top + 8, '#f8ffff');
  }

  function drawBlasterHead(bullet, active) {
    const c = '#fff';
    const glow = active ? '#8ff8ff' : '#a6b8ba';
    if (bullet.orientation === 'horizontal') {
      const fromRight = bullet.side === 'right';
      const x = fromRight ? 287 : 83;
      const y = bullet.y;
      const direction = fromRight ? -1 : 1;
      rect(x - 7, y - 9, 14, 18, c);
      rect(x - 5, y - 6, 10, 11, '#000');
      rect(x - 4, y - 5, 3, 4, c);
      rect(x + 2, y - 5, 3, 4, c);
      rect(x - 2, y + 1, 4, 3, c);
      line(x + direction * 5, y + 5, x + direction * 12, y + 9, c, 2);
      line(x + direction * 5, y - 5, x + direction * 12, y - 9, c, 2);
      rect(x + direction * 8 - (direction < 0 ? 4 : 0), y - 2, 5, 5, glow);
    } else {
      const x = bullet.x;
      const y = bullet.side === 'bottom' ? 137 : 98;
      const direction = bullet.side === 'bottom' ? -1 : 1;
      rect(x - 9, y - 7, 18, 14, c);
      rect(x - 6, y - 5, 12, 10, '#000');
      rect(x - 5, y - 4, 4, 3, c);
      rect(x + 2, y - 4, 4, 3, c);
      rect(x - 2, y + 1, 4, 3, c);
      line(x - 6, y + direction * 5, x - 10, y + direction * 12, c, 2);
      line(x + 6, y + direction * 5, x + 10, y + direction * 12, c, 2);
      rect(x - 2, y + direction * 7 - (direction < 0 ? 4 : 0), 5, 5, glow);
    }
  }

  function drawEnemyTurn() {
    rect(73, 91, 224, 53, '#fff');
    rect(76, 94, 218, 47, '#000');
    heartShape(heart.x, heart.y, stage === 10 ? '#168bff' : '#f5222d');
    for (const bullet of bullets) {
      if (bullet.kind === 'beam') {
        const active = bullet.age >= bullet.warning;
        const pulse = .3 + Math.sin(bullet.age * 38) * .16;
        g.globalAlpha = active ? 1 : pulse;
        if (bullet.orientation === 'horizontal') {
          rect(76, bullet.y - (active ? 4 : 1), 218, active ? 9 : 2, active ? '#fff' : '#7cf5ff');
          if (active) rect(76, bullet.y - 1, 218, 3, '#8ff8ff');
        } else {
          rect(bullet.x - (active ? 4 : 1), 94, active ? 9 : 2, 47, active ? '#fff' : '#7cf5ff');
          if (active) rect(bullet.x - 1, 94, 3, 47, '#8ff8ff');
        }
        g.globalAlpha = 1;
        drawBlasterHead(bullet, active);
        if (active && bullet.age < bullet.warning + .12) {
          g.globalAlpha = .5;
          rect(76, 94, 218, 47, '#fff');
          g.globalAlpha = 1;
        }
      } else if (bullet.kind === 'bone') {
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

  function drawOpeningHero(now) {
    const x = Math.round(openingPlayer.x);
    const y = Math.round(openingPlayer.y);
    const frame = openingPlayer.moving ? Math.floor(now / 115) % 4 : 0;
    const stride = frame === 1 ? 1 : frame === 3 ? -1 : 0;
    const bob = openingPlayer.moving && frame % 2 ? -1 : 0;
    const facingLeft = openingPlayer.direction === 'left';
    const facingUp = openingPlayer.direction === 'up';

    if (heroImage.complete && heroImage.naturalWidth) {
      const sourceBodyHeight = Math.floor(heroImage.naturalHeight * .82);
      g.save();
      g.translate(x, y);
      if (facingLeft) g.scale(-1, 1);
      g.drawImage(
        heroImage,
        0, 0, heroImage.naturalWidth, sourceBodyHeight,
        -7, -15 + bob, 14, 18
      );
      g.restore();

      if (facingUp) {
        rect(x - 5, y - 13 + bob, 10, 5, '#5c2633');
        rect(x - 6, y - 11 + bob, 2, 5, '#5c2633');
        rect(x + 4, y - 11 + bob, 2, 5, '#5c2633');
      }
    } else {
      rect(x - 5, y - 11 + bob, 10, 8, '#5c2633');
      rect(x - 5, y - 3 + bob, 10, 6, '#394d85');
      rect(x - 5, y - 1 + bob, 10, 2, '#f000dd');
      rect(x - 8, y - 3 + bob, 3, 8, '#4a2028');
      rect(x + 5, y - 3 + bob, 3, 8, '#4a2028');
      rect(x - 7, y - 1 + bob, 2, 5, '#70bdf0');
      rect(x + 5, y - 1 + bob, 2, 5, '#70bdf0');
      rect(x - 7, y + 5 + bob, 2, 2, '#f4d431');
      rect(x + 5, y + 5 + bob, 2, 2, '#f4d431');
    }

    const horizontal = openingPlayer.direction === 'right' || openingPlayer.direction === 'left';
    const leftStep = horizontal ? stride : -stride;
    const rightStep = -leftStep;
    const legY = y + 3 + bob;

    rect(x - 4 + leftStep, legY, 3, 2, '#3d171d');
    rect(x + 1 + rightStep, legY, 3, 2, '#3d171d');
    rect(x - 5 + leftStep, legY + 2, 4, 2, '#1a1118');
    rect(x + 1 + rightStep, legY + 2, 4, 2, '#1a1118');

  }

  function drawRoomCenter(roomIndex, theme, now) {
    if (roomIndex === 0) {
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
    } else if (roomIndex === 1) {
      for (let ring = 0; ring < 4; ring++) {
        g.strokeStyle = ring % 2 ? theme.accent : theme.glow;
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(130, 102, 10 + ring * 8, 4 + ring * 4, 0, 0, Math.PI * 2);
        g.stroke();
      }
      rect(127, 99, 7, 5, '#dffcff');
    } else if (roomIndex === 2) {
      for (const x of [108, 130, 152]) {
        rect(x - 5, 91, 10, 20, '#17120b');
        rect(x - 4, 92, 8, 16, theme.accent);
        rect(x - 2, 95, 4, 10, '#fff4b1');
        line(x - 6, 112, x + 6, 112, '#2b2114');
      }
    } else if (roomIndex === 3) {
      g.strokeStyle = theme.accent;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(132, 101, 15, .55, Math.PI * 1.55);
      g.stroke();
      g.beginPath();
      g.arc(139, 99, 12, Math.PI * 1.5, .7);
      g.stroke();
      rect(111, 91, 2, 2, '#fff');
      rect(156, 107, 2, 2, '#fff');
    } else if (roomIndex === 4) {
      for (let i = -3; i <= 3; i++) {
        const sway = Math.sin(now / 500 + i) * 2;
        line(130 + i * 7, 112, 126 + i * 7 + sway, 91 + Math.abs(i) * 2, theme.accent);
        line(126 + i * 7 + sway, 91 + Math.abs(i) * 2, 132 + i * 7, 95 + Math.abs(i), theme.glow);
      }
    } else if (roomIndex === 5) {
      for (const x of [111, 149]) {
        g.strokeStyle = theme.accent;
        g.lineWidth = 2;
        g.strokeRect(x - 9, 88, 18, 27);
        rect(x - 6, 91, 12, 21, '#101919');
        line(x - 5, 110, x + 5, 93, theme.glow);
      }
    } else if (roomIndex === 6) {
      g.strokeStyle = theme.accent;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(130, 101, 17, 0, Math.PI * 2);
      g.stroke();
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        rect(129 + Math.cos(a) * 13, 100 + Math.sin(a) * 13, 2, 2, theme.accent);
      }
      line(130, 101, 130 + Math.sin(now / 850) * 10, 101 - Math.cos(now / 850) * 10, '#fff');
      line(130, 101, 130 + Math.sin(now / 5000) * 7, 101 - Math.cos(now / 5000) * 7, '#fff');
    } else if (roomIndex === 7) {
      line(109, 108, 105, 91, theme.accent, 2);
      line(105, 91, 117, 100, theme.accent, 2);
      line(117, 100, 130, 86, theme.accent, 2);
      line(130, 86, 143, 100, theme.accent, 2);
      line(143, 100, 155, 91, theme.accent, 2);
      line(155, 91, 151, 108, theme.accent, 2);
      rect(109, 108, 43, 7, theme.accent);
      rect(115, 110, 31, 3, '#7a5d00');
    } else if (roomIndex === 8) {
      g.fillStyle = '#ff6d62';
      g.beginPath(); g.arc(116, 101, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#64b8ff';
      g.beginPath(); g.arc(144, 101, 12, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + now / 900;
        line(116 + Math.cos(a) * 14, 101 + Math.sin(a) * 14, 116 + Math.cos(a) * 20, 101 + Math.sin(a) * 20, '#ffb15d');
        line(144 + Math.cos(-a) * 14, 101 + Math.sin(-a) * 14, 144 + Math.cos(-a) * 20, 101 + Math.sin(-a) * 20, '#a6e1ff');
      }
    } else {
      for (const x of [103, 157]) {
        rect(x - 5, 78, 10, 39, '#e8e8e8');
        rect(x - 3, 80, 6, 35, '#222');
        rect(x - 8, 76, 16, 4, '#fff');
        rect(x - 8, 115, 16, 4, '#fff');
      }
      line(113, 102, 147, 102, '#777', 1);
      rect(128, 98, 4, 8, '#fff');
    }
  }

  function drawOpening(now) {
    const roomIndex = Math.max(0, Math.min(9, pendingStage - 1));
    const theme = ROOM_THEMES[roomIndex];
    rect(0, 0, W, H, '#050505');

    rect(35, 34, 195, 112, theme.floor);
    rect(24, 46, 217, 88, theme.floor);
    rect(0, 98, 320, 28, theme.corridor);

    rect(24, 46, 217, 3, theme.light);
    rect(24, 131, 217, 3, '#17171b');
    rect(35, 34, 195, 3, theme.light);
    rect(35, 143, 195, 3, '#17171b');

    for (let ty = 55; ty < 139; ty += 14) {
      const offset = ((ty / 14) | 0) % 2 ? 9 : 0;
      for (let tx = 39 + offset; tx < 227; tx += 28) {
        rect(tx, ty, 18, 1, theme.light);
        rect(tx, ty + 11, 18, 1, '#292832');
        rect(tx, ty, 1, 12, '#292832');
      }
    }
    for (let tx = 0; tx < 320; tx += 18) {
      rect(tx, 99, 12, 1, theme.light);
      rect(tx + 7, 124, 11, 1, '#25252c');
    }

    rect(116, 27, 28, 32, theme.glow);
    rect(119, 30, 22, 29, '#050505');
    rect(122, 34, 16, 25, '#111116');
    rect(126, 39, 8, 14, theme.center);
    rect(128, 42, 4, 8, theme.accent);
    rect(113, 56, 34, 4, theme.light);

    rect(50, 73, 160, 57, theme.light);
    rect(57, 77, 146, 49, theme.glow);
    rect(68, 82, 124, 39, theme.center);
    rect(82, 88, 96, 28, theme.floor);

    drawRoomCenter(roomIndex, theme, now);
    drawOpeningHero(now);

    rect(0, 96, 18, 2, theme.glow);
    rect(0, 126, 18, 2, '#27272d');
    rect(302, 96, 18, 2, theme.glow);
    rect(302, 126, 18, 2, '#27272d');

    text('ROOM ' + String(pendingStage).padStart(2, '0'), 273, 48, 7, theme.glow, 'center');
    text('STAGE ' + pendingStage, 273, 61, 9, theme.accent, 'center');
    text(theme.name, 273, 73, 7, '#fff', 'center');
    text(pendingStage > 1 ? '◀' : '', 10, 107, 8, theme.glow, 'center');
    text(pendingStage < 10 ? '▶' : '', 310, 107, 8, theme.glow, 'center');
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
    const inChamber = nextX >= 25 && nextX <= 240 && nextY >= 48 && nextY <= 143;
    const inHorizontalCorridor = nextX >= -6 && nextX <= 326 && nextY >= 96 && nextY <= 128;
    const inBattleDoor = nextX >= 117 && nextX <= 143 && nextY >= 28 && nextY <= 65;
    if (inChamber || inHorizontalCorridor || inBattleDoor) {
      openingPlayer.x = nextX;
      openingPlayer.y = nextY;
    }

    if (openingPlayer.y < 34 && openingPlayer.x >= 117 && openingPlayer.x <= 143) {
      openingPlayer.y = 62;
      startStage(pendingStage);
      return;
    }
    if (openingPlayer.x > 318) {
      if (pendingStage < 10) {
        pendingStage++;
        openingPlayer.x = 2;
      } else openingPlayer.x = 317;
    } else if (openingPlayer.x < 2) {
      if (pendingStage > 1) {
        pendingStage--;
        openingPlayer.x = 318;
      } else openingPlayer.x = 2;
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
        text((clearChoice === 1 ? '♥ ' : '') + (stage < 10 ? 'RETURN' : 'ENDING'), 214, 115, 9, nextColor, 'center');
        text('← → でえらぶ　 ENTER / Z', 160, 151, 8, '#fff', 'center');
      } else drawEnding(state === 'victory');
    } else {
      rect(0, 0, W, H, '#000');
      if (stage !== 10) drawGrid();
      drawEnemies(now);
      if (state === 'attack') drawAttackGauge();
      else if (state === 'enemyTurn') drawEnemyTurn();
      else if (!(stage === 10 && state === 'command')) drawMessageBox();
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

  function speechBlip() {
    startAudio();
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475, sans: 152
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const isSans = speakingEnemy?.visual === 'sans';
    const frequencies = isSans ? [base, base * .74] : [base + (Math.floor(speechChars) % 3) * 13];

    frequencies.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = isSans ? 'square' : (index % 2 ? 'sawtooth' : 'triangle');
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      oscillator.detune.setValueAtTime((Math.floor(speechChars) % 5 - 2) * 7, audio.currentTime);
      const volume = isSans ? (index === 0 ? .07 : .035) : .045;
      gain.gain.setValueAtTime(volume, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + (isSans ? .052 : .04));
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + (isSans ? .058 : .045));
    });
  }

  function updateEnemySpeech(dt) {
    if (state !== 'enemySpeak') return;
    const fullText = message.join('');
    const previous = Math.floor(speechChars);
    speechChars = Math.min(fullText.length, speechChars + dt * (speakingEnemy?.visual === 'sans' ? 24 : 30));
    const current = Math.floor(speechChars);
    for (let index = previous; index < current; index++) {
      const character = fullText[index];
      if (character && !/\s|[。、！？」＊：]/.test(character)) speechBlip();
    }
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

  function scalePatternsForStage(patterns, stageNumber) {
    const depth = Math.max(0, Math.min(9, stageNumber - 1));
    return patterns.map(pattern => ({
      ...pattern,
      speed: pattern.speed * (1 + depth * .065),
      interval: Math.max(90, Math.round(pattern.interval * (1 - depth * .048))),
      burst: Math.min(7, pattern.burst + Math.floor(depth / 3)),
      wave: pattern.wave + depth * 1.15,
      damage: pattern.damage + Math.floor(depth / 3),
      duration: pattern.duration + depth * 120
    }));
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
      patterns: scalePatternsForStage(
        createAttackPatterns(enemy.type, number * 7 + index * 11),
        number
      )
    }));
    hp = maxHp;
    menu = 0;
    target = 0;
    bullets = [];
    sansDodges = 0;
    sansTurn = 0;
    dodgeAt = -10000;
    dodgeEnemy = -1;
    if (stage === 10) {
      setState('intro', [
        '＊ 最後の審判役が 静かに道をふさいだ。',
        '＊ 笑顔の骨人が ポケットに手を入れた。'
      ]);
    } else {
      setState('intro', [
        '＊ STAGE ' + stage + ' / 10',
        '＊ ' + enemies.map(enemy => enemy.name).join('と') + 'が あらわれた。'
      ]);
    }
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
    if (stage === 10 && sansTurn < SANS_ATTACK_SEQUENCE.length) {
      sansDodges++;
      dodgeAt = performance.now();
      dodgeEnemy = attackTarget;
      dodgeDirection = sansDodges % 2 ? 1 : -1;
      beep(760, .07);
      setState('result', [
        '＊ サンズは 笑ったまま 身をかわした。',
        '＊ MISS の文字だけが のこった。'
      ]);
      return;
    }

    const defender = enemies[attackTarget];
    const dodgeChance = playerLevel >= 6 ? Math.min(.48, .1 + (playerLevel - 6) * .027) : 0;
    if (stage !== 10 && !defender.justDodged && Math.random() < dodgeChance) {
      defender.justDodged = true;
      dodgeAt = performance.now();
      dodgeEnemy = attackTarget;
      dodgeDirection = (turnCount + attackTarget) % 2 ? 1 : -1;
      beep(720, .07);
      setState('result', [
        '＊ ' + defender.name + 'は すばやく よけた。',
        '＊ LV' + playerLevel + ' 回避率 ' + Math.round(dodgeChance * 100) + '％。'
      ]);
      return;
    }
    defender.justDodged = false;
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
    if (attacker.type === 'sans') {
      const sequenceIndex = sansTurn % SANS_ATTACK_SEQUENCE.length;
      const sansPhase = SANS_ATTACK_SEQUENCE[sequenceIndex];
      attackPattern = {
        ...attackPattern,
        sansPhase,
        gravity: [0, 1, 4, 5, 6].includes(sansPhase),
        duration: sequenceIndex === SANS_ATTACK_SEQUENCE.length - 1 ? 7200 : 4800 + sequenceIndex * 90
      };
      safeLaneAxis = sansPhase % 2 === 0 ? 'y' : 'x';
      safeLaneValue = safeLaneAxis === 'y'
        ? 105 + (sequenceIndex % 3) * 12
        : 112 + (sequenceIndex % 4) * 42;
      sansTurn++;
    } else {
      safeLaneAxis = attackPattern.formation % 2 === 0 ? 'y' : 'x';
      safeLaneValue = safeLaneAxis === 'y'
        ? 105 + ((attackPattern.id + turnCount) % 3) * 12
        : 112 + ((attackPattern.id + turnCount) % 4) * 42;
    }
    if (attacker.type !== 'sans') {
      speakingEnemy = null;
      speechChars = 0;
      startEnemyAttack();
      return;
    }

    speakingEnemy = attacker;
    speechChars = 0;
    if (spotifyController) spotifyController.pause();
    const battleLine = SANS_BATTLE_LINES[(sansTurn - 1) % SANS_BATTLE_LINES.length];
    setState('enemySpeak', [
      '＊ ' + attacker.name + '「' + battleLine + '」',
      '＊ 黒い箱の空気が 低く震えた。'
    ]);
  }

  function startEnemyAttack() {
    if (spotifyController) spotifyController.play();
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
      h: extras.h || (kind === 'bone' ? 14 : 0),
      curve: extras.curve || 0,
      homing: extras.homing || 0,
      orientation: extras.orientation || 'horizontal',
      length: extras.length || 0,
      warning: extras.warning || 0,
      life: extras.life || 5,
      side: extras.side || 'left',
      age: 0
    });
  }

  function aimedVelocity(x, y, speed, angleOffset = 0) {
    const angle = Math.atan2(heart.y - y, heart.x - x) + angleOffset;
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  }

  function spawnSansVolley(pattern, now) {
    const phase = pattern.sansPhase ?? ((pattern.id - 1) % 8);
    const speed = pattern.speed;
    const left = 79, right = 291, top = 96, bottom = 140;

    if (phase === 0) {
      const gap = 2 + (turnCount % 3);
      for (let lane = 0; lane < 7; lane++) {
        if (lane === gap || lane === gap + 1) continue;
        const fromRight = (lane + turnCount) % 2 === 0;
        addProjectile('bone', fromRight ? right : left, bottom, fromRight ? -speed : speed, 0, {
          h: 8 + lane * 4,
          curve: lane % 2 ? .08 : -.08
        });
      }
    } else if (phase === 1) {
      for (let i = 0; i < 8; i++) {
        if (i === (turnCount * 3) % 8) continue;
        addProjectile('bone', 88 + i * 27, bottom + 6, 0, -speed * .72, { h: 12 + (i % 3) * 6 });
      }
    } else if (phase === 2) {
      const safe = 1 + turnCount % 3;
      for (let lane = 0; lane < 4; lane++) {
        if (lane === safe) continue;
        addProjectile('beam', left, 103 + lane * 10, 0, 0, {
          orientation: 'horizontal', length: right - left, warning: .42, life: .78, side: turnCount % 2 ? 'right' : 'left'
        });
      }
    } else if (phase === 3) {
      const safe = 1 + turnCount % 4;
      for (let lane = 0; lane < 6; lane++) {
        if (lane === safe || lane === safe + 1) continue;
        addProjectile('beam', 91 + lane * 37, top, 0, 0, {
          orientation: 'vertical', length: bottom - top, warning: .38, life: .76, side: turnCount % 2 ? 'bottom' : 'top'
        });
      }
    } else if (phase === 4) {
      for (let i = 0; i < 10; i++) {
        const angle = now / 320 + i * Math.PI * 2 / 10;
        addProjectile('bone', 185 + Math.cos(angle) * 106, 117 + Math.sin(angle) * 31,
          -Math.cos(angle) * speed, -Math.sin(angle) * speed * .55,
          { h: 8 + i % 4, curve: i % 2 ? .45 : -.45 });
      }
    } else if (phase === 5) {
      const gapX = 105 + (turnCount * 31) % 130;
      for (let x = 86; x < 291; x += 17) {
        if (Math.abs(x - gapX) < 20) continue;
        addProjectile('bone', x, bottom + 5, 0, -speed * .45, { h: 18 + (x % 4) * 3 });
      }
      addProjectile('beam', left, top + 8 + turnCount % 3 * 11, 0, 0, {
        orientation: 'horizontal', length: right - left, warning: .55, life: .9, side: turnCount % 2 ? 'right' : 'left'
      });
    } else if (phase === 6) {
      for (let i = 0; i < 5; i++) {
        const y = 101 + i * 8;
        addProjectile('bone', i % 2 ? left : right, bottom, i % 2 ? speed : -speed, 0, { h: 9 + i * 6 });
      }
      addProjectile('beam', 185, top, 0, 0, {
        orientation: 'vertical', length: bottom - top, warning: .48, life: .84, side: turnCount % 2 ? 'bottom' : 'top'
      });
    } else {
      addProjectile('beam', left, 106, 0, 0, {
        orientation: 'horizontal', length: right - left, warning: .48, life: .78
      });
      addProjectile('beam', left, 130, 0, 0, {
        orientation: 'horizontal', length: right - left, warning: .48, life: .78
      });
      addProjectile('beam', 138, top, 0, 0, {
        orientation: 'vertical', length: bottom - top, warning: .6, life: .9
      });
      addProjectile('beam', 232, top, 0, 0, {
        orientation: 'vertical', length: bottom - top, warning: .6, life: .9
      });
    }
  }

  function spawnPatternVolley(pattern, now) {
    const kind = pattern.kind;
    if (kind === 'bone') {
      spawnSansVolley(pattern, now);
      return;
    }
    const speed = pattern.speed;
    const formation = pattern.formation;
    const left = 79, right = 291, top = 96, bottom = 140;
    const centerX = 185, centerY = 117;
    const count = Math.min(7, pattern.burst + (formation % 3));
    const lane = 12;
    const lanePadding = 8;

    const sideShot = (fromRight, y, extras = {}) => {
      if (safeLaneAxis === 'y' && Math.abs(y - safeLaneValue) < lanePadding) return;
      addProjectile(kind, fromRight ? right : left, y, fromRight ? -speed : speed, extras.vy || 0, extras);
    };
    const verticalShot = (fromBottom, x, extras = {}) => {
      if (safeLaneAxis === 'x' && Math.abs(x - safeLaneValue) < lanePadding + 2) return;
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
          addProjectile(kind, centerX + Math.cos(angle) * 103, centerY + Math.sin(angle) * 31, -Math.cos(angle) * speed, -Math.sin(angle) * speed * .55, { curve: .45 });
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

      let hit;
      if (bullet.kind === 'beam') {
        const active = bullet.age >= bullet.warning && bullet.age <= bullet.life;
        hit = active && (bullet.orientation === 'horizontal'
          ? Math.abs(bullet.y - heart.y) < 6
          : Math.abs(bullet.x - heart.x) < 6);
      } else if (bullet.kind === 'bone') {
        hit = Math.abs(bullet.x - heart.x) < 6 && heart.y > bullet.y - bullet.h - 4 && heart.y < bullet.y + 5;
      } else {
        hit = Math.abs(bullet.x - heart.x) < 6 && Math.abs(bullet.y - heart.y) < 7;
      }
      const routeWidth = Math.max(2.4, 6.4 - (stage - 1) * .44);
      const inGuaranteedLane = safeLaneAxis === 'y'
        ? Math.abs(heart.y - safeLaneValue) < routeWidth
        : Math.abs(heart.x - safeLaneValue) < routeWidth + .8;
      if (inGuaranteedLane) hit = false;
      if (invincible <= 0 && hit) {
        hp = Math.max(0, hp - pattern.damage);
        invincible = bullet.kind === 'bone' ? .34 : .58;
        beep(110, .1);
      }
    }

    bullets = bullets.filter(bullet => bullet.kind === 'beam'
      ? bullet.age < bullet.life
      : bullet.x > 68 && bullet.x < 302 && bullet.y > 84 && bullet.y < 155);
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
      if (stage === 10 && sansTurn === 0) beginEnemyTurn();
      else setState('command', ['＊ どうする？']);
      return;
    }
    if (state === 'enemySpeak') {
      const fullLength = message.join('').length;
      if (speechChars < fullLength) {
        speechChars = fullLength;
      } else {
        startEnemyAttack();
      }
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
      if (clearChoice === 0) {
        startStage(stage);
        return;
      }
      if (stage >= 10) {
        setState('victory');
        return;
      }
      pendingStage = stage;
      openingPlayer.x = 130;
      openingPlayer.y = 112;
      openingPlayer.direction = 'down';
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
    updateEnemySpeech(dt);
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