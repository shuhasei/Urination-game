from pathlib import Path
import re

GAME = Path('game.js')
text = GAME.read_text(encoding='utf-8')
changes = []


def replace_once(pattern, replacement, label, flags=0, required=True):
    global text
    text2, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count == 1:
        text = text2
        changes.append(label)
        return
    if required:
        raise RuntimeError(f'{label}: expected one match, got {count}')


def replace_literal(old, new, label, required=True):
    global text
    count = text.count(old)
    if count == 1:
        text = text.replace(old, new, 1)
        changes.append(label)
        return
    if count == 0 and new in text:
        return
    if required:
        raise RuntimeError(f'{label}: expected one literal match, got {count}')


# Test-play mode: all attacks remain visible/movable, but no HP/KR damage is applied.
replace_literal(
    '  const TEST_PLAY_INVINCIBLE = false;',
    '  const TEST_PLAY_INVINCIBLE = true;',
    'enable no-damage test mode'
)

# More forgiving controls and a jump arc that reaches the recorded platform routes
# without overshooting the narrow corridors.
constant_updates = {
    '  const RED_SOUL_MOVE_SPEED = 145;': '  const RED_SOUL_MOVE_SPEED = 155;',
    '  const BLUE_SOUL_TANGENT_SPEED = 132;': '  const BLUE_SOUL_TANGENT_SPEED = 142;',
    '  const BLUE_SOUL_JUMP_VELOCITY = 150;': '  const BLUE_SOUL_JUMP_VELOCITY = 178;',
    '  const BLUE_SOUL_JUMP_HOLD_ACCEL = 220;': '  const BLUE_SOUL_JUMP_HOLD_ACCEL = 300;',
    '  const BLUE_SOUL_JUMP_HOLD_TIME = .11;': '  const BLUE_SOUL_JUMP_HOLD_TIME = .15;',
    '  const BLUE_SOUL_GRAVITY = 520;': '  const BLUE_SOUL_GRAVITY = 500;',
    '  const BLUE_SOUL_PRELIFT_SPEED = 76;': '  const BLUE_SOUL_PRELIFT_SPEED = 90;',
    '  const BLUE_SOUL_COYOTE_TIME = .09;': '  const BLUE_SOUL_COYOTE_TIME = .13;',
    '  const BLUE_SOUL_JUMP_BUFFER_TIME = .12;': '  const BLUE_SOUL_JUMP_BUFFER_TIME = .16;',
    '  const BLUE_SOUL_RELEASE_MULTIPLIER = .58;': '  const BLUE_SOUL_RELEASE_MULTIPLIER = .62;',
    '  const FINAL_BOX_SLIDE_SPEED = 6.8;': '  const FINAL_BOX_SLIDE_SPEED = 8.25;',
    "  const FINAL_FIGHT_HITBOX = Object.freeze({ x: 35, y: 152, w: 42, h: 17 });":
        "  const FINAL_FIGHT_HITBOX = Object.freeze({ x: 29, y: 151, w: 51, h: 19 });",
}
for old, new in constant_updates.items():
    replace_literal(old, new, f'update {old.strip().split("=")[0].strip()}')

# The opening begins with a red soul, then Sans raises his hand and forces blue gravity.
replace_literal(
    "    { arena: 'square', soul: 'blue', gravity: true },       // opening",
    "    { arena: 'square', soul: 'red', gravity: false },       // opening: hand raise, then blue slam",
    'match opening soul state'
)

# Video sprites switch almost immediately; a long crossfade made the hand-up pose look soft.
replace_literal(
    '    const inBlend = smoothstep01((t - poseStarted) / 78);',
    '    const inBlend = smoothstep01((t - poseStarted) / 18);',
    'speed up gesture entrance'
)
replace_literal(
    '    const outBlend = smoothstep01((poseEnds + 115 - t) / 115);',
    '    const outBlend = smoothstep01((poseEnds + 42 - t) / 42);',
    'speed up gesture exit'
)
replace_literal(
    '    const poseBlend = canGesture && t >= poseStarted && t <= poseEnds + 115',
    '    const poseBlend = canGesture && t >= poseStarted && t <= poseEnds + 42',
    'shorten gesture tail'
)

