#!/usr/bin/env python3
"""ANEVUM V12 -- microfacet-lit metallic ring surfaces, portrait-aware, review-only.

No Blender, paid services, browser GPU, stock footage or external runtime.
Draw rotating copper toroidal armature in world xyz, project with a perspective
camera, order front/back depth against a procedural shaded orb and composite
onto an original clean Observatory plate. The rings really change orientation
in 3D; this is not a Ken Burns effect or a physical 4K render.

Input is an owner-generated/approved clean, textless Observatory plate supplied
separately. This source NEVER writes production or publishes to a service.
Requires sibling anevum_metal_shader.py with no third-party shader dependency.
"""
import argparse
import hashlib
import json
import math
import shutil
import subprocess
import time
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from anevum_metal_shader import copper_bgr

TAU = math.tau


def mat_x(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1., 0., 0.], [0., c, -s], [0., s, c]], dtype=np.float64)


def mat_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0., s], [0., 1., 0.], [-s, 0., c]], dtype=np.float64)


def mat_z(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0.], [s, c, 0.], [0., 0., 1.]], dtype=np.float64)


# Three intersecting armillary planes. All motion is periodic in phase.
RINGS = (
    dict(name='equatorial', radius=202., width=10.3, tilt=.57, yaw=.30, roll=-.12, speed=1., reverse=False),
    dict(name='polar', radius=227., width=8.4, tilt=1.15, yaw=-.70, roll=.42, speed=-1., reverse=True),
    dict(name='ecliptic', radius=181., width=7.1, tilt=-.82, yaw=.65, roll=.36, speed=1., reverse=False),
)


def ring_points(ring, phase, n=360):
    """Three-dimensional centerlines, with real out-of-plane motion."""
    angle = np.arange(n+1, dtype=np.float64) * TAU / n
    pts = np.stack([np.cos(angle)*ring['radius'], np.sin(angle)*ring['radius'], np.zeros(n+1)], axis=1)
    # Angular rotation changes the physical plane of each ring, not merely a glow texture.
    orientation = mat_y(ring['speed']*phase) @ mat_z(ring['roll']) @ mat_x(ring['tilt']) @ mat_y(ring['yaw'])
    return pts @ orientation.T


def project(points, x, y, scale=1.0):
    """Perspective; +z is toward the camera."""
    focal = 1160.0
    depth = np.maximum(.35, (focal-points[:,2])/focal)
    return np.stack((x+scale*points[:,0]/depth, y-scale*points[:,1]/depth), axis=-1)


def world_geometry_endpoints():
    # mathematically exact loop closure to numerical tolerance, across full cycle
    return max(float(np.max(np.abs(ring_points(r,0.)-ring_points(r,TAU)))) for r in RINGS)


