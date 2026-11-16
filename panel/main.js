"use strict";(()=>{var b="openchamber.sdk";var Fe="data-oc-scrolling",pt=`
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
:hover, [${Fe}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Fe}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Fe}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Fe}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function ut(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?t:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let c=o.get(i);c!==void 0&&clearTimeout(c),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Zn=`(${ut.toString()})(document);`;var Io=e=>{let t=[],o=0,s=0;return{push:i=>{for(t.push(i),s+=i.length;s-o>e&&t.length>1;){let c=t.shift();s-=c?.length??0,o=0}},pull:i=>{let c=0;for(;c<i.length&&t.length>0;){let l=t[0],T=Math.min(i.length-c,l.length-o);i.set(l.subarray(o,o+T),c),c+=T,o+=T,o>=l.length&&(t.shift(),s-=l.length,o=0)}i.fill(0,c)},clear:()=>{t.length=0,o=0,s=0},get size(){return s-o}}};var Mo=/^[a-z][a-z0-9-]{0,39}$/;var yo=e=>Object(e)===e&&!Array.isArray(e),Et=(e,t)=>Object.keys(e).every(o=>t.includes(o)),vo=e=>String(e)===e&&e.length>=1&&e.length<=60,Co=e=>String(e)===e&&e.length>=1&&e.length<=80,Uo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!yo(o)||!Mo.test(o.id)||!vo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!Et(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!Et(o,["kind","id","label","value","options","disabled"])||!Co(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let s=new Set;for(let i of o.options){if(!yo(i)||!Et(i,["value","label"])||!Co(i.value)||!vo(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(o.value))return!1}return!0};var tr=1024*1024;var wo=["{id}","{segment}","{segments+}"];var os=new Set(wo);var No=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var rs=new Set(No);var _t=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Lo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Po=/^[A-Za-z0-9_-]{1,80}$/;var Do=["left","right","top","bottom"];var Go=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!Go(i,t+1,o))return!1;return!0},St=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(St);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(St)}return String(e)===e||Number.isFinite(e)},Tt=e=>{try{return String(e.id)!==e.id||!Po.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Do.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Go(e.data)||!St(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var mt=2e3;var Xo=["file","directory","other","missing"],At=e=>!!(e&&"sessionId"in e),ht=e=>!!(e&&"sent"in e&&!("sessionId"in e));var $o=/^[0-9a-f]{7,64}$/i,Ot=e=>$o.test(e),Be=500,Ke=32e3,Vo=16e3,Fo=128,Bo=200,Ko=2e3,jo=16e3,Wo=80,zo=200,qo=16e3;var Yo=2e3;var gt=2e4,je=1024,We=2e6;var ze=64e3,qe=8e3,kt=4e3;var Rt=96e4,or=60*6e4;var Jo=999,Qo=1e4,Me=500,Zo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],en=["stopped","starting","ready","failed"],nr=new Set(Zo),tn=e=>nr.has(e),on=e=>e&&tn(e)?e:"HOST_REJECTED",Ae=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ae):Object(e)===e?Object.values(e).every(Ae):!1,nn=e=>Ae(e)&&JSON.stringify(e).length<=qo,Ho=e=>e?.trim().slice(0,zo)??"",he=e=>{let t=e.id.trim().slice(0,Fo),o=e.title.trim().slice(0,Bo),s=e.url.trim().slice(0,Ko),i=e.text?.trim().slice(0,jo),c=e.author?.trim().slice(0,Wo),l=e.kind==="pull"?"pull":"issue",T={providerId:e.providerId.trim(),id:t,title:o||t,url:s,kind:l};if(i&&(T.text=i),c&&(T.author=c),l==="pull"){let I=Ho(e.branches?.head),M=Ho(e.branches?.base);I&&M&&(T.branches={head:I,base:M})}return nn(e.data)&&(T.data=e.data),T},bt=e=>{let t=he(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},xt=e=>{let t={text:e.text.trim().slice(0,Vo)};return e.send&&(t.send=!0),t},It=e=>e===null||!Number.isFinite(e)?null:Math.min(Jo,Math.max(0,Math.round(e))),yt=e=>Number.isFinite(e)?Math.min(Qo,Math.max(0,Math.ceil(e))):0;var Oe=e=>e.length>0&&e.length<=je&&!e.includes("\0")&&!e.includes("\\");var Ye=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Yo?!1:!e.split("/").some(o=>o==="."||o===".."),rr=new Set(en),vt=e=>!!(e&&"status"in e&&rr.has(String(e.status))&&!("body"in e)),Je=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Ct=e=>!!(e&&"content"in e&&String(e.content)===e.content),Mt=e=>!!(e&&"written"in e&&e.written===!0),Ut=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),sr=new Set(Xo),wt=e=>!!(e&&"kind"in e&&"size"in e&&sr.has(String(e.kind))&&Number.isFinite(e.size)),Nt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),ir=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),ar=e=>Object(e)===e?e:null,ft=e=>String(e)===e&&e.length>0,cr=e=>{if(!ft(e.id))return null;if(e.ok===!0){let t={channel:b,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&ft(e.error)?{channel:b,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:on(ft(e.code)?e.code:void 0)}:null},Lt=e=>{let t=ar(e);return!t||t.channel!==b||t.v!==1?null:t.type==="result"?cr(t):!ir.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var rn=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,dr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},sn=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Qe=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${je} characters without NUL or backslash.`)),Ze=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},h=e=>(e.value+=1,`oc-${e.value}`),Xt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),s=e.requestTimeoutMs??gt,i=new Set,c=new Set,l=new Set,T=new Set,I=new Set,M=new Set,j=new Set,W=new Set,z=new Set,f=new Set,O=new Set,m=new Set,V=[],d=null,_=null,g=new Set,R=new Set,U=null,q=null,y=!1,P=new Map,re=new Map,fe=new Map,oe=!1,A={value:0},S=null,se=null,ve=!1,Ce=!1,So=null,Q=null,To=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,Y=n=>{t.parent.postMessage(n,"*")},fo=()=>{oe||t.parent===t||m.size===0||S?.features?.lateGenerateResults!==!0||Y({channel:b,v:1,type:"generate-late-listen"})},w=(n,r)=>{for(let u of n)try{u(r)}catch(p){console.error(p)}},mo=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let r=Lt(n.data);if(!r)return;if(r.type==="workspace"){let p=re.get(r.payload.subscriptionId);p&&w([p],r.payload.snapshot);return}if(r.type==="shells"){let p=fe.get(r.payload.subscriptionId);p&&w([p],r.payload.snapshot);return}if(r.type==="microphone-audio"){Q?.queue.push(r.payload.samples);return}if(r.type==="microphone-ended"){let p=Q;if(!p)return;Q=null,p.release(),w(p.endedListeners,r.payload.reason);return}if(r.type==="ready"){S=r.payload,se=To(r.payload.session),w(i,r.payload),w(c,r.payload.directory),w(l,r.payload.session),se&&w(T,se),w(I,r.payload.connection),w(M,r.payload.settings),w(j,r.payload.item),r.payload.block&&w(W,r.payload.block),fo();return}if(r.type==="service-event"){w(z,r.payload);return}if(r.type==="generate-late"){m.size===0?V.push(r.payload):w(m,r.payload);return}if(r.type==="directory"){S&&(S={...S,directory:r.payload.directory}),w(c,r.payload.directory);return}if(r.type==="session"){S&&(S={...S,session:r.payload.session}),r.payload.session?se?.sessionId!==r.payload.session.id&&(se=To(r.payload.session)):se=null,w(l,r.payload.session);return}if(r.type==="session-lifecycle"){se=r.payload,w(T,r.payload);return}if(r.type==="connection"){S&&(S={...S,connection:r.payload.connection}),w(I,r.payload.connection);return}if(r.type==="settings"){S&&(S={...S,settings:r.payload.settings}),w(M,r.payload.settings);return}if(r.type==="item"){S&&(S={...S,item:r.payload.item}),w(j,r.payload.item);return}if(r.type==="status-control-event"){w(f,r.payload);return}if(r.type==="popover-closed"){w(O,r.payload);return}if(r.type==="action"){let p=C=>{oe||Y({channel:b,v:1,type:"action-result",id:r.id,payload:C})},v=_;if(!v){p({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>v(r.payload)).then(()=>p({ok:!0}),C=>{let N=(C instanceof Error?C.message:String(C)).trim();p({ok:!1,error:(N||"Action failed.").slice(0,Me)})});return}if(r.type==="file-open"){let p=r.payload;if(q&&Lo(q,p))return;q=p,w(g,r.payload);return}if(r.type==="file-saved"){w(R,r.payload.version);return}if(r.type==="file-snapshot"){let p=N=>{oe||Y({channel:b,v:1,type:"file-snapshot-result",id:r.id,payload:N})},v=N=>p({error:(N.trim()||"Could not read the edited file.").slice(0,Me)}),C=U;if(!C){v("This extension does not edit files.");return}Promise.resolve().then(()=>C(r.payload.purpose)).then(N=>{if(_t(N)>2e7){v(`The file is over ${2e7} ${"bytes"in N?"bytes":"characters"}.`);return}if(N.version.length>256){v(`The snapshot version is over ${256} characters.`);return}p({snapshot:"bytes"in N?{bytes:N.bytes,version:N.version}:{content:N.content,version:N.version}})},N=>v(N instanceof Error?N.message:String(N)));return}if(r.type==="resolve"){let p=C=>{Y({channel:b,v:1,type:"resolve-result",id:r.id,payload:C})},v=d;if(!v){p({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>v(r.payload)).then(C=>p({item:C?he(C):null}),C=>{let N=(C instanceof Error?C.message:String(C)).trim();p({error:(N||"Command failed.").slice(0,Me)})});return}let u=P.get(r.id);if(u){if(clearTimeout(u.timer),P.delete(r.id),r.ok){u.resolve(r.payload);return}u.reject(new E(r.code,r.error))}};t.addEventListener("message",mo),Y({channel:b,v:1,type:"hello"});let K=(n,r=s)=>oe||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((u,p)=>{let v=setTimeout(()=>{P.delete(n.id),p(new E("HOST_TIMEOUT","Host did not answer in time."))},r);P.set(n.id,{resolve:u,reject:p,timer:v}),Y(n)}),$=n=>K(n).then(()=>{}),G={channel:b,v:1},at=n=>{!oe&&t.parent!==t&&Y(n)},Ao=()=>at({...G,type:"file-save"}),ct=()=>{!oe&&t.parent!==t&&Y({...G,type:"microphone-close",id:h(A)})},Jn=async()=>{if(Q)throw new E("HOST_REJECTED","The microphone is already open in this frame.");if(S?.features?.microphone!==!0)throw new E("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let n=globalThis.AudioContext;if(typeof n!="function")throw new E("UNSUPPORTED","This frame has no Web Audio.");let r=new n;if(r.sampleRate<8e3||r.sampleRate>192e3)throw r.close().catch(()=>{}),new E("UNSUPPORTED",`Audio at ${r.sampleRate} Hz is not supported.`);let u=r.state==="suspended"?r.resume().catch(()=>{}):void 0,p=Io(Math.round(r.sampleRate/4)),v=r.createScriptProcessor(1024,1,1);v.onaudioprocess=ee=>p.pull(ee.outputBuffer.getChannelData(0));let C=r.createMediaStreamDestination();v.connect(C);let N=new Set,me={queue:p,endedListeners:N,release:()=>{v.onaudioprocess=null,v.disconnect(),p.clear();for(let ee of C.stream.getTracks())ee.stop();r.close().catch(()=>{})}};Q=me;try{let ee=await K({...G,type:"microphone-open",id:h(A),payload:{sampleRate:r.sampleRate}},12e4);if(!ee||!("opened"in ee)||ee.opened!==!0)throw new E("HOST_REJECTED","Host did not open the microphone.");if(await u,Q!==me)throw new E("DISCONNECTED","The microphone closed while it was opening.")}catch(ee){throw Q===me&&(Q=null),me.release(),ct(),ee}return{stream:C.stream,close:()=>{Q===me&&(Q=null,me.release(),ct())},onEnded:ee=>(N.add(ee),()=>{N.delete(ee)})}},ho=n=>{!rn(n)||!dr(n)||(n.preventDefault(),Ao())},Oo=n=>{!rn(n)||n.key!=="Escape"||S?.surface!=="popover"||!S.popover||(n.preventDefault(),bo(S.popover.id,"escape").catch(()=>{}))},Xe=()=>{let n=S?.surface==="popover"?S.popover:void 0;if(!n)return;let r=ve||Ce;So!==r&&(So=r,xo(n.id,r).catch(()=>{}))},$e=()=>{S?.surface!=="popover"||ve||(ve=!0,Xe())},go=n=>{S?.surface!=="popover"||n.relatedTarget!==null||!ve||(ve=!1,Xe())},ko=()=>{S?.surface!=="popover"||Ce||(Ce=!0,Xe())},Ro=()=>{S?.surface!=="popover"||!Ce||(Ce=!1,Xe())},ne=(n,r=1024)=>{if(!n.trim()||n.length>r)throw new E("HOST_REJECTED",`Identity must contain 1 to ${r} characters.`)},dt=async n=>{n.kind!=="projects"&&ne(n.projectId);let r=await K({...G,type:"workspace-read",id:h(A),payload:n});if(!r||!("kind"in r)||!("state"in r)||r.kind!==n.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return r},lt=async(n,r)=>{n.kind!=="projects"&&ne(n.projectId);let u=h(A);re.set(u,r);try{await $({...G,type:"workspace-subscribe",id:h(A),payload:{subscriptionId:u,query:n}})}catch(p){throw re.delete(u),oe||Y({...G,type:"workspace-unsubscribe",id:h(A),payload:{subscriptionId:u}}),p}return()=>{!re.delete(u)||oe||Y({...G,type:"workspace-unsubscribe",id:h(A),payload:{subscriptionId:u}})}},Qn=async(n,r)=>{n.kind==="session"&&ne(n.sessionId),n.kind==="project"&&ne(n.projectId);let u=h(A);fe.set(u,r);try{await $({...G,type:"shells-subscribe",id:h(A),payload:{subscriptionId:u,scope:n}})}catch(p){throw fe.delete(u),oe||Y({...G,type:"shells-unsubscribe",id:h(A),payload:{subscriptionId:u}}),p}return()=>{!fe.delete(u)||oe||Y({...G,type:"shells-unsubscribe",id:h(A),payload:{subscriptionId:u}})}},Ve=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Ae(n.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&S?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let r=await K({...G,type:"storage",id:h(A),payload:n});if(!r||!("storage"in r)||r.op!==n.op)throw new E("HOST_REJECTED","Host did not return storage data.");return r},bo=(n,r)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-close",id:h(A),payload:r?{id:n,reason:r}:{id:n}}),xo=(n,r)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-anchor",id:h(A),payload:{id:n,active:r}});return t.addEventListener("keydown",Oo,!0),t.addEventListener("pointerover",$e),t.addEventListener("pointermove",$e),t.addEventListener("pointerout",go),t.addEventListener("focus",ko),t.addEventListener("blur",Ro),{onAction:n=>(_=n,()=>{_===n&&(_=null)}),listProjects:async()=>{let n=await dt({kind:"projects"});if(n.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let r=await dt({kind:"worktrees",projectId:n});if(r.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return r},listSessions:async n=>{let r=await dt({kind:"sessions",projectId:n});if(r.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return r},onProjects:n=>lt({kind:"projects"},r=>{r.kind==="projects"&&n(r)}),onWorktrees:(n,r)=>lt({kind:"worktrees",projectId:n},u=>{u.kind==="worktrees"&&r(u)}),onSessions:(n,r)=>lt({kind:"sessions",projectId:n},u=>{u.kind==="sessions"&&r(u)}),onRunningShells:(n,r)=>Qn(n,r),readShellOutput:async(n,r)=>{ne(n,128);let u=r?.cursor;if(u!==void 0&&(!Number.isInteger(u)||u<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let p=r?.tailBytes;if(p!==void 0&&(!Number.isInteger(p)||p<1||p>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let C=await K({...G,type:"shell-output",id:h(A),payload:{shellId:n,cursor:u,tailBytes:p}});if(!C||typeof C.output!="string"||!Number.isFinite(C.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return C},stopShell:async n=>{if(ne(n,128),(await K({...G,type:"shell-stop",id:h(A),payload:{shellId:n}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{ne(n),await $({...G,type:"open-session",id:h(A),payload:{sessionId:n}})},storage:{get:async(n,r)=>{let u=Ze(r),p={op:"get",key:n};u&&(p.scope=u);let v=await Ve(p);return v.op==="get"&&v.found?v.value:void 0},set:async(n,r,u)=>{let p=Ze(u),v={op:"set",key:n,value:r};p&&(v.scope=p),await Ve(v)},delete:async(n,r)=>{let u=Ze(r),p={op:"delete",key:n};u&&(p.scope=u),await Ve(p)},keys:async n=>{let r=Ze(n),u={op:"keys"};r&&(u.scope=r);let p=await Ve(u);if(p.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return p.keys}},onReady:n=>(i.add(n),S&&n(S),()=>{i.delete(n)}),onDirectory:n=>(c.add(n),S&&n(S.directory),()=>{c.delete(n)}),onSession:n=>(l.add(n),S&&n(S.session),()=>{l.delete(n)}),onSessionLifecycle:n=>(T.add(n),se&&n(se),()=>{T.delete(n)}),onConnection:n=>(I.add(n),S&&n(S.connection),()=>{I.delete(n)}),onSettings:n=>(M.add(n),S&&n(S.settings),()=>{M.delete(n)}),onItem:n=>(j.add(n),S&&n(S.item),()=>{j.delete(n)}),onBlock:n=>(W.add(n),S?.block&&n(S.block),()=>{W.delete(n)}),onServiceEvent:n=>(z.add(n),()=>{z.delete(n)}),onStatusControl:n=>(f.add(n),()=>{f.delete(n)}),onPopoverClosed:n=>(O.add(n),()=>{O.delete(n)}),setStatusControls:n=>S?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):Uo(n)?$({...G,type:"status-controls",id:h(A),payload:{controls:n}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>S?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):Tt(n)?$({...G,type:"popover-open",id:h(A),payload:n}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:bo,setPopoverAnchorActive:xo,onResolve:n=>(d=n,()=>{d===n&&(d=null)}),toast:n=>{let r=n.message.trim();return!r||r.length>Be?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${Be} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>Ke)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${Ke} characters.`)):$({channel:b,v:1,type:"toast",id:h(A),payload:{...n,message:r}})},openUrl:n=>$({channel:b,v:1,type:"open-url",id:h(A),payload:{url:n}}),openCommit:n=>Ot(n)?$({channel:b,v:1,type:"open-commit",id:h(A),payload:{sha:n}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>$({channel:b,v:1,type:"block-answer",id:h(A),payload:{text:n.trim().slice(0,mt)}}),openSurface:n=>$({channel:b,v:1,type:"open-surface",id:h(A),payload:{surfaceId:n}}),writeClipboard:n=>$({channel:b,v:1,type:"clipboard-write",id:h(A),payload:{text:n}}),compose:n=>$({channel:b,v:1,type:"compose",id:h(A),payload:n}),attach:n=>$({channel:b,v:1,type:"attach",id:h(A),payload:he(n)}),startSession:async n=>{n.projectId!==void 0&&ne(n.projectId);let r=n.worktree;r&&r!==!0&&(r.kind==="existing"?ne(r.directory):(r.name!==void 0&&ne(r.name,200),r.baseBranch!==void 0&&ne(r.baseBranch,200)));let u=await K({channel:b,v:1,type:"start-session",id:h(A),payload:bt(n)},e.requestTimeoutMs??18e4);if(!At(u))throw new E("HOST_REJECTED","Host did not return a session.");return u},prompt:n=>K({channel:b,v:1,type:"prompt",id:h(A),payload:xt(n)}).then(r=>{if(!ht(r))throw new E("HOST_REJECTED","Host did not return a prompt result.");return r}),sessionLink:n=>$({channel:b,v:1,type:"session-link",id:h(A),payload:he(n)}),close:()=>$({channel:b,v:1,type:"close",id:h(A)}),oauthStart:()=>$({channel:b,v:1,type:"oauth-start",id:h(A)}),oauthDisconnect:()=>$({channel:b,v:1,type:"oauth-disconnect",id:h(A)}),request:n=>(Ye(n.path)?K({channel:b,v:1,type:"request",id:h(A),payload:n}):sn()).then(r=>{if(!Je(r))throw new E("HOST_REJECTED","Host request result was empty.");return r}),serviceRequest:n=>(Ye(n.path)?K({channel:b,v:1,type:"service-request",id:h(A),payload:n}):sn()).then(r=>{if(!Je(r))throw new E("HOST_REJECTED","Host service request result was empty.");return r}),serviceStatus:()=>K({channel:b,v:1,type:"service-status",id:h(A)}).then(n=>{if(!vt(n))throw new E("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Oe(n)?K({channel:b,v:1,type:"file-read",id:h(A),payload:{path:n}}):Qe()).then(r=>{if(!Ct(r))throw new E("HOST_REJECTED","Host did not return file content.");return r}),writeFile:(n,r)=>Oe(n)?r.length>We?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${We} characters.`)):K({channel:b,v:1,type:"file-write",id:h(A),payload:{path:n,content:r}}).then(u=>{if(!Mt(u))throw new E("HOST_REJECTED","Host did not confirm the write.");return u}):Qe(),listDir:n=>(Oe(n)?K({channel:b,v:1,type:"file-list",id:h(A),payload:{path:n}}):Qe()).then(r=>{if(!Ut(r))throw new E("HOST_REJECTED","Host did not return directory entries.");return r}),stat:n=>(Oe(n)?K({channel:b,v:1,type:"file-stat",id:h(A),payload:{path:n}}):Qe()).then(r=>{if(!wt(r))throw new E("HOST_REJECTED","Host did not return file status.");return r}),generate:n=>{let r=n.prompt.trim(),u=n.system?.trim();if(r.length===0||r.length>ze)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${ze} characters.`));if(u!==void 0&&(u.length===0||u.length>qe))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${qe} characters.`));let p=n.maxOutputTokens===void 0?void 0:Math.min(kt,Math.max(1,Math.floor(n.maxOutputTokens)));if(p!==void 0&&!Number.isFinite(p))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let v={prompt:r};return u!==void 0&&(v.system=u),p!==void 0&&(v.maxOutputTokens=p),K({channel:b,v:1,type:"generate",id:h(A),payload:v},e.requestTimeoutMs??Rt).then(C=>{if(!Nt(C))throw new E("HOST_REJECTED","Host did not return generated text.");return C})},onLateGenerateResult:n=>{m.add(n);for(let r of V.splice(0))w([n],r);return fo(),()=>{m.delete(n)}},openMicrophone:Jn,setBadge:n=>$({channel:b,v:1,type:"badge",id:h(A),payload:{count:It(n)}}),setHeight:n=>$({channel:b,v:1,type:"resize",id:h(A),payload:{height:yt(n)}}),onFileOpen:n=>(g.add(n),y||(y=!0,t.addEventListener("keydown",ho,!0)),q&&n(q),()=>{g.delete(n)}),onFileSnapshot:n=>(U=n,()=>{U===n&&(U=null)}),onFileSaved:n=>(R.add(n),()=>{R.delete(n)}),reportFileChange:n=>at({...G,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Ao,reportFileUnsupported:()=>at({...G,type:"file-unsupported"}),dispose:()=>{for(let n of re.keys())Y({...G,type:"workspace-unsubscribe",id:h(A),payload:{subscriptionId:n}});re.clear();for(let n of fe.keys())Y({...G,type:"shells-unsubscribe",id:h(A),payload:{subscriptionId:n}});fe.clear(),Q&&(ct(),Q.release(),Q=null),oe=!0,d=null,_=null,U=null,g.clear(),R.clear(),y&&t.removeEventListener("keydown",ho,!0),t.removeEventListener("message",mo),t.removeEventListener("keydown",Oo,!0),t.removeEventListener("pointerover",$e),t.removeEventListener("pointermove",$e),t.removeEventListener("pointerout",go),t.removeEventListener("focus",ko),t.removeEventListener("blur",Ro);for(let n of P.values())clearTimeout(n.timer),n.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));P.clear(),i.clear(),c.clear(),l.clear(),T.clear(),I.clear(),M.clear(),j.clear(),W.clear(),z.clear(),f.clear(),O.clear(),m.clear(),V.length=0}}};var un=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Os=new Set(un);var lr=10*6e4;var pr=10*6e4;var ur=10*6e4;var Er=10*6e4;var En=["none","agent","user"];var ks=new Set(En);var _r=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Sr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],_n=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,s]of _r)t.style.setProperty(o,e.tokens[s]);for(let[o,s,i]of Sr){let c=e.tokens[i]??"";t.style.setProperty(o,c),t.style.setProperty(s,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},$t=(e,t)=>{_n(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Tr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},L=(e,t)=>`var(--${e}, var(--oc-${Tr[e]}, ${t}))`,ae=L("surface-background","transparent"),tt=L("surface-elevated","transparent"),ge=L("surface-elevated-foreground","inherit"),Z=L("surface-foreground","inherit"),H=L("surface-muted-foreground","gray"),fr=L("surface-muted","transparent"),ue=L("interactive-border","currentColor"),J=L("interactive-hover","transparent"),Ee=L("interactive-active","transparent"),Vt=L("interactive-selection","transparent"),Ft=L("interactive-selection-foreground","inherit"),ie=L("primary","currentColor"),Bt=L("primary-text","inherit"),Kt=L("error-text","inherit"),mr=L("font-sans","inherit"),jt=L("font-mono","monospace"),mn=L("radius","9px"),Wt=`calc(${mn} - 2px)`,Sn=`calc(${mn} - 4px)`,X=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Tn=`background-image: linear-gradient(${J}, ${J});`,zt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,qt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",fn="box-shadow: var(--oc-sdk-lit);",Yt=`inset 0 0.5px 0 0 ${X(Z,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Ar=`
:root {
  --oc-sdk-edge: ${X(Z,16)};
  --oc-sdk-field-bg: ${tt};
  --oc-sdk-raised-bg: ${ae};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(Z,14)};
  --oc-sdk-field-bg: ${X(ae,50,tt)};
  --oc-sdk-raised-bg: ${tt};
  --oc-sdk-field-lift: ${Yt};
  --oc-sdk-raised-lift: ${Yt};
  --oc-sdk-lit: ${Yt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,et=e=>{let t=L(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${L(`${e}-text`,"inherit")}; }`},a=e=>`calc(${e}rem / 14)`,hr=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: ${a(8)}; height: ${a(32)}; padding: 0 ${a(12)}; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: ${a(6)}; height: ${a(28)}; padding: 0 ${a(10)}; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: ${a(4)}; height: ${a(24)}; padding: 0 ${a(8)}; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: ${a(14)}; height: ${a(14)}; }

