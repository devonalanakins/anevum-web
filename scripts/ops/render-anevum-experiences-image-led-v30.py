#!/usr/bin/env python3
"""ANEVUM.WEB.BUILD.2026-11-14.013.RUINS-ATMOSPHERIC-DEPTH

Create a review-only cinematic motion study from the original Experiences plate.
Keep the stone arch and perspective fixed. Apply masked foliage sway, periodic
atmospheric drift, softened volumetric light and depth-based floating motes.
No publication, network, scene generation, or fabricated 4K claim.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np

SESSION = 'ANEVUM.WEB.BUILD.2026-11-14.013.RUINS-ATMOSPHERIC-DEPTH'
STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def bell(x, y, cx, cy, sx, sy):
    return np.exp(-.5 * (((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2)).astype(np.float32)


def smooth_random(h, w, seed, grid=(21, 11)):
    rng = np.random.default_rng(seed)
    small = rng.random((grid[1], grid[0]), dtype=np.float32)
    smooth = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)
    smooth = cv2.GaussianBlur(smooth, (0, 0), sigmaX=16)
    return np.clip((smooth - .28) / .42, 0, 1).astype(np.float32)


def setup(image: np.ndarray):
    if image is None or image.ndim != 3 or image.shape[-1] != 3:
        raise ValueError('A three-channel source poster is required')
    h, w = image.shape[:2]
    if w < 900 or h < 450 or w % 2 or h % 2:
        raise ValueError('Even-sized source image must be at least 900x450')
    y, x = np.mgrid[:h, :w].astype(np.float32)
    xn, yn = x / w, y / h
    blue, green, red = [image[..., k].astype(np.float32) for k in range(3)]
    luminance = .114 * blue + .587 * green + .299 * red
    safe = np.clip((.73 - yn) / .24, 0, 1).astype(np.float32)
    safe *= np.clip(np.minimum.reduce([x/19, (w-1-x)/19, y/16, (h-1-y)/16]), 0, 1)

    # Green/yellow vegetation, spatially restricted to the flanking canopy.
    greens = np.clip((green - blue * .79 + 4) / 65, 0, 1)
    greens *= np.clip((red + green - blue * 1.5 - 13) / 100, 0, 1)
    greens *= np.clip((luminance - 17) / 60, 0, 1)
    foliage_regions = (bell(xn, yn, .13, .30, .24, .34) +
                       bell(xn, yn, .91, .30, .17, .32))
    foliage = cv2.GaussianBlur((greens * np.clip(foliage_regions, 0, 1) * safe).astype(np.float32),
                               (0, 0), 1.2)
    foliage = np.clip(foliage, 0, .92)

    # Only brighten existing haze within and around the arch opening.
    opening = bell(xn, yn, .68, .31, .16, .23)
    side_valley = bell(xn, yn, .39, .25, .24, .21)
    sky = np.clip((luminance - 68) / 95, 0, 1)
    haze_zone = np.clip((.85 * opening + .37 * side_valley) * sky * safe, 0, .85)
    haze = smooth_random(h, w, 713, (19, 11))
    haze2 = smooth_random(h, w, 1741, (12, 14))

    # Restrained source-matched sunlight: the arch remains geometrically fixed.
    warm = np.clip((red + green - 2 * blue + 30) / 150, 0, 1)
    sun = bell(xn, yn, .67, .10, .27, .30) * safe
    rays = (np.maximum(np.cos((xn - .69) * 16 + (yn - .04) * 8), 0) ** 4)
    rays *= np.clip((luminance - 38) / 110, 0, 1) * sun
    sun_mask = (0.30 + .45 * warm) * sun

    # Stable small particles, allocated only where backlight can reveal them.
    rng = np.random.default_rng(3030)
    motes = []
    for _ in range(42):
        px = float(rng.uniform(.39, .91))
        py = float(rng.uniform(.06, .56))
        speed = float(rng.choice((1, 2)))
        depth = float(rng.uniform(.25, 1))
        angle = float(rng.uniform(0, math.tau))
        motes.append((px, py, speed, depth, angle))
    return dict(base=image, x=x, y=y, w=w, h=h, safe=safe, foliage=foliage,
                haze_zone=haze_zone, haze=haze, haze2=haze2, sun=sun_mask,
                rays=rays.astype(np.float32), motes=motes)


def frame(layers: dict, phase: float) -> np.ndarray:
    """Stable ruins, periodic foliage displacement, drifting haze and motes."""
    phase = phase % math.tau
    if abs(phase - math.tau) < 1e-11 or abs(phase) < 1e-11:
        phase = 0.0
    x, y = layers['x'], layers['y']
    h, w = layers['h'], layers['w']
    base = layers['base'].astype(np.float32)
    # Side canopy rolls only a few pixels, the stone arch is not transformed.
    sway = (6.5 * math.sin(phase + .24) - 6.5 * math.sin(.24))
    sway += 2.0 * math.sin(2 * phase) * np.sin(y / h * 6.8 + x / w * 7.2)
    # Stabilize upper trunk anchors and keep distant leaves less active.
    movement = layers['foliage'] * np.clip(y / h + .25, 0, .9)
    map_x = (x + movement * sway).astype(np.float32)
    map_y = (y + movement * (1.00 * (math.cos(phase) - 1))).astype(np.float32)
    displaced = cv2.remap(base, map_x, map_y, cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REFLECT_101)
    out = base * (1 - layers['foliage'][:, :, None]) + displaced * layers['foliage'][:, :, None]

    # Fog texture is shifted periodically inside a source-bright atmospheric mask.
    fog_dx = 17.0 * math.sin(phase)
    fog_dy = 3.5 * (math.cos(phase) - 1)
    fog = cv2.remap(layers['haze'], (x-fog_dx).astype(np.float32),
                    (y-fog_dy).astype(np.float32), cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_REFLECT_101)
    fog2 = cv2.remap(layers['haze2'],
                     (x+10.0 * math.sin(phase + .4)-10.0*math.sin(.4)).astype(np.float32),
                     (y+2.5 * (math.cos(phase)-1)).astype(np.float32),
                     cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
    haze = layers['haze_zone'] * (0.7*fog + .3*fog2)
    haze *= .27 + .73 * (.5 + .5 * math.sin(phase - .3))
    out += haze[:, :, None] * np.array([25., 28., 25.], np.float32)

    # A narrow, slowly travelling sunlight column crosses existing haze only.
    # Source brightness masks the fixed arch masonry out of the effect.
    xn, yn = x / w, y / h
    shaft_center = .605 + .19 * (yn - .12) + .027 * math.sin(phase)
    shaft = np.exp(-.5 * ((xn-shaft_center)/.045)**2).astype(np.float32)
    shaft += .44 * np.exp(-.5 * ((xn-shaft_center-.105)/.026)**2)
    shaft *= layers['haze_zone'] * (.45 + .55 * (.5 + .5 * math.cos(phase+.35)))
    out += shaft[:, :, None] * np.array([17., 27., 34.], np.float32)

    # Warm light slightly grazes existing greenery and stone but does not redraw it.
    pulse = .38 + .62 * (.5 + .5 * math.cos(phase - .7))
    light = layers['sun'] * pulse + layers['rays'] * (.45 + .55 * math.cos(phase + .2)**2)
    out += light[:, :, None] * np.array([7., 15., 27.],np.float32)

    # Small floating backlit dust; deterministic image-space positions.
    dust = np.zeros((h, w), dtype=np.float32)
    for px, py, speed, depth, angle in layers['motes']:
        xd = px * w + (3.5 + depth * 5) * (math.sin(speed*phase + angle)-math.sin(angle))
        yd = py * h + (2.2 + depth * 3.7) * (math.cos(phase + angle)-math.cos(angle))
        ix, iy = int(round(xd)), int(round(yd))
        if not (2 <= ix < w-2 and 2 <= iy < h-2):
            continue
        strength = float(layers['haze_zone'][iy,ix])
        if strength < .12:continue
        cv2.circle(dust, (ix,iy), 1 if depth < .6 else 2,
                   .28 * depth * strength, -1, cv2.LINE_AA)
    dust = cv2.GaussianBlur(dust, (0, 0), .8)
    out += dust[:, :, None] * np.array([40., 54., 72.],np.float32)
    # Preserve the entire lower text-safe band with source-exact pixels.
    lower = int(.75 * h)
    out[lower:] = base[lower:]
    return np.clip(out, 0, 255).astype(np.uint8)


def render(poster: Path, out: Path, seconds=6, fps=24) -> dict:
    if seconds not in (4, 6, 8) or fps not in (12, 24, 30):
        raise ValueError('Unsupported review duration or FPS')
    if out.exists() or out.with_suffix('.review.json').exists():
        raise FileExistsError('Never overwrite a previous review artifact')
    image=cv2.imread(str(poster),cv2.IMREAD_COLOR)
    layers=setup(image)
    h,w=image.shape[:2]
    out.parent.mkdir(parents=True,exist_ok=True)
    command=['ffmpeg','-hide_banner','-loglevel','error','-f','rawvideo',
        '-pixel_format','bgr24','-video_size',f'{w}x{h}', '-framerate',str(fps),
        '-i','pipe:0','-an','-c:v','libx264','-crf','19','-preset','medium',
        '-pix_fmt','yuv420p','-movflags','+faststart','-threads','3',str(out)]
    proc=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for i in range(seconds*fps):
            proc.stdin.write(frame(layers,math.tau*i/(seconds*fps)).tobytes())
    except (OSError, BrokenPipeError) as exc:
        proc.kill()
        raise RuntimeError('FFmpeg closed before review frames were encoded') from exc
    finally:
        if proc.stdin and not proc.stdin.closed:
            proc.stdin.close()
    log=proc.stderr.read().decode('utf-8','replace')
    if proc.wait()!=0:
        raise RuntimeError('FFmpeg failed: '+log[-600:])
    receipt=dict(session=SESSION,status=STATUS,scene='experiences',
        source_sha256=digest(poster),file_sha256=digest(out),
        frames=seconds*fps,seconds=seconds,fps=fps,width=w,height=h,
        source_native_4k=False,owner_accepted=False,rights_verified=False,
        publication_authorized=False,architectural_geometry_animated=False)
    out.with_suffix('.review.json').write_text(json.dumps(receipt,indent=2)+'\n')
    return receipt


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--poster',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--seconds',type=int,default=6)
    p.add_argument('--fps',type=int,default=24)
    a=p.parse_args()
    print(json.dumps(render(a.poster,a.out,a.seconds,a.fps),indent=2))


if __name__=='__main__':
    main()
