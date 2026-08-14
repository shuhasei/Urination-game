(() => {
  'use strict';

  const VERSION = '20260814-sans-hq-items-fairness-v34';

  function image(data) {
    const result = new Image();
    result.decoding = 'async';
    result.src = data;
    return result;
  }

  window.__SANS_HQ_ASSETS_V34 = Object.freeze({
    sans: image('data:image/png;base64,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'),
    portrait: image('data:image/png;base64,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'),
    panel: image('data:image/png;base64,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'),
    items: Object.freeze([
      image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGaSURBVDhP7c49aFNhFMbxc9680RtTAzoYFAQHUYmDIKhLMTpIRChUQYkIrlbbppN1UJwEKXQoggouYiqITlYa20URsjkJamg+REUahyq0hTa9975/EVoEe5FCRyG/6cB5zsMRafv/XDgsqfwRSYuIRnfrpdvT24KJbsvkeUNQtNSuK0bFNypBNLymTGbv2ebnigunS8x/fMj3sT46Eh4ntgjNG8qbi8rOpHI6Y5w1shi9j2Jp7hM4x9LocVrNt8x9eOqcc3RYQ2tQeHFMGDkkPMgq/rMkqhJGS5Z17k/ly2fEudkqLgx++S2f4Ntr5uuTbNoY59WpGOHtGP5Ly3hOmb6zFW+DXYj2/NEK7sYIriluWGFI4LlSOecxcVKo9wv1glK9YpjqVb7e303nDuP+LrBWfi4PnmcD9y7B7GOl3KXUepUvA0Klx9AoCNV+pVaIMXVZKXUrM6P7uHlQVpWtkkxIOHNVaBSURt/KJ+8vCfeOCv7YAeq3NvMkJ4iIH739Jy8u4aOc8KO4h55sitwuE8atlKK5trYVvwGSr8tirwV55QAAAABJRU5ErkJggg=='),
      image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHBSURBVDhP7dI/aFNBHAfw7+/u5eVFLE1KXEQECwpWUMQWwaWLogVXiyBVKlURjKAUl2BdWjooDm7tqAVd6mJtF0ERJ2kGBekggpVQNf5LxLb33v2+IAkipNbBRRT6gbvhDr7cfe+Af4CsXFjzl8zOnm51y6/Vfyww2yJ3V+6vTlxjBrDYf2RD0t+7kef62pksjtF/OEr/7hC1epnu2xghSHLB74OtMb5cLhNXABNaKCsnyWqBWjlG1oqqXy6Rnwvqq6foa8P8FIBTEPoOkFkhgPr4yYi46ekpwqRF1T1jZTzN7QZcsmA3hA8Ph7y9x/ABhHMwFIAviimmA/CWiAqgq/7JjqzVgVcRc53COH5L/2YXl57v5s3jhvd6QHdnHbU2SK3d4NeZPM+K6FD9pKkUS2Lqoc1O7I00LhV4NQg1du/pK2eoSYnzI4aP+4QvhywXRkMuP+ki46c8byzvA5wQocuBPrSaAeKm0EwkuqkI6jXD/A5w60SK17dkON7dzvn1EXsDcPNBcOdMmvuN4SMRjogoRDwAl7Q2rt8sCg3dZJ4W8G0tdu5HP3Kxp+3AtpzxfjLihX2Nx/i1tzV/6j/v8Ds7KeONnM3QegAAAABJRU5ErkJggg=='),
      image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIzSURBVDhP7ZJBSJNhGMff793mnBOhsotBdQw7WWoQmlR0iaCoTUaHMg9h0sVAdkjqFpF0sEOXqE5aHSpkRQdldrBMLRBKFnVJt2/ZUDDb3L7vfX9fMct002uHwB88l/d9+D//5/++QmzwLzBWVcH5VSFkU5Nwuw2h5u/u1P0nDW0IsVR/u/JNpYbMzNcKtG0Ref6CvfV1hEIhpJQfSjyGpe0F1NQVHp0SZO5soX33koC9Z5t7X8HIPKQX0FpxoLGRzs5OwuEwfX29CCE+5115PK45PfcQe+IcZ2tK7HWcFxJoDhIMNnOrp4fx0Tdc7uoifLGF00fr6Tjioq3tPLkvt2neIThTW5Z3livWWMbr9VrC5/PRfqGdg+WCsUsCrRRaabKZDLO9ErO7nAfHhGYywPeBKpoqJErr/AYFSCnVjevdiE2lnqSvzMd4hxetNfa3FNaCjZXJcLhKcnykgrp7gpsnBNf2CypKvJT5/apY0MrlgJVBOvIsQiwWw7IscBxsy8JxHBSQzeYYGx0hEAgSjUb5uV6Ohki3tLb+FtzuL72vukOoQ3WO0pBMmpimSdI0ScQTvBwa4nX1LmdCStzCWPkiq1hczOlXw8MrUcymUugaP7rahXa70C6Jli6UlHwUBu+lwbu3Y2uyWyad/sHTx08K7tWfB3FSMzN8TSZJxONMT00RHRgg0t9P5ebKNdmtQn6KTa4dKA2DXDZLPD6NaSYYHBzE4/HohoaGrcW9G/wn/AJGzlSeIQxwEQAAAABJRU5ErkJggg=='),
      image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAH7SURBVDhP7ZDNS1RhFIfP+965M3fG0iEXMUTBxEwhFLUpgyFwI+EmaKFG9rGx2pVCZEUhWiYFEQlCaIsiahFqq4iJqHaBQTQzmbiohaNBmTaKqdf7PhXXTTn+BZEPHM7mnOf8OCKr/L8siohZcBdMJvMOz/NIp9Omurq6pHhwBblcjrHRPK1trebE8UazscxmdyxE/qTC/fSYZ/ss9sRswpESzp67gH+oPBrdXxqNNhS7lhgfy2NZmvx5xfzILWavWLi9ST43Cd/PKL61hMnWWryp0/TvFUQ03d3dfJ34wuhY3hT7JBgOsm2DhZl6jvtQY+77FYB7Nl6vxfwNzXSLYvCgZrRzLUER7GPC0NAQPXd6SWxN+Kn/ELaDVISEl4sxnC5F5KrwqBDBqhekSoh1CdsHhMa3mruzNjtKFRFRWIEAk1MTpFKpnmVCJ+ywyRYe1O+kpizEyMUKzI+nmMEQpC14Jbw/oKgMCzVrhHWW4AQDTE1Oculy+/J0PvUNR8i3aczHdnhShRIhGZKlbm5rNpdodpULw00hKtcrCoUCwx+G6bx+jY6OjpU/zGWzHDp8lFPNzTiOw08P4vE4/bUWL+oCaK2Znpkhk8kAxk/kKVGLWimv2PU3yh/0Kx6P30wkEqeTW5Kv5+bmyOWy9PUN4LquL/tVvLjKP8Bv4csUoUCEMUsAAAAASUVORK5CYII='),
      image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHaSURBVDhP7ZIxaFNRFIbPfffmvUakiK2UYIM4aaE4ONXFUHBxcRHExSWg6GYEF8fiIioFt4IVFFFwEUR0q9RBUYcileIgQUpMmpe0iW2TvNxz/ofchBYaydRBRH84cM+5nI/zHw7RvyTVW/i7pPyEaRNRlDBeazd2IkEdIqtgqUKkCuawEyKb8I1nexv66sjh9AzuTMPaGqLzPuS2Qbv5HcP7BmGtg//A2scHGAgSfaGpo/6H7WQg8EWkBOESjDa4cvEcksaAuQCWItzk5Xf3oY3uBxQzRug+dRDRyUWhyxHomYBy66CRa+6zE8rz4V1vgC61QKSqvaShof2itQYp1QWuf3spzCVU5qeRMFqUSYIyc64ZlLOgszXQ2AwunDqOIPClF5jNZjG8R8HKBqjx8wsLN8FSAXMFqb0BDiiCsx9jBYOzFm1bx/jNNUyeOIbi/D03xQ7o6OhB9o3G1xseaCN8C5EyhCtgCWOPCI3NEMJlxHELdHoZNLkEGn8BOrOE/KuprVXsUPpQWkZSqW69WXgDsctgKYF5xYE7QOEiCnO33Bqw+PQq8q+nUP38+DfLW9Ja17eTTCZjnJU4/xyrnx6ivvAEtYVHCN/fFaVIchMTyd0c+H/9Qf0C0ekreRFFPx4AAAAASUVORK5CYII='),
      image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAI4SURBVDhP7ZLbS1RRGMW/fS5zO2Pm5EAyNjPqQE00SiPiBTEoNVFJKclUEklimDLpohHocxoUSYUJ4ZPQSxRCpC+R9NCLVBCBEEhChS9RgkGQzg/iHELo9gcIrte9v99a39pbZEubUkqUfFdK1pTIjz8P/1a+eJXuXKSh4XBGKcVSupIH5T4+3rnEyG6NuwmT8aSHZq8wUmQiSmUco3+p/bHBrWU3OZWCyzQ4ExCSls7VeAC/iAMpMBSjYZ35dA0nsxXvLjagidDY3JDxe73XfyfGBCWKUJ+w0FvG6F6ThaEubhZ7OKgLk/tNmnQhKEKLIZzfIZlXx4LomtA6q7A30zS1vsGLjwlGo4bLozFdH6XWFKbKLc7lmyxeaaLCEKYSGqmg4k1fLV8f3abNI+SmhLNvxQG2th5BKVl1gOuLMeYvCAPbhIXhdgwlrEyP8fp0tTP4sNLPXGeSA25hsthFKkuwNCEzm8OHiKAbQmEshlK/UroNYf19HT5TmDtayESpxbO2EoYLPDzvqeKQR3jRkeRld5IWt3IM14YMKmzofcMx6j3VYyfVHODqhManGxpPO4QTPmHl3gCDOzXGExZzxxNcDgiDuYouXcgO5vJ5n925sFwqhEL5pNMp+8W/bXT4ZGaGuvo68kJ5VNfUUOLR6A/q9AcUnZZdumJ7IIdd14Rot4E/y09VdRVlZeV2qv/+SzvuF9M0M5blIxKNsicep7CogEg0QjgcRtc1XC6XDVnaWG9Lm0M/AVDv+O0RSQ5EAAAAAElFTkSuQmCC')
    ])
  });

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const paren = source.indexOf('(', at + marker.length);
    if (paren < 0) return null;
    let parenDepth = 0;
    let signatureQuote = null;
    let signatureEscape = false;
    let closeParen = -1;
    for (let index = paren; index < source.length; index++) {
      const char = source[index];
      if (signatureQuote) {
        if (signatureEscape) signatureEscape = false;
        else if (char === '\\') signatureEscape = true;
        else if (char === signatureQuote) signatureQuote = null;
        continue;
      }
      if (char === '"' || char === "'" || char.charCodeAt(0) === 96) {
        signatureQuote = char;
        continue;
      }
      if (char === '(') parenDepth++;
      else if (char === ')' && --parenDepth === 0) {
        closeParen = index;
        break;
      }
    }
    const brace = closeParen < 0 ? -1 : source.indexOf('{', closeParen);
    if (brace < 0) return null;
    let depth = 0;
    let quote = null;
    let escape = false;
    for (let index = brace; index < source.length; index++) {
      const char = source[index];
      if (quote) {
        if (escape) escape = false;
        else if (char === '\\') escape = true;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'" || char.charCodeAt(0) === 96) {
        quote = char;
        continue;
      }
      if (char === '{') depth++;
      else if (char === '}' && --depth === 0) return { start, end: index + 1 };
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) {
      console.warn('Sans v34 function target missing:', name);
      return source;
    }
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function replaceOnce(source, before, after, label) {
    if (!source.includes(before)) {
      console.warn('Sans v34 target missing:', label);
      return source;
    }
    return source.replace(before, after);
  }

  const drawJudgmentDialogueV34 = String.raw`  function drawJudgmentDialogueV19() {
    const value = JUDGMENT_HALL_DIALOGUE_V19[judgmentHallDialogueIndexV19] || '';
    const elapsed = performance.now() - judgmentHallDialogueStartedAtV23;
    const visibleChars = Math.min(value.length, Math.floor(elapsed / 31));
    const visible = value.slice(0, visibleChars);
    const assets = window.__SANS_HQ_ASSETS_V34;
    if (assets?.panel?.complete && assets.panel.naturalWidth) {
      g.imageSmoothingEnabled = false;
      g.drawImage(assets.panel, 18, 12, 284, 58);
    } else {
      rect(18, 12, 284, 58, '#000');
      frameBox(18, 12, 284, 58, '#fff', 2);
    }
    if (assets?.portrait?.complete && assets.portrait.naturalWidth) {
      g.imageSmoothingEnabled = false;
      g.drawImage(assets.portrait, 27, 17, 46, 46);
    } else {
      drawJudgmentSansPortraitV19(50, 42, false);
    }
    const rows = String(visible).split('\n');
    for (let index = 0; index < rows.length; index++) {
      text(rows[index], 83, 21 + index * 13, 8, '#fff', 'left');
    }
  }`;

  const drawGuideDialogueV34 = String.raw`  function drawGuideDialogue(rows) {
    const panel = window.__SANS_HQ_ASSETS_V34?.panel;
    if (panel?.complete && panel.naturalWidth) {
      g.imageSmoothingEnabled = false;
      g.drawImage(panel, 17, 121, 286, 55);
    } else {
      frameBox(16, 128, 288, 43, '#fff', 2);
    }
    rows.slice(0, 3).forEach((row, index) => text(row, 29, 133 + index * 10, 7, '#fff'));
  }`;

  const drawMessageBoxV34 = String.raw`  function drawMessageBox() {
    if (stage === 10) {
      const panel = window.__SANS_HQ_ASSETS_V34?.panel;
      if (panel?.complete && panel.naturalWidth) {
        g.imageSmoothingEnabled = false;
        g.drawImage(panel, 18, 84, 284, 59);
      } else {
        rect(18, 84, 284, 59, '#fff');
        rect(21, 87, 278, 53, '#000');
      }
      visibleSpeechRows().forEach((row, index) => text(row, 33, 92 + index * 13, 8));
      if (state === 'enemySpeak' && speechChars >= message.join('').length) {
        text('▼', 289, 127, 8, '#fff', 'center');
      }
      return;
    }
    const x = 73, y = 91, w = 224, h = 53;
    rect(x, y, w, h, '#fff');
    rect(x + 3, y + 3, w - 6, h - 6, '#000');
    visibleSpeechRows().forEach((row, index) => text(row, x + 11, y + 6 + index * 13, 8));
    if (state === 'enemySpeak' && speechChars >= message.join('').length) {
      text('▼', x + w - 12, y + h - 15, 8, '#fff', 'center');
    }
  }`;

  const drawItemMenuV34 = String.raw`  function drawItemMenuV34() {
    const x = 31, y = 84, w = 258, h = 60;
    rect(x, y, w, h, '#fff');
    rect(x + 3, y + 3, w - 6, h - 6, '#000');
    const available = sansItemsV34.filter(item => !item.used);
    if (!available.length) {
      text('＊ アイテムは もう のこっていない。', 43, 105, 8, '#fff');
      return;
    }
    itemCursorV34 = Math.max(0, Math.min(itemCursorV34, available.length - 1));
    const icons = window.__SANS_HQ_ASSETS_V34?.items || [];
    available.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const itemX = x + 12 + column * 126;
      const itemY = y + 7 + row * 16;
      const icon = icons[item.icon];
      if (icon?.complete && icon.naturalWidth) {
        g.imageSmoothingEnabled = false;
        g.drawImage(icon, itemX + 9, itemY - 3, 15, 15);
      }
      if (index === itemCursorV34) heartShape(itemX + 3, itemY + 4, '#ed001f');
      text(item.name, itemX + 27, itemY, 7, index === itemCursorV34 ? '#ffff00' : '#fff');
    });
  }`;

  const commandActionV34 = String.raw`  function commandAction() {
    const alive = aliveEnemies();
    if (!alive.length) return finishVictory();
    if (menu === 0) {
      target = 0;
      setState('target', ['＊ こうげきする あいてを えらんでください。']);
    } else if (menu === 1) {
      const chosen = alive[turnCount % alive.length];
      if (stage === 10) {
        const mercyGain = sansTurn >= SANS_ATTACK_SEQUENCE.length - 3 ? 2 : 1;
        sansMercyProgress = Math.min(3, sansMercyProgress + mercyGain);
        setState('result', sansMercyProgress >= 3
          ? ['＊ サンズの まなざしが やわらいだ。', '＊ いまなら たたかわずに 道をあけてもらえそうだ。']
          : ['＊ サンズの ようすを みた。', '＊ ことばを返さず 静かに武器をおろした。']);
      } else {
        chosen.enemy.mood++;
        setState('result', chosen.enemy.mood >= 2
          ? ['＊ ' + chosen.enemy.name + 'を ほめた。', '＊ たたかう きもちが なくなったようだ。']
          : ['＊ ' + chosen.enemy.name + 'の ひかりを ほめた。', '＊ すこし てれている。']);
      }
    } else if (menu === 2) {
      const available = sansItemsV34.filter(item => !item.used);
      if (available.length) {
        itemCursorV34 = Math.min(itemCursorV34, available.length - 1);
        setState('itemSelect');
      } else setState('command', ['＊ アイテムは もう のこっていない。']);
    } else {
      const spareable = stage === 10
        ? ((sansBattleComplete || sansMercyProgress >= 3 || sansTurn >= SANS_ATTACK_SEQUENCE.length) ? alive : [])
        : alive.filter(({ enemy }) => enemy.mood >= 2 || enemy.hp <= 10);
      if (spareable.length) {
        spareable.forEach(({ enemy }) => enemy.spared = true);
        setState('result', ['＊ ' + spareable.map(({ enemy }) => enemy.name).join('と') + 'を みのがした。']);
      } else setState('result', ['＊ まだ みのがすことは できない。']);
    }
  }`;

  const repeatV34 = String.raw`  function spawnRecordedBoneVRepeat(source, x, y, height, direction, speed,
    count, spacing, boneType = 0, options = {}) {
    const safeSpacing = stage === 10 ? Math.max(32, Math.abs(spacing)) : spacing;
    const safeSpeed = stage === 10 ? Math.min(300, Math.abs(speed)) : speed;
    for (let index = 0; index < count; index++) {
      const position = recordedRepeatPosition(x, y, direction, safeSpacing, index);
      spawnRecordedBoneV(source, position.x, position.y, height,
        direction, safeSpeed, boneType, options);
    }
    playBoneEmergeSound();
  }`;

  const repeatHV34 = String.raw`  function spawnRecordedBoneHRepeat(source, x, y, length, direction, speed,
    count, spacing, boneType = 0, options = {}) {
    const safeSpacing = stage === 10 ? Math.max(32, Math.abs(spacing)) : spacing;
    const safeSpeed = stage === 10 ? Math.min(300, Math.abs(speed)) : speed;
    for (let index = 0; index < count; index++) {
      const position = recordedRepeatPosition(x, y, direction, safeSpacing, index);
      spawnRecordedBoneH(source, position.x, position.y, length,
        direction, safeSpeed, boneType, options);
    }
    playBoneEmergeSound();
  }`;

  window.applySansHqItemsFairnessV34 = source => {
    let result = String(source || '');

    result = replaceOnce(result, '  let items = 2;', String.raw`  const sansItemsV34 = [
    { name: 'バタースコッチパイ', heal: 999, icon: 0, used: false },
    { name: 'レジェンドヒーロー', heal: 40, icon: 1, used: false },
    { name: 'インスタントめん', heal: 90, icon: 2, used: false },
    { name: 'グラマーバーガー', heal: 27, icon: 3, used: false },
    { name: 'ゆきだるまのかけら', heal: 45, icon: 4, used: false },
    { name: 'フェイスステーキ', heal: 60, icon: 5, used: false }
  ];
  let itemCursorV34 = 0;
  let items = sansItemsV34.length;`, 'item inventory data');

    result = result.replaceAll('      items = 3;', String.raw`      sansItemsV34.forEach(item => { item.used = false; });
      itemCursorV34 = 0;
      items = sansItemsV34.length;`);

    result = replaceFunction(result, 'drawJudgmentDialogueV19', drawJudgmentDialogueV34);
    result = replaceFunction(result, 'drawGuideDialogue', drawGuideDialogueV34);
    result = replaceFunction(result, 'drawMessageBox', drawMessageBoxV34);
    result = replaceFunction(result, 'commandAction', commandActionV34);
    result = replaceFunction(result, 'spawnRecordedBoneVRepeat', repeatV34);
    result = replaceFunction(result, 'spawnRecordedBoneHRepeat', repeatHV34);

    const messageBounds = functionBounds(result, 'drawMessageBox');
    if (messageBounds && !result.includes('function drawItemMenuV34')) {
      result = result.slice(0, messageBounds.start) + drawItemMenuV34 + '\n\n'
        + result.slice(messageBounds.start);
    }

    result = replaceOnce(result,
      "    if (state === 'command') {\n      commandAction();\n      return;\n    }",
      String.raw`    if (state === 'itemSelect') {
      const available = sansItemsV34.filter(item => !item.used);
      if (!available.length) { setState('command', ['＊ アイテムは もう のこっていない。']); return; }
      itemCursorV34 = Math.max(0, Math.min(itemCursorV34, available.length - 1));
      const item = available[itemCursorV34];
      item.used = true;
      const healed = Math.min(item.heal, maxHp - hp);
      hp += healed;
      if (stage === 10) karmaHp = Math.max(0, karmaHp - Math.max(healed, 12));
      items = sansItemsV34.filter(candidate => !candidate.used).length;
      setState('result', ['＊ ' + item.name + 'を つかった。', '＊ HPが ' + healed + ' かいふくした。 のこり ' + items + 'こ。']);
      return;
    }
    if (state === 'command') {
      commandAction();
      return;
    }`, 'item confirmation');

    result = replaceOnce(result,
      "    } else if (state === 'target') {\n      if (pressed.has('ArrowLeft') || pressed.has('ArrowUp')) {",
      String.raw`    } else if (state === 'itemSelect') {
      const available = sansItemsV34.filter(item => !item.used);
      if (pressed.has('ArrowLeft')) { itemCursorV34 = Math.max(0, itemCursorV34 - 1); beep(); }
      if (pressed.has('ArrowRight')) { itemCursorV34 = Math.min(available.length - 1, itemCursorV34 + 1); beep(); }
      if (pressed.has('ArrowUp')) { itemCursorV34 = Math.max(0, itemCursorV34 - 2); beep(); }
      if (pressed.has('ArrowDown')) { itemCursorV34 = Math.min(available.length - 1, itemCursorV34 + 2); beep(); }
    } else if (state === 'target') {
      if (pressed.has('ArrowLeft') || pressed.has('ArrowUp')) {`, 'item cursor controls');

    result = replaceOnce(result,
      "(state === 'target' || state === 'result')",
      "(state === 'target' || state === 'result' || state === 'itemSelect')",
      'item cancel control');

    result = replaceOnce(result,
      "      if (state === 'attack') drawAttackGauge();\n      else if (state === 'enemyTurn') drawEnemyTurn();",
      String.raw`      if (state === 'attack') drawAttackGauge();
      else if (state === 'enemyTurn') drawEnemyTurn();
      else if (state === 'itemSelect') drawItemMenuV34();`, 'item menu drawing');

    result = replaceOnce(result,
      "      else if (!(stage === 10 && state === 'command')",
      "      else if (state !== 'itemSelect' && !(stage === 10 && state === 'command')",
      'item menu message suppression');

    result = replaceOnce(result,
      "    const idleFrame = library.frameAt(costume.idleLarge, scratchTime - stateAt, true);\n    if (switchCostume(costume.idleLarge, idleFrame, 56)) return;\n\n    drawImageCostume(sansReferenceImage, 54);",
      String.raw`    const highQualitySans = window.__SANS_HQ_ASSETS_V34?.sans;
    if (drawImageCostume(highQualitySans, 58)) return;
    const idleFrame = library.frameAt(costume.idleLarge, scratchTime - stateAt, true);
    if (switchCostume(costume.idleLarge, idleFrame, 56)) return;
    drawImageCostume(sansReferenceImage, 54);`, 'high-quality Sans idle');

    result = result.replace('const opening = Math.max(30, options.opening || 30);',
      'const opening = Math.max(36, options.opening || 36);');
    result = result.replace('const spacing = Math.max(10, options.spacing || 10);',
      'const spacing = Math.max(16, options.spacing || 16);');
    result = result.replace('const heightT = 97 - heightB;', 'const heightT = 93 - heightB;');
    result = result.replaceAll(
      'const gapRadius = Math.max(stage === 10 ? 16 : 0, options.gapRadius ?? 7);',
      'const gapRadius = Math.max(stage === 10 ? 18 : 0, options.gapRadius ?? 7);');
    result = result.replace(
      'const requiredGap = battleSoulRadius() * 2 + (isCompactBattleSoul() ? 3.5 : 6);',
      'const requiredGap = Math.max(24, battleSoulRadius() * 2 + (isCompactBattleSoul() ? 8 : 12));');
    result = result.replace('if (now - lastSansDamageAt < 100) return;',
      'if (now - lastSansDamageAt < 180) return;');

    return result;
  };

  console.info('Sans HQ/items/fairness v34 ready:', VERSION);
})();