.oc-sdk-field { display: flex; flex-direction: column; gap: ${a(4)}; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: ${a(32)}; padding: 0 ${a(10)}; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: ${a(8)} ${a(10)}; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: ${a(34)}; padding-right: ${a(34)}; }
.oc-sdk-search-icon { position: absolute; left: ${a(11)}; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: ${a(6)}; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: ${a(24)}; height: ${a(24)}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: ${a(4)}; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: ${a(6)}; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: ${a(28)}; padding: 0 ${a(10)}; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: ${a(2)}; min-width: ${a(160)}; max-width: calc(100vw - ${a(16)}); max-height: min(${a(320)}, calc(100vh - ${a(16)})); overflow: auto; padding: ${a(4)}; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: ${a(2)} ${a(2)} ${a(4)}; }
.oc-sdk-popup-search .oc-sdk-input { height: ${a(28)}; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: ${a(8)}; width: 100%; padding: ${a(6)} ${a(8)}; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: ${a(14)}; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: ${a(8)}; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: ${a(8)}; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: ${a(14)}; height: ${a(14)}; margin-top: ${a(3)}; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: ${a(36)}; height: ${a(20)}; --oc-sdk-thumb-travel: ${a(16)}; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: ${a(2)}; left: ${a(2)}; width: ${a(16)}; height: ${a(16)}; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: ${a(2)}; padding: ${a(2)}; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: ${a(6)}; height: ${a(28)}; padding: 0 ${a(10)}; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: ${a(1)} ${a(6)}; font-size: ${a(11)}; font-weight: 500; line-height: ${a(16)}; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: ${a(8)}; width: 100%; padding: ${a(6)} ${a(8)}; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: ${a(64)}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: ${a(16)} ${a(8)}; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${a(4)}; padding: ${a(40)} ${a(16)}; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: ${a(12)}; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: ${a(8)}; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: ${a(16)}; height: ${a(16)}; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: ${a(12)}; height: ${a(12)}; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: ${a(12)}; padding: ${a(8)} ${a(12)}; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: ${a(2)}; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: ${a(8)}; width: 100%; margin: ${a(8)} 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: ${a(4)} 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: ${a(4)}; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: ${a(6)}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: ${a(2)}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: ${a(8)} 0; }

