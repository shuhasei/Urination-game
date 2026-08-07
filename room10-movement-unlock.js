(() => {
  'use strict';

  window.applyRoom10MovementUnlock = source => {
    const before = "      || inHorizontalCorridor || inBattleDoor) && !blocked && connectorAllowsCrossing) {";
    const after = "      || inHorizontalCorridor || inBattleDoor)\n      && (!blocked || (pendingStage === 10\n        && openingPlayer.x >= 110 && openingPlayer.x <= 199\n        && openingPlayer.y >= 76 && openingPlayer.y <= 166))\n      && connectorAllowsCrossing) {";

    if (!source.includes(before)) {
      console.warn('[ROOM10 movement unlock] movement condition was not found');
      return source;
    }
    return source.replace(before, after);
  };
})();
