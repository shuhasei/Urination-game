(() => {
  'use strict';

  const VERSION = '20260806-final3';
  const GAME_URL = `game.js?v=${VERSION}`;
  const PATCH_PARTS = [
    'assets/final-complete-v2/part_00.txt',
    'assets/final-complete-v2/part_01.txt',
    'assets/final-complete-v2/part_02.txt',
    'assets/final-complete-v2/part_03.txt',
    'assets/final-complete-v2/part_04.txt'
  ];
  const EXPECTED_SHA256 = '1bd7c9a00ecabf308901a4ed4038aa5f6f21ff0f94cb4c0b06e8471fabbe1bc7';
  const hint = document.getElementById('start-hint');
  let fallbackStarted = false;

  const setHint = message => {
    if (!hint) return;
    hint.textContent = message;
    hint.classList.add('visible');
  };

  const parseRange = text => {
    const match = /^(\d+)(?:,(\d+))?$/.exec(text);
    if (!match) throw new Error(`Invalid patch range: ${text}`);
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
          throw new Error(`Unsupported patch line: ${line.slice(0, 80)}`);
        }
        index++;
      }

      const expectedPosition = oldRange.start - 1 + offset;
      let position = expectedPosition;
      let actual = sourceLines.slice(position, position + oldLines.length);

      if (actual.length !== oldLines.length
        || actual.some((line, lineIndex) => line !== oldLines[lineIndex])) {
        const windowStart = Math.max(0, expectedPosition - 160);
        const windowEnd = Math.min(sourceLines.length - oldLines.length, expectedPosition + 160);
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
          throw new Error(`Patch context mismatch near original line ${oldRange.start}`);
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

  const sha256 = async text => {
    if (!globalThis.crypto?.subtle) return null;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const verifyReviewedSource = async source => {
    const requiredMarkers = [
      'const TEST_PLAY_INVINCIBLE = false;',
      'sansWoundedWalkGifImage',
      'aiGeneratedSansFallbackImage',
      'function updateSansFinalBoxMove(dt)'
    ];
    if (!requiredMarkers.every(marker => source.includes(marker))) {
      throw new Error('The completed game source did not pass its feature check.');
    }
    const digest = await sha256(source);
    if (digest && digest !== EXPECTED_SHA256) {
      throw new Error(`Completed game source checksum mismatch: ${digest}`);
    }
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
    console.warn('Completed Sans build failed; loading the stable game.js instead.', error);
    setHint('安定版を読み込んでいます…');
    appendExternalScript(
      `${GAME_URL}&fallback=${Date.now()}`,
      () => {
        console.error('Stable game.js also failed to load.');
        setHint('ゲームデータを読み込めませんでした。ページを再読み込みしてください。');
      }
    );
  };

  const executeCompletedSource = source => new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(new Blob([
      `${source}\n//# sourceURL=game-completed-final3.js`
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
      reject(new Error('The completed game script could not execute.'));
    };
    document.body.appendChild(script);
  });

  const fetchText = async url => {
    const separator = url.includes('?') ? '&' : '?';
    const response = await fetch(`${url}${separator}v=${VERSION}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.text();
  };

  const load = async () => {
    setHint('ゲームデータを読み込んでいます…');
    const [source, ...parts] = await Promise.all([
      fetchText('game.js'),
      ...PATCH_PARTS.map(fetchText)
    ]);
    const patch = await decodeGzipBase64(parts.join(''));
    const completedSource = applyUnifiedPatch(source, patch);
    await verifyReviewedSource(completedSource);
    await executeCompletedSource(completedSource);
    if (hint && hint.textContent === 'ゲームデータを読み込んでいます…') {
      hint.textContent = 'ENTER / Z / タップ';
    }
  };

  load().catch(startFallback);
})();
