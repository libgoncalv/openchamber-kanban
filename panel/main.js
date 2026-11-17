"use strict";(()=>{var R="openchamber.sdk";var ze="data-oc-scrolling",mt=`
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
:hover, [${ze}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${ze}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${ze}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${ze}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function ht(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?t:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let a=o.get(i);a!==void 0&&clearTimeout(a),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var gn=`(${ht.toString()})(document);`;var Po=e=>{let t=[],o=0,s=0;return{push:i=>{for(t.push(i),s+=i.length;s-o>e&&t.length>1;){let a=t.shift();s-=a?.length??0,o=0}},pull:i=>{let a=0;for(;a<i.length&&t.length>0;){let d=t[0],_=Math.min(i.length-a,d.length-o);i.set(d.subarray(o,o+_),a),a+=_,o+=_,o>=d.length&&(t.shift(),s-=d.length,o=0)}i.fill(0,a)},clear:()=>{t.length=0,o=0,s=0},get size(){return s-o}}};var $o=/^[a-z][a-z0-9-]{0,39}$/;var Do=e=>Object(e)===e&&!Array.isArray(e),gt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Go=e=>String(e)===e&&e.length>=1&&e.length<=60,Ho=e=>String(e)===e&&e.length>=1&&e.length<=80,Xo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Do(o)||!$o.test(o.id)||!Go(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!gt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!gt(o,["kind","id","label","value","options","disabled"])||!Ho(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let s=new Set;for(let i of o.options){if(!Do(i)||!gt(i,["value","label"])||!Ho(i.value)||!Go(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(o.value))return!1}return!0};var kn=1024*1024;var Vo=["{id}","{segment}","{segments+}"];var xs=new Set(Vo);var Bo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Rs=new Set(Bo);var bt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Fo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Ko=/^[A-Za-z0-9_-]{1,80}$/;var Wo=["left","right","top","bottom"];var jo=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!jo(i,t+1,o))return!1;return!0},kt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(kt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(kt)}return String(e)===e||Number.isFinite(e)},At=e=>{try{return String(e.id)!==e.id||!Ko.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Wo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!jo(e.data)||!kt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var Ot=2e3;var qo=["file","directory","other","missing"],Rt=e=>!!(e&&"sessionId"in e),yt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Yo=/^[0-9a-f]{7,64}$/i,vt=e=>Yo.test(e),qe=500,Ye=32e3,Jo=16e3,Qo=128,Zo=200,er=2e3,tr=16e3,or=80,rr=200,nr=16e3;var sr=2e3;var It=2e4,Je=1024,Qe=2e6;var Ze=64e3,et=8e3,wt=4e3;var Ct=96e4,An=60*6e4;var ir=999,ar=1e4,Ge=500,cr=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],dr=["stopped","starting","ready","failed"],xn=new Set(cr),lr=e=>xn.has(e),pr=e=>e&&lr(e)?e:"HOST_REJECTED",xe=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(xe):Object(e)===e?Object.values(e).every(xe):!1,ur=e=>xe(e)&&JSON.stringify(e).length<=nr,zo=e=>e?.trim().slice(0,rr)??"",Oe=e=>{let t=e.id.trim().slice(0,Qo),o=e.title.trim().slice(0,Zo),s=e.url.trim().slice(0,er),i=e.text?.trim().slice(0,tr),a=e.author?.trim().slice(0,or),d=e.kind==="pull"?"pull":"issue",_={providerId:e.providerId.trim(),id:t,title:o||t,url:s,kind:d};if(i&&(_.text=i),a&&(_.author=a),d==="pull"){let A=zo(e.branches?.head),v=zo(e.branches?.base);A&&v&&(_.branches={head:A,base:v})}return ur(e.data)&&(_.data=e.data),_},Mt=e=>{let t=Oe(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Ut=e=>{let t={text:e.text.trim().slice(0,Jo)};return e.send&&(t.send=!0),t},Nt=e=>e===null||!Number.isFinite(e)?null:Math.min(ir,Math.max(0,Math.round(e))),Lt=e=>Number.isFinite(e)?Math.min(ar,Math.max(0,Math.ceil(e))):0;var Re=e=>e.length>0&&e.length<=Je&&!e.includes("\0")&&!e.includes("\\");var tt=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>sr?!1:!e.split("/").some(o=>o==="."||o===".."),On=new Set(dr),Pt=e=>!!(e&&"status"in e&&On.has(String(e.status))&&!("body"in e)),ot=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Dt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Gt=e=>!!(e&&"written"in e&&e.written===!0),Ht=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Rn=new Set(qo),$t=e=>!!(e&&"kind"in e&&"size"in e&&Rn.has(String(e.kind))&&Number.isFinite(e.size)),Xt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),yn=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),vn=e=>Object(e)===e?e:null,xt=e=>String(e)===e&&e.length>0,In=e=>{if(!xt(e.id))return null;if(e.ok===!0){let t={channel:R,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&xt(e.error)?{channel:R,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:pr(xt(e.code)?e.code:void 0)}:null},Vt=e=>{let t=vn(e);return!t||t.channel!==R||t.v!==1?null:t.type==="result"?In(t):!yn.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var Er=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,wn=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},_r=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),rt=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${Je} characters without NUL or backslash.`)),nt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},k=e=>(e.value+=1,`oc-${e.value}`),jt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(r=>r===t.parent),s=e.requestTimeoutMs??It,i=new Set,a=new Set,d=new Set,_=new Set,A=new Set,v=new Set,M=new Set,B=new Set,Y=new Set,S=new Set,f=new Set,h=new Set,F=[],l=null,T=null,g=new Set,x=new Set,N=null,z=null,ae=!1,I=new Map,U=new Map,oe=new Map,Z=!1,b={value:0},m=null,ce=null,Pe=!1,De=!1,xo=null,ee=null,Oo=r=>r?{sessionId:r.id,phase:r.busy?"started":"completed"}:null,J=r=>{t.parent.postMessage(r,"*")},Ro=()=>{Z||t.parent===t||h.size===0||m?.features?.lateGenerateResults!==!0||J({channel:R,v:1,type:"generate-late-listen"})},L=(r,n)=>{for(let u of r)try{u(n)}catch(p){console.error(p)}},yo=r=>{if(!(r instanceof MessageEvent)||!o(r.source))return;let n=Vt(r.data);if(!n)return;if(n.type==="workspace"){let p=U.get(n.payload.subscriptionId);p&&L([p],n.payload.snapshot);return}if(n.type==="shells"){let p=oe.get(n.payload.subscriptionId);p&&L([p],n.payload.snapshot);return}if(n.type==="microphone-audio"){ee?.queue.push(n.payload.samples);return}if(n.type==="microphone-ended"){let p=ee;if(!p)return;ee=null,p.release(),L(p.endedListeners,n.payload.reason);return}if(n.type==="ready"){m=n.payload,ce=Oo(n.payload.session),L(i,n.payload),L(a,n.payload.directory),L(d,n.payload.session),ce&&L(_,ce),L(A,n.payload.connection),L(v,n.payload.settings),L(M,n.payload.item),n.payload.block&&L(B,n.payload.block),Ro();return}if(n.type==="service-event"){L(Y,n.payload);return}if(n.type==="generate-late"){h.size===0?F.push(n.payload):L(h,n.payload);return}if(n.type==="directory"){m&&(m={...m,directory:n.payload.directory}),L(a,n.payload.directory);return}if(n.type==="session"){m&&(m={...m,session:n.payload.session}),n.payload.session?ce?.sessionId!==n.payload.session.id&&(ce=Oo(n.payload.session)):ce=null,L(d,n.payload.session);return}if(n.type==="session-lifecycle"){ce=n.payload,L(_,n.payload);return}if(n.type==="connection"){m&&(m={...m,connection:n.payload.connection}),L(A,n.payload.connection);return}if(n.type==="settings"){m&&(m={...m,settings:n.payload.settings}),L(v,n.payload.settings);return}if(n.type==="item"){m&&(m={...m,item:n.payload.item}),L(M,n.payload.item);return}if(n.type==="status-control-event"){L(S,n.payload);return}if(n.type==="popover-closed"){L(f,n.payload);return}if(n.type==="action"){let p=C=>{Z||J({channel:R,v:1,type:"action-result",id:n.id,payload:C})},w=T;if(!w){p({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>w(n.payload)).then(()=>p({ok:!0}),C=>{let P=(C instanceof Error?C.message:String(C)).trim();p({ok:!1,error:(P||"Action failed.").slice(0,Ge)})});return}if(n.type==="file-open"){let p=n.payload;if(z&&Fo(z,p))return;z=p,L(g,n.payload);return}if(n.type==="file-saved"){L(x,n.payload.version);return}if(n.type==="file-snapshot"){let p=P=>{Z||J({channel:R,v:1,type:"file-snapshot-result",id:n.id,payload:P})},w=P=>p({error:(P.trim()||"Could not read the edited file.").slice(0,Ge)}),C=N;if(!C){w("This extension does not edit files.");return}Promise.resolve().then(()=>C(n.payload.purpose)).then(P=>{if(bt(P)>2e7){w(`The file is over ${2e7} ${"bytes"in P?"bytes":"characters"}.`);return}if(P.version.length>256){w(`The snapshot version is over ${256} characters.`);return}p({snapshot:"bytes"in P?{bytes:P.bytes,version:P.version}:{content:P.content,version:P.version}})},P=>w(P instanceof Error?P.message:String(P)));return}if(n.type==="resolve"){let p=C=>{J({channel:R,v:1,type:"resolve-result",id:n.id,payload:C})},w=l;if(!w){p({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>w(n.payload)).then(C=>p({item:C?Oe(C):null}),C=>{let P=(C instanceof Error?C.message:String(C)).trim();p({error:(P||"Command failed.").slice(0,Ge)})});return}let u=I.get(n.id);if(u){if(clearTimeout(u.timer),I.delete(n.id),n.ok){u.resolve(n.payload);return}u.reject(new E(n.code,n.error))}};t.addEventListener("message",yo),J({channel:R,v:1,type:"hello"});let q=(r,n=s)=>Z||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((u,p)=>{let w=setTimeout(()=>{I.delete(r.id),p(new E("HOST_TIMEOUT","Host did not answer in time."))},n);I.set(r.id,{resolve:u,reject:p,timer:w}),J(r)}),V=r=>q(r).then(()=>{}),H={channel:R,v:1},_t=r=>{!Z&&t.parent!==t&&J(r)},vo=()=>_t({...H,type:"file-save"}),ft=()=>{!Z&&t.parent!==t&&J({...H,type:"microphone-close",id:k(b)})},mn=async()=>{if(ee)throw new E("HOST_REJECTED","The microphone is already open in this frame.");if(m?.features?.microphone!==!0)throw new E("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let r=globalThis.AudioContext;if(typeof r!="function")throw new E("UNSUPPORTED","This frame has no Web Audio.");let n=new r;if(n.sampleRate<8e3||n.sampleRate>192e3)throw n.close().catch(()=>{}),new E("UNSUPPORTED",`Audio at ${n.sampleRate} Hz is not supported.`);let u=n.state==="suspended"?n.resume().catch(()=>{}):void 0,p=Po(Math.round(n.sampleRate/4)),w=n.createScriptProcessor(1024,1,1);w.onaudioprocess=re=>p.pull(re.outputBuffer.getChannelData(0));let C=n.createMediaStreamDestination();w.connect(C);let P=new Set,Ae={queue:p,endedListeners:P,release:()=>{w.onaudioprocess=null,w.disconnect(),p.clear();for(let re of C.stream.getTracks())re.stop();n.close().catch(()=>{})}};ee=Ae;try{let re=await q({...H,type:"microphone-open",id:k(b),payload:{sampleRate:n.sampleRate}},12e4);if(!re||!("opened"in re)||re.opened!==!0)throw new E("HOST_REJECTED","Host did not open the microphone.");if(await u,ee!==Ae)throw new E("DISCONNECTED","The microphone closed while it was opening.")}catch(re){throw ee===Ae&&(ee=null),Ae.release(),ft(),re}return{stream:C.stream,close:()=>{ee===Ae&&(ee=null,Ae.release(),ft())},onEnded:re=>(P.add(re),()=>{P.delete(re)})}},Io=r=>{!Er(r)||!wn(r)||(r.preventDefault(),vo())},wo=r=>{!Er(r)||r.key!=="Escape"||m?.surface!=="popover"||!m.popover||(r.preventDefault(),No(m.popover.id,"escape").catch(()=>{}))},Ke=()=>{let r=m?.surface==="popover"?m.popover:void 0;if(!r)return;let n=Pe||De;xo!==n&&(xo=n,Lo(r.id,n).catch(()=>{}))},We=()=>{m?.surface!=="popover"||Pe||(Pe=!0,Ke())},Co=r=>{m?.surface!=="popover"||r.relatedTarget!==null||!Pe||(Pe=!1,Ke())},Mo=()=>{m?.surface!=="popover"||De||(De=!0,Ke())},Uo=()=>{m?.surface!=="popover"||!De||(De=!1,Ke())},se=(r,n=1024)=>{if(!r.trim()||r.length>n)throw new E("HOST_REJECTED",`Identity must contain 1 to ${n} characters.`)},St=async r=>{r.kind!=="projects"&&se(r.projectId);let n=await q({...H,type:"workspace-read",id:k(b),payload:r});if(!n||!("kind"in n)||!("state"in n)||n.kind!==r.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return n},Tt=async(r,n)=>{r.kind!=="projects"&&se(r.projectId);let u=k(b);U.set(u,n);try{await V({...H,type:"workspace-subscribe",id:k(b),payload:{subscriptionId:u,query:r}})}catch(p){throw U.delete(u),Z||J({...H,type:"workspace-unsubscribe",id:k(b),payload:{subscriptionId:u}}),p}return()=>{!U.delete(u)||Z||J({...H,type:"workspace-unsubscribe",id:k(b),payload:{subscriptionId:u}})}},hn=async(r,n)=>{r.kind==="session"&&se(r.sessionId),r.kind==="project"&&se(r.projectId);let u=k(b);oe.set(u,n);try{await V({...H,type:"shells-subscribe",id:k(b),payload:{subscriptionId:u,scope:r}})}catch(p){throw oe.delete(u),Z||J({...H,type:"shells-unsubscribe",id:k(b),payload:{subscriptionId:u}}),p}return()=>{!oe.delete(u)||Z||J({...H,type:"shells-unsubscribe",id:k(b),payload:{subscriptionId:u}})}},je=async r=>{if("key"in r&&(r.key.length===0||r.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(r.op==="set"&&!xe(r.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(r.op==="set"&&new TextEncoder().encode(JSON.stringify(r.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(r.scope==="device"&&m?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let n=await q({...H,type:"storage",id:k(b),payload:r});if(!n||!("storage"in n)||n.op!==r.op)throw new E("HOST_REJECTED","Host did not return storage data.");return n},No=(r,n)=>m?.features?.popovers!==!0&&!(m?.surface==="popover"&&m.popover?.id===r)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):V({...H,type:"popover-close",id:k(b),payload:n?{id:r,reason:n}:{id:r}}),Lo=(r,n)=>m?.features?.popovers!==!0&&!(m?.surface==="popover"&&m.popover?.id===r)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):V({...H,type:"popover-anchor",id:k(b),payload:{id:r,active:n}});return t.addEventListener("keydown",wo,!0),t.addEventListener("pointerover",We),t.addEventListener("pointermove",We),t.addEventListener("pointerout",Co),t.addEventListener("focus",Mo),t.addEventListener("blur",Uo),{onAction:r=>(T=r,()=>{T===r&&(T=null)}),listProjects:async()=>{let r=await St({kind:"projects"});if(r.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return r},listWorktrees:async r=>{let n=await St({kind:"worktrees",projectId:r});if(n.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return n},listSessions:async r=>{let n=await St({kind:"sessions",projectId:r});if(n.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return n},onProjects:r=>Tt({kind:"projects"},n=>{n.kind==="projects"&&r(n)}),onWorktrees:(r,n)=>Tt({kind:"worktrees",projectId:r},u=>{u.kind==="worktrees"&&n(u)}),onSessions:(r,n)=>Tt({kind:"sessions",projectId:r},u=>{u.kind==="sessions"&&n(u)}),onRunningShells:(r,n)=>hn(r,n),readShellOutput:async(r,n)=>{se(r,128);let u=n?.cursor;if(u!==void 0&&(!Number.isInteger(u)||u<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let p=n?.tailBytes;if(p!==void 0&&(!Number.isInteger(p)||p<1||p>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let C=await q({...H,type:"shell-output",id:k(b),payload:{shellId:r,cursor:u,tailBytes:p}});if(!C||typeof C.output!="string"||!Number.isFinite(C.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return C},stopShell:async r=>{if(se(r,128),(await q({...H,type:"shell-stop",id:k(b),payload:{shellId:r}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async r=>{se(r),await V({...H,type:"open-session",id:k(b),payload:{sessionId:r}})},storage:{get:async(r,n)=>{let u=nt(n),p={op:"get",key:r};u&&(p.scope=u);let w=await je(p);return w.op==="get"&&w.found?w.value:void 0},set:async(r,n,u)=>{let p=nt(u),w={op:"set",key:r,value:n};p&&(w.scope=p),await je(w)},delete:async(r,n)=>{let u=nt(n),p={op:"delete",key:r};u&&(p.scope=u),await je(p)},keys:async r=>{let n=nt(r),u={op:"keys"};n&&(u.scope=n);let p=await je(u);if(p.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return p.keys}},onReady:r=>(i.add(r),m&&r(m),()=>{i.delete(r)}),onDirectory:r=>(a.add(r),m&&r(m.directory),()=>{a.delete(r)}),onSession:r=>(d.add(r),m&&r(m.session),()=>{d.delete(r)}),onSessionLifecycle:r=>(_.add(r),ce&&r(ce),()=>{_.delete(r)}),onConnection:r=>(A.add(r),m&&r(m.connection),()=>{A.delete(r)}),onSettings:r=>(v.add(r),m&&r(m.settings),()=>{v.delete(r)}),onItem:r=>(M.add(r),m&&r(m.item),()=>{M.delete(r)}),onBlock:r=>(B.add(r),m?.block&&r(m.block),()=>{B.delete(r)}),onServiceEvent:r=>(Y.add(r),()=>{Y.delete(r)}),onStatusControl:r=>(S.add(r),()=>{S.delete(r)}),onPopoverClosed:r=>(f.add(r),()=>{f.delete(r)}),setStatusControls:r=>m?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):Xo(r)?V({...H,type:"status-controls",id:k(b),payload:{controls:r}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:r=>m?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):At(r)?V({...H,type:"popover-open",id:k(b),payload:r}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:No,setPopoverAnchorActive:Lo,onResolve:r=>(l=r,()=>{l===r&&(l=null)}),toast:r=>{let n=r.message.trim();return!n||n.length>qe?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${qe} characters.`)):r.copy&&r.copy!==!0&&(!r.copy.text.length||r.copy.text.length>Ye)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${Ye} characters.`)):V({channel:R,v:1,type:"toast",id:k(b),payload:{...r,message:n}})},openUrl:r=>V({channel:R,v:1,type:"open-url",id:k(b),payload:{url:r}}),openCommit:r=>vt(r)?V({channel:R,v:1,type:"open-commit",id:k(b),payload:{sha:r}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:r=>V({channel:R,v:1,type:"block-answer",id:k(b),payload:{text:r.trim().slice(0,Ot)}}),openSurface:r=>V({channel:R,v:1,type:"open-surface",id:k(b),payload:{surfaceId:r}}),writeClipboard:r=>V({channel:R,v:1,type:"clipboard-write",id:k(b),payload:{text:r}}),compose:r=>V({channel:R,v:1,type:"compose",id:k(b),payload:r}),attach:r=>V({channel:R,v:1,type:"attach",id:k(b),payload:Oe(r)}),startSession:async r=>{r.projectId!==void 0&&se(r.projectId);let n=r.worktree;n&&n!==!0&&(n.kind==="existing"?se(n.directory):(n.name!==void 0&&se(n.name,200),n.baseBranch!==void 0&&se(n.baseBranch,200)));let u=await q({channel:R,v:1,type:"start-session",id:k(b),payload:Mt(r)},e.requestTimeoutMs??18e4);if(!Rt(u))throw new E("HOST_REJECTED","Host did not return a session.");return u},prompt:r=>q({channel:R,v:1,type:"prompt",id:k(b),payload:Ut(r)}).then(n=>{if(!yt(n))throw new E("HOST_REJECTED","Host did not return a prompt result.");return n}),sessionLink:r=>V({channel:R,v:1,type:"session-link",id:k(b),payload:Oe(r)}),close:()=>V({channel:R,v:1,type:"close",id:k(b)}),oauthStart:()=>V({channel:R,v:1,type:"oauth-start",id:k(b)}),oauthDisconnect:()=>V({channel:R,v:1,type:"oauth-disconnect",id:k(b)}),request:r=>(tt(r.path)?q({channel:R,v:1,type:"request",id:k(b),payload:r}):_r()).then(n=>{if(!ot(n))throw new E("HOST_REJECTED","Host request result was empty.");return n}),serviceRequest:r=>(tt(r.path)?q({channel:R,v:1,type:"service-request",id:k(b),payload:r}):_r()).then(n=>{if(!ot(n))throw new E("HOST_REJECTED","Host service request result was empty.");return n}),serviceStatus:()=>q({channel:R,v:1,type:"service-status",id:k(b)}).then(r=>{if(!Pt(r))throw new E("HOST_REJECTED","Host did not return service status.");return r}),readFile:r=>(Re(r)?q({channel:R,v:1,type:"file-read",id:k(b),payload:{path:r}}):rt()).then(n=>{if(!Dt(n))throw new E("HOST_REJECTED","Host did not return file content.");return n}),writeFile:(r,n)=>Re(r)?n.length>Qe?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${Qe} characters.`)):q({channel:R,v:1,type:"file-write",id:k(b),payload:{path:r,content:n}}).then(u=>{if(!Gt(u))throw new E("HOST_REJECTED","Host did not confirm the write.");return u}):rt(),listDir:r=>(Re(r)?q({channel:R,v:1,type:"file-list",id:k(b),payload:{path:r}}):rt()).then(n=>{if(!Ht(n))throw new E("HOST_REJECTED","Host did not return directory entries.");return n}),stat:r=>(Re(r)?q({channel:R,v:1,type:"file-stat",id:k(b),payload:{path:r}}):rt()).then(n=>{if(!$t(n))throw new E("HOST_REJECTED","Host did not return file status.");return n}),generate:r=>{let n=r.prompt.trim(),u=r.system?.trim();if(n.length===0||n.length>Ze)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${Ze} characters.`));if(u!==void 0&&(u.length===0||u.length>et))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${et} characters.`));let p=r.maxOutputTokens===void 0?void 0:Math.min(wt,Math.max(1,Math.floor(r.maxOutputTokens)));if(p!==void 0&&!Number.isFinite(p))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let w={prompt:n};return u!==void 0&&(w.system=u),p!==void 0&&(w.maxOutputTokens=p),q({channel:R,v:1,type:"generate",id:k(b),payload:w},e.requestTimeoutMs??Ct).then(C=>{if(!Xt(C))throw new E("HOST_REJECTED","Host did not return generated text.");return C})},onLateGenerateResult:r=>{h.add(r);for(let n of F.splice(0))L([r],n);return Ro(),()=>{h.delete(r)}},openMicrophone:mn,setBadge:r=>V({channel:R,v:1,type:"badge",id:k(b),payload:{count:Nt(r)}}),setHeight:r=>V({channel:R,v:1,type:"resize",id:k(b),payload:{height:Lt(r)}}),onFileOpen:r=>(g.add(r),ae||(ae=!0,t.addEventListener("keydown",Io,!0)),z&&r(z),()=>{g.delete(r)}),onFileSnapshot:r=>(N=r,()=>{N===r&&(N=null)}),onFileSaved:r=>(x.add(r),()=>{x.delete(r)}),reportFileChange:r=>_t({...H,type:"file-change",payload:{dirty:r.dirty,edited:r.edited}}),requestFileSave:vo,reportFileUnsupported:()=>_t({...H,type:"file-unsupported"}),dispose:()=>{for(let r of U.keys())J({...H,type:"workspace-unsubscribe",id:k(b),payload:{subscriptionId:r}});U.clear();for(let r of oe.keys())J({...H,type:"shells-unsubscribe",id:k(b),payload:{subscriptionId:r}});oe.clear(),ee&&(ft(),ee.release(),ee=null),Z=!0,l=null,T=null,N=null,g.clear(),x.clear(),ae&&t.removeEventListener("keydown",Io,!0),t.removeEventListener("message",yo),t.removeEventListener("keydown",wo,!0),t.removeEventListener("pointerover",We),t.removeEventListener("pointermove",We),t.removeEventListener("pointerout",Co),t.removeEventListener("focus",Mo),t.removeEventListener("blur",Uo);for(let r of I.values())clearTimeout(r.timer),r.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));I.clear(),i.clear(),a.clear(),d.clear(),_.clear(),A.clear(),v.clear(),M.clear(),B.clear(),Y.clear(),S.clear(),f.clear(),h.clear(),F.length=0}}};var gr=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Bs=new Set(gr);var Cn=10*6e4;var Mn=10*6e4;var Un=10*6e4;var Nn=10*6e4;var br=["none","agent","user"];var Ks=new Set(br);var Ln=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Pn=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],kr=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,s]of Ln)t.style.setProperty(o,e.tokens[s]);for(let[o,s,i]of Pn){let a=e.tokens[i]??"";t.style.setProperty(o,a),t.style.setProperty(s,a)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},zt=(e,t)=>{kr(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Dn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},D=(e,t)=>`var(--${e}, var(--oc-${Dn[e]}, ${t}))`,le=D("surface-background","transparent"),it=D("surface-elevated","transparent"),ye=D("surface-elevated-foreground","inherit"),te=D("surface-foreground","inherit"),$=D("surface-muted-foreground","gray"),Gn=D("surface-muted","transparent"),he=D("interactive-border","currentColor"),Q=D("interactive-hover","transparent"),ge=D("interactive-active","transparent"),qt=D("interactive-selection","transparent"),Yt=D("interactive-selection-foreground","inherit"),de=D("primary","currentColor"),Jt=D("primary-text","inherit"),Qt=D("error-text","inherit"),Hn=D("font-sans","inherit"),Zt=D("font-mono","monospace"),Rr=D("radius","9px"),eo=`calc(${Rr} - 2px)`,Ar=`calc(${Rr} - 4px)`,X=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,xr=`background-image: linear-gradient(${Q}, ${Q});`,to=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,oo="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Or="box-shadow: var(--oc-sdk-lit);",ro=`inset 0 0.5px 0 0 ${X(te,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,$n=`
:root {
  --oc-sdk-edge: ${X(te,16)};
  --oc-sdk-field-bg: ${it};
  --oc-sdk-raised-bg: ${le};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(te,14)};
  --oc-sdk-field-bg: ${X(le,50,it)};
  --oc-sdk-raised-bg: ${it};
  --oc-sdk-field-lift: ${ro};
  --oc-sdk-raised-lift: ${ro};
  --oc-sdk-lit: ${ro};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,st=e=>{let t=D(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${D(`${e}-text`,"inherit")}; }`},c=e=>`calc(${e}rem / 14)`,Xn=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: ${c(8)}; height: ${c(32)}; padding: 0 ${c(12)}; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: ${c(6)}; height: ${c(28)}; padding: 0 ${c(10)}; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: ${c(4)}; height: ${c(24)}; padding: 0 ${c(8)}; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: ${c(14)}; height: ${c(14)}; }

.oc-sdk-field { display: flex; flex-direction: column; gap: ${c(4)}; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: ${c(32)}; padding: 0 ${c(10)}; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: ${c(8)} ${c(10)}; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: ${c(34)}; padding-right: ${c(34)}; }
.oc-sdk-search-icon { position: absolute; left: ${c(11)}; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: ${c(6)}; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: ${c(24)}; height: ${c(24)}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: ${c(4)}; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: ${c(6)}; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: ${c(28)}; padding: 0 ${c(10)}; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: ${c(2)}; min-width: ${c(160)}; max-width: calc(100vw - ${c(16)}); max-height: min(${c(320)}, calc(100vh - ${c(16)})); overflow: auto; padding: ${c(4)}; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: ${c(2)} ${c(2)} ${c(4)}; }
.oc-sdk-popup-search .oc-sdk-input { height: ${c(28)}; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: ${c(8)}; width: 100%; padding: ${c(6)} ${c(8)}; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: ${c(14)}; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: ${c(8)}; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: ${c(8)}; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: ${c(14)}; height: ${c(14)}; margin-top: ${c(3)}; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: ${c(36)}; height: ${c(20)}; --oc-sdk-thumb-travel: ${c(16)}; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: ${c(2)}; left: ${c(2)}; width: ${c(16)}; height: ${c(16)}; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: ${c(2)}; padding: ${c(2)}; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: ${c(6)}; height: ${c(28)}; padding: 0 ${c(10)}; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: ${c(1)} ${c(6)}; font-size: ${c(11)}; font-weight: 500; line-height: ${c(16)}; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: ${c(8)}; width: 100%; padding: ${c(6)} ${c(8)}; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: ${c(64)}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: ${c(16)} ${c(8)}; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${c(4)}; padding: ${c(40)} ${c(16)}; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: ${c(12)}; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: ${c(8)}; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: ${c(16)}; height: ${c(16)}; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: ${c(12)}; height: ${c(12)}; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: ${c(12)}; padding: ${c(8)} ${c(12)}; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: ${c(2)}; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: ${c(8)}; width: 100%; margin: ${c(8)} 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: ${c(4)} 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: ${c(4)}; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: ${c(6)}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: ${c(2)}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: ${c(8)} 0; }

/* Under a finger the controls reach the app's touch sizes: rows and options 44px like its sheets, every other
   control at least 36px. Inputs keep 16px text, below which iOS zooms the page on focus. */
@media (pointer: coarse) {
  .oc-sdk-btn, .oc-sdk-input { height: ${c(40)}; }
  .oc-sdk-btn[data-size="sm"], .oc-sdk-btn[data-size="xs"], .oc-sdk-trigger, .oc-sdk-tab, .oc-sdk-popup-search .oc-sdk-input { height: ${c(36)}; }
  .oc-sdk-input, .oc-sdk-popup-search .oc-sdk-input { font-size: max(16px, 0.875rem); }
  .oc-sdk-search-clear { width: ${c(36)}; height: ${c(36)}; right: 0; }
  .oc-sdk-row, .oc-sdk-option { min-height: ${c(44)}; }
  .oc-sdk-check { min-height: ${c(36)}; padding: ${c(8)} 0; }
}
`,yr=`${$n}
.oc-sdk { color: ${te}; font-family: ${Hn}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${xr} }
.oc-sdk-mono { font-family: ${Zt}; }
.oc-sdk-muted { color: ${$}; }
${st("success")}${st("warning")}${st("error")}${st("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${de}; --oc-sdk-tone-text: ${Jt}; }

.oc-sdk-btn { border-radius: ${eo}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Ar}; }
.oc-sdk-btn[data-variant="default"] { color: ${Jt}; background: ${X(de,10,le)}; border-color: ${X(de,12)}; ${Or} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(de,16,le)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(de,22,le)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Gn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${ge}, ${ge}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ye}; ${oo} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${ge}, ${ge}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${Q}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${ge}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${D("status-error","red")}; color: ${Qt}; background: ${X("var(--oc-sdk-tone)",7,le)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${Or} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,le)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,le)}; box-shadow: none; }

.oc-sdk-field-note { color: ${$}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Qt}; }
.oc-sdk-input { border-radius: ${eo}; background: var(--oc-sdk-field-bg); color: ${ye}; ${to("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${$}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${to(X(te,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${to(D("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Zt}; }

.oc-sdk-search-icon { color: ${$}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${de}; }
.oc-sdk-search-clear { border-radius: ${Ar}; color: ${$}; }
.oc-sdk-search-clear:hover { background: ${Q}; color: ${te}; }

.oc-sdk-trigger { border-radius: ${eo}; background: var(--oc-sdk-raised-bg); color: ${ye}; ${oo} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${ge}, ${ge}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${$}; }
.oc-sdk-trigger-chevron { color: ${$}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ye}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${it}; background-clip: padding-box; color: ${ye}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${Q}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${qt}; color: ${Yt}; }
.oc-sdk-option-check { color: ${te}; }
.oc-sdk-option[data-destructive="true"] { color: ${Qt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(D("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${$}; }
.oc-sdk-popup-empty { color: ${$}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${he}; border-radius: 4px; color: ${te}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(te,60,he)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${he}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${le}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${de}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${xr} }
.oc-sdk-check-desc { color: ${$}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(te,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${$}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${te}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Yt}; background: ${qt}; border-color: ${he}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ye}; background: var(--oc-sdk-raised-bg); ${oo} }
.oc-sdk-tab-count { color: ${$}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(te,6)}; color: ${$}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${Q}; }
.oc-sdk-row[aria-selected="true"] { background: ${qt}; color: ${Yt}; }
.oc-sdk-row-lead { font-family: ${Zt}; color: ${$}; }
.oc-sdk-row-sub { color: ${$}; }
.oc-sdk-row-meta { color: ${$}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${$}; }

.oc-sdk-empty-body { color: ${$}; }

.oc-sdk-spinner { color: ${$}; }
.oc-sdk-spinner-ring { border-color: ${he}; border-top-color: ${de}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${$}; }

.oc-sdk-separator { color: ${$}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X(he,40)}; }

.oc-sdk-progress-label { color: ${$}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(te,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${de}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${D("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${D("success-text","inherit")}; }

.oc-sdk-text a { color: ${Jt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(he,60)}; }
`,W=`
${mt}
${Xn}
${yr}`;var vr="oc-sdk-ui-style",ve=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},j=e=>{let t=document.getElementById(vr);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}ht(document);let o=document.createElement("style");o.id=vr,o.textContent=e,document.head.appendChild(o)},G=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},pe=e=>{let t=G("button",e);return t.type="button",t},ne=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},ue=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},Ir=(e,t)=>{let o=s=>{s.target instanceof Node&&e.contains(s.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Vn=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},He=(e,t)=>{j(W);let o=t,s=pe("oc-sdk oc-sdk-btn"),i=Vn(),a=document.createElement("span");s.append(a),e.append(s);let d=()=>{s.dataset.variant=o.variant??"default",s.dataset.size=o.size??"default",s.disabled=!!o.disabled||!!o.loading,s.dataset.loading=o.loading?"true":"false",s.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==s?s.prepend(i):!o.loading&&i.parentNode===s&&i.remove(),ne(a,o.label)},_=()=>{o.disabled||o.loading||o.onClick()};return s.addEventListener("click",_),d(),{update:A=>{o={...o,...A},d()},dispose:()=>{s.removeEventListener("click",_),s.remove()}}};var wr="http://www.w3.org/2000/svg",Bn={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Ie=(e,t,o)=>{let s=document.createElementNS(wr,"svg");s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("width",String(t)),s.setAttribute("height",String(t)),s.style.width=c(t),s.style.height=c(t),s.setAttribute("aria-hidden","true"),s.setAttribute("fill","currentColor"),o&&s.setAttribute("class",o);let i=document.createElementNS(wr,"path");return i.setAttribute("d",Bn[e]),s.append(i),s};var we=(e,t="vertical")=>{let[o,s]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===s||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Ce=(e,t,o)=>{let s=e.filter(A=>!A.disabled);if(s.length===0)return null;let i=s[0],a=s[s.length-1];if(o==="first"||!i||!a)return i?.id??null;if(o==="last")return a.id;let d=s.findIndex(A=>A.id===t);return d===-1?o==="next"?i.id:a.id:s[Math.min(s.length-1,Math.max(0,d+(o==="next"?1:-1)))]?.id??null};var Cr=(e,t)=>`${e}-${t??""}`,no=(e,t,o,s)=>{let i=pe("oc-sdk-option");i.id=Cr(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let a=G("span","oc-sdk-option-label");if(a.textContent=o.label,i.append(a),o.hint){let d=G("span","oc-sdk-option-hint");d.textContent=o.hint,i.append(d)}if(t==="option"){i.dataset.mark="check";let d=G("span","oc-sdk-option-check");d.append(Ie("check",14)),i.append(d)}return i.addEventListener("pointerenter",s.hover),i.addEventListener("click",s.pick),i},so=(e,t,o,s)=>{let i=Cr(o,s);for(let a of Array.from(e.children))a instanceof HTMLElement&&a.classList.contains("oc-sdk-option")&&(a.dataset.active=a.id===i?"true":"false");ue(t,"aria-activedescendant",s?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Fn=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let s=e.offsetHeight,i=window.innerHeight-o.bottom-8;s>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-s))}px`);let a=o.left+e.offsetWidth-window.innerWidth+8;a>0&&(e.style.left=`${Math.max(8,Math.round(o.left-a))}px`)},io=(e,t,o,s)=>{e.append(o),Fn(o,t);let i=Ir(e,s),a=()=>{s()},d=_=>{_.target instanceof Node&&o.contains(_.target)||s()};return window.addEventListener("resize",a),window.addEventListener("scroll",d,!0),()=>{i(),window.removeEventListener("resize",a),window.removeEventListener("scroll",d,!0),o.remove()}};var ao=(e,t)=>{ue(e,"data-tone",t&&t!=="neutral"?t:null)},co=(e,t)=>{j(W);let o=t,s=G("span","oc-sdk oc-sdk-badge");e.append(s);let i=()=>{ne(s,o.label),ao(s,o.tone)};return i(),{update:a=>{o={...o,...a},i()},dispose:()=>{s.remove()}}};var Mr=e=>e.filter(t=>!("separator"in t)),Kn=0,lo=(e,t)=>{j(W);let o=t,s=`oc-sdk-menu-${Kn+=1}`,i=G("div","oc-sdk oc-sdk-menu");e.append(i);let a=G("div","oc-sdk oc-sdk-popup");a.setAttribute("role","menu"),a.tabIndex=-1;let d=null,_=null,A=He(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{d?Y():S()}}),v=i.querySelector("button");v?.setAttribute("aria-haspopup","menu");let M=l=>{_=l,so(a,a,s,l)},B=()=>{ve(a);for(let l of o.items){if("separator"in l){let T=G("div","oc-sdk-separator");T.dataset.labeled="false",a.append(T);continue}a.append(no(s,"menuitem",l,{hover:()=>M(l.id),pick:()=>f(l.id)}))}M(Mr(o.items).some(l=>l.id===_)?_:null)},Y=()=>{let l=d;d=null,l?.(),_=null,v?.setAttribute("aria-expanded","false")},S=()=>{d||!v||(B(),d=io(i,v,a,Y),v.setAttribute("aria-expanded","true"),a.focus())},f=l=>{Y(),v?.focus(),o.onSelect(l)},h=l=>{let T=we(l);T?(l.preventDefault(),M(Ce(Mr(o.items),_,T))):l.key==="Enter"||l.key===" "?(l.preventDefault(),_&&f(_)):l.key==="Escape"&&(l.preventDefault(),Y(),v?.focus())},F=l=>{d&&!(l.relatedTarget instanceof Node&&i.contains(l.relatedTarget))&&Y()};return a.addEventListener("keydown",h),i.addEventListener("focusout",F),{update:l=>{o={...o,...l},A.update({label:o.label,variant:o.variant,size:o.size}),d&&B()},dispose:()=>{Y(),a.removeEventListener("keydown",h),i.removeEventListener("focusout",F),A.dispose(),i.remove()}}};var _e=["backlog","todo","in_progress","review","done"],Me={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},Ur=1,$e=200,Nr=16e3,uo="New task",Wn=512,jn=/^t_[a-z0-9]{6,40}$/,Lr=e=>typeof e=="string"&&_e.includes(e);var Ee=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>Wn)throw new Error(`${t} is too long`);return o},Pr=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>$e)throw new Error(`Title is limited to ${$e} characters`);return t},Dr=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>Nr)throw new Error(`Description is limited to ${Nr} characters`);return e};var Gr=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=Ee(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:Ee(t.branch,"worktree.branch")}},po=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},Hr=(e,t)=>e==null?null:po(e,t);var Ue=(e,t,o=Date.now())=>{let s={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(s.title=Pr(t.title)),"description"in t&&(s.description=Dr(t.description)),"status"in t){if(!Lr(t.status))throw new Error("Unknown status");s.status=t.status}if("projectId"in t&&(s.projectId=Ee(t.projectId,"projectId")),"sourceBranch"in t&&(s.sourceBranch=Ee(t.sourceBranch,"sourceBranch")),"worktree"in t&&(s.worktree=Gr(t.worktree)),"sessionId"in t&&(s.sessionId=Ee(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");s.rank=t.rank}return"needsAttentionSince"in t&&(s.needsAttentionSince=Hr(t.needsAttentionSince,"needsAttentionSince")),s},Eo=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==Ur)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!jn.test(t.id))throw new Error("Task id is invalid");if(!Lr(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:Ur,id:t.id,title:Pr(t.title),description:Dr(t.description),status:t.status,rank:t.rank,projectId:Ee(t.projectId,"projectId"),sourceBranch:Ee(t.sourceBranch,"sourceBranch"),worktree:Gr(t.worktree),sessionId:Ee(t.sessionId,"sessionId"),createdAt:po(t.createdAt,"createdAt"),updatedAt:po(t.updatedAt,"updatedAt"),needsAttentionSince:Hr(t.needsAttentionSince,"needsAttentionSince")}};var Xr="task:",$r=16,Vr=e=>`${Xr}${e}`,_o=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Xr)),o=[],s=[];for(let i=0;i<t.length;i+=$r)await Promise.all(t.slice(i,i+$r).map(async a=>{try{let d=Eo(await e.storage.get(a));if(Vr(d.id)!==a)throw new Error("Task id does not match its key");o.push(d)}catch{s.push(a)}}));return{tasks:o,failedKeys:s}},at=async(e,t)=>{let o=Eo(t);await e.storage.set(Vr(o.id),o)};var fo=async(e,t,o=3)=>{for(let s=1;s<=o;s+=1)try{await at(e,t);return}catch(i){if(s===o)throw i;await new Promise(a=>setTimeout(a,300*s))}};var ct="__all__",Br="__none__";var So=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),dt=(e,t)=>!(t.projectId===Br&&e.projectId!==null||t.projectId!==ct&&t.projectId!==Br&&e.projectId!==t.projectId);var Fr=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:Ue(e,{status:t,needsAttentionSince:null});var fe={waitingPermissionMeansReview:!0,failedMeansReview:!0},Xe=(e,t,o,s=fe)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",a=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return a();case"waiting-question":return i();case"waiting-permission":return s.waitingPermissionMeansReview?i():null;case"idle":return o==="completed"||o==="failed"&&s.failedMeansReview?i():null;default:return null}};var Kr=e=>{let t=e.title.trim();if(t&&t!==uo)return t.slice(0,$e);let o=e.description.trim().split(`
`)[0]?.trim()??"";return o?o.slice(0,$e):t||uo};var Wr=(e,t)=>t.sessionId===null?null:t.worktree?{directory:t.worktree.directory,branch:t.worktree.branch}:typeof e=="object"&&e.kind==="existing"?{directory:e.directory,branch:null}:null;var zn="kanban-board",qn=e=>`https://kanban.local/tasks/${e}`,jr=e=>{let t={providerId:zn,id:e.id,title:Kr(e),url:qn(e.id),worktree:e.worktree?{kind:"existing",directory:e.worktree.directory}:!1,navigation:"preserve"};return e.projectId&&(t.projectId=e.projectId),t},zr=(e,t)=>({sessionId:t.sessionId,worktree:Wr(e.worktree??!1,t)});var qr=10*6e4,Yn=60,Jn=(e,t,o=fe)=>t?Xe(e.status,t.activity,t.outcome,o)??e.status:e.status,Qn=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,Yr=(e,t)=>e.needsAttentionSince??t.updatedAt,Jr=(e,t,o,s=qr)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-Yr(e,t)<s?null:e.needsAttentionSince!==null?"hint":"quiet",Zn=(e,t,o,s=qr)=>{if(!t||Jr(e,t,o,s)===null)return null;let i=Math.floor((o-Yr(e,t))/6e4);return i>0&&i<Yn?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var es=(e,t,o=fe,s=Date.now())=>{let i=Qn(e,t),a=Jn(e,i,o),d=a!==e.status,_=e.needsAttentionSince!==null||d&&a==="review",A=Jr(e,i,s);return{task:e,displayStatus:a,movedByAgent:d,attention:_,attentionSince:e.needsAttentionSince??(_&&i?i.updatedAt:null),live:i,looksDone:A,looksDoneNote:A?Zn(e,i,s):null}},ts=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||So(e.task,t.task),Qr=(e,t,o,s=fe,i=Date.now())=>{let a=Object.fromEntries(_e.map(d=>[d,[]]));for(let d of e){if(!dt(d,o))continue;let _=es(d,t,s,i);a[_.displayStatus].push(_)}for(let d of _e)a[d].sort((_,A)=>d==="review"?ts(_,A):So(_.task,A.task));return a},Zr=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.attention&&s.displayStatus!=="done").length,0),en=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.displayStatus!=="done").length,0),tn=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},on=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var rn=(e,t,o)=>{let s=o.sessions.find(i=>i.id===e);if(s)return s.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(a=>a.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var nn=(e,t,o,s,i={})=>{let a=i.onLiveChange,d=i.onSnapshot??(()=>{}),_=new Map,A=new Map,v=new Map,M=new Map,B=!1,Y=(l,T)=>{if(T.state==="loading")return!1;let g=0;for(let[x,N]of v)N.projectId===l&&(v.delete(x),g+=1);if(T.state!=="ready")return g>0;for(let x of T.sessions)x.parentId===null&&v.set(x.id,{projectId:l,activity:x.activity,outcome:x.outcome,updatedAt:x.updatedAt});return!0},S=(l,T)=>{if(B)return;Y(l,T)&&a&&a(),d();for(let x of T.sessions)M.set(x.id,x.directory);if(o)for(let x of A.values()){if(x.projectId!==l||!x.sessionId)continue;let N=rn(x.sessionId,M.get(x.sessionId)??null,T);if(s&&(N==="deleted"||N==="archived")){s(x.id,x.sessionId,N);continue}let z=T.sessions.find(I=>I.id===x.sessionId);if(!z)continue;let ae=Xe(x.status,z.activity,z.outcome,t);ae&&o(x.id,ae)}},f=l=>{let T=e.onSessions(l,g=>S(l,g));_.set(l,T),T.then(g=>{(B||!_.has(l))&&g()},()=>{})};return{live:()=>v,sync:l=>{if(B)return;A=new Map(l.map(g=>[g.id,g]));let T=new Set(l.filter(g=>g.sessionId&&g.projectId).map(g=>g.projectId));for(let g of T)_.has(g)||f(g);for(let[g,x]of _)if(!T.has(g)){_.delete(g);for(let[N,z]of v)z.projectId===g&&v.delete(N);x.then(N=>N(),()=>{})}},dispose:()=>{B=!0;for(let l of _.values())l.then(T=>T(),()=>{});_.clear()}}};var sn=(e,t)=>{if(!t)return null;let o=e.find(s=>s.directory===t);return o||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,i)=>i.directory.length-s.directory.length)[0]??null)},Se=e=>{if(e instanceof E)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var O=(e,t="",o="")=>{let s=document.createElement(e);return t&&(s.className=t),o&&(s.textContent=o),s};var lt="http://www.w3.org/2000/svg",os={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},cn=e=>{let t=document.createElementNS(lt,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},rs=()=>cn(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(lt,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let s=document.createElementNS(lt,"path");s.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,s)}),ns=()=>cn(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(lt,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),To=e=>{let t=O("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},an=()=>{let e=O("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},ss={running:rs,"waiting-question":()=>To("?"),"waiting-permission":ns,failed:()=>To("!"),finished:()=>To("\u2713"),idle:an,linked:an},dn=e=>{let t=O("span","kb-agent-pill"),o=os[e.key];return o&&(t.dataset.tone=o),t.append(ss[e.key]()),t.append(O("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var ln=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var pn="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",un="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",is=`${un} M9.25 5.75h1.5v6.5H9.25z M6.75 8.25h6.5v1.5H6.75z`,as="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",cs=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("fill-rule","evenodd"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},pt=(e,t,o,s={})=>{let i=O("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),s.primary&&(i.dataset.primary="true"),s.hint&&(i.dataset.hint="true"),s.quiet&&(i.dataset.quiet="true"),s.info&&(i.dataset.info="true"),i.append(cs(e)),i.addEventListener("click",a=>{a.stopPropagation(),o()}),i},ds=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(..._e.filter(s=>s!==e.displayStatus).map(s=>({id:`move:${s}`,label:`Move to ${Me[s]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},En=(e,t,o)=>{let s=t==="rail",i=O("div",s?"kb-panel-sections":"kb-columns");e.append(i);let a=[],d=null,_=(S,f)=>[...S.querySelectorAll(".kb-draggable-item")].filter(h=>h.dataset.id!==f).map(h=>({id:h.dataset.id??"",top:h.getBoundingClientRect().top,height:h.getBoundingClientRect().height})),A=(S,f,h,F)=>{S.addEventListener("dragover",l=>{d&&(l.preventDefault(),S.classList.add("kb-dragover"))}),S.addEventListener("dragleave",l=>{l.target===S&&S.classList.remove("kb-dragover")}),S.addEventListener("drop",l=>{l.preventDefault(),S.classList.remove("kb-dragover");let T=d??l.dataTransfer?.getData("text/plain")??null;if(d=null,!T)return;if(s&&l.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(T,h);return}let g=ln(_(f,T),l.clientY);F(T,h,g)})},v=S=>{let{task:f}=S,h=O("div",S.attention?"kb-item kb-attn":"kb-item");s?h.classList.add("kb-panel-row"):h.classList.add("kb-card");let F=o.onDrop!==void 0;F?(h.classList.add("kb-draggable-item"),h.draggable=!0):h.draggable=!1,h.dataset.id=f.id;let l=o.isSelected?.(f)??!1;l&&(h.dataset.selected="true");let T=O("div","kb-panel-main");h.append(T);let g=O("div","kb-item-top");if(o.onToggleSelect){let I=o.onToggleSelect,U=document.createElement("input");U.type="checkbox",U.className="kb-check",U.checked=l;let oe=l?"Deselect":"Select";U.title=`${oe} "${f.title}"`,U.setAttribute("aria-label",`${oe} task: ${f.title}`),U.addEventListener("click",Z=>Z.stopPropagation()),U.addEventListener("change",()=>I(f)),g.append(U)}g.append(O("div","kb-panel-title",f.title)),T.append(g);let x=o.projectName(f),N=O("div","kb-panel-sub");x&&N.append(O("span","kb-panel-project",x));let z=S.live?on(S.live):f.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(z&&N.append(dn(z)),T.append(N),s&&o.onChat&&(f.sessionId||f.projectId&&S.displayStatus!=="done")){let I=o.onChat;g.append(pt(f.sessionId?un:is,f.sessionId?"Open chat":"New chat",()=>I(f),f.sessionId&&S.attention?{primary:!0}:{}))}if(s&&S.displayStatus!=="done"&&o.onMarkDone){let I=o.onMarkDone;g.append(pt(pn,"Mark done",()=>I(f),{info:!0}))}if(s&&S.looksDone){let I=O("span","kb-panel-chip","\u2713 looks done");I.dataset.ok="true",h.append(I)}let ae=ds(S,o);if(!s&&S.looksDone&&o.onLooksDone){let I=o.onLooksDone;g.append(pt(pn,S.looksDoneNote??"Looks done \u2014 click to mark Done",()=>I(f),S.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(ae){let I=O("span","kb-panel-menu");g.append(I),a.push(lo(I,{label:"\u22EF",variant:"ghost",size:"xs",items:ae,onSelect:U=>{if(U==="delete"&&o.onDelete){o.onDelete(f);return}if(U==="edit"&&o.onEdit){o.onEdit(f);return}if(U.startsWith("move:")){let oe=U.slice(5);_e.includes(oe)&&o.onMoveStatus&&o.onMoveStatus(f,oe)}}}))}if(o.onActivate){let I=()=>o.onActivate(f);h.addEventListener("click",U=>{if(!U.target?.closest(".kb-panel-menu")){if(o.onToggleSelect&&(U.metaKey||U.ctrlKey)){o.onToggleSelect(f);return}I()}}),h.tabIndex=0,h.addEventListener("keydown",U=>{(U.key==="Enter"||U.key===" ")&&(U.preventDefault(),I())})}return F&&(h.addEventListener("dragstart",I=>{d=f.id,h.classList.add("kb-dragging"),I.dataTransfer?.setData("text/plain",f.id),I.dataTransfer&&(I.dataTransfer.effectAllowed="move")}),h.addEventListener("dragend",()=>{d=null,h.classList.remove("kb-dragging")})),h},M=(S,f)=>{let h=O("div","kb-column");h.dataset.status=S;let F=O("div","kb-column-head"),l=O("span","kb-column-count",String(f.length));f.some(x=>x.attention&&x.displayStatus!=="done")&&(l.dataset.attn="true");let T=O("span","kb-column-tools");if(T.append(l),o.onEmptyColumn){let x=o.onEmptyColumn,N=o.isColumnEmptyArmed?.(S)??!1,z=pt(as,N?`Click again to empty ${Me[S]}`:`Empty ${Me[S]}`,()=>x(S));N&&(z.dataset.armed="true"),T.append(z)}F.append(O("span","kb-column-title",Me[S]),T);let g=O("div","kb-column-body");h.append(F,g),f.length===0&&g.append(O("div","kb-column-empty","No tasks"));for(let x of f)g.append(v(x));return o.onDrop&&A(h,g,S,o.onDrop),h},B=(S,f)=>{let h=O("div","kb-psec");h.dataset.status=S;let F=o.onToggleSection!==void 0,l=F&&(o.isCollapsed?.(S)??!1),T=F?document.createElement("button"):O("div","kb-psec-head");T.className="kb-psec-head",T instanceof HTMLButtonElement&&(T.type="button"),T.append(O("span","kb-psec-name",Me[S]));let g=O("span","kb-psec-count","0");f.some(N=>N.attention&&N.displayStatus!=="done")&&(g.dataset.attn="true"),T.append(g),F&&(T.append(O("span","kb-psec-chevron",l?"\u25B8":"\u25BE")),T.addEventListener("click",()=>o.onToggleSection?.(S)));let x=O("div","kb-psec-body");if(x.hidden=l,h.append(T,x),!l){f.length===0&&x.append(O("div","kb-panel-empty","No tasks"));for(let N of f)x.append(v(N))}return o.onDrop&&A(h,x,S,o.onDrop),h};return{render:S=>{for(let f of a.splice(0))f.dispose();i.replaceChildren();for(let f of _e)i.append(s?B(f,S[f]):M(f,S[f]))},dispose:()=>{for(let S of a.splice(0))S.dispose();i.replaceChildren()}}};var ls=`
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--oc-bg);color:var(--oc-fg);font-family:var(--oc-font);font-size:14px;line-height:1.45}
#root{min-height:100%}
.kb-page{display:flex;flex-direction:column;gap:14px;padding:16px;min-height:100%}
.kb-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.kb-toolbar .grow{flex:1;min-width:160px}
/* The selection bar (page only): appears under the toolbar while tasks are
   selected \u2014 a count, a Move-to menu, Mark Done, and the Delete that needs
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
/* Armed destructive: filled \u2014 the second press must look like what it is. */
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
/* A selected card wears the focus-colored outline ring \u2014 not the border \u2014 so
   an attention card keeps its warning edge visible beside the selection. */
.kb-card[data-selected="true"]{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-check{width:15px;height:15px;margin:1px 0 0;accent-color:var(--oc-primary);cursor:pointer;flex:none}
.kb-card-title{font-weight:550;font-size:13px;overflow-wrap:anywhere}
.kb-card-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
/* The shared item head: title left, \u22EF menu right \u2014 same on cards and rows. */
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
   single column, tighter rhythm \u2014 the same dialog otherwise. */
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
/* Corner close (the \u2715 that replaced the footer's Close button): the small
   square icon-button idiom the board's cards use, one size up for the head. */
.kb-dialog-close{width:24px;height:24px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--oc-muted);border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 4px);cursor:pointer;flex:none}
.kb-dialog-close svg{width:13px;height:13px;display:block}
.kb-dialog-close:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-dialog-close:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
/* The task-body Delete button, always red (the kit's destructive) like the
   board's own danger buttons; the first, arming press fills it until the
   confirming press \u2014 the same escalation the selection bar's Delete gets. */
.kb-danger-btn[data-armed="true"] .oc-sdk-btn[data-variant="destructive"]{background:var(--oc-error,var(--status-error,#e5484d));border-color:transparent;color:var(--oc-primary-fg,#fff)}
.kb-danger-btn[data-armed="true"] .oc-sdk-btn[data-variant="destructive"]:hover{background:var(--oc-error,var(--status-error,#e5484d));color:var(--oc-primary-fg,#fff)}
/* The Start Agent block at the top of the session section: note, button,
   gating hint \u2014 no rule above it; the task-body actions row is just the
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
   sections with slim rows. The \u2713 at a row's edge is the panel's one write
   (Mark done \u2014 deliberate, at the user's own click); every other deliberate
   action lives on the full board. */
.kb-rail{gap:10px;padding:12px 14px}
.kb-rail h2{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}
.kb-rail-scope{margin:0;font-size:11px;color:var(--oc-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-panel-unseen{margin:0;font-size:12px;color:var(--oc-warning,#e5a234)}
.kb-panel-sections{display:flex;flex-direction:column}
.kb-psec{display:flex;flex-direction:column}
.kb-psec+.kb-psec{border-top:1px solid var(--oc-border)}
/* The section heads are plain labels \u2014 the display-only mirror has no fold, no menu, no drop targets. */
.kb-psec-head{display:flex;align-items:center;gap:8px;width:100%;padding:9px 2px}
.kb-psec-name{flex:1;min-width:0;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--oc-muted)}
.kb-psec-count{font:11px var(--oc-mono);color:var(--oc-muted);background:var(--oc-muted-surface);padding:2px 7px;border-radius:9999px}
.kb-psec-count[data-attn]{color:var(--oc-warning,#e5a234);background:color-mix(in srgb,var(--oc-warning,#e5a234) 14%,transparent)}
/* One theme token per column (the renderer sets data-status on both surfaces):
   a 3px strip above the head, the title, and the count pill take the column's
   accent; bodies stay neutral \u2014 attention borders, agent pills and drag-over
   outlines keep their hues to themselves. Backlog muted, Review warning, Done
   success, and the blue family owns everything agent-engaged: To Do = the info
   blue held back, In Progress = the same blue at full strength. The theme's
   brand primary is deliberately out of the palette here \u2014 in real host themes
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
/* To Do reads as the In Progress family at lower strength \u2014 planned vs
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
/* The agent-state pill \u2014 one renderer (ui/pill.ts), everywhere: item meta
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
.kb-panel-chip{flex:none;font-size:10px;font-weight:500;color:var(--oc-warning,#e5a234);background:color-mix(in srgb,var(--oc-warning,#e5a234) 13%,transparent);padding:1px 6px;border-radius:9999px}
.kb-rail-foot{display:flex;align-items:center;gap:10px;justify-content:space-between}
.kb-rail-foot p{margin:0}
.kb-panel-empty{font-size:12px;color:var(--oc-muted);padding:4px 2px}
/* The \u22EF menu slot lives inside page cards; the page reveals it on hover/focus (rule above), coarse pointers always. */
.kb-panel-menu{flex:none;opacity:0;transition:opacity 120ms ease-out}
/* Under a finger the rows reach the app's touch size; menus always show. */
@media (pointer: coarse){
  .kb-psec-head{min-height:36px}
  .kb-panel-row{min-height:44px}
  .kb-panel-menu{opacity:1}
  /* Touch has no hover: the page card's quiet \u2713 is a button always, not only on reveal. */
  .kb-card .kb-iconbtn[data-quiet="true"]{opacity:1}
  /* The selection checkbox reaches a tappable size under a finger. */
  .kb-check{width:20px;height:20px}
}
/* Small square icon buttons \u2014 the \u2713 beside the \u22EF menu on page cards and the
   rail's mark-done \u2713 \u2014 reusing the dictation panel's icon-button idiom.
   A hint \u2713 (data-hint) is success-tinted and always visible: it IS the
   suggestion. A quiet \u2713 (data-quiet) is muted and revealed on hover/focus,
   the same reveal rule as the \u22EF menu, sinking under it as the smaller
   affordance. An info \u2713 (data-info) tints with the app's info tone and never
   hides: the rail's one always-visible affordance. */
.kb-iconbtn{width:22px;height:22px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--oc-muted);border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 4px);cursor:pointer;flex:none}
.kb-iconbtn svg{width:12px;height:12px;display:block}
.kb-iconbtn:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-iconbtn:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-iconbtn[data-hint="true"]{color:var(--oc-success,var(--status-success,#46a758));border-color:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 38%,transparent)}
.kb-iconbtn[data-hint="true"]:hover{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 12%,transparent)}
/* Tinted with the app's info tone (blue in its themes): the rail's always-visible mark-done \u2713. */
.kb-iconbtn[data-info="true"]{color:var(--oc-info-text,var(--oc-info,#5b9cf6));border-color:color-mix(in srgb,var(--oc-info,#5b9cf6) 38%,transparent);background:color-mix(in srgb,var(--oc-info,#5b9cf6) 13%,transparent)}
.kb-iconbtn[data-info="true"]:hover{background:color-mix(in srgb,var(--oc-info,#5b9cf6) 22%,transparent)}
.kb-iconbtn[data-primary="true"]{background:var(--oc-primary);border-color:transparent;color:var(--oc-primary-fg,#fff)}
.kb-iconbtn[data-primary="true"]:hover{color:var(--oc-primary-fg,#fff)}
/* Toolbar icon buttons \u2014 the same idiom at toolbar scale: the reload (Refresh)
   spins while any reload is in flight, the plus is the board's primary action
   and dims while a create is in flight. */
.kb-tb-iconbtn{width:30px;height:30px;border-radius:calc(var(--oc-radius,10px) - 3px)}
.kb-tb-iconbtn svg{width:14px;height:14px;display:block}
.kb-tb-iconbtn.kb-spinning svg{animation:kb-spin .9s linear infinite;transform-origin:center}
.kb-tb-iconbtn[data-busy="true"]{opacity:.55;cursor:default}
/* An armed destructive icon button (the column head's trash after its first
   press) turns error-tinted \u2014 the second press empties the whole column. */
.kb-iconbtn[data-armed="true"]{color:var(--oc-error-text,var(--oc-error,#e5484d));border-color:color-mix(in srgb,var(--oc-error,#e5484d) 45%,transparent);background:color-mix(in srgb,var(--oc-error,#e5484d) 12%,transparent)}
.kb-iconbtn[data-armed="true"]:hover{background:color-mix(in srgb,var(--oc-error,#e5484d) 20%,transparent)}
.kb-card .kb-iconbtn[data-quiet="true"]{opacity:0;transition:opacity 120ms ease-out}
.kb-card:hover .kb-iconbtn[data-quiet="true"],.kb-card:focus-within .kb-iconbtn[data-quiet="true"]{opacity:1}
/* Rail rows carry the same buttons at the 26px touch size; the chat button
   and the \u2713 (data-info) ride them at a row's right edge and never hide. */
.kb-panel-row .kb-iconbtn{width:26px;height:26px}
.kb-panel-row .kb-iconbtn svg{width:13px;height:13px}
/* The rail's looks-done chip speaks success \u2014 the only chip a row wears. */
.kb-panel-chip[data-ok]{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 13%,transparent)}
[hidden]{display:none!important}
`,_n=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=ls,document.head.append(e)};var K=jt(),ho=document.querySelector("#root");if(!ho)throw new Error("Missing #root");var Et=!1,me=!1,ie=[],go=[],bo=null,Ne=null,ko,Ve,mo=!1,ke=!1,Ao=null,Sn,Le,Be,Fe,ps=(e,t)=>e.filter(o=>dt(o,{projectId:t??ct})),be=e=>{ie=[...e],Tn.sync(ps(ie,Ne?.id??null))},Tn=nn(K,fe,null,void 0,{onLiveChange:()=>{ke&&!me&&Te()},onSnapshot:()=>{Es()}}),fn=()=>{Ne=sn(go,bo)};K.onReady(e=>{if(Et)return;Et=!0,zt(e,document.documentElement),bo=e.directory,_n(),ho.replaceChildren();let t=O("div","kb-page kb-rail"),o=O("div","kb-row between");o.append(O("h2","","Kanban"));let s=O("span");o.append(s),t.append(o),Le=O("p","kb-muted","Loading\u2026"),t.append(Le),Be=O("p","kb-rail-scope"),t.append(Be),Fe=O("p","kb-panel-unseen"),t.append(Fe),Ao=En(t,"rail",{projectName:a=>!Ne&&a.projectId?go.find(d=>d.id===a.projectId)?.name??null:null,onMarkDone:async a=>{let d=ie.find(A=>A.id===a.id)??a,_=Fr(d,"done");if(_){try{await at(K,_)}catch(A){K.toast({kind:"error",message:`Could not mark "${d.title}" done \u2014 ${Se(A)}`}).catch(()=>{}),ut();return}be(ie.map(A=>A.id===d.id?_:A)),Te()}},onChat:async a=>{let d=ie.find(M=>M.id===a.id)??a;if(d.sessionId){if(d.needsAttentionSince!==null){let M=Ue(d,{needsAttentionSince:null});try{await fo(K,M),be(ie.map(B=>B.id===d.id?M:B)),Te()}catch(B){K.toast({kind:"error",message:`Opened the chat, but marking "${d.title}" reviewed failed \u2014 ${Se(B)}`}).catch(()=>{})}}try{await K.openSession(d.sessionId)}catch(M){K.toast({kind:"error",message:`Could not open the chat of "${d.title}" \u2014 ${Se(M)}`}).catch(()=>{})}return}if(!d.projectId)return;let _=jr(d),A;try{A=await K.startSession(_)}catch(M){K.toast({kind:"error",message:`Could not start the chat for "${d.title}" \u2014 ${Se(M)}`}).catch(()=>{});return}if(A.sessionId===null){K.toast({kind:"error",message:`Could not start the chat (${A.failure}). Its worktree at ${A.directory} was kept so you can recover it by hand.`}).catch(()=>{});return}let v=Ue(d,zr(_,A));try{await fo(K,v)}catch(M){K.toast({kind:"error",message:`Started a chat for "${d.title}", but the link could not be saved \u2014 ${Se(M)}. Open the full board to link it.`}).catch(()=>{}),ut();return}be(ie.map(M=>M.id===d.id?v:M)),Te(),await K.openSession(A.sessionId)}});let i=O("div","kb-rail-foot");i.append(O("p","kb-muted","Two quick actions live here \u2014 the \u2713 marks a task Done, and the chat button opens the linked chat of a card (starting one attached to it when there is none). Everything else (open, move, edit, delete) is the full board, from the Extension pages menu.")),t.append(i),ho.append(t),Sn=co(s,{label:"",tone:"neutral"}),ko=window.setInterval(()=>{ut()},3e4),K.onProjects(a=>{me||a.state!=="ready"||(go=a.projects,fn(),be(ie),ke&&Te())}).then(()=>{},()=>{}),K.onDirectory(a=>{me||(bo=a,fn(),be(ie),ke&&Te())}),us()});var us=async()=>{try{let e=await _o(K);if(me)return;be(e.tasks),ke=!0,Le.hidden=!0,Te()}catch(e){Le.textContent=`Could not load tasks \u2014 ${Se(e)}`}},ut=async()=>{if(!(!Et||me||mo)){mo=!0;try{let{tasks:e}=await _o(K);if(me)return;be(e),ke||(ke=!0,Le.hidden=!0),Te()}catch(e){ke||(Le.textContent=`Could not load tasks \u2014 ${Se(e)}`)}finally{mo=!1}}},Es=()=>{Ve!==void 0||me||!Et||(Ve=window.setTimeout(()=>{Ve=void 0,ut()},500))},Te=()=>{let e=Qr(ie,Tn.live(),{projectId:Ne?.id??ct}),t=en(e),o=Zr(e);Ne?(Be.textContent=`Project: ${Ne.name}`,Be.hidden=!1):Be.hidden=!0;let s=tn(t,o);Sn.update({label:s.label,tone:s.tone}),o>0?(Fe.textContent=`${o} task${o===1?"":"s"} need${o===1?"s":""} your review`,Fe.hidden=!1):Fe.hidden=!0,Ao?.render(e)};window.addEventListener("pagehide",()=>{me=!0,ko!==void 0&&window.clearInterval(ko),Ve!==void 0&&window.clearTimeout(Ve),Ao?.dispose(),K.dispose()});})();
