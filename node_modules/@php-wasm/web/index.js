const W = Symbol("error"), $ = Symbol("message");
class I extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(e, r = {}) {
    super(e), this[W] = r.error === void 0 ? null : r.error, this[$] = r.message === void 0 ? "" : r.message;
  }
  get error() {
    return this[W];
  }
  get message() {
    return this[$];
  }
}
Object.defineProperty(I.prototype, "error", { enumerable: !0 });
Object.defineProperty(I.prototype, "message", { enumerable: !0 });
const oe = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : I;
function ae(t) {
  return t instanceof Error ? "exitCode" in t && t?.exitCode === 0 || t?.name === "ExitStatus" && "status" in t && t.status === 0 : !1;
}
class ce extends EventTarget {
  constructor() {
    super(...arguments), this.listenersCount = 0;
  }
  addEventListener(e, r) {
    ++this.listenersCount, super.addEventListener(e, r);
  }
  removeEventListener(e, r) {
    --this.listenersCount, super.removeEventListener(e, r);
  }
  hasListeners() {
    return this.listenersCount > 0;
  }
}
function le(t) {
  t.asm = {
    ...t.asm
  };
  const e = new ce();
  for (const r in t.asm)
    if (typeof t.asm[r] == "function") {
      const n = t.asm[r];
      t.asm[r] = function(...s) {
        try {
          return n(...s);
        } catch (o) {
          if (!(o instanceof Error))
            throw o;
          const i = he(
            o,
            t.lastAsyncifyStackSource?.stack
          );
          if (t.lastAsyncifyStackSource && (o.cause = t.lastAsyncifyStackSource), e.hasListeners()) {
            e.dispatchEvent(
              new oe("error", {
                error: o,
                message: i
              })
            );
            return;
          }
          throw ae(o) || pe(i), o;
        }
      };
    }
  return e;
}
let O = [];
function ue() {
  return O;
}
function he(t, e) {
  if (t.message === "unreachable") {
    let r = de;
    e || (r += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), O = me(
      e || t.stack || ""
    );
    for (const n of O)
      r += `    * ${n}
`;
    return r;
  }
  return t.message;
}
const de = `
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

`, D = "\x1B[41m", fe = "\x1B[1m", q = "\x1B[0m", z = "\x1B[K";
let B = !1;
function pe(t) {
  if (!B) {
    B = !0, console.log(`${D}
${z}
${fe}  WASM ERROR${q}${D}`);
    for (const e of t.split(`
`))
      console.log(`${z}  ${e} `);
    console.log(`${q}`);
  }
}
function me(t) {
  try {
    const e = t.split(`
`).slice(1).map((r) => {
      const n = r.trim().substring(3).split(" ");
      return {
        fn: n.length >= 2 ? n[0] : "<unknown>",
        isWasm: r.includes("wasm://")
      };
    }).filter(
      ({ fn: r, isWasm: n }) => n && !r.startsWith("dynCall_") && !r.startsWith("invoke_")
    ).map(({ fn: r }) => r);
    return Array.from(new Set(e));
  } catch {
    return [];
  }
}
class b {
  constructor(e, r, n, s = "", o = 0) {
    this.httpStatusCode = e, this.headers = r, this.bytes = n, this.exitCode = o, this.errors = s;
  }
  static fromRawData(e) {
    return new b(
      e.httpStatusCode,
      e.headers,
      e.bytes,
      e.errors,
      e.exitCode
    );
  }
  toRawData() {
    return {
      headers: this.headers,
      bytes: this.bytes,
      errors: this.errors,
      exitCode: this.exitCode,
      httpStatusCode: this.httpStatusCode
    };
  }
  /**
   * Response body as JSON.
   */
  get json() {
    return JSON.parse(this.text);
  }
  /**
   * Response body as text.
   */
  get text() {
    return new TextDecoder().decode(this.bytes);
  }
}
const ge = [
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "5.6"
], ye = ge[0];
class we {
  #e;
  #t;
  /**
   * @param  server - The PHP server to browse.
   * @param  config - The browser configuration.
   */
  constructor(e, r = {}) {
    this.requestHandler = e, this.#e = {}, this.#t = {
      handleRedirects: !1,
      maxRedirects: 4,
      ...r
    };
  }
  /**
   * Sends the request to the server.
   *
   * When cookies are present in the response, this method stores
   * them and sends them with any subsequent requests.
   *
   * When a redirection is present in the response, this method
   * follows it by discarding a response and sending a subsequent
   * request.
   *
   * @param  request   - The request.
   * @param  redirects - Internal. The number of redirects handled so far.
   * @returns PHPRequestHandler response.
   */
  async request(e, r = 0) {
    const n = await this.requestHandler.request({
      ...e,
      headers: {
        ...e.headers,
        cookie: this.#r()
      }
    });
    if (n.headers["set-cookie"] && this.#n(n.headers["set-cookie"]), this.#t.handleRedirects && n.headers.location && r < this.#t.maxRedirects) {
      const s = new URL(
        n.headers.location[0],
        this.requestHandler.absoluteUrl
      );
      return this.request(
        {
          url: s.toString(),
          method: "GET",
          headers: {}
        },
        r + 1
      );
    }
    return n;
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return this.requestHandler.pathToInternalUrl(e);
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    return this.requestHandler.internalUrlToPath(e);
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.requestHandler.absoluteUrl;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.requestHandler.documentRoot;
  }
  #n(e) {
    for (const r of e)
      try {
        if (!r.includes("="))
          continue;
        const n = r.indexOf("="), s = r.substring(0, n), o = r.substring(n + 1).split(";")[0];
        this.#e[s] = o;
      } catch (n) {
        console.error(n);
      }
  }
  #r() {
    const e = [];
    for (const r in this.#e)
      e.push(`${r}=${this.#e[r]}`);
    return e.join("; ");
  }
}
class Pe {
  constructor({ concurrency: e }) {
    this._running = 0, this.concurrency = e, this.queue = [];
  }
  get running() {
    return this._running;
  }
  async acquire() {
    for (; ; )
      if (this._running >= this.concurrency)
        await new Promise((e) => this.queue.push(e));
      else {
        this._running++;
        let e = !1;
        return () => {
          e || (e = !0, this._running--, this.queue.length > 0 && this.queue.shift()());
        };
      }
  }
  async run(e) {
    const r = await this.acquire();
    try {
      return await e();
    } finally {
      r();
    }
  }
}
const be = "http://example.com";
function j(t) {
  return t.toString().substring(t.origin.length);
}
function G(t, e) {
  return !e || !t.startsWith(e) ? t : t.substring(e.length);
}
function Ee(t, e) {
  return !e || t.startsWith(e) ? t : e + t;
}
class Re {
  #e;
  #t;
  #n;
  #r;
  #i;
  #s;
  #o;
  #a;
  #c;
  /**
   * @param  php    - The PHP instance.
   * @param  config - Request Handler configuration.
   */
  constructor(e, r = {}) {
    this.#a = new Pe({ concurrency: 1 });
    const {
      documentRoot: n = "/www/",
      absoluteUrl: s = typeof location == "object" ? location?.href : "",
      isStaticFilePath: o = () => !1
    } = r;
    this.php = e, this.#e = n, this.#c = o;
    const i = new URL(s);
    this.#n = i.hostname, this.#r = i.port ? Number(i.port) : i.protocol === "https:" ? 443 : 80, this.#t = (i.protocol || "").replace(":", "");
    const c = this.#r !== 443 && this.#r !== 80;
    this.#i = [
      this.#n,
      c ? `:${this.#r}` : ""
    ].join(""), this.#s = i.pathname.replace(/\/+$/, ""), this.#o = [
      `${this.#t}://`,
      this.#i,
      this.#s
    ].join("");
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return `${this.absoluteUrl}${e}`;
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    const r = new URL(e);
    return r.pathname.startsWith(this.#s) && (r.pathname = r.pathname.slice(this.#s.length)), j(r);
  }
  get isRequestRunning() {
    return this.#a.running > 0;
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.#o;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.#e;
  }
  /** @inheritDoc */
  async request(e) {
    const r = e.url.startsWith("http://") || e.url.startsWith("https://"), n = new URL(
      e.url,
      r ? void 0 : be
    ), s = G(
      n.pathname,
      this.#s
    );
    return this.#c(s) ? this.#l(s) : await this.#u(e, n);
  }
  /**
   * Serves a static file from the PHP filesystem.
   *
   * @param  path - The requested static file path.
   * @returns The response.
   */
  #l(e) {
    const r = `${this.#e}${e}`;
    if (!this.php.fileExists(r))
      return new b(
        404,
        {},
        new TextEncoder().encode("404 File not found")
      );
    const n = this.php.readFileAsBuffer(r);
    return new b(
      200,
      {
        "content-length": [`${n.byteLength}`],
        // @TODO: Infer the content-type from the arrayBuffer instead of the file path.
        //        The code below won't return the correct mime-type if the extension
        //        was tampered with.
        "content-type": [ve(r)],
        "accept-ranges": ["bytes"],
        "cache-control": ["public, max-age=0"]
      },
      n
    );
  }
  /**
   * Runs the requested PHP file with all the request and $_SERVER
   * superglobals populated.
   *
   * @param  request - The request.
   * @returns The response.
   */
  async #u(e, r) {
    const n = await this.#a.acquire();
    try {
      this.php.addServerGlobalEntry("DOCUMENT_ROOT", this.#e), this.php.addServerGlobalEntry(
        "HTTPS",
        this.#o.startsWith("https://") ? "on" : ""
      );
      let s = "GET";
      const o = {
        host: this.#i,
        ...Q(e.headers || {})
      }, i = [];
      if (e.files && Object.keys(e.files).length) {
        s = "POST";
        for (const a in e.files) {
          const h = e.files[a];
          i.push({
            key: a,
            name: h.name,
            type: h.type,
            data: new Uint8Array(await h.arrayBuffer())
          });
        }
        o["content-type"]?.startsWith("multipart/form-data") && (e.formData = ke(
          e.body || ""
        ), o["content-type"] = "application/x-www-form-urlencoded", delete e.body);
      }
      let c;
      e.formData !== void 0 ? (s = "POST", o["content-type"] = o["content-type"] || "application/x-www-form-urlencoded", c = new URLSearchParams(
        e.formData
      ).toString()) : c = e.body;
      let l;
      try {
        l = this.#h(r.pathname);
      } catch {
        return new b(
          404,
          {},
          new TextEncoder().encode("404 File not found")
        );
      }
      return await this.php.run({
        relativeUri: Ee(
          j(r),
          this.#s
        ),
        protocol: this.#t,
        method: e.method || s,
        body: c,
        fileInfos: i,
        scriptPath: l,
        headers: o
      });
    } finally {
      n();
    }
  }
  /**
   * Resolve the requested path to the filesystem path of the requested PHP file.
   *
   * Fall back to index.php as if there was a url rewriting rule in place.
   *
   * @param  requestedPath - The requested pathname.
   * @throws {Error} If the requested path doesn't exist.
   * @returns The resolved filesystem path.
   */
  #h(e) {
    let r = G(e, this.#s);
    r.includes(".php") ? r = r.split(".php")[0] + ".php" : (r.endsWith("/") || (r += "/"), r.endsWith("index.php") || (r += "index.php"));
    const n = `${this.#e}${r}`;
    if (this.php.fileExists(n))
      return n;
    if (!this.php.fileExists(`${this.#e}/index.php`))
      throw new Error(`File not found: ${n}`);
    return `${this.#e}/index.php`;
  }
}
function ke(t) {
  const e = {}, r = t.match(/--(.*)\r\n/);
  if (!r)
    return e;
  const n = r[1], s = t.split(`--${n}`);
  return s.shift(), s.pop(), s.forEach((o) => {
    const i = o.indexOf(`\r
\r
`), c = o.substring(0, i).trim(), l = o.substring(i + 4).trim(), a = c.match(/name="([^"]+)"/);
    if (a) {
      const h = a[1];
      e[h] = l;
    }
  }), e;
}
function ve(t) {
  switch (t.split(".").pop()) {
    case "css":
      return "text/css";
    case "js":
      return "application/javascript";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "otf":
      return "font/otf";
    case "eot":
      return "font/eot";
    case "ico":
      return "image/x-icon";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "xml":
      return "application/xml";
    case "txt":
    case "md":
      return "text/plain";
    default:
      return "application-octet-stream";
  }
}
const V = {
  0: "No error occurred. System call completed successfully.",
  1: "Argument list too long.",
  2: "Permission denied.",
  3: "Address in use.",
  4: "Address not available.",
  5: "Address family not supported.",
  6: "Resource unavailable, or operation would block.",
  7: "Connection already in progress.",
  8: "Bad file descriptor.",
  9: "Bad message.",
  10: "Device or resource busy.",
  11: "Operation canceled.",
  12: "No child processes.",
  13: "Connection aborted.",
  14: "Connection refused.",
  15: "Connection reset.",
  16: "Resource deadlock would occur.",
  17: "Destination address required.",
  18: "Mathematics argument out of domain of function.",
  19: "Reserved.",
  20: "File exists.",
  21: "Bad address.",
  22: "File too large.",
  23: "Host is unreachable.",
  24: "Identifier removed.",
  25: "Illegal byte sequence.",
  26: "Operation in progress.",
  27: "Interrupted function.",
  28: "Invalid argument.",
  29: "I/O error.",
  30: "Socket is connected.",
  31: "There is a directory under that path.",
  32: "Too many levels of symbolic links.",
  33: "File descriptor value too large.",
  34: "Too many links.",
  35: "Message too large.",
  36: "Reserved.",
  37: "Filename too long.",
  38: "Network is down.",
  39: "Connection aborted by network.",
  40: "Network unreachable.",
  41: "Too many files open in system.",
  42: "No buffer space available.",
  43: "No such device.",
  44: "There is no such file or directory OR the parent directory does not exist.",
  45: "Executable file format error.",
  46: "No locks available.",
  47: "Reserved.",
  48: "Not enough space.",
  49: "No message of the desired type.",
  50: "Protocol not available.",
  51: "No space left on device.",
  52: "Function not supported.",
  53: "The socket is not connected.",
  54: "Not a directory or a symbolic link to a directory.",
  55: "Directory not empty.",
  56: "State not recoverable.",
  57: "Not a socket.",
  58: "Not supported, or operation not supported on socket.",
  59: "Inappropriate I/O control operation.",
  60: "No such device or address.",
  61: "Value too large to be stored in data type.",
  62: "Previous owner died.",
  63: "Operation not permitted.",
  64: "Broken pipe.",
  65: "Protocol error.",
  66: "Protocol not supported.",
  67: "Protocol wrong type for socket.",
  68: "Result too large.",
  69: "Read-only file system.",
  70: "Invalid seek.",
  71: "No such process.",
  72: "Reserved.",
  73: "Connection timed out.",
  74: "Text file busy.",
  75: "Cross-device link.",
  76: "Extension: Capabilities insufficient."
};
function y(t = "") {
  return function(r, n, s) {
    const o = s.value;
    s.value = function(...i) {
      try {
        return o.apply(this, i);
      } catch (c) {
        const l = typeof c == "object" ? c?.errno : null;
        if (l in V) {
          const a = V[l], h = typeof i[0] == "string" ? i[0] : null, g = h !== null ? t.replaceAll("{path}", h) : t;
          throw new Error(`${g}: ${a}`, {
            cause: c
          });
        }
        throw c;
      }
    };
  };
}
async function xe(t, e = {}, r = []) {
  const [n, s, o] = Y(), [i, c] = Y(), l = t.init(Te, {
    onAbort(a) {
      o(a), c(), console.error(a);
    },
    ENV: {},
    // Emscripten sometimes prepends a '/' to the path, which
    // breaks vite dev mode. An identity `locateFile` function
    // fixes it.
    locateFile: (a) => a,
    ...e,
    noInitialRun: !0,
    onRuntimeInitialized() {
      e.onRuntimeInitialized && e.onRuntimeInitialized(), s();
    },
    monitorRunDependencies(a) {
      a === 0 && (delete l.monitorRunDependencies, c());
    }
  });
  return await Promise.all(
    r.map(
      ({ default: a }) => a(l)
    )
  ), r.length || c(), await i, await n, M.push(l), M.length - 1;
}
const M = [];
function Se(t) {
  return M[t];
}
const Te = function() {
  return typeof process < "u" && process.release?.name === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
}(), Y = () => {
  const t = [], e = new Promise((r, n) => {
    t.push(r, n);
  });
  return t.unshift(e), t;
};
var _e = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, w = (t, e, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Ce(e, r) : e, o = t.length - 1, i; o >= 0; o--)
    (i = t[o]) && (s = (n ? i(e, r, s) : i(s)) || s);
  return n && s && _e(e, r, s), s;
};
const f = "string", E = "number", u = Symbol("__private__dont__use");
class m {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(e, r) {
    this.#e = [], this.#t = !1, this.#n = null, this.#r = {}, this.#i = [], e !== void 0 && this.initializeRuntime(e), r && (this.requestHandler = new we(
      new Re(this, r)
    ));
  }
  #e;
  #t;
  #n;
  #r;
  #i;
  /** @inheritDoc */
  async onMessage(e) {
    this.#i.push(e);
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.requestHandler.requestHandler.absoluteUrl;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.requestHandler.requestHandler.documentRoot;
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return this.requestHandler.requestHandler.pathToInternalUrl(e);
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    return this.requestHandler.requestHandler.internalUrlToPath(
      e
    );
  }
  initializeRuntime(e) {
    if (this[u])
      throw new Error("PHP runtime already initialized.");
    const r = Se(e);
    if (!r)
      throw new Error("Invalid PHP runtime id.");
    this[u] = r, r.onMessage = (n) => {
      for (const s of this.#i)
        s(n);
    }, this.#n = le(r);
  }
  /** @inheritDoc */
  setPhpIniPath(e) {
    if (this.#t)
      throw new Error("Cannot set PHP ini path after calling run().");
    this[u].ccall(
      "wasm_set_phpini_path",
      null,
      ["string"],
      [e]
    );
  }
  /** @inheritDoc */
  setPhpIniEntry(e, r) {
    if (this.#t)
      throw new Error("Cannot set PHP ini entries after calling run().");
    this.#e.push([e, r]);
  }
  /** @inheritDoc */
  chdir(e) {
    this[u].FS.chdir(e);
  }
  /** @inheritDoc */
  async request(e, r) {
    if (!this.requestHandler)
      throw new Error("No request handler available.");
    return this.requestHandler.request(e, r);
  }
  /** @inheritDoc */
  async run(e) {
    this.#t || (this.#s(), this.#t = !0), this.#d(e.scriptPath || ""), this.#a(e.relativeUri || ""), this.#l(e.method || "GET");
    const { host: r, ...n } = {
      host: "example.com:443",
      ...Q(e.headers || {})
    };
    if (this.#c(r, e.protocol || "http"), this.#u(n), e.body && this.#h(e.body), e.fileInfos)
      for (const s of e.fileInfos)
        this.#p(s);
    return e.code && this.#m(" ?>" + e.code), this.#f(), await this.#g();
  }
  #s() {
    if (this.#e.length > 0) {
      const e = this.#e.map(([r, n]) => `${r}=${n}`).join(`
`) + `

`;
      this[u].ccall(
        "wasm_set_phpini_entries",
        null,
        [f],
        [e]
      );
    }
    this[u].ccall("php_wasm_init", null, [], []);
  }
  #o() {
    const e = "/tmp/headers.json";
    if (!this.fileExists(e))
      throw new Error(
        "SAPI Error: Could not find response headers file."
      );
    const r = JSON.parse(this.readFileAsText(e)), n = {};
    for (const s of r.headers) {
      if (!s.includes(": "))
        continue;
      const o = s.indexOf(": "), i = s.substring(0, o).toLowerCase(), c = s.substring(o + 2);
      i in n || (n[i] = []), n[i].push(c);
    }
    return {
      headers: n,
      httpStatusCode: r.status
    };
  }
  #a(e) {
    if (this[u].ccall(
      "wasm_set_request_uri",
      null,
      [f],
      [e]
    ), e.includes("?")) {
      const r = e.substring(e.indexOf("?") + 1);
      this[u].ccall(
        "wasm_set_query_string",
        null,
        [f],
        [r]
      );
    }
  }
  #c(e, r) {
    this[u].ccall(
      "wasm_set_request_host",
      null,
      [f],
      [e]
    );
    let n;
    try {
      n = parseInt(new URL(e).port, 10);
    } catch {
    }
    (!n || isNaN(n) || n === 80) && (n = r === "https" ? 443 : 80), this[u].ccall(
      "wasm_set_request_port",
      null,
      [E],
      [n]
    ), (r === "https" || !r && n === 443) && this.addServerGlobalEntry("HTTPS", "on");
  }
  #l(e) {
    this[u].ccall(
      "wasm_set_request_method",
      null,
      [f],
      [e]
    );
  }
  #u(e) {
    e.cookie && this[u].ccall(
      "wasm_set_cookies",
      null,
      [f],
      [e.cookie]
    ), e["content-type"] && this[u].ccall(
      "wasm_set_content_type",
      null,
      [f],
      [e["content-type"]]
    ), e["content-length"] && this[u].ccall(
      "wasm_set_content_length",
      null,
      [E],
      [parseInt(e["content-length"], 10)]
    );
    for (const r in e) {
      let n = "HTTP_";
      ["content-type", "content-length"].includes(r.toLowerCase()) && (n = ""), this.addServerGlobalEntry(
        `${n}${r.toUpperCase().replace(/-/g, "_")}`,
        e[r]
      );
    }
  }
  #h(e) {
    this[u].ccall(
      "wasm_set_request_body",
      null,
      [f],
      [e]
    ), this[u].ccall(
      "wasm_set_content_length",
      null,
      [E],
      [new TextEncoder().encode(e).length]
    );
  }
  #d(e) {
    this[u].ccall(
      "wasm_set_path_translated",
      null,
      [f],
      [e]
    );
  }
  addServerGlobalEntry(e, r) {
    this.#r[e] = r;
  }
  #f() {
    for (const e in this.#r)
      this[u].ccall(
        "wasm_add_SERVER_entry",
        null,
        [f, f],
        [e, this.#r[e]]
      );
  }
  /**
   * Adds file information to $_FILES superglobal in PHP.
   *
   * In particular:
   * * Creates the file data in the filesystem
   * * Registers the file details in PHP
   *
   * @param  fileInfo - File details
   */
  #p(e) {
    const { key: r, name: n, type: s, data: o } = e, i = `/tmp/${Math.random().toFixed(20)}`;
    this.writeFile(i, o);
    const c = 0;
    this[u].ccall(
      "wasm_add_uploaded_file",
      null,
      [f, f, f, f, E, E],
      [r, n, s, i, c, o.byteLength]
    );
  }
  #m(e) {
    this[u].ccall(
      "wasm_set_php_code",
      null,
      [f],
      [e]
    );
  }
  async #g() {
    let e, r;
    try {
      e = await new Promise((o, i) => {
        r = (l) => {
          const a = new Error("Rethrown");
          a.cause = l.error, a.betterMessage = l.message, i(a);
        }, this.#n?.addEventListener(
          "error",
          r
        );
        const c = this[u].ccall(
          "wasm_sapi_handle_request",
          E,
          [],
          []
        );
        return c instanceof Promise ? c.then(o, i) : o(c);
      });
    } catch (o) {
      for (const a in this)
        typeof this[a] == "function" && (this[a] = () => {
          throw new Error(
            "PHP runtime has crashed – see the earlier error for details."
          );
        });
      this.functionsMaybeMissingFromAsyncify = ue();
      const i = o, c = "betterMessage" in i ? i.betterMessage : i.message, l = new Error(c);
      throw l.cause = i, l;
    } finally {
      this.#n?.removeEventListener("error", r), this.#r = {};
    }
    const { headers: n, httpStatusCode: s } = this.#o();
    return new b(
      s,
      n,
      this.readFileAsBuffer("/tmp/stdout"),
      this.readFileAsText("/tmp/stderr"),
      e
    );
  }
  mkdir(e) {
    this[u].FS.mkdirTree(e);
  }
  mkdirTree(e) {
    this.mkdir(e);
  }
  readFileAsText(e) {
    return new TextDecoder().decode(this.readFileAsBuffer(e));
  }
  readFileAsBuffer(e) {
    return this[u].FS.readFile(e);
  }
  writeFile(e, r) {
    this[u].FS.writeFile(e, r);
  }
  unlink(e) {
    this[u].FS.unlink(e);
  }
  mv(e, r) {
    this[u].FS.rename(e, r);
  }
  rmdir(e, r = { recursive: !0 }) {
    r?.recursive && this.listFiles(e).forEach((n) => {
      const s = `${e}/${n}`;
      this.isDir(s) ? this.rmdir(s, r) : this.unlink(s);
    }), this[u].FS.rmdir(e);
  }
  listFiles(e, r = { prependPath: !1 }) {
    if (!this.fileExists(e))
      return [];
    try {
      const n = this[u].FS.readdir(e).filter(
        (s) => s !== "." && s !== ".."
      );
      if (r.prependPath) {
        const s = e.replace(/\/$/, "");
        return n.map((o) => `${s}/${o}`);
      }
      return n;
    } catch (n) {
      return console.error(n, { path: e }), [];
    }
  }
  isDir(e) {
    return this.fileExists(e) ? this[u].FS.isDir(
      this[u].FS.lookupPath(e).node.mode
    ) : !1;
  }
  fileExists(e) {
    try {
      return this[u].FS.lookupPath(e), !0;
    } catch {
      return !1;
    }
  }
}
w([
  y('Could not create directory "{path}"')
], m.prototype, "mkdir", 1);
w([
  y('Could not create directory "{path}"')
], m.prototype, "mkdirTree", 1);
w([
  y('Could not read "{path}"')
], m.prototype, "readFileAsText", 1);
w([
  y('Could not read "{path}"')
], m.prototype, "readFileAsBuffer", 1);
w([
  y('Could not write to "{path}"')
], m.prototype, "writeFile", 1);
w([
  y('Could not unlink "{path}"')
], m.prototype, "unlink", 1);
w([
  y('Could not move "{path}"')
], m.prototype, "mv", 1);
w([
  y('Could not remove directory "{path}"')
], m.prototype, "rmdir", 1);
w([
  y('Could not list files in "{path}"')
], m.prototype, "listFiles", 1);
w([
  y('Could not stat "{path}"')
], m.prototype, "isDir", 1);
w([
  y('Could not stat "{path}"')
], m.prototype, "fileExists", 1);
function Q(t) {
  const e = {};
  for (const r in t)
    e[r.toLowerCase()] = t[r];
  return e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const X = Symbol("Comlink.proxy"), Fe = Symbol("Comlink.endpoint"), He = Symbol("Comlink.releaseProxy"), H = Symbol("Comlink.finalizer"), S = Symbol("Comlink.thrown"), Z = (t) => typeof t == "object" && t !== null || typeof t == "function", Oe = {
  canHandle: (t) => Z(t) && t[X],
  serialize(t) {
    const { port1: e, port2: r } = new MessageChannel();
    return F(t, e), [r, [r]];
  },
  deserialize(t) {
    return t.start(), U(t);
  }
}, Me = {
  canHandle: (t) => Z(t) && S in t,
  serialize({ value: t }) {
    let e;
    return t instanceof Error ? e = {
      isError: !0,
      value: {
        message: t.message,
        name: t.name,
        stack: t.stack
      }
    } : e = { isError: !1, value: t }, [e, []];
  },
  deserialize(t) {
    throw t.isError ? Object.assign(new Error(t.value.message), t.value) : t.value;
  }
}, v = /* @__PURE__ */ new Map([
  ["proxy", Oe],
  ["throw", Me]
]);
function Ae(t, e) {
  for (const r of t)
    if (e === r || r === "*" || r instanceof RegExp && r.test(e))
      return !0;
  return !1;
}
function F(t, e = globalThis, r = ["*"]) {
  e.addEventListener("message", function n(s) {
    if (!s || !s.data)
      return;
    if (!Ae(r, s.origin)) {
      console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
      return;
    }
    const { id: o, type: i, path: c } = Object.assign({ path: [] }, s.data), l = (s.data.argumentList || []).map(P);
    let a;
    try {
      const h = c.slice(0, -1).reduce((p, k) => p[k], t), g = c.reduce((p, k) => p[k], t);
      switch (i) {
        case "GET":
          a = g;
          break;
        case "SET":
          h[c.slice(-1)[0]] = P(s.data.value), a = !0;
          break;
        case "APPLY":
          a = g.apply(h, l);
          break;
        case "CONSTRUCT":
          {
            const p = new g(...l);
            a = ne(p);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: p, port2: k } = new MessageChannel();
            F(t, k), a = We(p, [p]);
          }
          break;
        case "RELEASE":
          a = void 0;
          break;
        default:
          return;
      }
    } catch (h) {
      a = { value: h, [S]: 0 };
    }
    Promise.resolve(a).catch((h) => ({ value: h, [S]: 0 })).then((h) => {
      const [g, p] = C(h);
      e.postMessage(Object.assign(Object.assign({}, g), { id: o }), p), i === "RELEASE" && (e.removeEventListener("message", n), ee(e), H in t && typeof t[H] == "function" && t[H]());
    }).catch((h) => {
      const [g, p] = C({
        value: new TypeError("Unserializable return value"),
        [S]: 0
      });
      e.postMessage(Object.assign(Object.assign({}, g), { id: o }), p);
    });
  }), e.start && e.start();
}
function Le(t) {
  return t.constructor.name === "MessagePort";
}
function ee(t) {
  Le(t) && t.close();
}
function U(t, e) {
  return A(t, [], e);
}
function x(t) {
  if (t)
    throw new Error("Proxy has been released and is not useable");
}
function te(t) {
  return R(t, {
    type: "RELEASE"
  }).then(() => {
    ee(t);
  });
}
const T = /* @__PURE__ */ new WeakMap(), _ = "FinalizationRegistry" in globalThis && new FinalizationRegistry((t) => {
  const e = (T.get(t) || 0) - 1;
  T.set(t, e), e === 0 && te(t);
});
function Ie(t, e) {
  const r = (T.get(e) || 0) + 1;
  T.set(e, r), _ && _.register(t, e, t);
}
function Ue(t) {
  _ && _.unregister(t);
}
function A(t, e = [], r = function() {
}) {
  let n = !1;
  const s = new Proxy(r, {
    get(o, i) {
      if (x(n), i === He)
        return () => {
          Ue(s), te(t), n = !0;
        };
      if (i === "then") {
        if (e.length === 0)
          return { then: () => s };
        const c = R(t, {
          type: "GET",
          path: e.map((l) => l.toString())
        }).then(P);
        return c.then.bind(c);
      }
      return A(t, [...e, i]);
    },
    set(o, i, c) {
      x(n);
      const [l, a] = C(c);
      return R(t, {
        type: "SET",
        path: [...e, i].map((h) => h.toString()),
        value: l
      }, a).then(P);
    },
    apply(o, i, c) {
      x(n);
      const l = e[e.length - 1];
      if (l === Fe)
        return R(t, {
          type: "ENDPOINT"
        }).then(P);
      if (l === "bind")
        return A(t, e.slice(0, -1));
      const [a, h] = J(c);
      return R(t, {
        type: "APPLY",
        path: e.map((g) => g.toString()),
        argumentList: a
      }, h).then(P);
    },
    construct(o, i) {
      x(n);
      const [c, l] = J(i);
      return R(t, {
        type: "CONSTRUCT",
        path: e.map((a) => a.toString()),
        argumentList: c
      }, l).then(P);
    }
  });
  return Ie(s, t), s;
}
function Ne(t) {
  return Array.prototype.concat.apply([], t);
}
function J(t) {
  const e = t.map(C);
  return [e.map((r) => r[0]), Ne(e.map((r) => r[1]))];
}
const re = /* @__PURE__ */ new WeakMap();
function We(t, e) {
  return re.set(t, e), t;
}
function ne(t) {
  return Object.assign(t, { [X]: !0 });
}
function se(t, e = globalThis, r = "*") {
  return {
    postMessage: (n, s) => t.postMessage(n, r, s),
    addEventListener: e.addEventListener.bind(e),
    removeEventListener: e.removeEventListener.bind(e)
  };
}
function C(t) {
  for (const [e, r] of v)
    if (r.canHandle(t)) {
      const [n, s] = r.serialize(t);
      return [
        {
          type: "HANDLER",
          name: e,
          value: n
        },
        s
      ];
    }
  return [
    {
      type: "RAW",
      value: t
    },
    re.get(t) || []
  ];
}
function P(t) {
  switch (t.type) {
    case "HANDLER":
      return v.get(t.name).deserialize(t.value);
    case "RAW":
      return t.value;
  }
}
function R(t, e, r) {
  return new Promise((n) => {
    const s = $e();
    t.addEventListener("message", function o(i) {
      !i.data || !i.data.id || i.data.id !== s || (t.removeEventListener("message", o), n(i.data));
    }), t.start && t.start(), t.postMessage(Object.assign({ id: s }, e), r);
  });
}
function $e() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
function Ge(t) {
  ie();
  const e = t instanceof Worker ? t : se(t), r = U(e), n = N(r);
  return new Proxy(n, {
    get: (s, o) => o === "isConnected" ? async () => {
      for (let i = 0; i < 10; i++)
        try {
          await De(r.isConnected(), 200);
          break;
        } catch {
        }
    } : r[o]
  });
}
async function De(t, e) {
  return new Promise((r, n) => {
    setTimeout(n, e), t.then(r);
  });
}
function Ve(t, e) {
  ie();
  const r = Promise.resolve();
  let n, s;
  const o = new Promise((l, a) => {
    n = l, s = a;
  }), i = N(t), c = new Proxy(i, {
    get: (l, a) => a === "isConnected" ? () => r : a === "isReady" ? () => o : a in l ? l[a] : e?.[a]
  });
  return F(
    c,
    typeof window < "u" ? se(self.parent) : void 0
  ), [n, s, c];
}
let K = !1;
function ie() {
  K || (K = !0, v.set("EVENT", {
    canHandle: (t) => t instanceof CustomEvent,
    serialize: (t) => [
      {
        detail: t.detail
      },
      []
    ],
    deserialize: (t) => t
  }), v.set("FUNCTION", {
    canHandle: (t) => typeof t == "function",
    serialize(t) {
      console.debug("[Comlink][Performance] Proxying a function");
      const { port1: e, port2: r } = new MessageChannel();
      return F(t, e), [r, [r]];
    },
    deserialize(t) {
      return t.start(), U(t);
    }
  }), v.set("PHPResponse", {
    canHandle: (t) => typeof t == "object" && t !== null && "headers" in t && "bytes" in t && "errors" in t && "exitCode" in t && "httpStatusCode" in t,
    serialize(t) {
      return [t.toRawData(), []];
    },
    deserialize(t) {
      return b.fromRawData(t);
    }
  }));
}
function N(t) {
  return new Proxy(t, {
    get(e, r) {
      switch (typeof e[r]) {
        case "function":
          return (...n) => e[r](...n);
        case "object":
          return e[r] === null ? e[r] : N(e[r]);
        case "undefined":
        case "number":
        case "string":
          return e[r];
        default:
          return ne(e[r]);
      }
    }
  });
}
async function qe(t = ye) {
  switch (t) {
    case "8.2":
      return await import("./php_8_2.js");
    case "8.1":
      return await import("./php_8_1.js");
    case "8.0":
      return await import("./php_8_0.js");
    case "7.4":
      return await import("./php_7_4.js");
    case "7.3":
      return await import("./php_7_3.js");
    case "7.2":
      return await import("./php_7_2.js");
    case "7.1":
      return await import("./php_7_1.js");
    case "7.0":
      return await import("./php_7_0.js");
    case "5.6":
      return await import("./php_5_6.js");
  }
  throw new Error(`Unsupported PHP version ${t}`);
}
const ze = () => ({
  websocket: {
    decorator: (t) => class extends t {
      constructor() {
        try {
          super();
        } catch {
        }
      }
      send() {
        return null;
      }
    }
  }
});
class L extends m {
  /**
   * Creates a new PHP instance.
   *
   * Dynamically imports the PHP module, initializes the runtime,
   * and sets up networking. It's a shorthand for the lower-level
   * functions like `getPHPLoaderModule`, `loadPHPRuntime`, and
   * `PHP.initializeRuntime`
   *
   * @param phpVersion The PHP Version to load
   * @param options The options to use when loading PHP
   * @returns A new PHP instance
   */
  static async load(e, r = {}) {
    return await L.loadSync(e, r).phpReady;
  }
  /**
   * Does what load() does, but synchronously returns
   * an object with the PHP instance and a promise that
   * resolves when the PHP instance is ready.
   *
   * @see load
   */
  static loadSync(e, r = {}) {
    const n = new L(void 0, r.requestHandler), o = (async () => {
      const i = await Promise.all([
        qe(e),
        ...r.dataModules || []
      ]), [c, ...l] = i;
      r.downloadMonitor?.setModules(i);
      const a = await xe(
        c,
        {
          ...r.emscriptenOptions || {},
          ...r.downloadMonitor?.getEmscriptenOptions() || {},
          ...ze()
        },
        l
      );
      n.initializeRuntime(a);
    })();
    return {
      php: n,
      phpReady: o.then(() => n)
    };
  }
}
const d = /* @__PURE__ */ new WeakMap();
class Je {
  /** @inheritDoc */
  constructor(e, r) {
    d.set(this, {
      php: e,
      monitor: r
    }), this.absoluteUrl = e.absoluteUrl, this.documentRoot = e.documentRoot;
  }
  /** @inheritDoc @php-wasm/universal!RequestHandler.pathToInternalUrl  */
  pathToInternalUrl(e) {
    return d.get(this).php.pathToInternalUrl(e);
  }
  /** @inheritDoc @php-wasm/universal!RequestHandler.internalUrlToPath  */
  internalUrlToPath(e) {
    return d.get(this).php.internalUrlToPath(e);
  }
  /**
   * The onDownloadProgress event listener.
   */
  async onDownloadProgress(e) {
    return d.get(this).monitor?.addEventListener("progress", e);
  }
  /** @inheritDoc @php-wasm/universal!IsomorphicLocalPHP.mv  */
  mv(e, r) {
    return d.get(this).php.mv(e, r);
  }
  /** @inheritDoc @php-wasm/universal!IsomorphicLocalPHP.rmdir  */
  rmdir(e, r) {
    return d.get(this).php.rmdir(e, r);
  }
  /** @inheritDoc @php-wasm/universal!RequestHandler.request */
  request(e, r) {
    return d.get(this).php.request(e, r);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.run */
  async run(e) {
    return d.get(this).php.run(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.chdir */
  chdir(e) {
    return d.get(this).php.chdir(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.setPhpIniPath */
  setPhpIniPath(e) {
    return d.get(this).php.setPhpIniPath(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.setPhpIniEntry */
  setPhpIniEntry(e, r) {
    return d.get(this).php.setPhpIniEntry(e, r);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.mkdir */
  mkdir(e) {
    return d.get(this).php.mkdir(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.mkdirTree */
  mkdirTree(e) {
    return d.get(this).php.mkdirTree(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.readFileAsText */
  readFileAsText(e) {
    return d.get(this).php.readFileAsText(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.readFileAsBuffer */
  readFileAsBuffer(e) {
    return d.get(this).php.readFileAsBuffer(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.writeFile */
  writeFile(e, r) {
    return d.get(this).php.writeFile(e, r);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.unlink */
  unlink(e) {
    return d.get(this).php.unlink(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.listFiles */
  listFiles(e, r) {
    return d.get(this).php.listFiles(e, r);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.isDir */
  isDir(e) {
    return d.get(this).php.isDir(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.fileExists */
  fileExists(e) {
    return d.get(this).php.fileExists(e);
  }
  /** @inheritDoc @php-wasm/web!WebPHP.onMessage */
  onMessage(e) {
    d.get(this).php.onMessage(e);
  }
}
function Be(t, e) {
  return {
    type: "response",
    requestId: t,
    response: e
  };
}
async function Ke(t, e, r) {
  const n = navigator.serviceWorker;
  if (!n)
    throw new Error("Service workers are not supported in this browser.");
  console.debug("[window][sw] Registering a Service Worker"), await (await n.register(r, {
    type: "module",
    // Always bypass HTTP cache when fetching the new Service Worker script:
    updateViaCache: "none"
  })).update(), navigator.serviceWorker.addEventListener(
    "message",
    async function(i) {
      if (console.debug("[window][sw] Message from ServiceWorker", i), e && i.data.scope !== e)
        return;
      const c = i.data.args || [], l = i.data.method, a = await t[l](...c);
      i.source.postMessage(Be(i.data.requestId, a));
    }
  ), n.startMessages();
}
function Qe() {
  const t = {};
  return typeof self?.location?.href < "u" && new URL(self.location.href).searchParams.forEach((r, n) => {
    t[n] = r;
  }), t;
}
async function Xe(t, e = {}) {
  t = je(t, e);
  const r = new Worker(t, { type: "module" });
  return new Promise((n, s) => {
    r.onerror = (i) => {
      const c = new Error(
        `WebWorker failed to load at ${t}. ${i.message ? `Original error: ${i.message}` : ""}`
      );
      c.filename = i.filename, s(c);
    };
    function o(i) {
      i.data === "worker-script-started" && (n(r), r.removeEventListener("message", o));
    }
    r.addEventListener("message", o);
  });
}
function je(t, e) {
  if (!Object.entries(e).length)
    return t + "";
  const r = new URL(t);
  for (const [n, s] of Object.entries(e))
    r.searchParams.set(n, s);
  return r.toString();
}
export {
  L as WebPHP,
  Je as WebPHPEndpoint,
  Ge as consumeAPI,
  Ve as exposeAPI,
  qe as getPHPLoaderModule,
  Qe as parseWorkerStartupOptions,
  Ke as registerServiceWorker,
  Xe as spawnPHPWorkerThread
};
