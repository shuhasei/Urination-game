(() => {
  'use strict';

  const VERSION = '20260813-sans-video-v23';
  const BASE = 'assets/user-sans-v23/';
  const EXPECTED_VOICE_SHA256 = '165f43b2fafd6061a991ccd48dd68d067c5e1e6bc30dc76538fe04e7e77166be';

  const text = async path => {
    const response = await fetch(`${BASE}${path}?v=${VERSION}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return (await response.text()).trim();
  };

  const imageFromBase64 = (base64, label) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth && image.naturalHeight
      ? resolve(image) : reject(new Error(`${label}: zero-size image`));
    image.onerror = () => reject(new Error(`${label}: decode failed`));
    image.src = `data:image/png;base64,${base64}`;
  });

  async function sha256Base64(base64) {
    if (!crypto?.subtle) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  }

  window.__sansV23MediaReady = (async () => {
    try {
      const [front0, front1, front2, side0, side1,
        voice0, voice1, voiceGap, voice2, voiceTail] = await Promise.all([
        text('front-00.b64'), text('front-01.b64'), text('front-02.b64'),
        text('side-00.b64'), text('side-01.b64'),
        text('voice-00.b64'), text('voice-01.b64'), text('voice-gap.b64'),
        text('voice-02.b64'), text('voice-tail.b64')
      ]);

      const frontData = front0 + front1 + front2;
      const sideData = side0 + side1;
      const voiceData = voice0 + voice1 + voiceGap + voice2 + voiceTail;

      const [front, side, voiceHash] = await Promise.all([
        imageFromBase64(frontData, 'generated Sans front'),
        imageFromBase64(sideData, 'generated Sans side'),
        sha256Base64(voiceData)
      ]);

      window.__sansFrontV23 = front;
      window.__sansSideV23 = side;
      window.__sansVoiceOriginalV23Data = `data:audio/mpeg;base64,${voiceData}`;
      window.USER_SANS_VOICE_URL = window.__sansVoiceOriginalV23Data;
      window.__sansVoiceOriginalV23Sha256 = voiceHash;

      if (voiceHash && voiceHash !== EXPECTED_VOICE_SHA256) {
        console.error('Sans v23 original voice hash mismatch:', voiceHash);
      } else {
        console.info('Sans v23 generated sprites/original voice ready.', {
          front: [front.naturalWidth, front.naturalHeight],
          side: [side.naturalWidth, side.naturalHeight],
          voiceSha256: voiceHash || 'unavailable'
        });
      }
      return true;
    } catch (error) {
      console.error('Sans v23 media preparation failed:', error);
      return false;
    }
  })();
})();
