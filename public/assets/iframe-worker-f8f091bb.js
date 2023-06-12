import{_ as d,a as E,B as v,l as x,g as L,e as F,S as U,L as O,b as D}from"./get-wordpress-module-f652af8f.js";async function M(s=E){switch(s){case"8.2":return await d(()=>import("./php_8_2-c3d61548.js"),[]);case"8.1":return await d(()=>import("./php_8_1-873a2211.js"),[]);case"8.0":return await d(()=>import("./php_8_0-cd19fa0a.js"),[]);case"7.4":return await d(()=>import("./php_7_4-5cc8974f.js"),[]);case"7.3":return await d(()=>import("./php_7_3-2cf7f396.js"),[]);case"7.2":return await d(()=>import("./php_7_2-a856ce1b.js"),[]);case"7.1":return await d(()=>import("./php_7_1-92450372.js"),[]);case"7.0":return await d(()=>import("./php_7_0-fc58287f.js"),[]);case"5.6":return await d(()=>import("./php_5_6-b0d9fce7.js"),[])}throw new Error(`Unsupported PHP version ${s}`)}class h extends v{static async load(t,e={}){return await h.loadSync(t,e).phpReady}static loadSync(t,e={}){const n=new h(void 0,e.requestHandler),i=(async()=>{const o=await Promise.all([M(t),...e.dataModules||[]]),[u,...p]=o;e.downloadMonitor?.setModules(o);const l=await x(u,{...e.emscriptenOptions||{},...e.downloadMonitor?.getEmscriptenOptions()||{}},p);return n.initializeRuntime(l),{dataModules:p}})();return{php:n,phpReady:i.then(()=>n),dataModules:i.then(o=>o.dataModules)}}}const r=new WeakMap;class W{constructor(t,e){r.set(this,{php:t,monitor:e}),this.absoluteUrl=t.absoluteUrl,this.documentRoot=t.documentRoot}pathToInternalUrl(t){return r.get(this).php.pathToInternalUrl(t)}internalUrlToPath(t){return r.get(this).php.internalUrlToPath(t)}async onDownloadProgress(t){return r.get(this).monitor?.addEventListener("progress",t)}mv(t,e){return r.get(this).php.mv(t,e)}rmdir(t,e){return r.get(this).php.rmdir(t,e)}request(t,e){return r.get(this).php.request(t,e)}async run(t){return r.get(this).php.run(t)}chdir(t){return r.get(this).php.chdir(t)}setPhpIniPath(t){return r.get(this).php.setPhpIniPath(t)}setPhpIniEntry(t,e){return r.get(this).php.setPhpIniEntry(t,e)}mkdir(t){return r.get(this).php.mkdir(t)}mkdirTree(t){return r.get(this).php.mkdirTree(t)}readFileAsText(t){return r.get(this).php.readFileAsText(t)}readFileAsBuffer(t){return r.get(this).php.readFileAsBuffer(t)}writeFile(t,e){return r.get(this).php.writeFile(t,e)}unlink(t){return r.get(this).php.unlink(t)}listFiles(t,e){return r.get(this).php.listFiles(t,e)}isDir(t){return r.get(this).php.isDir(t)}fileExists(t){return r.get(this).php.fileExists(t)}onMessage(t){r.get(this).php.onMessage(t)}}function g(s){return s.pathname.startsWith("/scope:")}function H(s,t){let e=new URL(s);if(g(e))if(t){const n=e.pathname.split("/");n[1]=`scope:${t}`,e.pathname=n.join("/")}else e=I(e);else if(t){const n=e.pathname==="/"?"":e.pathname;e.pathname=`/scope:${t}${n}`}return e}function I(s){if(!g(s))return s;const t=new URL(s),e=t.pathname.split("/");return t.pathname="/"+e.slice(2).join("/"),t}function A(){const s={};return typeof self?.location?.href<"u"&&new URL(self.location.href).searchParams.forEach((e,n)=>{s[n]=e}),s}const V=5*1024*1024;class k extends EventTarget{#t={};#e={};constructor(t=[]){super(),this.setModules(t),this.#n()}getEmscriptenOptions(){return{dataFileDownloads:this.#r()}}setModules(t){this.#t=t.reduce((e,n)=>{if(n.dependenciesTotalSize>0){const a="http://example.com/",o=new URL(n.dependencyFilename,a).pathname.split("/").pop();e[o]=Math.max(o in e?e[o]:0,n.dependenciesTotalSize)}return e},{}),this.#e=Object.fromEntries(Object.entries(this.#t).map(([e])=>[e,0]))}#n(){const t=WebAssembly.instantiateStreaming;WebAssembly.instantiateStreaming=async(e,...n)=>{const a=await e,i=a.url.substring(new URL(a.url).origin.length+1),o=N(a,({detail:{loaded:u,total:p}})=>this.#s(i,u,p));return t(o,...n)}}#r(){const t=this,e={};return new Proxy(e,{set(n,a,i){return t.#s(a,i.loaded,i.total),n[a]=new Proxy(JSON.parse(JSON.stringify(i)),{set(o,u,p){return o[u]=p,t.#s(a,o.loaded,o.total),!0}}),!0}})}#s(t,e,n){const a=new URL(t,"http://example.com").pathname.split("/").pop();n||(n=this.#t[a]),a in this.#e||console.warn(`Registered a download #progress of an unregistered file "${a}". This may cause a sudden **decrease** in the #progress percentage as the total number of bytes increases during the download.`),this.#e[a]=e,this.dispatchEvent(new CustomEvent("progress",{detail:{loaded:w(this.#e),total:w(this.#t)}}))}}function w(s){return Object.values(s).reduce((t,e)=>t+e,0)}function N(s,t){const e=s.headers.get("content-length")||"",n=parseInt(e,10)||V;function a(i,o){t(new CustomEvent("progress",{detail:{loaded:i,total:o}}))}return new Response(new ReadableStream({async start(i){if(!s.body){i.close();return}const o=s.body.getReader();let u=0;for(;;)try{const{done:p,value:l}=await o.read();if(l&&(u+=l.byteLength),p){a(u,u),i.close();break}else a(u,n),i.enqueue(l)}catch(p){console.error({e:p}),i.error(p);break}}}),{status:s.status,statusText:s.statusText,headers:s.headers})}const j=new URL("/",(import.meta||{}).url).origin,f="/wordpress",C=s=>s.startsWith("/wp-content/uploads/")||s.startsWith("/wp-content/plugins/")||s.startsWith("/wp-content/mu-plugins/")||s.startsWith("/wp-content/themes/"),B=`<?php

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
`,J=`<?php

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
`,z=`<?php
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
`,X=`<?php
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
`;async function c(s,t,e){let n="";await s.fileExists(t)&&(n=await s.readFileAsText(t)),await s.writeFile(t,e(n))}const Q=async(s,t)=>{const e=new Z(s,t.siteUrl,t.wordpressPath||"/wordpress");t.patchSqlitePlugin!==!1&&await e.patchSqlitePlugin(),t.addPhpInfo!==!1&&await e.addPhpInfo(),t.patchSiteUrl!==!1&&await e.patchSiteUrl(),t.disableSiteHealth!==!1&&await e.disableSiteHealth(),t.disableWpNewBlogNotification!==!1&&await e.disableWpNewBlogNotification()};let Z=class{constructor(t,e,n){this.php=t,this.scopedSiteUrl=e,this.wordpressPath=n}async patchSqlitePlugin(){await c(this.php,`${this.wordpressPath}/wp-content/plugins/sqlite-database-integration/wp-includes/sqlite/class-wp-sqlite-translator.php`,t=>t.replace("if ( false === strtotime( $value ) )",'if ( $value === "0000-00-00 00:00:00" || false === strtotime( $value ) )'))}async addPhpInfo(){await this.php.writeFile(`${this.wordpressPath}/phpinfo.php`,"<?php phpinfo(); ")}async patchSiteUrl(){await c(this.php,`${this.wordpressPath}/wp-config.php`,t=>`<?php
				if(!defined('WP_HOME')) {
					define('WP_HOME', "${this.scopedSiteUrl}");
					define('WP_SITEURL', "${this.scopedSiteUrl}");
				}
				?>${t}`)}async disableSiteHealth(){await c(this.php,`${this.wordpressPath}/wp-includes/default-filters.php`,t=>t.replace(/add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,""))}async disableWpNewBlogNotification(){await c(this.php,`${this.wordpressPath}/wp-config.php`,t=>`${t} function wp_new_blog_notification(...$args){} `)}};function K(s,t){const e=new G(s,t,f);e.replaceRequestsTransports(),e.addMissingSvgs(),Q(s,{siteUrl:t,wordpressPath:f})}class G{constructor(t,e,n){this.php=t,this.scopedSiteUrl=e,this.wordpressPath=n}async replaceRequestsTransports(){await m(this.php,`${this.wordpressPath}/wp-config.php`,e=>`${e} define('USE_FETCH_FOR_REQUESTS', false);`);const t=[`${this.wordpressPath}/wp-includes/Requests/Transport/fsockopen.php`,`${this.wordpressPath}/wp-includes/Requests/Transport/cURL.php`];for(const e of t)await this.php.fileExists(e)&&await m(this.php,e,n=>n.replace("public static function test","public static function test( $capabilities = array() ) { return false; } public static function test2"));await this.php.mkdirTree(`${this.wordpressPath}/wp-content/mu-plugins/includes`),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_fetch.php`,B),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/includes/requests_transport_dummy.php`,J),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/add_requests_transport.php`,z),await this.php.writeFile(`${this.wordpressPath}/wp-content/mu-plugins/1-show-admin-credentials-on-wp-login.php`,X)}async addMissingSvgs(){this.php.mkdirTree(`${this.wordpressPath}/wp-admin/images`);const t=[`${this.wordpressPath}/wp-admin/images/about-header-about.svg`,`${this.wordpressPath}/wp-admin/images/dashboard-background.svg`];for(const e of t)await this.php.fileExists(e)||await this.php.writeFile(e,"")}}async function m(s,t,e){await s.writeFile(t,e(await s.readFileAsText(t)))}const y=A(),_=(y.wpVersion||"").replace("_","."),P=U.includes(_)?_:O,$=(y.phpVersion||"").replace("_","."),q=D.includes($)?$:"8.0",R=Math.random().toFixed(16),T=H(j,R).toString(),b=new k,{php:S,phpReady:Y,dataModules:tt}=h.loadSync(q,{downloadMonitor:b,requestHandler:{documentRoot:f,absoluteUrl:T,isStaticFilePath:C},dataModules:[L(P)]});class et extends W{constructor(t,e,n,a,i){super(t,e),this.scope=n,this.wordPressVersion=a,this.phpVersion=i}async getWordPressModuleDetails(){return{staticAssetsDirectory:`wp-${(await this.wordPressVersion).replace("_",".")}`,defaultTheme:nt?.defaultThemeName}}}const[st]=F(new et(S,b,R,P,q));await Y;const nt=(await tt)[0];K(S,T);st();
