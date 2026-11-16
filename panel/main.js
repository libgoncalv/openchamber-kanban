"use strict";(()=>{var f="openchamber.sdk";var Xe="data-oc-scrolling",Et=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${Xe}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Xe}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Xe}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Xe}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function _t(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let n=new WeakMap;e.addEventListener("scroll",s=>{let a=s.target===e?t:s.target;if(!(a instanceof Element))return;a.hasAttribute("data-oc-scrolling")||a.setAttribute("data-oc-scrolling","");let c=n.get(a);c!==void 0&&clearTimeout(c),n.set(a,setTimeout(()=>{n.delete(a),a.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var jr=`(${_t.toString()})(document);`;var vo=e=>{let t=[],n=0,s=0;return{push:a=>{for(t.push(a),s+=a.length;s-n>e&&t.length>1;){let c=t.shift();s-=c?.length??0,n=0}},pull:a=>{let c=0;for(;c<a.length&&t.length>0;){let E=t[0],T=Math.min(a.length-c,E.length-n);a.set(E.subarray(n,n+T),c),c+=T,n+=T,n>=E.length&&(t.shift(),s-=E.length,n=0)}a.fill(0,c)},clear:()=>{t.length=0,n=0,s=0},get size(){return s-n}}};var wo=/^[a-z][a-z0-9-]{0,39}$/;var Co=e=>Object(e)===e&&!Array.isArray(e),St=(e,t)=>Object.keys(e).every(n=>t.includes(n)),Uo=e=>String(e)===e&&e.length>=1&&e.length<=60,Mo=e=>String(e)===e&&e.length>=1&&e.length<=80,No=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let n of e){if(!Co(n)||!wo.test(n.id)||!Uo(n.label)||n.disabled!==void 0&&n.disabled!==!0&&n.disabled!==!1||t.has(n.id))return!1;if(t.add(n.id),n.kind==="button"){if(!St(n,["kind","id","label","disabled"]))return!1;continue}if(n.kind!=="select"||!St(n,["kind","id","label","value","options","disabled"])||!Mo(n.value)||!Array.isArray(n.options)||n.options.length<1||n.options.length>16)return!1;let s=new Set;for(let a of n.options){if(!Co(a)||!St(a,["value","label"])||!Mo(a.value)||!Uo(a.label)||s.has(a.value))return!1;s.add(a.value)}if(!s.has(n.value))return!1}return!0};var zr=1024*1024;var Po=["{id}","{segment}","{segments+}"];var $n=new Set(Po);var Lo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Fn=new Set(Lo);var Tt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Do=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let n=0;n<e.bytes.byteLength;n+=1)if(e.bytes[n]!==t.bytes[n])return!1;return!0};var Go=/^[A-Za-z0-9_-]{1,80}$/;var Ho=["left","right","top","bottom"];var Xo=(e,t=0,n={remaining:16e3})=>{if(--n.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let a of s)if(!Xo(a,t+1,n))return!1;return!0},ft=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(ft);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(ft)}return String(e)===e||Number.isFinite(e)},At=e=>{try{return String(e.id)!==e.id||!Go.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Ho.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Xo(e.data)||!ft(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var ht=2e3;var Vo=["file","directory","other","missing"],Ot=e=>!!(e&&"sessionId"in e),Rt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Fo=/^[0-9a-f]{7,64}$/i,xt=e=>Fo.test(e),$e=500,Ve=32e3,Bo=16e3,Ko=128,jo=200,Wo=2e3,zo=16e3,qo=80,Yo=200,Jo=16e3;var Qo=2e3;var gt=2e4,Fe=1024,Be=2e6;var Ke=64e3,je=8e3,kt=4e3;var bt=96e4,qr=60*6e4;var Zo=999,er=1e4,Ie=500,tr=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],or=["stopped","starting","ready","failed"],Yr=new Set(tr),rr=e=>Yr.has(e),nr=e=>e&&rr(e)?e:"HOST_REJECTED",ue=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(ue):Object(e)===e?Object.values(e).every(ue):!1,sr=e=>ue(e)&&JSON.stringify(e).length<=Jo,$o=e=>e?.trim().slice(0,Yo)??"",Ee=e=>{let t=e.id.trim().slice(0,Ko),n=e.title.trim().slice(0,jo),s=e.url.trim().slice(0,Wo),a=e.text?.trim().slice(0,zo),c=e.author?.trim().slice(0,qo),E=e.kind==="pull"?"pull":"issue",T={providerId:e.providerId.trim(),id:t,title:n||t,url:s,kind:E};if(a&&(T.text=a),c&&(T.author=c),E==="pull"){let R=$o(e.branches?.head),N=$o(e.branches?.base);R&&N&&(T.branches={head:R,base:N})}return sr(e.data)&&(T.data=e.data),T},It=e=>{let t=Ee(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},yt=e=>{let t={text:e.text.trim().slice(0,Bo)};return e.send&&(t.send=!0),t},vt=e=>e===null||!Number.isFinite(e)?null:Math.min(Zo,Math.max(0,Math.round(e))),Ct=e=>Number.isFinite(e)?Math.min(er,Math.max(0,Math.ceil(e))):0;var _e=e=>e.length>0&&e.length<=Fe&&!e.includes("\0")&&!e.includes("\\");var We=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Qo?!1:!e.split("/").some(n=>n==="."||n===".."),Jr=new Set(or),Ut=e=>!!(e&&"status"in e&&Jr.has(String(e.status))&&!("body"in e)),ze=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Mt=e=>!!(e&&"content"in e&&String(e.content)===e.content),wt=e=>!!(e&&"written"in e&&e.written===!0),Nt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Qr=new Set(Vo),Pt=e=>!!(e&&"kind"in e&&"size"in e&&Qr.has(String(e.kind))&&Number.isFinite(e.size)),Lt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Zr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),en=e=>Object(e)===e?e:null,mt=e=>String(e)===e&&e.length>0,tn=e=>{if(!mt(e.id))return null;if(e.ok===!0){let t={channel:f,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&mt(e.error)?{channel:f,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:nr(mt(e.code)?e.code:void 0)}:null},Dt=e=>{let t=en(e);return!t||t.channel!==f||t.v!==1?null:t.type==="result"?tn(t):!Zr.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var ir=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,on=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",p=class extends Error{code;constructor(t,n){super(n),this.name="HostRequestError",this.code=t}},ar=()=>Promise.reject(new p("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),qe=()=>Promise.reject(new p("BAD_PATH",`File path must be 1 to ${Fe} characters without NUL or backslash.`)),Ye=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new p("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},S=e=>(e.value+=1,`oc-${e.value}`),Vt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new p("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let n=e.acceptSource??(o=>o===t.parent),s=e.requestTimeoutMs??gt,a=new Set,c=new Set,E=new Set,T=new Set,R=new Set,N=new Set,Y=new Set,oe=new Set,Me=new Set,we=new Set,Ne=new Set,ae=new Set,at=[],Oe=null,Re=null,Pe=new Set,Le=new Set,xe=null,ge=null,ct=!1,ce=new Map,de=new Map,le=new Map,V=!1,_={value:0},u=null,j=null,ke=!1,be=!1,fo=null,G=null,Ao=o=>o?{sessionId:o.id,phase:o.busy?"started":"completed"}:null,P=o=>{t.parent.postMessage(o,"*")},mo=()=>{V||t.parent===t||ae.size===0||u?.features?.lateGenerateResults!==!0||P({channel:f,v:1,type:"generate-late-listen"})},x=(o,r)=>{for(let l of o)try{l(r)}catch(d){console.error(d)}},ho=o=>{if(!(o instanceof MessageEvent)||!n(o.source))return;let r=Dt(o.data);if(!r)return;if(r.type==="workspace"){let d=de.get(r.payload.subscriptionId);d&&x([d],r.payload.snapshot);return}if(r.type==="shells"){let d=le.get(r.payload.subscriptionId);d&&x([d],r.payload.snapshot);return}if(r.type==="microphone-audio"){G?.queue.push(r.payload.samples);return}if(r.type==="microphone-ended"){let d=G;if(!d)return;G=null,d.release(),x(d.endedListeners,r.payload.reason);return}if(r.type==="ready"){u=r.payload,j=Ao(r.payload.session),x(a,r.payload),x(c,r.payload.directory),x(E,r.payload.session),j&&x(T,j),x(R,r.payload.connection),x(N,r.payload.settings),x(Y,r.payload.item),r.payload.block&&x(oe,r.payload.block),mo();return}if(r.type==="service-event"){x(Me,r.payload);return}if(r.type==="generate-late"){ae.size===0?at.push(r.payload):x(ae,r.payload);return}if(r.type==="directory"){u&&(u={...u,directory:r.payload.directory}),x(c,r.payload.directory);return}if(r.type==="session"){u&&(u={...u,session:r.payload.session}),r.payload.session?j?.sessionId!==r.payload.session.id&&(j=Ao(r.payload.session)):j=null,x(E,r.payload.session);return}if(r.type==="session-lifecycle"){j=r.payload,x(T,r.payload);return}if(r.type==="connection"){u&&(u={...u,connection:r.payload.connection}),x(R,r.payload.connection);return}if(r.type==="settings"){u&&(u={...u,settings:r.payload.settings}),x(N,r.payload.settings);return}if(r.type==="item"){u&&(u={...u,item:r.payload.item}),x(Y,r.payload.item);return}if(r.type==="status-control-event"){x(we,r.payload);return}if(r.type==="popover-closed"){x(Ne,r.payload);return}if(r.type==="action"){let d=h=>{V||P({channel:f,v:1,type:"action-result",id:r.id,payload:h})},m=Re;if(!m){d({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>m(r.payload)).then(()=>d({ok:!0}),h=>{let g=(h instanceof Error?h.message:String(h)).trim();d({ok:!1,error:(g||"Action failed.").slice(0,Ie)})});return}if(r.type==="file-open"){let d=r.payload;if(ge&&Do(ge,d))return;ge=d,x(Pe,r.payload);return}if(r.type==="file-saved"){x(Le,r.payload.version);return}if(r.type==="file-snapshot"){let d=g=>{V||P({channel:f,v:1,type:"file-snapshot-result",id:r.id,payload:g})},m=g=>d({error:(g.trim()||"Could not read the edited file.").slice(0,Ie)}),h=xe;if(!h){m("This extension does not edit files.");return}Promise.resolve().then(()=>h(r.payload.purpose)).then(g=>{if(Tt(g)>2e7){m(`The file is over ${2e7} ${"bytes"in g?"bytes":"characters"}.`);return}if(g.version.length>256){m(`The snapshot version is over ${256} characters.`);return}d({snapshot:"bytes"in g?{bytes:g.bytes,version:g.version}:{content:g.content,version:g.version}})},g=>m(g instanceof Error?g.message:String(g)));return}if(r.type==="resolve"){let d=h=>{P({channel:f,v:1,type:"resolve-result",id:r.id,payload:h})},m=Oe;if(!m){d({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>m(r.payload)).then(h=>d({item:h?Ee(h):null}),h=>{let g=(h instanceof Error?h.message:String(h)).trim();d({error:(g||"Command failed.").slice(0,Ie)})});return}let l=ce.get(r.id);if(l){if(clearTimeout(l.timer),ce.delete(r.id),r.ok){l.resolve(r.payload);return}l.reject(new p(r.code,r.error))}};t.addEventListener("message",ho),P({channel:f,v:1,type:"hello"});let w=(o,r=s)=>V||t.parent===t?Promise.reject(new p("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((l,d)=>{let m=setTimeout(()=>{ce.delete(o.id),d(new p("HOST_TIMEOUT","Host did not answer in time."))},r);ce.set(o.id,{resolve:l,reject:d,timer:m}),P(o)}),v=o=>w(o).then(()=>{}),b={channel:f,v:1},dt=o=>{!V&&t.parent!==t&&P(o)},Oo=()=>dt({...b,type:"file-save"}),lt=()=>{!V&&t.parent!==t&&P({...b,type:"microphone-close",id:S(_)})},Br=async()=>{if(G)throw new p("HOST_REJECTED","The microphone is already open in this frame.");if(u?.features?.microphone!==!0)throw new p("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let o=globalThis.AudioContext;if(typeof o!="function")throw new p("UNSUPPORTED","This frame has no Web Audio.");let r=new o;if(r.sampleRate<8e3||r.sampleRate>192e3)throw r.close().catch(()=>{}),new p("UNSUPPORTED",`Audio at ${r.sampleRate} Hz is not supported.`);let l=r.state==="suspended"?r.resume().catch(()=>{}):void 0,d=vo(Math.round(r.sampleRate/4)),m=r.createScriptProcessor(1024,1,1);m.onaudioprocess=X=>d.pull(X.outputBuffer.getChannelData(0));let h=r.createMediaStreamDestination();m.connect(h);let g=new Set,pe={queue:d,endedListeners:g,release:()=>{m.onaudioprocess=null,m.disconnect(),d.clear();for(let X of h.stream.getTracks())X.stop();r.close().catch(()=>{})}};G=pe;try{let X=await w({...b,type:"microphone-open",id:S(_),payload:{sampleRate:r.sampleRate}},12e4);if(!X||!("opened"in X)||X.opened!==!0)throw new p("HOST_REJECTED","Host did not open the microphone.");if(await l,G!==pe)throw new p("DISCONNECTED","The microphone closed while it was opening.")}catch(X){throw G===pe&&(G=null),pe.release(),lt(),X}return{stream:h.stream,close:()=>{G===pe&&(G=null,pe.release(),lt())},onEnded:X=>(g.add(X),()=>{g.delete(X)})}},Ro=o=>{!ir(o)||!on(o)||(o.preventDefault(),Oo())},xo=o=>{!ir(o)||o.key!=="Escape"||u?.surface!=="popover"||!u.popover||(o.preventDefault(),Io(u.popover.id,"escape").catch(()=>{}))},De=()=>{let o=u?.surface==="popover"?u.popover:void 0;if(!o)return;let r=ke||be;fo!==r&&(fo=r,yo(o.id,r).catch(()=>{}))},Ge=()=>{u?.surface!=="popover"||ke||(ke=!0,De())},go=o=>{u?.surface!=="popover"||o.relatedTarget!==null||!ke||(ke=!1,De())},ko=()=>{u?.surface!=="popover"||be||(be=!0,De())},bo=()=>{u?.surface!=="popover"||!be||(be=!1,De())},F=(o,r=1024)=>{if(!o.trim()||o.length>r)throw new p("HOST_REJECTED",`Identity must contain 1 to ${r} characters.`)},pt=async o=>{o.kind!=="projects"&&F(o.projectId);let r=await w({...b,type:"workspace-read",id:S(_),payload:o});if(!r||!("kind"in r)||!("state"in r)||r.kind!==o.kind)throw new p("HOST_REJECTED","Host did not return workspace data.");return r},ut=async(o,r)=>{o.kind!=="projects"&&F(o.projectId);let l=S(_);de.set(l,r);try{await v({...b,type:"workspace-subscribe",id:S(_),payload:{subscriptionId:l,query:o}})}catch(d){throw de.delete(l),V||P({...b,type:"workspace-unsubscribe",id:S(_),payload:{subscriptionId:l}}),d}return()=>{!de.delete(l)||V||P({...b,type:"workspace-unsubscribe",id:S(_),payload:{subscriptionId:l}})}},Kr=async(o,r)=>{o.kind==="session"&&F(o.sessionId),o.kind==="project"&&F(o.projectId);let l=S(_);le.set(l,r);try{await v({...b,type:"shells-subscribe",id:S(_),payload:{subscriptionId:l,scope:o}})}catch(d){throw le.delete(l),V||P({...b,type:"shells-unsubscribe",id:S(_),payload:{subscriptionId:l}}),d}return()=>{!le.delete(l)||V||P({...b,type:"shells-unsubscribe",id:S(_),payload:{subscriptionId:l}})}},He=async o=>{if("key"in o&&(o.key.length===0||o.key.length>128))throw new p("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(o.op==="set"&&!ue(o.value))throw new p("HOST_REJECTED","Storage values must be JSON.");if(o.op==="set"&&new TextEncoder().encode(JSON.stringify(o.value)).length>65536)throw new p("HOST_REJECTED","Storage value exceeds 64 KiB.");if(o.scope==="device"&&u?.features?.deviceStorage!==!0)throw new p("UNSUPPORTED","This host does not support device storage.");let r=await w({...b,type:"storage",id:S(_),payload:o});if(!r||!("storage"in r)||r.op!==o.op)throw new p("HOST_REJECTED","Host did not return storage data.");return r},Io=(o,r)=>u?.features?.popovers!==!0&&!(u?.surface==="popover"&&u.popover?.id===o)?Promise.reject(new p("UNSUPPORTED","This host does not support popovers.")):v({...b,type:"popover-close",id:S(_),payload:r?{id:o,reason:r}:{id:o}}),yo=(o,r)=>u?.features?.popovers!==!0&&!(u?.surface==="popover"&&u.popover?.id===o)?Promise.reject(new p("UNSUPPORTED","This host does not support popovers.")):v({...b,type:"popover-anchor",id:S(_),payload:{id:o,active:r}});return t.addEventListener("keydown",xo,!0),t.addEventListener("pointerover",Ge),t.addEventListener("pointermove",Ge),t.addEventListener("pointerout",go),t.addEventListener("focus",ko),t.addEventListener("blur",bo),{onAction:o=>(Re=o,()=>{Re===o&&(Re=null)}),listProjects:async()=>{let o=await pt({kind:"projects"});if(o.kind!=="projects")throw new p("HOST_REJECTED","Expected projects.");return o},listWorktrees:async o=>{let r=await pt({kind:"worktrees",projectId:o});if(r.kind!=="worktrees")throw new p("HOST_REJECTED","Expected worktrees.");return r},listSessions:async o=>{let r=await pt({kind:"sessions",projectId:o});if(r.kind!=="sessions")throw new p("HOST_REJECTED","Expected sessions.");return r},onProjects:o=>ut({kind:"projects"},r=>{r.kind==="projects"&&o(r)}),onWorktrees:(o,r)=>ut({kind:"worktrees",projectId:o},l=>{l.kind==="worktrees"&&r(l)}),onSessions:(o,r)=>ut({kind:"sessions",projectId:o},l=>{l.kind==="sessions"&&r(l)}),onRunningShells:(o,r)=>Kr(o,r),readShellOutput:async(o,r)=>{F(o,128);let l=r?.cursor;if(l!==void 0&&(!Number.isInteger(l)||l<0))throw new p("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let d=r?.tailBytes;if(d!==void 0&&(!Number.isInteger(d)||d<1||d>65536))throw new p("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let h=await w({...b,type:"shell-output",id:S(_),payload:{shellId:o,cursor:l,tailBytes:d}});if(!h||typeof h.output!="string"||!Number.isFinite(h.cursor))throw new p("HOST_REJECTED","Host did not return shell output.");return h},stopShell:async o=>{if(F(o,128),(await w({...b,type:"shell-stop",id:S(_),payload:{shellId:o}}))?.stopped!==!0)throw new p("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async o=>{F(o),await v({...b,type:"open-session",id:S(_),payload:{sessionId:o}})},storage:{get:async(o,r)=>{let l=Ye(r),d={op:"get",key:o};l&&(d.scope=l);let m=await He(d);return m.op==="get"&&m.found?m.value:void 0},set:async(o,r,l)=>{let d=Ye(l),m={op:"set",key:o,value:r};d&&(m.scope=d),await He(m)},delete:async(o,r)=>{let l=Ye(r),d={op:"delete",key:o};l&&(d.scope=l),await He(d)},keys:async o=>{let r=Ye(o),l={op:"keys"};r&&(l.scope=r);let d=await He(l);if(d.op!=="keys")throw new p("HOST_REJECTED","Expected storage keys.");return d.keys}},onReady:o=>(a.add(o),u&&o(u),()=>{a.delete(o)}),onDirectory:o=>(c.add(o),u&&o(u.directory),()=>{c.delete(o)}),onSession:o=>(E.add(o),u&&o(u.session),()=>{E.delete(o)}),onSessionLifecycle:o=>(T.add(o),j&&o(j),()=>{T.delete(o)}),onConnection:o=>(R.add(o),u&&o(u.connection),()=>{R.delete(o)}),onSettings:o=>(N.add(o),u&&o(u.settings),()=>{N.delete(o)}),onItem:o=>(Y.add(o),u&&o(u.item),()=>{Y.delete(o)}),onBlock:o=>(oe.add(o),u?.block&&o(u.block),()=>{oe.delete(o)}),onServiceEvent:o=>(Me.add(o),()=>{Me.delete(o)}),onStatusControl:o=>(we.add(o),()=>{we.delete(o)}),onPopoverClosed:o=>(Ne.add(o),()=>{Ne.delete(o)}),setStatusControls:o=>u?.features?.statusControls!==!0?Promise.reject(new p("UNSUPPORTED","This host does not support status controls.")):No(o)?v({...b,type:"status-controls",id:S(_),payload:{controls:o}}):Promise.reject(new p("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:o=>u?.features?.popovers!==!0?Promise.reject(new p("UNSUPPORTED","This host does not support popovers.")):At(o)?v({...b,type:"popover-open",id:S(_),payload:o}):Promise.reject(new p("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Io,setPopoverAnchorActive:yo,onResolve:o=>(Oe=o,()=>{Oe===o&&(Oe=null)}),toast:o=>{let r=o.message.trim();return!r||r.length>$e?Promise.reject(new p("HOST_REJECTED",`Toast message must contain 1 to ${$e} characters.`)):o.copy&&o.copy!==!0&&(!o.copy.text.length||o.copy.text.length>Ve)?Promise.reject(new p("HOST_REJECTED",`Toast copy text must contain 1 to ${Ve} characters.`)):v({channel:f,v:1,type:"toast",id:S(_),payload:{...o,message:r}})},openUrl:o=>v({channel:f,v:1,type:"open-url",id:S(_),payload:{url:o}}),openCommit:o=>xt(o)?v({channel:f,v:1,type:"open-commit",id:S(_),payload:{sha:o}}):Promise.reject(new p("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:o=>v({channel:f,v:1,type:"block-answer",id:S(_),payload:{text:o.trim().slice(0,ht)}}),openSurface:o=>v({channel:f,v:1,type:"open-surface",id:S(_),payload:{surfaceId:o}}),writeClipboard:o=>v({channel:f,v:1,type:"clipboard-write",id:S(_),payload:{text:o}}),compose:o=>v({channel:f,v:1,type:"compose",id:S(_),payload:o}),attach:o=>v({channel:f,v:1,type:"attach",id:S(_),payload:Ee(o)}),startSession:async o=>{o.projectId!==void 0&&F(o.projectId);let r=o.worktree;r&&r!==!0&&(r.kind==="existing"?F(r.directory):(r.name!==void 0&&F(r.name,200),r.baseBranch!==void 0&&F(r.baseBranch,200)));let l=await w({channel:f,v:1,type:"start-session",id:S(_),payload:It(o)},e.requestTimeoutMs??18e4);if(!Ot(l))throw new p("HOST_REJECTED","Host did not return a session.");return l},prompt:o=>w({channel:f,v:1,type:"prompt",id:S(_),payload:yt(o)}).then(r=>{if(!Rt(r))throw new p("HOST_REJECTED","Host did not return a prompt result.");return r}),sessionLink:o=>v({channel:f,v:1,type:"session-link",id:S(_),payload:Ee(o)}),close:()=>v({channel:f,v:1,type:"close",id:S(_)}),oauthStart:()=>v({channel:f,v:1,type:"oauth-start",id:S(_)}),oauthDisconnect:()=>v({channel:f,v:1,type:"oauth-disconnect",id:S(_)}),request:o=>(We(o.path)?w({channel:f,v:1,type:"request",id:S(_),payload:o}):ar()).then(r=>{if(!ze(r))throw new p("HOST_REJECTED","Host request result was empty.");return r}),serviceRequest:o=>(We(o.path)?w({channel:f,v:1,type:"service-request",id:S(_),payload:o}):ar()).then(r=>{if(!ze(r))throw new p("HOST_REJECTED","Host service request result was empty.");return r}),serviceStatus:()=>w({channel:f,v:1,type:"service-status",id:S(_)}).then(o=>{if(!Ut(o))throw new p("HOST_REJECTED","Host did not return service status.");return o}),readFile:o=>(_e(o)?w({channel:f,v:1,type:"file-read",id:S(_),payload:{path:o}}):qe()).then(r=>{if(!Mt(r))throw new p("HOST_REJECTED","Host did not return file content.");return r}),writeFile:(o,r)=>_e(o)?r.length>Be?Promise.reject(new p("FILE_TOO_LARGE",`Content is over ${Be} characters.`)):w({channel:f,v:1,type:"file-write",id:S(_),payload:{path:o,content:r}}).then(l=>{if(!wt(l))throw new p("HOST_REJECTED","Host did not confirm the write.");return l}):qe(),listDir:o=>(_e(o)?w({channel:f,v:1,type:"file-list",id:S(_),payload:{path:o}}):qe()).then(r=>{if(!Nt(r))throw new p("HOST_REJECTED","Host did not return directory entries.");return r}),stat:o=>(_e(o)?w({channel:f,v:1,type:"file-stat",id:S(_),payload:{path:o}}):qe()).then(r=>{if(!Pt(r))throw new p("HOST_REJECTED","Host did not return file status.");return r}),generate:o=>{let r=o.prompt.trim(),l=o.system?.trim();if(r.length===0||r.length>Ke)return Promise.reject(new p("HOST_REJECTED",`Prompt must be 1 to ${Ke} characters.`));if(l!==void 0&&(l.length===0||l.length>je))return Promise.reject(new p("HOST_REJECTED",`System prompt must be 1 to ${je} characters.`));let d=o.maxOutputTokens===void 0?void 0:Math.min(kt,Math.max(1,Math.floor(o.maxOutputTokens)));if(d!==void 0&&!Number.isFinite(d))return Promise.reject(new p("HOST_REJECTED","maxOutputTokens must be a number."));let m={prompt:r};return l!==void 0&&(m.system=l),d!==void 0&&(m.maxOutputTokens=d),w({channel:f,v:1,type:"generate",id:S(_),payload:m},e.requestTimeoutMs??bt).then(h=>{if(!Lt(h))throw new p("HOST_REJECTED","Host did not return generated text.");return h})},onLateGenerateResult:o=>{ae.add(o);for(let r of at.splice(0))x([o],r);return mo(),()=>{ae.delete(o)}},openMicrophone:Br,setBadge:o=>v({channel:f,v:1,type:"badge",id:S(_),payload:{count:vt(o)}}),setHeight:o=>v({channel:f,v:1,type:"resize",id:S(_),payload:{height:Ct(o)}}),onFileOpen:o=>(Pe.add(o),ct||(ct=!0,t.addEventListener("keydown",Ro,!0)),ge&&o(ge),()=>{Pe.delete(o)}),onFileSnapshot:o=>(xe=o,()=>{xe===o&&(xe=null)}),onFileSaved:o=>(Le.add(o),()=>{Le.delete(o)}),reportFileChange:o=>dt({...b,type:"file-change",payload:{dirty:o.dirty,edited:o.edited}}),requestFileSave:Oo,reportFileUnsupported:()=>dt({...b,type:"file-unsupported"}),dispose:()=>{for(let o of de.keys())P({...b,type:"workspace-unsubscribe",id:S(_),payload:{subscriptionId:o}});de.clear();for(let o of le.keys())P({...b,type:"shells-unsubscribe",id:S(_),payload:{subscriptionId:o}});le.clear(),G&&(lt(),G.release(),G=null),V=!0,Oe=null,Re=null,xe=null,Pe.clear(),Le.clear(),ct&&t.removeEventListener("keydown",Ro,!0),t.removeEventListener("message",ho),t.removeEventListener("keydown",xo,!0),t.removeEventListener("pointerover",Ge),t.removeEventListener("pointermove",Ge),t.removeEventListener("pointerout",go),t.removeEventListener("focus",ko),t.removeEventListener("blur",bo);for(let o of ce.values())clearTimeout(o.timer),o.reject(new p("HOST_UNAVAILABLE","Host client was disposed."));ce.clear(),a.clear(),c.clear(),E.clear(),T.clear(),R.clear(),N.clear(),Y.clear(),oe.clear(),Me.clear(),we.clear(),Ne.clear(),ae.clear(),at.length=0}}};var Er=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var is=new Set(Er);var rn=10*6e4;var nn=10*6e4;var sn=10*6e4;var an=10*6e4;var _r=["none","agent","user"];var cs=new Set(_r);var cn=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],dn=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Sr=(e,t)=>{t.style.colorScheme=e.mode;for(let[n,s]of cn)t.style.setProperty(n,e.tokens[s]);for(let[n,s,a]of dn){let c=e.tokens[a]??"";t.style.setProperty(n,c),t.style.setProperty(s,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Ft=(e,t)=>{Sr(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var ln={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},k=(e,t)=>`var(--${e}, var(--oc-${ln[e]}, ${t}))`,z=k("surface-background","transparent"),Qe=k("surface-elevated","transparent"),Se=k("surface-elevated-foreground","inherit"),H=k("surface-foreground","inherit"),I=k("surface-muted-foreground","gray"),pn=k("surface-muted","transparent"),re=k("interactive-border","currentColor"),L=k("interactive-hover","transparent"),ne=k("interactive-active","transparent"),Bt=k("interactive-selection","transparent"),Kt=k("interactive-selection-foreground","inherit"),W=k("primary","currentColor"),jt=k("primary-text","inherit"),Wt=k("error-text","inherit"),un=k("font-sans","inherit"),zt=k("font-mono","monospace"),mr=k("radius","9px"),qt=`calc(${mr} - 2px)`,Tr=`calc(${mr} - 4px)`,y=(e,t,n="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${n})`,fr=`background-image: linear-gradient(${L}, ${L});`,Yt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Jt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Ar="box-shadow: var(--oc-sdk-lit);",Qt=`inset 0 0.5px 0 0 ${y(H,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,En=`
:root {
  --oc-sdk-edge: ${y(H,16)};
  --oc-sdk-field-bg: ${Qe};
  --oc-sdk-raised-bg: ${z};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${y(H,14)};
  --oc-sdk-field-bg: ${y(z,50,Qe)};
  --oc-sdk-raised-bg: ${Qe};
  --oc-sdk-field-lift: ${Qt};
  --oc-sdk-raised-lift: ${Qt};
  --oc-sdk-lit: ${Qt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Je=e=>{let t=k(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${k(`${e}-text`,"inherit")}; }`},i=e=>`calc(${e}rem / 14)`,_n=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: ${i(8)}; height: ${i(32)}; padding: 0 ${i(12)}; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: ${i(6)}; height: ${i(28)}; padding: 0 ${i(10)}; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: ${i(4)}; height: ${i(24)}; padding: 0 ${i(8)}; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: ${i(14)}; height: ${i(14)}; }

.oc-sdk-field { display: flex; flex-direction: column; gap: ${i(4)}; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: ${i(32)}; padding: 0 ${i(10)}; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: ${i(8)} ${i(10)}; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: ${i(34)}; padding-right: ${i(34)}; }
.oc-sdk-search-icon { position: absolute; left: ${i(11)}; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: ${i(6)}; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: ${i(24)}; height: ${i(24)}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: ${i(4)}; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: ${i(6)}; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: ${i(28)}; padding: 0 ${i(10)}; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: ${i(2)}; min-width: ${i(160)}; max-width: calc(100vw - ${i(16)}); max-height: min(${i(320)}, calc(100vh - ${i(16)})); overflow: auto; padding: ${i(4)}; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: ${i(2)} ${i(2)} ${i(4)}; }
.oc-sdk-popup-search .oc-sdk-input { height: ${i(28)}; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: ${i(8)}; width: 100%; padding: ${i(6)} ${i(8)}; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: ${i(14)}; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: ${i(8)}; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: ${i(8)}; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: ${i(14)}; height: ${i(14)}; margin-top: ${i(3)}; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: ${i(36)}; height: ${i(20)}; --oc-sdk-thumb-travel: ${i(16)}; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: ${i(2)}; left: ${i(2)}; width: ${i(16)}; height: ${i(16)}; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: ${i(2)}; padding: ${i(2)}; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: ${i(6)}; height: ${i(28)}; padding: 0 ${i(10)}; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: ${i(1)} ${i(6)}; font-size: ${i(11)}; font-weight: 500; line-height: ${i(16)}; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: ${i(8)}; width: 100%; padding: ${i(6)} ${i(8)}; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: ${i(64)}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: ${i(16)} ${i(8)}; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${i(4)}; padding: ${i(40)} ${i(16)}; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: ${i(12)}; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: ${i(8)}; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: ${i(16)}; height: ${i(16)}; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: ${i(12)}; height: ${i(12)}; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: ${i(12)}; padding: ${i(8)} ${i(12)}; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: ${i(2)}; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: ${i(8)}; width: 100%; margin: ${i(8)} 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: ${i(4)} 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: ${i(4)}; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: ${i(6)}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: ${i(2)}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: ${i(8)} 0; }

/* Under a finger the controls reach the app's touch sizes: rows and options 44px like its sheets, every other
   control at least 36px. Inputs keep 16px text, below which iOS zooms the page on focus. */
@media (pointer: coarse) {
  .oc-sdk-btn, .oc-sdk-input { height: ${i(40)}; }
  .oc-sdk-btn[data-size="sm"], .oc-sdk-btn[data-size="xs"], .oc-sdk-trigger, .oc-sdk-tab, .oc-sdk-popup-search .oc-sdk-input { height: ${i(36)}; }
  .oc-sdk-input, .oc-sdk-popup-search .oc-sdk-input { font-size: max(16px, 0.875rem); }
  .oc-sdk-search-clear { width: ${i(36)}; height: ${i(36)}; right: 0; }
  .oc-sdk-row, .oc-sdk-option { min-height: ${i(44)}; }
  .oc-sdk-check { min-height: ${i(36)}; padding: ${i(8)} 0; }
}
`,hr=`${En}
.oc-sdk { color: ${H}; font-family: ${un}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${fr} }
.oc-sdk-mono { font-family: ${zt}; }
.oc-sdk-muted { color: ${I}; }
${Je("success")}${Je("warning")}${Je("error")}${Je("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${W}; --oc-sdk-tone-text: ${jt}; }

.oc-sdk-btn { border-radius: ${qt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Tr}; }
.oc-sdk-btn[data-variant="default"] { color: ${jt}; background: ${y(W,10,z)}; border-color: ${y(W,12)}; ${Ar} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${y(W,16,z)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${y(W,22,z)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${pn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${ne}, ${ne}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Se}; ${Jt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${ne}, ${ne}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${L}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${ne}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${k("status-error","red")}; color: ${Wt}; background: ${y("var(--oc-sdk-tone)",7,z)}; border-color: ${y("var(--oc-sdk-tone)",12)}; ${Ar} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${y("var(--oc-sdk-tone)",9,z)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${y("var(--oc-sdk-tone)",11,z)}; box-shadow: none; }

.oc-sdk-field-note { color: ${I}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Wt}; }
.oc-sdk-input { border-radius: ${qt}; background: var(--oc-sdk-field-bg); color: ${Se}; ${Yt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${I}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Yt(y(H,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Yt(k("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${zt}; }

.oc-sdk-search-icon { color: ${I}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${W}; }
.oc-sdk-search-clear { border-radius: ${Tr}; color: ${I}; }
.oc-sdk-search-clear:hover { background: ${L}; color: ${H}; }

.oc-sdk-trigger { border-radius: ${qt}; background: var(--oc-sdk-raised-bg); color: ${Se}; ${Jt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${L}, ${L}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${ne}, ${ne}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${I}; }
.oc-sdk-trigger-chevron { color: ${I}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Se}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Qe}; background-clip: padding-box; color: ${Se}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${L}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Bt}; color: ${Kt}; }
.oc-sdk-option-check { color: ${H}; }
.oc-sdk-option[data-destructive="true"] { color: ${Wt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${y(k("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${I}; }
.oc-sdk-popup-empty { color: ${I}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${re}; border-radius: 4px; color: ${H}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${y(H,60,re)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${re}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${z}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${W}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${fr} }
.oc-sdk-check-desc { color: ${I}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${y(H,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${I}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${H}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Kt}; background: ${Bt}; border-color: ${re}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Se}; background: var(--oc-sdk-raised-bg); ${Jt} }
.oc-sdk-tab-count { color: ${I}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${y(H,6)}; color: ${I}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${y("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${L}; }
.oc-sdk-row[aria-selected="true"] { background: ${Bt}; color: ${Kt}; }
.oc-sdk-row-lead { font-family: ${zt}; color: ${I}; }
.oc-sdk-row-sub { color: ${I}; }
.oc-sdk-row-meta { color: ${I}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${I}; }

.oc-sdk-empty-body { color: ${I}; }

.oc-sdk-spinner { color: ${I}; }
.oc-sdk-spinner-ring { border-color: ${re}; border-top-color: ${W}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${y("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${I}; }

.oc-sdk-separator { color: ${I}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${y(re,40)}; }

.oc-sdk-progress-label { color: ${I}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${y(H,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${W}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${k("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${k("success-text","inherit")}; }

.oc-sdk-text a { color: ${jt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${y(re,60)}; }
`,C=`
${Et}
${_n}
${hr}`;var Or="oc-sdk-ui-style";var U=e=>{let t=document.getElementById(Or);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}_t(document);let n=document.createElement("style");n.id=Or,n.textContent=e,document.head.appendChild(n)},M=(e,t)=>{let n=document.createElement(e);return t&&(n.className=t),n},J=e=>{let t=M("button",e);return t.type="button",t},$=(e,t)=>{let n=t??"";e.textContent!==n&&(e.textContent=n)},se=(e,t,n)=>{n==null||n===""?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)};var Sn=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Te=(e,t)=>{U(C);let n=t,s=J("oc-sdk oc-sdk-btn"),a=Sn(),c=document.createElement("span");s.append(c),e.append(s);let E=()=>{s.dataset.variant=n.variant??"default",s.dataset.size=n.size??"default",s.disabled=!!n.disabled||!!n.loading,s.dataset.loading=n.loading?"true":"false",s.setAttribute("aria-busy",n.loading?"true":"false"),n.loading&&a.parentNode!==s?s.prepend(a):!n.loading&&a.parentNode===s&&a.remove(),$(c,n.label)},T=()=>{n.disabled||n.loading||n.onClick()};return s.addEventListener("click",T),E(),{update:R=>{n={...n,...R},E()},dispose:()=>{s.removeEventListener("click",T),s.remove()}}};var Zt=(e,t)=>{se(e,"data-tone",t&&t!=="neutral"?t:null)},eo=(e,t)=>{U(C);let n=t,s=M("span","oc-sdk oc-sdk-badge");e.append(s);let a=()=>{$(s,n.label),Zt(s,n.tone)};return a(),{update:c=>{n={...n,...c},a()},dispose:()=>{s.remove()}}};var q=["backlog","todo","in_progress","review","done"],oo={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},Rr=1,xr=200,gr=16e3;var mn=512,hn=/^t_[a-z0-9]{6,40}$/,rt=e=>typeof e=="string"&&q.includes(e);var Q=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let n=e.trim();if(!n)return null;if(n.length>mn)throw new Error(`${t} is too long`);return n},kr=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>xr)throw new Error(`Title is limited to ${xr} characters`);return t},br=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>gr)throw new Error(`Description is limited to ${gr} characters`);return e};var Ir=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,n=Q(t.directory,"worktree.directory");if(!n)throw new Error("worktree.directory is required");return{directory:n,branch:Q(t.branch,"worktree.branch")}},to=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},yr=(e,t)=>e==null?null:to(e,t);var ro=(e,t,n=Date.now())=>{let s={...e,updatedAt:Math.max(n,e.updatedAt)};if("title"in t&&(s.title=kr(t.title)),"description"in t&&(s.description=br(t.description)),"status"in t){if(!rt(t.status))throw new Error("Unknown status");s.status=t.status}if("projectId"in t&&(s.projectId=Q(t.projectId,"projectId")),"sourceBranch"in t&&(s.sourceBranch=Q(t.sourceBranch,"sourceBranch")),"worktree"in t&&(s.worktree=Ir(t.worktree)),"sessionId"in t&&(s.sessionId=Q(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");s.rank=t.rank}return"needsAttentionSince"in t&&(s.needsAttentionSince=yr(t.needsAttentionSince,"needsAttentionSince")),s},no=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==Rr)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!hn.test(t.id))throw new Error("Task id is invalid");if(!rt(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:Rr,id:t.id,title:kr(t.title),description:br(t.description),status:t.status,rank:t.rank,projectId:Q(t.projectId,"projectId"),sourceBranch:Q(t.sourceBranch,"sourceBranch"),worktree:Ir(t.worktree),sessionId:Q(t.sessionId,"sessionId"),createdAt:to(t.createdAt,"createdAt"),updatedAt:to(t.updatedAt,"updatedAt"),needsAttentionSince:yr(t.needsAttentionSince,"needsAttentionSince")}};var Cr="task:",vr=16,Ur=e=>`${Cr}${e}`,so=async e=>{let t=(await e.storage.keys()).filter(a=>a.startsWith(Cr)),n=[],s=[];for(let a=0;a<t.length;a+=vr)await Promise.all(t.slice(a,a+vr).map(async c=>{try{let E=no(await e.storage.get(c));if(Ur(E.id)!==c)throw new Error("Task id does not match its key");n.push(E)}catch{s.push(c)}}));return{tasks:n,failedKeys:s}},io=async(e,t)=>{let n=no(t);await e.storage.set(Ur(n.id),n)};var Mr="panel-prefs",nt={collapsed:["backlog","todo","done"]},On=e=>{if(!e||typeof e!="object"||Array.isArray(e))return{collapsed:[...nt.collapsed]};let t=e;return Array.isArray(t.collapsed)?{collapsed:[...new Set(t.collapsed.filter(s=>rt(s)))]}:{collapsed:[...nt.collapsed]}},wr=async e=>On(await e.storage.get(Mr)),Nr=(e,t)=>e.storage.set(Mr,{collapsed:t.collapsed});var ao=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id);var ie={waitingPermissionMeansReview:!0,failedMeansReview:!0},Pr=(e,t,n,s=ie)=>{if(e==="done")return null;let a=()=>e==="review"?null:"review",c=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return c();case"waiting-question":return a();case"waiting-permission":return s.waitingPermissionMeansReview?a():null;case"idle":return n==="completed"||n==="failed"&&s.failedMeansReview?a():null;default:return null}};var Rn=(e,t,n=ie)=>t?Pr(e.status,t.activity,t.outcome,n)??e.status:e.status,xn=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,gn=(e,t,n=ie)=>{let s=xn(e,t),a=Rn(e,s,n),c=a!==e.status,E=e.needsAttentionSince!==null||c&&a==="review";return{task:e,displayStatus:a,movedByAgent:c,attention:E,attentionSince:e.needsAttentionSince??(E&&s?s.updatedAt:null),live:s}},co=(e,t)=>t?e.filter(n=>n.projectId===t):e,kn=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||ao(e.task,t.task),Lr=(e,t,n=ie)=>{let s=Object.fromEntries(q.map(a=>[a,[]]));for(let a of e){let c=gn(a,t,n);s[c.displayStatus].push(c)}for(let a of q)s[a].sort((c,E)=>a==="review"?kn(c,E):ao(c.task,E.task));return s},Dr=e=>Object.values(e).reduce((t,n)=>t+n.filter(s=>s.attention&&s.displayStatus!=="done").length,0),Gr=e=>{switch(e.activity){case"running":return{text:"running",tone:"running"};case"retrying":return{text:"retrying",tone:"running"};case"waiting-question":return{text:"needs your answer",tone:"waiting"};case"waiting-permission":return{text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{text:"finished",tone:"idle"}:e.outcome==="failed"?{text:"failed",tone:"failed"}:{text:"idle",tone:"idle"};default:return null}};var Hr=(e,t)=>{if(!t)return null;let n=e.find(s=>s.directory===t);return n||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,a)=>a.directory.length-s.directory.length)[0]??null)},lo=e=>{if(e instanceof p)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var bn=`
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
   sections with slim interactive rows \u2014 a tap opens the task's chat, and
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
`,Xr=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=bn,document.head.append(e)};var O=(e,t="",n="")=>{let s=document.createElement(e);return t&&(s.className=t),n&&(s.textContent=n),s};var D=Vt(),uo=document.querySelector("#root");if(!uo)throw new Error("Missing #root");var st=!1,K=!1,B=[],To=[],Eo=null,me=null,Ae=new Set(nt.collapsed),Z=new Map,fe=new Map,_o,ye,po=!1,ee=!1,Fr,he,ve,Ce,So,$r=()=>{me=Hr(To,Eo)};D.onReady(e=>{if(st)return;st=!0,Ft(e,document.documentElement),Eo=e.directory,Xr(),uo.replaceChildren();let t=O("div","kb-page kb-rail"),n=O("div","kb-row between");n.append(O("h2","","Kanban"));let s=O("span");n.append(s),t.append(n),he=O("p","kb-muted","Loading\u2026"),t.append(he),ve=O("p","kb-rail-scope"),t.append(ve),Ce=O("p","kb-panel-unseen"),t.append(Ce);let a=O("div","kb-panel-sections");t.append(a);let c=O("div","kb-rail-foot");c.append(O("p","kb-muted","Full board: Extension pages menu")),Te(c,{label:"Refresh",variant:"ghost",onClick:()=>{Ue()}}),t.append(c),uo.append(t),Fr=eo(s,{label:"",tone:"neutral"}),So={};for(let E of q){let T=O("div","kb-psec"),R=document.createElement("button");R.type="button",R.className="kb-psec-head",R.append(O("span","kb-psec-name",oo[E]));let N=O("span","kb-psec-count","0"),Y=O("span","kb-psec-chevron","\u25BE");R.append(N,Y);let oe=O("div","kb-psec-body");T.append(R,oe),a.append(T),So[E]={count:N,chev:Y,body:oe},R.addEventListener("click",()=>{Ae.has(E)?Ae.delete(E):Ae.add(E),Nr(D,{collapsed:[...Ae]}).catch(()=>{}),ee&&te()})}_o=window.setInterval(()=>{Ue()},3e4),D.onProjects(E=>{K||E.state!=="ready"||(To=E.projects,$r(),ee&&(te(),it()))}).then(()=>{},()=>{}),D.onDirectory(E=>{K||(Eo=E,$r(),ee&&(te(),it()))}),In()});var In=async()=>{try{let[e,t]=await Promise.all([wr(D),so(D)]);if(K)return;Ae=new Set(e.collapsed),B=t.tasks,ee=!0,he.hidden=!0,it(),te()}catch(e){he.textContent=`Could not load tasks \u2014 ${lo(e)}`}},Ue=async()=>{if(!(!st||K||po)){po=!0;try{let{tasks:e}=await so(D);if(K)return;B=e,ee||(ee=!0,he.hidden=!0),it(),te()}catch(e){ee||(he.textContent=`Could not load tasks \u2014 ${lo(e)}`)}finally{po=!1}}},yn=()=>{ye!==void 0||K||!st||(ye=window.setTimeout(()=>{ye=void 0,Ue()},500))},it=()=>{let e=co(B,me?.id??null),t=new Set;for(let n of e)n.sessionId&&n.projectId&&t.add(n.projectId);for(let n of t){if(fe.has(n))continue;let s;s=D.onSessions(n,a=>{if(!K){if(a.state==="error")for(let[c,E]of Z)E.projectId===n&&Z.delete(c);else if(a.state==="ready"){for(let[c,E]of Z)E.projectId===n&&Z.delete(c);for(let c of a.sessions)c.parentId===null&&Z.set(c.id,{projectId:n,activity:c.activity,outcome:c.outcome,updatedAt:c.updatedAt})}ee&&te(),yn()}}),s.then(()=>{},()=>{fe.get(n)===s&&fe.delete(n)}),fe.set(n,s)}for(let[n,s]of[...fe])if(!t.has(n)){fe.delete(n);for(let[a,c]of Z)c.projectId===n&&Z.delete(a);s.then(a=>a(),()=>{})}},te=()=>{let e=Lr(co(B,me?.id??null),Z,ie),t=q.reduce((s,a)=>s+e[a].length,0),n=Dr(e);me?(ve.textContent=`Project: ${me.name}`,ve.hidden=!1):ve.hidden=!0,Fr.update({label:n>0?`${t} open \xB7 ${n} unseen`:`${t} open`,tone:n>0?"warning":"neutral"}),D.setBadge(t||null).catch(()=>{}),n>0?(Ce.textContent=`${n} task${n===1?"":"s"} need${n===1?"s":""} your review`,Ce.hidden=!1):Ce.hidden=!0;for(let s of q){let a=So[s],c=e[s];a.count.textContent=String(c.length),c.some(T=>T.attention&&T.displayStatus!=="done")?a.count.dataset.attn="true":delete a.count.dataset.attn;let E=!Ae.has(s);a.chev.textContent=E?"\u25BE":"\u25B8",a.body.hidden=!E,a.body.replaceChildren(...c.map(vn))}},vn=e=>{let t=O("div",e.attention?"kb-panel-row kb-attn":"kb-panel-row"),n=O("div","kb-panel-main");t.append(n),n.append(O("div","kb-panel-title",e.task.title));let s=O("div","kb-panel-sub"),a=!me&&e.task.projectId?To.find(T=>T.id===e.task.projectId)?.name??null:null;a&&s.append(O("span","kb-panel-project",a));let c=e.live?Gr(e.live):e.task.sessionId?{text:"chat linked",tone:"idle"}:null;if(c){a&&s.append(O("span","kb-panel-sep","\xB7"));let T=O("span","kb-panel-dot");T.dataset.state=c.tone,s.append(T,O("span","kb-panel-live",c.text))}if(n.append(s),e.attention){let T=O("div","kb-panel-actions");if(e.task.sessionId){let R=O("button","kb-panel-btn kb-panel-btn-primary","Open chat");R.type="button",R.addEventListener("click",N=>{N.stopPropagation(),Vr(e.task)}),T.append(R)}if(e.displayStatus!=="done"){let R=O("button","kb-panel-btn","Mark done");R.type="button",R.addEventListener("click",N=>{N.stopPropagation(),Cn(e.task)}),T.append(R)}T.childElementCount>0&&n.append(T)}e.movedByAgent&&t.append(O("span","kb-panel-chip",`\u2192 ${oo[e.displayStatus]}`));let E=()=>{Vr(e.task)};return t.addEventListener("click",E),t.tabIndex=0,t.addEventListener("keydown",T=>{(T.key==="Enter"||T.key===" ")&&(T.preventDefault(),E())}),t},Vr=async e=>{if(K)return;let t=B.find(n=>n.id===e.id)??e;if(!t.sessionId){D.toast({kind:"info",message:`"${t.title}" has no chat linked yet \u2014 use the full board (Extension pages menu) to start an agent.`}).catch(()=>{});return}if(t.needsAttentionSince!==null){let n=ro(t,{needsAttentionSince:null});B=B.map(s=>s.id===t.id?n:s),te();try{await io(D,n)}catch{Ue()}}await D.openSession(t.sessionId)},Cn=async e=>{if(K)return;let t=B.find(s=>s.id===e.id)??e,n=ro(t,{status:"done",needsAttentionSince:null});B=B.map(s=>s.id===t.id?n:s),te();try{await io(D,n)}catch{Ue()}};window.addEventListener("pagehide",()=>{K=!0,_o!==void 0&&window.clearInterval(_o),ye!==void 0&&window.clearTimeout(ye),D.dispose()});})();
