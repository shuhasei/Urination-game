(() => {
  'use strict';

  const VERSION = '20260814-sans-block-engine-v29';

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

  function injectBeforeFunction(source, name, code, sentinel) {
    if (source.includes(sentinel)) return source;
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + code + '\n\n' + source.slice(bounds.start);
  }

  const runtime = String.raw`
  // -----------------------------------------------------------------------
  // Scratch-style Sans block engine v29
  // Each object below is equivalent to one custom Scratch block invocation.
  // Attacks contain data only; this engine is the sole execution path.
  // -----------------------------------------------------------------------
  const SANS_BLOCK_FPS_V29 = 30;
  const SANS_BLOCK_FRAME_MS_V29 = 1000 / SANS_BLOCK_FPS_V29;

  const SansBlockV29 = Object.freeze({
    arena: (at, preset, snap = true) => ({ at, type: 'ARENA', preset, snap }),
    soul: (at, mode, gravity = GravityDirection.DOWN, center = false) =>
      ({ at, type: 'SOUL', mode, gravity, center }),
    gesture: (at, direction, duration = 430) =>
      ({ at, type: 'GESTURE', direction, duration }),
    slam: (at, direction, duration = 430) =>
      ({ at, type: 'SLAM', direction, duration }),
    clear: at => ({ at, type: 'CLEAR' }),
    floor: (at, options) => ({ at, type: 'FLOOR', options }),
    edge: (at, options) => ({ at, type: 'EDGE', options }),
    sine: (at, zone, count, speed, amplitude, options) =>
      ({ at, type: 'SINE', zone, count, speed, amplitude, options }),
    boneV: (at, zone, x, y, height, direction, speed, boneType = 0, options = {}) =>
      ({ at, type: 'BONE_V', zone, x, y, height, direction, speed, boneType, options }),
    boneVRepeat: (at, zone, x, y, height, direction, speed, count, spacing,
      boneType = 0, options = {}) => ({ at, type: 'BONE_V_REPEAT', zone, x, y,
      height, direction, speed, count, spacing, boneType, options }),
    boneVGroup: (at, zone, bones) => ({ at, type: 'BONE_V_GROUP', zone, bones }),
    boneHRepeat: (at, zone, x, y, length, direction, speed, count, spacing,
      boneType = 0, options = {}) => ({ at, type: 'BONE_H_REPEAT', zone, x, y,
      length, direction, speed, count, spacing, boneType, options }),
    platform: (at, zone, x, y, width, direction, speed, options = {}) =>
      ({ at, type: 'PLATFORM', zone, x, y, width, direction, speed, options }),
    platformRepeat: (at, zone, x, y, width, direction, speed, count, spacing,
      options = {}) => ({ at, type: 'PLATFORM_REPEAT', zone, x, y, width,
      direction, speed, count, spacing, options }),
    heart: (at, zone, x, y) => ({ at, type: 'HEART', zone, x, y }),
    gap2: (at, choices, offsets) => ({ at, type: 'GAP2', choices, offsets }),
    multi1: (at, choice) => ({ at, type: 'MULTI1', choice }),
    multi2: (at, choice) => ({ at, type: 'MULTI2', choice }),
    blasters: (at, list) => ({ at, type: 'BLASTERS', list }),
    aimed: (at, angle, size, charge, fire, options = {}) =>
      ({ at, type: 'AIMED', angle, size, charge, fire, options }),
    tunnel: (at, options) => ({ at, type: 'TUNNEL', options }),
    spiral: (at, options) => ({ at, type: 'SPIRAL', options }),
    longReady: at => ({ at, type: 'LONG_READY' })
  });

  const SB = SansBlockV29;
  const SP = (...items) => Object.freeze(items.flat(Infinity).filter(Boolean)
    .map((block, index) => Object.freeze({ ...block, blockIndex: index }))
    .sort((a, b) => a.at - b.at || a.blockIndex - b.blockIndex));

  const SANS_BLOCK_PROGRAMS_V29 = Object.freeze([
    SP(
      SB.arena(.01, 'square'), SB.soul(.01, 'red', GravityDirection.DOWN, true),
      SB.gesture(.01, GravityDirection.UP, 920),
      SB.soul(.36, 'blue', GravityDirection.UP), SB.slam(.36, GravityDirection.UP, 620),
      SB.edge(.82, { top: true, depth: 10, spacing: 6, life: .52 }),
      SB.clear(1.40), SB.soul(1.40, 'red', GravityDirection.DOWN, true),
      SB.gesture(1.46, GravityDirection.RIGHT, 820),
      SB.sine(2.27, 'square', 20, 360, 25,
        { opening: 14, spacing: 9, life: 1.30, phase: -.6 }),
      SB.blasters(3.37, [[1,0,0,189,246,0,.333,.266],[1,0,0,259,166,90,.333,.266],
        [1,640,480,449,366,180,.333,.266],[1,640,480,379,446,270,.333,.266]]),
      SB.blasters(4.27, [[1,0,0,189,176,45,.333,.266],[1,640,0,449,176,135,.333,.266],
        [1,640,480,449,436,225,.333,.266],[1,0,480,189,436,315,.333,.266]]),
      SB.blasters(5.17, [[1,0,0,189,246,0,.333,.266],[1,0,0,259,166,90,.333,.266],
        [1,640,480,449,366,180,.333,.266],[1,640,480,379,446,270,.333,.266]]),
      SB.blasters(5.87, [[2,0,240,139,306,0,.666,.5],[2,640,240,499,306,180,.666,.5]])
    ),
    SP(
      SB.boneVRepeat(.20,'wide',128,257,95,0,180,8,120,0,{life:6.3}),
      SB.boneVRepeat(.20,'wide',128,366,20,0,180,8,120,0,{life:6.3}),
      SB.boneVRepeat(.20,'wide',503,257,95,2,180,8,120,0,{life:6.3}),
      SB.boneVRepeat(.20,'wide',503,366,20,2,180,8,120,0,{life:6.3})
    ),
    SP([[.20,503,286,100,2,300,1],[.433,503,366,20,2,300,0],
      [.933,503,286,100,2,300,1],[1.166,503,366,20,2,300,0],
      [1.666,503,286,100,2,300,1],[1.899,503,366,20,2,300,0],
      [2.832,128,366,20,0,300,0],[3.232,128,286,100,0,300,1],
      [3.565,128,366,20,0,300,0],[3.965,128,286,100,0,300,1],
      [4.298,128,366,20,0,300,0],[4.698,128,286,100,0,300,1]]
      .map(v => SB.boneV(v[0],'wide',v[1],v[2],v[3],v[4],v[5],v[6],{life:2.3}))),
    SP(SB.gap2(.02,[0,1,2,0,3,1,0,2,1,3,0,1],[-2,0,2,0,-2,2])),
    SP(
      SB.platform(.01,'wide',15,346,61,0,120,{life:8.1}),
      SB.boneVRepeat(.40,'wide',133,356,40,0,120,41,15,0,{life:6.15}),
      SB.platform(1.60,'wide',-61,346,61,0,150,{life:6.5}),
      SB.platform(3.30,'wide',-61,346,61,0,180,{life:5}),
      SB.boneVGroup(4.30,'wide',[[133,257,45,0,210,0,{life:3.3}],
        [119,257,45,0,210,0,{life:3.3}],[105,257,45,0,210,0,{life:3.3}]]),
      SB.boneV(6.60,'wide',133,257,95,0,270,0,{life:2})
    ),
    SP(
      SB.platform(.01,'wide',640,346,51,2,150,{life:9.5}),
      SB.boneVRepeat(.40,'wide',508,356,40,2,120,58,15,0,{life:4.45}),
      SB.platform(.80,'wide',640,296,51,2,150,{life:8.8}),
      SB.platform(1.30,'wide',640,346,51,2,150,{life:8.3}),
      SB.boneV(1.70,'wide',508,316,70,2,150,0,{life:7.5}),
      SB.platform(2.10,'wide',640,296,31,2,60,{life:8}),
      SB.platform(2.70,'wide',640,326,51,2,150,{life:7.1}),
      SB.platform(3.40,'wide',640,336,51,2,150,{life:6.4}),
      SB.boneV(3.70,'wide',508,257,45,2,150,0,{life:5.7}),
      SB.platform(4.10,'wide',640,316,51,2,150,{life:5.7}),
      SB.boneV(4.40,'wide',508,257,55,2,150,0,{life:5}),
      SB.boneV(5.10,'wide',508,257,35,2,150,0,{life:4.3}),
      SB.boneV(6.60,'wide',133,257,95,0,90,0,{life:3.2}),
      SB.boneV(7.30,'wide',508,276,110,2,240,0,{life:2.4})
    ),
    SP(
      SB.platformRepeat(.01,'wide',513,346,121,2,120,5,220,{life:8.3}),
      SB.platformRepeat(.01,'wide',-71,306,161,0,120,4,280,{life:8.3}),
      [2,1,0,2,0,1,2,1,0,1,2,0,2,1,0,2].map((choice,index) => choice === 0
        ? SB.boneV(.08+index*.50,'wide',517,257,45,2,120,0,{life:2.4})
        : choice === 1
          ? SB.boneV(.08+index*.50,'wide',125,306,40,0,120,0,{life:2.4})
          : SB.boneV(.08+index*.50,'wide',517,349,35,2,120,0,{life:2.4}))
    ),
    SP(
      SB.platform(.01,'wideTall',151,336,41,0,90,{life:7.4}),
      SB.heart(.01,'wideTall',175,327),
      SB.boneVRepeat(.01,'wideTall',528,366,40,0,60,60,15,0,{life:7.4}),
      SB.boneVRepeat(.01,'wideTall',283,267,40,3,90,11,85,0,{life:7.4}),
      SB.boneVRepeat(.01,'wideTall',363,331,40,1,120,13,95,0,{life:7.4}),
      SB.boneVRepeat(.01,'wideTall',443,248,40,3,90,11,85,0,{life:7.4})
    ),
    SP(
      SB.platformRepeat(.01,'wide',552,346,51,2,120,8,140,{life:9}),
      SB.platformRepeat(.01,'wide',-20,306,51,0,120,8,160,{life:9}),
      [285,365,325,285,365].map((row,index) =>
        SB.blasters(.08+index*1.80,[[0,0,0,73,row,0,.566,.10]])),
      [365,325,285,365,325].map((row,index) =>
        SB.blasters(.98+index*1.80,[[0,640,0,563,row,180,.566,.10]]))
    ),
    SP(
      SB.platform(.01,'wideTall',151,336,81,0,68,{life:7.4}),
      SB.heart(.01,'wideTall',151,327),
      SB.boneVRepeat(.01,'wideTall',528,366,30,0,60,60,15,0,{life:6}),
      SB.boneVRepeat(.01,'wideTall',283,268,30,3,84,11,75,0,{life:7.4}),
      SB.boneVRepeat(.01,'wideTall',363,325,30,1,108,10,100,0,{life:7.4}),
      SB.boneVRepeat(.01,'wideTall',443,268,30,3,84,11,75,0,{life:7.4})
    ),
    SP(
      SB.boneVRepeat(.40,'wide',128,257,95,0,210,8,133,0,{life:5.9}),
      SB.boneVRepeat(.40,'wide',128,366,20,0,210,8,133,0,{life:5.9}),
      SB.boneVRepeat(.40,'wide',503,257,95,2,210,8,133,0,{life:5.9}),
      SB.boneVRepeat(.40,'wide',503,366,20,2,210,8,133,0,{life:5.9})
    ),
    SP(
      SB.boneVRepeat(.50,'wide',128,366,20,0,120,8,76,0,{life:7.1}),
      SB.boneVRepeat(.50,'wide',513,257,107,2,120,8,76,0,{life:7.1})
    ),
    SP(SB.gap2(.02,[1,0,3,2,0,1,3,0,2,1,0,3],[0,2,-2,0,2,-2])),
    SP([[.02,1],[1.48,2],[3.22,3],[5.10,4],[6.72,1]].map(v => SB.multi1(v[0],v[1]))),
    SP(SB.soul(.01,'red'),[.05,3.12,.82,4.05,2.42,5.32,3.02,.22,1.72,4.78,2.82,5.88,1.10,3.88,5.14]
      .map((angle,index) => SB.aimed(.50+index*.53333,angle,0,.46666,.03333))),
    SP([[.02,6],[1.34,7],[3.04,6],[4.34,5],[6.05,8]].map(v => SB.multi2(v[0],v[1]))),
    SP([GravityDirection.RIGHT,GravityDirection.RIGHT,GravityDirection.DOWN,
      GravityDirection.LEFT,GravityDirection.DOWN,GravityDirection.UP,
      GravityDirection.LEFT,GravityDirection.RIGHT,GravityDirection.RIGHT]
      .map((direction,index) => SB.slam(.27+index*.92,direction))),
    SP([GravityDirection.LEFT,GravityDirection.UP,GravityDirection.DOWN,
      GravityDirection.RIGHT,GravityDirection.UP,GravityDirection.RIGHT,
      GravityDirection.DOWN,GravityDirection.LEFT,GravityDirection.UP]
      .map((direction,index) => SB.slam(.27+index*.76,direction))),
    SP(SB.soul(.01,'red'),[.82,3.18,5.82,.16,2.02,4.56,5.48,1.30,3.70,.58,2.82,4.98]
      .map((angle,index) => SB.aimed(.40+index*.66666,angle,1,.66666,.03333))),
    SP(
      SB.boneHRepeat(.20,'square',130,-10,200,1,300,7,183,0,{life:5.7}),
      SB.boneHRepeat(.20,'square',330,650,200,3,300,7,183,0,{life:5.7})
    ),
    SP(SB.multi2(.02,8),SB.multi2(1.52,5),SB.multi1(3.05,1),
      SB.multi2(4.55,7),SB.multi1(6.35,4)),
    SP([GravityDirection.DOWN,GravityDirection.UP,GravityDirection.UP,
      GravityDirection.LEFT,GravityDirection.UP,GravityDirection.DOWN,
      GravityDirection.LEFT,GravityDirection.UP,GravityDirection.RIGHT]
      .map((direction,index) => SB.slam(.27+index*.50,direction))),
    SP(
      SB.arena(.01,'square'),SB.soul(.01,'blue'),
      SB.floor(.01,{height:6,spacing:7,life:.9,gapRadius:8}),
      [GravityDirection.RIGHT,GravityDirection.DOWN,GravityDirection.LEFT,GravityDirection.UP,
        GravityDirection.RIGHT,GravityDirection.DOWN,GravityDirection.LEFT,GravityDirection.UP]
        .map((direction,index) => SB.slam(.08+index*.43,direction)),
      SB.clear(3.50),SB.longReady(4.43),SB.tunnel(4.48,{speed:132,life:11.4}),
      SB.clear(15.58),SB.arena(15.58,'square'),SB.soul(15.58,'blue'),
      SB.edge(16.30,{top:true,bottom:true,depth:10,spacing:5,life:.36}),
      SB.clear(16.82),SB.edge(17.30,{top:true,left:true,depth:11,spacing:5,life:.50}),
      SB.clear(17.80),SB.edge(18.30,{bottom:true,right:true,depth:10,spacing:5,life:.36}),
      SB.clear(18.82),SB.soul(19.22,'red'),
      SB.edge(19.22,{left:true,depth:12,spacing:5,life:1.30}),
      SB.spiral(19.35,{count:64,startAngle:0,angleStep:-Math.PI/32,
        appearanceDuration:.95,fireDelay:1,fireStep:.13,chargeDuration:.24,
        activeDuration:.45,thickness:6,radiusX:76,radiusY:55,length:310}),
      SB.clear(29.05),SB.arena(29.05,'square'),SB.soul(29.05,'blue'),
      Array.from({length:33},(_,index) => {
        const directions=[GravityDirection.LEFT,GravityDirection.DOWN,GravityDirection.RIGHT,
          GravityDirection.UP,GravityDirection.RIGHT,GravityDirection.DOWN,
          GravityDirection.LEFT,GravityDirection.UP,GravityDirection.DOWN,
          GravityDirection.RIGHT,GravityDirection.UP,GravityDirection.LEFT];
        return SB.slam(29.18+index*.50,directions[index%directions.length]);
      })
    )
  ]);

  // Read-only Scratch block palette and script manifest for developer tools.
  window.__SANS_BLOCK_ENGINE_V29 = Object.freeze({
    fps: SANS_BLOCK_FPS_V29,
    blockTypes: Object.freeze(Object.keys(SansBlockV29)),
    programs: SANS_BLOCK_PROGRAMS_V29
  });

  function sansBlockZoneV29(name) {
    return RECORDED_ZONE[name] || RECORDED_ZONE.square;
  }

  function executeSansBlockV29(block, now) {
    const zone = block.zone ? sansBlockZoneV29(block.zone) : null;
    switch (block.type) {
      case 'ARENA': setSansArena(block.preset, block.snap); break;
      case 'SOUL': setScriptSoul(block.mode, block.gravity, block.center); break;
      case 'GESTURE':
        sansGestureDirection = block.direction;
        sansGestureStartedAt = now;
        sansGestureUntil = now + block.duration;
        break;
      case 'SLAM': slamSoul(block.direction, block.direction, block.duration); break;
      case 'CLEAR': clearSansThreats(); break;
      case 'FLOOR': spawnFloorTeeth({ ...block.options, gapX: heart.x }); break;
      case 'EDGE': spawnBoneEdgeSet(block.options); break;
      case 'SINE': spawnRecordedSineBones(zone, block.count, block.speed,
        block.amplitude, block.options); break;
      case 'BONE_V':
        spawnRecordedBoneV(zone, block.x, block.y, block.height, block.direction,
          block.speed, block.boneType, block.options);
        playBoneEmergeSound();
        break;
      case 'BONE_V_REPEAT':
        spawnRecordedBoneVRepeat(zone, block.x, block.y, block.height, block.direction,
          block.speed, block.count, block.spacing, block.boneType, block.options);
        break;
      case 'BONE_V_GROUP':
        block.bones.forEach(v => spawnRecordedBoneV(zone,v[0],v[1],v[2],v[3],v[4],v[5],v[6]));
        playBoneEmergeSound();
        break;
      case 'BONE_H_REPEAT':
        spawnRecordedBoneHRepeat(zone, block.x, block.y, block.length, block.direction,
          block.speed, block.count, block.spacing, block.boneType, block.options);
        break;
      case 'PLATFORM': spawnRecordedPlatform(zone,block.x,block.y,block.width,
        block.direction,block.speed,block.options); break;
      case 'PLATFORM_REPEAT': spawnRecordedPlatformRepeat(zone,block.x,block.y,block.width,
        block.direction,block.speed,block.count,block.spacing,block.options); break;
      case 'HEART': setRecordedHeart(zone,block.x,block.y); break;
      case 'GAP2': spawnRecordedBoneGap2(block.choices,block.offsets); break;
      case 'MULTI1': spawnMulti1Attack(block.choice); break;
      case 'MULTI2': spawnMulti2Attack(block.choice); break;
      case 'BLASTERS': block.list.forEach(v => spawnRecordedBlaster(...v)); break;
      case 'AIMED': spawnAimedRecordedBlaster(block.angle,block.size,block.charge,
        block.fire,block.options); break;
      case 'TUNNEL': spawnFinalBoneTunnelTrain(block.options); break;
      case 'SPIRAL': spawnSequentialBlasterSpiral(block.options); break;
      case 'LONG_READY': {
        setSansArena('long', false);
        setScriptSoul('red', GravityDirection.DOWN, false);
        const arena = battleArena();
        heart.x = arena.left + 10;
        heart.y = arena.bottom - 5;
        heart.vx = 0; heart.vy = 0; heart.isJumping = false;
        heart.jumpHold = 0; heart.jumpWasHeld = false; heart.jumpBuffer = 0;
        heart.coyoteTime = BLUE_SOUL_COYOTE_TIME; heart.slamActive = false;
        break;
      }
    }
  }

  function updateSansBlockContinuousV29(scriptIndex, elapsed) {
    if (scriptIndex !== 22) return;
    const square = SANS_ARENA_PRESETS.square;
    const long = SANS_ARENA_PRESETS.long;
    let from = square, to = square, progress = 0;
    if (elapsed >= 3.55 && elapsed < 4.42) {
      from = square; to = long; progress = smoothstep01((elapsed - 3.55) / .87);
    } else if (elapsed >= 4.42 && elapsed < 15.35) {
      from = long; to = long; progress = 1;
    } else if (elapsed >= 15.35 && elapsed < 15.58) {
      from = long; to = square; progress = smoothstep01((elapsed - 15.35) / .23);
    }
    activeSansArena = resolveArenaBox({
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      w: from.w + (to.w - from.w) * progress,
      h: from.h + (to.h - from.h) * progress
    });
  }

  function runSansBlockProgramV29(now) {
    const scriptIndex = attackPattern?.sansScriptIndex;
    if (!Number.isInteger(scriptIndex)) return false;
    const frame = Math.floor((now - stateAt) / SANS_BLOCK_FRAME_MS_V29);
    const elapsed = frame / SANS_BLOCK_FPS_V29;
    updateSansBlockContinuousV29(scriptIndex, elapsed);
    const program = SANS_BLOCK_PROGRAMS_V29[scriptIndex] || [];
    for (const block of program) {
      if (elapsed + 1e-7 < block.at) break;
      const eventKey = 'v29-' + scriptIndex + '-' + block.blockIndex;
      if (sansWaveEvents.has(eventKey)) continue;
      sansWaveEvents.add(eventKey);
      const bulletCount = bullets.length;
      const wasSlamming = heart.slamActive;
      executeSansBlockV29(block, now);
      if (bullets.length > bulletCount || (heart.slamActive && !wasSlamming)) lastThreatAt = now;
    }
    return true;
  }
`;

  function applyBlockEngine(source) {
    let result = String(source || '');
    result = injectBeforeFunction(result, 'runSansScriptedTurn', runtime,
      'const SANS_BLOCK_PROGRAMS_V29');
    result = replaceFunction(result, 'runSansScriptedTurn', [
      '  function runSansScriptedTurn(now) {',
      '    return runSansBlockProgramV29(now);',
      '  }'
    ].join('\n'));
    return result;
  }

  window.applySansBlockEngineV29 = applyBlockEngine;
  console.info('Sans block engine v29 ready:', VERSION);
})();
