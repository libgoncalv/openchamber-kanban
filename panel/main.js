"use strict";(()=>{var R="openchamber.sdk";var $e="data-oc-scrolling",ct=`
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
:hover, [${$e}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${$e}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${$e}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${$e}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function dt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?t:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let c=o.get(i);c!==void 0&&clearTimeout(c),o.set(i,setTimeout(()=>{o.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var on=`(${dt.toString()})(document);`;var ho=e=>{let t=[],o=0,s=0;return{push:i=>{for(t.push(i),s+=i.length;s-o>e&&t.length>1;){let c=t.shift();s-=c?.length??0,o=0}},pull:i=>{let c=0;for(;c<i.length&&t.length>0;){let l=t[0],S=Math.min(i.length-c,l.length-o);i.set(l.subarray(o,o+S),c),c+=S,o+=S,o>=l.length&&(t.shift(),s-=l.length,o=0)}i.fill(0,c)},clear:()=>{t.length=0,o=0,s=0},get size(){return s-o}}};var Ao=/^[a-z][a-z0-9-]{0,39}$/;var bo=e=>Object(e)===e&&!Array.isArray(e),lt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),go=e=>String(e)===e&&e.length>=1&&e.length<=60,ko=e=>String(e)===e&&e.length>=1&&e.length<=80,xo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!bo(o)||!Ao.test(o.id)||!go(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!lt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!lt(o,["kind","id","label","value","options","disabled"])||!ko(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let s=new Set;for(let i of o.options){if(!bo(i)||!lt(i,["value","label"])||!ko(i.value)||!go(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(o.value))return!1}return!0};var nn=1024*1024;var Oo=["{id}","{segment}","{segments+}"];var ns=new Set(Oo);var Ro=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var is=new Set(Ro);var pt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,yo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var vo=/^[A-Za-z0-9_-]{1,80}$/;var Io=["left","right","top","bottom"];var wo=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!wo(i,t+1,o))return!1;return!0},ut=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(ut);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(ut)}return String(e)===e||Number.isFinite(e)},Et=e=>{try{return String(e.id)!==e.id||!vo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Io.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!wo(e.data)||!ut(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var ft=2e3;var Mo=["file","directory","other","missing"],St=e=>!!(e&&"sessionId"in e),Tt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Uo=/^[0-9a-f]{7,64}$/i,mt=e=>Uo.test(e),Xe=500,Ve=32e3,No=16e3,Lo=128,Po=200,Do=2e3,Go=16e3,Ho=80,$o=200,Xo=16e3;var Vo=2e3;var ht=2e4,Be=1024,Fe=2e6;var Ke=64e3,We=8e3,bt=4e3;var gt=96e4,sn=60*6e4;var Bo=999,Fo=1e4,Ue=500,Ko=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Wo=["stopped","starting","ready","failed"],an=new Set(Ko),jo=e=>an.has(e),zo=e=>e&&jo(e)?e:"HOST_REJECTED",ke=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(ke):Object(e)===e?Object.values(e).every(ke):!1,qo=e=>ke(e)&&JSON.stringify(e).length<=Xo,Co=e=>e?.trim().slice(0,$o)??"",Ae=e=>{let t=e.id.trim().slice(0,Lo),o=e.title.trim().slice(0,Po),s=e.url.trim().slice(0,Do),i=e.text?.trim().slice(0,Go),c=e.author?.trim().slice(0,Ho),l=e.kind==="pull"?"pull":"issue",S={providerId:e.providerId.trim(),id:t,title:o||t,url:s,kind:l};if(i&&(S.text=i),c&&(S.author=c),l==="pull"){let I=Co(e.branches?.head),w=Co(e.branches?.base);I&&w&&(S.branches={head:I,base:w})}return qo(e.data)&&(S.data=e.data),S},kt=e=>{let t=Ae(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},At=e=>{let t={text:e.text.trim().slice(0,No)};return e.send&&(t.send=!0),t},xt=e=>e===null||!Number.isFinite(e)?null:Math.min(Bo,Math.max(0,Math.round(e))),Ot=e=>Number.isFinite(e)?Math.min(Fo,Math.max(0,Math.ceil(e))):0;var xe=e=>e.length>0&&e.length<=Be&&!e.includes("\0")&&!e.includes("\\");var je=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Vo?!1:!e.split("/").some(o=>o==="."||o===".."),cn=new Set(Wo),Rt=e=>!!(e&&"status"in e&&cn.has(String(e.status))&&!("body"in e)),ze=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),yt=e=>!!(e&&"content"in e&&String(e.content)===e.content),vt=e=>!!(e&&"written"in e&&e.written===!0),It=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),dn=new Set(Mo),wt=e=>!!(e&&"kind"in e&&"size"in e&&dn.has(String(e.kind))&&Number.isFinite(e.size)),Ct=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),ln=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late","microphone-audio","microphone-ended"]),pn=e=>Object(e)===e?e:null,_t=e=>String(e)===e&&e.length>0,un=e=>{if(!_t(e.id))return null;if(e.ok===!0){let t={channel:R,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&_t(e.error)?{channel:R,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:zo(_t(e.code)?e.code:void 0)}:null},Mt=e=>{let t=pn(e);return!t||t.channel!==R||t.v!==1?null:t.type==="result"?un(t):!ln.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var Yo=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,En=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",f=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},Jo=()=>Promise.reject(new f("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),qe=()=>Promise.reject(new f("BAD_PATH",`File path must be 1 to ${Be} characters without NUL or backslash.`)),Ye=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new f("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},A=e=>(e.value+=1,`oc-${e.value}`),Dt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new f("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(r=>r===t.parent),s=e.requestTimeoutMs??ht,i=new Set,c=new Set,l=new Set,S=new Set,I=new Set,w=new Set,q=new Set,B=new Set,Y=new Set,T=new Set,p=new Set,m=new Set,G=[],d=null,E=null,g=new Set,k=new Set,y=null,j=null,ie=!1,L=new Map,C=new Map,re=new Map,oe=!1,b={value:0},h=null,J=null,O=!1,M=!1,ee=null,U=null,Me=r=>r?{sessionId:r.id,phase:r.busy?"started":"completed"}:null,N=r=>{t.parent.postMessage(r,"*")},me=()=>{oe||t.parent===t||m.size===0||h?.features?.lateGenerateResults!==!0||N({channel:R,v:1,type:"generate-late-listen"})},H=(r,n)=>{for(let _ of r)try{_(n)}catch(u){console.error(u)}},lo=r=>{if(!(r instanceof MessageEvent)||!o(r.source))return;let n=Mt(r.data);if(!n)return;if(n.type==="workspace"){let u=C.get(n.payload.subscriptionId);u&&H([u],n.payload.snapshot);return}if(n.type==="shells"){let u=re.get(n.payload.subscriptionId);u&&H([u],n.payload.snapshot);return}if(n.type==="microphone-audio"){U?.queue.push(n.payload.samples);return}if(n.type==="microphone-ended"){let u=U;if(!u)return;U=null,u.release(),H(u.endedListeners,n.payload.reason);return}if(n.type==="ready"){h=n.payload,J=Me(n.payload.session),H(i,n.payload),H(c,n.payload.directory),H(l,n.payload.session),J&&H(S,J),H(I,n.payload.connection),H(w,n.payload.settings),H(q,n.payload.item),n.payload.block&&H(B,n.payload.block),me();return}if(n.type==="service-event"){H(Y,n.payload);return}if(n.type==="generate-late"){m.size===0?G.push(n.payload):H(m,n.payload);return}if(n.type==="directory"){h&&(h={...h,directory:n.payload.directory}),H(c,n.payload.directory);return}if(n.type==="session"){h&&(h={...h,session:n.payload.session}),n.payload.session?J?.sessionId!==n.payload.session.id&&(J=Me(n.payload.session)):J=null,H(l,n.payload.session);return}if(n.type==="session-lifecycle"){J=n.payload,H(S,n.payload);return}if(n.type==="connection"){h&&(h={...h,connection:n.payload.connection}),H(I,n.payload.connection);return}if(n.type==="settings"){h&&(h={...h,settings:n.payload.settings}),H(w,n.payload.settings);return}if(n.type==="item"){h&&(h={...h,item:n.payload.item}),H(q,n.payload.item);return}if(n.type==="status-control-event"){H(T,n.payload);return}if(n.type==="popover-closed"){H(p,n.payload);return}if(n.type==="action"){let u=D=>{oe||N({channel:R,v:1,type:"action-result",id:n.id,payload:D})},P=E;if(!P){u({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>P(n.payload)).then(()=>u({ok:!0}),D=>{let $=(D instanceof Error?D.message:String(D)).trim();u({ok:!1,error:($||"Action failed.").slice(0,Ue)})});return}if(n.type==="file-open"){let u=n.payload;if(j&&yo(j,u))return;j=u,H(g,n.payload);return}if(n.type==="file-saved"){H(k,n.payload.version);return}if(n.type==="file-snapshot"){let u=$=>{oe||N({channel:R,v:1,type:"file-snapshot-result",id:n.id,payload:$})},P=$=>u({error:($.trim()||"Could not read the edited file.").slice(0,Ue)}),D=y;if(!D){P("This extension does not edit files.");return}Promise.resolve().then(()=>D(n.payload.purpose)).then($=>{if(pt($)>2e7){P(`The file is over ${2e7} ${"bytes"in $?"bytes":"characters"}.`);return}if($.version.length>256){P(`The snapshot version is over ${256} characters.`);return}u({snapshot:"bytes"in $?{bytes:$.bytes,version:$.version}:{content:$.content,version:$.version}})},$=>P($ instanceof Error?$.message:String($)));return}if(n.type==="resolve"){let u=D=>{N({channel:R,v:1,type:"resolve-result",id:n.id,payload:D})},P=d;if(!P){u({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>P(n.payload)).then(D=>u({item:D?Ae(D):null}),D=>{let $=(D instanceof Error?D.message:String(D)).trim();u({error:($||"Command failed.").slice(0,Ue)})});return}let _=L.get(n.id);if(_){if(clearTimeout(_.timer),L.delete(n.id),n.ok){_.resolve(n.payload);return}_.reject(new f(n.code,n.error))}};t.addEventListener("message",lo),N({channel:R,v:1,type:"hello"});let te=(r,n=s)=>oe||t.parent===t?Promise.reject(new f("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((_,u)=>{let P=setTimeout(()=>{L.delete(r.id),u(new f("HOST_TIMEOUT","Host did not answer in time."))},n);L.set(r.id,{resolve:_,reject:u,timer:P}),N(r)}),z=r=>te(r).then(()=>{}),F={channel:R,v:1},nt=r=>{!oe&&t.parent!==t&&N(r)},po=()=>nt({...F,type:"file-save"}),st=()=>{!oe&&t.parent!==t&&N({...F,type:"microphone-close",id:A(b)})},en=async()=>{if(U)throw new f("HOST_REJECTED","The microphone is already open in this frame.");if(h?.features?.microphone!==!0)throw new f("UNSUPPORTED","This OpenChamber cannot share the microphone with extensions.");let r=globalThis.AudioContext;if(typeof r!="function")throw new f("UNSUPPORTED","This frame has no Web Audio.");let n=new r;if(n.sampleRate<8e3||n.sampleRate>192e3)throw n.close().catch(()=>{}),new f("UNSUPPORTED",`Audio at ${n.sampleRate} Hz is not supported.`);let _=n.state==="suspended"?n.resume().catch(()=>{}):void 0,u=ho(Math.round(n.sampleRate/4)),P=n.createScriptProcessor(1024,1,1);P.onaudioprocess=ae=>u.pull(ae.outputBuffer.getChannelData(0));let D=n.createMediaStreamDestination();P.connect(D);let $=new Set,ge={queue:u,endedListeners:$,release:()=>{P.onaudioprocess=null,P.disconnect(),u.clear();for(let ae of D.stream.getTracks())ae.stop();n.close().catch(()=>{})}};U=ge;try{let ae=await te({...F,type:"microphone-open",id:A(b),payload:{sampleRate:n.sampleRate}},12e4);if(!ae||!("opened"in ae)||ae.opened!==!0)throw new f("HOST_REJECTED","Host did not open the microphone.");if(await _,U!==ge)throw new f("DISCONNECTED","The microphone closed while it was opening.")}catch(ae){throw U===ge&&(U=null),ge.release(),st(),ae}return{stream:D.stream,close:()=>{U===ge&&(U=null,ge.release(),st())},onEnded:ae=>($.add(ae),()=>{$.delete(ae)})}},uo=r=>{!Yo(r)||!En(r)||(r.preventDefault(),po())},Eo=r=>{!Yo(r)||r.key!=="Escape"||h?.surface!=="popover"||!h.popover||(r.preventDefault(),To(h.popover.id,"escape").catch(()=>{}))},De=()=>{let r=h?.surface==="popover"?h.popover:void 0;if(!r)return;let n=O||M;ee!==n&&(ee=n,mo(r.id,n).catch(()=>{}))},Ge=()=>{h?.surface!=="popover"||O||(O=!0,De())},_o=r=>{h?.surface!=="popover"||r.relatedTarget!==null||!O||(O=!1,De())},fo=()=>{h?.surface!=="popover"||M||(M=!0,De())},So=()=>{h?.surface!=="popover"||!M||(M=!1,De())},de=(r,n=1024)=>{if(!r.trim()||r.length>n)throw new f("HOST_REJECTED",`Identity must contain 1 to ${n} characters.`)},it=async r=>{r.kind!=="projects"&&de(r.projectId);let n=await te({...F,type:"workspace-read",id:A(b),payload:r});if(!n||!("kind"in n)||!("state"in n)||n.kind!==r.kind)throw new f("HOST_REJECTED","Host did not return workspace data.");return n},at=async(r,n)=>{r.kind!=="projects"&&de(r.projectId);let _=A(b);C.set(_,n);try{await z({...F,type:"workspace-subscribe",id:A(b),payload:{subscriptionId:_,query:r}})}catch(u){throw C.delete(_),oe||N({...F,type:"workspace-unsubscribe",id:A(b),payload:{subscriptionId:_}}),u}return()=>{!C.delete(_)||oe||N({...F,type:"workspace-unsubscribe",id:A(b),payload:{subscriptionId:_}})}},tn=async(r,n)=>{r.kind==="session"&&de(r.sessionId),r.kind==="project"&&de(r.projectId);let _=A(b);re.set(_,n);try{await z({...F,type:"shells-subscribe",id:A(b),payload:{subscriptionId:_,scope:r}})}catch(u){throw re.delete(_),oe||N({...F,type:"shells-unsubscribe",id:A(b),payload:{subscriptionId:_}}),u}return()=>{!re.delete(_)||oe||N({...F,type:"shells-unsubscribe",id:A(b),payload:{subscriptionId:_}})}},He=async r=>{if("key"in r&&(r.key.length===0||r.key.length>128))throw new f("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(r.op==="set"&&!ke(r.value))throw new f("HOST_REJECTED","Storage values must be JSON.");if(r.op==="set"&&new TextEncoder().encode(JSON.stringify(r.value)).length>65536)throw new f("HOST_REJECTED","Storage value exceeds 64 KiB.");if(r.scope==="device"&&h?.features?.deviceStorage!==!0)throw new f("UNSUPPORTED","This host does not support device storage.");let n=await te({...F,type:"storage",id:A(b),payload:r});if(!n||!("storage"in n)||n.op!==r.op)throw new f("HOST_REJECTED","Host did not return storage data.");return n},To=(r,n)=>h?.features?.popovers!==!0&&!(h?.surface==="popover"&&h.popover?.id===r)?Promise.reject(new f("UNSUPPORTED","This host does not support popovers.")):z({...F,type:"popover-close",id:A(b),payload:n?{id:r,reason:n}:{id:r}}),mo=(r,n)=>h?.features?.popovers!==!0&&!(h?.surface==="popover"&&h.popover?.id===r)?Promise.reject(new f("UNSUPPORTED","This host does not support popovers.")):z({...F,type:"popover-anchor",id:A(b),payload:{id:r,active:n}});return t.addEventListener("keydown",Eo,!0),t.addEventListener("pointerover",Ge),t.addEventListener("pointermove",Ge),t.addEventListener("pointerout",_o),t.addEventListener("focus",fo),t.addEventListener("blur",So),{onAction:r=>(E=r,()=>{E===r&&(E=null)}),listProjects:async()=>{let r=await it({kind:"projects"});if(r.kind!=="projects")throw new f("HOST_REJECTED","Expected projects.");return r},listWorktrees:async r=>{let n=await it({kind:"worktrees",projectId:r});if(n.kind!=="worktrees")throw new f("HOST_REJECTED","Expected worktrees.");return n},listSessions:async r=>{let n=await it({kind:"sessions",projectId:r});if(n.kind!=="sessions")throw new f("HOST_REJECTED","Expected sessions.");return n},onProjects:r=>at({kind:"projects"},n=>{n.kind==="projects"&&r(n)}),onWorktrees:(r,n)=>at({kind:"worktrees",projectId:r},_=>{_.kind==="worktrees"&&n(_)}),onSessions:(r,n)=>at({kind:"sessions",projectId:r},_=>{_.kind==="sessions"&&n(_)}),onRunningShells:(r,n)=>tn(r,n),readShellOutput:async(r,n)=>{de(r,128);let _=n?.cursor;if(_!==void 0&&(!Number.isInteger(_)||_<0))throw new f("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let u=n?.tailBytes;if(u!==void 0&&(!Number.isInteger(u)||u<1||u>65536))throw new f("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let D=await te({...F,type:"shell-output",id:A(b),payload:{shellId:r,cursor:_,tailBytes:u}});if(!D||typeof D.output!="string"||!Number.isFinite(D.cursor))throw new f("HOST_REJECTED","Host did not return shell output.");return D},stopShell:async r=>{if(de(r,128),(await te({...F,type:"shell-stop",id:A(b),payload:{shellId:r}}))?.stopped!==!0)throw new f("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async r=>{de(r),await z({...F,type:"open-session",id:A(b),payload:{sessionId:r}})},storage:{get:async(r,n)=>{let _=Ye(n),u={op:"get",key:r};_&&(u.scope=_);let P=await He(u);return P.op==="get"&&P.found?P.value:void 0},set:async(r,n,_)=>{let u=Ye(_),P={op:"set",key:r,value:n};u&&(P.scope=u),await He(P)},delete:async(r,n)=>{let _=Ye(n),u={op:"delete",key:r};_&&(u.scope=_),await He(u)},keys:async r=>{let n=Ye(r),_={op:"keys"};n&&(_.scope=n);let u=await He(_);if(u.op!=="keys")throw new f("HOST_REJECTED","Expected storage keys.");return u.keys}},onReady:r=>(i.add(r),h&&r(h),()=>{i.delete(r)}),onDirectory:r=>(c.add(r),h&&r(h.directory),()=>{c.delete(r)}),onSession:r=>(l.add(r),h&&r(h.session),()=>{l.delete(r)}),onSessionLifecycle:r=>(S.add(r),J&&r(J),()=>{S.delete(r)}),onConnection:r=>(I.add(r),h&&r(h.connection),()=>{I.delete(r)}),onSettings:r=>(w.add(r),h&&r(h.settings),()=>{w.delete(r)}),onItem:r=>(q.add(r),h&&r(h.item),()=>{q.delete(r)}),onBlock:r=>(B.add(r),h?.block&&r(h.block),()=>{B.delete(r)}),onServiceEvent:r=>(Y.add(r),()=>{Y.delete(r)}),onStatusControl:r=>(T.add(r),()=>{T.delete(r)}),onPopoverClosed:r=>(p.add(r),()=>{p.delete(r)}),setStatusControls:r=>h?.features?.statusControls!==!0?Promise.reject(new f("UNSUPPORTED","This host does not support status controls.")):xo(r)?z({...F,type:"status-controls",id:A(b),payload:{controls:r}}):Promise.reject(new f("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:r=>h?.features?.popovers!==!0?Promise.reject(new f("UNSUPPORTED","This host does not support popovers.")):Et(r)?z({...F,type:"popover-open",id:A(b),payload:r}):Promise.reject(new f("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:To,setPopoverAnchorActive:mo,onResolve:r=>(d=r,()=>{d===r&&(d=null)}),toast:r=>{let n=r.message.trim();return!n||n.length>Xe?Promise.reject(new f("HOST_REJECTED",`Toast message must contain 1 to ${Xe} characters.`)):r.copy&&r.copy!==!0&&(!r.copy.text.length||r.copy.text.length>Ve)?Promise.reject(new f("HOST_REJECTED",`Toast copy text must contain 1 to ${Ve} characters.`)):z({channel:R,v:1,type:"toast",id:A(b),payload:{...r,message:n}})},openUrl:r=>z({channel:R,v:1,type:"open-url",id:A(b),payload:{url:r}}),openCommit:r=>mt(r)?z({channel:R,v:1,type:"open-commit",id:A(b),payload:{sha:r}}):Promise.reject(new f("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:r=>z({channel:R,v:1,type:"block-answer",id:A(b),payload:{text:r.trim().slice(0,ft)}}),openSurface:r=>z({channel:R,v:1,type:"open-surface",id:A(b),payload:{surfaceId:r}}),writeClipboard:r=>z({channel:R,v:1,type:"clipboard-write",id:A(b),payload:{text:r}}),compose:r=>z({channel:R,v:1,type:"compose",id:A(b),payload:r}),attach:r=>z({channel:R,v:1,type:"attach",id:A(b),payload:Ae(r)}),startSession:async r=>{r.projectId!==void 0&&de(r.projectId);let n=r.worktree;n&&n!==!0&&(n.kind==="existing"?de(n.directory):(n.name!==void 0&&de(n.name,200),n.baseBranch!==void 0&&de(n.baseBranch,200)));let _=await te({channel:R,v:1,type:"start-session",id:A(b),payload:kt(r)},e.requestTimeoutMs??18e4);if(!St(_))throw new f("HOST_REJECTED","Host did not return a session.");return _},prompt:r=>te({channel:R,v:1,type:"prompt",id:A(b),payload:At(r)}).then(n=>{if(!Tt(n))throw new f("HOST_REJECTED","Host did not return a prompt result.");return n}),sessionLink:r=>z({channel:R,v:1,type:"session-link",id:A(b),payload:Ae(r)}),close:()=>z({channel:R,v:1,type:"close",id:A(b)}),oauthStart:()=>z({channel:R,v:1,type:"oauth-start",id:A(b)}),oauthDisconnect:()=>z({channel:R,v:1,type:"oauth-disconnect",id:A(b)}),request:r=>(je(r.path)?te({channel:R,v:1,type:"request",id:A(b),payload:r}):Jo()).then(n=>{if(!ze(n))throw new f("HOST_REJECTED","Host request result was empty.");return n}),serviceRequest:r=>(je(r.path)?te({channel:R,v:1,type:"service-request",id:A(b),payload:r}):Jo()).then(n=>{if(!ze(n))throw new f("HOST_REJECTED","Host service request result was empty.");return n}),serviceStatus:()=>te({channel:R,v:1,type:"service-status",id:A(b)}).then(r=>{if(!Rt(r))throw new f("HOST_REJECTED","Host did not return service status.");return r}),readFile:r=>(xe(r)?te({channel:R,v:1,type:"file-read",id:A(b),payload:{path:r}}):qe()).then(n=>{if(!yt(n))throw new f("HOST_REJECTED","Host did not return file content.");return n}),writeFile:(r,n)=>xe(r)?n.length>Fe?Promise.reject(new f("FILE_TOO_LARGE",`Content is over ${Fe} characters.`)):te({channel:R,v:1,type:"file-write",id:A(b),payload:{path:r,content:n}}).then(_=>{if(!vt(_))throw new f("HOST_REJECTED","Host did not confirm the write.");return _}):qe(),listDir:r=>(xe(r)?te({channel:R,v:1,type:"file-list",id:A(b),payload:{path:r}}):qe()).then(n=>{if(!It(n))throw new f("HOST_REJECTED","Host did not return directory entries.");return n}),stat:r=>(xe(r)?te({channel:R,v:1,type:"file-stat",id:A(b),payload:{path:r}}):qe()).then(n=>{if(!wt(n))throw new f("HOST_REJECTED","Host did not return file status.");return n}),generate:r=>{let n=r.prompt.trim(),_=r.system?.trim();if(n.length===0||n.length>Ke)return Promise.reject(new f("HOST_REJECTED",`Prompt must be 1 to ${Ke} characters.`));if(_!==void 0&&(_.length===0||_.length>We))return Promise.reject(new f("HOST_REJECTED",`System prompt must be 1 to ${We} characters.`));let u=r.maxOutputTokens===void 0?void 0:Math.min(bt,Math.max(1,Math.floor(r.maxOutputTokens)));if(u!==void 0&&!Number.isFinite(u))return Promise.reject(new f("HOST_REJECTED","maxOutputTokens must be a number."));let P={prompt:n};return _!==void 0&&(P.system=_),u!==void 0&&(P.maxOutputTokens=u),te({channel:R,v:1,type:"generate",id:A(b),payload:P},e.requestTimeoutMs??gt).then(D=>{if(!Ct(D))throw new f("HOST_REJECTED","Host did not return generated text.");return D})},onLateGenerateResult:r=>{m.add(r);for(let n of G.splice(0))H([r],n);return me(),()=>{m.delete(r)}},openMicrophone:en,setBadge:r=>z({channel:R,v:1,type:"badge",id:A(b),payload:{count:xt(r)}}),setHeight:r=>z({channel:R,v:1,type:"resize",id:A(b),payload:{height:Ot(r)}}),onFileOpen:r=>(g.add(r),ie||(ie=!0,t.addEventListener("keydown",uo,!0)),j&&r(j),()=>{g.delete(r)}),onFileSnapshot:r=>(y=r,()=>{y===r&&(y=null)}),onFileSaved:r=>(k.add(r),()=>{k.delete(r)}),reportFileChange:r=>nt({...F,type:"file-change",payload:{dirty:r.dirty,edited:r.edited}}),requestFileSave:po,reportFileUnsupported:()=>nt({...F,type:"file-unsupported"}),dispose:()=>{for(let r of C.keys())N({...F,type:"workspace-unsubscribe",id:A(b),payload:{subscriptionId:r}});C.clear();for(let r of re.keys())N({...F,type:"shells-unsubscribe",id:A(b),payload:{subscriptionId:r}});re.clear(),U&&(st(),U.release(),U=null),oe=!0,d=null,E=null,y=null,g.clear(),k.clear(),ie&&t.removeEventListener("keydown",uo,!0),t.removeEventListener("message",lo),t.removeEventListener("keydown",Eo,!0),t.removeEventListener("pointerover",Ge),t.removeEventListener("pointermove",Ge),t.removeEventListener("pointerout",_o),t.removeEventListener("focus",fo),t.removeEventListener("blur",So);for(let r of L.values())clearTimeout(r.timer),r.reject(new f("HOST_UNAVAILABLE","Host client was disposed."));L.clear(),i.clear(),c.clear(),l.clear(),S.clear(),I.clear(),w.clear(),q.clear(),B.clear(),Y.clear(),T.clear(),p.clear(),m.clear(),G.length=0}}};var rr=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var As=new Set(rr);var _n=10*6e4;var fn=10*6e4;var Sn=10*6e4;var Tn=10*6e4;var nr=["none","agent","user"];var Os=new Set(nr);var mn=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],hn=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],sr=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,s]of mn)t.style.setProperty(o,e.tokens[s]);for(let[o,s,i]of hn){let c=e.tokens[i]??"";t.style.setProperty(o,c),t.style.setProperty(s,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size",e.tokens.fontSize??"0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Gt=(e,t)=>{sr(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var bn={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},X=(e,t)=>`var(--${e}, var(--oc-${bn[e]}, ${t}))`,pe=X("surface-background","transparent"),Qe=X("surface-elevated","transparent"),Oe=X("surface-elevated-foreground","inherit"),se=X("surface-foreground","inherit"),K=X("surface-muted-foreground","gray"),gn=X("surface-muted","transparent"),he=X("interactive-border","currentColor"),ne=X("interactive-hover","transparent"),be=X("interactive-active","transparent"),Ht=X("interactive-selection","transparent"),$t=X("interactive-selection-foreground","inherit"),le=X("primary","currentColor"),Xt=X("primary-text","inherit"),Vt=X("error-text","inherit"),kn=X("font-sans","inherit"),Bt=X("font-mono","monospace"),dr=X("radius","9px"),Ft=`calc(${dr} - 2px)`,ir=`calc(${dr} - 4px)`,W=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,ar=`background-image: linear-gradient(${ne}, ${ne});`,Kt=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Wt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",cr="box-shadow: var(--oc-sdk-lit);",jt=`inset 0 0.5px 0 0 ${W(se,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,An=`
:root {
  --oc-sdk-edge: ${W(se,16)};
  --oc-sdk-field-bg: ${Qe};
  --oc-sdk-raised-bg: ${pe};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${W(se,14)};
  --oc-sdk-field-bg: ${W(pe,50,Qe)};
  --oc-sdk-raised-bg: ${Qe};
  --oc-sdk-field-lift: ${jt};
  --oc-sdk-raised-lift: ${jt};
  --oc-sdk-lit: ${jt};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Je=e=>{let t=X(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${X(`${e}-text`,"inherit")}; }`},a=e=>`calc(${e}rem / 14)`,xn=`
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
`,lr=`${An}
.oc-sdk { color: ${se}; font-family: ${kn}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${ar} }
.oc-sdk-mono { font-family: ${Bt}; }
.oc-sdk-muted { color: ${K}; }
${Je("success")}${Je("warning")}${Je("error")}${Je("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${le}; --oc-sdk-tone-text: ${Xt}; }

.oc-sdk-btn { border-radius: ${Ft}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${ir}; }
.oc-sdk-btn[data-variant="default"] { color: ${Xt}; background: ${W(le,10,pe)}; border-color: ${W(le,12)}; ${cr} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${W(le,16,pe)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${W(le,22,pe)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${gn}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${ne}, ${ne}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${be}, ${be}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Oe}; ${Wt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${ne}, ${ne}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${be}, ${be}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${ne}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${be}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${X("status-error","red")}; color: ${Vt}; background: ${W("var(--oc-sdk-tone)",7,pe)}; border-color: ${W("var(--oc-sdk-tone)",12)}; ${cr} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${W("var(--oc-sdk-tone)",9,pe)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${W("var(--oc-sdk-tone)",11,pe)}; box-shadow: none; }

.oc-sdk-field-note { color: ${K}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Vt}; }
.oc-sdk-input { border-radius: ${Ft}; background: var(--oc-sdk-field-bg); color: ${Oe}; ${Kt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${K}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${ne}, ${ne}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Kt(W(se,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Kt(X("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Bt}; }

.oc-sdk-search-icon { color: ${K}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${le}; }
.oc-sdk-search-clear { border-radius: ${ir}; color: ${K}; }
.oc-sdk-search-clear:hover { background: ${ne}; color: ${se}; }

.oc-sdk-trigger { border-radius: ${Ft}; background: var(--oc-sdk-raised-bg); color: ${Oe}; ${Wt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${ne}, ${ne}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${be}, ${be}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${K}; }
.oc-sdk-trigger-chevron { color: ${K}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Oe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Qe}; background-clip: padding-box; color: ${Oe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${ne}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Ht}; color: ${$t}; }
.oc-sdk-option-check { color: ${se}; }
.oc-sdk-option[data-destructive="true"] { color: ${Vt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${W(X("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${K}; }
.oc-sdk-popup-empty { color: ${K}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${he}; border-radius: 4px; color: ${se}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${W(se,60,he)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${he}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${pe}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${le}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(var(--oc-sdk-thumb-travel, 16px)); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${ar} }
.oc-sdk-check-desc { color: ${K}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${W(se,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${K}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${se}; }
.oc-sdk-tab[aria-selected="true"] { color: ${$t}; background: ${Ht}; border-color: ${he}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Oe}; background: var(--oc-sdk-raised-bg); ${Wt} }
.oc-sdk-tab-count { color: ${K}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${W(se,6)}; color: ${K}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${W("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${ne}; }
.oc-sdk-row[aria-selected="true"] { background: ${Ht}; color: ${$t}; }
.oc-sdk-row-lead { font-family: ${Bt}; color: ${K}; }
.oc-sdk-row-sub { color: ${K}; }
.oc-sdk-row-meta { color: ${K}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${K}; }

.oc-sdk-empty-body { color: ${K}; }

.oc-sdk-spinner { color: ${K}; }
.oc-sdk-spinner-ring { border-color: ${he}; border-top-color: ${le}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${W("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${K}; }

.oc-sdk-separator { color: ${K}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${W(he,40)}; }

.oc-sdk-progress-label { color: ${K}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${W(se,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${le}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${X("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${X("success-text","inherit")}; }

.oc-sdk-text a { color: ${Xt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${W(he,60)}; }
`,Q=`
${ct}
${xn}
${lr}`;var pr="oc-sdk-ui-style",Re=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},Z=e=>{let t=document.getElementById(pr);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}dt(document);let o=document.createElement("style");o.id=pr,o.textContent=e,document.head.appendChild(o)},V=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},ue=e=>{let t=V("button",e);return t.type="button",t},ce=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},_e=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},ur=(e,t)=>{let o=s=>{s.target instanceof Node&&e.contains(s.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var On=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ne=(e,t)=>{Z(Q);let o=t,s=ue("oc-sdk oc-sdk-btn"),i=On(),c=document.createElement("span");s.append(c),e.append(s);let l=()=>{s.dataset.variant=o.variant??"default",s.dataset.size=o.size??"default",s.disabled=!!o.disabled||!!o.loading,s.dataset.loading=o.loading?"true":"false",s.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&i.parentNode!==s?s.prepend(i):!o.loading&&i.parentNode===s&&i.remove(),ce(c,o.label)},S=()=>{o.disabled||o.loading||o.onClick()};return s.addEventListener("click",S),l(),{update:I=>{o={...o,...I},l()},dispose:()=>{s.removeEventListener("click",S),s.remove()}}};var Er="http://www.w3.org/2000/svg",Rn={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},ye=(e,t,o)=>{let s=document.createElementNS(Er,"svg");s.setAttribute("viewBox","0 0 24 24"),s.setAttribute("width",String(t)),s.setAttribute("height",String(t)),s.style.width=a(t),s.style.height=a(t),s.setAttribute("aria-hidden","true"),s.setAttribute("fill","currentColor"),o&&s.setAttribute("class",o);let i=document.createElementNS(Er,"path");return i.setAttribute("d",Rn[e]),s.append(i),s};var ve=(e,t="vertical")=>{let[o,s]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===s||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Ie=(e,t,o)=>{let s=e.filter(I=>!I.disabled);if(s.length===0)return null;let i=s[0],c=s[s.length-1];if(o==="first"||!i||!c)return i?.id??null;if(o==="last")return c.id;let l=s.findIndex(I=>I.id===t);return l===-1?o==="next"?i.id:c.id:s[Math.min(s.length-1,Math.max(0,l+(o==="next"?1:-1)))]?.id??null};var _r=(e,t)=>`${e}-${t??""}`,zt=(e,t,o,s)=>{let i=ue("oc-sdk-option");i.id=_r(e,o.id),i.setAttribute("role",t),i.tabIndex=-1,i.disabled=!!o.disabled,t==="option"&&i.setAttribute("aria-selected",o.selected?"true":"false"),i.dataset.destructive=o.destructive?"true":"false";let c=V("span","oc-sdk-option-label");if(c.textContent=o.label,i.append(c),o.hint){let l=V("span","oc-sdk-option-hint");l.textContent=o.hint,i.append(l)}if(t==="option"){i.dataset.mark="check";let l=V("span","oc-sdk-option-check");l.append(ye("check",14)),i.append(l)}return i.addEventListener("pointerenter",s.hover),i.addEventListener("click",s.pick),i},qt=(e,t,o,s)=>{let i=_r(o,s);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===i?"true":"false");_e(t,"aria-activedescendant",s?i:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var yn=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let s=e.offsetHeight,i=window.innerHeight-o.bottom-8;s>i&&o.top-8>i&&(e.style.top=`${Math.max(8,Math.round(o.top-4-s))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},Yt=(e,t,o,s)=>{e.append(o),yn(o,t);let i=ur(e,s),c=()=>{s()},l=S=>{S.target instanceof Node&&o.contains(S.target)||s()};return window.addEventListener("resize",c),window.addEventListener("scroll",l,!0),()=>{i(),window.removeEventListener("resize",c),window.removeEventListener("scroll",l,!0),o.remove()}};var Jt=(e,t)=>{_e(e,"data-tone",t&&t!=="neutral"?t:null)},Qt=(e,t)=>{Z(Q);let o=t,s=V("span","oc-sdk oc-sdk-badge");e.append(s);let i=()=>{ce(s,o.label),Jt(s,o.tone)};return i(),{update:c=>{o={...o,...c},i()},dispose:()=>{s.remove()}}};var fr=e=>e.filter(t=>!("separator"in t)),vn=0,Zt=(e,t)=>{Z(Q);let o=t,s=`oc-sdk-menu-${vn+=1}`,i=V("div","oc-sdk oc-sdk-menu");e.append(i);let c=V("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let l=null,S=null,I=Ne(i,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{l?Y():T()}}),w=i.querySelector("button");w?.setAttribute("aria-haspopup","menu");let q=d=>{S=d,qt(c,c,s,d)},B=()=>{Re(c);for(let d of o.items){if("separator"in d){let E=V("div","oc-sdk-separator");E.dataset.labeled="false",c.append(E);continue}c.append(zt(s,"menuitem",d,{hover:()=>q(d.id),pick:()=>p(d.id)}))}q(fr(o.items).some(d=>d.id===S)?S:null)},Y=()=>{let d=l;l=null,d?.(),S=null,w?.setAttribute("aria-expanded","false")},T=()=>{l||!w||(B(),l=Yt(i,w,c,Y),w.setAttribute("aria-expanded","true"),c.focus())},p=d=>{Y(),w?.focus(),o.onSelect(d)},m=d=>{let E=ve(d);E?(d.preventDefault(),q(Ie(fr(o.items),S,E))):d.key==="Enter"||d.key===" "?(d.preventDefault(),S&&p(S)):d.key==="Escape"&&(d.preventDefault(),Y(),w?.focus())},G=d=>{l&&!(d.relatedTarget instanceof Node&&i.contains(d.relatedTarget))&&Y()};return c.addEventListener("keydown",m),i.addEventListener("focusout",G),{update:d=>{o={...o,...d},I.update({label:o.label,variant:o.variant,size:o.size}),l&&B()},dispose:()=>{Y(),c.removeEventListener("keydown",m),i.removeEventListener("focusout",G),I.dispose(),i.remove()}}};var Se=["backlog","todo","in_progress","review","done"],we={backlog:"Backlog",todo:"To Do",in_progress:"In Progress",review:"Review",done:"Done"},Sr=1,Le=200,Tr=16e3,to="New task",In=512,wn=/^t_[a-z0-9]{6,40}$/,mr=e=>typeof e=="string"&&Se.includes(e);var fe=(e,t)=>{if(e==null)return null;if(typeof e!="string")throw new Error(`${t} must be a string`);let o=e.trim();if(!o)return null;if(o.length>In)throw new Error(`${t} is too long`);return o},hr=e=>{if(typeof e!="string")throw new Error("Title must be text");let t=e.trim();if(!t)throw new Error("A task needs a title");if(t.length>Le)throw new Error(`Title is limited to ${Le} characters`);return t},br=e=>{if(e==null)return"";if(typeof e!="string")throw new Error("Description must be text");if(e.length>Tr)throw new Error(`Description is limited to ${Tr} characters`);return e};var gr=e=>{if(e==null)return null;if(typeof e!="object")throw new Error("worktree must be an object");let t=e,o=fe(t.directory,"worktree.directory");if(!o)throw new Error("worktree.directory is required");return{directory:o,branch:fe(t.branch,"worktree.branch")}},eo=(e,t)=>{if(typeof e!="number"||!Number.isFinite(e)||e<0)throw new Error(`${t} must be a timestamp`);return e},kr=(e,t)=>e==null?null:eo(e,t);var Ce=(e,t,o=Date.now())=>{let s={...e,updatedAt:Math.max(o,e.updatedAt)};if("title"in t&&(s.title=hr(t.title)),"description"in t&&(s.description=br(t.description)),"status"in t){if(!mr(t.status))throw new Error("Unknown status");s.status=t.status}if("projectId"in t&&(s.projectId=fe(t.projectId,"projectId")),"sourceBranch"in t&&(s.sourceBranch=fe(t.sourceBranch,"sourceBranch")),"worktree"in t&&(s.worktree=gr(t.worktree)),"sessionId"in t&&(s.sessionId=fe(t.sessionId,"sessionId")),"rank"in t){if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("rank must be a number");s.rank=t.rank}return"needsAttentionSince"in t&&(s.needsAttentionSince=kr(t.needsAttentionSince,"needsAttentionSince")),s},oo=e=>{if(!e||typeof e!="object"||Array.isArray(e))throw new Error("Task record is not an object");let t=e;if(t.schemaVersion!==Sr)throw new Error(`Unsupported task schema ${String(t.schemaVersion)}`);if(typeof t.id!="string"||!wn.test(t.id))throw new Error("Task id is invalid");if(!mr(t.status))throw new Error("Task status is invalid");if(typeof t.rank!="number"||!Number.isFinite(t.rank))throw new Error("Task rank is invalid");return{schemaVersion:Sr,id:t.id,title:hr(t.title),description:br(t.description),status:t.status,rank:t.rank,projectId:fe(t.projectId,"projectId"),sourceBranch:fe(t.sourceBranch,"sourceBranch"),worktree:gr(t.worktree),sessionId:fe(t.sessionId,"sessionId"),createdAt:eo(t.createdAt,"createdAt"),updatedAt:eo(t.updatedAt,"updatedAt"),needsAttentionSince:kr(t.needsAttentionSince,"needsAttentionSince")}};var xr="task:",Ar=16,Or=e=>`${xr}${e}`,ro=async e=>{let t=(await e.storage.keys()).filter(i=>i.startsWith(xr)),o=[],s=[];for(let i=0;i<t.length;i+=Ar)await Promise.all(t.slice(i,i+Ar).map(async c=>{try{let l=oo(await e.storage.get(c));if(Or(l.id)!==c)throw new Error("Task id does not match its key");o.push(l)}catch{s.push(c)}}));return{tasks:o,failedKeys:s}},Ze=async(e,t)=>{let o=oo(t);await e.storage.set(Or(o.id),o)};var no=async(e,t,o=3)=>{for(let s=1;s<=o;s+=1)try{await Ze(e,t);return}catch(i){if(s===o)throw i;await new Promise(c=>setTimeout(c,300*s))}};var et="__all__",Rr="__none__";var so=(e,t)=>e.rank-t.rank||e.createdAt-t.createdAt||e.id.localeCompare(t.id),tt=(e,t)=>!(t.projectId===Rr&&e.projectId!==null||t.projectId!==et&&t.projectId!==Rr&&e.projectId!==t.projectId);var yr=(e,t)=>e.status===t&&e.needsAttentionSince===null?null:Ce(e,{status:t,needsAttentionSince:null});var Te={waitingPermissionMeansReview:!0,failedMeansReview:!0},Pe=(e,t,o,s=Te)=>{if(e==="done")return null;let i=()=>e==="review"?null:"review",c=()=>e==="in_progress"?null:"in_progress";switch(t){case"running":case"retrying":return c();case"waiting-question":return i();case"waiting-permission":return s.waitingPermissionMeansReview?i():null;case"idle":return o==="completed"||o==="failed"&&s.failedMeansReview?i():null;default:return null}};var vr=e=>{let t=e.title.trim();if(t&&t!==to)return t.slice(0,Le);let o=e.description.trim().split(`
`)[0]?.trim()??"";return o?o.slice(0,Le):t||to};var Ir=(e,t)=>t.sessionId===null?null:t.worktree?{directory:t.worktree.directory,branch:t.worktree.branch}:typeof e=="object"&&e.kind==="existing"?{directory:e.directory,branch:null}:null;var Cn="kanban-board",Mn=e=>`https://kanban.local/tasks/${e}`,wr=e=>{let t={providerId:Cn,id:e.id,title:vr(e),url:Mn(e.id),worktree:e.worktree?{kind:"existing",directory:e.worktree.directory}:!1,navigation:"preserve"};return e.projectId&&(t.projectId=e.projectId),t},Cr=(e,t)=>({sessionId:t.sessionId,worktree:Ir(e.worktree??!1,t)}),Mr=e=>e.description.trim()||e.title;var Ur=10*6e4,Un=60,Nn=(e,t,o=Te)=>t?Pe(e.status,t.activity,t.outcome,o)??e.status:e.status,Ln=(e,t)=>e.sessionId?t.get(e.sessionId)??null:null,Nr=(e,t)=>e.needsAttentionSince??t.updatedAt,Lr=(e,t,o,s=Ur)=>!t||t.activity!=="idle"||t.outcome!=="completed"||e.status!=="review"||o-Nr(e,t)<s?null:e.needsAttentionSince!==null?"hint":"quiet",Pn=(e,t,o,s=Ur)=>{if(!t||Lr(e,t,o,s)===null)return null;let i=Math.floor((o-Nr(e,t))/6e4);return i>0&&i<Un?`Looks done \xB7 quiet ${i}m \u2014 click to mark Done`:"Looks done \u2014 click to mark Done"};var Dn=(e,t,o=Te,s=Date.now())=>{let i=Ln(e,t),c=Nn(e,i,o),l=c!==e.status,S=e.needsAttentionSince!==null||l&&c==="review",I=Lr(e,i,s);return{task:e,displayStatus:c,movedByAgent:l,attention:S,attentionSince:e.needsAttentionSince??(S&&i?i.updatedAt:null),live:i,looksDone:I,looksDoneNote:I?Pn(e,i,s):null}},Gn=(e,t)=>(t.attentionSince??Number.NEGATIVE_INFINITY)-(e.attentionSince??Number.NEGATIVE_INFINITY)||so(e.task,t.task),Pr=(e,t,o,s=Te,i=Date.now())=>{let c=Object.fromEntries(Se.map(l=>[l,[]]));for(let l of e){if(!tt(l,o))continue;let S=Dn(l,t,s,i);c[S.displayStatus].push(S)}for(let l of Se)c[l].sort((S,I)=>l==="review"?Gn(S,I):so(S.task,I.task));return c},Dr=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.attention&&s.displayStatus!=="done").length,0),Gr=e=>Object.values(e).reduce((t,o)=>t+o.filter(s=>s.displayStatus!=="done").length,0),Hr=(e,t)=>t>0?{label:`${e} open \xB7 ${t} unseen`,tone:"warning"}:{label:`${e} open`,tone:"neutral"},$r=e=>{switch(e.activity){case"running":return{key:"running",text:"running",tone:"running"};case"retrying":return{key:"running",text:"retrying",tone:"running"};case"waiting-question":return{key:"waiting-question",text:"needs your answer",tone:"waiting"};case"waiting-permission":return{key:"waiting-permission",text:"needs permission",tone:"waiting"};case"idle":return e.outcome==="completed"?{key:"finished",text:"finished",tone:"idle"}:e.outcome==="failed"?{key:"failed",text:"failed",tone:"failed"}:{key:"idle",text:"idle",tone:"idle"};default:return null}};var Xr=(e,t,o)=>{let s=o.sessions.find(i=>i.id===e);if(s)return s.archivedAt===null?"linked":"archived";if(o.state!=="ready")return"unknown";if(t!==null){let i=o.coverage.find(c=>c.directory===t);return i&&i.state!=="ready"?"unknown":"deleted"}return o.coverage.some(i=>i.state!=="ready")?"unknown":"deleted"};var Vr=(e,t,o,s,i={})=>{let c=i.onLiveChange,l=i.onSnapshot??(()=>{}),S=new Map,I=new Map,w=new Map,q=new Map,B=!1,Y=(d,E)=>{if(E.state==="loading")return!1;let g=0;for(let[k,y]of w)y.projectId===d&&(w.delete(k),g+=1);if(E.state!=="ready")return g>0;for(let k of E.sessions)k.parentId===null&&w.set(k.id,{projectId:d,activity:k.activity,outcome:k.outcome,updatedAt:k.updatedAt});return!0},T=(d,E)=>{if(B)return;Y(d,E)&&c&&c(),l();for(let k of E.sessions)q.set(k.id,k.directory);if(o)for(let k of I.values()){if(k.projectId!==d||!k.sessionId)continue;let y=Xr(k.sessionId,q.get(k.sessionId)??null,E);if(s&&(y==="deleted"||y==="archived")){s(k.id,k.sessionId,y);continue}let j=E.sessions.find(L=>L.id===k.sessionId);if(!j)continue;let ie=Pe(k.status,j.activity,j.outcome,t);ie&&o(k.id,ie)}},p=d=>{let E=e.onSessions(d,g=>T(d,g));S.set(d,E),E.then(g=>{(B||!S.has(d))&&g()},()=>{})};return{live:()=>w,sync:d=>{if(B)return;I=new Map(d.map(g=>[g.id,g]));let E=new Set(d.filter(g=>g.sessionId&&g.projectId).map(g=>g.projectId));for(let g of E)S.has(g)||p(g);for(let[g,k]of S)if(!E.has(g)){S.delete(g);for(let[y,j]of w)j.projectId===g&&w.delete(y);k.then(y=>y(),()=>{})}},dispose:()=>{B=!0;for(let d of S.values())d.then(E=>E(),()=>{});S.clear()}}};var Br=(e,t)=>{if(!t)return null;let o=e.find(s=>s.directory===t);return o||(e.filter(s=>t.startsWith(`${s.directory}/`)).sort((s,i)=>i.directory.length-s.directory.length)[0]??null)},Ee=e=>{if(e instanceof f)switch(e.code){case"NOT_GRANTED":return'This needs the "sessions" permission. Approve it in Settings \u2192 Extensions.';case"DISABLED":return"The extension is paused in Settings \u2192 Extensions.";case"HOST_UNAVAILABLE":return"Not running inside OpenChamber.";case"HOST_TIMEOUT":return"OpenChamber did not answer in time. Try again.";case"NOT_FOUND":return"That session no longer exists.";default:return`${e.code}: ${e.message}`}return e instanceof Error?e.message:String(e)};var x=(e,t="",o="")=>{let s=document.createElement(e);return t&&(s.className=t),o&&(s.textContent=o),s};var ot="http://www.w3.org/2000/svg",Hn={running:"info","waiting-question":"warning","waiting-permission":"warning",failed:"error",finished:"success",idle:null,linked:null},Kr=e=>{let t=document.createElementNS(ot,"svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("aria-hidden","true"),e(t),t},$n=()=>Kr(e=>{e.classList.add("kb-agent-spin"),e.setAttribute("fill","none");let t=e.style;t.stroke="currentColor",t.strokeWidth="3",t.strokeLinecap="round";let o=document.createElementNS(ot,"circle");o.setAttribute("cx","12"),o.setAttribute("cy","12"),o.setAttribute("r","9"),o.setAttribute("opacity",".25");let s=document.createElementNS(ot,"path");s.setAttribute("d","M21 12a9 9 0 0 0-9-9"),e.append(o,s)}),Xn=()=>Kr(e=>{e.setAttribute("fill","currentColor");let t=document.createElementNS(ot,"path");t.setAttribute("d","M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5z"),e.append(t)}),io=e=>{let t=x("span","kb-agent-glyph");return t.textContent=e,t.setAttribute("aria-hidden","true"),t},Fr=()=>{let e=x("span","kb-agent-dotg");return e.setAttribute("aria-hidden","true"),e},Vn={running:$n,"waiting-question":()=>io("?"),"waiting-permission":Xn,failed:()=>io("!"),finished:()=>io("\u2713"),idle:Fr,linked:Fr},Wr=e=>{let t=x("span","kb-agent-pill"),o=Hn[e.key];return o&&(t.dataset.tone=o),t.append(Vn[e.key]()),t.append(x("span","kb-agent-label",e.text.charAt(0).toUpperCase()+e.text.slice(1))),t};var jr=(e,t)=>{for(let o of e)if(t<o.top+o.height/2)return o.id;return null};var zr="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",qr="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 4 3-4h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",Bn=`${qr} M9.25 5.75h1.5v6.5H9.25z M6.75 8.25h6.5v1.5H6.75z`,Fn="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",Kn=e=>{let t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","currentColor"),t.setAttribute("fill-rule","evenodd"),t.setAttribute("aria-hidden","true");let o=document.createElementNS("http://www.w3.org/2000/svg","path");return o.setAttribute("d",e),t.append(o),t},rt=(e,t,o,s={})=>{let i=x("button","kb-iconbtn");return i.type="button",i.title=t,i.setAttribute("aria-label",t),s.primary&&(i.dataset.primary="true"),s.hint&&(i.dataset.hint="true"),s.quiet&&(i.dataset.quiet="true"),s.info&&(i.dataset.info="true"),i.append(Kn(e)),i.addEventListener("click",c=>{c.stopPropagation(),o()}),i},Wn=(e,t)=>{let o=[];return t.onMoveStatus&&o.push(...Se.filter(s=>s!==e.displayStatus).map(s=>({id:`move:${s}`,label:`Move to ${we[s]}`}))),t.onEdit&&(o.length>0&&o.push({separator:!0}),o.push({id:"edit",label:"Edit task"})),t.onDelete&&(o.length>0&&o.push({separator:!0}),o.push({id:"delete",label:"Delete task",destructive:!0})),o.length>0?o:null},Yr=(e,t,o)=>{let s=t==="rail",i=x("div",s?"kb-panel-sections":"kb-columns");e.append(i);let c=[],l=null,S=(T,p)=>[...T.querySelectorAll(".kb-draggable-item")].filter(m=>m.dataset.id!==p).map(m=>({id:m.dataset.id??"",top:m.getBoundingClientRect().top,height:m.getBoundingClientRect().height})),I=(T,p,m,G)=>{T.addEventListener("dragover",d=>{l&&(d.preventDefault(),T.classList.add("kb-dragover"))}),T.addEventListener("dragleave",d=>{d.target===T&&T.classList.remove("kb-dragover")}),T.addEventListener("drop",d=>{d.preventDefault(),T.classList.remove("kb-dragover");let E=l??d.dataTransfer?.getData("text/plain")??null;if(l=null,!E)return;if(s&&d.target?.closest?.(".kb-psec-head")){o.onDropEnd?.(E,m);return}let g=jr(S(p,E),d.clientY);G(E,m,g)})},w=T=>{let{task:p}=T,m=x("div",T.attention?"kb-item kb-attn":"kb-item");s?m.classList.add("kb-panel-row"):m.classList.add("kb-card");let G=o.onDrop!==void 0;G?(m.classList.add("kb-draggable-item"),m.draggable=!0):m.draggable=!1,m.dataset.id=p.id;let d=o.isSelected?.(p)??!1;d&&(m.dataset.selected="true");let E=x("div","kb-panel-main");m.append(E);let g=x("div","kb-item-top");if(o.onToggleSelect){let L=o.onToggleSelect,C=document.createElement("input");C.type="checkbox",C.className="kb-check",C.checked=d;let re=d?"Deselect":"Select";C.title=`${re} "${p.title}"`,C.setAttribute("aria-label",`${re} task: ${p.title}`),C.addEventListener("click",oe=>oe.stopPropagation()),C.addEventListener("change",()=>L(p)),g.append(C)}g.append(x("div","kb-panel-title",p.title)),E.append(g);let k=o.projectName(p),y=x("div","kb-panel-sub");k&&y.append(x("span","kb-panel-project",k));let j=T.live?$r(T.live):p.sessionId?{key:"linked",text:"chat linked",tone:"idle"}:null;if(j&&y.append(Wr(j)),E.append(y),s&&o.onChat&&(p.sessionId||p.projectId&&T.displayStatus!=="done")){let L=o.onChat;g.append(rt(p.sessionId?qr:Bn,p.sessionId?"Open chat":"New chat",()=>L(p),p.sessionId&&T.attention?{primary:!0}:{}))}if(s&&T.displayStatus!=="done"&&o.onMarkDone){let L=o.onMarkDone;g.append(rt(zr,"Mark done",()=>L(p),{info:!0}))}let ie=Wn(T,o);if(!s&&T.looksDone&&o.onLooksDone){let L=o.onLooksDone;g.append(rt(zr,T.looksDoneNote??"Looks done \u2014 click to mark Done",()=>L(p),T.looksDone==="hint"?{hint:!0}:{quiet:!0}))}if(ie){let L=x("span","kb-panel-menu");g.append(L),c.push(Zt(L,{label:"\u22EF",variant:"ghost",size:"xs",items:ie,onSelect:C=>{if(C==="delete"&&o.onDelete){o.onDelete(p);return}if(C==="edit"&&o.onEdit){o.onEdit(p);return}if(C.startsWith("move:")){let re=C.slice(5);Se.includes(re)&&o.onMoveStatus&&o.onMoveStatus(p,re)}}}))}if(o.onActivate){let L=()=>o.onActivate(p);m.addEventListener("click",C=>{if(!C.target?.closest(".kb-panel-menu")){if(o.onToggleSelect&&(C.metaKey||C.ctrlKey)){o.onToggleSelect(p);return}L()}}),m.tabIndex=0,m.addEventListener("keydown",C=>{(C.key==="Enter"||C.key===" ")&&(C.preventDefault(),L())})}return G&&(m.addEventListener("dragstart",L=>{l=p.id,m.classList.add("kb-dragging"),L.dataTransfer?.setData("text/plain",p.id),L.dataTransfer&&(L.dataTransfer.effectAllowed="move")}),m.addEventListener("dragend",()=>{l=null,m.classList.remove("kb-dragging")})),m},q=(T,p)=>{let m=x("div","kb-column");m.dataset.status=T;let G=x("div","kb-column-head"),d=x("span","kb-column-count",String(p.length));p.some(k=>k.attention&&k.displayStatus!=="done")&&(d.dataset.attn="true");let E=x("span","kb-column-tools");if(E.append(d),o.onEmptyColumn){let k=o.onEmptyColumn,y=o.isColumnEmptyArmed?.(T)??!1,j=rt(Fn,y?`Click again to empty ${we[T]}`:`Empty ${we[T]}`,()=>k(T));y&&(j.dataset.armed="true"),E.append(j)}G.append(x("span","kb-column-title",we[T]),E);let g=x("div","kb-column-body");m.append(G,g),p.length===0&&g.append(x("div","kb-column-empty","No tasks"));for(let k of p)g.append(w(k));return o.onDrop&&I(m,g,T,o.onDrop),m},B=(T,p)=>{let m=x("div","kb-psec");m.dataset.status=T;let G=o.onToggleSection!==void 0,d=G&&(o.isCollapsed?.(T)??!1),E=G?document.createElement("button"):x("div","kb-psec-head");E.className="kb-psec-head",E instanceof HTMLButtonElement&&(E.type="button"),E.append(x("span","kb-psec-name",we[T]));let g=x("span","kb-psec-count","0");p.some(y=>y.attention&&y.displayStatus!=="done")&&(g.dataset.attn="true"),E.append(g),G&&(E.append(x("span","kb-psec-chevron",d?"\u25B8":"\u25BE")),E.addEventListener("click",()=>o.onToggleSection?.(T)));let k=x("div","kb-psec-body");if(k.hidden=d,m.append(E,k),!d){p.length===0&&k.append(x("div","kb-panel-empty","No tasks"));for(let y of p)k.append(w(y))}return o.onDrop&&I(m,k,T,o.onDrop),m};return{render:T=>{for(let p of c.splice(0))p.dispose();i.replaceChildren();for(let p of Se)i.append(s?B(p,T[p]):q(p,T[p]))},dispose:()=>{for(let T of c.splice(0))T.dispose();i.replaceChildren()}}};var jn=`
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
`,Jr=()=>{if(document.getElementById("kb-style"))return;let e=document.createElement("style");e.id="kb-style",e.textContent=jn,document.head.append(e)};var Qr=(e,t,o)=>{Jr(),t.replaceChildren();let s=!1,i=[],c=[],l=o?.directory??null,S=null,I,w,q=!1,B=!1,Y=null,T,p,m,G,d=(O,M)=>O.filter(ee=>tt(ee,{projectId:M??et})),E=O=>{i=[...O],g.sync(d(i,S?.id??null))},g=Vr(e,Te,null,void 0,{onLiveChange:()=>{B&&!s&&J()},onSnapshot:()=>{h()}}),k=()=>{S=Br(c,l)},y=x("div","kb-page kb-rail"),j=x("div","kb-row between");j.append(x("h2","","Kanban"));let ie=x("span");j.append(ie),y.append(j),p=x("p","kb-muted","Loading\u2026"),y.append(p),m=x("p","kb-rail-scope"),y.append(m),G=x("p","kb-panel-unseen"),y.append(G),Y=Yr(y,"rail",{projectName:O=>!S&&O.projectId?c.find(M=>M.id===O.projectId)?.name??null:null,onMarkDone:async O=>{let M=i.find(U=>U.id===O.id)??O,ee=yr(M,"done");if(ee){try{await Ze(e,ee)}catch(U){e.toast({kind:"error",message:`Could not mark "${M.title}" done \u2014 ${Ee(U)}`}).catch(()=>{}),b();return}E(i.map(U=>U.id===M.id?ee:U)),J()}},onChat:async O=>{let M=i.find(N=>N.id===O.id)??O;if(M.sessionId){if(M.needsAttentionSince!==null){let N=Ce(M,{needsAttentionSince:null});try{await no(e,N),E(i.map(me=>me.id===M.id?N:me)),J()}catch(me){e.toast({kind:"error",message:`Opened the chat, but marking "${M.title}" reviewed failed \u2014 ${Ee(me)}`}).catch(()=>{})}}try{await e.openSession(M.sessionId)}catch(N){e.toast({kind:"error",message:`Could not open the chat of "${M.title}" \u2014 ${Ee(N)}`}).catch(()=>{})}return}if(!M.projectId)return;let ee=wr(M),U;try{U=await e.startSession(ee)}catch(N){e.toast({kind:"error",message:`Could not start the chat for "${M.title}" \u2014 ${Ee(N)}`}).catch(()=>{});return}if(U.sessionId===null){e.toast({kind:"error",message:`Could not start the chat (${U.failure}). Its worktree at ${U.directory} was kept so you can recover it by hand.`}).catch(()=>{});return}let Me=Ce(M,Cr(ee,U));try{await no(e,Me)}catch(N){e.toast({kind:"error",message:`Started a chat for "${M.title}", but the link could not be saved \u2014 ${Ee(N)}. Open the full board to link it.`}).catch(()=>{}),b();return}E(i.map(N=>N.id===M.id?Me:N)),J();try{await e.openSession(U.sessionId)}catch(N){e.toast({kind:"error",message:`Started the chat, but it could not be opened \u2014 ${Ee(N)}.`}).catch(()=>{});return}e.prompt({text:Mr(M)}).catch(()=>{e.toast({kind:"info",message:`The chat was created but its composer wasn't filled \u2014 the description is still on the card "${M.title}".`}).catch(()=>{})})}});let L=x("div","kb-rail-foot");L.append(x("p","kb-muted","Two quick actions live here \u2014 the \u2713 marks a task Done, and the chat button opens the linked chat of a card (starting one attached to it when there is none). Everything else (open, move, edit, delete) is the full board, one click away: pull this panel wider, or the Extension pages menu.")),y.append(L),t.append(y),T=Qt(ie,{label:"",tone:"neutral"}),I=window.setInterval(()=>{b()},3e4);let C=null;e.onProjects(O=>{s||O.state!=="ready"||(c=O.projects,k(),E(i),B&&J())}).then(O=>{s?O():C=O},()=>{});let re=e.onDirectory(O=>{s||(l=O,k(),E(i),B&&J())}),oe=async()=>{try{let O=await ro(e);if(s)return;E(O.tasks),B=!0,p.hidden=!0,J()}catch(O){p.textContent=`Could not load tasks \u2014 ${Ee(O)}`}},b=async()=>{if(!(s||q)){q=!0;try{let{tasks:O}=await ro(e);if(s)return;E(O),B||(B=!0,p.hidden=!0),J()}catch(O){B||(p.textContent=`Could not load tasks \u2014 ${Ee(O)}`)}finally{q=!1}}},h=()=>{w!==void 0||s||(w=window.setTimeout(()=>{w=void 0,b()},500))},J=()=>{let O=Pr(i,g.live(),{projectId:S?.id??et}),M=Gr(O),ee=Dr(O);S?(m.textContent=`Project: ${S.name}`,m.hidden=!1):m.hidden=!0;let U=Hr(M,ee);T.update({label:U.label,tone:U.tone}),ee>0?(G.textContent=`${ee} task${ee===1?"":"s"} need${ee===1?"s":""} your review`,G.hidden=!1):G.hidden=!0,Y?.render(O)};return oe(),{dispose:()=>{s||(s=!0,I!==void 0&&window.clearInterval(I),w!==void 0&&window.clearTimeout(w),C?.(),re(),g.dispose(),Y?.dispose())}}};var ao=Dt(),Zr=document.querySelector("#root");if(!Zr)throw new Error("Missing #root");var co=null;ao.onReady(e=>{Gt(e,document.documentElement),!co&&(co=Qr(ao,Zr,{directory:e.directory}))});window.addEventListener("pagehide",()=>{co?.dispose(),ao.dispose()});})();
