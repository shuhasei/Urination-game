#!/usr/bin/env python3
"""Build self-contained high-quality Sans/Gaster GIF data for the web game.

The builder deliberately runs at repository build time, not in the player's
browser. It downloads the selected Tenor HD GIFs, preserves animation timing,
removes the black matte, crops stable transparent padding using one union box,
upscales pixel art 2x with nearest-neighbour, and writes a Base64 JavaScript
bundle. Runtime never needs Tenor when the generated bundle exists.
"""
from __future__ import annotations

import base64
import io
import json
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "generated-hq-media-v17.js"


@dataclass(frozen=True)
class Source:
    key: str
    url: str
    page: str


SOURCES = [
    Source(
        "sans",
        "https://media1.tenor.com/m/pJpj6NolUvkAAAAd/sans-sans-battle-sprite.gif",
        "https://tenor.com/view/sans-sans-battle-sprite-sans-wink-shrug-sans-shrug-gif-11860902420377064185",
    ),
    Source(
        "handUp",
        "https://media1.tenor.com/m/-tCE0vauXxcAAAAd/sans-undertale.gif",
        "https://tenor.com/view/sans-undertale-10th-anniversary-stream-10th-anniversary-stream-gif-18073091346254421783",
    ),
    Source(
        "gaster",
        "https://media1.tenor.com/m/habwWBWs7woAAAAd/gaster-blaster.gif",
        "https://tenor.com/view/gaster-blaster-gif-20422896",
    ),
]


def download(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; Urination-game-media-builder/1.0)",
            "Accept": "image/avif,image/webp,image/apng,image/gif,image/*,*/*;q=0.8",
            "Referer": "https://tenor.com/",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def black_to_alpha(frame: Image.Image) -> Image.Image:
    rgba = frame.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            maximum = max(r, g, b)
            # Tenor's black matte should disappear. Keep dim antialias pixels as
            # partial alpha so the high-quality downsample has a clean contour.
            if maximum <= 5:
                pixels[x, y] = (0, 0, 0, 0)
            elif maximum < 30:
                edge_alpha = round(255 * (maximum - 5) / 25)
                pixels[x, y] = (r, g, b, min(a, edge_alpha))
    return rgba


def decode_frames(data: bytes) -> tuple[list[Image.Image], list[int]]:
    image = Image.open(io.BytesIO(data))
    frames: list[Image.Image] = []
    durations: list[int] = []
    for index in range(getattr(image, "n_frames", 1)):
        image.seek(index)
        frames.append(black_to_alpha(image.copy()))
        durations.append(max(20, int(image.info.get("duration", 100))))
    return frames, durations


def union_bbox(frames: list[Image.Image]) -> tuple[int, int, int, int]:
    union = Image.new("L", frames[0].size, 0)
    for frame in frames:
        union = ImageChops.lighter(union, frame.getchannel("A"))
    bbox = union.getbbox() or (0, 0, frames[0].width, frames[0].height)
    # Stable padding keeps the sprite from jittering as its silhouette changes.
    pad = max(2, round(max(frames[0].size) * 0.015))
    return (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(frames[0].width, bbox[2] + pad),
        min(frames[0].height, bbox[3] + pad),
    )


def to_gif_palette(frame: Image.Image) -> Image.Image:
    """Quantize an RGBA frame while reserving palette index 255 for alpha."""
    alpha = frame.getchannel("A")
    # Composite against black before quantization.  Index 255 is then reserved
    # exclusively for transparency so a legitimate dark color is never erased.
    rgb = Image.new("RGB", frame.size, (0, 0, 0))
    rgb.paste(frame.convert("RGB"), mask=alpha)
    pal = rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)

    palette_data = pal.getpalette() or []
    palette_data = palette_data[: 255 * 3]
    palette_data += [0] * (255 * 3 - len(palette_data))
    palette_data += [0, 0, 0]  # palette index 255
    pal.putpalette(palette_data)

    transparent_mask = alpha.point(lambda value: 255 if value < 24 else 0)
    pal.paste(255, mask=transparent_mask)
    pal.info["transparency"] = 255
    pal.info["disposal"] = 2
    return pal


def encode_enhanced_gif(data: bytes) -> tuple[bytes, dict]:
    frames, durations = decode_frames(data)
    bbox = union_bbox(frames)
    enhanced: list[Image.Image] = []
    for frame in frames:
        cropped = frame.crop(bbox)
        # Preserve Undertale's pixel geometry at 2x. The browser then performs
        # the final high-quality downsample to the in-game 46px/43px targets.
        enhanced.append(
            cropped.resize(
                (cropped.width * 2, cropped.height * 2),
                Image.Resampling.NEAREST,
            )
        )

    encoded_frames = [to_gif_palette(frame) for frame in enhanced]
    output = io.BytesIO()
    encoded_frames[0].save(
        output,
        format="GIF",
        save_all=True,
        append_images=encoded_frames[1:],
        loop=0,
        duration=durations,
        transparency=255,
        disposal=2,
        optimize=False,
    )
    result = output.getvalue()
    meta = {
        "width": enhanced[0].width,
        "height": enhanced[0].height,
        "frames": len(enhanced),
        "durations": durations,
        "crop": list(bbox),
    }
    return result, meta


def main() -> int:
    payload = {}
    for source in SOURCES:
        print(f"Downloading {source.key}: {source.url}")
        original = download(source.url)
        enhanced, meta = encode_enhanced_gif(original)
        payload[source.key] = {
            **meta,
            "page": source.page,
            "sourceUrl": source.url,
            "data": "data:image/gif;base64," + base64.b64encode(enhanced).decode("ascii"),
        }
        print(
            f"  {source.key}: {meta['frames']} frames, "
            f"{meta['width']}x{meta['height']}, {len(enhanced):,} bytes"
        )

    js = (
        "(() => {\n"
        "  'use strict';\n"
        "  // AUTO-GENERATED by tools/build_hq_sans_media.py.\n"
        "  // Full animated GIFs are embedded so runtime has no Tenor dependency.\n"
        "  window.GENERATED_HQ_MEDIA_V17 = Object.freeze("
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ");\n"
        "})();\n"
    )
    OUTPUT.write_text(js, encoding="utf-8")
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
