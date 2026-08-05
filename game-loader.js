(() => {
  'use strict';

  const PATCH_URL = 'assets/final_video_verified.patch.gz.b64';
  const CSV_REBUILD_PATCH_URL = 'assets/csv_rebuild_v6.patch.gz.b64';
  const GAME_URL = 'game.js';
  let fallbackStarted = false;

  const setHint = message => {
    const hint = document.getElementById('start-hint');
    if (!hint) return;
    hint.textContent = message;
    hint.classList.add('visible');
  };

  const parseRange = text => {
    const match = /^(\d+)(?:,(\d+))?$/.exec(text);
    if (!match) throw new Error('Invalid patch range: ' + text);
    return {
      start: Number(match[1]),
      count: match[2] === undefined ? 1 : Number(match[2])
    };
  };

  const applyUnifiedPatch = (source, patch) => {
    const sourceEndsWithNewline = source.endsWith('\n');
    const sourceLines = source.replace(/\r\n/g, '\n').split('\n');
    if (sourceEndsWithNewline) sourceLines.pop();

    const patchLines = patch.replace(/\r\n/g, '\n').split('\n');
    let offset = 0;
    let index = 0;
    let hunkCount = 0;

    while (index < patchLines.length) {
      const header = /^@@ -(\d+(?:,\d+)?) \+(\d+(?:,\d+)?) @@/.exec(patchLines[index]);
      if (!header) {
        index++;
        continue;
      }

      const oldRange = parseRange(header[1]);
      const oldLines = [];
      const newLines = [];
      index++;

      while (index < patchLines.length && !patchLines[index].startsWith('@@ ')) {
        const line = patchLines[index];
        if (line.startsWith('diff --git ') || line.startsWith('--- ') || line.startsWith('+++ ')) break;
        if (line === '\\ No newline at end of file') {
          index++;
          continue;
        }

        const prefix = line[0];
        const content = line.slice(1);
        if (prefix === ' ') {
          oldLines.push(content);
          newLines.push(content);
        } else if (prefix === '-') {
          oldLines.push(content);
        } else if (prefix === '+') {
          newLines.push(content);
        } else if (line !== '') {
          throw new Error('Unsupported patch line: ' + line);
        }
        index++;
      }

      const expectedPosition = oldRange.start - 1 + offset;
      let position = expectedPosition;
      let actual = sourceLines.slice(position, position + oldLines.length);

      if (actual.length !== oldLines.length
        || actual.some((line, lineIndex) => line !== oldLines[lineIndex])) {
        const windowStart = Math.max(0, expectedPosition - 120);
        const windowEnd = Math.min(sourceLines.length - oldLines.length, expectedPosition + 120);
        position = -1;
        for (let candidate = windowStart; candidate <= windowEnd; candidate++) {
          const candidateLines = sourceLines.slice(candidate, candidate + oldLines.length);
          if (candidateLines.length === oldLines.length
            && candidateLines.every((line, lineIndex) => line === oldLines[lineIndex])) {
            position = candidate;
            break;
          }
        }
        if (position < 0) {
          throw new Error('Patch context mismatch near original line ' + oldRange.start);
        }
      }

      sourceLines.splice(position, oldLines.length, ...newLines);
      offset += newLines.length - oldLines.length + (position - expectedPosition);
      hunkCount++;
    }

    if (!hunkCount) throw new Error('No patch hunks were found.');
    return sourceLines.join('\n') + (sourceEndsWithNewline ? '\n' : '');
  };

  const decodeGzipBase64 = async encoded => {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('This browser does not support gzip decompression.');
    }
    const compact = encoded.replace(/\s+/g, '');
    const bytes = Uint8Array.from(atob(compact), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  };

  const fetchDecodedPatch = async url => {
    const response = await fetch(url + '?v=20260806-1', { cache: 'no-store' });
    if (!response.ok) throw new Error(url + ': HTTP ' + response.status);
    return decodeGzipBase64(await response.text());
  };

  const appendExternalScript = (url, onError) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = false;
    if (onError) script.onerror = onError;
    document.body.appendChild(script);
  };

  const startFallback = error => {
    if (fallbackStarted) return;
    fallbackStarted = true;
    console.warn('Reviewed build failed; loading the stable game.js instead.', error);
    setHint('安定版を読み込んでいます…');
    appendExternalScript(
      GAME_URL + '?fallback=' + Date.now(),
      () => {
        console.error('Stable game.js also failed to load.');
        setHint('ゲームデータを読み込めませんでした。ページを再読み込みしてください。');
      }
    );
  };

  const executeReviewedSource = source => new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(new Blob([
      source + '\n//# sourceURL=game-reviewed-v6.js'
    ], { type: 'text/javascript' }));
    const script = document.createElement('script');
    script.src = blobUrl;
    script.async = false;
    script.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve();
    };
    script.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('The reviewed script was blocked or could not execute.'));
    };
    document.body.appendChild(script);
  });

  const load = async () => {
    setHint('ゲームデータを読み込んでいます…');

    const sourceResponse = await fetch(GAME_URL + '?v=20260806-1', { cache: 'no-store' });
    if (!sourceResponse.ok) throw new Error('game.js: HTTP ' + sourceResponse.status);
    const source = await sourceResponse.text();

    const basePatch = await fetchDecodedPatch(PATCH_URL);
    let reviewedSource = applyUnifiedPatch(source, basePatch);

    try {
      const csvRebuildPatch = await fetchDecodedPatch(CSV_REBUILD_PATCH_URL);
      reviewedSource = applyUnifiedPatch(reviewedSource, csvRebuildPatch);
    } catch (error) {
      console.warn('CSV-based Sans attack rebuild was not applied; using the previous reviewed build.', error);
    }

    await executeReviewedSource(reviewedSource);
  };

  load().catch(startFallback);
})();