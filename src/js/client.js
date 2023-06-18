const me = async (t, { pluginPath: e, pluginName: r }, s) => {
  s?.tracker.setCaption(`Activating ${r || e}`);
  const n = [
    `${await t.documentRoot}/wp-load.php`,
    `${await t.documentRoot}/wp-admin/includes/plugin.php`
  ];
  if (!n.every(
    (a) => t.fileExists(a)
  ))
    throw new Error(
      `Required WordPress files do not exist: ${n.join(", ")}`
    );
  if ((await t.run({
    code: `<?php
define( 'WP_ADMIN', true );
${n.map((a) => `require_once( '${a}' );`).join(`
`)}
$plugin_path = '${e}';
if (!is_dir($plugin_path)) {
	activate_plugin($plugin_path);
	return;
}
// Find plugin entry file
foreach ( ( glob( $plugin_path . '/*.php' ) ?: array() ) as $file ) {
	$info = get_plugin_data( $file, false, false );
	if ( ! empty( $info['Name'] ) ) {
		activate_plugin( $file );
		return;
	}
}
echo 'NO_ENTRY_FILE';
`
  })).text.endsWith("NO_ENTRY_FILE"))
    throw new Error("Could not find plugin entry file.");
}, we = async (t, { themeFolderName: e }, r) => {
  r?.tracker.setCaption(`Activating ${e}`);
  const s = `${await t.documentRoot}/wp-load.php`;
  if (!t.fileExists(s))
    throw new Error(
      `Required WordPress file does not exist: ${s}`
    );
  await t.run({
    code: `<?php
define( 'WP_ADMIN', true );
require_once( '${s}' );
switch_theme( '${e}' );
`
  });
};
function O(t) {
  const e = t.split(".").shift().replace(/-/g, " ");
  return e.charAt(0).toUpperCase() + e.slice(1).toLowerCase();
}
async function R(t, e, r) {
  let s = "";
  await t.fileExists(e) && (s = await t.readFileAsText(e)), await t.writeFile(e, r(s));
}
async function Le(t) {
  return new Uint8Array(await t.arrayBuffer());
}
class Oe extends File {
  constructor(e, r) {
    super(e, r), this.buffers = e;
  }
  async arrayBuffer() {
    return this.buffers[0];
  }
}
const M = File.prototype.arrayBuffer instanceof Function ? File : Oe, J = "/vfs-blueprints", z = async (t, { consts: e, virtualize: r = !1 }) => {
  const s = await t.documentRoot, n = r ? J : s, i = `${n}/playground-consts.json`, o = `${n}/wp-config.php`;
  return r && (t.mkdir(J), t.setPhpIniEntry("auto_prepend_file", o)), await R(
    t,
    i,
    (a) => JSON.stringify({
      ...JSON.parse(a || "{}"),
      ...e
    })
  ), await R(t, o, (a) => a.includes("playground-consts.json") ? a : `<?php
	$consts = json_decode(file_get_contents('${i}'), true);
	foreach ($consts as $const => $value) {
		if (!defined($const)) {
			define($const, $value);
		}
	}
?>${a}`), o;
}, Ne = async (t, e) => {
  const r = new Ue(
    t,
    e.wordpressPath || "/wordpress",
    e.siteUrl
  );
  e.addPhpInfo === !0 && await r.addPhpInfo(), e.siteUrl && await r.patchSiteUrl(), e.patchSecrets === !0 && await r.patchSecrets(), e.disableSiteHealth === !0 && await r.disableSiteHealth(), e.disableWpNewBlogNotification === !0 && await r.disableWpNewBlogNotification();
};
class Ue {
  constructor(e, r, s) {
    this.php = e, this.scopedSiteUrl = s, this.wordpressPath = r;
  }
  async addPhpInfo() {
    await this.php.writeFile(
      `${this.wordpressPath}/phpinfo.php`,
      "<?php phpinfo(); "
    );
  }
  async patchSiteUrl() {
    await z(this.php, {
      consts: {
        WP_HOME: this.scopedSiteUrl,
        WP_SITEURL: this.scopedSiteUrl
      },
      virtualize: !0
    });
  }
  async patchSecrets() {
    await R(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      (e) => `<?php
					define('AUTH_KEY',         '${P(40)}');
					define('SECURE_AUTH_KEY',  '${P(40)}');
					define('LOGGED_IN_KEY',    '${P(40)}');
					define('NONCE_KEY',        '${P(40)}');
					define('AUTH_SALT',        '${P(40)}');
					define('SECURE_AUTH_SALT', '${P(40)}');
					define('LOGGED_IN_SALT',   '${P(40)}');
					define('NONCE_SALT',       '${P(40)}');
				?>${e.replaceAll("', 'put your unique phrase here'", "__', ''")}`
    );
  }
  async disableSiteHealth() {
    await R(
      this.php,
      `${this.wordpressPath}/wp-includes/default-filters.php`,
      (e) => e.replace(
        /add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,
        ""
      )
    );
  }
  async disableWpNewBlogNotification() {
    await R(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      // The original version of this function crashes WASM PHP, let's define an empty one instead.
      (e) => `${e} function wp_new_blog_notification(...$args){} `
    );
  }
}
function P(t) {
  const e = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?";
  let r = "";
  for (let s = t; s > 0; --s)
    r += e[Math.floor(Math.random() * e.length)];
  return r;
}
const He = async (t, { code: e }) => await t.run({ code: e }), We = async (t, { options: e }) => await t.run(e), Ie = async (t, { key: e, value: r }) => {
  await t.setPhpIniEntry(e, r);
}, Me = async (t, { request: e }) => await t.request(e), ze = async (t, { fromPath: e, toPath: r }) => {
  await t.writeFile(
    r,
    await t.readFileAsBuffer(e)
  );
}, De = async (t, { fromPath: e, toPath: r }) => {
  await t.mv(e, r);
}, qe = async (t, { path: e }) => {
  await t.mkdir(e);
}, je = async (t, { path: e }) => {
  await t.unlink(e);
}, Be = async (t, { path: e }) => {
  await t.rmdir(e);
}, ge = async (t, { path: e, data: r }) => {
  r instanceof File && (r = await Le(r)), await t.writeFile(e, r);
}, Ve = async (t, { siteUrl: e }) => await z(t, {
  consts: {
    WP_HOME: e,
    WP_SITEURL: e
  }
});
class ye {
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
const Ge = Symbol("literal");
function S(t) {
  if (typeof t == "string")
    return t.startsWith("$") ? t : JSON.stringify(t);
  if (typeof t == "number")
    return t.toString();
  if (Array.isArray(t))
    return `array(${t.map(S).join(", ")})`;
  if (t === null)
    return "null";
  if (typeof t == "object")
    return Ge in t ? t.toString() : `array(${Object.entries(t).map(([r, s]) => `${JSON.stringify(r)} => ${S(s)}`).join(", ")})`;
  if (typeof t == "function")
    return t();
  throw new Error(`Unsupported value: ${t}`);
}
function D(t) {
  const e = {};
  for (const r in t)
    e[r] = S(t[r]);
  return e;
}
const Z = `<?php

function zipDir($dir, $output, $additionalFiles = array())
{
    $zip = new ZipArchive;
    $res = $zip->open($output, ZipArchive::CREATE);
    if ($res === TRUE) {
        foreach ($additionalFiles as $file) {
            $zip->addFile($file);
        }
        $directories = array(
            rtrim($dir, '/') . '/'
        );
        while (sizeof($directories)) {
            $dir = array_pop($directories);

            if ($handle = opendir($dir)) {
                while (false !== ($entry = readdir($handle))) {
                    if ($entry == '.' || $entry == '..') {
                        continue;
                    }

                    $entry = $dir . $entry;

                    if (is_dir($entry)) {
                        $directory_path = $entry . '/';
                        array_push($directories, $directory_path);
                    } else if (is_file($entry)) {
                        $zip->addFile($entry);
                    }
                }
                closedir($handle);
            }
        }
        $zip->close();
        chmod($output, 0777);
    }
}

function unzip($zipPath, $extractTo, $overwrite = true)
{
    if(!is_dir($extractTo)) {
        mkdir($extractTo, 0777, true);
    }
    $zip = new ZipArchive;
    $res = $zip->open($zipPath);
    if ($res === TRUE) {
        $zip->extractTo($extractTo);
        $zip->close();
        chmod($extractTo, 0777);
    }
}


function delTree($dir)
{
    $files = array_diff(scandir($dir), array('.', '..'));
    foreach ($files as $file) {
        (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
}
`;
async function Ye(t) {
  const e = "wordpress-playground.zip", r = `/tmp/${e}`, s = D({
    zipPath: r,
    documentRoot: await t.documentRoot
  });
  await Pe(
    t,
    `zipDir(${s.documentRoot}, ${s.zipPath});`
  );
  const n = await t.readFileAsBuffer(r);
  return t.unlink(r), new File([n], e);
}
const Ke = async (t, { fullSiteZip: e }) => {
  const r = "/import.zip";
  await t.writeFile(
    r,
    new Uint8Array(await e.arrayBuffer())
  );
  const s = await t.absoluteUrl, n = await t.documentRoot;
  await t.rmdir(n), await q(t, { zipPath: r, extractToPath: "/" });
  const i = D({ absoluteUrl: s });
  await Qe(
    t,
    `${n}/wp-config.php`,
    (o) => `<?php
			if(!defined('WP_HOME')) {
				define('WP_HOME', ${i.absoluteUrl});
				define('WP_SITEURL', ${i.absoluteUrl});
			}
			?>${o}`
  );
}, q = async (t, { zipPath: e, extractToPath: r }) => {
  const s = D({
    zipPath: e,
    extractToPath: r
  });
  await Pe(
    t,
    `unzip(${s.zipPath}, ${s.extractToPath});`
  );
}, Je = async (t, { file: e }) => {
  const r = await t.request({
    url: "/wp-admin/admin.php?import=wordpress"
  }), s = Q(r).getElementById("import-upload-form")?.getAttribute("action"), n = await t.request({
    url: `/wp-admin/${s}`,
    method: "POST",
    files: { import: e }
  }), i = Q(n).querySelector(
    "#wpbody-content form"
  );
  if (!i)
    throw console.log(n.text), new Error(
      "Could not find an importer form in response. See the response text above for details."
    );
  const o = Ze(i);
  o.fetch_attachments = "1";
  for (const a in o)
    if (a.startsWith("user_map[")) {
      const l = "user_new[" + a.slice(9, -1) + "]";
      o[l] = "1";
    }
  await t.request({
    url: i.action,
    method: "POST",
    formData: o
  });
};
function Q(t) {
  return new DOMParser().parseFromString(t.text, "text/html");
}
function Ze(t) {
  return Object.fromEntries(new FormData(t).entries());
}
async function Qe(t, e, r) {
  await t.writeFile(
    e,
    r(await t.readFileAsText(e))
  );
}
async function Pe(t, e) {
  const r = await t.run({
    code: Z + e
  });
  if (r.exitCode !== 0)
    throw console.log(Z + e), console.log(e + ""), console.log(r.errors), r.errors;
  return r;
}
async function _e(t, { targetPath: e, zipFile: r }) {
  const s = r.name, n = s.replace(/\.zip$/, ""), i = `/tmp/assets/${n}`, o = `/tmp/${s}`, a = () => t.rmdir(i, {
    recursive: !0
  });
  await t.fileExists(i) && await a(), await ge(t, {
    path: o,
    data: r
  });
  const l = () => Promise.all([a, () => t.unlink(o)]);
  try {
    await q(t, {
      zipPath: o,
      extractToPath: i
    });
    const c = await t.listFiles(i, {
      prependPath: !0
    }), u = c.length === 1 && await t.isDir(c[0]);
    let d, p = "";
    u ? (p = c[0], d = c[0].split("/").pop()) : (p = i, d = n);
    const y = `${e}/${d}`;
    return await t.mv(p, y), await l(), {
      assetFolderPath: y,
      assetFolderName: d
    };
  } catch (c) {
    throw await l(), c;
  }
}
const Xe = async (t, { pluginZipFile: e, options: r = {} }, s) => {
  const n = e.name.split("/").pop() || "plugin.zip", i = O(n);
  s?.tracker.setCaption(`Installing the ${i} plugin`);
  try {
    const { assetFolderPath: o } = await _e(t, {
      zipFile: e,
      targetPath: `${await t.documentRoot}/wp-content/plugins`
    });
    ("activate" in r ? r.activate : !0) && await me(
      t,
      {
        pluginPath: o,
        pluginName: i
      },
      s
    ), await et(t);
  } catch (o) {
    console.error(
      `Proceeding without the ${i} plugin. Could not install it in wp-admin. The original error was: ${o}`
    ), console.error(o);
  }
};
async function et(t) {
  await t.isDir("/wordpress/wp-content/plugins/gutenberg") && !await t.fileExists("/wordpress/.gutenberg-patched") && (await t.writeFile("/wordpress/.gutenberg-patched", "1"), await X(
    t,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.js",
    (e) => e.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ), await X(
    t,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.min.js",
    (e) => e.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ));
}
async function X(t, e, r) {
  return await t.writeFile(
    e,
    r(await t.readFileAsText(e))
  );
}
const tt = async (t, { themeZipFile: e, options: r = {} }, s) => {
  const n = O(e.name);
  s?.tracker.setCaption(`Installing the ${n} theme`);
  try {
    const { assetFolderName: i } = await _e(t, {
      zipFile: e,
      targetPath: `${await t.documentRoot}/wp-content/themes`
    });
    ("activate" in r ? r.activate : !0) && await we(
      t,
      {
        themeFolderName: i
      },
      s
    );
  } catch (i) {
    console.error(
      `Proceeding without the ${n} theme. Could not install it in wp-admin. The original error was: ${i}`
    ), console.error(i);
  }
}, rt = async (t, { username: e = "admin", password: r = "password" } = {}, s) => {
  s?.tracker.setCaption(s?.initialCaption || "Logging in"), await t.request({
    url: "/wp-login.php"
  }), await t.request({
    url: "/wp-login.php",
    method: "POST",
    formData: {
      log: e,
      pwd: r,
      rememberme: "forever"
    }
  });
}, st = async (t, { options: e }) => {
  await t.request({
    url: "/wp-admin/install.php?step=2",
    method: "POST",
    formData: {
      language: "en",
      prefix: "wp_",
      weblog_title: "My WordPress Website",
      user_name: e.adminPassword || "admin",
      admin_password: e.adminPassword || "password",
      // The installation wizard demands typing the same password twice
      admin_password2: e.adminPassword || "password",
      Submit: "Install WordPress",
      pw_weak: "1",
      admin_email: "admin@localhost.com"
    }
  });
}, nt = async (t, { options: e }) => {
  const r = `<?php
	include 'wordpress/wp-load.php';
	$site_options = ${S(e)};
	foreach($site_options as $name => $value) {
		update_option($name, $value);
	}
	echo "Success";
	`, s = await t.run({
    code: r
  });
  return be(s), { code: r, result: s };
}, it = async (t, { meta: e, userId: r }) => {
  const s = `<?php
	include 'wordpress/wp-load.php';
	$meta = ${S(e)};
	foreach($meta as $name => $value) {
		update_user_meta(${S(r)}, $name, $value);
	}
	echo "Success";
	`, n = await t.run({
    code: s
  });
  return be(n), { code: s, result: n };
};
async function be(t) {
  if (t.text !== "Success")
    throw console.log(t), new Error(`Failed to run code: ${t.text} ${t.errors}`);
}
const ot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activatePlugin: me,
  activateTheme: we,
  applyWordPressPatches: Ne,
  cp: ze,
  defineSiteUrl: Ve,
  defineWpConfigConsts: z,
  importFile: Je,
  installPlugin: Xe,
  installTheme: tt,
  login: rt,
  mkdir: qe,
  mv: De,
  replaceSite: Ke,
  request: Me,
  rm: je,
  rmdir: Be,
  runPHP: He,
  runPHPWithOptions: We,
  runWpInstallationWizard: st,
  setPhpIniEntry: Ie,
  setSiteOptions: nt,
  unzip: q,
  updateUserMeta: it,
  writeFile: ge,
  zipEntireSite: Ye
}, Symbol.toStringTag, { value: "Module" })), at = 5 * 1024 * 1024;
function ct(t, e) {
  const r = t.headers.get("content-length") || "", s = parseInt(r, 10) || at;
  function n(i, o) {
    e(
      new CustomEvent("progress", {
        detail: {
          loaded: i,
          total: o
        }
      })
    );
  }
  return new Response(
    new ReadableStream({
      async start(i) {
        if (!t.body) {
          i.close();
          return;
        }
        const o = t.body.getReader();
        let a = 0;
        for (; ; )
          try {
            const { done: l, value: c } = await o.read();
            if (c && (a += c.byteLength), l) {
              n(a, a), i.close();
              break;
            } else
              n(a, s), i.enqueue(c);
          } catch (l) {
            console.error({ e: l }), i.error(l);
            break;
          }
      }
    }),
    {
      status: t.status,
      statusText: t.statusText,
      headers: t.headers
    }
  );
}
const U = 1e-5;
class N extends EventTarget {
  constructor({
    weight: e = 1,
    caption: r = "",
    fillTime: s = 4
  } = {}) {
    super(), this._selfWeight = 1, this._selfDone = !1, this._selfProgress = 0, this._selfCaption = "", this._isFilling = !1, this._subTrackers = [], this._weight = e, this._selfCaption = r, this._fillTime = s;
  }
  /**
   * Creates a new sub-tracker with a specific weight.
   *
   * The weight determines what percentage of the overall progress
   * the sub-tracker represents. For example, if the main tracker is
   * monitoring a process that has two stages, and the first stage
   * is expected to take twice as long as the second stage, you could
   * create the first sub-tracker with a weight of 0.67 and the second
   * sub-tracker with a weight of 0.33.
   *
   * The caption is an optional string that describes the current stage
   * of the operation. If provided, it will be used as the progress caption
   * for the sub-tracker. If not provided, the main tracker will look for
   * the next sub-tracker with a non-empty caption and use that as the progress
   * caption instead.
   *
   * Returns the newly-created sub-tracker.
   *
   * @throws {Error} If the weight of the new stage would cause the total weight of all stages to exceed 1.
   *
   * @param weight The weight of the new stage, as a decimal value between 0 and 1.
   * @param caption The caption for the new stage, which will be used as the progress caption for the sub-tracker.
   *
   * @example
   * ```ts
   * const tracker = new ProgressTracker();
   * const subTracker1 = tracker.stage(0.67, 'Slow stage');
   * const subTracker2 = tracker.stage(0.33, 'Fast stage');
   *
   * subTracker2.set(50);
   * subTracker1.set(75);
   * subTracker2.set(100);
   * subTracker1.set(100);
   * ```
   */
  stage(e, r = "") {
    if (e || (e = this._selfWeight), this._selfWeight - e < -U)
      throw new Error(
        `Cannot add a stage with weight ${e} as the total weight of registered stages would exceed 1.`
      );
    this._selfWeight -= e;
    const s = new N({
      caption: r,
      weight: e,
      fillTime: this._fillTime
    });
    return this._subTrackers.push(s), s.addEventListener("progress", () => this.notifyProgress()), s.addEventListener("done", () => {
      this.done && this.notifyDone();
    }), s;
  }
  /**
   * Fills the progress bar slowly over time, simulating progress.
   *
   * The progress bar is filled in a 100 steps, and each step, the progress
   * is increased by 1. If `stopBeforeFinishing` is true, the progress bar
   * will stop filling when it reaches 99% so that you can call `finish()`
   * explicitly.
   *
   * If the progress bar is filling or already filled, this method does nothing.
   *
   * @example
   * ```ts
   * const progress = new ProgressTracker({ caption: 'Processing...' });
   * progress.fillSlowly();
   * ```
   *
   * @param options Optional options.
   */
  fillSlowly({ stopBeforeFinishing: e = !0 } = {}) {
    if (this._isFilling)
      return;
    this._isFilling = !0;
    const r = 100, s = this._fillTime / r;
    this._fillInterval = setInterval(() => {
      this.set(this._selfProgress + 1), e && this._selfProgress >= 99 && clearInterval(this._fillInterval);
    }, s);
  }
  set(e) {
    this._selfProgress = Math.min(e, 100), this.notifyProgress(), this._selfProgress + U >= 100 && this.finish();
  }
  finish() {
    this._fillInterval && clearInterval(this._fillInterval), this._selfDone = !0, this._selfProgress = 100, this._isFilling = !1, this._fillInterval = void 0, this.notifyProgress(), this.notifyDone();
  }
  get caption() {
    for (let e = this._subTrackers.length - 1; e >= 0; e--)
      if (!this._subTrackers[e].done) {
        const r = this._subTrackers[e].caption;
        if (r)
          return r;
      }
    return this._selfCaption;
  }
  setCaption(e) {
    this._selfCaption = e, this.notifyProgress();
  }
  get done() {
    return this.progress + U >= 100;
  }
  get progress() {
    if (this._selfDone)
      return 100;
    const e = this._subTrackers.reduce(
      (r, s) => r + s.progress * s.weight,
      this._selfProgress * this._selfWeight
    );
    return Math.round(e * 1e4) / 1e4;
  }
  get weight() {
    return this._weight;
  }
  get observer() {
    return this._progressObserver || (this._progressObserver = (e) => {
      this.set(e);
    }), this._progressObserver;
  }
  get loadingListener() {
    return this._loadingListener || (this._loadingListener = (e) => {
      this.set(e.detail.loaded / e.detail.total * 100);
    }), this._loadingListener;
  }
  pipe(e) {
    e.setProgress({
      progress: this.progress,
      caption: this.caption
    }), this.addEventListener("progress", (r) => {
      e.setProgress({
        progress: r.detail.progress,
        caption: r.detail.caption
      });
    }), this.addEventListener("done", () => {
      e.setLoaded();
    });
  }
  addEventListener(e, r) {
    super.addEventListener(e, r);
  }
  removeEventListener(e, r) {
    super.removeEventListener(e, r);
  }
  notifyProgress() {
    const e = this;
    this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          get progress() {
            return e.progress;
          },
          get caption() {
            return e.caption;
          }
        }
      })
    );
  }
  notifyDone() {
    this.dispatchEvent(new CustomEvent("done"));
  }
}
const ee = Symbol("error"), te = Symbol("message");
class j extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(e, r = {}) {
    super(e), this[ee] = r.error === void 0 ? null : r.error, this[te] = r.message === void 0 ? "" : r.message;
  }
  get error() {
    return this[ee];
  }
  get message() {
    return this[te];
  }
}
Object.defineProperty(j.prototype, "error", { enumerable: !0 });
Object.defineProperty(j.prototype, "message", { enumerable: !0 });
const lt = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : j;
class ut extends EventTarget {
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
function ht(t) {
  t.asm = {
    ...t.asm
  };
  const e = new ut();
  for (const r in t.asm)
    if (typeof t.asm[r] == "function") {
      const s = t.asm[r];
      t.asm[r] = function(...n) {
        try {
          return s(...n);
        } catch (i) {
          if (!(i instanceof Error))
            throw i;
          if ("exitCode" in i && i?.exitCode === 0)
            return;
          const o = pt(
            i,
            t.lastAsyncifyStackSource?.stack
          );
          if (t.lastAsyncifyStackSource && (i.cause = t.lastAsyncifyStackSource), !e.hasListeners())
            throw wt(o), i;
          e.dispatchEvent(
            new lt("error", {
              error: i,
              message: o
            })
          );
        }
      };
    }
  return e;
}
let W = [];
function dt() {
  return W;
}
function pt(t, e) {
  if (t.message === "unreachable") {
    let r = ft;
    e || (r += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), W = gt(
      e || t.stack || ""
    );
    for (const s of W)
      r += `    * ${s}
`;
    return r;
  }
  return t.message;
}
const ft = `
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

`, re = "\x1B[41m", mt = "\x1B[1m", se = "\x1B[0m", ne = "\x1B[K";
let ie = !1;
function wt(t) {
  if (!ie) {
    ie = !0, console.log(`${re}
${ne}
${mt}  WASM ERROR${se}${re}`);
    for (const e of t.split(`
`))
      console.log(`${ne}  ${e} `);
    console.log(`${se}`);
  }
}
function gt(t) {
  try {
    const e = t.split(`
`).slice(1).map((r) => {
      const s = r.trim().substring(3).split(" ");
      return {
        fn: s.length >= 2 ? s[0] : "<unknown>",
        isWasm: r.includes("wasm://")
      };
    }).filter(
      ({ fn: r, isWasm: s }) => s && !r.startsWith("dynCall_") && !r.startsWith("invoke_")
    ).map(({ fn: r }) => r);
    return Array.from(new Set(e));
  } catch {
    return [];
  }
}
class b {
  constructor(e, r, s, n = "", i = 0) {
    this.httpStatusCode = e, this.headers = r, this.bytes = s, this.exitCode = i, this.errors = n;
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
const B = [
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "5.6"
], yt = B[0], ar = B;
class Pt {
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
    const s = await this.requestHandler.request({
      ...e,
      headers: {
        ...e.headers,
        cookie: this.#r()
      }
    });
    if (s.headers["set-cookie"] && this.#s(s.headers["set-cookie"]), this.#t.handleRedirects && s.headers.location && r < this.#t.maxRedirects) {
      const n = new URL(
        s.headers.location[0],
        this.requestHandler.absoluteUrl
      );
      return this.request(
        {
          url: n.toString(),
          method: "GET",
          headers: {}
        },
        r + 1
      );
    }
    return s;
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
  #s(e) {
    for (const r of e)
      try {
        if (!r.includes("="))
          continue;
        const s = r.indexOf("="), n = r.substring(0, s), i = r.substring(s + 1).split(";")[0];
        this.#e[n] = i;
      } catch (s) {
        console.error(s);
      }
  }
  #r() {
    const e = [];
    for (const r in this.#e)
      e.push(`${r}=${this.#e[r]}`);
    return e.join("; ");
  }
}
const _t = "http://example.com";
function oe(t) {
  return t.toString().substring(t.origin.length);
}
function ae(t, e) {
  return !e || !t.startsWith(e) ? t : t.substring(e.length);
}
function bt(t, e) {
  return !e || t.startsWith(e) ? t : e + t;
}
class $t {
  #e;
  #t;
  #s;
  #r;
  #i;
  #n;
  #o;
  #a;
  #c;
  /**
   * @param  php    - The PHP instance.
   * @param  config - Request Handler configuration.
   */
  constructor(e, r = {}) {
    this.#a = new ye({ concurrency: 1 });
    const {
      documentRoot: s = "/www/",
      absoluteUrl: n = typeof location == "object" ? location?.href : "",
      isStaticFilePath: i = () => !1
    } = r;
    this.php = e, this.#e = s, this.#c = i;
    const o = new URL(n);
    this.#s = o.hostname, this.#r = o.port ? Number(o.port) : o.protocol === "https:" ? 443 : 80, this.#t = (o.protocol || "").replace(":", "");
    const a = this.#r !== 443 && this.#r !== 80;
    this.#i = [
      this.#s,
      a ? `:${this.#r}` : ""
    ].join(""), this.#n = o.pathname.replace(/\/+$/, ""), this.#o = [
      `${this.#t}://`,
      this.#i,
      this.#n
    ].join("");
  }
  /** @inheritDoc */
  pathToInternalUrl(e) {
    return `${this.absoluteUrl}${e}`;
  }
  /** @inheritDoc */
  internalUrlToPath(e) {
    const r = new URL(e);
    return r.pathname.startsWith(this.#n) && (r.pathname = r.pathname.slice(this.#n.length)), oe(r);
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
    const r = e.url.startsWith("http://") || e.url.startsWith("https://"), s = new URL(
      e.url,
      r ? void 0 : _t
    ), n = ae(
      s.pathname,
      this.#n
    );
    return this.#c(n) ? this.#l(n) : await this.#u(e, s);
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
    const s = this.php.readFileAsBuffer(r);
    return new b(
      200,
      {
        "content-length": [`${s.byteLength}`],
        // @TODO: Infer the content-type from the arrayBuffer instead of the file path.
        //        The code below won't return the correct mime-type if the extension
        //        was tampered with.
        "content-type": [vt(r)],
        "accept-ranges": ["bytes"],
        "cache-control": ["public, max-age=0"]
      },
      s
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
    const s = await this.#a.acquire();
    try {
      this.php.addServerGlobalEntry("DOCUMENT_ROOT", this.#e), this.php.addServerGlobalEntry(
        "HTTPS",
        this.#o.startsWith("https://") ? "on" : ""
      );
      let n = "GET";
      const i = {
        host: this.#i,
        ...$e(e.headers || {})
      }, o = [];
      if (e.files && Object.keys(e.files).length) {
        n = "POST";
        for (const c in e.files) {
          const u = e.files[c];
          o.push({
            key: c,
            name: u.name,
            type: u.type,
            data: new Uint8Array(await u.arrayBuffer())
          });
        }
        i["content-type"]?.startsWith("multipart/form-data") && (e.formData = Et(
          e.body || ""
        ), i["content-type"] = "application/x-www-form-urlencoded", delete e.body);
      }
      let a;
      e.formData !== void 0 ? (n = "POST", i["content-type"] = i["content-type"] || "application/x-www-form-urlencoded", a = new URLSearchParams(
        e.formData
      ).toString()) : a = e.body;
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
        relativeUri: bt(
          oe(r),
          this.#n
        ),
        protocol: this.#t,
        method: e.method || n,
        body: a,
        fileInfos: o,
        scriptPath: l,
        headers: i
      });
    } finally {
      s();
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
    let r = ae(e, this.#n);
    r.includes(".php") ? r = r.split(".php")[0] + ".php" : (r.endsWith("/") || (r += "/"), r.endsWith("index.php") || (r += "index.php"));
    const s = `${this.#e}${r}`;
    if (this.php.fileExists(s))
      return s;
    if (!this.php.fileExists(`${this.#e}/index.php`))
      throw new Error(`File not found: ${s}`);
    return `${this.#e}/index.php`;
  }
}
function Et(t) {
  const e = {}, r = t.match(/--(.*)\r\n/);
  if (!r)
    return e;
  const s = r[1], n = t.split(`--${s}`);
  return n.shift(), n.pop(), n.forEach((i) => {
    const o = i.indexOf(`\r
\r
`), a = i.substring(0, o).trim(), l = i.substring(o + 4).trim(), c = a.match(/name="([^"]+)"/);
    if (c) {
      const u = c[1];
      e[u] = l;
    }
  }), e;
}
function vt(t) {
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
const ce = {
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
function m(t = "") {
  return function(r, s, n) {
    const i = n.value;
    n.value = function(...o) {
      try {
        return i.apply(this, o);
      } catch (a) {
        const l = typeof a == "object" ? a?.errno : null;
        if (l in ce) {
          const c = ce[l], u = typeof o[0] == "string" ? o[0] : null, d = u !== null ? t.replaceAll("{path}", u) : t;
          throw new Error(`${d}: ${c}`, {
            cause: a
          });
        }
        throw a;
      }
    };
  };
}
const St = [];
function Rt(t) {
  return St[t];
}
(function() {
  return typeof process < "u" && process.release?.name === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
})();
var xt = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, w = (t, e, r, s) => {
  for (var n = s > 1 ? void 0 : s ? Tt(e, r) : e, i = t.length - 1, o; i >= 0; i--)
    (o = t[i]) && (n = (s ? o(e, r, n) : o(n)) || n);
  return s && n && xt(e, r, n), n;
};
const f = "string", E = "number", h = Symbol("__private__dont__use");
class g {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(e, r) {
    this.#e = [], this.#t = !1, this.#s = null, this.#r = {}, this.#i = [], e !== void 0 && this.initializeRuntime(e), r && (this.requestHandler = new Pt(
      new $t(this, r)
    ));
  }
  #e;
  #t;
  #s;
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
    if (this[h])
      throw new Error("PHP runtime already initialized.");
    const r = Rt(e);
    if (!r)
      throw new Error("Invalid PHP runtime id.");
    this[h] = r, r.onMessage = (s) => {
      for (const n of this.#i)
        n(s);
    }, this.#s = ht(r);
  }
  /** @inheritDoc */
  setPhpIniPath(e) {
    if (this.#t)
      throw new Error("Cannot set PHP ini path after calling run().");
    this[h].ccall(
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
    this[h].FS.chdir(e);
  }
  /** @inheritDoc */
  async request(e, r) {
    if (!this.requestHandler)
      throw new Error("No request handler available.");
    return this.requestHandler.request(e, r);
  }
  /** @inheritDoc */
  async run(e) {
    this.#t || (this.#n(), this.#t = !0), this.#d(e.scriptPath || ""), this.#a(e.relativeUri || ""), this.#l(e.method || "GET");
    const { host: r, ...s } = {
      host: "example.com:443",
      ...$e(e.headers || {})
    };
    if (this.#c(r, e.protocol || "http"), this.#u(s), e.body && this.#h(e.body), e.fileInfos)
      for (const n of e.fileInfos)
        this.#f(n);
    return e.code && this.#m(" ?>" + e.code), this.#p(), await this.#w();
  }
  #n() {
    if (this.#e.length > 0) {
      const e = this.#e.map(([r, s]) => `${r}=${s}`).join(`
`) + `

`;
      this[h].ccall(
        "wasm_set_phpini_entries",
        null,
        [f],
        [e]
      );
    }
    this[h].ccall("php_wasm_init", null, [], []);
  }
  #o() {
    const e = "/tmp/headers.json";
    if (!this.fileExists(e))
      throw new Error(
        "SAPI Error: Could not find response headers file."
      );
    const r = JSON.parse(this.readFileAsText(e)), s = {};
    for (const n of r.headers) {
      if (!n.includes(": "))
        continue;
      const i = n.indexOf(": "), o = n.substring(0, i).toLowerCase(), a = n.substring(i + 2);
      o in s || (s[o] = []), s[o].push(a);
    }
    return {
      headers: s,
      httpStatusCode: r.status
    };
  }
  #a(e) {
    if (this[h].ccall(
      "wasm_set_request_uri",
      null,
      [f],
      [e]
    ), e.includes("?")) {
      const r = e.substring(e.indexOf("?") + 1);
      this[h].ccall(
        "wasm_set_query_string",
        null,
        [f],
        [r]
      );
    }
  }
  #c(e, r) {
    this[h].ccall(
      "wasm_set_request_host",
      null,
      [f],
      [e]
    );
    let s;
    try {
      s = parseInt(new URL(e).port, 10);
    } catch {
    }
    (!s || isNaN(s) || s === 80) && (s = r === "https" ? 443 : 80), this[h].ccall(
      "wasm_set_request_port",
      null,
      [E],
      [s]
    ), (r === "https" || !r && s === 443) && this.addServerGlobalEntry("HTTPS", "on");
  }
  #l(e) {
    this[h].ccall(
      "wasm_set_request_method",
      null,
      [f],
      [e]
    );
  }
  #u(e) {
    e.cookie && this[h].ccall(
      "wasm_set_cookies",
      null,
      [f],
      [e.cookie]
    ), e["content-type"] && this[h].ccall(
      "wasm_set_content_type",
      null,
      [f],
      [e["content-type"]]
    ), e["content-length"] && this[h].ccall(
      "wasm_set_content_length",
      null,
      [E],
      [parseInt(e["content-length"], 10)]
    );
    for (const r in e) {
      let s = "HTTP_";
      ["content-type", "content-length"].includes(r.toLowerCase()) && (s = ""), this.addServerGlobalEntry(
        `${s}${r.toUpperCase().replace(/-/g, "_")}`,
        e[r]
      );
    }
  }
  #h(e) {
    this[h].ccall(
      "wasm_set_request_body",
      null,
      [f],
      [e]
    ), this[h].ccall(
      "wasm_set_content_length",
      null,
      [E],
      [new TextEncoder().encode(e).length]
    );
  }
  #d(e) {
    this[h].ccall(
      "wasm_set_path_translated",
      null,
      [f],
      [e]
    );
  }
  addServerGlobalEntry(e, r) {
    this.#r[e] = r;
  }
  #p() {
    for (const e in this.#r)
      this[h].ccall(
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
  #f(e) {
    const { key: r, name: s, type: n, data: i } = e, o = `/tmp/${Math.random().toFixed(20)}`;
    this.writeFile(o, i);
    const a = 0;
    this[h].ccall(
      "wasm_add_uploaded_file",
      null,
      [f, f, f, f, E, E],
      [r, s, n, o, a, i.byteLength]
    );
  }
  #m(e) {
    this[h].ccall(
      "wasm_set_php_code",
      null,
      [f],
      [e]
    );
  }
  async #w() {
    let e, r;
    try {
      e = await new Promise((i, o) => {
        r = (l) => {
          const c = new Error("Rethrown");
          c.cause = l.error, c.betterMessage = l.message, o(c);
        }, this.#s?.addEventListener(
          "error",
          r
        );
        const a = this[h].ccall(
          "wasm_sapi_handle_request",
          E,
          [],
          []
        );
        return a instanceof Promise ? a.then(i, o) : i(a);
      });
    } catch (i) {
      for (const c in this)
        typeof this[c] == "function" && (this[c] = () => {
          throw new Error(
            "PHP runtime has crashed – see the earlier error for details."
          );
        });
      this.functionsMaybeMissingFromAsyncify = dt();
      const o = i, a = "betterMessage" in o ? o.betterMessage : o.message, l = new Error(a);
      throw l.cause = o, l;
    } finally {
      this.#s?.removeEventListener("error", r), this.#r = {};
    }
    const { headers: s, httpStatusCode: n } = this.#o();
    return new b(
      n,
      s,
      this.readFileAsBuffer("/tmp/stdout"),
      this.readFileAsText("/tmp/stderr"),
      e
    );
  }
  mkdir(e) {
    this[h].FS.mkdirTree(e);
  }
  mkdirTree(e) {
    this.mkdir(e);
  }
  readFileAsText(e) {
    return new TextDecoder().decode(this.readFileAsBuffer(e));
  }
  readFileAsBuffer(e) {
    return this[h].FS.readFile(e);
  }
  writeFile(e, r) {
    this[h].FS.writeFile(e, r);
  }
  unlink(e) {
    this[h].FS.unlink(e);
  }
  mv(e, r) {
    this[h].FS.rename(e, r);
  }
  rmdir(e, r = { recursive: !0 }) {
    r?.recursive && this.listFiles(e).forEach((s) => {
      const n = `${e}/${s}`;
      this.isDir(n) ? this.rmdir(n, r) : this.unlink(n);
    }), this[h].FS.rmdir(e);
  }
  listFiles(e, r = { prependPath: !1 }) {
    if (!this.fileExists(e))
      return [];
    try {
      const s = this[h].FS.readdir(e).filter(
        (n) => n !== "." && n !== ".."
      );
      if (r.prependPath) {
        const n = e.replace(/\/$/, "");
        return s.map((i) => `${n}/${i}`);
      }
      return s;
    } catch (s) {
      return console.error(s, { path: e }), [];
    }
  }
  isDir(e) {
    return this.fileExists(e) ? this[h].FS.isDir(
      this[h].FS.lookupPath(e).node.mode
    ) : !1;
  }
  fileExists(e) {
    try {
      return this[h].FS.lookupPath(e), !0;
    } catch {
      return !1;
    }
  }
}
w([
  m('Could not create directory "{path}"')
], g.prototype, "mkdir", 1);
w([
  m('Could not create directory "{path}"')
], g.prototype, "mkdirTree", 1);
w([
  m('Could not read "{path}"')
], g.prototype, "readFileAsText", 1);
w([
  m('Could not read "{path}"')
], g.prototype, "readFileAsBuffer", 1);
w([
  m('Could not write to "{path}"')
], g.prototype, "writeFile", 1);
w([
  m('Could not unlink "{path}"')
], g.prototype, "unlink", 1);
w([
  m('Could not move "{path}"')
], g.prototype, "mv", 1);
w([
  m('Could not remove directory "{path}"')
], g.prototype, "rmdir", 1);
w([
  m('Could not list files in "{path}"')
], g.prototype, "listFiles", 1);
w([
  m('Could not stat "{path}"')
], g.prototype, "isDir", 1);
w([
  m('Could not stat "{path}"')
], g.prototype, "fileExists", 1);
function $e(t) {
  const e = {};
  for (const r in t)
    e[r.toLowerCase()] = t[r];
  return e;
}
const Ft = [
  "vfs",
  "literal",
  "wordpress.org/themes",
  "wordpress.org/plugins",
  "url"
];
function Ct(t) {
  return t && typeof t == "object" && typeof t.resource == "string" && Ft.includes(t.resource);
}
class $ {
  /**
   * Creates a new Resource based on the given file reference
   *
   * @param ref The file reference to create the Resource for
   * @param options Additional options for the Resource
   * @returns A new Resource instance
   */
  static create(e, { semaphore: r, progress: s }) {
    let n;
    switch (e.resource) {
      case "vfs":
        n = new kt(e, s);
        break;
      case "literal":
        n = new At(e, s);
        break;
      case "wordpress.org/themes":
        n = new Nt(e, s);
        break;
      case "wordpress.org/plugins":
        n = new Ut(e, s);
        break;
      case "url":
        n = new Ot(e, s);
        break;
      default:
        throw new Error(`Invalid resource: ${e}`);
    }
    return n = new Ht(n), r && (n = new Wt(n, r)), n;
  }
  setPlayground(e) {
    this.playground = e;
  }
  /** Whether this Resource is loaded asynchronously */
  get isAsync() {
    return !1;
  }
}
class kt extends $ {
  /**
   * Creates a new instance of `VFSResource`.
   * @param playground The playground client.
   * @param resource The VFS reference.
   * @param progress The progress tracker.
   */
  constructor(e, r) {
    super(), this.resource = e, this.progress = r;
  }
  /** @inheritDoc */
  async resolve() {
    const e = await this.playground.readFileAsBuffer(
      this.resource.path
    );
    return this.progress?.set(100), new M([e], this.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.path.split("/").pop() || "";
  }
}
class At extends $ {
  /**
   * Creates a new instance of `LiteralResource`.
   * @param resource The literal reference.
   * @param progress The progress tracker.
   */
  constructor(e, r) {
    super(), this.resource = e, this.progress = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.progress?.set(100), new M([this.resource.contents], this.resource.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
}
class V extends $ {
  /**
   * Creates a new instance of `FetchResource`.
   * @param progress The progress tracker.
   */
  constructor(e) {
    super(), this.progress = e;
  }
  /** @inheritDoc */
  async resolve() {
    this.progress?.setCaption(this.caption);
    const e = this.getURL();
    let r = await fetch(e);
    if (r = await ct(
      r,
      this.progress?.loadingListener ?? Lt
    ), r.status !== 200)
      throw new Error(`Could not download "${e}"`);
    return new M([await r.blob()], this.name);
  }
  /**
   * Gets the caption for the progress tracker.
   * @returns The caption.
   */
  get caption() {
    return `Downloading ${this.name}`;
  }
  /** @inheritDoc */
  get name() {
    try {
      return new URL(this.getURL(), "http://example.com").pathname.split("/").pop();
    } catch {
      return this.getURL();
    }
  }
  /** @inheritDoc */
  get isAsync() {
    return !0;
  }
}
const Lt = () => {
};
class Ot extends V {
  /**
   * Creates a new instance of `UrlResource`.
   * @param resource The URL reference.
   * @param progress The progress tracker.
   */
  constructor(e, r) {
    super(r), this.resource = e;
  }
  /** @inheritDoc */
  getURL() {
    return this.resource.url;
  }
  /** @inheritDoc */
  get caption() {
    return this.resource.caption ?? super.caption;
  }
}
let G = "https://playground.wordpress.net/plugin-proxy";
function cr(t) {
  G = t;
}
class Nt extends V {
  constructor(e, r) {
    super(r), this.resource = e;
  }
  get name() {
    return O(this.resource.slug);
  }
  getURL() {
    const e = Ee(this.resource.slug);
    return `${G}?theme=` + e;
  }
}
class Ut extends V {
  constructor(e, r) {
    super(r), this.resource = e;
  }
  /** @inheritDoc */
  get name() {
    return O(this.resource.slug);
  }
  /** @inheritDoc */
  getURL() {
    const e = Ee(this.resource.slug);
    return `${G}?plugin=` + e;
  }
}
function Ee(t) {
  return !t || t.endsWith(".zip") ? t : t + ".latest-stable.zip";
}
class ve extends $ {
  constructor(e) {
    super(), this.resource = e;
  }
  /** @inheritDoc */
  async resolve() {
    return this.resource.resolve();
  }
  /** @inheritDoc */
  async setPlayground(e) {
    return this.resource.setPlayground(e);
  }
  /** @inheritDoc */
  get progress() {
    return this.resource.progress;
  }
  /** @inheritDoc */
  set progress(e) {
    this.resource.progress = e;
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
  /** @inheritDoc */
  get isAsync() {
    return this.resource.isAsync;
  }
}
class Ht extends ve {
  /** @inheritDoc */
  async resolve() {
    return this.promise || (this.promise = super.resolve()), this.promise;
  }
}
class Wt extends ve {
  constructor(e, r) {
    super(e), this.semaphore = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.isAsync ? this.semaphore.run(() => super.resolve()) : super.resolve();
  }
}
const It = ["6.2", "6.1", "6.0", "5.9"];
function Mt(t, {
  progress: e = new N(),
  semaphore: r = new ye({ concurrency: 3 }),
  onStepCompleted: s = () => {
  }
} = {}) {
  const n = (t.steps || []).filter(zt), i = n.reduce(
    (a, l) => a + (l.progress?.weight || 1),
    0
  ), o = n.map(
    (a) => Dt(a, {
      semaphore: r,
      rootProgressTracker: e,
      totalProgressWeight: i
    })
  );
  return {
    versions: {
      php: le(
        t.preferredVersions?.php,
        B,
        yt
      ),
      wp: le(
        t.preferredVersions?.wp,
        It,
        "6.2"
      )
    },
    run: async (a) => {
      try {
        for (const { resources: l } of o)
          for (const c of l)
            c.setPlayground(a), c.isAsync && c.resolve();
        for (const { run: l, step: c } of o) {
          const u = await l(a);
          s(u, c);
        }
        try {
          await a.goTo(
            t.landingPage || "/"
          );
        } catch {
        }
      } finally {
        e.finish();
      }
    }
  };
}
function le(t, e, r) {
  return t && e.includes(t) ? t : r;
}
function zt(t) {
  return !!(typeof t == "object" && t);
}
function Dt(t, {
  semaphore: e,
  rootProgressTracker: r,
  totalProgressWeight: s
}) {
  const n = r.stage(
    (t.progress?.weight || 1) / s
  ), i = {};
  for (const u of Object.keys(t)) {
    let d = t[u];
    Ct(d) && (d = $.create(d, {
      semaphore: e
    })), i[u] = d;
  }
  const o = async (u) => {
    try {
      return n.fillSlowly(), await ot[t.step](
        u,
        await qt(i),
        {
          tracker: n,
          initialCaption: t.progress?.caption
        }
      );
    } finally {
      n.finish();
    }
  }, a = ue(i), l = ue(i).filter(
    (u) => u.isAsync
  ), c = 1 / (l.length + 1);
  for (const u of l)
    u.progress = n.stage(c);
  return { run: o, step: t, resources: a };
}
function ue(t) {
  const e = [];
  for (const r in t) {
    const s = t[r];
    s instanceof $ && e.push(s);
  }
  return e;
}
async function qt(t) {
  const e = {};
  for (const r in t) {
    const s = t[r];
    s instanceof $ ? e[r] = await s.resolve() : e[r] = s;
  }
  return e;
}
async function jt(t, e) {
  await t.run(e);
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Se = Symbol("Comlink.proxy"), Bt = Symbol("Comlink.endpoint"), Vt = Symbol("Comlink.releaseProxy"), H = Symbol("Comlink.finalizer"), F = Symbol("Comlink.thrown"), Re = (t) => typeof t == "object" && t !== null || typeof t == "function", Gt = {
  canHandle: (t) => Re(t) && t[Se],
  serialize(t) {
    const { port1: e, port2: r } = new MessageChannel();
    return Y(t, e), [r, [r]];
  },
  deserialize(t) {
    return t.start(), K(t);
  }
}, Yt = {
  canHandle: (t) => Re(t) && F in t,
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
}, x = /* @__PURE__ */ new Map([
  ["proxy", Gt],
  ["throw", Yt]
]);
function Kt(t, e) {
  for (const r of t)
    if (e === r || r === "*" || r instanceof RegExp && r.test(e))
      return !0;
  return !1;
}
function Y(t, e = globalThis, r = ["*"]) {
  e.addEventListener("message", function s(n) {
    if (!n || !n.data)
      return;
    if (!Kt(r, n.origin)) {
      console.warn(`Invalid origin '${n.origin}' for comlink proxy`);
      return;
    }
    const { id: i, type: o, path: a } = Object.assign({ path: [] }, n.data), l = (n.data.argumentList || []).map(_);
    let c;
    try {
      const u = a.slice(0, -1).reduce((p, y) => p[y], t), d = a.reduce((p, y) => p[y], t);
      switch (o) {
        case "GET":
          c = d;
          break;
        case "SET":
          u[a.slice(-1)[0]] = _(n.data.value), c = !0;
          break;
        case "APPLY":
          c = d.apply(u, l);
          break;
        case "CONSTRUCT":
          {
            const p = new d(...l);
            c = Ce(p);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: p, port2: y } = new MessageChannel();
            Y(t, y), c = er(p, [p]);
          }
          break;
        case "RELEASE":
          c = void 0;
          break;
        default:
          return;
      }
    } catch (u) {
      c = { value: u, [F]: 0 };
    }
    Promise.resolve(c).catch((u) => ({ value: u, [F]: 0 })).then((u) => {
      const [d, p] = L(u);
      e.postMessage(Object.assign(Object.assign({}, d), { id: i }), p), o === "RELEASE" && (e.removeEventListener("message", s), xe(e), H in t && typeof t[H] == "function" && t[H]());
    }).catch((u) => {
      const [d, p] = L({
        value: new TypeError("Unserializable return value"),
        [F]: 0
      });
      e.postMessage(Object.assign(Object.assign({}, d), { id: i }), p);
    });
  }), e.start && e.start();
}
function Jt(t) {
  return t.constructor.name === "MessagePort";
}
function xe(t) {
  Jt(t) && t.close();
}
function K(t, e) {
  return I(t, [], e);
}
function T(t) {
  if (t)
    throw new Error("Proxy has been released and is not useable");
}
function Te(t) {
  return v(t, {
    type: "RELEASE"
  }).then(() => {
    xe(t);
  });
}
const k = /* @__PURE__ */ new WeakMap(), A = "FinalizationRegistry" in globalThis && new FinalizationRegistry((t) => {
  const e = (k.get(t) || 0) - 1;
  k.set(t, e), e === 0 && Te(t);
});
function Zt(t, e) {
  const r = (k.get(e) || 0) + 1;
  k.set(e, r), A && A.register(t, e, t);
}
function Qt(t) {
  A && A.unregister(t);
}
function I(t, e = [], r = function() {
}) {
  let s = !1;
  const n = new Proxy(r, {
    get(i, o) {
      if (T(s), o === Vt)
        return () => {
          Qt(n), Te(t), s = !0;
        };
      if (o === "then") {
        if (e.length === 0)
          return { then: () => n };
        const a = v(t, {
          type: "GET",
          path: e.map((l) => l.toString())
        }).then(_);
        return a.then.bind(a);
      }
      return I(t, [...e, o]);
    },
    set(i, o, a) {
      T(s);
      const [l, c] = L(a);
      return v(t, {
        type: "SET",
        path: [...e, o].map((u) => u.toString()),
        value: l
      }, c).then(_);
    },
    apply(i, o, a) {
      T(s);
      const l = e[e.length - 1];
      if (l === Bt)
        return v(t, {
          type: "ENDPOINT"
        }).then(_);
      if (l === "bind")
        return I(t, e.slice(0, -1));
      const [c, u] = he(a);
      return v(t, {
        type: "APPLY",
        path: e.map((d) => d.toString()),
        argumentList: c
      }, u).then(_);
    },
    construct(i, o) {
      T(s);
      const [a, l] = he(o);
      return v(t, {
        type: "CONSTRUCT",
        path: e.map((c) => c.toString()),
        argumentList: a
      }, l).then(_);
    }
  });
  return Zt(n, t), n;
}
function Xt(t) {
  return Array.prototype.concat.apply([], t);
}
function he(t) {
  const e = t.map(L);
  return [e.map((r) => r[0]), Xt(e.map((r) => r[1]))];
}
const Fe = /* @__PURE__ */ new WeakMap();
function er(t, e) {
  return Fe.set(t, e), t;
}
function Ce(t) {
  return Object.assign(t, { [Se]: !0 });
}
function tr(t, e = globalThis, r = "*") {
  return {
    postMessage: (s, n) => t.postMessage(s, r, n),
    addEventListener: e.addEventListener.bind(e),
    removeEventListener: e.removeEventListener.bind(e)
  };
}
function L(t) {
  for (const [e, r] of x)
    if (r.canHandle(t)) {
      const [s, n] = r.serialize(t);
      return [
        {
          type: "HANDLER",
          name: e,
          value: s
        },
        n
      ];
    }
  return [
    {
      type: "RAW",
      value: t
    },
    Fe.get(t) || []
  ];
}
function _(t) {
  switch (t.type) {
    case "HANDLER":
      return x.get(t.name).deserialize(t.value);
    case "RAW":
      return t.value;
  }
}
function v(t, e, r) {
  return new Promise((s) => {
    const n = rr();
    t.addEventListener("message", function i(o) {
      !o.data || !o.data.id || o.data.id !== n || (t.removeEventListener("message", i), s(o.data));
    }), t.start && t.start(), t.postMessage(Object.assign({ id: n }, e), r);
  });
}
function rr() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
function ke(t) {
  nr();
  const e = t instanceof Worker ? t : tr(t), r = K(e), s = Ae(r);
  return new Proxy(s, {
    get: (n, i) => i === "isConnected" ? async () => {
      for (let o = 0; o < 10; o++)
        try {
          await sr(r.isConnected(), 200);
          break;
        } catch {
        }
    } : r[i]
  });
}
async function sr(t, e) {
  return new Promise((r, s) => {
    setTimeout(s, e), t.then(r);
  });
}
let de = !1;
function nr() {
  de || (de = !0, x.set("EVENT", {
    canHandle: (t) => t instanceof CustomEvent,
    serialize: (t) => [
      {
        detail: t.detail
      },
      []
    ],
    deserialize: (t) => t
  }), x.set("FUNCTION", {
    canHandle: (t) => typeof t == "function",
    serialize(t) {
      console.debug("[Comlink][Performance] Proxying a function");
      const { port1: e, port2: r } = new MessageChannel();
      return Y(t, e), [r, [r]];
    },
    deserialize(t) {
      return t.start(), K(t);
    }
  }), x.set("PHPResponse", {
    canHandle: (t) => typeof t == "object" && t !== null && "headers" in t && "bytes" in t && "errors" in t && "exitCode" in t && "httpStatusCode" in t,
    serialize(t) {
      return [t.toRawData(), []];
    },
    deserialize(t) {
      return b.fromRawData(t);
    }
  }));
}
function Ae(t) {
  return new Proxy(t, {
    get(e, r) {
      switch (typeof e[r]) {
        case "function":
          return (...s) => e[r](...s);
        case "object":
          return e[r] === null ? e[r] : Ae(e[r]);
        case "undefined":
        case "number":
        case "string":
          return e[r];
        default:
          return Ce(e[r]);
      }
    }
  });
}
(function() {
  return typeof navigator < "u" && navigator?.userAgent?.toLowerCase().indexOf("firefox") > -1 ? "iframe" : "webworker";
})();
async function ir({
  iframe: t,
  blueprint: e,
  remoteUrl: r,
  progressTracker: s = new N(),
  disableProgressBar: n,
  onBlueprintStepCompleted: i
}) {
  if (or(r), r = fe(r, {
    progressbar: !n
  }), s.setCaption("Preparing WordPress"), !e)
    return pe(t, r, s);
  const o = Mt(e, {
    progress: s.stage(0.5),
    onStepCompleted: i
  }), a = await pe(
    t,
    fe(r, {
      php: o.versions.php,
      wp: o.versions.wp
    }),
    s
  );
  return await jt(o, a), s.finish(), a;
}
async function pe(t, e, r) {
  await new Promise((i) => {
    t.src = e, t.addEventListener("load", i, !1);
  });
  const s = ke(
    t.contentWindow
  );
  await s.isConnected(), r.pipe(s);
  const n = r.stage();
  return await s.onDownloadProgress(n.loadingListener), await s.isReady(), n.finish(), s;
}
const C = "https://playground.wordpress.net";
function or(t) {
  const e = new URL(t, C);
  if ((e.origin === C || e.hostname === "localhost") && e.pathname !== "/remote.html")
    throw new Error(
      `Invalid remote URL: ${e}. Expected origin to be ${C}/remote.html.`
    );
}
function fe(t, e) {
  const r = new URL(t, C), s = new URLSearchParams(r.search);
  for (const [n, i] of Object.entries(e))
    i != null && i !== !1 && s.set(n, i.toString());
  return r.search = s.toString(), r.toString();
}
async function lr(t, e) {
  if (console.warn(
    "`connectPlayground` is deprecated and will be removed. Use `startPlayground` instead."
  ), e?.loadRemote)
    return ir({
      iframe: t,
      remoteUrl: e.loadRemote
    });
  const r = ke(
    t.contentWindow
  );
  return await r.isConnected(), r;
}
export {
  yt as LatestSupportedPHPVersion,
  B as SupportedPHPVersions,
  ar as SupportedPHPVersionsList,
  me as activatePlugin,
  we as activateTheme,
  Ne as applyWordPressPatches,
  Mt as compileBlueprint,
  lr as connectPlayground,
  ze as cp,
  Ve as defineSiteUrl,
  z as defineWpConfigConsts,
  Je as importFile,
  Xe as installPlugin,
  tt as installTheme,
  rt as login,
  qe as mkdir,
  De as mv,
  S as phpVar,
  D as phpVars,
  Ke as replaceSite,
  Me as request,
  je as rm,
  Be as rmdir,
  jt as runBlueprintSteps,
  He as runPHP,
  We as runPHPWithOptions,
  st as runWpInstallationWizard,
  Ie as setPhpIniEntry,
  cr as setPluginProxyURL,
  nt as setSiteOptions,
  ir as startPlaygroundWeb,
  q as unzip,
  it as updateUserMeta,
  ge as writeFile,
  Ye as zipEntireSite
};
