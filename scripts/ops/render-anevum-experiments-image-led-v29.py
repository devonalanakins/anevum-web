#!/usr/bin/env python3
"""ANEVUM.WEB.BUILD.2026-11-14.012.SPATIAL-GALAXY-CINEMA

Source-registered, differential-motion Experiments galaxy study. Retains the
existing artist-approved composition as a fixed plate while moving only its
emissive spiral structure and image-derived star layer. Never claims physical
stellar orbital accuracy or source-native 4K. Offline review, not publication.
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

SESSION = 'ANEVUM.WEB.BUILD.2026-11-14.012.SPATIAL-GALAXY-CINEMA'
STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as fp:
        for block in iter(lambda: fp.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def setup(plate: np.ndarray) -> dict:
    if plate is None or plate.ndim != 3 or plate.shape[-1] != 3:
        raise ValueError('A three-channel source image is required')
    h, w = plate.shape[:2]
    if w < 900 or h < 450 or w % 2 or h % 2:
        raise ValueError('Source must be at least 900x450 with even dimensions')
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Calibrated in source-pixel proportions, not a new procedural galaxy.
    cx, cy = 0.635 * w, 0.333 * h
    dx, dy = xx - cx, yy - cy
    radius = np.sqrt((dx / (0.40 * w)) ** 2 + (dy / (0.49 * h)) ** 2)
    theta = np.arctan2(dy, dx)
    structure = np.exp(-0.68 * radius ** 2).astype(np.float32)
    # Hard frame edges and the lower dark HTML safe zone remain stationary.
    edge = np.minimum.reduce([xx / 27, (w - 1 - xx) / 27,
                              yy / 22, (h - 1 - yy) / 22])
    edge = np.clip(edge, 0, 1).astype(np.float32)
    upper = np.clip((0.81 * h - yy) / (0.21 * h), 0, 1)
    influence = structure * edge * upper
    b, g, r = [plate[:, :, ch].astype(np.float32) for ch in range(3)]
    luminance = 0.114 * b + 0.587 * g + 0.299 * r
    stellar = cv2.morphologyEx(luminance, cv2.MORPH_TOPHAT,
                               cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    stars = np.clip((stellar - 8) / 45, 0, 1) * np.clip((65 - luminance) / 45, 0, 1)
    stars = cv2.GaussianBlur(stars * upper, (0, 0), 0.75)
    copper = np.clip((r - b * 0.96) / 85, 0, 1) * np.clip((luminance - 24) / 130, 0, 1)
    copper = cv2.GaussianBlur(copper, (0, 0), 1.4) * influence
    core = np.exp(-0.5 * (((xx / w - .633) / .085) ** 2 +
                           ((yy / h - .321) / .147) ** 2)).astype(np.float32)
    return {'base': plate, 'x': xx, 'y': yy, 'dx': dx, 'dy': dy, 'radius': radius,
            'theta': theta, 'influence': influence, 'copper': copper,
            'core': core, 'stars': stars, 'upper': upper}


def frame(layers: dict, phase: float) -> np.ndarray:
    """2pi-periodic image motion: underlying geometry never regenerates."""
    # Different spiral radii move by different amounts. Both harmonics close
    # exactly at phase 2pi; no seam-hiding crossfade that would ghost stars.
    move = .072 * math.sin(phase) + .016 * (math.sin(2 * phase + .28) - math.sin(.28))
    twist = move * layers['influence'] * (0.30 + 0.70 * np.exp(-.30 * layers['radius']))
    cs, sn = np.cos(twist), np.sin(twist)
    map_x = (layers['x'] + layers['dx'] * (cs - 1) - layers['dy'] * sn).astype(np.float32)
    map_y = (layers['y'] + layers['dx'] * sn + layers['dy'] * (cs - 1)).astype(np.float32)
    warped = cv2.remap(layers['base'], map_x, map_y, cv2.INTER_LINEAR,
                       borderMode=cv2.BORDER_REFLECT_101).astype(np.float32)
    # Image-derived copper travels through the existing spiral, never draws a mesh.
    sweep = np.maximum(np.cos(layers['theta'] * 2.0 + 1.4 * layers['radius'] - phase), 0) ** 18
    wave = layers['copper'] * (0.12 + 0.88 * sweep)
    source = layers['core'] * (0.20 + .80 * (math.sin(phase / 2 + .4) ** 2))
    parallax_x = 1.8 * math.sin(phase)
    parallax_y = 1.2 * (math.cos(phase) - 1)
    star_grid = cv2.remap(layers['stars'],
                          (layers['x'] - parallax_x).astype(np.float32),
                          (layers['y'] - parallax_y).astype(np.float32),
                          cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    # Tiny parallax: far stars shift less than bright near-star features.
    frame_bgr = warped + wave[:, :, None] * np.array([3.0, 18.0, 37.0],np.float32)
    frame_bgr += source[:, :, None] * np.array([2.8, 10.0, 18.0],np.float32)
    frame_bgr += star_grid[:, :, None] * np.array([9.0, 11.0, 15.0],np.float32)
    return np.clip(frame_bgr,0,255).astype(np.uint8)


def render(poster: Path, out: Path, seconds: int = 6, fps: int = 24) -> dict:
    if seconds not in (4, 6, 8) or fps not in (12, 24, 30):
        raise ValueError('Unsupported review duration or frame rate')
    if out.exists():
        raise FileExistsError('Refusing to overwrite a review film')
    plate = cv2.imread(str(poster), cv2.IMREAD_COLOR)
    layers = setup(plate)
    h,w = plate.shape[:2]
    count=seconds*fps
    out.parent.mkdir(parents=True,exist_ok=True)
    command=['ffmpeg','-hide_banner','-loglevel','error','-f','rawvideo',
             '-pixel_format','bgr24','-video_size',f'{w}x{h}',
             '-framerate',str(fps),'-i','pipe:0','-an','-c:v','libx264',
             '-preset','veryfast','-crf','19','-pix_fmt','yuv420p',
             '-movflags','+faststart','-threads','3',str(out)]
    process=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for i in range(count):
            process.stdin.write(frame(layers,math.tau*i/count).tobytes())
    except (BrokenPipeError, OSError) as error:
        process.kill()
        raise RuntimeError('Review encoder stopped unexpectedly') from error
    finally:
        if process.stdin and not process.stdin.closed:process.stdin.close()
    stderr=process.stderr.read().decode('utf-8','replace')
    if process.wait()!=0:
        raise RuntimeError('Video encoding failed: '+stderr[-800:])
    receipt={'session':SESSION,'status':STATUS,'scene':'experiments',
             'motion':'source-registered differential rotation and image-derived stellar parallax',
             'source_sha256':digest(poster),'file_sha256':digest(out),
             'bytes':out.stat().st_size,'width':w,'height':h,
             'fps':fps,'frames':count,'duration_seconds':seconds,
             'owner_accepted':False,'rights_verified':False,
             'publication_authorized':False,'physical_galaxy_orbit':False,
             'source_native_4k':False}
    receipt_file=out.with_suffix('.review.json')
    receipt_file.write_text(json.dumps(receipt,indent=2)+'\n')
    return receipt


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--poster',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--seconds',type=int,default=6)
    parser.add_argument('--fps',type=int,default=24)
    options=parser.parse_args()
    print(json.dumps(render(options.poster,options.out,options.seconds,options.fps),indent=2))


if __name__=='__main__':main()
