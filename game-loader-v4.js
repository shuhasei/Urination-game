(() => {
  'use strict';

  const VERSION = '20260807-omega-parts5';
  const GAME_URL = `game.js?v=${VERSION}`;
  const MAIN_PATCH_URL = 'https://raw.githubusercontent.com/shuhasei/Urination-game/main/.github/scripts/apply_room11_omega.py';
  const RESCUE_PATCH_URL = 'https://raw.githubusercontent.com/shuhasei/Urination-game/main/.github/scripts/apply_room11_omega_rescue.py';
  const IMAGE_DATA_URL = `omega-image-data.js?v=${VERSION}`;
  const HOTFIX_URL = `room11-hotfix.js?v=${VERSION}`;
  const MEDIA_HOTFIX_URL = `room11-media-hotfix.js?v=${VERSION}`;
  const ROOM10_UNLOCK_URL = `room10-movement-unlock.js?v=${VERSION}`;
  const OMEGA_FAITHFUL_URL = `omega-faithful-hotfix.js?v=${VERSION}`;
  const OMEGA_HQ_URL = `omega-hq-generated-hotfix.js?v=${VERSION}`;
  const OMEGA_STORY_URL = `omega-story-final-hotfix.js?v=${VERSION}`;
  const OMEGA_MOTION_URL = `omega-motion-hotfix.js?v=${VERSION}`;
  const OMEGA_PARTS_FINAL_URL = `omega-parts-final-hotfix.js?v=${VERSION}`;
  const OMEGA_PART_FILES = Object.freeze({
    tv: 'assets/omega-parts-gif/tv.b64',
    left_eye: 'assets/omega-parts-gif/left_eye.b64',
    right_eye: 'assets/omega-parts-gif/right_eye.b64',
    core: 'assets/omega-parts-gif/core.b64',
    left_arm: 'assets/omega-parts-gif/left_arm.b64',
    right_arm: 'assets/omega-parts-gif/right_arm.b64'
  });
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

  function normalizeStorySource(source) {
    let result = String(source || '');
    const multilineVictory = `    if (state === 'omegaVictory') {
      if (typeof saveCurrentProfile === 'function') saveCurrentProfile();
      setState('title');
      touch.classList.remove('show');
      return;
    }`;
    const compactVictory = `    if (state === 'omegaVictory') {
      saveCurrentProfile();
      setState('title');
      return;
    }`;
    const storyExpectedVictory = `    if (state === 'omegaVictory') { saveCurrentProfile(); setState('title'); return; }`;
    if (result.includes(multilineVictory) && !result.includes(storyExpectedVictory)) result = result.replace(multilineVictory, storyExpectedVictory);
    if (result.includes(compactVictory) && !result.includes(storyExpectedVictory)) result = result.replace(compactVictory, storyExpectedVictory);
    return result;
  }

  async function prepareOmegaImage(source) {
    const base64 = window.OMEGA_FLOWEY_IMAGE_BASE64;
    const mime = window.OMEGA_FLOWEY_IMAGE_MIME || 'image/webp';
    if (!base64) throw new Error('検証済みオメガフラウィ画像データがありません');

    showHint('オメガフラウィ画像を読み込んでいます…');
    let binary;
    try {
      binary = atob(base64);
    } catch (_) {
      throw new Error('オメガフラウィ画像のBase64データが壊れています');
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const blobUrl = URL.createObjectURL(blob);

    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('検証済みオメガフラウィ画像をデコードできません'));
      image.src = blobUrl;
    });
    if (!image.naturalWidth || !image.naturalHeight) {
      URL.revokeObjectURL(blobUrl);
      throw new Error('オメガフラウィ画像のサイズを取得できません');
    }

    window.__omegaFloweyBlobUrl = blobUrl;
    window.__omegaFloweyPreloadedImage = image;
    console.info('Omega Flowey verified image ready:', image.naturalWidth, image.naturalHeight);

    const patched = String(source || '').replace(
      /room11OmegaSourceImage\.src='data:image\/(?:png|webp|jpeg);base64,[^']*';/,
      "room11OmegaSourceImage.src=window.__omegaFloweyBlobUrl;"
    );
    if (patched === source) throw new Error('オメガフラウィ画像の差し替え位置を検出できません');
    return patched;
  }

  async function prepareOmegaPartGifs() {
    showHint('オメガフラウィの部位別GIFを読み込んでいます…');
    const pairs = await Promise.all(Object.entries(OMEGA_PART_FILES).map(async ([name, path]) => {
      const base64 = (await fetchText(`${path}?v=${VERSION}`)).trim();
      if (!base64.startsWith('R0lGOD')) throw new Error(`${name} GIF data is invalid`);
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`${name} GIF could not be decoded`));
        image.src = `data:image/gif;base64,${base64}`;
      });
      return [name, image];
    }));
    window.__omegaPartGifImages = Object.fromEntries(pairs);
    console.info('Omega part GIFs ready:', Object.keys(window.__omegaPartGifImages));
  }

  function executeGame(source) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([`${source}\n//# sourceURL=game-omega-parts5.js`], { type: 'text/javascript' });
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
      await loadExternalScript(IMAGE_DATA_URL);
      await loadExternalScript(HOTFIX_URL);
      await loadExternalScript(MEDIA_HOTFIX_URL);
      await loadExternalScript(ROOM10_UNLOCK_URL);
      await loadExternalScript(OMEGA_FAITHFUL_URL);
      await loadExternalScript(OMEGA_HQ_URL);
      await loadExternalScript(OMEGA_STORY_URL);
      await loadExternalScript(OMEGA_MOTION_URL);
      await loadExternalScript(OMEGA_PARTS_FINAL_URL);
      await prepareOmegaPartGifs();

      const required = [
        ['applyRoom11Hotfix', 'ROOM11 hotfix'],
        ['applyRoom11MediaHotfix', 'ROOM11 media hotfix'],
        ['applyRoom10MovementUnlock', 'ROOM10 movement unlock'],
        ['applyOmegaFaithfulHotfix', 'Omega master hotfix'],
        ['applyOmegaHQGeneratedHotfix', 'Omega HQ hotfix'],
        ['applyOmegaStoryFinalHotfix', 'Omega story hotfix'],
        ['applyOmegaMotionHotfix', 'Omega motion hotfix'],
        ['applyOmegaPartsFinalHotfix', 'Omega parts GIF hotfix']
      ];
      for (const [name, label] of required) {
        if (typeof window[name] !== 'function') throw new Error(`${label} function is unavailable`);
      }

      const generatedSource = await buildPatchedGame();
      showHint('ROOM11とオメガフラウィを構築しています…');
      let source = window.applyRoom11Hotfix(generatedSource);
      source = window.applyRoom11MediaHotfix(source);
      source = await prepareOmegaImage(source);
      source = window.applyRoom10MovementUnlock(source);
      source = window.applyOmegaFaithfulHotfix(source);
      source = window.applyOmegaHQGeneratedHotfix(source);
      source = normalizeStorySource(source);

      try {
        source = window.applyOmegaStoryFinalHotfix(source);
      } catch (storyError) {
        console.error('Omega story patch compatibility error:', storyError);
        showHint('オメガフラウィ演出を互換モードで起動しています…');
      }

      try {
        source = window.applyOmegaMotionHotfix(source);
      } catch (motionError) {
        console.error('Omega motion patch compatibility error:', motionError);
        showHint('オメガフラウィの標準演出で起動しています…');
      }

      source = window.applyOmegaPartsFinalHotfix(source);
      await executeGame(source);
      hideHint();
    } catch (error) {
      console.error('ROOM11/Omega live patch failed:', error);
      const detail = error && error.message ? error.message : String(error || 'unknown error');
      showHint(`更新データの適用に失敗しました：${detail}`);
    }
  }

  start();
})();
