import{_ as m,a as Z,B as tt,l as et,b as E,S as V,g as nt,e as st,d as rt,L as at,f as it}from"./get-wordpress-module-0a0dc2a0.js";function F(...n){let t=n.join("/");const e=t.charAt(0)==="/",s=t.substring(t.length-1)==="/";return t=ot(t.split("/").filter(r=>!!r),!e).join("/"),!t&&!e&&(t="."),t&&s&&(t+="/"),(e?"/":"")+t}function ot(n,t){let e=0;for(let s=n.length-1;s>=0;s--){const r=n[s];r==="."?n.splice(s,1):r===".."?(n.splice(s,1),e++):e&&(n.splice(s,1),e--)}if(t)for(;e;e--)n.unshift("..");return n}const pt=Symbol("literal");function b(n){if(typeof n=="string")return n.startsWith("$")?n:JSON.stringify(n);if(typeof n=="number")return n.toString();if(Array.isArray(n))return`array(${n.map(b).join(", ")})`;if(n===null)return"null";if(typeof n=="object")return pt in n?n.toString():`array(${Object.entries(n).map(([e,s])=>`${JSON.stringify(e)} => ${b(s)}`).join(", ")})`;if(typeof n=="function")return n();throw new Error(`Unsupported value: ${n}`)}async function ct(n=Z){switch(n){case"8.2":return await m(()=>import("./php_8_2-c3d61548.js"),[]);case"8.1":return await m(()=>import("./php_8_1-873a2211.js"),[]);case"8.0":return await m(()=>import("./php_8_0-cd19fa0a.js"),[]);case"7.4":return await m(()=>import("./php_7_4-5cc8974f.js"),[]);case"7.3":return await m(()=>import("./php_7_3-2cf7f396.js"),[]);case"7.2":return await m(()=>import("./php_7_2-a856ce1b.js"),[]);case"7.1":return await m(()=>import("./php_7_1-92450372.js"),[]);case"7.0":return await m(()=>import("./php_7_0-fc58287f.js"),[]);case"5.6":return await m(()=>import("./php_5_6-b0d9fce7.js"),[])}throw new Error(`Unsupported PHP version ${n}`)}class T extends tt{static async load(t,e={}){return await T.loadSync(t,e).phpReady}static loadSync(t,e={}){const s=new T(void 0,e.requestHandler),i=(async()=>{const a=await Promise.all([ct(t),...e.dataModules||[]]),[o,...u]=a;e.downloadMonitor?.setModules(a);const h=await et(o,{...e.emscriptenOptions||{},...e.downloadMonitor?.getEmscriptenOptions()||{}},u);s.initializeRuntime(h)})();return{php:s,phpReady:i.then(()=>s)}}}const c=new WeakMap;class ut{constructor(t,e){c.set(this,{php:t,monitor:e}),this.absoluteUrl=t.absoluteUrl,this.documentRoot=t.documentRoot}pathToInternalUrl(t){return c.get(this).php.pathToInternalUrl(t)}internalUrlToPath(t){return c.get(this).php.internalUrlToPath(t)}async onDownloadProgress(t){return c.get(this).monitor?.addEventListener("progress",t)}mv(t,e){return c.get(this).php.mv(t,e)}rmdir(t,e){return c.get(this).php.rmdir(t,e)}request(t,e){return c.get(this).php.request(t,e)}async run(t){return c.get(this).php.run(t)}chdir(t){return c.get(this).php.chdir(t)}setPhpIniPath(t){return c.get(this).php.setPhpIniPath(t)}setPhpIniEntry(t,e){return c.get(this).php.setPhpIniEntry(t,e)}mkdir(t){return c.get(this).php.mkdir(t)}mkdirTree(t){return c.get(this).php.mkdirTree(t)}readFileAsText(t){return c.get(this).php.readFileAsText(t)}readFileAsBuffer(t){return c.get(this).php.readFileAsBuffer(t)}writeFile(t,e){return c.get(this).php.writeFile(t,e)}unlink(t){return c.get(this).php.unlink(t)}listFiles(t,e){return c.get(this).php.listFiles(t,e)}isDir(t){return c.get(this).php.isDir(t)}fileExists(t){return c.get(this).php.fileExists(t)}onMessage(t){c.get(this).php.onMessage(t)}}function j(n){return n.pathname.startsWith("/scope:")}function lt(n,t){let e=new URL(n);if(j(e))if(t){const s=e.pathname.split("/");s[1]=`scope:${t}`,e.pathname=s.join("/")}else e=ht(e);else if(t){const s=e.pathname==="/"?"":e.pathname;e.pathname=`/scope:${t}${s}`}return e}function ht(n){if(!j(n))return n;const t=new URL(n),e=t.pathname.split("/");return t.pathname="/"+e.slice(2).join("/"),t}function dt(){const n={};return typeof self?.location?.href<"u"&&new URL(self.location.href).searchParams.forEach((e,s)=>{n[s]=e}),n}const ft=5*1024*1024;class mt extends EventTarget{#t={};#e={};constructor(t=[]){super(),this.setModules(t),this.#s()}getEmscriptenOptions(){return{dataFileDownloads:this.#r()}}setModules(t){this.#t=t.reduce((e,s)=>{if(s.dependenciesTotalSize>0){const r="http://example.com/",a=new URL(s.dependencyFilename,r).pathname.split("/").pop();e[a]=Math.max(a in e?e[a]:0,s.dependenciesTotalSize)}return e},{}),this.#e=Object.fromEntries(Object.entries(this.#t).map(([e])=>[e,0]))}#s(){const t=WebAssembly.instantiateStreaming;WebAssembly.instantiateStreaming=async(e,...s)=>{const r=await e,i=r.url.substring(new URL(r.url).origin.length+1),a=wt(r,({detail:{loaded:o,total:u}})=>this.#n(i,o,u));return t(a,...s)}}#r(){const t=this,e={};return new Proxy(e,{set(s,r,i){return t.#n(r,i.loaded,i.total),s[r]=new Proxy(JSON.parse(JSON.stringify(i)),{set(a,o,u){return a[o]=u,t.#n(r,a.loaded,a.total),!0}}),!0}})}#n(t,e,s){const r=new URL(t,"http://example.com").pathname.split("/").pop();s||(s=this.#t[r]),r in this.#e||console.warn(`Registered a download #progress of an unregistered file "${r}". This may cause a sudden **decrease** in the #progress percentage as the total number of bytes increases during the download.`),this.#e[r]=e,this.dispatchEvent(new CustomEvent("progress",{detail:{loaded:H(this.#e),total:H(this.#t)}}))}}function H(n){return Object.values(n).reduce((t,e)=>t+e,0)}function wt(n,t){const e=n.headers.get("content-length")||"",s=parseInt(e,10)||ft;function r(i,a){t(new CustomEvent("progress",{detail:{loaded:i,total:a}}))}return new Response(new ReadableStream({async start(i){if(!n.body){i.close();return}const a=n.body.getReader();let o=0;for(;;)try{const{done:u,value:h}=await a.read();if(h&&(o+=h.byteLength),u){r(o,o),i.close();break}else r(o,s),i.enqueue(h)}catch(u){console.error({e:u}),i.error(u);break}}}),{status:n.status,statusText:n.statusText,headers:n.headers})}const yt=new URL("/",(import.meta||{}).url).origin,y="/wordpress",gt=n=>n.startsWith("/wp-content/uploads/")||n.startsWith("/wp-content/plugins/")||n.startsWith("/wp-content/mu-plugins/")||n.startsWith("/wp-content/themes/"),_t=`<?php

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
`,$t=`<?php

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
`,Pt=`<?php
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
`,Et=`<?php
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
`;function Tt(n){const t=new St(n,y);t.replaceRequestsTransports(),t.addMissingSvgs()}let St=class{constructor(t,e){this.php=t,this.wordpressPath=e}async replaceRequestsTransports(){await k(this.php,`${this.wordpressPath}/wp-config.php`,e=>`${e} define('USE_FETCH_FOR_REQUESTS', false);`);const t=[`${this.wordpressPath}/wp-includes/Requests/Transport/fsockopen.php`,`${this.wordpressPath}/wp-includes/Requests/Transport/cURL.php`];for(const e of t)await this.php.fileExists(e)&&await k(this.php,e,s=>s.replace("public static function test","public static function test( $capabilities = array() ) { return false; } public static function test2"));await this.php.mkdirTree(`${this.wordpressPath}/wp-content/mu-plugins/includes`),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_fetch.php`,_t),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_dummy.php`,$t),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/add_requests_transport.php`,Pt),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/1-show-admin-credentials-on-wp-login.php`,Et)}async addMissingSvgs(){this.php.mkdirTree(`${this.wordpressPath}/wp-admin/images`);const t=[`${this.wordpressPath}/wp-admin/images/about-header-about.svg`,`${this.wordpressPath}/wp-admin/images/dashboard-background.svg`];for(const e of t)await this.php.fileExists(e)||await this.php.writeFile(e,"")}};async function k(n,t,e){await n.writeFile(t,e(await n.readFileAsText(t)))}async function Rt(n,t,e){const r=n[E].FS;r.mkdirTree(e);const i=new V({concurrency:40}),a=[],o=[[t,e]];for(;o.length>0;){const[u,h]=o.pop();for await(const d of u.values()){const p=i.run(async()=>{const l=F(h,d.name);if(d.kind==="directory"){try{r.mkdir(l)}catch(f){if(f?.errno!==20)throw console.error(f),f}o.push([d,l])}else if(d.kind==="file"){const f=await d.getFile(),$=new Uint8Array(await f.arrayBuffer());r.createDataFile(l,null,$,!0,!0,!0)}a.splice(a.indexOf(p),1)});a.push(p)}for(;o.length===0&&a.length>0;)await Promise.any(a)}}async function C(n,t,e){const r=n[E].FS;r.mkdirTree(e);const i=new V({concurrency:40}),a=[],o=[[Promise.resolve(t),e]];for(;o.length;){const[u,h]=o.pop(),d=await u;for(const p of r.readdir(h)){if(p==="."||p==="..")continue;const l=F(h,p),$=r.lookupPath(l,{follow:!0}).node,q=r.isDir($.mode),U=i.run(async()=>{if(q){const Q=d.getDirectoryHandle(p,{create:!0});o.push([Q,l])}else await J(d,p,r,l);a.splice(a.indexOf(U),1)});a.push(U)}for(;o.length===0&&a.length>0;)await Promise.any(a)}}async function J(n,t,e,s){let r;try{r=e.readFile(s,{encoding:"binary"})}catch{return}const a=await(await n.getFileHandle(t,{create:!0})).createSyncAccessHandle();try{await a.truncate(0),await a.write(r)}finally{await a.close()}}async function qt(n,t){try{return await n.getFileHandle(t),!0}catch{return!1}}async function P(n,t,e){let s="";await n.fileExists(t)&&(s=await n.readFileAsText(t)),await n.writeFile(t,e(s))}const L="/vfs-blueprints",bt=async(n,{consts:t,virtualize:e=!1})=>{const s=await n.documentRoot,r=e?L:s,i=`${r}/playground-consts.json`,a=`${r}/wp-config.php`;return e&&(n.mkdir(L),n.setPhpIniEntry("auto_prepend_file",a)),await P(n,i,o=>JSON.stringify({...JSON.parse(o||"{}"),...t})),await P(n,a,o=>o.includes("playground-consts.json")?o:`<?php
	$consts = json_decode(file_get_contents('${i}'), true);
	foreach ($consts as $const => $value) {
		if (!defined($const)) {
			define($const, $value);
		}
	}
