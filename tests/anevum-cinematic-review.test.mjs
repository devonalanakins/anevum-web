// Isolated review contract; intentionally does not certify final motion footage.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../apps/anevum-public-studio/review/cinematic-laboratory.html',import.meta.url),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
const styles=html.match(/<style>([\s\S]*?)<\/style>/)?.[1];

test('cinematic review retains owner-approved public boundaries',()=>{
 assert.match(html,/<title>ANEVUM/);
 assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive">/);
 assert.equal((html.match(/<main\b/g)||[]).length,1);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/<a class="skip" href="#main">/);
 assert.match(html,/href="\/" aria-label="ANEVUM home"/);
 assert.match(html,/href="\/original-works\/experiments"/);
 assert.match(html,/href="\/original-works\/research"/);
 assert.match(html,/href="\/original-works\/archive"/);
 for(const anchor of [...html.matchAll(/href="#([a-z0-9-]+)"/g)]){
   assert.match(html,new RegExp('id="'+anchor[1]+'"'));
 }
 assert.doesNotMatch(html,/<form\b|\/member\b|\/staff\b|\/api\b/i);
});

test('all five independent media zones fail closed without approved video',()=>{
 assert.equal((html.match(/data-scene="(?:hero|experiments|research|experiences|archive)"/g)||[]).length,5);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.equal((html.match(/<video class="scene-video"/g)||[]).length,5);
 assert.doesNotMatch(html,/<video[^>]*\bautoplay\b/i);
 assert.doesNotMatch(html,/<video[^>]*\bsrc=/i);
 const paths=[...html.matchAll(/data-(?:video|mobile)-(?:webm|mp4)="([^"]+)"/g)];
 assert.equal(paths.length,12);
 for(const [,url] of paths) assert.match(url,/^\/original-works\/assets\/motion\/[a-z0-9-]+\.(webm|mp4)$/);
 assert.equal((html.match(/class="scene-poster/g)||[]).length,5);
});

test('review uses five exact same-branch visual references (never live assets)',()=>{
 const matches=[...html.matchAll(/<img class="scene-poster[^"]*" src="\.\/assets\/([a-z-]+\.webp)"/g)];
 const actual=matches.map(x=>x[1]).sort();
 const expected=['hero.webp','experiments.webp','research.webp','experiences.webp','archive.webp'].sort();
 assert.deepEqual(actual,expected);
 assert.match(html,/href="\.\/assets\/hero\.webp"/);
 for(const name of expected){
   const bytes=readFileSync(new URL('../apps/anevum-public-studio/review/assets/'+name,import.meta.url));
   assert.ok(bytes.byteLength>8000,'review image is not meaningful: '+name);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
});

test('runtime has bounded playback, session visibility, and accessible still-mode fallbacks',()=>{
 assert.ok(script && styles,'inline resources must exist for independent review');
 new Script(script,{filename:'cinematic-laboratory.js'});
 assert.match(script,/IntersectionObserver/);
 assert.match(script,/remaining=2/);
 assert.match(script,/document\.visibilityState === 'visible'/);
 assert.match(script,/connection\?\.saveData === true/);
 assert.match(script,/prefers-reduced-motion: reduce/);
 assert.match(script,/scene\.dataset\.videoReady !== 'true'/);
 assert.match(script,/video\.muted = true/);
 assert.match(script,/video\.playsInline = true/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(styles,/@media\(forced-colors:active\)/);
 assert.match(html,/aria-label="Primary navigation"/);
 assert.match(html,/aria-label="Mobile navigation"/);
 assert.match(html,/loading="lazy"/);
});
