export const NEURON_LIF_CSS=String.raw`
/* ANEVUM NEURO: compact deterministic teaching instrument, no decorative canvas. */
.neuron-section{padding-block:24px 62px}.neuron-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(265px,.85fr);gap:13px;align-items:start}
.neuron-layout .panel{padding:clamp(17px,2.3vw,27px)}
.neuron-bench h2,.neuron-theory h2{font:normal clamp(25px,2.8vw,34px)/1.18 Georgia,serif;margin:12px 0}
.neuron-bench p,.neuron-theory p{font-size:13px;color:#c6d7d1;line-height:1.65}
.neuron-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:17px 0}
.neuron-settings label{display:block;color:#e7dbc1;font-weight:650;font-size:12px;margin-bottom:7px}
.neuron-settings select{height:44px;padding:8px 12px;border:1px solid #9db3a4;border-radius:5px;color:#e8eee6;background:#102731;font:13px system-ui,sans-serif;width:100%}
.neuron-actions{display:flex;flex-wrap:wrap;gap:8px}.neuron-actions button{min-height:43px;padding:9px 14px}
.neuron-actions button:disabled{opacity:.45;cursor:not-allowed}
.neuron-settings select:focus-visible,.neuron-actions button:focus-visible{outline:3px solid #f5d59c;outline-offset:3px}
.neuron-status{margin:12px 0 0;min-height:22px;color:#e6dabd!important}
.neuron-equation{font:normal 21px/1.5 Georgia,serif!important;color:#ecd4a5!important;background:#132f36;padding:13px;border-left:3px solid #d4ac71;overflow-wrap:anywhere}
.neuron-theory dl{margin:16px 0}.neuron-theory dt{font-size:12px;font-weight:750;color:#ecd8ad;margin:11px 0 3px}
.neuron-theory dd{font-size:12px;color:#bed0c9;margin:0;line-height:1.5}
.neuron-disclaimer{background:#22393b;padding:12px 13px;border-left:3px solid #d8b88b}
.neuron-output{grid-column:1/-1;background:#f4f1e8;color:#203939;border:1px solid #bdb49f;padding:clamp(16px,2.5vw,28px);min-width:0}
.neuron-output[hidden]{display:none!important}.neuron-output .kicker{color:#81613d}
.neuron-output-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.neuron-output h2{font:normal clamp(27px,3vw,39px)/1.2 Georgia,serif;margin:9px 0 17px;color:#1c3f3e}
.neuron-output-head>span{font:700 12px ui-monospace,Consolas,monospace;color:#4b675e}
.neuron-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 17px}
.neuron-metrics>div{background:#e5e8dc;border:1px solid #c4cebe;padding:13px;display:grid;gap:4px}
.neuron-metrics span{font-size:11px;color:#496359}.neuron-metrics strong{font:normal clamp(25px,3vw,36px) Georgia,serif;color:#1d4542}
.neuron-metrics small{font-size:10px;color:#587168}
.neuron-chart-wrap{overflow-x:auto;max-width:100%;border:1px solid #bbc9ba;background:#faf9f3;padding:8px}
.neuron-chart-wrap svg{display:block;min-width:510px;width:100%;height:auto}
.neuron-legend{display:flex;flex-wrap:wrap;gap:12px;margin:11px 0}
.neuron-legend span{display:flex;align-items:center;gap:6px;font-size:11px;color:#476258}
.neuron-key{width:16px;height:3px;display:inline-block;background:#245a62}.neuron-key-spike{background:#ae7449}.neuron-key-pulse{background:#d6c296;height:9px}
.neuron-readout{font-size:13px;color:#365a52;line-height:1.55;margin:12px 0}
.neuron-qualification{font-size:12px;line-height:1.6;color:#516b60;background:#e5e8dc;padding:11px 13px;border-left:3px solid #a88254}
@media(max-width:920px){.neuron-layout{grid-template-columns:1fr}}
@media(max-width:520px){.neuron-settings{grid-template-columns:1fr}.neuron-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.neuron-actions button{width:100%;font-size:11px;padding:8px}.neuron-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.neuron-metrics>div:last-child{grid-column:1/-1}.neuron-section{padding-block:16px 43px}}
@media(prefers-reduced-motion:reduce){.neuron-chart-wrap svg{transition:none!important;animation:none!important}}
`;
