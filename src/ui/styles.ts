const CSS = `
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--oc-bg);color:var(--oc-fg);font-family:var(--oc-font);font-size:14px;line-height:1.45}
#root{min-height:100%}
.kb-page{display:flex;flex-direction:column;gap:14px;padding:16px;min-height:100%}
.kb-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.kb-toolbar .grow{flex:1;min-width:160px}
.kb-columns{display:flex;gap:12px;align-items:flex-start;overflow-x:auto;padding-bottom:8px;flex:1}
.kb-column{flex:1 0 220px;min-width:220px;max-width:320px;display:flex;flex-direction:column;background:var(--oc-muted-surface);border:1px solid var(--oc-border);border-radius:var(--oc-radius,10px);min-height:120px}
.kb-column.kb-dragover{outline:2px solid var(--oc-focus);outline-offset:-2px}
.kb-column-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--oc-border)}
.kb-column-title{font-weight:600;font-size:12px;letter-spacing:.02em;text-transform:uppercase;color:var(--oc-muted)}
.kb-column-count{font:11px var(--oc-mono);color:var(--oc-muted)}
.kb-column-body{display:flex;flex-direction:column;gap:8px;padding:10px;overflow-y:auto;flex:1;min-height:40px}
.kb-column-empty{font-size:12px;color:var(--oc-muted);padding:8px 2px}
.kb-card{background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:9px;padding:10px;cursor:pointer;display:flex;flex-direction:column;gap:6px}
.kb-card:hover{border-color:var(--oc-hover)}
.kb-card.kb-dragging{opacity:.4}
.kb-card.kb-card-needs-attention{border-color:var(--oc-warning);border-left-width:3px}
.kb-card.kb-card-needs-attention:hover{border-color:var(--oc-warning)}
.kb-card-title{font-weight:550;font-size:13px;overflow-wrap:anywhere}
.kb-card-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.kb-card-ref{font:11px var(--oc-mono);color:var(--oc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.kb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:24px;z-index:50}
.kb-dialog{background:var(--oc-bg);color:var(--oc-fg);border:1px solid var(--oc-border);border-radius:12px;max-width:640px;width:100%;max-height:88vh;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px}
.kb-dialog h2{margin:0;font-size:18px;letter-spacing:-.01em}
.kb-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.kb-dialog-grid .kb-span2{grid-column:1/-1}
.kb-section{display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--oc-border);padding-top:12px}
.kb-section-title{font-size:12px;font-weight:600;color:var(--oc-muted);text-transform:uppercase;letter-spacing:.02em}
.kb-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kb-row.between{justify-content:space-between}
.kb-muted{color:var(--oc-muted);font-size:12px}
.kb-mono{font:12px var(--oc-mono);color:var(--oc-muted)}
.kb-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:48px 16px;color:var(--oc-muted);text-align:center}
.kb-radio-group{display:flex;flex-direction:column;gap:10px}
.kb-radio-option{display:flex;gap:10px;align-items:flex-start;cursor:pointer}
.kb-radio-option input{margin-top:3px;accent-color:var(--oc-primary)}
.kb-radio-title{font-weight:550;font-size:13px}
.kb-radio-desc{font-size:12px;color:var(--oc-muted);margin-top:2px}
.kb-banner{display:none}
.kb-banner[data-show]{display:block}
// Dictation panel (OpenChamber's composer dictation look, adapted to this
// dialog): trigger with the app's mic icon; active states in a bordered card
// with the status line, a pulsing red dot, the live level bars, the duration
// and compact icon actions.
.kb-dictation{margin-top:6px;display:flex;flex-direction:column;gap:8px}
.kb-dict-trigger{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:6px 11px;font:inherit;font-size:13px;color:var(--oc-fg);background:transparent;border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 3px);cursor:pointer}
.kb-dict-trigger svg{width:15px;height:15px}
.kb-dict-trigger:hover{background:var(--oc-hover)}
.kb-dict-panel{border:1px solid var(--oc-border);border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;background:var(--oc-elevated);color:var(--oc-elevated-fg)}
.kb-dict-status{font-size:13px;color:var(--oc-muted)}
.kb-dict-controls{display:flex;align-items:center;gap:10px;min-height:20px}
.kb-dict-dot{width:6px;height:6px;border-radius:99px;background:var(--status-error,var(--oc-error,#e5484d));flex:none;animation:kb-dot-pulse 1.4s ease-in-out infinite}
@keyframes kb-dot-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.kb-dict-bars{height:18px;flex:1;min-width:0;display:block;color:var(--oc-muted)}
.kb-dict-timer{font:12px var(--oc-mono);font-variant-numeric:tabular-nums;color:var(--oc-muted);flex:none}
.kb-dict-actions{display:flex;gap:6px;flex:none}
.kb-dict-iconbtn{width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--oc-muted);border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 3px);cursor:pointer}
.kb-dict-iconbtn svg{width:14px;height:14px}
.kb-dict-iconbtn:hover{color:var(--oc-fg)}
.kb-dict-iconbtn:disabled{opacity:.5;cursor:default}
.kb-dict-iconbtn[data-primary="true"]{background:var(--oc-primary);color:var(--oc-primary-fg,#fff);border-color:transparent}
.kb-dict-iconbtn[data-primary="true"]:hover{color:var(--oc-primary-fg,#fff)}
.kb-dict-spin{width:14px;height:14px;flex:none;border:2px solid var(--oc-border);border-top-color:var(--oc-muted);border-radius:99px;animation:kb-spin 1s linear infinite}
@keyframes kb-spin{to{transform:rotate(360deg)}}
/* Rail panel (kb-rail on kb-page): the board's five views stacked as collapsible
   sections with slim interactive rows — a tap opens the task's chat, and
   deliberate taps (Mark done) are the only writes the panel ever makes. */
.kb-rail{gap:10px;padding:12px 14px}
.kb-rail h2{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}
.kb-rail-scope{margin:0;font-size:11px;color:var(--oc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-panel-unseen{margin:0;font-size:12px;color:var(--oc-warning,#e5a234)}
.kb-panel-sections{display:flex;flex-direction:column}
.kb-psec{display:flex;flex-direction:column}
.kb-psec+.kb-psec{border-top:1px solid var(--oc-border)}
.kb-psec-head{display:flex;align-items:center;gap:8px;width:100%;padding:9px 2px;background:none;border:0;font:inherit;cursor:pointer;text-align:left}
.kb-psec-head:hover .kb-psec-name{color:var(--oc-fg)}
.kb-psec-name{flex:1;min-width:0;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--oc-muted)}
.kb-psec-count{font:11px var(--oc-mono);color:var(--oc-muted);background:var(--oc-muted-surface);padding:2px 7px;border-radius:9999px}
.kb-psec-count[data-attn]{color:var(--oc-warning,#e5a234);background:color-mix(in srgb,var(--oc-warning,#e5a234) 14%,transparent)}
.kb-psec-chevron{width:12px;flex:none;text-align:center;font-size:10px;color:var(--oc-muted)}
.kb-psec-body{display:flex;flex-direction:column;gap:6px;padding:2px 0 10px}
.kb-panel-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:8px;cursor:pointer}
.kb-panel-row:hover{border-color:var(--oc-hover)}
.kb-panel-row:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-panel-row.kb-attn{border-color:var(--oc-warning,#e5a234);border-left-width:3px}
.kb-panel-row.kb-attn:hover{border-color:var(--oc-warning,#e5a234)}
.kb-panel-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.kb-panel-title{font-weight:550;font-size:13px;overflow-wrap:anywhere}
.kb-panel-sub{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--oc-muted);min-width:0}
.kb-panel-project{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-panel-sep{color:var(--oc-muted)}
.kb-panel-dot{width:6px;height:6px;border-radius:99px;background:var(--oc-muted);flex:none}
.kb-panel-dot[data-state="running"]{background:var(--oc-success,var(--status-success,#46a758))}
.kb-panel-dot[data-state="waiting"]{background:var(--oc-warning,#e5a234);animation:kb-panel-pulse 1.4s ease-in-out infinite}
.kb-panel-dot[data-state="failed"]{background:var(--oc-error,var(--status-error,#e5484d))}
@keyframes kb-panel-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.kb-panel-live{white-space:nowrap}
.kb-panel-chip{flex:none;font-size:10px;font-weight:500;color:var(--oc-warning,#e5a234);background:color-mix(in srgb,var(--oc-warning,#e5a234) 13%,transparent);padding:1px 6px;border-radius:9999px}
.kb-panel-actions{display:flex;gap:6px;margin-top:2px}
.kb-panel-btn{font:inherit;font-size:11px;padding:3px 9px;border-radius:6px;background:transparent;color:var(--oc-fg);border:1px solid var(--oc-border);cursor:pointer}
.kb-panel-btn:hover{background:var(--oc-hover)}
.kb-panel-btn-primary{background:var(--oc-primary);color:var(--oc-primary-fg,#fff);border-color:transparent}
.kb-panel-btn-primary:hover{filter:brightness(1.08)}
.kb-rail-foot{display:flex;align-items:center;gap:10px;justify-content:space-between}
.kb-rail-foot p{margin:0}
/* Under a finger the panel rows and actions reach the app's touch sizes. */
@media (pointer: coarse){
  .kb-psec-head{min-height:36px}
  .kb-panel-row{min-height:44px}
  .kb-panel-btn{padding:8px 12px}
}
[hidden]{display:none!important}
`;

export const injectStyles = () => {
  if (document.getElementById('kb-style')) return;
  const style = document.createElement('style');
  style.id = 'kb-style';
  style.textContent = CSS;
  document.head.append(style);
};
