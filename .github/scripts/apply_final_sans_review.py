from pathlib import Path
import re

p=Path('game.js'); s=p.read_text(encoding='utf-8'); done=[]
def L(a,b,n,req=True):
 global s
 c=s.count(a)
 if c==1:s=s.replace(a,b,1);done.append(n)
 elif c==0 and b in s:return
 elif req:raise RuntimeError(f'{n}: {c}')
def R(a,b,n,flags=0):
 global s
 s2,c=re.subn(a,b,s,count=1,flags=flags)
 if c!=1:raise RuntimeError(f'{n}: {c}')
 s=s2;done.append(n)

L("  let state = 'title';\n","  let state = 'title';\n  let playerName = localStorage.getItem('undertalePlayerName') || '';\n  let nameDraft = playerName;\n  let pacifistRoutePending = false;\n",'name state')
L("  const sansEyeImage = new Image();\n","  const sansEyeImage = new Image();\n  // Supplied third image is used as the reference for this glowing-eye pose.\n  const providedSansEyeImage = sansEyeImage;\n",'eye reference')
L("    const baseImage = resting && sansSleepImage.complete\n      ? sansSleepImage\n      : animatedIdleReady ? sansIdleGifImage\n        : finalSpecial && sansEyeImage.complete ? sansEyeImage\n          : sansReferenceImage.complete && sansReferenceImage.naturalWidth\n            ? sansReferenceImage : aiGeneratedSansFallbackImage;","    const baseImage = resting && sansSleepImage.complete\n      ? sansSleepImage\n      : finalSpecial && providedSansEyeImage.complete ? providedSansEyeImage\n        : animatedIdleReady ? sansIdleGifImage\n          : sansReferenceImage.complete && sansReferenceImage.naturalWidth\n            ? sansReferenceImage : aiGeneratedSansFallbackImage;",'eye pose')
L("      drawAnchoredSprite(baseImage, 40, 104, footX, footY, 1 - poseBlend, false, .5);","      const baseScale = 40 / Math.max(1, baseImage.naturalWidth);\n      drawAnchoredSprite(baseImage, baseImage.naturalWidth / 2, baseImage.naturalHeight,\n        footX, footY, 1 - poseBlend, false, baseScale);",'aspect-safe Sans')

helpers=r'''
  function isCompactBattleSoul() {
    if (stage !== 10 || state !== 'enemyTurn' || !attackPattern?.finalSpecial) return false;
    const a = battleArena();
    const t = (performance.now() - stateAt) / 1000;
    return a.right - a.left > 200 && t >= 4.25 && t <= 15.65;
  }
  function battleSoulScale() { return isCompactBattleSoul() ? .72 : 1; }
  function battleSoulRadius() { return isCompactBattleSoul() ? 1.65 : 2.25; }
  function battleSoulPadding() { return isCompactBattleSoul() ? 3.25 : 5; }
'''
if 'function isCompactBattleSoul()' not in s:
 i=s.index('  function battleHeartShape(x, y, color) {');s=s[:i]+helpers+'\n'+s[i:];done.append('compact soul')
R(r"  function battleHeartShape\(x, y, color\) \{\n    heartShape\(x, y, color\);\n  \}","  function battleHeartShape(x, y, color) {\n    const z = battleSoulScale();\n    if (z === 1) return heartShape(x, y, color);\n    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(z, z);\n    heartShape(0, 0, color); g.restore();\n  }",'compact soul draw')

jump=r'''
  function adaptiveBlueJumpProfile(arena) {
    const vertical = gravityDirection === GravityDirection.DOWN || gravityDirection === GravityDirection.UP;
    const span = (vertical ? arena.bottom-arena.top : arena.right-arena.left) - battleSoulPadding()*2;
    const compact = isCompactBattleSoul();
    const platform = Number.isInteger(attackPattern?.sansScriptIndex) && [4,5,6,7,8,9].includes(attackPattern.sansScriptIndex);
    let clearance = span;
    if (vertical) for (const b of bullets) {
      if (b.kind !== 'bone' || b.orientation === 'horizontal' || Math.abs(b.x-heart.x)>20) continue;
      const e=effectiveBoneExtent(b), top=b.fromTop?b.y:b.y-e, bottom=top+e;
      if (gravityDirection===GravityDirection.DOWN && top>heart.y) clearance=Math.min(clearance,top-heart.y-4);
      if (gravityDirection===GravityDirection.UP && bottom<heart.y) clearance=Math.min(clearance,heart.y-bottom-4);
    }
    const rise=Math.max(9,Math.min(compact?15:platform?29:23,clearance-2,span*(compact?.42:platform?.72:.58)));
    const gravity=compact?455:platform?480:500;
    return {velocity:Math.max(compact?105:132,Math.min(platform?190:178,Math.sqrt(2*gravity*rise))),
      holdAccel:compact?120:platform?250:205,holdTime:compact?.075:platform?.135:.105,
      gravity,release:compact?.50:.58};
  }
'''
if 'function adaptiveBlueJumpProfile' not in s:
 i=s.index('  function updateSoulPhysics(dt, arena, gravityEnabled) {');s=s[:i]+jump+'\n'+s[i:];done.append('adaptive jump')
