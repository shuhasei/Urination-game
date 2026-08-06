from pathlib import Path
import re

path = Path('game.js')
text = path.read_text(encoding='utf-8')
changes = []


def replace_once(old, new, label):
    global text
    if new in text:
        return
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected 1 match, got {count}')
    text = text.replace(old, new, 1)
    changes.append(label)


def regex_once(pattern, replacement, label, flags=0):
    global text
    if isinstance(replacement, str) and replacement in text:
        return
    text2, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f'{label}: expected 1 match, got {count}')
    text = text2
    changes.append(label)


# Player name and route state.
replace_once(
    "  let state = 'title';\n",
    "  let state = 'title';\n"
    "  let playerName = localStorage.getItem('undertalePlayerName') || '';\n"
    "  let nameDraft = playerName;\n"
    "  let pacifistRoutePending = false;\n",
    'player name state'
)

# Keep the supplied glowing-eye appearance as the final-special pose reference.
replace_once(
    "  const sansEyeImage = new Image();\n",
    "  const sansEyeImage = new Image();\n"
    "  // Glowing-eye pose based on the supplied third reference image.\n"
    "  const providedSansEyeImage = sansEyeImage;\n",
    'provided eye reference'
)
replace_once(
    "    const baseImage = resting && sansSleepImage.complete\n"
    "      ? sansSleepImage\n"
    "      : animatedIdleReady ? sansIdleGifImage\n"
    "        : finalSpecial && sansEyeImage.complete ? sansEyeImage\n"
    "          : sansReferenceImage.complete && sansReferenceImage.naturalWidth\n"
    "            ? sansReferenceImage : aiGeneratedSansFallbackImage;",
    "    const baseImage = resting && sansSleepImage.complete\n"
    "      ? sansSleepImage\n"
    "      : finalSpecial && providedSansEyeImage.complete ? providedSansEyeImage\n"
    "        : animatedIdleReady ? sansIdleGifImage\n"
    "          : sansReferenceImage.complete && sansReferenceImage.naturalWidth\n"
    "            ? sansReferenceImage : aiGeneratedSansFallbackImage;",
    'prefer supplied eye pose'
)
replace_once(
    "      drawAnchoredSprite(baseImage, 40, 104, footX, footY, 1 - poseBlend, false, .5);",
    "      // Fit every base sprite by its actual aspect ratio so Sans never stretches sideways.\n"
    "      const baseScale = 40 / Math.max(1, baseImage.naturalWidth);\n"
    "      drawAnchoredSprite(baseImage, baseImage.naturalWidth / 2, baseImage.naturalHeight,\n"
    "        footX, footY, 1 - poseBlend, false, baseScale);",
    'aspect-correct Sans base pose'
)

# Compact soul only in the long final tunnel. Visual size and hitbox always agree.
compact_helpers = r'''
  function isCompactBattleSoul() {
    if (stage !== 10 || state !== 'enemyTurn' || !attackPattern?.finalSpecial) return false;
    const arena = battleArena();
    const elapsed = (performance.now() - stateAt) / 1000;
    return arena.right - arena.left > 200 && elapsed >= 4.25 && elapsed <= 15.65;
  }

  function battleSoulScale() {
    return isCompactBattleSoul() ? .72 : 1;
  }

  function battleSoulRadius() {
    return isCompactBattleSoul() ? 1.65 : 2.25;
  }

  function battleSoulPadding() {
    return isCompactBattleSoul() ? 3.25 : 5;
  }
'''
if 'function isCompactBattleSoul()' not in text:
    marker = "  function battleHeartShape(x, y, color) {"
    index = text.index(marker)
    text = text[:index] + compact_helpers + '\n' + text[index:]
    changes.append('compact final-tunnel soul')

regex_once(
    r"  function battleHeartShape\(x, y, color\) \{\n    heartShape\(x, y, color\);\n  \}",
    "  function battleHeartShape(x, y, color) {\n"
    "    const scale = battleSoulScale();\n"
    "    if (scale === 1) { heartShape(x, y, color); return; }\n"
    "    g.save();\n"
    "    g.translate(Math.round(x), Math.round(y));\n"
    "    g.scale(scale, scale);\n"
    "    heartShape(0, 0, color);\n"
    "    g.restore();\n"
    "  }",
    'scale compact soul drawing'
)

