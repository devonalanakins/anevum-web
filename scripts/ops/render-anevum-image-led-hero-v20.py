#!/usr/bin/env python3
"""ANEVUM.WEB.BUILD.2026-11-14.003.IMAGE-REGISTERED-ATMOSPHERIC-HERO

Offline, owner-review-only motion study. Animates illumination already present in
an existing image-led ANEVUM Observatory, never reconstructs its geometry.
No network access, no production media or Worker writes, no automatic approval.
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


def require(ok: bool, message: str) -> None:
    if not ok:
        raise ValueError(message)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def gaussian(x: np.ndarray, y: np.ndarray, cx: float, cy: float, sx: float, sy: float) -> np.ndarray:
    return np.exp(-0.5 * (((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2)).astype(np.float32)


def layer_setup(poster: np.ndarray, mobile: bool, seed: int):
    h, w = poster.shape[:2]
    require((w >= 500 and h >= 700) if mobile else (w >= 1200 and h >= 650), 'Source poster too small')
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    red = poster[:, :, 2].astype(np.float32)
    green = poster[:, :, 1].astype(np.float32)
    blue = poster[:, :, 0].astype(np.float32)
    # Copper is detected from the source plate itself, not drawn as new rings.
    copper = np.clip((red - blue * 1.15 - 6) / 68, 0, 1) * np.clip((green - 42) / 105, 0, 1)
    copper = cv2.GaussianBlur(copper, (0, 0), sigmaX=max(0.4, w / 1450))
    if mobile:
        cx, cy, rx, ry = 0.5, 0.285, 0.29, 0.27
        sky_mask = gaussian(x, y, 0.5, 0.50, 0.42, 0.16)
        floor_mask = gaussian(x, y, 0.50, 0.79, 0.25, 0.19)
        window_mask = gaussian(x, y, 0.56, 0.37, 0.52, 0.42)
        portal_mask = gaussian(x, y, 0.49, 0.29, 0.32, 0.30)
    else:
        cx, cy, rx, ry = 0.50, 0.283, 0.17, 0.23
        sky_mask = gaussian(x, y, 0.50, 0.49, 0.27, 0.12)
        floor_mask = gaussian(x, y, 0.50, 0.76, 0.23, 0.24)
        window_mask = gaussian(x, y, 0.50, 0.30, 0.43, 0.42)
        portal_mask = gaussian(x, y, 0.50, 0.30, 0.26, 0.31)
    angle = np.arctan2((y - cy) / ry, (x - cx) / rx).astype(np.float32)
    scaled_radius = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    ring = copper * np.exp(-0.7 * (scaled_radius - 0.9) ** 2) * portal_mask
    # Source-registered reflections: only illuminate already warm floor pixels.
    floor = floor_mask * copper * (y > (0.54 if mobile else 0.53))
    warm_arch = copper * portal_mask * (y < (0.50 if mobile else 0.56))
    rng = np.random.default_rng(seed)
    low_res = rng.random((max(12, h // 46), max(14, w // 46)), dtype=np.float32)
    fog_noise = cv2.resize(low_res, (w, h), interpolation=cv2.INTER_CUBIC)
    fog_noise = cv2.GaussianBlur(fog_noise, (0, 0), sigmaX=max(4.0, w / 90))
    fog_noise = np.clip((fog_noise - 0.32) / 0.58, 0, 1)
    # Preserve pixels outside the portal, horizon and reflective floor.
    return dict(base=poster, ring=ring.astype(np.float32),
                floor=floor.astype(np.float32), arch=warm_arch.astype(np.float32),
                angle=angle, sky=sky_mask, window=window_mask,
                fog=fog_noise, x=x, y=y, mobile=mobile)


def render_frame(layers: dict, phase: float) -> np.ndarray:
    """Periodic light transport. Geometry, camera and silhouettes stay fixed."""
    base = layers['base']
    frame = base.astype(np.float32)
    angle = layers['angle']
    # Three restrained highlights travel along *existing* copper in the image.
    highlight = np.maximum(np.cos(angle - phase), 0) ** 23
    highlight += 0.72 * np.maximum(np.cos(angle + 2.25 - phase), 0) ** 28
    highlight += 0.54 * np.maximum(np.cos(angle - 2.1 - phase), 0) ** 31
    glint = layers['ring'] * np.minimum(highlight, 1.8)
    # The sphere's energy is tied to the original warm source light.
    core = gaussian(layers['x'], layers['y'], 0.50, 0.29 if layers['mobile'] else 0.29,
                    0.11 if layers['mobile'] else 0.065,
                    0.11 if layers['mobile'] else 0.095)
    pulse = 0.50 + 0.50 * math.sin(phase - 0.35)
    # Existing floor reflections flicker with the energy source, not a new beam.
    reflected = layers['floor'] * (0.42 + 0.58 * (math.sin(phase - 0.82) ** 2))
    arch = layers['arch'] * (0.4 + 0.6 * (math.sin(phase + 0.62) ** 2))
    # Soft, travelling cloud illumination, bounded to the central sky/horizon.
    shift = int(32 * math.sin(phase - 0.12))
    drift = np.roll(layers['fog'], shift, axis=1)
    sky_wisp = layers['sky'] * (drift * 0.68 + 0.32) * (0.30 + 0.70 * (math.sin(phase + 0.9) ** 2))
    # Slow blue/copper atmospheric color temperature changes with the scene.
    ambient = layers['window'] * (0.28 + 0.72 * (math.sin(phase / 2) ** 2))
    # BGR gains are intentionally bounded to preserve cinematic source grading.
    frame += glint[:, :, None] * np.array([19.0, 49.0, 76.0], dtype=np.float32)
    frame += core[:, :, None] * pulse * np.array([6.0, 22.0, 39.0], dtype=np.float32)
    frame += reflected[:, :, None] * np.array([8.0, 29.0, 49.0], dtype=np.float32)
    frame += arch[:, :, None] * np.array([1.0, 8.0, 17.0], dtype=np.float32)
    frame += sky_wisp[:, :, None] * np.array([19.0, 13.0, 5.0], dtype=np.float32)
    frame += ambient[:, :, None] * np.array([4.0, 2.0, -1.0], dtype=np.float32)
    return np.clip(frame, 0, 255).astype(np.uint8)


def render_mp4(poster_file: Path, outfile: Path, fps: int, duration: int,
               mobile: bool, seed: int):
    poster = cv2.imread(str(poster_file), cv2.IMREAD_COLOR)
    require(poster is not None, 'Unreadable poster: '+str(poster_file))
    h, w = poster.shape[:2]
    layers = layer_setup(poster, mobile, seed)
    frames = fps * duration
    cmd = ['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo',
           '-pixel_format','bgr24','-video_size',f'{w}x{h}','-framerate',str(fps),
           '-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20',
           '-pix_fmt','yuv420p','-movflags','+faststart','-threads','4',str(outfile)]
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        for i in range(frames):
            frame = render_frame(layers, math.tau * i / frames)
            process.stdin.write(frame.tobytes())
    except (BrokenPipeError, OSError):
        raise RuntimeError('Encoder pipe failed') from None
    finally:
        process.stdin.close()
    err = process.stderr.read().decode('utf-8','replace')
    rc = process.wait()
    require(rc==0, 'ffmpeg failed: '+err[-1200:])
    return {'file':outfile.name,'sha256':digest(outfile),'resolution':f'{w}x{h}',
            'frames':frames,'fps':fps,'duration_seconds':duration,
            'poster_sha256':digest(poster_file)}


def encode_webm(mp4: Path, target: Path):
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(mp4),'-an',
         '-c:v','libvpx-vp9','-deadline','good','-cpu-used','5','-crf','31',
         '-b:v','0','-threads','4',str(target)]
    r=subprocess.run(cmd,capture_output=True,text=True,timeout=300)
    require(r.returncode==0, 'WebM encoding failed: '+r.stderr[-1200:])
    return {'file':target.name,'sha256':digest(target)}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--desktop',type=Path,required=True)
    p.add_argument('--mobile',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--duration',type=int,default=8)
    p.add_argument('--fps',type=int,default=24)
    p.add_argument('--webm',action='store_true')
    args=p.parse_args()
    require(4 <= args.duration <= 12 and 12 <= args.fps <= 30,'Invalid review duration/frame rate')
    require(not args.output.exists() or not any(args.output.iterdir()),'Output must be empty; no overwrite of prior media')
    args.output.mkdir(parents=True,exist_ok=True)
    records=[]
    for name,mobile,poster in [('hero-desktop',False,args.desktop),('hero-mobile',True,args.mobile)]:
        mp4=args.output/(name+'.mp4')
        result=render_mp4(poster,mp4,args.fps,args.duration,mobile,seed=4026)
        if args.webm:result['webm']=encode_webm(mp4,args.output/(name+'.webm'))
        records.append(result)
    manifest={'session':'ANEVUM.WEB.BUILD.2026-11-14.003.IMAGE-REGISTERED-ATMOSPHERIC-HERO',
              'status':'REVIEW_ONLY_NOT_PRODUCTION_APPROVED','source':'existing ANEVUM V15 text-free artwork',
              'technique':'source-registered copper highlights, portal atmosphere, reflection light',
              'not_a_physical_rotation':True,'owner_accepted':False,'licensed_for_publication':False,
              'files':records}
    (args.output/'review-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(manifest,indent=2))

if __name__=='__main__':main()
