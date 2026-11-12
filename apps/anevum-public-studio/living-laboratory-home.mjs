/**
 * ANEVUM living laboratory — first public-homepage source increment.
 * Review-only: no production deployment, protected routes, or email settings are changed.
 * Content is static, public-safe and has no runtime dependencies or client scripts.
 */
const STYLES = String.raw`
:root{color-scheme:dark;--void:#09070d;--deep:#110d17;--surface:#17111e;--line:#53475684;--ivory:#eee7e4;--muted:#b9aebb;--copper:#dda884;--purple:#9d78cb;--display:Georgia,'Times New Roman',serif;--sans:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;background:var(--void)}
body{margin:0;background:radial-gradient(ellipse at 75% 8%,#33203d55,transparent 40%),linear-gradient(#0a080f,#0b0910 73%,#120d17);color:var(--ivory);font:15px/1.55 var(--sans);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}a:focus-visible,summary:focus-visible{outline:2px solid #f1bf9b;outline-offset:5px}
::selection{background:#9168ae;color:white}
.lab-skip{position:absolute;top:-100px;left:20px;z-index:200;padding:12px 18px;background:#f2c3a2;color:#130b14}.lab-skip:focus{top:14px}
.lab-wrap{width:min(1440px,calc(100% - 88px));margin-inline:auto}
.lab-header{position:relative;z-index:20;border-bottom:1px solid #e5c7d21a;background:#0c0912d9}
.lab-head-inner{min-height:83px;display:flex;align-items:center;justify-content:space-between;gap:32px}
.lab-brand{display:inline-flex;align-items:center;gap:15px;min-height:48px}
.lab-brand svg{width:45px;height:45px;flex-shrink:0}
.lab-brand span{font:23px/1 var(--display);letter-spacing:.38em}
.lab-nav{display:flex;align-items:center;gap:clamp(17px,2.6vw,46px)}
.lab-nav a,.lab-mobile nav a{font-size:10px;letter-spacing:.21em;text-transform:uppercase;font-weight:650;color:#d0c4d1;transition:color .18s}
.lab-nav a:hover,.lab-mobile nav a:hover{color:#ffcfaa}
.lab-mobile{display:none;position:relative}
.lab-mobile summary{display:flex;align-items:center;justify-content:center;cursor:pointer;min-height:46px;border:1px solid var(--line);padding:0 17px;text-transform:uppercase;letter-spacing:.18em;font-size:11px;list-style:none}
.lab-mobile summary::-webkit-details-marker{display:none}
.lab-mobile nav{position:absolute;top:calc(100% + 12px);right:0;width:min(320px,calc(100vw - 36px));display:grid;gap:0;background:#150f1c;border:1px solid #795f79;box-shadow:0 22px 40px #000b}
.lab-mobile nav a{display:flex;align-items:center;min-height:48px;padding:12px 20px;border-bottom:1px solid #ffffff18}
.lab-mobile nav a:last-child{border-bottom:0}
.lab-hero{position:relative;min-height:635px;isolation:isolate;display:flex;align-items:center;overflow:hidden;background:radial-gradient(ellipse at 78% 49%,#6043684f,transparent 37%),linear-gradient(112deg,#09070c 5%,#120a17 63%,#0a0912 100%)}
.lab-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 80%,#e3a17c19,transparent 45%);pointer-events:none}
.lab-hero::after{content:'';position:absolute;z-index:1;bottom:0;left:0;right:0;height:132px;background:linear-gradient(transparent,#09070de8);pointer-events:none}
.lab-art{position:absolute;z-index:0;pointer-events:none;inset:-10px -5% -40px 30%;opacity:.98}
.lab-art svg{display:block;width:100%;height:100%;overflow:visible}
.lab-hero-copy{position:relative;z-index:3;padding:85px 0 92px;width:100%}
.lab-hero-copy>*{max-width:610px}
.lab-micro{font-size:10px;letter-spacing:.25em;text-transform:uppercase;font-weight:650;color:#d3ae9d}
.lab-heading{font:normal clamp(70px,9.6vw,138px)/.95 var(--display);letter-spacing:.20em;margin:24px 0 10px;margin-right:-.20em;text-shadow:0 2px 28px #12080ea8}
.lab-italic{margin:0 0 29px;font:italic clamp(26px,3.5vw,47px)/1.15 var(--display);color:#f0e5e2;letter-spacing:-.01em}
.lab-line{width:47px;height:1px;background:#e9ac8f;margin:29px 0 24px}
.lab-intro{margin:0;color:#d2c3d1;line-height:1.9;max-width:485px;letter-spacing:.02em}
.lab-topics{margin:26px 0 30px;font-size:10px;line-height:2.35;letter-spacing:.16em;text-transform:uppercase;color:#c5b5c8}
.lab-topics span{padding:0 14px;color:#cb987a}
.lab-actions{display:flex;gap:25px;flex-wrap:wrap;align-items:center}
.lab-action{display:inline-flex;align-items:center;justify-content:space-between;gap:38px;min-height:51px;padding:0 23px;border:1px solid #d59d80;color:#f4d4c2;font-size:10px;font-weight:750;text-transform:uppercase;letter-spacing:.17em;background:#2b1922a6;box-shadow:0 0 22px #ba70502b;transition:background .2s,box-shadow .2s}
.lab-action:hover{background:#482935;box-shadow:0 0 22px #bc785b4f}
.lab-action .arr{font-size:19px;line-height:1}
.lab-secondary{display:inline-flex;min-height:48px;align-items:center;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#f1dce0}
.lab-secondary:hover{text-decoration:underline;text-underline-offset:8px}
.lab-edge-label{position:absolute;z-index:4;right:5%;bottom:25px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:#b5989f}
.lab-content{position:relative;z-index:2;padding-top:30px;padding-bottom:85px}
.lab-section{scroll-margin-top:24px;padding-top:40px}
.lab-row-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:20px}
.lab-title-label{display:flex;align-items:center;gap:19px;margin:0;font:normal 17px/1.2 var(--display);letter-spacing:.24em;text-transform:uppercase}
.lab-title-label::before{content:'';width:41px;height:1px;background:#e8ab88}
.lab-view-link{display:flex;align-items:center;gap:13px;min-height:44px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#dbc0c6}
.lab-view-link:hover{color:#f1bb9b}
.lab-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.lab-card{position:relative;isolation:isolate;overflow:hidden;display:flex;min-height:230px;flex-direction:column;justify-content:flex-end;padding:21px 24px 22px;border:1px solid #ad96aa5c;background:linear-gradient(120deg,#20172b,#130e1c 62%,#1f1628);transition:border-color .22s,transform .22s;min-width:0}
.lab-card::before{content:'';position:absolute;z-index:-1;inset:0;opacity:.72;transition:opacity .25s}
.lab-card:nth-child(1)::before{background:radial-gradient(ellipse at 83% 25%,#b682bc90,transparent 31%),repeating-radial-gradient(ellipse at 74% 21%,#c394dd55 0 1px,transparent 2px 21px),linear-gradient(155deg,transparent 44%,#bc808347 70%,transparent)}
.lab-card:nth-child(2)::before{background:radial-gradient(ellipse at 73% 27%,#d89c8d66,transparent 34%),repeating-linear-gradient(135deg,#896a9668 0 1px,transparent 1px 31px),radial-gradient(circle at 79% 47%,#9270bc70,transparent 48%)}
.lab-card:nth-child(3)::before{background:radial-gradient(ellipse at 73% 25%,#8962ac7a,transparent 45%),radial-gradient(ellipse at 85% 65%,#c9927362,transparent 35%),repeating-radial-gradient(circle at 76% 21%,#d8a3bf40 0 1px,transparent 2px 32px)}
.lab-card::after{content:'';position:absolute;z-index:-1;inset:0;background:linear-gradient(0deg,#08070e 0%,#090710cc 36%,transparent 78%)}
.lab-card:hover{transform:translateY(-3px);border-color:#e2b39e}.lab-card:hover::before{opacity:1}
.lab-card-number{margin-bottom:auto;font-size:11px;letter-spacing:.13em;color:#eeb797}
.lab-card h3{margin:0 0 7px;font:italic normal clamp(25px,2.3vw,35px)/1.12 var(--display)}
.lab-card p{font:13px/1.56 var(--display);color:#d7cbd4;max-width:310px;margin:0}
.lab-card-bottom{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:17px}
.lab-card-tag{border:1px solid #bda3bb67;padding:4px 9px;border-radius:30px;font-size:8px;text-transform:uppercase;letter-spacing:.16em;color:#e2d5df}
.lab-card-arrow{font-size:21px;color:#eeb798}
.lab-lower{display:grid;grid-template-columns:1.45fr .9fr;gap:34px;margin-top:48px}
.lab-themes{padding-right:29px;border-right:1px solid var(--line)}
.lab-theme-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:34px}
.lab-theme{min-width:0}.lab-theme-shape{height:76px;display:flex;align-items:center;margin-bottom:13px}
.lab-theme-shape svg{height:70px;max-width:100%}
.lab-theme h3{margin:0 0 6px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#ecc2b7}
.lab-theme p{margin:0;max-width:240px;font:13px/1.5 var(--display);color:#bcb0bd}
.lab-archive{min-width:0}
.lab-archive-visual{height:110px;margin-top:29px;border:1px solid #87698570;background:repeating-linear-gradient(130deg,transparent 0 25px,#b997ba28 26px 27px,transparent 28px 64px),radial-gradient(ellipse at 55% 35%,#916bb199,transparent 63%),linear-gradient(100deg,#1a1125,#2d1b2e);position:relative;overflow:hidden}
.lab-archive-visual::after{content:'';position:absolute;left:22%;right:-10%;top:56%;height:2px;transform:rotate(-18deg);background:linear-gradient(90deg,transparent,#f0b895,#a180cf,transparent);box-shadow:0 0 24px 3px #d3a0b871}
.lab-archive p{margin:17px 0 8px;font:italic 21px/1.4 var(--display);color:#eee0e5}
.lab-archive .lab-view-link{display:inline-flex}
.lab-footer{border-top:1px solid var(--line);background:#0b0810;padding:29px 0 40px}
.lab-footer-inner{display:flex;justify-content:space-between;align-items:center;gap:35px}
.lab-footer-inner p{margin:0;font-size:10px;letter-spacing:.13em;color:#b3a6b8;text-transform:uppercase}
.lab-footer-inner a{color:#e7c0af;text-decoration:underline;text-underline-offset:5px}
@media(max-width:1100px){.lab-wrap{width:calc(100% - 60px)}.lab-heading{font-size:clamp(66px,10vw,118px)}.lab-hero{min-height:615px}.lab-art{inset:10px -12% -20px 31%}.lab-lower{grid-template-columns:1.35fr .9fr;gap:25px}.lab-theme-grid{gap:15px}}
@media(max-width:800px){.lab-nav{display:none}.lab-mobile{display:block}.lab-hero{min-height:700px;align-items:flex-end}.lab-art{inset:-35px -25% 190px 6%;opacity:.77}.lab-hero-copy{padding:295px 0 80px}.lab-hero-copy>*{max-width:100%}.lab-heading{font-size:clamp(62px,12.5vw,106px)}.lab-italic{font-size:clamp(27px,5.4vw,39px)}.lab-intro{max-width:530px}.lab-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lab-card:last-child{grid-column:1/-1}.lab-lower{grid-template-columns:1fr}.lab-themes{border-right:0;padding-right:0}.lab-footer-inner{align-items:flex-start;flex-direction:column;gap:12px}}
@media(max-width:530px){.lab-wrap{width:calc(100% - 36px)}.lab-head-inner{min-height:70px}.lab-brand{gap:11px}.lab-brand svg{width:34px;height:34px}.lab-brand span{font-size:17px;letter-spacing:.3em}.lab-hero{min-height:665px}.lab-art{inset:-45px -35% 270px -10%;opacity:.72}.lab-hero-copy{padding:293px 0 67px}.lab-heading{margin-top:12px;font-size:clamp(48px,13.2vw,69px);letter-spacing:.12em}.lab-italic{font-size:clamp(24px,6.6vw,34px);margin-bottom:16px}.lab-line{margin:18px 0}.lab-micro{font-size:9px}.lab-intro{font-size:13px;line-height:1.65}.lab-topics{font-size:9px;line-height:1.9;letter-spacing:.09em;margin:17px 0 20px}.lab-topics span{padding:0 7px}.lab-actions{gap:13px}.lab-action{min-height:48px;padding:0 15px;gap:13px}.lab-secondary{min-height:48px}.lab-edge-label{display:none}.lab-grid{grid-template-columns:1fr;gap:12px}.lab-card,.lab-card:last-child{grid-column:auto;min-height:205px}.lab-lower{margin-top:26px}.lab-theme-grid{grid-template-columns:1fr;gap:23px}.lab-theme{display:grid;grid-template-columns:75px 1fr;column-gap:16px;align-items:center}.lab-theme-shape{height:75px;grid-row:span 2;margin:0}.lab-theme h3{align-self:end}.lab-theme p{align-self:start}.lab-title-label{font-size:13px;letter-spacing:.15em;gap:10px}.lab-title-label::before{width:22px}.lab-row-heading{gap:8px}.lab-view-link{font-size:9px;letter-spacing:.08em}.lab-section{padding-top:20px}.lab-content{padding-bottom:54px}}
@media(max-width:340px){.lab-brand span{font-size:15px}.lab-heading{font-size:45px}.lab-topic{font-size:8px}.lab-topics span{padding:0 3px}.lab-title-label{font-size:12px}.lab-action{letter-spacing:.1em}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
@media(forced-colors:active){.lab-card,.lab-action,.lab-mobile summary{border:1px solid CanvasText}.lab-card-tag{border:1px solid CanvasText}}
`;
const BRAND = String.raw`<svg viewBox="0 0 90 90" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lab-logo-copper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0d9"/><stop offset=".45" stop-color="#e9ad8b"/><stop offset="1" stop-color="#95617c"/></linearGradient></defs><path fill="url(#lab-logo-copper)" d="M45 4 49 39 84 45 49 49 45 86 41 49 6 45 41 41Z"/><circle cx="45" cy="45" r="30" fill="none" stroke="#c79579" stroke-opacity=".45" stroke-width=".7"/></svg>`;
const SCULPTURE = String.raw`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 730" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
<defs>
 <radialGradient id="lab-aura"><stop stop-color="#9e69bf" stop-opacity=".45"/><stop offset=".52" stop-color="#6e4095" stop-opacity=".20"/><stop offset="1" stop-color="#1c0f2a" stop-opacity="0"/></radialGradient>
 <linearGradient id="lab-metal" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f5ceab"/><stop offset=".19" stop-color="#8b5870"/><stop offset=".49" stop-color="#301a32"/><stop offset=".71" stop-color="#e1a580"/><stop offset="1" stop-color="#3d2b3f"/></linearGradient>
 <linearGradient id="lab-glow" x1="0" x2="1"><stop stop-color="#ac69ea" stop-opacity="0"/><stop offset=".45" stop-color="#b582ff" stop-opacity=".5"/><stop offset=".7" stop-color="#e9aed9" stop-opacity=".72"/><stop offset="1" stop-color="#b77cdc" stop-opacity="0"/></linearGradient>
 <linearGradient id="lab-water" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#c79389" stop-opacity=".24"/><stop offset="1" stop-color="#0a0811" stop-opacity="0"/></linearGradient>
 <filter id="lab-blur"><feGaussianBlur stdDeviation="22"/></filter>
 <filter id="lab-flare"><feGaussianBlur stdDeviation="7"/></filter>
</defs>
<ellipse cx="646" cy="370" rx="447" ry="329" fill="url(#lab-aura)"/>
<path d="M38 210 C300 460 390 35 642 260 C810 410 977 90 1080 320" fill="none" stroke="url(#lab-glow)" stroke-width="72" opacity=".22" filter="url(#lab-blur)"/>
<path d="M30 210 C300 460 390 35 642 260 C810 410 977 90 1080 320" fill="none" stroke="url(#lab-glow)" stroke-width="2" opacity=".56"/>
<path d="M42 350 C278 117 409 260 585 354 S938 276 1080 189" fill="none" stroke="url(#lab-glow)" stroke-width="85" opacity=".12" filter="url(#lab-blur)"/>
<path d="M42 350 C278 117 409 260 585 354 S938 276 1080 189" fill="none" stroke="url(#lab-glow)" stroke-width="1.2" opacity=".74"/>
<circle cx="656" cy="305" r="238" stroke="#cf9b84" stroke-width="1.1" stroke-opacity=".78" fill="none"/>
<circle cx="656" cy="305" r="245" stroke="#bd7a77" stroke-width=".45" stroke-opacity=".4" fill="none" stroke-dasharray="3 12"/>
<path d="M654 38 669 286 C722 301 834 299 958 306 C821 313 728 320 676 343 L657 608 635 342 C570 316 496 309 352 307 C522 299 567 296 635 283Z" fill="url(#lab-metal)" stroke="#f2bb92" stroke-opacity=".84" stroke-width="1.15"/>
<path d="M651 48 655 288 638 303 655 311 656 596" fill="none" stroke="#ffddbe" stroke-opacity=".81" stroke-width="2"/>
<path d="M661 285 C746 310 816 310 948 305" fill="none" stroke="#f6c7a4" stroke-width="2" stroke-opacity=".68"/>
<path d="M351 307 C511 311 603 307 639 288" fill="none" stroke="#fbd1aa" stroke-width="1.4" stroke-opacity=".55"/>
<ellipse cx="655" cy="308" rx="49" ry="23" fill="#9f639a" opacity=".28" filter="url(#lab-flare)"/>
<path d="M352 307 H957" stroke="#dda886" stroke-opacity=".25" stroke-width="1.3"/>
<path d="M0 530 C119 485 228 512 344 518 S498 504 588 527 S825 498 1100 522 L1100 730 H0Z" fill="#0c0a13" fill-opacity=".81"/>
<path d="M0 575 C177 539 240 571 333 563 S574 547 698 567 S901 539 1100 567" fill="none" stroke="#705070" stroke-opacity=".58"/>
<ellipse cx="654" cy="549" rx="229" ry="15" fill="#e8af96" opacity=".3" filter="url(#lab-blur)"/>
<path d="M655 401 630 720 681 720 661 401Z" fill="url(#lab-water)" opacity=".55"/>
<path d="M270 558 H940 M340 581 H837 M433 609 H745" stroke="#d6a3a3" stroke-opacity=".18" stroke-width="1"/>
</svg>`;
const BODY = String.raw`
<a class="lab-skip" href="#main">Skip to content</a>
<header class="lab-header"><div class="lab-wrap lab-head-inner">
 <a class="lab-brand" href="/" aria-label="ANEVUM home">@BRAND@<span>ANEVUM</span></a>
 <nav class="lab-nav" aria-label="Primary navigation">
  <a href="#experiments">Experiments</a><a href="#research">Research</a><a href="#experiences">Experiences</a><a href="/original-works">Archive</a><a href="#contact">Contact</a>
 </nav>
 <details class="lab-mobile"><summary>Menu</summary><nav aria-label="Mobile navigation"><a href="#experiments">Experiments</a><a href="#research">Research</a><a href="#experiences">Experiences</a><a href="/original-works">Archive</a><a href="#contact">Contact</a></nav></details>
</div></header>
<main id="main" tabindex="-1">
 <section class="lab-hero" aria-labelledby="lab-home-title"><div class="lab-art">@SCULPTURE@</div><div class="lab-wrap lab-hero-copy">
  <p class="lab-micro">Independent experimental studio · Created by Devon Akins</p>
  <h1 id="lab-home-title" class="lab-heading">ANEVUM</h1>
  <p class="lab-italic">A laboratory for the possible.</p>
  <div class="lab-line" aria-hidden="true"></div>
  <p class="lab-intro">Experiments in software, computation, perception and imagined worlds. A place for ideas to be made tangible—and occasionally surprising.</p>
  <p class="lab-topics">Experimental software <span>/</span> Computational research <span>/</span> Imagined worlds</p>
  <div class="lab-actions"><a class="lab-action" href="#experiments">Explore experiments <span class="arr" aria-hidden="true">→</span></a><a class="lab-secondary" href="#about">About ANEVUM</a></div>
 </div><span class="lab-edge-label" aria-hidden="true">The Living Laboratory / 2026</span></section>
 <div class="lab-wrap lab-content">
 <section id="experiments" class="lab-section" aria-labelledby="lab-experiments-heading">
  <div class="lab-row-heading"><h2 class="lab-title-label" id="lab-experiments-heading">Selected experiments</h2><a class="lab-view-link" href="https://github.com/devonalanakins?tab=repositories">Public source collection <span aria-hidden="true">→</span></a></div>
  <div class="lab-grid">
   <a class="lab-card" href="https://github.com/devonalanakins/rhen"><span class="lab-card-number">01 / Computational systems</span><h3>Rhen language</h3><p>An experimental programming language and a study of how software can be expressed.</p><div class="lab-card-bottom"><span class="lab-card-tag">Source repository</span><span class="lab-card-arrow" aria-hidden="true">→</span></div></a>
   <a class="lab-card" href="https://github.com/devonalanakins/brandle"><span class="lab-card-number">02 / Interactive systems</span><h3>Brandle</h3><p>A five-letter browser word game, explored through interaction and design.</p><div class="lab-card-bottom"><span class="lab-card-tag">Source repository</span><span class="lab-card-arrow" aria-hidden="true">→</span></div></a>
   <a class="lab-card" href="/original-works"><span class="lab-card-number">03 / Imagined worlds</span><h3>Original Works</h3><p>The earlier ANEVUM creative universe, preserved as a distinct public archive.</p><div class="lab-card-bottom"><span class="lab-card-tag">Public archive</span><span class="lab-card-arrow" aria-hidden="true">→</span></div></a>
  </div>
 </section>
 <div class="lab-lower">
  <section class="lab-themes lab-section" id="research" aria-labelledby="lab-research-heading">
   <div class="lab-row-heading"><h2 class="lab-title-label" id="lab-research-heading">Research directions</h2><a href="https://github.com/devonalanakins" class="lab-view-link">Follow the work <span aria-hidden="true">→</span></a></div>
   <div class="lab-theme-grid">
    <article class="lab-theme"><div class="lab-theme-shape" aria-hidden="true"><svg viewBox="0 0 100 70"><defs><linearGradient id="theme-a" x2="1"><stop stop-color="#a679c0"/><stop offset="1" stop-color="#f0b58f"/></linearGradient></defs><ellipse cx="51" cy="35" rx="38" ry="17" transform="rotate(-27 51 35)" stroke="url(#theme-a)" stroke-width="2" fill="none"/><ellipse cx="51" cy="35" rx="34" ry="13" transform="rotate(28 51 35)" stroke="#bf92d4" fill="none" opacity=".65"/></svg></div><h3>Generative systems</h3><p>Behavior, emergence and computational form.</p></article>
    <article class="lab-theme"><div class="lab-theme-shape" aria-hidden="true"><svg viewBox="0 0 100 70" fill="none" stroke="#db9f9f"><path d="M30 11 48 2 66 11 66 32 48 41 30 32Z M11 34 29 25 47 34 47 55 29 64 11 55Z M49 34 67 25 85 34 85 55 67 64 49 55Z"/><path d="M48 2V41 M29 25V64 M67 25V64" opacity=".4"/></svg></div><h3>Computation &amp; creativity</h3><p>Interfaces at the edge of code and art.</p></article>
    <article class="lab-theme"><div class="lab-theme-shape" aria-hidden="true"><svg viewBox="0 0 100 70"><circle cx="51" cy="35" r="29" fill="none" stroke="#b48adc" stroke-width="1.2"/><path d="M19 35 C39 -1 69 66 89 34 M29 17 C48 52 67 14 77 53" fill="none" stroke="#f0aa91" stroke-width="1.5"/><circle cx="51" cy="35" r="4" fill="#d9acba"/></svg></div><h3>Interactive worlds</h3><p>Systems for exploration and imagined environments.</p></article>
   </div>
   <p class="lab-micro" style="margin-top:28px;color:#a99aaa;letter-spacing:.08em;text-transform:none">Research themes describe areas of exploration, not published findings or validated discoveries.</p>
  </section>
  <aside class="lab-archive lab-section" id="experiences" aria-labelledby="lab-experiences-heading">
   <div class="lab-row-heading"><h2 class="lab-title-label" id="lab-experiences-heading">Experiences &amp; archive</h2></div>
   <div class="lab-archive-visual" role="img" aria-label="Abstract violet and copper light study"></div>
   <p>Worlds, interactive studies and earlier creative work—kept visible without inventing new releases.</p>
   <a class="lab-view-link" href="/original-works">Visit the original works archive <span aria-hidden="true">→</span></a>
  </aside>
 </div>
 <section id="about" class="lab-section" aria-labelledby="lab-about-heading"><h2 id="lab-about-heading" class="lab-title-label">Why ANEVUM exists</h2><p class="lab-intro" style="max-width:790px;margin-top:20px">ANEVUM is an independent laboratory for exploratory engineering and creative work. It is built by Devon Akins, without a fictional staff, commercial promise, or required publishing schedule.</p></section>
 </div>
</main>
<footer class="lab-footer" id="contact"><div class="lab-wrap lab-footer-inner"><p>ANEVUM — A laboratory for the possible. · An independent studio</p><p>Created by <a href="https://devonakins.com">Devon Akins</a> · <a href="https://github.com/devonalanakins">Source &amp; contact</a></p></div></footer>`;

export function renderLivingLaboratoryHome(){
 const body=BODY.replace('@BRAND@',BRAND).replace('@SCULPTURE@',SCULPTURE);
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#09070d"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="ANEVUM is an independent experimental studio exploring software, computation, creative technology and imagined worlds."><meta property="og:type" content="website"><meta property="og:site_name" content="ANEVUM"><meta property="og:description" content="A laboratory for the possible. Experimental software, computational research and imagined worlds."><title>ANEVUM | A laboratory for the possible</title><style>'+STYLES+'</style></head><body>'+body+'</body></html>';
}