# Adaptive jump profile based on arena height, nearby bones and platform phases.
adaptive_jump = r'''
  function adaptiveBlueJumpProfile(arena) {
    const vertical = gravityDirection === GravityDirection.DOWN
      || gravityDirection === GravityDirection.UP;
    const span = (vertical ? arena.bottom - arena.top : arena.right - arena.left)
      - battleSoulPadding() * 2;
    const compact = isCompactBattleSoul();
    const platformPhase = Number.isInteger(attackPattern?.sansScriptIndex)
      && [4, 5, 6, 7, 8, 9].includes(attackPattern.sansScriptIndex);
    let clearance = span;

    if (vertical) {
      for (const bullet of bullets) {
        if (bullet.kind !== 'bone' || bullet.orientation === 'horizontal'
          || Math.abs(bullet.x - heart.x) > 20) continue;
        const extent = effectiveBoneExtent(bullet);
        const top = bullet.fromTop ? bullet.y : bullet.y - extent;
        const bottom = top + extent;
        if (gravityDirection === GravityDirection.DOWN && top > heart.y) {
          clearance = Math.min(clearance, top - heart.y - 4);
        } else if (gravityDirection === GravityDirection.UP && bottom < heart.y) {
          clearance = Math.min(clearance, heart.y - bottom - 4);
        }
      }
    }

    const maximumRise = compact ? 15 : platformPhase ? 29 : 23;
    const riseRatio = compact ? .42 : platformPhase ? .72 : .58;
    const rise = Math.max(9, Math.min(maximumRise, clearance - 2, span * riseRatio));
    const gravity = compact ? 455 : platformPhase ? 480 : 500;
    return {
      velocity: Math.max(compact ? 105 : 132,
        Math.min(platformPhase ? 190 : 178, Math.sqrt(2 * gravity * rise))),
      holdAccel: compact ? 120 : platformPhase ? 250 : 205,
      holdTime: compact ? .075 : platformPhase ? .135 : .105,
      gravity,
      release: compact ? .50 : .58
    };
  }
'''
if 'function adaptiveBlueJumpProfile' not in text:
    marker = '  function updateSoulPhysics(dt, arena, gravityEnabled) {'
    index = text.index(marker)
    text = text[:index] + adaptive_jump + '\n' + text[index:]
    changes.append('adaptive jump profile')

