import test from 'node:test';
import assert from 'node:assert/strict';
import {startCinematicPlayback,MAX_ACTIVE_CINEMATIC_DECODES} from '../apps/anevum-public-studio/living-laboratory-cinema-controller.mjs';
import {readFileSync} from 'node:fs';

class Target {
 constructor(){this.handlers=new Map()}
 addEventListener(name,callback){if(!this.handlers.has(name))this.handlers.set(name,new Set());this.handlers.get(name).add(callback)}
 removeEventListener(name,callback){this.handlers.get(name)?.delete(callback)}
 dispatch(name){for(const fn of this.handlers.get(name)||[])fn()}
}
class Video extends Target {
 constructor(name,valid=true){
  super();this.dataset={cinemaMp4:valid?'/original-works/assets/motion/'+name.repeat(24)+'.mp4':'https://example.net/unapproved.mp4',cinemaWebm:'/original-works/assets/motion/'+name.repeat(24)+'.webm'};
  this.attributes=new Map();this.classList={set:new Set(),add:(v)=>this.classList.set.add(v),remove:(v)=>this.classList.set.delete(v),contains:(v)=>this.classList.set.has(v)};
  this.playCount=0;this.pauseCount=0;this.loadCount=0;this.playResult=Promise.resolve();
 }
 canPlayType(){return 'probably'}
 setAttribute(k,v){this.attributes.set(k,v)}
 getAttribute(k){return this.attributes.get(k)||null}
 removeAttribute(k){this.attributes.delete(k)}
 load(){this.loadCount++}
 play(){this.playCount++;return this.playResult}
 pause(){this.pauseCount++}
}
function environment(videos){
 const doc=new Target();doc.hidden=false;doc.querySelectorAll=()=>videos;
 const reduced=new Target();reduced.matches=false;const reducedData=new Target();reducedData.matches=false;
 const connection=new Target();connection.saveData=false;
 const portrait=new Target();portrait.matches=false;
 const win=new Target();const observers=[];win.matchMedia=q=>q.includes('max-width: 720px')?portrait:q.includes('reduced-motion')?reduced:reducedData;
 win.IntersectionObserver=class {
   constructor(callback,opts){this.callback=callback;this.options=opts;this.disconnected=false;this.targets=new Set();observers.push(this)}
   observe(v){this.targets.add(v)}
   disconnect(){this.disconnected=true}
   update(entries){this.callback(entries.map(([target,ratio])=>({target,isIntersecting:ratio>0,intersectionRatio:ratio})))}
 };
 return {doc,win,reduced,reducedData,portrait,connection,observers,videos,
  start:()=>startCinematicPlayback({root:doc,viewport:win,connection})};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('cinema engine is inert on the current public worker and rejects invalid environments',()=>{
 const publicWorker=readFileSync('apps/anevum-public-studio/worker.mjs','utf8');
 assert.match(publicWorker,/hasApprovedCinematicMotion\(\)/);
 assert.match(publicWorker,/scriptHash='sha256-'/);
 assert.doesNotMatch(publicWorker,/script-src 'self'/);
 assert.equal(MAX_ACTIVE_CINEMATIC_DECODES,2);
 assert.throws(()=>startCinematicPlayback({root:null,viewport:null}),/Invalid cinematic/);
 const empty=environment([]);
 assert.equal(empty.start().stop(),undefined);
});

test('viewport play budget is capped at two and offscreen videos unload to posters',async()=>{
 const videos=['a','b','c'].map(c=>new Video(c));const e=environment(videos);const run=e.start();
 assert.equal(e.observers.length,1);assert.equal(e.observers[0].targets.size,3);
 const observer=e.observers[0];
 observer.update([[videos[0],0.9],[videos[1],0.6],[videos[2],0.5]]);
 assert.deepEqual(videos.map(v=>v.playCount),[1,1,0]);
 assert.deepEqual(videos.map(v=>v.loadCount),[1,1,0]);
 videos[0].dispatch('playing');assert.equal(videos[0].classList.contains('is-playing'),true);
 observer.update([[videos[0],0],[videos[1],0.8],[videos[2],0.7]]);
 assert.deepEqual(videos.map(v=>v.playCount),[1,1,1]);
 assert.equal(videos[0].getAttribute('src'),null);
 assert.equal(videos[0].classList.contains('is-playing'),false);
 assert.equal(videos[0].pauseCount,1);
 e.doc.hidden=true;e.doc.dispatch('visibilitychange');
 assert.equal(videos[1].getAttribute('src'),null);
 assert.equal(videos[2].getAttribute('src'),null);
 e.doc.hidden=false;e.doc.dispatch('visibilitychange');
 assert.equal(videos[1].playCount,2);
 await tick();run.stop();
 assert.equal(observer.disconnected,true);
 assert.equal(videos[1].getAttribute('src'),null);
 observer.update([[videos[0],1],[videos[1],1]]);
 assert.equal(videos[0].playCount,1);
});

test('reduced motion, reduced data, and Save-Data prevent video loads',()=>{
 const videos=[new Video('d')],e=environment(videos);e.reduced.matches=true;const run=e.start();
 const observer=e.observers[0];observer.update([[videos[0],1]]);
 assert.equal(videos[0].playCount,0);
 e.reduced.matches=false;e.reducedData.matches=true;e.reduced.dispatch('change');
 assert.equal(videos[0].playCount,0);
 e.reducedData.matches=false;e.connection.saveData=true;e.reducedData.dispatch('change');
 assert.equal(videos[0].playCount,0);
 e.connection.saveData=false;e.connection.dispatch('change');
 assert.equal(videos[0].playCount,1);
 e.reduced.matches=true;e.reduced.dispatch('change');
 assert.equal(videos[0].getAttribute('src'),null);
 run.stop();
});

test('invalid URLs never load and playback errors keep the poster visible',async()=>{
 const good=new Video('e'),bad=new Video('f',false),e=environment([good,bad]),run=e.start(),obs=e.observers[0];
 obs.update([[bad,1],[good,.5]]);
 assert.equal(bad.playCount,0);
 assert.equal(good.playCount,1);
 good.dispatch('playing');assert.equal(good.classList.contains('is-playing'),true);
 good.dispatch('error');assert.equal(good.classList.contains('is-playing'),false);
 assert.equal(good.getAttribute('src'),null);
 obs.update([[good,1]]);
 assert.equal(good.playCount,1);
 run.stop();

 const reject=new Video('1');let rejectNow;reject.playResult=new Promise((resolve,reject)=>{rejectNow=reject});
 const f=environment([reject]),second=f.start();
 f.observers[0].update([[reject,1]]);
 assert.equal(reject.playCount,1);
 rejectNow(new Error('autoplay denied'));await tick();
 assert.equal(reject.getAttribute('src'),null);
 f.observers[0].update([[reject,1]]);
 assert.equal(reject.playCount,1);
 second.stop();
});

test('old promise rejection after scroll exit does not poison later playback',async()=>{
 const video=new Video('2');let rejectOld;
 video.playResult=new Promise((resolve,reject)=>{rejectOld=reject});
 const e=environment([video]);const run=e.start(),obs=e.observers[0];
 obs.update([[video,1]]);
 obs.update([[video,0]]);
 rejectOld(new Error('AbortError'));await tick();
 video.playResult=Promise.resolve();
 obs.update([[video,1]]);
 assert.equal(video.playCount,2);
 run.stop();
});


test('approved portrait master swaps at breakpoint, retaining bounded decoder count',()=>{
 const hero=new Video('3');hero.dataset.cinemaScene='hero';
 hero.dataset.cinemaMobileMp4='/original-works/assets/motion/'+('4'.repeat(24))+'.mp4';
 hero.dataset.cinemaMobileWebm='/original-works/assets/motion/'+('5'.repeat(24))+'.webm';
 const e=environment([hero]),run=e.start(),obs=e.observers[0];
 obs.update([[hero,1]]);
 assert.equal(hero.getAttribute('src'),'/original-works/assets/motion/'+('3'.repeat(24))+'.webm');
 assert.equal(hero.playCount,1);
 e.portrait.matches=true;e.portrait.dispatch('change');
 assert.equal(hero.getAttribute('src'),hero.dataset.cinemaMobileWebm);
 assert.equal(hero.playCount,2);
 assert.equal(hero.pauseCount,1);
 e.portrait.matches=false;e.portrait.dispatch('change');
 assert.equal(hero.getAttribute('src'),hero.dataset.cinemaWebm);
 assert.equal(hero.playCount,3);
 run.stop();
 assert.equal(hero.getAttribute('src'),null);
});
