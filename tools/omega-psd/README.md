# Omega Flowey Live2D / PSD cutout pipeline

このフォルダは、1枚絵のオメガ・フラウィを **意味のある部位単位** に分離し、Live2Dへ持ち込みやすいPSDを組み立てるための補助ツールです。

## 動画を見て決めた動きの基準

提供された戦闘動画の複数時刻を比較すると、ボス本体の輪郭は大きく振り回されるよりも比較的安定しており、目・肉塊・腕は小さい有機的な揺れが中心です。一方、テレビ画面は顔表示・暗転・砂嵐/ノイズなどの切り替えが強く、攻撃エフェクトは本体とは別に大きく動きます。

そのためPSDは細かく分けますが、Live2Dの初期パラメータは「TV/画面内顔 > 巨大目 > 肉塊 > 茎/肋骨 > 腕/脚 > 背面パイプ」の順で振幅を小さくする前提です。細かく分ける目的は、大きく動かすためではなく、必要な箇所だけ独立して不気味にずらせるようにすることです。

## 重要: 元画像と指示書の差

現在の元画像では、中央の「緑色の茎+白い肋骨」や、人間らしい左右の手は明瞭な独立部位として確認できません。`layer_spec.json` では指定どおりレイヤー名を用意していますが、これらは `source_status` を付けて **空/要手修正** としています。見えない部分を元画像由来と偽らないためです。AI補完する場合も `90_REPAIR_FILL` に隔離して、元絵レイヤーと混ぜません。

## レイヤー構成

- `01_HEAD_TV`: TV外枠、画面、発光、画面内左右目、口、ノイズ、ピンク肉塊、歯、口奥
- `02_GIANT_EYES`: 左右それぞれ 外周肉 / 眼球 / 瞳孔
- `03_STEM_RIBS`: 茎 上/中/下、左右の肋骨4本ずつ
- `04_BACK_PIPES`: 左右太パイプ3本ずつ、赤い細管4本、最背面
- `05_ARMS_LEGS`: 左右の肩/肘/手首/手、左右ツタ脚/爪
- `90_REPAIR_FILL`: 推定補完のドラフトだけを置く
- `99_SOURCE_LOCKED`: 元画像をロック保存

## 1. 動画の参照フレームを作る

`ffmpeg` がある環境なら、動画を一定間隔で切り出して比較できます。

```bash
python tools/omega-psd/make_reference_frames.py "reference.mp4" --out work/omega-reference
```

`contact_sheet.jpg` を見て、動かし過ぎになっていないか確認します。

## 2. 粗いマスクを作る

```bash
python -m pip install -r tools/omega-psd/requirements.txt
python tools/omega-psd/omega_cutout.py bootstrap source.png --workspace work/omega
```

`work/omega/masks/*.png` に粗い白黒マスクができます。これは **最終切り抜きではありません**。

## 3. マスクを部位として修正する

方法A: Photoshop/Kritaで各 `masks/*.png` を編集。白=パーツ、黒=非パーツです。

方法B: このフォルダで簡易サーバーを起動して `mask_editor.html` を使います。

```bash
python -m http.server 8000 -d tools/omega-psd
```

ブラウザで `http://localhost:8000/mask_editor.html` を開き、Sourceと対象maskを読み込み、輪郭を修正して同じレイヤー名で保存します。

### 切り抜き順

前景から奥へ進めます。

1. 肋骨を1本ずつ
2. 下部ツタ脚
3. TV下の肉塊
4. TV外枠
5. TV画面
6. TV内の左右目・口・ノイズ
7. 左右巨大目
8. 茎を上/中/下
9. 左腕 肩/肘/手首/手
10. 右腕 肩/肘/手首/手
11. 背面の太いパイプ
12. 赤い細管
13. 最背面

前景を抜くたびに、その後ろの「穴」を補完してから奥のパーツへ進むのがポイントです。

## 4. レイヤーPNGと補完ドラフトを作る

```bash
python tools/omega-psd/omega_cutout.py validate --workspace work/omega
python tools/omega-psd/omega_cutout.py build source.png --workspace work/omega
```

出力:

- `layers/*.png`: フルキャンバスRGBAの切り抜き
- `repair_masks/*__hole.png`: 補完対象マスク
- `repair/repair__*.png`: OpenCV inpaintによる**ドラフト**
- `repair_prompts.txt`: Generative Fill等へ渡す補完文
- `manifest.json`: PSD組み立て用
- `preview_layers.png`: 切り抜き確認用

有機物や機械パイプの裏側は、OpenCV inpaintだけでは不自然になりやすいため、最終版は `repair_masks` + `repair_prompts.txt` を使ってAI補完または手描き修正してください。

## 5. PSDを自動組み立てする

Photoshopで:

1. `ファイル > スクリプト > 参照...`
2. `tools/omega-psd/photoshop_build_psd.jsx` を選択
3. `work/omega` フォルダを選択
4. `Omega_Flowey_Live2D.psd` が同フォルダへ保存される

`90_REPAIR_FILL` は推定補完、`99_SOURCE_LOCKED` は元画像です。Live2Dへ入れる前に、各パーツを単独表示して「輪郭・切断面・重なり余白・空洞」がないか目視確認してください。

## Live2Dの初期可動量

- TV外枠: 微揺れ。画面は位置微振動+明滅。
- TV内の目/口/ノイズ: 最も自由度を高くする。
- 巨大目: 外周肉は遅く脈動、眼球/瞳孔は独立視線。
- 肉塊: 低振幅の呼吸・脈動。
- 茎: `stem_mid` を中心に位相差で左右にくねる。ただし動画基準では振幅は控えめ。
- 肋骨: 1本ずつ位相をずらす微振動。
- 腕/脚: 肩/付け根を最大、末端ほど遅れて追従。ただしシルエットが崩れるほど振らない。
- 背面パイプ: 前景よりさらに小さい振幅でゆっくり波打たせる。
