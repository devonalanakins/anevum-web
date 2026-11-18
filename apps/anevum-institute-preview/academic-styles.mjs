/**
 * ANEVUM — academic design layer.
 * Light editorial institution shell, no decorative image backgrounds.
 * Existing technical instruments intentionally retain darker laboratory benches.
 */
export const INSTITUTION_CSS=String.raw`
:root{--academic-paper:#f5f4ee;--academic-white:#fffefa;--academic-ink:#1c3136;--academic-muted:#5c6b6a;--academic-green:#1d4744;--academic-teal:#2c6a64;--academic-gold:#a17940;--academic-border:#d9dcd3;--academic-font:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
html{scroll-behavior:smooth}body[data-area="society"] .site-main,body[data-area="academy"] .site-main{background:#f5f4ee;color:var(--academic-ink)}
body[data-area="society"],body[data-area="academy"],body[data-area="course"]{background:#f4f3ed;color:var(--academic-ink)}
.mast{background:#fffefa!important;border-bottom:1px solid #d5dbd5!important;box-shadow:none!important;backdrop-filter:none}
.mast-inner{min-height:75px}
.identity{gap:11px}
.identity-mark{filter:brightness(.57) saturate(1.15)!important;object-fit:contain!important}
.identity-text{color:#1c3937;font-size:clamp(20px,1.8vw,26px);letter-spacing:.13em}
.identity-caption{color:#587069!important;font-size:9px;letter-spacing:.19em}
.desk-nav a,.nav-menu a{color:#3d5751;font-size:11px;letter-spacing:.055em;text-transform:none;font-weight:650}
.desk-nav a:hover,.desk-nav a[aria-current=page],.nav-menu a:hover,.nav-menu a[aria-current=page]{color:#0e4743;border-color:#306c60}
.shell-search{color:#27534e!important;border-color:#b9cac0!important;background:#eef1eb!important}
.shell-search:hover{background:#e0e8e0!important}
.mast-action{background:#214b48;color:#fffefa;border-color:#214b48;text-transform:none;letter-spacing:.02em;font-size:12px;border-radius:3px}
.mast-action:hover{background:#153b39;color:#fff}
.mobile-menu summary{background:#f6f8f4;border:1px solid #c0d0c4;color:#204d46;border-radius:3px;min-height:44px;display:flex;align-items:center}
.nav-menu{background:#fffefa!important;border:1px solid #cbd7d0!important;box-shadow:0 12px 30px #23413d1b!important;z-index:60}
.nav-menu a{color:#27483f!important;border-color:#e1e8df!important}
.preview-ribbon{background:#ecf0e9!important;border-bottom:1px solid #d1d9d0!important;color:#465e55!important;font-size:11px;letter-spacing:0;padding:7px 18px}
.preview-ribbon strong{color:#204d44!important}
.footer{background:#192f31!important;border-top:1px solid #315251;color:#ecf0e8}
.footer-brand{color:#fffefa;letter-spacing:.14em}
.footer p{color:#d0dcd4!important}
.footer a{color:#e8d4ac}
.preview-flag{color:#e5c998}
.page-hero::before{content:none!important;background-image:none!important;display:none!important}
body[data-area="academy"] .page-hero,body[data-area="course"] .page-hero{background:#f5f4ee;border-bottom:1px solid #d9dcd3;color:var(--academic-ink);padding-top:52px;padding-bottom:48px}
body[data-area="academy"] .page-hero h1,body[data-area="course"] .page-hero h1{color:#1a3437;letter-spacing:-.045em;font-size:clamp(39px,4.5vw,64px)}
body[data-area="academy"] .page-hero h1 em,body[data-area="course"] .page-hero h1 em{color:#2d6961}
body[data-area="academy"] .page-hero p,body[data-area="course"] .page-hero p{color:#47625a;font-size:15px;line-height:1.65}
body[data-area="academy"] .page-hero .kicker,body[data-area="course"] .page-hero .kicker{color:#765b36;letter-spacing:.11em}
body[data-area="academy"] .page-hero .crumb,body[data-area="course"] .page-hero .crumb{color:#477064}
body[data-area="academy"] .compact-academy{padding-top:33px;padding-bottom:60px}
body[data-area="academy"] .catalog-layout{gap:18px}
body[data-area="academy"] .aside-panel,body[data-area="academy"] .course-card,body[data-area="academy"] .academy-experiment,body[data-area="academy"] .placeholder{box-shadow:none;border:1px solid #d6ddd5;background:#fffefa;color:#1d3536}
body[data-area="academy"] .aside-panel h2,body[data-area="academy"] .course-card h3,body[data-area="academy"] .academy-experiment h3{color:#213b3c}
body[data-area="academy"] .aside-panel li,body[data-area="academy"] .aside-panel p,body[data-area="academy"] .course-card p,body[data-area="academy"] .academy-experiment p{color:#4b625b}
body[data-area="academy"] .placeholder{background:#eef2ec;color:#4b635b}
body[data-area="academy"] .placeholder strong{color:#21443e}
body[data-area="academy"] .academy-experiment a,body[data-area="academy"] .academy-jump,body[data-area="academy"] .text-link{color:#1f5b52}
body[data-area="academy"] .course-meta{color:#586d63}
body[data-area="academy"] .academy-tools{border-color:#d1dad1}
body[data-area="academy"] .academy-tools .kicker{color:#775b39}
body[data-area="academy"] .academy-practice{color:#45645d}
body[data-area="academy"] .course-card .btn{background:#24534d;color:#fffefa;border-color:#24534d}
body[data-area="academy"] .course-card .btn:hover{background:#153f39}
body[data-area="academy"] .compact-academy .kicker{color:#81623c}
body[data-area="academy"] .academy-experiment-type{color:#477064}
body[data-area="academy"] .discipline-list{color:#536b62}
body[data-area="academy"] .course-card{border-left:4px solid #2d6961}
.institution-home{background:var(--academic-paper);color:var(--academic-ink);min-height:55vh}
.institution-home .serif{font-family:Georgia,"Times New Roman",serif;letter-spacing:-.047em;font-weight:400}
.institution-home .serif em{color:#2a6861;font-weight:400;font-style:normal}
.academic-intro{background:#f5f4ee;border-bottom:1px solid #dce0d7}
.academic-topline{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px 12px;padding-top:20px;border-top:1px solid #d9dfd5;color:#587067;font:700 10px/1.4 var(--academic-font);letter-spacing:.095em;text-transform:uppercase}
.academic-hero-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.8fr);gap:clamp(25px,4vw,76px);align-items:center;padding:54px 0 69px}
.academic-hero-copy{min-width:0}
.academic-eyebrow{margin:0;color:#7b6341;letter-spacing:.085em;text-transform:uppercase;font:750 11px/1.6 var(--academic-font)}
.academic-hero-copy h1{font-size:clamp(46px,5.45vw,86px);line-height:1.06;max-width:850px;margin:15px 0 24px;text-wrap:balance}
.academic-lead{font:400 clamp(15px,1.37vw,18px)/1.72 var(--academic-font);max-width:645px;color:#4d6260;margin:0}
.academic-actions{display:flex;flex-wrap:wrap;gap:10px;margin:27px 0 14px}
.academic-actions a{display:inline-flex;align-items:center;justify-content:space-between;gap:16px;min-height:47px;padding:12px 16px;border-radius:3px;font:700 12px/1.35 var(--academic-font);text-decoration:none}
.academic-primary{background:#1e4b47;border:1px solid #1e4b47;color:white}
.academic-primary:hover{background:#103c37}
.academic-secondary{background:#f5f4ee;border:1px solid #a8bdb2;color:#214b45}
.academic-secondary:hover{background:#e6ede6}
.academic-honesty{font-size:12px;line-height:1.6;color:#5d6d67;max-width:660px;margin:11px 0 0}
.academic-study-card{background:#fffefa;border:1px solid #d4ddd3;padding:clamp(20px,2.5vw,31px);box-shadow:0 15px 36px #243d3420;min-width:0}
.academic-study-head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;border-bottom:1px solid #dce4d9;padding-bottom:12px;color:#607369;font:700 10px/1.4 ui-monospace,Consolas,monospace}
.academic-card-overline{color:#7c6340;font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.07em;margin:23px 0 10px}
.academic-study-card h2{font:normal clamp(28px,2.7vw,41px)/1.15 Georgia,serif;letter-spacing:-.035em;margin:0 0 13px;color:#203d3e}
.academic-study-card p{font-size:13px;line-height:1.7;color:#566963;margin:0 0 16px}
.academic-card-status{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
.academic-card-status span{background:#edf2eb;border:1px solid #d8e2d7;color:#39635b;font-size:11px;font-weight:700;padding:6px 8px}
.academic-study-card>a{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #dce3da;border-bottom:1px solid #dce3da;padding:13px 0;font-weight:750;color:#1d5b52;font-size:12px}
.academic-study-card>a:hover{color:#0a3f39}
.academic-card-bottom{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.academic-card-bottom>div{display:flex;align-items:center;gap:10px}
.academic-card-bottom strong{font:normal 32px Georgia,serif;color:#214e48}
.academic-card-bottom span{font-size:11px;line-height:1.35;color:#60736b}
.academic-pathways{background:#e6ede6;border-bottom:1px solid #d0dfd3}
.academic-pathways-inner{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
.academic-pathways a{display:flex;align-items:center;gap:14px;padding:20px 18px;color:#254b44;border-right:1px solid #c9d9cd}
.academic-pathways a:first-child{padding-left:0}
.academic-pathways a:last-child{border-right:0}
.academic-pathways a:hover{background:#dae5da}
.academic-pathways a>span:last-child{margin-left:auto}
.academic-path-num{font:normal 27px Georgia,serif;color:#6c8a7e}
.academic-pathways strong,.academic-pathways small{display:block}
.academic-pathways strong{font-size:12px}
.academic-pathways small{font-size:11px;color:#5e736b;margin-top:3px}
.academic-section{padding-top:62px;padding-bottom:65px}
.academic-section-label{display:flex;justify-content:space-between;gap:9px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid #d0dad0;color:#60766a;font:700 10px/1.5 ui-monospace,Consolas,monospace;letter-spacing:.035em}
.academic-heading-row{display:flex;align-items:end;justify-content:space-between;gap:20px;margin:26px 0 25px}
.academic-heading-row h2,.academic-fields h2,.academic-method h2{font-size:clamp(34px,4vw,58px);line-height:1.1;color:#1e393a;margin:0 0 11px}
.academic-heading-row p,.academic-fields-layout p{font-size:14px;line-height:1.73;color:#566b65;max-width:640px;margin:0}
.academic-text-link{flex-shrink:0;color:#1a5c51;font-size:12px;font-weight:750;text-decoration:underline;text-underline-offset:5px}
.academic-offering-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}
.academic-offering{display:flex;flex-direction:column;min-height:281px;border:1px solid #d7e0d6;background:#fffefa;padding:22px 22px 19px;min-width:0}
.academic-offering-top{display:flex;justify-content:space-between;gap:9px;flex-wrap:wrap;color:#687c70;font:700 10px/1.35 ui-monospace,Consolas,monospace}
.academic-status{color:#8a6737}
.academic-offering h3{color:#244443;font:normal clamp(24px,2.3vw,32px)/1.16 Georgia,serif;margin:25px 0 11px}
.academic-offering p{font-size:12px;color:#596d63;line-height:1.66;margin:0 0 24px}
.academic-offering>a{margin-top:auto;border-top:1px solid #dce4da;padding-top:13px;display:flex;justify-content:space-between;color:#245b52;font-size:12px;font-weight:750}
.academic-offering>a:hover{color:#0e4038}
.academic-fields{background:#e8eee8;border-block:1px solid #d4ddd4}
.academic-fields-layout{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(28px,6vw,100px);padding-top:26px}
.academic-field-list{list-style:none;margin:0;padding:0}
.academic-field-list li{border-bottom:1px solid #c9d8cc;padding:13px 0;display:flex;align-items:baseline;gap:16px;color:#25423f;font-size:13px;font-weight:650}
.academic-field-list li:first-child{border-top:1px solid #c9d8cc}
.academic-field-list span{font:11px ui-monospace,Consolas,monospace;color:#65897d}
.academic-method-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:25px}
.academic-method-grid>div{border-top:3px solid #68958a;padding:18px 2px 0}
.academic-method-grid span{font:700 10px/1.4 ui-monospace,Consolas,monospace;color:#6b7b70}
.academic-method-grid h3{font:normal 25px/1.2 Georgia,serif;color:#234541;margin:14px 0 9px}
.academic-method-grid p{font-size:12px;line-height:1.7;color:#546a61;margin:0}
.academic-method-note{font-size:12px;line-height:1.6;color:#526860;margin:28px 0 0;padding-top:18px;border-top:1px solid #d3ddd2}
.academic-method-note a{color:#1c5b50;text-decoration:underline}
.institution-home a:focus-visible{outline:3px solid #a37c3e;outline-offset:4px}
@media(max-width:1150px){.academic-hero-grid{grid-template-columns:minmax(0,1.2fr) minmax(270px,.85fr);gap:28px}.academic-offering-grid{gap:10px}.academic-offering{padding:17px}}
@media(max-width:880px){.academic-hero-grid{grid-template-columns:1fr;gap:26px;padding-block:38px 44px}.academic-study-card{max-width:720px}.academic-offering-grid{grid-template-columns:1fr}.academic-offering{min-height:auto}.academic-offering h3{margin-top:14px}.academic-method-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.academic-fields-layout{grid-template-columns:1fr}.academic-pathways-inner{grid-template-columns:1fr}.academic-pathways a,.academic-pathways a:first-child{padding:13px 0;border-right:0;border-bottom:1px solid #cedbce}}
@media(max-width:750px){.mast-inner{min-height:70px}.identity-mark{width:39px;height:39px}.identity-text{font-size:20px}.identity-caption{font-size:8px;letter-spacing:.11em}.academic-topline{padding-top:12px}.academic-topline span:last-child{display:none}.academic-hero-grid{padding-top:29px;gap:21px}.academic-hero-copy h1{font-size:clamp(43px,10vw,56px);margin:10px 0 13px}.academic-lead{font-size:14px;line-height:1.58}.academic-actions{margin-top:17px}.academic-actions a{width:100%;justify-content:space-between;min-height:44px;padding:10px 13px;font-size:11px}.academic-honesty{font-size:11px;margin-top:7px}.academic-section{padding-top:37px;padding-bottom:41px}.academic-heading-row{flex-wrap:wrap;gap:8px}.academic-fields-layout{gap:20px}body[data-area="academy"] .page-hero,body[data-area="course"] .page-hero{padding-top:31px;padding-bottom:30px}.academic-card-bottom{margin-top:11px}}
@media(max-width:420px){.preview-ribbon{padding:4px 10px;font-size:10px;line-height:1.35}.academic-study-card{padding:16px}.academic-pathways a{gap:10px}.academic-path-num{font-size:23px}.academic-method-grid{gap:9px}.academic-method-grid h3{font-size:21px}.academic-offering h3{font-size:26px}.academic-topline{font-size:9px}}


/* Direct AND laboratory handoff is inactive until the full four-state model is visited. */
[data-and-lab] [data-to-dossier]:disabled{opacity:.55;cursor:not-allowed;filter:grayscale(.25)}
[data-and-lab] [data-to-dossier]:not(:disabled){background:#295c4c;color:#fffefa;border-color:#78a894}
[data-and-lab] [data-to-dossier]:not(:disabled):hover{background:#35735e}
/* Available-first Academy directory: no fabricated schools, enrollments or awards. */
body[data-area="academy"] .academy-learning-directory,body[data-area="academy"] .academy-laboratory-directory{margin:20px 0 0;padding:22px;background:#fffefa;border:1px solid #d6ddd5;color:#1c3634}
body[data-area="academy"] .academy-directory-heading{display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:9px 18px}
body[data-area="academy"] .academy-directory-heading .kicker{font-size:10px;color:#775b39;margin:0 0 5px}
body[data-area="academy"] .academy-directory-heading h2{font:normal clamp(25px,2.7vw,35px)/1.15 Georgia,serif;color:#20423e;letter-spacing:-.032em;margin:0}
body[data-area="academy"] .academy-directory-count{font:700 10px/1.5 ui-monospace,Consolas,monospace;color:#517065}
body[data-area="academy"] .academy-directory-intro{color:#536b61;font-size:12px;line-height:1.65;margin:13px 0 15px}
body[data-area="academy"] .academy-unit-list{padding:0;list-style:none;margin:0}
body[data-area="academy"] .academy-unit{border-top:1px solid #dce4da}
body[data-area="academy"] .academy-unit:last-child{border-bottom:1px solid #dce4da}
body[data-area="academy"] .academy-unit-link{display:flex;align-items:center;gap:12px;padding:12px 6px;text-decoration:none;color:#21483f;min-width:0}
body[data-area="academy"] .academy-unit-link:hover{background:#f0f5ee}
body[data-area="academy"] .academy-unit-number{display:grid;place-items:center;flex:none;width:37px;height:37px;background:#e2ebe1;border:1px solid #d1dfd4;color:#376456;font:700 12px ui-monospace,Consolas,monospace}
body[data-area="academy"] .academy-unit-copy{display:flex;flex-direction:column;min-width:0;gap:3px}
body[data-area="academy"] .academy-unit-copy strong{font-size:13px;line-height:1.4}
body[data-area="academy"] .academy-unit-copy small{font-size:11px;color:#526c60;line-height:1.35}
body[data-area="academy"] .academy-unit-copy [data-practice-status="recorded"]{color:#1c6750;font-weight:700}
body[data-area="academy"] .academy-unit-arrow{margin-left:auto;font-size:16px;color:#44796a}
body[data-area="academy"] .academy-directory-foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 14px;margin:12px 0 0;color:#536d62;font-size:11px;line-height:1.5}
body[data-area="academy"] .academy-directory-syllabus{display:inline-flex;margin-top:13px;color:#20574d;font-weight:750;font-size:12px;text-decoration:underline;text-underline-offset:4px}
body[data-area="academy"] .academy-lab-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
body[data-area="academy"] .academy-lab-item{min-width:0;display:flex;flex-direction:column;background:#f5f7f2;border:1px solid #d7e0d5;padding:17px}
body[data-area="academy"] .academy-lab-label{display:flex;justify-content:space-between;flex-wrap:wrap;gap:5px;color:#607a6d;font:700 9px/1.4 ui-monospace,Consolas,monospace}
body[data-area="academy"] .academy-lab-item h3{font:normal 25px/1.2 Georgia,serif;color:#224841;margin:18px 0 8px}
body[data-area="academy"] .academy-lab-item p{font-size:12px;line-height:1.6;color:#4b645b;margin:0 0 20px}
body[data-area="academy"] .academy-lab-item>a{margin-top:auto;padding-top:12px;display:flex;justify-content:space-between;gap:5px;border-top:1px solid #d6e0d7;color:#205c4e;font-size:11px;font-weight:750}
body[data-area="academy"] .academy-laboratory-note{font-size:11px;line-height:1.65;color:#51695e;margin:16px 0 0}
body[data-area="academy"] .academy-laboratory-note a{color:#1c5d50;text-decoration:underline;text-underline-offset:3px}
body[data-area="academy"] .academy-learning-directory a:focus-visible,body[data-area="academy"] .academy-laboratory-directory a:focus-visible{outline:3px solid #a37c3e;outline-offset:3px}
@media(max-width:1080px){body[data-area="academy"] .academy-lab-grid{grid-template-columns:1fr}body[data-area="academy"] .academy-lab-item h3{margin-top:8px}body[data-area="academy"] .academy-lab-item p{margin-bottom:10px}}
@media(max-width:750px){body[data-area="academy"] .academy-learning-directory,body[data-area="academy"] .academy-laboratory-directory{padding:16px;margin-top:13px}body[data-area="academy"] .academy-unit-link{min-height:54px;padding:9px 2px}body[data-area="academy"] .academy-directory-heading h2{font-size:28px}}

/* Research & Methods: real scientific instruments, evidence boundaries and editorial clarity. */
.research-index{background:var(--academic-paper);color:var(--academic-ink)}
body[data-area="research"]{background:var(--academic-paper);color:var(--academic-ink)}
.research-intro h1{color:var(--academic-ink)!important}
.research-intro p{color:#4d625c!important}
.research-intro .research-disclosure{color:#52685e!important}
.research-index .academic-heading-row h2,.research-index .research-status h2{color:var(--academic-ink)}
.research-index .serif{font-family:Georgia,"Times New Roman",serif;font-weight:400;letter-spacing:-.045em}
.research-index .serif em{font-style:normal;color:#2a6861}
.research-intro{background:var(--academic-paper)!important;border-bottom:1px solid var(--academic-border)}
.research-intro .shell{padding-block:20px 8px}
.research-intro .kicker{color:#795e38}
.research-intro h1{max-width:830px}
.research-intro p{max-width:780px}
.research-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:25px 0 12px}
.research-actions a,.research-next a{display:inline-flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 16px;min-height:46px;border:1px solid #a8bdb2;border-radius:3px;font-size:12px;font-weight:700;text-decoration:none}
.research-actions .academic-primary,.research-next .academic-primary{background:#1e4b47;border-color:#1e4b47;color:#fff}
.research-actions .academic-secondary{color:#214b45}
.research-intro .research-disclosure{font-size:12px;color:#576e64;line-height:1.6}
.research-experiment-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}
.research-experiment{display:flex;flex-direction:column;min-width:0;background:var(--academic-white);border:1px solid var(--academic-border);padding:22px}
.research-experiment-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;color:#60766c;font:700 10px/1.4 ui-monospace,Consolas,monospace}
.research-experiment-meta strong{color:#86683b}
.research-experiment h3{font:normal clamp(24px,2.4vw,33px)/1.2 Georgia,serif;letter-spacing:-.035em;color:#244443;margin:24px 0 12px}
.research-experiment p{font-size:13px;color:#536861;line-height:1.65;margin:0 0 16px}
.research-experiment .research-assumption{padding:12px;background:#edf2eb;border-left:2px solid #6d998e;font-size:12px}
.research-assumption strong{display:block;margin-bottom:4px;color:#244e47}
.research-experiment>a{display:flex;justify-content:space-between;gap:8px;margin-top:auto;padding-top:13px;border-top:1px solid var(--academic-border);color:#1b5d53;font-size:12px;font-weight:750}
.research-experiment>a:focus-visible,.research-index a:focus-visible{outline:3px solid #a37c3e;outline-offset:4px}
.research-methods{background:#e9efe8;border-block:1px solid #d1ded3}
.research-method-steps{padding:0;margin:15px 0 25px;list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.research-method-steps li{display:flex;gap:12px;border-top:2px solid #7d9d8f;padding-top:15px}
.research-method-steps li>span{font:700 12px/1.5 ui-monospace,monospace;color:#39766d}
.research-method-steps h3{font:normal 23px/1.2 Georgia,serif;margin:0 0 8px;color:#234441}
.research-method-steps p{margin:0;font-size:12px;color:#536861;line-height:1.65}
.research-next{border-top:1px solid #c6d9cc;display:flex;align-items:center;justify-content:space-between;gap:24px;padding-top:20px}
.research-next strong{font-size:14px;color:#244641}
.research-next p{font-size:12px;color:#536861;line-height:1.6;max-width:560px;margin:5px 0 0}
.research-next a{flex-shrink:0}
.research-status h2{font-size:clamp(30px,4vw,52px);line-height:1.14;max-width:840px;margin:24px 0 14px}
.research-status p{font-size:14px;line-height:1.75;max-width:840px;color:#536861;margin:0 0 20px}
@media(max-width:880px){.research-experiment-grid{grid-template-columns:1fr}.research-experiment h3{margin-top:14px}.research-method-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:750px){.research-intro .shell{padding-block:6px}.research-actions a{width:100%}.research-method-steps{gap:20px 10px}.research-next{flex-direction:column;align-items:stretch;gap:16px}.research-next a{width:100%}}
@media(max-width:420px){.research-method-steps{grid-template-columns:1fr}.research-experiment{padding:17px}.research-experiment h3{font-size:27px}}
/* CFP-101 compact reading pathway; status derives only from existing browser-local checks. */
.study-path{margin:0 0 30px;padding:16px 18px 14px;border:1px solid #d0dfd5;background:#e8eee8;border-radius:7px;color:#243d3b}
.study-path-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:11px;font:750 10px/1.5 ui-monospace,Consolas,monospace;letter-spacing:.045em;text-transform:uppercase;color:#3a5e54}
.study-path-heading a{color:#235d54;text-transform:none;text-decoration:underline;text-underline-offset:3px}
.study-path-links{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0!important;padding:0!important}
.study-path-links li{margin:0!important;min-width:0}
.study-path-link{display:flex;align-items:center;gap:9px;min-height:58px;padding:10px;border:1px solid #c8d9cf;background:#f8f8f4;color:#284a43!important;border-radius:4px;text-decoration:none!important}
.study-path-link[aria-current="page"]{border-color:#286356;background:#d7e6db;box-shadow:inset 0 0 0 1px #286356}
.study-path-index{display:grid;place-items:center;flex:none;width:29px;height:29px;border-radius:50%;background:#dbe8df;font:750 11px/1 ui-monospace,Consolas,monospace;color:#30574f}
.study-path-link[aria-current="page"] .study-path-index{background:#285c52;color:#fff}
.study-path-details{display:flex;flex-direction:column;gap:2px;min-width:0}
.study-path-details strong{font-size:12px;line-height:1.4}
.study-path-details small{font-size:10px;color:#526c61;line-height:1.35}
.study-path-details [data-practice-status="recorded"]{color:#216352;font-weight:700}
.study-path-disclaimer{margin:11px 0 0!important;font-size:11px!important;line-height:1.55!important;color:#54695f!important}
.study-path a:focus-visible{outline:3px solid #a37c3e;outline-offset:3px}
/* Ideal four-bit clocked register: compact editorial workbench, no imagery. */
.register-bench{margin:20px 0 28px;padding:20px;border:1px solid #bfd1c2;background:#e8eee8;border-radius:7px;color:#243f3c}
.register-head{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;color:#46665d;font:700 10px/1.5 ui-monospace,Consolas,monospace;letter-spacing:.025em}
.lesson-article .register-bench h3{font:normal 28px/1.2 Georgia,serif;margin:15px 0;color:#244741}
.register-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.register-input-panel,.register-output-panel{background:#fffefa;border:1px solid #d5e0d4;border-radius:5px;min-width:0;padding:15px}
.register-meta{display:flex;flex-direction:column;color:#345b50;font:750 11px/1.5 ui-monospace,monospace;gap:3px}
.register-meta small{font:400 11px/1.5 system-ui,sans-serif;color:#586d63}
.register-bit-switches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:15px}
.register-bit-switches button{display:flex;flex-direction:column;align-items:center;gap:6px;border:1px solid #bad0c2;border-radius:5px;background:#f1f5ee;color:#31584d;padding:9px 4px;min-height:65px;font:700 11px/1.4 ui-monospace,Consolas,monospace}
.register-bit-switches button strong{font-size:21px}
.register-bit-switches button[aria-pressed="true"]{background:#285d51;border-color:#285d51;color:#fff}
.register-output{display:block;font:700 clamp(32px,5vw,48px)/1.1 ui-monospace,Consolas,monospace;letter-spacing:.1em;color:#20564c;margin:18px 0 10px}
.lesson-article .register-word{font:600 12px/1.5 ui-monospace,Consolas,monospace;color:#426458;margin:12px 0 0}
.register-actions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}
.register-actions button{min-height:44px;border:1px solid #a6c0ae;background:#f9fbf7;border-radius:4px;color:#275649;padding:11px 13px;font-size:12px;font-weight:750}
.register-actions button:first-child{background:#285d51;border-color:#285d51;color:#fff}
.register-bench button:focus-visible{outline:3px solid #b7834a;outline-offset:2px}
.lesson-article .register-status{background:#d9e5db;border-left:3px solid #2c7564;margin:11px 0 18px;padding:12px;color:#285748;font-size:12px;line-height:1.6}
.lesson-article .register-bench h4{font:700 13px/1.5 system-ui,sans-serif;color:#2a5047;margin:10px 0 5px}
.register-history{padding:0 0 0 22px;color:#365e52;font:500 11px/1.8 ui-monospace,Consolas,monospace;max-height:220px;overflow:auto}
.lesson-article .register-bench .half-fine{font-size:11px;color:#587166;margin:12px 0 0;line-height:1.55}
@media(max-width:750px){.register-bench{padding:12px}.register-grid{grid-template-columns:1fr}.register-output{font-size:36px}.register-actions button{flex:1 1 auto}}
@media(max-width:420px){.register-bit-switches button{min-height:57px}.register-actions button{width:100%}}
@media(max-width:750px){.study-path{padding:12px;margin-bottom:22px}.study-path-links{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.study-path-link{padding:8px;gap:6px}.study-path-index{width:25px;height:25px}.study-path-details strong{font-size:11px}.study-path-details small{font-size:9px}}
@media(max-width:420px){.study-path-links{grid-template-columns:1fr}.study-path-link{min-height:44px}.study-path-details strong{font-size:12px}.study-path-details small{font-size:10px}}
@media(prefers-reduced-motion:reduce){.institution-home *{animation:none!important;transition:none!important}}
`;
