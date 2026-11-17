"use strict";(()=>{var R="openchamber.sdk";var Fe="data-oc-scrolling",_t=`
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
`;function ft(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?t:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let c=o.get(i);c!==void 0&&clearTimeout(c),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Er=`(${ft.toString()})(document);`;var Uo=e=>{let t=[],o=0,s=0;return{push:i=>{for(t.push(i),s+=i.length;s-o>e&&t.length>1;){let c=t.shift();s-=c?.length??0,o=0}},pull:i=>{let c=0;for(;c<i.length&&t.length>0;){let l=t[0],_=Math.min(i.length-c,l.length-o);i.set(l.subarray(o,o+_),c),c+=_,o+=_,o>=l.length&&(t.shift(),s-=l.length,o=0)}i.fill(0,c)},clear:()=>{t.length=0,o=0,s=0},get size(){return s-o}}};var Do=/^[a-z][a-z0-9-]{0,39}$/;var No=e=>Object(e)===e&&!Array.isArray(e),St=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Lo=e=>String(e)===e&&e.length>=1&&e.length<=60,Po=e=>String(e)===e&&e.length>=1&&e.length<=80,Go=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!No(o)||!Do.test(o.id)||!Lo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!St(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!St(o,["kind","id","label","value","options","disabled"])||!Po(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let s=new Set;for(let i of o.options){if(!No(i)||!St(i,["value","label"])||!Po(i.value)||!Lo(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(o.value))return!1}return!0};var fr=1024*1024;var Ho=["{id}","{segment}","{segments+}"];var fs=new Set(Ho);var Xo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Ts=new Set(Xo);var Tt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,$o=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Vo=/^[A-Za-z0-9_-]{1,80}$/;var Bo=["left","right","top","bottom"];var Fo=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!Fo(i,t+1,o))return!1;return!0},mt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(mt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(mt)}return String(e)===e||Number.isFinite(e)},ht=e=>{try{return String(e.id)!==e.id||!Vo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Bo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Fo(e.data)||!mt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var bt=2e3;var jo=["file","directory","other","missing"],kt=e=>!!(e&&"sessionId"in e),At=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Wo=/^[0-9a-f]{7,64}$/i,xt=e=>Wo.test(e),Ke=500,je=32e3,zo=16e3,qo=128,Yo=200,Jo=2e3,Qo=16e3,Zo=80,en=200,tn=16e3;var on=2e3;var Ot=2e4,We=1024,ze=2e6;var qe=64e3,Ye=8e3,Rt=4e3;var yt=96e4,Sr=60*6e4;var nn=999,rn=1e4,Le=500,sn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],an=["stopped","starting","ready","failed"],Tr=new Set(sn),cn=e=>Tr.has(e),dn=e=>e&&cn(e)?e:"HOST_REJECTED",be=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(be):Object(e)===e?Object.values(e).every(be):!1,ln=e=>be(e)&&JSON.stringify(e).length<=tn,Ko=e=>e?.trim().slice(0,en)??"",ke=e=>{let t=e.id.trim().slice(0,qo),o=e.title.trim().slice(0,Yo),s=e.url.trim().slice(0,Jo),i=e.text?.trim().slice(0,Qo),c=e.author?.trim().slice(0,Zo),l=e.kind==="pull"?"pull":"issue",_={providerId:e.providerId.trim(),id:t,title:o||t,url:s,kind:l};if(i&&(_.text=i),c&&(_.author=c),l==="pull"){let O=Ko(e.branches?.head),U=Ko(e.branches?.base);O&&U&&(_.branches={head:O,base:U})}return ln(e.data)&&(_.data=e.data),_},It=e=>{let t=ke(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},vt=e=>{let t={text:e.text.trim().slice(0,zo)};return e.send&&(t.send=!0),t},Mt=e=>e===null||!Number.isFinite(e)?null:Math.min(nn,Math.max(0,Math.round(e))),wt=e=>Number.isFinite(e)?Math.min(rn,Math.max(0,Math.ceil(e))):0;var Ae=e=>e.length>0&&e.length<=We&&!e.includes("\0")&&!e.includes("\\");var Je=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>on?!1:!e.split("/").some(o=>o==="."||o===".."),mr=new Set(an),Ct=e=>!!(e&&"status"in e&&mr.has(String(e.status))&&!("body"in e)),Qe=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Ut=e=>!!(e&&"content"in e&&String(e.content)===e.content),Nt=e=>!!(e&&"written"in e&&e.written===!0),Lt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),hr=new Set(jo),Pt=e=>!!(e&&"kind"in e&&"size"in e&&hr.has(String(e.kind))&&Number.isFinite(e.size)),Dt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),gr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),br=e=>Object(e)===e?e:null,gt=e=>String(e)===e&&e.length>0,kr=e=>{if(!gt(e.id))return null;if(e.ok===!0){let t={channel:R,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&gt(e.error)?{channel:R,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:dn(gt(e.code)?e.code:void 0)}:null},Gt=e=>{let t=br(e);return!t||t.channel!==R||t.v!==1?null:t.type==="result"?kr(t):!gr.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var pn=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Ar=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",E=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},un=()=>Promise.reject(new E("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Ze=()=>Promise.reject(new E("BAD_PATH",`File path must be 1 to ${We} characters without NUL or backslash.`)),et=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new E("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},b=e=>(e.value+=1,`oc-${e.value}`),Bt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new E("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),s=e.requestTimeoutMs??Ot,i=new Set,c=new Set,l=new Set,_=new Set,O=new Set,U=new Set,W=new Set,z=new Set,q=new Set,T=new Set,m=new Set,h=new Set,V=[],d=null,f=null,k=new Set,A=new Set,C=null,K=null,se=!1,v=new Map,I=new Map,te=new Map,Q=!1,g={value:0},S=null,ie=null,Ue=!1,Ne=!1,bo=null,Z=null,ko=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,Y=n=>{t.parent.postMessage(n,"*")},Ao=()=>{Q||t.parent===t||h.size===0||S?.features?.lateGenerateResults!==!0||Y({channel:R,v:1,type:"generate-late-listen"})},N=(n,r)=>{for(let u of n)try{u(r)}catch(p){console.error(p)}},xo=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let r=Gt(n.data);if(!r)return;if(r.type==="workspace"){let p=I.get(r.payload.subscriptionId);p&&N([p],r.payload.snapshot);return}if(r.type==="shells"){let p=te.get(r.payload.subscriptionId);p&&N([p],r.payload.snapshot);return}if(r.type==="microphone-audio"){Z?.queue.push(r.payload.samples);return}if(r.type==="microphone-ended"){let p=Z;if(!p)return;Z=null,p.release(),N(p.endedListeners,r.payload.reason);return}if(r.type==="ready"){S=r.payload,ie=ko(r.payload.session),N(i,r.payload),N(c,r.payload.directory),N(l,r.payload.session),ie&&N(_,ie),N(O,r.payload.connection),N(U,r.payload.settings),N(W,r.payload.item),r.payload.block&&N(z,r.payload.block),Ao();return}if(r.type==="service-event"){N(q,r.payload);return}if(r.type==="generate-late"){h.size===0?V.push(r.payload):N(h,r.payload);return}if(r.type==="directory"){S&&(S={...S,directory:r.payload.directory}),N(c,r.payload.directory);return}if(r.type==="session"){S&&(S={...S,session:r.payload.session}),r.payload.session?ie?.sessionId!==r.payload.session.id&&(ie=ko(r.payload.session)):ie=null,N(l,r.payload.session);return}if(r.type==="session-lifecycle"){ie=r.payload,N(_,r.payload);return}if(r.type==="connection"){S&&(S={...S,connection:r.payload.connection}),N(O,r.payload.connection);return}if(r.type==="settings"){S&&(S={...S,settings:r.payload.settings}),N(U,r.payload.settings);return}if(r.type==="item"){S&&(S={...S,item:r.payload.item}),N(W,r.payload.item);return}if(r.type==="status-control-event"){N(T,r.payload);return}if(r.type==="popover-closed"){N(m,r.payload);return}if(r.type==="action"){let p=w=>{Q||Y({channel:R,v:1,type:"action-result",id:r.id,payload:w})},M=f;if(!M){p({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>M(r.payload)).then(()=>p({ok:!0}),w=>{let L=(w instanceof Error?w.message:String(w)).trim();p({ok:!1,error:(L||"Action failed.").slice(0,Le)})});return}if(r.type==="file-open"){let p=r.payload;if(K&&$o(K,p))return;K=p,N(k,r.payload);return}if(r.type==="file-saved"){N(A,r.payload.version);return}if(r.type==="file-snapshot"){let p=L=>{Q||Y({channel:R,v:1,type:"file-snapshot-result",id:r.id,payload:L})},M=L=>p({error:(L.trim()||"Could not read the edited file.").slice(0,Le)}),w=C;if(!w){M("This extension does not edit files.");return}Promise.resolve().then(()=>w(r.payload.purpose)).then(L=>{if(Tt(L)>2e7){M(`The file is over ${2e7} ${"bytes"in L?"bytes":"characters"}.`);return}if(L.version.length>256){M(`The snapshot version is over ${256} characters.`);return}p({snapshot:"bytes"in L?{bytes:L.bytes,version:L.version}:{content:L.content,version:L.version}})},L=>M(L instanceof Error?L.message:String(L)));return}if(r.type==="resolve"){let p=w=>{Y({channel:R,v:1,type:"resolve-result",id:r.id,payload:w})},M=d;if(!M){p({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>M(r.payload)).then(w=>p({item:w?ke(w):null}),w=>{let L=(w instanceof Error?w.message:String(w)).trim();p({error:(L||"Command failed.").slice(0,Le)})});return}let u=v.get(r.id);if(u){if(clearTimeout(u.timer),v.delete(r.id),r.ok){u.resolve(r.payload);return}u.reject(new E(r.code,r.error))}};t.addEventListener("message",xo),Y({channel:R,v:1,type:"hello"});let j=(n,r=s)=>Q||t.parent===t?Promise.reject(new E("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((u,p)=>{let M=setTimeout(()=>{v.delete(n.id),p(new E("HOST_TIMEOUT","Host did not answer in time."))},r);v.set(n.id,{resolve:u,reject:p,timer:M}),Y(n)}),$=n=>j(n).then(()=>{}),G={channel:R,v:1},lt=n=>{!Q&&t.parent!==t&&Y(n)},Oo=()=>lt({...G,type:"file-save"}),pt=()=>{!Q&&t.parent!==t&&Y({...G,type:"microphone-close",id:b(g)})},pr=async()=>{if(Z)throw new E("HOST_REJECTED","The microphone is already open in this frame.");if(S?.features?.microphone!==!0)throw new E("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let n=globalThis.AudioContext;if(typeof n!="function")throw new E("UNSUPPORTED","This frame has no Web Audio.");let r=new n;if(r.sampleRate<8e3||r.sampleRate>192e3)throw r.close().catch(()=>{}),new E("UNSUPPORTED",`Audio at ${r.sampleRate} Hz is not supported.`);let u=r.state==="suspended"?r.resume().catch(()=>{}):void 0,p=Uo(Math.round(r.sampleRate/4)),M=r.createScriptProcessor(1024,1,1);M.onaudioprocess=oe=>p.pull(oe.outputBuffer.getChannelData(0));let w=r.createMediaStreamDestination();M.connect(w);let L=new Set,ge={queue:p,endedListeners:L,release:()=>{M.onaudioprocess=null,M.disconnect(),p.clear();for(let oe of w.stream.getTracks())oe.stop();r.close().catch(()=>{})}};Z=ge;try{let oe=await j({...G,type:"microphone-open",id:b(g),payload:{sampleRate:r.sampleRate}},12e4);if(!oe||!("opened"in oe)||oe.opened!==!0)throw new E("HOST_REJECTED","Host did not open the microphone.");if(await u,Z!==ge)throw new E("DISCONNECTED","The microphone closed while it was opening.")}catch(oe){throw Z===ge&&(Z=null),ge.release(),pt(),oe}return{stream:w.stream,close:()=>{Z===ge&&(Z=null,ge.release(),pt())},onEnded:oe=>(L.add(oe),()=>{L.delete(oe)})}},Ro=n=>{!pn(n)||!Ar(n)||(n.preventDefault(),Oo())},yo=n=>{!pn(n)||n.key!=="Escape"||S?.surface!=="popover"||!S.popover||(n.preventDefault(),wo(S.popover.id,"escape").catch(()=>{}))},$e=()=>{let n=S?.surface==="popover"?S.popover:void 0;if(!n)return;let r=Ue||Ne;bo!==r&&(bo=r,Co(n.id,r).catch(()=>{}))},Ve=()=>{S?.surface!=="popover"||Ue||(Ue=!0,$e())},Io=n=>{S?.surface!=="popover"||n.relatedTarget!==null||!Ue||(Ue=!1,$e())},vo=()=>{S?.surface!=="popover"||Ne||(Ne=!0,$e())},Mo=()=>{S?.surface!=="popover"||!Ne||(Ne=!1,$e())},re=(n,r=1024)=>{if(!n.trim()||n.length>r)throw new E("HOST_REJECTED",`Identity must contain 1 to ${r} characters.`)},ut=async n=>{n.kind!=="projects"&&re(n.projectId);let r=await j({...G,type:"workspace-read",id:b(g),payload:n});if(!r||!("kind"in r)||!("state"in r)||r.kind!==n.kind)throw new E("HOST_REJECTED","Host did not return workspace data.");return r},Et=async(n,r)=>{n.kind!=="projects"&&re(n.projectId);let u=b(g);I.set(u,r);try{await $({...G,type:"workspace-subscribe",id:b(g),payload:{subscriptionId:u,query:n}})}catch(p){throw I.delete(u),Q||Y({...G,type:"workspace-unsubscribe",id:b(g),payload:{subscriptionId:u}}),p}return()=>{!I.delete(u)||Q||Y({...G,type:"workspace-unsubscribe",id:b(g),payload:{subscriptionId:u}})}},ur=async(n,r)=>{n.kind==="session"&&re(n.sessionId),n.kind==="project"&&re(n.projectId);let u=b(g);te.set(u,r);try{await $({...G,type:"shells-subscribe",id:b(g),payload:{subscriptionId:u,scope:n}})}catch(p){throw te.delete(u),Q||Y({...G,type:"shells-unsubscribe",id:b(g),payload:{subscriptionId:u}}),p}return()=>{!te.delete(u)||Q||Y({...G,type:"shells-unsubscribe",id:b(g),payload:{subscriptionId:u}})}},Be=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new E("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!be(n.value))throw new E("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new E("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&S?.features?.deviceStorage!==!0)throw new E("UNSUPPORTED","This host does not support device storage.");let r=await j({...G,type:"storage",id:b(g),payload:n});if(!r||!("storage"in r)||r.op!==n.op)throw new E("HOST_REJECTED","Host did not return storage data.");return r},wo=(n,r)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-close",id:b(g),payload:r?{id:n,reason:r}:{id:n}}),Co=(n,r)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===n)?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):$({...G,type:"popover-anchor",id:b(g),payload:{id:n,active:r}});return t.addEventListener("keydown",yo,!0),t.addEventListener("pointerover",Ve),t.addEventListener("pointermove",Ve),t.addEventListener("pointerout",Io),t.addEventListener("focus",vo),t.addEventListener("blur",Mo),{onAction:n=>(f=n,()=>{f===n&&(f=null)}),listProjects:async()=>{let n=await ut({kind:"projects"});if(n.kind!=="projects")throw new E("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let r=await ut({kind:"worktrees",projectId:n});if(r.kind!=="worktrees")throw new E("HOST_REJECTED","Expected worktrees.");return r},listSessions:async n=>{let r=await ut({kind:"sessions",projectId:n});if(r.kind!=="sessions")throw new E("HOST_REJECTED","Expected sessions.");return r},onProjects:n=>Et({kind:"projects"},r=>{r.kind==="projects"&&n(r)}),onWorktrees:(n,r)=>Et({kind:"worktrees",projectId:n},u=>{u.kind==="worktrees"&&r(u)}),onSessions:(n,r)=>Et({kind:"sessions",projectId:n},u=>{u.kind==="sessions"&&r(u)}),onRunningShells:(n,r)=>ur(n,r),readShellOutput:async(n,r)=>{re(n,128);let u=r?.cursor;if(u!==void 0&&(!Number.isInteger(u)||u<0))throw new E("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let p=r?.tailBytes;if(p!==void 0&&(!Number.isInteger(p)||p<1||p>65536))throw new E("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let w=await j({...G,type:"shell-output",id:b(g),payload:{shellId:n,cursor:u,tailBytes:p}});if(!w||typeof w.output!="string"||!Number.isFinite(w.cursor))throw new E("HOST_REJECTED","Host did not return shell output.");return w},stopShell:async n=>{if(re(n,128),(await j({...G,type:"shell-stop",id:b(g),payload:{shellId:n}}))?.stopped!==!0)throw new E("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{re(n),await $({...G,type:"open-session",id:b(g),payload:{sessionId:n}})},storage:{get:async(n,r)=>{let u=et(r),p={op:"get",key:n};u&&(p.scope=u);let M=await Be(p);return M.op==="get"&&M.found?M.value:void 0},set:async(n,r,u)=>{let p=et(u),M={op:"set",key:n,value:r};p&&(M.scope=p),await Be(M)},delete:async(n,r)=>{let u=et(r),p={op:"delete",key:n};u&&(p.scope=u),await Be(p)},keys:async n=>{let r=et(n),u={op:"keys"};r&&(u.scope=r);let p=await Be(u);if(p.op!=="keys")throw new E("HOST_REJECTED","Expected storage keys.");return p.keys}},onReady:n=>(i.add(n),S&&n(S),()=>{i.delete(n)}),onDirectory:n=>(c.add(n),S&&n(S.directory),()=>{c.delete(n)}),onSession:n=>(l.add(n),S&&n(S.session),()=>{l.delete(n)}),onSessionLifecycle:n=>(_.add(n),ie&&n(ie),()=>{_.delete(n)}),onConnection:n=>(O.add(n),S&&n(S.connection),()=>{O.delete(n)}),onSettings:n=>(U.add(n),S&&n(S.settings),()=>{U.delete(n)}),onItem:n=>(W.add(n),S&&n(S.item),()=>{W.delete(n)}),onBlock:n=>(z.add(n),S?.block&&n(S.block),()=>{z.delete(n)}),onServiceEvent:n=>(q.add(n),()=>{q.delete(n)}),onStatusControl:n=>(T.add(n),()=>{T.delete(n)}),onPopoverClosed:n=>(m.add(n),()=>{m.delete(n)}),setStatusControls:n=>S?.features?.statusControls!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support status controls.")):Go(n)?$({...G,type:"status-controls",id:b(g),payload:{controls:n}}):Promise.reject(new E("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>S?.features?.popovers!==!0?Promise.reject(new E("UNSUPPORTED","This host does not support popovers.")):ht(n)?$({...G,type:"popover-open",id:b(g),payload:n}):Promise.reject(new E("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:wo,setPopoverAnchorActive:Co,onResolve:n=>(d=n,()=>{d===n&&(d=null)}),toast:n=>{let r=n.message.trim();return!r||r.length>Ke?Promise.reject(new E("HOST_REJECTED",`Toast message must contain 1 to ${Ke} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>je)?Promise.reject(new E("HOST_REJECTED",`Toast copy text must contain 1 to ${je} characters.`)):$({channel:R,v:1,type:"toast",id:b(g),payload:{...n,message:r}})},openUrl:n=>$({channel:R,v:1,type:"open-url",id:b(g),payload:{url:n}}),openCommit:n=>xt(n)?$({channel:R,v:1,type:"open-commit",id:b(g),payload:{sha:n}}):Promise.reject(new E("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>$({channel:R,v:1,type:"block-answer",id:b(g),payload:{text:n.trim().slice(0,bt)}}),openSurface:n=>$({channel:R,v:1,type:"open-surface",id:b(g),payload:{surfaceId:n}}),writeClipboard:n=>$({channel:R,v:1,type:"clipboard-write",id:b(g),payload:{text:n}}),compose:n=>$({channel:R,v:1,type:"compose",id:b(g),payload:n}),attach:n=>$({channel:R,v:1,type:"attach",id:b(g),payload:ke(n)}),startSession:async n=>{n.projectId!==void 0&&re(n.projectId);let r=n.worktree;r&&r!==!0&&(r.kind==="existing"?re(r.directory):(r.name!==void 0&&re(r.name,200),r.baseBranch!==void 0&&re(r.baseBranch,200)));let u=await j({channel:R,v:1,type:"start-session",id:b(g),payload:It(n)},e.requestTimeoutMs??18e4);if(!kt(u))throw new E("HOST_REJECTED","Host did not return a session.");return u},prompt:n=>j({channel:R,v:1,type:"prompt",id:b(g),payload:vt(n)}).then(r=>{if(!At(r))throw new E("HOST_REJECTED","Host did not return a prompt result.");return r}),sessionLink:n=>$({channel:R,v:1,type:"session-link",id:b(g),payload:ke(n)}),close:()=>$({channel:R,v:1,type:"close",id:b(g)}),oauthStart:()=>$({channel:R,v:1,type:"oauth-start",id:b(g)}),oauthDisconnect:()=>$({channel:R,v:1,type:"oauth-disconnect",id:b(g)}),request:n=>(Je(n.path)?j({channel:R,v:1,type:"request",id:b(g),payload:n}):un()).then(r=>{if(!Qe(r))throw new E("HOST_REJECTED","Host request result was empty.");return r}),serviceRequest:n=>(Je(n.path)?j({channel:R,v:1,type:"service-request",id:b(g),payload:n}):un()).then(r=>{if(!Qe(r))throw new E("HOST_REJECTED","Host service request result was empty.");return r}),serviceStatus:()=>j({channel:R,v:1,type:"service-status",id:b(g)}).then(n=>{if(!Ct(n))throw new E("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Ae(n)?j({channel:R,v:1,type:"file-read",id:b(g),payload:{path:n}}):Ze()).then(r=>{if(!Ut(r))throw new E("HOST_REJECTED","Host did not return file content.");return r}),writeFile:(n,r)=>Ae(n)?r.length>ze?Promise.reject(new E("FILE_TOO_LARGE",`Content is over ${ze} characters.`)):j({channel:R,v:1,type:"file-write",id:b(g),payload:{path:n,content:r}}).then(u=>{if(!Nt(u))throw new E("HOST_REJECTED","Host did not confirm the write.");return u}):Ze(),listDir:n=>(Ae(n)?j({channel:R,v:1,type:"file-list",id:b(g),payload:{path:n}}):Ze()).then(r=>{if(!Lt(r))throw new E("HOST_REJECTED","Host did not return directory entries.");return r}),stat:n=>(Ae(n)?j({channel:R,v:1,type:"file-stat",id:b(g),payload:{path:n}}):Ze()).then(r=>{if(!Pt(r))throw new E("HOST_REJECTED","Host did not return file status.");return r}),generate:n=>{let r=n.prompt.trim(),u=n.system?.trim();if(r.length===0||r.length>qe)return Promise.reject(new E("HOST_REJECTED",`Prompt must be 1 to ${qe} characters.`));if(u!==void 0&&(u.length===0||u.length>Ye))return Promise.reject(new E("HOST_REJECTED",`System prompt must be 1 to ${Ye} characters.`));let p=n.maxOutputTokens===void 0?void 0:Math.min(Rt,Math.max(1,Math.floor(n.maxOutputTokens)));if(p!==void 0&&!Number.isFinite(p))return Promise.reject(new E("HOST_REJECTED","maxOutputTokens must be a number."));let M={prompt:r};return u!==void 0&&(M.system=u),p!==void 0&&(M.maxOutputTokens=p),j({channel:R,v:1,type:"generate",id:b(g),payload:M},e.requestTimeoutMs??yt).then(w=>{if(!Dt(w))throw new E("HOST_REJECTED","Host did not return generated text.");return w})},onLateGenerateResult:n=>{h.add(n);for(let r of V.splice(0))N([n],r);return Ao(),()=>{h.delete(n)}},openMicrophone:pr,setBadge:n=>$({channel:R,v:1,type:"badge",id:b(g),payload:{count:Mt(n)}}),setHeight:n=>$({channel:R,v:1,type:"resize",id:b(g),payload:{height:wt(n)}}),onFileOpen:n=>(k.add(n),se||(se=!0,t.addEventListener("keydown",Ro,!0)),K&&n(K),()=>{k.delete(n)}),onFileSnapshot:n=>(C=n,()=>{C===n&&(C=null)}),onFileSaved:n=>(A.add(n),()=>{A.delete(n)}),reportFileChange:n=>lt({...G,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Oo,reportFileUnsupported:()=>lt({...G,type:"file-unsupported"}),dispose:()=>{for(let n of I.keys())Y({...G,type:"workspace-unsubscribe",id:b(g),payload:{subscriptionId:n}});I.clear();for(let n of te.keys())Y({...G,type:"shells-unsubscribe",id:b(g),payload:{subscriptionId:n}});te.clear(),Z&&(pt(),Z.release(),Z=null),Q=!0,d=null,f=null,C=null,k.clear(),A.clear(),se&&t.removeEventListener("keydown",Ro,!0),t.removeEventListener("message",xo),t.removeEventListener("keydown",yo,!0),t.removeEventListener("pointerover",Ve),t.removeEventListener("pointermove",Ve),t.removeEventListener("pointerout",Io),t.removeEventListener("focus",vo),t.removeEventListener("blur",Mo);for(let n of v.values())clearTimeout(n.timer),n.reject(new E("HOST_UNAVAILABLE","Host client was disposed."));v.clear(),i.clear(),c.clear(),l.clear(),_.clear(),O.clear(),U.clear(),W.clear(),z.clear(),q.clear(),T.clear(),m.clear(),h.clear(),V.length=0}}};var mn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Ns=new Set(mn);var xr=10*6e4;var Or=10*6e4;var Rr=10*6e4;var yr=10*6e4;var hn=["none","agent","user"];var Ps=new Set(hn);var Ir=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],vr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],gn=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,s]of Ir)t.style.setProperty(o,e.tokens[s]);for(let[o,s,i]of vr){let c=e.tokens[i]??"";t.style.setProperty(o,c),t.style.setProperty(s,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Ft=(e,t)=>{gn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Mr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},P=(e,t)=>`var(--${e}, var(--oc-${Mr[e]}, ${t}))`,ce=P("surface-background","transparent"),ot=P("surface-elevated","transparent"),xe=P("surface-elevated-foreground","inherit"),ee=P("surface-foreground","inherit"),H=P("surface-muted-foreground","gray"),wr=P("surface-muted","transparent"),fe=P("interactive-border","currentColor"),J=P("interactive-hover","transparent"),Se=P("interactive-active","transparent"),Kt=P("interactive-selection","transparent"),jt=P("interactive-selection-foreground","inherit"),ae=P("primary","currentColor"),Wt=P("primary-text","inherit"),zt=P("error-text","inherit"),Cr=P("font-sans","inherit"),qt=P("font-mono","monospace"),xn=P("radius","9px"),Yt=`calc(${xn} - 2px)`,bn=`calc(${xn} - 4px)`,X=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,kn=`background-image: linear-gradient(${J}, ${J});`,Jt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Qt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",An="box-shadow: var(--oc-sdk-lit);",Zt=`inset 0 0.5px 0 0 ${X(ee,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Ur=`
:root {
  --oc-sdk-edge: ${X(ee,16)};
  --oc-sdk-field-bg: ${ot};
  --oc-sdk-raised-bg: ${ce};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(ee,14)};
  --oc-sdk-field-bg: ${X(ce,50,ot)};
  --oc-sdk-raised-bg: ${ot};
  --oc-sdk-field-lift: ${Zt};
  --oc-sdk-raised-lift: ${Zt};
  --oc-sdk-lit: ${Zt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,tt=e=>{let t=P(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${P(`${e}-text`,"inherit")}; }`},a=e=>`calc(${e}rem / 14)`,Nr=`
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
`,On=`${Ur}
.oc-sdk { color: ${ee}; font-family: ${Cr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${kn} }
.oc-sdk-mono { font-family: ${qt}; }
.oc-sdk-muted { color: ${H}; }
${tt("success")}${tt("warning")}${tt("error")}${tt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ae}; --oc-sdk-tone-text: ${Wt}; }

.oc-sdk-btn { border-radius: ${Yt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${bn}; }
.oc-sdk-btn[data-variant="default"] { color: ${Wt}; background: ${X(ae,10,ce)}; border-color: ${X(ae,12)}; ${An} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(ae,16,ce)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(ae,22,ce)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${wr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Se}, ${Se}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${xe}; ${Qt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Se}, ${Se}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${J}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Se}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${P("status-error","red")}; color: ${zt}; background: ${X("var(--oc-sdk-tone)",7,ce)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${An} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,ce)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,ce)}; box-shadow: none; }

.oc-sdk-field-note { color: ${H}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${zt}; }
.oc-sdk-input { border-radius: ${Yt}; background: var(--oc-sdk-field-bg); color: ${xe}; ${Jt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${H}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Jt(X(ee,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Jt(P("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${qt}; }

.oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ae}; }
.oc-sdk-search-clear { border-radius: ${bn}; color: ${H}; }
.oc-sdk-search-clear:hover { background: ${J}; color: ${ee}; }

.oc-sdk-trigger { border-radius: ${Yt}; background: var(--oc-sdk-raised-bg); color: ${xe}; ${Qt} transition: background 150ms ease-out; }
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
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Kt}; color: ${jt}; }
.oc-sdk-option-check { color: ${ee}; }
.oc-sdk-option[data-destructive="true"] { color: ${zt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(P("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${H}; }
.oc-sdk-popup-empty { color: ${H}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${fe}; border-radius: 4px; color: ${ee}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(ee,60,fe)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${fe}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${ce}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ae}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${kn} }
.oc-sdk-check-desc { color: ${H}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(ee,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${H}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ee}; }
.oc-sdk-tab[aria-selected="true"] { color: ${jt}; background: ${Kt}; border-color: ${fe}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${xe}; background: var(--oc-sdk-raised-bg); ${Qt} }
.oc-sdk-tab-count { color: ${H}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(ee,6)}; color: ${H}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${J}; }
.oc-sdk-row[aria-selected="true"] { background: ${Kt}; color: ${jt}; }
.oc-sdk-row-lead { font-family: ${qt}; color: ${H}; }
.oc-sdk-row-sub { color: ${H}; }
.oc-sdk-row-meta { color: ${H}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${H}; }

.oc-sdk-empty-body { color: ${H}; }

.oc-sdk-spinner { color: ${H}; }
.oc-sdk-spinner-ring { border-color: ${fe}; border-top-color: ${ae}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${H}; }

.oc-sdk-separator { color: ${H}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X(fe,40)}; }

.oc-sdk-progress-label { color: ${H}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(ee,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ae}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${P("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${P("success-text","inherit")}; }

.oc-sdk-text a { color: ${Wt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(fe,60)}; }
`,B=`
${_t}
${Nr}
${On}`;var Rn="oc-sdk-ui-style",Oe=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},F=e=>{let t=document.getElementById(Rn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}ft(document);let o=document.createElement("style");o.id=Rn,o.textContent=e,document.head.appendChild(o)},D=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},de=e=>{let t=D("button",e);return t.type="button",t},ne=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},pe=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},yn=(e,t)=>{let o=s=>{s.target instanceof Node&&e.contains(s.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Lr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Pe=(e,t)=>{F(B);let o=t,s=de("oc-sdk oc-sdk-btn"),i=Lr(),c=document.createElement("span");s.append(c),e.append(s);let l=()=>{s.dataset.variant=o.variant??"default",s.dataset.size=o.size??"default",s.disabled=!!o.disabled||!!o.loading,s.dataset.loading=o.loading?"true":"false",s.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==s?s.prepend(i):!o.loading&&i.parentNode===s&&i.remove(),ne(c,o.label)},_=()=>{o.disabled||o.loading||o.onClick()};return s.addEventListener("click",_),l(),{update:O=>{o={...o,...O},l()},dispose:()=>{s.removeEventListener("click",_),s.remove()}}};var In="http://www.w3.org/2000/svg",Pr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Re=(e,t,o)=>{let s=document.createElementNS(In,"svg");s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("width",String(t)),s.setAttribute("height",String(t)),s.style.width=a(t),s.style.height=a(t),s.setAttribute("aria-hidden","true"),s.setAttribute("fill","currentColor"),o&&s.setAttribute("class",o);let i=document.createElementNS(In,"path");return i.setAttribute("d",Pr[e]),s.append(i),s};var ye=(e,t="vertical")=>{let[o,s]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===s||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Ie=(e,t,o)=>{let s=e.filter(O=>!O.disabled);if(s.length===0)return null;let i=s[0],c=s[s.length-1];if(o==="first"||!i||!c)return i?.id??null;if(o==="last")return c.id;let l=s.findIndex(O=>O.id===t);return l===-1?o==="next"?i.id:c.id:s[Math.min(s.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var vn=(e,t)=>`${e}-${t??""}`,eo=(e,t,o,s)=>{let i=de("oc-sdk-option");i.id=vn(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let c=D("span","oc-sdk-option-label");if(c.textContent=o.label,i.append(c),o.hint){let l=D("span","oc-sdk-option-hint");l.textContent=o.hint,i.append(l)}if(t==="option"){i.dataset.mark="check";let l=D("span","oc-sdk-option-check");l.append(Re("check",14)),i.append(l)}return i.addEventListener("pointerenter",s.hover),i.addEventListener("click",s.pick),i},to=(e,t,o,s)=>{let i=vn(o,s);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===i?"true":"false");pe(t,"aria-activedescendant",s?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Dr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let s=e.offsetHeight,i=window.innerHeight-o.bottom-8;s>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-s))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},oo=(e,t,o,s)=>{e.append(o),Dr(o,t);let i=yn(e,s),c=()=>{s()},l=_=>{_.target instanceof Node&&o.contains(_.target)||s()};return window.addEventListener("resize",c),window.addEventListener("scroll",l,!0),()=>{i(),window.removeEventListener("resize",c),window.removeEventListener("scroll",l,!0),o.remove()}};var no=(e,t)=>{pe(e,"data-tone",t&&t!=="neutral"?t:null)},ro=(e,t)=>{F(B);let o=t,s=D("span","oc-sdk oc-sdk-badge");e.append(s);let i=()=>{ne(s,o.label),no(s,o.tone)};return i(),{update:c=>{o={...o,...c},i()},dispose:()=>{s.remove()}}};var Mn=e=>e.filter(t=>!("separator"in t)),Gr=0,so=(e,t)=>{F(B);let o=t,s=`oc-sdk-menu-${Gr+=1}`,i=D("div","oc-sdk oc-sdk-menu");e.append(i);let c=D("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let l=null,_=null,O=Pe(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{l?q():T()}}),U=i.querySelector("button");U?.setAttribute("aria-haspopup","menu");let W=d=>{_=d,to(c,c,s,d)},z=()=>{Oe(c);for(let d of o.items){if("separator"in d){let f=D("div","oc-sdk-separator");f.dataset.labeled="false",c.append(f);continue}c.append(eo(s,"menuitem",d,{hover:()=>W(d.id),pick:()=>m(d.id)}))}W(Mn(o.items).some(d=>d.id===_)?_:null)},q=()=>{let d=l;l=null,d?.(),_=null,U?.setAttribute("aria-expanded","false")},T=()=>{l||!U||(z(),l=oo(i,U,c,q),U.setAttribute("aria-expanded","true"),c.focus())},m=d=>{q(),U?.focus(),o.onSelect(d)},h=d=>{let f=ye(d);f?(d.preventDefault(),W(Ie(Mn(o.items),_,f))):d.key==="Enter"||d.key===" "?(d.preventDefault(),_&&m(_)):d.key==="Escape"&&(d.preventDefault(),q(),U?.focus())},V=d=>{l&&!(d.relatedTarget instanceof Node&&i.contains(d.relatedTarget))&&q()};return c.addEventListener("keydown",h),i.addEventListener("focusout",V),{update:d=>{o={...o,...d},O.update({label:o.label,variant:o.variant,size:o.size}),l&&z()},dispose:()=>{q(),c.removeEventListener("keydown",h),i.removeEventListener("focusout",V),O.dispose(),i.remove()}}};var Ee=["backlog","todo","in_progress","review","done"],ve={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},wn=1,Cn=200,Un=16e3;var Hr=512,Xr=/^t_[a-z0-9]{6,40}$/,Nn=e=>typeof e=="string"&&Ee.includes(e);var ue=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>Hr)throw new Error(`${t} is too long`);return o},Ln=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>Cn)throw new Error(`Title is limited to ${Cn} characters`);return t},Pn=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>Un)throw new Error(`Description is limited to ${Un} characters`);return e};var Dn=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=ue(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:ue(t.branch,"worktree.branch")}},io=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},Gn=(e,t)=>e==null?null:io(e,t);var ao=(e,t,o=Date.now())=>{let s={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(s.title=Ln(t.title)),"description"in t&&(s.description=Pn(t.description)),"status"in t){if(!Nn(t.status))throw new Error("Unknown status");s.status=t.status}if("projectId"in t&&(s.projectId=ue(t.projectId,"projectId")),"sourceBranch"in t&&(s.sourceBranch=ue(t.sourceBranch,"sourceBranch")),"worktree"in t&&(s.worktree=Dn(t.worktree)),"sessionId"in t&&(s.sessionId=ue(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");s.rank=t.rank}return"needsAttentionSince"in t&&(s.needsAttentionSince=Gn(t.needsAttentionSince,"needsAttentionSince")),s},co=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==wn)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!Xr.test(t.id))throw new Error("Task id is invalid");if(!Nn(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:wn,id:t.id,title:Ln(t.title),description:Pn(t.description),status:t.status,rank:t.rank,projectId:ue(t.projectId,"projectId"),sourceBranch:ue(t.sourceBranch,"sourceBranch"),worktree:Dn(t.worktree),sessionId:ue(t.sessionId,"sessionId"),createdAt:io(t.createdAt,"createdAt"),updatedAt:io(t.updatedAt,"updatedAt"),needsAttentionSince:Gn(t.needsAttentionSince,"needsAttentionSince")}};var Xn="task:",Hn=16,$n=e=>`${Xn}${e}`,lo=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Xn)),o=[],s=[];for(let i=0;i<t.length;i+=Hn)await Promise.all(t.slice(i,i+Hn).map(async c=>{try{let l=co(await e.storage.get(c));if($n(l.id)!==c)throw new Error("Task id does not match its key");o.push(l)}catch{s.push(c)}}));return{tasks:o,failedKeys:s}},po=async(e,t)=>{let o=co(t);await e.storage.set($n(o.id),o)};var nt="__all__",Vn="__none__";var uo=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),rt=(e,t)=>!(t.projectId===Vn&&e.projectId!==null||t.projectId!==nt&&t.projectId!==Vn&&e.projectId!==t.projectId);var Bn=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:ao(e,{status:t,needsAttentionSince:null});var Te={waitingPermissionMeansReview:!0,failedMeansReview:!0},st=(e,t,o,s=Te)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",c=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return c();case"waiting-question":return i();case"waiting-permission":return s.waitingPermissionMeansReview?i():null;case"idle":return o==="completed"||o==="failed"&&s.failedMeansReview?i():null;default:return null}};var Fn=10*6e4,$r=60,Vr=(e,t,o=Te)=>t?st(e.status,t.activity,t.outcome,o)??e.status:e.status,Br=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,Kn=(e,t)=>e.needsAttentionSince??t.updatedAt,jn=(e,t,o,s=Fn)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-Kn(e,t)<s?null:e.needsAttentionSince!==null?"hint":"quiet",Fr=(e,t,o,s=Fn)=>{if(!t||jn(e,t,o,s)===null)return null;let i=Math.floor((o-Kn(e,t))/6e4);return i>0&&i<$r?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var Kr=(e,t,o=Te,s=Date.now())=>{let i=Br(e,t),c=Vr(e,i,o),l=c!==e.status,_=e.needsAttentionSince!==null||l&&c==="review",O=jn(e,i,s);return{task:e,displayStatus:c,movedByAgent:l,attention:_,attentionSince:e.needsAttentionSince??(_&&i?i.updatedAt:null),live:i,looksDone:O,looksDoneNote:O?Fr(e,i,s):null}},jr=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||uo(e.task,t.task),Wn=(e,t,o,s=Te,i=Date.now())=>{let c=Object.fromEntries(Ee.map(l=>[l,[]]));for(let l of e){if(!rt(l,o))continue;let _=Kr(l,t,s,i);c[_.displayStatus].push(_)}for(let l of Ee)c[l].sort((_,O)=>l==="review"?jr(_,O):uo(_.task,O.task));return c},zn=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.attention&&s.displayStatus!=="done").length,0),qn=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.displayStatus!=="done").length,0),Yn=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},Jn=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var Qn=(e,t,o)=>{let s=o.sessions.find(i=>i.id===e);if(s)return s.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(c=>c.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var Zn=(e,t,o,s,i={})=>{let c=i.onLiveChange,l=i.onSnapshot??(()=>{}),_=new Map,O=new Map,U=new Map,W=new Map,z=!1,q=(d,f)=>{if(f.state==="loading")return!1;let k=0;for(let[A,C]of U)C.projectId===d&&(U.delete(A),k+=1);if(f.state!=="ready")return k>0;for(let A of f.sessions)A.parentId===null&&U.set(A.id,{projectId:d,activity:A.activity,outcome:A.outcome,updatedAt:A.updatedAt});return!0},T=(d,f)=>{if(z)return;q(d,f)&&c&&c(),l();for(let A of f.sessions)W.set(A.id,A.directory);if(o)for(let A of O.values()){if(A.projectId!==d||!A.sessionId)continue;let C=Qn(A.sessionId,W.get(A.sessionId)??null,f);if(s&&(C==="deleted"||C==="archived")){s(A.id,A.sessionId,C);continue}let K=f.sessions.find(v=>v.id===A.sessionId);if(!K)continue;let se=st(A.status,K.activity,K.outcome,t);se&&o(A.id,se)}},m=d=>{let f=e.onSessions(d,k=>T(d,k));_.set(d,f),f.then(k=>{(z||!_.has(d))&&k()},()=>{})};return{live:()=>U,sync:d=>{if(z)return;O=new Map(d.map(k=>[k.id,k]));let f=new Set(d.filter(k=>k.sessionId&&k.projectId).map(k=>k.projectId));for(let k of f)_.has(k)||m(k);for(let[k,A]of _)if(!f.has(k)){_.delete(k);for(let[C,K]of U)K.projectId===k&&U.delete(C);A.then(C=>C(),()=>{})}},dispose:()=>{z=!0;for(let d of _.values())d.then(f=>f(),()=>{});_.clear()}}};var er=(e,t)=>{if(!t)return null;let o=e.find(s=>s.directory===t);return o||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,i)=>i.directory.length-s.directory.length)[0]??null)},it=e=>{if(e instanceof E)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var x=(e,t="",o="")=>{let s=document.createElement(e);return t&&(s.className=t),o&&(s.textContent=o),s};var at="http://www.w3.org/2000/svg",Wr={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},or=e=>{let t=document.createElementNS(at,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},zr=()=>or(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(at,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let s=document.createElementNS(at,"path");s.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,s)}),qr=()=>or(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(at,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),Eo=e=>{let t=x("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},tr=()=>{let e=x("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},Yr={running:zr,"waiting-question":()=>Eo("?"),"waiting-permission":qr,failed:()=>Eo("!"),finished:()=>Eo("\u2713"),idle:tr,linked:tr},nr=e=>{let t=x("span","kb-agent-pill"),o=Wr[e.key];return o&&(t.dataset.tone=o),t.append(Yr[e.key]()),t.append(x("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var rr=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var sr="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",Jr="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",Qr="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",Zr=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},ct=(e,t,o,s={})=>{let i=x("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),s.primary&&(i.dataset.primary="true"),s.hint&&(i.dataset.hint="true"),s.quiet&&(i.dataset.quiet="true"),s.info&&(i.dataset.info="true"),i.append(Zr(e)),i.addEventListener("click",c=>{c.stopPropagation(),o()}),i},es=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...Ee.filter(s=>s!==e.displayStatus).map(s=>({id:`move:${s}`,label:`Move to ${ve[s]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},ir=(e,t,o)=>{let s=t==="rail",i=x("div",s?"kb-panel-sections":"kb-columns");e.append(i);let c=[],l=null,_=(T,m)=>[...T.querySelectorAll(".kb-draggable-item")].filter(h=>h.dataset.id!==m).map(h=>({id:h.dataset.id??"",top:h.getBoundingClientRect().top,height:h.getBoundingClientRect().height})),O=(T,m,h,V)=>{T.addEventListener("dragover",d=>{l&&(d.preventDefault(),T.classList.add("kb-dragover"))}),T.addEventListener("dragleave",d=>{d.target===T&&T.classList.remove("kb-dragover")}),T.addEventListener("drop",d=>{d.preventDefault(),T.classList.remove("kb-dragover");let f=l??d.dataTransfer?.getData("text/plain")??null;if(l=null,!f)return;if(s&&d.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(f,h);return}let k=rr(_(m,f),d.clientY);V(f,h,k)})},U=T=>{let{task:m}=T,h=x("div",T.attention?"kb-item kb-attn":"kb-item");s?h.classList.add("kb-panel-row"):h.classList.add("kb-card");let V=o.onDrop!==void 0;V?(h.classList.add("kb-draggable-item"),h.draggable=!0):h.draggable=!1,h.dataset.id=m.id;let d=o.isSelected?.(m)??!1;d&&(h.dataset.selected="true");let f=x("div","kb-panel-main");h.append(f);let k=x("div","kb-item-top");if(o.onToggleSelect){let v=o.onToggleSelect,I=document.createElement("input");I.type="checkbox",I.className="kb-check",I.checked=d;let te=d?"Deselect":"Select";I.title=`${te} "${m.title}"`,I.setAttribute("aria-label",`${te} task: ${m.title}`),I.addEventListener("click",Q=>Q.stopPropagation()),I.addEventListener("change",()=>v(m)),k.append(I)}k.append(x("div","kb-panel-title",m.title)),f.append(k);let A=o.projectName(m),C=x("div","kb-panel-sub");A&&C.append(x("span","kb-panel-project",A));let K=T.live?Jn(T.live):m.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(K&&C.append(nr(K)),f.append(C),s&&T.attention&&m.sessionId&&o.onOpenChat){let v=o.onOpenChat,I=x("div","kb-panel-actions");I.append(ct(Jr,"Open chat",()=>v(m),{primary:!0})),f.append(I)}if(s&&T.displayStatus!=="done"&&o.onMarkDone){let v=o.onMarkDone;k.append(ct(sr,"Mark done",()=>v(m),{info:!0}))}if(s&&T.looksDone){let v=x("span","kb-panel-chip","\u2713 looks done");v.dataset.ok="true",h.append(v)}let se=es(T,o);if(!s&&T.looksDone&&o.onLooksDone){let v=o.onLooksDone;k.append(ct(sr,T.looksDoneNote??"Looks done \u2014 click to mark Done",()=>v(m),T.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(se){let v=x("span","kb-panel-menu");k.append(v),c.push(so(v,{label:"\u22EF",variant:"ghost",size:"xs",items:se,onSelect:I=>{if(I==="delete"&&o.onDelete){o.onDelete(m);return}if(I==="edit"&&o.onEdit){o.onEdit(m);return}if(I.startsWith("move:")){let te=I.slice(5);Ee.includes(te)&&o.onMoveStatus&&o.onMoveStatus(m,te)}}}))}if(o.onActivate){let v=()=>o.onActivate(m);h.addEventListener("click",I=>{if(!I.target?.closest(".kb-panel-menu")){if(o.onToggleSelect&&(I.metaKey||I.ctrlKey)){o.onToggleSelect(m);return}v()}}),h.tabIndex=0,h.addEventListener("keydown",I=>{(I.key==="Enter"||I.key===" ")&&(I.preventDefault(),v())})}return V&&(h.addEventListener("dragstart",v=>{l=m.id,h.classList.add("kb-dragging"),v.dataTransfer?.setData("text/plain",m.id),v.dataTransfer&&(v.dataTransfer.effectAllowed="move")}),h.addEventListener("dragend",()=>{l=null,h.classList.remove("kb-dragging")})),h},W=(T,m)=>{let h=x("div","kb-column");h.dataset.status=T;let V=x("div","kb-column-head"),d=x("span","kb-column-count",String(m.length));m.some(A=>A.attention&&A.displayStatus!=="done")&&(d.dataset.attn="true");let f=x("span","kb-column-tools");if(f.append(d),o.onEmptyColumn){let A=o.onEmptyColumn,C=o.isColumnEmptyArmed?.(T)??!1,K=ct(Qr,C?`Click again to empty ${ve[T]}`:`Empty ${ve[T]}`,()=>A(T));C&&(K.dataset.armed="true"),f.append(K)}V.append(x("span","kb-column-title",ve[T]),f);let k=x("div","kb-column-body");h.append(V,k),m.length===0&&k.append(x("div","kb-column-empty","No tasks"));for(let A of m)k.append(U(A));return o.onDrop&&O(h,k,T,o.onDrop),h},z=(T,m)=>{let h=x("div","kb-psec");h.dataset.status=T;let V=o.onToggleSection!==void 0,d=V&&(o.isCollapsed?.(T)??!1),f=V?document.createElement("button"):x("div","kb-psec-head");f.className="kb-psec-head",f instanceof HTMLButtonElement&&(f.type="button"),f.append(x("span","kb-psec-name",ve[T]));let k=x("span","kb-psec-count","0");m.some(C=>C.attention&&C.displayStatus!=="done")&&(k.dataset.attn="true"),f.append(k),V&&(f.append(x("span","kb-psec-chevron",d?"\u25B8":"\u25BE")),f.addEventListener("click",()=>o.onToggleSection?.(T)));let A=x("div","kb-psec-body");if(A.hidden=d,h.append(f,A),!d){m.length===0&&A.append(x("div","kb-panel-empty","No tasks"));for(let C of m)A.append(U(C))}return o.onDrop&&O(h,A,T,o.onDrop),h};return{render:T=>{for(let m of c.splice(0))m.dispose();i.replaceChildren();for(let m of Ee)i.append(s?z(m,T[m]):W(m,T[m]))},dispose:()=>{for(let T of c.splice(0))T.dispose();i.replaceChildren()}}};var ts=`
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
.kb-panel-actions{display:flex;gap:6px;align-items:center;flex:none}
/* Rail rows carry the same buttons at the 26px touch size; the \u2713 (data-info)
   rides them at every non-done row's right edge and never hides. */
.kb-panel-row .kb-iconbtn{width:26px;height:26px}
.kb-panel-row .kb-iconbtn svg{width:13px;height:13px}
/* The rail's looks-done chip speaks success \u2014 the only chip a row wears. */
.kb-panel-chip[data-ok]{color:var(--oc-success,var(--status-success,#46a758));background:color-mix(in srgb,var(--oc-success,var(--status-success,#46a758)) 13%,transparent)}
[hidden]{display:none!important}
`,ar=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=ts,document.head.append(e)};var le=Bt(),fo=document.querySelector("#root");if(!fo)throw new Error("Missing #root");var dt=!1,_e=!1,me=[],So=[],To=null,Me=null,mo,De,_o=!1,he=!1,go=null,dr,Ce,Ge,He,os=(e,t)=>e.filter(o=>rt(o,{projectId:t??nt})),Xe=e=>{me=[...e],lr.sync(os(me,Me?.id??null))},lr=Zn(le,Te,null,void 0,{onLiveChange:()=>{he&&!_e&&we()},onSnapshot:()=>{rs()}}),cr=()=>{Me=er(So,To)};le.onReady(e=>{if(dt)return;dt=!0,Ft(e,document.documentElement),To=e.directory,ar(),fo.replaceChildren();let t=x("div","kb-page kb-rail"),o=x("div","kb-row between");o.append(x("h2","","Kanban"));let s=x("span");o.append(s),t.append(o),Ce=x("p","kb-muted","Loading\u2026"),t.append(Ce),Ge=x("p","kb-rail-scope"),t.append(Ge),He=x("p","kb-panel-unseen"),t.append(He),go=ir(t,"rail",{projectName:c=>!Me&&c.projectId?So.find(l=>l.id===c.projectId)?.name??null:null,onMarkDone:async c=>{let l=me.find(O=>O.id===c.id)??c,_=Bn(l,"done");if(_){try{await po(le,_)}catch(O){le.toast({kind:"error",message:`Could not mark "${l.title}" done \u2014 ${it(O)}`}).catch(()=>{}),ho();return}Xe(me.map(O=>O.id===l.id?_:O)),we()}}});let i=x("div","kb-rail-foot");i.append(x("p","kb-muted","One quick write lives here \u2014 the \u2713 marks a task Done. Everything else (open, move, edit, delete) is the full board, from the Extension pages menu.")),t.append(i),fo.append(t),dr=ro(s,{label:"",tone:"neutral"}),mo=window.setInterval(()=>{ho()},3e4),le.onProjects(c=>{_e||c.state!=="ready"||(So=c.projects,cr(),Xe(me),he&&we())}).then(()=>{},()=>{}),le.onDirectory(c=>{_e||(To=c,cr(),Xe(me),he&&we())}),ns()});var ns=async()=>{try{let e=await lo(le);if(_e)return;Xe(e.tasks),he=!0,Ce.hidden=!0,we()}catch(e){Ce.textContent=`Could not load tasks \u2014 ${it(e)}`}},ho=async()=>{if(!(!dt||_e||_o)){_o=!0;try{let{tasks:e}=await lo(le);if(_e)return;Xe(e),he||(he=!0,Ce.hidden=!0),we()}catch(e){he||(Ce.textContent=`Could not load tasks \u2014 ${it(e)}`)}finally{_o=!1}}},rs=()=>{De!==void 0||_e||!dt||(De=window.setTimeout(()=>{De=void 0,ho()},500))},we=()=>{let e=Wn(me,lr.live(),{projectId:Me?.id??nt}),t=qn(e),o=zn(e);Me?(Ge.textContent=`Project: ${Me.name}`,Ge.hidden=!1):Ge.hidden=!0;let s=Yn(t,o);dr.update({label:s.label,tone:s.tone}),o>0?(He.textContent=`${o} task${o===1?"":"s"} need${o===1?"s":""} your review`,He.hidden=!1):He.hidden=!0,go?.render(e)};window.addEventListener("pagehide",()=>{_e=!0,mo!==void 0&&window.clearInterval(mo),De!==void 0&&window.clearTimeout(De),go?.dispose(),le.dispose()});})();