?>${o}`),a},B=async(n,t)=>{const e=new Ft(n,t.wordpressPath||"/wordpress",t.siteUrl);t.addPhpInfo===!0&&await e.addPhpInfo(),t.siteUrl&&await e.patchSiteUrl(),t.patchSecrets===!0&&await e.patchSecrets(),t.disableSiteHealth===!0&&await e.disableSiteHealth(),t.disableWpNewBlogNotification===!0&&await e.disableWpNewBlogNotification()};class Ft{constructor(t,e,s){this.php=t,this.scopedSiteUrl=s,this.wordpressPath=e}async addPhpInfo(){await this.php.writeFile(`${this.wordpressPath}/phpinfo.php`,"<?php phpinfo(); ")}async patchSiteUrl(){await bt(this.php,{consts:{WP_HOME:this.scopedSiteUrl,WP_SITEURL:this.scopedSiteUrl},virtualize:!0})}async patchSecrets(){await P(this.php,`${this.wordpressPath}/wp-config.php`,t=>`<?php
					define('AUTH_KEY',         '${w(40)}');
					define('SECURE_AUTH_KEY',  '${w(40)}');
					define('LOGGED_IN_KEY',    '${w(40)}');
					define('NONCE_KEY',        '${w(40)}');
					define('AUTH_SALT',        '${w(40)}');
					define('SECURE_AUTH_SALT', '${w(40)}');
					define('LOGGED_IN_SALT',   '${w(40)}');
					define('NONCE_SALT',       '${w(40)}');
				?>${t.replaceAll("', 'put your unique phrase here'","__', ''")}`)}async disableSiteHealth(){await P(this.php,`${this.wordpressPath}/wp-includes/default-filters.php`,t=>t.replace(/add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,""))}async disableWpNewBlogNotification(){await P(this.php,`${this.wordpressPath}/wp-config.php`,t=>`${t} function wp_new_blog_notification(...$args){} `)}}function w(n){const t="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?";let e="";for(let s=n;s>0;--s)e+=t[Math.floor(Math.random()*t.length)];return e}function Ot(n,t,e){const s=O.createFor(n,t,e);return()=>{s.unbind()}}class O{constructor(t,e,s){this.php=t,this.opfs=e,this.workingSet=new Set,this.entries=[],this.unbind=()=>{},this.memfsRoot=x(s),this.FS=this.php[E].FS,this.reset()}static createFor(t,e,s){const r=t[E].FS;if(r.hasJournal)throw new Error("Journal already bound");r.hasJournal=!0;const i=new O(t,e,s);return i.bind(),i}bind(){const t=this.FS,e=t.filesystems.MEMFS,s=this,r=t.write;t.write=function(p){return s.addEntry({type:"UPDATE",path:p.path,nodeType:"file"}),r(...arguments)};const i=e.ops_table.dir.node.rename;e.ops_table.dir.node.rename=function(p,l,f){const $=t.getPath(p),q=F(t.getPath(l),f);return s.addEntry({type:"RENAME",nodeType:t.isDir(p.mode)?"directory":"file",path:$,toPath:q}),i(...arguments)};const a=t.truncate;t.truncate=function(p){let l;return typeof p=="string"?l=t.lookupPath(p,{follow:!0}).node:l=p,s.addEntry({type:"UPDATE",path:t.getPath(l),nodeType:"file"}),a(...arguments)};const o=t.unlink;t.unlink=function(p){return s.addEntry({type:"DELETE",path:p,nodeType:"file"}),o(...arguments)};const u=t.mkdir;t.mkdir=function(p){return s.addEntry({type:"UPDATE",path:p,nodeType:"directory"}),u(...arguments)};const h=t.rmdir;t.rmdir=function(p){return s.addEntry({type:"DELETE",path:p,nodeType:"directory"}),h(...arguments)};const d=this.php.run;return this.php.run=async function(...p){const l=await d.apply(this,p);return await s.flush(),l},s.unbind=()=>{this.php.run=d,t.write=r,e.ops_table.dir.node.rename=i,t.truncate=a,t.unlink=o,t.mkdir=u,t.rmdir=h},s}addEntry(t){const e=this.entries[this.entries.length-1],s=e[e.length-1];if(t.type===s.type&&t.type!=="RENAME"){if(this.workingSet.has(t.path))return;this.workingSet.add(t.path),e.push(t)}else this.entries.push([t]),this.workingSet.clear()}async flush(){const t=this.entries.slice(1);this.reset();for(const e of t)await At(e,async s=>{await this.processEntry(s)})}toOpfsPath(t){return x(t.substring(this.memfsRoot.length))}async processEntry(t){if(!t.path.startsWith(this.memfsRoot)||t.path===this.memfsRoot)return;const e=this.toOpfsPath(t.path),s=await I(this.opfs,e),r=M(e);if(r)try{if(t.type==="DELETE")try{await s.removeEntry(r,{recursive:!0})}catch{}else if(t.type==="UPDATE")t.nodeType==="directory"?await s.getDirectoryHandle(r,{create:!0}):await J(s,r,this.FS,t.path);else if(t.type==="RENAME"&&t.toPath.startsWith(this.memfsRoot)){const i=this.toOpfsPath(t.toPath),a=await I(this.opfs,i),o=M(i);if(t.nodeType==="directory"){const u=await a.getDirectoryHandle(r,{create:!0});await C(this.php,u,t.toPath),await s.removeEntry(r,{recursive:!0})}else(await s.getFileHandle(r)).move(a,o)}}catch(i){throw console.log({entry:t,name:r}),console.error(i),i}}reset(){this.entries=[[{type:"NOOP",path:""}]]}}function x(n){return n.replace(/\/$/,"").replace(/\/\/+/g,"/")}function M(n){return n.substring(n.lastIndexOf("/")+1)}async function I(n,t){const e=t.replace(/^\/+|\/+$/g,"").replace(/\/+/,"/");if(!e)return n;const s=e.split("/");let r=n;for(let i=0;i<s.length-1;i++){const a=s[i];r=await r.getDirectoryHandle(a,{create:!0})}return r}async function At(n,t){const e=[];for(const s of n)e.push(t(s));return await Promise.all(e)}const A=dt(),W=(A.wpVersion||"").replace("_","."),z=rt.includes(W)?W:at,N=(A.phpVersion||"").replace("_","."),K=it.includes(N)?N:"8.0",D=A.persistent==="true"&&typeof navigator?.storage?.getDirectory<"u";let S,_,R=!1;D&&(S=await navigator.storage.getDirectory(),_=await S.getDirectoryHandle("wordpress",{create:!0}),R=await qt(_,"wp-config.php"));const Y=Math.random().toFixed(16),G=lt(yt,Y).toString(),X=new mt,v=nt(z),{php:g,phpReady:Dt}=T.loadSync(K,{downloadMonitor:X,requestHandler:{documentRoot:y,absoluteUrl:G,isStaticFilePath:gt},dataModules:R?[]:[v]});class vt extends ut{constructor(t,e,s,r,i){super(t,e),this.scope=s,this.wordPressVersion=r,this.phpVersion=i}async getWordPressModuleDetails(){const t=b(`${this.documentRoot}/wp-includes/version.php`),e=(await this.run({code:`<?php
				require(${t});
				echo substr($wp_version, 0, 3);
				`})).text;return{majorVersion:e,staticAssetsDirectory:`wp-${e.replace("_",".")}`,defaultTheme:(await v)?.defaultThemeName}}async resetOpfs(){if(!S)throw new Error("No OPFS available.");await S.removeEntry(_.name,{recursive:!0})}}const[Ut]=st(new vt(g,X,Y,z,K));await Dt;(!D||!R)&&(await v,Tt(g),await B(g,{wordpressPath:y,patchSecrets:!0,disableWpNewBlogNotification:!0,addPhpInfo:!0,disableSiteHealth:!0}));D&&(R?await Rt(g,_,y):await C(g,_,y),Ot(g,_,y));await B(g,{wordpressPath:y,siteUrl:G});Ut();
