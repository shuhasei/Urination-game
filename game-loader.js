(() => {
  'use strict';

  const GAME_URL = 'game.js?v=20260806-final5';
  const hint = document.getElementById('start-hint');

  if (hint) {
    hint.textContent = 'ゲームデータを読み込んでいます…';
    hint.classList.add('visible');
  }

  const script = document.createElement('script');
  script.src = GAME_URL;
  script.async = false;
  script.onload = () => {
    if (hint && hint.textContent === 'ゲームデータを読み込んでいます…') {
      hint.textContent = 'ENTER / Z / タップ';
    }
  };
  script.onerror = () => {
    console.error('game.js could not be loaded.');
    if (hint) {
      hint.textContent = 'ゲームデータを読み込めませんでした。ページを再読み込みしてください。';
      hint.classList.add('visible');
    }
  };
  document.body.appendChild(script);
})();
