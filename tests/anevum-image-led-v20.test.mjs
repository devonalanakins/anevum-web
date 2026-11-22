import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const path='scripts/ops/render-anevum-image-led-hero-v20.py';
const source=readFileSync(path,'utf8');

test('V20 hero renderer stays offline, image-led, and explicitly unapproved',()=>{
 assert.match(source,/ANEVUM\.WEB\.BUILD\.2026-11-14\.003\.IMAGE-REGISTERED-ATMOSPHERIC-HERO/);
 assert.match(source,/source plate itself, not drawn as new rings/);
 assert.match(source,/copper = np\.clip\(/);
 assert.match(source,/ring = copper \* np\.exp\(/);
 assert.match(source,/frame = base\.astype\(np\.float32\)/);
 assert.match(source,/np\.cos\(angle - phase\)/);
 assert.match(source,/duration',type=int,default=8/);
 assert.match(source,/fps',type=int,default=24/);
 assert.match(source,/status':'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'/);
 assert.match(source,/owner_accepted':False,'licensed_for_publication':False/);
 assert.match(source,/not_a_physical_rotation':True/);
 assert.match(source,/Output must be empty; no overwrite of prior media/);
 assert.doesNotMatch(source,/\b(?:requests|urllib|aiohttp|boto3)\b|https?:\/\/|subprocess\.run\(\['wrangler'/);
});

test('V20 renderer parses with stdlib and never puts binaries in public Worker source tree',()=>{
 const check=spawnSync('python',['-c','import ast,sys;ast.parse(open(sys.argv[1],encoding="utf8").read())',path],{encoding:'utf8'});
 assert.equal(check.status,0,check.stderr);
 for(const filename of ['hero-desktop.mp4','hero-mobile.mp4','hero-desktop.webm','hero-mobile.webm']){
  assert.equal(existsSync('apps/anevum-public-studio/review/assets/'+filename),false);
  assert.equal(existsSync('apps/anevum-public-studio/assets/motion/'+filename),false);
 }
});
