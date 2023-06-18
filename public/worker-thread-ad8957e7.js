const tt=Symbol("error"),et=Symbol("message");class V extends Event{constructor(t,e={}){super(t),this[tt]=e.error===void 0?null:e.error,this[et]=e.message===void 0?"":e.message}get error(){return this[tt]}get message(){return this[et]}}Object.defineProperty(V.prototype,"error",{enumerable:!0});Object.defineProperty(V.prototype,"message",{enumerable:!0});const Nt=typeof globalThis.ErrorEvent=="function"?globalThis.ErrorEvent:V;class It extends EventTarget{constructor(){super(...arguments),this.listenersCount=0}addEventListener(t,e){++this.listenersCount,super.addEventListener(t,e)}removeEventListener(t,e){--this.listenersCount,super.removeEventListener(t,e)}hasListeners(){return this.listenersCount>0}}function Wt(n){n.asm={...n.asm};const t=new It;for(const e in n.asm)if(typeof n.asm[e]=="function"){const r=n.asm[e];n.asm[e]=function(...s){try{return r(...s)}catch(o){if(!(o instanceof Error))throw o;if("exitCode"in o&&o?.exitCode===0)return;const i=zt(o,n.lastAsyncifyStackSource?.stack);if(n.lastAsyncifyStackSource&&(o.cause=n.lastAsyncifyStackSource),!t.hasListeners())throw Gt(i),o;t.dispatchEvent(new Nt("error",{error:o,message:i}))}}}return t}let W=[];function jt(){return W}function zt(n,t){if(n.message==="unreachable"){let e=Bt;t||(e+=`

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`),W=Jt(t||n.stack||"");for(const r of W)e+=`    * ${r}
`;return e}return n.message}const Bt=`
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

`,nt="\x1B[41m",Vt="\x1B[1m",rt="\x1B[0m",st="\x1B[K";let it=!1;function Gt(n){if(!it){it=!0,console.log(`${nt}
${st}
${Vt}  WASM ERROR${rt}${nt}`);for(const t of n.split(`
`))console.log(`${st}  ${t} `);console.log(`${rt}`)}}function Jt(n){try{const t=n.split(`
`).slice(1).map(e=>{const r=e.trim().substring(3).split(" ");return{fn:r.length>=2?r[0]:"<unknown>",isWasm:e.includes("wasm://")}}).filter(({fn:e,isWasm:r})=>r&&!e.startsWith("dynCall_")&&!e.startsWith("invoke_")).map(({fn:e})=>e);return Array.from(new Set(t))}catch{return[]}}class E{constructor(t,e,r,s="",o=0){this.httpStatusCode=t,this.headers=e,this.bytes=r,this.exitCode=o,this.errors=s}static fromRawData(t){return new E(t.httpStatusCode,t.headers,t.bytes,t.errors,t.exitCode)}toRawData(){return{headers:this.headers,bytes:this.bytes,errors:this.errors,exitCode:this.exitCode,httpStatusCode:this.httpStatusCode}}get json(){return JSON.parse(this.text)}get text(){return new TextDecoder().decode(this.bytes)}}const Pt=["8.2","8.1","8.0","7.4","7.3","7.2","7.1","7.0","5.6"],Yt=Pt[0],Kt=Pt;class Xt{#t;#e;constructor(t,e={}){this.requestHandler=t,this.#t={},this.#e={handleRedirects:!1,maxRedirects:4,...e}}async request(t,e=0){const r=await this.requestHandler.request({...t,headers:{...t.headers,cookie:this.#n()}});if(r.headers["set-cookie"]&&this.#r(r.headers["set-cookie"]),this.#e.handleRedirects&&r.headers.location&&e<this.#e.maxRedirects){const s=new URL(r.headers.location[0],this.requestHandler.absoluteUrl);return this.request({url:s.toString(),method:"GET",headers:{}},e+1)}return r}pathToInternalUrl(t){return this.requestHandler.pathToInternalUrl(t)}internalUrlToPath(t){return this.requestHandler.internalUrlToPath(t)}get absoluteUrl(){return this.requestHandler.absoluteUrl}get documentRoot(){return this.requestHandler.documentRoot}#r(t){for(const e of t)try{if(!e.includes("="))continue;const r=e.indexOf("="),s=e.substring(0,r),o=e.substring(r+1).split(";")[0];this.#t[s]=o}catch(r){console.error(r)}}#n(){const t=[];for(const e in this.#t)t.push(`${e}=${this.#t[e]}`);return t.join("; ")}}class G{constructor({concurrency:t}){this._running=0,this.concurrency=t,this.queue=[]}get running(){return this._running}async acquire(){for(;;)if(this._running>=this.concurrency)await new Promise(t=>this.queue.push(t));else{this._running++;let t=!1;return()=>{t||(t=!0,this._running--,this.queue.length>0&&this.queue.shift()())}}}async run(t){const e=await this.acquire();try{return await t()}finally{e()}}}function J(...n){let t=n.join("/");const e=t.charAt(0)==="/",r=t.substring(t.length-1)==="/";return t=Qt(t.split("/").filter(s=>!!s),!e).join("/"),!t&&!e&&(t="."),t&&r&&(t+="/"),(e?"/":"")+t}function Qt(n,t){let e=0;for(let r=n.length-1;r>=0;r--){const s=n[r];s==="."?n.splice(r,1):s===".."?(n.splice(r,1),e++):e&&(n.splice(r,1),e--)}if(t)for(;e;e--)n.unshift("..");return n}const Zt=Symbol("literal");function j(n){if(typeof n=="string")return n.startsWith("$")?n:JSON.stringify(n);if(typeof n=="number")return n.toString();if(Array.isArray(n))return`array(${n.map(j).join(", ")})`;if(n===null)return"null";if(typeof n=="object")return Zt in n?n.toString():`array(${Object.entries(n).map(([e,r])=>`${JSON.stringify(e)} => ${j(r)}`).join(", ")})`;if(typeof n=="function")return n();throw new Error(`Unsupported value: ${n}`)}const te="http://example.com";function ot(n){return n.toString().substring(n.origin.length)}function at(n,t){return!t||!n.startsWith(t)?n:n.substring(t.length)}function ee(n,t){return!t||n.startsWith(t)?n:t+n}class ne{#t;#e;#r;#n;#s;#i;#o;#a;#c;constructor(t,e={}){this.#a=new G({concurrency:1});const{documentRoot:r="/www/",absoluteUrl:s=typeof location=="object"?location?.href:"",isStaticFilePath:o=()=>!1}=e;this.php=t,this.#t=r,this.#c=o;const i=new URL(s);this.#r=i.hostname,this.#n=i.port?Number(i.port):i.protocol==="https:"?443:80,this.#e=(i.protocol||"").replace(":","");const a=this.#n!==443&&this.#n!==80;this.#s=[this.#r,a?`:${this.#n}`:""].join(""),this.#i=i.pathname.replace(/\/+$/,""),this.#o=[`${this.#e}://`,this.#s,this.#i].join("")}pathToInternalUrl(t){return`${this.absoluteUrl}${t}`}internalUrlToPath(t){const e=new URL(t);return e.pathname.startsWith(this.#i)&&(e.pathname=e.pathname.slice(this.#i.length)),ot(e)}get isRequestRunning(){return this.#a.running>0}get absoluteUrl(){return this.#o}get documentRoot(){return this.#t}async request(t){const e=t.url.startsWith("http://")||t.url.startsWith("https://"),r=new URL(t.url,e?void 0:te),s=at(r.pathname,this.#i);return this.#c(s)?this.#l(s):await this.#u(t,r)}#l(t){const e=`${this.#t}${t}`;if(!this.php.fileExists(e))return new E(404,{},new TextEncoder().encode("404 File not found"));const r=this.php.readFileAsBuffer(e);return new E(200,{"content-length":[`${r.byteLength}`],"content-type":[se(e)],"accept-ranges":["bytes"],"cache-control":["public, max-age=0"]},r)}async#u(t,e){const r=await this.#a.acquire();try{this.php.addServerGlobalEntry("DOCUMENT_ROOT",this.#t),this.php.addServerGlobalEntry("HTTPS",this.#o.startsWith("https://")?"on":"");let s="GET";const o={host:this.#s,...bt(t.headers||{})},i=[];if(t.files&&Object.keys(t.files).length){s="POST";for(const l in t.files){const p=t.files[l];i.push({key:l,name:p.name,type:p.type,data:new Uint8Array(await p.arrayBuffer())})}o["content-type"]?.startsWith("multipart/form-data")&&(t.formData=re(t.body||""),o["content-type"]="application/x-www-form-urlencoded",delete t.body)}let a;t.formData!==void 0?(s="POST",o["content-type"]=o["content-type"]||"application/x-www-form-urlencoded",a=new URLSearchParams(t.formData).toString()):a=t.body;let c;try{c=this.#h(e.pathname)}catch{return new E(404,{},new TextEncoder().encode("404 File not found"))}return await this.php.run({relativeUri:ee(ot(e),this.#i),protocol:this.#e,method:t.method||s,body:a,fileInfos:i,scriptPath:c,headers:o})}finally{r()}}#h(t){let e=at(t,this.#i);e.includes(".php")?e=e.split(".php")[0]+".php":(e.endsWith("/")||(e+="/"),e.endsWith("index.php")||(e+="index.php"));const r=`${this.#t}${e}`;if(this.php.fileExists(r))return r;if(!this.php.fileExists(`${this.#t}/index.php`))throw new Error(`File not found: ${r}`);return`${this.#t}/index.php`}}function re(n){const t={},e=n.match(/--(.*)\r\n/);if(!e)return t;const r=e[1],s=n.split(`--${r}`);return s.shift(),s.pop(),s.forEach(o=>{const i=o.indexOf(`\r
\r
`),a=o.substring(0,i).trim(),c=o.substring(i+4).trim(),l=a.match(/name="([^"]+)"/);if(l){const p=l[1];t[p]=c}}),t}function se(n){switch(n.split(".").pop()){case"css":return"text/css";case"js":return"application/javascript";case"png":return"image/png";case"jpg":case"jpeg":return"image/jpeg";case"gif":return"image/gif";case"svg":return"image/svg+xml";case"woff":return"font/woff";case"woff2":return"font/woff2";case"ttf":return"font/ttf";case"otf":return"font/otf";case"eot":return"font/eot";case"ico":return"image/x-icon";case"html":return"text/html";case"json":return"application/json";case"xml":return"application/xml";case"txt":case"md":return"text/plain";default:return"application-octet-stream"}}const ct={0:"No error occurred. System call completed successfully.",1:"Argument list too long.",2:"Permission denied.",3:"Address in use.",4:"Address not available.",5:"Address family not supported.",6:"Resource unavailable, or operation would block.",7:"Connection already in progress.",8:"Bad file descriptor.",9:"Bad message.",10:"Device or resource busy.",11:"Operation canceled.",12:"No child processes.",13:"Connection aborted.",14:"Connection refused.",15:"Connection reset.",16:"Resource deadlock would occur.",17:"Destination address required.",18:"Mathematics argument out of domain of function.",19:"Reserved.",20:"File exists.",21:"Bad address.",22:"File too large.",23:"Host is unreachable.",24:"Identifier removed.",25:"Illegal byte sequence.",26:"Operation in progress.",27:"Interrupted function.",28:"Invalid argument.",29:"I/O error.",30:"Socket is connected.",31:"There is a directory under that path.",32:"Too many levels of symbolic links.",33:"File descriptor value too large.",34:"Too many links.",35:"Message too large.",36:"Reserved.",37:"Filename too long.",38:"Network is down.",39:"Connection aborted by network.",40:"Network unreachable.",41:"Too many files open in system.",42:"No buffer space available.",43:"No such device.",44:"There is no such file or directory OR the parent directory does not exist.",45:"Executable file format error.",46:"No locks available.",47:"Reserved.",48:"Not enough space.",49:"No message of the desired type.",50:"Protocol not available.",51:"No space left on device.",52:"Function not supported.",53:"The socket is not connected.",54:"Not a directory or a symbolic link to a directory.",55:"Directory not empty.",56:"State not recoverable.",57:"Not a socket.",58:"Not supported, or operation not supported on socket.",59:"Inappropriate I/O control operation.",60:"No such device or address.",61:"Value too large to be stored in data type.",62:"Previous owner died.",63:"Operation not permitted.",64:"Broken pipe.",65:"Protocol error.",66:"Protocol not supported.",67:"Protocol wrong type for socket.",68:"Result too large.",69:"Read-only file system.",70:"Invalid seek.",71:"No such process.",72:"Reserved.",73:"Connection timed out.",74:"Text file busy.",75:"Cross-device link.",76:"Extension: Capabilities insufficient."};function g(n=""){return function(e,r,s){const o=s.value;s.value=function(...i){try{return o.apply(this,i)}catch(a){const c=typeof a=="object"?a?.errno:null;if(c in ct){const l=ct[c],p=typeof i[0]=="string"?i[0]:null,u=p!==null?n.replaceAll("{path}",p):n;throw new Error(`${u}: ${l}`,{cause:a})}throw a}}}}async function ie(n,t={},e=[]){let r,s;const o=new Promise(c=>{s=c}),i=new Promise(c=>{r=c}),a=n.init(ae,{onAbort(c){console.error("WASM aborted: "),console.error(c)},ENV:{},locateFile:c=>c,...t,noInitialRun:!0,onRuntimeInitialized(){t.onRuntimeInitialized&&t.onRuntimeInitialized(),r()},monitorRunDependencies(c){c===0&&(delete a.monitorRunDependencies,s())}});for(const{default:c}of e)c(a);return e.length||s(),await o,await i,z.push(a),z.length-1}const z=[];function oe(n){return z[n]}const ae=function(){return typeof process<"u"&&process.release?.name==="node"?"NODE":typeof window<"u"?"WEB":typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope?"WORKER":"NODE"}();var ce=Object.defineProperty,le=Object.getOwnPropertyDescriptor,P=(n,t,e,r)=>{for(var s=r>1?void 0:r?le(t,e):t,o=n.length-1,i;o>=0;o--)(i=n[o])&&(s=(r?i(t,e,s):i(s))||s);return r&&s&&ce(t,e,s),s};const m="string",R="number",h=Symbol("__private__dont__use");class y{constructor(t,e){this.#t=[],this.#e=!1,this.#r=null,this.#n={},this.#s=[],t!==void 0&&this.initializeRuntime(t),e&&(this.requestHandler=new Xt(new ne(this,e)))}#t;#e;#r;#n;#s;async onMessage(t){this.#s.push(t)}get absoluteUrl(){return this.requestHandler.requestHandler.absoluteUrl}get documentRoot(){return this.requestHandler.requestHandler.documentRoot}pathToInternalUrl(t){return this.requestHandler.requestHandler.pathToInternalUrl(t)}internalUrlToPath(t){return this.requestHandler.requestHandler.internalUrlToPath(t)}initializeRuntime(t){if(this[h])throw new Error("PHP runtime already initialized.");const e=oe(t);if(!e)throw new Error("Invalid PHP runtime id.");this[h]=e,e.onMessage=r=>{for(const s of this.#s)s(r)},this.#r=Wt(e)}setPhpIniPath(t){if(this.#e)throw new Error("Cannot set PHP ini path after calling run().");this[h].ccall("wasm_set_phpini_path",null,["string"],[t])}setPhpIniEntry(t,e){if(this.#e)throw new Error("Cannot set PHP ini entries after calling run().");this.#t.push([t,e])}chdir(t){this[h].FS.chdir(t)}async request(t,e){if(!this.requestHandler)throw new Error("No request handler available.");return this.requestHandler.request(t,e)}async run(t){this.#e||(this.#i(),this.#e=!0),this.#p(t.scriptPath||""),this.#a(t.relativeUri||""),this.#l(t.method||"GET");const{host:e,...r}={host:"example.com:443",...bt(t.headers||{})};if(this.#c(e,t.protocol||"http"),this.#u(r),t.body&&this.#h(t.body),t.fileInfos)for(const s of t.fileInfos)this.#f(s);return t.code&&this.#m(" ?>"+t.code),this.#d(),await this.#w()}#i(){if(this.#t.length>0){const t=this.#t.map(([e,r])=>`${e}=${r}`).join(`
`)+`

`;this[h].ccall("wasm_set_phpini_entries",null,[m],[t])}this[h].ccall("php_wasm_init",null,[],[])}#o(){const t="/tmp/headers.json";if(!this.fileExists(t))throw new Error("SAPI Error: Could not find response headers file.");const e=JSON.parse(this.readFileAsText(t)),r={};for(const s of e.headers){if(!s.includes(": "))continue;const o=s.indexOf(": "),i=s.substring(0,o).toLowerCase(),a=s.substring(o+2);i in r||(r[i]=[]),r[i].push(a)}return{headers:r,httpStatusCode:e.status}}#a(t){if(this[h].ccall("wasm_set_request_uri",null,[m],[t]),t.includes("?")){const e=t.substring(t.indexOf("?")+1);this[h].ccall("wasm_set_query_string",null,[m],[e])}}#c(t,e){this[h].ccall("wasm_set_request_host",null,[m],[t]);let r;try{r=parseInt(new URL(t).port,10)}catch{}(!r||isNaN(r)||r===80)&&(r=e==="https"?443:80),this[h].ccall("wasm_set_request_port",null,[R],[r]),(e==="https"||!e&&r===443)&&this.addServerGlobalEntry("HTTPS","on")}#l(t){this[h].ccall("wasm_set_request_method",null,[m],[t])}#u(t){t.cookie&&this[h].ccall("wasm_set_cookies",null,[m],[t.cookie]),t["content-type"]&&this[h].ccall("wasm_set_content_type",null,[m],[t["content-type"]]),t["content-length"]&&this[h].ccall("wasm_set_content_length",null,[R],[parseInt(t["content-length"],10)]);for(const e in t){let r="HTTP_";["content-type","content-length"].includes(e.toLowerCase())&&(r=""),this.addServerGlobalEntry(`${r}${e.toUpperCase().replace(/-/g,"_")}`,t[e])}}#h(t){this[h].ccall("wasm_set_request_body",null,[m],[t]),this[h].ccall("wasm_set_content_length",null,[R],[new TextEncoder().encode(t).length])}#p(t){this[h].ccall("wasm_set_path_translated",null,[m],[t])}addServerGlobalEntry(t,e){this.#n[t]=e}#d(){for(const t in this.#n)this[h].ccall("wasm_add_SERVER_entry",null,[m,m],[t,this.#n[t]])}#f(t){const{key:e,name:r,type:s,data:o}=t,i=`/tmp/${Math.random().toFixed(20)}`;this.writeFile(i,o);const a=0;this[h].ccall("wasm_add_uploaded_file",null,[m,m,m,m,R,R],[e,r,s,i,a,o.byteLength])}#m(t){this[h].ccall("wasm_set_php_code",null,[m],[t])}async#w(){let t,e;try{t=await new Promise((o,i)=>{e=c=>{const l=new Error("Rethrown");l.cause=c.error,l.betterMessage=c.message,i(l)},this.#r?.addEventListener("error",e);const a=this[h].ccall("wasm_sapi_handle_request",R,[],[]);return a instanceof Promise?a.then(o,i):o(a)})}catch(o){for(const l in this)typeof this[l]=="function"&&(this[l]=()=>{throw new Error("PHP runtime has crashed – see the earlier error for details.")});this.functionsMaybeMissingFromAsyncify=jt();const i=o,a="betterMessage"in i?i.betterMessage:i.message,c=new Error(a);throw c.cause=i,c}finally{this.#r?.removeEventListener("error",e),this.#n={}}const{headers:r,httpStatusCode:s}=this.#o();return new E(s,r,this.readFileAsBuffer("/tmp/stdout"),this.readFileAsText("/tmp/stderr"),t)}mkdir(t){this[h].FS.mkdirTree(t)}mkdirTree(t){this.mkdir(t)}readFileAsText(t){return new TextDecoder().decode(this.readFileAsBuffer(t))}readFileAsBuffer(t){return this[h].FS.readFile(t)}writeFile(t,e){this[h].FS.writeFile(t,e)}unlink(t){this[h].FS.unlink(t)}mv(t,e){this[h].FS.rename(t,e)}rmdir(t,e={recursive:!0}){e?.recursive&&this.listFiles(t).forEach(r=>{const s=`${t}/${r}`;this.isDir(s)?this.rmdir(s,e):this.unlink(s)}),this[h].FS.rmdir(t)}listFiles(t,e={prependPath:!1}){if(!this.fileExists(t))return[];try{const r=this[h].FS.readdir(t).filter(s=>s!=="."&&s!=="..");if(e.prependPath){const s=t.replace(/\/$/,"");return r.map(o=>`${s}/${o}`)}return r}catch(r){return console.error(r,{path:t}),[]}}isDir(t){return this.fileExists(t)?this[h].FS.isDir(this[h].FS.lookupPath(t).node.mode):!1}fileExists(t){try{return this[h].FS.lookupPath(t),!0}catch{return!1}}}P([g('Could not create directory "{path}"')],y.prototype,"mkdir",1);P([g('Could not create directory "{path}"')],y.prototype,"mkdirTree",1);P([g('Could not read "{path}"')],y.prototype,"readFileAsText",1);P([g('Could not read "{path}"')],y.prototype,"readFileAsBuffer",1);P([g('Could not write to "{path}"')],y.prototype,"writeFile",1);P([g('Could not unlink "{path}"')],y.prototype,"unlink",1);P([g('Could not move "{path}"')],y.prototype,"mv",1);P([g('Could not remove directory "{path}"')],y.prototype,"rmdir",1);P([g('Could not list files in "{path}"')],y.prototype,"listFiles",1);P([g('Could not stat "{path}"')],y.prototype,"isDir",1);P([g('Could not stat "{path}"')],y.prototype,"fileExists",1);function bt(n){const t={};for(const e in n)t[e.toLowerCase()]=n[e];return t}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const _t=Symbol("Comlink.proxy"),ue=Symbol("Comlink.endpoint"),he=Symbol("Comlink.releaseProxy"),I=Symbol("Comlink.finalizer"),H=Symbol("Comlink.thrown"),Et=n=>typeof n=="object"&&n!==null||typeof n=="function",pe={canHandle:n=>Et(n)&&n[_t],serialize(n){const{port1:t,port2:e}=new MessageChannel;return L(n,t),[e,[e]]},deserialize(n){return n.start(),St(n)}},de={canHandle:n=>Et(n)&&H in n,serialize({value:n}){let t;return n instanceof Error?t={isError:!0,value:{message:n.message,name:n.name,stack:n.stack}}:t={isError:!1,value:n},[t,[]]},deserialize(n){throw n.isError?Object.assign(new Error(n.value.message),n.value):n.value}},F=new Map([["proxy",pe],["throw",de]]);function fe(n,t){for(const e of n)if(t===e||e==="*"||e instanceof RegExp&&e.test(t))return!0;return!1}function L(n,t=globalThis,e=["*"]){t.addEventListener("message",function r(s){if(!s||!s.data)return;if(!fe(e,s.origin)){console.warn(`Invalid origin '${s.origin}' for comlink proxy`);return}const{id:o,type:i,path:a}=Object.assign({path:[]},s.data),c=(s.data.argumentList||[]).map(_);let l;try{const p=a.slice(0,-1).reduce((d,w)=>d[w],n),u=a.reduce((d,w)=>d[w],n);switch(i){case"GET":l=u;break;case"SET":p[a.slice(-1)[0]]=_(s.data.value),l=!0;break;case"APPLY":l=u.apply(p,c);break;case"CONSTRUCT":{const d=new u(...c);l=vt(d)}break;case"ENDPOINT":{const{port1:d,port2:w}=new MessageChannel;L(n,w),l=Pe(d,[d])}break;case"RELEASE":l=void 0;break;default:return}}catch(p){l={value:p,[H]:0}}Promise.resolve(l).catch(p=>({value:p,[H]:0})).then(p=>{const[u,d]=U(p);t.postMessage(Object.assign(Object.assign({},u),{id:o}),d),i==="RELEASE"&&(t.removeEventListener("message",r),$t(t),I in n&&typeof n[I]=="function"&&n[I]())}).catch(p=>{const[u,d]=U({value:new TypeError("Unserializable return value"),[H]:0});t.postMessage(Object.assign(Object.assign({},u),{id:o}),d)})}),t.start&&t.start()}function me(n){return n.constructor.name==="MessagePort"}function $t(n){me(n)&&n.close()}function St(n,t){return B(n,[],t)}function q(n){if(n)throw new Error("Proxy has been released and is not useable")}function Rt(n){return T(n,{type:"RELEASE"}).then(()=>{$t(n)})}const O=new WeakMap,A="FinalizationRegistry"in globalThis&&new FinalizationRegistry(n=>{const t=(O.get(n)||0)-1;O.set(n,t),t===0&&Rt(n)});function we(n,t){const e=(O.get(t)||0)+1;O.set(t,e),A&&A.register(n,t,n)}function ye(n){A&&A.unregister(n)}function B(n,t=[],e=function(){}){let r=!1;const s=new Proxy(e,{get(o,i){if(q(r),i===he)return()=>{ye(s),Rt(n),r=!0};if(i==="then"){if(t.length===0)return{then:()=>s};const a=T(n,{type:"GET",path:t.map(c=>c.toString())}).then(_);return a.then.bind(a)}return B(n,[...t,i])},set(o,i,a){q(r);const[c,l]=U(a);return T(n,{type:"SET",path:[...t,i].map(p=>p.toString()),value:c},l).then(_)},apply(o,i,a){q(r);const c=t[t.length-1];if(c===ue)return T(n,{type:"ENDPOINT"}).then(_);if(c==="bind")return B(n,t.slice(0,-1));const[l,p]=lt(a);return T(n,{type:"APPLY",path:t.map(u=>u.toString()),argumentList:l},p).then(_)},construct(o,i){q(r);const[a,c]=lt(i);return T(n,{type:"CONSTRUCT",path:t.map(l=>l.toString()),argumentList:a},c).then(_)}});return we(s,n),s}function ge(n){return Array.prototype.concat.apply([],n)}function lt(n){const t=n.map(U);return[t.map(e=>e[0]),ge(t.map(e=>e[1]))]}const Tt=new WeakMap;function Pe(n,t){return Tt.set(n,t),n}function vt(n){return Object.assign(n,{[_t]:!0})}function be(n,t=globalThis,e="*"){return{postMessage:(r,s)=>n.postMessage(r,e,s),addEventListener:t.addEventListener.bind(t),removeEventListener:t.removeEventListener.bind(t)}}function U(n){for(const[t,e]of F)if(e.canHandle(n)){const[r,s]=e.serialize(n);return[{type:"HANDLER",name:t,value:r},s]}return[{type:"RAW",value:n},Tt.get(n)||[]]}function _(n){switch(n.type){case"HANDLER":return F.get(n.name).deserialize(n.value);case"RAW":return n.value}}function T(n,t,e){return new Promise(r=>{const s=_e();n.addEventListener("message",function o(i){!i.data||!i.data.id||i.data.id!==s||(n.removeEventListener("message",o),r(i.data))}),n.start&&n.start(),n.postMessage(Object.assign({id:s},t),e)})}function _e(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}function Ee(n,t){$e();const e=Promise.resolve();let r;const s=new Promise(a=>{r=a}),o=xt(n),i=new Proxy(o,{get:(a,c)=>c==="isConnected"?()=>e:c==="isReady"?()=>s:c in a?a[c]:t?.[c]});return L(i,typeof window<"u"?be(self.parent):void 0),[r,i]}let ut=!1;function $e(){ut||(ut=!0,F.set("EVENT",{canHandle:n=>n instanceof CustomEvent,serialize:n=>[{detail:n.detail},[]],deserialize:n=>n}),F.set("FUNCTION",{canHandle:n=>typeof n=="function",serialize(n){console.debug("[Comlink][Performance] Proxying a function");const{port1:t,port2:e}=new MessageChannel;return L(n,t),[e,[e]]},deserialize(n){return n.start(),St(n)}}),F.set("PHPResponse",{canHandle:n=>typeof n=="object"&&n!==null&&"headers"in n&&"bytes"in n&&"errors"in n&&"exitCode"in n&&"httpStatusCode"in n,serialize(n){return[n.toRawData(),[]]},deserialize(n){return E.fromRawData(n)}}))}function xt(n){return new Proxy(n,{get(t,e){switch(typeof t[e]){case"function":return(...r)=>t[e](...r);case"object":return t[e]===null?t[e]:xt(t[e]);case"undefined":case"number":case"string":return t[e];default:return vt(t[e])}}})}async function Se(n=Yt){switch(n){case"8.2":return await import("./assets/php_8_2-c07ae5e7.js");case"8.1":return await import("./assets/php_8_1-a5d5466e.js");case"8.0":return await import("./assets/php_8_0-0517cbd5.js");case"7.4":return await import("./assets/php_7_4-b53bbc37.js");case"7.3":return await import("./assets/php_7_3-f2e702cf.js");case"7.2":return await import("./assets/php_7_2-d9b02a06.js");case"7.1":return await import("./assets/php_7_1-5c6b1811.js");case"7.0":return await import("./assets/php_7_0-798fa875.js");case"5.6":return await import("./assets/php_5_6-af1ece15.js")}throw new Error(`Unsupported PHP version ${n}`)}class C extends y{static async load(t,e={}){return await C.loadSync(t,e).phpReady}static loadSync(t,e={}){const r=new C(void 0,e.requestHandler),o=(async()=>{const i=await Promise.all([Se(t),...e.dataModules||[]]),[a,...c]=i;e.downloadMonitor?.setModules(i);const l=await ie(a,{...e.emscriptenOptions||{},...e.downloadMonitor?.getEmscriptenOptions()||{}},c);r.initializeRuntime(l)})();return{php:r,phpReady:o.then(()=>r)}}}const f=new WeakMap;class Re{constructor(t,e){f.set(this,{php:t,monitor:e}),this.absoluteUrl=t.absoluteUrl,this.documentRoot=t.documentRoot}pathToInternalUrl(t){return f.get(this).php.pathToInternalUrl(t)}internalUrlToPath(t){return f.get(this).php.internalUrlToPath(t)}async onDownloadProgress(t){return f.get(this).monitor?.addEventListener("progress",t)}mv(t,e){return f.get(this).php.mv(t,e)}rmdir(t,e){return f.get(this).php.rmdir(t,e)}request(t,e){return f.get(this).php.request(t,e)}async run(t){return f.get(this).php.run(t)}chdir(t){return f.get(this).php.chdir(t)}setPhpIniPath(t){return f.get(this).php.setPhpIniPath(t)}setPhpIniEntry(t,e){return f.get(this).php.setPhpIniEntry(t,e)}mkdir(t){return f.get(this).php.mkdir(t)}mkdirTree(t){return f.get(this).php.mkdirTree(t)}readFileAsText(t){return f.get(this).php.readFileAsText(t)}readFileAsBuffer(t){return f.get(this).php.readFileAsBuffer(t)}writeFile(t,e){return f.get(this).php.writeFile(t,e)}unlink(t){return f.get(this).php.unlink(t)}listFiles(t,e){return f.get(this).php.listFiles(t,e)}isDir(t){return f.get(this).php.isDir(t)}fileExists(t){return f.get(this).php.fileExists(t)}onMessage(t){f.get(this).php.onMessage(t)}}function Ft(n){return n.pathname.startsWith("/scope:")}function Te(n,t){let e=new URL(n);if(Ft(e))if(t){const r=e.pathname.split("/");r[1]=`scope:${t}`,e.pathname=r.join("/")}else e=ve(e);else if(t){const r=e.pathname==="/"?"":e.pathname;e.pathname=`/scope:${t}${r}`}return e}function ve(n){if(!Ft(n))return n;const t=new URL(n),e=t.pathname.split("/");return t.pathname="/"+e.slice(2).join("/"),t}function xe(){const n={};return typeof self?.location?.href<"u"&&new URL(self.location.href).searchParams.forEach((e,r)=>{n[r]=e}),n}(function(){return typeof navigator<"u"&&navigator?.userAgent?.toLowerCase().indexOf("firefox")>-1?"iframe":"webworker"})();const Fe=5*1024*1024;class ke extends EventTarget{#t={};#e={};constructor(t=[]){super(),this.setModules(t),this.#r()}getEmscriptenOptions(){return{dataFileDownloads:this.#n()}}setModules(t){this.#t=t.reduce((e,r)=>{if(r.dependenciesTotalSize>0){const s="http://example.com/",i=new URL(r.dependencyFilename,s).pathname.split("/").pop();e[i]=Math.max(i in e?e[i]:0,r.dependenciesTotalSize)}return e},{}),this.#e=Object.fromEntries(Object.entries(this.#t).map(([e])=>[e,0]))}#r(){const t=WebAssembly.instantiateStreaming;WebAssembly.instantiateStreaming=async(e,...r)=>{const s=await e,o=s.url.substring(new URL(s.url).origin.length+1),i=qe(s,({detail:{loaded:a,total:c}})=>this.#s(o,a,c));return t(i,...r)}}#n(){const t=this,e={};return new Proxy(e,{set(r,s,o){return t.#s(s,o.loaded,o.total),r[s]=new Proxy(JSON.parse(JSON.stringify(o)),{set(i,a,c){return i[a]=c,t.#s(s,i.loaded,i.total),!0}}),!0}})}#s(t,e,r){const s=new URL(t,"http://example.com").pathname.split("/").pop();r||(r=this.#t[s]),s in this.#e||console.warn(`Registered a download #progress of an unregistered file "${s}". This may cause a sudden **decrease** in the #progress percentage as the total number of bytes increases during the download.`),this.#e[s]=e,this.dispatchEvent(new CustomEvent("progress",{detail:{loaded:ht(this.#e),total:ht(this.#t)}}))}}function ht(n){return Object.values(n).reduce((t,e)=>t+e,0)}function qe(n,t){const e=n.headers.get("content-length")||"",r=parseInt(e,10)||Fe;function s(o,i){t(new CustomEvent("progress",{detail:{loaded:o,total:i}}))}return new Response(new ReadableStream({async start(o){if(!n.body){o.close();return}const i=n.body.getReader();let a=0;for(;;)try{const{done:c,value:l}=await i.read();if(l&&(a+=l.byteLength),c){s(a,a),o.close();break}else s(a,r),o.enqueue(l)}catch(c){console.error({e:c}),o.error(c);break}}}),{status:n.status,statusText:n.statusText,headers:n.headers})}const He=new URL("/",(import.meta||{}).url).origin,$="/wordpress",Oe=n=>n.startsWith("/wp-content/uploads/")||n.startsWith("/wp-content/plugins/")||n.startsWith("/wp-content/mu-plugins/")||n.startsWith("/wp-content/themes/"),kt=["6.2","6.1","6.0","5.9"],Ae=kt[0],Ue=kt;function Ce(n){switch(n){case"5.9":return import("./assets/wp-5.9-c0f1e718.js");case"6.0":return import("./assets/wp-6.0-12c1ed4b.js");case"6.1":return import("./assets/wp-6.1-f6b7155e.js");case"6.2":return import("./assets/wp-6.2-1ebe9112.js")}throw new Error(`Unsupported WordPress module: ${n}`)}var Me=`<?php

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
`,Le=`<?php

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
`,De=`<?php
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
`,Ne=`<?php
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
`;function Ie(n){const t=new We(n,$);t.replaceRequestsTransports(),t.addMissingSvgs()}let We=class{constructor(t,e){this.php=t,this.wordpressPath=e}async replaceRequestsTransports(){await pt(this.php,`${this.wordpressPath}/wp-config.php`,e=>`${e} define('USE_FETCH_FOR_REQUESTS', false);`);const t=[`${this.wordpressPath}/wp-includes/Requests/Transport/fsockopen.php`,`${this.wordpressPath}/wp-includes/Requests/Transport/cURL.php`];for(const e of t)await this.php.fileExists(e)&&await pt(this.php,e,r=>r.replace("public static function test","public static function test( $capabilities = array() ) { return false; } public static function test2"));await this.php.mkdirTree(`${this.wordpressPath}/wp-content/mu-plugins/includes`),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_fetch.php`,Me),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_dummy.php`,Le),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/add_requests_transport.php`,De),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/1-show-admin-credentials-on-wp-login.php`,Ne)}async addMissingSvgs(){this.php.mkdirTree(`${this.wordpressPath}/wp-admin/images`);const t=[`${this.wordpressPath}/wp-admin/images/about-header-about.svg`,`${this.wordpressPath}/wp-admin/images/dashboard-background.svg`];for(const e of t)await this.php.fileExists(e)||await this.php.writeFile(e,"")}};async function pt(n,t,e){await n.writeFile(t,e(await n.readFileAsText(t)))}async function je(n,t,e){const s=n[h].FS;s.mkdirTree(e);const o=new G({concurrency:40}),i=[],a=[[t,e]];for(;a.length>0;){const[c,l]=a.pop();for await(const p of c.values()){const u=o.run(async()=>{const d=J(l,p.name);if(p.kind==="directory"){try{s.mkdir(d)}catch(w){if(w?.errno!==20)throw console.error(w),w}a.push([p,d])}else if(p.kind==="file"){const w=await p.getFile(),x=new Uint8Array(await w.arrayBuffer());s.createDataFile(d,null,x,!0,!0,!0)}i.splice(i.indexOf(u),1)});i.push(u)}for(;a.length===0&&i.length>0;)await Promise.any(i)}}async function qt(n,t,e){const s=n[h].FS;s.mkdirTree(e);const o=new G({concurrency:40}),i=[],a=[[Promise.resolve(t),e]];for(;a.length;){const[c,l]=a.pop(),p=await c;for(const u of s.readdir(l)){if(u==="."||u==="..")continue;const d=J(l,u),x=s.lookupPath(d,{follow:!0}).node,N=s.isDir(x.mode),Z=o.run(async()=>{if(N){const Dt=p.getDirectoryHandle(u,{create:!0});a.push([Dt,d])}else await Ht(p,u,s,d);i.splice(i.indexOf(Z),1)});i.push(Z)}for(;a.length===0&&i.length>0;)await Promise.any(i)}}async function Ht(n,t,e,r){let s;try{s=e.readFile(r,{encoding:"binary"})}catch{return}const i=await(await n.getFileHandle(t,{create:!0})).createSyncAccessHandle();try{await i.truncate(0),await i.write(s)}finally{await i.close()}}async function ze(n,t){try{return await n.getFileHandle(t),!0}catch{return!1}}async function k(n,t,e){let r="";await n.fileExists(t)&&(r=await n.readFileAsText(t)),await n.writeFile(t,e(r))}const dt="/vfs-blueprints",Be=async(n,{consts:t,virtualize:e=!1})=>{const r=await n.documentRoot,s=e?dt:r,o=`${s}/playground-consts.json`,i=`${s}/wp-config.php`;return e&&(n.mkdir(dt),n.setPhpIniEntry("auto_prepend_file",i)),await k(n,o,a=>JSON.stringify({...JSON.parse(a||"{}"),...t})),await k(n,i,a=>a.includes("playground-consts.json")?a:`<?php
	$consts = json_decode(file_get_contents('${o}'), true);
	foreach ($consts as $const => $value) {
		if (!defined($const)) {
			define($const, $value);
		}
	}
