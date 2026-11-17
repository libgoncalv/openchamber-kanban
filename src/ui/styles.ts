const CSS = `
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--oc-bg);color:var(--oc-fg);font-family:var(--oc-font);font-size:14px;line-height:1.45}
#root{min-height:100%}
.kb-page{display:flex;flex-direction:column;gap:14px;padding:16px;min-height:100%}
.kb-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.kb-toolbar .grow{flex:1;min-width:160px}
/* The selection bar (page only): appears under the toolbar while tasks are
   selected — a count, a Move-to menu, Mark Done, and the Delete that needs
   its second, confirming press. Plain buttons in the status-strip idiom. */
.kb-selectionbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 10px;background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:var(--oc-radius,10px)}
.kb-selectionbar-count{font-weight:600;font-size:13px}
.kb-bar-btn{min-height:30px;padding:5px 12px;font:inherit;font-size:12.5px;font-weight:550;color:var(--oc-fg);background:transparent;border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 3px);cursor:pointer}
.kb-bar-btn:hover{background:var(--oc-hover)}
.kb-bar-btn:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-bar-btn[data-tone="success"]{color:var(--oc-success-text,var(--oc-success,#46a758));border-color:color-mix(in srgb,var(--oc-success,#46a758) 40%,transparent)}
.kb-bar-btn[data-tone="success"]:hover{background:color-mix(in srgb,var(--oc-success,#46a758) 12%,transparent)}
.kb-bar-btn[data-tone="danger"]{color:var(--oc-error-text,var(--oc-error,#e5484d));border-color:color-mix(in srgb,var(--oc-error,#e5484d) 40%,transparent)}
.kb-bar-btn[data-tone="danger"]:hover{background:color-mix(in srgb,var(--oc-error,#e5484d) 12%,transparent)}
/* Armed destructive: filled — the second press must look like what it is. */
.kb-bar-btn[data-armed="true"]{background:var(--oc-error,var(--status-error,#e5484d));border-color:transparent;color:#fff}
.kb-bar-btn[data-armed="true"]:hover{background:var(--oc-error,var(--status-error,#e5484d));color:#fff}
.kb-columns{display:flex;gap:12px;align-items:flex-start;overflow-x:auto;padding-bottom:8px;flex:1}
.kb-column{flex:1 0 220px;min-width:220px;max-width:320px;display:flex;flex-direction:column;background:var(--oc-muted-surface);border:1px solid var(--oc-border);border-radius:var(--oc-radius,10px);min-height:120px;overflow:hidden}
.kb-column.kb-dragover{outline:2px solid var(--oc-focus);outline-offset:-2px}
.kb-column-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--oc-border)}
.kb-column-tools{display:flex;align-items:center;gap:8px;flex:none}
.kb-column-title{font-weight:600;font-size:12px;letter-spacing:.02em;text-transform:uppercase;color:var(--oc-muted)}
.kb-column-count{font:11px var(--oc-mono);color:var(--oc-muted)}
.kb-column-body{display:flex;flex-direction:column;gap:8px;padding:10px;overflow-y:auto;flex:1;min-height:40px}
.kb-column-empty{font-size:12px;color:var(--oc-muted);padding:8px 2px}
.kb-card{background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:9px;padding:10px;cursor:pointer;display:flex;flex-direction:column;gap:6px}
.kb-card:hover{border-color:var(--oc-hover)}
.kb-card:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-card.kb-dragging{opacity:.4}
.kb-card.kb-attn{border-color:var(--oc-warning);border-left-width:3px}
.kb-card.kb-attn:hover{border-color:var(--oc-warning)}
/* A selected card wears the focus-colored outline ring — not the border — so
   an attention card keeps its warning edge visible beside the selection. */
.kb-card[data-selected="true"]{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-check{width:15px;height:15px;margin:1px 0 0;accent-color:var(--oc-primary);cursor:pointer;flex:none}
.kb-card-title{font-weight:550;font-size:13px;overflow-wrap:anywhere}
.kb-card-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
/* The shared item head: title left, ⋯ menu right — same on cards and rows. */
.kb-item-top{display:flex;align-items:flex-start;gap:8px}
.kb-item-top .kb-panel-title{flex:1;min-width:0}
.kb-card:hover .kb-panel-menu,.kb-card:focus-within .kb-panel-menu{opacity:1}
.kb-column-count[data-attn]{color:var(--oc-warning,#e5a234)}
.kb-card-ref{font:11px var(--oc-mono);color:var(--oc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.kb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:24px;z-index:50}
.kb-dialog{background:var(--oc-bg);color:var(--oc-fg);border:1px solid var(--oc-border);border-radius:12px;max-width:640px;width:100%;max-height:88vh;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px}
.kb-dialog h2{margin:0;font-size:18px;letter-spacing:-.01em}
.kb-dialog:focus{outline:none}
.kb-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.kb-dialog-grid .kb-span2{grid-column:1/-1}
/* Dialog head: task title over a mono id/project sub line, agent pill beside. */
.kb-dialog-head{display:flex;align-items:flex-start;gap:10px}
.kb-dialog-head-main{flex:1;min-width:0}
.kb-dialog-sub{font:11px var(--oc-mono);color:var(--oc-muted);overflow-wrap:anywhere;margin-top:2px}
.kb-dialog-head .kb-agent-pill{margin-top:2px}
/* Compact variant for a narrow host surface (the rail panel's Edit dialog):
   single column, tighter rhythm — the same dialog otherwise. */
.kb-dialog-compact{max-width:100%;padding:14px;gap:10px}
.kb-dialog-compact h2{font-size:15px}
.kb-dialog-compact .kb-dialog-grid{grid-template-columns:1fr;gap:10px}
.kb-dialog-compact .kb-dialog-grid .kb-span2{grid-column:auto}
.kb-dialog-compact .kb-section{padding-top:10px}
.kb-section{display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--oc-border);padding-top:12px}
.kb-section-title{font-size:12px;font-weight:600;color:var(--oc-muted);text-transform:uppercase;letter-spacing:.02em}
.kb-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kb-row.between{justify-content:space-between}
.kb-muted{color:var(--oc-muted);font-size:12px}
.kb-mono{font:12px var(--oc-mono);color:var(--oc-muted)}
.kb-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:48px 16px;color:var(--oc-muted);text-align:center}
/* Corner close (the ✕ that replaced the footer's Close button): the small
   square icon-button idiom the board's cards use, one size up for the head. */
.kb-dialog-close{width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--oc-muted);border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 4px);cursor:pointer;flex:none}
.kb-dialog-close svg{width:13px;height:13px;display:block}
.kb-dialog-close:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-dialog-close:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
/* The task-body Delete button, always red (the kit's destructive) like the
   board's own danger buttons; the first, arming press fills it until the
   confirming press — the same escalation the selection bar's Delete gets. */
.kb-danger-btn[data-armed="true"] .oc-sdk-btn[data-variant="destructive"]{background:var(--oc-error,var(--status-error,#e5484d));border-color:transparent;color:var(--oc-primary-fg,#fff)}
.kb-danger-btn[data-armed="true"] .oc-sdk-btn[data-variant="destructive"]:hover{background:var(--oc-error,var(--status-error,#e5484d));color:var(--oc-primary-fg,#fff)}
/* The Start Agent block at the top of the session section: note, button,
   gating hint — no rule above it; the task-body actions row is just the
   existing 'kb-row between'. */
.kb-start{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.kb-start p{margin:0}
/* The status strip in the task dialog: one pressed button per status; a press
   moves immediately (the deliberate-move path), the pressed one is inert. */
.kb-status-seg{display:flex;align-items:stretch;gap:4px;flex-wrap:wrap}
.kb-status-seg-btn{flex:1 1 88px;min-height:30px;padding:5px 10px;font:inherit;font-size:12px;font-weight:550;color:var(--oc-muted);background:transparent;border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 3px);cursor:pointer}
.kb-status-seg-btn:hover{background:var(--oc-hover);color:var(--oc-fg)}
.kb-status-seg-btn:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-status-seg-btn[aria-pressed="true"]{background:var(--oc-primary);border-color:transparent;color:var(--oc-primary-fg,#fff);cursor:default}
.kb-status-seg-btn[aria-pressed="true"]:hover{background:var(--oc-primary);color:var(--oc-primary-fg,#fff)}
/* The linked-session row in the task dialog: the chat's title over its mono id. */
.kb-session-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.kb-session-title{font-weight:600;font-size:13px;overflow-wrap:anywhere}
.kb-banner{display:none}
.kb-banner[data-show]{display:block}
/* Dictation, blended into the description field (OpenChamber's composer
   look): while idle a lone ghost mic sits inside the textarea's bottom-right
   corner; while a capture runs a strip fades over the field's own bottom
   edge — pulsing dot, live level bars, duration and icon actions, spinner
   plus status while transcribing. No card and no border of its own.
   kb-field-float is the relative box detail.ts wraps the (SDK-rendered)
   textarea in; without it the controls fall back to plain flow below the
   field (kb-dict-plain), the same parts at the same sizes. */
.kb-dict{display:contents}
.kb-dict-plain{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.kb-field-float{position:relative}
/* Reserved bottom room: mic (idle) and strip (recording) live inside the
   textarea's frame over the field background, so typed lines must stop above
   them — the composer's standing padding trade. */
.kb-field-float textarea.oc-sdk-input{padding-bottom:36px}
.kb-dict-inline{width:26px;height:26px;padding:0;display:grid;place-items:center;background:none;border:0;border-radius:calc(var(--oc-radius,10px) - 4px);color:var(--oc-muted);cursor:pointer}
.kb-dict-inline svg{width:15px;height:15px;display:block}
.kb-dict-inline:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-dict-inline:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-field-float .kb-dict-inline{position:absolute;right:5px;bottom:5px}
.kb-dict-strip{display:flex;align-items:center;gap:8px;min-height:28px;padding:0 4px 0 10px;border-radius:calc(var(--oc-radius,10px) - 3px);background:var(--oc-elevated);background:color-mix(in srgb,var(--oc-sdk-field-bg,var(--oc-elevated)) 85%,transparent);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);box-shadow:0 1px 4px rgb(0 0 0 / .14)}
.kb-field-float .kb-dict-strip{position:absolute;left:6px;right:6px;bottom:5px}
.kb-dict-status{font-size:12px;color:var(--oc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-dict-dot{width:6px;height:6px;border-radius:99px;background:var(--status-error,var(--oc-error,#e5484d));flex:none;animation:kb-dot-pulse 1.4s ease-in-out infinite}
@keyframes kb-dot-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.kb-dict-bars{height:14px;flex:1;min-width:0;display:block;color:var(--oc-muted)}
.kb-dict-timer{font:12px var(--oc-mono);font-variant-numeric:tabular-nums;color:var(--oc-muted);flex:none}
.kb-dict-actions{display:flex;gap:2px;flex:none;margin-left:auto}
.kb-dict-iconbtn{width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:none;color:var(--oc-muted);border:0;border-radius:calc(var(--oc-radius,10px) - 4px);cursor:pointer}
.kb-dict-iconbtn svg{width:14px;height:14px;display:block}
.kb-dict-iconbtn:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-dict-iconbtn:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-dict-iconbtn:disabled{opacity:.5;cursor:default}
.kb-dict-iconbtn[data-primary="true"]{background:var(--oc-primary);color:var(--oc-primary-fg,#fff)}
.kb-dict-iconbtn[data-primary="true"]:hover{background:var(--oc-primary);color:var(--oc-primary-fg,#fff)}
.kb-dict-spin{width:14px;height:14px;flex:none;border:2px solid var(--oc-border);border-top-color:var(--oc-muted);border-radius:99px;animation:kb-spin 1s linear infinite}
@keyframes kb-spin{to{transform:rotate(360deg)}}
/* A capture is status feedback, not a place to read: under reduced motion the
   pulse and spin hold their shape — the timer and bars still live-update. */
@media (prefers-reduced-motion:reduce){.kb-dict-dot,.kb-dict-spin{animation:none}}
/* Rail panel (kb-rail on kb-page): the board's five views stacked as collapsible
   sections with slim rows. The ✓ at a row's edge is the panel's one write
   (Mark done — deliberate, at the user's own click); every other deliberate
   action lives on the full board. */
.kb-rail{gap:10px;padding:12px 14px}
.kb-rail h2{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}
.kb-rail-scope{margin:0;font-size:11px;color:var(--oc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-panel-unseen{margin:0;font-size:12px;color:var(--oc-warning,#e5a234)}
.kb-panel-sections{display:flex;flex-direction:column}
.kb-psec{display:flex;flex-direction:column}
.kb-psec+.kb-psec{border-top:1px solid var(--oc-border)}
/* The section heads are plain labels — the display-only mirror has no fold, no menu, no drop targets. */
.kb-psec-head{display:flex;align-items:center;gap:8px;width:100%;padding:9px 2px}
.kb-psec-name{flex:1;min-width:0;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--oc-muted)}
.kb-psec-count{font:11px var(--oc-mono);color:var(--oc-muted);background:var(--oc-muted-surface);padding:2px 7px;border-radius:9999px}
.kb-psec-count[data-attn]{color:var(--oc-warning,#e5a234);background:color-mix(in srgb,var(--oc-warning,#e5a234) 14%,transparent)}
/* One theme token per column (the renderer sets data-status on both surfaces):
   a 3px strip above the head, the title, and the count pill take the column's
   accent; bodies stay neutral — attention borders, agent pills and drag-over
   outlines keep their hues to themselves. Backlog muted, Review warning, Done
   success, and the blue family owns everything agent-engaged: To Do = the info
   blue held back, In Progress = the same blue at full strength. The theme's
   brand primary is deliberately out of the palette here — in real host themes
   it can sit anywhere on the wheel (seen: right next to the amber), so no
   column may depend on it to stay distinct. */
.kb-column,.kb-psec{--kb-accent:var(--oc-muted,#9a9ba6)}
.kb-column[data-status="todo"],.kb-psec[data-status="todo"]{--kb-accent:var(--oc-info,#5b9cf6)}
.kb-column[data-status="in_progress"],.kb-psec[data-status="in_progress"]{--kb-accent:var(--oc-info,#5b9cf6)}
.kb-column[data-status="review"],.kb-psec[data-status="review"]{--kb-accent:var(--oc-warning,#e5a234)}
.kb-column[data-status="done"],.kb-psec[data-status="done"]{--kb-accent:var(--oc-success,var(--status-success,#46a758))}
.kb-column::before,.kb-psec::before{content:"";display:block;height:3px;flex:none;background:var(--kb-accent)}
.kb-column-title,.kb-psec-name{color:var(--kb-accent)}
.kb-column-count{font:11px var(--oc-mono);color:var(--kb-accent);background:color-mix(in srgb,var(--kb-accent) 12%,transparent);padding:1px 7px;border-radius:9999px}
.kb-psec-count{font:11px var(--oc-mono);color:var(--kb-accent);background:color-mix(in srgb,var(--kb-accent) 12%,transparent);padding:2px 7px;border-radius:9999px}
/* To Do reads as the In Progress family at lower strength — planned vs
   working. Faded strip, dimmer title, lighter count tint; the attention
   rules above still outrank these wherever a count flags unseen. */
.kb-column[data-status="todo"]::before,.kb-psec[data-status="todo"]::before{background:color-mix(in srgb,var(--kb-accent) 45%,transparent)}
.kb-column[data-status="todo"] .kb-column-title,.kb-psec[data-status="todo"] .kb-psec-name{color:color-mix(in srgb,var(--kb-accent) 72%,transparent)}
.kb-column[data-status="todo"] .kb-column-count,.kb-psec[data-status="todo"] .kb-psec-count{background:color-mix(in srgb,var(--kb-accent) 9%,transparent)}
.kb-psec-body{display:flex;flex-direction:column;gap:6px;padding:2px 0 10px}
/* Display-only rows: the same look the page's cards read well in, minus every interaction affordance. */
.kb-panel-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:8px}
.kb-panel-row.kb-attn{border-color:var(--oc-warning,#e5a234);border-left-width:3px}
.kb-panel-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.kb-panel-title{font-weight:600;font-size:13px;overflow-wrap:anywhere}
.kb-panel-sub{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--oc-muted);min-width:0}
.kb-panel-project{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* The agent-state pill — one renderer (ui/pill.ts), everywhere: item meta
   line on cards and rail rows, the task dialog's head. Tints ride the host
   theme's --oc-* status tokens (applyHostReady paints them on the frame
   root; -text where the theme supplies one) and a glyph per state so the two
   waiting states separate at a glance. */
.kb-agent-pill{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:9999px;font-size:10.5px;font-weight:550;letter-spacing:.01em;white-space:nowrap;flex:none}
.kb-agent-pill[data-tone="info"]{color:var(--oc-info-text,var(--oc-info,#5b9cf6));background:color-mix(in srgb,var(--oc-info,#5b9cf6) 13%,transparent)}
.kb-agent-pill[data-tone="warning"]{color:var(--oc-warning-text,var(--oc-warning,#e5a234));background:color-mix(in srgb,var(--oc-warning,#e5a234) 13%,transparent)}
.kb-agent-pill[data-tone="error"]{color:var(--oc-error-text,var(--oc-error,#e5484d));background:color-mix(in srgb,var(--oc-error,#e5484d) 13%,transparent)}
.kb-agent-pill[data-tone="success"]{color:var(--oc-success-text,var(--oc-success,#46a758));background:color-mix(in srgb,var(--oc-success,#46a758) 13%,transparent)}
.kb-agent-pill svg{width:10px;height:10px;display:block}
.kb-agent-glyph{width:11px;height:11px;border:1.4px solid currentColor;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;line-height:1;flex:none}
.kb-agent-dotg{width:4px;height:4px;border-radius:9999px;background:currentColor;flex:none;margin:0 2px}
.kb-agent-spin{animation:kb-spin 1.2s linear infinite;transform-origin:center}
@media (prefers-reduced-motion:reduce){.kb-agent-spin{animation:none}}
.kb-rail-foot{display:flex;align-items:center;gap:10px;justify-content:space-between}
.kb-rail-foot p{margin:0}
.kb-panel-empty{font-size:12px;color:var(--oc-muted);padding:4px 2px}
/* The ⋯ menu slot lives inside page cards; the page reveals it on hover/focus (rule above), coarse pointers always. */
.kb-panel-menu{flex:none;opacity:0;transition:opacity 120ms ease-out}
/* Under a finger the rows reach the app's touch size; menus always show. */
@media (pointer: coarse){
  .kb-psec-head{min-height:36px}
  .kb-panel-row{min-height:44px}
  .kb-panel-menu{opacity:1}
  /* Touch has no hover: the page card's quiet ✓ is a button always, not only on reveal. */
  .kb-card .kb-iconbtn[data-quiet="true"]{opacity:1}
  /* The selection checkbox reaches a tappable size under a finger. */
  .kb-check{width:20px;height:20px}
  /* The in-field mic and the strip's buttons reach a tappable size too. */
  .kb-dict-inline{width:30px;height:30px}
  .kb-dict-iconbtn{width:26px;height:26px}
}
/* Small square icon buttons — the ✓ beside the ⋯ menu on page cards and the
   rail's mark-done ✓ — reusing the dictation panel's icon-button idiom.
   A hint ✓ (data-hint) is success-tinted and always visible: it IS the
   suggestion. A quiet ✓ (data-quiet) is muted and revealed on hover/focus,
   the same reveal rule as the ⋯ menu, sinking under it as the smaller
   affordance. An info ✓ (data-info) tints with the app's info tone and never
   hides: the rail's one always-visible affordance. */
.kb-iconbtn{width:22px;height:22px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--oc-muted);border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 4px);cursor:pointer;flex:none}
.kb-iconbtn svg{width:12px;height:12px;display:block}
.kb-iconbtn:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-iconbtn:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-iconbtn[data-hint="true"]{color:var(--oc-success,var(--status-success,#46a758));border-color:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 38%,transparent)}
.kb-iconbtn[data-hint="true"]:hover{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 12%,transparent)}
/* Tinted with the app's info tone (blue in its themes): the rail's always-visible mark-done ✓. */
.kb-iconbtn[data-info="true"]{color:var(--oc-info-text,var(--oc-info,#5b9cf6));border-color:color-mix(in srgb,var(--oc-info,#5b9cf6) 38%,transparent);background:color-mix(in srgb,var(--oc-info,#5b9cf6) 13%,transparent)}
.kb-iconbtn[data-info="true"]:hover{background:color-mix(in srgb,var(--oc-info,#5b9cf6) 22%,transparent)}
.kb-iconbtn[data-primary="true"]{background:var(--oc-primary);border-color:transparent;color:var(--oc-primary-fg,#fff)}
.kb-iconbtn[data-primary="true"]:hover{color:var(--oc-primary-fg,#fff)}
/* Toolbar icon buttons — the same idiom at toolbar scale: the reload (Refresh)
   spins while any reload is in flight, the plus is the board's primary action
   and dims while a create is in flight. */
.kb-tb-iconbtn{width:30px;height:30px;border-radius:calc(var(--oc-radius,10px) - 3px)}
.kb-tb-iconbtn svg{width:14px;height:14px;display:block}
.kb-tb-iconbtn.kb-spinning svg{animation:kb-spin .9s linear infinite;transform-origin:center}
.kb-tb-iconbtn[data-busy="true"]{opacity:.55;cursor:default}
/* An armed destructive icon button (the column head's trash after its first
   press) turns error-tinted — the second press empties the whole column. */
.kb-iconbtn[data-armed="true"]{color:var(--oc-error-text,var(--oc-error,#e5484d));border-color:color-mix(in srgb,var(--oc-error,#e5484d) 45%,transparent);background:color-mix(in srgb,var(--oc-error,#e5484d) 12%,transparent)}
.kb-iconbtn[data-armed="true"]:hover{background:color-mix(in srgb,var(--oc-error,#e5484d) 20%,transparent)}
.kb-card .kb-iconbtn[data-quiet="true"]{opacity:0;transition:opacity 120ms ease-out}
.kb-card:hover .kb-iconbtn[data-quiet="true"],.kb-card:focus-within .kb-iconbtn[data-quiet="true"]{opacity:1}
/* Rail rows carry the same buttons at the 26px touch size; the chat button
   and the ✓ (data-info) ride them at a row's right edge and never hide. */
.kb-panel-row .kb-iconbtn{width:26px;height:26px}
.kb-panel-row .kb-iconbtn svg{width:13px;height:13px}
[hidden]{display:none!important}
`;

export const injectStyles = () => {
  if (document.getElementById('kb-style')) return;
  const style = document.createElement('style');
  style.id = 'kb-style';
  style.textContent = CSS;
  document.head.append(style);
};
