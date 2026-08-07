(() => {
  'use strict';

  const VERSION = '20260807-omega-story4';
  const GAME_URL = `game.js?v=${VERSION}`;
  const MAIN_PATCH_URL = 'https://raw.githubusercontent.com/shuhasei/Urination-game/main/.github/scripts/apply_room11_omega.py';
  const RESCUE_PATCH_URL = 'https://raw.githubusercontent.com/shuhasei/Urination-game/main/.github/scripts/apply_room11_omega_rescue.py';
  const HOTFIX_URL = `room11-hotfix.js?v=${VERSION}`;
  const MEDIA_HOTFIX_URL = `room11-media-hotfix.js?v=${VERSION}`;
  const ROOM10_UNLOCK_URL = `room10-movement-unlock.js?v=${VERSION}`;
  const OMEGA_FAITHFUL_URL = `omega-faithful-hotfix.js?v=${VERSION}`;
  const OMEGA_STORY_URL = `omega-story-final-hotfix.js?v=${VERSION}`;
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
  const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
  const hint = document.getElementById('start-hint');

  function showHint(message) {
    if (!hint) return;
    hint.textContent = message;
    hint.classList.add('visible');
  }

  function hideHint() {
    if (!hint) return;
    hint.textContent = '';
    hint.classList.remove('visible');
  }

  function fetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      return response.text();
    });
  }

  function loadExternalScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`${url} could not be loaded`));
      document.head.appendChild(script);
    });
  }

  function executeGame(source) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([`${source}\n//# sourceURL=game-omega-story4.js`], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.onload = () => { URL.revokeObjectURL(url); resolve(); };
      script.onerror = () => { URL.revokeObjectURL(url); reject(new Error('patched game could not be executed')); };
      document.body.appendChild(script);
    });
  }

  async function buildPatchedGame() {
    showHint('ROOM11データを読み込んでいます…');
    const [gameSource, mainPatch, rescuePatch] = await Promise.all([
      fetchText(GAME_URL), fetchText(`${MAIN_PATCH_URL}?v=${VERSION}`), fetchText(`${RESCUE_PATCH_URL}?v=${VERSION}`)
    ]);
    if (typeof window.loadPyodide !== 'function') {
      showHint('ゲーム更新データを準備しています…');
      await loadExternalScript(PYODIDE_URL);
    }
    const pyodide = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    try {
      pyodide.FS.mkdirTree('/work/.github/scripts');
      pyodide.FS.writeFile('/work/game.js', gameSource, { encoding: 'utf8' });
      pyodide.FS.writeFile('/work/game-loader.js', '', { encoding: 'utf8' });
      pyodide.FS.writeFile('/work/index.html', '', { encoding: 'utf8' });
      pyodide.FS.writeFile('/work/.github/scripts/apply_room11_omega.py', mainPatch, { encoding: 'utf8' });
      pyodide.FS.writeFile('/work/.github/scripts/apply_room11_omega_rescue.py', rescuePatch, { encoding: 'utf8' });
      pyodide.FS.chdir('/work');
      await pyodide.runPythonAsync(`
from pathlib import Path
runner = Path('.github/scripts/apply_room11_omega_rescue.py')
namespace = {'__name__': '__main__', '__file__': str(runner)}
exec(compile(runner.read_text(encoding='utf-8'), str(runner), 'exec'), namespace)
`);
      return pyodide.FS.readFile('/work/game.js', { encoding: 'utf8' });
    } finally {
      try { pyodide.FS.chdir('/'); } catch (_) {}
    }
  }

  async function start() {
    try {
      await loadExternalScript(HOTFIX_URL);
      await loadExternalScript(MEDIA_HOTFIX_URL);
      await loadExternalScript(ROOM10_UNLOCK_URL);
      await loadExternalScript(OMEGA_FAITHFUL_URL);
      await loadExternalScript(OMEGA_STORY_URL);
      const required = [
        ['applyRoom11Hotfix','ROOM11 hotfix'],
        ['applyRoom11MediaHotfix','ROOM11 media hotfix'],
        ['applyRoom10MovementUnlock','ROOM10 movement unlock'],
        ['applyOmegaFaithfulHotfix','Omega master hotfix'],
        ['applyOmegaStoryFinalHotfix','Omega story hotfix']
      ];
      for (const [name,label] of required) if (typeof window[name] !== 'function') throw new Error(`${label} function is unavailable`);

      const generatedSource = await buildPatchedGame();
      showHint('オメガフラウィ戦の完全版を構築しています…');
      let source = window.applyRoom11Hotfix(generatedSource);
      source = window.applyRoom11MediaHotfix(source);
      source = window.applyRoom10MovementUnlock(source);
      source = window.applyOmegaFaithfulHotfix(source);
      source = window.applyOmegaStoryFinalHotfix(source);
      await executeGame(source);
      hideHint();
    } catch (error) {
      console.error('ROOM11/Omega live patch failed:', error);
      showHint('更新データの適用に失敗しました。Ctrl＋Shift＋Rで再読み込みしてください。');
    }
  }

  start();
})();
