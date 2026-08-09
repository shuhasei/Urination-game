#target photoshop
app.displayDialogs = DialogModes.NO;

(function () {
  function readJson(file) {
    file.encoding = 'UTF8';
    if (!file.open('r')) throw new Error('Could not open ' + file.fsName);
    var text = file.read(); file.close();
    return JSON.parse(text);
  }
  function addFullCanvasPng(target, pngFile, parent, layerName) {
    var src = app.open(pngFile);
    if (!src.layers.length) { src.close(SaveOptions.DONOTSAVECHANGES); return null; }
    var layer = src.activeLayer;
    var dup = layer.duplicate(target, ElementPlacement.PLACEATBEGINNING);
    src.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = target;
    dup.name = layerName;
    if (parent) dup.move(parent, ElementPlacement.INSIDE);
    return dup;
  }
  function ensureGroup(doc, name) {
    var g = doc.layerSets.add(); g.name = name; return g;
  }

  var root = Folder.selectDialog('Omega Flowey workspace folderを選択してください');
  if (!root) return;
  var manifestFile = new File(root.fsName + '/manifest.json');
  if (!manifestFile.exists) throw new Error('manifest.json がありません。先に omega_cutout.py build を実行してください。');
  var manifest = readJson(manifestFile);
  var doc = app.documents.add(manifest.width, manifest.height, 72, 'Omega_Flowey_Live2D', NewDocumentMode.RGB, DocumentFill.TRANSPARENT);

  // Source locked at bottom.
  var sourceGroup = ensureGroup(doc, '99_SOURCE_LOCKED');
  var sourceFile = new File(root.fsName + '/' + manifest.source);
  if (sourceFile.exists) {
    var sourceLayer = addFullCanvasPng(doc, sourceFile, sourceGroup, 'source_locked');
    if (sourceLayer) sourceLayer.allLocked = true;
  }

  // Repair drafts kept separate so they never get mistaken for source truth.
  var repairGroup = ensureGroup(doc, '90_REPAIR_FILL');
  for (var gi = manifest.groups.length - 1; gi >= 0; gi--) {
    var repairLayers = manifest.groups[gi].layers;
    for (var ri = repairLayers.length - 1; ri >= 0; ri--) {
      var repairRel = repairLayers[ri].repair_png;
      if (!repairRel) continue;
      var repairFile = new File(root.fsName + '/' + repairRel);
      if (repairFile.exists) addFullCanvasPng(doc, repairFile, repairGroup, 'repair__' + repairLayers[ri].name);
    }
  }

  // Main editable groups. Reverse creation keeps visual stack matching manifest order.
  for (var g = manifest.groups.length - 1; g >= 0; g--) {
    var groupSpec = manifest.groups[g];
    var group = ensureGroup(doc, groupSpec.name);
    for (var l = groupSpec.layers.length - 1; l >= 0; l--) {
      var spec = groupSpec.layers[l];
      var f = new File(root.fsName + '/' + spec.png);
      if (f.exists) addFullCanvasPng(doc, f, group, spec.name);
    }
  }

  var guide = ensureGroup(doc, '00_GUIDE');
  guide.visible = false;
  var saveFile = new File(root.fsName + '/Omega_Flowey_Live2D.psd');
  var opts = new PhotoshopSaveOptions();
  opts.layers = true;
  opts.embedColorProfile = true;
  opts.maximizeCompatibility = true;
  doc.saveAs(saveFile, opts, true, Extension.LOWERCASE);
  alert('PSDを保存しました:\n' + saveFile.fsName + '\n\n90_REPAIR_FILLは推定補完なので、Live2D投入前に必ず目視確認してください。');
})();