L("      const minX = arena.left + 5;\n      const maxX = arena.right - 5;\n      const minY = arena.top + 5;\n      const maxY = arena.bottom - 5;","      const soulPadding = battleSoulPadding();\n      const minX = arena.left + soulPadding;\n      const maxX = arena.right - soulPadding;\n      const minY = arena.top + soulPadding;\n      const maxY = arena.bottom - soulPadding;",'dynamic inner bounds')
R(r"      const gravitySpan = verticalGravity \? maxY - minY : maxX - minX;.*?      if \(heart.jumpBuffer > 0 && heart.coyoteTime > 0 && !heart.slamActive\) \{\n        if \(verticalGravity\) heart.vy = -gravity.y \* BLUE_SOUL_JUMP_VELOCITY \* jumpScale;\n        else heart.vx = -gravity.x \* BLUE_SOUL_JUMP_VELOCITY \* jumpScale;","      const jumpProfile = adaptiveBlueJumpProfile(arena);\n      if (heart.jumpBuffer > 0 && heart.coyoteTime > 0 && !heart.slamActive) {\n        if (verticalGravity) heart.vy = -gravity.y * jumpProfile.velocity;\n        else heart.vx = -gravity.x * jumpProfile.velocity;",'adaptive launch',re.S)
R(r"      if \(heart.isJumping && jumpHeld && heart.jumpHold < BLUE_SOUL_JUMP_HOLD_TIME\) \{.*?\n      \}","      if (heart.isJumping && jumpHeld && heart.jumpHold < jumpProfile.holdTime) {\n        heart.jumpHold += dt;\n        if (verticalGravity) heart.vy -= gravity.y * jumpProfile.holdAccel * dt;\n        else heart.vx -= gravity.x * jumpProfile.holdAccel * dt;\n      }",'adaptive hold',re.S)
L("          const correction = -towardGravity * (1 - BLUE_SOUL_RELEASE_MULTIPLIER);","          const correction = -towardGravity * (1 - jumpProfile.release);",'adaptive release')
L("      heart.vx += gravity.x * BLUE_SOUL_GRAVITY * dt;\n      heart.vy += gravity.y * BLUE_SOUL_GRAVITY * dt;","      heart.vx += gravity.x * jumpProfile.gravity * dt;\n      heart.vy += gravity.y * jumpProfile.gravity * dt;",'adaptive gravity')
L("    const minX = arena.left + 5;\n    const maxX = arena.right - 5;\n    const minY = arena.top + 5;\n    const maxY = arena.bottom - 5;","    const finalPadding = battleSoulPadding();\n    const minX = arena.left + finalPadding;\n    const maxX = arena.right - finalPadding;\n    const minY = arena.top + finalPadding;\n    const maxY = arena.bottom - finalPadding;",'dynamic outer bounds')
L("        const beamHitRadius = stage === 10 ? 2.35 : 6;","        const beamHitRadius = stage === 10 ? battleSoulRadius() : 6;",'beam radius')
L("        const heartRadius = stage === 10 ? 2.25 : 4;","        const heartRadius = stage === 10 ? battleSoulRadius() : 4;",'bone radius')
L("(stage === 10 ? 2.35 : 5)","(stage === 10 ? battleSoulRadius() : 5)",'bone thickness 1')
L("(stage === 10 ? 2.35 : 5)","(stage === 10 ? battleSoulRadius() : 5)",'bone thickness 2')

safe=r'''
  function enforceMinimumSansPassage() {
    if (stage !== 10 || state !== 'enemyTurn') return;
    const need=battleSoulRadius()*2+(isCompactBattleSoul()?3.5:6), cols=new Map();
    for (const b of bullets) if (b.kind==='bone' && b.orientation!=='horizontal') {
      const k=Math.round(b.x/3)*3,a=cols.get(k)||[];a.push(b);cols.set(k,a);
    }
    for (const a of cols.values()) {
      const t=a.find(b=>b.fromTop),d=a.find(b=>!b.fromTop); if(!t||!d)continue;
      const gap=(d.y-effectiveBoneExtent(d))-(t.y+effectiveBoneExtent(t)); if(gap>=need)continue;
      const cut=(need-gap)/2+.25;t.h=Math.max(2,t.h-cut);d.h=Math.max(2,d.h-cut);
    }
  }
'''
if 'function enforceMinimumSansPassage()' not in s:
 i=s.index('  function updateEnemyTurn(dt, now) {');s=s[:i]+safe+'\n'+s[i:];done.append('passage guard')
