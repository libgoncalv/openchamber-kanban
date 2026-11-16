"use strict";(()=>{var k="openchamber.sdk";var Fe="data-oc-scrolling",pt=`
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
`;function ut(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let n=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?t:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let c=n.get(i);c!==void 0&&clearTimeout(c),n.set(i,setTimeout(()=>{n.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var zn=`(${ut.toString()})(document);`;var bo=e=>{let t=[],n=0,s=0;return{push:i=>{for(t.push(i),s+=i.length;s-n>e&&t.length>1;){let c=t.shift();s-=c?.length??0,n=0}},pull:i=>{let c=0;for(;c<i.length&&t.length>0;){let p=t[0],A=Math.min(i.length-c,p.length-n);i.set(p.subarray(n,n+A),c),c+=A,n+=A,n>=p.length&&(t.shift(),s-=p.length,n=0)}i.fill(0,c)},clear:()=>{t.length=0,n=0,s=0},get size(){return s-n}}};var Co=/^[a-z][a-z0-9-]{0,39}$/;var Io=e=>Object(e)===e&&!Array.isArray(e),Et=(e,t)=>Object.keys(e).every(n=>t.includes(n)),yo=e=>String(e)===e&&e.length>=1&&e.length<=60,vo=e=>String(e)===e&&e.length>=1&&e.length<=80,Mo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let n of e){if(!Io(n)||!Co.test(n.id)||!yo(n.label)||n.disabled!==void 0&&n.disabled!==!0&&n.disabled!==!1||t.has(n.id))return!1;if(t.add(n.id),n.kind==="button"){if(!Et(n,["kind","id","label","disabled"]))return!1;continue}if(n.kind!=="select"||!Et(n,["kind","id","label","value","options","disabled"])||!vo(n.value)||!Array.isArray(n.options)||n.options.length<1||n.options.length>16)return!1;let s=new Set;for(let i of n.options){if(!Io(i)||!Et(i,["value","label"])||!vo(i.value)||!yo(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(n.value))return!1}return!0};var Yn=1024*1024;var Uo=["{id}","{segment}","{segments+}"];var Wr=new Set(Uo);var wo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var qr=new Set(wo);var _t=e=>"bytes"in e?e.bytes.byteLength:e.content.length,No=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let n=0;n<e.bytes.byteLength;n+=1)if(e.bytes[n]!==t.bytes[n])return!1;return!0};var Lo=/^[A-Za-z0-9_-]{1,80}$/;var Po=["left","right","top","bottom"];var Do=(e,t=0,n={remaining:16e3})=>{if(--n.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!Do(i,t+1,n))return!1;return!0},St=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(St);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(St)}return String(e)===e||Number.isFinite(e)},Tt=e=>{try{return String(e.id)!==e.id||!Lo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Po.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Do(e.data)||!St(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var mt=2e3;var Ho=["file","directory","other","missing"],At=e=>!!(e&&"sessionId"in e),ht=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Xo=/^[0-9a-f]{7,64}$/i,Ot=e=>Xo.test(e),Be=500,Ke=32e3,$o=16e3,Vo=128,Fo=200,Bo=2e3,Ko=16e3,jo=80,Wo=200,zo=16e3;var qo=2e3;var gt=2e4,je=1024,We=2e6;var ze=64e3,qe=8e3,Rt=4e3;var xt=96e4,Jn=60*6e4;var Yo=999,Jo=1e4,Me=500,Qo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Zo=["stopped","starting","ready","failed"],Qn=new Set(Qo),en=e=>Qn.has(e),tn=e=>e&&en(e)?e:"HOST_REJECTED",Ae=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ae):Object(e)===e?Object.values(e).every(Ae):!1,on=e=>Ae(e)&&JSON.stringify(e).length<=zo,Go=e=>e?.trim().slice(0,Wo)??"",he=e=>{let t=e.id.trim().slice(0,Vo),n=e.title.trim().slice(0,Fo),s=e.url.trim().slice(0,Bo),i=e.text?.trim().slice(0,Ko),c=e.author?.trim().slice(0,jo),p=e.kind==="pull"?"pull":"issue",A={providerId:e.providerId.trim(),id:t,title:n||t,url:s,kind:p};if(i&&(A.text=i),c&&(A.author=c),p==="pull"){let P=Go(e.branches?.head),v=Go(e.branches?.base);P&&v&&(A.branches={head:P,base:v})}return on(e.data)&&(A.data=e.data),A},kt=e=>{let t=he(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},bt=e=>{let t={text:e.text.trim().slice(0,$o)};return e.send&&(t.send=!0),t},It=e=>e===null||!Number.isFinite(e)?null:Math.min(Yo,Math.max(0,Math.round(e))),yt=e=>Number.isFinite(e)?Math.min(Jo,Math.max(0,Math.ceil(e))):0;var Oe=e=>e.length>0&&e.length<=je&&!e.includes("\0")&&!e.includes("\\");var Ye=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>qo?!1:!e.split("/").some(n=>n==="."||n===".."),Zn=new Set(Zo),vt=e=>!!(e&&"status"in e&&Zn.has(String(e.status))&&!("body"in e)),Je=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Ct=e=>!!(e&&"content"in e&&String(e.content)===e.content),Mt=e=>!!(e&&"written"in e&&e.written===!0),Ut=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),er=new Set(Ho),wt=e=>!!(e&&"kind"in e&&"size"in e&&er.has(String(e.kind))&&Number.isFinite(e.size)),Nt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),tr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),or=e=>Object(e)===e?e:null,ft=e=>String(e)===e&&e.length>0,nr=e=>{if(!ft(e.id))return null;if(e.ok===!0){let t={channel:k,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&ft(e.error)?{channel:k,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:tn(ft(e.code)?e.code:void 0)}:null},Lt=e=>{let t=or(e);return!t||t.channel!==k||t.v!==1?null:t.type==="result"?nr(t):!tr.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var nn=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,rr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,n){super(n),this.name="HostRequestError",this.code=t}},rn=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Qe=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${je} characters without NUL or backslash.`)),Ze=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},m=e=>(e.value+=1,`oc-${e.value}`),Xt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let n=e.acceptSource??(o=>o===t.parent),s=e.requestTimeoutMs??gt,i=new Set,c=new Set,p=new Set,A=new Set,P=new Set,v=new Set,W=new Set,z=new Set,q=new Set,O=new Set,h=new Set,T=new Set,V=[],d=null,_=null,g=new Set,x=new Set,M=null,Y=null,U=!1,C=new Map,j=new Map,de=new Map,ne=!1,f={value:0},S=null,se=null,ve=!1,Ce=!1,_o=null,Z=null,So=o=>o?{sessionId:o.id,phase:o.busy?"started":"completed"}:null,J=o=>{t.parent.postMessage(o,"*")},To=()=>{ne||t.parent===t||T.size===0||S?.features?.lateGenerateResults!==!0||J({channel:k,v:1,type:"generate-late-listen"})},w=(o,r)=>{for(let u of o)try{u(r)}catch(l){console.error(l)}},fo=o=>{if(!(o instanceof MessageEvent)||!n(o.source))return;let r=Lt(o.data);if(!r)return;if(r.type==="workspace"){let l=j.get(r.payload.subscriptionId);l&&w([l],r.payload.snapshot);return}if(r.type==="shells"){let l=de.get(r.payload.subscriptionId);l&&w([l],r.payload.snapshot);return}if(r.type==="microphone-audio"){Z?.queue.push(r.payload.samples);return}if(r.type==="microphone-ended"){let l=Z;if(!l)return;Z=null,l.release(),w(l.endedListeners,r.payload.reason);return}if(r.type==="ready"){S=r.payload,se=So(r.payload.session),w(i,r.payload),w(c,r.payload.directory),w(p,r.payload.session),se&&w(A,se),w(P,r.payload.connection),w(v,r.payload.settings),w(W,r.payload.item),r.payload.block&&w(z,r.payload.block),To();return}if(r.type==="service-event"){w(q,r.payload);return}if(r.type==="generate-late"){T.size===0?V.push(r.payload):w(T,r.payload);return}if(r.type==="directory"){S&&(S={...S,directory:r.payload.directory}),w(c,r.payload.directory);return}if(r.type==="session"){S&&(S={...S,session:r.payload.session}),r.payload.session?se?.sessionId!==r.payload.session.id&&(se=So(r.payload.session)):se=null,w(p,r.payload.session);return}if(r.type==="session-lifecycle"){se=r.payload,w(A,r.payload);return}if(r.type==="connection"){S&&(S={...S,connection:r.payload.connection}),w(P,r.payload.connection);return}if(r.type==="settings"){S&&(S={...S,settings:r.payload.settings}),w(v,r.payload.settings);return}if(r.type==="item"){S&&(S={...S,item:r.payload.item}),w(W,r.payload.item);return}if(r.type==="status-control-event"){w(O,r.payload);return}if(r.type==="popover-closed"){w(h,r.payload);return}if(r.type==="action"){let l=y=>{ne||J({channel:k,v:1,type:"action-result",id:r.id,payload:y})},I=_;if(!I){l({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>I(r.payload)).then(()=>l({ok:!0}),y=>{let N=(y instanceof Error?y.message:String(y)).trim();l({ok:!1,error:(N||"Action failed.").slice(0,Me)})});return}if(r.type==="file-open"){let l=r.payload;if(Y&&No(Y,l))return;Y=l,w(g,r.payload);return}if(r.type==="file-saved"){w(x,r.payload.version);return}if(r.type==="file-snapshot"){let l=N=>{ne||J({channel:k,v:1,type:"file-snapshot-result",id:r.id,payload:N})},I=N=>l({error:(N.trim()||"Could not read the edited file.").slice(0,Me)}),y=M;if(!y){I("This extension does not edit files.");return}Promise.resolve().then(()=>y(r.payload.purpose)).then(N=>{if(_t(N)>2e7){I(`The file is over ${2e7} ${"bytes"in N?"bytes":"characters"}.`);return}if(N.version.length>256){I(`The snapshot version is over ${256} characters.`);return}l({snapshot:"bytes"in N?{bytes:N.bytes,version:N.version}:{content:N.content,version:N.version}})},N=>I(N instanceof Error?N.message:String(N)));return}if(r.type==="resolve"){let l=y=>{J({channel:k,v:1,type:"resolve-result",id:r.id,payload:y})},I=d;if(!I){l({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>I(r.payload)).then(y=>l({item:y?he(y):null}),y=>{let N=(y instanceof Error?y.message:String(y)).trim();l({error:(N||"Command failed.").slice(0,Me)})});return}let u=C.get(r.id);if(u){if(clearTimeout(u.timer),C.delete(r.id),r.ok){u.resolve(r.payload);return}u.reject(new E(r.code,r.error))}};t.addEventListener("message",fo),J({channel:k,v:1,type:"hello"});let K=(o,r=s)=>ne||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((u,l)=>{let I=setTimeout(()=>{C.delete(o.id),l(new E("HOST_TIMEOUT","Host did not answer in time."))},r);C.set(o.id,{resolve:u,reject:l,timer:I}),J(o)}),$=o=>K(o).then(()=>{}),G={channel:k,v:1},at=o=>{!ne&&t.parent!==t&&J(o)},mo=()=>at({...G,type:"file-save"}),ct=()=>{!ne&&t.parent!==t&&J({...G,type:"microphone-close",id:m(f)})},jn=async()=>{if(Z)throw new E("HOST_REJECTED","The microphone is already open in this frame.");if(S?.features?.microphone!==!0)throw new E("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let o=globalThis.AudioContext;if(typeof o!="function")throw new E("UNSUPPORTED","This frame has no Web Audio.");let r=new o;if(r.sampleRate<8e3||r.sampleRate>192e3)throw r.close().catch(()=>{}),new E("UNSUPPORTED",`Audio at ${r.sampleRate} Hz is not supported.`);let u=r.state==="suspended"?r.resume().catch(()=>{}):void 0,l=bo(Math.round(r.sampleRate/4)),I=r.createScriptProcessor(1024,1,1);I.onaudioprocess=te=>l.pull(te.outputBuffer.getChannelData(0));let y=r.createMediaStreamDestination();I.connect(y);let N=new Set,me={queue:l,endedListeners:N,release:()=>{I.onaudioprocess=null,I.disconnect(),l.clear();for(let te of y.stream.getTracks())te.stop();r.close().catch(()=>{})}};Z=me;try{let te=await K({...G,type:"microphone-open",id:m(f),payload:{sampleRate:r.sampleRate}},12e4);if(!te||!("opened"in te)||te.opened!==!0)throw new E("HOST_REJECTED","Host did not open the microphone.");if(await u,Z!==me)throw new E("DISCONNECTED","The microphone closed while it was opening.")}catch(te){throw Z===me&&(Z=null),me.release(),ct(),te}return{stream:y.stream,close:()=>{Z===me&&(Z=null,me.release(),ct())},onEnded:te=>(N.add(te),()=>{N.delete(te)})}},Ao=o=>{!nn(o)||!rr(o)||(o.preventDefault(),mo())},ho=o=>{!nn(o)||o.key!=="Escape"||S?.surface!=="popover"||!S.popover||(o.preventDefault(),xo(S.popover.id,"escape").catch(()=>{}))},Xe=()=>{let o=S?.surface==="popover"?S.popover:void 0;if(!o)return;let r=ve||Ce;_o!==r&&(_o=r,ko(o.id,r).catch(()=>{}))},$e=()=>{S?.surface!=="popover"||ve||(ve=!0,Xe())},Oo=o=>{S?.surface!=="popover"||o.relatedTarget!==null||!ve||(ve=!1,Xe())},go=()=>{S?.surface!=="popover"||Ce||(Ce=!0,Xe())},Ro=()=>{S?.surface!=="popover"||!Ce||(Ce=!1,Xe())},re=(o,r=1024)=>{if(!o.trim()||o.length>r)throw new E("HOST_REJECTED",`Identity must contain 1 to ${r} characters.`)},dt=async o=>{o.kind!=="projects"&&re(o.projectId);let r=await K({...G,type:"workspace-read",id:m(f),payload:o});if(!r||!("kind"in r)||!("state"in r)||r.kind!==o.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return r},lt=async(o,r)=>{o.kind!=="projects"&&re(o.projectId);let u=m(f);j.set(u,r);try{await $({...G,type:"workspace-subscribe",id:m(f),payload:{subscriptionId:u,query:o}})}catch(l){throw j.delete(u),ne||J({...G,type:"workspace-unsubscribe",id:m(f),payload:{subscriptionId:u}}),l}return()=>{!j.delete(u)||ne||J({...G,type:"workspace-unsubscribe",id:m(f),payload:{subscriptionId:u}})}},Wn=async(o,r)=>{o.kind==="session"&&re(o.sessionId),o.kind==="project"&&re(o.projectId);let u=m(f);de.set(u,r);try{await $({...G,type:"shells-subscribe",id:m(f),payload:{subscriptionId:u,scope:o}})}catch(l){throw de.delete(u),ne||J({...G,type:"shells-unsubscribe",id:m(f),payload:{subscriptionId:u}}),l}return()=>{!de.delete(u)||ne||J({...G,type:"shells-unsubscribe",id:m(f),payload:{subscriptionId:u}})}},Ve=async o=>{if("key"in o&&(o.key.length===0||o.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(o.op==="set"&&!Ae(o.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(o.op==="set"&&new TextEncoder().encode(JSON.stringify(o.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(o.scope==="device"&&S?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let r=await K({...G,type:"storage",id:m(f),payload:o});if(!r||!("storage"in r)||r.op!==o.op)throw new E("HOST_REJECTED","Host did not return storage data.");return r},xo=(o,r)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===o)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-close",id:m(f),payload:r?{id:o,reason:r}:{id:o}}),ko=(o,r)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===o)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-anchor",id:m(f),payload:{id:o,active:r}});return t.addEventListener("keydown",ho,!0),t.addEventListener("pointerover",$e),t.addEventListener("pointermove",$e),t.addEventListener("pointerout",Oo),t.addEventListener("focus",go),t.addEventListener("blur",Ro),{onAction:o=>(_=o,()=>{_===o&&(_=null)}),listProjects:async()=>{let o=await dt({kind:"projects"});if(o.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return o},listWorktrees:async o=>{let r=await dt({kind:"worktrees",projectId:o});if(r.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return r},listSessions:async o=>{let r=await dt({kind:"sessions",projectId:o});if(r.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return r},onProjects:o=>lt({kind:"projects"},r=>{r.kind==="projects"&&o(r)}),onWorktrees:(o,r)=>lt({kind:"worktrees",projectId:o},u=>{u.kind==="worktrees"&&r(u)}),onSessions:(o,r)=>lt({kind:"sessions",projectId:o},u=>{u.kind==="sessions"&&r(u)}),onRunningShells:(o,r)=>Wn(o,r),readShellOutput:async(o,r)=>{re(o,128);let u=r?.cursor;if(u!==void 0&&(!Number.isInteger(u)||u<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let l=r?.tailBytes;if(l!==void 0&&(!Number.isInteger(l)||l<1||l>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let y=await K({...G,type:"shell-output",id:m(f),payload:{shellId:o,cursor:u,tailBytes:l}});if(!y||typeof y.output!="string"||!Number.isFinite(y.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return y},stopShell:async o=>{if(re(o,128),(await K({...G,type:"shell-stop",id:m(f),payload:{shellId:o}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async o=>{re(o),await $({...G,type:"open-session",id:m(f),payload:{sessionId:o}})},storage:{get:async(o,r)=>{let u=Ze(r),l={op:"get",key:o};u&&(l.scope=u);let I=await Ve(l);return I.op==="get"&&I.found?I.value:void 0},set:async(o,r,u)=>{let l=Ze(u),I={op:"set",key:o,value:r};l&&(I.scope=l),await Ve(I)},delete:async(o,r)=>{let u=Ze(r),l={op:"delete",key:o};u&&(l.scope=u),await Ve(l)},keys:async o=>{let r=Ze(o),u={op:"keys"};r&&(u.scope=r);let l=await Ve(u);if(l.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return l.keys}},onReady:o=>(i.add(o),S&&o(S),()=>{i.delete(o)}),onDirectory:o=>(c.add(o),S&&o(S.directory),()=>{c.delete(o)}),onSession:o=>(p.add(o),S&&o(S.session),()=>{p.delete(o)}),onSessionLifecycle:o=>(A.add(o),se&&o(se),()=>{A.delete(o)}),onConnection:o=>(P.add(o),S&&o(S.connection),()=>{P.delete(o)}),onSettings:o=>(v.add(o),S&&o(S.settings),()=>{v.delete(o)}),onItem:o=>(W.add(o),S&&o(S.item),()=>{W.delete(o)}),onBlock:o=>(z.add(o),S?.block&&o(S.block),()=>{z.delete(o)}),onServiceEvent:o=>(q.add(o),()=>{q.delete(o)}),onStatusControl:o=>(O.add(o),()=>{O.delete(o)}),onPopoverClosed:o=>(h.add(o),()=>{h.delete(o)}),setStatusControls:o=>S?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):Mo(o)?$({...G,type:"status-controls",id:m(f),payload:{controls:o}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:o=>S?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):Tt(o)?$({...G,type:"popover-open",id:m(f),payload:o}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:xo,setPopoverAnchorActive:ko,onResolve:o=>(d=o,()=>{d===o&&(d=null)}),toast:o=>{let r=o.message.trim();return!r||r.length>Be?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${Be} characters.`)):o.copy&&o.copy!==!0&&(!o.copy.text.length||o.copy.text.length>Ke)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${Ke} characters.`)):$({channel:k,v:1,type:"toast",id:m(f),payload:{...o,message:r}})},openUrl:o=>$({channel:k,v:1,type:"open-url",id:m(f),payload:{url:o}}),openCommit:o=>Ot(o)?$({channel:k,v:1,type:"open-commit",id:m(f),payload:{sha:o}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:o=>$({channel:k,v:1,type:"block-answer",id:m(f),payload:{text:o.trim().slice(0,mt)}}),openSurface:o=>$({channel:k,v:1,type:"open-surface",id:m(f),payload:{surfaceId:o}}),writeClipboard:o=>$({channel:k,v:1,type:"clipboard-write",id:m(f),payload:{text:o}}),compose:o=>$({channel:k,v:1,type:"compose",id:m(f),payload:o}),attach:o=>$({channel:k,v:1,type:"attach",id:m(f),payload:he(o)}),startSession:async o=>{o.projectId!==void 0&&re(o.projectId);let r=o.worktree;r&&r!==!0&&(r.kind==="existing"?re(r.directory):(r.name!==void 0&&re(r.name,200),r.baseBranch!==void 0&&re(r.baseBranch,200)));let u=await K({channel:k,v:1,type:"start-session",id:m(f),payload:kt(o)},e.requestTimeoutMs??18e4);if(!At(u))throw new E("HOST_REJECTED","Host did not return a session.");return u},prompt:o=>K({channel:k,v:1,type:"prompt",id:m(f),payload:bt(o)}).then(r=>{if(!ht(r))throw new E("HOST_REJECTED","Host did not return a prompt result.");return r}),sessionLink:o=>$({channel:k,v:1,type:"session-link",id:m(f),payload:he(o)}),close:()=>$({channel:k,v:1,type:"close",id:m(f)}),oauthStart:()=>$({channel:k,v:1,type:"oauth-start",id:m(f)}),oauthDisconnect:()=>$({channel:k,v:1,type:"oauth-disconnect",id:m(f)}),request:o=>(Ye(o.path)?K({channel:k,v:1,type:"request",id:m(f),payload:o}):rn()).then(r=>{if(!Je(r))throw new E("HOST_REJECTED","Host request result was empty.");return r}),serviceRequest:o=>(Ye(o.path)?K({channel:k,v:1,type:"service-request",id:m(f),payload:o}):rn()).then(r=>{if(!Je(r))throw new E("HOST_REJECTED","Host service request result was empty.");return r}),serviceStatus:()=>K({channel:k,v:1,type:"service-status",id:m(f)}).then(o=>{if(!vt(o))throw new E("HOST_REJECTED","Host did not return service status.");return o}),readFile:o=>(Oe(o)?K({channel:k,v:1,type:"file-read",id:m(f),payload:{path:o}}):Qe()).then(r=>{if(!Ct(r))throw new E("HOST_REJECTED","Host did not return file content.");return r}),writeFile:(o,r)=>Oe(o)?r.length>We?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${We} characters.`)):K({channel:k,v:1,type:"file-write",id:m(f),payload:{path:o,content:r}}).then(u=>{if(!Mt(u))throw new E("HOST_REJECTED","Host did not confirm the write.");return u}):Qe(),listDir:o=>(Oe(o)?K({channel:k,v:1,type:"file-list",id:m(f),payload:{path:o}}):Qe()).then(r=>{if(!Ut(r))throw new E("HOST_REJECTED","Host did not return directory entries.");return r}),stat:o=>(Oe(o)?K({channel:k,v:1,type:"file-stat",id:m(f),payload:{path:o}}):Qe()).then(r=>{if(!wt(r))throw new E("HOST_REJECTED","Host did not return file status.");return r}),generate:o=>{let r=o.prompt.trim(),u=o.system?.trim();if(r.length===0||r.length>ze)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${ze} characters.`));if(u!==void 0&&(u.length===0||u.length>qe))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${qe} characters.`));let l=o.maxOutputTokens===void 0?void 0:Math.min(Rt,Math.max(1,Math.floor(o.maxOutputTokens)));if(l!==void 0&&!Number.isFinite(l))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let I={prompt:r};return u!==void 0&&(I.system=u),l!==void 0&&(I.maxOutputTokens=l),K({channel:k,v:1,type:"generate",id:m(f),payload:I},e.requestTimeoutMs??xt).then(y=>{if(!Nt(y))throw new E("HOST_REJECTED","Host did not return generated text.");return y})},onLateGenerateResult:o=>{T.add(o);for(let r of V.splice(0))w([o],r);return To(),()=>{T.delete(o)}},openMicrophone:jn,setBadge:o=>$({channel:k,v:1,type:"badge",id:m(f),payload:{count:It(o)}}),setHeight:o=>$({channel:k,v:1,type:"resize",id:m(f),payload:{height:yt(o)}}),onFileOpen:o=>(g.add(o),U||(U=!0,t.addEventListener("keydown",Ao,!0)),Y&&o(Y),()=>{g.delete(o)}),onFileSnapshot:o=>(M=o,()=>{M===o&&(M=null)}),onFileSaved:o=>(x.add(o),()=>{x.delete(o)}),reportFileChange:o=>at({...G,type:"file-change",payload:{dirty:o.dirty,edited:o.edited}}),requestFileSave:mo,reportFileUnsupported:()=>at({...G,type:"file-unsupported"}),dispose:()=>{for(let o of j.keys())J({...G,type:"workspace-unsubscribe",id:m(f),payload:{subscriptionId:o}});j.clear();for(let o of de.keys())J({...G,type:"shells-unsubscribe",id:m(f),payload:{subscriptionId:o}});de.clear(),Z&&(ct(),Z.release(),Z=null),ne=!0,d=null,_=null,M=null,g.clear(),x.clear(),U&&t.removeEventListener("keydown",Ao,!0),t.removeEventListener("message",fo),t.removeEventListener("keydown",ho,!0),t.removeEventListener("pointerover",$e),t.removeEventListener("pointermove",$e),t.removeEventListener("pointerout",Oo),t.removeEventListener("focus",go),t.removeEventListener("blur",Ro);for(let o of C.values())clearTimeout(o.timer),o.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));C.clear(),i.clear(),c.clear(),p.clear(),A.clear(),P.clear(),v.clear(),W.clear(),z.clear(),q.clear(),O.clear(),h.clear(),T.clear(),V.length=0}}};var pn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var us=new Set(pn);var sr=10*6e4;var ir=10*6e4;var ar=10*6e4;var cr=10*6e4;var un=["none","agent","user"];var _s=new Set(un);var dr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],lr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],En=(e,t)=>{t.style.colorScheme=e.mode;for(let[n,s]of dr)t.style.setProperty(n,e.tokens[s]);for(let[n,s,i]of lr){let c=e.tokens[i]??"";t.style.setProperty(n,c),t.style.setProperty(s,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},$t=(e,t)=>{En(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var pr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},L=(e,t)=>`var(--${e}, var(--oc-${pr[e]}, ${t}))`,ae=L("surface-background","transparent"),tt=L("surface-elevated","transparent"),ge=L("surface-elevated-foreground","inherit"),ee=L("surface-foreground","inherit"),H=L("surface-muted-foreground","gray"),ur=L("surface-muted","transparent"),Ee=L("interactive-border","currentColor"),Q=L("interactive-hover","transparent"),_e=L("interactive-active","transparent"),Vt=L("interactive-selection","transparent"),Ft=L("interactive-selection-foreground","inherit"),ie=L("primary","currentColor"),Bt=L("primary-text","inherit"),Kt=L("error-text","inherit"),Er=L("font-sans","inherit"),jt=L("font-mono","monospace"),fn=L("radius","9px"),Wt=`calc(${fn} - 2px)`,_n=`calc(${fn} - 4px)`,X=(e,t,n="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${n})`,Sn=`background-image: linear-gradient(${Q}, ${Q});`,zt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,qt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Tn="box-shadow: var(--oc-sdk-lit);",Yt=`inset 0 0.5px 0 0 ${X(ee,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,_r=`
:root {
  --oc-sdk-edge: ${X(ee,16)};
  --oc-sdk-field-bg: ${tt};
  --oc-sdk-raised-bg: ${ae};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(ee,14)};
  --oc-sdk-field-bg: ${X(ae,50,tt)};
  --oc-sdk-raised-bg: ${tt};
  --oc-sdk-field-lift: ${Yt};
  --oc-sdk-raised-lift: ${Yt};
  --oc-sdk-lit: ${Yt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,et=e=>{let t=L(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${L(`${e}-text`,"inherit")}; }`},a=e=>`calc(${e}rem / 14)`,Sr=`
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
`,mn=`${_r}
.oc-sdk { color: ${ee}; font-family: ${Er}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Sn} }
.oc-sdk-mono { font-family: ${jt}; }
.oc-sdk-muted { color: ${H}; }
${et("success")}${et("warning")}${et("error")}${et("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ie}; --oc-sdk-tone-text: ${Bt}; }

.oc-sdk-btn { border-radius: ${Wt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${_n}; }
.oc-sdk-btn[data-variant="default"] { color: ${Bt}; background: ${X(ie,10,ae)}; border-color: ${X(ie,12)}; ${Tn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(ie,16,ae)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(ie,22,ae)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${ur}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${_e}, ${_e}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ge}; ${qt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${_e}, ${_e}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${Q}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${_e}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${L("status-error","red")}; color: ${Kt}; background: ${X("var(--oc-sdk-tone)",7,ae)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${Tn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,ae)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,ae)}; box-shadow: none; }

.oc-sdk-field-note { color: ${H}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Kt}; }
.oc-sdk-input { border-radius: ${Wt}; background: var(--oc-sdk-field-bg); color: ${ge}; ${zt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${H}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${zt(X(ee,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${zt(L("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${jt}; }

.oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ie}; }
.oc-sdk-search-clear { border-radius: ${_n}; color: ${H}; }
.oc-sdk-search-clear:hover { background: ${Q}; color: ${ee}; }

.oc-sdk-trigger { border-radius: ${Wt}; background: var(--oc-sdk-raised-bg); color: ${ge}; ${qt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${Q}, ${Q}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${_e}, ${_e}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${H}; }
.oc-sdk-trigger-chevron { color: ${H}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ge}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${tt}; background-clip: padding-box; color: ${ge}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${Q}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Vt}; color: ${Ft}; }
.oc-sdk-option-check { color: ${ee}; }
.oc-sdk-option[data-destructive="true"] { color: ${Kt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(L("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${H}; }
.oc-sdk-popup-empty { color: ${H}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Ee}; border-radius: 4px; color: ${ee}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(ee,60,Ee)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Ee}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${ae}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ie}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Sn} }
.oc-sdk-check-desc { color: ${H}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(ee,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${H}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ee}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Ft}; background: ${Vt}; border-color: ${Ee}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ge}; background: var(--oc-sdk-raised-bg); ${qt} }
.oc-sdk-tab-count { color: ${H}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(ee,6)}; color: ${H}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${Q}; }
.oc-sdk-row[aria-selected="true"] { background: ${Vt}; color: ${Ft}; }
.oc-sdk-row-lead { font-family: ${jt}; color: ${H}; }
.oc-sdk-row-sub { color: ${H}; }
.oc-sdk-row-meta { color: ${H}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${H}; }

.oc-sdk-empty-body { color: ${H}; }

.oc-sdk-spinner { color: ${H}; }
.oc-sdk-spinner-ring { border-color: ${Ee}; border-top-color: ${ie}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${H}; }

.oc-sdk-separator { color: ${H}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X(Ee,40)}; }

.oc-sdk-progress-label { color: ${H}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(ee,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ie}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${L("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${L("success-text","inherit")}; }

.oc-sdk-text a { color: ${Bt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(Ee,60)}; }
`,F=`
${pt}
${Sr}
${mn}`;var An="oc-sdk-ui-style",Re=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},B=e=>{let t=document.getElementById(An);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}ut(document);let n=document.createElement("style");n.id=An,n.textContent=e,document.head.appendChild(n)},D=(e,t)=>{let n=document.createElement(e);return t&&(n.className=t),n},ce=e=>{let t=D("button",e);return t.type="button",t},oe=(e,t)=>{let n=t??"";e.textContent!==n&&(e.textContent=n)},le=(e,t,n)=>{n==null||n===""?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)},hn=(e,t)=>{let n=s=>{s.target instanceof Node&&e.contains(s.target)||t()};return document.addEventListener("pointerdown",n,!0),()=>{document.removeEventListener("pointerdown",n,!0)}};var Tr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ue=(e,t)=>{B(F);let n=t,s=ce("oc-sdk oc-sdk-btn"),i=Tr(),c=document.createElement("span");s.append(c),e.append(s);let p=()=>{s.dataset.variant=n.variant??"default",s.dataset.size=n.size??"default",s.disabled=!!n.disabled||!!n.loading,s.dataset.loading=n.loading?"true":"false",s.setAttribute("aria-busy",n.loading?"true":"false"),n.loading&&i.parentNode!==s?s.prepend(i):!n.loading&&i.parentNode===s&&i.remove(),oe(c,n.label)},A=()=>{n.disabled||n.loading||n.onClick()};return s.addEventListener("click",A),p(),{update:P=>{n={...n,...P},p()},dispose:()=>{s.removeEventListener("click",A),s.remove()}}};var On="http://www.w3.org/2000/svg",fr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},xe=(e,t,n)=>{let s=document.createElementNS(On,"svg");s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("width",String(t)),s.setAttribute("height",String(t)),s.style.width=a(t),s.style.height=a(t),s.setAttribute("aria-hidden","true"),s.setAttribute("fill","currentColor"),n&&s.setAttribute("class",n);let i=document.createElementNS(On,"path");return i.setAttribute("d",fr[e]),s.append(i),s};var ke=(e,t="vertical")=>{let[n,s]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===n||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===s||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},be=(e,t,n)=>{let s=e.filter(P=>!P.disabled);if(s.length===0)return null;let i=s[0],c=s[s.length-1];if(n==="first"||!i||!c)return i?.id??null;if(n==="last")return c.id;let p=s.findIndex(P=>P.id===t);return p===-1?n==="next"?i.id:c.id:s[Math.min(s.length-1,Math.max(0,p+(n==="next"?1:-1)))]?.id??null};var gn=(e,t)=>`${e}-${t??""}`,Jt=(e,t,n,s)=>{let i=ce("oc-sdk-option");i.id=gn(e,n.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!n.disabled,t==="option"&&i.setAttribute("aria-selected",n.selected?"true":"false"),i.dataset.destructive=n.destructive?"true":"false";let c=D("span","oc-sdk-option-label");if(c.textContent=n.label,i.append(c),n.hint){let p=D("span","oc-sdk-option-hint");p.textContent=n.hint,i.append(p)}if(t==="option"){i.dataset.mark="check";let p=D("span","oc-sdk-option-check");p.append(xe("check",14)),i.append(p)}return i.addEventListener("pointerenter",s.hover),i.addEventListener("click",s.pick),i},Qt=(e,t,n,s)=>{let i=gn(n,s);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===i?"true":"false");le(t,"aria-activedescendant",s?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var mr=(e,t)=>{let n=t.getBoundingClientRect();e.style.minWidth=`${Math.round(n.width)}px`,e.style.left=`${Math.round(n.left)}px`,e.style.top=`${Math.round(n.bottom+4)}px`;let s=e.offsetHeight,i=window.innerHeight-n.bottom-8;s>i&&n.top-8>i&&(e.style.top=`${Math.max(8,Math.round(n.top-4-s))}px`);let c=n.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(n.left-c))}px`)},Zt=(e,t,n,s)=>{e.append(n),mr(n,t);let i=hn(e,s),c=()=>{s()},p=A=>{A.target instanceof Node&&n.contains(A.target)||s()};return window.addEventListener("resize",c),window.addEventListener("scroll",p,!0),()=>{i(),window.removeEventListener("resize",c),window.removeEventListener("scroll",p,!0),n.remove()}};var eo=(e,t)=>{le(e,"data-tone",t&&t!=="neutral"?t:null)},to=(e,t)=>{B(F);let n=t,s=D("span","oc-sdk oc-sdk-badge");e.append(s);let i=()=>{oe(s,n.label),eo(s,n.tone)};return i(),{update:c=>{n={...n,...c},i()},dispose:()=>{s.remove()}}};var Rn=e=>e.filter(t=>!("separator"in t)),Ar=0,oo=(e,t)=>{B(F);let n=t,s=`oc-sdk-menu-${Ar+=1}`,i=D("div","oc-sdk oc-sdk-menu");e.append(i);let c=D("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let p=null,A=null,P=Ue(i,{label:n.label,variant:n.variant,size:n.size,onClick:()=>{p?q():O()}}),v=i.querySelector("button");v?.setAttribute("aria-haspopup","menu");let W=d=>{A=d,Qt(c,c,s,d)},z=()=>{Re(c);for(let d of n.items){if("separator"in d){let _=D("div","oc-sdk-separator");_.dataset.labeled="false",c.append(_);continue}c.append(Jt(s,"menuitem",d,{hover:()=>W(d.id),pick:()=>h(d.id)}))}W(Rn(n.items).some(d=>d.id===A)?A:null)},q=()=>{let d=p;p=null,d?.(),A=null,v?.setAttribute("aria-expanded","false")},O=()=>{p||!v||(z(),p=Zt(i,v,c,q),v.setAttribute("aria-expanded","true"),c.focus())},h=d=>{q(),v?.focus(),n.onSelect(d)},T=d=>{let _=ke(d);_?(d.preventDefault(),W(be(Rn(n.items),A,_))):d.key==="Enter"||d.key===" "?(d.preventDefault(),A&&h(A)):d.key==="Escape"&&(d.preventDefault(),q(),v?.focus())},V=d=>{p&&!(d.relatedTarget instanceof Node&&i.contains(d.relatedTarget))&&q()};return c.addEventListener("keydown",T),i.addEventListener("focusout",V),{update:d=>{n={...n,...d},P.update({label:n.label,variant:n.variant,size:n.size}),p&&z()},dispose:()=>{q(),c.removeEventListener("keydown",T),i.removeEventListener("focusout",V),P.dispose(),i.remove()}}};var pe=["backlog","todo","in_progress","review","done"],Ne={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},xn=1,kn=200,bn=16e3;var hr=512,Or=/^t_[a-z0-9]{6,40}$/,gr=e=>typeof e=="string"&&pe.includes(e);var we=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let n=e.trim();if(!n)return null;if(n.length>hr)throw new Error(`${t} is too long`);return n},Rr=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>kn)throw new Error(`Title is limited to ${kn} characters`);return t},xr=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>bn)throw new Error(`Description is limited to ${bn} characters`);return e};var kr=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,n=we(t.directory,"worktree.directory");if(!n)throw new Error("worktree.directory is required");return{directory:n,branch:we(t.branch,"worktree.branch")}},no=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},br=(e,t)=>e==null?null:no(e,t);var In=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==xn)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!Or.test(t.id))throw new Error("Task id is invalid");if(!gr(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:xn,id:t.id,title:Rr(t.title),description:xr(t.description),status:t.status,rank:t.rank,projectId:we(t.projectId,"projectId"),sourceBranch:we(t.sourceBranch,"sourceBranch"),worktree:kr(t.worktree),sessionId:we(t.sessionId,"sessionId"),createdAt:no(t.createdAt,"createdAt"),updatedAt:no(t.updatedAt,"updatedAt"),needsAttentionSince:br(t.needsAttentionSince,"needsAttentionSince")}};var vn="task:",yn=16,Ir=e=>`${vn}${e}`,ro=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(vn)),n=[],s=[];for(let i=0;i<t.length;i+=yn)await Promise.all(t.slice(i,i+yn).map(async c=>{try{let p=In(await e.storage.get(c));if(Ir(p.id)!==c)throw new Error("Task id does not match its key");n.push(p)}catch{s.push(c)}}));return{tasks:n,failedKeys:s}};var ot="__all__",Cn="__none__";var so=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),nt=(e,t)=>{if(t.projectId===Cn&&e.projectId!==null||t.projectId!==ot&&t.projectId!==Cn&&e.projectId!==t.projectId)return!1;let n=t.query.trim().toLowerCase();return n?`${e.title}
${e.description}
${e.sourceBranch??""}
${e.sessionId??""}`.toLowerCase().includes(n):!0};var Se={waitingPermissionMeansReview:!0,failedMeansReview:!0},rt=(e,t,n,s=Se)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",c=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return c();case"waiting-question":return i();case"waiting-permission":return s.waitingPermissionMeansReview?i():null;case"idle":return n==="completed"||n==="failed"&&s.failedMeansReview?i():null;default:return null}};var yr=(e,t,n=Se)=>t?rt(e.status,t.activity,t.outcome,n)??e.status:e.status,vr=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,Cr=(e,t,n=Se)=>{let s=vr(e,t),i=yr(e,s,n),c=i!==e.status,p=e.needsAttentionSince!==null||c&&i==="review";return{task:e,displayStatus:i,movedByAgent:c,attention:p,attentionSince:e.needsAttentionSince??(p&&s?s.updatedAt:null),live:s}},Mr=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||so(e.task,t.task),Mn=(e,t,n,s=Se)=>{let i=Object.fromEntries(pe.map(c=>[c,[]]));for(let c of e){if(!nt(c,n))continue;let p=Cr(c,t,s);i[p.displayStatus].push(p)}for(let c of pe)i[c].sort((p,A)=>c==="review"?Mr(p,A):so(p.task,A.task));return i},Un=e=>Object.values(e).reduce((t,n)=>t+n.filter(s=>s.attention&&s.displayStatus!=="done").length,0),wn=e=>Object.values(e).reduce((t,n)=>t+n.filter(s=>s.displayStatus!=="done").length,0),Nn=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},Ln=e=>{switch(e.activity){case"running":return{text:"running",tone:"running"};case"retrying":return{text:"retrying",tone:"running"};case"waiting-question":return{text:"needs your answer",tone:"waiting"};case"waiting-permission":return{text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{text:"finished",tone:"idle"}:e.outcome==="failed"?{text:"failed",tone:"failed"}:{text:"idle",tone:"idle"};default:return null}};var Pn=(e,t,n)=>{let s=n.sessions.find(i=>i.id===e);if(s)return s.archivedAt===null?"linked":"archived";if(n.state!=="ready")return"unknown";if(t!==null){let i=n.coverage.find(c=>c.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return n.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var Dn=(e,t,n,s,i={})=>{let c=i.onLiveChange,p=i.onSnapshot??(()=>{}),A=new Map,P=new Map,v=new Map,W=new Map,z=!1,q=(d,_)=>{if(_.state==="loading")return!1;let g=0;for(let[x,M]of v)M.projectId===d&&(v.delete(x),g+=1);if(_.state!=="ready")return g>0;for(let x of _.sessions)x.parentId===null&&v.set(x.id,{projectId:d,activity:x.activity,outcome:x.outcome,updatedAt:x.updatedAt});return!0},O=(d,_)=>{if(z)return;q(d,_)&&c&&c(),p();for(let x of _.sessions)W.set(x.id,x.directory);if(n)for(let x of P.values()){if(x.projectId!==d||!x.sessionId)continue;let M=Pn(x.sessionId,W.get(x.sessionId)??null,_);if(s&&(M==="deleted"||M==="archived")){s(x.id,x.sessionId,M);continue}let Y=_.sessions.find(C=>C.id===x.sessionId);if(!Y)continue;let U=rt(x.status,Y.activity,Y.outcome,t);U&&n(x.id,U)}},h=d=>{let _=e.onSessions(d,g=>O(d,g));A.set(d,_),_.then(g=>{(z||!A.has(d))&&g()},()=>{})};return{live:()=>v,sync:d=>{if(z)return;P=new Map(d.map(g=>[g.id,g]));let _=new Set(d.filter(g=>g.sessionId&&g.projectId).map(g=>g.projectId));for(let g of _)A.has(g)||h(g);for(let[g,x]of A)if(!_.has(g)){A.delete(g);for(let[M,Y]of v)Y.projectId===g&&v.delete(M);x.then(M=>M(),()=>{})}},dispose:()=>{z=!0;for(let d of A.values())d.then(_=>_(),()=>{});A.clear()}}};var Gn=(e,t)=>{if(!t)return null;let n=e.find(s=>s.directory===t);return n||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,i)=>i.directory.length-s.directory.length)[0]??null)},io=e=>{if(e instanceof E)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var Hn=(e,t)=>{for(let n of e)if(t<n.top+n.height/2)return n.id;return null};var R=(e,t="",n="")=>{let s=document.createElement(e);return t&&(s.className=t),n&&(s.textContent=n),s};var Ur=(e,t)=>{let n=[];return t.onMoveStatus&&n.push(...pe.filter(s=>s!==e.displayStatus).map(s=>({id:`move:${s}`,label:`Move to ${Ne[s]}`}))),t.onEdit&&(n.length>0&&n.push({separator:!0}),n.push({id:"edit",label:"Edit task"})),t.onDelete&&(n.length>0&&n.push({separator:!0}),n.push({id:"delete",label:"Delete task",destructive:!0})),n.length>0?n:null},Xn=(e,t,n)=>{let s=t==="rail",i=R("div",s?"kb-panel-sections":"kb-columns");e.append(i);let c=[],p=null,A=(O,h)=>[...O.querySelectorAll(".kb-draggable-item")].filter(T=>T.dataset.id!==h).map(T=>({id:T.dataset.id??"",top:T.getBoundingClientRect().top,height:T.getBoundingClientRect().height})),P=(O,h,T,V)=>{O.addEventListener("dragover",d=>{p&&(d.preventDefault(),O.classList.add("kb-dragover"))}),O.addEventListener("dragleave",d=>{d.target===O&&O.classList.remove("kb-dragover")}),O.addEventListener("drop",d=>{d.preventDefault(),O.classList.remove("kb-dragover");let _=p??d.dataTransfer?.getData("text/plain")??null;if(p=null,!_)return;if(s&&d.target?.closest?.(".kb-psec-head")){n.onDropEnd?.(_,T);return}let g=Hn(A(h,_),d.clientY);V(_,T,g)})},v=O=>{let{task:h}=O,T=R("div",O.attention?"kb-item kb-attn":"kb-item");s?T.classList.add("kb-panel-row"):T.classList.add("kb-card");let V=n.onDrop!==void 0;V?(T.classList.add("kb-draggable-item"),T.draggable=!0):T.draggable=!1,T.dataset.id=h.id;let d=R("div","kb-panel-main");T.append(d);let _=R("div","kb-item-top");_.append(R("div","kb-panel-title",h.title)),d.append(_);let g=n.projectName(h),x=R("div","kb-panel-sub");g&&x.append(R("span","kb-panel-project",g));let M=O.live?Ln(O.live):h.sessionId?{text:"chat linked",tone:"idle"}:null;if(M){g&&x.append(R("span","kb-panel-sep","\xB7"));let U=R("span","kb-panel-dot");U.dataset.state=M.tone,x.append(U,R("span","kb-panel-live",M.text))}if(d.append(x),s&&O.attention){let U=R("div","kb-panel-actions");if(h.sessionId&&n.onOpenChat){let C=R("button","kb-panel-btn kb-panel-btn-primary","Open chat");C.type="button",C.addEventListener("click",j=>{j.stopPropagation(),n.onOpenChat(h)}),U.append(C)}if(O.displayStatus!=="done"&&n.onMarkDone){let C=n.onMarkDone,j=R("button","kb-panel-btn","Mark done");j.type="button",j.addEventListener("click",de=>{de.stopPropagation(),C(h)}),U.append(j)}U.childElementCount>0&&d.append(U)}O.movedByAgent&&T.append(R("span","kb-panel-chip",`\u2192 ${Ne[O.displayStatus]}`));let Y=Ur(O,n);if(Y){let U=R("span","kb-panel-menu");_.append(U),c.push(oo(U,{label:"\u22EF",variant:"ghost",size:"xs",items:Y,onSelect:C=>{if(C==="delete"&&n.onDelete){n.onDelete(h);return}if(C==="edit"&&n.onEdit){n.onEdit(h);return}if(C.startsWith("move:")){let j=C.slice(5);pe.includes(j)&&n.onMoveStatus&&n.onMoveStatus(h,j)}}}))}if(n.onActivate){let U=()=>n.onActivate(h);T.addEventListener("click",C=>{C.target?.closest(".kb-panel-menu")||U()}),T.tabIndex=0,T.addEventListener("keydown",C=>{(C.key==="Enter"||C.key===" ")&&(C.preventDefault(),U())})}return V&&(T.addEventListener("dragstart",U=>{p=h.id,T.classList.add("kb-dragging"),U.dataTransfer?.setData("text/plain",h.id),U.dataTransfer&&(U.dataTransfer.effectAllowed="move")}),T.addEventListener("dragend",()=>{p=null,T.classList.remove("kb-dragging")})),T},W=(O,h)=>{let T=R("div","kb-column");T.dataset.status=O;let V=R("div","kb-column-head");V.append(R("span","kb-column-title",Ne[O]));let d=R("span","kb-column-count",String(h.length));h.some(g=>g.attention&&g.displayStatus!=="done")&&(d.dataset.attn="true"),V.append(d);let _=R("div","kb-column-body");T.append(V,_),h.length===0&&_.append(R("div","kb-column-empty","No tasks"));for(let g of h)_.append(v(g));return n.onDrop&&P(T,_,O,n.onDrop),T},z=(O,h)=>{let T=R("div","kb-psec"),V=n.onToggleSection!==void 0,d=V&&(n.isCollapsed?.(O)??!1),_=V?document.createElement("button"):R("div","kb-psec-head");_.className="kb-psec-head",_ instanceof HTMLButtonElement&&(_.type="button"),_.append(R("span","kb-psec-name",Ne[O]));let g=R("span","kb-psec-count","0");h.some(M=>M.attention&&M.displayStatus!=="done")&&(g.dataset.attn="true"),_.append(g),V&&(_.append(R("span","kb-psec-chevron",d?"\u25B8":"\u25BE")),_.addEventListener("click",()=>n.onToggleSection?.(O)));let x=R("div","kb-psec-body");if(x.hidden=d,T.append(_,x),!d){h.length===0&&x.append(R("div","kb-panel-empty","No tasks"));for(let M of h)x.append(v(M))}return n.onDrop&&P(T,x,O,n.onDrop),T};return{render:O=>{for(let h of c.splice(0))h.dispose();i.replaceChildren();for(let h of pe)i.append(s?z(h,O[h]):W(h,O[h]))},dispose:()=>{for(let O of c.splice(0))O.dispose();i.replaceChildren()}}};var wr=`
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
}
[hidden]{display:none!important}
`,$n=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=wr,document.head.append(e)};var Te=Xt(),co=document.querySelector("#root");if(!co)throw new Error("Missing #root");var st=!1,ue=!1,Ge=[],lo=[],po=null,Ie=null,uo,Le,ao=!1,fe=!1,Eo=null,Fn,ye,Pe,De,Nr=(e,t)=>e.filter(n=>nt(n,{projectId:t??ot,query:""})),it=e=>{Ge=[...e],Bn.sync(Nr(Ge,Ie?.id??null))},Bn=Dn(Te,Se,null,void 0,{onLiveChange:()=>{fe&&!ue&&He()},onSnapshot:()=>{Pr()}}),Vn=()=>{Ie=Gn(lo,po)};Te.onReady(e=>{if(st)return;st=!0,$t(e,document.documentElement),po=e.directory,$n(),co.replaceChildren();let t=R("div","kb-page kb-rail"),n=R("div","kb-row between");n.append(R("h2","","Kanban"));let s=R("span");n.append(s),t.append(n),ye=R("p","kb-muted","Loading\u2026"),t.append(ye),Pe=R("p","kb-rail-scope"),t.append(Pe),De=R("p","kb-panel-unseen"),t.append(De),Eo=Xn(t,"rail",{projectName:c=>!Ie&&c.projectId?lo.find(p=>p.id===c.projectId)?.name??null:null});let i=R("div","kb-rail-foot");i.append(R("p","kb-muted","Tracking only \u2014 the full board (Extension pages menu) is where tasks are opened and changed.")),t.append(i),co.append(t),Fn=to(s,{label:"",tone:"neutral"}),uo=window.setInterval(()=>{Kn()},3e4),Te.onProjects(c=>{ue||c.state!=="ready"||(lo=c.projects,Vn(),it(Ge),fe&&He())}).then(()=>{},()=>{}),Te.onDirectory(c=>{ue||(po=c,Vn(),it(Ge),fe&&He())}),Lr()});var Lr=async()=>{try{let e=await ro(Te);if(ue)return;it(e.tasks),fe=!0,ye.hidden=!0,He()}catch(e){ye.textContent=`Could not load tasks \u2014 ${io(e)}`}},Kn=async()=>{if(!(!st||ue||ao)){ao=!0;try{let{tasks:e}=await ro(Te);if(ue)return;it(e),fe||(fe=!0,ye.hidden=!0),He()}catch(e){fe||(ye.textContent=`Could not load tasks \u2014 ${io(e)}`)}finally{ao=!1}}},Pr=()=>{Le!==void 0||ue||!st||(Le=window.setTimeout(()=>{Le=void 0,Kn()},500))},He=()=>{let e=Mn(Ge,Bn.live(),{projectId:Ie?.id??ot,query:""}),t=wn(e),n=Un(e);Ie?(Pe.textContent=`Project: ${Ie.name}`,Pe.hidden=!1):Pe.hidden=!0;let s=Nn(t,n);Fn.update({label:s.label,tone:s.tone}),n>0?(De.textContent=`${n} task${n===1?"":"s"} need${n===1?"s":""} your review`,De.hidden=!1):De.hidden=!0,Eo?.render(e)};window.addEventListener("pagehide",()=>{ue=!0,uo!==void 0&&window.clearInterval(uo),Le!==void 0&&window.clearTimeout(Le),Eo?.dispose(),Te.dispose()});})();
