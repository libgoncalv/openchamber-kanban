"use strict";(()=>{var M="openchamber.sdk";var We="data-oc-scrolling",Tt=`
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
:hover, [${We}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${We}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${We}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${We}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function mt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let i=r.target===e?t:r.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let a=o.get(i);a!==void 0&&clearTimeout(a),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Rr=`(${mt.toString()})(document);`;var wo=e=>{let t=[],o=0,r=0;return{push:i=>{for(t.push(i),r+=i.length;r-o>e&&t.length>1;){let a=t.shift();r-=a?.length??0,o=0}},pull:i=>{let a=0;for(;a<i.length&&t.length>0;){let d=t[0],p=Math.min(i.length-a,d.length-o);i.set(d.subarray(o,o+p),a),a+=p,o+=p,o>=d.length&&(t.shift(),r-=d.length,o=0)}i.fill(0,a)},clear:()=>{t.length=0,o=0,r=0},get size(){return r-o}}};var No=/^[a-z][a-z0-9-]{0,39}$/;var Co=e=>Object(e)===e&&!Array.isArray(e),ht=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Mo=e=>String(e)===e&&e.length>=1&&e.length<=60,Uo=e=>String(e)===e&&e.length>=1&&e.length<=80,Lo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Co(o)||!No.test(o.id)||!Mo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!ht(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!ht(o,["kind","id","label","value","options","disabled"])||!Uo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let i of o.options){if(!Co(i)||!ht(i,["value","label"])||!Uo(i.value)||!Mo(i.label)||r.has(i.value))return!1;r.add(i.value)}if(!r.has(o.value))return!1}return!0};var vr=1024*1024;var Po=["{id}","{segment}","{segments+}"];var Cs=new Set(Po);var Do=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Us=new Set(Do);var gt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Go=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Ho=/^[A-Za-z0-9_-]{1,80}$/;var $o=["left","right","top","bottom"];var Xo=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of r)if(!Xo(i,t+1,o))return!1;return!0},bt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(bt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(bt)}return String(e)===e||Number.isFinite(e)},kt=e=>{try{return String(e.id)!==e.id||!Ho.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!$o.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Xo(e.data)||!bt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var Vo=/^[0-9a-f]{7,64}$/i,Bo=e=>Vo.test(e),At=255,Fo=(e,t,o)=>({openCommit:r=>Bo(r)?e({channel:M,v:1,type:"open-commit",id:t(),payload:{sha:r}}):o("Commit id must be 7 to 64 hex characters."),openWalkthrough:({base:r})=>{let i=r.trim();return!i||i.length>At?o(`Base must contain 1 to ${At} characters.`):e({channel:M,v:1,type:"open-walkthrough",id:t(),payload:{base:i}})}});var Ot=2e3;var Ko=["file","directory","other","missing"],Rt=e=>!!(e&&"sessionId"in e),yt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var ze=500,qe=32e3,Wo=16e3,zo=128,qo=200,Yo=2e3,Jo=16e3,Qo=80,Zo=200,en=16e3;var tn=2e3;var vt=2e4,Ye=1024,Je=2e6;var Qe=64e3,Ze=8e3,It=4e3;var wt=96e4,Ir=60*6e4;var on=999,nn=1e4,$e=500,rn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],sn=["stopped","starting","ready","failed"],wr=new Set(rn),an=e=>wr.has(e),cn=e=>e&&an(e)?e:"HOST_REJECTED",Ie=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ie):Object(e)===e?Object.values(e).every(Ie):!1,dn=e=>Ie(e)&&JSON.stringify(e).length<=en,jo=e=>e?.trim().slice(0,Zo)??"",we=e=>{let t=e.id.trim().slice(0,zo),o=e.title.trim().slice(0,qo),r=e.url.trim().slice(0,Yo),i=e.text?.trim().slice(0,Jo),a=e.author?.trim().slice(0,Qo),d=e.kind==="pull"?"pull":"issue",p={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:d};if(i&&(p.text=i),a&&(p.author=a),d==="pull"){let I=jo(e.branches?.head),N=jo(e.branches?.base);I&&N&&(p.branches={head:I,base:N})}return dn(e.data)&&(p.data=e.data),p},Ct=e=>{let t=we(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Mt=e=>{let t={text:e.text.trim().slice(0,Wo)};return e.send&&(t.send=!0),t},Ut=e=>e===null||!Number.isFinite(e)?null:Math.min(on,Math.max(0,Math.round(e))),Nt=e=>Number.isFinite(e)?Math.min(nn,Math.max(0,Math.ceil(e))):0;var Ce=e=>e.length>0&&e.length<=Ye&&!e.includes("\0")&&!e.includes("\\");var et=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>tn?!1:!e.split("/").some(o=>o==="."||o===".."),Cr=new Set(sn),Lt=e=>!!(e&&"status"in e&&Cr.has(String(e.status))&&!("body"in e)),tt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Pt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Dt=e=>!!(e&&"written"in e&&e.written===!0),Gt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Mr=new Set(Ko),Ht=e=>!!(e&&"kind"in e&&"size"in e&&Mr.has(String(e.kind))&&Number.isFinite(e.size)),$t=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Ur=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),Nr=e=>Object(e)===e?e:null,xt=e=>String(e)===e&&e.length>0,Lr=e=>{if(!xt(e.id))return null;if(e.ok===!0){let t={channel:M,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&xt(e.error)?{channel:M,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:cn(xt(e.code)?e.code:void 0)}:null},Xt=e=>{let t=Nr(e);return!t||t.channel!==M||t.v!==1?null:t.type==="result"?Lr(t):!Ur.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var ln=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Pr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",g=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},pn=()=>Promise.reject(new g("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ot=()=>Promise.reject(new g("BAD_PATH",`File path must be 1 to ${Ye} characters without NUL or backslash.`)),nt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new g("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},y=e=>(e.value+=1,`oc-${e.value}`),Kt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new g("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),r=e.requestTimeoutMs??vt,i=new Set,a=new Set,d=new Set,p=new Set,I=new Set,N=new Set,L=new Set,w=new Set,v=new Set,l=new Set,u=new Set,h=new Set,V=[],f=null,_=null,x=new Set,A=new Set,G=null,z=null,ne=!1,H=new Map,D=new Map,Z=new Map,ee=!1,O={value:0},T=null,re=null,Se=!1,Te=!1,He=null,te=null,Ve=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,q=n=>{t.parent.postMessage(n,"*")},Be=()=>{ee||t.parent===t||h.size===0||T?.features?.lateGenerateResults!==!0||q({channel:M,v:1,type:"generate-late-listen"})},P=(n,s)=>{for(let m of n)try{m(s)}catch(S){console.error(S)}},b=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let s=Xt(n.data);if(!s)return;if(s.type==="workspace"){let S=D.get(s.payload.subscriptionId);S&&P([S],s.payload.snapshot);return}if(s.type==="shells"){let S=Z.get(s.payload.subscriptionId);S&&P([S],s.payload.snapshot);return}if(s.type==="microphone-audio"){te?.queue.push(s.payload.samples);return}if(s.type==="microphone-ended"){let S=te;if(!S)return;te=null,S.release(),P(S.endedListeners,s.payload.reason);return}if(s.type==="ready"){T=s.payload,re=Ve(s.payload.session),P(i,s.payload),P(a,s.payload.directory),P(d,s.payload.session),re&&P(p,re),P(I,s.payload.connection),P(N,s.payload.settings),P(L,s.payload.item),s.payload.block&&P(w,s.payload.block),Be();return}if(s.type==="service-event"){P(v,s.payload);return}if(s.type==="generate-late"){h.size===0?V.push(s.payload):P(h,s.payload);return}if(s.type==="directory"){T&&(T={...T,directory:s.payload.directory}),P(a,s.payload.directory);return}if(s.type==="session"){T&&(T={...T,session:s.payload.session}),s.payload.session?re?.sessionId!==s.payload.session.id&&(re=Ve(s.payload.session)):re=null,P(d,s.payload.session);return}if(s.type==="session-lifecycle"){re=s.payload,P(p,s.payload);return}if(s.type==="connection"){T&&(T={...T,connection:s.payload.connection}),P(I,s.payload.connection);return}if(s.type==="settings"){T&&(T={...T,settings:s.payload.settings}),P(N,s.payload.settings);return}if(s.type==="item"){T&&(T={...T,item:s.payload.item}),P(L,s.payload.item);return}if(s.type==="status-control-event"){P(l,s.payload);return}if(s.type==="popover-closed"){P(u,s.payload);return}if(s.type==="action"){let S=X=>{ee||q({channel:M,v:1,type:"action-result",id:s.id,payload:X})},$=_;if(!$){S({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>$(s.payload)).then(()=>S({ok:!0}),X=>{let B=(X instanceof Error?X.message:String(X)).trim();S({ok:!1,error:(B||"Action failed.").slice(0,$e)})});return}if(s.type==="file-open"){let S=s.payload;if(z&&Go(z,S))return;z=S,P(x,s.payload);return}if(s.type==="file-saved"){P(A,s.payload.version);return}if(s.type==="file-snapshot"){let S=B=>{ee||q({channel:M,v:1,type:"file-snapshot-result",id:s.id,payload:B})},$=B=>S({error:(B.trim()||"Could not read the edited file.").slice(0,$e)}),X=G;if(!X){$("This extension does not edit files.");return}Promise.resolve().then(()=>X(s.payload.purpose)).then(B=>{if(gt(B)>2e7){$(`The file is over ${2e7} ${"bytes"in B?"bytes":"characters"}.`);return}if(B.version.length>256){$(`The snapshot version is over ${256} characters.`);return}S({snapshot:"bytes"in B?{bytes:B.bytes,version:B.version}:{content:B.content,version:B.version}})},B=>$(B instanceof Error?B.message:String(B)));return}if(s.type==="resolve"){let S=X=>{q({channel:M,v:1,type:"resolve-result",id:s.id,payload:X})},$=f;if(!$){S({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>$(s.payload)).then(X=>S({item:X?we(X):null}),X=>{let B=(X instanceof Error?X.message:String(X)).trim();S({error:(B||"Command failed.").slice(0,$e)})});return}let m=H.get(s.id);if(m){if(clearTimeout(m.timer),H.delete(s.id),s.ok){m.resolve(s.payload);return}m.reject(new g(s.code,s.error))}};t.addEventListener("message",b),q({channel:M,v:1,type:"hello"});let E=(n,s=r)=>ee||t.parent===t?Promise.reject(new g("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((m,S)=>{let $=setTimeout(()=>{H.delete(n.id),S(new g("HOST_TIMEOUT","Host did not answer in time."))},s);H.set(n.id,{resolve:m,reject:S,timer:$}),q(n)}),R=n=>E(n).then(()=>{}),k={channel:M,v:1},pe=n=>{!ee&&t.parent!==t&&q(n)},Y=()=>pe({...k,type:"file-save"}),me=()=>{!ee&&t.parent!==t&&q({...k,type:"microphone-close",id:y(O)})},xr=async()=>{if(te)throw new g("HOST_REJECTED","The microphone is already open in this frame.");if(T?.features?.microphone!==!0)throw new g("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let n=globalThis.AudioContext;if(typeof n!="function")throw new g("UNSUPPORTED","This frame has no Web Audio.");let s=new n;if(s.sampleRate<8e3||s.sampleRate>192e3)throw s.close().catch(()=>{}),new g("UNSUPPORTED",`Audio at ${s.sampleRate} Hz is not supported.`);let m=s.state==="suspended"?s.resume().catch(()=>{}):void 0,S=wo(Math.round(s.sampleRate/4)),$=s.createScriptProcessor(1024,1,1);$.onaudioprocess=ie=>S.pull(ie.outputBuffer.getChannelData(0));let X=s.createMediaStreamDestination();$.connect(X);let B=new Set,ve={queue:S,endedListeners:B,release:()=>{$.onaudioprocess=null,$.disconnect(),S.clear();for(let ie of X.stream.getTracks())ie.stop();s.close().catch(()=>{})}};te=ve;try{let ie=await E({...k,type:"microphone-open",id:y(O),payload:{sampleRate:s.sampleRate}},12e4);if(!ie||!("opened"in ie)||ie.opened!==!0)throw new g("HOST_REJECTED","Host did not open the microphone.");if(await m,te!==ve)throw new g("DISCONNECTED","The microphone closed while it was opening.")}catch(ie){throw te===ve&&(te=null),ve.release(),me(),ie}return{stream:X.stream,close:()=>{te===ve&&(te=null,ve.release(),me())},onEnded:ie=>(B.add(ie),()=>{B.delete(ie)})}},Ao=n=>{!ln(n)||!Pr(n)||(n.preventDefault(),Y())},xo=n=>{!ln(n)||n.key!=="Escape"||T?.surface!=="popover"||!T.popover||(n.preventDefault(),vo(T.popover.id,"escape").catch(()=>{}))},Fe=()=>{let n=T?.surface==="popover"?T.popover:void 0;if(!n)return;let s=Se||Te;He!==s&&(He=s,Io(n.id,s).catch(()=>{}))},je=()=>{T?.surface!=="popover"||Se||(Se=!0,Fe())},Oo=n=>{T?.surface!=="popover"||n.relatedTarget!==null||!Se||(Se=!1,Fe())},Ro=()=>{T?.surface!=="popover"||Te||(Te=!0,Fe())},yo=()=>{T?.surface!=="popover"||!Te||(Te=!1,Fe())},de=(n,s=1024)=>{if(!n.trim()||n.length>s)throw new g("HOST_REJECTED",`Identity must contain 1 to ${s} characters.`)},_t=async n=>{n.kind!=="projects"&&de(n.projectId);let s=await E({...k,type:"workspace-read",id:y(O),payload:n});if(!s||!("kind"in s)||!("state"in s)||s.kind!==n.kind)throw new g("HOST_REJECTED","Host did not return workspace data.");return s},St=async(n,s)=>{n.kind!=="projects"&&de(n.projectId);let m=y(O);D.set(m,s);try{await R({...k,type:"workspace-subscribe",id:y(O),payload:{subscriptionId:m,query:n}})}catch(S){throw D.delete(m),ee||q({...k,type:"workspace-unsubscribe",id:y(O),payload:{subscriptionId:m}}),S}return()=>{!D.delete(m)||ee||q({...k,type:"workspace-unsubscribe",id:y(O),payload:{subscriptionId:m}})}},Or=async(n,s)=>{n.kind==="session"&&de(n.sessionId),n.kind==="project"&&de(n.projectId);let m=y(O);Z.set(m,s);try{await R({...k,type:"shells-subscribe",id:y(O),payload:{subscriptionId:m,scope:n}})}catch(S){throw Z.delete(m),ee||q({...k,type:"shells-unsubscribe",id:y(O),payload:{subscriptionId:m}}),S}return()=>{!Z.delete(m)||ee||q({...k,type:"shells-unsubscribe",id:y(O),payload:{subscriptionId:m}})}},Ke=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new g("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Ie(n.value))throw new g("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new g("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&T?.features?.deviceStorage!==!0)throw new g("UNSUPPORTED","This host does not support device storage.");let s=await E({...k,type:"storage",id:y(O),payload:n});if(!s||!("storage"in s)||s.op!==n.op)throw new g("HOST_REJECTED","Host did not return storage data.");return s},vo=(n,s)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===n)?Promise.reject(new g("UNSUPPORTED","This host does not support popovers.")):R({...k,type:"popover-close",id:y(O),payload:s?{id:n,reason:s}:{id:n}}),Io=(n,s)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===n)?Promise.reject(new g("UNSUPPORTED","This host does not support popovers.")):R({...k,type:"popover-anchor",id:y(O),payload:{id:n,active:s}});return t.addEventListener("keydown",xo,!0),t.addEventListener("pointerover",je),t.addEventListener("pointermove",je),t.addEventListener("pointerout",Oo),t.addEventListener("focus",Ro),t.addEventListener("blur",yo),{onAction:n=>(_=n,()=>{_===n&&(_=null)}),listProjects:async()=>{let n=await _t({kind:"projects"});if(n.kind!=="projects")throw new g("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let s=await _t({kind:"worktrees",projectId:n});if(s.kind!=="worktrees")throw new g("HOST_REJECTED","Expected worktrees.");return s},listSessions:async n=>{let s=await _t({kind:"sessions",projectId:n});if(s.kind!=="sessions")throw new g("HOST_REJECTED","Expected sessions.");return s},onProjects:n=>St({kind:"projects"},s=>{s.kind==="projects"&&n(s)}),onWorktrees:(n,s)=>St({kind:"worktrees",projectId:n},m=>{m.kind==="worktrees"&&s(m)}),onSessions:(n,s)=>St({kind:"sessions",projectId:n},m=>{m.kind==="sessions"&&s(m)}),onRunningShells:(n,s)=>Or(n,s),readShellOutput:async(n,s)=>{de(n,128);let m=s?.cursor;if(m!==void 0&&(!Number.isInteger(m)||m<0))throw new g("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let S=s?.tailBytes;if(S!==void 0&&(!Number.isInteger(S)||S<1||S>65536))throw new g("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let X=await E({...k,type:"shell-output",id:y(O),payload:{shellId:n,cursor:m,tailBytes:S}});if(!X||typeof X.output!="string"||!Number.isFinite(X.cursor))throw new g("HOST_REJECTED","Host did not return shell output.");return X},stopShell:async n=>{if(de(n,128),(await E({...k,type:"shell-stop",id:y(O),payload:{shellId:n}}))?.stopped!==!0)throw new g("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{de(n),await R({...k,type:"open-session",id:y(O),payload:{sessionId:n}})},storage:{get:async(n,s)=>{let m=nt(s),S={op:"get",key:n};m&&(S.scope=m);let $=await Ke(S);return $.op==="get"&&$.found?$.value:void 0},set:async(n,s,m)=>{let S=nt(m),$={op:"set",key:n,value:s};S&&($.scope=S),await Ke($)},delete:async(n,s)=>{let m=nt(s),S={op:"delete",key:n};m&&(S.scope=m),await Ke(S)},keys:async n=>{let s=nt(n),m={op:"keys"};s&&(m.scope=s);let S=await Ke(m);if(S.op!=="keys")throw new g("HOST_REJECTED","Expected storage keys.");return S.keys}},onReady:n=>(i.add(n),T&&n(T),()=>{i.delete(n)}),onDirectory:n=>(a.add(n),T&&n(T.directory),()=>{a.delete(n)}),onSession:n=>(d.add(n),T&&n(T.session),()=>{d.delete(n)}),onSessionLifecycle:n=>(p.add(n),re&&n(re),()=>{p.delete(n)}),onConnection:n=>(I.add(n),T&&n(T.connection),()=>{I.delete(n)}),onSettings:n=>(N.add(n),T&&n(T.settings),()=>{N.delete(n)}),onItem:n=>(L.add(n),T&&n(T.item),()=>{L.delete(n)}),onBlock:n=>(w.add(n),T?.block&&n(T.block),()=>{w.delete(n)}),onServiceEvent:n=>(v.add(n),()=>{v.delete(n)}),onStatusControl:n=>(l.add(n),()=>{l.delete(n)}),onPopoverClosed:n=>(u.add(n),()=>{u.delete(n)}),setStatusControls:n=>T?.features?.statusControls!==!0?Promise.reject(new g("UNSUPPORTED","This host does not support status controls.")):Lo(n)?R({...k,type:"status-controls",id:y(O),payload:{controls:n}}):Promise.reject(new g("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>T?.features?.popovers!==!0?Promise.reject(new g("UNSUPPORTED","This host does not support popovers.")):kt(n)?R({...k,type:"popover-open",id:y(O),payload:n}):Promise.reject(new g("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:vo,setPopoverAnchorActive:Io,onResolve:n=>(f=n,()=>{f===n&&(f=null)}),toast:n=>{let s=n.message.trim();return!s||s.length>ze?Promise.reject(new g("HOST_REJECTED",`Toast message must contain 1 to ${ze} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>qe)?Promise.reject(new g("HOST_REJECTED",`Toast copy text must contain 1 to ${qe} characters.`)):R({channel:M,v:1,type:"toast",id:y(O),payload:{...n,message:s}})},openUrl:n=>R({channel:M,v:1,type:"open-url",id:y(O),payload:{url:n}}),...Fo(R,()=>y(O),n=>Promise.reject(new g("HOST_REJECTED",n))),answerBlock:n=>R({channel:M,v:1,type:"block-answer",id:y(O),payload:{text:n.trim().slice(0,Ot)}}),openSurface:n=>R({channel:M,v:1,type:"open-surface",id:y(O),payload:{surfaceId:n}}),writeClipboard:n=>R({channel:M,v:1,type:"clipboard-write",id:y(O),payload:{text:n}}),compose:n=>R({channel:M,v:1,type:"compose",id:y(O),payload:n}),attach:n=>R({channel:M,v:1,type:"attach",id:y(O),payload:we(n)}),startSession:async n=>{n.projectId!==void 0&&de(n.projectId);let s=n.worktree;s&&s!==!0&&(s.kind==="existing"?de(s.directory):(s.name!==void 0&&de(s.name,200),s.baseBranch!==void 0&&de(s.baseBranch,200)));let m=await E({channel:M,v:1,type:"start-session",id:y(O),payload:Ct(n)},e.requestTimeoutMs??18e4);if(!Rt(m))throw new g("HOST_REJECTED","Host did not return a session.");return m},prompt:n=>E({channel:M,v:1,type:"prompt",id:y(O),payload:Mt(n)}).then(s=>{if(!yt(s))throw new g("HOST_REJECTED","Host did not return a prompt result.");return s}),sessionLink:n=>R({channel:M,v:1,type:"session-link",id:y(O),payload:we(n)}),close:()=>R({channel:M,v:1,type:"close",id:y(O)}),oauthStart:()=>R({channel:M,v:1,type:"oauth-start",id:y(O)}),oauthDisconnect:()=>R({channel:M,v:1,type:"oauth-disconnect",id:y(O)}),request:n=>(et(n.path)?E({channel:M,v:1,type:"request",id:y(O),payload:n}):pn()).then(s=>{if(!tt(s))throw new g("HOST_REJECTED","Host request result was empty.");return s}),serviceRequest:n=>(et(n.path)?E({channel:M,v:1,type:"service-request",id:y(O),payload:n}):pn()).then(s=>{if(!tt(s))throw new g("HOST_REJECTED","Host service request result was empty.");return s}),serviceStatus:()=>E({channel:M,v:1,type:"service-status",id:y(O)}).then(n=>{if(!Lt(n))throw new g("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Ce(n)?E({channel:M,v:1,type:"file-read",id:y(O),payload:{path:n}}):ot()).then(s=>{if(!Pt(s))throw new g("HOST_REJECTED","Host did not return file content.");return s}),writeFile:(n,s)=>Ce(n)?s.length>Je?Promise.reject(new g("FILE_TOO_LARGE",`Content is over ${Je} characters.`)):E({channel:M,v:1,type:"file-write",id:y(O),payload:{path:n,content:s}}).then(m=>{if(!Dt(m))throw new g("HOST_REJECTED","Host did not confirm the write.");return m}):ot(),listDir:n=>(Ce(n)?E({channel:M,v:1,type:"file-list",id:y(O),payload:{path:n}}):ot()).then(s=>{if(!Gt(s))throw new g("HOST_REJECTED","Host did not return directory entries.");return s}),stat:n=>(Ce(n)?E({channel:M,v:1,type:"file-stat",id:y(O),payload:{path:n}}):ot()).then(s=>{if(!Ht(s))throw new g("HOST_REJECTED","Host did not return file status.");return s}),generate:n=>{let s=n.prompt.trim(),m=n.system?.trim();if(s.length===0||s.length>Qe)return Promise.reject(new g("HOST_REJECTED",`Prompt must be 1 to ${Qe} characters.`));if(m!==void 0&&(m.length===0||m.length>Ze))return Promise.reject(new g("HOST_REJECTED",`System prompt must be 1 to ${Ze} characters.`));let S=n.maxOutputTokens===void 0?void 0:Math.min(It,Math.max(1,Math.floor(n.maxOutputTokens)));if(S!==void 0&&!Number.isFinite(S))return Promise.reject(new g("HOST_REJECTED","maxOutputTokens must be a number."));let $={prompt:s};return m!==void 0&&($.system=m),S!==void 0&&($.maxOutputTokens=S),E({channel:M,v:1,type:"generate",id:y(O),payload:$},e.requestTimeoutMs??wt).then(X=>{if(!$t(X))throw new g("HOST_REJECTED","Host did not return generated text.");return X})},onLateGenerateResult:n=>{h.add(n);for(let s of V.splice(0))P([n],s);return Be(),()=>{h.delete(n)}},openMicrophone:xr,setBadge:n=>R({channel:M,v:1,type:"badge",id:y(O),payload:{count:Ut(n)}}),setHeight:n=>R({channel:M,v:1,type:"resize",id:y(O),payload:{height:Nt(n)}}),onFileOpen:n=>(x.add(n),ne||(ne=!0,t.addEventListener("keydown",Ao,!0)),z&&n(z),()=>{x.delete(n)}),onFileSnapshot:n=>(G=n,()=>{G===n&&(G=null)}),onFileSaved:n=>(A.add(n),()=>{A.delete(n)}),reportFileChange:n=>pe({...k,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Y,reportFileUnsupported:()=>pe({...k,type:"file-unsupported"}),dispose:()=>{for(let n of D.keys())q({...k,type:"workspace-unsubscribe",id:y(O),payload:{subscriptionId:n}});D.clear();for(let n of Z.keys())q({...k,type:"shells-unsubscribe",id:y(O),payload:{subscriptionId:n}});Z.clear(),te&&(me(),te.release(),te=null),ee=!0,f=null,_=null,G=null,x.clear(),A.clear(),ne&&t.removeEventListener("keydown",Ao,!0),t.removeEventListener("message",b),t.removeEventListener("keydown",xo,!0),t.removeEventListener("pointerover",je),t.removeEventListener("pointermove",je),t.removeEventListener("pointerout",Oo),t.removeEventListener("focus",Ro),t.removeEventListener("blur",yo);for(let n of H.values())clearTimeout(n.timer),n.reject(new g("HOST_UNAVAILABLE","Host client was disposed."));H.clear(),i.clear(),a.clear(),d.clear(),p.clear(),I.clear(),N.clear(),L.clear(),w.clear(),v.clear(),l.clear(),u.clear(),h.clear(),V.length=0}}};var Tn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Zs=new Set(Tn);var Dr=10*6e4;var Gr=10*6e4;var Hr=10*6e4;var $r=10*6e4;var mn=["none","agent","user"];var ti=new Set(mn);var Xr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Vr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],hn=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of Xr)t.style.setProperty(o,e.tokens[r]);for(let[o,r,i]of Vr){let a=e.tokens[i]??"";t.style.setProperty(o,a),t.style.setProperty(r,a)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Wt=(e,t)=>{hn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Br={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},F=(e,t)=>`var(--${e}, var(--oc-${Br[e]}, ${t}))`,Ee=F("surface-background","transparent"),st=F("surface-elevated","transparent"),Me=F("surface-elevated-foreground","inherit"),se=F("surface-foreground","inherit"),K=F("surface-muted-foreground","gray"),Fr=F("surface-muted","transparent"),Oe=F("interactive-border","currentColor"),oe=F("interactive-hover","transparent"),Re=F("interactive-active","transparent"),zt=F("interactive-selection","transparent"),qt=F("interactive-selection-foreground","inherit"),fe=F("primary","currentColor"),Yt=F("primary-text","inherit"),Jt=F("error-text","inherit"),jr=F("font-sans","inherit"),Qt=F("font-mono","monospace"),An=F("radius","9px"),Zt=`calc(${An} - 2px)`,gn=`calc(${An} - 4px)`,W=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,bn=`background-image: linear-gradient(${oe}, ${oe});`,eo=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,to="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",kn="box-shadow: var(--oc-sdk-lit);",oo=`inset 0 0.5px 0 0 ${W(se,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Kr=`
:root {
  --oc-sdk-edge: ${W(se,16)};
  --oc-sdk-field-bg: ${st};
  --oc-sdk-raised-bg: ${Ee};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${W(se,14)};
  --oc-sdk-field-bg: ${W(Ee,50,st)};
  --oc-sdk-raised-bg: ${st};
  --oc-sdk-field-lift: ${oo};
  --oc-sdk-raised-lift: ${oo};
  --oc-sdk-lit: ${oo};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,rt=e=>{let t=F(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${F(`${e}-text`,"inherit")}; }`},c=e=>`calc(${e}rem / 14)`,Wr=`
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
`,xn=`${Kr}
.oc-sdk { color: ${se}; font-family: ${jr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${bn} }
.oc-sdk-mono { font-family: ${Qt}; }
.oc-sdk-muted { color: ${K}; }
${rt("success")}${rt("warning")}${rt("error")}${rt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${fe}; --oc-sdk-tone-text: ${Yt}; }

.oc-sdk-btn { border-radius: ${Zt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${gn}; }
.oc-sdk-btn[data-variant="default"] { color: ${Yt}; background: ${W(fe,10,Ee)}; border-color: ${W(fe,12)}; ${kn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${W(fe,16,Ee)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${W(fe,22,Ee)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Fr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Me}; ${to} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Re}, ${Re}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${oe}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Re}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${F("status-error","red")}; color: ${Jt}; background: ${W("var(--oc-sdk-tone)",7,Ee)}; border-color: ${W("var(--oc-sdk-tone)",12)}; ${kn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${W("var(--oc-sdk-tone)",9,Ee)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${W("var(--oc-sdk-tone)",11,Ee)}; box-shadow: none; }

.oc-sdk-field-note { color: ${K}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Jt}; }
.oc-sdk-input { border-radius: ${Zt}; background: var(--oc-sdk-field-bg); color: ${Me}; ${eo("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${K}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${eo(W(se,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${eo(F("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Qt}; }

.oc-sdk-search-icon { color: ${K}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${fe}; }
.oc-sdk-search-clear { border-radius: ${gn}; color: ${K}; }
.oc-sdk-search-clear:hover { background: ${oe}; color: ${se}; }

.oc-sdk-trigger { border-radius: ${Zt}; background: var(--oc-sdk-raised-bg); color: ${Me}; ${to} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${K}; }
.oc-sdk-trigger-chevron { color: ${K}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Me}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${st}; background-clip: padding-box; color: ${Me}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${oe}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${zt}; color: ${qt}; }
.oc-sdk-option-check { color: ${se}; }
.oc-sdk-option[data-destructive="true"] { color: ${Jt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${W(F("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${K}; }
.oc-sdk-popup-empty { color: ${K}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Oe}; border-radius: 4px; color: ${se}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${W(se,60,Oe)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Oe}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${Ee}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${fe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${bn} }
.oc-sdk-check-desc { color: ${K}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${W(se,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${K}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${se}; }
.oc-sdk-tab[aria-selected="true"] { color: ${qt}; background: ${zt}; border-color: ${Oe}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Me}; background: var(--oc-sdk-raised-bg); ${to} }
.oc-sdk-tab-count { color: ${K}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${W(se,6)}; color: ${K}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${W("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${oe}; }
.oc-sdk-row[aria-selected="true"] { background: ${zt}; color: ${qt}; }
.oc-sdk-row-lead { font-family: ${Qt}; color: ${K}; }
.oc-sdk-row-sub { color: ${K}; }
.oc-sdk-row-meta { color: ${K}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${K}; }

.oc-sdk-empty-body { color: ${K}; }

.oc-sdk-spinner { color: ${K}; }
.oc-sdk-spinner-ring { border-color: ${Oe}; border-top-color: ${fe}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${W("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${K}; }

.oc-sdk-separator { color: ${K}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${W(Oe,40)}; }

.oc-sdk-progress-label { color: ${K}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${W(se,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${fe}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${F("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${F("success-text","inherit")}; }

.oc-sdk-text a { color: ${Yt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${W(Oe,60)}; }
`,J=`
${Tt}
${Wr}
${xn}`;var On="oc-sdk-ui-style",Ue=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},Q=e=>{let t=document.getElementById(On);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}mt(document);let o=document.createElement("style");o.id=On,o.textContent=e,document.head.appendChild(o)},j=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},_e=e=>{let t=j("button",e);return t.type="button",t},ae=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},he=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},Rn=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var zr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Xe=(e,t)=>{Q(J);let o=t,r=_e("oc-sdk oc-sdk-btn"),i=zr(),a=document.createElement("span");r.append(a),e.append(r);let d=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==r?r.prepend(i):!o.loading&&i.parentNode===r&&i.remove(),ae(a,o.label)},p=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",p),d(),{update:I=>{o={...o,...I},d()},dispose:()=>{r.removeEventListener("click",p),r.remove()}}};var yn="http://www.w3.org/2000/svg",qr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Ne=(e,t,o)=>{let r=document.createElementNS(yn,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.style.width=c(t),r.style.height=c(t),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let i=document.createElementNS(yn,"path");return i.setAttribute("d",qr[e]),r.append(i),r};var Le=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Pe=(e,t,o)=>{let r=e.filter(I=>!I.disabled);if(r.length===0)return null;let i=r[0],a=r[r.length-1];if(o==="first"||!i||!a)return i?.id??null;if(o==="last")return a.id;let d=r.findIndex(I=>I.id===t);return d===-1?o==="next"?i.id:a.id:r[Math.min(r.length-1,Math.max(0,d+(o==="next"?1:-1)))]?.id??null};var vn=(e,t)=>`${e}-${t??""}`,no=(e,t,o,r)=>{let i=_e("oc-sdk-option");i.id=vn(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let a=j("span","oc-sdk-option-label");if(a.textContent=o.label,i.append(a),o.hint){let d=j("span","oc-sdk-option-hint");d.textContent=o.hint,i.append(d)}if(t==="option"){i.dataset.mark="check";let d=j("span","oc-sdk-option-check");d.append(Ne("check",14)),i.append(d)}return i.addEventListener("pointerenter",r.hover),i.addEventListener("click",r.pick),i},ro=(e,t,o,r)=>{let i=vn(o,r);for(let a of Array.from(e.children))a instanceof HTMLElement&&a.classList.contains("oc-sdk-option")&&(a.dataset.active=a.id===i?"true":"false");he(t,"aria-activedescendant",r?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Yr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,i=window.innerHeight-o.bottom-8;r>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let a=o.left+e.offsetWidth-window.innerWidth+8;a>0&&(e.style.left=`${Math.max(8,Math.round(o.left-a))}px`)},so=(e,t,o,r)=>{e.append(o),Yr(o,t);let i=Rn(e,r),a=()=>{r()},d=p=>{p.target instanceof Node&&o.contains(p.target)||r()};return window.addEventListener("resize",a),window.addEventListener("scroll",d,!0),()=>{i(),window.removeEventListener("resize",a),window.removeEventListener("scroll",d,!0),o.remove()}};var io=(e,t)=>{he(e,"data-tone",t&&t!=="neutral"?t:null)},ao=(e,t)=>{Q(J);let o=t,r=j("span","oc-sdk oc-sdk-badge");e.append(r);let i=()=>{ae(r,o.label),io(r,o.tone)};return i(),{update:a=>{o={...o,...a},i()},dispose:()=>{r.remove()}}};var In=e=>e.filter(t=>!("separator"in t)),Jr=0,co=(e,t)=>{Q(J);let o=t,r=`oc-sdk-menu-${Jr+=1}`,i=j("div","oc-sdk oc-sdk-menu");e.append(i);let a=j("div","oc-sdk oc-sdk-popup");a.setAttribute("role","menu"),a.tabIndex=-1;let d=null,p=null,I=Xe(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{d?v():l()}}),N=i.querySelector("button");N?.setAttribute("aria-haspopup","menu");let L=f=>{p=f,ro(a,a,r,f)},w=()=>{Ue(a);for(let f of o.items){if("separator"in f){let _=j("div","oc-sdk-separator");_.dataset.labeled="false",a.append(_);continue}a.append(no(r,"menuitem",f,{hover:()=>L(f.id),pick:()=>u(f.id)}))}L(In(o.items).some(f=>f.id===p)?p:null)},v=()=>{let f=d;d=null,f?.(),p=null,N?.setAttribute("aria-expanded","false")},l=()=>{d||!N||(w(),d=so(i,N,a,v),N.setAttribute("aria-expanded","true"),a.focus())},u=f=>{v(),N?.focus(),o.onSelect(f)},h=f=>{let _=Le(f);_?(f.preventDefault(),L(Pe(In(o.items),p,_))):f.key==="Enter"||f.key===" "?(f.preventDefault(),p&&u(p)):f.key==="Escape"&&(f.preventDefault(),v(),N?.focus())},V=f=>{d&&!(f.relatedTarget instanceof Node&&i.contains(f.relatedTarget))&&v()};return a.addEventListener("keydown",h),i.addEventListener("focusout",V),{update:f=>{o={...o,...f},I.update({label:o.label,variant:o.variant,size:o.size}),d&&w()},dispose:()=>{v(),a.removeEventListener("keydown",h),i.removeEventListener("focusout",V),I.dispose(),i.remove()}}};var ge=["backlog","todo","in_progress","review","done","archived"],be={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done",archived:"Archive"},lo=1,ye=200,wn=16e3;var po="New task",Qr=512,Zr=/^t_[a-z0-9]{6,40}$/,Cn=e=>typeof e=="string"&&ge.includes(e),es=(e=Date.now(),t=Math.random)=>{let o=Array.from({length:6},()=>Math.floor(t()*36).toString(36)).join("");return`t_${e.toString(36)}${o}`},ce=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>Qr)throw new Error(`${t} is too long`);return o},uo=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>ye)throw new Error(`Title is limited to ${ye} characters`);return t},at=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>wn)throw new Error(`Description is limited to ${wn} characters`);return e};var Mn=e=>{if(e===void 0)return;if(!Array.isArray(e))throw new Error("agentNotes must be an array");let t=[];for(let o of e){if(!o||typeof o!="object")throw new Error("agentNotes entries must be objects");let r=o;t.push({at:it(r.at,"agentNotes.at"),text:at(r.text)})}return t};var ts=e=>e===void 0?{}:{agentNotes:Mn(e)},Un=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=ce(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:ce(t.branch,"worktree.branch")}},it=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},De=(e,t)=>e==null?null:it(e,t),fo=(e,t,o=Date.now(),r=es(o))=>({schemaVersion:lo,id:r,title:uo(e.title),description:at(e.description),status:e.status??"backlog",rank:t,projectId:ce(e.projectId,"projectId"),sourceBranch:ce(e.sourceBranch,"sourceBranch"),worktree:null,sessionId:null,createdAt:o,updatedAt:o,needsAttentionSince:null,autoDoneCommit:null,sessionLinkedAt:null,doneAt:e.status==="done"?o:null}),ke=(e,t,o=Date.now())=>{let r={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(r.title=uo(t.title)),"description"in t&&(r.description=at(t.description)),"status"in t){if(!Cn(t.status))throw new Error("Unknown status");r.status=t.status,r.status==="done"&&e.status!=="done"?r.doneAt=o:r.status!=="done"&&(r.doneAt=null)}if("projectId"in t&&(r.projectId=ce(t.projectId,"projectId")),"sourceBranch"in t&&(r.sourceBranch=ce(t.sourceBranch,"sourceBranch")),"worktree"in t&&(r.worktree=Un(t.worktree)),"sessionId"in t&&(r.sessionId=ce(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");r.rank=t.rank}if("needsAttentionSince"in t&&(r.needsAttentionSince=De(t.needsAttentionSince,"needsAttentionSince")),"autoDoneCommit"in t&&(r.autoDoneCommit=ce(t.autoDoneCommit,"autoDoneCommit")),"sessionLinkedAt"in t&&(r.sessionLinkedAt=De(t.sessionLinkedAt,"sessionLinkedAt")),"doneAt"in t&&(r.doneAt=De(t.doneAt,"doneAt")),"agentNotes"in t){let i=Mn(t.agentNotes);i!==void 0?r.agentNotes=i:delete r.agentNotes}return r},Eo=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==lo)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!Zr.test(t.id))throw new Error("Task id is invalid");if(!Cn(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:lo,id:t.id,title:uo(t.title),description:at(t.description),status:t.status,rank:t.rank,projectId:ce(t.projectId,"projectId"),sourceBranch:ce(t.sourceBranch,"sourceBranch"),worktree:Un(t.worktree),sessionId:ce(t.sessionId,"sessionId"),createdAt:it(t.createdAt,"createdAt"),updatedAt:it(t.updatedAt,"updatedAt"),needsAttentionSince:De(t.needsAttentionSince,"needsAttentionSince"),autoDoneCommit:ce(t.autoDoneCommit,"autoDoneCommit"),sessionLinkedAt:De(t.sessionLinkedAt,"sessionLinkedAt"),doneAt:De(t.doneAt,"doneAt"),...ts(t.agentNotes)}};var Ln="task:",Nn=16,_o=e=>`${Ln}${e}`,Ae=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Ln)),o=[],r=[];for(let i=0;i<t.length;i+=Nn)await Promise.all(t.slice(i,i+Nn).map(async a=>{try{let d=Eo(await e.storage.get(a));if(_o(d.id)!==a)throw new Error("Task id does not match its key");o.push(d)}catch{r.push(a)}}));return{tasks:o,failedKeys:r}},xe=async(e,t)=>{let o=Eo(t);await e.storage.set(_o(o.id),o)},ct=(e,t)=>e.storage.delete(_o(t)),So=async(e,t,o=3)=>{for(let r=1;r<=o;r+=1)try{await xe(e,t);return}catch(i){if(r===o)throw i;await new Promise(a=>setTimeout(a,300*r))}};var dt="__all__",Pn="__none__",Dn=1024;var To=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),lt=(e,t)=>!(t.projectId===Pn&&e.projectId!==null||t.projectId!==dt&&t.projectId!==Pn&&e.projectId!==t.projectId),mo=(e,t)=>{let o=e.filter(r=>r.status===t).map(r=>r.rank);return o.length?Math.max(...o)+Dn:Dn};var Gn=336*60*60*1e3,Hn=e=>e.doneAt??e.updatedAt;var os="dismissed-sessions",ho=async e=>{let t=await e.storage.get(os);return Array.isArray(t)?new Set(t.filter(o=>typeof o=="string"&&o.length>0)):new Set};var $n=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:ke(e,{status:t,needsAttentionSince:null});var le={waitingPermissionMeansReview:!0,failedMeansReview:!0},ns=e=>{let t=e?.trim().toLowerCase()??"";return t===""||t==="build"},Ge=(e,t,o,r,i=le)=>{let a=()=>e==="done"||e==="archived"||!ns(r)||e==="review"?null:"review",d=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return d();case"waiting-question":return a();case"waiting-permission":return i.waitingPermissionMeansReview?a():null;case"idle":return o==="completed"||o==="failed"&&i.failedMeansReview?a():null;default:return null}};var Xn=(e,t)=>e.parentId===null&&e.archivedAt===null&&!t.has(e.id),Vn=(e,t=le)=>Ge("backlog",e.activity,e.outcome,e.agent??null,t),Bn=(e,t)=>{let o=e.title.trim();return o&&o!==e.id?o.slice(0,200):t?`New session in ${t}`:`New session (${e.id.slice(0,8)})`},pt=(e,t)=>{let o=t.trim();return o.length>0&&o!==e},ut=(e,t)=>[...t?[`New session in ${t}`]:[],`New session (${e.slice(0,8)})`],Fn=e=>{let t=e.title.trim();if(t&&t!==po)return t.slice(0,ye);let o=e.description.trim().split(`
`)[0]?.trim()??"";return o?o.slice(0,ye):t||po};var jn=async(e,t)=>{let o=await Ae(e);if(o.tasks.some(p=>p.sessionId===t.session.id))return null;let r={...fo({title:Bn(t.session,t.projectName),projectId:t.projectId,status:t.status},mo(o.tasks,t.status)),sessionId:t.session.id,sessionLinkedAt:t.session.createdAt,needsAttentionSince:t.status==="review"?Date.now():null};await xe(e,r);let a=(await Ae(e)).tasks.filter(p=>p.sessionId===t.session.id&&p.id!==r.id),d=a.length===0?null:a.reduce((p,I)=>p.id<I.id?p:I);return d===null?{adopted:!0,task:r}:r.id<d.id?(await ct(e,d.id).catch(()=>{}),{adopted:!0,task:r}):(await ct(e,r.id).catch(()=>{}),{adopted:!1,task:d})};var Kn=async(e,t)=>{let{tasks:o}=await Ae(e),r=o.find(d=>d.id===t.taskId);if(!r||r.sessionId!==t.sessionId)return null;let i=pt(t.sessionId,t.sessionTitle)?t.sessionTitle.trim().slice(0,ye):null;if(!i||r.title===i)return{promoted:!1,task:r};if(!ut(t.sessionId,t.projectName).includes(r.title))return{promoted:!1,task:r};let a=ke(r,{title:i});return await xe(e,a),{promoted:!0,task:a}};var Wn=(e,t,o,r)=>{let i=new Map,a=new Set,d=new Set,p=!1,I=()=>{if(!p)for(let v of i.values()){let l=v.sessionId;if(l===null||a.has(l)||d.has(l))continue;let u=t().get(l);!u||!pt(l,u.title)||ut(l,o(v.projectId)).includes(v.title)&&(a.add(l),d.add(l),(async()=>{try{let h=await Kn(e,{taskId:v.id,sessionId:l,sessionTitle:u.title,projectName:o(v.projectId)});if(p||h===null)return;h.promoted?r.onPromoted(h.task):r.onStale(h.task)}catch{}finally{d.delete(l)}})())}};return{sync:v=>{p||(i=new Map(v.map(l=>[l.id,l])),I())},evaluate:I,reset:()=>{a.clear()},dispose:()=>{p=!0,d.clear()}}};var zn="orphan-watermark",qn=async e=>{let t=await e.storage.get(zn);return typeof t=="number"&&Number.isFinite(t)?t:null},Yn=(e,t)=>e.storage.set(zn,t);var Jn=(e,t)=>t.sessionId===null?null:t.worktree?{directory:t.worktree.directory,branch:t.worktree.branch}:typeof e=="object"&&e.kind==="existing"?{directory:e.directory,branch:null}:null;var rs="kanban-board",ss=e=>`https://kanban.local/tasks/${e}`,Qn=e=>{let t={providerId:rs,id:e.id,title:Fn(e),url:ss(e.id),worktree:e.worktree?{kind:"existing",directory:e.worktree.directory}:!1,navigation:"preserve"};return e.projectId&&(t.projectId=e.projectId),t},Zn=(e,t,o=Date.now())=>({sessionId:t.sessionId,worktree:Jn(e.worktree??!1,t),sessionLinkedAt:o}),er=e=>e.description.trim()||e.title;var tr=10*6e4,is=60,as=(e,t,o=le)=>t?Ge(e.status,t.activity,t.outcome,t.agent,o)??e.status:e.status,cs=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,or=(e,t)=>e.needsAttentionSince??t.updatedAt,nr=(e,t,o,r=tr)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-or(e,t)<r?null:e.needsAttentionSince!==null&&t.unread!==!1?"hint":"quiet",ds=(e,t,o,r=tr)=>{if(!t||nr(e,t,o,r)===null)return null;let i=Math.floor((o-or(e,t))/6e4);return i>0&&i<is?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var ls=(e,t,o=le,r=Date.now())=>{let i=cs(e,t),a=as(e,i,o),d=a==="done"&&r-Hn(e)>=Gn,p=d?"archived":a,I=p!==e.status&&!d,N=d||p==="archived",L=e.needsAttentionSince!==null&&i?.unread!==!1,w=N?!1:L||I&&p==="review"&&i?.unread!==!1,v=nr(e,i,r);return{task:e,displayStatus:p,movedByAgent:I,archivedPending:d,attention:w,attentionSince:L?e.needsAttentionSince:w&&i?i.updatedAt:null,live:i,looksDone:v,looksDoneNote:v?ds(e,i,r):null}},ps=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||To(e.task,t.task),rr=(e,t,o,r=le,i=Date.now())=>{let a=Object.fromEntries(ge.map(d=>[d,[]]));for(let d of e){if(!lt(d,o))continue;let p=ls(d,t,r,i);a[p.displayStatus].push(p)}for(let d of ge)a[d].sort((p,I)=>d==="review"?ps(p,I):To(p.task,I.task));return a},sr=e=>Object.values(e).reduce((t,o)=>t+o.filter(r=>r.attention&&r.displayStatus!=="done"&&r.displayStatus!=="archived").length,0),ir=e=>Object.values(e).reduce((t,o)=>t+o.filter(r=>r.displayStatus!=="done"&&r.displayStatus!=="archived").length,0),ar=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},cr=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var dr=(e,t,o)=>{let r=o.sessions.find(i=>i.id===e);if(r)return r.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(a=>a.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var lr=(e,t,o,r,i={})=>{let a=i.onLiveChange,d=i.onSnapshot??(()=>{}),p=new Map,I=new Map,N=new Map,L=new Map,w=!1,v=(f,_)=>{if(_.state==="loading")return!1;let x=0;for(let[A,G]of N)G.projectId===f&&(N.delete(A),x+=1);if(_.state!=="ready")return x>0;for(let A of _.sessions)A.parentId===null&&N.set(A.id,{projectId:f,activity:A.activity,outcome:A.outcome,agent:A.agent??null,updatedAt:A.updatedAt,unread:A.unread??null,title:A.title});return!0},l=(f,_)=>{if(w)return;v(f,_)&&a&&a(),d();for(let A of _.sessions)L.set(A.id,A.directory);if(o)for(let A of I.values()){if(A.projectId!==f||!A.sessionId)continue;let G=dr(A.sessionId,L.get(A.sessionId)??null,_);if(r&&(G==="deleted"||G==="archived")){r(A.id,A.sessionId,G);continue}let z=_.sessions.find(H=>H.id===A.sessionId);if(!z)continue;let ne=Ge(A.status,z.activity,z.outcome,z.agent??null,t);ne&&o(A.id,ne)}},u=f=>{let _=e.onSessions(f,x=>l(f,x));p.set(f,_),_.then(x=>{(w||!p.has(f))&&x()},()=>{})};return{live:()=>N,sync:f=>{if(w)return;I=new Map(f.map(x=>[x.id,x]));let _=new Set(f.filter(x=>x.sessionId&&x.projectId).map(x=>x.projectId));for(let x of _)p.has(x)||u(x);for(let[x,A]of p)if(!_.has(x)){p.delete(x);for(let[G,z]of N)z.projectId===x&&N.delete(G);A.then(G=>G(),()=>{})}},dispose:()=>{w=!0;for(let f of p.values())f.then(_=>_(),()=>{});p.clear()}}};var pr=(e,t,o,r=le)=>{let i=!1,a=new Map,d=(L,w)=>{if(i)return;let v=t();for(let l of w.sessions){if(!Xn(l,v))continue;let u=Vn(l,r);u&&o({projectId:L,session:{id:l.id,title:l.title,createdAt:l.createdAt},status:u})}},p=L=>{if(a.has(L))return;let w=e.onSessions(L,v=>d(L,v));a.set(L,w),w.then(v=>{(i||!a.has(L))&&v()},()=>{})},I=e.onProjects(L=>{if(i)return;let w=new Set(L.projects.map(v=>v.id));for(let v of w)p(v);for(let[v,l]of a)w.has(v)||(a.delete(v),l.then(u=>u(),()=>{}))});return{dispose:()=>{i=!0,I.then(L=>L(),()=>{});for(let L of a.values())L.then(w=>w(),()=>{});a.clear()}}};var ur=(e,t)=>{if(!t)return null;let o=e.find(r=>r.directory===t);return o||(e.filter(r=>t.startsWith(`${r.directory}/`)).sort((r,i)=>i.directory.length-r.directory.length)[0]??null)},ue=e=>{if(e instanceof g)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var fr=(e,t,{settledMs:o=700,onLost:r}={})=>{let i=null;e.prompt({text:t}).then(()=>{i=!0},()=>{i=!1}),setTimeout(()=>{e.prompt({text:t}).catch(()=>{i===!1&&r?.()})},o)};var C=(e,t="",o="")=>{let r=document.createElement(e);return t&&(r.className=t),o&&(r.textContent=o),r};var ft="http://www.w3.org/2000/svg",us={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},_r=e=>{let t=document.createElementNS(ft,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},fs=()=>_r(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(ft,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let r=document.createElementNS(ft,"path");r.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,r)}),Es=()=>_r(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(ft,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),go=e=>{let t=C("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},Er=()=>{let e=C("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},_s={running:fs,"waiting-question":()=>go("?"),"waiting-permission":Es,failed:()=>go("!"),finished:()=>go("\u2713"),idle:Er,linked:Er},Sr=e=>{let t=C("span","kb-agent-pill"),o=us[e.key];return o&&(t.dataset.tone=o),t.append(_s[e.key]()),t.append(C("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var Tr=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var mr="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",hr="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",Ss=`${hr} M9.25 5.75h1.5v6.5H9.25z M6.75 8.25h6.5v1.5H6.75z`,Ts="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",ms=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("fill-rule","evenodd"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},Et=(e,t,o,r={})=>{let i=C("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),r.primary&&(i.dataset.primary="true"),r.hint&&(i.dataset.hint="true"),r.quiet&&(i.dataset.quiet="true"),r.info&&(i.dataset.info="true"),i.append(ms(e)),i.addEventListener("click",a=>{a.stopPropagation(),o()}),i},hs=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...ge.filter(r=>r!==e.displayStatus).map(r=>({id:`move:${r}`,label:`Move to ${be[r]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},gr=(e,t,o)=>{let r=t==="rail",i=C("div",r?"kb-panel-sections":"kb-columns");e.append(i);let a=[],d=null,p=(l,u)=>[...l.querySelectorAll(".kb-draggable-item")].filter(h=>h.dataset.id!==u).map(h=>({id:h.dataset.id??"",top:h.getBoundingClientRect().top,height:h.getBoundingClientRect().height})),I=(l,u,h,V)=>{l.addEventListener("dragover",f=>{d&&(f.preventDefault(),l.classList.add("kb-dragover"))}),l.addEventListener("dragleave",f=>{f.target===l&&l.classList.remove("kb-dragover")}),l.addEventListener("drop",f=>{f.preventDefault(),l.classList.remove("kb-dragover");let _=d??f.dataTransfer?.getData("text/plain")??null;if(d=null,!_)return;if(r&&f.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(_,h);return}let x=Tr(p(u,_),f.clientY);V(_,h,x)})},N=l=>{let{task:u}=l,h=C("div",l.attention?"kb-item kb-attn":"kb-item");r?h.classList.add("kb-panel-row"):h.classList.add("kb-card");let V=o.onDrop!==void 0;V?(h.classList.add("kb-draggable-item"),h.draggable=!0):h.draggable=!1,h.dataset.id=u.id;let f=o.isSelected?.(u)??!1;f&&(h.dataset.selected="true");let _=C("div","kb-panel-main");h.append(_);let x=C("div","kb-item-top");if(o.onToggleSelect){let H=o.onToggleSelect,D=document.createElement("input");D.type="checkbox",D.className="kb-check",D.checked=f;let Z=f?"Deselect":"Select";D.title=`${Z} "${u.title}"`,D.setAttribute("aria-label",`${Z} task: ${u.title}`),D.addEventListener("click",ee=>ee.stopPropagation()),D.addEventListener("change",()=>H(u)),x.append(D)}x.append(C("div","kb-panel-title",u.title)),_.append(x);let A=o.projectName(u),G=C("div","kb-panel-sub");A&&G.append(C("span","kb-panel-project",A));let z=l.live?cr(l.live):u.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(z&&G.append(Sr(z)),_.append(G),r&&o.onChat&&(u.sessionId||u.projectId&&l.displayStatus!=="done"&&l.displayStatus!=="archived")){let H=o.onChat;x.append(Et(u.sessionId?hr:Ss,u.sessionId?"Open chat":"New chat",()=>H(u),u.sessionId&&l.attention?{primary:!0}:{}))}if(r&&l.displayStatus!=="done"&&l.displayStatus!=="archived"&&o.onMarkDone){let H=o.onMarkDone;x.append(Et(mr,"Mark done",()=>H(u),{info:!0}))}let ne=hs(l,o);if(!r&&l.looksDone&&o.onLooksDone){let H=o.onLooksDone;x.append(Et(mr,l.looksDoneNote??"Looks done \u2014 click to mark Done",()=>H(u),l.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(ne){let H=C("span","kb-panel-menu");x.append(H),a.push(co(H,{label:"\u22EF",variant:"ghost",size:"xs",items:ne,onSelect:D=>{if(D==="delete"&&o.onDelete){o.onDelete(u);return}if(D==="edit"&&o.onEdit){o.onEdit(u);return}if(D.startsWith("move:")){let Z=D.slice(5);ge.includes(Z)&&o.onMoveStatus&&o.onMoveStatus(u,Z)}}}))}if(o.onActivate){let H=()=>o.onActivate(u);h.addEventListener("click",D=>{if(!D.target?.closest(".kb-panel-menu")){if(o.onToggleSelect&&(D.metaKey||D.ctrlKey)){o.onToggleSelect(u);return}H()}}),h.tabIndex=0,h.addEventListener("keydown",D=>{(D.key==="Enter"||D.key===" ")&&(D.preventDefault(),H())})}return V&&(h.addEventListener("dragstart",H=>{d=u.id,h.classList.add("kb-dragging"),H.dataTransfer?.setData("text/plain",u.id),H.dataTransfer&&(H.dataTransfer.effectAllowed="move")}),h.addEventListener("dragend",()=>{d=null,h.classList.remove("kb-dragging")})),h},L=(l,u)=>{let h=C("div","kb-column");h.dataset.status=l;let V=C("div","kb-column-head"),f=C("span","kb-column-count",String(u.length));u.some(A=>A.attention&&A.displayStatus!=="done"&&A.displayStatus!=="archived")&&(f.dataset.attn="true");let _=C("span","kb-column-tools");if(_.append(f),o.onEmptyColumn){let A=o.onEmptyColumn,G=o.isColumnEmptyArmed?.(l)??!1,z=Et(Ts,G?`Click again to empty ${be[l]}`:`Empty ${be[l]}`,()=>A(l));G&&(z.dataset.armed="true"),_.append(z)}V.append(C("span","kb-column-title",be[l]),_);let x=C("div","kb-column-body");h.append(V,x),u.length===0&&x.append(C("div","kb-column-empty","No tasks"));for(let A of u)x.append(N(A));return o.onDrop&&I(h,x,l,o.onDrop),h},w=(l,u)=>{let h=C("div","kb-psec");h.dataset.status=l;let V=o.onToggleSection!==void 0,f=V&&(o.isCollapsed?.(l)??!1),_=V?document.createElement("button"):C("div","kb-psec-head");_.className="kb-psec-head",_ instanceof HTMLButtonElement&&(_.type="button"),_.append(C("span","kb-psec-name",be[l]));let x=C("span","kb-psec-count","0");u.some(G=>G.attention&&G.displayStatus!=="done"&&G.displayStatus!=="archived")&&(x.dataset.attn="true"),_.append(x),V&&(_.append(C("span","kb-psec-chevron",f?"\u25B8":"\u25BE")),_.addEventListener("click",()=>o.onToggleSection?.(l)));let A=C("div","kb-psec-body");if(A.hidden=f,h.append(_,A),!f){u.length===0&&A.append(C("div","kb-panel-empty","No tasks"));for(let G of u)A.append(N(G))}return o.onDrop&&I(h,A,l,o.onDrop),h};return{render:l=>{for(let u of a.splice(0))u.dispose();i.replaceChildren();for(let u of ge)u!=="archived"&&i.append(r?w(u,l[u]):L(u,l[u]))},dispose:()=>{for(let l of a.splice(0))l.dispose();i.replaceChildren()}}};var gs=`
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
/* The archive dialog (the toolbar's Archive button opens it): the same
   kb-dialog shell the detail popup mounts, one list inside \u2014 the retired
   work the hidden Archive column would have shown, oldest first. */
.kb-archive-head{align-items:center}
.kb-archive-title{font-size:17px;font-weight:600;letter-spacing:-.01em;display:inline-flex;align-items:center;gap:8px}
.kb-dialog-count{font:11px var(--oc-mono);color:var(--oc-muted);background:color-mix(in srgb,var(--oc-muted) 14%,transparent);padding:1px 7px;border-radius:9999px}
.kb-archive-list{display:flex;flex-direction:column;gap:8px;overflow-y:auto;flex:1}
.kb-archive-row{background:var(--oc-elevated);color:var(--oc-elevated-fg);border:1px solid var(--oc-border);border-radius:9px;padding:10px 12px;display:flex;align-items:center;gap:10px;cursor:pointer}
.kb-archive-row:hover{border-color:var(--oc-hover)}
.kb-archive-row:focus-visible{outline:2px solid var(--oc-focus,var(--oc-primary));outline-offset:-2px}
.kb-archive-main{flex:1;min-width:0}
.kb-archive-meta{margin-top:3px;font-size:11px;color:var(--oc-muted);display:flex;gap:7px;align-items:center;overflow-wrap:anywhere}
.kb-archive-when{font-family:var(--oc-mono)}
.kb-archive-row .kb-iconbtn{width:24px;height:24px}
.kb-iconbtn[data-armed="true"]{background:var(--oc-error,var(--status-error,#e5484d));border-color:transparent;color:#fff}
.kb-archive-empty{font-size:12px;color:var(--oc-muted);padding:12px 2px;text-align:center}
.kb-archive-foot{font:10px var(--oc-mono);color:var(--oc-muted);text-align:center}
/* The toolbar's Archive button rides the selection bar's plain-button idiom
   at toolbar scale: glyph, live count, label. */
.kb-tb-archive{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;font-size:12px}
.kb-tb-archive svg{width:13px;height:13px;display:block}
.kb-tb-archive .kb-tb-count{font:11px var(--oc-mono);color:var(--oc-muted);background:color-mix(in srgb,var(--oc-muted) 14%,transparent);padding:0 6px;border-radius:9999px}
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
/* Rail panel (kb-rail on kb-page): the board's views stacked as collapsible
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
`,br=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=gs,document.head.append(e)};var kr=(e,t,o)=>{br(),t.replaceChildren();let r=!1,i=[],a=[],d=o?.directory??null,p=null,I,N,L=!1,w=!1,v=null,l,u,h,V,f=(b,E)=>b.filter(R=>lt(R,{projectId:E??dt})),_=b=>{i=[...b];let E=f(i,p?.id??null);x.sync(E),A.sync(E)},x=lr(e,le,null,void 0,{onLiveChange:()=>{w&&!r&&(A.evaluate(),P())},onSnapshot:()=>{Be()}}),A=Wn(e,()=>x.live(),b=>b===null?null:a.find(E=>E.id===b)?.name??null,{onPromoted:b=>{_(i.map(E=>E.id===b.id?b:E)),w&&P()},onStale:b=>{let E=i.find(R=>R.id===b.id);!E||E.title===b.title||(_(i.map(R=>R.id===b.id?b:R)),w&&P())}}),G=new Set,z=()=>new Set([...G,...i.flatMap(b=>b.sessionId?[b.sessionId]:[])]),ne=new Set,H=0,D=1/0,Z=null,ee=(b,E,R)=>{p&&b!==p.id||r||H>0||ne.has(E.id)||z().has(E.id)||E.createdAt<D||(ne.add(E.id),(async()=>{try{let k=await jn(e,{projectId:b,session:E,status:R,projectName:a.find(pe=>pe.id===b)?.name??null});if(k===null||r)return;_(i.filter(pe=>pe.id!==k.task.id).concat(k.task)),w&&P(),k.adopted&&e.toast({kind:"info",message:`Added "${k.task.title}" to the board (${be[R]}) \u2014 found a session running with no task.`}).catch(()=>{})}catch(k){e.toast({kind:"error",message:`Could not add the task for a found session \u2014 ${ue(k)}`}).catch(()=>{})}})())},O=()=>{p=ur(a,d)},T=C("div","kb-page kb-rail"),re=C("div","kb-row between");re.append(C("h2","","Kanban"));let Se=C("span");re.append(Se),T.append(re),u=C("p","kb-muted","Loading\u2026"),T.append(u),h=C("p","kb-rail-scope"),T.append(h),V=C("p","kb-panel-unseen"),T.append(V),v=gr(T,"rail",{projectName:b=>!p&&b.projectId?a.find(E=>E.id===b.projectId)?.name??null:null,onMarkDone:async b=>{let E=i.find(k=>k.id===b.id)??b,R=$n(E,"done");if(R){try{await xe(e,R)}catch(k){e.toast({kind:"error",message:`Could not mark "${E.title}" done \u2014 ${ue(k)}`}).catch(()=>{}),q();return}_(i.map(k=>k.id===E.id?R:k)),P()}},onChat:async b=>{let E=i.find(Y=>Y.id===b.id)??b;if(E.sessionId){if(E.needsAttentionSince!==null){let Y=ke(E,{needsAttentionSince:null});try{await So(e,Y),_(i.map(me=>me.id===E.id?Y:me)),P()}catch(me){e.toast({kind:"error",message:`Opened the chat, but marking "${E.title}" reviewed failed \u2014 ${ue(me)}`}).catch(()=>{})}}try{await e.openSession(E.sessionId)}catch(Y){e.toast({kind:"error",message:`Could not open the chat of "${E.title}" \u2014 ${ue(Y)}`}).catch(()=>{})}return}if(!E.projectId)return;let R=Qn(E);H+=1;let k;try{k=await e.startSession(R),k.sessionId!==null&&ne.add(k.sessionId)}catch(Y){e.toast({kind:"error",message:`Could not start the chat for "${E.title}" \u2014 ${ue(Y)}`}).catch(()=>{});return}finally{H-=1}if(k.sessionId===null){e.toast({kind:"error",message:`Could not start the chat (${k.failure}). Its worktree at ${k.directory} was kept so you can recover it by hand.`}).catch(()=>{});return}let pe=ke(E,Zn(R,k));try{await So(e,pe)}catch(Y){e.toast({kind:"error",message:`Started a chat for "${E.title}", but the link could not be saved \u2014 ${ue(Y)}. Open the full board to link it.`}).catch(()=>{}),q();return}_(i.map(Y=>Y.id===E.id?pe:Y)),P();try{await e.openSession(k.sessionId)}catch(Y){e.toast({kind:"error",message:`Started the chat, but it could not be opened \u2014 ${ue(Y)}.`}).catch(()=>{});return}fr(e,er(E),{onLost:()=>{e.toast({kind:"info",message:`The chat was created but its composer wasn't filled \u2014 the description is still on the card "${E.title}".`}).catch(()=>{})}})}});let Te=C("div","kb-rail-foot");Te.append(C("p","kb-muted","Two quick actions live here \u2014 the \u2713 marks a task Done, and the chat button opens the linked chat of a card (starting one attached to it when there is none). Everything else (open, move, edit, delete) is the full board, one click away: pull this panel wider, or the Extension pages menu.")),T.append(Te),t.append(T),l=ao(Se,{label:"",tone:"neutral"}),I=window.setInterval(()=>{q()},3e4);let He=null;e.onProjects(b=>{r||b.state!=="ready"||(a=b.projects,O(),_(i),w&&P())}).then(b=>{r?b():He=b},()=>{});let te=e.onDirectory(b=>{r||(d=b,O(),_(i),w&&P())}),Ve=async()=>{try{let[b,E,R]=await Promise.all([Ae(e),qn(e),ho(e)]);if(r)return;_(b.tasks),G=R,E===null?(D=Date.now(),Yn(e,D).catch(()=>{})):D=E,w=!0,u.hidden=!0,P(),Z=pr(e,z,k=>ee(k.projectId,k.session,k.status))}catch(b){u.textContent=`Could not load tasks \u2014 ${ue(b)}`}},q=async()=>{if(!(r||L)){L=!0;try{let[{tasks:b},E]=await Promise.all([Ae(e),ho(e)]);if(r)return;G=E,_(b),w||(w=!0,u.hidden=!0),P()}catch(b){w||(u.textContent=`Could not load tasks \u2014 ${ue(b)}`)}finally{L=!1}}},Be=()=>{N!==void 0||r||(N=window.setTimeout(()=>{N=void 0,q()},500))},P=()=>{let b=rr(i,x.live(),{projectId:p?.id??dt}),E=ir(b),R=sr(b);p?(h.textContent=`Project: ${p.name}`,h.hidden=!1):h.hidden=!0;let k=ar(E,R);l.update({label:k.label,tone:k.tone}),R>0?(V.textContent=`${R} task${R===1?"":"s"} need${R===1?"s":""} your review`,V.hidden=!1):V.hidden=!0,v?.render(b)};return Ve(),{dispose:()=>{r||(r=!0,I!==void 0&&window.clearInterval(I),N!==void 0&&window.clearTimeout(N),He?.(),te(),Z?.dispose(),x.dispose(),A.dispose(),v?.dispose())}}};var bo=Kt(),Ar=document.querySelector("#root");if(!Ar)throw new Error("Missing #root");var ko=null;bo.onReady(e=>{Wt(e,document.documentElement),!ko&&(ko=kr(bo,Ar,{directory:e.directory}))});window.addEventListener("pagehide",()=>{ko?.dispose(),bo.dispose()});})();
