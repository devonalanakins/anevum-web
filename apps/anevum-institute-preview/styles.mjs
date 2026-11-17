export const INSTITUTE_CSS = String.raw`
/* ANEVUM.WEB.DESIGN.2026-11-17.001 — isolated institute editorial/lab review */
:root{color-scheme:dark;--bg:#080d14;--ink:#f1ece3;--muted:#afb8c1;--gold:#e2b879;--line:#d8bb8a40;--surface:#131d28;--surface2:#1b2734;--blue:#9bbdcc;--max:1450px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:16px}
*,*::before,*::after{box-sizing:border-box}
html{background:var(--bg);scroll-behavior:smooth}
body{margin:0;min-width:0;background:radial-gradient(ellipse at 80% 0,#1e3342 0,transparent 45%),var(--bg);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}button{font:inherit}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #f6d28d;outline-offset:4px}::selection{background:#c6a271;color:#071019}
img{max-width:100%;height:auto}.skip{position:absolute;left:16px;top:-90px;z-index:90;padding:12px 20px;background:var(--gold);color:#071019;font-weight:800}.skip:focus{top:12px}
.mast{position:relative;z-index:20;background:#0a1019e8;border-bottom:1px solid #cfac7c35;backdrop-filter:blur(18px)}
.mast-inner{max-width:var(--max);padding:0 5%;min-height:87px;margin:auto;display:flex;gap:28px;align-items:center;justify-content:space-between}
.identity{display:flex;align-items:center;gap:14px;flex:none}.identity-mark{display:grid;place-items:center;border:1px solid var(--gold);width:48px;height:48px;border-radius:50%;font:30px/1 Georgia,serif;box-shadow:0 0 0 5px #d2a87017;color:#f2d8ae}
.identity-text{display:block;font:26px/1 Georgia,serif;letter-spacing:.23em}.identity-caption{display:block;font-size:9px;letter-spacing:.3em;color:#c4b8a8;text-transform:uppercase;padding-top:7px}
.desk-nav{display:flex;align-items:center;gap:clamp(12px,2vw,35px)}.desk-nav a,.nav-menu a{font-size:10px;text-transform:uppercase;letter-spacing:.16em;font-weight:750;color:#cad1d6;padding:14px 1px;border-bottom:1px solid transparent;white-space:nowrap}.desk-nav a:hover,.desk-nav a[aria-current=page],.nav-menu a:hover,.nav-menu a[aria-current=page]{color:#ffe2b5;border-color:var(--gold)}
.mast-meta{border:1px solid #d6b9887a;padding:10px 13px;font-size:10px;color:#e6cba5;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}.mobile-menu{display:none}.mobile-menu summary{cursor:pointer;list-style:none;border:1px solid #d6b9887a;padding:10px 15px;text-transform:uppercase;letter-spacing:.15em;font-size:11px}.mobile-menu summary::-webkit-details-marker{display:none}.nav-menu{position:absolute;right:4%;top:76px;background:#121c29;border:1px solid #bfa17477;padding:17px 24px;box-shadow:0 18px 40px #000b;display:grid;min-width:230px}.nav-menu a{padding:12px 0}
.site-main{min-height:55vh}.shell{max-width:var(--max);margin:auto;padding-left:5%;padding-right:5%}.kicker{font-size:10px;font-weight:800;letter-spacing:.27em;color:var(--gold);text-transform:uppercase}.serif{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-.04em}.serif em{color:var(--gold);font-weight:400}
.hero{position:relative;isolation:isolate;min-height:610px;overflow:hidden;background:linear-gradient(115deg,#09121b 3%,#132532 42%,#1b2a37 80%)}
.hero::before{content:"";position:absolute;z-index:-2;inset:0 0 0 27%;background:url("/institute-preview/assets/lab-hero-v1.webp") center 52% /cover no-repeat;opacity:.92}
.hero::after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,#081019 1%,#081019f3 25%,#0b1422cd 49%,#080f1960 75%,#080e1760),linear-gradient(0deg,#090e16 0%,transparent 37%)}
.hero-inner{padding-top:115px;padding-bottom:105px;position:relative}.hero h1{font-size:clamp(54px,6.1vw,102px);line-height:1.03;max-width:785px;margin:18px 0 23px;text-shadow:0 10px 50px #000a}.hero-lead{font-size:16px;color:#d8d9d7;max-width:560px;line-height:1.8}.hero-actions{display:flex;flex-wrap:wrap;gap:13px;margin-top:34px}
.btn{display:inline-flex;justify-content:center;align-items:center;gap:19px;min-height:50px;padding:14px 24px;border:1px solid #d3a767;color:#071019;background:var(--gold);font-size:11px;letter-spacing:.12em;font-weight:800;text-transform:uppercase;cursor:pointer;transition:background .2s,transform .2s}.btn:hover{transform:translateY(-2px);background:#f6d097}.btn.ghost{color:#ebdfcc;background:#09151dc4;border-color:#c6baac99}.btn.ghost:hover{background:#223347}.btn.small{min-height:42px;padding:10px 17px;font-size:10px}.btn[disabled]{cursor:not-allowed;opacity:.5;transform:none}
.hero-rail{background:#0e1721;border-block:1px solid #e1be8244}.rail-inner{display:flex;flex-wrap:wrap;justify-content:space-between;gap:18px;padding-top:18px;padding-bottom:18px}.rail-inner span{font-size:10px;color:#c6cbd0;letter-spacing:.1em;text-transform:uppercase}.rail-inner strong{color:#e4bb80;font-weight:750;margin-right:9px}
.section{padding-block:76px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:29px}.section h2{font-size:clamp(36px,4vw,58px);line-height:1.1;margin:10px 0 0}.section-lead{max-width:580px;color:var(--muted);font-size:14px}.text-link{font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);text-decoration:underline;text-underline-offset:7px}
.space-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.space-card{min-height:300px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:end;padding:23px;border:1px solid #d9b47a61;background:#18242f;isolation:isolate}.space-card::before{position:absolute;z-index:-2;content:"";inset:0;background-size:cover;background-position:center;opacity:.82;transition:transform .65s}.space-card::after{position:absolute;z-index:-1;content:"";inset:0;background:linear-gradient(0deg,#071018 0%,#09151ce8 29%,#0a18223a 100%)}.space-card:hover::before{transform:scale(1.06)}.space-card.library::before{background-image:url("/institute-preview/assets/lab-archive-v1.webp")}.space-card.lab::before{background-image:url("/institute-preview/assets/research-generation-v1.webp")}.space-card.research::before{background-image:url("/institute-preview/assets/research-computation-v1.webp")}.space-card.commons::before{background-image:url("/institute-preview/assets/research-worlds-v1.webp")}
.space-num{font-size:10px;color:var(--gold);letter-spacing:.2em;position:absolute;top:20px}.space-card h3{font:normal 31px/1.1 Georgia,serif;margin:0 0 9px}.space-card p{color:#c8cfd4;font-size:12px;line-height:1.6;min-height:38px;margin:0}.space-status{font-size:9px;color:#cda96f;text-transform:uppercase;letter-spacing:.12em;margin-top:20px}
.course-feature{border:1px solid #d7b27d65;background:linear-gradient(100deg,#14202b,#1d2c3a 58%,#182637);display:grid;grid-template-columns:1.2fr .8fr;gap:30px;min-height:315px;align-items:center;overflow:hidden;position:relative}.course-feature::after{content:"";position:absolute;z-index:0;width:43%;height:105%;right:0;top:0;background:linear-gradient(90deg,#192736,transparent 55%),url("/institute-preview/assets/rhen-generative-v1.webp") center/cover no-repeat;opacity:.64}.course-feature-copy{position:relative;z-index:1;padding:35px 42px}.course-feature-copy h3{font:normal clamp(29px,3.2vw,49px)/1.1 Georgia,serif;margin:12px 0}.course-feature-copy p{font-size:13px;line-height:1.8;color:#c4cfd7;max-width:640px}.course-feature .chip{font-size:10px;letter-spacing:.17em;color:#e8c392;text-transform:uppercase}.course-feature .btn{margin-top:24px}.course-steps{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0;margin:20px 0 0}.course-steps li{font-size:10px;color:#d1dadc;letter-spacing:.05em}.course-steps li:not(:last-child)::after{content:" / ";color:var(--gold);margin-left:9px}
.truth{display:block;color:#9cadb9;font-size:12px;margin-top:15px}
.page-hero{position:relative;overflow:hidden;border-bottom:1px solid #deb77b45;background:linear-gradient(130deg,#10202b,#0a121c);padding-top:75px;padding-bottom:82px}.page-hero::before{content:"";position:absolute;inset:0 0 0 47%;background:url("/institute-preview/assets/lab-hero-v1.webp") center/cover no-repeat;opacity:.28;pointer-events:none}.page-hero .shell{position:relative}.page-hero h1{font-size:clamp(44px,5.6vw,83px);line-height:1.05;margin:14px 0 20px;max-width:890px}.page-hero p{max-width:720px;font-size:16px;color:#c2cad1;line-height:1.8;margin:0}.crumb{font-size:10px;color:var(--gold);letter-spacing:.18em;text-transform:uppercase;margin-bottom:28px}.crumb a{text-decoration:underline;text-underline-offset:5px}
.catalog-layout{display:grid;grid-template-columns:280px 1fr;gap:26px}.aside-panel{background:#121d29;border:1px solid #8695a444;padding:24px}.aside-panel h2{font:normal 25px Georgia,serif;margin:0 0 15px}.aside-panel p,.aside-panel li{font-size:13px;color:#bdc7ce}.aside-panel ul{padding-left:19px}.aside-panel li{margin:12px 0}.aside-panel .kicker{margin:0 0 18px}.course-card{padding:29px;background:linear-gradient(120deg,#172635,#101921);border:1px solid #d2b28556;display:flex;gap:25px;justify-content:space-between}.course-card h3{font:normal 38px/1.12 Georgia,serif;margin:9px 0}.course-card p{color:#bfc9d1;font-size:13px;max-width:580px}.course-card .btn{margin-top:18px}.course-meta{display:flex;flex-wrap:wrap;gap:12px;color:#d6b98b;font-size:11px;letter-spacing:.08em}.placeholder{padding:27px;border:1px dashed #8d9aa55a;margin-top:16px;color:#aeb9c1;font-size:13px}.placeholder strong{display:block;color:#f0e6d9;font-family:Georgia,serif;font-size:24px;font-weight:400;margin-bottom:8px}
.program-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.unit{padding:22px;border:1px solid #7c92a15b;background:#121d27;display:flex;gap:17px;align-items:start}.unit.current{border-color:#dcb67d;background:#1e2c37}.unit .index{font:24px Georgia,serif;color:var(--gold)}.unit h3{margin:0 0 7px;font-size:16px}.unit p{margin:0;color:#b8c3cd;font-size:12px}.unit a{color:#f4c891;text-decoration:underline;text-underline-offset:4px;font-weight:750}.unit .mark{font-size:10px;letter-spacing:.11em;color:#d8b989;text-transform:uppercase;margin-top:13px}
.lesson-layout{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:38px;align-items:start}.lesson-article{min-width:0;max-width:850px}.lesson-article h2{font:normal 40px/1.14 Georgia,serif;letter-spacing:-.025em;margin:35px 0 13px}.lesson-article h3{font:normal 27px Georgia,serif;margin:31px 0 12px}.lesson-article p{font-size:16px;color:#d3d9dc;line-height:1.85}.lesson-article ul{color:#d0d6da}.lesson-article li{margin:9px 0}.lesson-article .callout{border-left:2px solid var(--gold);background:#172633;padding:18px 23px;margin:25px 0}.lesson-article .callout p{margin:0}.mathline{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:21px!important;text-align:center;color:#ead0a2!important;letter-spacing:.04em}.tabular{font-variant-numeric:tabular-nums}.lesson-sidebar{position:sticky;top:22px;border:1px solid #566c795e;background:#111c28;padding:23px}.lesson-sidebar h2{font:normal 25px Georgia,serif;margin:0}.lesson-sidebar ul{padding-left:20px;font-size:12px;line-height:2.4;color:#c6d0d5}.lesson-sidebar a{text-decoration:underline;text-underline-offset:4px}.lesson-sidebar p{font-size:12px;color:#b5c2cb}
.logic-box{border:1px solid #d2ab7555;background:radial-gradient(ellipse at 60% 40%,#233748,#101823 70%);padding:28px;margin:23px 0}.logic-box svg{max-width:480px;width:100%;height:auto;display:block;margin:auto}.logic-box figcaption{font-size:12px;color:#adbcc5;text-align:center;margin-top:13px}
.data-table{width:100%;border-collapse:collapse;margin:20px 0 30px;font-size:14px}.data-table th,.data-table td{border-bottom:1px solid #87949e55;padding:12px 15px;text-align:center}.data-table th{color:#e3bf84;background:#182431;text-transform:uppercase;letter-spacing:.1em;font-size:11px}.data-table tbody tr{transition:background .1s}.data-table tbody tr.is-selected{background:#5b49312d;outline:1px solid #d2a76788}
.quiz{padding:28px;background:#132130;border:1px solid #b7a27c88;margin:25px 0}.quiz h3{margin-top:0}.answer-list{display:grid;gap:10px;margin-top:20px}.answer{background:#0b1521;border:1px solid #83919d88;color:#e5eaed;text-align:left;padding:13px 18px;cursor:pointer;min-height:48px}.answer:hover{border-color:#cfa773}.answer.selected{border-color:#e4bc82;background:#304053}.answer.correct{border-color:#a2c9ab;background:#254435}.feedback{font-size:13px!important;min-height:36px;color:#e9c69d!important;margin:13px 0 0}
.lab-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:22px;margin-top:30px}.panel{border:1px solid #8c9bab68;background:#121f2d;padding:28px;min-width:0}.panel h2{font:normal 31px Georgia,serif;margin:0 0 15px}.panel p{color:#becad2;font-size:13px}.panel-label{font-size:10px;color:var(--gold);letter-spacing:.19em;text-transform:uppercase;margin:0 0 18px}.bench{padding:20px;background:radial-gradient(ellipse at center,#273d4c,#09121d);border:1px solid #67809a55;min-height:210px;display:grid;place-items:center}.bench svg{width:min(100%,550px);height:auto;max-height:250px}.switch-row{display:flex;gap:14px;margin:24px 0;flex-wrap:wrap}.switch{min-height:50px;display:inline-flex;align-items:center;gap:14px;padding:11px 19px;background:#0b1722;border:1px solid #91a7b15c;color:#eff0ed;cursor:pointer}.switch[aria-pressed=true]{background:#55442b;border-color:#debd87}.indicator{width:11px;height:11px;border-radius:50%;background:#435162;border:1px solid #7b90a0}.switch[aria-pressed=true] .indicator,.indicator.live{background:#e5be7d;box-shadow:0 0 15px #e1b77780}.readout{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:19px;background:#0c1720;border:1px solid #687e8b66}.readout strong{font:normal 45px Georgia,serif;color:#dfc28f}.progress-meter{height:6px;background:#314152;border-radius:12px;overflow:hidden;margin:14px 0 4px}.progress-meter span{display:block;height:100%;width:0;background:#dbb679;transition:width .2s}.lab-actions{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 10px}.lab-actions .btn{flex:1 1 180px;white-space:normal;text-align:center}
.institution-side{margin-top:24px}.course-feature .btn{width:auto}.lesson-progress{width:0}.fine-print{font-size:11px!important;color:#a9b5bc!important;line-height:1.6}
.footer{border-top:1px solid #dcc49f36;background:#08101a;padding-block:43px}.footer-inner{display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px}.footer p{margin:8px 0;font-size:12px;color:#aab6c1;max-width:590px}.footer a{text-decoration:underline;text-underline-offset:4px;color:#e0bf8b}.footer-brand{font:normal 25px Georgia,serif;letter-spacing:.2em}.preview-flag{font-size:10px;letter-spacing:.13em;color:#e2ba82;text-transform:uppercase}
@media(max-width:1100px){.desk-nav,.mast-meta{display:none}.mobile-menu{display:block}.space-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.course-feature{grid-template-columns:1fr}.course-feature::after{width:57%;opacity:.3}}
@media(max-width:750px){.mast-inner{min-height:73px;padding:0 5%}.identity-mark{height:38px;width:38px;font-size:24px}.identity-text{font-size:20px}.identity-caption{font-size:8px;letter-spacing:.21em}.nav-menu{top:68px}.hero{min-height:550px}.hero::before{inset:0;opacity:.5;background-position:58% center}.hero::after{background:linear-gradient(90deg,#081019ed,#07121acf),linear-gradient(0deg,#071019,#07101911)}.hero-inner{padding-top:87px;padding-bottom:76px}.hero h1{font-size:clamp(45px,11.5vw,76px)}.section{padding-block:56px}.section-head{display:block}.section-head .text-link{display:inline-block;margin-top:20px}.course-feature-copy{padding:27px}.page-hero{padding-block:55px}.page-hero h1{font-size:clamp(42px,9vw,61px)}.page-hero p{font-size:14px}.catalog-layout,.lesson-layout,.lab-layout{grid-template-columns:1fr}.lesson-sidebar{position:static;order:2}.program-grid{grid-template-columns:1fr}.section h2{font-size:39px}}
@media(max-width:470px){.space-grid{grid-template-columns:1fr}.space-card{min-height:235px}.rail-inner{display:grid;grid-template-columns:1fr 1fr}.hero h1{font-size:45px}.hero-lead{font-size:14px}.btn{width:100%}.course-card{padding:20px;display:block}.course-card h3{font-size:32px}.section{padding-block:44px}.lesson-article h2{font-size:33px}.lesson-article p{font-size:15px}.quiz,.panel{padding:18px}.data-table th,.data-table td{padding:10px 6px}.lab-layout{gap:13px}.site-main{overflow-wrap:anywhere}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation:none!important;transition:none!important}}
@media(forced-colors:active){.btn,.answer,.switch,.space-card,.unit{border:1px solid ButtonText}.indicator{border:2px solid CanvasText}}


/* ANEVUM OPEN APERTURE / AURORA SYSTEM — brand revision, 2026-11-17.
   Deliberately additive over the v1 preview so that original route/test contracts remain intact. */
:root{--bg:#071016;--ink:#f2eee6;--muted:#b6c6c6;--gold:#d9b17a;--gold-deep:#99764b;--sage:#95b9ab;--teal:#315d61;--surface:#101e28;--surface2:#20323b;--paper:#f4f1e8;--max:1510px;letter-spacing:-.008em}
body{background:radial-gradient(ellipse at 85% 6%,#12303b 0,transparent 42%),linear-gradient(180deg,#08151a,#061018 66%,#09131b);font-family:Inter,"Helvetica Neue",ui-sans-serif,system-ui,sans-serif}
.mast{background:#071219ed;border-bottom:1px solid #d3b88b2c;box-shadow:0 15px 30px #03101822}
.mast-inner{min-height:86px;gap:22px}
.identity{gap:15px}.identity-mark{display:block;width:59px;height:59px;object-fit:contain;border:0;border-radius:0;box-shadow:none;padding:3px;filter:drop-shadow(0 0 15px #e2b77b33)}
.identity-text{font:normal clamp(20px,2vw,27px)/1.05 Georgia,"Times New Roman",serif;letter-spacing:.25em}
.identity-caption{font-size:8px;letter-spacing:.32em;color:#a8bcb5}
.desk-nav{gap:clamp(18px,2.4vw,40px)}.desk-nav a,.nav-menu a{font-size:11px;letter-spacing:.08em;text-transform:none;font-weight:650;padding:14px 0;color:#b8c6c7}
.desk-nav a[aria-current=page]{color:#f1d4a3;border-bottom:2px solid var(--gold)}.desk-nav a:hover{color:#f4e7d4}
.mast-meta{border:0;border-left:1px solid #ae966b88;padding:12px 0 12px 18px;color:#a9b5b3;text-transform:uppercase;letter-spacing:.14em}
.mast-action{display:inline-flex;align-items:center;justify-content:center;gap:11px;background:#d9b17a;color:#101d23;min-height:40px;padding:0 19px;font-weight:800;font-size:11px;white-space:nowrap;border:1px solid #d9b17a}
.mast-action:hover{background:#f2d3a0;color:#071018}
.mobile-menu summary{border:1px solid #bfa5779c;border-radius:7px;min-width:76px;text-align:center;color:#f0e2cd}
.nav-menu{border:1px solid #d3b88b5c;background:#0c1a24f5;border-radius:9px}
.nav-menu a{font-size:14px;min-height:44px}
.preview-ribbon{position:relative;z-index:5;border-bottom:1px solid #ab926047;background:#121d25;color:#c6d2cd;text-align:center;font-size:10px;letter-spacing:.08em;padding:8px 18px}
.preview-ribbon strong{color:#e8c591;font-weight:700}
.kicker{font-size:10px;color:#e2b882;letter-spacing:.21em}
.serif{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-.049em}
.serif em{font-weight:400;color:#ebc58d}
.hero{min-height:720px;background:#091820;isolation:isolate}
.hero::before{z-index:-2;inset:0;background:url("/institute-preview/observatory.svg") right 50% center/cover no-repeat;opacity:1;filter:contrast(1.06) saturate(1.09)}
.hero::after{z-index:-1;inset:0;background:linear-gradient(90deg,#061018 0%,#061018f2 22%,#081820d4 38%,#07161e8a 55%,#07161e26 78%,#0a151d24),linear-gradient(0deg,#061118 0%,transparent 24%,transparent 73%,#0a17202e)}
.hero-inner{padding-top:143px;padding-bottom:130px}
.hero .kicker{display:inline-flex;align-items:center;gap:15px;letter-spacing:.23em}
.hero .kicker::before{content:"";width:25px;height:1px;background:#d4b27f}
.hero h1{font-size:clamp(61px,7.2vw,108px);line-height:.98;max-width:760px;margin:28px 0 26px;letter-spacing:-.058em;text-wrap:balance;text-shadow:0 10px 35px #0008}
.hero-lead{font-size:16px;line-height:1.8;max-width:515px;color:#d7e0dd}
.hero-actions{margin-top:36px;gap:16px}
.btn{border-radius:6px;border-color:#d6b07a;background:linear-gradient(135deg,#ebcb96,#ce9f61);min-height:54px;padding:14px 23px;color:#101819;letter-spacing:.105em;font-size:11px;box-shadow:0 9px 30px #020b0f33}
.btn.ghost{background:#07161edc;color:#e5d3bb;border-color:#bdab8a91}
.btn:hover{box-shadow:0 12px 34px #020b0f5c;transform:translateY(-2px)}
.btn:focus-visible,.mast-action:focus-visible{outline:3px solid #fff4d8;outline-offset:3px}
.hero .truth{font-size:11px;color:#b1c4bf;margin-top:22px}
.hero-stamp{position:absolute;right:5%;bottom:23px;z-index:2;font-family:ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:.16em;color:#d5bf92e6;text-align:right;text-transform:uppercase}
.hero-stamp span{display:block;color:#c0cbc8;letter-spacing:.09em;font-size:10px;margin-top:6px}
.hero-rail{background:#0d1b24;border-color:#c9b68b35}.rail-inner{padding-block:23px;gap:13px}.rail-inner span{font-size:11px;font-weight:650;color:#a9c0bc}.rail-inner strong{color:#d6ae79;font-family:Georgia,serif;font-size:18px;font-weight:normal;margin-right:10px}
.section{padding-block:91px}
.section-head .section-lead{line-height:1.8}
.section h2{letter-spacing:-.047em}
.space-grid{gap:16px}
.space-card{border-radius:11px;min-height:350px;padding:27px;border:1px solid #80989e5a;background:#122733;box-shadow:0 15px 45px #030b112e}
.space-card::before{opacity:.82;transition:opacity .25s,transform .45s}
.space-card::after{background:linear-gradient(0deg,#071318 0%,#07131bea 30%,#08182635 100%)}
.space-card h3{font-size:37px;letter-spacing:-.03em}
.space-card p{font-size:13px;color:#d4e0dc}
.space-card.library::before{background-image:url("/institute-preview/assets/lab-archive-v1.webp")}
.space-card.lab::before{background-image:url("/institute-preview/assets/research-generation-v1.webp")}
.space-card.research::before{background-image:url("/institute-preview/assets/research-computation-v1.webp")}
.space-card.commons::before{background-image:url("/institute-preview/assets/research-worlds-v1.webp")}
.space-status{font-size:10px;color:#e6bd84;margin-top:23px}
.space-card:not(a){border-style:dashed;border-color:#70888b60}
.course-feature{border-radius:13px;border-color:#bba37e80;background:linear-gradient(110deg,#172a33,#0f242d);min-height:340px}
.course-feature::after{background:linear-gradient(90deg,#10242c 0%,transparent 64%),url("/institute-preview/assets/rhen-generative-v1.webp") center/cover no-repeat;opacity:.62}
.course-feature-copy{padding:49px}
.course-feature-copy h3{font-size:clamp(36px,3.5vw,54px);letter-spacing:-.032em}
.course-feature-copy p{font-size:14px;max-width:610px;color:#d0d9d6}
.course-steps li{color:#c5d9d6}
.page-hero{background:linear-gradient(112deg,#08151e,#132c35);padding-top:96px;padding-bottom:102px}
.page-hero::before{background:url("/institute-preview/observatory.svg") 65% 36%/cover no-repeat;opacity:.21;inset:0}
.page-hero h1{font-size:clamp(48px,5.8vw,86px)}
.page-hero p{color:#c7d9d5}
.crumb{font-weight:750;color:#dab982}
.catalog-layout{grid-template-columns:minmax(250px,285px) minmax(0,1fr);gap:20px}
.aside-panel,.lesson-sidebar,.panel{background:linear-gradient(155deg,#14242c,#102029);border:1px solid #829d9d50;border-radius:11px;box-shadow:0 20px 45px #010a101c}
.aside-panel h2{font-size:28px}
.course-card{border-radius:12px;border-color:#bca98290;background:linear-gradient(120deg,#1a3038,#15252f);padding:36px;box-shadow:0 12px 30px #040f1526}
.course-card h3{font-size:clamp(30px,3.6vw,52px);letter-spacing:-.04em}
.course-card p{font-size:14px;line-height:1.8;color:#cbdbd8}
.placeholder{border-radius:10px;border-color:#91a8a957}
.program-grid{gap:17px}
.unit{border-radius:10px;background:#13252e;border-color:#92a09c4e;padding:26px}
.unit.current{background:linear-gradient(105deg,#20343b,#1d2c35);border-color:#d8b581}
.unit .index{font-size:31px}
.unit h3{font-size:17px}
.unit p{font-size:13px}
.unit a{color:#ebca97}
.lesson-layout{grid-template-columns:235px minmax(0,1fr);align-items:start;gap:24px}
.lesson-article{background:#f4f1e8;color:#1d3035;border-radius:12px;padding:clamp(27px,4.6vw,68px);max-width:none;border:1px solid #dfd3bb;box-shadow:0 26px 65px #020a1035}
.lesson-article h2{font-size:clamp(34px,3vw,45px);color:#1b3037}
.lesson-article h3{color:#1b3037}
.lesson-article p{color:#34494a;font-size:16px}
.lesson-article ul{color:#34494a}
.lesson-article .kicker{color:#86633e}
.lesson-article .callout{background:#e9e4d8;color:#283e3d;border-color:#987850;border-radius:0 9px 9px 0}
.lesson-article .callout p{color:#34494a}
.lesson-article .mathline{color:#2d5759!important;font-weight:650}
.lesson-article .logic-box{background:radial-gradient(ellipse at 60% 40%,#1d3b45,#0c1a22 72%);border:1px solid #a8c4be5c;border-radius:12px}
.lesson-article .data-table th{background:#dcd6c6;color:#34494a}
.lesson-article .data-table td{border-color:#34494a38;color:#293b3b}
.lesson-sidebar{order:-1;top:24px}
.lesson-sidebar h2{font-size:27px}
.lesson-sidebar li{margin-block:4px}
.lesson-sidebar a{color:#dbe8de}
.quiz{background:#eae4d6;border:1px solid #c6bba4;border-radius:11px}
.quiz h3{color:#20383b}
.quiz .answer{background:#f6f2e9;color:#1a333b;border-color:#8d9f9a;border-radius:6px}
.quiz .answer:hover{border-color:#ad7e43;background:#fffaf0}
.quiz .answer.selected{background:#e0dbc8;border-color:#9a6b3c}
.quiz .answer.correct{background:#d5e2d8;border-color:#437d65}
.lesson-article .feedback{color:#355549!important}
.lesson-article .fine-print{color:#5b6b69!important}
.lab-layout{grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:19px}
.panel{padding:31px}
.panel h2{font-size:33px;letter-spacing:-.03em}
.panel p{color:#c4d5d3}
.bench{background:radial-gradient(ellipse at center,#244c51,#0b1b24 70%);border-radius:9px;border:1px solid #63878960}
.switch{border-radius:7px;border-color:#7095958d;background:#0c202b;font-weight:650}
.switch:hover{border-color:#d3b17c}
.switch[aria-pressed=true]{background:#50422e}
.readout{border-radius:7px;border-color:#6f999481}
.readout strong{color:#e6c28a}
.progress-meter span{background:#b7d0ad}
.footer{background:#08161e;border-color:#9b957447}
.footer-brand{font-size:25px}
.footer p{color:#aebebc}
.preview-flag{color:#d6b27d}
@media(max-width:1300px){.desk-nav{gap:16px}.mast-action{padding:0 14px}}
@media(max-width:1100px){.mast-action{margin-left:auto}.mast-meta{display:none}.lesson-layout{grid-template-columns:220px minmax(0,1fr)}}
@media(max-width:750px){
 .mast-inner{min-height:77px}
 .identity-mark{width:45px;height:45px}
 .identity-text{font-size:22px}.identity-caption{letter-spacing:.25em}
 .mast-action{display:none}.nav-menu{top:75px}
 .hero{min-height:660px}.hero::before{inset:0;background-position:58% center;opacity:.8}
 .hero::after{background:linear-gradient(90deg,#061018f7 0%,#061118d9 50%,#05101899),linear-gradient(0deg,#061118 0%,transparent 42%)}
 .hero-inner{padding-top:92px;padding-bottom:100px}
 .hero h1{font-size:clamp(51px,10vw,79px);line-height:1.02;max-width:550px}
 .hero-lead{max-width:450px;font-size:15px}
 .hero-stamp{right:5%;bottom:14px;font-size:8px}
 .section{padding-block:60px}
 .space-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 .space-card{min-height:295px}
 .course-feature-copy{padding:31px}
 .page-hero{padding-top:59px;padding-bottom:64px}
 .lesson-layout{grid-template-columns:1fr}
 .lesson-sidebar{order:0;position:static}
 .lesson-article{padding:clamp(25px,5vw,45px)}
 .lab-layout{grid-template-columns:1fr}
}
@media(max-width:470px){
 .hero{min-height:690px}
 .hero h1{font-size:clamp(46px,11vw,58px)}
 .hero-lead{font-size:14px}
 .hero .kicker{font-size:9px;letter-spacing:.15em}
 .hero .kicker::before{width:12px}
 .hero-actions .btn{width:100%}
 .hero-stamp{display:none}
 .rail-inner{grid-template-columns:1fr 1fr}
 .space-grid{grid-template-columns:1fr}
 .space-card{min-height:245px}
 .course-feature-copy{padding:23px}
 .course-feature-copy h3{font-size:34px}
 .page-hero h1{font-size:46px}
 .lesson-article{padding:25px 20px}
 .lesson-article h2{font-size:32px}
 .lesson-article p{font-size:15px}
 .panel{padding:22px}
 .footer{padding-block:32px}
}
@media(max-width:750px){.catalog-layout{grid-template-columns:minmax(0,1fr)}.catalog-layout>*,.course-card{min-width:0}}

/* Focused study: compress the decorative zone so a learner reaches the task sooner. */
body[data-area="academy"] .page-hero,body[data-area="course"] .page-hero{padding-top:62px;padding-bottom:66px}
body[data-area="classroom"] .page-hero,body[data-area="laboratory"] .page-hero{
  padding-top:32px;padding-bottom:40px;
  background:linear-gradient(112deg,#0a1820,#142a31);
}
body[data-area="classroom"] .page-hero::before,body[data-area="laboratory"] .page-hero::before{opacity:.09}
body[data-area="classroom"] .page-hero h1,body[data-area="laboratory"] .page-hero h1{
  font-size:clamp(36px,4.2vw,58px);max-width:850px;line-height:1.09;margin-block:12px 14px;
}
body[data-area="classroom"] .page-hero p,body[data-area="laboratory"] .page-hero p{font-size:14px;line-height:1.65;max-width:840px}
body[data-area="classroom"] .page-hero .crumb,body[data-area="laboratory"] .page-hero .crumb{margin-bottom:14px}
body[data-area="classroom"] .section,body[data-area="laboratory"] .section{padding-top:33px}
body[data-area="laboratory"] .section-head{margin-bottom:19px}
body[data-area="laboratory"] .section h2{font-size:clamp(33px,3.3vw,46px)}
@media(max-width:750px){
  body[data-area="academy"] .page-hero,body[data-area="course"] .page-hero{padding-top:43px;padding-bottom:46px}
  body[data-area="classroom"] .page-hero,body[data-area="laboratory"] .page-hero{padding-top:24px;padding-bottom:31px}
  body[data-area="classroom"] .page-hero h1,body[data-area="laboratory"] .page-hero h1{font-size:clamp(33px,7.6vw,49px)}
  body[data-area="classroom"] .section,body[data-area="laboratory"] .section{padding-top:19px}
  .catalog-layout>.aside-panel{order:2}
  .catalog-layout>div{order:1}
}


/* Shared Learning Studio notes. Intentional paper surface, not a cloud account. */
.study-notes{margin:45px 0 8px;padding:clamp(20px,3vw,32px);border:1px solid #c4bca9;border-radius:11px;background:#eae6dc}
.study-notes-header h2{font-size:clamp(29px,3vw,39px);margin:8px 0 6px;line-height:1.16}
.lesson-article .study-notes p{font-size:13px;line-height:1.65;max-width:75ch}
.lesson-article .study-notes .study-notes-subtitle{font-weight:650;color:#516963;margin:0 0 12px}
.study-notes label{display:block;margin:22px 0 9px;color:#294046;font-size:13px;font-weight:750}
.study-notes textarea{display:block;resize:vertical;width:100%;min-width:0;min-height:145px;line-height:1.6;font:15px/1.6 ui-sans-serif,system-ui,sans-serif;border:1px solid #9fa99e;border-radius:7px;padding:15px 17px;color:#20383b;background:#fffdf7}
.study-notes textarea:focus-visible{outline:3px solid #ae7844;outline-offset:3px}
.study-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.study-actions .btn{font-size:10px;min-height:43px}
.study-actions.secondary{margin-top:12px;gap:15px}
.study-bookmark,.study-delete{font:650 12px ui-sans-serif,system-ui,sans-serif;min-height:44px;cursor:pointer;background:transparent;border:1px solid #9aa99e;color:#284947;border-radius:6px;padding:10px 13px}
.study-bookmark[aria-pressed=true]{border-color:#587e65;background:#d2e0d3;color:#1d4635}
.study-delete{border-color:#ab9181;color:#674d43}
.study-bookmark:hover,.study-delete:hover{background:#faf7ed}
.lesson-article .study-notes .study-status{font-size:12px;color:#476257;margin:16px 0 0}
@media(max-width:470px){.study-actions .btn{flex:1 1 100%}.study-bookmark,.study-delete{flex:1 1 145px}}


/* FRONTIER RESEARCH SOCIETY / discovery mode.
   Working lessons retain their existing distraction-free paper surface.
   No live 3D models: layered pre-rendered media, with static fallback. */
body[data-area="society"],body[data-area="recognition"]{--bg:#070e13;--ink:#eaf1ec;--gold:#e6b979;background:#081017;color:#eaf1ec}
body[data-area="society"] .mast,body[data-area="recognition"] .mast{background:#061017f7;border-color:#7b999144}
.frontier-main{background:linear-gradient(180deg,#081219 0%,#09171c 47%,#071016 100%)}
.frontier-hero{min-height:clamp(695px,84svh,950px);display:flex;align-items:stretch;background:#071016}
.frontier-hero::before{display:none}
.frontier-hero::after{inset:0;background:linear-gradient(90deg,#061017fd 0%,#071219f2 26%,#07171fcc 45%,#0818214c 74%,#0610162c 100%),linear-gradient(0deg,#071016 0%,transparent 30%,transparent 78%,#07121988);z-index:1;pointer-events:none}
.frontier-media{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.frontier-art{position:absolute;inset:0;background:linear-gradient(95deg,#0710164d,transparent 55%),url("/institute-preview/assets/research-computation-v1.webp") 63% 52%/cover no-repeat;background-color:#0b1a21;filter:contrast(1.12) saturate(.82)}
.frontier-atmosphere{position:absolute;inset:0;background:radial-gradient(ellipse at 84% 40%,#d9a56b33,transparent 39%),radial-gradient(ellipse at 52% 95%,#618e9f40,transparent 56%);opacity:.77;mix-blend-mode:screen;animation:frontier-atmosphere 15s ease-in-out infinite alternate}
@keyframes frontier-atmosphere{from{transform:translate3d(-1.2%,0,0);opacity:.46}to{transform:translate3d(1.2%,-.7%,0);opacity:.82}}
.frontier-hero-inner{z-index:2;max-width:var(--max);width:100%;padding-block:clamp(105px,15vh,175px) clamp(140px,17vh,205px)}
.frontier-hero-inner .kicker{color:#b7cfcd;font-size:10px;letter-spacing:.17em;margin-top:35px}
.frontier-index{font:650 10px/1.4 ui-monospace,Consolas,monospace;letter-spacing:.16em;color:#e5c69c;display:flex;align-items:center;gap:16px}
.frontier-index span{color:#adbfbe;font-size:9px;letter-spacing:.12em}
.frontier-hero h1{max-width:890px;font-size:clamp(57px,7.4vw,108px);line-height:.99;letter-spacing:-.06em;text-wrap:balance;margin-block:23px 27px}
.frontier-hero h1 em{color:#e8c494}
.frontier-hero .hero-lead{max-width:615px;font-size:clamp(14px,1.4vw,17px);line-height:1.8;color:#d8e3df}
.frontier-hero .btn.ghost{border-color:#8caca1a1;background:#0b2024c9}
.frontier-commitment{font-size:11px!important;line-height:1.6;color:#bed0cc!important;max-width:600px;margin-top:23px;letter-spacing:.01em}
.frontier-coordinate{position:absolute;z-index:2;right:5%;bottom:28px;text-align:right;pointer-events:none;color:#d9c6a8;font:600 10px/1.6 ui-monospace,Consolas,monospace;letter-spacing:.11em}
.frontier-coordinate strong,.frontier-coordinate span{display:block}
.frontier-coordinate span{font-size:8px;color:#a1b7b5}
.frontier-rail{background:#10212a;border-color:#88a79a39}
.frontier-rail .rail-inner{gap:13px;padding-block:24px}
.frontier-rail .rail-inner span{font:650 11px/1.4 ui-monospace,Consolas,monospace;letter-spacing:.03em;text-transform:none;color:#c6d6d4}
.frontier-section-id{font:650 10px/1.4 ui-monospace,Consolas,monospace;letter-spacing:.17em;color:#8faeac;border-top:1px solid #77918b50;padding-top:17px;margin-bottom:29px}
.frontier-manifesto-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);gap:clamp(40px,8vw,150px);align-items:start}
.frontier-manifesto h2,.frontier-manifesto-grid h2{max-width:720px;font-size:clamp(45px,5.8vw,81px);line-height:1.02;letter-spacing:-.055em}
.frontier-manifesto-copy{padding-top:19px}
.frontier-manifesto-copy p{font-size:clamp(15px,1.5vw,18px);line-height:1.85;color:#c6d3d0}
.frontier-manifesto-copy .text-link{display:inline-block;margin-top:19px}
.frontier-operations{background:linear-gradient(135deg,#101f27,#0b171f 65%,#0b1c22);border-block:1px solid #5e7c774f}
.frontier-operation-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.frontier-operation{position:relative;display:flex;flex-direction:column;min-height:340px;border:1px solid #809d954b;background:linear-gradient(155deg,#1d394087,#0c1a25df 62%),radial-gradient(circle at 78% 15%,#6ca0aa40,transparent 48%);padding:clamp(22px,3vw,34px);transition:border-color .25s,background .25s,transform .25s}
.frontier-operation:hover{border-color:#deb78b;transform:translateY(-3px)}
.frontier-operation:focus-visible{outline:3px solid #ffe4a9;outline-offset:4px}
.frontier-operation-num{font:650 11px ui-monospace,Consolas,monospace;color:#c8ddda;letter-spacing:.11em}
.frontier-operation-status{font:700 9px ui-monospace,Consolas,monospace;color:#d4b988;border:1px solid #d4b9886b;padding:7px 9px;letter-spacing:.08em;align-self:start;margin-top:14px}
.frontier-operation h3{font:normal clamp(30px,3vw,44px)/1.12 Georgia,serif;letter-spacing:-.04em;margin:auto 0 10px}
.frontier-operation p{font-size:14px;line-height:1.7;color:#bfcecb;margin:0 0 25px}
.frontier-operation-action{font-size:11px;color:#edcb94;letter-spacing:.07em;font-weight:750;border-top:1px solid #77918b4e;padding-top:15px}
.frontier-teaser-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);gap:clamp(30px,7vw,115px);align-items:center}
.frontier-teaser-grid h2{font-size:clamp(43px,5.3vw,73px);line-height:1.04;letter-spacing:-.055em}
.frontier-teaser-grid>div>p{font-size:16px;line-height:1.8;color:#c6d3d0;max-width:620px}
.frontier-proof-spec,.frontier-local-record{border:1px solid #9dbaaf77;background:linear-gradient(130deg,#162a32,#0b1820);padding:clamp(22px,3vw,38px);box-shadow:0 20px 65px #0003}
.frontier-proof-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding-bottom:22px;border-bottom:1px solid #809a944c;font:650 10px ui-monospace,Consolas,monospace;letter-spacing:.1em;color:#b9d0ca}
.frontier-proof-head span:last-child{color:#e5c08b}
.frontier-proof-lines{display:grid;gap:0;padding-top:8px}
.frontier-proof-lines>span{padding:15px 0;border-bottom:1px solid #7b959047;display:flex;flex-wrap:wrap;align-items:baseline;gap:18px}
.frontier-proof-lines small{font:650 9px ui-monospace,Consolas,monospace;letter-spacing:.12em;color:#c7a876;min-width:110px}
.frontier-proof-lines strong{font-weight:550;font-size:15px;color:#eff3ed}
.frontier-proof-spec p{font-size:11px;color:#9eb2ae;line-height:1.6}
.frontier-founding-inner{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:40px}
.frontier-founding-inner h2{font-size:clamp(35px,4.3vw,59px);max-width:920px}
.frontier-founding-inner p{color:#bed1cb;max-width:700px;font-size:15px;line-height:1.75}
.frontier-recognition-hero{padding-top:95px;padding-bottom:100px;background:linear-gradient(115deg,#071016,#132d35 70%,#0a151e)}
.frontier-recognition-hero::before{background-image:linear-gradient(90deg,#071219,#0818216e),url("/institute-preview/assets/research-computation-v1.webp");background-size:cover;background-position:center;opacity:.3}
.frontier-recognition-hero h1{font-size:clamp(51px,6vw,88px);max-width:970px}
.frontier-caveat{font:650 11px/1.7 ui-monospace,Consolas,monospace!important;color:#e6bd87!important;margin-top:22px!important}
.frontier-evidence-list{margin:35px 0 0;padding:0;list-style:none;border-top:1px solid #819d974c}
.frontier-evidence-stage{display:grid;grid-template-columns:55px minmax(0,1fr) auto;gap:clamp(17px,3vw,45px);align-items:start;border-bottom:1px solid #819d974c;padding:30px 0}
.evidence-step{font:500 24px ui-monospace,Consolas,monospace;color:#d6b889}
.frontier-evidence-stage h3{font:normal clamp(27px,3vw,42px)/1.12 Georgia,serif;margin:0 0 7px}
.frontier-evidence-stage p{color:#b8cac6;font-size:14px;line-height:1.65;max-width:760px;margin:0}
.evidence-stage-status{font:650 10px ui-monospace,Consolas,monospace;letter-spacing:.12em;color:#c9b990;margin-top:8px}
.frontier-policy-foot{font-size:12px;color:#b3c7c2;line-height:1.7;max-width:850px;margin-top:26px}
.frontier-local-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(25px,7vw,105px);align-items:center}
.frontier-local-grid h2{font-size:clamp(44px,5vw,75px)}
.frontier-local-grid>div:first-child p{font-size:15px;line-height:1.8;color:#c6d3ce;max-width:530px}
.frontier-evidence-total{display:block;font:500 clamp(64px,7vw,110px)/1.2 Georgia,serif;color:#e5bd84;margin-top:20px}
.frontier-local-record>p{color:#bdd0cb;font-size:13px}
.frontier-local-record ul{list-style:none;padding:0;margin:28px 0 16px}
.frontier-local-record li{padding:10px 10px 10px 26px;border-bottom:1px solid #6c878044;position:relative;font-size:12px;color:#b0c3bc}
.frontier-local-record li::before{content:"○";position:absolute;left:2px;color:#8da8a1}
.frontier-local-record li[data-evidence-state="complete"]{color:#dceee2}
.frontier-local-record li[data-evidence-state="complete"]::before{content:"●";color:#c7b182}
.frontier-evidence-note{font-size:10px!important;color:#9daea9!important;line-height:1.65}
@media(max-width:920px){.frontier-manifesto-grid,.frontier-teaser-grid,.frontier-local-grid{grid-template-columns:1fr;gap:25px}.frontier-operation-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.frontier-founding-inner{grid-template-columns:1fr;gap:15px}.frontier-manifesto-copy{padding-top:0}}
@media(max-width:750px){.frontier-hero{min-height:675px}.frontier-hero-inner{padding-block:92px 100px}.frontier-index{display:block}.frontier-index span{display:block;margin-top:6px}.frontier-hero .hero-lead{font-size:14px}.frontier-hero h1{font-size:clamp(47px,9vw,74px);margin-block:21px 24px}.frontier-art{background-position:59% 50%;filter:brightness(.78) saturate(.82)}.frontier-coordinate{right:5%;bottom:15px}.frontier-operations .section,.frontier-manifesto,.frontier-recognition-teaser,.frontier-founding{padding-block:55px}}
@media(max-width:560px){.frontier-operation-grid{grid-template-columns:1fr}.frontier-operation{min-height:260px}.frontier-operation h3{margin-top:55px}.frontier-hero{min-height:710px}.frontier-hero .hero-actions .btn{width:100%}.frontier-hero-inner{padding-top:75px;padding-bottom:105px}.frontier-coordinate{display:none}.frontier-manifesto h2,.frontier-teaser-grid h2{font-size:clamp(42px,10vw,55px)}.frontier-evidence-stage{grid-template-columns:40px 1fr}.evidence-stage-status{grid-column:2;margin-top:0}.frontier-proof-head{font-size:9px}.frontier-recognition-hero{padding-block:53px 63px}}
@media(prefers-reduced-motion:reduce){.frontier-atmosphere{animation:none!important;transform:none!important}.frontier-operation{transition:none!important}.frontier-operation:hover{transform:none!important}}

@media(prefers-reduced-motion:reduce){.space-card::before,.btn{transition:none!important;transform:none!important}}

`;
