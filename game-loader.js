(() => {
  'use strict';

  const VERSION = '20260807-room11-live1';
  const GAME_URL = `game.js?v=${VERSION}`;
  const MAIN_PATCH_URL = 'https://raw.githubusercontent.com/shuhasei/Urination-game/main/.github/scripts/apply_room11_omega.py';
  const RESCUE_PATCH_URL = 'https://raw.githubusercontent.com/shuhasei/Urination-game/main/.github/scripts/apply_room11_omega_rescue.py';
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
  const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
  const hint = document.getElementById('start-hint');

  function showHint(message) {
    if (!hint) return;
    hint.textContent = message;
    hint.classList.add('visible');
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
      const blob = new Blob([`${source}\n//# sourceURL=game-room11-live.js`], {
        type: 'text/javascript'
      });
      const url = URL.createObjectURL(blob);
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.onload = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      script.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('patched game could not be executed'));
      };
      document.body.appendChild(script);
    });
  }

  async function buildPatchedGame() {
    showHint('ROOM11データを読み込んでいます…');

    const [gameSource, mainPatch, rescuePatch] = await Promise.all([
      fetchText(GAME_URL),
      fetchText(`${MAIN_PATCH_URL}?v=${VERSION}`),
      fetchText(`${RESCUE_PATCH_URL}?v=${VERSION}`)
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
      pyodide.FS.writeFile('/work/.github/scripts/apply_room11_omega.py', mainPatch, {
        encoding: 'utf8'
      });
      pyodide.FS.writeFile('/work/.github/scripts/apply_room11_omega_rescue.py', rescuePatch, {
        encoding: 'utf8'
      });
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
      const patchedSource = await buildPatchedGame();
      showHint('更新したゲームを起動しています…');
      await executeGame(patchedSource);
      if (hint && hint.textContent === '更新したゲームを起動しています…') {
        hint.textContent = 'ENTER / Z / タップ';
      }
    } catch (error) {
      console.error('ROOM11 live patch failed:', error);
      showHint('更新データの適用に失敗しました。再読み込みしてください。');
    }
  }

  start();
})();
