#!/usr/bin/env python3
"""ANEVUM.WEB.BUILD.2026-11-14.004.RESEARCH-IMAGE-REGISTERED-FLOW

Render a local-only Research environment study from a rights-pending ANEVUM poster.
The existing terrain stays fixed; energy follows source-bright cyan ridgelines.
No network, model regeneration, synthetic wireframe drawing, or production deploy.
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

SESSION = 'ANEVUM.WEB.BUILD.2026-11-14.004.RESEARCH-IMAGE-REGISTERED-FLOW'
STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def setup(image: np.ndarray) -> dict:
    h, w = image.shape[:2]
    if w < 900 or h < 450:
        raise ValueError('Source poster resolution is below review minimum')
    y, x = np.mgrid[:h, :w].astype(np.float32)
    x /= w
    y /= h
    b, g, r = [image[..., c].astype(np.float32) for c in range(3)]
    luminance = (0.114*b + 0.587*g + 0.299*r)
    cyan = np.clip((b - r*0.98 - 8) / 90, 0, 1) * np.clip((g - r*0.84 - 4) / 70, 0, 1)
    cyan *= np.clip((luminance - 21) / 78, 0, 1)
    cyan = cv2.GaussianBlur(cyan, (0, 0), 1.1)
    # Don't illuminate the dark native-HTML text zone at bottom of card.
    safe = np.clip((0.79 - y) / 0.2, 0, 1)
    terrain = cyan * safe
    core = np.exp(-0.5*(((x-0.57)/0.35)**2 + ((y-0.40)/0.20)**2))
    background = np.exp(-0.5*(((x-0.61)/0.46)**2 + ((y-0.42)/0.38)**2)) * safe
    # Stable normalized ridge coordinate: lights travel across photographed terrain.
    elevation = np.clip((luminance - 15) / 100, 0, 1)
    transit = (x * 1.62 + (0.48 - y) * 0.41 + elevation * 0.12).astype(np.float32)
    return dict(base=image.astype(np.float32), terrain=terrain.astype(np.float32),
                core=core.astype(np.float32),background=background.astype(np.float32),
                transit=transit,x=x,y=y)


def render(layers: dict, phase: float) -> np.ndarray:
    """Periodic traveling light within existing terrain ridges; geometry never moves."""
    t = layers['transit']
    # Two coherent moving impulses expose source ridges, no added drawn mesh.
    wave = np.maximum(np.cos(math.tau*(t - phase/math.tau)), 0)**16
    wave += 0.47*np.maximum(np.cos(math.tau*(t*1.15 + 0.37 - phase/math.tau)), 0)**26
    wave = np.minimum(wave,1.4)
    terrain_light = layers['terrain']*(0.16 + 0.82*wave)
    ambient_pulse = (math.sin(phase - 0.58)**2)
    # Soft blue radiance follows the image's own valley and ridgelines.
    radiance = layers['core']*(0.21 + 0.33*ambient_pulse)
    mist = layers['background']*(0.45 + 0.55*math.sin(phase+0.22)**2)
    frame = layers['base'].copy()
    frame += terrain_light[:,:,None] * np.array([43.0, 31.0, 7.0], dtype=np.float32)
    frame += radiance[:,:,None] * np.array([9.0, 5.0, 0.3], dtype=np.float32)
    frame += mist[:,:,None] * np.array([7.0, 3.5, 0.0], dtype=np.float32)
    return np.clip(frame,0,255).astype(np.uint8)


def stream_render(poster_path: Path, output: Path, fps: int, seconds: int, preview_scale: float=1.0) -> dict:
    image = cv2.imread(str(poster_path),cv2.IMREAD_COLOR)
    if image is None: raise ValueError('Cannot read source artwork')
    if not 0.5 <= preview_scale <= 1.0: raise ValueError('Invalid review scale')
    if preview_scale != 1.0:
        w = max(2, round(image.shape[1]*preview_scale)//2*2)
        h = max(2, round(image.shape[0]*preview_scale)//2*2)
        image=cv2.resize(image,(w,h),interpolation=cv2.INTER_AREA)
    layers = setup(image)
    h,w = image.shape[:2]
    count=fps*seconds
    if fps not in (12, 24, 30) or seconds not in (4, 6, 8):
        raise ValueError('Unsupported review timing')
    output.parent.mkdir(parents=True,exist_ok=True)
    if output.exists(): raise FileExistsError('Never overwrite previous owner review video')
    command=['ffmpeg','-hide_banner','-loglevel','error','-f','rawvideo','-pixel_format','bgr24',
             '-video_size',f'{w}x{h}','-framerate',str(fps),'-i','pipe:0','-an',
             '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',
             '-movflags','+faststart','-threads','4',str(output)]
    encoder=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for i in range(count):
            encoder.stdin.write(render(layers, math.tau*i/count).tobytes())
    except (BrokenPipeError, OSError) as exc:
        encoder.kill()
        raise RuntimeError('Video encoder stopped') from exc
    finally:
        if encoder.stdin and not encoder.stdin.closed:encoder.stdin.close()
    errors=encoder.stderr.read().decode('utf8','replace')
    if encoder.wait()!=0:raise RuntimeError('Encoding failed: '+errors[-600:])
    return {'path':str(output),'sha256':sha256(output),'frames':count,'width':w,'height':h,'fps':fps,'duration_seconds':seconds}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--poster',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--fps',type=int,default=24)
    p.add_argument('--seconds',type=int,default=6)
    p.add_argument('--scale',type=float,default=1.0)
    args=p.parse_args()
    report=stream_render(args.poster,args.out,args.fps,args.seconds,args.scale)
    report.update({'source_sha256':sha256(args.poster),'session':SESSION,'status':STATUS,
                   'rights_verified':False,'owner_accepted':False,
                   'geometry_reconstructed':False})
    path=args.out.with_name(args.out.stem+'-review.json')
    if path.exists():raise FileExistsError('Review manifest already exists')
    path.write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
    print(json.dumps(report,indent=2))

if __name__=='__main__':main()