replace_once(
    "      const minX = arena.left + 5;\n"
    "      const maxX = arena.right - 5;\n"
    "      const minY = arena.top + 5;\n"
    "      const maxY = arena.bottom - 5;",
    "      const soulPadding = battleSoulPadding();\n"
    "      const minX = arena.left + soulPadding;\n"
    "      const maxX = arena.right - soulPadding;\n"
    "      const minY = arena.top + soulPadding;\n"
    "      const maxY = arena.bottom - soulPadding;",
    'dynamic inner soul bounds'
)
regex_once(
    r"      const gravitySpan = verticalGravity \? maxY - minY : maxX - minX;\n"
    r"      // Narrow corridors use a lower jump profile, preventing a held jump from\n"
    r"      // throwing the soul into the opposite wall while preserving full jumps\n"
    r"      // in the taller platform arenas\.\n"
    r"      const jumpScale = Math\.max\(\.64, Math\.min\(1, gravitySpan / 40\)\);\n"
    r"      if \(heart\.jumpBuffer > 0 && heart\.coyoteTime > 0 && !heart\.slamActive\) \{\n"
    r"        if \(verticalGravity\) heart\.vy = -gravity\.y \* BLUE_SOUL_JUMP_VELOCITY \* jumpScale;\n"
    r"        else heart\.vx = -gravity\.x \* BLUE_SOUL_JUMP_VELOCITY \* jumpScale;",
    "      const jumpProfile = adaptiveBlueJumpProfile(arena);\n"
    "      if (heart.jumpBuffer > 0 && heart.coyoteTime > 0 && !heart.slamActive) {\n"
    "        if (verticalGravity) heart.vy = -gravity.y * jumpProfile.velocity;\n"
    "        else heart.vx = -gravity.x * jumpProfile.velocity;",
    'adaptive jump launch'
)
regex_once(
    r"      if \(heart\.isJumping && jumpHeld && heart\.jumpHold < BLUE_SOUL_JUMP_HOLD_TIME\) \{\n"
    r"        heart\.jumpHold \+= dt;\n"
    r"        if \(verticalGravity\) heart\.vy -= gravity\.y \* BLUE_SOUL_JUMP_HOLD_ACCEL \* jumpScale \* dt;\n"
    r"        else heart\.vx -= gravity\.x \* BLUE_SOUL_JUMP_HOLD_ACCEL \* jumpScale \* dt;\n"
    r"      \}",
    "      if (heart.isJumping && jumpHeld && heart.jumpHold < jumpProfile.holdTime) {\n"
    "        heart.jumpHold += dt;\n"
    "        if (verticalGravity) heart.vy -= gravity.y * jumpProfile.holdAccel * dt;\n"
    "        else heart.vx -= gravity.x * jumpProfile.holdAccel * dt;\n"
    "      }",
    'adaptive jump hold'
)
replace_once(
    "          const correction = -towardGravity * (1 - BLUE_SOUL_RELEASE_MULTIPLIER);",
    "          const correction = -towardGravity * (1 - jumpProfile.release);",
    'adaptive early release'
)
replace_once(
    "      heart.vx += gravity.x * BLUE_SOUL_GRAVITY * dt;\n"
    "      heart.vy += gravity.y * BLUE_SOUL_GRAVITY * dt;",
    "      heart.vx += gravity.x * jumpProfile.gravity * dt;\n"
    "      heart.vy += gravity.y * jumpProfile.gravity * dt;",
    'adaptive gravity'
)
replace_once(
    "    const minX = arena.left + 5;\n"
    "    const maxX = arena.right - 5;\n"
    "    const minY = arena.top + 5;\n"
    "    const maxY = arena.bottom - 5;",
    "    const finalPadding = battleSoulPadding();\n"
    "    const minX = arena.left + finalPadding;\n"
    "    const maxX = arena.right - finalPadding;\n"
    "    const minY = arena.top + finalPadding;\n"
    "    const maxY = arena.bottom - finalPadding;",
    'dynamic final soul bounds'
)
replace_once(
    "        const beamHitRadius = stage === 10 ? 2.35 : 6;",
    "        const beamHitRadius = stage === 10 ? battleSoulRadius() : 6;",
    'beam hitbox follows soul'
)
replace_once(
    "        const heartRadius = stage === 10 ? 2.25 : 4;",
    "        const heartRadius = stage === 10 ? battleSoulRadius() : 4;",
    'bone hitbox follows soul'
)
replace_once(
    "            && Math.abs(bullet.y - heart.y) < (stage === 10 ? 2.35 : 5)",
    "            && Math.abs(bullet.y - heart.y) < (stage === 10 ? battleSoulRadius() : 5)",
    'horizontal bone thickness follows soul'
)
replace_once(
    "            && Math.abs(bullet.x - heart.x) < (stage === 10 ? 2.35 : 5)",
    "            && Math.abs(bullet.x - heart.x) < (stage === 10 ? battleSoulRadius() : 5)",
    'vertical bone thickness follows soul'
)

