(() => {
  'use strict';

  const decodeGzipBase64 = async encoded => {
    const compact = encoded.replace(/\s+/g, '');
    const bytes = Uint8Array.from(atob(compact), character => character.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  };

  const parseRange = text => {
    const match = /^(\d+)(?:,(\d+))?$/.exec(text);
    if (!match) throw new Error('Invalid patch range: ' + text);
    return { start: Number(match[1]), count: match[2] === undefined ? 1 : Number(match[2]) };
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

      const position = oldRange.start - 1 + offset;
      const actual = sourceLines.slice(position, position + oldLines.length);
      if (actual.length !== oldLines.length
        || actual.some((line, lineIndex) => line !== oldLines[lineIndex])) {
        throw new Error('Patch context mismatch near original line ' + oldRange.start);
      }

      sourceLines.splice(position, oldLines.length, ...newLines);
      offset += newLines.length - oldLines.length;
      hunkCount++;
    }

    if (!hunkCount) throw new Error('No patch hunks were found.');
    return sourceLines.join('\n') + (sourceEndsWithNewline ? '\n' : '');
  };

  const showLoadError = error => {
    console.error('Failed to start the reviewed game build:', error);
    const hint = document.getElementById('start-hint');
    if (hint) {
      hint.textContent = 'ゲームデータを読み込めませんでした。';
      hint.classList.add('visible');
    }
  };

  Promise.all([
    fetch('game.js', { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error('game.js: HTTP ' + response.status);
      return response.text();
    }),
    fetch('assets/final_video_verified.patch.gz.b64', { cache: 'no-store' }).then(response => {
      if (!response.ok) throw new Error('review patch: HTTP ' + response.status);
      return response.text();
    }).then(decodeGzipBase64)
  ]).then(([source, patch]) => {
    const reviewedSource = applyUnifiedPatch(source, patch);
    (0, eval)(reviewedSource);
  }).catch(showLoadError);
})();