# Two narrow tunnel families could close to less than a comfortable keyboard route.
replace_literal(
    '    const spacing = options.spacing || 7;\n    const opening = options.opening || 14;\n    const center = (arena.top + arena.bottom) / 2;\n    const wave = amplitude * transform.scaleY;',
    '    const spacing = Math.max(10, options.spacing || 10);\n'
    '    const opening = Math.max(20, options.opening || 20);\n'
    '    const center = (arena.top + arena.bottom) / 2;\n'
    '    const maxWave = Math.max(0, (arena.bottom - arena.top - opening) / 2 - 3);\n'
    '    const wave = Math.min(amplitude * transform.scaleY, maxWave);',
    'widen recorded sine tunnel'
)
replace_literal(
    '    const spacing = options.spacing || 7;\n    const opening = options.opening || 14;\n    const slope = options.slope || 2.4;',
    '    const spacing = Math.max(10, options.spacing || 10);\n'
    '    const opening = Math.max(20, options.opening || 20);\n'
    '    const slope = Math.max(-2.25, Math.min(2.25, options.slope || 2.0));',
    'widen slanted tunnel'
)
replace_literal(
    '    const opening = Math.max(18, Math.min(height - 8, options.opening || 20));',
    '    const opening = Math.max(20, Math.min(height - 8, options.opening || 22));',
    'increase shared safe route'
)
replace_literal(
    '      if (Math.abs(position - tangent) < 11) continue;',
    '      if (Math.abs(position - tangent) < 13) continue;',
    'widen slam impact landing pocket'
)

# Match the supplied video opening: visible red soul, quick hand raise, blue slam,
# then the pointing pose as the soul returns to red.
opening_pattern = re.compile(
    r"        once\('s0-start', \.01, \(\) => \{\n"
    r"          setSansArena\('square', true\);\n"
    r"          setScriptSoul\('blue', GravityDirection\.DOWN, true\);\n"
    r"        \}\);\n"
    r"        // In the reference footage Sans raises his hand while forcing the\n"
    r"        // blue soul downward\. The pose therefore intentionally differs from\n"
    r"        // the gravity direction during this one opening slam\.\n"
    r"        once\('s0-slam', \.27, \(\) => slamSoul\(\n"
    r"          GravityDirection\.DOWN, GravityDirection\.UP, 520\n"
    r"        \)\);\n"
    r"        once\('s0-floor', \.77, \(\) => spawnFloorTeeth\(\{\n"
    r"          height: 11, spacing: 5, life: \.55, gapX: heart\.x, gapRadius: 7\n"
    r"        \}\)\);\n"
    r"        once\('s0-red', 1\.47, \(\) => \{\n"
    r"          clearSansThreats\(\);\n"
    r"          setScriptSoul\('red', GravityDirection\.DOWN, true\);\n"
    r"        \}\);\n"
    r"        once\('s0-point', 1\.97, \(\) => \{\n"
    r"          sansGestureDirection = GravityDirection\.RIGHT;\n"
    r"          sansGestureStartedAt = now;\n"
    r"          sansGestureUntil = now \+ 760;\n"
    r"        \}\);"
)
opening_replacement = """        once('s0-start', .01, () => {
          setSansArena('square', true);
          setScriptSoul('red', GravityDirection.DOWN, true);
          sansGestureDirection = GravityDirection.UP;
          sansGestureStartedAt = now;
          sansGestureUntil = now + 920;
        });
        // The hand appears first while the soul is still red.  A few frames
        // later the soul turns blue and is slammed down, matching the video.
        once('s0-slam', .36, () => {
          setScriptSoul('blue', GravityDirection.DOWN, false);
          slamSoul(GravityDirection.DOWN, GravityDirection.UP, 620);
        });
        once('s0-floor', .82, () => spawnFloorTeeth({
          height: 10, spacing: 6, life: .52, gapX: heart.x, gapRadius: 10
        }));
        once('s0-red', 1.40, () => {
          clearSansThreats();
          setScriptSoul('red', GravityDirection.DOWN, true);
        });
        once('s0-point', 1.46, () => {
          sansGestureDirection = GravityDirection.RIGHT;
          sansGestureStartedAt = now;
          sansGestureUntil = now + 820;
        });"""
