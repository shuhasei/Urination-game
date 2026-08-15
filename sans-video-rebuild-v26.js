(() => {
  'use strict';

  const VERSION = '20260813-sans-video-rebuild-v26';

  function functionBounds(source, name) {
    const marker = 'function ' + name + '(';
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const brace = source.indexOf('{', at + marker.length);
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

  function patchGestureAndSoulSync(source) {
    const replacement = [
      '  function slamSoul(direction, gestureDirection = direction, gestureDuration = 430) {',
      "    // Sans' hand and the forced soul movement always point in the same",
      '    // direction. This keeps the visual cue readable in every wall slam.',
      '    bullets = bullets.filter(bullet => !bullet.impactBone);',
      "    soulMode = 'blue';",
      '    gravityDirection = direction;',
      '    const gravity = gravityVector(direction);',
      '    heart.vx = gravity.x * 720;',
      '    heart.vy = gravity.y * 720;',
      '    heart.isJumping = false;',
      '    heart.jumpHold = 0;',
      '    heart.jumpBuffer = 0;',
      '    heart.coyoteTime = 0;',
      '    heart.slamActive = true;',
      '    sansGestureDirection = direction;',
      '    sansGestureStartedAt = performance.now();',
      '    sansGestureUntil = sansGestureStartedAt + gestureDuration;',
      '  }'
    ].join('\n');
    return replaceFunction(source, 'slamSoul', replacement);
  }

  function patchOpeningLift(source) {
    let result = source;
    result = result.replace(
      "setScriptSoul('blue', GravityDirection.DOWN, false);\n          slamSoul(GravityDirection.DOWN, GravityDirection.UP, 620);",
      "setScriptSoul('blue', GravityDirection.UP, false);\n          slamSoul(GravityDirection.UP, GravityDirection.UP, 620);"
    );
    result = result.replace(
      "once('s0-floor', .82, () => spawnFloorTeeth({\n          height: 10, spacing: 6, life: .52, gapX: heart.x, gapRadius: 10\n        }));",
      "once('s0-floor', .82, () => spawnBoneEdgeSet({\n          top: true, depth: 10, spacing: 6, life: .52\n        }));"
    );
    return result;
  }

  function patchFairPlay(source) {
    return source
      .replace('TEST_PLAY_INVINCIBLE = true;', 'TEST_PLAY_INVINCIBLE = false;')
      .replace(
        'practiceGuardActive = TEST_PLAY_INVINCIBLE || practiceGuardTurns > 0;',
        'practiceGuardActive = practiceGuardTurns > 0;'
      );
  }

  function patchSequenceGuard(source) {
    // The reference battle has 23 deliberately different turns. Keep their
    // recorded order explicit so random fallback patterns cannot repeat one.
    return source.replace(
      /const SANS_ATTACK_SEQUENCE = Object\.freeze\(\[[^\]]*\]\);/,
      'const SANS_ATTACK_SEQUENCE = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);'
    );
  }

  window.applySansVideoRebuildV26 = source => {
    let result = String(source || '');
    result = patchGestureAndSoulSync(result);
    result = patchOpeningLift(result);
    result = patchFairPlay(result);
    result = patchSequenceGuard(result);
    return result;
  };

  console.info('Sans video rebuild v26 ready:', VERSION);
})();