# Runtime safety net: no opposing bone pair may close below a heart-sized route.
safety_helpers = r'''
  function enforceMinimumSansPassage() {
    if (stage !== 10 || state !== 'enemyTurn') return;
    const requiredGap = battleSoulRadius() * 2 + (isCompactBattleSoul() ? 3.5 : 6);
    const columns = new Map();
    for (const bullet of bullets) {
      if (bullet.kind !== 'bone' || bullet.orientation === 'horizontal') continue;
      const key = Math.round(bullet.x / 3) * 3;
      const column = columns.get(key) || [];
      column.push(bullet);
      columns.set(key, column);
    }
    for (const column of columns.values()) {
      const top = column.find(bullet => bullet.fromTop);
      const bottom = column.find(bullet => !bullet.fromTop);
      if (!top || !bottom) continue;
      const gap = (bottom.y - effectiveBoneExtent(bottom))
        - (top.y + effectiveBoneExtent(top));
      if (gap >= requiredGap) continue;
      const trim = (requiredGap - gap) / 2 + .25;
      top.h = Math.max(2, top.h - trim);
      bottom.h = Math.max(2, bottom.h - trim);
    }
  }

  function keepSoulClearOfImpactWall(arena) {
    if (!heart.slamActive) return;
    const padding = battleSoulPadding();
    if (gravityDirection === GravityDirection.DOWN || gravityDirection === GravityDirection.UP) {
      heart.x = Math.max(arena.left + padding, Math.min(arena.right - padding, heart.x));
    } else {
      heart.y = Math.max(arena.top + padding, Math.min(arena.bottom - padding, heart.y));
    }
  }
'''
if 'function enforceMinimumSansPassage()' not in text:
    marker = '  function updateEnemyTurn(dt, now) {'
    index = text.index(marker)
    text = text[:index] + safety_helpers + '\n' + text[index:]
    changes.append('runtime passage and impact guards')
replace_once(
    "    if (scriptedSansTurn) runSansScriptedTurn(now);",
    "    if (scriptedSansTurn) runSansScriptedTurn(now);\n"
    "    enforceMinimumSansPassage();\n"
    "    keepSoulClearOfImpactWall(arena);",
    'run safety guards each frame'
)

# Sans gestures always oppose the forced direction, visually pushing away from the red edge.
replace_once(
    "  function slamSoul(direction, gestureDirection = direction, gestureDuration = 430) {",
    "  function oppositeGravityDirection(direction) {\n"
    "    if (direction === GravityDirection.DOWN) return GravityDirection.UP;\n"
    "    if (direction === GravityDirection.UP) return GravityDirection.DOWN;\n"
    "    if (direction === GravityDirection.LEFT) return GravityDirection.RIGHT;\n"
    "    return GravityDirection.LEFT;\n"
    "  }\n\n"
    "  function slamSoul(direction, gestureDirection = oppositeGravityDirection(direction), gestureDuration = 430) {",
    'gesture opposite forced direction'
)

# Name entry and LV1 non-combat route placeholder.
name_ui = r'''
  function sanitizePlayerName(value) {
    return Array.from(String(value || '').normalize('NFKC'))
      .filter(character => /[A-Za-z0-9ぁ-んァ-ヶ一-龠々ー]/.test(character))
      .slice(0, 8).join('');
  }

  function drawNameEntry() {
    rect(0, 0, W, H, '#000');
    text('なまえを きめてください', 160, 44, 10, '#fff', 'center');
    frameBox(85, 72, 150, 30, '#fff', 2);
    text(nameDraft || '＿', 160, 80, 12, '#fff', 'center');
    text('キーボードで入力　ENTER / Z で決定', 160, 118, 7, '#aaa', 'center');
    text('最大8文字　BACKSPACEで削除', 160, 133, 7, '#777', 'center');
  }

  function drawPacifistPass() {
    rect(0, 0, W, H, '#000');
    text((playerName || 'にんげん') + '　LV 1', 160, 42, 11, '#fff', 'center');
    text('サンズは みちを あけた。', 160, 72, 10, '#fff', 'center');
    text('つぎのボス戦へ すすみます。', 160, 92, 9, '#ffff00', 'center');
    text('（ボス戦は じゅんびちゅう）', 160, 116, 8, '#aaa', 'center');
    text('ENTER / Z', 160, 142, 8, '#fff', 'center');
  }
'''
if 'function drawNameEntry()' not in text:
    marker = '  function drawTitle(now) {'
    index = text.index(marker)
    text = text[:index] + name_ui + '\n' + text[index:]
    changes.append('name entry and LV1 route screens')