/* Under a finger the controls reach the app's touch sizes: rows and options 44px like its sheets, every other
   control at least 36px. Inputs keep 16px text, below which iOS zooms the page on focus. */
@media (pointer: coarse) {
  .oc-sdk-btn, .oc-sdk-input { height: ${a(40)}; }
  .oc-sdk-btn[data-size="sm"], .oc-sdk-btn[data-size="xs"], .oc-sdk-trigger, .oc-sdk-tab, .oc-sdk-popup-search .oc-sdk-input { height: ${a(36)}; }
  .oc-sdk-input, .oc-sdk-popup-search .oc-sdk-input { font-size: max(16px, 0.875rem); }
  .oc-sdk-search-clear { width: ${a(36)}; height: ${a(36)}; right: 0; }
  .oc-sdk-row, .oc-sdk-option { min-height: ${a(44)}; }
  .oc-sdk-check { min-height: ${a(36)}; padding: ${a(8)} 0; }
}
`,An=`${Ar}
.oc-sdk { color: ${Z}; font-family: ${mr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Tn} }
.oc-sdk-mono { font-family: ${jt}; }
.oc-sdk-muted { color: ${H}; }
${et("success")}${et("warning")}${et("error")}${et("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ie}; --oc-sdk-tone-text: ${Bt}; }

.oc-sdk-btn { border-radius: ${Wt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Sn}; }
.oc-sdk-btn[data-variant="default"] { color: ${Bt}; background: ${X(ie,10,ae)}; border-color: ${X(ie,12)}; ${fn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(ie,16,ae)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(ie,22,ae)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${fr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Ee}, ${Ee}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ge}; ${qt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Ee}, ${Ee}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${J}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Ee}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${L("status-error","red")}; color: ${Kt}; background: ${X("var(--oc-sdk-tone)",7,ae)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${fn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,ae)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,ae)}; box-shadow: none; }

