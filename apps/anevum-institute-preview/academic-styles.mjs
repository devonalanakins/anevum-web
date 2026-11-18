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
@media(max-width:420px){.academic-study-card{padding:16px}.academic-pathways a{gap:10px}.academic-path-num{font-size:23px}.academic-method-grid{gap:9px}.academic-method-grid h3{font-size:21px}.academic-offering h3{font-size:26px}.academic-topline{font-size:9px}}
@media(prefers-reduced-motion:reduce){.institution-home *{animation:none!important;transition:none!important}}
`;
