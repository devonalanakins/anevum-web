#!/usr/bin/env python3
"""ANEVUM — original loopable computational terrain motion candidate.

Render a mathematically animated, deterministic research environment. No stock
motion, no paid media provider, no text embedded in frames. Review-only footage:
visual acceptance and studio media approval remain separate gates.

Requires numpy, opencv-python-headless and ffmpeg on PATH.
"""
import argparse
import hashlib
import json
import math
import shutil
import subprocess
from pathlib import Path

import cv2
import numpy as np

TAU = math.tau


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output", required=True, type=Path)
    p.add_argument("--width", type=int, default=1280)
    p.add_argument("--height", type=int, default=720)
    p.add_argument("--fps", type=int, default=24)
    p.add_argument("--seconds", type=float, default=6.0)
    p.add_argument("--preview-only", action="store_true")
    args = p.parse_args()
    if args.width < 320 or args.width > 3840 or args.height < 180 or args.height > 2160:
        p.error("Dimensions must be within 320x180 and 3840x2160")
    if args.fps < 12 or args.fps > 60 or not (2 <= args.seconds <= 20):
        p.error("fps 12..60, duration 2..20 seconds")
    if abs(args.fps * args.seconds - round(args.fps * args.seconds)) > 1e-6:
        p.error("duration * fps must be an integer")
    return args


