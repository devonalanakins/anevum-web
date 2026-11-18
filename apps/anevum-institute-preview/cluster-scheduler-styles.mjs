export const CLUSTER_SCHEDULER_CSS = String.raw`
/* ANEVUM compute instrument: no external assets, no decoration over data. */
.academy-experiment{padding:20px 22px;margin-top:12px;border:1px solid #73988e88;border-radius:10px;background:linear-gradient(135deg,#19323b,#10212b)}
.academy-experiment-head{display:flex;gap:8px 15px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.academy-experiment-type{font:11px ui-monospace,Consolas,monospace;color:#b9cfc5}
.academy-experiment h3{font:normal clamp(23px,2.4vw,31px)/1.2 Georgia,serif;margin:10px 0 7px;color:#f1ece2}
.academy-experiment p{font-size:13px;max-width:65ch;line-height:1.65;color:#cadad2}
.academy-experiment a{display:inline-flex;align-items:center;min-height:43px;font-weight:650;font-size:12px;color:#f0d1a0;text-decoration:underline;text-underline-offset:4px}
.cluster-section{padding-block:29px 65px}
.cluster-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,.8fr);align-items:start;gap:14px}
.cluster-layout .panel{padding:clamp(18px,2vw,27px)}
.cluster-bench h2,.cluster-guide h2{font-size:clamp(25px,3vw,32px)}
.cluster-config{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:22px 0}
.cluster-config label{display:block;margin-bottom:7px;font-size:12px;font-weight:650;color:#d4e2da}
.cluster-config select{width:100%;height:44px;padding:8px 34px 8px 11px;background:#0c222c;color:#edf2eb;border:1px solid #8ea99d;border-radius:5px;font:13px system-ui,sans-serif}
.cluster-config select:focus-visible,.cluster-actions button:focus-visible,.academy-experiment a:focus-visible{outline:3px solid #f9d798;outline-offset:3px}
.cluster-table-wrap{max-width:100%;overflow-x:auto}
.cluster-bench>.cluster-table-wrap{margin-top:16px}
.cluster-data{border-collapse:collapse;width:100%;min-width:350px;font-size:12px;line-height:1.5;font-variant-numeric:tabular-nums}
.cluster-data th{font-weight:650;color:#dfcb9f;text-align:left;letter-spacing:.03em;background:#20333b}
.cluster-data td{color:#d5e1d9}
.cluster-data th,.cluster-data td{border-bottom:1px solid #6e8c845c;padding:9px 11px;white-space:normal}
.cluster-data td:not(:first-child),.cluster-data th:not(:first-child){text-align:right}
.cluster-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:17px}
.cluster-actions .btn{min-height:43px;padding:10px 13px;font-size:10px;letter-spacing:.035em}
.cluster-actions button[disabled]{opacity:.47;cursor:not-allowed}
.cluster-status{color:#d3cfb2!important;font-size:12px!important;line-height:1.55;min-height:21px}
.cluster-guide dl{margin:20px 0}
.cluster-guide dt{font-weight:750;color:#f0dfbd;font-size:13px;margin:14px 0 2px}
.cluster-guide dd{margin:0;font-size:12px;line-height:1.6;color:#c3d6cc}
.cluster-caveat{margin-top:18px;padding:17px;background:#21373a;border-left:3px solid #d9ba86}
.cluster-caveat strong{font-size:12px;color:#f1dab0}
.cluster-caveat p{color:#d5e2d9!important}
.cluster-guide a{font-size:12px;color:#e9c48f;text-decoration:underline;text-underline-offset:4px}
.cluster-output{grid-column:1/-1;background:#f4f1e8;color:#1e3438;border:1px solid #bdb49f;border-radius:9px;padding:clamp(16px,2.6vw,28px);min-width:0}
.cluster-output[hidden],.cluster-layout [hidden]{display:none!important}
.cluster-output h2{font:normal clamp(25px,3vw,40px)/1.14 Georgia,serif;margin:6px 0 18px;color:#223e40}
.cluster-output .kicker{color:#80603f}
.cluster-output-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.cluster-policy-label{font:700 11px ui-monospace,Consolas,monospace;color:#55716b}
.cluster-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:13px 0 24px}
.cluster-metrics>div{padding:13px;background:#e6e7dc;border:1px solid #c4c9ba;display:grid;gap:4px}
.cluster-metrics span{color:#486059;font-size:11px}
.cluster-metrics strong{font:normal clamp(25px,3vw,38px) Georgia,serif;color:#1b403e}
.cluster-metrics small{font-size:10px;color:#5c7069}
.cluster-timeline{display:grid;gap:5px;min-width:340px}
.cluster-tick{display:grid;grid-template-columns:57px minmax(0,1fr) 55px;gap:8px;align-items:center}
.cluster-tick-label,.cluster-used{font:11px ui-monospace,Consolas,monospace;color:#4d6762}
.cluster-tick-bar{display:flex;min-width:0;height:26px;background:#d3d8cc;border:1px solid #b3c2b2}
.cluster-allocation{display:grid;place-items:center;overflow:hidden;min-width:0;color:#f8f6eb;font:650 10px ui-monospace,Consolas,monospace;border-right:1px solid #e7f0e148}
.cluster-allocation-j1{background:#265b62}.cluster-allocation-j2{background:#8a5e47}
.cluster-allocation-j3{background:#437266}.cluster-allocation-j4{background:#566a8e}.cluster-allocation-j5{background:#8d7651}
.cluster-idle{background:repeating-linear-gradient(135deg,#d6d9ce,#d6d9ce 5px,#e6e7df 5px,#e6e7df 10px)}
.cluster-scroll{overflow-x:auto;padding-bottom:10px}
.cluster-output .cluster-data th{background:#d4dbcf;color:#37534c}
.cluster-output .cluster-data td{color:#2d4541;border-color:#b1c0b3}
.cluster-output>p{font-size:13px;color:#405e55}
.cluster-after{max-width:930px;margin:24px auto 0;padding:16px 0}
.cluster-after h2{font:normal 29px Georgia,serif;margin:0 0 8px}
.cluster-after p{font-size:13px;color:#c5d5cc;line-height:1.7}
@media(max-width:900px){.cluster-layout{grid-template-columns:minmax(0,1fr)}}
@media(max-width:520px){.cluster-data{min-width:300px}.cluster-config{grid-template-columns:1fr}.cluster-actions{display:grid;grid-template-columns:1fr}.cluster-metrics{grid-template-columns:1fr 1fr}.cluster-metrics>div:last-child{grid-column:1/-1}.cluster-section{padding-block:17px 45px}.cluster-tick{grid-template-columns:47px minmax(0,1fr) 43px;gap:5px}.cluster-actions .btn{width:100%}.academy-experiment{padding:18px}}
@media(prefers-reduced-motion:reduce){.cluster-allocation,.cluster-result-table{animation:none!important;transition:none!important}}
`;