replace_once(
    "    text('すけ', sansLayout ? 53 : 74, y, 7);",
    "    text(playerName || 'すけ', sansLayout ? 53 : 74, y, 7);",
    'show player name in HUD'
)
replace_once(
    "    if (state === 'title') {\n"
    "      drawTitle(now);\n"
    "    } else if (state === 'opening') {",
    "    if (state === 'title') {\n"
    "      drawTitle(now);\n"
    "    } else if (state === 'nameEntry') {\n"
    "      drawNameEntry();\n"
    "    } else if (state === 'pacifistPass' || state === 'nextBossPending') {\n"
    "      drawPacifistPass();\n"
    "    } else if (state === 'opening') {",
    'draw new states'
)
replace_once(
    "    if (state === 'title') {\n"
    "      playerLevel = 1;",
    "    if (state === 'title') {\n"
    "      nameDraft = playerName;\n"
    "      setState('nameEntry');\n"
    "      hint.classList.remove('visible');\n"
    "      touch.classList.remove('show');\n"
    "      return;\n"
    "    }\n"
    "    if (state === 'nameEntry') {\n"
    "      nameDraft = sanitizePlayerName(nameDraft);\n"
    "      if (!nameDraft) { beep(120, .05); return; }\n"
    "      playerName = nameDraft;\n"
    "      localStorage.setItem('undertalePlayerName', playerName);\n"
    "      playerLevel = 1;",
    'name confirmation before game'
)
replace_once(
    "    if (stage === 10) {\n"
    "      setState('intro', [\n"
    "        '＊ 最後の審判役が 静かに道をふさいだ。',",
    "    if (stage === 10 && playerLevel === 1) {\n"
    "      pacifistRoutePending = true;\n"
    "      bullets = [];\n"
    "      soulMode = 'red';\n"
    "      setState('pacifistPass', [\n"
    "        '＊ サンズは LV 1を たしかめた。',\n"
    "        '＊ たたかわずに みちを あけた。'\n"
    "      ]);\n"
    "    } else if (stage === 10) {\n"
    "      pacifistRoutePending = false;\n"
    "      setState('intro', [\n"
    "        '＊ 最後の審判役が 静かに道をふさいだ。',",
    'skip Sans battle at LV1'
)
replace_once(
    "    if (state === 'intro') {",
    "    if (state === 'pacifistPass') {\n"
    "      setState('nextBossPending');\n"
    "      return;\n"
    "    }\n"
    "    if (state === 'nextBossPending') {\n"
    "      beep(520, .05);\n"
    "      return;\n"
    "    }\n"
    "    if (state === 'intro') {",
    'route placeholder confirmation'
)
regex_once(
    r"  window\.addEventListener\('keydown', event => \{\n"
    r"    if \(!keyDown\(event\.code\)\) event\.preventDefault\(\);\n"
    r"  \}\);",
    "  window.addEventListener('keydown', event => {\n"
    "    if (state === 'nameEntry') {\n"
    "      if (event.code === 'Backspace') {\n"
    "        nameDraft = Array.from(nameDraft).slice(0, -1).join('');\n"
    "        event.preventDefault();\n"
    "        return;\n"
    "      }\n"
    "      if (event.key && event.key.length === 1) {\n"
    "        nameDraft = sanitizePlayerName(nameDraft + event.key);\n"
    "        event.preventDefault();\n"
    "        return;\n"
    "      }\n"
    "    }\n"
    "    if (!keyDown(event.code)) event.preventDefault();\n"
    "  });",
    'name keyboard input'
)
replace_once(
    "    lastTrack = '';\n"
    "    startStage(1);",
    "    lastTrack = '';\n"
    "    pacifistRoutePending = false;\n"
    "    startStage(1);",
    'reset route state'
)

# Keep temporary no-damage test mode enabled for the user's final playthrough check.
text = text.replace('  const TEST_PLAY_INVINCIBLE = false;',
                    '  const TEST_PLAY_INVINCIBLE = true;')

for filename in ('game-loader.js', 'index.html'):
    target = Path(filename)
    if target.exists():
        target.write_text(
            re.sub(r'20260806-final\d+', '20260806-final6',
                   target.read_text(encoding='utf-8')),
            encoding='utf-8'
        )

path.write_text(text, encoding='utf-8')
print('Applied final review:')
for change in changes:
    print('-', change)
