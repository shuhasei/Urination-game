(() => {
  'use strict';

  // Tenor source selected against the supplied Sans reference footage.
  // The direct GIF URL is intentionally kept in this manifest so the battle
  // sprite is part of the game's media configuration instead of being pasted
  // into renderer code. Local/user media remains the fallback in the loader.
  window.TENOR_SANS_MEDIA_V18 = Object.freeze({
    battle: Object.freeze({
      url: 'https://media1.tenor.com/m/pJpj6NolUvkAAAAd/sans-sans-battle-sprite.gif',
      page: 'https://tenor.com/view/sans-sans-battle-sprite-sans-wink-shrug-sans-shrug-gif-11860902420377064185',
      width: 240,
      height: 240,
      duration: 2.5,
      provider: 'Tenor'
    }),
    handUp: Object.freeze({
      url: 'https://media1.tenor.com/m/-tCE0vauXxcAAAAd/sans-undertale.gif',
      page: 'https://tenor.com/view/sans-undertale-10th-anniversary-stream-10th-anniversary-stream-gif-18073091346254421783',
      width: 498,
      height: 498,
      duration: 0.6,
      provider: 'Tenor'
    }),
    gaster: Object.freeze({
      url: 'https://media1.tenor.com/m/habwWBWs7woAAAAd/gaster-blaster.gif',
      page: 'https://tenor.com/view/gaster-blaster-gif-20422896',
      width: 498,
      height: 280,
      duration: 1.6,
      provider: 'Tenor'
    }),
    fightReference: Object.freeze({
      url: 'https://media1.tenor.com/m/lwVU5MQXsqgAAAAd/undertale-sans.gif',
      page: 'https://tenor.com/view/undertale-sans-sansfight-gif-5151998',
      width: 480,
      height: 270,
      duration: 8.1,
      provider: 'Tenor'
    })
  });
})();
