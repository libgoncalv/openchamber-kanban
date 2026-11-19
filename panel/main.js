"use strict";(()=>{var N="openchamber.sdk";var Ke="data-oc-scrolling",St=`
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
:hover, [${Ke}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Ke}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Ke}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Ke}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Tt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let i=r.target===e?t:r.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let a=o.get(i);a!==void 0&&clearTimeout(a),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var kr=`(${Tt.toString()})(document);`;var Io=e=>{let t=[],o=0,r=0;return{push:i=>{for(t.push(i),r+=i.length;r-o>e&&t.length>1;){let a=t.shift();r-=a?.length??0,o=0}},pull:i=>{let a=0;for(;a<i.length&&t.length>0;){let d=t[0],p=Math.min(i.length-a,d.length-o);i.set(d.subarray(o,o+p),a),a+=p,o+=p,o>=d.length&&(t.shift(),r-=d.length,o=0)}i.fill(0,a)},clear:()=>{t.length=0,o=0,r=0},get size(){return r-o}}};var Uo=/^[a-z][a-z0-9-]{0,39}$/;var wo=e=>Object(e)===e&&!Array.isArray(e),mt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Co=e=>String(e)===e&&e.length>=1&&e.length<=60,Mo=e=>String(e)===e&&e.length>=1&&e.length<=80,No=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!wo(o)||!Uo.test(o.id)||!Co(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!mt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!mt(o,["kind","id","label","value","options","disabled"])||!Mo(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let i of o.options){if(!wo(i)||!mt(i,["value","label"])||!Mo(i.value)||!Co(i.label)||r.has(i.value))return!1;r.add(i.value)}if(!r.has(o.value))return!1}return!0};var xr=1024*1024;var Lo=["{id}","{segment}","{segments+}"];var ys=new Set(Lo);var Po=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Is=new Set(Po);var ht=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Do=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Go=/^[A-Za-z0-9_-]{1,80}$/;var Ho=["left","right","top","bottom"];var $o=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of r)if(!$o(i,t+1,o))return!1;return!0},gt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(gt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(gt)}return String(e)===e||Number.isFinite(e)},bt=e=>{try{return String(e.id)!==e.id||!Go.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Ho.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!$o(e.data)||!gt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var At=2e3;var Vo=["file","directory","other","missing"],xt=e=>!!(e&&"sessionId"in e),Ot=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Bo=/^[0-9a-f]{7,64}$/i,Rt=e=>Bo.test(e),We=500,ze=32e3,Fo=16e3,jo=128,Ko=200,Wo=2e3,zo=16e3,qo=80,Yo=200,Jo=16e3;var Qo=2e3;var yt=2e4,qe=1024,Ye=2e6;var Je=64e3,Qe=8e3,vt=4e3;var It=96e4,Or=60*6e4;var Zo=999,en=1e4,He=500,tn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],on=["stopped","starting","ready","failed"],Rr=new Set(tn),nn=e=>Rr.has(e),rn=e=>e&&nn(e)?e:"HOST_REJECTED",Ie=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ie):Object(e)===e?Object.values(e).every(Ie):!1,sn=e=>Ie(e)&&JSON.stringify(e).length<=Jo,Xo=e=>e?.trim().slice(0,Yo)??"",we=e=>{let t=e.id.trim().slice(0,jo),o=e.title.trim().slice(0,Ko),r=e.url.trim().slice(0,Wo),i=e.text?.trim().slice(0,zo),a=e.author?.trim().slice(0,qo),d=e.kind==="pull"?"pull":"issue",p={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:d};if(i&&(p.text=i),a&&(p.author=a),d==="pull"){let v=Xo(e.branches?.head),C=Xo(e.branches?.base);v&&C&&(p.branches={head:v,base:C})}return sn(e.data)&&(p.data=e.data),p},wt=e=>{let t=we(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Ct=e=>{let t={text:e.text.trim().slice(0,Fo)};return e.send&&(t.send=!0),t},Mt=e=>e===null||!Number.isFinite(e)?null:Math.min(Zo,Math.max(0,Math.round(e))),Ut=e=>Number.isFinite(e)?Math.min(en,Math.max(0,Math.ceil(e))):0;var Ce=e=>e.length>0&&e.length<=qe&&!e.includes("\0")&&!e.includes("\\");var Ze=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Qo?!1:!e.split("/").some(o=>o==="."||o===".."),yr=new Set(on),Nt=e=>!!(e&&"status"in e&&yr.has(String(e.status))&&!("body"in e)),et=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Lt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Pt=e=>!!(e&&"written"in e&&e.written===!0),Dt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),vr=new Set(Vo),Gt=e=>!!(e&&"kind"in e&&"size"in e&&vr.has(String(e.kind))&&Number.isFinite(e.size)),Ht=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Ir=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),wr=e=>Object(e)===e?e:null,kt=e=>String(e)===e&&e.length>0,Cr=e=>{if(!kt(e.id))return null;if(e.ok===!0){let t={channel:N,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&kt(e.error)?{channel:N,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:rn(kt(e.code)?e.code:void 0)}:null},$t=e=>{let t=wr(e);return!t||t.channel!==N||t.v!==1?null:t.type==="result"?Cr(t):!Ir.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var an=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Mr=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",g=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},cn=()=>Promise.reject(new g("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),tt=()=>Promise.reject(new g("BAD_PATH",`File path must be 1 to ${qe} characters without NUL or backslash.`)),ot=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new g("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},y=e=>(e.value+=1,`oc-${e.value}`),jt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new g("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),r=e.requestTimeoutMs??yt,i=new Set,a=new Set,d=new Set,p=new Set,v=new Set,C=new Set,P=new Set,M=new Set,I=new Set,l=new Set,E=new Set,h=new Set,V=[],u=null,_=null,A=new Set,x=new Set,G=null,z=null,ne=!1,H=new Map,D=new Map,Z=new Map,ee=!1,O={value:0},T=null,re=null,Se=!1,Te=!1,Ge=null,te=null,Xe=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,q=n=>{t.parent.postMessage(n,"*")},Ve=()=>{ee||t.parent===t||h.size===0||T?.features?.lateGenerateResults!==!0||q({channel:N,v:1,type:"generate-late-listen"})},U=(n,s)=>{for(let m of n)try{m(s)}catch(S){console.error(S)}},b=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let s=$t(n.data);if(!s)return;if(s.type==="workspace"){let S=D.get(s.payload.subscriptionId);S&&U([S],s.payload.snapshot);return}if(s.type==="shells"){let S=Z.get(s.payload.subscriptionId);S&&U([S],s.payload.snapshot);return}if(s.type==="microphone-audio"){te?.queue.push(s.payload.samples);return}if(s.type==="microphone-ended"){let S=te;if(!S)return;te=null,S.release(),U(S.endedListeners,s.payload.reason);return}if(s.type==="ready"){T=s.payload,re=Xe(s.payload.session),U(i,s.payload),U(a,s.payload.directory),U(d,s.payload.session),re&&U(p,re),U(v,s.payload.connection),U(C,s.payload.settings),U(P,s.payload.item),s.payload.block&&U(M,s.payload.block),Ve();return}if(s.type==="service-event"){U(I,s.payload);return}if(s.type==="generate-late"){h.size===0?V.push(s.payload):U(h,s.payload);return}if(s.type==="directory"){T&&(T={...T,directory:s.payload.directory}),U(a,s.payload.directory);return}if(s.type==="session"){T&&(T={...T,session:s.payload.session}),s.payload.session?re?.sessionId!==s.payload.session.id&&(re=Xe(s.payload.session)):re=null,U(d,s.payload.session);return}if(s.type==="session-lifecycle"){re=s.payload,U(p,s.payload);return}if(s.type==="connection"){T&&(T={...T,connection:s.payload.connection}),U(v,s.payload.connection);return}if(s.type==="settings"){T&&(T={...T,settings:s.payload.settings}),U(C,s.payload.settings);return}if(s.type==="item"){T&&(T={...T,item:s.payload.item}),U(P,s.payload.item);return}if(s.type==="status-control-event"){U(l,s.payload);return}if(s.type==="popover-closed"){U(E,s.payload);return}if(s.type==="action"){let S=X=>{ee||q({channel:N,v:1,type:"action-result",id:s.id,payload:X})},$=_;if(!$){S({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>$(s.payload)).then(()=>S({ok:!0}),X=>{let B=(X instanceof Error?X.message:String(X)).trim();S({ok:!1,error:(B||"Action failed.").slice(0,He)})});return}if(s.type==="file-open"){let S=s.payload;if(z&&Do(z,S))return;z=S,U(A,s.payload);return}if(s.type==="file-saved"){U(x,s.payload.version);return}if(s.type==="file-snapshot"){let S=B=>{ee||q({channel:N,v:1,type:"file-snapshot-result",id:s.id,payload:B})},$=B=>S({error:(B.trim()||"Could not read the edited file.").slice(0,He)}),X=G;if(!X){$("This extension does not edit files.");return}Promise.resolve().then(()=>X(s.payload.purpose)).then(B=>{if(ht(B)>2e7){$(`The file is over ${2e7} ${"bytes"in B?"bytes":"characters"}.`);return}if(B.version.length>256){$(`The snapshot version is over ${256} characters.`);return}S({snapshot:"bytes"in B?{bytes:B.bytes,version:B.version}:{content:B.content,version:B.version}})},B=>$(B instanceof Error?B.message:String(B)));return}if(s.type==="resolve"){let S=X=>{q({channel:N,v:1,type:"resolve-result",id:s.id,payload:X})},$=u;if(!$){S({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>$(s.payload)).then(X=>S({item:X?we(X):null}),X=>{let B=(X instanceof Error?X.message:String(X)).trim();S({error:(B||"Command failed.").slice(0,He)})});return}let m=H.get(s.id);if(m){if(clearTimeout(m.timer),H.delete(s.id),s.ok){m.resolve(s.payload);return}m.reject(new g(s.code,s.error))}};t.addEventListener("message",b),q({channel:N,v:1,type:"hello"});let f=(n,s=r)=>ee||t.parent===t?Promise.reject(new g("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((m,S)=>{let $=setTimeout(()=>{H.delete(n.id),S(new g("HOST_TIMEOUT","Host did not answer in time."))},s);H.set(n.id,{resolve:m,reject:S,timer:$}),q(n)}),R=n=>f(n).then(()=>{}),k={channel:N,v:1},pe=n=>{!ee&&t.parent!==t&&q(n)},Y=()=>pe({...k,type:"file-save"}),me=()=>{!ee&&t.parent!==t&&q({...k,type:"microphone-close",id:y(O)})},gr=async()=>{if(te)throw new g("HOST_REJECTED","The microphone is already open in this frame.");if(T?.features?.microphone!==!0)throw new g("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let n=globalThis.AudioContext;if(typeof n!="function")throw new g("UNSUPPORTED","This frame has no Web Audio.");let s=new n;if(s.sampleRate<8e3||s.sampleRate>192e3)throw s.close().catch(()=>{}),new g("UNSUPPORTED",`Audio at ${s.sampleRate} Hz is not supported.`);let m=s.state==="suspended"?s.resume().catch(()=>{}):void 0,S=Io(Math.round(s.sampleRate/4)),$=s.createScriptProcessor(1024,1,1);$.onaudioprocess=ie=>S.pull(ie.outputBuffer.getChannelData(0));let X=s.createMediaStreamDestination();$.connect(X);let B=new Set,ve={queue:S,endedListeners:B,release:()=>{$.onaudioprocess=null,$.disconnect(),S.clear();for(let ie of X.stream.getTracks())ie.stop();s.close().catch(()=>{})}};te=ve;try{let ie=await f({...k,type:"microphone-open",id:y(O),payload:{sampleRate:s.sampleRate}},12e4);if(!ie||!("opened"in ie)||ie.opened!==!0)throw new g("HOST_REJECTED","Host did not open the microphone.");if(await m,te!==ve)throw new g("DISCONNECTED","The microphone closed while it was opening.")}catch(ie){throw te===ve&&(te=null),ve.release(),me(),ie}return{stream:X.stream,close:()=>{te===ve&&(te=null,ve.release(),me())},onEnded:ie=>(B.add(ie),()=>{B.delete(ie)})}},ko=n=>{!an(n)||!Mr(n)||(n.preventDefault(),Y())},Ao=n=>{!an(n)||n.key!=="Escape"||T?.surface!=="popover"||!T.popover||(n.preventDefault(),yo(T.popover.id,"escape").catch(()=>{}))},Be=()=>{let n=T?.surface==="popover"?T.popover:void 0;if(!n)return;let s=Se||Te;Ge!==s&&(Ge=s,vo(n.id,s).catch(()=>{}))},Fe=()=>{T?.surface!=="popover"||Se||(Se=!0,Be())},xo=n=>{T?.surface!=="popover"||n.relatedTarget!==null||!Se||(Se=!1,Be())},Oo=()=>{T?.surface!=="popover"||Te||(Te=!0,Be())},Ro=()=>{T?.surface!=="popover"||!Te||(Te=!1,Be())},de=(n,s=1024)=>{if(!n.trim()||n.length>s)throw new g("HOST_REJECTED",`Identity must contain 1 to ${s} characters.`)},ft=async n=>{n.kind!=="projects"&&de(n.projectId);let s=await f({...k,type:"workspace-read",id:y(O),payload:n});if(!s||!("kind"in s)||!("state"in s)||s.kind!==n.kind)throw new g("HOST_REJECTED","Host did not return workspace data.");return s},_t=async(n,s)=>{n.kind!=="projects"&&de(n.projectId);let m=y(O);D.set(m,s);try{await R({...k,type:"workspace-subscribe",id:y(O),payload:{subscriptionId:m,query:n}})}catch(S){throw D.delete(m),ee||q({...k,type:"workspace-unsubscribe",id:y(O),payload:{subscriptionId:m}}),S}return()=>{!D.delete(m)||ee||q({...k,type:"workspace-unsubscribe",id:y(O),payload:{subscriptionId:m}})}},br=async(n,s)=>{n.kind==="session"&&de(n.sessionId),n.kind==="project"&&de(n.projectId);let m=y(O);Z.set(m,s);try{await R({...k,type:"shells-subscribe",id:y(O),payload:{subscriptionId:m,scope:n}})}catch(S){throw Z.delete(m),ee||q({...k,type:"shells-unsubscribe",id:y(O),payload:{subscriptionId:m}}),S}return()=>{!Z.delete(m)||ee||q({...k,type:"shells-unsubscribe",id:y(O),payload:{subscriptionId:m}})}},je=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new g("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Ie(n.value))throw new g("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new g("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&T?.features?.deviceStorage!==!0)throw new g("UNSUPPORTED","This host does not support device storage.");let s=await f({...k,type:"storage",id:y(O),payload:n});if(!s||!("storage"in s)||s.op!==n.op)throw new g("HOST_REJECTED","Host did not return storage data.");return s},yo=(n,s)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===n)?Promise.reject(new g("UNSUPPORTED","This host does not support popovers.")):R({...k,type:"popover-close",id:y(O),payload:s?{id:n,reason:s}:{id:n}}),vo=(n,s)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===n)?Promise.reject(new g("UNSUPPORTED","This host does not support popovers.")):R({...k,type:"popover-anchor",id:y(O),payload:{id:n,active:s}});return t.addEventListener("keydown",Ao,!0),t.addEventListener("pointerover",Fe),t.addEventListener("pointermove",Fe),t.addEventListener("pointerout",xo),t.addEventListener("focus",Oo),t.addEventListener("blur",Ro),{onAction:n=>(_=n,()=>{_===n&&(_=null)}),listProjects:async()=>{let n=await ft({kind:"projects"});if(n.kind!=="projects")throw new g("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let s=await ft({kind:"worktrees",projectId:n});if(s.kind!=="worktrees")throw new g("HOST_REJECTED","Expected worktrees.");return s},listSessions:async n=>{let s=await ft({kind:"sessions",projectId:n});if(s.kind!=="sessions")throw new g("HOST_REJECTED","Expected sessions.");return s},onProjects:n=>_t({kind:"projects"},s=>{s.kind==="projects"&&n(s)}),onWorktrees:(n,s)=>_t({kind:"worktrees",projectId:n},m=>{m.kind==="worktrees"&&s(m)}),onSessions:(n,s)=>_t({kind:"sessions",projectId:n},m=>{m.kind==="sessions"&&s(m)}),onRunningShells:(n,s)=>br(n,s),readShellOutput:async(n,s)=>{de(n,128);let m=s?.cursor;if(m!==void 0&&(!Number.isInteger(m)||m<0))throw new g("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let S=s?.tailBytes;if(S!==void 0&&(!Number.isInteger(S)||S<1||S>65536))throw new g("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let X=await f({...k,type:"shell-output",id:y(O),payload:{shellId:n,cursor:m,tailBytes:S}});if(!X||typeof X.output!="string"||!Number.isFinite(X.cursor))throw new g("HOST_REJECTED","Host did not return shell output.");return X},stopShell:async n=>{if(de(n,128),(await f({...k,type:"shell-stop",id:y(O),payload:{shellId:n}}))?.stopped!==!0)throw new g("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{de(n),await R({...k,type:"open-session",id:y(O),payload:{sessionId:n}})},storage:{get:async(n,s)=>{let m=ot(s),S={op:"get",key:n};m&&(S.scope=m);let $=await je(S);return $.op==="get"&&$.found?$.value:void 0},set:async(n,s,m)=>{let S=ot(m),$={op:"set",key:n,value:s};S&&($.scope=S),await je($)},delete:async(n,s)=>{let m=ot(s),S={op:"delete",key:n};m&&(S.scope=m),await je(S)},keys:async n=>{let s=ot(n),m={op:"keys"};s&&(m.scope=s);let S=await je(m);if(S.op!=="keys")throw new g("HOST_REJECTED","Expected storage keys.");return S.keys}},onReady:n=>(i.add(n),T&&n(T),()=>{i.delete(n)}),onDirectory:n=>(a.add(n),T&&n(T.directory),()=>{a.delete(n)}),onSession:n=>(d.add(n),T&&n(T.session),()=>{d.delete(n)}),onSessionLifecycle:n=>(p.add(n),re&&n(re),()=>{p.delete(n)}),onConnection:n=>(v.add(n),T&&n(T.connection),()=>{v.delete(n)}),onSettings:n=>(C.add(n),T&&n(T.settings),()=>{C.delete(n)}),onItem:n=>(P.add(n),T&&n(T.item),()=>{P.delete(n)}),onBlock:n=>(M.add(n),T?.block&&n(T.block),()=>{M.delete(n)}),onServiceEvent:n=>(I.add(n),()=>{I.delete(n)}),onStatusControl:n=>(l.add(n),()=>{l.delete(n)}),onPopoverClosed:n=>(E.add(n),()=>{E.delete(n)}),setStatusControls:n=>T?.features?.statusControls!==!0?Promise.reject(new g("UNSUPPORTED","This host does not support status controls.")):No(n)?R({...k,type:"status-controls",id:y(O),payload:{controls:n}}):Promise.reject(new g("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>T?.features?.popovers!==!0?Promise.reject(new g("UNSUPPORTED","This host does not support popovers.")):bt(n)?R({...k,type:"popover-open",id:y(O),payload:n}):Promise.reject(new g("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:yo,setPopoverAnchorActive:vo,onResolve:n=>(u=n,()=>{u===n&&(u=null)}),toast:n=>{let s=n.message.trim();return!s||s.length>We?Promise.reject(new g("HOST_REJECTED",`Toast message must contain 1 to ${We} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>ze)?Promise.reject(new g("HOST_REJECTED",`Toast copy text must contain 1 to ${ze} characters.`)):R({channel:N,v:1,type:"toast",id:y(O),payload:{...n,message:s}})},openUrl:n=>R({channel:N,v:1,type:"open-url",id:y(O),payload:{url:n}}),openCommit:n=>Rt(n)?R({channel:N,v:1,type:"open-commit",id:y(O),payload:{sha:n}}):Promise.reject(new g("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>R({channel:N,v:1,type:"block-answer",id:y(O),payload:{text:n.trim().slice(0,At)}}),openSurface:n=>R({channel:N,v:1,type:"open-surface",id:y(O),payload:{surfaceId:n}}),writeClipboard:n=>R({channel:N,v:1,type:"clipboard-write",id:y(O),payload:{text:n}}),compose:n=>R({channel:N,v:1,type:"compose",id:y(O),payload:n}),attach:n=>R({channel:N,v:1,type:"attach",id:y(O),payload:we(n)}),startSession:async n=>{n.projectId!==void 0&&de(n.projectId);let s=n.worktree;s&&s!==!0&&(s.kind==="existing"?de(s.directory):(s.name!==void 0&&de(s.name,200),s.baseBranch!==void 0&&de(s.baseBranch,200)));let m=await f({channel:N,v:1,type:"start-session",id:y(O),payload:wt(n)},e.requestTimeoutMs??18e4);if(!xt(m))throw new g("HOST_REJECTED","Host did not return a session.");return m},prompt:n=>f({channel:N,v:1,type:"prompt",id:y(O),payload:Ct(n)}).then(s=>{if(!Ot(s))throw new g("HOST_REJECTED","Host did not return a prompt result.");return s}),sessionLink:n=>R({channel:N,v:1,type:"session-link",id:y(O),payload:we(n)}),close:()=>R({channel:N,v:1,type:"close",id:y(O)}),oauthStart:()=>R({channel:N,v:1,type:"oauth-start",id:y(O)}),oauthDisconnect:()=>R({channel:N,v:1,type:"oauth-disconnect",id:y(O)}),request:n=>(Ze(n.path)?f({channel:N,v:1,type:"request",id:y(O),payload:n}):cn()).then(s=>{if(!et(s))throw new g("HOST_REJECTED","Host request result was empty.");return s}),serviceRequest:n=>(Ze(n.path)?f({channel:N,v:1,type:"service-request",id:y(O),payload:n}):cn()).then(s=>{if(!et(s))throw new g("HOST_REJECTED","Host service request result was empty.");return s}),serviceStatus:()=>f({channel:N,v:1,type:"service-status",id:y(O)}).then(n=>{if(!Nt(n))throw new g("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Ce(n)?f({channel:N,v:1,type:"file-read",id:y(O),payload:{path:n}}):tt()).then(s=>{if(!Lt(s))throw new g("HOST_REJECTED","Host did not return file content.");return s}),writeFile:(n,s)=>Ce(n)?s.length>Ye?Promise.reject(new g("FILE_TOO_LARGE",`Content is over ${Ye} characters.`)):f({channel:N,v:1,type:"file-write",id:y(O),payload:{path:n,content:s}}).then(m=>{if(!Pt(m))throw new g("HOST_REJECTED","Host did not confirm the write.");return m}):tt(),listDir:n=>(Ce(n)?f({channel:N,v:1,type:"file-list",id:y(O),payload:{path:n}}):tt()).then(s=>{if(!Dt(s))throw new g("HOST_REJECTED","Host did not return directory entries.");return s}),stat:n=>(Ce(n)?f({channel:N,v:1,type:"file-stat",id:y(O),payload:{path:n}}):tt()).then(s=>{if(!Gt(s))throw new g("HOST_REJECTED","Host did not return file status.");return s}),generate:n=>{let s=n.prompt.trim(),m=n.system?.trim();if(s.length===0||s.length>Je)return Promise.reject(new g("HOST_REJECTED",`Prompt must be 1 to ${Je} characters.`));if(m!==void 0&&(m.length===0||m.length>Qe))return Promise.reject(new g("HOST_REJECTED",`System prompt must be 1 to ${Qe} characters.`));let S=n.maxOutputTokens===void 0?void 0:Math.min(vt,Math.max(1,Math.floor(n.maxOutputTokens)));if(S!==void 0&&!Number.isFinite(S))return Promise.reject(new g("HOST_REJECTED","maxOutputTokens must be a number."));let $={prompt:s};return m!==void 0&&($.system=m),S!==void 0&&($.maxOutputTokens=S),f({channel:N,v:1,type:"generate",id:y(O),payload:$},e.requestTimeoutMs??It).then(X=>{if(!Ht(X))throw new g("HOST_REJECTED","Host did not return generated text.");return X})},onLateGenerateResult:n=>{h.add(n);for(let s of V.splice(0))U([n],s);return Ve(),()=>{h.delete(n)}},openMicrophone:gr,setBadge:n=>R({channel:N,v:1,type:"badge",id:y(O),payload:{count:Mt(n)}}),setHeight:n=>R({channel:N,v:1,type:"resize",id:y(O),payload:{height:Ut(n)}}),onFileOpen:n=>(A.add(n),ne||(ne=!0,t.addEventListener("keydown",ko,!0)),z&&n(z),()=>{A.delete(n)}),onFileSnapshot:n=>(G=n,()=>{G===n&&(G=null)}),onFileSaved:n=>(x.add(n),()=>{x.delete(n)}),reportFileChange:n=>pe({...k,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Y,reportFileUnsupported:()=>pe({...k,type:"file-unsupported"}),dispose:()=>{for(let n of D.keys())q({...k,type:"workspace-unsubscribe",id:y(O),payload:{subscriptionId:n}});D.clear();for(let n of Z.keys())q({...k,type:"shells-unsubscribe",id:y(O),payload:{subscriptionId:n}});Z.clear(),te&&(me(),te.release(),te=null),ee=!0,u=null,_=null,G=null,A.clear(),x.clear(),ne&&t.removeEventListener("keydown",ko,!0),t.removeEventListener("message",b),t.removeEventListener("keydown",Ao,!0),t.removeEventListener("pointerover",Fe),t.removeEventListener("pointermove",Fe),t.removeEventListener("pointerout",xo),t.removeEventListener("focus",Oo),t.removeEventListener("blur",Ro);for(let n of H.values())clearTimeout(n.timer),n.reject(new g("HOST_UNAVAILABLE","Host client was disposed."));H.clear(),i.clear(),a.clear(),d.clear(),p.clear(),v.clear(),C.clear(),P.clear(),M.clear(),I.clear(),l.clear(),E.clear(),h.clear(),V.length=0}}};var fn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Ks=new Set(fn);var Ur=10*6e4;var Nr=10*6e4;var Lr=10*6e4;var Pr=10*6e4;var _n=["none","agent","user"];var zs=new Set(_n);var Dr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Gr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Sn=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of Dr)t.style.setProperty(o,e.tokens[r]);for(let[o,r,i]of Gr){let a=e.tokens[i]??"";t.style.setProperty(o,a),t.style.setProperty(r,a)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Kt=(e,t)=>{Sn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Hr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},F=(e,t)=>`var(--${e}, var(--oc-${Hr[e]}, ${t}))`,fe=F("surface-background","transparent"),rt=F("surface-elevated","transparent"),Me=F("surface-elevated-foreground","inherit"),se=F("surface-foreground","inherit"),K=F("surface-muted-foreground","gray"),$r=F("surface-muted","transparent"),Oe=F("interactive-border","currentColor"),oe=F("interactive-hover","transparent"),Re=F("interactive-active","transparent"),Wt=F("interactive-selection","transparent"),zt=F("interactive-selection-foreground","inherit"),Ee=F("primary","currentColor"),qt=F("primary-text","inherit"),Yt=F("error-text","inherit"),Xr=F("font-sans","inherit"),Jt=F("font-mono","monospace"),gn=F("radius","9px"),Qt=`calc(${gn} - 2px)`,Tn=`calc(${gn} - 4px)`,W=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,mn=`background-image: linear-gradient(${oe}, ${oe});`,Zt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,eo="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",hn="box-shadow: var(--oc-sdk-lit);",to=`inset 0 0.5px 0 0 ${W(se,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Vr=`
:root {
  --oc-sdk-edge: ${W(se,16)};
  --oc-sdk-field-bg: ${rt};
  --oc-sdk-raised-bg: ${fe};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${W(se,14)};
  --oc-sdk-field-bg: ${W(fe,50,rt)};
  --oc-sdk-raised-bg: ${rt};
  --oc-sdk-field-lift: ${to};
  --oc-sdk-raised-lift: ${to};
  --oc-sdk-lit: ${to};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,nt=e=>{let t=F(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${F(`${e}-text`,"inherit")}; }`},c=e=>`calc(${e}rem / 14)`,Br=`
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
`,bn=`${Vr}
.oc-sdk { color: ${se}; font-family: ${Xr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${mn} }
.oc-sdk-mono { font-family: ${Jt}; }
.oc-sdk-muted { color: ${K}; }
${nt("success")}${nt("warning")}${nt("error")}${nt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Ee}; --oc-sdk-tone-text: ${qt}; }

.oc-sdk-btn { border-radius: ${Qt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Tn}; }
.oc-sdk-btn[data-variant="default"] { color: ${qt}; background: ${W(Ee,10,fe)}; border-color: ${W(Ee,12)}; ${hn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${W(Ee,16,fe)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${W(Ee,22,fe)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${$r}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Me}; ${eo} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Re}, ${Re}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${oe}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Re}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${F("status-error","red")}; color: ${Yt}; background: ${W("var(--oc-sdk-tone)",7,fe)}; border-color: ${W("var(--oc-sdk-tone)",12)}; ${hn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${W("var(--oc-sdk-tone)",9,fe)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${W("var(--oc-sdk-tone)",11,fe)}; box-shadow: none; }

.oc-sdk-field-note { color: ${K}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Yt}; }
.oc-sdk-input { border-radius: ${Qt}; background: var(--oc-sdk-field-bg); color: ${Me}; ${Zt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${K}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Zt(W(se,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Zt(F("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Jt}; }

.oc-sdk-search-icon { color: ${K}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Ee}; }
.oc-sdk-search-clear { border-radius: ${Tn}; color: ${K}; }
.oc-sdk-search-clear:hover { background: ${oe}; color: ${se}; }

.oc-sdk-trigger { border-radius: ${Qt}; background: var(--oc-sdk-raised-bg); color: ${Me}; ${eo} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${K}; }
.oc-sdk-trigger-chevron { color: ${K}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Me}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${rt}; background-clip: padding-box; color: ${Me}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${oe}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Wt}; color: ${zt}; }
.oc-sdk-option-check { color: ${se}; }
.oc-sdk-option[data-destructive="true"] { color: ${Yt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${W(F("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${K}; }
.oc-sdk-popup-empty { color: ${K}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Oe}; border-radius: 4px; color: ${se}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${W(se,60,Oe)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Oe}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${fe}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Ee}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${mn} }
.oc-sdk-check-desc { color: ${K}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${W(se,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${K}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${se}; }
.oc-sdk-tab[aria-selected="true"] { color: ${zt}; background: ${Wt}; border-color: ${Oe}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Me}; background: var(--oc-sdk-raised-bg); ${eo} }
.oc-sdk-tab-count { color: ${K}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${W(se,6)}; color: ${K}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${W("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${oe}; }
.oc-sdk-row[aria-selected="true"] { background: ${Wt}; color: ${zt}; }
.oc-sdk-row-lead { font-family: ${Jt}; color: ${K}; }
.oc-sdk-row-sub { color: ${K}; }
.oc-sdk-row-meta { color: ${K}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${K}; }

.oc-sdk-empty-body { color: ${K}; }

.oc-sdk-spinner { color: ${K}; }
.oc-sdk-spinner-ring { border-color: ${Oe}; border-top-color: ${Ee}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${W("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${K}; }

.oc-sdk-separator { color: ${K}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${W(Oe,40)}; }

.oc-sdk-progress-label { color: ${K}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${W(se,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${Ee}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${F("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${F("success-text","inherit")}; }

.oc-sdk-text a { color: ${qt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${W(Oe,60)}; }
`,J=`
${St}
${Br}
${bn}`;var kn="oc-sdk-ui-style",Ue=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},Q=e=>{let t=document.getElementById(kn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Tt(document);let o=document.createElement("style");o.id=kn,o.textContent=e,document.head.appendChild(o)},j=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},_e=e=>{let t=j("button",e);return t.type="button",t},ae=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},he=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},An=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Fr=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},$e=(e,t)=>{Q(J);let o=t,r=_e("oc-sdk oc-sdk-btn"),i=Fr(),a=document.createElement("span");r.append(a),e.append(r);let d=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==r?r.prepend(i):!o.loading&&i.parentNode===r&&i.remove(),ae(a,o.label)},p=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",p),d(),{update:v=>{o={...o,...v},d()},dispose:()=>{r.removeEventListener("click",p),r.remove()}}};var xn="http://www.w3.org/2000/svg",jr={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Ne=(e,t,o)=>{let r=document.createElementNS(xn,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.style.width=c(t),r.style.height=c(t),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let i=document.createElementNS(xn,"path");return i.setAttribute("d",jr[e]),r.append(i),r};var Le=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Pe=(e,t,o)=>{let r=e.filter(v=>!v.disabled);if(r.length===0)return null;let i=r[0],a=r[r.length-1];if(o==="first"||!i||!a)return i?.id??null;if(o==="last")return a.id;let d=r.findIndex(v=>v.id===t);return d===-1?o==="next"?i.id:a.id:r[Math.min(r.length-1,Math.max(0,d+(o==="next"?1:-1)))]?.id??null};var On=(e,t)=>`${e}-${t??""}`,oo=(e,t,o,r)=>{let i=_e("oc-sdk-option");i.id=On(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let a=j("span","oc-sdk-option-label");if(a.textContent=o.label,i.append(a),o.hint){let d=j("span","oc-sdk-option-hint");d.textContent=o.hint,i.append(d)}if(t==="option"){i.dataset.mark="check";let d=j("span","oc-sdk-option-check");d.append(Ne("check",14)),i.append(d)}return i.addEventListener("pointerenter",r.hover),i.addEventListener("click",r.pick),i},no=(e,t,o,r)=>{let i=On(o,r);for(let a of Array.from(e.children))a instanceof HTMLElement&&a.classList.contains("oc-sdk-option")&&(a.dataset.active=a.id===i?"true":"false");he(t,"aria-activedescendant",r?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Kr=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,i=window.innerHeight-o.bottom-8;r>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let a=o.left+e.offsetWidth-window.innerWidth+8;a>0&&(e.style.left=`${Math.max(8,Math.round(o.left-a))}px`)},ro=(e,t,o,r)=>{e.append(o),Kr(o,t);let i=An(e,r),a=()=>{r()},d=p=>{p.target instanceof Node&&o.contains(p.target)||r()};return window.addEventListener("resize",a),window.addEventListener("scroll",d,!0),()=>{i(),window.removeEventListener("resize",a),window.removeEventListener("scroll",d,!0),o.remove()}};var so=(e,t)=>{he(e,"data-tone",t&&t!=="neutral"?t:null)},io=(e,t)=>{Q(J);let o=t,r=j("span","oc-sdk oc-sdk-badge");e.append(r);let i=()=>{ae(r,o.label),so(r,o.tone)};return i(),{update:a=>{o={...o,...a},i()},dispose:()=>{r.remove()}}};var Rn=e=>e.filter(t=>!("separator"in t)),Wr=0,ao=(e,t)=>{Q(J);let o=t,r=`oc-sdk-menu-${Wr+=1}`,i=j("div","oc-sdk oc-sdk-menu");e.append(i);let a=j("div","oc-sdk oc-sdk-popup");a.setAttribute("role","menu"),a.tabIndex=-1;let d=null,p=null,v=$e(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{d?I():l()}}),C=i.querySelector("button");C?.setAttribute("aria-haspopup","menu");let P=u=>{p=u,no(a,a,r,u)},M=()=>{Ue(a);for(let u of o.items){if("separator"in u){let _=j("div","oc-sdk-separator");_.dataset.labeled="false",a.append(_);continue}a.append(oo(r,"menuitem",u,{hover:()=>P(u.id),pick:()=>E(u.id)}))}P(Rn(o.items).some(u=>u.id===p)?p:null)},I=()=>{let u=d;d=null,u?.(),p=null,C?.setAttribute("aria-expanded","false")},l=()=>{d||!C||(M(),d=ro(i,C,a,I),C.setAttribute("aria-expanded","true"),a.focus())},E=u=>{I(),C?.focus(),o.onSelect(u)},h=u=>{let _=Le(u);_?(u.preventDefault(),P(Pe(Rn(o.items),p,_))):u.key==="Enter"||u.key===" "?(u.preventDefault(),p&&E(p)):u.key==="Escape"&&(u.preventDefault(),I(),C?.focus())},V=u=>{d&&!(u.relatedTarget instanceof Node&&i.contains(u.relatedTarget))&&I()};return a.addEventListener("keydown",h),i.addEventListener("focusout",V),{update:u=>{o={...o,...u},v.update({label:o.label,variant:o.variant,size:o.size}),d&&M()},dispose:()=>{I(),a.removeEventListener("keydown",h),i.removeEventListener("focusout",V),v.dispose(),i.remove()}}};var ge=["backlog","todo","in_progress","review","done"],be={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},co=1,ye=200,yn=16e3;var lo="New task",zr=512,qr=/^t_[a-z0-9]{6,40}$/,vn=e=>typeof e=="string"&&ge.includes(e),Yr=(e=Date.now(),t=Math.random)=>{let o=Array.from({length:6},()=>Math.floor(t()*36).toString(36)).join("");return`t_${e.toString(36)}${o}`},ce=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>zr)throw new Error(`${t} is too long`);return o},po=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>ye)throw new Error(`Title is limited to ${ye} characters`);return t},it=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>yn)throw new Error(`Description is limited to ${yn} characters`);return e};var In=e=>{if(e===void 0)return;if(!Array.isArray(e))throw new Error("agentNotes must be an array");let t=[];for(let o of e){if(!o||typeof o!="object")throw new Error("agentNotes entries must be objects");let r=o;t.push({at:st(r.at,"agentNotes.at"),text:it(r.text)})}return t};var Jr=e=>e===void 0?{}:{agentNotes:In(e)},wn=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=ce(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:ce(t.branch,"worktree.branch")}},st=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},Cn=(e,t)=>e==null?null:st(e,t),uo=(e,t,o=Date.now(),r=Yr(o))=>({schemaVersion:co,id:r,title:po(e.title),description:it(e.description),status:e.status??"backlog",rank:t,projectId:ce(e.projectId,"projectId"),sourceBranch:ce(e.sourceBranch,"sourceBranch"),worktree:null,sessionId:null,createdAt:o,updatedAt:o,needsAttentionSince:null,autoDoneCommit:null}),ke=(e,t,o=Date.now())=>{let r={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(r.title=po(t.title)),"description"in t&&(r.description=it(t.description)),"status"in t){if(!vn(t.status))throw new Error("Unknown status");r.status=t.status}if("projectId"in t&&(r.projectId=ce(t.projectId,"projectId")),"sourceBranch"in t&&(r.sourceBranch=ce(t.sourceBranch,"sourceBranch")),"worktree"in t&&(r.worktree=wn(t.worktree)),"sessionId"in t&&(r.sessionId=ce(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");r.rank=t.rank}if("needsAttentionSince"in t&&(r.needsAttentionSince=Cn(t.needsAttentionSince,"needsAttentionSince")),"autoDoneCommit"in t&&(r.autoDoneCommit=ce(t.autoDoneCommit,"autoDoneCommit")),"agentNotes"in t){let i=In(t.agentNotes);i!==void 0?r.agentNotes=i:delete r.agentNotes}return r},Eo=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==co)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!qr.test(t.id))throw new Error("Task id is invalid");if(!vn(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:co,id:t.id,title:po(t.title),description:it(t.description),status:t.status,rank:t.rank,projectId:ce(t.projectId,"projectId"),sourceBranch:ce(t.sourceBranch,"sourceBranch"),worktree:wn(t.worktree),sessionId:ce(t.sessionId,"sessionId"),createdAt:st(t.createdAt,"createdAt"),updatedAt:st(t.updatedAt,"updatedAt"),needsAttentionSince:Cn(t.needsAttentionSince,"needsAttentionSince"),autoDoneCommit:ce(t.autoDoneCommit,"autoDoneCommit"),...Jr(t.agentNotes)}};var Un="task:",Mn=16,fo=e=>`${Un}${e}`,Ae=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(Un)),o=[],r=[];for(let i=0;i<t.length;i+=Mn)await Promise.all(t.slice(i,i+Mn).map(async a=>{try{let d=Eo(await e.storage.get(a));if(fo(d.id)!==a)throw new Error("Task id does not match its key");o.push(d)}catch{r.push(a)}}));return{tasks:o,failedKeys:r}},xe=async(e,t)=>{let o=Eo(t);await e.storage.set(fo(o.id),o)},at=(e,t)=>e.storage.delete(fo(t)),_o=async(e,t,o=3)=>{for(let r=1;r<=o;r+=1)try{await xe(e,t);return}catch(i){if(r===o)throw i;await new Promise(a=>setTimeout(a,300*r))}};var ct="__all__",Nn="__none__",Ln=1024;var So=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),dt=(e,t)=>!(t.projectId===Nn&&e.projectId!==null||t.projectId!==ct&&t.projectId!==Nn&&e.projectId!==t.projectId),To=(e,t)=>{let o=e.filter(r=>r.status===t).map(r=>r.rank);return o.length?Math.max(...o)+Ln:Ln};var Qr="dismissed-sessions",mo=async e=>{let t=await e.storage.get(Qr);return Array.isArray(t)?new Set(t.filter(o=>typeof o=="string"&&o.length>0)):new Set};var Pn=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:ke(e,{status:t,needsAttentionSince:null});var le={waitingPermissionMeansReview:!0,failedMeansReview:!0},Zr=e=>{let t=e?.trim().toLowerCase()??"";return t===""||t==="build"},De=(e,t,o,r,i=le)=>{let a=()=>e==="done"||!Zr(r)||e==="review"?null:"review",d=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return d();case"waiting-question":return a();case"waiting-permission":return i.waitingPermissionMeansReview?a():null;case"idle":return o==="completed"||o==="failed"&&i.failedMeansReview?a():null;default:return null}};var Dn=(e,t)=>e.parentId===null&&e.archivedAt===null&&!t.has(e.id),Gn=(e,t=le)=>De("backlog",e.activity,e.outcome,e.agent??null,t),Hn=(e,t)=>{let o=e.title.trim();return o&&o!==e.id?o.slice(0,200):t?`New session in ${t}`:`New session (${e.id.slice(0,8)})`},lt=(e,t)=>{let o=t.trim();return o.length>0&&o!==e},pt=(e,t)=>[...t?[`New session in ${t}`]:[],`New session (${e.slice(0,8)})`],$n=e=>{let t=e.title.trim();if(t&&t!==lo)return t.slice(0,ye);let o=e.description.trim().split(`
`)[0]?.trim()??"";return o?o.slice(0,ye):t||lo};var Xn=async(e,t)=>{let o=await Ae(e);if(o.tasks.some(p=>p.sessionId===t.session.id))return null;let r={...uo({title:Hn(t.session,t.projectName),projectId:t.projectId,status:t.status},To(o.tasks,t.status)),sessionId:t.session.id,needsAttentionSince:t.status==="review"?Date.now():null};await xe(e,r);let a=(await Ae(e)).tasks.filter(p=>p.sessionId===t.session.id&&p.id!==r.id),d=a.length===0?null:a.reduce((p,v)=>p.id<v.id?p:v);return d===null?{adopted:!0,task:r}:r.id<d.id?(await at(e,d.id).catch(()=>{}),{adopted:!0,task:r}):(await at(e,r.id).catch(()=>{}),{adopted:!1,task:d})};var Vn=async(e,t)=>{let{tasks:o}=await Ae(e),r=o.find(d=>d.id===t.taskId);if(!r||r.sessionId!==t.sessionId)return null;let i=lt(t.sessionId,t.sessionTitle)?t.sessionTitle.trim().slice(0,ye):null;if(!i||r.title===i)return{promoted:!1,task:r};if(!pt(t.sessionId,t.projectName).includes(r.title))return{promoted:!1,task:r};let a=ke(r,{title:i});return await xe(e,a),{promoted:!0,task:a}};var Bn=(e,t,o,r)=>{let i=new Map,a=new Set,d=new Set,p=!1,v=()=>{if(!p)for(let I of i.values()){let l=I.sessionId;if(l===null||a.has(l)||d.has(l))continue;let E=t().get(l);!E||!lt(l,E.title)||pt(l,o(I.projectId)).includes(I.title)&&(a.add(l),d.add(l),(async()=>{try{let h=await Vn(e,{taskId:I.id,sessionId:l,sessionTitle:E.title,projectName:o(I.projectId)});if(p||h===null)return;h.promoted?r.onPromoted(h.task):r.onStale(h.task)}catch{}finally{d.delete(l)}})())}};return{sync:I=>{p||(i=new Map(I.map(l=>[l.id,l])),v())},evaluate:v,reset:()=>{a.clear()},dispose:()=>{p=!0,d.clear()}}};var Fn="orphan-watermark",jn=async e=>{let t=await e.storage.get(Fn);return typeof t=="number"&&Number.isFinite(t)?t:null},Kn=(e,t)=>e.storage.set(Fn,t);var Wn=(e,t)=>t.sessionId===null?null:t.worktree?{directory:t.worktree.directory,branch:t.worktree.branch}:typeof e=="object"&&e.kind==="existing"?{directory:e.directory,branch:null}:null;var es="kanban-board",ts=e=>`https://kanban.local/tasks/${e}`,zn=e=>{let t={providerId:es,id:e.id,title:$n(e),url:ts(e.id),worktree:e.worktree?{kind:"existing",directory:e.worktree.directory}:!1,navigation:"preserve"};return e.projectId&&(t.projectId=e.projectId),t},qn=(e,t)=>({sessionId:t.sessionId,worktree:Wn(e.worktree??!1,t)}),Yn=e=>e.description.trim()||e.title;var Jn=10*6e4,os=60,ns=(e,t,o=le)=>t?De(e.status,t.activity,t.outcome,t.agent,o)??e.status:e.status,rs=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,Qn=(e,t)=>e.needsAttentionSince??t.updatedAt,Zn=(e,t,o,r=Jn)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-Qn(e,t)<r?null:e.needsAttentionSince!==null&&t.unread!==!1?"hint":"quiet",ss=(e,t,o,r=Jn)=>{if(!t||Zn(e,t,o,r)===null)return null;let i=Math.floor((o-Qn(e,t))/6e4);return i>0&&i<os?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var is=(e,t,o=le,r=Date.now())=>{let i=rs(e,t),a=ns(e,i,o),d=a!==e.status,p=e.needsAttentionSince!==null&&i?.unread!==!1,v=p||d&&a==="review"&&i?.unread!==!1,C=Zn(e,i,r);return{task:e,displayStatus:a,movedByAgent:d,attention:v,attentionSince:p?e.needsAttentionSince:v&&i?i.updatedAt:null,live:i,looksDone:C,looksDoneNote:C?ss(e,i,r):null}},as=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||So(e.task,t.task),er=(e,t,o,r=le,i=Date.now())=>{let a=Object.fromEntries(ge.map(d=>[d,[]]));for(let d of e){if(!dt(d,o))continue;let p=is(d,t,r,i);a[p.displayStatus].push(p)}for(let d of ge)a[d].sort((p,v)=>d==="review"?as(p,v):So(p.task,v.task));return a},tr=e=>Object.values(e).reduce((t,o)=>t+o.filter(r=>r.attention&&r.displayStatus!=="done").length,0),or=e=>Object.values(e).reduce((t,o)=>t+o.filter(r=>r.displayStatus!=="done").length,0),nr=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},rr=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var sr=(e,t,o)=>{let r=o.sessions.find(i=>i.id===e);if(r)return r.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(a=>a.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var ir=(e,t,o,r,i={})=>{let a=i.onLiveChange,d=i.onSnapshot??(()=>{}),p=new Map,v=new Map,C=new Map,P=new Map,M=!1,I=(u,_)=>{if(_.state==="loading")return!1;let A=0;for(let[x,G]of C)G.projectId===u&&(C.delete(x),A+=1);if(_.state!=="ready")return A>0;for(let x of _.sessions)x.parentId===null&&C.set(x.id,{projectId:u,activity:x.activity,outcome:x.outcome,agent:x.agent??null,updatedAt:x.updatedAt,unread:x.unread??null,title:x.title});return!0},l=(u,_)=>{if(M)return;I(u,_)&&a&&a(),d();for(let x of _.sessions)P.set(x.id,x.directory);if(o)for(let x of v.values()){if(x.projectId!==u||!x.sessionId)continue;let G=sr(x.sessionId,P.get(x.sessionId)??null,_);if(r&&(G==="deleted"||G==="archived")){r(x.id,x.sessionId,G);continue}let z=_.sessions.find(H=>H.id===x.sessionId);if(!z)continue;let ne=De(x.status,z.activity,z.outcome,z.agent??null,t);ne&&o(x.id,ne)}},E=u=>{let _=e.onSessions(u,A=>l(u,A));p.set(u,_),_.then(A=>{(M||!p.has(u))&&A()},()=>{})};return{live:()=>C,sync:u=>{if(M)return;v=new Map(u.map(A=>[A.id,A]));let _=new Set(u.filter(A=>A.sessionId&&A.projectId).map(A=>A.projectId));for(let A of _)p.has(A)||E(A);for(let[A,x]of p)if(!_.has(A)){p.delete(A);for(let[G,z]of C)z.projectId===A&&C.delete(G);x.then(G=>G(),()=>{})}},dispose:()=>{M=!0;for(let u of p.values())u.then(_=>_(),()=>{});p.clear()}}};var ar=(e,t,o,r=le)=>{let i=!1,a=new Map,d=(P,M)=>{if(i)return;let I=t();for(let l of M.sessions){if(!Dn(l,I))continue;let E=Gn(l,r);E&&o({projectId:P,session:{id:l.id,title:l.title,createdAt:l.createdAt},status:E})}},p=P=>{if(a.has(P))return;let M=e.onSessions(P,I=>d(P,I));a.set(P,M),M.then(I=>{(i||!a.has(P))&&I()},()=>{})},v=e.onProjects(P=>{if(i)return;let M=new Set(P.projects.map(I=>I.id));for(let I of M)p(I);for(let[I,l]of a)M.has(I)||(a.delete(I),l.then(E=>E(),()=>{}))});return{dispose:()=>{i=!0,v.then(P=>P(),()=>{});for(let P of a.values())P.then(M=>M(),()=>{});a.clear()}}};var cr=(e,t)=>{if(!t)return null;let o=e.find(r=>r.directory===t);return o||(e.filter(r=>t.startsWith(`${r.directory}/`)).sort((r,i)=>i.directory.length-r.directory.length)[0]??null)},ue=e=>{if(e instanceof g)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var dr=(e,t,{settledMs:o=700,onLost:r}={})=>{let i=null;e.prompt({text:t}).then(()=>{i=!0},()=>{i=!1}),setTimeout(()=>{e.prompt({text:t}).catch(()=>{i===!1&&r?.()})},o)};var w=(e,t="",o="")=>{let r=document.createElement(e);return t&&(r.className=t),o&&(r.textContent=o),r};var ut="http://www.w3.org/2000/svg",cs={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},pr=e=>{let t=document.createElementNS(ut,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},ds=()=>pr(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(ut,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let r=document.createElementNS(ut,"path");r.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,r)}),ls=()=>pr(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(ut,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),ho=e=>{let t=w("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},lr=()=>{let e=w("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},ps={running:ds,"waiting-question":()=>ho("?"),"waiting-permission":ls,failed:()=>ho("!"),finished:()=>ho("\u2713"),idle:lr,linked:lr},ur=e=>{let t=w("span","kb-agent-pill"),o=cs[e.key];return o&&(t.dataset.tone=o),t.append(ps[e.key]()),t.append(w("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var Er=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var fr="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",_r="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",us=`${_r} M9.25 5.75h1.5v6.5H9.25z M6.75 8.25h6.5v1.5H6.75z`,Es="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",fs=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("fill-rule","evenodd"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},Et=(e,t,o,r={})=>{let i=w("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),r.primary&&(i.dataset.primary="true"),r.hint&&(i.dataset.hint="true"),r.quiet&&(i.dataset.quiet="true"),r.info&&(i.dataset.info="true"),i.append(fs(e)),i.addEventListener("click",a=>{a.stopPropagation(),o()}),i},_s=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...ge.filter(r=>r!==e.displayStatus).map(r=>({id:`move:${r}`,label:`Move to ${be[r]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},Sr=(e,t,o)=>{let r=t==="rail",i=w("div",r?"kb-panel-sections":"kb-columns");e.append(i);let a=[],d=null,p=(l,E)=>[...l.querySelectorAll(".kb-draggable-item")].filter(h=>h.dataset.id!==E).map(h=>({id:h.dataset.id??"",top:h.getBoundingClientRect().top,height:h.getBoundingClientRect().height})),v=(l,E,h,V)=>{l.addEventListener("dragover",u=>{d&&(u.preventDefault(),l.classList.add("kb-dragover"))}),l.addEventListener("dragleave",u=>{u.target===l&&l.classList.remove("kb-dragover")}),l.addEventListener("drop",u=>{u.preventDefault(),l.classList.remove("kb-dragover");let _=d??u.dataTransfer?.getData("text/plain")??null;if(d=null,!_)return;if(r&&u.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(_,h);return}let A=Er(p(E,_),u.clientY);V(_,h,A)})},C=l=>{let{task:E}=l,h=w("div",l.attention?"kb-item kb-attn":"kb-item");r?h.classList.add("kb-panel-row"):h.classList.add("kb-card");let V=o.onDrop!==void 0;V?(h.classList.add("kb-draggable-item"),h.draggable=!0):h.draggable=!1,h.dataset.id=E.id;let u=o.isSelected?.(E)??!1;u&&(h.dataset.selected="true");let _=w("div","kb-panel-main");h.append(_);let A=w("div","kb-item-top");if(o.onToggleSelect){let H=o.onToggleSelect,D=document.createElement("input");D.type="checkbox",D.className="kb-check",D.checked=u;let Z=u?"Deselect":"Select";D.title=`${Z} "${E.title}"`,D.setAttribute("aria-label",`${Z} task: ${E.title}`),D.addEventListener("click",ee=>ee.stopPropagation()),D.addEventListener("change",()=>H(E)),A.append(D)}A.append(w("div","kb-panel-title",E.title)),_.append(A);let x=o.projectName(E),G=w("div","kb-panel-sub");x&&G.append(w("span","kb-panel-project",x));let z=l.live?rr(l.live):E.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(z&&G.append(ur(z)),_.append(G),r&&o.onChat&&(E.sessionId||E.projectId&&l.displayStatus!=="done")){let H=o.onChat;A.append(Et(E.sessionId?_r:us,E.sessionId?"Open chat":"New chat",()=>H(E),E.sessionId&&l.attention?{primary:!0}:{}))}if(r&&l.displayStatus!=="done"&&o.onMarkDone){let H=o.onMarkDone;A.append(Et(fr,"Mark done",()=>H(E),{info:!0}))}let ne=_s(l,o);if(!r&&l.looksDone&&o.onLooksDone){let H=o.onLooksDone;A.append(Et(fr,l.looksDoneNote??"Looks done \u2014 click to mark Done",()=>H(E),l.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(ne){let H=w("span","kb-panel-menu");A.append(H),a.push(ao(H,{label:"\u22EF",variant:"ghost",size:"xs",items:ne,onSelect:D=>{if(D==="delete"&&o.onDelete){o.onDelete(E);return}if(D==="edit"&&o.onEdit){o.onEdit(E);return}if(D.startsWith("move:")){let Z=D.slice(5);ge.includes(Z)&&o.onMoveStatus&&o.onMoveStatus(E,Z)}}}))}if(o.onActivate){let H=()=>o.onActivate(E);h.addEventListener("click",D=>{if(!D.target?.closest(".kb-panel-menu")){if(o.onToggleSelect&&(D.metaKey||D.ctrlKey)){o.onToggleSelect(E);return}H()}}),h.tabIndex=0,h.addEventListener("keydown",D=>{(D.key==="Enter"||D.key===" ")&&(D.preventDefault(),H())})}return V&&(h.addEventListener("dragstart",H=>{d=E.id,h.classList.add("kb-dragging"),H.dataTransfer?.setData("text/plain",E.id),H.dataTransfer&&(H.dataTransfer.effectAllowed="move")}),h.addEventListener("dragend",()=>{d=null,h.classList.remove("kb-dragging")})),h},P=(l,E)=>{let h=w("div","kb-column");h.dataset.status=l;let V=w("div","kb-column-head"),u=w("span","kb-column-count",String(E.length));E.some(x=>x.attention&&x.displayStatus!=="done")&&(u.dataset.attn="true");let _=w("span","kb-column-tools");if(_.append(u),o.onEmptyColumn){let x=o.onEmptyColumn,G=o.isColumnEmptyArmed?.(l)??!1,z=Et(Es,G?`Click again to empty ${be[l]}`:`Empty ${be[l]}`,()=>x(l));G&&(z.dataset.armed="true"),_.append(z)}V.append(w("span","kb-column-title",be[l]),_);let A=w("div","kb-column-body");h.append(V,A),E.length===0&&A.append(w("div","kb-column-empty","No tasks"));for(let x of E)A.append(C(x));return o.onDrop&&v(h,A,l,o.onDrop),h},M=(l,E)=>{let h=w("div","kb-psec");h.dataset.status=l;let V=o.onToggleSection!==void 0,u=V&&(o.isCollapsed?.(l)??!1),_=V?document.createElement("button"):w("div","kb-psec-head");_.className="kb-psec-head",_ instanceof HTMLButtonElement&&(_.type="button"),_.append(w("span","kb-psec-name",be[l]));let A=w("span","kb-psec-count","0");E.some(G=>G.attention&&G.displayStatus!=="done")&&(A.dataset.attn="true"),_.append(A),V&&(_.append(w("span","kb-psec-chevron",u?"\u25B8":"\u25BE")),_.addEventListener("click",()=>o.onToggleSection?.(l)));let x=w("div","kb-psec-body");if(x.hidden=u,h.append(_,x),!u){E.length===0&&x.append(w("div","kb-panel-empty","No tasks"));for(let G of E)x.append(C(G))}return o.onDrop&&v(h,x,l,o.onDrop),h};return{render:l=>{for(let E of a.splice(0))E.dispose();i.replaceChildren();for(let E of ge)i.append(r?M(E,l[E]):P(E,l[E]))},dispose:()=>{for(let l of a.splice(0))l.dispose();i.replaceChildren()}}};var Ss=`
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
`,Tr=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=Ss,document.head.append(e)};var mr=(e,t,o)=>{Tr(),t.replaceChildren();let r=!1,i=[],a=[],d=o?.directory??null,p=null,v,C,P=!1,M=!1,I=null,l,E,h,V,u=(b,f)=>b.filter(R=>dt(R,{projectId:f??ct})),_=b=>{i=[...b];let f=u(i,p?.id??null);A.sync(f),x.sync(f)},A=ir(e,le,null,void 0,{onLiveChange:()=>{M&&!r&&(x.evaluate(),U())},onSnapshot:()=>{Ve()}}),x=Bn(e,()=>A.live(),b=>b===null?null:a.find(f=>f.id===b)?.name??null,{onPromoted:b=>{_(i.map(f=>f.id===b.id?b:f)),M&&U()},onStale:b=>{let f=i.find(R=>R.id===b.id);!f||f.title===b.title||(_(i.map(R=>R.id===b.id?b:R)),M&&U())}}),G=new Set,z=()=>new Set([...G,...i.flatMap(b=>b.sessionId?[b.sessionId]:[])]),ne=new Set,H=0,D=1/0,Z=null,ee=(b,f,R)=>{p&&b!==p.id||r||H>0||ne.has(f.id)||z().has(f.id)||f.createdAt<D||(ne.add(f.id),(async()=>{try{let k=await Xn(e,{projectId:b,session:f,status:R,projectName:a.find(pe=>pe.id===b)?.name??null});if(k===null||r)return;_(i.filter(pe=>pe.id!==k.task.id).concat(k.task)),M&&U(),k.adopted&&e.toast({kind:"info",message:`Added "${k.task.title}" to the board (${be[R]}) \u2014 found a session running with no task.`}).catch(()=>{})}catch(k){e.toast({kind:"error",message:`Could not add the task for a found session \u2014 ${ue(k)}`}).catch(()=>{})}})())},O=()=>{p=cr(a,d)},T=w("div","kb-page kb-rail"),re=w("div","kb-row between");re.append(w("h2","","Kanban"));let Se=w("span");re.append(Se),T.append(re),E=w("p","kb-muted","Loading\u2026"),T.append(E),h=w("p","kb-rail-scope"),T.append(h),V=w("p","kb-panel-unseen"),T.append(V),I=Sr(T,"rail",{projectName:b=>!p&&b.projectId?a.find(f=>f.id===b.projectId)?.name??null:null,onMarkDone:async b=>{let f=i.find(k=>k.id===b.id)??b,R=Pn(f,"done");if(R){try{await xe(e,R)}catch(k){e.toast({kind:"error",message:`Could not mark "${f.title}" done \u2014 ${ue(k)}`}).catch(()=>{}),q();return}_(i.map(k=>k.id===f.id?R:k)),U()}},onChat:async b=>{let f=i.find(Y=>Y.id===b.id)??b;if(f.sessionId){if(f.needsAttentionSince!==null){let Y=ke(f,{needsAttentionSince:null});try{await _o(e,Y),_(i.map(me=>me.id===f.id?Y:me)),U()}catch(me){e.toast({kind:"error",message:`Opened the chat, but marking "${f.title}" reviewed failed \u2014 ${ue(me)}`}).catch(()=>{})}}try{await e.openSession(f.sessionId)}catch(Y){e.toast({kind:"error",message:`Could not open the chat of "${f.title}" \u2014 ${ue(Y)}`}).catch(()=>{})}return}if(!f.projectId)return;let R=zn(f);H+=1;let k;try{k=await e.startSession(R),k.sessionId!==null&&ne.add(k.sessionId)}catch(Y){e.toast({kind:"error",message:`Could not start the chat for "${f.title}" \u2014 ${ue(Y)}`}).catch(()=>{});return}finally{H-=1}if(k.sessionId===null){e.toast({kind:"error",message:`Could not start the chat (${k.failure}). Its worktree at ${k.directory} was kept so you can recover it by hand.`}).catch(()=>{});return}let pe=ke(f,qn(R,k));try{await _o(e,pe)}catch(Y){e.toast({kind:"error",message:`Started a chat for "${f.title}", but the link could not be saved \u2014 ${ue(Y)}. Open the full board to link it.`}).catch(()=>{}),q();return}_(i.map(Y=>Y.id===f.id?pe:Y)),U();try{await e.openSession(k.sessionId)}catch(Y){e.toast({kind:"error",message:`Started the chat, but it could not be opened \u2014 ${ue(Y)}.`}).catch(()=>{});return}dr(e,Yn(f),{onLost:()=>{e.toast({kind:"info",message:`The chat was created but its composer wasn't filled \u2014 the description is still on the card "${f.title}".`}).catch(()=>{})}})}});let Te=w("div","kb-rail-foot");Te.append(w("p","kb-muted","Two quick actions live here \u2014 the \u2713 marks a task Done, and the chat button opens the linked chat of a card (starting one attached to it when there is none). Everything else (open, move, edit, delete) is the full board, one click away: pull this panel wider, or the Extension pages menu.")),T.append(Te),t.append(T),l=io(Se,{label:"",tone:"neutral"}),v=window.setInterval(()=>{q()},3e4);let Ge=null;e.onProjects(b=>{r||b.state!=="ready"||(a=b.projects,O(),_(i),M&&U())}).then(b=>{r?b():Ge=b},()=>{});let te=e.onDirectory(b=>{r||(d=b,O(),_(i),M&&U())}),Xe=async()=>{try{let[b,f,R]=await Promise.all([Ae(e),jn(e),mo(e)]);if(r)return;_(b.tasks),G=R,f===null?(D=Date.now(),Kn(e,D).catch(()=>{})):D=f,M=!0,E.hidden=!0,U(),Z=ar(e,z,k=>ee(k.projectId,k.session,k.status))}catch(b){E.textContent=`Could not load tasks \u2014 ${ue(b)}`}},q=async()=>{if(!(r||P)){P=!0;try{let[{tasks:b},f]=await Promise.all([Ae(e),mo(e)]);if(r)return;G=f,_(b),M||(M=!0,E.hidden=!0),U()}catch(b){M||(E.textContent=`Could not load tasks \u2014 ${ue(b)}`)}finally{P=!1}}},Ve=()=>{C!==void 0||r||(C=window.setTimeout(()=>{C=void 0,q()},500))},U=()=>{let b=er(i,A.live(),{projectId:p?.id??ct}),f=or(b),R=tr(b);p?(h.textContent=`Project: ${p.name}`,h.hidden=!1):h.hidden=!0;let k=nr(f,R);l.update({label:k.label,tone:k.tone}),R>0?(V.textContent=`${R} task${R===1?"":"s"} need${R===1?"s":""} your review`,V.hidden=!1):V.hidden=!0,I?.render(b)};return Xe(),{dispose:()=>{r||(r=!0,v!==void 0&&window.clearInterval(v),C!==void 0&&window.clearTimeout(C),Ge?.(),te(),Z?.dispose(),A.dispose(),x.dispose(),I?.dispose())}}};var go=jt(),hr=document.querySelector("#root");if(!hr)throw new Error("Missing #root");var bo=null;go.onReady(e=>{Kt(e,document.documentElement),!bo&&(bo=mr(go,hr,{directory:e.directory}))});window.addEventListener("pagehide",()=>{bo?.dispose(),go.dispose()});})();