class ArmillaryScene:
    def __init__(self, plate, width=960, height=540):
        self.w,self.h=width,height
        self.plate_sha256=hashlib.sha256(Path(plate).read_bytes()).hexdigest()
        im=cv2.imread(str(plate),cv2.IMREAD_COLOR)
        if im is None or min(im.shape[:2])<400:
            raise ValueError('A valid text-free source plate >= 400 pixels per side is required')
        # True perspective-preserving cover camera. No distorted portrait stretching.
        # Independently positions the ring/planet in portrait space (not a desktop video crop).
        source_h,source_w=im.shape[:2]
        self.factor=max(width/source_w,height/source_h) * (1.15 if height>width else 1.)
        full_w=int(math.ceil(source_w*self.factor));full_h=int(math.ceil(source_h*self.factor))
        full=cv2.resize(im,(full_w,full_h),interpolation=cv2.INTER_CUBIC if self.factor>1 else cv2.INTER_AREA)
        left=(full_w-width)//2
        top=int((full_h-height)*(.25 if height>width else .5))
        self.base=full[top:top+height,left:left+width].copy()
        self.cx=source_w*.506*self.factor-left
        self.cy=source_h*.300*self.factor-top + (height*.032 if height>width else 0.)
        # Portrait art direction: keep the complete armillary clear of the
        # fixed navigation region without pushing it into the stage.
        self.geometry_scale=self.factor*(.90 if height>width else 1.)
        self.orb_r=119*self.geometry_scale
        self.orb_mask,self.orb_xyz=self._orb_geometry()
        self.orb_tex=self._make_orb_texture()
        self.floor_mask=self._floor_mask()

    def _floor_mask(self):
        Y,X=np.mgrid[0:self.h,0:self.w].astype(np.float32)
        mask=np.exp(-((X-self.cx)/(self.w*.115))**2)*np.exp(-((Y-self.h*.78)/(self.h*.20))**2)
        mask[Y < self.h*.61]=0
        return mask

    def _orb_geometry(self):
        r=self.orb_r
        size=2*math.ceil(r)+2
        xx=np.arange(size,dtype=np.float32)-size/2+.5
        yy=np.arange(size,dtype=np.float32)-size/2+.5
        X,Y=np.meshgrid(xx/r,yy/r)
        rad2=X*X+Y*Y
        m=(rad2<=1.0)
        Z=np.sqrt(np.maximum(0,1-rad2))
        return m,np.stack((X,-Y,Z),axis=-1)

    def _make_orb_texture(self):
        # Original marbled volcanic surface generated from seeded multiscale noise.
        rng=np.random.default_rng(77603)
        w,h=1024,512
        s=np.zeros((h,w),np.float32)
        for size,amp in [(9,1.0),(19,.57),(43,.27),(95,.16),(211,.08)]:
            a=rng.normal(0,1,(max(3,size//2),size)).astype(np.float32)
            layer=cv2.resize(a,(w,h),interpolation=cv2.INTER_CUBIC)
            s+=layer*amp
        s=cv2.GaussianBlur(s,(0,0),.9)
        s=(s-s.min())/(s.max()-s.min())
        # Molten fractures concentrate around narrow noise ridges rather than flood-fill the sphere.
        veins=np.exp(-((s-.53)/.037)**2)
        p=np.zeros((h,w,3),np.float32)
        p[:,:,:]=(22,31,51)
        p+=np.maximum(0,s[...,None]-.32)*np.array([45,55,69],np.float32)
        p+=veins[...,None]*np.array([66,157,244],np.float32)
        return np.clip(p,0,255).astype(np.uint8)

    def orb(self, phase):
        mask,n=self.orb_mask,self.orb_xyz
        YX=np.shape(mask)
        theta=np.arctan2(n[...,0],n[...,2])
        tex_x=((theta/TAU+.5+phase/(TAU))%1*self.orb_tex.shape[1]).astype(np.float32)
        tex_y=(np.arccos(np.clip(n[...,1],-1,1))/np.pi*(self.orb_tex.shape[0]-1)).astype(np.float32)
        sample=cv2.remap(self.orb_tex,tex_x,tex_y,cv2.INTER_LINEAR,borderMode=cv2.BORDER_WRAP).astype(np.float32)
        light=np.array([-0.42,.74,.62],np.float32)
        diffuse=np.clip((n*light).sum(axis=-1),0,1)
        rim=(1-n[...,2])**2
        shading=(.45+.54*diffuse+.28*rim)
        res=sample*shading[...,None]
        # Deep amber subsurface core light, continuous across loop.
        hotspot=np.exp(-(((n[...,0]+.14)**2)/.16+((n[...,1]-.13)**2)/.19))*(.75+.25*math.cos(phase))
        res+=np.stack((hotspot*40,hotspot*82,hotspot*150),axis=-1)
        res+=rim[...,None]*np.array([23,27,41],np.float32)
        res=np.clip(res,0,255).astype(np.uint8)
        res[~mask]=0
        return res

    def _draw_orb(self,base,phase):
        orb=self.orb(phase)
        h,w=orb.shape[:2]
        x=int(round(self.cx-w/2));y=int(round(self.cy-h/2))
        sx=max(0,x);sy=max(0,y);ex=min(self.w,x+w);ey=min(self.h,y+h)
        if ex<=sx or ey<=sy:return
        ox=sx-x;oy=sy-y
        patch=base[sy:ey,sx:ex];layer=orb[oy:oy+ey-sy,ox:ox+ex-sx]
        m=self.orb_mask[oy:oy+ey-sy,ox:ox+ex-sx]
        patch[m]=layer[m]
        # Gaussian plasma rim halo, light stays bound to the sphere's silhouette.
        rr=self.orb_r
        glow=np.zeros((self.h,self.w,3),np.uint8)
        cv2.circle(glow,(round(self.cx),round(self.cy)),round(rr*1.02),(18,60,122),max(1,round(rr*.10)),cv2.LINE_AA)
        blurred=cv2.GaussianBlur(glow,(0,0),sigmaX=max(3,rr*.16))
        cv2.addWeighted(base,1,blurred,.24,0,dst=base)

    def _metal_color(self, normal, angle, shade_band, ring_i):
        # Review-grade conductor microfacet lighting. Neither path tracing nor
        # a measured HDRI environment. The face normal rotates with geometry.
        return copper_bgr(normal, angle, shade_band, ring_i,
                          roughness=(.24, .28, .32)[ring_i])

    def _ribbon_faces(self,phase):
        # Solid rectangular cross-section bands, with front/back sheets and
        # inner/outer walls. Normals rotate in real XYZ space for each ring.
        faces=[]
        samples=176
        for ring_idx,r in enumerate(RINGS):
            R=mat_y(r['speed']*phase)@mat_z(r['roll'])@mat_x(r['tilt'])@mat_y(r['yaw'])
            theta=np.linspace(0,TAU,samples+1,dtype=np.float64)
            cs=np.cos(theta);sn=np.sin(theta)
            unit=np.stack((cs,sn,np.zeros_like(cs)),axis=-1)
            unit_world=unit@R.T
            normal_world=R@np.array([0.,0.,1.])
            n_sheet=normal_world
            for i in range(samples):
                a=float(theta[i]);rad0=unit[i];rad1=unit[i+1]
                # Raised strip, not a wire. Thickness is visible under oblique views.
                inner=r['radius']-r['width']*.70
                outer=r['radius']+r['width']*.70
                depth=r['width']*.31
                def xyz(rad,z,at):
                    return unit_world[at]*rad+normal_world*z
                # Surface subdivisions create clean bright bevels along the metal band.
                for k,(lo,hi,material) in enumerate(((0,.22,.78),(.22,1.,1.08))):
                    ra=inner+(outer-inner)*lo; rb=inner+(outer-inner)*hi
                    for sign in (1,-1):
                        z=depth*sign
                        verts=np.stack((xyz(ra,z,i),xyz(ra,z,i+1),xyz(rb,z,i+1),xyz(rb,z,i)))
                        col=self._metal_color(n_sheet*sign,a,material if sign>0 else material*.67,ring_idx)
                        faces.append((float(np.mean(verts[:,2])),verts,col))
                for rr,face_sign in ((inner,-1),(outer,1)):
                    verts=np.stack((xyz(rr,-depth,i),xyz(rr,-depth,i+1),xyz(rr,depth,i+1),xyz(rr,depth,i)))
                    normal=R@(face_sign*(rad0+rad1)*.5)
                    col=self._metal_color(normal,a,1.06,ring_idx)
                    faces.append((float(np.mean(verts[:,2])),verts,col))
        faces.sort(key=lambda item:item[0])
        return faces

    def _draw_face(self,canvas,depth_buffer,face):
        z,points,color=face
        coords=project(points,self.cx,self.cy,self.geometry_scale)
        pts=np.rint(coords).astype(np.int32)
        left=max(0,int(pts[:,0].min())-1);right=min(self.w,int(pts[:,0].max())+2)
        top=max(0,int(pts[:,1].min())-1);bottom=min(self.h,int(pts[:,1].max())+2)
        if left>=right or top>=bottom:return
        mask=np.zeros((bottom-top,right-left),np.uint8)
        local=pts-np.array([left,top],np.int32)
        cv2.fillConvexPoly(mask,local,255,lineType=cv2.LINE_AA)
        roi=depth_buffer[top:bottom,left:right]
        accept=(mask>0)&(z>roi+.005)
        if not np.any(accept):return
        img=canvas[top:bottom,left:right]
        # Preserve antialiased polygon edges, with a real per-pixel depth test
        # against the animated globe and all previous metallic surfaces.
        alpha=mask.astype(np.float32)/255.0
        a=alpha[accept,None]
        img[accept]=np.clip(img[accept].astype(np.float32)*(1-a)+np.array(color,np.float32)*a,0,255).astype(np.uint8)
        roi[accept]=z

    def frame(self,i,n):
        phase=TAU*(i % n)/n
        img=self.base.copy()
        # Stage and floor react coherently to the central core.
        pulse=(.5+.5*math.cos(phase))*self.floor_mask[...,None]
        img=np.clip(img.astype(np.float32)+pulse*np.array([5.,10.,19.],np.float32),0,255).astype(np.uint8)
        self._draw_orb(img,phase)
        depth=np.full((self.h,self.w),-1.e7,np.float32)
        oh,ow=self.orb_mask.shape
        x=int(round(self.cx-ow/2));y=int(round(self.cy-oh/2))
        sx=max(0,x);sy=max(0,y);ex=min(self.w,x+ow);ey=min(self.h,y+oh)
        if ex>sx and ey>sy:
            ox=sx-x;oy=sy-y
            d=self.orb_mask[oy:oy+ey-sy,ox:ox+ex-sx]
            z=self.orb_xyz[oy:oy+ey-sy,ox:ox+ex-sx,2]*self.orb_r
            depth[sy:ey,sx:ex][d]=z[d]
        for face in self._ribbon_faces(phase):self._draw_face(img,depth,face)
        # Lighting bloom confined to existing orb/ring pixels. Its small
        # amplitude prevents detached artificial gold streaks in empty sky.
        return img



def encode(scene,out,fps,seconds,fmt,preview_only=False,keep_master=False):
    out.mkdir(parents=True,exist_ok=True)
    count=int(round(fps*seconds))
    assert abs(count/fps-seconds)<1e-8
    first=scene.frame(0,count)
    cv2.imwrite(str(out/'hero-v12-first-frame.png'),first)
    cv2.imwrite(str(out/'hero-v12-phase-quarter.png'),scene.frame(count//4,count))
    cv2.imwrite(str(out/'hero-v12-phase-half.png'),scene.frame(count//2,count))
    cv2.imwrite(str(out/'hero-v12-phase-three-quarters.png'),scene.frame(count*3//4,count))
    assert np.array_equal(first,scene.frame(count,count)), 'Frame loop mismatch'
    orig=ring_points(RINGS[0],0)
    displaced=ring_points(RINGS[0],TAU/4.)
    assert np.max(np.abs(orig-displaced))>55, '3D geometry must move, not just illumination'
    metadata={'scene':'observatory-3d-microfacet-v12','status':'review-only', 'owner_approved':False,'production_eligible':False,
              'geometry':'Rigid 3D copper bands with GGX-inspired microfacet direct/ambient terms, per-pixel ring/orb depth tests and distinct portrait cover-camera; not measured PBR or ray tracing',
              'camera':{'viewport':'portrait' if scene.h>scene.w else 'landscape','scale_to_source':scene.factor,'geometry_scale':scene.geometry_scale,'centroid_x':scene.cx,'centroid_y':scene.cy, 'source_plate_sha256':scene.plate_sha256},
              'dimensions':[scene.w,scene.h], 'fps':fps, 'duration_seconds':seconds,
              'frames':count,'loop_exact':True,'ring_endpoint_error':world_geometry_endpoints(),
              'world_displacement_at_quarter_phase':float(np.max(np.abs(orig-displaced))), 'outputs':{}}
    if preview_only:
        (out/'hero-v12-metadata.json').write_text(json.dumps(metadata,indent=2))
        return metadata
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise RuntimeError('ffmpeg and ffprobe required')
    variant='mobile' if scene.h>scene.w else 'desktop'
    # Render geometry ONCE into a lossless FFV1 master. H.264 and VP9 then
    # derive from identical source frames rather than separately rerendering.
    # Intermediate is discarded unless explicitly requested in review mode.
    master=out / f'hero-v12-{variant}-lossless.mkv'
    master_cmd=['ffmpeg','-hide_banner','-loglevel','error','-y',
                '-f','rawvideo','-pixel_format','bgr24',
                '-video_size',f'{scene.w}x{scene.h}', '-framerate',str(fps),
                '-i','pipe:0','-an','-c:v','ffv1','-level','3',
                '-pix_fmt','bgr0',str(master)]
    t0=time.monotonic()
    proc=subprocess.Popen(master_cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for i in range(count):
            proc.stdin.write(scene.frame(i,count).tobytes())
        proc.stdin.close()
        err=proc.stderr.read().decode('utf-8',errors='replace')
        if proc.wait()!=0:raise RuntimeError('FFV1 master failed: '+err[-900:])
    finally:
        if proc.poll() is None:proc.terminate()
    meta_master={
        'codec':'ffv1','lossless':True,'frames':count,
        'bytes':master.stat().st_size,
        'sha256':hashlib.sha256(master.read_bytes()).hexdigest(),
        'seconds':round(time.monotonic()-t0,2),
        'kept_on_disk':bool(keep_master),
    }
    metadata['master']=meta_master
    enc=[(f'hero-v12-{variant}.mp4',['-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart'])]
    if fmt=='both':
        enc.append((f'hero-v12-{variant}.webm',['-c:v','libvpx-vp9','-deadline','good','-cpu-used','4','-b:v','0','-crf','29','-pix_fmt','yuv420p']))
    for name,codec in enc:
        t0=time.monotonic()
        cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master),
             '-map','0:v:0','-an',*codec,str(out/name)]
        try:
            subprocess.run(cmd,check=True,capture_output=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f'{name} transcode error: {e.stderr.decode(errors="replace")[-1200:]}') from e
        info=json.loads(subprocess.check_output([
           'ffprobe','-v','error','-select_streams','v:0',
           '-show_entries','stream=codec_name,width,height,nb_frames,r_frame_rate,duration',
           '-of','json',str(out/name)],text=True))
        stream=info['streams'][0]
        if (stream['width'],stream['height']) != (scene.w,scene.h):
            raise RuntimeError('Unexpected encoded output dimensions')
        metadata['outputs'][name]={
            'bytes':(out/name).stat().st_size,
            'sha256':hashlib.sha256((out/name).read_bytes()).hexdigest(),
            'probe':stream,
            'transcode_seconds':round(time.monotonic()-t0,2),
            'derived_from_master_sha256':meta_master['sha256'],
        }
    if not keep_master:
        master.unlink()
    (out/'hero-v12-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
    return metadata


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--plate',required=True,type=Path)
    p.add_argument('--output',required=True,type=Path)
    p.add_argument('--width',type=int,default=960)
    p.add_argument('--height',type=int,default=540)
    p.add_argument('--fps',type=int,default=20)
    p.add_argument('--seconds',type=float,default=6.0)
    p.add_argument('--format',choices=['mp4','both'],default='mp4')
    p.add_argument('--preview-only',action='store_true')
    p.add_argument('--keep-master',action='store_true',help='retain the large FFV1 intermediate for archival review')
    a=p.parse_args()
    if a.width<320 or a.width>3840 or a.height<180 or a.height>2160 or a.width%2 or a.height%2 or a.fps<10 or a.fps>60 or a.seconds<2 or a.seconds>16:
        p.error('Even width/height, dimensions in 320..3840 x 180..2160, fps 10..60 and duration 2..16 required')
    if abs(round(a.fps*a.seconds)-a.fps*a.seconds)>1e-8:p.error('Whole-frame loop duration required')
    print(json.dumps(encode(ArmillaryScene(a.plate,a.width,a.height),a.output,a.fps,a.seconds,a.format,a.preview_only,a.keep_master),indent=2))

if __name__=='__main__':main()
