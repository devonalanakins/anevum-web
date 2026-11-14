import base64
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

MODULE = Path(__file__).resolve().parents[1] / 'scripts/ops/build-anevum-lightweight-review.py'
spec = importlib.util.spec_from_file_location('review', MODULE)
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)


def encoded(mime: str, num: int) -> str:
    if mime == 'image/webp': data = b'RIFF\x1c\x00\x00\x00WEBPVP8 '+bytes([num])*36
    elif mime == 'video/mp4': data = b'\x00\x00\x00\x18ftypmp42'+bytes([num])*36
    else: data = bytes([0x1a,0x45,0xdf,0xa3])+bytes([num])*40
    return f'data:{mime};base64,'+base64.b64encode(data).decode('ascii')


def fixture(bad_magic=False) -> str:
    p=['<!doctype html><html><head><title>ANEVUM — V21 Research Motion Review</title></head><body>']
    p+=['<div class="scene hero-scene" data-scene="hero" data-video-ready="true"']
    for key,mime,k in [('data-video-webm','video/webm',1),('data-video-mp4','video/mp4',2),('data-mobile-webm','video/webm',3),('data-mobile-mp4','video/mp4',4)]:
        p.append(f' {key}="{encoded(mime,k)}"')
    p+=['>','<source srcset="'+encoded('image/webp',5)+'">','<img src="'+encoded('image/webp',6)+'"></div>']
    p+=['<a data-scene="research" data-video-ready="true"']
    p+=[' data-video-webm="'+encoded('video/webm',7)+'"',' data-video-mp4="'+encoded('video/mp4',8)+'">']
    p+=['<img src="'+(encoded('video/mp4',9) if bad_magic else encoded('image/webp',9))+'"></a>']
    for i,name in enumerate(['experiments','experiences','archive'],10):
        p+=['<a data-scene="'+name+'" data-video-ready="false"><img src="'+encoded('image/webp',i)+'"></a>']
    p+=['<button type="button" id="review-sample">Play included Research motion study</button>']
    p+=['<script id="review-sample-data" type="text/plain">QUFBQQ==</script>']
    p+=['<script type="module">']
    p+=['if (!src || !/^(?:data:video\\/(?:webm|mp4);base64,[A-Za-z0-9+\\/=]+|\\/original-works\\/assets\\/motion\\/[a-z0-9-]+\\.(?:webm|mp4))$/.test(src)) continue;']
    p+=["  document.querySelector('#review-sample').addEventListener('click',()=>{", "    try { console.log('sample'); } catch {}", "  });"]
    p+=["  picker.addEventListener('change',()=>{});"]
    p+=['</script>','<!-- '+('X'*1020)+' --></body></html>']
    return '\n'.join(p)


class BuildTest(unittest.TestCase):
    def test_lightweight_detached_media_hashes_and_zip(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);src=root/'old.html';out=root/'new';archive=root/'review.zip';src.write_text(fixture())
            manifest=review.build(src,out)
            self.assertEqual(manifest['status'],review.STATUS)
            self.assertFalse(manifest['published'])
            self.assertEqual(len(manifest['files']),12)
            html=(out/'index.html').read_text()
            self.assertNotIn('base64,',html)
            self.assertNotIn('review-sample',html)
            self.assertIn('Lightweight Cinematic',html)
            self.assertIn('media\\/[a-f0-9]{24}',html)
            self.assertLess(len(html),3000)
            for item in manifest['files']:
                target=out/item['path'];self.assertEqual(target.stat().st_size,item['bytes'])
                self.assertEqual(review.sha(target.read_bytes()),item['sha256'])
            review.pack(out,archive)
            with ZipFile(archive) as z:
                self.assertIsNone(z.testzip())
                self.assertEqual(len(z.namelist()),15) # 12 assets + html, readme, manifest
            with self.assertRaises(FileExistsError):review.build(src,out)
    def test_reject_wrong_media_type_before_writing(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);src=root/'old.html';out=root/'new';src.write_text(fixture(True))
            with self.assertRaises(ValueError):review.build(src,out)
            self.assertFalse(out.exists())
    def test_reject_unexpected_review_scope(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);src=root/'old.html';out=root/'new'
            src.write_text(fixture().replace('data-scene="archive"','data-scene="hidden"'))
            with self.assertRaises(ValueError):review.build(src,out)
            self.assertFalse(out.exists())


if __name__=='__main__':unittest.main()
