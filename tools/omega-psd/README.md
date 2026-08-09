# Omega Flowey PSD / Live2D cutout helper

This tool turns the supplied flattened Omega Flowey reference into a **first-pass semantic layer package** for Live2D. It follows the separation plan in `Omega_Flowey_PSD_Cutout_Guide`: foreground first, then repair hidden surfaces, then continue toward the back.

## What it exports

- `layers/<group>/<part>.png` — transparent semantic cutouts
- `masks/<part>.png` — editable mask images
- `repair/*.png` — temporary hidden-surface/backfill plates
- `cutout_guide_overlay.png` — labeled visual check
- `layer_manifest.json` — layer names, purpose, repair notes, motion notes
- `omega_flowey_live2d.psd` — optional layered PSD (`--psd`)

The masks are normalized to the supplied 270×203 composition, so a higher-resolution remake with the same framing can be substituted later.

## Install

```bash
python -m pip install -r tools/omega-psd/requirements.txt
```

## Run

```bash
python tools/omega-psd/omega_cutout.py path/to/omega-flowey.png --out build/omega-flowey --psd
```

If you only want PNG layers/masks first, omit `--psd`.

## Important production note

Automatic masking is **not** treated as the final artwork. The source is very small and several parts overlap. After generation:

1. Open `cutout_guide_overlay.png` and correct masks where the semantic boundary is wrong.
2. Keep a few pixels of overlap around moving joints so Live2D deformation does not expose gaps.
3. Replace the local OpenCV repair plates with generative/painted fills for hidden surfaces: TV underside, pink flesh backside, eye sockets, stem after ribs are removed, arm joints, and hidden pipe continuations.
4. Keep `SOURCE_REFERENCE_DO_NOT_PAINT` unchanged as the alignment reference.
5. In Photoshop/Krita/Photopea, verify every part in solo view at 200–400% zoom before rigging.

## Layer groups

- `01_HEAD_TV`
- `02_GIANT_EYES`
- `03_STEM_RIBS`
- `04_BACK_PIPES`
- `05_ARMS_LEGS`
- `06_BACKGROUND`
- `90_REPAIR_FILL`
- `99_SOURCE_LOCKED`

The current envelopes deliberately leave overlap for deformation. For the supplied gameplay reference, keep motion amplitudes small: most of the body should drift/pulse subtly while the CRT face/glitch layer supplies the strongest visible change.
