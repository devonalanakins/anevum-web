import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../apps/anevum-public-studio/review/cinematic-laboratory.html',import.meta.url),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1]||'';
const css=html.match(/<style>([\s\S]*?)<\/style>/)?.[1]||'';
const scenes=['hero','experiments','research','experiences','archive'];

test('cinematic preview remains isolated and video assets are fail-closed',()=>{
 for(const name of scenes)assert.match(html,new RegExp('data-scene="'+name+'"[^>]*data-video-ready="false"'));
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.equal((html.match(/data-video-ready="true"/g)||[]).length,0);
 assert.equal((html.match(/<video\b/g)||[]).length,5);
 assert.ok(!html.includes('data-video-ready="true"'));
});
test('public SEO and app route boundaries remain separate',()=>{
 assert.match(html,/noindex,nofollow,noarchive/);
 for(const path of ['/original-works/experiments','/original-works/research','/original-works/archive'])assert.ok(html.includes('href="'+path+'"'),path);
 for(const forbidden of ['href="/staff"','href="/member"','href="/api/'])assert.ok(!html.includes(forbidden),forbidden);
});
test('semantic controls and reduced-motion responsive fallbacks exist',()=>{
 assert.match(html,/<a class="skip" href="#main">/);
 assert.match(html,/<main id="main" tabindex="-1">/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/aria-label="Primary navigation"/);
 assert.match(html,/aria-label="Mobile navigation"/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('media controller gates visibility and bandwidth before playback',()=>{
 for(const token of ['IntersectionObserver',"visibilitychange","video.pause()","connection?.saveData === true","let remaining=2","scene.dataset.videoReady !== 'true"'])assert.ok(script.includes(token),token);
 assert.match(script,/\.play\(\)\.catch\(/);
 assert.doesNotMatch(script,/fetch\s*\(|localStorage|sessionStorage/);
});