L("    if (scriptedSansTurn) runSansScriptedTurn(now);","    if (scriptedSansTurn) runSansScriptedTurn(now);\n    enforceMinimumSansPassage();",'run passage guard')
L("  function slamSoul(direction, gestureDirection = direction, gestureDuration = 430) {","  function oppositeGravityDirection(d) {\n    if (d===GravityDirection.DOWN) return GravityDirection.UP;\n    if (d===GravityDirection.UP) return GravityDirection.DOWN;\n    if (d===GravityDirection.LEFT) return GravityDirection.RIGHT;\n    return GravityDirection.LEFT;\n  }\n\n  function slamSoul(direction, gestureDirection = oppositeGravityDirection(direction), gestureDuration = 430) {",'gesture away from edge')

ui=r'''
  function sanitizePlayerName(v) { return Array.from(String(v||'').normalize('NFKC')).filter(c=>/[A-Za-z0-9ぁ-んァ-ヶ一-龠々ー]/.test(c)).slice(0,8).join(''); }
  function drawNameEntry(now) {
    rect(0,0,W,H,'#000');text('なまえを きめてください',160,44,10,'#fff','center');
    frameBox(85,72,150,30,'#fff',2);text(nameDraft||'＿',160,80,12,'#fff','center');
    text('キーボードで入力　ENTER / Z で決定',160,118,7,'#aaa','center');
    text('最大8文字　BACKSPACEで削除',160,133,7,'#777','center');
  }
  function drawPacifistPass() {
    rect(0,0,W,H,'#000');text((playerName||'にんげん')+'　LV 1',160,42,11,'#fff','center');
    text('サンズは みちを あけた。',160,72,10,'#fff','center');
    text('つぎのボス戦へ すすみます。',160,92,9,'#ffff00','center');
    text('（ボス戦は じゅんびちゅう）',160,116,8,'#aaa','center');text('ENTER / Z',160,142,8,'#fff','center');
  }
'''
if 'function drawNameEntry' not in s:
 i=s.index('  function drawTitle(now) {');s=s[:i]+ui+'\n'+s[i:];done.append('name UI')
L("    text('すけ', sansLayout ? 53 : 74, y, 7);","    text(playerName || 'すけ', sansLayout ? 53 : 74, y, 7);",'HUD name')
L("    if (state === 'title') {\n      drawTitle(now);\n    } else if (state === 'opening') {","    if (state === 'title') {\n      drawTitle(now);\n    } else if (state === 'nameEntry') {\n      drawNameEntry(now);\n    } else if (state === 'pacifistPass' || state === 'nextBossPending') {\n      drawPacifistPass();\n    } else if (state === 'opening') {",'draw states')
L("    if (state === 'title') {\n      playerLevel = 1;","    if (state === 'title') {\n      nameDraft = playerName; setState('nameEntry'); hint.classList.remove('visible'); touch.classList.remove('show'); return;\n    }\n    if (state === 'nameEntry') {\n      nameDraft=sanitizePlayerName(nameDraft); if(!nameDraft){beep(120,.05);return;}\n      playerName=nameDraft;localStorage.setItem('undertalePlayerName',playerName);\n      playerLevel = 1;",'name confirm')
L("    if (stage === 10) {\n      setState('intro', [\n        '＊ 最後の審判役が 静かに道をふさいだ。',","    if (stage === 10 && playerLevel === 1) {\n      pacifistRoutePending=true; bullets=[]; soulMode='red';\n      setState('pacifistPass',['＊ サンズは LV 1を たしかめた。','＊ たたかわずに みちを あけた。']);\n    } else if (stage === 10) {\n      pacifistRoutePending=false;\n      setState('intro', [\n        '＊ 最後の審判役が 静かに道をふさいだ。',",'LV1 pass')
L("    if (state === 'intro') {","    if (state === 'pacifistPass') { setState('nextBossPending'); return; }\n    if (state === 'nextBossPending') { setState('opening'); pendingStage=10; return; }\n    if (state === 'intro') {",'route confirm')
R(r"  window\.addEventListener\('keydown', event => \{\n    if \(!keyDown\(event\.code\)\) event\.preventDefault\(\);\n  \}\);","  window.addEventListener('keydown', event => {\n    if (state === 'nameEntry') {\n      if (event.code === 'Backspace') { nameDraft=Array.from(nameDraft).slice(0,-1).join(''); event.preventDefault(); return; }\n      if (event.key && event.key.length === 1) { nameDraft=sanitizePlayerName(nameDraft+event.key); event.preventDefault(); return; }\n    }\n    if (!keyDown(event.code)) event.preventDefault();\n  });",'name keyboard')
L("    lastTrack = '';\n    startStage(1);","    lastTrack = '';\n    pacifistRoutePending = false;\n    startStage(1);",'route reset')
for f in ('game-loader.js','index.html'):
 q=Path(f)
 if q.exists():q.write_text(re.sub(r'20260806-final\d+','20260806-final6',q.read_text(encoding='utf-8')),encoding='utf-8')
p.write_text(s,encoding='utf-8');print('\n'.join(done))