?>${a}`),i},Ot=async(n,t)=>{const e=new Ve(n,t.wordpressPath||"/wordpress",t.siteUrl);t.addPhpInfo===!0&&await e.addPhpInfo(),t.siteUrl&&await e.patchSiteUrl(),t.patchSecrets===!0&&await e.patchSecrets(),t.disableSiteHealth===!0&&await e.disableSiteHealth(),t.disableWpNewBlogNotification===!0&&await e.disableWpNewBlogNotification()};class Ve{constructor(t,e,r){this.php=t,this.scopedSiteUrl=r,this.wordpressPath=e}async addPhpInfo(){await this.php.writeFile(`${this.wordpressPath}/phpinfo.php`,"<?php phpinfo(); ")}async patchSiteUrl(){await Be(this.php,{consts:{WP_HOME:this.scopedSiteUrl,WP_SITEURL:this.scopedSiteUrl},virtualize:!0})}async patchSecrets(){await k(this.php,`${this.wordpressPath}/wp-config.php`,t=>`<?php
					define('AUTH_KEY',         '${b(40)}');
					define('SECURE_AUTH_KEY',  '${b(40)}');
					define('LOGGED_IN_KEY',    '${b(40)}');
					define('NONCE_KEY',        '${b(40)}');
					define('AUTH_SALT',        '${b(40)}');
					define('SECURE_AUTH_SALT', '${b(40)}');
					define('LOGGED_IN_SALT',   '${b(40)}');
					define('NONCE_SALT',       '${b(40)}');
				?>${t.replaceAll("', 'put your unique phrase here'","__', ''")}`)}async disableSiteHealth(){await k(this.php,`${this.wordpressPath}/wp-includes/default-filters.php`,t=>t.replace(/add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,""))}async disableWpNewBlogNotification(){await k(this.php,`${this.wordpressPath}/wp-config.php`,t=>`${t} function wp_new_blog_notification(...$args){} `)}}function b(n){const t="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?";let e="";for(let r=n;r>0;--r)e+=t[Math.floor(Math.random()*t.length)];return e}function Ge(n,t,e){const r=Y.createFor(n,t,e);return()=>{r.unbind()}}class Y{constructor(t,e,r){this.php=t,this.opfs=e,this.workingSet=new Set,this.entries=[],this.unbind=()=>{},this.memfsRoot=ft(r),this.FS=this.php[h].FS,this.reset()}static createFor(t,e,r){const s=t[h].FS;if(s.hasJournal)throw new Error("Journal already bound");s.hasJournal=!0;const o=new Y(t,e,r);return o.bind(),o}bind(){const t=this.FS,e=t.filesystems.MEMFS,r=this,s=t.write;t.write=function(u){return r.addEntry({type:"UPDATE",path:u.path,nodeType:"file"}),s(...arguments)};const o=e.ops_table.dir.node.rename;e.ops_table.dir.node.rename=function(u,d,w){const x=t.getPath(u),N=J(t.getPath(d),w);return r.addEntry({type:"RENAME",nodeType:t.isDir(u.mode)?"directory":"file",path:x,toPath:N}),o(...arguments)};const i=t.truncate;t.truncate=function(u){let d;return typeof u=="string"?d=t.lookupPath(u,{follow:!0}).node:d=u,r.addEntry({type:"UPDATE",path:t.getPath(d),nodeType:"file"}),i(...arguments)};const a=t.unlink;t.unlink=function(u){return r.addEntry({type:"DELETE",path:u,nodeType:"file"}),a(...arguments)};const c=t.mkdir;t.mkdir=function(u){return r.addEntry({type:"UPDATE",path:u,nodeType:"directory"}),c(...arguments)};const l=t.rmdir;t.rmdir=function(u){return r.addEntry({type:"DELETE",path:u,nodeType:"directory"}),l(...arguments)};const p=this.php.run;return this.php.run=async function(...u){const d=await p.apply(this,u);return await r.flush(),d},r.unbind=()=>{this.php.run=p,t.write=s,e.ops_table.dir.node.rename=o,t.truncate=i,t.unlink=a,t.mkdir=c,t.rmdir=l},r}addEntry(t){const e=this.entries[this.entries.length-1],r=e[e.length-1];if(t.type===r.type&&t.type!=="RENAME"){if(this.workingSet.has(t.path))return;this.workingSet.add(t.path),e.push(t)}else this.entries.push([t]),this.workingSet.clear()}async flush(){const t=this.entries.slice(1);this.reset();for(const e of t)await Je(e,async r=>{await this.processEntry(r)})}toOpfsPath(t){return ft(t.substring(this.memfsRoot.length))}async processEntry(t){if(!t.path.startsWith(this.memfsRoot)||t.path===this.memfsRoot)return;const e=this.toOpfsPath(t.path),r=await wt(this.opfs,e),s=mt(e);if(s)try{if(t.type==="DELETE")try{await r.removeEntry(s,{recursive:!0})}catch{}else if(t.type==="UPDATE")t.nodeType==="directory"?await r.getDirectoryHandle(s,{create:!0}):await Ht(r,s,this.FS,t.path);else if(t.type==="RENAME"&&t.toPath.startsWith(this.memfsRoot)){const o=this.toOpfsPath(t.toPath),i=await wt(this.opfs,o),a=mt(o);if(t.nodeType==="directory"){const c=await i.getDirectoryHandle(s,{create:!0});await qt(this.php,c,t.toPath),await r.removeEntry(s,{recursive:!0})}else(await r.getFileHandle(s)).move(i,a)}}catch(o){throw console.log({entry:t,name:s}),console.error(o),o}}reset(){this.entries=[[{type:"NOOP",path:""}]]}}function ft(n){return n.replace(/\/$/,"").replace(/\/\/+/g,"/")}function mt(n){return n.substring(n.lastIndexOf("/")+1)}async function wt(n,t){const e=t.replace(/^\/+|\/+$/g,"").replace(/\/+/,"/");if(!e)return n;const r=e.split("/");let s=n;for(let o=0;o<r.length-1;o++){const i=r[o];s=await s.getDirectoryHandle(i,{create:!0})}return s}async function Je(n,t){const e=[];for(const r of n)e.push(t(r));return await Promise.all(e)}const K=xe(),yt=(K.wpVersion||"").replace("_","."),At=Ue.includes(yt)?yt:Ae,gt=(K.phpVersion||"").replace("_","."),Ut=Kt.includes(gt)?gt:"8.0",X=K.persistent==="true"&&typeof navigator?.storage?.getDirectory<"u";let M,v,D=!1;X&&(M=await navigator.storage.getDirectory(),v=await M.getDirectoryHandle("wordpress",{create:!0}),D=await ze(v,"wp-config.php"));const Ct=Math.random().toFixed(16),Mt=Te(He,Ct).toString(),Lt=new ke,Q=Ce(At),{php:S,phpReady:Ye}=C.loadSync(Ut,{downloadMonitor:Lt,requestHandler:{documentRoot:$,absoluteUrl:Mt,isStaticFilePath:Oe},dataModules:D?[]:[Q]});class Ke extends Re{constructor(t,e,r,s,o){super(t,e),this.scope=r,this.wordPressVersion=s,this.phpVersion=o}async getWordPressModuleDetails(){const t=j(`${this.documentRoot}/wp-includes/version.php`),e=(await this.run({code:`<?php
				require(${t});
				echo substr($wp_version, 0, 3);
				`})).text;return{majorVersion:e,staticAssetsDirectory:`wp-${e.replace("_",".")}`,defaultTheme:(await Q)?.defaultThemeName}}async resetOpfs(){if(!M)throw new Error("No OPFS available.");await M.removeEntry(v.name,{recursive:!0})}}const[Xe]=Ee(new Ke(S,Lt,Ct,At,Ut));await Ye;(!X||!D)&&(await Q,Ie(S),await Ot(S,{wordpressPath:$,patchSecrets:!0,disableWpNewBlogNotification:!0,addPhpInfo:!0,disableSiteHealth:!0}));X&&(D?await je(S,v,$):await qt(S,v,$),Ge(S,v,$));await Ot(S,{wordpressPath:$,siteUrl:Mt});Xe();
