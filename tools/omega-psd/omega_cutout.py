#!/usr/bin/env python3
"""Build a Live2D-friendly Omega Flowey cutout package from a flattened image.

This is intentionally a *first-pass* separator for the supplied 270x203 reference.
It exports named RGBA layers, repair/backfill plates, an overlay guide, a manifest,
and (when psd-tools is installed) a layered PSD.

The geometry is normalized, so the same masks scale with a higher-resolution source
that has the same composition/aspect ratio.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

import cv2
import numpy as np
from PIL import Image, ImageDraw

try:
    from psd_tools import PSDImage
except Exception:  # optional until --psd is requested
    PSDImage = None


REF_W, REF_H = 270, 203


@dataclass(frozen=True)
class Part:
    group: str
    name: str
    kind: str
    points: tuple[tuple[float, float], ...] = ()
    ellipse: tuple[float, float, float, float] | None = None
    note: str = ""
    repair: str = ""
    motion: str = ""


def P(x: float, y: float) -> tuple[float, float]:
    return (x / REF_W, y / REF_H)


def E(x0: float, y0: float, x1: float, y1: float):
    return (x0 / REF_W, y0 / REF_H, x1 / REF_W, y1 / REF_H)


# Hand-authored semantic envelopes based on the supplied reference image.
# These are deliberately slightly generous to preserve overlap for Live2D deformation.
PARTS: tuple[Part, ...] = (
    Part("01_HEAD_TV", "tv_frame_main", "poly", (P(96, 0), P(174, 0), P(176, 50), P(93, 50)), "black/metal TV shell; excludes white screen", "extend lower/back rim", "micro sway"),
    Part("01_HEAD_TV", "tv_screen_base", "poly", (P(108, 7), P(163, 7), P(164, 42), P(106, 42)), "white CRT screen base", "none", "flicker/scale"),
    Part("01_HEAD_TV", "tv_face_eye_L", "ellipse", ellipse=E(116, 15, 131, 29), note="left TV-face eye", repair="fill with CRT static", motion="independent gaze"),
    Part("01_HEAD_TV", "tv_face_eye_R", "ellipse", ellipse=E(137, 15, 152, 29), note="right TV-face eye", repair="fill with CRT static", motion="independent gaze"),
    Part("01_HEAD_TV", "tv_face_mouth", "poly", (P(117, 27), P(153, 27), P(151, 39), P(120, 39)), "TV-face mouth", "fill with CRT static", "warp/open-close"),
    Part("01_HEAD_TV", "flesh_face_main", "poly", (P(102, 47), P(168, 46), P(177, 72), P(165, 98), P(148, 151), P(122, 151), P(107, 99), P(94, 71)), "pink organic face below TV", "continue pink flesh/tubes behind", "pulse/writhe"),
    Part("01_HEAD_TV", "flesh_face_teeth", "poly", (P(130, 93), P(142, 93), P(143, 153), P(129, 153)), "visible central teeth", "dark inner mouth", "mouth action"),
    Part("02_GIANT_EYES", "eye_L_outer_flesh", "ellipse", ellipse=E(50, 37, 113, 76), note="left giant eye plus outer folds", repair="dark organic flesh/pipes", motion="slow whole-eye drift"),
    Part("02_GIANT_EYES", "eye_L_eyeball", "ellipse", ellipse=E(67, 45, 99, 66), note="left eyeball", repair="none", motion="XY gaze"),
    Part("02_GIANT_EYES", "eye_L_pupil", "ellipse", ellipse=E(79, 50, 90, 61), note="left pupil", repair="none", motion="gaze/constrict"),
    Part("02_GIANT_EYES", "eye_R_outer_flesh", "ellipse", ellipse=E(157, 37, 220, 76), note="right giant eye plus outer folds", repair="dark organic flesh/pipes", motion="slow whole-eye drift"),
    Part("02_GIANT_EYES", "eye_R_eyeball", "ellipse", ellipse=E(171, 45, 203, 66), note="right eyeball", repair="none", motion="XY gaze"),
    Part("02_GIANT_EYES", "eye_R_pupil", "ellipse", ellipse=E(183, 50, 194, 61), note="right pupil", repair="none", motion="gaze/constrict"),
    Part("03_STEM_RIBS", "stem_top", "poly", (P(126, 71), P(144, 71), P(146, 104), P(123, 104)), "stem top envelope", "rounded overlap-friendly joint", "upper writhe"),
    Part("03_STEM_RIBS", "stem_mid", "poly", (P(124, 96), P(146, 96), P(146, 132), P(123, 132)), "stem middle envelope", "rounded overlap-friendly joint", "main sway"),
    Part("03_STEM_RIBS", "stem_bottom", "poly", (P(124, 124), P(146, 124), P(145, 165), P(124, 165)), "stem bottom envelope", "rounded overlap-friendly joint", "lower writhe"),
    Part("03_STEM_RIBS", "rib_L_01", "poly", (P(118, 92), P(131, 92), P(131, 101), P(116, 104))),
    Part("03_STEM_RIBS", "rib_L_02", "poly", (P(116, 104), P(131, 103), P(131, 113), P(113, 116))),
    Part("03_STEM_RIBS", "rib_L_03", "poly", (P(114, 116), P(131, 115), P(131, 125), P(111, 128))),
    Part("03_STEM_RIBS", "rib_L_04", "poly", (P(112, 128), P(131, 127), P(131, 137), P(109, 140))),
    Part("03_STEM_RIBS", "rib_R_01", "poly", (P(139, 92), P(152, 92), P(154, 104), P(139, 101))),
    Part("03_STEM_RIBS", "rib_R_02", "poly", (P(139, 103), P(154, 104), P(157, 116), P(139, 113))),
    Part("03_STEM_RIBS", "rib_R_03", "poly", (P(139, 115), P(157, 116), P(160, 128), P(139, 125))),
    Part("03_STEM_RIBS", "rib_R_04", "poly", (P(139, 127), P(160, 128), P(162, 140), P(139, 137))),
    Part("04_BACK_PIPES", "pipe_L_01", "poly", (P(0, 0), P(54, 0), P(101, 45), P(85, 61), P(42, 34), P(0, 37)), "major left rear hose", "extend behind foreground", "small slow wave"),
    Part("04_BACK_PIPES", "pipe_L_02", "poly", (P(20, 0), P(87, 0), P(119, 43), P(102, 55), P(65, 27)), "secondary left rear hose", "extend behind foreground", "small slow wave"),
    Part("04_BACK_PIPES", "pipe_R_01", "poly", (P(216, 0), P(270, 0), P(270, 37), P(228, 34), P(185, 61), P(169, 45)), "major right rear hose", "extend behind foreground", "small slow wave"),
    Part("04_BACK_PIPES", "pipe_R_02", "poly", (P(183, 0), P(250, 0), P(205, 27), P(168, 55), P(151, 43)), "secondary right rear hose", "extend behind foreground", "small slow wave"),
    Part("04_BACK_PIPES", "vein_red_01", "poly", (P(0, 62), P(67, 61), P(90, 75), P(65, 79), P(0, 76)), "prominent left red tube/vein", "extend if cut", "subtle wriggle"),
    Part("04_BACK_PIPES", "vein_red_02", "poly", (P(203, 61), P(270, 62), P(270, 76), P(205, 79), P(180, 75)), "prominent right red tube/vein", "extend if cut", "subtle wriggle"),
    Part("05_ARMS_LEGS", "arm_L_shoulder", "poly", (P(0, 58), P(56, 58), P(93, 90), P(74, 105), P(32, 88), P(0, 86)), "left upper green limb", "rounded rear joint", "large slow shoulder motion"),
    Part("05_ARMS_LEGS", "arm_L_elbow", "poly", (P(31, 86), P(81, 84), P(85, 126), P(62, 144), P(34, 126)), "left middle limb", "round both cut faces", "delayed follow"),
    Part("05_ARMS_LEGS", "arm_L_wrist", "poly", (P(33, 124), P(73, 132), P(65, 179), P(42, 199), P(23, 181)), "left distal limb", "rear wrist fill", "fine irregular motion"),
    Part("05_ARMS_LEGS", "arm_R_shoulder", "poly", (P(214, 58), P(270, 58), P(270, 86), P(238, 88), P(196, 105), P(177, 90)), "right upper green limb", "rounded rear joint", "large slow shoulder motion"),
    Part("05_ARMS_LEGS", "arm_R_elbow", "poly", (P(189, 84), P(239, 86), P(236, 126), P(208, 144), P(185, 126)), "right middle limb", "round both cut faces", "delayed follow"),
    Part("05_ARMS_LEGS", "arm_R_wrist", "poly", (P(197, 132), P(237, 124), P(247, 181), P(228, 199), P(205, 179)), "right distal limb", "rear wrist fill", "fine irregular motion"),
    Part("05_ARMS_LEGS", "leg_L_main", "poly", (P(16, 108), P(70, 112), P(71, 183), P(45, 203), P(16, 196), P(0, 167)), "left thorny vine/leg", "matte black behind", "slow bend"),
    Part("05_ARMS_LEGS", "leg_R_main", "poly", (P(200, 112), P(254, 108), P(270, 167), P(254, 196), P(225, 203), P(199, 183)), "right thorny vine/leg", "matte black behind", "slow bend"),
)

GROUP_ORDER = ["01_HEAD_TV", "02_GIANT_EYES", "03_STEM_RIBS", "04_BACK_PIPES", "05_ARMS_LEGS", "06_BACKGROUND", "90_REPAIR_FILL", "99_SOURCE_LOCKED"]


def scaled_poly(points: Iterable[tuple[float, float]], w: int, h: int) -> np.ndarray:
    return np.array([[(round(x*w), round(y*h)) for x, y in points]], dtype=np.int32)


def raw_mask(part: Part, w: int, h: int) -> np.ndarray:
    mask = np.zeros((h, w), np.uint8)
    if part.kind == "poly":
        cv2.fillPoly(mask, scaled_poly(part.points, w, h), 255)
    elif part.kind == "ellipse" and part.ellipse:
        x0, y0, x1, y1 = part.ellipse
        cx, cy = round((x0+x1)*w/2), round((y0+y1)*h/2)
        ax, ay = max(1, round((x1-x0)*w/2)), max(1, round((y1-y0)*h/2))
        cv2.ellipse(mask, (cx, cy), (ax, ay), 0, 0, 360, 255, -1)
    else:
        raise ValueError(part)
    return mask


def semantic_refine(img: np.ndarray, part: Part, mask: np.ndarray) -> np.ndarray:
    rgb = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR) if img.shape[2] == 4 else img[:, :, :3]
    hsv = cv2.cvtColor(rgb, cv2.COLOR_BGR2HSV)
    b, g, r = cv2.split(rgb)
    sat, val = hsv[:, :, 1], hsv[:, :, 2]
    keep = np.ones(mask.shape, np.uint8) * 255
    n = part.name
    if n.startswith("tv_screen"):
        keep = ((val > 110) & (sat < 110)).astype(np.uint8) * 255
    elif n.startswith("tv_face_eye") or n == "tv_face_mouth":
        keep = ((val < 150) | (sat > 80)).astype(np.uint8) * 255
    elif n.startswith("flesh_face"):
        keep = ((r.astype(int) > g.astype(int) + 8) & (r > 60)).astype(np.uint8) * 255
        if n.endswith("teeth"):
            keep = ((val > 120) & (sat < 85)).astype(np.uint8) * 255
    elif n.startswith("eye_"):
        if n.endswith("pupil"):
            keep = (val < 115).astype(np.uint8) * 255
        elif n.endswith("eyeball"):
            keep = ((val > 70) & (sat < 150)).astype(np.uint8) * 255
    elif n.startswith("rib_"):
        keep = ((val > 105) & (sat < 95)).astype(np.uint8) * 255
    elif n.startswith("arm_") or n.startswith("leg_"):
        keep = ((g.astype(int) > r.astype(int) + 4) & (g.astype(int) > b.astype(int) + 4)).astype(np.uint8) * 255
    elif n.startswith("vein_red"):
        keep = ((r.astype(int) > g.astype(int) * 1.18) & (r > 45)).astype(np.uint8) * 255
    elif n.startswith("pipe_") or n == "tv_frame_main":
        keep = ((sat < 120) & (val < 180)).astype(np.uint8) * 255
    out = cv2.bitwise_and(mask, keep)
    k = max(1, round(min(mask.shape) / 203))
    out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, np.ones((2*k+1, 2*k+1), np.uint8))
    return cv2.dilate(out, np.ones((k+1, k+1), np.uint8), iterations=1)


def rgba_layer(src_rgba: np.ndarray, mask: np.ndarray) -> Image.Image:
    arr = src_rgba.copy()
    alpha = arr[:, :, 3] if arr.shape[2] == 4 else np.full(mask.shape, 255, np.uint8)
    arr[:, :, 3] = cv2.bitwise_and(alpha, mask)
    return Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGRA2RGBA))


def repair_plate(src_bgra: np.ndarray, mask: np.ndarray, black: bool = False) -> Image.Image:
    bgr = src_bgra[:, :, :3].copy()
    if black:
        bgr[mask > 0] = 0
    else:
        radius = max(2, round(min(mask.shape) * 0.018))
        bgr = cv2.inpaint(bgr, mask, radius, cv2.INPAINT_TELEA)
    alpha = src_bgra[:, :, 3:4] if src_bgra.shape[2] == 4 else np.full((*mask.shape, 1), 255, np.uint8)
    return Image.fromarray(cv2.cvtColor(np.concatenate([bgr, alpha], axis=2), cv2.COLOR_BGRA2RGBA))


def make_guide(src: Image.Image, masks: dict[str, np.ndarray], out: Path) -> None:
    guide = src.convert("RGBA").copy()
    draw = ImageDraw.Draw(guide, "RGBA")
    palette = [(255,70,70,90),(70,190,255,90),(170,80,255,90),(80,255,120,90),(255,210,70,90)]
    for part in PARTS:
        m = masks[part.name]
        ys, xs = np.where(m > 0)
        if len(xs) == 0:
            continue
        x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
        c = palette[GROUP_ORDER.index(part.group) % len(palette)]
        tint = Image.new("RGBA", guide.size, c)
        tint.putalpha(Image.fromarray((m.astype(np.float32) * (c[3] / 255.0)).astype(np.uint8)))
        guide.alpha_composite(tint)
        draw.rectangle((x0, y0, x1, y1), outline=(*c[:3], 220), width=max(1, src.width//270))
        draw.text((x0+1, y0+1), part.name, fill=(255,255,255,240), stroke_width=1, stroke_fill=(0,0,0,220))
    guide.save(out)


def export_psd(canvas_size: tuple[int, int], groups: dict[str, list[tuple[str, Image.Image]]], out: Path) -> None:
    if PSDImage is None:
        raise RuntimeError("psd-tools is required for --psd. Install: pip install psd-tools")
    psd = PSDImage.new(mode="RGBA", size=canvas_size)
    for group_name in GROUP_ORDER:
        entries = groups.get(group_name, [])
        if not entries:
            continue
        group = psd.create_group(name=group_name)
        for name, pil in entries:
            group.create_pixel_layer(pil, name=name)
    psd.save(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("input", type=Path, help="flattened Omega Flowey PNG/JPG")
    ap.add_argument("--out", type=Path, default=Path("build/omega-psd"))
    ap.add_argument("--psd", action="store_true", help="also write omega_flowey_live2d.psd (requires psd-tools)")
    ap.add_argument("--no-refine", action="store_true", help="use geometry masks without color refinement")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    src_pil = Image.open(args.input).convert("RGBA")
    src = cv2.cvtColor(np.array(src_pil), cv2.COLOR_RGBA2BGRA)
    h, w = src.shape[:2]
    layers_dir, repair_dir, masks_dir = args.out / "layers", args.out / "repair", args.out / "masks"
    for d in (layers_dir, repair_dir, masks_dir): d.mkdir(parents=True, exist_ok=True)
    groups: dict[str, list[tuple[str, Image.Image]]] = {g: [] for g in GROUP_ORDER}
    masks: dict[str, np.ndarray] = {}
    manifest = {"source": str(args.input), "size": [w, h], "reference_size": [REF_W, REF_H], "warning": "Automatic masks are a first pass. Refine edges and AI/paint hidden surfaces before production rigging.", "parts": []}
    for part in PARTS:
        m = raw_mask(part, w, h)
        if not args.no_refine:
            refined = semantic_refine(src, part, m)
            if cv2.countNonZero(refined) >= max(8, int(cv2.countNonZero(m) * 0.035)):
                m = refined
        masks[part.name] = m
        Image.fromarray(m).save(masks_dir / f"{part.name}.png")
        layer = rgba_layer(src, m)
        group_dir = layers_dir / part.group
        group_dir.mkdir(parents=True, exist_ok=True)
        layer.save(group_dir / f"{part.name}.png")
        groups[part.group].append((part.name, layer))
        manifest["parts"].append({**asdict(part), "coverage_pixels": int(cv2.countNonZero(m))})
    repair_specs = {
        "repair_tv_back": ["tv_frame_main"], "repair_flesh_back": ["flesh_face_main"],
        "repair_eye_L_back": ["eye_L_outer_flesh"], "repair_eye_R_back": ["eye_R_outer_flesh"],
        "repair_ribs_removed_stem": [p.name for p in PARTS if p.name.startswith("rib_")],
        "repair_arm_L_joints": [p.name for p in PARTS if p.name.startswith("arm_L_")],
        "repair_arm_R_joints": [p.name for p in PARTS if p.name.startswith("arm_R_")],
        "repair_legs_black": ["leg_L_main", "leg_R_main"],
        "repair_pipes": [p.name for p in PARTS if p.name.startswith("pipe_")],
    }
    for repair_name, part_names in repair_specs.items():
        union = np.zeros((h, w), np.uint8)
        for n in part_names: union = cv2.bitwise_or(union, masks[n])
        plate = repair_plate(src, union, black=(repair_name == "repair_legs_black"))
        plate.save(repair_dir / f"{repair_name}.png")
        groups["90_REPAIR_FILL"].append((repair_name, plate))
    bg = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    bg.save(layers_dir / "06_BACKGROUND_rear_dark_base.png")
    groups["06_BACKGROUND"].append(("rear_dark_base", bg))
    groups["99_SOURCE_LOCKED"].append(("SOURCE_REFERENCE_DO_NOT_PAINT", src_pil))
    src_pil.save(args.out / "SOURCE_REFERENCE_DO_NOT_PAINT.png")
    make_guide(src_pil, masks, args.out / "cutout_guide_overlay.png")
    (args.out / "layer_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.psd:
        export_psd((w, h), groups, args.out / "omega_flowey_live2d.psd")
    print(f"Wrote {len(PARTS)} semantic layers to {args.out}")
    if not args.psd:
        print("PSD not requested. Re-run with --psd after installing psd-tools.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
