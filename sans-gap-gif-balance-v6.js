(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const parenAt = source.indexOf('(', markerAt + marker.length);
    if (parenAt < 0) return null;
    let quote = null;
    let escape = false;
    let parenDepth = 0;
    let closeParen = -1;
    for (let i = parenAt; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '(') parenDepth++;
      else if (ch === ')') {
        parenDepth--;
        if (parenDepth === 0) { closeParen = i; break; }
      }
    }
    if (closeParen < 0) return null;
    const brace = source.indexOf('{', closeParen + 1);
    if (brace < 0) return null;
    let depth = 0;
    quote = null;
    escape = false;
    for (let i = brace; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return { start, brace, end: i + 1 };
      }
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function patchFunctionBody(source, name, transform) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    const next = transform(body);
    if (next === body) return source;
    return source.slice(0, bounds.start) + next + source.slice(bounds.end);
  }

  function patchSansAnimation(source) {
    return patchFunctionBody(source, 'drawSans', body => {
      let next = body;
      next = next.replace(
        '    const idleBob = Math.round(Math.sin(t / 420));',
        '    const idleBob = stage === 10 ? 0 : Math.round(Math.sin(t / 420));'
      );
      // The hardening layer already uses __userSansGifPreloaded as its first
      // animated base sprite. The loader now points that variable at the clean
      // user-supplied multi-frame GIF instead of the old fallback GIF.
      return next;
    });
  }

  function restoreTighterRecordedOpenings(source) {
    let s = source;
    // user-battle-sync-v2 deliberately inflated all recorded openings.  That
    // made several turns passable without moving. Bring them back near the
    // supplied reference values; the runtime passage guard below remains the
    // final safety net if a particular frame becomes genuinely too narrow.
    const map = new Map([
      [27, 16], [28, 17], [29, 18], [30, 20], [31, 21],
      [32, 23], [33, 25], [34, 27], [35, 29]
    ]);
    for (const [from, to] of map) {
      s = s.split('opening: ' + from + ',').join('opening: ' + to + ',');
    }
    s = s.split('const opening = Math.max(34, options.opening || 34);')
      .join('const opening = Math.max(22, options.opening || 22);');
    s = s.split('const heightT = 94 - heightB;')
      .join('const heightT = 103 - heightB;');
    s = s.split('const safeSize = Math.max(23, gapSize);')
      .join('const safeSize = Math.max(15, gapSize);');
    s = s.split('const opening = Math.max(20, Math.min(height - 8, options.opening || 22));')
      .join('const opening = Math.max(15, Math.min(height - 8, options.opening || 18));');
    return s;
  }

  function patchMinimumPassage(source) {
    let s = replaceFunction(source, 'enforceMinimumSansPassage', `  function enforceMinimumSansPassage(dt = 0) {
    if (stage !== 10 || state !== 'enemyTurn') return;

    const radius = Math.max(1.8, battleSoulRadius() - .55);
    // Only guarantee a little more than the visible heart diameter.  This is
    // intentionally much tighter than the previous 4-9px accessibility pad.
    const requiredGap = radius * 2 + (isCompactBattleSoul() ? 1.3 : 2.0);
    const transitionOverlap = radius * 2 + .65;
    const predictX = bullet => bullet.x + bullet.vx * dt;
    const predictY = bullet => bullet.y + bullet.vy * dt;

    const trimVerticalPair = (top, bottom, extraGap = 0) => {
      const topEnd = predictY(top) + effectiveBoneExtent(top);
      const bottomStart = predictY(bottom) - effectiveBoneExtent(bottom);
      const target = requiredGap + extraGap;
      const gap = bottomStart - topEnd;
      if (gap >= target) return;
      const need = target - gap + .12;
      const topTrim = Math.min(Math.max(0, top.h - 2), need / 2);
      const bottomTrim = Math.min(Math.max(0, bottom.h - 2), need - topTrim);
      top.h = Math.max(2, top.h - topTrim);
      bottom.h = Math.max(2, bottom.h - bottomTrim);
    };

    const trimHorizontalPair = (left, right) => {
      const leftExtent = effectiveBoneExtent(left);
      const rightExtent = effectiveBoneExtent(right);
      const leftStart = left.fromStart ? predictX(left) : predictX(left) - leftExtent;
      const rightStart = right.fromStart ? predictX(right) : predictX(right) - rightExtent;
      const leftEnd = leftStart + leftExtent;
      const rightEnd = rightStart + rightExtent;
      const a = leftStart <= rightStart
        ? { bullet: left, end: leftEnd }
        : { bullet: right, end: rightEnd };
      const b = leftStart <= rightStart
        ? { bullet: right, start: rightStart }
        : { bullet: left, start: leftStart };
      const gap = b.start - a.end;
      if (gap >= requiredGap) return;
      const need = requiredGap - gap + .12;
      const aExtent = effectiveBoneExtent(a.bullet);
      const bExtent = effectiveBoneExtent(b.bullet);
      const aTrim = Math.min(Math.max(0, aExtent - 2), need / 2);
      const bTrim = Math.min(Math.max(0, bExtent - 2), need - aTrim);
      a.bullet.length = Math.max(2, aExtent - aTrim);
      b.bullet.length = Math.max(2, bExtent - bTrim);
    };

    const tops = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && b.fromTop);
    const bottoms = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && !b.fromTop);
    const gates = [];

    for (const top of tops) {
      let best = null;
      let bestDistance = Infinity;
      for (const bottom of bottoms) {
        const distance = Math.abs(predictX(top) - predictX(bottom));
        if (distance <= 5.5 && distance < bestDistance) {
          best = bottom;
          bestDistance = distance;
        }
      }
      if (!best) continue;
      trimVerticalPair(top, best);
      gates.push({
        x: (predictX(top) + predictX(best)) / 2,
        top,
        bottom: best,
        low: predictY(top) + effectiveBoneExtent(top),
        high: predictY(best) - effectiveBoneExtent(best),
        vx: (top.vx + best.vx) / 2
      });
    }

    // Only intervene between very close consecutive gates.  Do not enlarge a
    // whole wave merely because two distant openings do not overlap.
    gates.sort((a, b) => a.x - b.x);
    for (let i = 1; i < gates.length; i++) {
      const a = gates[i - 1];
      const b = gates[i];
      const dx = Math.abs(b.x - a.x);
      if (dx > 19 || Math.abs(a.vx - b.vx) > 35) continue;
      const overlap = Math.min(a.high, b.high) - Math.max(a.low, b.low);
      if (overlap >= transitionOverlap) continue;
      const extra = Math.min(4.5, transitionOverlap - overlap);
      trimVerticalPair(a.top, a.bottom, extra / 2);
      trimVerticalPair(b.top, b.bottom, extra / 2);
    }

    const horizontal = bullets.filter(b => b.kind === 'bone'
      && b.orientation === 'horizontal');
    for (let i = 0; i < horizontal.length; i++) {
      for (let j = i + 1; j < horizontal.length; j++) {
        if (Math.abs(predictY(horizontal[i]) - predictY(horizontal[j])) > 5.5) continue;
        trimHorizontalPair(horizontal[i], horizontal[j]);
      }
    }
  }`);

    s = s.replace('    enforceMinimumSansPassage();', '    enforceMinimumSansPassage(dt);');
    return s;
  }

  function applySansGapGifBalanceV6(source) {
    let s = String(source || '');
    s = restoreTighterRecordedOpenings(s);
    s = patchSansAnimation(s);
    s = patchMinimumPassage(s);
    return s;
  }

  window.applySansGapGifBalanceV6 = applySansGapGifBalanceV6;
})();