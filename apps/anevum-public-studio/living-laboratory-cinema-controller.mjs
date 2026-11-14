/**
 * ANEVUM.WEB.BUILD.2026-11-14.009.CINEMATIC-PLAYBACK-ENGINE
 *
 * Production-target controller for approved, same-origin, textless video.
 * Not loaded by the public Worker until owner-approved motion is registered.
 * The static poster, native links, and no-JS experience remain authoritative.
 */
const MEDIA_URL=/^\/original-works\/assets\/motion\/[a-f0-9]{24}\.(?:mp4|webm)$/;
export const MAX_ACTIVE_CINEMATIC_DECODES=2;
const MIN_VISIBLE_RATIO=0.25;

export function startCinematicPlayback({
  root=globalThis.document,
  viewport=globalThis.window,
  connection=globalThis.navigator?.connection,
  maxActive=MAX_ACTIVE_CINEMATIC_DECODES
}={}){
  if (!root || !viewport || !Number.isInteger(maxActive) || maxActive<1 || maxActive>MAX_ACTIVE_CINEMATIC_DECODES) {
    throw new TypeError('Invalid cinematic playback environment or decode cap');
  }
  const videos=[...root.querySelectorAll('video[data-cinema-approved="true"]')];
  if (!videos.length) return {stop(){}};
  const MotionObserver=viewport.IntersectionObserver;
  if (typeof MotionObserver!=='function') return {stop(){}}; // remain poster-only

  const motion=viewport.matchMedia?.('(prefers-reduced-motion: reduce)');
  const data=viewport.matchMedia?.('(prefers-reduced-data: reduce)');
  const portrait=viewport.matchMedia?.('(max-width: 720px)');
  const visible=new Map();
  const active=new Set();
  const failed=new Set();
  const listeners=[];
  let stopped=false;

  function observe(target,event,fn){
    target?.addEventListener?.(event,fn);
    if(target?.removeEventListener)listeners.push(()=>target.removeEventListener(event,fn));
  }
  function allowedURL(value,extension){
    return typeof value==='string' && MEDIA_URL.test(value) && value.endsWith('.'+extension);
  }
  function sourceFor(video){
    const mobile=portrait?.matches===true && video.dataset.cinemaScene==='hero';
    const hasPortrait=mobile && video.dataset.cinemaMobileMp4 && video.dataset.cinemaMobileWebm;
    const mp4=hasPortrait ? video.dataset.cinemaMobileMp4 : video.dataset.cinemaMp4;
    const webm=hasPortrait ? video.dataset.cinemaMobileWebm : video.dataset.cinemaWebm;
    if (!allowedURL(mp4,'mp4') || !allowedURL(webm,'webm')) return null;
    const webmSupport=video.canPlayType?.('video/webm; codecs="vp9"');
    return webmSupport==='probably'||webmSupport==='maybe' ? webm : mp4;
  }
  function blocked(){
    return stopped || root.hidden || motion?.matches===true || data?.matches===true || connection?.saveData===true;
  }
  function unload(video){
    if (!active.has(video)) return;
    try{video.pause()}catch{}
    video.classList.remove('is-playing');
    video.removeAttribute('src');
    video.load?.();
    active.delete(video);
  }
  function sync(){
    if(blocked()){
      for(const v of [...active])unload(v);
      return;
    }
    const candidates=videos.filter(v=>(visible.get(v)||0)>=MIN_VISIBLE_RATIO && !failed.has(v))
      .sort((a,b)=>(visible.get(b)||0)-(visible.get(a)||0));
    const desired=new Set(candidates.slice(0,maxActive));
    for(const v of [...active])if(!desired.has(v) || v.getAttribute('src')!==sourceFor(v))unload(v);
    for(const video of desired){
      if(active.has(video))continue;
      const src=sourceFor(video);
      if(!src){failed.add(video);continue}
      active.add(video);
      video.preload='none';
      video.muted=true;
      video.playsInline=true;
      video.loop=true;
      video.setAttribute('src',src); // a validated same-origin, content-addressed URL
      try{
        video.load?.();
        const outcome=video.play();
        outcome?.catch?.(()=>{
          // An AbortError from scrolling away must not poison later playback.
          if (!active.has(video) || video.getAttribute('src')!==src) return;
          failed.add(video);
          unload(video); // poster remains visible on genuine autoplay rejection
        });
      }catch{
        failed.add(video);
        unload(video);
      }
    }
  }
  const observer=new MotionObserver(entries=>{
    for(const entry of entries)if(videos.includes(entry.target)){
      visible.set(entry.target,entry.isIntersecting ? Math.max(0,entry.intersectionRatio||0) : 0);
    }
    sync();
  },{threshold:[0,MIN_VISIBLE_RATIO,0.5,1]});

  for(const video of videos){
    // Invalid URLs never produce network traffic, even if the element is visible.
    const valid=sourceFor(video)!==null;
    if(!valid){failed.add(video);continue}
    observe(video,'playing',()=>{if(active.has(video)&&!blocked())video.classList.add('is-playing')});
    observe(video,'error',()=>{failed.add(video);unload(video)});
    observe(video,'stalled',()=>{video.classList.remove('is-playing')});
    observer.observe(video);
  }
  observe(root,'visibilitychange',sync);
  observe(viewport,'pagehide',()=>{for(const v of [...active])unload(v)});
  observe(viewport,'pageshow',sync);
  observe(motion,'change',sync);
  observe(data,'change',sync);
  observe(portrait,'change',sync);
  observe(connection,'change',sync);

  return {
    stop(){
      if(stopped)return;
      stopped=true;
      observer.disconnect();
      for(const v of [...active])unload(v);
      for(const detach of listeners)detach();
      visible.clear();
    }
  };
}


/**
 * Embed only for an owner-cleared, asset-backed manifest. This preserves a
 * completely script-free home for the current empty production registry.
 * Bootstrap derives from the exact tested function, preventing drift.
 */
export function renderApprovedCinematicBootstrap(){
 const js='const MEDIA_URL='+MEDIA_URL.toString()+';\n'+
  'const MAX_ACTIVE_CINEMATIC_DECODES='+MAX_ACTIVE_CINEMATIC_DECODES+';\n'+
  'const MIN_VISIBLE_RATIO='+MIN_VISIBLE_RATIO+';\n'+
  startCinematicPlayback.toString()+';\nstartCinematicPlayback();';
 if(js.includes('</script'))throw new Error('Unsafe cinematic bootstrap source');
 return '<script type="module" data-cinema-bootstrap="approved">'+js+'</script>';
}
