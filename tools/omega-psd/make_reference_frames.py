#!/usr/bin/env python3
"""Extract gameplay reference frames/contact sheet with ffmpeg.

The body is sampled at spaced timestamps so motion can be compared without
copying the source video into the repository.
"""
from __future__ import annotations
import argparse
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--times", default="15,60,120,180,240,300,360,420,480,540")
    ap.add_argument("--width", type=int, default=480)
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    times = [float(x.strip()) for x in args.times.split(",") if x.strip()]
    frames = []
    for t in times:
        name = f"frame_{t:g}s.jpg"
        dst = args.out / name
        cmd = ["ffmpeg","-hide_banner","-loglevel","error","-ss",str(t),"-i",str(args.video),"-frames:v","1","-vf",f"scale={args.width}:-1",str(dst)]
        subprocess.run(cmd, check=True)
        frames.append((t, dst))
    opened = [(t, Image.open(p).convert("RGB")) for t,p in frames]
    cell_w = args.width + 20
    cell_h = max(im.height for _,im in opened) + 36
    cols = 2
    rows = (len(opened)+cols-1)//cols
    sheet = Image.new("RGB", (cols*cell_w, rows*cell_h), (32,32,32))
    d = ImageDraw.Draw(sheet)
    for i,(t,im) in enumerate(opened):
        x=(i%cols)*cell_w+10; y=(i//cols)*cell_h+10
        sheet.paste(im,(x,y)); d.text((x,y+im.height+5),f"t={t:g}s",fill=(255,255,255))
    sheet.save(args.out / "contact_sheet.jpg", quality=90)
    print(args.out / "contact_sheet.jpg")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
