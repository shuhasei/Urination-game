#!/usr/bin/env python3
"""Omega Flowey PSD cutout helper.

This tool intentionally separates *mask authoring* from *layer assembly*.
It can create rough bootstrap masks from layer_spec.json, export full-canvas
RGBA layer PNGs, generate repair/inpaint drafts, and write a manifest for the
Photoshop JSX builder. It does not claim guessed hidden anatomy as source truth.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
DEFAULT_SPEC = HERE / "layer_spec.json"


def load_spec(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def all_layers(spec: dict[str, Any]):
    for group in spec["groups"]:
        for layer in group["layers"]:
            yield group["name"], layer


def px(v: float, extent: int) -> int:
    return int(round(v * extent))


def seed_mask(size: tuple[int, int], seed: dict[str, Any] | None) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    if not seed:
        return mask
    draw = ImageDraw.Draw(mask)
    typ = seed.get("type")
    if typ == "full":
        draw.rectangle([0, 0, w, h], fill=255)
    elif typ == "rect":
        x, y, rw, rh = seed["xywh"]
        draw.rectangle([px(x,w), px(y,h), px(x+rw,w), px(y+rh,h)], fill=255)
    elif typ == "ellipse":
        cx, cy, rw, rh = seed["cxcywh"]
        draw.ellipse([px(cx-rw/2,w), px(cy-rh/2,h), px(cx+rw/2,w), px(cy+rh/2,h)], fill=255)
    elif typ == "polygon":
        pts = [(px(x,w), px(y,h)) for x,y in seed["points"]]
        draw.polygon(pts, fill=255)
    elif typ == "polyline":
        pts = [(px(x,w), px(y,h)) for x,y in seed["points"]]
        width = max(1, int(round(float(seed.get("width", 0.01)) * min(w,h))))
        draw.line(pts, fill=255, width=width, joint="curve")
    else:
        raise ValueError(f"Unknown seed type: {typ}")
    return mask


def bootstrap(source: Path, workspace: Path, spec: dict[str, Any], overwrite: bool) -> None:
    image = Image.open(source).convert("RGBA")
    masks = workspace / "masks"
    previews = workspace / "mask_previews"
    masks.mkdir(parents=True, exist_ok=True)
    previews.mkdir(parents=True, exist_ok=True)
    base = image.convert("RGB")
    for group_name, layer in all_layers(spec):
        dst = masks / f"{layer['name']}.png"
        if dst.exists() and not overwrite:
            continue
        mask = seed_mask(image.size, layer.get("seed"))
        mask.save(dst)
        overlay = base.copy()
        tint = Image.new("RGB", image.size, (255, 0, 100))
        alpha = mask.point(lambda v: int(v * 0.38))
        overlay.paste(tint, (0, 0), alpha)
        d = ImageDraw.Draw(overlay)
        d.rectangle([0,0,min(image.width-1,500),24], fill=(0,0,0))
        d.text((6,6), f"{group_name}/{layer['name']} - rough seed, refine before final", fill=(255,255,255))
        overlay.save(previews / f"{layer['name']}.jpg", quality=88)
    (workspace / "source.png").write_bytes(source.read_bytes())
    print(f"Bootstrap masks: {masks}")
    print("Important: seed masks are intentionally rough. Refine them before final PSD export.")


def clean_mask(mask: Image.Image, close_px: int = 1, feather_px: float = 0.0) -> Image.Image:
    arr = np.array(mask.convert("L"))
    if close_px > 0:
        k = close_px * 2 + 1
        kernel = np.ones((k, k), np.uint8)
        arr = cv2.morphologyEx(arr, cv2.MORPH_CLOSE, kernel)
    result = Image.fromarray(arr, "L")
    if feather_px > 0:
        result = result.filter(ImageFilter.GaussianBlur(feather_px))
    return result


def rgba_cutout(source: Image.Image, mask: Image.Image) -> Image.Image:
    out = source.copy().convert("RGBA")
    alpha = np.minimum(np.array(out.getchannel("A")), np.array(mask.convert("L"))).astype(np.uint8)
    out.putalpha(Image.fromarray(alpha, "L"))
    return out


def inpaint_draft(source_rgb: Image.Image, mask: Image.Image, radius: int = 4) -> Image.Image:
    src = cv2.cvtColor(np.array(source_rgb.convert("RGB")), cv2.COLOR_RGB2BGR)
    m = np.array(mask.convert("L"))
    m = np.where(m > 16, 255, 0).astype(np.uint8)
    if m.max() == 0:
        return source_rgb.convert("RGB")
    repaired = cv2.inpaint(src, m, radius, cv2.INPAINT_TELEA)
    return Image.fromarray(cv2.cvtColor(repaired, cv2.COLOR_BGR2RGB))


def build(source: Path, workspace: Path, spec: dict[str, Any], close_px: int, feather_px: float) -> None:
    source_img = Image.open(source).convert("RGBA")
    source_rgb = source_img.convert("RGB")
    masks_dir = workspace / "masks"
    layers_dir = workspace / "layers"
    repair_dir = workspace / "repair"
    repair_masks_dir = workspace / "repair_masks"
    layers_dir.mkdir(parents=True, exist_ok=True)
    repair_dir.mkdir(parents=True, exist_ok=True)
    repair_masks_dir.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, Any] = {
        "version": spec.get("version"),
        "width": source_img.width,
        "height": source_img.height,
        "source": "source.png",
        "groups": [],
        "warnings": [],
    }
    prompt_lines = []
    composite = Image.new("RGBA", source_img.size, (0, 0, 0, 0))

    for group in spec["groups"]:
        out_group = {"name": group["name"], "layers": []}
        for layer in group["layers"]:
            name = layer["name"]
            mask_path = masks_dir / f"{name}.png"
            if not mask_path.exists():
                manifest["warnings"].append(f"missing mask: {name}")
                mask = Image.new("L", source_img.size, 0)
            else:
                mask = Image.open(mask_path).convert("L")
                if mask.size != source_img.size:
                    raise ValueError(f"Mask size mismatch for {name}: {mask.size} != {source_img.size}")
            mask = clean_mask(mask, close_px=close_px, feather_px=feather_px)
            mask.save(mask_path)
            layer_img = rgba_cutout(source_img, mask)
            layer_path = layers_dir / f"{name}.png"
            layer_img.save(layer_path)
            if name != "rear_dark_base":
                composite.alpha_composite(layer_img)

            repair_kind = layer.get("repair", "none")
            repair_path = None
            if repair_kind != "none" and np.array(mask).max() > 0:
                repair_mask_path = repair_masks_dir / f"{name}__hole.png"
                mask.save(repair_mask_path)
                prompt = spec.get("repair_prompts", {}).get(repair_kind, "")
                if prompt:
                    prompt_lines.append(f"[{name}] {prompt}")
                if repair_kind == "black":
                    repaired = source_rgb.copy()
                    black = Image.new("RGB", source_img.size, (0, 0, 0))
                    repaired.paste(black, (0, 0), mask)
                else:
                    repaired = inpaint_draft(source_rgb, mask, radius=max(2, close_px + 3))
                repair_path_obj = repair_dir / f"repair__{name}.png"
                repaired.save(repair_path_obj)
                repair_path = str(repair_path_obj.relative_to(workspace)).replace('\\','/')

            source_status = layer.get("source_status", "visible_or_seeded")
            if source_status in {"not_clearly_visible", "ambiguous_with_vine_limb", "partial"}:
                manifest["warnings"].append(f"{name}: source_status={source_status}; do not treat bootstrap as final anatomy")
            out_group["layers"].append({
                "name": name,
                "png": str(layer_path.relative_to(workspace)).replace('\\','/'),
                "repair": repair_kind,
                "repair_png": repair_path,
                "motion": layer.get("motion", ""),
                "source_status": source_status,
            })
        manifest["groups"].append(out_group)

    (workspace / "source.png").write_bytes(source.read_bytes())
    (workspace / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (workspace / "repair_prompts.txt").write_text("\n".join(prompt_lines) + "\n", encoding="utf-8")
    composite.save(workspace / "preview_layers.png")
    print(f"Built {sum(len(g['layers']) for g in manifest['groups'])} layer PNGs")
    print(f"Manifest: {workspace / 'manifest.json'}")
    if manifest["warnings"]:
        print(f"Warnings: {len(manifest['warnings'])} (see manifest.json)")


def validate(workspace: Path, spec: dict[str, Any]) -> int:
    masks_dir = workspace / "masks"
    missing, empty = [], []
    for _, layer in all_layers(spec):
        p = masks_dir / f"{layer['name']}.png"
        if not p.exists():
            missing.append(layer['name']); continue
        arr = np.array(Image.open(p).convert("L"))
        if arr.max() == 0:
            empty.append(layer['name'])
    print(f"missing masks: {len(missing)}")
    if missing: print("  " + "\n  ".join(missing))
    print(f"empty masks: {len(empty)}")
    if empty: print("  " + "\n  ".join(empty))
    return 1 if missing else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Prepare Omega Flowey Live2D/PSD layer assets")
    ap.add_argument("command", choices=["bootstrap", "build", "validate"])
    ap.add_argument("source", nargs="?", type=Path, help="source image for bootstrap/build")
    ap.add_argument("--workspace", type=Path, required=True)
    ap.add_argument("--spec", type=Path, default=DEFAULT_SPEC)
    ap.add_argument("--overwrite", action="store_true", help="overwrite bootstrap masks")
    ap.add_argument("--close", type=int, default=1, help="morphological close radius in pixels")
    ap.add_argument("--feather", type=float, default=0.0, help="mask feather radius; keep 0 for pixel-art source")
    args = ap.parse_args()
    spec = load_spec(args.spec)
    args.workspace.mkdir(parents=True, exist_ok=True)
    if args.command in {"bootstrap", "build"} and not args.source:
        ap.error("source image is required for bootstrap/build")
    if args.command == "bootstrap":
        bootstrap(args.source, args.workspace, spec, args.overwrite)
    elif args.command == "build":
        build(args.source, args.workspace, spec, args.close, args.feather)
    else:
        return validate(args.workspace, spec)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
