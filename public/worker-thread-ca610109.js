const I=Symbol("error"),W=Symbol("message");class A extends Event{constructor(t,e={}){super(t),this[I]=e.error===void 0?null:e.error,this[W]=e.message===void 0?"":e.message}get error(){return this[I]}get message(){return this[W]}}Object.defineProperty(A.prototype,"error",{enumerable:!0});Object.defineProperty(A.prototype,"message",{enumerable:!0});const Pt=typeof globalThis.ErrorEvent=="function"?globalThis.ErrorEvent:A;class _t extends EventTarget{constructor(){super(...arguments),this.listenersCount=0}addEventListener(t,e){++this.listenersCount,super.addEventListener(t,e)}removeEventListener(t,e){--this.listenersCount,super.removeEventListener(t,e)}hasListeners(){return this.listenersCount>0}}function bt(n){n.asm={...n.asm};const t=new _t;for(const e in n.asm)if(typeof n.asm[e]=="function"){const s=n.asm[e];n.asm[e]=function(...r){try{return s(...r)}catch(o){if(!(o instanceof Error))throw o;if("exitCode"in o&&o?.exitCode===0)return;const i=Rt(o,n.lastAsyncifyStackSource?.stack);if(n.lastAsyncifyStackSource&&(o.cause=n.lastAsyncifyStackSource),!t.hasListeners())throw Tt(i),o;t.dispatchEvent(new Pt("error",{error:o,message:i}))}}}return t}let U=[];function $t(){return U}function Rt(n,t){if(n.message==="unreachable"){let e=Et;t||(e+=`

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`),U=vt(t||n.stack||"");for(const s of U)e+=`    * ${s}
`;return e}return n.message}const Et=`
"unreachable" WASM instruction executed.

The typical reason is a PHP function missing from the ASYNCIFY_ONLY
list when building PHP.wasm.

You will need to file a new issue in the WordPress Playground repository
and paste this error message there:

https://github.com/WordPress/wordpress-playground/issues/new

If you're a core developer, the typical fix is to:

* Isolate a minimal reproduction of the error
* Add a reproduction of the error to php-asyncify.spec.ts in the WordPress Playground repository
* Run 'npm run fix-asyncify'
* Commit the changes, push to the repo, release updated NPM packages

Below is a list of all the PHP functions found in the stack trace to
help with the minimal reproduction. If they're all already listed in
the Dockerfile, you'll need to trigger this error again with long stack
traces enabled. In node.js, you can do it using the --stack-trace-limit=100
CLI option: 

`,N="\x1B[41m",St="\x1B[1m",D="\x1B[0m",z="\x1B[K";let B=!1;function Tt(n){if(!B){B=!0,console.log(`${N}
${z}
${St}  WASM ERROR${D}${N}`);for(const t of n.split(`
`))console.log(`${z}  ${t} `);console.log(`${D}`)}}function vt(n){try{const t=n.split(`
`).slice(1).map(e=>{const s=e.trim().substring(3).split(" ");return{fn:s.length>=2?s[0]:"<unknown>",isWasm:e.includes("wasm://")}}).filter(({fn:e,isWasm:s})=>s&&!e.startsWith("dynCall_")&&!e.startsWith("invoke_")).map(({fn:e})=>e);return Array.from(new Set(t))}catch{return[]}}class _{constructor(t,e,s,r="",o=0){this.httpStatusCode=t,this.headers=e,this.bytes=s,this.exitCode=o,this.errors=r}static fromRawData(t){return new _(t.httpStatusCode,t.headers,t.bytes,t.errors,t.exitCode)}toRawData(){return{headers:this.headers,bytes:this.bytes,errors:this.errors,exitCode:this.exitCode,httpStatusCode:this.httpStatusCode}}get json(){return JSON.parse(this.text)}get text(){return new TextDecoder().decode(this.bytes)}}const tt=["8.2","8.1","8.0","7.4","7.3","7.2","7.1","7.0","5.6"],xt=tt[0],qt=tt;class Ft{#t;#e;constructor(t,e={}){this.requestHandler=t,this.#t={},this.#e={handleRedirects:!1,maxRedirects:4,...e}}async request(t,e=0){const s=await this.requestHandler.request({...t,headers:{...t.headers,cookie:this.#n()}});if(s.headers["set-cookie"]&&this.#s(s.headers["set-cookie"]),this.#e.handleRedirects&&s.headers.location&&e<this.#e.maxRedirects){const r=new URL(s.headers.location[0],this.requestHandler.absoluteUrl);return this.request({url:r.toString(),method:"GET",headers:{}},e+1)}return s}pathToInternalUrl(t){return this.requestHandler.pathToInternalUrl(t)}internalUrlToPath(t){return this.requestHandler.internalUrlToPath(t)}get absoluteUrl(){return this.requestHandler.absoluteUrl}get documentRoot(){return this.requestHandler.documentRoot}#s(t){for(const e of t)try{if(!e.includes("="))continue;const s=e.indexOf("="),r=e.substring(0,s),o=e.substring(s+1).split(";")[0];this.#t[r]=o}catch(s){console.error(s)}}#n(){const t=[];for(const e in this.#t)t.push(`${e}=${this.#t[e]}`);return t.join("; ")}}class kt{constructor({concurrency:t}){this._running=0,this.concurrency=t,this.queue=[]}get running(){return this._running}async acquire(){for(;;)if(this._running>=this.concurrency)await new Promise(t=>this.queue.push(t));else return this._running++,()=>{this._running--,this.queue.length>0&&this.queue.shift()()}}async run(t){const e=await this.acquire();try{return await t()}finally{e()}}}const Ht="http://example.com";function j(n){return n.toString().substring(n.origin.length)}function V(n,t){return!t||!n.startsWith(t)?n:n.substring(t.length)}function Ct(n,t){return!t||n.startsWith(t)?n:t+n}class Ut{#t;#e;#s;#n;#r;#i;#o;#a;#l;constructor(t,e={}){this.#a=new kt({concurrency:1});const{documentRoot:s="/www/",absoluteUrl:r=typeof location=="object"?location?.href:"",isStaticFilePath:o=()=>!1}=e;this.php=t,this.#t=s,this.#l=o;const i=new URL(r);this.#s=i.hostname,this.#n=i.port?Number(i.port):i.protocol==="https:"?443:80,this.#e=(i.protocol||"").replace(":","");const a=this.#n!==443&&this.#n!==80;this.#r=[this.#s,a?`:${this.#n}`:""].join(""),this.#i=i.pathname.replace(/\/+$/,""),this.#o=[`${this.#e}://`,this.#r,this.#i].join("")}pathToInternalUrl(t){return`${this.absoluteUrl}${t}`}internalUrlToPath(t){const e=new URL(t);return e.pathname.startsWith(this.#i)&&(e.pathname=e.pathname.slice(this.#i.length)),j(e)}get isRequestRunning(){return this.#a.running>0}get absoluteUrl(){return this.#o}get documentRoot(){return this.#t}async request(t){const e=t.url.startsWith("http://")||t.url.startsWith("https://"),s=new URL(t.url,e?void 0:Ht),r=V(s.pathname,this.#i);return this.#l(r)?this.#c(r):await this.#u(t,s)}#c(t){const e=`${this.#t}${t}`;if(!this.php.fileExists(e))return new _(404,{},new TextEncoder().encode("404 File not found"));const s=this.php.readFileAsBuffer(e);return new _(200,{"content-length":[`${s.byteLength}`],"content-type":[Mt(e)],"accept-ranges":["bytes"],"cache-control":["public, max-age=0"]},s)}async#u(t,e){const s=await this.#a.acquire();try{this.php.addServerGlobalEntry("DOCUMENT_ROOT",this.#t),this.php.addServerGlobalEntry("HTTPS",this.#o.startsWith("https://")?"on":"");let r="GET";const o={host:this.#r,...et(t.headers||{})},i=[];if(t.files&&Object.keys(t.files).length){r="POST";for(const c in t.files){const h=t.files[c];i.push({key:c,name:h.name,type:h.type,data:new Uint8Array(await h.arrayBuffer())})}o["content-type"]?.startsWith("multipart/form-data")&&(t.formData=Ot(t.body||""),o["content-type"]="application/x-www-form-urlencoded",delete t.body)}let a;t.formData!==void 0?(r="POST",o["content-type"]=o["content-type"]||"application/x-www-form-urlencoded",a=new URLSearchParams(t.formData).toString()):a=t.body;let l;try{l=this.#h(e.pathname)}catch{return new _(404,{},new TextEncoder().encode("404 File not found"))}return await this.php.run({relativeUri:Ct(j(e),this.#i),protocol:this.#e,method:t.method||r,body:a,fileInfos:i,scriptPath:l,headers:o})}finally{s()}}#h(t){let e=V(t,this.#i);e.includes(".php")?e=e.split(".php")[0]+".php":(e.endsWith("/")||(e+="/"),e.endsWith("index.php")||(e+="index.php"));const s=`${this.#t}${e}`;if(this.php.fileExists(s))return s;if(!this.php.fileExists(`${this.#t}/index.php`))throw new Error(`File not found: ${s}`);return`${this.#t}/index.php`}}function Ot(n){const t={},e=n.match(/--(.*)\r\n/);if(!e)return t;const s=e[1],r=n.split(`--${s}`);return r.shift(),r.pop(),r.forEach(o=>{const i=o.indexOf(`\r
\r
`),a=o.substring(0,i).trim(),l=o.substring(i+4).trim(),c=a.match(/name="([^"]+)"/);if(c){const h=c[1];t[h]=l}}),t}function Mt(n){switch(n.split(".").pop()){case"css":return"text/css";case"js":return"application/javascript";case"png":return"image/png";case"jpg":case"jpeg":return"image/jpeg";case"gif":return"image/gif";case"svg":return"image/svg+xml";case"woff":return"font/woff";case"woff2":return"font/woff2";case"ttf":return"font/ttf";case"otf":return"font/otf";case"eot":return"font/eot";case"ico":return"image/x-icon";case"html":return"text/html";case"json":return"application/json";case"xml":return"application/xml";case"txt":case"md":return"text/plain";default:return"application-octet-stream"}}const G={0:"No error occurred. System call completed successfully.",1:"Argument list too long.",2:"Permission denied.",3:"Address in use.",4:"Address not available.",5:"Address family not supported.",6:"Resource unavailable, or operation would block.",7:"Connection already in progress.",8:"Bad file descriptor.",9:"Bad message.",10:"Device or resource busy.",11:"Operation canceled.",12:"No child processes.",13:"Connection aborted.",14:"Connection refused.",15:"Connection reset.",16:"Resource deadlock would occur.",17:"Destination address required.",18:"Mathematics argument out of domain of function.",19:"Reserved.",20:"File exists.",21:"Bad address.",22:"File too large.",23:"Host is unreachable.",24:"Identifier removed.",25:"Illegal byte sequence.",26:"Operation in progress.",27:"Interrupted function.",28:"Invalid argument.",29:"I/O error.",30:"Socket is connected.",31:"There is a directory under that path.",32:"Too many levels of symbolic links.",33:"File descriptor value too large.",34:"Too many links.",35:"Message too large.",36:"Reserved.",37:"Filename too long.",38:"Network is down.",39:"Connection aborted by network.",40:"Network unreachable.",41:"Too many files open in system.",42:"No buffer space available.",43:"No such device.",44:"There is no such file or directory OR the parent directory does not exist.",45:"Executable file format error.",46:"No locks available.",47:"Reserved.",48:"Not enough space.",49:"No message of the desired type.",50:"Protocol not available.",51:"No space left on device.",52:"Function not supported.",53:"The socket is not connected.",54:"Not a directory or a symbolic link to a directory.",55:"Directory not empty.",56:"State not recoverable.",57:"Not a socket.",58:"Not supported, or operation not supported on socket.",59:"Inappropriate I/O control operation.",60:"No such device or address.",61:"Value too large to be stored in data type.",62:"Previous owner died.",63:"Operation not permitted.",64:"Broken pipe.",65:"Protocol error.",66:"Protocol not supported.",67:"Protocol wrong type for socket.",68:"Result too large.",69:"Read-only file system.",70:"Invalid seek.",71:"No such process.",72:"Reserved.",73:"Connection timed out.",74:"Text file busy.",75:"Cross-device link.",76:"Extension: Capabilities insufficient."};function g(n=""){return function(e,s,r){const o=r.value;r.value=function(...i){try{return o.apply(this,i)}catch(a){const l=typeof a=="object"?a?.errno:null;if(l in G){const c=G[l],h=typeof i[0]=="string"?i[0]:null,w=h!==null?n.replaceAll("{path}",h):n;throw new Error(`${w}: ${c}`,{cause:a})}throw a}}}}async function Lt(n,t={},e=[]){let s,r;const o=new Promise(l=>{r=l}),i=new Promise(l=>{s=l}),a=n.init(It,{onAbort(l){console.error("WASM aborted: "),console.error(l)},ENV:{},locateFile:l=>l,...t,noInitialRun:!0,onRuntimeInitialized(){t.onRuntimeInitialized&&t.onRuntimeInitialized(),s()},monitorRunDependencies(l){l===0&&(delete a.monitorRunDependencies,r())}});for(const{default:l}of e)l(a);return e.length||r(),await o,await i,O.push(a),O.length-1}const O=[];function At(n){return O[n]}const It=function(){return typeof process<"u"&&process.release?.name==="node"?"NODE":typeof window<"u"?"WEB":typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?"WORKER":"NODE"}();var Wt=Object.defineProperty,Nt=Object.getOwnPropertyDescriptor,y=(n,t,e,s)=>{for(var r=s>1?void 0:s?Nt(t,e):t,o=n.length-1,i;o>=0;o--)(i=n[o])&&(r=(s?i(t,e,r):i(r))||r);return s&&r&&Wt(t,e,r),r};const p="string",b="number",u=Symbol("__private__dont__use");class m{constructor(t,e){this.#t=[],this.#e=!1,this.#s=null,this.#n={},this.#r=[],t!==void 0&&this.initializeRuntime(t),e&&(this.requestHandler=new Ft(new Ut(this,e)))}#t;#e;#s;#n;#r;async onMessage(t){this.#r.push(t)}get absoluteUrl(){return this.requestHandler.requestHandler.absoluteUrl}get documentRoot(){return this.requestHandler.requestHandler.documentRoot}pathToInternalUrl(t){return this.requestHandler.requestHandler.pathToInternalUrl(t)}internalUrlToPath(t){return this.requestHandler.requestHandler.internalUrlToPath(t)}initializeRuntime(t){if(this[u])throw new Error("PHP runtime already initialized.");const e=At(t);if(!e)throw new Error("Invalid PHP runtime id.");this[u]=e,e.onMessage=s=>{for(const r of this.#r)r(s)},this.#s=bt(e)}setPhpIniPath(t){if(this.#e)throw new Error("Cannot set PHP ini path after calling run().");this[u].ccall("wasm_set_phpini_path",null,["string"],[t])}setPhpIniEntry(t,e){if(this.#e)throw new Error("Cannot set PHP ini entries after calling run().");this.#t.push([t,e])}chdir(t){this[u].FS.chdir(t)}async request(t,e){if(!this.requestHandler)throw new Error("No request handler available.");return this.requestHandler.request(t,e)}async run(t){this.#e||(this.#i(),this.#e=!0),this.#d(t.scriptPath||""),this.#a(t.relativeUri||""),this.#c(t.method||"GET");const{host:e,...s}={host:"example.com:443",...et(t.headers||{})};if(this.#l(e,t.protocol||"http"),this.#u(s),t.body&&this.#h(t.body),t.fileInfos)for(const r of t.fileInfos)this.#f(r);return t.code&&this.#m(" ?>"+t.code),this.#p(),await this.#w()}#i(){if(this.#t.length>0){const t=this.#t.map(([e,s])=>`${e}=${s}`).join(`
`)+`

`;this[u].ccall("wasm_set_phpini_entries",null,[p],[t])}this[u].ccall("php_wasm_init",null,[],[])}#o(){const t="/tmp/headers.json";if(!this.fileExists(t))throw new Error("SAPI Error: Could not find response headers file.");const e=JSON.parse(this.readFileAsText(t)),s={};for(const r of e.headers){if(!r.includes(": "))continue;const o=r.indexOf(": "),i=r.substring(0,o).toLowerCase(),a=r.substring(o+2);i in s||(s[i]=[]),s[i].push(a)}return{headers:s,httpStatusCode:e.status}}#a(t){if(this[u].ccall("wasm_set_request_uri",null,[p],[t]),t.includes("?")){const e=t.substring(t.indexOf("?")+1);this[u].ccall("wasm_set_query_string",null,[p],[e])}}#l(t,e){this[u].ccall("wasm_set_request_host",null,[p],[t]);let s;try{s=parseInt(new URL(t).port,10)}catch{}(!s||isNaN(s)||s===80)&&(s=e==="https"?443:80),this[u].ccall("wasm_set_request_port",null,[b],[s]),(e==="https"||!e&&s===443)&&this.addServerGlobalEntry("HTTPS","on")}#c(t){this[u].ccall("wasm_set_request_method",null,[p],[t])}#u(t){t.cookie&&this[u].ccall("wasm_set_cookies",null,[p],[t.cookie]),t["content-type"]&&this[u].ccall("wasm_set_content_type",null,[p],[t["content-type"]]),t["content-length"]&&this[u].ccall("wasm_set_content_length",null,[b],[parseInt(t["content-length"],10)]);for(const e in t){let s="HTTP_";["content-type","content-length"].includes(e.toLowerCase())&&(s=""),this.addServerGlobalEntry(`${s}${e.toUpperCase().replace(/-/g,"_")}`,t[e])}}#h(t){this[u].ccall("wasm_set_request_body",null,[p],[t]),this[u].ccall("wasm_set_content_length",null,[b],[new TextEncoder().encode(t).length])}#d(t){this[u].ccall("wasm_set_path_translated",null,[p],[t])}addServerGlobalEntry(t,e){this.#n[t]=e}#p(){for(const t in this.#n)this[u].ccall("wasm_add_SERVER_entry",null,[p,p],[t,this.#n[t]])}#f(t){const{key:e,name:s,type:r,data:o}=t,i=`/tmp/${Math.random().toFixed(20)}`;this.writeFile(i,o);const a=0;this[u].ccall("wasm_add_uploaded_file",null,[p,p,p,p,b,b],[e,s,r,i,a,o.byteLength])}#m(t){this[u].ccall("wasm_set_php_code",null,[p],[t])}async#w(){let t,e;try{t=await new Promise((o,i)=>{e=l=>{const c=new Error("Rethrown");c.cause=l.error,c.betterMessage=l.message,i(c)},this.#s?.addEventListener("error",e);const a=this[u].ccall("wasm_sapi_handle_request",b,[],[]);return a instanceof Promise?a.then(o,i):o(a)})}catch(o){for(const c in this)typeof this[c]=="function"&&(this[c]=()=>{throw new Error("PHP runtime has crashed – see the earlier error for details.")});this.functionsMaybeMissingFromAsyncify=$t();const i=o,a="betterMessage"in i?i.betterMessage:i.message,l=new Error(a);throw l.cause=i,l}finally{this.#s?.removeEventListener("error",e),this.#n={}}const{headers:s,httpStatusCode:r}=this.#o();return new _(r,s,this.readFileAsBuffer("/tmp/stdout"),this.readFileAsText("/tmp/stderr"),t)}mkdir(t){this[u].FS.mkdirTree(t)}mkdirTree(t){this.mkdir(t)}readFileAsText(t){return new TextDecoder().decode(this.readFileAsBuffer(t))}readFileAsBuffer(t){return this[u].FS.readFile(t)}writeFile(t,e){this[u].FS.writeFile(t,e)}unlink(t){this[u].FS.unlink(t)}mv(t,e){this[u].FS.rename(t,e)}rmdir(t,e={recursive:!0}){e?.recursive&&this.listFiles(t).forEach(s=>{const r=`${t}/${s}`;this.isDir(r)?this.rmdir(r,e):this.unlink(r)}),this[u].FS.rmdir(t)}listFiles(t,e={prependPath:!1}){if(!this.fileExists(t))return[];try{const s=this[u].FS.readdir(t).filter(r=>r!=="."&&r!=="..");if(e.prependPath){const r=t.replace(/\/$/,"");return s.map(o=>`${r}/${o}`)}return s}catch(s){return console.error(s,{path:t}),[]}}isDir(t){return this.fileExists(t)?this[u].FS.isDir(this[u].FS.lookupPath(t).node.mode):!1}fileExists(t){try{return this[u].FS.lookupPath(t),!0}catch{return!1}}}y([g('Could not create directory "{path}"')],m.prototype,"mkdir",1);y([g('Could not create directory "{path}"')],m.prototype,"mkdirTree",1);y([g('Could not read "{path}"')],m.prototype,"readFileAsText",1);y([g('Could not read "{path}"')],m.prototype,"readFileAsBuffer",1);y([g('Could not write to "{path}"')],m.prototype,"writeFile",1);y([g('Could not unlink "{path}"')],m.prototype,"unlink",1);y([g('Could not move "{path}"')],m.prototype,"mv",1);y([g('Could not remove directory "{path}"')],m.prototype,"rmdir",1);y([g('Could not list files in "{path}"')],m.prototype,"listFiles",1);y([g('Could not stat "{path}"')],m.prototype,"isDir",1);y([g('Could not stat "{path}"')],m.prototype,"fileExists",1);function et(n){const t={};for(const e in n)t[e.toLowerCase()]=n[e];return t}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const nt=Symbol("Comlink.proxy"),Dt=Symbol("Comlink.endpoint"),zt=Symbol("Comlink.releaseProxy"),C=Symbol("Comlink.finalizer"),v=Symbol("Comlink.thrown"),st=n=>typeof n=="object"&&n!==null||typeof n=="function",Bt={canHandle:n=>st(n)&&n[nt],serialize(n){const{port1:t,port2:e}=new MessageChannel;return H(n,t),[e,[e]]},deserialize(n){return n.start(),it(n)}},jt={canHandle:n=>st(n)&&v in n,serialize({value:n}){let t;return n instanceof Error?t={isError:!0,value:{message:n.message,name:n.name,stack:n.stack}}:t={isError:!1,value:n},[t,[]]},deserialize(n){throw n.isError?Object.assign(new Error(n.value.message),n.value):n.value}},E=new Map([["proxy",Bt],["throw",jt]]);function Vt(n,t){for(const e of n)if(t===e||e==="*"||e instanceof RegExp&&e.test(t))return!0;return!1}function H(n,t=globalThis,e=["*"]){t.addEventListener("message",function s(r){if(!r||!r.data)return;if(!Vt(e,r.origin)){console.warn(`Invalid origin '${r.origin}' for comlink proxy`);return}const{id:o,type:i,path:a}=Object.assign({path:[]},r.data),l=(r.data.argumentList||[]).map(P);let c;try{const h=a.slice(0,-1).reduce((f,R)=>f[R],n),w=a.reduce((f,R)=>f[R],n);switch(i){case"GET":c=w;break;case"SET":h[a.slice(-1)[0]]=P(r.data.value),c=!0;break;case"APPLY":c=w.apply(h,l);break;case"CONSTRUCT":{const f=new w(...l);c=lt(f)}break;case"ENDPOINT":{const{port1:f,port2:R}=new MessageChannel;H(n,R),c=Kt(f,[f])}break;case"RELEASE":c=void 0;break;default:return}}catch(h){c={value:h,[v]:0}}Promise.resolve(c).catch(h=>({value:h,[v]:0})).then(h=>{const[w,f]=F(h);t.postMessage(Object.assign(Object.assign({},w),{id:o}),f),i==="RELEASE"&&(t.removeEventListener("message",s),rt(t),C in n&&typeof n[C]=="function"&&n[C]())}).catch(h=>{const[w,f]=F({value:new TypeError("Unserializable return value"),[v]:0});t.postMessage(Object.assign(Object.assign({},w),{id:o}),f)})}),t.start&&t.start()}function Gt(n){return n.constructor.name==="MessagePort"}function rt(n){Gt(n)&&n.close()}function it(n,t){return M(n,[],t)}function S(n){if(n)throw new Error("Proxy has been released and is not useable")}function ot(n){return $(n,{type:"RELEASE"}).then(()=>{rt(n)})}const x=new WeakMap,q="FinalizationRegistry"in globalThis&&new FinalizationRegistry(n=>{const t=(x.get(n)||0)-1;x.set(n,t),t===0&&ot(n)});function Jt(n,t){const e=(x.get(t)||0)+1;x.set(t,e),q&&q.register(n,t,n)}function Yt(n){q&&q.unregister(n)}function M(n,t=[],e=function(){}){let s=!1;const r=new Proxy(e,{get(o,i){if(S(s),i===zt)return()=>{Yt(r),ot(n),s=!0};if(i==="then"){if(t.length===0)return{then:()=>r};const a=$(n,{type:"GET",path:t.map(l=>l.toString())}).then(P);return a.then.bind(a)}return M(n,[...t,i])},set(o,i,a){S(s);const[l,c]=F(a);return $(n,{type:"SET",path:[...t,i].map(h=>h.toString()),value:l},c).then(P)},apply(o,i,a){S(s);const l=t[t.length-1];if(l===Dt)return $(n,{type:"ENDPOINT"}).then(P);if(l==="bind")return M(n,t.slice(0,-1));const[c,h]=J(a);return $(n,{type:"APPLY",path:t.map(w=>w.toString()),argumentList:c},h).then(P)},construct(o,i){S(s);const[a,l]=J(i);return $(n,{type:"CONSTRUCT",path:t.map(c=>c.toString()),argumentList:a},l).then(P)}});return Jt(r,n),r}function Xt(n){return Array.prototype.concat.apply([],n)}function J(n){const t=n.map(F);return[t.map(e=>e[0]),Xt(t.map(e=>e[1]))]}const at=new WeakMap;function Kt(n,t){return at.set(n,t),n}function lt(n){return Object.assign(n,{[nt]:!0})}function Qt(n,t=globalThis,e="*"){return{postMessage:(s,r)=>n.postMessage(s,e,r),addEventListener:t.addEventListener.bind(t),removeEventListener:t.removeEventListener.bind(t)}}function F(n){for(const[t,e]of E)if(e.canHandle(n)){const[s,r]=e.serialize(n);return[{type:"HANDLER",name:t,value:s},r]}return[{type:"RAW",value:n},at.get(n)||[]]}function P(n){switch(n.type){case"HANDLER":return E.get(n.name).deserialize(n.value);case"RAW":return n.value}}function $(n,t,e){return new Promise(s=>{const r=Zt();n.addEventListener("message",function o(i){!i.data||!i.data.id||i.data.id!==r||(n.removeEventListener("message",o),s(i.data))}),n.start&&n.start(),n.postMessage(Object.assign({id:r},t),e)})}function Zt(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}function te(n,t){ee();const e=Promise.resolve();let s;const r=new Promise(a=>{s=a}),o=ct(n),i=new Proxy(o,{get:(a,l)=>l==="isConnected"?()=>e:l==="isReady"?()=>r:l in a?a[l]:t?.[l]});return H(i,typeof window<"u"?Qt(self.parent):void 0),[s,i]}let Y=!1;function ee(){Y||(Y=!0,E.set("EVENT",{canHandle:n=>n instanceof CustomEvent,serialize:n=>[{detail:n.detail},[]],deserialize:n=>n}),E.set("FUNCTION",{canHandle:n=>typeof n=="function",serialize(n){console.debug("[Comlink][Performance] Proxying a function");const{port1:t,port2:e}=new MessageChannel;return H(n,t),[e,[e]]},deserialize(n){return n.start(),it(n)}}),E.set("PHPResponse",{canHandle:n=>typeof n=="object"&&n!==null&&"headers"in n&&"bytes"in n&&"errors"in n&&"exitCode"in n&&"httpStatusCode"in n,serialize(n){return[n.toRawData(),[]]},deserialize(n){return _.fromRawData(n)}}))}function ct(n){return new Proxy(n,{get(t,e){switch(typeof t[e]){case"function":return(...s)=>t[e](...s);case"object":return t[e]===null?t[e]:ct(t[e]);case"undefined":case"number":case"string":return t[e];default:return lt(t[e])}}})}async function ne(n=xt){switch(n){case"8.2":return await import("./assets/php_8_2-c07ae5e7.js");case"8.1":return await import("./assets/php_8_1-a5d5466e.js");case"8.0":return await import("./assets/php_8_0-0517cbd5.js");case"7.4":return await import("./assets/php_7_4-b53bbc37.js");case"7.3":return await import("./assets/php_7_3-f2e702cf.js");case"7.2":return await import("./assets/php_7_2-d9b02a06.js");case"7.1":return await import("./assets/php_7_1-5c6b1811.js");case"7.0":return await import("./assets/php_7_0-798fa875.js");case"5.6":return await import("./assets/php_5_6-af1ece15.js")}throw new Error(`Unsupported PHP version ${n}`)}class k extends m{static async load(t,e={}){return await k.loadSync(t,e).phpReady}static loadSync(t,e={}){const s=new k(void 0,e.requestHandler),o=(async()=>{const i=await Promise.all([ne(t),...e.dataModules||[]]),[a,...l]=i;e.downloadMonitor?.setModules(i);const c=await Lt(a,{...e.emscriptenOptions||{},...e.downloadMonitor?.getEmscriptenOptions()||{}},l);return s.initializeRuntime(c),{dataModules:l}})();return{php:s,phpReady:o.then(()=>s),dataModules:o.then(i=>i.dataModules)}}}const d=new WeakMap;class se{constructor(t,e){d.set(this,{php:t,monitor:e}),this.absoluteUrl=t.absoluteUrl,this.documentRoot=t.documentRoot}pathToInternalUrl(t){return d.get(this).php.pathToInternalUrl(t)}internalUrlToPath(t){return d.get(this).php.internalUrlToPath(t)}async onDownloadProgress(t){return d.get(this).monitor?.addEventListener("progress",t)}mv(t,e){return d.get(this).php.mv(t,e)}rmdir(t,e){return d.get(this).php.rmdir(t,e)}request(t,e){return d.get(this).php.request(t,e)}async run(t){return d.get(this).php.run(t)}chdir(t){return d.get(this).php.chdir(t)}setPhpIniPath(t){return d.get(this).php.setPhpIniPath(t)}setPhpIniEntry(t,e){return d.get(this).php.setPhpIniEntry(t,e)}mkdir(t){return d.get(this).php.mkdir(t)}mkdirTree(t){return d.get(this).php.mkdirTree(t)}readFileAsText(t){return d.get(this).php.readFileAsText(t)}readFileAsBuffer(t){return d.get(this).php.readFileAsBuffer(t)}writeFile(t,e){return d.get(this).php.writeFile(t,e)}unlink(t){return d.get(this).php.unlink(t)}listFiles(t,e){return d.get(this).php.listFiles(t,e)}isDir(t){return d.get(this).php.isDir(t)}fileExists(t){return d.get(this).php.fileExists(t)}onMessage(t){d.get(this).php.onMessage(t)}}function ut(n){return n.pathname.startsWith("/scope:")}function re(n,t){let e=new URL(n);if(ut(e))if(t){const s=e.pathname.split("/");s[1]=`scope:${t}`,e.pathname=s.join("/")}else e=ie(e);else if(t){const s=e.pathname==="/"?"":e.pathname;e.pathname=`/scope:${t}${s}`}return e}function ie(n){if(!ut(n))return n;const t=new URL(n),e=t.pathname.split("/");return t.pathname="/"+e.slice(2).join("/"),t}function oe(){const n={};return typeof self?.location?.href<"u"&&new URL(self.location.href).searchParams.forEach((e,s)=>{n[s]=e}),n}(function(){return typeof navigator<"u"&&navigator?.userAgent?.toLowerCase().indexOf("firefox")>-1?"iframe":"webworker"})();const ae=5*1024*1024;class le extends EventTarget{#t={};#e={};constructor(t=[]){super(),this.setModules(t),this.#s()}getEmscriptenOptions(){return{dataFileDownloads:this.#n()}}setModules(t){this.#t=t.reduce((e,s)=>{if(s.dependenciesTotalSize>0){const r="http://example.com/",i=new URL(s.dependencyFilename,r).pathname.split("/").pop();e[i]=Math.max(i in e?e[i]:0,s.dependenciesTotalSize)}return e},{}),this.#e=Object.fromEntries(Object.entries(this.#t).map(([e])=>[e,0]))}#s(){const t=WebAssembly.instantiateStreaming;WebAssembly.instantiateStreaming=async(e,...s)=>{const r=await e,o=r.url.substring(new URL(r.url).origin.length+1),i=ce(r,({detail:{loaded:a,total:l}})=>this.#r(o,a,l));return t(i,...s)}}#n(){const t=this,e={};return new Proxy(e,{set(s,r,o){return t.#r(r,o.loaded,o.total),s[r]=new Proxy(JSON.parse(JSON.stringify(o)),{set(i,a,l){return i[a]=l,t.#r(r,i.loaded,i.total),!0}}),!0}})}#r(t,e,s){const r=new URL(t,"http://example.com").pathname.split("/").pop();s||(s=this.#t[r]),r in this.#e||console.warn(`Registered a download #progress of an unregistered file "${r}". This may cause a sudden **decrease** in the #progress percentage as the total number of bytes increases during the download.`),this.#e[r]=e,this.dispatchEvent(new CustomEvent("progress",{detail:{loaded:X(this.#e),total:X(this.#t)}}))}}function X(n){return Object.values(n).reduce((t,e)=>t+e,0)}function ce(n,t){const e=n.headers.get("content-length")||"",s=parseInt(e,10)||ae;function r(o,i){t(new CustomEvent("progress",{detail:{loaded:o,total:i}}))}return new Response(new ReadableStream({async start(o){if(!n.body){o.close();return}const i=n.body.getReader();let a=0;for(;;)try{const{done:l,value:c}=await i.read();if(c&&(a+=c.byteLength),l){r(a,a),o.close();break}else r(a,s),o.enqueue(c)}catch(l){console.error({e:l}),o.error(l);break}}}),{status:n.status,statusText:n.statusText,headers:n.headers})}const ue=new URL("/",(import.meta||{}).url).origin,L="/wordpress",he=n=>n.startsWith("/wp-content/uploads/")||n.startsWith("/wp-content/plugins/")||n.startsWith("/wp-content/mu-plugins/")||n.startsWith("/wp-content/themes/"),ht=["6.2","6.1","6.0","5.9"],de=ht[0],pe=ht;function fe(n){switch(n){case"5.9":return import("./assets/wp-5.9-c0f1e718.js");case"6.0":return import("./assets/wp-6.0-12c1ed4b.js");case"6.1":return import("./assets/wp-6.1-f6b7155e.js");case"6.2":return import("./assets/wp-6.2-1ebe9112.js")}throw new Error(`Unsupported WordPress module: ${n}`)}var me=`<?php

/**
 * This transport delegates PHP HTTP requests to JavaScript synchronous XHR.
 *
 * This file isn't actually used. It's just here for reference and development. The actual
 * PHP code used in WordPress is hardcoded copy residing in wordpress.mjs in the _patchWordPressCode
 * function.
 *
 * @TODO Make the build pipeline use this exact file instead of creating it
 *       from within the JavaScript runtime.
 */

class Requests_Transport_Fetch implements Requests_Transport
{
	public $headers = '';

	public function __construct()
	{
	}

	public function __destruct()
	{
	}

	/**
	 * Delegates PHP HTTP requests to JavaScript synchronous XHR.
	 *
	 * @TODO Implement handling for more $options such as cookies, filename, auth, etc.
	 *
	 * @param $url
	 * @param $headers
	 * @param $data
	 * @param $options
	 *
	 * @return false|string
	 */
	public function request($url, $headers = array(), $data = array(), $options = array())
	{
		// Disable wp-cron requests that are extremely slow in node.js runtime environment.
		// @TODO: Make wp-cron requests faster.
		if (str_contains($url, '/wp-cron.php')) {
			return false;
		}

		$headers = Requests::flatten($headers);
		if (!empty($data)) {
			$data_format = $options['data_format'];
			if ($data_format === 'query') {
				$url  = self::format_get($url, $data);
				$data = '';
			} elseif (!is_string($data)) {
				$data = http_build_query($data, null, '&');
			}
		}

		$request = json_encode(json_encode(array(
			'headers' => $headers,
			'data'    => $data,
			'url'     => $url,
			'method'  => $options['type'],
		)));

		$js = <<<JAVASCRIPT
const request = JSON.parse({$request});
console.log("Requesting " + request.url);
const xhr = new XMLHttpRequest();
xhr.open(
	request.method,
	request.url,
	false // false makes the xhr synchronous
);
for ( var name in request.headers ) {
	xhr.setRequestHeader(name, request.headers[name]);
}
xhr.send(request.data);

[
	"HTTP/1.1 " + xhr.status + " " + xhr.statusText,
	xhr.getAllResponseHeaders(),
	"",
	xhr.responseText
].join("\\\\r\\\\n");
JAVASCRIPT;

		$this->headers = vrzno_eval($js);

		return $this->headers;
	}

	public function request_multiple($requests, $options)
	{
		$responses = array();
		$class     = get_class($this);
		foreach ($requests as $id => $request) {
			try {
				$handler          = new $class();
				$responses[$id] = $handler->request($request['url'], $request['headers'], $request['data'], $request['options']);
				$request['options']['hooks']->dispatch('transport.internal.parse_response', array(&$responses[$id], $request));
			} catch (Requests_Exception $e) {
				$responses[$id] = $e;
			}
			if (!is_string($responses[$id])) {
				$request['options']['hooks']->dispatch('multiple.request.complete', array(&$responses[$id], $id));
			}
		}

		return $responses;
	}

	protected static function format_get($url, $data)
	{
		if (!empty($data)) {
			$query     = '';
			$url_parts = parse_url($url);
			if (empty($url_parts['query'])) {
				$url_parts['query'] = '';
			} else {
				$query = $url_parts['query'];
			}
			$query .= '&' . http_build_query($data, null, '&');
			$query = trim($query, '&');
			if (empty($url_parts['query'])) {
				$url .= '?' . $query;
			} else {
				$url = str_replace($url_parts['query'], $query, $url);
			}
		}

		return $url;
	}

	public static function test($capabilities = array())
	{
		if (!function_exists('vrzno_eval')) {
			return false;
		}

		if (vrzno_eval("typeof XMLHttpRequest;") !== 'function') {
			return false;
		}

		return true;
	}
}
`,we=`<?php

/**
 * This transport does not perform any HTTP requests and only exists
 * to prevent the Requests class from complaining about not having any
 * transports.
 */
class Requests_Transport_Dummy implements Requests_Transport
{
	public $headers = '';

	public function __construct()
	{
	}

	public function __destruct()
	{
	}

	public function request($url, $headers = array(), $data = array(), $options = array())
	{
		return false;
	}

	public function request_multiple($requests, $options)
	{
		$responses = array();
		foreach ($requests as $id => $request) {
			$responses[] = false;
		}
		return $responses;
	}

	protected static function format_get($url, $data)
	{
		return $url;
	}

	public static function test($capabilities = array())
	{
		return true;
	}
}
`,ge=`<?php
/**
 * The default WordPress requests transports have been disabled
 * at this point. However, the Requests class requires at least
 * one working transport or else it throws warnings and acts up.
 * 
 * This mu-plugin provides that transport. It's one of the two:
 * 
 * * Requests_Transport_Fetch – Sends requests using browser's fetch() function.
 *                              Only enabled when PHP was compiled with the VRZNO
 * 								extension.
 * * Requests_Transport_Dummy – Does not send any requests and only exists to keep
 * 								the Requests class happy.
 */
if (defined('USE_FETCH_FOR_REQUESTS') && USE_FETCH_FOR_REQUESTS) {
    require(__DIR__ . '/includes/requests_transport_fetch.php');
	Requests::add_transport('Requests_Transport_Fetch');
	add_filter('http_request_host_is_external', function ($arg) {
		return true;
	});
} else {
    require(__DIR__ . '/includes/requests_transport_dummy.php');
    Requests::add_transport('Requests_Transport_Dummy');
}
`,ye=`<?php
/**
 * Add a notice to wp-login.php offering the username and password.
 */

add_action(
	'login_message',
	function() {
		return <<<EOT
<div class="message info">
	<strong>username:</strong> <code>admin</code><br /><strong>password</strong>: <code>password</code>
</div>
EOT;
	}
);
`;async function T(n,t,e){let s="";await n.fileExists(t)&&(s=await n.readFileAsText(t)),await n.writeFile(t,e(s))}const Pe=async(n,t)=>{const e=new _e(n,t.siteUrl,t.wordpressPath||"/wordpress");t.patchSqlitePlugin!==!1&&await e.patchSqlitePlugin(),t.addPhpInfo!==!1&&await e.addPhpInfo(),t.patchSiteUrl!==!1&&await e.patchSiteUrl(),t.disableSiteHealth!==!1&&await e.disableSiteHealth(),t.disableWpNewBlogNotification!==!1&&await e.disableWpNewBlogNotification()};let _e=class{constructor(t,e,s){this.php=t,this.scopedSiteUrl=e,this.wordpressPath=s}async patchSqlitePlugin(){await T(this.php,`${this.wordpressPath}/wp-content/plugins/sqlite-database-integration/wp-includes/sqlite/class-wp-sqlite-translator.php`,t=>t.replace("if ( false === strtotime( $value ) )",'if ( $value === "0000-00-00 00:00:00" || false === strtotime( $value ) )'))}async addPhpInfo(){await this.php.writeFile(`${this.wordpressPath}/phpinfo.php`,"<?php phpinfo(); ")}async patchSiteUrl(){await T(this.php,`${this.wordpressPath}/wp-config.php`,t=>`<?php
				if(!defined('WP_HOME')) {
					define('WP_HOME', "${this.scopedSiteUrl}");
					define('WP_SITEURL', "${this.scopedSiteUrl}");
				}
				?>${t}`)}async disableSiteHealth(){await T(this.php,`${this.wordpressPath}/wp-includes/default-filters.php`,t=>t.replace(/add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,""))}async disableWpNewBlogNotification(){await T(this.php,`${this.wordpressPath}/wp-config.php`,t=>`${t} function wp_new_blog_notification(...$args){} `)}};function be(n,t){const e=new $e(n,t,L);e.replaceRequestsTransports(),e.addMissingSvgs(),Pe(n,{siteUrl:t,wordpressPath:L})}class $e{constructor(t,e,s){this.php=t,this.scopedSiteUrl=e,this.wordpressPath=s}async replaceRequestsTransports(){await K(this.php,`${this.wordpressPath}/wp-config.php`,e=>`${e} define('USE_FETCH_FOR_REQUESTS', false);`);const t=[`${this.wordpressPath}/wp-includes/Requests/Transport/fsockopen.php`,`${this.wordpressPath}/wp-includes/Requests/Transport/cURL.php`];for(const e of t)await this.php.fileExists(e)&&await K(this.php,e,s=>s.replace("public static function test","public static function test( $capabilities = array() ) { return false; } public static function test2"));await this.php.mkdirTree(`${this.wordpressPath}/wp-content/mu-plugins/includes`),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_fetch.php`,me),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_dummy.php`,we),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/add_requests_transport.php`,ge),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/1-show-admin-credentials-on-wp-login.php`,ye)}async addMissingSvgs(){this.php.mkdirTree(`${this.wordpressPath}/wp-admin/images`);const t=[`${this.wordpressPath}/wp-admin/images/about-header-about.svg`,`${this.wordpressPath}/wp-admin/images/dashboard-background.svg`];for(const e of t)await this.php.fileExists(e)||await this.php.writeFile(e,"")}}async function K(n,t,e){await n.writeFile(t,e(await n.readFileAsText(t)))}const dt=oe(),Q=(dt.wpVersion||"").replace("_","."),pt=pe.includes(Q)?Q:de,Z=(dt.phpVersion||"").replace("_","."),ft=qt.includes(Z)?Z:"8.0",mt=Math.random().toFixed(16),wt=re(ue,mt).toString(),gt=new le,{php:yt,phpReady:Re,dataModules:Ee}=k.loadSync(ft,{downloadMonitor:gt,requestHandler:{documentRoot:L,absoluteUrl:wt,isStaticFilePath:he},dataModules:[fe(pt)]});class Se extends se{constructor(t,e,s,r,o){super(t,e),this.scope=s,this.wordPressVersion=r,this.phpVersion=o}async getWordPressModuleDetails(){return{staticAssetsDirectory:`wp-${(await this.wordPressVersion).replace("_",".")}`,defaultTheme:ve?.defaultThemeName}}}const[Te]=te(new Se(yt,gt,mt,pt,ft));await Re;const ve=(await Ee)[0];be(yt,wt);Te();
