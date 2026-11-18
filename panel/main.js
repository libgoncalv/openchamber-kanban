"use strict";(()=>{var w="openchamber.sdk";var je="data-oc-scrolling",_t=`
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
:hover, [${je}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${je}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${je}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${je}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function ft(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let i=r.target===e?t:r.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let a=o.get(i);a!==void 0&&clearTimeout(a),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var mr=`(${ft.toString()})(document);`;var yo=e=>{let t=[],o=0,r=0;return{push:i=>{for(t.push(i),r+=i.length;r-o>e&&t.length>1;){let a=t.shift();r-=a?.length??0,o=0}},pull:i=>{let a=0;for(;a<i.length&&t.length>0;){let l=t[0],p=Math.min(i.length-a,l.length-o);i.set(l.subarray(o,o+p),a),a+=p,o+=p,o>=l.length&&(t.shift(),r-=l.length,o=0)}i.fill(0,a)},clear:()=>{t.length=0,o=0,r=0},get size(){return r-o}}};var Co=/^[a-z][a-z0-9-]{0,39}$/;var vo=e=>Object(e)===e&&!Array.isArray(e),St=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Io=e=>String(e)===e&&e.length>=1&&e.length<=60,wo=e=>String(e)===e&&e.length>=1&&e.length<=80,Mo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!vo(o)||!Co.test(o.id)||!Io(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!St(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!St(o,["kind","id","label","value","options","disabled"])||!wo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let i of o.options){if(!vo(i)||!St(i,["value","label"])||!wo(i.value)||!Io(i.label)||r.has(i.value))return!1;r.add(i.value)}if(!r.has(o.value))return!1}return!0};var gr=1024*1024;var Uo=["{id}","{segment}","{segments+}"];var ks=new Set(Uo);var No=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var xs=new Set(No);var Tt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Lo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Po=/^[A-Za-z0-9_-]{1,80}$/;var Do=["left","right","top","bottom"];var Go=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of r)if(!Go(i,t+1,o))return!1;return!0},mt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(mt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(mt)}return String(e)===e||Number.isFinite(e)},ht=e=>{try{return String(e.id)!==e.id||!Po.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Do.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Go(e.data)||!mt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var bt=2e3;var $o=["file","directory","other","missing"],kt=e=>!!(e&&"sessionId"in e),At=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Xo=/^[0-9a-f]{7,64}$/i,xt=e=>Xo.test(e),Ke=500,We=32e3,Vo=16e3,Bo=128,Fo=200,jo=2e3,Ko=16e3,Wo=80,zo=200,qo=16e3;var Yo=2e3;var Ot=2e4,ze=1024,qe=2e6;var Ye=64e3,Je=8e3,Rt=4e3;var yt=96e4,br=60*6e4;var Jo=999,Qo=1e4,Ge=500,Zo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],en=["stopped","starting","ready","failed"],kr=new Set(Zo),tn=e=>kr.has(e),on=e=>e&&tn(e)?e:"HOST_REJECTED",Re=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Re):Object(e)===e?Object.values(e).every(Re):!1,nn=e=>Re(e)&&JSON.stringify(e).length<=qo,Ho=e=>e?.trim().slice(0,zo)??"",ye=e=>{let t=e.id.trim().slice(0,Bo),o=e.title.trim().slice(0,Fo),r=e.url.trim().slice(0,jo),i=e.text?.trim().slice(0,Ko),a=e.author?.trim().slice(0,Wo),l=e.kind==="pull"?"pull":"issue",p={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:l};if(i&&(p.text=i),a&&(p.author=a),l==="pull"){let v=Ho(e.branches?.head),M=Ho(e.branches?.base);v&&M&&(p.branches={head:v,base:M})}return nn(e.data)&&(p.data=e.data),p},vt=e=>{let t=ye(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},It=e=>{let t={text:e.text.trim().slice(0,Vo)};return e.send&&(t.send=!0),t},wt=e=>e===null||!Number.isFinite(e)?null:Math.min(Jo,Math.max(0,Math.round(e))),Ct=e=>Number.isFinite(e)?Math.min(Qo,Math.max(0,Math.ceil(e))):0;var ve=e=>e.length>0&&e.length<=ze&&!e.includes("\0")&&!e.includes("\\");var Qe=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Yo?!1:!e.split("/").some(o=>o==="."||o===".."),Ar=new Set(en),Mt=e=>!!(e&&"status"in e&&Ar.has(String(e.status))&&!("body"in e)),Ze=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Ut=e=>!!(e&&"content"in e&&String(e.content)===e.content),Nt=e=>!!(e&&"written"in e&&e.written===!0),Lt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),xr=new Set($o),Pt=e=>!!(e&&"kind"in e&&"size"in e&&xr.has(String(e.kind))&&Number.isFinite(e.size)),Dt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Or=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),Rr=e=>Object(e)===e?e:null,gt=e=>String(e)===e&&e.length>0,yr=e=>{if(!gt(e.id))return null;if(e.ok===!0){let t={channel:w,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&gt(e.error)?{channel:w,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:on(gt(e.code)?e.code:void 0)}:null},Gt=e=>{let t=Rr(e);return!t||t.channel!==w||t.v!==1?null:t.type==="result"?yr(t):!Or.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var rn=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,vr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",m=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},sn=()=>Promise.reject(new m("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),et=()=>Promise.reject(new m("BAD_PATH",`File path must be 1 to ${ze} characters without NUL or backslash.`)),tt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new m("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},O=e=>(e.value+=1,`oc-${e.value}`),Bt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new m("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),r=e.requestTimeoutMs??Ot,i=new Set,a=new Set,l=new Set,p=new Set,v=new Set,M=new Set,N=new Set,U=new Set,L=new Set,_=new Set,u=new Set,b=new Set,V=[],d=null,f=null,A=new Set,x=new Set,G=null,z=null,ne=!1,P=new Map,D=new Map,te=new Map,Q=!1,g={value:0},h=null,se=null,Se=!1,Te=!1,Xe=null,ee=null,be=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,Z=n=>{t.parent.postMessage(n,"*")},ie=()=>{Q||t.parent===t||b.size===0||h?.features?.lateGenerateResults!==!0||Z({channel:w,v:1,type:"generate-late-listen"})},E=(n,s)=>{for(let T of n)try{T(s)}catch(S){console.error(S)}},R=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let s=Gt(n.data);if(!s)return;if(s.type==="workspace"){let S=D.get(s.payload.subscriptionId);S&&E([S],s.payload.snapshot);return}if(s.type==="shells"){let S=te.get(s.payload.subscriptionId);S&&E([S],s.payload.snapshot);return}if(s.type==="microphone-audio"){ee?.queue.push(s.payload.samples);return}if(s.type==="microphone-ended"){let S=ee;if(!S)return;ee=null,S.release(),E(S.endedListeners,s.payload.reason);return}if(s.type==="ready"){h=s.payload,se=be(s.payload.session),E(i,s.payload),E(a,s.payload.directory),E(l,s.payload.session),se&&E(p,se),E(v,s.payload.connection),E(M,s.payload.settings),E(N,s.payload.item),s.payload.block&&E(U,s.payload.block),ie();return}if(s.type==="service-event"){E(L,s.payload);return}if(s.type==="generate-late"){b.size===0?V.push(s.payload):E(b,s.payload);return}if(s.type==="directory"){h&&(h={...h,directory:s.payload.directory}),E(a,s.payload.directory);return}if(s.type==="session"){h&&(h={...h,session:s.payload.session}),s.payload.session?se?.sessionId!==s.payload.session.id&&(se=be(s.payload.session)):se=null,E(l,s.payload.session);return}if(s.type==="session-lifecycle"){se=s.payload,E(p,s.payload);return}if(s.type==="connection"){h&&(h={...h,connection:s.payload.connection}),E(v,s.payload.connection);return}if(s.type==="settings"){h&&(h={...h,settings:s.payload.settings}),E(M,s.payload.settings);return}if(s.type==="item"){h&&(h={...h,item:s.payload.item}),E(N,s.payload.item);return}if(s.type==="status-control-event"){E(_,s.payload);return}if(s.type==="popover-closed"){E(u,s.payload);return}if(s.type==="action"){let S=X=>{Q||Z({channel:w,v:1,type:"action-result",id:s.id,payload:X})},$=f;if(!$){S({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>$(s.payload)).then(()=>S({ok:!0}),X=>{let B=(X instanceof Error?X.message:String(X)).trim();S({ok:!1,error:(B||"Action failed.").slice(0,Ge)})});return}if(s.type==="file-open"){let S=s.payload;if(z&&Lo(z,S))return;z=S,E(A,s.payload);return}if(s.type==="file-saved"){E(x,s.payload.version);return}if(s.type==="file-snapshot"){let S=B=>{Q||Z({channel:w,v:1,type:"file-snapshot-result",id:s.id,payload:B})},$=B=>S({error:(B.trim()||"Could not read the edited file.").slice(0,Ge)}),X=G;if(!X){$("This extension does not edit files.");return}Promise.resolve().then(()=>X(s.payload.purpose)).then(B=>{if(Tt(B)>2e7){$(`The file is over ${2e7} ${"bytes"in B?"bytes":"characters"}.`);return}if(B.version.length>256){$(`The snapshot version is over ${256} characters.`);return}S({snapshot:"bytes"in B?{bytes:B.bytes,version:B.version}:{content:B.content,version:B.version}})},B=>$(B instanceof Error?B.message:String(B)));return}if(s.type==="resolve"){let S=X=>{Z({channel:w,v:1,type:"resolve-result",id:s.id,payload:X})},$=d;if(!$){S({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>$(s.payload)).then(X=>S({item:X?ye(X):null}),X=>{let B=(X instanceof Error?X.message:String(X)).trim();S({error:(B||"Command failed.").slice(0,Ge)})});return}let T=P.get(s.id);if(T){if(clearTimeout(T.timer),P.delete(s.id),s.ok){T.resolve(s.payload);return}T.reject(new m(s.code,s.error))}};t.addEventListener("message",R),Z({channel:w,v:1,type:"hello"});let I=(n,s=r)=>Q||t.parent===t?Promise.reject(new m("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((T,S)=>{let $=setTimeout(()=>{P.delete(n.id),S(new m("HOST_TIMEOUT","Host did not answer in time."))},s);P.set(n.id,{resolve:T,reject:S,timer:$}),Z(n)}),k=n=>I(n).then(()=>{}),H={channel:w,v:1},q=n=>{!Q&&t.parent!==t&&Z(n)},ke=()=>q({...H,type:"file-save"}),pt=()=>{!Q&&t.parent!==t&&Z({...H,type:"microphone-close",id:O(g)})},Sr=async()=>{if(ee)throw new m("HOST_REJECTED","The microphone is already open in this frame.");if(h?.features?.microphone!==!0)throw new m("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let n=globalThis.AudioContext;if(typeof n!="function")throw new m("UNSUPPORTED","This frame has no Web Audio.");let s=new n;if(s.sampleRate<8e3||s.sampleRate>192e3)throw s.close().catch(()=>{}),new m("UNSUPPORTED",`Audio at ${s.sampleRate} Hz is not supported.`);let T=s.state==="suspended"?s.resume().catch(()=>{}):void 0,S=yo(Math.round(s.sampleRate/4)),$=s.createScriptProcessor(1024,1,1);$.onaudioprocess=ae=>S.pull(ae.outputBuffer.getChannelData(0));let X=s.createMediaStreamDestination();$.connect(X);let B=new Set,Oe={queue:S,endedListeners:B,release:()=>{$.onaudioprocess=null,$.disconnect(),S.clear();for(let ae of X.stream.getTracks())ae.stop();s.close().catch(()=>{})}};ee=Oe;try{let ae=await I({...H,type:"microphone-open",id:O(g),payload:{sampleRate:s.sampleRate}},12e4);if(!ae||!("opened"in ae)||ae.opened!==!0)throw new m("HOST_REJECTED","Host did not open the microphone.");if(await T,ee!==Oe)throw new m("DISCONNECTED","The microphone closed while it was opening.")}catch(ae){throw ee===Oe&&(ee=null),Oe.release(),pt(),ae}return{stream:X.stream,close:()=>{ee===Oe&&(ee=null,Oe.release(),pt())},onEnded:ae=>(B.add(ae),()=>{B.delete(ae)})}},go=n=>{!rn(n)||!vr(n)||(n.preventDefault(),ke())},bo=n=>{!rn(n)||n.key!=="Escape"||h?.surface!=="popover"||!h.popover||(n.preventDefault(),Oo(h.popover.id,"escape").catch(()=>{}))},Ve=()=>{let n=h?.surface==="popover"?h.popover:void 0;if(!n)return;let s=Se||Te;Xe!==s&&(Xe=s,Ro(n.id,s).catch(()=>{}))},Be=()=>{h?.surface!=="popover"||Se||(Se=!0,Ve())},ko=n=>{h?.surface!=="popover"||n.relatedTarget!==null||!Se||(Se=!1,Ve())},Ao=()=>{h?.surface!=="popover"||Te||(Te=!0,Ve())},xo=()=>{h?.surface!=="popover"||!Te||(Te=!1,Ve())},de=(n,s=1024)=>{if(!n.trim()||n.length>s)throw new m("HOST_REJECTED",`Identity must contain 1 to ${s} characters.`)},ut=async n=>{n.kind!=="projects"&&de(n.projectId);let s=await I({...H,type:"workspace-read",id:O(g),payload:n});if(!s||!("kind"in s)||!("state"in s)||s.kind!==n.kind)throw new m("HOST_REJECTED","Host did not return workspace data.");return s},Et=async(n,s)=>{n.kind!=="projects"&&de(n.projectId);let T=O(g);D.set(T,s);try{await k({...H,type:"workspace-subscribe",id:O(g),payload:{subscriptionId:T,query:n}})}catch(S){throw D.delete(T),Q||Z({...H,type:"workspace-unsubscribe",id:O(g),payload:{subscriptionId:T}}),S}return()=>{!D.delete(T)||Q||Z({...H,type:"workspace-unsubscribe",id:O(g),payload:{subscriptionId:T}})}},Tr=async(n,s)=>{n.kind==="session"&&de(n.sessionId),n.kind==="project"&&de(n.projectId);let T=O(g);te.set(T,s);try{await k({...H,type:"shells-subscribe",id:O(g),payload:{subscriptionId:T,scope:n}})}catch(S){throw te.delete(T),Q||Z({...H,type:"shells-unsubscribe",id:O(g),payload:{subscriptionId:T}}),S}return()=>{!te.delete(T)||Q||Z({...H,type:"shells-unsubscribe",id:O(g),payload:{subscriptionId:T}})}},Fe=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new m("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Re(n.value))throw new m("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new m("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&h?.features?.deviceStorage!==!0)throw new m("UNSUPPORTED","This host does not support device storage.");let s=await I({...H,type:"storage",id:O(g),payload:n});if(!s||!("storage"in s)||s.op!==n.op)throw new m("HOST_REJECTED","Host did not return storage data.");return s},Oo=(n,s)=>h?.features?.popovers!==!0&&!(h?.surface==="popover"&&h.popover?.id===n)?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):k({...H,type:"popover-close",id:O(g),payload:s?{id:n,reason:s}:{id:n}}),Ro=(n,s)=>h?.features?.popovers!==!0&&!(h?.surface==="popover"&&h.popover?.id===n)?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):k({...H,type:"popover-anchor",id:O(g),payload:{id:n,active:s}});return t.addEventListener("keydown",bo,!0),t.addEventListener("pointerover",Be),t.addEventListener("pointermove",Be),t.addEventListener("pointerout",ko),t.addEventListener("focus",Ao),t.addEventListener("blur",xo),{onAction:n=>(f=n,()=>{f===n&&(f=null)}),listProjects:async()=>{let n=await ut({kind:"projects"});if(n.kind!=="projects")throw new m("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let s=await ut({kind:"worktrees",projectId:n});if(s.kind!=="worktrees")throw new m("HOST_REJECTED","Expected worktrees.");return s},listSessions:async n=>{let s=await ut({kind:"sessions",projectId:n});if(s.kind!=="sessions")throw new m("HOST_REJECTED","Expected sessions.");return s},onProjects:n=>Et({kind:"projects"},s=>{s.kind==="projects"&&n(s)}),onWorktrees:(n,s)=>Et({kind:"worktrees",projectId:n},T=>{T.kind==="worktrees"&&s(T)}),onSessions:(n,s)=>Et({kind:"sessions",projectId:n},T=>{T.kind==="sessions"&&s(T)}),onRunningShells:(n,s)=>Tr(n,s),readShellOutput:async(n,s)=>{de(n,128);let T=s?.cursor;if(T!==void 0&&(!Number.isInteger(T)||T<0))throw new m("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let S=s?.tailBytes;if(S!==void 0&&(!Number.isInteger(S)||S<1||S>65536))throw new m("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let X=await I({...H,type:"shell-output",id:O(g),payload:{shellId:n,cursor:T,tailBytes:S}});if(!X||typeof X.output!="string"||!Number.isFinite(X.cursor))throw new m("HOST_REJECTED","Host did not return shell output.");return X},stopShell:async n=>{if(de(n,128),(await I({...H,type:"shell-stop",id:O(g),payload:{shellId:n}}))?.stopped!==!0)throw new m("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{de(n),await k({...H,type:"open-session",id:O(g),payload:{sessionId:n}})},storage:{get:async(n,s)=>{let T=tt(s),S={op:"get",key:n};T&&(S.scope=T);let $=await Fe(S);return $.op==="get"&&$.found?$.value:void 0},set:async(n,s,T)=>{let S=tt(T),$={op:"set",key:n,value:s};S&&($.scope=S),await Fe($)},delete:async(n,s)=>{let T=tt(s),S={op:"delete",key:n};T&&(S.scope=T),await Fe(S)},keys:async n=>{let s=tt(n),T={op:"keys"};s&&(T.scope=s);let S=await Fe(T);if(S.op!=="keys")throw new m("HOST_REJECTED","Expected storage keys.");return S.keys}},onReady:n=>(i.add(n),h&&n(h),()=>{i.delete(n)}),onDirectory:n=>(a.add(n),h&&n(h.directory),()=>{a.delete(n)}),onSession:n=>(l.add(n),h&&n(h.session),()=>{l.delete(n)}),onSessionLifecycle:n=>(p.add(n),se&&n(se),()=>{p.delete(n)}),onConnection:n=>(v.add(n),h&&n(h.connection),()=>{v.delete(n)}),onSettings:n=>(M.add(n),h&&n(h.settings),()=>{M.delete(n)}),onItem:n=>(N.add(n),h&&n(h.item),()=>{N.delete(n)}),onBlock:n=>(U.add(n),h?.block&&n(h.block),()=>{U.delete(n)}),onServiceEvent:n=>(L.add(n),()=>{L.delete(n)}),onStatusControl:n=>(_.add(n),()=>{_.delete(n)}),onPopoverClosed:n=>(u.add(n),()=>{u.delete(n)}),setStatusControls:n=>h?.features?.statusControls!==!0?Promise.reject(new m("UNSUPPORTED","This host does not support status controls.")):Mo(n)?k({...H,type:"status-controls",id:O(g),payload:{controls:n}}):Promise.reject(new m("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>h?.features?.popovers!==!0?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):ht(n)?k({...H,type:"popover-open",id:O(g),payload:n}):Promise.reject(new m("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Oo,setPopoverAnchorActive:Ro,onResolve:n=>(d=n,()=>{d===n&&(d=null)}),toast:n=>{let s=n.message.trim();return!s||s.length>Ke?Promise.reject(new m("HOST_REJECTED",`Toast message must contain 1 to ${Ke} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>We)?Promise.reject(new m("HOST_REJECTED",`Toast copy text must contain 1 to ${We} characters.`)):k({channel:w,v:1,type:"toast",id:O(g),payload:{...n,message:s}})},openUrl:n=>k({channel:w,v:1,type:"open-url",id:O(g),payload:{url:n}}),openCommit:n=>xt(n)?k({channel:w,v:1,type:"open-commit",id:O(g),payload:{sha:n}}):Promise.reject(new m("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>k({channel:w,v:1,type:"block-answer",id:O(g),payload:{text:n.trim().slice(0,bt)}}),openSurface:n=>k({channel:w,v:1,type:"open-surface",id:O(g),payload:{surfaceId:n}}),writeClipboard:n=>k({channel:w,v:1,type:"clipboard-write",id:O(g),payload:{text:n}}),compose:n=>k({channel:w,v:1,type:"compose",id:O(g),payload:n}),attach:n=>k({channel:w,v:1,type:"attach",id:O(g),payload:ye(n)}),startSession:async n=>{n.projectId!==void 0&&de(n.projectId);let s=n.worktree;s&&s!==!0&&(s.kind==="existing"?de(s.directory):(s.name!==void 0&&de(s.name,200),s.baseBranch!==void 0&&de(s.baseBranch,200)));let T=await I({channel:w,v:1,type:"start-session",id:O(g),payload:vt(n)},e.requestTimeoutMs??18e4);if(!kt(T))throw new m("HOST_REJECTED","Host did not return a session.");return T},prompt:n=>I({channel:w,v:1,type:"prompt",id:O(g),payload:It(n)}).then(s=>{if(!At(s))throw new m("HOST_REJECTED","Host did not return a prompt result.");return s}),sessionLink:n=>k({channel:w,v:1,type:"session-link",id:O(g),payload:ye(n)}),close:()=>k({channel:w,v:1,type:"close",id:O(g)}),oauthStart:()=>k({channel:w,v:1,type:"oauth-start",id:O(g)}),oauthDisconnect:()=>k({channel:w,v:1,type:"oauth-disconnect",id:O(g)}),request:n=>(Qe(n.path)?I({channel:w,v:1,type:"request",id:O(g),payload:n}):sn()).then(s=>{if(!Ze(s))throw new m("HOST_REJECTED","Host request result was empty.");return s}),serviceRequest:n=>(Qe(n.path)?I({channel:w,v:1,type:"service-request",id:O(g),payload:n}):sn()).then(s=>{if(!Ze(s))throw new m("HOST_REJECTED","Host service request result was empty.");return s}),serviceStatus:()=>I({channel:w,v:1,type:"service-status",id:O(g)}).then(n=>{if(!Mt(n))throw new m("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(ve(n)?I({channel:w,v:1,type:"file-read",id:O(g),payload:{path:n}}):et()).then(s=>{if(!Ut(s))throw new m("HOST_REJECTED","Host did not return file content.");return s}),writeFile:(n,s)=>ve(n)?s.length>qe?Promise.reject(new m("FILE_TOO_LARGE",`Content is over ${qe} characters.`)):I({channel:w,v:1,type:"file-write",id:O(g),payload:{path:n,content:s}}).then(T=>{if(!Nt(T))throw new m("HOST_REJECTED","Host did not confirm the write.");return T}):et(),listDir:n=>(ve(n)?I({channel:w,v:1,type:"file-list",id:O(g),payload:{path:n}}):et()).then(s=>{if(!Lt(s))throw new m("HOST_REJECTED","Host did not return directory entries.");return s}),stat:n=>(ve(n)?I({channel:w,v:1,type:"file-stat",id:O(g),payload:{path:n}}):et()).then(s=>{if(!Pt(s))throw new m("HOST_REJECTED","Host did not return file status.");return s}),generate:n=>{let s=n.prompt.trim(),T=n.system?.trim();if(s.length===0||s.length>Ye)return Promise.reject(new m("HOST_REJECTED",`Prompt must be 1 to ${Ye} characters.`));if(T!==void 0&&(T.length===0||T.length>Je))return Promise.reject(new m("HOST_REJECTED",`System prompt must be 1 to ${Je} characters.`));let S=n.maxOutputTokens===void 0?void 0:Math.min(Rt,Math.max(1,Math.floor(n.maxOutputTokens)));if(S!==void 0&&!Number.isFinite(S))return Promise.reject(new m("HOST_REJECTED","maxOutputTokens must be a number."));let $={prompt:s};return T!==void 0&&($.system=T),S!==void 0&&($.maxOutputTokens=S),I({channel:w,v:1,type:"generate",id:O(g),payload:$},e.requestTimeoutMs??yt).then(X=>{if(!Dt(X))throw new m("HOST_REJECTED","Host did not return generated text.");return X})},onLateGenerateResult:n=>{b.add(n);for(let s of V.splice(0))E([n],s);return ie(),()=>{b.delete(n)}},openMicrophone:Sr,setBadge:n=>k({channel:w,v:1,type:"badge",id:O(g),payload:{count:wt(n)}}),setHeight:n=>k({channel:w,v:1,type:"resize",id:O(g),payload:{height:Ct(n)}}),onFileOpen:n=>(A.add(n),ne||(ne=!0,t.addEventListener("keydown",go,!0)),z&&n(z),()=>{A.delete(n)}),onFileSnapshot:n=>(G=n,()=>{G===n&&(G=null)}),onFileSaved:n=>(x.add(n),()=>{x.delete(n)}),reportFileChange:n=>q({...H,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:ke,reportFileUnsupported:()=>q({...H,type:"file-unsupported"}),dispose:()=>{for(let n of D.keys())Z({...H,type:"workspace-unsubscribe",id:O(g),payload:{subscriptionId:n}});D.clear();for(let n of te.keys())Z({...H,type:"shells-unsubscribe",id:O(g),payload:{subscriptionId:n}});te.clear(),ee&&(pt(),ee.release(),ee=null),Q=!0,d=null,f=null,G=null,A.clear(),x.clear(),ne&&t.removeEventListener("keydown",go,!0),t.removeEventListener("message",R),t.removeEventListener("keydown",bo,!0),t.removeEventListener("pointerover",Be),t.removeEventListener("pointermove",Be),t.removeEventListener("pointerout",ko),t.removeEventListener("focus",Ao),t.removeEventListener("blur",xo);for(let n of P.values())clearTimeout(n.timer),n.reject(new m("HOST_UNAVAILABLE","Host client was disposed."));P.clear(),i.clear(),a.clear(),l.clear(),p.clear(),v.clear(),M.clear(),N.clear(),U.clear(),L.clear(),_.clear(),u.clear(),b.clear(),V.length=0}}};var un=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Xs=new Set(un);var Ir=10*6e4;var wr=10*6e4;var Cr=10*6e4;var Mr=10*6e4;var En=["none","agent","user"];var Bs=new Set(En);var Ur=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Nr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],_n=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of Ur)t.style.setProperty(o,e.tokens[r]);for(let[o,r,i]of Nr){let a=e.tokens[i]??"";t.style.setProperty(o,a),t.style.setProperty(r,a)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Ft=(e,t)=>{_n(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Lr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},F=(e,t)=>`var(--${e}, var(--oc-${Lr[e]}, ${t}))`,_e=F("surface-background","transparent"),nt=F("surface-elevated","transparent"),Ie=F("surface-elevated-foreground","inherit"),re=F("surface-foreground","inherit"),K=F("surface-muted-foreground","gray"),Pr=F("surface-muted","transparent"),Ae=F("interactive-border","currentColor"),oe=F("interactive-hover","transparent"),xe=F("interactive-active","transparent"),jt=F("interactive-selection","transparent"),Kt=F("interactive-selection-foreground","inherit"),Ee=F("primary","currentColor"),Wt=F("primary-text","inherit"),zt=F("error-text","inherit"),Dr=F("font-sans","inherit"),qt=F("font-mono","monospace"),mn=F("radius","9px"),Yt=`calc(${mn} - 2px)`,fn=`calc(${mn} - 4px)`,W=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Sn=`background-image: linear-gradient(${oe}, ${oe});`,Jt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Qt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Tn="box-shadow: var(--oc-sdk-lit);",Zt=`inset 0 0.5px 0 0 ${W(re,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Gr=`
:root {
  --oc-sdk-edge: ${W(re,16)};
  --oc-sdk-field-bg: ${nt};
  --oc-sdk-raised-bg: ${_e};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${W(re,14)};
  --oc-sdk-field-bg: ${W(_e,50,nt)};
  --oc-sdk-raised-bg: ${nt};
  --oc-sdk-field-lift: ${Zt};
  --oc-sdk-raised-lift: ${Zt};
  --oc-sdk-lit: ${Zt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,ot=e=>{let t=F(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${F(`${e}-text`,"inherit")}; }`},c=e=>`calc(${e}rem / 14)`,Hr=`
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
`,hn=`${Gr}
.oc-sdk { color: ${re}; font-family: ${Dr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Sn} }
.oc-sdk-mono { font-family: ${qt}; }
.oc-sdk-muted { color: ${K}; }
${ot("success")}${ot("warning")}${ot("error")}${ot("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Ee}; --oc-sdk-tone-text: ${Wt}; }

.oc-sdk-btn { border-radius: ${Yt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${fn}; }
.oc-sdk-btn[data-variant="default"] { color: ${Wt}; background: ${W(Ee,10,_e)}; border-color: ${W(Ee,12)}; ${Tn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${W(Ee,16,_e)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${W(Ee,22,_e)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Pr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${xe}, ${xe}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Ie}; ${Qt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${xe}, ${xe}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${oe}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${xe}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${F("status-error","red")}; color: ${zt}; background: ${W("var(--oc-sdk-tone)",7,_e)}; border-color: ${W("var(--oc-sdk-tone)",12)}; ${Tn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${W("var(--oc-sdk-tone)",9,_e)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${W("var(--oc-sdk-tone)",11,_e)}; box-shadow: none; }

.oc-sdk-field-note { color: ${K}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${zt}; }
.oc-sdk-input { border-radius: ${Yt}; background: var(--oc-sdk-field-bg); color: ${Ie}; ${Jt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${K}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Jt(W(re,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Jt(F("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${qt}; }

.oc-sdk-search-icon { color: ${K}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Ee}; }
.oc-sdk-search-clear { border-radius: ${fn}; color: ${K}; }
.oc-sdk-search-clear:hover { background: ${oe}; color: ${re}; }

.oc-sdk-trigger { border-radius: ${Yt}; background: var(--oc-sdk-raised-bg); color: ${Ie}; ${Qt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${xe}, ${xe}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${K}; }
.oc-sdk-trigger-chevron { color: ${K}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Ie}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${nt}; background-clip: padding-box; color: ${Ie}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${oe}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${jt}; color: ${Kt}; }
.oc-sdk-option-check { color: ${re}; }
.oc-sdk-option[data-destructive="true"] { color: ${zt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${W(F("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${K}; }
.oc-sdk-popup-empty { color: ${K}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Ae}; border-radius: 4px; color: ${re}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${W(re,60,Ae)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Ae}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${_e}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Ee}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Sn} }
.oc-sdk-check-desc { color: ${K}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${W(re,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${K}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${re}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Kt}; background: ${jt}; border-color: ${Ae}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Ie}; background: var(--oc-sdk-raised-bg); ${Qt} }
.oc-sdk-tab-count { color: ${K}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${W(re,6)}; color: ${K}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${W("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${oe}; }
.oc-sdk-row[aria-selected="true"] { background: ${jt}; color: ${Kt}; }
.oc-sdk-row-lead { font-family: ${qt}; color: ${K}; }
.oc-sdk-row-sub { color: ${K}; }
.oc-sdk-row-meta { color: ${K}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${K}; }

.oc-sdk-empty-body { color: ${K}; }

.oc-sdk-spinner { color: ${K}; }
.oc-sdk-spinner-ring { border-color: ${Ae}; border-top-color: ${Ee}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${W("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${K}; }

.oc-sdk-separator { color: ${K}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${W(Ae,40)}; }

.oc-sdk-progress-label { color: ${K}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${W(re,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${Ee}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${F("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${F("success-text","inherit")}; }

.oc-sdk-text a { color: ${Wt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${W(Ae,60)}; }
`,Y=`
${_t}
${Hr}
${hn}`;var gn="oc-sdk-ui-style",we=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},J=e=>{let t=document.getElementById(gn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}ft(document);let o=document.createElement("style");o.id=gn,o.textContent=e,document.head.appendChild(o)},j=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},fe=e=>{let t=j("button",e);return t.type="button",t},ce=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},me=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},bn=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var $r=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},He=(e,t)=>{J(Y);let o=t,r=fe("oc-sdk oc-sdk-btn"),i=$r(),a=document.createElement("span");r.append(a),e.append(r);let l=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==r?r.prepend(i):!o.loading&&i.parentNode===r&&i.remove(),ce(a,o.label)},p=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",p),l(),{update:v=>{o={...o,...v},l()},dispose:()=>{r.removeEventListener("click",p),r.remove()}}};var kn="http://www.w3.org/2000/svg",Xr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Ce=(e,t,o)=>{let r=document.createElementNS(kn,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.style.width=c(t),r.style.height=c(t),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let i=document.createElementNS(kn,"path");return i.setAttribute("d",Xr[e]),r.append(i),r};var Me=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Ue=(e,t,o)=>{let r=e.filter(v=>!v.disabled);if(r.length===0)return null;let i=r[0],a=r[r.length-1];if(o==="first"||!i||!a)return i?.id??null;if(o==="last")return a.id;let l=r.findIndex(v=>v.id===t);return l===-1?o==="next"?i.id:a.id:r[Math.min(r.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var An=(e,t)=>`${e}-${t??""}`,eo=(e,t,o,r)=>{let i=fe("oc-sdk-option");i.id=An(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let a=j("span","oc-sdk-option-label");if(a.textContent=o.label,i.append(a),o.hint){let l=j("span","oc-sdk-option-hint");l.textContent=o.hint,i.append(l)}if(t==="option"){i.dataset.mark="check";let l=j("span","oc-sdk-option-check");l.append(Ce("check",14)),i.append(l)}return i.addEventListener("pointerenter",r.hover),i.addEventListener("click",r.pick),i},to=(e,t,o,r)=>{let i=An(o,r);for(let a of Array.from(e.children))a instanceof HTMLElement&&a.classList.contains("oc-sdk-option")&&(a.dataset.active=a.id===i?"true":"false");me(t,"aria-activedescendant",r?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Vr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,i=window.innerHeight-o.bottom-8;r>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let a=o.left+e.offsetWidth-window.innerWidth+8;a>0&&(e.style.left=`${Math.max(8,Math.round(o.left-a))}px`)},oo=(e,t,o,r)=>{e.append(o),Vr(o,t);let i=bn(e,r),a=()=>{r()},l=p=>{p.target instanceof Node&&o.contains(p.target)||r()};return window.addEventListener("resize",a),window.addEventListener("scroll",l,!0),()=>{i(),window.removeEventListener("resize",a),window.removeEventListener("scroll",l,!0),o.remove()}};var no=(e,t)=>{me(e,"data-tone",t&&t!=="neutral"?t:null)},ro=(e,t)=>{J(Y);let o=t,r=j("span","oc-sdk oc-sdk-badge");e.append(r);let i=()=>{ce(r,o.label),no(r,o.tone)};return i(),{update:a=>{o={...o,...a},i()},dispose:()=>{r.remove()}}};var xn=e=>e.filter(t=>!("separator"in t)),Br=0,so=(e,t)=>{J(Y);let o=t,r=`oc-sdk-menu-${Br+=1}`,i=j("div","oc-sdk oc-sdk-menu");e.append(i);let a=j("div","oc-sdk oc-sdk-popup");a.setAttribute("role","menu"),a.tabIndex=-1;let l=null,p=null,v=He(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{l?L():_()}}),M=i.querySelector("button");M?.setAttribute("aria-haspopup","menu");let N=d=>{p=d,to(a,a,r,d)},U=()=>{we(a);for(let d of o.items){if("separator"in d){let f=j("div","oc-sdk-separator");f.dataset.labeled="false",a.append(f);continue}a.append(eo(r,"menuitem",d,{hover:()=>N(d.id),pick:()=>u(d.id)}))}N(xn(o.items).some(d=>d.id===p)?p:null)},L=()=>{let d=l;l=null,d?.(),p=null,M?.setAttribute("aria-expanded","false")},_=()=>{l||!M||(U(),l=oo(i,M,a,L),M.setAttribute("aria-expanded","true"),a.focus())},u=d=>{L(),M?.focus(),o.onSelect(d)},b=d=>{let f=Me(d);f?(d.preventDefault(),N(Ue(xn(o.items),p,f))):d.key==="Enter"||d.key===" "?(d.preventDefault(),p&&u(p)):d.key==="Escape"&&(d.preventDefault(),L(),M?.focus())},V=d=>{l&&!(d.relatedTarget instanceof Node&&i.contains(d.relatedTarget))&&L()};return a.addEventListener("keydown",b),i.addEventListener("focusout",V),{update:d=>{o={...o,...d},v.update({label:o.label,variant:o.variant,size:o.size}),l&&U()},dispose:()=>{L(),a.removeEventListener("keydown",b),i.removeEventListener("focusout",V),v.dispose(),i.remove()}}};var he=["backlog","todo","in_progress","review","done"],ge={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},io=1,$e=200,On=16e3;var ao="New task",Fr=512,jr=/^t_[a-z0-9]{6,40}$/,Rn=e=>typeof e=="string"&&he.includes(e),Kr=(e=Date.now(),t=Math.random)=>{let o=Array.from({length:6},()=>Math.floor(t()*36).toString(36)).join("");return`t_${e.toString(36)}${o}`},pe=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>Fr)throw new Error(`${t} is too long`);return o},co=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>$e)throw new Error(`Title is limited to ${$e} characters`);return t},st=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>On)throw new Error(`Description is limited to ${On} characters`);return e};var yn=e=>{if(e===void 0)return;if(!Array.isArray(e))throw new Error("agentNotes must be an array");let t=[];for(let o of e){if(!o||typeof o!="object")throw new Error("agentNotes entries must be objects");let r=o;t.push({at:rt(r.at,"agentNotes.at"),text:st(r.text)})}return t};var Wr=e=>e===void 0?{}:{agentNotes:yn(e)},vn=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=pe(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:pe(t.branch,"worktree.branch")}},rt=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},In=(e,t)=>e==null?null:rt(e,t),lo=(e,t,o=Date.now(),r=Kr(o))=>({schemaVersion:io,id:r,title:co(e.title),description:st(e.description),status:e.status??"backlog",rank:t,projectId:pe(e.projectId,"projectId"),sourceBranch:pe(e.sourceBranch,"sourceBranch"),worktree:null,sessionId:null,createdAt:o,updatedAt:o,needsAttentionSince:null}),Ne=(e,t,o=Date.now())=>{let r={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(r.title=co(t.title)),"description"in t&&(r.description=st(t.description)),"status"in t){if(!Rn(t.status))throw new Error("Unknown status");r.status=t.status}if("projectId"in t&&(r.projectId=pe(t.projectId,"projectId")),"sourceBranch"in t&&(r.sourceBranch=pe(t.sourceBranch,"sourceBranch")),"worktree"in t&&(r.worktree=vn(t.worktree)),"sessionId"in t&&(r.sessionId=pe(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");r.rank=t.rank}if("needsAttentionSince"in t&&(r.needsAttentionSince=In(t.needsAttentionSince,"needsAttentionSince")),"agentNotes"in t){let i=yn(t.agentNotes);i!==void 0?r.agentNotes=i:delete r.agentNotes}return r},po=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==io)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!jr.test(t.id))throw new Error("Task id is invalid");if(!Rn(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:io,id:t.id,title:co(t.title),description:st(t.description),status:t.status,rank:t.rank,projectId:pe(t.projectId,"projectId"),sourceBranch:pe(t.sourceBranch,"sourceBranch"),worktree:vn(t.worktree),sessionId:pe(t.sessionId,"sessionId"),createdAt:rt(t.createdAt,"createdAt"),updatedAt:rt(t.updatedAt,"updatedAt"),needsAttentionSince:In(t.needsAttentionSince,"needsAttentionSince"),...Wr(t.agentNotes)}};var Cn="task:",wn=16,uo=e=>`${Cn}${e}`,Le=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Cn)),o=[],r=[];for(let i=0;i<t.length;i+=wn)await Promise.all(t.slice(i,i+wn).map(async a=>{try{let l=po(await e.storage.get(a));if(uo(l.id)!==a)throw new Error("Task id does not match its key");o.push(l)}catch{r.push(a)}}));return{tasks:o,failedKeys:r}},Pe=async(e,t)=>{let o=po(t);await e.storage.set(uo(o.id),o)},it=(e,t)=>e.storage.delete(uo(t)),Eo=async(e,t,o=3)=>{for(let r=1;r<=o;r+=1)try{await Pe(e,t);return}catch(i){if(r===o)throw i;await new Promise(a=>setTimeout(a,300*r))}};var at="__all__",Mn="__none__",Un=1024;var _o=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),ct=(e,t)=>!(t.projectId===Mn&&e.projectId!==null||t.projectId!==at&&t.projectId!==Mn&&e.projectId!==t.projectId),fo=(e,t)=>{let o=e.filter(r=>r.status===t).map(r=>r.rank);return o.length?Math.max(...o)+Un:Un};var zr="dismissed-sessions",So=async e=>{let t=await e.storage.get(zr);return Array.isArray(t)?new Set(t.filter(o=>typeof o=="string"&&o.length>0)):new Set};var Nn=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:Ne(e,{status:t,needsAttentionSince:null});var le={waitingPermissionMeansReview:!0,failedMeansReview:!0},De=(e,t,o,r=le)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",a=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return a();case"waiting-question":return i();case"waiting-permission":return r.waitingPermissionMeansReview?i():null;case"idle":return o==="completed"||o==="failed"&&r.failedMeansReview?i():null;default:return null}};var Ln=(e,t)=>e.parentId===null&&e.archivedAt===null&&!t.has(e.id),Pn=(e,t=le)=>De("backlog",e.activity,e.outcome,t),Dn=(e,t)=>{let o=e.title.trim();return o&&o!==e.id?o.slice(0,200):t?`New session in ${t}`:`New session (${e.id.slice(0,8)})`},Gn=e=>{let t=e.title.trim();if(t&&t!==ao)return t.slice(0,$e);let o=e.description.trim().split(`
`)[0]?.trim()??"";return o?o.slice(0,$e):t||ao};var Hn=async(e,t)=>{let o=await Le(e);if(o.tasks.some(p=>p.sessionId===t.session.id))return null;let r={...lo({title:Dn(t.session,t.projectName),projectId:t.projectId,status:t.status},fo(o.tasks,t.status)),sessionId:t.session.id,needsAttentionSince:t.status==="review"?Date.now():null};await Pe(e,r);let a=(await Le(e)).tasks.filter(p=>p.sessionId===t.session.id&&p.id!==r.id),l=a.length===0?null:a.reduce((p,v)=>p.id<v.id?p:v);return l===null?{adopted:!0,task:r}:r.id<l.id?(await it(e,l.id).catch(()=>{}),{adopted:!0,task:r}):(await it(e,r.id).catch(()=>{}),{adopted:!1,task:l})};var $n="orphan-watermark",Xn=async e=>{let t=await e.storage.get($n);return typeof t=="number"&&Number.isFinite(t)?t:null},Vn=(e,t)=>e.storage.set($n,t);var Bn=(e,t)=>t.sessionId===null?null:t.worktree?{directory:t.worktree.directory,branch:t.worktree.branch}:typeof e=="object"&&e.kind==="existing"?{directory:e.directory,branch:null}:null;var qr="kanban-board",Yr=e=>`https://kanban.local/tasks/${e}`,Fn=e=>{let t={providerId:qr,id:e.id,title:Gn(e),url:Yr(e.id),worktree:e.worktree?{kind:"existing",directory:e.worktree.directory}:!1,navigation:"preserve"};return e.projectId&&(t.projectId=e.projectId),t},jn=(e,t)=>({sessionId:t.sessionId,worktree:Bn(e.worktree??!1,t)}),Kn=e=>e.description.trim()||e.title;var Wn=10*6e4,Jr=60,Qr=(e,t,o=le)=>t?De(e.status,t.activity,t.outcome,o)??e.status:e.status,Zr=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,zn=(e,t)=>e.needsAttentionSince??t.updatedAt,qn=(e,t,o,r=Wn)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-zn(e,t)<r?null:e.needsAttentionSince!==null?"hint":"quiet",es=(e,t,o,r=Wn)=>{if(!t||qn(e,t,o,r)===null)return null;let i=Math.floor((o-zn(e,t))/6e4);return i>0&&i<Jr?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var ts=(e,t,o=le,r=Date.now())=>{let i=Zr(e,t),a=Qr(e,i,o),l=a!==e.status,p=e.needsAttentionSince!==null||l&&a==="review",v=qn(e,i,r);return{task:e,displayStatus:a,movedByAgent:l,attention:p,attentionSince:e.needsAttentionSince??(p&&i?i.updatedAt:null),live:i,looksDone:v,looksDoneNote:v?es(e,i,r):null}},os=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||_o(e.task,t.task),Yn=(e,t,o,r=le,i=Date.now())=>{let a=Object.fromEntries(he.map(l=>[l,[]]));for(let l of e){if(!ct(l,o))continue;let p=ts(l,t,r,i);a[p.displayStatus].push(p)}for(let l of he)a[l].sort((p,v)=>l==="review"?os(p,v):_o(p.task,v.task));return a},Jn=e=>Object.values(e).reduce((t,o)=>t+o.filter(r=>r.attention&&r.displayStatus!=="done").length,0),Qn=e=>Object.values(e).reduce((t,o)=>t+o.filter(r=>r.displayStatus!=="done").length,0),Zn=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},er=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var tr=(e,t,o)=>{let r=o.sessions.find(i=>i.id===e);if(r)return r.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(a=>a.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var or=(e,t,o,r,i={})=>{let a=i.onLiveChange,l=i.onSnapshot??(()=>{}),p=new Map,v=new Map,M=new Map,N=new Map,U=!1,L=(d,f)=>{if(f.state==="loading")return!1;let A=0;for(let[x,G]of M)G.projectId===d&&(M.delete(x),A+=1);if(f.state!=="ready")return A>0;for(let x of f.sessions)x.parentId===null&&M.set(x.id,{projectId:d,activity:x.activity,outcome:x.outcome,updatedAt:x.updatedAt});return!0},_=(d,f)=>{if(U)return;L(d,f)&&a&&a(),l();for(let x of f.sessions)N.set(x.id,x.directory);if(o)for(let x of v.values()){if(x.projectId!==d||!x.sessionId)continue;let G=tr(x.sessionId,N.get(x.sessionId)??null,f);if(r&&(G==="deleted"||G==="archived")){r(x.id,x.sessionId,G);continue}let z=f.sessions.find(P=>P.id===x.sessionId);if(!z)continue;let ne=De(x.status,z.activity,z.outcome,t);ne&&o(x.id,ne)}},u=d=>{let f=e.onSessions(d,A=>_(d,A));p.set(d,f),f.then(A=>{(U||!p.has(d))&&A()},()=>{})};return{live:()=>M,sync:d=>{if(U)return;v=new Map(d.map(A=>[A.id,A]));let f=new Set(d.filter(A=>A.sessionId&&A.projectId).map(A=>A.projectId));for(let A of f)p.has(A)||u(A);for(let[A,x]of p)if(!f.has(A)){p.delete(A);for(let[G,z]of M)z.projectId===A&&M.delete(G);x.then(G=>G(),()=>{})}},dispose:()=>{U=!0;for(let d of p.values())d.then(f=>f(),()=>{});p.clear()}}};var nr=(e,t,o,r=le)=>{let i=!1,a=new Map,l=(N,U)=>{if(i)return;let L=t();for(let _ of U.sessions){if(!Ln(_,L))continue;let u=Pn(_,r);u&&o({projectId:N,session:{id:_.id,title:_.title,createdAt:_.createdAt},status:u})}},p=N=>{if(a.has(N))return;let U=e.onSessions(N,L=>l(N,L));a.set(N,U),U.then(L=>{(i||!a.has(N))&&L()},()=>{})},v=e.onProjects(N=>{if(i)return;let U=new Set(N.projects.map(L=>L.id));for(let L of U)p(L);for(let[L,_]of a)U.has(L)||(a.delete(L),_.then(u=>u(),()=>{}))});return{dispose:()=>{i=!0,v.then(N=>N(),()=>{});for(let N of a.values())N.then(U=>U(),()=>{});a.clear()}}};var rr=(e,t)=>{if(!t)return null;let o=e.find(r=>r.directory===t);return o||(e.filter(r=>t.startsWith(`${r.directory}/`)).sort((r,i)=>i.directory.length-r.directory.length)[0]??null)},ue=e=>{if(e instanceof m)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var sr=(e,t,{settledMs:o=700,onLost:r}={})=>{let i=null;e.prompt({text:t}).then(()=>{i=!0},()=>{i=!1}),setTimeout(()=>{e.prompt({text:t}).catch(()=>{i===!1&&r?.()})},o)};var y=(e,t="",o="")=>{let r=document.createElement(e);return t&&(r.className=t),o&&(r.textContent=o),r};var dt="http://www.w3.org/2000/svg",ns={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},ar=e=>{let t=document.createElementNS(dt,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},rs=()=>ar(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(dt,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let r=document.createElementNS(dt,"path");r.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,r)}),ss=()=>ar(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(dt,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),To=e=>{let t=y("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},ir=()=>{let e=y("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},is={running:rs,"waiting-question":()=>To("?"),"waiting-permission":ss,failed:()=>To("!"),finished:()=>To("\u2713"),idle:ir,linked:ir},cr=e=>{let t=y("span","kb-agent-pill"),o=ns[e.key];return o&&(t.dataset.tone=o),t.append(is[e.key]()),t.append(y("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var dr=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var lr="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",pr="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",as=`${pr} M9.25 5.75h1.5v6.5H9.25z M6.75 8.25h6.5v1.5H6.75z`,cs="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",ds=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("fill-rule","evenodd"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},lt=(e,t,o,r={})=>{let i=y("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),r.primary&&(i.dataset.primary="true"),r.hint&&(i.dataset.hint="true"),r.quiet&&(i.dataset.quiet="true"),r.info&&(i.dataset.info="true"),i.append(ds(e)),i.addEventListener("click",a=>{a.stopPropagation(),o()}),i},ls=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...he.filter(r=>r!==e.displayStatus).map(r=>({id:`move:${r}`,label:`Move to ${ge[r]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},ur=(e,t,o)=>{let r=t==="rail",i=y("div",r?"kb-panel-sections":"kb-columns");e.append(i);let a=[],l=null,p=(_,u)=>[..._.querySelectorAll(".kb-draggable-item")].filter(b=>b.dataset.id!==u).map(b=>({id:b.dataset.id??"",top:b.getBoundingClientRect().top,height:b.getBoundingClientRect().height})),v=(_,u,b,V)=>{_.addEventListener("dragover",d=>{l&&(d.preventDefault(),_.classList.add("kb-dragover"))}),_.addEventListener("dragleave",d=>{d.target===_&&_.classList.remove("kb-dragover")}),_.addEventListener("drop",d=>{d.preventDefault(),_.classList.remove("kb-dragover");let f=l??d.dataTransfer?.getData("text/plain")??null;if(l=null,!f)return;if(r&&d.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(f,b);return}let A=dr(p(u,f),d.clientY);V(f,b,A)})},M=_=>{let{task:u}=_,b=y("div",_.attention?"kb-item kb-attn":"kb-item");r?b.classList.add("kb-panel-row"):b.classList.add("kb-card");let V=o.onDrop!==void 0;V?(b.classList.add("kb-draggable-item"),b.draggable=!0):b.draggable=!1,b.dataset.id=u.id;let d=o.isSelected?.(u)??!1;d&&(b.dataset.selected="true");let f=y("div","kb-panel-main");b.append(f);let A=y("div","kb-item-top");if(o.onToggleSelect){let P=o.onToggleSelect,D=document.createElement("input");D.type="checkbox",D.className="kb-check",D.checked=d;let te=d?"Deselect":"Select";D.title=`${te} "${u.title}"`,D.setAttribute("aria-label",`${te} task: ${u.title}`),D.addEventListener("click",Q=>Q.stopPropagation()),D.addEventListener("change",()=>P(u)),A.append(D)}A.append(y("div","kb-panel-title",u.title)),f.append(A);let x=o.projectName(u),G=y("div","kb-panel-sub");x&&G.append(y("span","kb-panel-project",x));let z=_.live?er(_.live):u.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(z&&G.append(cr(z)),f.append(G),r&&o.onChat&&(u.sessionId||u.projectId&&_.displayStatus!=="done")){let P=o.onChat;A.append(lt(u.sessionId?pr:as,u.sessionId?"Open chat":"New chat",()=>P(u),u.sessionId&&_.attention?{primary:!0}:{}))}if(r&&_.displayStatus!=="done"&&o.onMarkDone){let P=o.onMarkDone;A.append(lt(lr,"Mark done",()=>P(u),{info:!0}))}let ne=ls(_,o);if(!r&&_.looksDone&&o.onLooksDone){let P=o.onLooksDone;A.append(lt(lr,_.looksDoneNote??"Looks done \u2014 click to mark Done",()=>P(u),_.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(ne){let P=y("span","kb-panel-menu");A.append(P),a.push(so(P,{label:"\u22EF",variant:"ghost",size:"xs",items:ne,onSelect:D=>{if(D==="delete"&&o.onDelete){o.onDelete(u);return}if(D==="edit"&&o.onEdit){o.onEdit(u);return}if(D.startsWith("move:")){let te=D.slice(5);he.includes(te)&&o.onMoveStatus&&o.onMoveStatus(u,te)}}}))}if(o.onActivate){let P=()=>o.onActivate(u);b.addEventListener("click",D=>{if(!D.target?.closest(".kb-panel-menu")){if(o.onToggleSelect&&(D.metaKey||D.ctrlKey)){o.onToggleSelect(u);return}P()}}),b.tabIndex=0,b.addEventListener("keydown",D=>{(D.key==="Enter"||D.key===" ")&&(D.preventDefault(),P())})}return V&&(b.addEventListener("dragstart",P=>{l=u.id,b.classList.add("kb-dragging"),P.dataTransfer?.setData("text/plain",u.id),P.dataTransfer&&(P.dataTransfer.effectAllowed="move")}),b.addEventListener("dragend",()=>{l=null,b.classList.remove("kb-dragging")})),b},N=(_,u)=>{let b=y("div","kb-column");b.dataset.status=_;let V=y("div","kb-column-head"),d=y("span","kb-column-count",String(u.length));u.some(x=>x.attention&&x.displayStatus!=="done")&&(d.dataset.attn="true");let f=y("span","kb-column-tools");if(f.append(d),o.onEmptyColumn){let x=o.onEmptyColumn,G=o.isColumnEmptyArmed?.(_)??!1,z=lt(cs,G?`Click again to empty ${ge[_]}`:`Empty ${ge[_]}`,()=>x(_));G&&(z.dataset.armed="true"),f.append(z)}V.append(y("span","kb-column-title",ge[_]),f);let A=y("div","kb-column-body");b.append(V,A),u.length===0&&A.append(y("div","kb-column-empty","No tasks"));for(let x of u)A.append(M(x));return o.onDrop&&v(b,A,_,o.onDrop),b},U=(_,u)=>{let b=y("div","kb-psec");b.dataset.status=_;let V=o.onToggleSection!==void 0,d=V&&(o.isCollapsed?.(_)??!1),f=V?document.createElement("button"):y("div","kb-psec-head");f.className="kb-psec-head",f instanceof HTMLButtonElement&&(f.type="button"),f.append(y("span","kb-psec-name",ge[_]));let A=y("span","kb-psec-count","0");u.some(G=>G.attention&&G.displayStatus!=="done")&&(A.dataset.attn="true"),f.append(A),V&&(f.append(y("span","kb-psec-chevron",d?"\u25B8":"\u25BE")),f.addEventListener("click",()=>o.onToggleSection?.(_)));let x=y("div","kb-psec-body");if(x.hidden=d,b.append(f,x),!d){u.length===0&&x.append(y("div","kb-panel-empty","No tasks"));for(let G of u)x.append(M(G))}return o.onDrop&&v(b,x,_,o.onDrop),b};return{render:_=>{for(let u of a.splice(0))u.dispose();i.replaceChildren();for(let u of he)i.append(r?U(u,_[u]):N(u,_[u]))},dispose:()=>{for(let _ of a.splice(0))_.dispose();i.replaceChildren()}}};var ps=`
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
.kb-agent-note{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border:1px solid var(--oc-border);border-radius:var(--oc-radius,8px);background:var(--oc-card,transparent)}
.kb-agent-note-head{display:flex;align-items:center;justify-content:space-between}
.kb-agent-note-text{white-space:pre-wrap;overflow-wrap:break-word;font-size:13px}
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
/* Dictation, blended into the description field (OpenChamber's composer
   look): while idle a lone ghost mic sits inside the textarea's bottom-right
   corner; while a capture runs a strip fades over the field's own bottom
   edge \u2014 pulsing dot, live level bars, duration and icon actions, spinner
   plus status while transcribing. No card and no border of its own.
   kb-field-float is the relative box detail.ts wraps the (SDK-rendered)
   textarea in; without it the controls fall back to plain flow below the
   field (kb-dict-plain), the same parts at the same sizes. */
.kb-dict{display:contents}
.kb-dict-plain{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.kb-field-float{position:relative}
/* Reserved bottom room: mic (idle) and strip (recording) live inside the
   textarea's frame over the field background, so typed lines must stop above
   them \u2014 the composer's standing padding trade. */
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
   pulse and spin hold their shape \u2014 the timer and bars still live-update. */
@media (prefers-reduced-motion:reduce){.kb-dict-dot,.kb-dict-spin{animation:none}}
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
  /* The in-field mic and the strip's buttons reach a tappable size too. */
  .kb-dict-inline{width:30px;height:30px}
  .kb-dict-iconbtn{width:26px;height:26px}
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
[hidden]{display:none!important}
`,Er=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=ps,document.head.append(e)};var _r=(e,t,o)=>{Er(),t.replaceChildren();let r=!1,i=[],a=[],l=o?.directory??null,p=null,v,M,N=!1,U=!1,L=null,_,u,b,V,d=(E,R)=>E.filter(I=>ct(I,{projectId:R??at})),f=E=>{i=[...E],A.sync(d(i,p?.id??null))},A=or(e,le,null,void 0,{onLiveChange:()=>{U&&!r&&ie()},onSnapshot:()=>{Z()}}),x=new Set,G=()=>new Set([...x,...i.flatMap(E=>E.sessionId?[E.sessionId]:[])]),z=new Set,ne=0,P=1/0,D=null,te=(E,R,I)=>{p&&E!==p.id||r||ne>0||z.has(R.id)||G().has(R.id)||R.createdAt<P||(z.add(R.id),(async()=>{try{let k=await Hn(e,{projectId:E,session:R,status:I,projectName:a.find(H=>H.id===E)?.name??null});if(k===null||r)return;f(i.filter(H=>H.id!==k.task.id).concat(k.task)),U&&ie(),k.adopted&&e.toast({kind:"info",message:`Added "${k.task.title}" to the board (${ge[I]}) \u2014 found a session running with no task.`}).catch(()=>{})}catch(k){e.toast({kind:"error",message:`Could not add the task for a found session \u2014 ${ue(k)}`}).catch(()=>{})}})())},Q=()=>{p=rr(a,l)},g=y("div","kb-page kb-rail"),h=y("div","kb-row between");h.append(y("h2","","Kanban"));let se=y("span");h.append(se),g.append(h),u=y("p","kb-muted","Loading\u2026"),g.append(u),b=y("p","kb-rail-scope"),g.append(b),V=y("p","kb-panel-unseen"),g.append(V),L=ur(g,"rail",{projectName:E=>!p&&E.projectId?a.find(R=>R.id===E.projectId)?.name??null:null,onMarkDone:async E=>{let R=i.find(k=>k.id===E.id)??E,I=Nn(R,"done");if(I){try{await Pe(e,I)}catch(k){e.toast({kind:"error",message:`Could not mark "${R.title}" done \u2014 ${ue(k)}`}).catch(()=>{}),be();return}f(i.map(k=>k.id===R.id?I:k)),ie()}},onChat:async E=>{let R=i.find(q=>q.id===E.id)??E;if(R.sessionId){if(R.needsAttentionSince!==null){let q=Ne(R,{needsAttentionSince:null});try{await Eo(e,q),f(i.map(ke=>ke.id===R.id?q:ke)),ie()}catch(ke){e.toast({kind:"error",message:`Opened the chat, but marking "${R.title}" reviewed failed \u2014 ${ue(ke)}`}).catch(()=>{})}}try{await e.openSession(R.sessionId)}catch(q){e.toast({kind:"error",message:`Could not open the chat of "${R.title}" \u2014 ${ue(q)}`}).catch(()=>{})}return}if(!R.projectId)return;let I=Fn(R);ne+=1;let k;try{k=await e.startSession(I),k.sessionId!==null&&z.add(k.sessionId)}catch(q){e.toast({kind:"error",message:`Could not start the chat for "${R.title}" \u2014 ${ue(q)}`}).catch(()=>{});return}finally{ne-=1}if(k.sessionId===null){e.toast({kind:"error",message:`Could not start the chat (${k.failure}). Its worktree at ${k.directory} was kept so you can recover it by hand.`}).catch(()=>{});return}let H=Ne(R,jn(I,k));try{await Eo(e,H)}catch(q){e.toast({kind:"error",message:`Started a chat for "${R.title}", but the link could not be saved \u2014 ${ue(q)}. Open the full board to link it.`}).catch(()=>{}),be();return}f(i.map(q=>q.id===R.id?H:q)),ie();try{await e.openSession(k.sessionId)}catch(q){e.toast({kind:"error",message:`Started the chat, but it could not be opened \u2014 ${ue(q)}.`}).catch(()=>{});return}sr(e,Kn(R),{onLost:()=>{e.toast({kind:"info",message:`The chat was created but its composer wasn't filled \u2014 the description is still on the card "${R.title}".`}).catch(()=>{})}})}});let Se=y("div","kb-rail-foot");Se.append(y("p","kb-muted","Two quick actions live here \u2014 the \u2713 marks a task Done, and the chat button opens the linked chat of a card (starting one attached to it when there is none). Everything else (open, move, edit, delete) is the full board, one click away: pull this panel wider, or the Extension pages menu.")),g.append(Se),t.append(g),_=ro(se,{label:"",tone:"neutral"}),v=window.setInterval(()=>{be()},3e4);let Te=null;e.onProjects(E=>{r||E.state!=="ready"||(a=E.projects,Q(),f(i),U&&ie())}).then(E=>{r?E():Te=E},()=>{});let Xe=e.onDirectory(E=>{r||(l=E,Q(),f(i),U&&ie())}),ee=async()=>{try{let[E,R,I]=await Promise.all([Le(e),Xn(e),So(e)]);if(r)return;f(E.tasks),x=I,R===null?(P=Date.now(),Vn(e,P).catch(()=>{})):P=R,U=!0,u.hidden=!0,ie(),D=nr(e,G,k=>te(k.projectId,k.session,k.status))}catch(E){u.textContent=`Could not load tasks \u2014 ${ue(E)}`}},be=async()=>{if(!(r||N)){N=!0;try{let[{tasks:E},R]=await Promise.all([Le(e),So(e)]);if(r)return;x=R,f(E),U||(U=!0,u.hidden=!0),ie()}catch(E){U||(u.textContent=`Could not load tasks \u2014 ${ue(E)}`)}finally{N=!1}}},Z=()=>{M!==void 0||r||(M=window.setTimeout(()=>{M=void 0,be()},500))},ie=()=>{let E=Yn(i,A.live(),{projectId:p?.id??at}),R=Qn(E),I=Jn(E);p?(b.textContent=`Project: ${p.name}`,b.hidden=!1):b.hidden=!0;let k=Zn(R,I);_.update({label:k.label,tone:k.tone}),I>0?(V.textContent=`${I} task${I===1?"":"s"} need${I===1?"s":""} your review`,V.hidden=!1):V.hidden=!0,L?.render(E)};return ee(),{dispose:()=>{r||(r=!0,v!==void 0&&window.clearInterval(v),M!==void 0&&window.clearTimeout(M),Te?.(),Xe(),D?.dispose(),A.dispose(),L?.dispose())}}};var mo=Bt(),fr=document.querySelector("#root");if(!fr)throw new Error("Missing #root");var ho=null;mo.onReady(e=>{Ft(e,document.documentElement),!ho&&(ho=_r(mo,fr,{directory:e.directory}))});window.addEventListener("pagehide",()=>{ho?.dispose(),mo.dispose()});})();