text2, count = opening_pattern.subn(opening_replacement, text, count=1)
if count != 1:
    raise RuntimeError(f'match opening hand sequence: expected one match, got {count}')
text = text2
changes.append('match opening hand sequence')

# Make the final frame reproduce the video's diagonal push toward FIGHT.  The
# player first moves the red soul into the lower-left corner; the frame then
# glides down-left with the soul pinned to that corner.
final_box_pattern = re.compile(
    r"  function updateSansFinalBoxMove\(dt\) \{.*?\n  \}\n\n  function resolveAttack\(\) \{",
    re.S,
)
final_box_replacement = """  function updateSansFinalBoxMove(dt) {
    const leftHeld = keys.has('ArrowLeft');
    const downHeld = keys.has('ArrowDown');
    const padding = 5;
    sansFinalBox.fightReady = false;

    if (sansFinalBox.phase === 'position') {
      const bounds = moveHeartInsideFinalBox(dt);
      const inLowerLeft = heart.x <= bounds.minX + .2
        && heart.y >= bounds.maxY - .2;
      if (inLowerLeft && (leftHeld || downHeld)) {
        sansFinalBox.phase = 'slideToFight';
        beep(220, .035);
      }
      return;
    }

    if (sansFinalBox.phase === 'slideToFight') {
      const dx = FINAL_BOX_TARGET.x - sansFinalBox.x;
      const dy = FINAL_BOX_TARGET.y - sansFinalBox.y;
      const distance = Math.hypot(dx, dy);
      if (distance > .01) {
        const step = Math.min(distance, FINAL_BOX_SLIDE_SPEED * dt);
        sansFinalBox.x += dx / distance * step;
        sansFinalBox.y += dy / distance * step;
      }
      heart.x = sansFinalBox.x + padding;
      heart.y = sansFinalBox.y + sansFinalBox.h - padding;
      if (distance <= .08) {
        sansFinalBox.x = FINAL_BOX_TARGET.x;
        sansFinalBox.y = FINAL_BOX_TARGET.y;
        sansFinalBox.phase = 'docked';
        sansFinalBox.docked = true;
        menu = 0;
        beep(880, .06);
      }
      updateFinalFightReady();
      return;
    }

    moveHeartInsideFinalBox(dt);
    updateFinalFightReady();
  }

  function resolveAttack() {"""
text2, count = final_box_pattern.subn(final_box_replacement, text, count=1)
if count != 1:
    raise RuntimeError(f'update final box motion: expected one match, got {count}')
text = text2
changes.append('update final box motion')

# Hard no-damage guards for the temporary test build.
if 'function applySansDamage(now) {\n    if (TEST_PLAY_INVINCIBLE) return;' not in text:
    replace_literal(
        '  function applySansDamage(now) {\n',
        '  function applySansDamage(now) {\n    if (TEST_PLAY_INVINCIBLE) return;\n',
        'guard Sans damage'
    )
if 'function updateKarmaDrain(dt) {\n    if (TEST_PLAY_INVINCIBLE)' not in text:
    replace_literal(
        '  function updateKarmaDrain(dt) {\n',
        '  function updateKarmaDrain(dt) {\n'
        '    if (TEST_PLAY_INVINCIBLE) {\n'
        '      karmaHp = 0;\n'
        '      karmaDrainFrames = 0;\n'
        '      return;\n'
        '    }\n',
        'guard KR damage'
    )

GAME.write_text(text, encoding='utf-8')

# Cache-bust the Pages entry points so the pushed game is loaded immediately.
for filename in ('game-loader.js', 'index.html'):
    path = Path(filename)
    if path.exists():
        data = path.read_text(encoding='utf-8')
        data = data.replace('20260806-final4', '20260806-final5')
        path.write_text(data, encoding='utf-8')

print('Applied changes:')
for change in changes:
    print('-', change)
