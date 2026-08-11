(() => {
  'use strict';

  const referenceLines = [
    'ふう。みんな さいしょから いちばん つよい こうげきを つかわないのが ふしぎだったんだ。',
    'なんだ？ オレが そこに たって くらうとでも おもったか？',
    'オレたちの きろくじゃ じくうの れんぞくたいに おおきな いじょうが あった。',
    'タイムラインが とんだり もどったり とまったり はじまったり…。',
    'そして とつぜん ぜんぶ おわる。',
    'へへへ… これって おまえの せいなんだろ？',
    'この きもちが おまえに わかるか？',
    'いつか なんの まえぶれもなく ぜんぶ リセットされるって わかってる きもちが。',
    'ずっと まえに もどろうとするのは あきらめた。',
    'ちじょうに でることだって もう たいして きょうみは ない。',
    'どうせ でたって きおくも なくして また ここに もどるんだろ？',
    'そう おもうと ほんきを だすのも むずかしくてな。',
    '…まあ ただの なまけものの いいわけかもしれないけど。',
    'でも つぎに なにが おこるか わかってる。もう きにしないふりは できない。',
    'それにしても おまえ ほんとうに それを ふりまわすのが すきなんだな。',
    'なあ。まえに こたえなかったけど おまえの なかに まだ いいやつが のこってるのが わかる。',
    'むかし ただしいことを したいと おもってた やつの きおくが。べつの ときなら ともだちに なれたかもな。',
    'なあ あいぼう。オレを おぼえてるか？ もう ぜんぶ わすれて ぶきを おいてくれないか。',
    '…まあ やってみる かちは あった。どうやら むずかしい ほうが すきらしいな。',
    'へんな はなしだけど オレは ひそかに ともだちに なれるんじゃないかって おもってた。',
    'うまいものと くだらない わらいばなしと いい ともだち。それだけで とまるんじゃないかって。',
    'でも そんなの バカげてるよな。おまえは けっして まんぞくしない。',
    'タイムラインを なんども くりかえす。だから いつか やめどきを おぼえなきゃならない。…そのひは きょうだ。'
  ];

  function replaceArray(source, declaration, values) {
    const start = source.indexOf(declaration);
    if (start < 0) return source;
    const open = source.indexOf('[', start + declaration.length);
    if (open < 0) return source;
    let quote = null;
    let escape = false;
    let depth = 0;
    let close = -1;
    for (let i = open; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) { close = i; break; }
      }
    }
    if (close < 0) return source;
    const encoded = values.map(value => '    ' + JSON.stringify(value)).join(',\n');
    return source.slice(0, open) + '[\n' + encoded + '\n  ]' + source.slice(close + 1);
  }

  function applyReferenceDialogue(source) {
    return replaceArray(String(source || ''), 'const SANS_BATTLE_LINES =', referenceLines);
  }

  let wrapped = null;
  Object.defineProperty(window, 'applySansVideoFaithfulV19', {
    configurable: true,
    enumerable: true,
    get() { return wrapped; },
    set(base) {
      if (typeof base !== 'function') {
        wrapped = base;
        return;
      }
      wrapped = source => applyReferenceDialogue(base(source));
      wrapped.__sansVideoDialogueV20 = true;
    }
  });
})();
