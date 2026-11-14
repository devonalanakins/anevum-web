import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const path='scripts/ops/render-anevum-research-image-led-v21.py';
const source=readFileSync(path,'utf8');

test('V21 Research renderer follows original art rather than generating geometric models',()=>{
 assert.match(source,/RESEARCH-IMAGE-REGISTERED-FLOW/);
 assert.match(source,/STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'/);
 assert.match(source,/terrain = cyan \* safe/);
 assert.match(source,/terrain_light = layers\['terrain'\]/);
 assert.match(source,/geometry_reconstructed':False/);
 assert.match(source,/rights_verified':False,'owner_accepted':False/);
 assert.match(source,/Source poster resolution is below review minimum/);
 assert.match(source,/Never overwrite previous owner review video/);
 assert.match(source,/STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED'/);
 assert.doesNotMatch(source,/https?:\/\/|subprocess\.run\(\['wrangler'|boto3|Cloudflare|requests\.post/);
});
test('V21 renderer parses and never adds clips under public source assets',()=>{
 const ast=spawnSync('python',['-c','import ast,sys;ast.parse(open(sys.argv[1],encoding="utf8").read())',path],{encoding:'utf8'});
 assert.equal(ast.status,0,ast.stderr);
 for(const file of ['research.mp4','research.webm']){
  assert.equal(existsSync('apps/anevum-public-studio/review/assets/'+file),false);
  assert.equal(existsSync('apps/anevum-public-studio/assets/motion/'+file),false);
 }
});