class Terrain:
    def __init__(self, w, h):
        self.w, self.h = w, h
        rng = np.random.default_rng(1119)
        self.stars = np.column_stack([rng.uniform(0, w, 210), rng.uniform(0, h * .47, 210), rng.uniform(.25, 1, 210), rng.uniform(0, TAU, 210)])
        self.xx = np.linspace(-12, 12, 70, dtype=np.float32)
        self.zz = np.linspace(1.3, 27, 65, dtype=np.float32)
        self.X, self.Z = np.meshgrid(self.xx, self.zz)
        self.base = self.make_base()
        self.size_factor = w / 1280

    def make_base(self):
        w, h = self.w, self.h
        rows = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        cols = np.linspace(-1, 1, w, dtype=np.float32)[None, :]
        vign = np.clip(1 - .25 * (cols ** 2), .7, 1)
        sky = np.zeros((h, w, 3), np.float32)
        # BGR: deep midnight ultramarine + cold silver-blue radiance.
        sky[:, :, 0] = (18 + 18 * rows + 21 * np.exp(-((rows - .63) / .23)**2)) * vign
        sky[:, :, 1] = (10 + 10 * rows + 13 * np.exp(-((rows - .59) / .23)**2)) * vign
        sky[:, :, 2] = (8 + 4 * rows + 2 * np.exp(-((rows - .59) / .23)**2)) * vign
        # Subtle pale blue atmospheric strata, not fake readouts.
        mid = np.exp(-((rows - .55) / .085)**2) * np.exp(-(cols / .85)**2)
        sky[:, :, 0] += 18 * mid
        sky[:, :, 1] += 9 * mid
        return np.clip(sky, 0, 255).astype(np.uint8)

    def surface(self, phase):
        X, Z = self.X, self.Z
        ridge = 4.55 * np.exp(-((X-1.35)**2 / 16 + (Z-15)**2 / 35))
        remote = 2.15 * np.exp(-((X+5.1)**2 / 27 + (Z-20)**2 / 52))
        near = 1.45 * np.exp(-((X+6.4)**2 / 18 + (Z-6.9)**2 / 20))
        flowing = (.19*np.sin(.78*X + .43*Z + 1.1*np.sin(phase)) +
                   .12*np.cos(.49*X - .57*Z + 1.8*np.sin(phase-.5)))
        amplitude = np.sin((Z/27)*np.pi)**2
        return (ridge+remote+near+flowing*amplitude).astype(np.float32)

    def project(self, y):
        distance = self.Z+9.0
        f = self.w * .76
        px = self.w * .5 + f * self.X / distance
        py = self.h * .40 + f * (3.9 - y) / distance
        return px.astype(np.int32), py.astype(np.int32)

    def frame(self, index, count):
        phase = TAU * index / count
        w, h = self.w, self.h
        frame = self.base.copy()
        # Horizon halo breathes gently, guaranteed phase seamless.
        bloom = int(7 + 3 * math.sin(phase + .4))
        cv2.ellipse(frame,(int(w*.51),int(h*.61)),(int(w*.38),int(h*.065)),0,0,360,(34+bloom,23+bloom//2,15),-1,cv2.LINE_AA)
        haze = cv2.GaussianBlur(frame,(0,0),sigmaX=max(6,w*.025),sigmaY=max(3,h*.013))
        frame = cv2.addWeighted(frame,.86,haze,.14,0)
        # Stable seeded stars with phase-smooth twinkle, never random flicker.
        for x,y,v,p in self.stars:
            lum = .55 + .45*math.sin(phase + p)**2
            rad = 1 if v < .83 else 2
            tone = int(34 + 110*v*lum)
            cv2.circle(frame,(int(x),int(y)),rad,(tone,int(tone*.79),int(tone*.55)),-1,cv2.LINE_AA)
        ht = self.surface(phase)
        px, py = self.project(ht)
        lattice = np.zeros_like(frame)
        glow = np.zeros_like(frame)
        # Far-to-near geographic contours. Dynamic height field gives actual
        # displaced shape; short energy crests migrate along the mesh curves.
        for row in range(len(self.zz)-1, -1, -2):
            points=np.column_stack((px[row],py[row])).reshape(-1,1,2)
            near_factor=1-row/(len(self.zz)-1)
            blue=int(65+80*near_factor)
            cv2.polylines(glow,[points],False,(blue,65,15),max(2,int(3*self.size_factor)),cv2.LINE_AA)
            cv2.polylines(lattice,[points],False,(int(110+90*near_factor),int(74+50*near_factor),int(31+20*near_factor)),1,cv2.LINE_AA)
        for col in range(0,len(self.xx),2):
            points=np.column_stack((px[:,col],py[:,col])).reshape(-1,1,2)
            cv2.polylines(glow,[points],False,(63,45,17),max(2,int(2.4*self.size_factor)),cv2.LINE_AA)
            cv2.polylines(lattice,[points],False,(104,75,35),1,cv2.LINE_AA)
        # Coherent electric crest: light runs across mountain, 6s periodic.
        for row in range(10,len(self.zz)-7,4):
            cx=(math.sin(phase + row*.19)+1)*.5
            j=int(12+cx*(len(self.xx)-24))
            x,y=int(px[row,j]),int(py[row,j]); strength=(.5+.5*math.cos(phase+row*.3))
            rr=max(2,int((2+strength*3)*self.size_factor))
            cv2.circle(glow,(x,y),rr*3,(int(85+65*strength),int(85+25*strength),int(22+12*strength)),-1,cv2.LINE_AA)
            cv2.circle(lattice,(x,y),max(1,rr//2),(235,206,155),-1,cv2.LINE_AA)
        halo=cv2.GaussianBlur(glow,(0,0),sigmaX=max(2,w*.005),sigmaY=max(2,h*.006))
        frame=cv2.add(frame,cv2.convertScaleAbs(halo,alpha=.75))
        frame=cv2.add(frame,cv2.convertScaleAbs(lattice,alpha=.95))
        # Foreground spectral wash grounds the terrain instead of being a loose
        # overlay. No page/UI text is rendered inside the film.
        front=np.zeros_like(frame); front[...,0]=24; front[...,1]=8
        strength=np.linspace(0, .36, h, dtype=np.float32)[:,None,None] ** 2
        frame=np.clip(frame*(1-strength)+front*strength,0,255).astype('uint8')
        return frame


def render(args):
    out=args.output.resolve()
    out.mkdir(parents=True,exist_ok=True)
    scene=Terrain(args.width,args.height)
    count=round(args.fps*args.seconds)
    frame0=scene.frame(0,count)
    cv2.imwrite(str(out/'research-first-frame.png'),frame0)
    seam=scene.frame(count,count)
    assert np.array_equal(frame0,seam), 'loop boundary is not mathematically seamless'
    if args.preview_only:
        return {"scene":"research","frames":count,"first_frame":str(out/'research-first-frame.png'),"loop_exact":True}
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise SystemExit('ffmpeg/ffprobe required')
    # VFX masters stay separate from delivery encodes; here we encode display
    # derivatives for first owner review. Review footage is never auto-published.
    codecs={
      'research.mp4':['-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart'],
      'research.webm':['-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','5','-b:v','0','-crf','29','-pix_fmt','yuv420p']}
    procs=[]
    for filename,codec in codecs.items():
        cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24',
             '-video_size',f'{args.width}x{args.height}','-framerate',str(args.fps),'-i','pipe:0',
             '-an',*codec,str(out/filename)]
        procs.append((filename,subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)))
    try:
        for i in range(count):
            raw=scene.frame(i,count).tobytes()
            for name,proc in procs:
                proc.stdin.write(raw)
        for name,proc in procs:
            proc.stdin.close()
            err=proc.stderr.read().decode('utf-8',errors='replace');ret=proc.wait()
            if ret:raise RuntimeError(f'{name} FFmpeg failed: {err[-1800:]}')
    finally:
        for _,proc in procs:
            if proc.poll() is None:proc.terminate()
    meta={'scene':'research','model':'original periodic computational terrain','width':args.width,'height':args.height,'fps':args.fps,'seconds':args.seconds,'frames':count,'loop_exact':True,'owner_approved':False,'production_eligible':False,'outputs':{}}
    for name in codecs:
        p=out/name
        info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames,duration','-of','json',str(p)],text=True))
        assert info['streams'][0]['width']==args.width and info['streams'][0]['height']==args.height
        meta['outputs'][name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'ffprobe':info['streams'][0]}
    (out/'research-media-candidate.json').write_text(json.dumps(meta,indent=2)+'\n')
    return meta


if __name__ == '__main__':
    print(json.dumps(render(parse_args()),indent=2))