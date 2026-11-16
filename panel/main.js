"use strict";(()=>{var R="openchamber.sdk";var Fe="data-oc-scrolling",Et=`
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
`;function _t(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?t:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let c=o.get(i);c!==void 0&&clearTimeout(c),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Er=`(${_t.toString()})(document);`;var wo=e=>{let t=[],o=0,s=0;return{push:i=>{for(t.push(i),s+=i.length;s-o>e&&t.length>1;){let c=t.shift();s-=c?.length??0,o=0}},pull:i=>{let c=0;for(;c<i.length&&t.length>0;){let l=t[0],_=Math.min(i.length-c,l.length-o);i.set(l.subarray(o,o+_),c),c+=_,o+=_,o>=l.length&&(t.shift(),s-=l.length,o=0)}i.fill(0,c)},clear:()=>{t.length=0,o=0,s=0},get size(){return s-o}}};var Po=/^[a-z][a-z0-9-]{0,39}$/;var Uo=e=>Object(e)===e&&!Array.isArray(e),St=(e,t)=>Object.keys(e).every(o=>t.includes(o)),No=e=>String(e)===e&&e.length>=1&&e.length<=60,Lo=e=>String(e)===e&&e.length>=1&&e.length<=80,Do=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Uo(o)||!Po.test(o.id)||!No(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!St(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!St(o,["kind","id","label","value","options","disabled"])||!Lo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let s=new Set;for(let i of o.options){if(!Uo(i)||!St(i,["value","label"])||!Lo(i.value)||!No(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(o.value))return!1}return!0};var Sr=1024*1024;var Go=["{id}","{segment}","{segments+}"];var _s=new Set(Go);var Ho=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Ts=new Set(Ho);var Tt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Xo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var $o=/^[A-Za-z0-9_-]{1,80}$/;var Vo=["left","right","top","bottom"];var Bo=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!Bo(i,t+1,o))return!1;return!0},ft=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(ft);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(ft)}return String(e)===e||Number.isFinite(e)},mt=e=>{try{return String(e.id)!==e.id||!$o.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Vo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Bo(e.data)||!ft(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var gt=2e3;var Ko=["file","directory","other","missing"],At=e=>!!(e&&"sessionId"in e),bt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var jo=/^[0-9a-f]{7,64}$/i,kt=e=>jo.test(e),Ke=500,je=32e3,Wo=16e3,zo=128,qo=200,Yo=2e3,Jo=16e3,Qo=80,Zo=200,en=16e3;var tn=2e3;var xt=2e4,We=1024,ze=2e6;var qe=64e3,Ye=8e3,Ot=4e3;var Rt=96e4,Tr=60*6e4;var on=999,nn=1e4,Ne=500,rn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],sn=["stopped","starting","ready","failed"],fr=new Set(rn),an=e=>fr.has(e),cn=e=>e&&an(e)?e:"HOST_REJECTED",Ae=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ae):Object(e)===e?Object.values(e).every(Ae):!1,dn=e=>Ae(e)&&JSON.stringify(e).length<=en,Fo=e=>e?.trim().slice(0,Zo)??"",be=e=>{let t=e.id.trim().slice(0,zo),o=e.title.trim().slice(0,qo),s=e.url.trim().slice(0,Yo),i=e.text?.trim().slice(0,Jo),c=e.author?.trim().slice(0,Qo),l=e.kind==="pull"?"pull":"issue",_={providerId:e.providerId.trim(),id:t,title:o||t,url:s,kind:l};if(i&&(_.text=i),c&&(_.author=c),l==="pull"){let O=Fo(e.branches?.head),M=Fo(e.branches?.base);O&&M&&(_.branches={head:O,base:M})}return dn(e.data)&&(_.data=e.data),_},yt=e=>{let t=be(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},It=e=>{let t={text:e.text.trim().slice(0,Wo)};return e.send&&(t.send=!0),t},vt=e=>e===null||!Number.isFinite(e)?null:Math.min(on,Math.max(0,Math.round(e))),Mt=e=>Number.isFinite(e)?Math.min(nn,Math.max(0,Math.ceil(e))):0;var ke=e=>e.length>0&&e.length<=We&&!e.includes("\0")&&!e.includes("\\");var Je=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>tn?!1:!e.split("/").some(o=>o==="."||o===".."),mr=new Set(sn),Ct=e=>!!(e&&"status"in e&&mr.has(String(e.status))&&!("body"in e)),Qe=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),wt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Ut=e=>!!(e&&"written"in e&&e.written===!0),Nt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),hr=new Set(Ko),Lt=e=>!!(e&&"kind"in e&&"size"in e&&hr.has(String(e.kind))&&Number.isFinite(e.size)),Pt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),gr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),Ar=e=>Object(e)===e?e:null,ht=e=>String(e)===e&&e.length>0,br=e=>{if(!ht(e.id))return null;if(e.ok===!0){let t={channel:R,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&ht(e.error)?{channel:R,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:cn(ht(e.code)?e.code:void 0)}:null},Dt=e=>{let t=Ar(e);return!t||t.channel!==R||t.v!==1?null:t.type==="result"?br(t):!gr.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var ln=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,kr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},pn=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Ze=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${We} characters without NUL or backslash.`)),et=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},g=e=>(e.value+=1,`oc-${e.value}`),Vt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),s=e.requestTimeoutMs??xt,i=new Set,c=new Set,l=new Set,_=new Set,O=new Set,M=new Set,j=new Set,W=new Set,z=new Set,f=new Set,A=new Set,m=new Set,V=[],d=null,S=null,k=new Set,x=new Set,L=null,q=null,C=!1,D=new Map,re=new Map,he=new Map,oe=!1,h={value:0},T=null,se=null,we=!1,Ue=!1,go=null,Q=null,Ao=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,Y=n=>{t.parent.postMessage(n,"*")},bo=()=>{oe||t.parent===t||m.size===0||T?.features?.lateGenerateResults!==!0||Y({channel:R,v:1,type:"generate-late-listen"})},w=(n,r)=>{for(let u of n)try{u(r)}catch(p){console.error(p)}},ko=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let r=Dt(n.data);if(!r)return;if(r.type==="workspace"){let p=re.get(r.payload.subscriptionId);p&&w([p],r.payload.snapshot);return}if(r.type==="shells"){let p=he.get(r.payload.subscriptionId);p&&w([p],r.payload.snapshot);return}if(r.type==="microphone-audio"){Q?.queue.push(r.payload.samples);return}if(r.type==="microphone-ended"){let p=Q;if(!p)return;Q=null,p.release(),w(p.endedListeners,r.payload.reason);return}if(r.type==="ready"){T=r.payload,se=Ao(r.payload.session),w(i,r.payload),w(c,r.payload.directory),w(l,r.payload.session),se&&w(_,se),w(O,r.payload.connection),w(M,r.payload.settings),w(j,r.payload.item),r.payload.block&&w(W,r.payload.block),bo();return}if(r.type==="service-event"){w(z,r.payload);return}if(r.type==="generate-late"){m.size===0?V.push(r.payload):w(m,r.payload);return}if(r.type==="directory"){T&&(T={...T,directory:r.payload.directory}),w(c,r.payload.directory);return}if(r.type==="session"){T&&(T={...T,session:r.payload.session}),r.payload.session?se?.sessionId!==r.payload.session.id&&(se=Ao(r.payload.session)):se=null,w(l,r.payload.session);return}if(r.type==="session-lifecycle"){se=r.payload,w(_,r.payload);return}if(r.type==="connection"){T&&(T={...T,connection:r.payload.connection}),w(O,r.payload.connection);return}if(r.type==="settings"){T&&(T={...T,settings:r.payload.settings}),w(M,r.payload.settings);return}if(r.type==="item"){T&&(T={...T,item:r.payload.item}),w(j,r.payload.item);return}if(r.type==="status-control-event"){w(f,r.payload);return}if(r.type==="popover-closed"){w(A,r.payload);return}if(r.type==="action"){let p=v=>{oe||Y({channel:R,v:1,type:"action-result",id:r.id,payload:v})},I=S;if(!I){p({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>I(r.payload)).then(()=>p({ok:!0}),v=>{let U=(v instanceof Error?v.message:String(v)).trim();p({ok:!1,error:(U||"Action failed.").slice(0,Ne)})});return}if(r.type==="file-open"){let p=r.payload;if(q&&Xo(q,p))return;q=p,w(k,r.payload);return}if(r.type==="file-saved"){w(x,r.payload.version);return}if(r.type==="file-snapshot"){let p=U=>{oe||Y({channel:R,v:1,type:"file-snapshot-result",id:r.id,payload:U})},I=U=>p({error:(U.trim()||"Could not read the edited file.").slice(0,Ne)}),v=L;if(!v){I("This extension does not edit files.");return}Promise.resolve().then(()=>v(r.payload.purpose)).then(U=>{if(Tt(U)>2e7){I(`The file is over ${2e7} ${"bytes"in U?"bytes":"characters"}.`);return}if(U.version.length>256){I(`The snapshot version is over ${256} characters.`);return}p({snapshot:"bytes"in U?{bytes:U.bytes,version:U.version}:{content:U.content,version:U.version}})},U=>I(U instanceof Error?U.message:String(U)));return}if(r.type==="resolve"){let p=v=>{Y({channel:R,v:1,type:"resolve-result",id:r.id,payload:v})},I=d;if(!I){p({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>I(r.payload)).then(v=>p({item:v?be(v):null}),v=>{let U=(v instanceof Error?v.message:String(v)).trim();p({error:(U||"Command failed.").slice(0,Ne)})});return}let u=D.get(r.id);if(u){if(clearTimeout(u.timer),D.delete(r.id),r.ok){u.resolve(r.payload);return}u.reject(new E(r.code,r.error))}};t.addEventListener("message",ko),Y({channel:R,v:1,type:"hello"});let K=(n,r=s)=>oe||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((u,p)=>{let I=setTimeout(()=>{D.delete(n.id),p(new E("HOST_TIMEOUT","Host did not answer in time."))},r);D.set(n.id,{resolve:u,reject:p,timer:I}),Y(n)}),$=n=>K(n).then(()=>{}),G={channel:R,v:1},dt=n=>{!oe&&t.parent!==t&&Y(n)},xo=()=>dt({...G,type:"file-save"}),lt=()=>{!oe&&t.parent!==t&&Y({...G,type:"microphone-close",id:g(h)})},pr=async()=>{if(Q)throw new E("HOST_REJECTED","The microphone is already open in this frame.");if(T?.features?.microphone!==!0)throw new E("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let n=globalThis.AudioContext;if(typeof n!="function")throw new E("UNSUPPORTED","This frame has no Web Audio.");let r=new n;if(r.sampleRate<8e3||r.sampleRate>192e3)throw r.close().catch(()=>{}),new E("UNSUPPORTED",`Audio at ${r.sampleRate} Hz is not supported.`);let u=r.state==="suspended"?r.resume().catch(()=>{}):void 0,p=wo(Math.round(r.sampleRate/4)),I=r.createScriptProcessor(1024,1,1);I.onaudioprocess=ee=>p.pull(ee.outputBuffer.getChannelData(0));let v=r.createMediaStreamDestination();I.connect(v);let U=new Set,ge={queue:p,endedListeners:U,release:()=>{I.onaudioprocess=null,I.disconnect(),p.clear();for(let ee of v.stream.getTracks())ee.stop();r.close().catch(()=>{})}};Q=ge;try{let ee=await K({...G,type:"microphone-open",id:g(h),payload:{sampleRate:r.sampleRate}},12e4);if(!ee||!("opened"in ee)||ee.opened!==!0)throw new E("HOST_REJECTED","Host did not open the microphone.");if(await u,Q!==ge)throw new E("DISCONNECTED","The microphone closed while it was opening.")}catch(ee){throw Q===ge&&(Q=null),ge.release(),lt(),ee}return{stream:v.stream,close:()=>{Q===ge&&(Q=null,ge.release(),lt())},onEnded:ee=>(U.add(ee),()=>{U.delete(ee)})}},Oo=n=>{!ln(n)||!kr(n)||(n.preventDefault(),xo())},Ro=n=>{!ln(n)||n.key!=="Escape"||T?.surface!=="popover"||!T.popover||(n.preventDefault(),Mo(T.popover.id,"escape").catch(()=>{}))},$e=()=>{let n=T?.surface==="popover"?T.popover:void 0;if(!n)return;let r=we||Ue;go!==r&&(go=r,Co(n.id,r).catch(()=>{}))},Ve=()=>{T?.surface!=="popover"||we||(we=!0,$e())},yo=n=>{T?.surface!=="popover"||n.relatedTarget!==null||!we||(we=!1,$e())},Io=()=>{T?.surface!=="popover"||Ue||(Ue=!0,$e())},vo=()=>{T?.surface!=="popover"||!Ue||(Ue=!1,$e())},ne=(n,r=1024)=>{if(!n.trim()||n.length>r)throw new E("HOST_REJECTED",`Identity must contain 1 to ${r} characters.`)},pt=async n=>{n.kind!=="projects"&&ne(n.projectId);let r=await K({...G,type:"workspace-read",id:g(h),payload:n});if(!r||!("kind"in r)||!("state"in r)||r.kind!==n.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return r},ut=async(n,r)=>{n.kind!=="projects"&&ne(n.projectId);let u=g(h);re.set(u,r);try{await $({...G,type:"workspace-subscribe",id:g(h),payload:{subscriptionId:u,query:n}})}catch(p){throw re.delete(u),oe||Y({...G,type:"workspace-unsubscribe",id:g(h),payload:{subscriptionId:u}}),p}return()=>{!re.delete(u)||oe||Y({...G,type:"workspace-unsubscribe",id:g(h),payload:{subscriptionId:u}})}},ur=async(n,r)=>{n.kind==="session"&&ne(n.sessionId),n.kind==="project"&&ne(n.projectId);let u=g(h);he.set(u,r);try{await $({...G,type:"shells-subscribe",id:g(h),payload:{subscriptionId:u,scope:n}})}catch(p){throw he.delete(u),oe||Y({...G,type:"shells-unsubscribe",id:g(h),payload:{subscriptionId:u}}),p}return()=>{!he.delete(u)||oe||Y({...G,type:"shells-unsubscribe",id:g(h),payload:{subscriptionId:u}})}},Be=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Ae(n.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&T?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let r=await K({...G,type:"storage",id:g(h),payload:n});if(!r||!("storage"in r)||r.op!==n.op)throw new E("HOST_REJECTED","Host did not return storage data.");return r},Mo=(n,r)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-close",id:g(h),payload:r?{id:n,reason:r}:{id:n}}),Co=(n,r)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-anchor",id:g(h),payload:{id:n,active:r}});return t.addEventListener("keydown",Ro,!0),t.addEventListener("pointerover",Ve),t.addEventListener("pointermove",Ve),t.addEventListener("pointerout",yo),t.addEventListener("focus",Io),t.addEventListener("blur",vo),{onAction:n=>(S=n,()=>{S===n&&(S=null)}),listProjects:async()=>{let n=await pt({kind:"projects"});if(n.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let r=await pt({kind:"worktrees",projectId:n});if(r.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return r},listSessions:async n=>{let r=await pt({kind:"sessions",projectId:n});if(r.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return r},onProjects:n=>ut({kind:"projects"},r=>{r.kind==="projects"&&n(r)}),onWorktrees:(n,r)=>ut({kind:"worktrees",projectId:n},u=>{u.kind==="worktrees"&&r(u)}),onSessions:(n,r)=>ut({kind:"sessions",projectId:n},u=>{u.kind==="sessions"&&r(u)}),onRunningShells:(n,r)=>ur(n,r),readShellOutput:async(n,r)=>{ne(n,128);let u=r?.cursor;if(u!==void 0&&(!Number.isInteger(u)||u<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let p=r?.tailBytes;if(p!==void 0&&(!Number.isInteger(p)||p<1||p>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let v=await K({...G,type:"shell-output",id:g(h),payload:{shellId:n,cursor:u,tailBytes:p}});if(!v||typeof v.output!="string"||!Number.isFinite(v.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return v},stopShell:async n=>{if(ne(n,128),(await K({...G,type:"shell-stop",id:g(h),payload:{shellId:n}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{ne(n),await $({...G,type:"open-session",id:g(h),payload:{sessionId:n}})},storage:{get:async(n,r)=>{let u=et(r),p={op:"get",key:n};u&&(p.scope=u);let I=await Be(p);return I.op==="get"&&I.found?I.value:void 0},set:async(n,r,u)=>{let p=et(u),I={op:"set",key:n,value:r};p&&(I.scope=p),await Be(I)},delete:async(n,r)=>{let u=et(r),p={op:"delete",key:n};u&&(p.scope=u),await Be(p)},keys:async n=>{let r=et(n),u={op:"keys"};r&&(u.scope=r);let p=await Be(u);if(p.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return p.keys}},onReady:n=>(i.add(n),T&&n(T),()=>{i.delete(n)}),onDirectory:n=>(c.add(n),T&&n(T.directory),()=>{c.delete(n)}),onSession:n=>(l.add(n),T&&n(T.session),()=>{l.delete(n)}),onSessionLifecycle:n=>(_.add(n),se&&n(se),()=>{_.delete(n)}),onConnection:n=>(O.add(n),T&&n(T.connection),()=>{O.delete(n)}),onSettings:n=>(M.add(n),T&&n(T.settings),()=>{M.delete(n)}),onItem:n=>(j.add(n),T&&n(T.item),()=>{j.delete(n)}),onBlock:n=>(W.add(n),T?.block&&n(T.block),()=>{W.delete(n)}),onServiceEvent:n=>(z.add(n),()=>{z.delete(n)}),onStatusControl:n=>(f.add(n),()=>{f.delete(n)}),onPopoverClosed:n=>(A.add(n),()=>{A.delete(n)}),setStatusControls:n=>T?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):Do(n)?$({...G,type:"status-controls",id:g(h),payload:{controls:n}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>T?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):mt(n)?$({...G,type:"popover-open",id:g(h),payload:n}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Mo,setPopoverAnchorActive:Co,onResolve:n=>(d=n,()=>{d===n&&(d=null)}),toast:n=>{let r=n.message.trim();return!r||r.length>Ke?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${Ke} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>je)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${je} characters.`)):$({channel:R,v:1,type:"toast",id:g(h),payload:{...n,message:r}})},openUrl:n=>$({channel:R,v:1,type:"open-url",id:g(h),payload:{url:n}}),openCommit:n=>kt(n)?$({channel:R,v:1,type:"open-commit",id:g(h),payload:{sha:n}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>$({channel:R,v:1,type:"block-answer",id:g(h),payload:{text:n.trim().slice(0,gt)}}),openSurface:n=>$({channel:R,v:1,type:"open-surface",id:g(h),payload:{surfaceId:n}}),writeClipboard:n=>$({channel:R,v:1,type:"clipboard-write",id:g(h),payload:{text:n}}),compose:n=>$({channel:R,v:1,type:"compose",id:g(h),payload:n}),attach:n=>$({channel:R,v:1,type:"attach",id:g(h),payload:be(n)}),startSession:async n=>{n.projectId!==void 0&&ne(n.projectId);let r=n.worktree;r&&r!==!0&&(r.kind==="existing"?ne(r.directory):(r.name!==void 0&&ne(r.name,200),r.baseBranch!==void 0&&ne(r.baseBranch,200)));let u=await K({channel:R,v:1,type:"start-session",id:g(h),payload:yt(n)},e.requestTimeoutMs??18e4);if(!At(u))throw new E("HOST_REJECTED","Host did not return a session.");return u},prompt:n=>K({channel:R,v:1,type:"prompt",id:g(h),payload:It(n)}).then(r=>{if(!bt(r))throw new E("HOST_REJECTED","Host did not return a prompt result.");return r}),sessionLink:n=>$({channel:R,v:1,type:"session-link",id:g(h),payload:be(n)}),close:()=>$({channel:R,v:1,type:"close",id:g(h)}),oauthStart:()=>$({channel:R,v:1,type:"oauth-start",id:g(h)}),oauthDisconnect:()=>$({channel:R,v:1,type:"oauth-disconnect",id:g(h)}),request:n=>(Je(n.path)?K({channel:R,v:1,type:"request",id:g(h),payload:n}):pn()).then(r=>{if(!Qe(r))throw new E("HOST_REJECTED","Host request result was empty.");return r}),serviceRequest:n=>(Je(n.path)?K({channel:R,v:1,type:"service-request",id:g(h),payload:n}):pn()).then(r=>{if(!Qe(r))throw new E("HOST_REJECTED","Host service request result was empty.");return r}),serviceStatus:()=>K({channel:R,v:1,type:"service-status",id:g(h)}).then(n=>{if(!Ct(n))throw new E("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(ke(n)?K({channel:R,v:1,type:"file-read",id:g(h),payload:{path:n}}):Ze()).then(r=>{if(!wt(r))throw new E("HOST_REJECTED","Host did not return file content.");return r}),writeFile:(n,r)=>ke(n)?r.length>ze?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${ze} characters.`)):K({channel:R,v:1,type:"file-write",id:g(h),payload:{path:n,content:r}}).then(u=>{if(!Ut(u))throw new E("HOST_REJECTED","Host did not confirm the write.");return u}):Ze(),listDir:n=>(ke(n)?K({channel:R,v:1,type:"file-list",id:g(h),payload:{path:n}}):Ze()).then(r=>{if(!Nt(r))throw new E("HOST_REJECTED","Host did not return directory entries.");return r}),stat:n=>(ke(n)?K({channel:R,v:1,type:"file-stat",id:g(h),payload:{path:n}}):Ze()).then(r=>{if(!Lt(r))throw new E("HOST_REJECTED","Host did not return file status.");return r}),generate:n=>{let r=n.prompt.trim(),u=n.system?.trim();if(r.length===0||r.length>qe)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${qe} characters.`));if(u!==void 0&&(u.length===0||u.length>Ye))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${Ye} characters.`));let p=n.maxOutputTokens===void 0?void 0:Math.min(Ot,Math.max(1,Math.floor(n.maxOutputTokens)));if(p!==void 0&&!Number.isFinite(p))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let I={prompt:r};return u!==void 0&&(I.system=u),p!==void 0&&(I.maxOutputTokens=p),K({channel:R,v:1,type:"generate",id:g(h),payload:I},e.requestTimeoutMs??Rt).then(v=>{if(!Pt(v))throw new E("HOST_REJECTED","Host did not return generated text.");return v})},onLateGenerateResult:n=>{m.add(n);for(let r of V.splice(0))w([n],r);return bo(),()=>{m.delete(n)}},openMicrophone:pr,setBadge:n=>$({channel:R,v:1,type:"badge",id:g(h),payload:{count:vt(n)}}),setHeight:n=>$({channel:R,v:1,type:"resize",id:g(h),payload:{height:Mt(n)}}),onFileOpen:n=>(k.add(n),C||(C=!0,t.addEventListener("keydown",Oo,!0)),q&&n(q),()=>{k.delete(n)}),onFileSnapshot:n=>(L=n,()=>{L===n&&(L=null)}),onFileSaved:n=>(x.add(n),()=>{x.delete(n)}),reportFileChange:n=>dt({...G,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:xo,reportFileUnsupported:()=>dt({...G,type:"file-unsupported"}),dispose:()=>{for(let n of re.keys())Y({...G,type:"workspace-unsubscribe",id:g(h),payload:{subscriptionId:n}});re.clear();for(let n of he.keys())Y({...G,type:"shells-unsubscribe",id:g(h),payload:{subscriptionId:n}});he.clear(),Q&&(lt(),Q.release(),Q=null),oe=!0,d=null,S=null,L=null,k.clear(),x.clear(),C&&t.removeEventListener("keydown",Oo,!0),t.removeEventListener("message",ko),t.removeEventListener("keydown",Ro,!0),t.removeEventListener("pointerover",Ve),t.removeEventListener("pointermove",Ve),t.removeEventListener("pointerout",yo),t.removeEventListener("focus",Io),t.removeEventListener("blur",vo);for(let n of D.values())clearTimeout(n.timer),n.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));D.clear(),i.clear(),c.clear(),l.clear(),_.clear(),O.clear(),M.clear(),j.clear(),W.clear(),z.clear(),f.clear(),A.clear(),m.clear(),V.length=0}}};var fn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Us=new Set(fn);var xr=10*6e4;var Or=10*6e4;var Rr=10*6e4;var yr=10*6e4;var mn=["none","agent","user"];var Ls=new Set(mn);var Ir=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],vr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],hn=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,s]of Ir)t.style.setProperty(o,e.tokens[s]);for(let[o,s,i]of vr){let c=e.tokens[i]??"";t.style.setProperty(o,c),t.style.setProperty(s,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Bt=(e,t)=>{hn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Mr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},N=(e,t)=>`var(--${e}, var(--oc-${Mr[e]}, ${t}))`,ae=N("surface-background","transparent"),ot=N("surface-elevated","transparent"),xe=N("surface-elevated-foreground","inherit"),Z=N("surface-foreground","inherit"),H=N("surface-muted-foreground","gray"),Cr=N("surface-muted","transparent"),_e=N("interactive-border","currentColor"),J=N("interactive-hover","transparent"),Se=N("interactive-active","transparent"),Ft=N("interactive-selection","transparent"),Kt=N("interactive-selection-foreground","inherit"),ie=N("primary","currentColor"),jt=N("primary-text","inherit"),Wt=N("error-text","inherit"),wr=N("font-sans","inherit"),zt=N("font-mono","monospace"),kn=N("radius","9px"),qt=`calc(${kn} - 2px)`,gn=`calc(${kn} - 4px)`,X=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,An=`background-image: linear-gradient(${J}, ${J});`,Yt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Jt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",bn="box-shadow: var(--oc-sdk-lit);",Qt=`inset 0 0.5px 0 0 ${X(Z,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Ur=`
:root {
  --oc-sdk-edge: ${X(Z,16)};
  --oc-sdk-field-bg: ${ot};
  --oc-sdk-raised-bg: ${ae};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(Z,14)};
  --oc-sdk-field-bg: ${X(ae,50,ot)};
  --oc-sdk-raised-bg: ${ot};
  --oc-sdk-field-lift: ${Qt};
  --oc-sdk-raised-lift: ${Qt};
  --oc-sdk-lit: ${Qt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,tt=e=>{let t=N(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${N(`${e}-text`,"inherit")}; }`},a=e=>`calc(${e}rem / 14)`,Nr=`
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
`,xn=`${Ur}
.oc-sdk { color: ${Z}; font-family: ${wr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${An} }
.oc-sdk-mono { font-family: ${zt}; }
.oc-sdk-muted { color: ${H}; }
${tt("success")}${tt("warning")}${tt("error")}${tt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ie}; --oc-sdk-tone-text: ${jt}; }

.oc-sdk-btn { border-radius: ${qt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${gn}; }
.oc-sdk-btn[data-variant="default"] { color: ${jt}; background: ${X(ie,10,ae)}; border-color: ${X(ie,12)}; ${bn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(ie,16,ae)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(ie,22,ae)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Cr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Se}, ${Se}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${xe}; ${Jt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Se}, ${Se}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${J}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Se}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${N("status-error","red")}; color: ${Wt}; background: ${X("var(--oc-sdk-tone)",7,ae)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${bn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,ae)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,ae)}; box-shadow: none; }

.oc-sdk-field-note { color: ${H}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Wt}; }
.oc-sdk-input { border-radius: ${qt}; background: var(--oc-sdk-field-bg); color: ${xe}; ${Yt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${H}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Yt(X(Z,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Yt(N("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${zt}; }

.oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ie}; }
.oc-sdk-search-clear { border-radius: ${gn}; color: ${H}; }
.oc-sdk-search-clear:hover { background: ${J}; color: ${Z}; }

.oc-sdk-trigger { border-radius: ${qt}; background: var(--oc-sdk-raised-bg); color: ${xe}; ${Jt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Se}, ${Se}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${H}; }
.oc-sdk-trigger-chevron { color: ${H}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${xe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${ot}; background-clip: padding-box; color: ${xe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${J}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Ft}; color: ${Kt}; }
.oc-sdk-option-check { color: ${Z}; }
.oc-sdk-option[data-destructive="true"] { color: ${Wt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(N("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${H}; }
.oc-sdk-popup-empty { color: ${H}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${_e}; border-radius: 4px; color: ${Z}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(Z,60,_e)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${_e}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${ae}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ie}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${An} }
.oc-sdk-check-desc { color: ${H}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(Z,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${H}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${Z}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Kt}; background: ${Ft}; border-color: ${_e}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${xe}; background: var(--oc-sdk-raised-bg); ${Jt} }
.oc-sdk-tab-count { color: ${H}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(Z,6)}; color: ${H}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${J}; }
.oc-sdk-row[aria-selected="true"] { background: ${Ft}; color: ${Kt}; }
.oc-sdk-row-lead { font-family: ${zt}; color: ${H}; }
.oc-sdk-row-sub { color: ${H}; }
.oc-sdk-row-meta { color: ${H}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${H}; }

.oc-sdk-empty-body { color: ${H}; }

.oc-sdk-spinner { color: ${H}; }
.oc-sdk-spinner-ring { border-color: ${_e}; border-top-color: ${ie}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${H}; }

.oc-sdk-separator { color: ${H}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X(_e,40)}; }

.oc-sdk-progress-label { color: ${H}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(Z,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ie}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${N("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${N("success-text","inherit")}; }

.oc-sdk-text a { color: ${jt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(_e,60)}; }
`,B=`
${Et}
${Nr}
${xn}`;var On="oc-sdk-ui-style",Oe=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},F=e=>{let t=document.getElementById(On);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}_t(document);let o=document.createElement("style");o.id=On,o.textContent=e,document.head.appendChild(o)},P=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},ce=e=>{let t=P("button",e);return t.type="button",t},te=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},le=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},Rn=(e,t)=>{let o=s=>{s.target instanceof Node&&e.contains(s.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Lr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Le=(e,t)=>{F(B);let o=t,s=ce("oc-sdk oc-sdk-btn"),i=Lr(),c=document.createElement("span");s.append(c),e.append(s);let l=()=>{s.dataset.variant=o.variant??"default",s.dataset.size=o.size??"default",s.disabled=!!o.disabled||!!o.loading,s.dataset.loading=o.loading?"true":"false",s.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==s?s.prepend(i):!o.loading&&i.parentNode===s&&i.remove(),te(c,o.label)},_=()=>{o.disabled||o.loading||o.onClick()};return s.addEventListener("click",_),l(),{update:O=>{o={...o,...O},l()},dispose:()=>{s.removeEventListener("click",_),s.remove()}}};var yn="http://www.w3.org/2000/svg",Pr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Re=(e,t,o)=>{let s=document.createElementNS(yn,"svg");s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("width",String(t)),s.setAttribute("height",String(t)),s.style.width=a(t),s.style.height=a(t),s.setAttribute("aria-hidden","true"),s.setAttribute("fill","currentColor"),o&&s.setAttribute("class",o);let i=document.createElementNS(yn,"path");return i.setAttribute("d",Pr[e]),s.append(i),s};var ye=(e,t="vertical")=>{let[o,s]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===s||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Ie=(e,t,o)=>{let s=e.filter(O=>!O.disabled);if(s.length===0)return null;let i=s[0],c=s[s.length-1];if(o==="first"||!i||!c)return i?.id??null;if(o==="last")return c.id;let l=s.findIndex(O=>O.id===t);return l===-1?o==="next"?i.id:c.id:s[Math.min(s.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var In=(e,t)=>`${e}-${t??""}`,Zt=(e,t,o,s)=>{let i=ce("oc-sdk-option");i.id=In(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let c=P("span","oc-sdk-option-label");if(c.textContent=o.label,i.append(c),o.hint){let l=P("span","oc-sdk-option-hint");l.textContent=o.hint,i.append(l)}if(t==="option"){i.dataset.mark="check";let l=P("span","oc-sdk-option-check");l.append(Re("check",14)),i.append(l)}return i.addEventListener("pointerenter",s.hover),i.addEventListener("click",s.pick),i},eo=(e,t,o,s)=>{let i=In(o,s);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===i?"true":"false");le(t,"aria-activedescendant",s?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Dr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let s=e.offsetHeight,i=window.innerHeight-o.bottom-8;s>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-s))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},to=(e,t,o,s)=>{e.append(o),Dr(o,t);let i=Rn(e,s),c=()=>{s()},l=_=>{_.target instanceof Node&&o.contains(_.target)||s()};return window.addEventListener("resize",c),window.addEventListener("scroll",l,!0),()=>{i(),window.removeEventListener("resize",c),window.removeEventListener("scroll",l,!0),o.remove()}};var oo=(e,t)=>{le(e,"data-tone",t&&t!=="neutral"?t:null)},no=(e,t)=>{F(B);let o=t,s=P("span","oc-sdk oc-sdk-badge");e.append(s);let i=()=>{te(s,o.label),oo(s,o.tone)};return i(),{update:c=>{o={...o,...c},i()},dispose:()=>{s.remove()}}};var vn=e=>e.filter(t=>!("separator"in t)),Gr=0,ro=(e,t)=>{F(B);let o=t,s=`oc-sdk-menu-${Gr+=1}`,i=P("div","oc-sdk oc-sdk-menu");e.append(i);let c=P("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let l=null,_=null,O=Le(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{l?z():f()}}),M=i.querySelector("button");M?.setAttribute("aria-haspopup","menu");let j=d=>{_=d,eo(c,c,s,d)},W=()=>{Oe(c);for(let d of o.items){if("separator"in d){let S=P("div","oc-sdk-separator");S.dataset.labeled="false",c.append(S);continue}c.append(Zt(s,"menuitem",d,{hover:()=>j(d.id),pick:()=>A(d.id)}))}j(vn(o.items).some(d=>d.id===_)?_:null)},z=()=>{let d=l;l=null,d?.(),_=null,M?.setAttribute("aria-expanded","false")},f=()=>{l||!M||(W(),l=to(i,M,c,z),M.setAttribute("aria-expanded","true"),c.focus())},A=d=>{z(),M?.focus(),o.onSelect(d)},m=d=>{let S=ye(d);S?(d.preventDefault(),j(Ie(vn(o.items),_,S))):d.key==="Enter"||d.key===" "?(d.preventDefault(),_&&A(_)):d.key==="Escape"&&(d.preventDefault(),z(),M?.focus())},V=d=>{l&&!(d.relatedTarget instanceof Node&&i.contains(d.relatedTarget))&&z()};return c.addEventListener("keydown",m),i.addEventListener("focusout",V),{update:d=>{o={...o,...d},O.update({label:o.label,variant:o.variant,size:o.size}),l&&W()},dispose:()=>{z(),c.removeEventListener("keydown",m),i.removeEventListener("focusout",V),O.dispose(),i.remove()}}};var ue=["backlog","todo","in_progress","review","done"],Pe={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},Mn=1,Cn=200,wn=16e3;var Hr=512,Xr=/^t_[a-z0-9]{6,40}$/,Un=e=>typeof e=="string"&&ue.includes(e);var pe=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>Hr)throw new Error(`${t} is too long`);return o},Nn=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>Cn)throw new Error(`Title is limited to ${Cn} characters`);return t},Ln=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>wn)throw new Error(`Description is limited to ${wn} characters`);return e};var Pn=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=pe(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:pe(t.branch,"worktree.branch")}},so=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},Dn=(e,t)=>e==null?null:so(e,t);var Gn=(e,t,o=Date.now())=>{let s={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(s.title=Nn(t.title)),"description"in t&&(s.description=Ln(t.description)),"status"in t){if(!Un(t.status))throw new Error("Unknown status");s.status=t.status}if("projectId"in t&&(s.projectId=pe(t.projectId,"projectId")),"sourceBranch"in t&&(s.sourceBranch=pe(t.sourceBranch,"sourceBranch")),"worktree"in t&&(s.worktree=Pn(t.worktree)),"sessionId"in t&&(s.sessionId=pe(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");s.rank=t.rank}return"needsAttentionSince"in t&&(s.needsAttentionSince=Dn(t.needsAttentionSince,"needsAttentionSince")),s},io=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==Mn)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!Xr.test(t.id))throw new Error("Task id is invalid");if(!Un(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:Mn,id:t.id,title:Nn(t.title),description:Ln(t.description),status:t.status,rank:t.rank,projectId:pe(t.projectId,"projectId"),sourceBranch:pe(t.sourceBranch,"sourceBranch"),worktree:Pn(t.worktree),sessionId:pe(t.sessionId,"sessionId"),createdAt:so(t.createdAt,"createdAt"),updatedAt:so(t.updatedAt,"updatedAt"),needsAttentionSince:Dn(t.needsAttentionSince,"needsAttentionSince")}};var Xn="task:",Hn=16,$n=e=>`${Xn}${e}`,ao=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Xn)),o=[],s=[];for(let i=0;i<t.length;i+=Hn)await Promise.all(t.slice(i,i+Hn).map(async c=>{try{let l=io(await e.storage.get(c));if($n(l.id)!==c)throw new Error("Task id does not match its key");o.push(l)}catch{s.push(c)}}));return{tasks:o,failedKeys:s}},co=async(e,t)=>{let o=io(t);await e.storage.set($n(o.id),o)};var nt="__all__",Vn="__none__";var lo=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),rt=(e,t)=>!(t.projectId===Vn&&e.projectId!==null||t.projectId!==nt&&t.projectId!==Vn&&e.projectId!==t.projectId);var Bn=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:Gn(e,{status:t,needsAttentionSince:null});var Te={waitingPermissionMeansReview:!0,failedMeansReview:!0},st=(e,t,o,s=Te)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",c=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return c();case"waiting-question":return i();case"waiting-permission":return s.waitingPermissionMeansReview?i():null;case"idle":return o==="completed"||o==="failed"&&s.failedMeansReview?i():null;default:return null}};var Fn=10*6e4,$r=60,Vr=(e,t,o=Te)=>t?st(e.status,t.activity,t.outcome,o)??e.status:e.status,Br=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,Kn=(e,t)=>e.needsAttentionSince??t.updatedAt,jn=(e,t,o,s=Fn)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-Kn(e,t)<s?null:e.needsAttentionSince!==null?"hint":"quiet",Fr=(e,t,o,s=Fn)=>{if(!t||jn(e,t,o,s)===null)return null;let i=Math.floor((o-Kn(e,t))/6e4);return i>0&&i<$r?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var Kr=(e,t,o=Te,s=Date.now())=>{let i=Br(e,t),c=Vr(e,i,o),l=c!==e.status,_=e.needsAttentionSince!==null||l&&c==="review",O=jn(e,i,s);return{task:e,displayStatus:c,movedByAgent:l,attention:_,attentionSince:e.needsAttentionSince??(_&&i?i.updatedAt:null),live:i,looksDone:O,looksDoneNote:O?Fr(e,i,s):null}},jr=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||lo(e.task,t.task),Wn=(e,t,o,s=Te,i=Date.now())=>{let c=Object.fromEntries(ue.map(l=>[l,[]]));for(let l of e){if(!rt(l,o))continue;let _=Kr(l,t,s,i);c[_.displayStatus].push(_)}for(let l of ue)c[l].sort((_,O)=>l==="review"?jr(_,O):lo(_.task,O.task));return c},zn=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.attention&&s.displayStatus!=="done").length,0),qn=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.displayStatus!=="done").length,0),Yn=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},Jn=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var Qn=(e,t,o)=>{let s=o.sessions.find(i=>i.id===e);if(s)return s.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(c=>c.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var Zn=(e,t,o,s,i={})=>{let c=i.onLiveChange,l=i.onSnapshot??(()=>{}),_=new Map,O=new Map,M=new Map,j=new Map,W=!1,z=(d,S)=>{if(S.state==="loading")return!1;let k=0;for(let[x,L]of M)L.projectId===d&&(M.delete(x),k+=1);if(S.state!=="ready")return k>0;for(let x of S.sessions)x.parentId===null&&M.set(x.id,{projectId:d,activity:x.activity,outcome:x.outcome,updatedAt:x.updatedAt});return!0},f=(d,S)=>{if(W)return;z(d,S)&&c&&c(),l();for(let x of S.sessions)j.set(x.id,x.directory);if(o)for(let x of O.values()){if(x.projectId!==d||!x.sessionId)continue;let L=Qn(x.sessionId,j.get(x.sessionId)??null,S);if(s&&(L==="deleted"||L==="archived")){s(x.id,x.sessionId,L);continue}let q=S.sessions.find(D=>D.id===x.sessionId);if(!q)continue;let C=st(x.status,q.activity,q.outcome,t);C&&o(x.id,C)}},A=d=>{let S=e.onSessions(d,k=>f(d,k));_.set(d,S),S.then(k=>{(W||!_.has(d))&&k()},()=>{})};return{live:()=>M,sync:d=>{if(W)return;O=new Map(d.map(k=>[k.id,k]));let S=new Set(d.filter(k=>k.sessionId&&k.projectId).map(k=>k.projectId));for(let k of S)_.has(k)||A(k);for(let[k,x]of _)if(!S.has(k)){_.delete(k);for(let[L,q]of M)q.projectId===k&&M.delete(L);x.then(L=>L(),()=>{})}},dispose:()=>{W=!0;for(let d of _.values())d.then(S=>S(),()=>{});_.clear()}}};var er=(e,t)=>{if(!t)return null;let o=e.find(s=>s.directory===t);return o||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,i)=>i.directory.length-s.directory.length)[0]??null)},it=e=>{if(e instanceof E)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var b=(e,t="",o="")=>{let s=document.createElement(e);return t&&(s.className=t),o&&(s.textContent=o),s};var at="http://www.w3.org/2000/svg",Wr={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},or=e=>{let t=document.createElementNS(at,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},zr=()=>or(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(at,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let s=document.createElementNS(at,"path");s.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,s)}),qr=()=>or(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(at,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),po=e=>{let t=b("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},tr=()=>{let e=b("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},Yr={running:zr,"waiting-question":()=>po("?"),"waiting-permission":qr,failed:()=>po("!"),finished:()=>po("\u2713"),idle:tr,linked:tr},nr=e=>{let t=b("span","kb-agent-pill"),o=Wr[e.key];return o&&(t.dataset.tone=o),t.append(Yr[e.key]()),t.append(b("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var rr=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var sr="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",Jr="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",Qr=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},uo=(e,t,o,s={})=>{let i=b("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),s.primary&&(i.dataset.primary="true"),s.hint&&(i.dataset.hint="true"),s.quiet&&(i.dataset.quiet="true"),s.info&&(i.dataset.info="true"),i.append(Qr(e)),i.addEventListener("click",c=>{c.stopPropagation(),o()}),i},Zr=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...ue.filter(s=>s!==e.displayStatus).map(s=>({id:`move:${s}`,label:`Move to ${Pe[s]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},ir=(e,t,o)=>{let s=t==="rail",i=b("div",s?"kb-panel-sections":"kb-columns");e.append(i);let c=[],l=null,_=(f,A)=>[...f.querySelectorAll(".kb-draggable-item")].filter(m=>m.dataset.id!==A).map(m=>({id:m.dataset.id??"",top:m.getBoundingClientRect().top,height:m.getBoundingClientRect().height})),O=(f,A,m,V)=>{f.addEventListener("dragover",d=>{l&&(d.preventDefault(),f.classList.add("kb-dragover"))}),f.addEventListener("dragleave",d=>{d.target===f&&f.classList.remove("kb-dragover")}),f.addEventListener("drop",d=>{d.preventDefault(),f.classList.remove("kb-dragover");let S=l??d.dataTransfer?.getData("text/plain")??null;if(l=null,!S)return;if(s&&d.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(S,m);return}let k=rr(_(A,S),d.clientY);V(S,m,k)})},M=f=>{let{task:A}=f,m=b("div",f.attention?"kb-item kb-attn":"kb-item");s?m.classList.add("kb-panel-row"):m.classList.add("kb-card");let V=o.onDrop!==void 0;V?(m.classList.add("kb-draggable-item"),m.draggable=!0):m.draggable=!1,m.dataset.id=A.id;let d=b("div","kb-panel-main");m.append(d);let S=b("div","kb-item-top");S.append(b("div","kb-panel-title",A.title)),d.append(S);let k=o.projectName(A),x=b("div","kb-panel-sub");k&&x.append(b("span","kb-panel-project",k));let L=f.live?Jn(f.live):A.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(L&&x.append(nr(L)),d.append(x),s&&f.attention&&A.sessionId&&o.onOpenChat){let C=o.onOpenChat,D=b("div","kb-panel-actions");D.append(uo(Jr,"Open chat",()=>C(A),{primary:!0})),d.append(D)}if(s&&f.displayStatus!=="done"&&o.onMarkDone){let C=o.onMarkDone;S.append(uo(sr,"Mark done",()=>C(A),{info:!0}))}if(s&&f.looksDone){let C=b("span","kb-panel-chip","\u2713 looks done");C.dataset.ok="true",m.append(C)}else f.movedByAgent&&m.append(b("span","kb-panel-chip",`\u2192 ${Pe[f.displayStatus]}`));let q=Zr(f,o);if(!s&&f.looksDone&&o.onLooksDone){let C=o.onLooksDone;S.append(uo(sr,f.looksDoneNote??"Looks done \u2014 click to mark Done",()=>C(A),f.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(q){let C=b("span","kb-panel-menu");S.append(C),c.push(ro(C,{label:"\u22EF",variant:"ghost",size:"xs",items:q,onSelect:D=>{if(D==="delete"&&o.onDelete){o.onDelete(A);return}if(D==="edit"&&o.onEdit){o.onEdit(A);return}if(D.startsWith("move:")){let re=D.slice(5);ue.includes(re)&&o.onMoveStatus&&o.onMoveStatus(A,re)}}}))}if(o.onActivate){let C=()=>o.onActivate(A);m.addEventListener("click",D=>{D.target?.closest(".kb-panel-menu")||C()}),m.tabIndex=0,m.addEventListener("keydown",D=>{(D.key==="Enter"||D.key===" ")&&(D.preventDefault(),C())})}return V&&(m.addEventListener("dragstart",C=>{l=A.id,m.classList.add("kb-dragging"),C.dataTransfer?.setData("text/plain",A.id),C.dataTransfer&&(C.dataTransfer.effectAllowed="move")}),m.addEventListener("dragend",()=>{l=null,m.classList.remove("kb-dragging")})),m},j=(f,A)=>{let m=b("div","kb-column");m.dataset.status=f;let V=b("div","kb-column-head");V.append(b("span","kb-column-title",Pe[f]));let d=b("span","kb-column-count",String(A.length));A.some(k=>k.attention&&k.displayStatus!=="done")&&(d.dataset.attn="true"),V.append(d);let S=b("div","kb-column-body");m.append(V,S),A.length===0&&S.append(b("div","kb-column-empty","No tasks"));for(let k of A)S.append(M(k));return o.onDrop&&O(m,S,f,o.onDrop),m},W=(f,A)=>{let m=b("div","kb-psec");m.dataset.status=f;let V=o.onToggleSection!==void 0,d=V&&(o.isCollapsed?.(f)??!1),S=V?document.createElement("button"):b("div","kb-psec-head");S.className="kb-psec-head",S instanceof HTMLButtonElement&&(S.type="button"),S.append(b("span","kb-psec-name",Pe[f]));let k=b("span","kb-psec-count","0");A.some(L=>L.attention&&L.displayStatus!=="done")&&(k.dataset.attn="true"),S.append(k),V&&(S.append(b("span","kb-psec-chevron",d?"\u25B8":"\u25BE")),S.addEventListener("click",()=>o.onToggleSection?.(f)));let x=b("div","kb-psec-body");if(x.hidden=d,m.append(S,x),!d){A.length===0&&x.append(b("div","kb-panel-empty","No tasks"));for(let L of A)x.append(M(L))}return o.onDrop&&O(m,x,f,o.onDrop),m};return{render:f=>{for(let A of c.splice(0))A.dispose();i.replaceChildren();for(let A of ue)i.append(s?W(A,f[A]):j(A,f[A]))},dispose:()=>{for(let f of c.splice(0))f.dispose();i.replaceChildren()}}};var es=`
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--oc-bg);color:var(--oc-fg);font-family:var(--oc-font);font-size:14px;line-height:1.45}
#root{min-height:100%}
.kb-page{display:flex;flex-direction:column;gap:14px;padding:16px;min-height:100%}
.kb-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.kb-toolbar .grow{flex:1;min-width:160px}
.kb-columns{display:flex;gap:12px;align-items:flex-start;overflow-x:auto;padding-bottom:8px;flex:1}
.kb-column{flex:1 0 220px;min-width:220px;max-width:320px;display:flex;flex-direction:column;background:var(--oc-muted-surface);border:1px solid var(--oc-border);border-radius:var(--oc-radius,10px);min-height:120px;overflow:hidden}
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
.kb-radio-group{display:flex;flex-direction:column;gap:10px}
.kb-radio-option{display:flex;gap:10px;align-items:flex-start;cursor:pointer}
.kb-radio-option input{margin-top:3px;accent-color:var(--oc-primary)}
.kb-radio-title{font-weight:550;font-size:13px}
.kb-radio-desc{font-size:12px;color:var(--oc-muted);margin-top:2px}
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
.kb-card .kb-iconbtn[data-quiet="true"]{opacity:0;transition:opacity 120ms ease-out}
.kb-card:hover .kb-iconbtn[data-quiet="true"],.kb-card:focus-within .kb-iconbtn[data-quiet="true"]{opacity:1}
.kb-panel-actions{display:flex;gap:6px;align-items:center;flex:none}
/* Rail rows carry the same buttons at the 26px touch size; the \u2713 (data-info)
   rides them at every non-done row's right edge and never hides. */
.kb-panel-row .kb-iconbtn{width:26px;height:26px}
.kb-panel-row .kb-iconbtn svg{width:13px;height:13px}
/* The rail's looks-done chip speaks success, unlike the warning \u2192 Review chip. */
.kb-panel-chip[data-ok]{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 13%,transparent)}
[hidden]{display:none!important}
`,ar=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=es,document.head.append(e)};var de=Vt(),_o=document.querySelector("#root");if(!_o)throw new Error("Missing #root");var ct=!1,Ee=!1,fe=[],So=[],To=null,ve=null,fo,De,Eo=!1,me=!1,ho=null,dr,Ce,Ge,He,ts=(e,t)=>e.filter(o=>rt(o,{projectId:t??nt})),Xe=e=>{fe=[...e],lr.sync(ts(fe,ve?.id??null))},lr=Zn(de,Te,null,void 0,{onLiveChange:()=>{me&&!Ee&&Me()},onSnapshot:()=>{ns()}}),cr=()=>{ve=er(So,To)};de.onReady(e=>{if(ct)return;ct=!0,Bt(e,document.documentElement),To=e.directory,ar(),_o.replaceChildren();let t=b("div","kb-page kb-rail"),o=b("div","kb-row between");o.append(b("h2","","Kanban"));let s=b("span");o.append(s),t.append(o),Ce=b("p","kb-muted","Loading\u2026"),t.append(Ce),Ge=b("p","kb-rail-scope"),t.append(Ge),He=b("p","kb-panel-unseen"),t.append(He),ho=ir(t,"rail",{projectName:c=>!ve&&c.projectId?So.find(l=>l.id===c.projectId)?.name??null:null,onMarkDone:async c=>{let l=fe.find(O=>O.id===c.id)??c,_=Bn(l,"done");if(_){try{await co(de,_)}catch(O){de.toast({kind:"error",message:`Could not mark "${l.title}" done \u2014 ${it(O)}`}).catch(()=>{}),mo();return}Xe(fe.map(O=>O.id===l.id?_:O)),Me()}}});let i=b("div","kb-rail-foot");i.append(b("p","kb-muted","One quick write lives here \u2014 the \u2713 marks a task Done. Everything else (open, move, edit, delete) is the full board, from the Extension pages menu.")),t.append(i),_o.append(t),dr=no(s,{label:"",tone:"neutral"}),fo=window.setInterval(()=>{mo()},3e4),de.onProjects(c=>{Ee||c.state!=="ready"||(So=c.projects,cr(),Xe(fe),me&&Me())}).then(()=>{},()=>{}),de.onDirectory(c=>{Ee||(To=c,cr(),Xe(fe),me&&Me())}),os()});var os=async()=>{try{let e=await ao(de);if(Ee)return;Xe(e.tasks),me=!0,Ce.hidden=!0,Me()}catch(e){Ce.textContent=`Could not load tasks \u2014 ${it(e)}`}},mo=async()=>{if(!(!ct||Ee||Eo)){Eo=!0;try{let{tasks:e}=await ao(de);if(Ee)return;Xe(e),me||(me=!0,Ce.hidden=!0),Me()}catch(e){me||(Ce.textContent=`Could not load tasks \u2014 ${it(e)}`)}finally{Eo=!1}}},ns=()=>{De!==void 0||Ee||!ct||(De=window.setTimeout(()=>{De=void 0,mo()},500))},Me=()=>{let e=Wn(fe,lr.live(),{projectId:ve?.id??nt}),t=qn(e),o=zn(e);ve?(Ge.textContent=`Project: ${ve.name}`,Ge.hidden=!1):Ge.hidden=!0;let s=Yn(t,o);dr.update({label:s.label,tone:s.tone}),o>0?(He.textContent=`${o} task${o===1?"":"s"} need${o===1?"s":""} your review`,He.hidden=!1):He.hidden=!0,ho?.render(e)};window.addEventListener("pagehide",()=>{Ee=!0,fo!==void 0&&window.clearInterval(fo),De!==void 0&&window.clearTimeout(De),ho?.dispose(),de.dispose()});})();
