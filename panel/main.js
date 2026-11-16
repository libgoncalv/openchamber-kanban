"use strict";(()=>{var E="openchamber.sdk";var Ie="data-oc-scrolling",ze=`
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
:hover, [${Ie}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Ie}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Ie}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Ie}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function qe(e){let r=e.documentElement;if(r.hasAttribute("data-oc-scrollbar-activity"))return;r.setAttribute("data-oc-scrollbar-activity","");let n=new WeakMap;e.addEventListener("scroll",d=>{let l=d.target===e?r:d.target;if(!(l instanceof Element))return;l.hasAttribute("data-oc-scrolling")||l.setAttribute("data-oc-scrolling","");let S=n.get(l);S!==void 0&&clearTimeout(S),n.set(l,setTimeout(()=>{n.delete(l),l.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var tr=`(${qe.toString()})(document);`;var Jt=e=>{let r=[],n=0,d=0;return{push:l=>{for(r.push(l),d+=l.length;d-n>e&&r.length>1;){let S=r.shift();d-=S?.length??0,n=0}},pull:l=>{let S=0;for(;S<l.length&&r.length>0;){let m=r[0],k=Math.min(l.length-S,m.length-n);l.set(m.subarray(n,n+k),S),S+=k,n+=k,n>=m.length&&(r.shift(),d-=m.length,n=0)}l.fill(0,S)},clear:()=>{r.length=0,n=0,d=0},get size(){return d-n}}};var eo=/^[a-z][a-z0-9-]{0,39}$/;var Yt=e=>Object(e)===e&&!Array.isArray(e),Je=(e,r)=>Object.keys(e).every(n=>r.includes(n)),Qt=e=>String(e)===e&&e.length>=1&&e.length<=60,Zt=e=>String(e)===e&&e.length>=1&&e.length<=80,to=e=>{if(!Array.isArray(e)||e.length>4)return!1;let r=new Set;for(let n of e){if(!Yt(n)||!eo.test(n.id)||!Qt(n.label)||n.disabled!==void 0&&n.disabled!==!0&&n.disabled!==!1||r.has(n.id))return!1;if(r.add(n.id),n.kind==="button"){if(!Je(n,["kind","id","label","disabled"]))return!1;continue}if(n.kind!=="select"||!Je(n,["kind","id","label","value","options","disabled"])||!Zt(n.value)||!Array.isArray(n.options)||n.options.length<1||n.options.length>16)return!1;let d=new Set;for(let l of n.options){if(!Yt(l)||!Je(l,["value","label"])||!Zt(l.value)||!Qt(l.label)||d.has(l.value))return!1;d.add(l.value)}if(!d.has(n.value))return!1}return!0};var rr=1024*1024;var oo=["{id}","{segment}","{segments+}"];var jr=new Set(oo);var ro=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var qr=new Set(ro);var Ye=e=>"bytes"in e?e.bytes.byteLength:e.content.length,no=(e,r)=>{if(e.path!==r.path||e.readOnly!==r.readOnly)return!1;if(e.encoding==="text"||r.encoding==="text")return e.encoding==="text"&&r.encoding==="text"&&e.content===r.content;if(e.bytes.byteLength!==r.bytes.byteLength)return!1;for(let n=0;n<e.bytes.byteLength;n+=1)if(e.bytes[n]!==r.bytes[n])return!1;return!0};var so=/^[A-Za-z0-9_-]{1,80}$/;var io=["left","right","top","bottom"];var ao=(e,r=0,n={remaining:16e3})=>{if(--n.remaining<0||r>=32)return!1;if(e===null)return!0;let d=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let l of d)if(!ao(l,r+1,n))return!1;return!0},Qe=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(r=>/^(0|[1-9]\d*)$/.test(r)&&Number(r)<e.length)&&e.every(Qe);if(Object(e)===e){let r=Object.getPrototypeOf(e);return(r===null||r===Object.prototype)&&Object.values(e).every(Qe)}return String(e)===e||Number.isFinite(e)},Ze=e=>{try{return String(e.id)!==e.id||!so.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!io.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!ao(e.data)||!Qe(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var tt=2e3;var lo=["file","directory","other","missing"],ot=e=>!!(e&&"sessionId"in e),rt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var po=/^[0-9a-f]{7,64}$/i,nt=e=>po.test(e),ge=500,ke=32e3,uo=16e3,_o=128,Eo=200,To=2e3,So=16e3,fo=80,Ao=200,Oo=16e3;var Ro=2e3;var st=2e4,be=1024,Ue=2e6;var Ce=64e3,Me=8e3,it=4e3;var at=96e4,nr=60*6e4;var ho=999,mo=1e4,_e=500,xo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Io=["stopped","starting","ready","failed"],sr=new Set(xo),go=e=>sr.has(e),ko=e=>e&&go(e)?e:"HOST_REJECTED",te=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(te):Object(e)===e?Object.values(e).every(te):!1,bo=e=>te(e)&&JSON.stringify(e).length<=Oo,co=e=>e?.trim().slice(0,Ao)??"",oe=e=>{let r=e.id.trim().slice(0,_o),n=e.title.trim().slice(0,Eo),d=e.url.trim().slice(0,To),l=e.text?.trim().slice(0,So),S=e.author?.trim().slice(0,fo),m=e.kind==="pull"?"pull":"issue",k={providerId:e.providerId.trim(),id:r,title:n||r,url:d,kind:m};if(l&&(k.text=l),S&&(k.author=S),m==="pull"){let N=co(e.branches?.head),$=co(e.branches?.base);N&&$&&(k.branches={head:N,base:$})}return bo(e.data)&&(k.data=e.data),k},ct=e=>{let r=oe(e);return e.projectId&&(r.projectId=e.projectId),e.navigation&&(r.navigation=e.navigation),e.worktree&&(r.worktree=e.worktree),r},dt=e=>{let r={text:e.text.trim().slice(0,uo)};return e.send&&(r.send=!0),r},lt=e=>e===null||!Number.isFinite(e)?null:Math.min(ho,Math.max(0,Math.round(e))),pt=e=>Number.isFinite(e)?Math.min(mo,Math.max(0,Math.ceil(e))):0;var re=e=>e.length>0&&e.length<=be&&!e.includes("\0")&&!e.includes("\\");var ye=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Ro?!1:!e.split("/").some(n=>n==="."||n===".."),ir=new Set(Io),ut=e=>!!(e&&"status"in e&&ir.has(String(e.status))&&!("body"in e)),Ne=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),_t=e=>!!(e&&"content"in e&&String(e.content)===e.content),Et=e=>!!(e&&"written"in e&&e.written===!0),Tt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),ar=new Set(lo),St=e=>!!(e&&"kind"in e&&"size"in e&&ar.has(String(e.kind))&&Number.isFinite(e.size)),ft=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),cr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),dr=e=>Object(e)===e?e:null,et=e=>String(e)===e&&e.length>0,lr=e=>{if(!et(e.id))return null;if(e.ok===!0){let r={channel:E,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(r.payload=e.payload),r}return e.ok===!1&&et(e.error)?{channel:E,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:ko(et(e.code)?e.code:void 0)}:null},At=e=>{let r=dr(e);return!r||r.channel!==E||r.v!==1?null:r.type==="result"?lr(r):!cr.has(String(r.type))||Object(r.payload)!==r.payload?null:r};var Uo=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,pr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",c=class extends Error{code;constructor(r,n){super(n),this.name="HostRequestError",this.code=r}},Co=()=>Promise.reject(new c("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ve=()=>Promise.reject(new c("BAD_PATH",`File path must be 1 to ${be} characters without NUL or backslash.`)),we=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new c("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},_=e=>(e.value+=1,`oc-${e.value}`),xt=(e={})=>{let r=e.target??("window"in globalThis?window:null);if(!r)throw new c("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let n=e.acceptSource??(t=>t===r.parent),d=e.requestTimeoutMs??st,l=new Set,S=new Set,m=new Set,k=new Set,N=new Set,$=new Set,ie=new Set,Te=new Set,Se=new Set,fe=new Set,Ae=new Set,J=new Set,Ve=[],ae=null,ce=null,Oe=new Set,Re=new Set,de=null,le=null,Fe=!1,Y=new Map,Q=new Map,Z=new Map,H=!1,u={value:0},p=null,V=null,pe=!1,ue=!1,Gt=null,L=null,Ht=t=>t?{sessionId:t.id,phase:t.busy?"started":"completed"}:null,v=t=>{r.parent.postMessage(t,"*")},Xt=()=>{H||r.parent===r||J.size===0||p?.features?.lateGenerateResults!==!0||v({channel:E,v:1,type:"generate-late-listen"})},O=(t,o)=>{for(let a of t)try{a(o)}catch(i){console.error(i)}},$t=t=>{if(!(t instanceof MessageEvent)||!n(t.source))return;let o=At(t.data);if(!o)return;if(o.type==="workspace"){let i=Q.get(o.payload.subscriptionId);i&&O([i],o.payload.snapshot);return}if(o.type==="shells"){let i=Z.get(o.payload.subscriptionId);i&&O([i],o.payload.snapshot);return}if(o.type==="microphone-audio"){L?.queue.push(o.payload.samples);return}if(o.type==="microphone-ended"){let i=L;if(!i)return;L=null,i.release(),O(i.endedListeners,o.payload.reason);return}if(o.type==="ready"){p=o.payload,V=Ht(o.payload.session),O(l,o.payload),O(S,o.payload.directory),O(m,o.payload.session),V&&O(k,V),O(N,o.payload.connection),O($,o.payload.settings),O(ie,o.payload.item),o.payload.block&&O(Te,o.payload.block),Xt();return}if(o.type==="service-event"){O(Se,o.payload);return}if(o.type==="generate-late"){J.size===0?Ve.push(o.payload):O(J,o.payload);return}if(o.type==="directory"){p&&(p={...p,directory:o.payload.directory}),O(S,o.payload.directory);return}if(o.type==="session"){p&&(p={...p,session:o.payload.session}),o.payload.session?V?.sessionId!==o.payload.session.id&&(V=Ht(o.payload.session)):V=null,O(m,o.payload.session);return}if(o.type==="session-lifecycle"){V=o.payload,O(k,o.payload);return}if(o.type==="connection"){p&&(p={...p,connection:o.payload.connection}),O(N,o.payload.connection);return}if(o.type==="settings"){p&&(p={...p,settings:o.payload.settings}),O($,o.payload.settings);return}if(o.type==="item"){p&&(p={...p,item:o.payload.item}),O(ie,o.payload.item);return}if(o.type==="status-control-event"){O(fe,o.payload);return}if(o.type==="popover-closed"){O(Ae,o.payload);return}if(o.type==="action"){let i=A=>{H||v({channel:E,v:1,type:"action-result",id:o.id,payload:A})},f=ce;if(!f){i({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>f(o.payload)).then(()=>i({ok:!0}),A=>{let R=(A instanceof Error?A.message:String(A)).trim();i({ok:!1,error:(R||"Action failed.").slice(0,_e)})});return}if(o.type==="file-open"){let i=o.payload;if(le&&no(le,i))return;le=i,O(Oe,o.payload);return}if(o.type==="file-saved"){O(Re,o.payload.version);return}if(o.type==="file-snapshot"){let i=R=>{H||v({channel:E,v:1,type:"file-snapshot-result",id:o.id,payload:R})},f=R=>i({error:(R.trim()||"Could not read the edited file.").slice(0,_e)}),A=de;if(!A){f("This extension does not edit files.");return}Promise.resolve().then(()=>A(o.payload.purpose)).then(R=>{if(Ye(R)>2e7){f(`The file is over ${2e7} ${"bytes"in R?"bytes":"characters"}.`);return}if(R.version.length>256){f(`The snapshot version is over ${256} characters.`);return}i({snapshot:"bytes"in R?{bytes:R.bytes,version:R.version}:{content:R.content,version:R.version}})},R=>f(R instanceof Error?R.message:String(R)));return}if(o.type==="resolve"){let i=A=>{v({channel:E,v:1,type:"resolve-result",id:o.id,payload:A})},f=ae;if(!f){i({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>f(o.payload)).then(A=>i({item:A?oe(A):null}),A=>{let R=(A instanceof Error?A.message:String(A)).trim();i({error:(R||"Command failed.").slice(0,_e)})});return}let a=Y.get(o.id);if(a){if(clearTimeout(a.timer),Y.delete(o.id),o.ok){a.resolve(o.payload);return}a.reject(new c(o.code,o.error))}};r.addEventListener("message",$t),v({channel:E,v:1,type:"hello"});let y=(t,o=d)=>H||r.parent===r?Promise.reject(new c("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((a,i)=>{let f=setTimeout(()=>{Y.delete(t.id),i(new c("HOST_TIMEOUT","Host did not answer in time."))},o);Y.set(t.id,{resolve:a,reject:i,timer:f}),v(t)}),b=t=>y(t).then(()=>{}),x={channel:E,v:1},Be=t=>{!H&&r.parent!==r&&v(t)},Vt=()=>Be({...x,type:"file-save"}),Ke=()=>{!H&&r.parent!==r&&v({...x,type:"microphone-close",id:_(u)})},Zo=async()=>{if(L)throw new c("HOST_REJECTED","The microphone is already open in this frame.");if(p?.features?.microphone!==!0)throw new c("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let t=globalThis.AudioContext;if(typeof t!="function")throw new c("UNSUPPORTED","This frame has no Web Audio.");let o=new t;if(o.sampleRate<8e3||o.sampleRate>192e3)throw o.close().catch(()=>{}),new c("UNSUPPORTED",`Audio at ${o.sampleRate} Hz is not supported.`);let a=o.state==="suspended"?o.resume().catch(()=>{}):void 0,i=Jt(Math.round(o.sampleRate/4)),f=o.createScriptProcessor(1024,1,1);f.onaudioprocess=D=>i.pull(D.outputBuffer.getChannelData(0));let A=o.createMediaStreamDestination();f.connect(A);let R=new Set,ee={queue:i,endedListeners:R,release:()=>{f.onaudioprocess=null,f.disconnect(),i.clear();for(let D of A.stream.getTracks())D.stop();o.close().catch(()=>{})}};L=ee;try{let D=await y({...x,type:"microphone-open",id:_(u),payload:{sampleRate:o.sampleRate}},12e4);if(!D||!("opened"in D)||D.opened!==!0)throw new c("HOST_REJECTED","Host did not open the microphone.");if(await a,L!==ee)throw new c("DISCONNECTED","The microphone closed while it was opening.")}catch(D){throw L===ee&&(L=null),ee.release(),Ke(),D}return{stream:A.stream,close:()=>{L===ee&&(L=null,ee.release(),Ke())},onEnded:D=>(R.add(D),()=>{R.delete(D)})}},Ft=t=>{!Uo(t)||!pr(t)||(t.preventDefault(),Vt())},Bt=t=>{!Uo(t)||t.key!=="Escape"||p?.surface!=="popover"||!p.popover||(t.preventDefault(),zt(p.popover.id,"escape").catch(()=>{}))},he=()=>{let t=p?.surface==="popover"?p.popover:void 0;if(!t)return;let o=pe||ue;Gt!==o&&(Gt=o,qt(t.id,o).catch(()=>{}))},me=()=>{p?.surface!=="popover"||pe||(pe=!0,he())},Kt=t=>{p?.surface!=="popover"||t.relatedTarget!==null||!pe||(pe=!1,he())},Wt=()=>{p?.surface!=="popover"||ue||(ue=!0,he())},jt=()=>{p?.surface!=="popover"||!ue||(ue=!1,he())},X=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new c("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},We=async t=>{t.kind!=="projects"&&X(t.projectId);let o=await y({...x,type:"workspace-read",id:_(u),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new c("HOST_REJECTED","Host did not return workspace data.");return o},je=async(t,o)=>{t.kind!=="projects"&&X(t.projectId);let a=_(u);Q.set(a,o);try{await b({...x,type:"workspace-subscribe",id:_(u),payload:{subscriptionId:a,query:t}})}catch(i){throw Q.delete(a),H||v({...x,type:"workspace-unsubscribe",id:_(u),payload:{subscriptionId:a}}),i}return()=>{!Q.delete(a)||H||v({...x,type:"workspace-unsubscribe",id:_(u),payload:{subscriptionId:a}})}},er=async(t,o)=>{t.kind==="session"&&X(t.sessionId),t.kind==="project"&&X(t.projectId);let a=_(u);Z.set(a,o);try{await b({...x,type:"shells-subscribe",id:_(u),payload:{subscriptionId:a,scope:t}})}catch(i){throw Z.delete(a),H||v({...x,type:"shells-unsubscribe",id:_(u),payload:{subscriptionId:a}}),i}return()=>{!Z.delete(a)||H||v({...x,type:"shells-unsubscribe",id:_(u),payload:{subscriptionId:a}})}},xe=async t=>{if("key"in t&&(t.key.length===0||t.key.length>128))throw new c("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!te(t.value))throw new c("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>65536)throw new c("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&p?.features?.deviceStorage!==!0)throw new c("UNSUPPORTED","This host does not support device storage.");let o=await y({...x,type:"storage",id:_(u),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new c("HOST_REJECTED","Host did not return storage data.");return o},zt=(t,o)=>p?.features?.popovers!==!0&&!(p?.surface==="popover"&&p.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):b({...x,type:"popover-close",id:_(u),payload:o?{id:t,reason:o}:{id:t}}),qt=(t,o)=>p?.features?.popovers!==!0&&!(p?.surface==="popover"&&p.popover?.id===t)?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):b({...x,type:"popover-anchor",id:_(u),payload:{id:t,active:o}});return r.addEventListener("keydown",Bt,!0),r.addEventListener("pointerover",me),r.addEventListener("pointermove",me),r.addEventListener("pointerout",Kt),r.addEventListener("focus",Wt),r.addEventListener("blur",jt),{onAction:t=>(ce=t,()=>{ce===t&&(ce=null)}),listProjects:async()=>{let t=await We({kind:"projects"});if(t.kind!=="projects")throw new c("HOST_REJECTED","Expected projects.");return t},listWorktrees:async t=>{let o=await We({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new c("HOST_REJECTED","Expected worktrees.");return o},listSessions:async t=>{let o=await We({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new c("HOST_REJECTED","Expected sessions.");return o},onProjects:t=>je({kind:"projects"},o=>{o.kind==="projects"&&t(o)}),onWorktrees:(t,o)=>je({kind:"worktrees",projectId:t},a=>{a.kind==="worktrees"&&o(a)}),onSessions:(t,o)=>je({kind:"sessions",projectId:t},a=>{a.kind==="sessions"&&o(a)}),onRunningShells:(t,o)=>er(t,o),readShellOutput:async(t,o)=>{X(t,128);let a=o?.cursor;if(a!==void 0&&(!Number.isInteger(a)||a<0))throw new c("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let i=o?.tailBytes;if(i!==void 0&&(!Number.isInteger(i)||i<1||i>65536))throw new c("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let A=await y({...x,type:"shell-output",id:_(u),payload:{shellId:t,cursor:a,tailBytes:i}});if(!A||typeof A.output!="string"||!Number.isFinite(A.cursor))throw new c("HOST_REJECTED","Host did not return shell output.");return A},stopShell:async t=>{if(X(t,128),(await y({...x,type:"shell-stop",id:_(u),payload:{shellId:t}}))?.stopped!==!0)throw new c("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async t=>{X(t),await b({...x,type:"open-session",id:_(u),payload:{sessionId:t}})},storage:{get:async(t,o)=>{let a=we(o),i={op:"get",key:t};a&&(i.scope=a);let f=await xe(i);return f.op==="get"&&f.found?f.value:void 0},set:async(t,o,a)=>{let i=we(a),f={op:"set",key:t,value:o};i&&(f.scope=i),await xe(f)},delete:async(t,o)=>{let a=we(o),i={op:"delete",key:t};a&&(i.scope=a),await xe(i)},keys:async t=>{let o=we(t),a={op:"keys"};o&&(a.scope=o);let i=await xe(a);if(i.op!=="keys")throw new c("HOST_REJECTED","Expected storage keys.");return i.keys}},onReady:t=>(l.add(t),p&&t(p),()=>{l.delete(t)}),onDirectory:t=>(S.add(t),p&&t(p.directory),()=>{S.delete(t)}),onSession:t=>(m.add(t),p&&t(p.session),()=>{m.delete(t)}),onSessionLifecycle:t=>(k.add(t),V&&t(V),()=>{k.delete(t)}),onConnection:t=>(N.add(t),p&&t(p.connection),()=>{N.delete(t)}),onSettings:t=>($.add(t),p&&t(p.settings),()=>{$.delete(t)}),onItem:t=>(ie.add(t),p&&t(p.item),()=>{ie.delete(t)}),onBlock:t=>(Te.add(t),p?.block&&t(p.block),()=>{Te.delete(t)}),onServiceEvent:t=>(Se.add(t),()=>{Se.delete(t)}),onStatusControl:t=>(fe.add(t),()=>{fe.delete(t)}),onPopoverClosed:t=>(Ae.add(t),()=>{Ae.delete(t)}),setStatusControls:t=>p?.features?.statusControls!==!0?Promise.reject(new c("UNSUPPORTED","This host does not support status controls.")):to(t)?b({...x,type:"status-controls",id:_(u),payload:{controls:t}}):Promise.reject(new c("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:t=>p?.features?.popovers!==!0?Promise.reject(new c("UNSUPPORTED","This host does not support popovers.")):Ze(t)?b({...x,type:"popover-open",id:_(u),payload:t}):Promise.reject(new c("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:zt,setPopoverAnchorActive:qt,onResolve:t=>(ae=t,()=>{ae===t&&(ae=null)}),toast:t=>{let o=t.message.trim();return!o||o.length>ge?Promise.reject(new c("HOST_REJECTED",`Toast message must contain 1 to ${ge} characters.`)):t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>ke)?Promise.reject(new c("HOST_REJECTED",`Toast copy text must contain 1 to ${ke} characters.`)):b({channel:E,v:1,type:"toast",id:_(u),payload:{...t,message:o}})},openUrl:t=>b({channel:E,v:1,type:"open-url",id:_(u),payload:{url:t}}),openCommit:t=>nt(t)?b({channel:E,v:1,type:"open-commit",id:_(u),payload:{sha:t}}):Promise.reject(new c("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:t=>b({channel:E,v:1,type:"block-answer",id:_(u),payload:{text:t.trim().slice(0,tt)}}),openSurface:t=>b({channel:E,v:1,type:"open-surface",id:_(u),payload:{surfaceId:t}}),writeClipboard:t=>b({channel:E,v:1,type:"clipboard-write",id:_(u),payload:{text:t}}),compose:t=>b({channel:E,v:1,type:"compose",id:_(u),payload:t}),attach:t=>b({channel:E,v:1,type:"attach",id:_(u),payload:oe(t)}),startSession:async t=>{t.projectId!==void 0&&X(t.projectId);let o=t.worktree;o&&o!==!0&&(o.kind==="existing"?X(o.directory):(o.name!==void 0&&X(o.name,200),o.baseBranch!==void 0&&X(o.baseBranch,200)));let a=await y({channel:E,v:1,type:"start-session",id:_(u),payload:ct(t)},e.requestTimeoutMs??18e4);if(!ot(a))throw new c("HOST_REJECTED","Host did not return a session.");return a},prompt:t=>y({channel:E,v:1,type:"prompt",id:_(u),payload:dt(t)}).then(o=>{if(!rt(o))throw new c("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:t=>b({channel:E,v:1,type:"session-link",id:_(u),payload:oe(t)}),close:()=>b({channel:E,v:1,type:"close",id:_(u)}),oauthStart:()=>b({channel:E,v:1,type:"oauth-start",id:_(u)}),oauthDisconnect:()=>b({channel:E,v:1,type:"oauth-disconnect",id:_(u)}),request:t=>(ye(t.path)?y({channel:E,v:1,type:"request",id:_(u),payload:t}):Co()).then(o=>{if(!Ne(o))throw new c("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:t=>(ye(t.path)?y({channel:E,v:1,type:"service-request",id:_(u),payload:t}):Co()).then(o=>{if(!Ne(o))throw new c("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>y({channel:E,v:1,type:"service-status",id:_(u)}).then(t=>{if(!ut(t))throw new c("HOST_REJECTED","Host did not return service status.");return t}),readFile:t=>(re(t)?y({channel:E,v:1,type:"file-read",id:_(u),payload:{path:t}}):ve()).then(o=>{if(!_t(o))throw new c("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>re(t)?o.length>Ue?Promise.reject(new c("FILE_TOO_LARGE",`Content is over ${Ue} characters.`)):y({channel:E,v:1,type:"file-write",id:_(u),payload:{path:t,content:o}}).then(a=>{if(!Et(a))throw new c("HOST_REJECTED","Host did not confirm the write.");return a}):ve(),listDir:t=>(re(t)?y({channel:E,v:1,type:"file-list",id:_(u),payload:{path:t}}):ve()).then(o=>{if(!Tt(o))throw new c("HOST_REJECTED","Host did not return directory entries.");return o}),stat:t=>(re(t)?y({channel:E,v:1,type:"file-stat",id:_(u),payload:{path:t}}):ve()).then(o=>{if(!St(o))throw new c("HOST_REJECTED","Host did not return file status.");return o}),generate:t=>{let o=t.prompt.trim(),a=t.system?.trim();if(o.length===0||o.length>Ce)return Promise.reject(new c("HOST_REJECTED",`Prompt must be 1 to ${Ce} characters.`));if(a!==void 0&&(a.length===0||a.length>Me))return Promise.reject(new c("HOST_REJECTED",`System prompt must be 1 to ${Me} characters.`));let i=t.maxOutputTokens===void 0?void 0:Math.min(it,Math.max(1,Math.floor(t.maxOutputTokens)));if(i!==void 0&&!Number.isFinite(i))return Promise.reject(new c("HOST_REJECTED","maxOutputTokens must be a number."));let f={prompt:o};return a!==void 0&&(f.system=a),i!==void 0&&(f.maxOutputTokens=i),y({channel:E,v:1,type:"generate",id:_(u),payload:f},e.requestTimeoutMs??at).then(A=>{if(!ft(A))throw new c("HOST_REJECTED","Host did not return generated text.");return A})},onLateGenerateResult:t=>{J.add(t);for(let o of Ve.splice(0))O([t],o);return Xt(),()=>{J.delete(t)}},openMicrophone:Zo,setBadge:t=>b({channel:E,v:1,type:"badge",id:_(u),payload:{count:lt(t)}}),setHeight:t=>b({channel:E,v:1,type:"resize",id:_(u),payload:{height:pt(t)}}),onFileOpen:t=>(Oe.add(t),Fe||(Fe=!0,r.addEventListener("keydown",Ft,!0)),le&&t(le),()=>{Oe.delete(t)}),onFileSnapshot:t=>(de=t,()=>{de===t&&(de=null)}),onFileSaved:t=>(Re.add(t),()=>{Re.delete(t)}),reportFileChange:t=>Be({...x,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:Vt,reportFileUnsupported:()=>Be({...x,type:"file-unsupported"}),dispose:()=>{for(let t of Q.keys())v({...x,type:"workspace-unsubscribe",id:_(u),payload:{subscriptionId:t}});Q.clear();for(let t of Z.keys())v({...x,type:"shells-unsubscribe",id:_(u),payload:{subscriptionId:t}});Z.clear(),L&&(Ke(),L.release(),L=null),H=!0,ae=null,ce=null,de=null,Oe.clear(),Re.clear(),Fe&&r.removeEventListener("keydown",Ft,!0),r.removeEventListener("message",$t),r.removeEventListener("keydown",Bt,!0),r.removeEventListener("pointerover",me),r.removeEventListener("pointermove",me),r.removeEventListener("pointerout",Kt),r.removeEventListener("focus",Wt),r.removeEventListener("blur",jt);for(let t of Y.values())clearTimeout(t.timer),t.reject(new c("HOST_UNAVAILABLE","Host client was disposed."));Y.clear(),l.clear(),S.clear(),m.clear(),k.clear(),N.clear(),$.clear(),ie.clear(),Te.clear(),Se.clear(),fe.clear(),Ae.clear(),J.clear(),Ve.length=0}}};var Lo=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var _n=new Set(Lo);var ur=10*6e4;var _r=10*6e4;var Er=10*6e4;var Tr=10*6e4;var Po=["none","agent","user"];var Tn=new Set(Po);var Sr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],fr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Do=(e,r)=>{r.style.colorScheme=e.mode;for(let[n,d]of Sr)r.style.setProperty(n,e.tokens[d]);for(let[n,d,l]of fr){let S=e.tokens[l]??"";r.style.setProperty(n,S),r.style.setProperty(d,S)}r.style.setProperty("font-family",e.tokens.font),r.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),r.style.setProperty("line-height","1.45"),r.style.setProperty("color",e.tokens.foreground)},It=(e,r)=>{Do(e.theme,r),r.dataset&&(r.dataset.ocSurface=e.surface,r.dataset.ocTheme=e.theme.mode)};var Ar={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},h=(e,r)=>`var(--${e}, var(--oc-${Ar[e]}, ${r}))`,B=h("surface-background","transparent"),Pe=h("surface-elevated","transparent"),ne=h("surface-elevated-foreground","inherit"),P=h("surface-foreground","inherit"),I=h("surface-muted-foreground","gray"),Or=h("surface-muted","transparent"),W=h("interactive-border","currentColor"),w=h("interactive-hover","transparent"),j=h("interactive-active","transparent"),gt=h("interactive-selection","transparent"),kt=h("interactive-selection-foreground","inherit"),F=h("primary","currentColor"),bt=h("primary-text","inherit"),Ut=h("error-text","inherit"),Rr=h("font-sans","inherit"),Ct=h("font-mono","monospace"),$o=h("radius","9px"),Mt=`calc(${$o} - 2px)`,Go=`calc(${$o} - 4px)`,g=(e,r,n="transparent")=>`color-mix(in srgb, ${e} ${r}%, ${n})`,Ho=`background-image: linear-gradient(${w}, ${w});`,yt=(e,r="0.5px")=>`box-shadow: inset 0 0 0 ${r} ${e}, var(--oc-sdk-field-lift);`,Nt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Xo="box-shadow: var(--oc-sdk-lit);",vt=`inset 0 0.5px 0 0 ${g(P,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,hr=`
:root {
  --oc-sdk-edge: ${g(P,16)};
  --oc-sdk-field-bg: ${Pe};
  --oc-sdk-raised-bg: ${B};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${g(P,14)};
  --oc-sdk-field-bg: ${g(B,50,Pe)};
  --oc-sdk-raised-bg: ${Pe};
  --oc-sdk-field-lift: ${vt};
  --oc-sdk-raised-lift: ${vt};
  --oc-sdk-lit: ${vt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Le=e=>{let r=h(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${r}; --oc-sdk-tone-text: ${h(`${e}-text`,"inherit")}; }`},s=e=>`calc(${e}rem / 14)`,mr=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: ${s(8)}; height: ${s(32)}; padding: 0 ${s(12)}; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: ${s(6)}; height: ${s(28)}; padding: 0 ${s(10)}; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: ${s(4)}; height: ${s(24)}; padding: 0 ${s(8)}; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: ${s(14)}; height: ${s(14)}; }

.oc-sdk-field { display: flex; flex-direction: column; gap: ${s(4)}; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: ${s(32)}; padding: 0 ${s(10)}; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: ${s(8)} ${s(10)}; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: ${s(34)}; padding-right: ${s(34)}; }
.oc-sdk-search-icon { position: absolute; left: ${s(11)}; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: ${s(6)}; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: ${s(24)}; height: ${s(24)}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: ${s(4)}; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: ${s(6)}; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: ${s(28)}; padding: 0 ${s(10)}; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: ${s(2)}; min-width: ${s(160)}; max-width: calc(100vw - ${s(16)}); max-height: min(${s(320)}, calc(100vh - ${s(16)})); overflow: auto; padding: ${s(4)}; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: ${s(2)} ${s(2)} ${s(4)}; }
.oc-sdk-popup-search .oc-sdk-input { height: ${s(28)}; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: ${s(8)}; width: 100%; padding: ${s(6)} ${s(8)}; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: ${s(14)}; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: ${s(8)}; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: ${s(8)}; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: ${s(14)}; height: ${s(14)}; margin-top: ${s(3)}; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: ${s(36)}; height: ${s(20)}; --oc-sdk-thumb-travel: ${s(16)}; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: ${s(2)}; left: ${s(2)}; width: ${s(16)}; height: ${s(16)}; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: ${s(2)}; padding: ${s(2)}; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: ${s(6)}; height: ${s(28)}; padding: 0 ${s(10)}; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: ${s(1)} ${s(6)}; font-size: ${s(11)}; font-weight: 500; line-height: ${s(16)}; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: ${s(8)}; width: 100%; padding: ${s(6)} ${s(8)}; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: ${s(64)}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: ${s(16)} ${s(8)}; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${s(4)}; padding: ${s(40)} ${s(16)}; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: ${s(12)}; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: ${s(8)}; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: ${s(16)}; height: ${s(16)}; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: ${s(12)}; height: ${s(12)}; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: ${s(12)}; padding: ${s(8)} ${s(12)}; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: ${s(2)}; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: ${s(8)}; width: 100%; margin: ${s(8)} 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: ${s(4)} 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: ${s(4)}; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: ${s(6)}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: ${s(2)}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: ${s(8)} 0; }

/* Under a finger the controls reach the app's touch sizes: rows and options 44px like its sheets, every other
   control at least 36px. Inputs keep 16px text, below which iOS zooms the page on focus. */
@media (pointer: coarse) {
  .oc-sdk-btn, .oc-sdk-input { height: ${s(40)}; }
  .oc-sdk-btn[data-size="sm"], .oc-sdk-btn[data-size="xs"], .oc-sdk-trigger, .oc-sdk-tab, .oc-sdk-popup-search .oc-sdk-input { height: ${s(36)}; }
  .oc-sdk-input, .oc-sdk-popup-search .oc-sdk-input { font-size: max(16px, 0.875rem); }
  .oc-sdk-search-clear { width: ${s(36)}; height: ${s(36)}; right: 0; }
  .oc-sdk-row, .oc-sdk-option { min-height: ${s(44)}; }
  .oc-sdk-check { min-height: ${s(36)}; padding: ${s(8)} 0; }
}
`,Vo=`${hr}
.oc-sdk { color: ${P}; font-family: ${Rr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Ho} }
.oc-sdk-mono { font-family: ${Ct}; }
.oc-sdk-muted { color: ${I}; }
${Le("success")}${Le("warning")}${Le("error")}${Le("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${F}; --oc-sdk-tone-text: ${bt}; }

.oc-sdk-btn { border-radius: ${Mt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Go}; }
.oc-sdk-btn[data-variant="default"] { color: ${bt}; background: ${g(F,10,B)}; border-color: ${g(F,12)}; ${Xo} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${g(F,16,B)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${g(F,22,B)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Or}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${w}, ${w}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ne}; ${Nt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${w}, ${w}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${j}, ${j}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${w}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${j}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${h("status-error","red")}; color: ${Ut}; background: ${g("var(--oc-sdk-tone)",7,B)}; border-color: ${g("var(--oc-sdk-tone)",12)}; ${Xo} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${g("var(--oc-sdk-tone)",9,B)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${g("var(--oc-sdk-tone)",11,B)}; box-shadow: none; }

.oc-sdk-field-note { color: ${I}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Ut}; }
.oc-sdk-input { border-radius: ${Mt}; background: var(--oc-sdk-field-bg); color: ${ne}; ${yt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${I}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${w}, ${w}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${yt(g(P,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${yt(h("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Ct}; }

.oc-sdk-search-icon { color: ${I}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${F}; }
.oc-sdk-search-clear { border-radius: ${Go}; color: ${I}; }
.oc-sdk-search-clear:hover { background: ${w}; color: ${P}; }

.oc-sdk-trigger { border-radius: ${Mt}; background: var(--oc-sdk-raised-bg); color: ${ne}; ${Nt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${w}, ${w}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${I}; }
.oc-sdk-trigger-chevron { color: ${I}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ne}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Pe}; background-clip: padding-box; color: ${ne}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${w}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${gt}; color: ${kt}; }
.oc-sdk-option-check { color: ${P}; }
.oc-sdk-option[data-destructive="true"] { color: ${Ut}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${g(h("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${I}; }
.oc-sdk-popup-empty { color: ${I}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${W}; border-radius: 4px; color: ${P}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${g(P,60,W)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${W}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${B}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${F}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Ho} }
.oc-sdk-check-desc { color: ${I}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${g(P,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${I}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${P}; }
.oc-sdk-tab[aria-selected="true"] { color: ${kt}; background: ${gt}; border-color: ${W}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ne}; background: var(--oc-sdk-raised-bg); ${Nt} }
.oc-sdk-tab-count { color: ${I}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${g(P,6)}; color: ${I}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${g("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${w}; }
.oc-sdk-row[aria-selected="true"] { background: ${gt}; color: ${kt}; }
.oc-sdk-row-lead { font-family: ${Ct}; color: ${I}; }
.oc-sdk-row-sub { color: ${I}; }
.oc-sdk-row-meta { color: ${I}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${I}; }

.oc-sdk-empty-body { color: ${I}; }

.oc-sdk-spinner { color: ${I}; }
.oc-sdk-spinner-ring { border-color: ${W}; border-top-color: ${F}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${g("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${I}; }

.oc-sdk-separator { color: ${I}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${g(W,40)}; }

.oc-sdk-progress-label { color: ${I}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${g(P,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${F}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${h("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${h("success-text","inherit")}; }

.oc-sdk-text a { color: ${bt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${g(W,60)}; }
`,U=`
${ze}
${mr}
${Vo}`;var Fo="oc-sdk-ui-style";var C=e=>{let r=document.getElementById(Fo);if(r instanceof HTMLStyleElement){r.textContent!==e&&(r.textContent=e);return}qe(document);let n=document.createElement("style");n.id=Fo,n.textContent=e,document.head.appendChild(n)},M=(e,r)=>{let n=document.createElement(e);return r&&(n.className=r),n},K=e=>{let r=M("button",e);return r.type="button",r},G=(e,r)=>{let n=r??"";e.textContent!==n&&(e.textContent=n)},z=(e,r,n)=>{n==null||n===""?e.removeAttribute(r):e.getAttribute(r)!==n&&e.setAttribute(r,n)};var xr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},se=(e,r)=>{C(U);let n=r,d=K("oc-sdk oc-sdk-btn"),l=xr(),S=document.createElement("span");d.append(S),e.append(d);let m=()=>{d.dataset.variant=n.variant??"default",d.dataset.size=n.size??"default",d.disabled=!!n.disabled||!!n.loading,d.dataset.loading=n.loading?"true":"false",d.setAttribute("aria-busy",n.loading?"true":"false"),n.loading&&l.parentNode!==d?d.prepend(l):!n.loading&&l.parentNode===d&&l.remove(),G(S,n.label)},k=()=>{n.disabled||n.loading||n.onClick()};return d.addEventListener("click",k),m(),{update:N=>{n={...n,...N},m()},dispose:()=>{d.removeEventListener("click",k),d.remove()}}};var wt=(e,r)=>{z(e,"data-tone",r&&r!=="neutral"?r:null)},Lt=(e,r)=>{C(U);let n=r,d=M("span","oc-sdk oc-sdk-badge");e.append(d);let l=()=>{G(d,n.label),wt(d,n.tone)};return l(),{update:S=>{n={...n,...S},l()},dispose:()=>{d.remove()}}};var br=["backlog","todo","in_progress","review","done"];var Bo=1,Ko=200,Wo=16e3;var Ur=512,Cr=/^t_[a-z0-9]{6,40}$/,Mr=e=>typeof e=="string"&&br.includes(e);var Ee=(e,r)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${r} must be a string`);let n=e.trim();if(!n)return null;if(n.length>Ur)throw new Error(`${r} is too long`);return n},yr=e=>{if(typeof e!="string")throw new Error("Title must be text");let r=e.trim();if(!r)throw new Error("A task needs a title");if(r.length>Ko)throw new Error(`Title is limited to ${Ko} characters`);return r},Nr=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>Wo)throw new Error(`Description is limited to ${Wo} characters`);return e};var vr=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let r=e,n=Ee(r.directory,"worktree.directory");if(!n)throw new Error("worktree.directory is required");return{directory:n,branch:Ee(r.branch,"worktree.branch")}},Pt=(e,r)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${r} must be a timestamp`);return e},wr=(e,r)=>e==null?null:Pt(e,r);var jo=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let r=e;if(r.schemaVersion!==Bo)throw new Error(`Unsupported task schema ${String(r.schemaVersion)}`);if(typeof r.id!="string"||!Cr.test(r.id))throw new Error("Task id is invalid");if(!Mr(r.status))throw new Error("Task status is invalid");if(typeof r.rank!="number"||!Number.isFinite(r.rank))throw new Error("Task rank is invalid");return{schemaVersion:Bo,id:r.id,title:yr(r.title),description:Nr(r.description),status:r.status,rank:r.rank,projectId:Ee(r.projectId,"projectId"),sourceBranch:Ee(r.sourceBranch,"sourceBranch"),worktree:vr(r.worktree),sessionId:Ee(r.sessionId,"sessionId"),createdAt:Pt(r.createdAt,"createdAt"),updatedAt:Pt(r.updatedAt,"updatedAt"),needsAttentionSince:wr(r.needsAttentionSince,"needsAttentionSince")}};var qo="task:",zo=16,Lr=e=>`${qo}${e}`,Jo=async e=>{let r=(await e.storage.keys()).filter(l=>l.startsWith(qo)),n=[],d=[];for(let l=0;l<r.length;l+=zo)await Promise.all(r.slice(l,l+zo).map(async S=>{try{let m=jo(await e.storage.get(S));if(Lr(m.id)!==S)throw new Error("Task id does not match its key");n.push(m)}catch{d.push(S)}}));return{tasks:n,failedKeys:d}};var Pr=`
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
.kb-mic-row{margin-top:6px;align-items:center;gap:10px}
.kb-mic-status{font-size:12px;color:var(--oc-muted)}
.kb-mic-row [hidden]{display:none}
[hidden]{display:none!important}
`,Yo=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=Pr,document.head.append(e)};var q=(e,r="",n="")=>{let d=document.createElement(e);return r&&(d.className=r),n&&(d.textContent=n),d};var $e=xt(),Dt=document.querySelector("#root");if(!Dt)throw new Error("Missing #root");var Qo=!1;$e.onReady(e=>{if(It(e,document.documentElement),Qo)return;Qo=!0,Yo(),Dt.replaceChildren();let r=q("div","kb-page"),n=q("p","","Loading\u2026"),d=q("div","kb-row between");d.append(q("h2","","Kanban"));let l=q("span");d.append(l),r.append(d,n),r.append(q("p","kb-muted","Open the full board from the Extension pages menu above the session list to view, edit, and link tasks.")),Dt.append(r);let S=Lt(l,{label:"0",tone:"neutral"});se(r,{label:"Refresh counts",variant:"ghost",onClick:()=>{m()}});let m=async()=>{let{tasks:k}=await Jo($e),N=k.filter($=>$.status!=="done").length;n.textContent=`${N} open task${N===1?"":"s"} of ${k.length} total.`,S.update({label:String(N)}),$e.setBadge(N||null).catch(()=>{})};m()});window.addEventListener("pagehide",()=>$e.dispose());})();
