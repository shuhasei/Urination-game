(() => {
  'use strict';

  window.applySansUserGifPriorityV10 = source => String(source || '')
    .replace(
      "decodeGifFramesV9(sansIdleGifImage, sansGifFramesV9, sansGifDurationsV9, 'Sans GIF');",
      "decodeGifFramesV9(window.__userSansGifPreloaded || sansIdleGifImage, sansGifFramesV9, sansGifDurationsV9, 'Sans GIF');"
    )
    .replace(
      "const browserIdle = sansIdleGifImage.complete && sansIdleGifImage.naturalWidth\n      ? sansIdleGifImage\n      : (window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth\n        ? window.__userSansGifPreloaded : null);",
      "const browserIdle = window.__userSansGifPreloaded?.complete && window.__userSansGifPreloaded.naturalWidth\n      ? window.__userSansGifPreloaded\n      : (sansIdleGifImage.complete && sansIdleGifImage.naturalWidth ? sansIdleGifImage : null);"
    );
})();