.oc-sdk-field-note { color: ${H}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Kt}; }
.oc-sdk-input { border-radius: ${Wt}; background: var(--oc-sdk-field-bg); color: ${ge}; ${zt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${H}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${zt(X(Z,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${zt(L("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${jt}; }

.oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ie}; }
.oc-sdk-search-clear { border-radius: ${Sn}; color: ${H}; }
.oc-sdk-search-clear:hover { background: ${J}; color: ${Z}; }

.oc-sdk-trigger { border-radius: ${Wt}; background: var(--oc-sdk-raised-bg); color: ${ge}; ${qt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Ee}, ${Ee}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${H}; }
.oc-sdk-trigger-chevron { color: ${H}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ge}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${tt}; background-clip: padding-box; color: ${ge}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${J}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Vt}; color: ${Ft}; }
.oc-sdk-option-check { color: ${Z}; }
.oc-sdk-option[data-destructive="true"] { color: ${Kt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(L("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${H}; }
.oc-sdk-popup-empty { color: ${H}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${ue}; border-radius: 4px; color: ${Z}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(Z,60,ue)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${ue}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${ae}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ie}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Tn} }
.oc-sdk-check-desc { color: ${H}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(Z,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${H}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${Z}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Ft}; background: ${Vt}; border-color: ${ue}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ge}; background: var(--oc-sdk-raised-bg); ${qt} }
.oc-sdk-tab-count { color: ${H}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(Z,6)}; color: ${H}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${J}; }
.oc-sdk-row[aria-selected="true"] { background: ${Vt}; color: ${Ft}; }
.oc-sdk-row-lead { font-family: ${jt}; color: ${H}; }
.oc-sdk-row-sub { color: ${H}; }
.oc-sdk-row-meta { color: ${H}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${H}; }

.oc-sdk-empty-body { color: ${H}; }

.oc-sdk-spinner { color: ${H}; }
.oc-sdk-spinner-ring { border-color: ${ue}; border-top-color: ${ie}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${H}; }

.oc-sdk-separator { color: ${H}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X(ue,40)}; }

.oc-sdk-progress-label { color: ${H}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(Z,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ie}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${L("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${L("success-text","inherit")}; }

.oc-sdk-text a { color: ${Bt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(ue,60)}; }
`,F=`
${pt}
${hr}
${An}`;var hn="oc-sdk-ui-style",ke=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},B=e=>{let t=document.getElementById(hn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}ut(document);let o=document.createElement("style");o.id=hn,o.textContent=e,document.head.appendChild(o)},D=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},ce=e=>{let t=D("button",e);return t.type="button",t},te=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},de=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},On=(e,t)=>{let o=s=>{s.target instanceof Node&&e.contains(s.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Or=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ue=(e,t)=>{B(F);let o=t,s=ce("oc-sdk oc-sdk-btn"),i=Or(),c=document.createElement("span");s.append(c),e.append(s);let l=()=>{s.dataset.variant=o.variant??"default",s.dataset.size=o.size??"default",s.disabled=!!o.disabled||!!o.loading,s.dataset.loading=o.loading?"true":"false",s.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==s?s.prepend(i):!o.loading&&i.parentNode===s&&i.remove(),te(c,o.label)},T=()=>{o.disabled||o.loading||o.onClick()};return s.addEventListener("click",T),l(),{update:I=>{o={...o,...I},l()},dispose:()=>{s.removeEventListener("click",T),s.remove()}}};var gn="http://www.w3.org/2000/svg",gr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Re=(e,t,o)=>{let s=document.createElementNS(gn,"svg");s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("width",String(t)),s.setAttribute("height",String(t)),s.style.width=a(t),s.style.height=a(t),s.setAttribute("aria-hidden","true"),s.setAttribute("fill","currentColor"),o&&s.setAttribute("class",o);let i=document.createElementNS(gn,"path");return i.setAttribute("d",gr[e]),s.append(i),s};var be=(e,t="vertical")=>{let[o,s]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===s||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},xe=(e,t,o)=>{let s=e.filter(I=>!I.disabled);if(s.length===0)return null;let i=s[0],c=s[s.length-1];if(o==="first"||!i||!c)return i?.id??null;if(o==="last")return c.id;let l=s.findIndex(I=>I.id===t);return l===-1?o==="next"?i.id:c.id:s[Math.min(s.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var kn=(e,t)=>`${e}-${t??""}`,Jt=(e,t,o,s)=>{let i=ce("oc-sdk-option");i.id=kn(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let c=D("span","oc-sdk-option-label");if(c.textContent=o.label,i.append(c),o.hint){let l=D("span","oc-sdk-option-hint");l.textContent=o.hint,i.append(l)}if(t==="option"){i.dataset.mark="check";let l=D("span","oc-sdk-option-check");l.append(Re("check",14)),i.append(l)}return i.addEventListener("pointerenter",s.hover),i.addEventListener("click",s.pick),i},Qt=(e,t,o,s)=>{let i=kn(o,s);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===i?"true":"false");de(t,"aria-activedescendant",s?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var kr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let s=e.offsetHeight,i=window.innerHeight-o.bottom-8;s>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-s))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},Zt=(e,t,o,s)=>{e.append(o),kr(o,t);let i=On(e,s),c=()=>{s()},l=T=>{T.target instanceof Node&&o.contains(T.target)||s()};return window.addEventListener("resize",c),window.addEventListener("scroll",l,!0),()=>{i(),window.removeEventListener("resize",c),window.removeEventListener("scroll",l,!0),o.remove()}};var eo=(e,t)=>{de(e,"data-tone",t&&t!=="neutral"?t:null)},to=(e,t)=>{B(F);let o=t,s=D("span","oc-sdk oc-sdk-badge");e.append(s);let i=()=>{te(s,o.label),eo(s,o.tone)};return i(),{update:c=>{o={...o,...c},i()},dispose:()=>{s.remove()}}};var Rn=e=>e.filter(t=>!("separator"in t)),Rr=0,oo=(e,t)=>{B(F);let o=t,s=`oc-sdk-menu-${Rr+=1}`,i=D("div","oc-sdk oc-sdk-menu");e.append(i);let c=D("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let l=null,T=null,I=Ue(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{l?z():f()}}),M=i.querySelector("button");M?.setAttribute("aria-haspopup","menu");let j=d=>{T=d,Qt(c,c,s,d)},W=()=>{ke(c);for(let d of o.items){if("separator"in d){let _=D("div","oc-sdk-separator");_.dataset.labeled="false",c.append(_);continue}c.append(Jt(s,"menuitem",d,{hover:()=>j(d.id),pick:()=>O(d.id)}))}j(Rn(o.items).some(d=>d.id===T)?T:null)},z=()=>{let d=l;l=null,d?.(),T=null,M?.setAttribute("aria-expanded","false")},f=()=>{l||!M||(W(),l=Zt(i,M,c,z),M.setAttribute("aria-expanded","true"),c.focus())},O=d=>{z(),M?.focus(),o.onSelect(d)},m=d=>{let _=be(d);_?(d.preventDefault(),j(xe(Rn(o.items),T,_))):d.key==="Enter"||d.key===" "?(d.preventDefault(),T&&O(T)):d.key==="Escape"&&(d.preventDefault(),z(),M?.focus())},V=d=>{l&&!(d.relatedTarget instanceof Node&&i.contains(d.relatedTarget))&&z()};return c.addEventListener("keydown",m),i.addEventListener("focusout",V),{update:d=>{o={...o,...d},I.update({label:o.label,variant:o.variant,size:o.size}),l&&W()},dispose:()=>{z(),c.removeEventListener("keydown",m),i.removeEventListener("focusout",V),I.dispose(),i.remove()}}};var le=["backlog","todo","in_progress","review","done"],Ne={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},bn=1,xn=200,In=16e3;var br=512,xr=/^t_[a-z0-9]{6,40}$/,Ir=e=>typeof e=="string"&&le.includes(e);var we=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>br)throw new Error(`${t} is too long`);return o},yr=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>xn)throw new Error(`Title is limited to ${xn} characters`);return t},vr=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>In)throw new Error(`Description is limited to ${In} characters`);return e};var Cr=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=we(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:we(t.branch,"worktree.branch")}},no=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},Mr=(e,t)=>e==null?null:no(e,t);var yn=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==bn)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!xr.test(t.id))throw new Error("Task id is invalid");if(!Ir(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:bn,id:t.id,title:yr(t.title),description:vr(t.description),status:t.status,rank:t.rank,projectId:we(t.projectId,"projectId"),sourceBranch:we(t.sourceBranch,"sourceBranch"),worktree:Cr(t.worktree),sessionId:we(t.sessionId,"sessionId"),createdAt:no(t.createdAt,"createdAt"),updatedAt:no(t.updatedAt,"updatedAt"),needsAttentionSince:Mr(t.needsAttentionSince,"needsAttentionSince")}};var Cn="task:",vn=16,Ur=e=>`${Cn}${e}`,ro=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Cn)),o=[],s=[];for(let i=0;i<t.length;i+=vn)await Promise.all(t.slice(i,i+vn).map(async c=>{try{let l=yn(await e.storage.get(c));if(Ur(l.id)!==c)throw new Error("Task id does not match its key");o.push(l)}catch{s.push(c)}}));return{tasks:o,failedKeys:s}};var ot="__all__",Mn="__none__";var so=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),nt=(e,t)=>{if(t.projectId===Mn&&e.projectId!==null||t.projectId!==ot&&t.projectId!==Mn&&e.projectId!==t.projectId)return!1;let o=t.query.trim().toLowerCase();return o?`${e.title}
${e.description}
${e.sourceBranch??""}
${e.sessionId??""}`.toLowerCase().includes(o):!0};var _e={waitingPermissionMeansReview:!0,failedMeansReview:!0},rt=(e,t,o,s=_e)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",c=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return c();case"waiting-question":return i();case"waiting-permission":return s.waitingPermissionMeansReview?i():null;case"idle":return o==="completed"||o==="failed"&&s.failedMeansReview?i():null;default:return null}};var Un=10*6e4,wr=60,Nr=(e,t,o=_e)=>t?rt(e.status,t.activity,t.outcome,o)??e.status:e.status,Lr=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,wn=(e,t)=>e.needsAttentionSince??t.updatedAt,Nn=(e,t,o,s=Un)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-wn(e,t)<s?null:e.needsAttentionSince!==null?"hint":"quiet",Pr=(e,t,o,s=Un)=>{if(!t||Nn(e,t,o,s)===null)return null;let i=Math.floor((o-wn(e,t))/6e4);return i>0&&i<wr?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var Dr=(e,t,o=_e,s=Date.now())=>{let i=Lr(e,t),c=Nr(e,i,o),l=c!==e.status,T=e.needsAttentionSince!==null||l&&c==="review",I=Nn(e,i,s);return{task:e,displayStatus:c,movedByAgent:l,attention:T,attentionSince:e.needsAttentionSince??(T&&i?i.updatedAt:null),live:i,looksDone:I,looksDoneNote:I?Pr(e,i,s):null}},Gr=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||so(e.task,t.task),Ln=(e,t,o,s=_e,i=Date.now())=>{let c=Object.fromEntries(le.map(l=>[l,[]]));for(let l of e){if(!nt(l,o))continue;let T=Dr(l,t,s,i);c[T.displayStatus].push(T)}for(let l of le)c[l].sort((T,I)=>l==="review"?Gr(T,I):so(T.task,I.task));return c},Pn=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.attention&&s.displayStatus!=="done").length,0),Dn=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.displayStatus!=="done").length,0),Gn=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},Hn=e=>{switch(e.activity){case"running":return{text:"running",tone:"running"};case"retrying":return{text:"retrying",tone:"running"};case"waiting-question":return{text:"needs your answer",tone:"waiting"};case"waiting-permission":return{text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{text:"finished",tone:"idle"}:e.outcome==="failed"?{text:"failed",tone:"failed"}:{text:"idle",tone:"idle"};default:return null}};var Xn=(e,t,o)=>{let s=o.sessions.find(i=>i.id===e);if(s)return s.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(c=>c.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var $n=(e,t,o,s,i={})=>{let c=i.onLiveChange,l=i.onSnapshot??(()=>{}),T=new Map,I=new Map,M=new Map,j=new Map,W=!1,z=(d,_)=>{if(_.state==="loading")return!1;let g=0;for(let[R,U]of M)U.projectId===d&&(M.delete(R),g+=1);if(_.state!=="ready")return g>0;for(let R of _.sessions)R.parentId===null&&M.set(R.id,{projectId:d,activity:R.activity,outcome:R.outcome,updatedAt:R.updatedAt});return!0},f=(d,_)=>{if(W)return;z(d,_)&&c&&c(),l();for(let R of _.sessions)j.set(R.id,R.directory);if(o)for(let R of I.values()){if(R.projectId!==d||!R.sessionId)continue;let U=Xn(R.sessionId,j.get(R.sessionId)??null,_);if(s&&(U==="deleted"||U==="archived")){s(R.id,R.sessionId,U);continue}let q=_.sessions.find(P=>P.id===R.sessionId);if(!q)continue;let y=rt(R.status,q.activity,q.outcome,t);y&&o(R.id,y)}},O=d=>{let _=e.onSessions(d,g=>f(d,g));T.set(d,_),_.then(g=>{(W||!T.has(d))&&g()},()=>{})};return{live:()=>M,sync:d=>{if(W)return;I=new Map(d.map(g=>[g.id,g]));let _=new Set(d.filter(g=>g.sessionId&&g.projectId).map(g=>g.projectId));for(let g of _)T.has(g)||O(g);for(let[g,R]of T)if(!_.has(g)){T.delete(g);for(let[U,q]of M)q.projectId===g&&M.delete(U);R.then(U=>U(),()=>{})}},dispose:()=>{W=!0;for(let d of T.values())d.then(_=>_(),()=>{});T.clear()}}};var Vn=(e,t)=>{if(!t)return null;let o=e.find(s=>s.directory===t);return o||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,i)=>i.directory.length-s.directory.length)[0]??null)},io=e=>{if(e instanceof E)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var Fn=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var k=(e,t="",o="")=>{let s=document.createElement(e);return t&&(s.className=t),o&&(s.textContent=o),s};var Bn="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",Hr="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",Xr=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},ao=(e,t,o,s={})=>{let i=k("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),s.primary&&(i.dataset.primary="true"),s.hint&&(i.dataset.hint="true"),s.quiet&&(i.dataset.quiet="true"),i.append(Xr(e)),i.addEventListener("click",c=>{c.stopPropagation(),o()}),i},$r=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...le.filter(s=>s!==e.displayStatus).map(s=>({id:`move:${s}`,label:`Move to ${Ne[s]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},Kn=(e,t,o)=>{let s=t==="rail",i=k("div",s?"kb-panel-sections":"kb-columns");e.append(i);let c=[],l=null,T=(f,O)=>[...f.querySelectorAll(".kb-draggable-item")].filter(m=>m.dataset.id!==O).map(m=>({id:m.dataset.id??"",top:m.getBoundingClientRect().top,height:m.getBoundingClientRect().height})),I=(f,O,m,V)=>{f.addEventListener("dragover",d=>{l&&(d.preventDefault(),f.classList.add("kb-dragover"))}),f.addEventListener("dragleave",d=>{d.target===f&&f.classList.remove("kb-dragover")}),f.addEventListener("drop",d=>{d.preventDefault(),f.classList.remove("kb-dragover");let _=l??d.dataTransfer?.getData("text/plain")??null;if(l=null,!_)return;if(s&&d.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(_,m);return}let g=Fn(T(O,_),d.clientY);V(_,m,g)})},M=f=>{let{task:O}=f,m=k("div",f.attention?"kb-item kb-attn":"kb-item");s?m.classList.add("kb-panel-row"):m.classList.add("kb-card");let V=o.onDrop!==void 0;V?(m.classList.add("kb-draggable-item"),m.draggable=!0):m.draggable=!1,m.dataset.id=O.id;let d=k("div","kb-panel-main");m.append(d);let _=k("div","kb-item-top");_.append(k("div","kb-panel-title",O.title)),d.append(_);let g=o.projectName(O),R=k("div","kb-panel-sub");g&&R.append(k("span","kb-panel-project",g));let U=f.live?Hn(f.live):O.sessionId?{text:"chat linked",tone:"idle"}:null;if(U){g&&R.append(k("span","kb-panel-sep","\xB7"));let y=k("span","kb-panel-dot");y.dataset.state=U.tone,R.append(y,k("span","kb-panel-live",U.text))}if(d.append(R),s&&f.attention){let y=k("div","kb-panel-actions");if(O.sessionId&&o.onOpenChat){let P=o.onOpenChat;y.append(ao(Hr,"Open chat",()=>P(O),{primary:!0}))}if(f.displayStatus!=="done"&&o.onMarkDone){let P=o.onMarkDone;y.append(ao(Bn,"Mark done",()=>P(O)))}y.childElementCount>0&&d.append(y)}if(s&&f.looksDone){let y=k("span","kb-panel-chip","\u2713 looks done");y.dataset.ok="true",m.append(y)}else f.movedByAgent&&m.append(k("span","kb-panel-chip",`\u2192 ${Ne[f.displayStatus]}`));let q=$r(f,o);if(!s&&f.looksDone&&o.onLooksDone){let y=o.onLooksDone;_.append(ao(Bn,f.looksDoneNote??"Looks done \u2014 click to mark Done",()=>y(O),f.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(q){let y=k("span","kb-panel-menu");_.append(y),c.push(oo(y,{label:"\u22EF",variant:"ghost",size:"xs",items:q,onSelect:P=>{if(P==="delete"&&o.onDelete){o.onDelete(O);return}if(P==="edit"&&o.onEdit){o.onEdit(O);return}if(P.startsWith("move:")){let re=P.slice(5);le.includes(re)&&o.onMoveStatus&&o.onMoveStatus(O,re)}}}))}if(o.onActivate){let y=()=>o.onActivate(O);m.addEventListener("click",P=>{P.target?.closest(".kb-panel-menu")||y()}),m.tabIndex=0,m.addEventListener("keydown",P=>{(P.key==="Enter"||P.key===" ")&&(P.preventDefault(),y())})}return V&&(m.addEventListener("dragstart",y=>{l=O.id,m.classList.add("kb-dragging"),y.dataTransfer?.setData("text/plain",O.id),y.dataTransfer&&(y.dataTransfer.effectAllowed="move")}),m.addEventListener("dragend",()=>{l=null,m.classList.remove("kb-dragging")})),m},j=(f,O)=>{let m=k("div","kb-column");m.dataset.status=f;let V=k("div","kb-column-head");V.append(k("span","kb-column-title",Ne[f]));let d=k("span","kb-column-count",String(O.length));O.some(g=>g.attention&&g.displayStatus!=="done")&&(d.dataset.attn="true"),V.append(d);let _=k("div","kb-column-body");m.append(V,_),O.length===0&&_.append(k("div","kb-column-empty","No tasks"));for(let g of O)_.append(M(g));return o.onDrop&&I(m,_,f,o.onDrop),m},W=(f,O)=>{let m=k("div","kb-psec"),V=o.onToggleSection!==void 0,d=V&&(o.isCollapsed?.(f)??!1),_=V?document.createElement("button"):k("div","kb-psec-head");_.className="kb-psec-head",_ instanceof HTMLButtonElement&&(_.type="button"),_.append(k("span","kb-psec-name",Ne[f]));let g=k("span","kb-psec-count","0");O.some(U=>U.attention&&U.displayStatus!=="done")&&(g.dataset.attn="true"),_.append(g),V&&(_.append(k("span","kb-psec-chevron",d?"\u25B8":"\u25BE")),_.addEventListener("click",()=>o.onToggleSection?.(f)));let R=k("div","kb-psec-body");if(R.hidden=d,m.append(_,R),!d){O.length===0&&R.append(k("div","kb-panel-empty","No tasks"));for(let U of O)R.append(M(U))}return o.onDrop&&I(m,R,f,o.onDrop),m};return{render:f=>{for(let O of c.splice(0))O.dispose();i.replaceChildren();for(let O of le)i.append(s?W(O,f[O]):j(O,f[O]))},dispose:()=>{for(let f of c.splice(0))f.dispose();i.replaceChildren()}}};var Vr=`
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
.kb-card:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-card.kb-dragging{opacity:.4}
.kb-card.kb-attn{border-color:var(--oc-warning);border-left-width:3px}
.kb-card.kb-attn:hover{border-color:var(--oc-warning)}
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
.kb-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.kb-dialog-grid .kb-span2{grid-column:1/-1}
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
/* The section heads are plain labels \u2014 the display-only mirror has no fold, no menu, no drop targets. */
.kb-psec-head{display:flex;align-items:center;gap:8px;width:100%;padding:9px 2px}
.kb-psec-name{flex:1;min-width:0;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--oc-muted)}
.kb-psec-count{font:11px var(--oc-mono);color:var(--oc-muted);background:var(--oc-muted-surface);padding:2px 7px;border-radius:9999px}
.kb-psec-count[data-attn]{color:var(--oc-warning,#e5a234);background:color-mix(in srgb,var(--oc-warning,#e5a234) 14%,transparent)}
.kb-psec-body{display:flex;flex-direction:column;gap:6px;padding:2px 0 10px}
/* Display-only rows: the same look the page's cards read well in, minus every interaction affordance. */
.kb-panel-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:8px}
.kb-panel-row.kb-attn{border-color:var(--oc-warning,#e5a234);border-left-width:3px}
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
  /* Touch has no hover: a muted \u2713 is a button always, not only on reveal. */
  .kb-card .kb-iconbtn[data-quiet="true"]{opacity:1}
}
/* Small square icon buttons \u2014 the \u2713 beside the \u22EF menu on page cards and the
   rail attention actions \u2014 reusing the dictation panel's icon-button idiom.
   A hint \u2713 (data-hint) is success-tinted and always visible: it IS the
   suggestion. A quiet \u2713 (data-quiet) is muted and revealed on hover/focus,
   the same reveal rule as the \u22EF menu, sinking under it as the smaller
   affordance. */
.kb-iconbtn{width:22px;height:22px;padding:0;display:inline-flex;align-items:center;justify-content:center;background:transparent;color:var(--oc-muted);border:1px solid var(--oc-border);border-radius:calc(var(--oc-radius,10px) - 4px);cursor:pointer;flex:none}
.kb-iconbtn svg{width:12px;height:12px;display:block}
.kb-iconbtn:hover{color:var(--oc-fg);background:var(--oc-hover)}
.kb-iconbtn:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-iconbtn[data-hint="true"]{color:var(--oc-success,var(--status-success,#46a758));border-color:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 38%,transparent)}
.kb-iconbtn[data-hint="true"]:hover{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 12%,transparent)}
.kb-iconbtn[data-primary="true"]{background:var(--oc-primary);border-color:transparent;color:var(--oc-primary-fg,#fff)}
.kb-iconbtn[data-primary="true"]:hover{color:var(--oc-primary-fg,#fff)}
.kb-card .kb-iconbtn[data-quiet="true"]{opacity:0;transition:opacity 120ms ease-out}
.kb-card:hover .kb-iconbtn[data-quiet="true"],.kb-card:focus-within .kb-iconbtn[data-quiet="true"]{opacity:1}
.kb-panel-actions{display:flex;gap:6px;align-items:center;flex:none}
/* Rail rows carry the same buttons at the 26px touch size. */
.kb-panel-row .kb-iconbtn{width:26px;height:26px}
.kb-panel-row .kb-iconbtn svg{width:13px;height:13px}
/* The rail's looks-done chip speaks success, unlike the warning \u2192 Review chip. */
.kb-panel-chip[data-ok]{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 13%,transparent)}
[hidden]{display:none!important}
`,jn=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=Vr,document.head.append(e)};var Se=Xt(),lo=document.querySelector("#root");if(!lo)throw new Error("Missing #root");var st=!1,pe=!1,Ge=[],po=[],uo=null,Ie=null,Eo,Le,co=!1,Te=!1,_o=null,zn,ye,Pe,De,Fr=(e,t)=>e.filter(o=>nt(o,{projectId:t??ot,query:""})),it=e=>{Ge=[...e],qn.sync(Fr(Ge,Ie?.id??null))},qn=$n(Se,_e,null,void 0,{onLiveChange:()=>{Te&&!pe&&He()},onSnapshot:()=>{Kr()}}),Wn=()=>{Ie=Vn(po,uo)};Se.onReady(e=>{if(st)return;st=!0,$t(e,document.documentElement),uo=e.directory,jn(),lo.replaceChildren();let t=k("div","kb-page kb-rail"),o=k("div","kb-row between");o.append(k("h2","","Kanban"));let s=k("span");o.append(s),t.append(o),ye=k("p","kb-muted","Loading\u2026"),t.append(ye),Pe=k("p","kb-rail-scope"),t.append(Pe),De=k("p","kb-panel-unseen"),t.append(De),_o=Kn(t,"rail",{projectName:c=>!Ie&&c.projectId?po.find(l=>l.id===c.projectId)?.name??null:null});let i=k("div","kb-rail-foot");i.append(k("p","kb-muted","Tracking only \u2014 the full board (Extension pages menu) is where tasks are opened and changed.")),t.append(i),lo.append(t),zn=to(s,{label:"",tone:"neutral"}),Eo=window.setInterval(()=>{Yn()},3e4),Se.onProjects(c=>{pe||c.state!=="ready"||(po=c.projects,Wn(),it(Ge),Te&&He())}).then(()=>{},()=>{}),Se.onDirectory(c=>{pe||(uo=c,Wn(),it(Ge),Te&&He())}),Br()});var Br=async()=>{try{let e=await ro(Se);if(pe)return;it(e.tasks),Te=!0,ye.hidden=!0,He()}catch(e){ye.textContent=`Could not load tasks \u2014 ${io(e)}`}},Yn=async()=>{if(!(!st||pe||co)){co=!0;try{let{tasks:e}=await ro(Se);if(pe)return;it(e),Te||(Te=!0,ye.hidden=!0),He()}catch(e){Te||(ye.textContent=`Could not load tasks \u2014 ${io(e)}`)}finally{co=!1}}},Kr=()=>{Le!==void 0||pe||!st||(Le=window.setTimeout(()=>{Le=void 0,Yn()},500))},He=()=>{let e=Ln(Ge,qn.live(),{projectId:Ie?.id??ot,query:""}),t=Dn(e),o=Pn(e);Ie?(Pe.textContent=`Project: ${Ie.name}`,Pe.hidden=!1):Pe.hidden=!0;let s=Gn(t,o);zn.update({label:s.label,tone:s.tone}),o>0?(De.textContent=`${o} task${o===1?"":"s"} need${o===1?"s":""} your review`,De.hidden=!1):De.hidden=!0,_o?.render(e)};window.addEventListener("pagehide",()=>{pe=!0,Eo!==void 0&&window.clearInterval(Eo),Le!==void 0&&window.clearTimeout(Le),_o?.dispose(),Se.dispose()});})();
