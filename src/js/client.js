const Hs = async (e, { pluginPath: t, pluginName: r }, n) => {
  n?.tracker.setCaption(`Activating ${r || t}`);
  const s = [
    `${await e.documentRoot}/wp-load.php`,
    `${await e.documentRoot}/wp-admin/includes/plugin.php`
  ];
  if (!s.every(
    (l) => e.fileExists(l)
  ))
    throw new Error(
      `Required WordPress files do not exist: ${s.join(", ")}`
    );
  if ((await e.run({
    code: `<?php
define( 'WP_ADMIN', true );
${s.map((l) => `require_once( '${l}' );`).join(`
`)}
$plugin_path = '${t}';
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
}, Ws = async (e, { themeFolderName: t }, r) => {
  r?.tracker.setCaption(`Activating ${t}`);
  const n = `${await e.documentRoot}/wp-load.php`;
  if (!e.fileExists(n))
    throw new Error(
      `Required WordPress file does not exist: ${n}`
    );
  await e.run({
    code: `<?php
define( 'WP_ADMIN', true );
require_once( '${n}' );
switch_theme( '${t}' );
`
  });
};
function Or(e) {
  const t = e.split(".").shift().replace(/-/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
async function Kt(e, t, r) {
  let n = "";
  await e.fileExists(t) && (n = await e.readFileAsText(t)), await e.writeFile(t, r(n));
}
async function Xi(e) {
  return new Uint8Array(await e.arrayBuffer());
}
class ea extends File {
  constructor(t, r) {
    super(t, r), this.buffers = t;
  }
  async arrayBuffer() {
    return this.buffers[0];
  }
}
const Qr = File.prototype.arrayBuffer instanceof Function ? File : ea, is = "/vfs-blueprints", Xr = async (e, { consts: t, virtualize: r = !1 }) => {
  const n = await e.documentRoot, s = r ? is : n, i = `${s}/playground-consts.json`, a = `${s}/wp-config.php`;
  return r && (e.mkdir(is), e.setPhpIniEntry("auto_prepend_file", a)), await Kt(
    e,
    i,
    (l) => JSON.stringify({
      ...JSON.parse(l || "{}"),
      ...t
    })
  ), await Kt(e, a, (l) => l.includes("playground-consts.json") ? l : `<?php
	$consts = json_decode(file_get_contents('${i}'), true);
	foreach ($consts as $const => $value) {
		if (!defined($const)) {
			define($const, $value);
		}
	}
?>${l}`), a;
}, ta = async (e, t) => {
  const r = new ra(
    e,
    t.wordpressPath || "/wordpress",
    t.siteUrl
  );
  t.addPhpInfo === !0 && await r.addPhpInfo(), t.siteUrl && await r.patchSiteUrl(), t.patchSecrets === !0 && await r.patchSecrets(), t.disableSiteHealth === !0 && await r.disableSiteHealth(), t.disableWpNewBlogNotification === !0 && await r.disableWpNewBlogNotification();
};
class ra {
  constructor(t, r, n) {
    this.php = t, this.scopedSiteUrl = n, this.wordpressPath = r;
  }
  async addPhpInfo() {
    await this.php.writeFile(
      `${this.wordpressPath}/phpinfo.php`,
      "<?php phpinfo(); "
    );
  }
  async patchSiteUrl() {
    await Xr(this.php, {
      consts: {
        WP_HOME: this.scopedSiteUrl,
        WP_SITEURL: this.scopedSiteUrl
      },
      virtualize: !0
    });
  }
  async patchSecrets() {
    await Kt(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      (t) => `<?php
					define('AUTH_KEY',         '${Ge(40)}');
					define('SECURE_AUTH_KEY',  '${Ge(40)}');
					define('LOGGED_IN_KEY',    '${Ge(40)}');
					define('NONCE_KEY',        '${Ge(40)}');
					define('AUTH_SALT',        '${Ge(40)}');
					define('SECURE_AUTH_SALT', '${Ge(40)}');
					define('LOGGED_IN_SALT',   '${Ge(40)}');
					define('NONCE_SALT',       '${Ge(40)}');
				?>${t.replaceAll("', 'put your unique phrase here'", "__', ''")}`
    );
  }
  async disableSiteHealth() {
    await Kt(
      this.php,
      `${this.wordpressPath}/wp-includes/default-filters.php`,
      (t) => t.replace(
        /add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,
        ""
      )
    );
  }
  async disableWpNewBlogNotification() {
    await Kt(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      // The original version of this function crashes WASM PHP, let's define an empty one instead.
      (t) => `${t} function wp_new_blog_notification(...$args){} `
    );
  }
}
function Ge(e) {
  const t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?";
  let r = "";
  for (let n = e; n > 0; --n)
    r += t[Math.floor(Math.random() * t.length)];
  return r;
}
const na = async (e, { code: t }) => await e.run({ code: t }), sa = async (e, { options: t }) => await e.run(t), ia = async (e, { key: t, value: r }) => {
  await e.setPhpIniEntry(t, r);
}, aa = async (e, { request: t }) => await e.request(t), oa = async (e, { fromPath: t, toPath: r }) => {
  await e.writeFile(
    r,
    await e.readFileAsBuffer(t)
  );
}, ca = async (e, { fromPath: t, toPath: r }) => {
  await e.mv(t, r);
}, la = async (e, { path: t }) => {
  await e.mkdir(t);
}, ua = async (e, { path: t }) => {
  await e.unlink(t);
}, da = async (e, { path: t }) => {
  await e.rmdir(t);
}, Ks = async (e, { path: t, data: r }) => {
  r instanceof File && (r = await Xi(r)), await e.writeFile(t, r);
}, fa = async (e, { siteUrl: t }) => await Xr(e, {
  consts: {
    WP_HOME: t,
    WP_SITEURL: t
  }
});
class Gs {
  constructor({ concurrency: t }) {
    this._running = 0, this.concurrency = t, this.queue = [];
  }
  get running() {
    return this._running;
  }
  async acquire() {
    for (; ; )
      if (this._running >= this.concurrency)
        await new Promise((t) => this.queue.push(t));
      else {
        this._running++;
        let t = !1;
        return () => {
          t || (t = !0, this._running--, this.queue.length > 0 && this.queue.shift()());
        };
      }
  }
  async run(t) {
    const r = await this.acquire();
    try {
      return await t();
    } finally {
      r();
    }
  }
}
const pa = Symbol("literal");
function Rt(e) {
  if (typeof e == "string")
    return e.startsWith("$") ? e : JSON.stringify(e);
  if (typeof e == "number")
    return e.toString();
  if (Array.isArray(e))
    return `array(${e.map(Rt).join(", ")})`;
  if (e === null)
    return "null";
  if (typeof e == "object")
    return pa in e ? e.toString() : `array(${Object.entries(e).map(([r, n]) => `${JSON.stringify(r)} => ${Rt(n)}`).join(", ")})`;
  if (typeof e == "function")
    return e();
  throw new Error(`Unsupported value: ${e}`);
}
function en(e) {
  const t = {};
  for (const r in e)
    t[r] = Rt(e[r]);
  return t;
}
const as = `<?php

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
async function ha(e) {
  const t = "wordpress-playground.zip", r = `/tmp/${t}`, n = en({
    zipPath: r,
    documentRoot: await e.documentRoot
  });
  await Bs(
    e,
    `zipDir(${n.documentRoot}, ${n.zipPath});`
  );
  const s = await e.readFileAsBuffer(r);
  return e.unlink(r), new File([s], t);
}
const ma = async (e, { fullSiteZip: t }) => {
  const r = "/import.zip";
  await e.writeFile(
    r,
    new Uint8Array(await t.arrayBuffer())
  );
  const n = await e.absoluteUrl, s = await e.documentRoot;
  await e.rmdir(s), await tn(e, { zipPath: r, extractToPath: "/" });
  const i = en({ absoluteUrl: n });
  await $a(
    e,
    `${s}/wp-config.php`,
    (a) => `<?php
			if(!defined('WP_HOME')) {
				define('WP_HOME', ${i.absoluteUrl});
				define('WP_SITEURL', ${i.absoluteUrl});
			}
			?>${a}`
  );
}, tn = async (e, { zipPath: t, extractToPath: r }) => {
  const n = en({
    zipPath: t,
    extractToPath: r
  });
  await Bs(
    e,
    `unzip(${n.zipPath}, ${n.extractToPath});`
  );
}, ya = async (e, { file: t }) => {
  const r = await e.request({
    url: "/wp-admin/admin.php?import=wordpress"
  }), n = os(r).getElementById("import-upload-form")?.getAttribute("action"), s = await e.request({
    url: `/wp-admin/${n}`,
    method: "POST",
    files: { import: t }
  }), i = os(s).querySelector(
    "#wpbody-content form"
  );
  if (!i)
    throw console.log(s.text), new Error(
      "Could not find an importer form in response. See the response text above for details."
    );
  const a = ga(i);
  a.fetch_attachments = "1";
  for (const l in a)
    if (l.startsWith("user_map[")) {
      const p = "user_new[" + l.slice(9, -1) + "]";
      a[p] = "1";
    }
  await e.request({
    url: i.action,
    method: "POST",
    formData: a
  });
};
function os(e) {
  return new DOMParser().parseFromString(e.text, "text/html");
}
function ga(e) {
  return Object.fromEntries(new FormData(e).entries());
}
async function $a(e, t, r) {
  await e.writeFile(
    t,
    r(await e.readFileAsText(t))
  );
}
async function Bs(e, t) {
  const r = await e.run({
    code: as + t
  });
  if (r.exitCode !== 0)
    throw console.log(as + t), console.log(t + ""), console.log(r.errors), r.errors;
  return r;
}
async function xs(e, { targetPath: t, zipFile: r }) {
  const n = r.name, s = n.replace(/\.zip$/, ""), i = `/tmp/assets/${s}`, a = `/tmp/${n}`, l = () => e.rmdir(i, {
    recursive: !0
  });
  await e.fileExists(i) && await l(), await Ks(e, {
    path: a,
    data: r
  });
  const p = () => Promise.all([l, () => e.unlink(a)]);
  try {
    await tn(e, {
      zipPath: a,
      extractToPath: i
    });
    const u = await e.listFiles(i, {
      prependPath: !0
    }), d = u.length === 1 && await e.isDir(u[0]);
    let g, C = "";
    d ? (C = u[0], g = u[0].split("/").pop()) : (C = i, g = s);
    const j = `${t}/${g}`;
    return await e.mv(C, j), await p(), {
      assetFolderPath: j,
      assetFolderName: g
    };
  } catch (u) {
    throw await p(), u;
  }
}
const va = async (e, { pluginZipFile: t, options: r = {} }, n) => {
  const s = t.name.split("/").pop() || "plugin.zip", i = Or(s);
  n?.tracker.setCaption(`Installing the ${i} plugin`);
  try {
    const { assetFolderPath: a } = await xs(e, {
      zipFile: t,
      targetPath: `${await e.documentRoot}/wp-content/plugins`
    });
    ("activate" in r ? r.activate : !0) && await Hs(
      e,
      {
        pluginPath: a,
        pluginName: i
      },
      n
    ), await _a(e);
  } catch (a) {
    console.error(
      `Proceeding without the ${i} plugin. Could not install it in wp-admin. The original error was: ${a}`
    ), console.error(a);
  }
};
async function _a(e) {
  await e.isDir("/wordpress/wp-content/plugins/gutenberg") && !await e.fileExists("/wordpress/.gutenberg-patched") && (await e.writeFile("/wordpress/.gutenberg-patched", "1"), await cs(
    e,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.js",
    (t) => t.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ), await cs(
    e,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.min.js",
    (t) => t.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ));
}
async function cs(e, t, r) {
  return await e.writeFile(
    t,
    r(await e.readFileAsText(t))
  );
}
const wa = async (e, { themeZipFile: t, options: r = {} }, n) => {
  const s = Or(t.name);
  n?.tracker.setCaption(`Installing the ${s} theme`);
  try {
    const { assetFolderName: i } = await xs(e, {
      zipFile: t,
      targetPath: `${await e.documentRoot}/wp-content/themes`
    });
    ("activate" in r ? r.activate : !0) && await Ws(
      e,
      {
        themeFolderName: i
      },
      n
    );
  } catch (i) {
    console.error(
      `Proceeding without the ${s} theme. Could not install it in wp-admin. The original error was: ${i}`
    ), console.error(i);
  }
}, ba = async (e, { username: t = "admin", password: r = "password" } = {}, n) => {
  n?.tracker.setCaption(n?.initialCaption || "Logging in"), await e.request({
    url: "/wp-login.php"
  }), await e.request({
    url: "/wp-login.php",
    method: "POST",
    formData: {
      log: t,
      pwd: r,
      rememberme: "forever"
    }
  });
}, Pa = async (e, { options: t }) => {
  await e.request({
    url: "/wp-admin/install.php?step=2",
    method: "POST",
    formData: {
      language: "en",
      prefix: "wp_",
      weblog_title: "My WordPress Website",
      user_name: t.adminPassword || "admin",
      admin_password: t.adminPassword || "password",
      // The installation wizard demands typing the same password twice
      admin_password2: t.adminPassword || "password",
      Submit: "Install WordPress",
      pw_weak: "1",
      admin_email: "admin@localhost.com"
    }
  });
}, Ea = async (e, { options: t }) => {
  const r = `<?php
	include 'wordpress/wp-load.php';
	$site_options = ${Rt(t)};
	foreach($site_options as $name => $value) {
		update_option($name, $value);
	}
	echo "Success";
	`, n = await e.run({
    code: r
  });
  return Js(n), { code: r, result: n };
}, Sa = async (e, { meta: t, userId: r }) => {
  const n = `<?php
	include 'wordpress/wp-load.php';
	$meta = ${Rt(t)};
	foreach($meta as $name => $value) {
		update_user_meta(${Rt(r)}, $name, $value);
	}
	echo "Success";
	`, s = await e.run({
    code: n
  });
  return Js(s), { code: n, result: s };
};
async function Js(e) {
  if (e.text !== "Success")
    throw console.log(e), new Error(`Failed to run code: ${e.text} ${e.errors}`);
}
const Ta = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activatePlugin: Hs,
  activateTheme: Ws,
  applyWordPressPatches: ta,
  cp: oa,
  defineSiteUrl: fa,
  defineWpConfigConsts: Xr,
  importFile: ya,
  installPlugin: va,
  installTheme: wa,
  login: ba,
  mkdir: la,
  mv: ca,
  replaceSite: ma,
  request: aa,
  rm: ua,
  rmdir: da,
  runPHP: na,
  runPHPWithOptions: sa,
  runWpInstallationWizard: Pa,
  setPhpIniEntry: ia,
  setSiteOptions: Ea,
  unzip: tn,
  updateUserMeta: Sa,
  writeFile: Ks,
  zipEntireSite: ha
}, Symbol.toStringTag, { value: "Module" })), Ra = 5 * 1024 * 1024;
function Na(e, t) {
  const r = e.headers.get("content-length") || "", n = parseInt(r, 10) || Ra;
  function s(i, a) {
    t(
      new CustomEvent("progress", {
        detail: {
          loaded: i,
          total: a
        }
      })
    );
  }
  return new Response(
    new ReadableStream({
      async start(i) {
        if (!e.body) {
          i.close();
          return;
        }
        const a = e.body.getReader();
        let l = 0;
        for (; ; )
          try {
            const { done: p, value: u } = await a.read();
            if (u && (l += u.byteLength), p) {
              s(l, l), i.close();
              break;
            } else
              s(l, n), i.enqueue(u);
          } catch (p) {
            console.error({ e: p }), i.error(p);
            break;
          }
      }
    }),
    {
      status: e.status,
      statusText: e.statusText,
      headers: e.headers
    }
  );
}
const Fr = 1e-5;
class Cr extends EventTarget {
  constructor({
    weight: t = 1,
    caption: r = "",
    fillTime: n = 4
  } = {}) {
    super(), this._selfWeight = 1, this._selfDone = !1, this._selfProgress = 0, this._selfCaption = "", this._isFilling = !1, this._subTrackers = [], this._weight = t, this._selfCaption = r, this._fillTime = n;
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
  stage(t, r = "") {
    if (t || (t = this._selfWeight), this._selfWeight - t < -Fr)
      throw new Error(
        `Cannot add a stage with weight ${t} as the total weight of registered stages would exceed 1.`
      );
    this._selfWeight -= t;
    const n = new Cr({
      caption: r,
      weight: t,
      fillTime: this._fillTime
    });
    return this._subTrackers.push(n), n.addEventListener("progress", () => this.notifyProgress()), n.addEventListener("done", () => {
      this.done && this.notifyDone();
    }), n;
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
  fillSlowly({ stopBeforeFinishing: t = !0 } = {}) {
    if (this._isFilling)
      return;
    this._isFilling = !0;
    const r = 100, n = this._fillTime / r;
    this._fillInterval = setInterval(() => {
      this.set(this._selfProgress + 1), t && this._selfProgress >= 99 && clearInterval(this._fillInterval);
    }, n);
  }
  set(t) {
    this._selfProgress = Math.min(t, 100), this.notifyProgress(), this._selfProgress + Fr >= 100 && this.finish();
  }
  finish() {
    this._fillInterval && clearInterval(this._fillInterval), this._selfDone = !0, this._selfProgress = 100, this._isFilling = !1, this._fillInterval = void 0, this.notifyProgress(), this.notifyDone();
  }
  get caption() {
    for (let t = this._subTrackers.length - 1; t >= 0; t--)
      if (!this._subTrackers[t].done) {
        const r = this._subTrackers[t].caption;
        if (r)
          return r;
      }
    return this._selfCaption;
  }
  setCaption(t) {
    this._selfCaption = t, this.notifyProgress();
  }
  get done() {
    return this.progress + Fr >= 100;
  }
  get progress() {
    if (this._selfDone)
      return 100;
    const t = this._subTrackers.reduce(
      (r, n) => r + n.progress * n.weight,
      this._selfProgress * this._selfWeight
    );
    return Math.round(t * 1e4) / 1e4;
  }
  get weight() {
    return this._weight;
  }
  get observer() {
    return this._progressObserver || (this._progressObserver = (t) => {
      this.set(t);
    }), this._progressObserver;
  }
  get loadingListener() {
    return this._loadingListener || (this._loadingListener = (t) => {
      this.set(t.detail.loaded / t.detail.total * 100);
    }), this._loadingListener;
  }
  pipe(t) {
    t.setProgress({
      progress: this.progress,
      caption: this.caption
    }), this.addEventListener("progress", (r) => {
      t.setProgress({
        progress: r.detail.progress,
        caption: r.detail.caption
      });
    }), this.addEventListener("done", () => {
      t.setLoaded();
    });
  }
  addEventListener(t, r) {
    super.addEventListener(t, r);
  }
  removeEventListener(t, r) {
    super.removeEventListener(t, r);
  }
  notifyProgress() {
    const t = this;
    this.dispatchEvent(
      new CustomEvent("progress", {
        detail: {
          get progress() {
            return t.progress;
          },
          get caption() {
            return t.caption;
          }
        }
      })
    );
  }
  notifyDone() {
    this.dispatchEvent(new CustomEvent("done"));
  }
}
const ls = Symbol("error"), us = Symbol("message");
class rn extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(t, r = {}) {
    super(t), this[ls] = r.error === void 0 ? null : r.error, this[us] = r.message === void 0 ? "" : r.message;
  }
  get error() {
    return this[ls];
  }
  get message() {
    return this[us];
  }
}
Object.defineProperty(rn.prototype, "error", { enumerable: !0 });
Object.defineProperty(rn.prototype, "message", { enumerable: !0 });
const Oa = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : rn;
class Ca extends EventTarget {
  constructor() {
    super(...arguments), this.listenersCount = 0;
  }
  addEventListener(t, r) {
    ++this.listenersCount, super.addEventListener(t, r);
  }
  removeEventListener(t, r) {
    --this.listenersCount, super.removeEventListener(t, r);
  }
  hasListeners() {
    return this.listenersCount > 0;
  }
}
function ja(e) {
  e.asm = {
    ...e.asm
  };
  const t = new Ca();
  for (const r in e.asm)
    if (typeof e.asm[r] == "function") {
      const n = e.asm[r];
      e.asm[r] = function(...s) {
        try {
          return n(...s);
        } catch (i) {
          if (!(i instanceof Error))
            throw i;
          if ("exitCode" in i && i?.exitCode === 0)
            return;
          const a = Ia(
            i,
            e.lastAsyncifyStackSource?.stack
          );
          if (e.lastAsyncifyStackSource && (i.cause = e.lastAsyncifyStackSource), !t.hasListeners())
            throw Fa(a), i;
          t.dispatchEvent(
            new Oa("error", {
              error: i,
              message: a
            })
          );
        }
      };
    }
  return t;
}
let Hr = [];
function ka() {
  return Hr;
}
function Ia(e, t) {
  if (e.message === "unreachable") {
    let r = Aa;
    t || (r += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), Hr = Ma(
      t || e.stack || ""
    );
    for (const n of Hr)
      r += `    * ${n}
`;
    return r;
  }
  return e.message;
}
const Aa = `
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

`, ds = "\x1B[41m", Da = "\x1B[1m", fs = "\x1B[0m", ps = "\x1B[K";
let hs = !1;
function Fa(e) {
  if (!hs) {
    hs = !0, console.log(`${ds}
${ps}
${Da}  WASM ERROR${fs}${ds}`);
    for (const t of e.split(`
`))
      console.log(`${ps}  ${t} `);
    console.log(`${fs}`);
  }
}
function Ma(e) {
  try {
    const t = e.split(`
`).slice(1).map((r) => {
      const n = r.trim().substring(3).split(" ");
      return {
        fn: n.length >= 2 ? n[0] : "<unknown>",
        isWasm: r.includes("wasm://")
      };
    }).filter(
      ({ fn: r, isWasm: n }) => n && !r.startsWith("dynCall_") && !r.startsWith("invoke_")
    ).map(({ fn: r }) => r);
    return Array.from(new Set(t));
  } catch {
    return [];
  }
}
class ct {
  constructor(t, r, n, s = "", i = 0) {
    this.httpStatusCode = t, this.headers = r, this.bytes = n, this.exitCode = i, this.errors = s;
  }
  static fromRawData(t) {
    return new ct(
      t.httpStatusCode,
      t.headers,
      t.bytes,
      t.errors,
      t.exitCode
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
const nn = [
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "5.6"
], Ua = nn[0], Nd = nn;
class La {
  #e;
  #t;
  /**
   * @param  server - The PHP server to browse.
   * @param  config - The browser configuration.
   */
  constructor(t, r = {}) {
    this.requestHandler = t, this.#e = {}, this.#t = {
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
  async request(t, r = 0) {
    const n = await this.requestHandler.request({
      ...t,
      headers: {
        ...t.headers,
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
  pathToInternalUrl(t) {
    return this.requestHandler.pathToInternalUrl(t);
  }
  /** @inheritDoc */
  internalUrlToPath(t) {
    return this.requestHandler.internalUrlToPath(t);
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.requestHandler.absoluteUrl;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.requestHandler.documentRoot;
  }
  #n(t) {
    for (const r of t)
      try {
        if (!r.includes("="))
          continue;
        const n = r.indexOf("="), s = r.substring(0, n), i = r.substring(n + 1).split(";")[0];
        this.#e[s] = i;
      } catch (n) {
        console.error(n);
      }
  }
  #r() {
    const t = [];
    for (const r in this.#e)
      t.push(`${r}=${this.#e[r]}`);
    return t.join("; ");
  }
}
const qa = "http://example.com";
function ms(e) {
  return e.toString().substring(e.origin.length);
}
function ys(e, t) {
  return !t || !e.startsWith(t) ? e : e.substring(t.length);
}
function Va(e, t) {
  return !t || e.startsWith(t) ? e : t + e;
}
class za {
  #e;
  #t;
  #n;
  #r;
  #i;
  #s;
  #a;
  #o;
  #c;
  /**
   * @param  php    - The PHP instance.
   * @param  config - Request Handler configuration.
   */
  constructor(t, r = {}) {
    this.#o = new Gs({ concurrency: 1 });
    const {
      documentRoot: n = "/www/",
      absoluteUrl: s = typeof location == "object" ? location?.href : "",
      isStaticFilePath: i = () => !1
    } = r;
    this.php = t, this.#e = n, this.#c = i;
    const a = new URL(s);
    this.#n = a.hostname, this.#r = a.port ? Number(a.port) : a.protocol === "https:" ? 443 : 80, this.#t = (a.protocol || "").replace(":", "");
    const l = this.#r !== 443 && this.#r !== 80;
    this.#i = [
      this.#n,
      l ? `:${this.#r}` : ""
    ].join(""), this.#s = a.pathname.replace(/\/+$/, ""), this.#a = [
      `${this.#t}://`,
      this.#i,
      this.#s
    ].join("");
  }
  /** @inheritDoc */
  pathToInternalUrl(t) {
    return `${this.absoluteUrl}${t}`;
  }
  /** @inheritDoc */
  internalUrlToPath(t) {
    const r = new URL(t);
    return r.pathname.startsWith(this.#s) && (r.pathname = r.pathname.slice(this.#s.length)), ms(r);
  }
  get isRequestRunning() {
    return this.#o.running > 0;
  }
  /** @inheritDoc */
  get absoluteUrl() {
    return this.#a;
  }
  /** @inheritDoc */
  get documentRoot() {
    return this.#e;
  }
  /** @inheritDoc */
  async request(t) {
    const r = t.url.startsWith("http://") || t.url.startsWith("https://"), n = new URL(
      t.url,
      r ? void 0 : qa
    ), s = ys(
      n.pathname,
      this.#s
    );
    return this.#c(s) ? this.#l(s) : await this.#u(t, n);
  }
  /**
   * Serves a static file from the PHP filesystem.
   *
   * @param  path - The requested static file path.
   * @returns The response.
   */
  #l(t) {
    const r = `${this.#e}${t}`;
    if (!this.php.fileExists(r))
      return new ct(
        404,
        {},
        new TextEncoder().encode("404 File not found")
      );
    const n = this.php.readFileAsBuffer(r);
    return new ct(
      200,
      {
        "content-length": [`${n.byteLength}`],
        // @TODO: Infer the content-type from the arrayBuffer instead of the file path.
        //        The code below won't return the correct mime-type if the extension
        //        was tampered with.
        "content-type": [Wa(r)],
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
  async #u(t, r) {
    const n = await this.#o.acquire();
    try {
      this.php.addServerGlobalEntry("DOCUMENT_ROOT", this.#e), this.php.addServerGlobalEntry(
        "HTTPS",
        this.#a.startsWith("https://") ? "on" : ""
      );
      let s = "GET";
      const i = {
        host: this.#i,
        ...Ys(t.headers || {})
      }, a = [];
      if (t.files && Object.keys(t.files).length) {
        s = "POST";
        for (const u in t.files) {
          const d = t.files[u];
          a.push({
            key: u,
            name: d.name,
            type: d.type,
            data: new Uint8Array(await d.arrayBuffer())
          });
        }
        i["content-type"]?.startsWith("multipart/form-data") && (t.formData = Ha(
          t.body || ""
        ), i["content-type"] = "application/x-www-form-urlencoded", delete t.body);
      }
      let l;
      t.formData !== void 0 ? (s = "POST", i["content-type"] = i["content-type"] || "application/x-www-form-urlencoded", l = new URLSearchParams(
        t.formData
      ).toString()) : l = t.body;
      let p;
      try {
        p = this.#d(r.pathname);
      } catch {
        return new ct(
          404,
          {},
          new TextEncoder().encode("404 File not found")
        );
      }
      return await this.php.run({
        relativeUri: Va(
          ms(r),
          this.#s
        ),
        protocol: this.#t,
        method: t.method || s,
        body: l,
        fileInfos: a,
        scriptPath: p,
        headers: i
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
  #d(t) {
    let r = ys(t, this.#s);
    r.includes(".php") ? r = r.split(".php")[0] + ".php" : (r.endsWith("/") || (r += "/"), r.endsWith("index.php") || (r += "index.php"));
    const n = `${this.#e}${r}`;
    if (this.php.fileExists(n))
      return n;
    if (!this.php.fileExists(`${this.#e}/index.php`))
      throw new Error(`File not found: ${n}`);
    return `${this.#e}/index.php`;
  }
}
function Ha(e) {
  const t = {}, r = e.match(/--(.*)\r\n/);
  if (!r)
    return t;
  const n = r[1], s = e.split(`--${n}`);
  return s.shift(), s.pop(), s.forEach((i) => {
    const a = i.indexOf(`\r
\r
`), l = i.substring(0, a).trim(), p = i.substring(a + 4).trim(), u = l.match(/name="([^"]+)"/);
    if (u) {
      const d = u[1];
      t[d] = p;
    }
  }), t;
}
function Wa(e) {
  switch (e.split(".").pop()) {
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
const gs = {
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
function Ce(e = "") {
  return function(r, n, s) {
    const i = s.value;
    s.value = function(...a) {
      try {
        return i.apply(this, a);
      } catch (l) {
        const p = typeof l == "object" ? l?.errno : null;
        if (p in gs) {
          const u = gs[p], d = typeof a[0] == "string" ? a[0] : null, g = d !== null ? e.replaceAll("{path}", d) : e;
          throw new Error(`${g}: ${u}`, {
            cause: l
          });
        }
        throw l;
      }
    };
  };
}
const Ka = [];
function Ga(e) {
  return Ka[e];
}
(function() {
  return typeof process < "u" && process.release?.name === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
})();
var Ba = Object.defineProperty, xa = Object.getOwnPropertyDescriptor, je = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? xa(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && Ba(t, r, s), s;
};
const me = "string", wt = "number", ee = Symbol("__private__dont__use");
class ke {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(t, r) {
    this.#e = [], this.#t = !1, this.#n = null, this.#r = {}, this.#i = [], t !== void 0 && this.initializeRuntime(t), r && (this.requestHandler = new La(
      new za(this, r)
    ));
  }
  #e;
  #t;
  #n;
  #r;
  #i;
  /** @inheritDoc */
  async onMessage(t) {
    this.#i.push(t);
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
  pathToInternalUrl(t) {
    return this.requestHandler.requestHandler.pathToInternalUrl(t);
  }
  /** @inheritDoc */
  internalUrlToPath(t) {
    return this.requestHandler.requestHandler.internalUrlToPath(
      t
    );
  }
  initializeRuntime(t) {
    if (this[ee])
      throw new Error("PHP runtime already initialized.");
    const r = Ga(t);
    if (!r)
      throw new Error("Invalid PHP runtime id.");
    this[ee] = r, r.onMessage = (n) => {
      for (const s of this.#i)
        s(n);
    }, this.#n = ja(r);
  }
  /** @inheritDoc */
  setPhpIniPath(t) {
    if (this.#t)
      throw new Error("Cannot set PHP ini path after calling run().");
    this[ee].ccall(
      "wasm_set_phpini_path",
      null,
      ["string"],
      [t]
    );
  }
  /** @inheritDoc */
  setPhpIniEntry(t, r) {
    if (this.#t)
      throw new Error("Cannot set PHP ini entries after calling run().");
    this.#e.push([t, r]);
  }
  /** @inheritDoc */
  chdir(t) {
    this[ee].FS.chdir(t);
  }
  /** @inheritDoc */
  async request(t, r) {
    if (!this.requestHandler)
      throw new Error("No request handler available.");
    return this.requestHandler.request(t, r);
  }
  /** @inheritDoc */
  async run(t) {
    this.#t || (this.#s(), this.#t = !0), this.#f(t.scriptPath || ""), this.#o(t.relativeUri || ""), this.#l(t.method || "GET");
    const { host: r, ...n } = {
      host: "example.com:443",
      ...Ys(t.headers || {})
    };
    if (this.#c(r, t.protocol || "http"), this.#u(n), t.body && this.#d(t.body), t.fileInfos)
      for (const s of t.fileInfos)
        this.#h(s);
    return t.code && this.#m(" ?>" + t.code), this.#p(), await this.#y();
  }
  #s() {
    if (this.#e.length > 0) {
      const t = this.#e.map(([r, n]) => `${r}=${n}`).join(`
`) + `

`;
      this[ee].ccall(
        "wasm_set_phpini_entries",
        null,
        [me],
        [t]
      );
    }
    this[ee].ccall("php_wasm_init", null, [], []);
  }
  #a() {
    const t = "/tmp/headers.json";
    if (!this.fileExists(t))
      throw new Error(
        "SAPI Error: Could not find response headers file."
      );
    const r = JSON.parse(this.readFileAsText(t)), n = {};
    for (const s of r.headers) {
      if (!s.includes(": "))
        continue;
      const i = s.indexOf(": "), a = s.substring(0, i).toLowerCase(), l = s.substring(i + 2);
      a in n || (n[a] = []), n[a].push(l);
    }
    return {
      headers: n,
      httpStatusCode: r.status
    };
  }
  #o(t) {
    if (this[ee].ccall(
      "wasm_set_request_uri",
      null,
      [me],
      [t]
    ), t.includes("?")) {
      const r = t.substring(t.indexOf("?") + 1);
      this[ee].ccall(
        "wasm_set_query_string",
        null,
        [me],
        [r]
      );
    }
  }
  #c(t, r) {
    this[ee].ccall(
      "wasm_set_request_host",
      null,
      [me],
      [t]
    );
    let n;
    try {
      n = parseInt(new URL(t).port, 10);
    } catch {
    }
    (!n || isNaN(n) || n === 80) && (n = r === "https" ? 443 : 80), this[ee].ccall(
      "wasm_set_request_port",
      null,
      [wt],
      [n]
    ), (r === "https" || !r && n === 443) && this.addServerGlobalEntry("HTTPS", "on");
  }
  #l(t) {
    this[ee].ccall(
      "wasm_set_request_method",
      null,
      [me],
      [t]
    );
  }
  #u(t) {
    t.cookie && this[ee].ccall(
      "wasm_set_cookies",
      null,
      [me],
      [t.cookie]
    ), t["content-type"] && this[ee].ccall(
      "wasm_set_content_type",
      null,
      [me],
      [t["content-type"]]
    ), t["content-length"] && this[ee].ccall(
      "wasm_set_content_length",
      null,
      [wt],
      [parseInt(t["content-length"], 10)]
    );
    for (const r in t) {
      let n = "HTTP_";
      ["content-type", "content-length"].includes(r.toLowerCase()) && (n = ""), this.addServerGlobalEntry(
        `${n}${r.toUpperCase().replace(/-/g, "_")}`,
        t[r]
      );
    }
  }
  #d(t) {
    this[ee].ccall(
      "wasm_set_request_body",
      null,
      [me],
      [t]
    ), this[ee].ccall(
      "wasm_set_content_length",
      null,
      [wt],
      [new TextEncoder().encode(t).length]
    );
  }
  #f(t) {
    this[ee].ccall(
      "wasm_set_path_translated",
      null,
      [me],
      [t]
    );
  }
  addServerGlobalEntry(t, r) {
    this.#r[t] = r;
  }
  #p() {
    for (const t in this.#r)
      this[ee].ccall(
        "wasm_add_SERVER_entry",
        null,
        [me, me],
        [t, this.#r[t]]
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
  #h(t) {
    const { key: r, name: n, type: s, data: i } = t, a = `/tmp/${Math.random().toFixed(20)}`;
    this.writeFile(a, i);
    const l = 0;
    this[ee].ccall(
      "wasm_add_uploaded_file",
      null,
      [me, me, me, me, wt, wt],
      [r, n, s, a, l, i.byteLength]
    );
  }
  #m(t) {
    this[ee].ccall(
      "wasm_set_php_code",
      null,
      [me],
      [t]
    );
  }
  async #y() {
    let t, r;
    try {
      t = await new Promise((i, a) => {
        r = (p) => {
          const u = new Error("Rethrown");
          u.cause = p.error, u.betterMessage = p.message, a(u);
        }, this.#n?.addEventListener(
          "error",
          r
        );
        const l = this[ee].ccall(
          "wasm_sapi_handle_request",
          wt,
          [],
          []
        );
        return l instanceof Promise ? l.then(i, a) : i(l);
      });
    } catch (i) {
      for (const u in this)
        typeof this[u] == "function" && (this[u] = () => {
          throw new Error(
            "PHP runtime has crashed – see the earlier error for details."
          );
        });
      this.functionsMaybeMissingFromAsyncify = ka();
      const a = i, l = "betterMessage" in a ? a.betterMessage : a.message, p = new Error(l);
      throw p.cause = a, p;
    } finally {
      this.#n?.removeEventListener("error", r), this.#r = {};
    }
    const { headers: n, httpStatusCode: s } = this.#a();
    return new ct(
      s,
      n,
      this.readFileAsBuffer("/tmp/stdout"),
      this.readFileAsText("/tmp/stderr"),
      t
    );
  }
  mkdir(t) {
    this[ee].FS.mkdirTree(t);
  }
  mkdirTree(t) {
    this.mkdir(t);
  }
  readFileAsText(t) {
    return new TextDecoder().decode(this.readFileAsBuffer(t));
  }
  readFileAsBuffer(t) {
    return this[ee].FS.readFile(t);
  }
  writeFile(t, r) {
    this[ee].FS.writeFile(t, r);
  }
  unlink(t) {
    this[ee].FS.unlink(t);
  }
  mv(t, r) {
    this[ee].FS.rename(t, r);
  }
  rmdir(t, r = { recursive: !0 }) {
    r?.recursive && this.listFiles(t).forEach((n) => {
      const s = `${t}/${n}`;
      this.isDir(s) ? this.rmdir(s, r) : this.unlink(s);
    }), this[ee].FS.rmdir(t);
  }
  listFiles(t, r = { prependPath: !1 }) {
    if (!this.fileExists(t))
      return [];
    try {
      const n = this[ee].FS.readdir(t).filter(
        (s) => s !== "." && s !== ".."
      );
      if (r.prependPath) {
        const s = t.replace(/\/$/, "");
        return n.map((i) => `${s}/${i}`);
      }
      return n;
    } catch (n) {
      return console.error(n, { path: t }), [];
    }
  }
  isDir(t) {
    return this.fileExists(t) ? this[ee].FS.isDir(
      this[ee].FS.lookupPath(t).node.mode
    ) : !1;
  }
  fileExists(t) {
    try {
      return this[ee].FS.lookupPath(t), !0;
    } catch {
      return !1;
    }
  }
}
je([
  Ce('Could not create directory "{path}"')
], ke.prototype, "mkdir", 1);
je([
  Ce('Could not create directory "{path}"')
], ke.prototype, "mkdirTree", 1);
je([
  Ce('Could not read "{path}"')
], ke.prototype, "readFileAsText", 1);
je([
  Ce('Could not read "{path}"')
], ke.prototype, "readFileAsBuffer", 1);
je([
  Ce('Could not write to "{path}"')
], ke.prototype, "writeFile", 1);
je([
  Ce('Could not unlink "{path}"')
], ke.prototype, "unlink", 1);
je([
  Ce('Could not move "{path}"')
], ke.prototype, "mv", 1);
je([
  Ce('Could not remove directory "{path}"')
], ke.prototype, "rmdir", 1);
je([
  Ce('Could not list files in "{path}"')
], ke.prototype, "listFiles", 1);
je([
  Ce('Could not stat "{path}"')
], ke.prototype, "isDir", 1);
je([
  Ce('Could not stat "{path}"')
], ke.prototype, "fileExists", 1);
function Ys(e) {
  const t = {};
  for (const r in e)
    t[r.toLowerCase()] = e[r];
  return t;
}
const Ja = [
  "vfs",
  "literal",
  "wordpress.org/themes",
  "wordpress.org/plugins",
  "url"
];
function Ya(e) {
  return e && typeof e == "object" && typeof e.resource == "string" && Ja.includes(e.resource);
}
class dt {
  /**
   * Creates a new Resource based on the given file reference
   *
   * @param ref The file reference to create the Resource for
   * @param options Additional options for the Resource
   * @returns A new Resource instance
   */
  static create(t, { semaphore: r, progress: n }) {
    let s;
    switch (t.resource) {
      case "vfs":
        s = new Za(t, n);
        break;
      case "literal":
        s = new Qa(t, n);
        break;
      case "wordpress.org/themes":
        s = new to(t, n);
        break;
      case "wordpress.org/plugins":
        s = new ro(t, n);
        break;
      case "url":
        s = new eo(t, n);
        break;
      default:
        throw new Error(`Invalid resource: ${t}`);
    }
    return s = new no(s), r && (s = new so(s, r)), s;
  }
  setPlayground(t) {
    this.playground = t;
  }
  /** Whether this Resource is loaded asynchronously */
  get isAsync() {
    return !1;
  }
}
class Za extends dt {
  /**
   * Creates a new instance of `VFSResource`.
   * @param playground The playground client.
   * @param resource The VFS reference.
   * @param progress The progress tracker.
   */
  constructor(t, r) {
    super(), this.resource = t, this.progress = r;
  }
  /** @inheritDoc */
  async resolve() {
    const t = await this.playground.readFileAsBuffer(
      this.resource.path
    );
    return this.progress?.set(100), new Qr([t], this.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.path.split("/").pop() || "";
  }
}
class Qa extends dt {
  /**
   * Creates a new instance of `LiteralResource`.
   * @param resource The literal reference.
   * @param progress The progress tracker.
   */
  constructor(t, r) {
    super(), this.resource = t, this.progress = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.progress?.set(100), new Qr([this.resource.contents], this.resource.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
}
class sn extends dt {
  /**
   * Creates a new instance of `FetchResource`.
   * @param progress The progress tracker.
   */
  constructor(t) {
    super(), this.progress = t;
  }
  /** @inheritDoc */
  async resolve() {
    this.progress?.setCaption(this.caption);
    const t = this.getURL();
    let r = await fetch(t);
    if (r = await Na(
      r,
      this.progress?.loadingListener ?? Xa
    ), r.status !== 200)
      throw new Error(`Could not download "${t}"`);
    return new Qr([await r.blob()], this.name);
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
const Xa = () => {
};
class eo extends sn {
  /**
   * Creates a new instance of `UrlResource`.
   * @param resource The URL reference.
   * @param progress The progress tracker.
   */
  constructor(t, r) {
    super(r), this.resource = t;
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
let an = "https://playground.wordpress.net/plugin-proxy";
function Od(e) {
  an = e;
}
class to extends sn {
  constructor(t, r) {
    super(r), this.resource = t;
  }
  get name() {
    return Or(this.resource.slug);
  }
  getURL() {
    const t = Zs(this.resource.slug);
    return `${an}?theme=` + t;
  }
}
class ro extends sn {
  constructor(t, r) {
    super(r), this.resource = t;
  }
  /** @inheritDoc */
  get name() {
    return Or(this.resource.slug);
  }
  /** @inheritDoc */
  getURL() {
    const t = Zs(this.resource.slug);
    return `${an}?plugin=` + t;
  }
}
function Zs(e) {
  return !e || e.endsWith(".zip") ? e : e + ".latest-stable.zip";
}
class Qs extends dt {
  constructor(t) {
    super(), this.resource = t;
  }
  /** @inheritDoc */
  async resolve() {
    return this.resource.resolve();
  }
  /** @inheritDoc */
  async setPlayground(t) {
    return this.resource.setPlayground(t);
  }
  /** @inheritDoc */
  get progress() {
    return this.resource.progress;
  }
  /** @inheritDoc */
  set progress(t) {
    this.resource.progress = t;
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
class no extends Qs {
  /** @inheritDoc */
  async resolve() {
    return this.promise || (this.promise = super.resolve()), this.promise;
  }
}
class so extends Qs {
  constructor(t, r) {
    super(t), this.semaphore = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.isAsync ? this.semaphore.run(() => super.resolve()) : super.resolve();
  }
}
var io = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ao(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Wr = { exports: {} }, Xs = {}, Oe = {}, Nt = {}, Xt = {}, G = {}, Qt = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(T) {
      if (super(), !e.IDENTIFIER.test(T))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = T;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(T) {
      super(), this._items = typeof T == "string" ? [T] : T;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const T = this._items[0];
      return T === "" || T === '""';
    }
    get str() {
      var T;
      return (T = this._str) !== null && T !== void 0 ? T : this._str = this._items.reduce((R, k) => `${R}${k}`, "");
    }
    get names() {
      var T;
      return (T = this._names) !== null && T !== void 0 ? T : this._names = this._items.reduce((R, k) => (k instanceof r && (R[k.str] = (R[k.str] || 0) + 1), R), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(y, ...T) {
    const R = [y[0]];
    let k = 0;
    for (; k < T.length; )
      l(R, T[k]), R.push(y[++k]);
    return new n(R);
  }
  e._ = s;
  const i = new n("+");
  function a(y, ...T) {
    const R = [j(y[0])];
    let k = 0;
    for (; k < T.length; )
      R.push(i), l(R, T[k]), R.push(i, j(y[++k]));
    return p(R), new n(R);
  }
  e.str = a;
  function l(y, T) {
    T instanceof n ? y.push(...T._items) : T instanceof r ? y.push(T) : y.push(g(T));
  }
  e.addCodeArg = l;
  function p(y) {
    let T = 1;
    for (; T < y.length - 1; ) {
      if (y[T] === i) {
        const R = u(y[T - 1], y[T + 1]);
        if (R !== void 0) {
          y.splice(T - 1, 3, R);
          continue;
        }
        y[T++] = "+";
      }
      T++;
    }
  }
  function u(y, T) {
    if (T === '""')
      return y;
    if (y === '""')
      return T;
    if (typeof y == "string")
      return T instanceof r || y[y.length - 1] !== '"' ? void 0 : typeof T != "string" ? `${y.slice(0, -1)}${T}"` : T[0] === '"' ? y.slice(0, -1) + T.slice(1) : void 0;
    if (typeof T == "string" && T[0] === '"' && !(y instanceof r))
      return `"${y}${T.slice(1)}`;
  }
  function d(y, T) {
    return T.emptyStr() ? y : y.emptyStr() ? T : a`${y}${T}`;
  }
  e.strConcat = d;
  function g(y) {
    return typeof y == "number" || typeof y == "boolean" || y === null ? y : j(Array.isArray(y) ? y.join(",") : y);
  }
  function C(y) {
    return new n(j(y));
  }
  e.stringify = C;
  function j(y) {
    return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = j;
  function E(y) {
    return typeof y == "string" && e.IDENTIFIER.test(y) ? new n(`.${y}`) : s`[${y}]`;
  }
  e.getProperty = E;
  function S(y) {
    if (typeof y == "string" && e.IDENTIFIER.test(y))
      return new n(`${y}`);
    throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
  }
  e.getEsmExportName = S;
  function v(y) {
    return new n(y.toString());
  }
  e.regexpCode = v;
})(Qt);
var Kr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Qt;
  class r extends Error {
    constructor(u) {
      super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
    }
  }
  var n;
  (function(p) {
    p[p.Started = 0] = "Started", p[p.Completed = 1] = "Completed";
  })(n = e.UsedValueState || (e.UsedValueState = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: u, parent: d } = {}) {
      this._names = {}, this._prefixes = u, this._parent = d;
    }
    toName(u) {
      return u instanceof t.Name ? u : this.name(u);
    }
    name(u) {
      return new t.Name(this._newName(u));
    }
    _newName(u) {
      const d = this._names[u] || this._nameGroup(u);
      return `${u}${d.index++}`;
    }
    _nameGroup(u) {
      var d, g;
      if (!((g = (d = this._parent) === null || d === void 0 ? void 0 : d._prefixes) === null || g === void 0) && g.has(u) || this._prefixes && !this._prefixes.has(u))
        throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
      return this._names[u] = { prefix: u, index: 0 };
    }
  }
  e.Scope = s;
  class i extends t.Name {
    constructor(u, d) {
      super(d), this.prefix = u;
    }
    setValue(u, { property: d, itemIndex: g }) {
      this.value = u, this.scopePath = (0, t._)`.${new t.Name(d)}[${g}]`;
    }
  }
  e.ValueScopeName = i;
  const a = (0, t._)`\n`;
  class l extends s {
    constructor(u) {
      super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? a : t.nil };
    }
    get() {
      return this._scope;
    }
    name(u) {
      return new i(u, this._newName(u));
    }
    value(u, d) {
      var g;
      if (d.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const C = this.toName(u), { prefix: j } = C, E = (g = d.key) !== null && g !== void 0 ? g : d.ref;
      let S = this._values[j];
      if (S) {
        const T = S.get(E);
        if (T)
          return T;
      } else
        S = this._values[j] = /* @__PURE__ */ new Map();
      S.set(E, C);
      const v = this._scope[j] || (this._scope[j] = []), y = v.length;
      return v[y] = d.ref, C.setValue(d, { property: j, itemIndex: y }), C;
    }
    getValue(u, d) {
      const g = this._values[u];
      if (g)
        return g.get(d);
    }
    scopeRefs(u, d = this._values) {
      return this._reduceValues(d, (g) => {
        if (g.scopePath === void 0)
          throw new Error(`CodeGen: name "${g}" has no value`);
        return (0, t._)`${u}${g.scopePath}`;
      });
    }
    scopeCode(u = this._values, d, g) {
      return this._reduceValues(u, (C) => {
        if (C.value === void 0)
          throw new Error(`CodeGen: name "${C}" has no value`);
        return C.value.code;
      }, d, g);
    }
    _reduceValues(u, d, g = {}, C) {
      let j = t.nil;
      for (const E in u) {
        const S = u[E];
        if (!S)
          continue;
        const v = g[E] = g[E] || /* @__PURE__ */ new Map();
        S.forEach((y) => {
          if (v.has(y))
            return;
          v.set(y, n.Started);
          let T = d(y);
          if (T) {
            const R = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            j = (0, t._)`${j}${R} ${y} = ${T};${this.opts._n}`;
          } else if (T = C?.(y))
            j = (0, t._)`${j}${T}${this.opts._n}`;
          else
            throw new r(y);
          v.set(y, n.Completed);
        });
      }
      return j;
    }
  }
  e.ValueScope = l;
})(Kr);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Qt, r = Kr;
  var n = Qt;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Kr;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class i {
    optimizeNodes() {
      return this;
    }
    optimizeNames(o, h) {
      return this;
    }
  }
  class a extends i {
    constructor(o, h, O) {
      super(), this.varKind = o, this.name = h, this.rhs = O;
    }
    render({ es5: o, _n: h }) {
      const O = o ? r.varKinds.var : this.varKind, M = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${O} ${this.name}${M};` + h;
    }
    optimizeNames(o, h) {
      if (o[this.name.str])
        return this.rhs && (this.rhs = de(this.rhs, o, h)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends i {
    constructor(o, h, O) {
      super(), this.lhs = o, this.rhs = h, this.sideEffects = O;
    }
    render({ _n: o }) {
      return `${this.lhs} = ${this.rhs};` + o;
    }
    optimizeNames(o, h) {
      if (!(this.lhs instanceof t.Name && !o[this.lhs.str] && !this.sideEffects))
        return this.rhs = de(this.rhs, o, h), this;
    }
    get names() {
      const o = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return be(o, this.rhs);
    }
  }
  class p extends l {
    constructor(o, h, O, M) {
      super(o, O, M), this.op = h;
    }
    render({ _n: o }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + o;
    }
  }
  class u extends i {
    constructor(o) {
      super(), this.label = o, this.names = {};
    }
    render({ _n: o }) {
      return `${this.label}:` + o;
    }
  }
  class d extends i {
    constructor(o) {
      super(), this.label = o, this.names = {};
    }
    render({ _n: o }) {
      return `break${this.label ? ` ${this.label}` : ""};` + o;
    }
  }
  class g extends i {
    constructor(o) {
      super(), this.error = o;
    }
    render({ _n: o }) {
      return `throw ${this.error};` + o;
    }
    get names() {
      return this.error.names;
    }
  }
  class C extends i {
    constructor(o) {
      super(), this.code = o;
    }
    render({ _n: o }) {
      return `${this.code};` + o;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(o, h) {
      return this.code = de(this.code, o, h), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class j extends i {
    constructor(o = []) {
      super(), this.nodes = o;
    }
    render(o) {
      return this.nodes.reduce((h, O) => h + O.render(o), "");
    }
    optimizeNodes() {
      const { nodes: o } = this;
      let h = o.length;
      for (; h--; ) {
        const O = o[h].optimizeNodes();
        Array.isArray(O) ? o.splice(h, 1, ...O) : O ? o[h] = O : o.splice(h, 1);
      }
      return o.length > 0 ? this : void 0;
    }
    optimizeNames(o, h) {
      const { nodes: O } = this;
      let M = O.length;
      for (; M--; ) {
        const U = O[M];
        U.optimizeNames(o, h) || (Ze(o, U.names), O.splice(M, 1));
      }
      return O.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((o, h) => Z(o, h.names), {});
    }
  }
  class E extends j {
    render(o) {
      return "{" + o._n + super.render(o) + "}" + o._n;
    }
  }
  class S extends j {
  }
  class v extends E {
  }
  v.kind = "else";
  class y extends E {
    constructor(o, h) {
      super(h), this.condition = o;
    }
    render(o) {
      let h = `if(${this.condition})` + super.render(o);
      return this.else && (h += "else " + this.else.render(o)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const o = this.condition;
      if (o === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const O = h.optimizeNodes();
        h = this.else = Array.isArray(O) ? new v(O) : O;
      }
      if (h)
        return o === !1 ? h instanceof y ? h : h.nodes : this.nodes.length ? this : new y(Qe(o), h instanceof y ? [h] : h.nodes);
      if (!(o === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(o, h) {
      var O;
      if (this.else = (O = this.else) === null || O === void 0 ? void 0 : O.optimizeNames(o, h), !!(super.optimizeNames(o, h) || this.else))
        return this.condition = de(this.condition, o, h), this;
    }
    get names() {
      const o = super.names;
      return be(o, this.condition), this.else && Z(o, this.else.names), o;
    }
  }
  y.kind = "if";
  class T extends E {
  }
  T.kind = "for";
  class R extends T {
    constructor(o) {
      super(), this.iteration = o;
    }
    render(o) {
      return `for(${this.iteration})` + super.render(o);
    }
    optimizeNames(o, h) {
      if (super.optimizeNames(o, h))
        return this.iteration = de(this.iteration, o, h), this;
    }
    get names() {
      return Z(super.names, this.iteration.names);
    }
  }
  class k extends T {
    constructor(o, h, O, M) {
      super(), this.varKind = o, this.name = h, this.from = O, this.to = M;
    }
    render(o) {
      const h = o.es5 ? r.varKinds.var : this.varKind, { name: O, from: M, to: U } = this;
      return `for(${h} ${O}=${M}; ${O}<${U}; ${O}++)` + super.render(o);
    }
    get names() {
      const o = be(super.names, this.from);
      return be(o, this.to);
    }
  }
  class D extends T {
    constructor(o, h, O, M) {
      super(), this.loop = o, this.varKind = h, this.name = O, this.iterable = M;
    }
    render(o) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(o);
    }
    optimizeNames(o, h) {
      if (super.optimizeNames(o, h))
        return this.iterable = de(this.iterable, o, h), this;
    }
    get names() {
      return Z(super.names, this.iterable.names);
    }
  }
  class _ extends E {
    constructor(o, h, O) {
      super(), this.name = o, this.args = h, this.async = O;
    }
    render(o) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(o);
    }
  }
  _.kind = "func";
  class N extends j {
    render(o) {
      return "return " + super.render(o);
    }
  }
  N.kind = "return";
  class A extends E {
    render(o) {
      let h = "try" + super.render(o);
      return this.catch && (h += this.catch.render(o)), this.finally && (h += this.finally.render(o)), h;
    }
    optimizeNodes() {
      var o, h;
      return super.optimizeNodes(), (o = this.catch) === null || o === void 0 || o.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(o, h) {
      var O, M;
      return super.optimizeNames(o, h), (O = this.catch) === null || O === void 0 || O.optimizeNames(o, h), (M = this.finally) === null || M === void 0 || M.optimizeNames(o, h), this;
    }
    get names() {
      const o = super.names;
      return this.catch && Z(o, this.catch.names), this.finally && Z(o, this.finally.names), o;
    }
  }
  class H extends E {
    constructor(o) {
      super(), this.error = o;
    }
    render(o) {
      return `catch(${this.error})` + super.render(o);
    }
  }
  H.kind = "catch";
  class B extends E {
    render(o) {
      return "finally" + super.render(o);
    }
  }
  B.kind = "finally";
  class ae {
    constructor(o, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = o, this._scope = new r.Scope({ parent: o }), this._nodes = [new S()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(o) {
      return this._scope.name(o);
    }
    // reserves unique name in the external scope
    scopeName(o) {
      return this._extScope.name(o);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(o, h) {
      const O = this._extScope.value(o, h);
      return (this._values[O.prefix] || (this._values[O.prefix] = /* @__PURE__ */ new Set())).add(O), O;
    }
    getScopeValue(o, h) {
      return this._extScope.getValue(o, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(o) {
      return this._extScope.scopeRefs(o, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(o, h, O, M) {
      const U = this._scope.toName(h);
      return O !== void 0 && M && (this._constants[U.str] = O), this._leafNode(new a(o, U, O)), U;
    }
    // `const` declaration (`var` in es5 mode)
    const(o, h, O) {
      return this._def(r.varKinds.const, o, h, O);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(o, h, O) {
      return this._def(r.varKinds.let, o, h, O);
    }
    // `var` declaration with optional assignment
    var(o, h, O) {
      return this._def(r.varKinds.var, o, h, O);
    }
    // assignment code
    assign(o, h, O) {
      return this._leafNode(new l(o, h, O));
    }
    // `+=` code
    add(o, h) {
      return this._leafNode(new p(o, e.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(o) {
      return typeof o == "function" ? o() : o !== t.nil && this._leafNode(new C(o)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...o) {
      const h = ["{"];
      for (const [O, M] of o)
        h.length > 1 && h.push(","), h.push(O), (O !== M || this.opts.es5) && (h.push(":"), (0, t.addCodeArg)(h, M));
      return h.push("}"), new t._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(o, h, O) {
      if (this._blockNode(new y(o)), h && O)
        this.code(h).else().code(O).endIf();
      else if (h)
        this.code(h).endIf();
      else if (O)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(o) {
      return this._elseNode(new y(o));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new v());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(y, v);
    }
    _for(o, h) {
      return this._blockNode(o), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(o, h) {
      return this._for(new R(o), h);
    }
    // `for` statement for a range of values
    forRange(o, h, O, M, U = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const x = this._scope.toName(o);
      return this._for(new k(U, x, h, O), () => M(x));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(o, h, O, M = r.varKinds.const) {
      const U = this._scope.toName(o);
      if (this.opts.es5) {
        const x = h instanceof t.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, t._)`${x}.length`, (Y) => {
          this.var(U, (0, t._)`${x}[${Y}]`), O(U);
        });
      }
      return this._for(new D("of", M, U, h), () => O(U));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(o, h, O, M = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(o, (0, t._)`Object.keys(${h})`, O);
      const U = this._scope.toName(o);
      return this._for(new D("in", M, U, h), () => O(U));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(T);
    }
    // `label` statement
    label(o) {
      return this._leafNode(new u(o));
    }
    // `break` statement
    break(o) {
      return this._leafNode(new d(o));
    }
    // `return` statement
    return(o) {
      const h = new N();
      if (this._blockNode(h), this.code(o), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(N);
    }
    // `try` statement
    try(o, h, O) {
      if (!h && !O)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const M = new A();
      if (this._blockNode(M), this.code(o), h) {
        const U = this.name("e");
        this._currNode = M.catch = new H(U), h(U);
      }
      return O && (this._currNode = M.finally = new B(), this.code(O)), this._endBlockNode(H, B);
    }
    // `throw` statement
    throw(o) {
      return this._leafNode(new g(o));
    }
    // start self-balancing block
    block(o, h) {
      return this._blockStarts.push(this._nodes.length), o && this.code(o).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(o) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const O = this._nodes.length - h;
      if (O < 0 || o !== void 0 && O !== o)
        throw new Error(`CodeGen: wrong number of nodes: ${O} vs ${o} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(o, h = t.nil, O, M) {
      return this._blockNode(new _(o, h, O)), M && this.code(M).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(_);
    }
    optimize(o = 1) {
      for (; o-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(o) {
      return this._currNode.nodes.push(o), this;
    }
    _blockNode(o) {
      this._currNode.nodes.push(o), this._nodes.push(o);
    }
    _endBlockNode(o, h) {
      const O = this._currNode;
      if (O instanceof o || h && O instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${o.kind}/${h.kind}` : o.kind}"`);
    }
    _elseNode(o) {
      const h = this._currNode;
      if (!(h instanceof y))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = o, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const o = this._nodes;
      return o[o.length - 1];
    }
    set _currNode(o) {
      const h = this._nodes;
      h[h.length - 1] = o;
    }
  }
  e.CodeGen = ae;
  function Z(w, o) {
    for (const h in o)
      w[h] = (w[h] || 0) + (o[h] || 0);
    return w;
  }
  function be(w, o) {
    return o instanceof t._CodeOrName ? Z(w, o.names) : w;
  }
  function de(w, o, h) {
    if (w instanceof t.Name)
      return O(w);
    if (!M(w))
      return w;
    return new t._Code(w._items.reduce((U, x) => (x instanceof t.Name && (x = O(x)), x instanceof t._Code ? U.push(...x._items) : U.push(x), U), []));
    function O(U) {
      const x = h[U.str];
      return x === void 0 || o[U.str] !== 1 ? U : (delete o[U.str], x);
    }
    function M(U) {
      return U instanceof t._Code && U._items.some((x) => x instanceof t.Name && o[x.str] === 1 && h[x.str] !== void 0);
    }
  }
  function Ze(w, o) {
    for (const h in o)
      w[h] = (w[h] || 0) - (o[h] || 0);
  }
  function Qe(w) {
    return typeof w == "boolean" || typeof w == "number" || w === null ? !w : (0, t._)`!${I(w)}`;
  }
  e.not = Qe;
  const ft = $(e.operators.AND);
  function kt(...w) {
    return w.reduce(ft);
  }
  e.and = kt;
  const pt = $(e.operators.OR);
  function F(...w) {
    return w.reduce(pt);
  }
  e.or = F;
  function $(w) {
    return (o, h) => o === t.nil ? h : h === t.nil ? o : (0, t._)`${I(o)} ${w} ${I(h)}`;
  }
  function I(w) {
    return w instanceof t.Name ? w : (0, t._)`(${w})`;
  }
})(G);
var X = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.checkStrictMode = e.getErrorPath = e.Type = e.useFunc = e.setEvaluated = e.evaluatedPropsToName = e.mergeEvaluated = e.eachItem = e.unescapeJsonPointer = e.escapeJsonPointer = e.escapeFragment = e.unescapeFragment = e.schemaRefOrVal = e.schemaHasRulesButRef = e.schemaHasRules = e.checkUnknownRules = e.alwaysValidSchema = e.toHash = void 0;
  const t = G, r = Qt;
  function n(_) {
    const N = {};
    for (const A of _)
      N[A] = !0;
    return N;
  }
  e.toHash = n;
  function s(_, N) {
    return typeof N == "boolean" ? N : Object.keys(N).length === 0 ? !0 : (i(_, N), !a(N, _.self.RULES.all));
  }
  e.alwaysValidSchema = s;
  function i(_, N = _.schema) {
    const { opts: A, self: H } = _;
    if (!A.strictSchema || typeof N == "boolean")
      return;
    const B = H.RULES.keywords;
    for (const ae in N)
      B[ae] || D(_, `unknown keyword: "${ae}"`);
  }
  e.checkUnknownRules = i;
  function a(_, N) {
    if (typeof _ == "boolean")
      return !_;
    for (const A in _)
      if (N[A])
        return !0;
    return !1;
  }
  e.schemaHasRules = a;
  function l(_, N) {
    if (typeof _ == "boolean")
      return !_;
    for (const A in _)
      if (A !== "$ref" && N.all[A])
        return !0;
    return !1;
  }
  e.schemaHasRulesButRef = l;
  function p({ topSchemaRef: _, schemaPath: N }, A, H, B) {
    if (!B) {
      if (typeof A == "number" || typeof A == "boolean")
        return A;
      if (typeof A == "string")
        return (0, t._)`${A}`;
    }
    return (0, t._)`${_}${N}${(0, t.getProperty)(H)}`;
  }
  e.schemaRefOrVal = p;
  function u(_) {
    return C(decodeURIComponent(_));
  }
  e.unescapeFragment = u;
  function d(_) {
    return encodeURIComponent(g(_));
  }
  e.escapeFragment = d;
  function g(_) {
    return typeof _ == "number" ? `${_}` : _.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  e.escapeJsonPointer = g;
  function C(_) {
    return _.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  e.unescapeJsonPointer = C;
  function j(_, N) {
    if (Array.isArray(_))
      for (const A of _)
        N(A);
    else
      N(_);
  }
  e.eachItem = j;
  function E({ mergeNames: _, mergeToName: N, mergeValues: A, resultToName: H }) {
    return (B, ae, Z, be) => {
      const de = Z === void 0 ? ae : Z instanceof t.Name ? (ae instanceof t.Name ? _(B, ae, Z) : N(B, ae, Z), Z) : ae instanceof t.Name ? (N(B, Z, ae), ae) : A(ae, Z);
      return be === t.Name && !(de instanceof t.Name) ? H(B, de) : de;
    };
  }
  e.mergeEvaluated = {
    props: E({
      mergeNames: (_, N, A) => _.if((0, t._)`${A} !== true && ${N} !== undefined`, () => {
        _.if((0, t._)`${N} === true`, () => _.assign(A, !0), () => _.assign(A, (0, t._)`${A} || {}`).code((0, t._)`Object.assign(${A}, ${N})`));
      }),
      mergeToName: (_, N, A) => _.if((0, t._)`${A} !== true`, () => {
        N === !0 ? _.assign(A, !0) : (_.assign(A, (0, t._)`${A} || {}`), v(_, A, N));
      }),
      mergeValues: (_, N) => _ === !0 ? !0 : { ..._, ...N },
      resultToName: S
    }),
    items: E({
      mergeNames: (_, N, A) => _.if((0, t._)`${A} !== true && ${N} !== undefined`, () => _.assign(A, (0, t._)`${N} === true ? true : ${A} > ${N} ? ${A} : ${N}`)),
      mergeToName: (_, N, A) => _.if((0, t._)`${A} !== true`, () => _.assign(A, N === !0 ? !0 : (0, t._)`${A} > ${N} ? ${A} : ${N}`)),
      mergeValues: (_, N) => _ === !0 ? !0 : Math.max(_, N),
      resultToName: (_, N) => _.var("items", N)
    })
  };
  function S(_, N) {
    if (N === !0)
      return _.var("props", !0);
    const A = _.var("props", (0, t._)`{}`);
    return N !== void 0 && v(_, A, N), A;
  }
  e.evaluatedPropsToName = S;
  function v(_, N, A) {
    Object.keys(A).forEach((H) => _.assign((0, t._)`${N}${(0, t.getProperty)(H)}`, !0));
  }
  e.setEvaluated = v;
  const y = {};
  function T(_, N) {
    return _.scopeValue("func", {
      ref: N,
      code: y[N.code] || (y[N.code] = new r._Code(N.code))
    });
  }
  e.useFunc = T;
  var R;
  (function(_) {
    _[_.Num = 0] = "Num", _[_.Str = 1] = "Str";
  })(R = e.Type || (e.Type = {}));
  function k(_, N, A) {
    if (_ instanceof t.Name) {
      const H = N === R.Num;
      return A ? H ? (0, t._)`"[" + ${_} + "]"` : (0, t._)`"['" + ${_} + "']"` : H ? (0, t._)`"/" + ${_}` : (0, t._)`"/" + ${_}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return A ? (0, t.getProperty)(_).toString() : "/" + g(_);
  }
  e.getErrorPath = k;
  function D(_, N, A = _.opts.strictSchema) {
    if (A) {
      if (N = `strict mode: ${N}`, A === !0)
        throw new Error(N);
      _.self.logger.warn(N);
    }
  }
  e.checkStrictMode = D;
})(X);
var Ve = {};
Object.defineProperty(Ve, "__esModule", { value: !0 });
const ye = G, oo = {
  // validation function arguments
  data: new ye.Name("data"),
  // args passed from referencing schema
  valCxt: new ye.Name("valCxt"),
  instancePath: new ye.Name("instancePath"),
  parentData: new ye.Name("parentData"),
  parentDataProperty: new ye.Name("parentDataProperty"),
  rootData: new ye.Name("rootData"),
  dynamicAnchors: new ye.Name("dynamicAnchors"),
  // function scoped variables
  vErrors: new ye.Name("vErrors"),
  errors: new ye.Name("errors"),
  this: new ye.Name("this"),
  // "globals"
  self: new ye.Name("self"),
  scope: new ye.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new ye.Name("json"),
  jsonPos: new ye.Name("jsonPos"),
  jsonLen: new ye.Name("jsonLen"),
  jsonPart: new ye.Name("jsonPart")
};
Ve.default = oo;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = G, r = X, n = Ve;
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: y }) => y ? (0, t.str)`"${v}" keyword must be ${y} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function s(v, y = e.keywordError, T, R) {
    const { it: k } = v, { gen: D, compositeRule: _, allErrors: N } = k, A = g(v, y, T);
    R ?? (_ || N) ? p(D, A) : u(k, (0, t._)`[${A}]`);
  }
  e.reportError = s;
  function i(v, y = e.keywordError, T) {
    const { it: R } = v, { gen: k, compositeRule: D, allErrors: _ } = R, N = g(v, y, T);
    p(k, N), D || _ || u(R, n.default.vErrors);
  }
  e.reportExtraError = i;
  function a(v, y) {
    v.assign(n.default.errors, y), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(y, () => v.assign((0, t._)`${n.default.vErrors}.length`, y), () => v.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = a;
  function l({ gen: v, keyword: y, schemaValue: T, data: R, errsCount: k, it: D }) {
    if (k === void 0)
      throw new Error("ajv implementation error");
    const _ = v.name("err");
    v.forRange("i", k, n.default.errors, (N) => {
      v.const(_, (0, t._)`${n.default.vErrors}[${N}]`), v.if((0, t._)`${_}.instancePath === undefined`, () => v.assign((0, t._)`${_}.instancePath`, (0, t.strConcat)(n.default.instancePath, D.errorPath))), v.assign((0, t._)`${_}.schemaPath`, (0, t.str)`${D.errSchemaPath}/${y}`), D.opts.verbose && (v.assign((0, t._)`${_}.schema`, T), v.assign((0, t._)`${_}.data`, R));
    });
  }
  e.extendErrors = l;
  function p(v, y) {
    const T = v.const("err", y);
    v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${T}]`), (0, t._)`${n.default.vErrors}.push(${T})`), v.code((0, t._)`${n.default.errors}++`);
  }
  function u(v, y) {
    const { gen: T, validateName: R, schemaEnv: k } = v;
    k.$async ? T.throw((0, t._)`new ${v.ValidationError}(${y})`) : (T.assign((0, t._)`${R}.errors`, y), T.return(!1));
  }
  const d = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function g(v, y, T) {
    const { createErrors: R } = v.it;
    return R === !1 ? (0, t._)`{}` : C(v, y, T);
  }
  function C(v, y, T = {}) {
    const { gen: R, it: k } = v, D = [
      j(k, T),
      E(v, T)
    ];
    return S(v, y, D), R.object(...D);
  }
  function j({ errorPath: v }, { instancePath: y }) {
    const T = y ? (0, t.str)`${v}${(0, r.getErrorPath)(y, r.Type.Str)}` : v;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, T)];
  }
  function E({ keyword: v, it: { errSchemaPath: y } }, { schemaPath: T, parentSchema: R }) {
    let k = R ? y : (0, t.str)`${y}/${v}`;
    return T && (k = (0, t.str)`${k}${(0, r.getErrorPath)(T, r.Type.Str)}`), [d.schemaPath, k];
  }
  function S(v, { params: y, message: T }, R) {
    const { keyword: k, data: D, schemaValue: _, it: N } = v, { opts: A, propertyName: H, topSchemaRef: B, schemaPath: ae } = N;
    R.push([d.keyword, k], [d.params, typeof y == "function" ? y(v) : y || (0, t._)`{}`]), A.messages && R.push([d.message, typeof T == "function" ? T(v) : T]), A.verbose && R.push([d.schema, _], [d.parentSchema, (0, t._)`${B}${ae}`], [n.default.data, D]), H && R.push([d.propertyName, H]);
  }
})(Xt);
Object.defineProperty(Nt, "__esModule", { value: !0 });
Nt.boolOrEmptySchema = Nt.topBoolOrEmptySchema = void 0;
const co = Xt, lo = G, uo = Ve, fo = {
  message: "boolean schema is false"
};
function po(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? ei(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(uo.default.data) : (t.assign((0, lo._)`${n}.errors`, null), t.return(!0));
}
Nt.topBoolOrEmptySchema = po;
function ho(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), ei(e)) : r.var(t, !0);
}
Nt.boolOrEmptySchema = ho;
function ei(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, co.reportError)(s, fo, void 0, t);
}
var er = {}, lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 });
lt.getRules = lt.isJSONType = void 0;
const mo = ["string", "number", "integer", "boolean", "null", "object", "array"], yo = new Set(mo);
function go(e) {
  return typeof e == "string" && yo.has(e);
}
lt.isJSONType = go;
function $o() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
lt.getRules = $o;
var He = {};
Object.defineProperty(He, "__esModule", { value: !0 });
He.shouldUseRule = He.shouldUseGroup = He.schemaHasRulesForType = void 0;
function vo({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && ti(e, n);
}
He.schemaHasRulesForType = vo;
function ti(e, t) {
  return t.rules.some((r) => ri(e, r));
}
He.shouldUseGroup = ti;
function ri(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
He.shouldUseRule = ri;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.reportTypeError = e.checkDataTypes = e.checkDataType = e.coerceAndCheckDataType = e.getJSONTypes = e.getSchemaTypes = e.DataType = void 0;
  const t = lt, r = He, n = Xt, s = G, i = X;
  var a;
  (function(R) {
    R[R.Correct = 0] = "Correct", R[R.Wrong = 1] = "Wrong";
  })(a = e.DataType || (e.DataType = {}));
  function l(R) {
    const k = p(R.type);
    if (k.includes("null")) {
      if (R.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!k.length && R.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      R.nullable === !0 && k.push("null");
    }
    return k;
  }
  e.getSchemaTypes = l;
  function p(R) {
    const k = Array.isArray(R) ? R : R ? [R] : [];
    if (k.every(t.isJSONType))
      return k;
    throw new Error("type must be JSONType or JSONType[]: " + k.join(","));
  }
  e.getJSONTypes = p;
  function u(R, k) {
    const { gen: D, data: _, opts: N } = R, A = g(k, N.coerceTypes), H = k.length > 0 && !(A.length === 0 && k.length === 1 && (0, r.schemaHasRulesForType)(R, k[0]));
    if (H) {
      const B = S(k, _, N.strictNumbers, a.Wrong);
      D.if(B, () => {
        A.length ? C(R, k, A) : y(R);
      });
    }
    return H;
  }
  e.coerceAndCheckDataType = u;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function g(R, k) {
    return k ? R.filter((D) => d.has(D) || k === "array" && D === "array") : [];
  }
  function C(R, k, D) {
    const { gen: _, data: N, opts: A } = R, H = _.let("dataType", (0, s._)`typeof ${N}`), B = _.let("coerced", (0, s._)`undefined`);
    A.coerceTypes === "array" && _.if((0, s._)`${H} == 'object' && Array.isArray(${N}) && ${N}.length == 1`, () => _.assign(N, (0, s._)`${N}[0]`).assign(H, (0, s._)`typeof ${N}`).if(S(k, N, A.strictNumbers), () => _.assign(B, N))), _.if((0, s._)`${B} !== undefined`);
    for (const Z of D)
      (d.has(Z) || Z === "array" && A.coerceTypes === "array") && ae(Z);
    _.else(), y(R), _.endIf(), _.if((0, s._)`${B} !== undefined`, () => {
      _.assign(N, B), j(R, B);
    });
    function ae(Z) {
      switch (Z) {
        case "string":
          _.elseIf((0, s._)`${H} == "number" || ${H} == "boolean"`).assign(B, (0, s._)`"" + ${N}`).elseIf((0, s._)`${N} === null`).assign(B, (0, s._)`""`);
          return;
        case "number":
          _.elseIf((0, s._)`${H} == "boolean" || ${N} === null
              || (${H} == "string" && ${N} && ${N} == +${N})`).assign(B, (0, s._)`+${N}`);
          return;
        case "integer":
          _.elseIf((0, s._)`${H} === "boolean" || ${N} === null
              || (${H} === "string" && ${N} && ${N} == +${N} && !(${N} % 1))`).assign(B, (0, s._)`+${N}`);
          return;
        case "boolean":
          _.elseIf((0, s._)`${N} === "false" || ${N} === 0 || ${N} === null`).assign(B, !1).elseIf((0, s._)`${N} === "true" || ${N} === 1`).assign(B, !0);
          return;
        case "null":
          _.elseIf((0, s._)`${N} === "" || ${N} === 0 || ${N} === false`), _.assign(B, null);
          return;
        case "array":
          _.elseIf((0, s._)`${H} === "string" || ${H} === "number"
              || ${H} === "boolean" || ${N} === null`).assign(B, (0, s._)`[${N}]`);
      }
    }
  }
  function j({ gen: R, parentData: k, parentDataProperty: D }, _) {
    R.if((0, s._)`${k} !== undefined`, () => R.assign((0, s._)`${k}[${D}]`, _));
  }
  function E(R, k, D, _ = a.Correct) {
    const N = _ === a.Correct ? s.operators.EQ : s.operators.NEQ;
    let A;
    switch (R) {
      case "null":
        return (0, s._)`${k} ${N} null`;
      case "array":
        A = (0, s._)`Array.isArray(${k})`;
        break;
      case "object":
        A = (0, s._)`${k} && typeof ${k} == "object" && !Array.isArray(${k})`;
        break;
      case "integer":
        A = H((0, s._)`!(${k} % 1) && !isNaN(${k})`);
        break;
      case "number":
        A = H();
        break;
      default:
        return (0, s._)`typeof ${k} ${N} ${R}`;
    }
    return _ === a.Correct ? A : (0, s.not)(A);
    function H(B = s.nil) {
      return (0, s.and)((0, s._)`typeof ${k} == "number"`, B, D ? (0, s._)`isFinite(${k})` : s.nil);
    }
  }
  e.checkDataType = E;
  function S(R, k, D, _) {
    if (R.length === 1)
      return E(R[0], k, D, _);
    let N;
    const A = (0, i.toHash)(R);
    if (A.array && A.object) {
      const H = (0, s._)`typeof ${k} != "object"`;
      N = A.null ? H : (0, s._)`!${k} || ${H}`, delete A.null, delete A.array, delete A.object;
    } else
      N = s.nil;
    A.number && delete A.integer;
    for (const H in A)
      N = (0, s.and)(N, E(H, k, D, _));
    return N;
  }
  e.checkDataTypes = S;
  const v = {
    message: ({ schema: R }) => `must be ${R}`,
    params: ({ schema: R, schemaValue: k }) => typeof R == "string" ? (0, s._)`{type: ${R}}` : (0, s._)`{type: ${k}}`
  };
  function y(R) {
    const k = T(R);
    (0, n.reportError)(k, v);
  }
  e.reportTypeError = y;
  function T(R) {
    const { gen: k, data: D, schema: _ } = R, N = (0, i.schemaRefOrVal)(R, _, "type");
    return {
      gen: k,
      keyword: "type",
      data: D,
      schema: _.type,
      schemaCode: N,
      schemaValue: N,
      parentSchema: _,
      params: {},
      it: R
    };
  }
})(er);
var jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.assignDefaults = void 0;
const bt = G, _o = X;
function wo(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      $s(e, s, r[s].default);
  else
    t === "array" && Array.isArray(n) && n.forEach((s, i) => $s(e, i, s.default));
}
jr.assignDefaults = wo;
function $s(e, t, r) {
  const { gen: n, compositeRule: s, data: i, opts: a } = e;
  if (r === void 0)
    return;
  const l = (0, bt._)`${i}${(0, bt.getProperty)(t)}`;
  if (s) {
    (0, _o.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let p = (0, bt._)`${l} === undefined`;
  a.useDefaults === "empty" && (p = (0, bt._)`${p} || ${l} === null || ${l} === ""`), n.if(p, (0, bt._)`${l} = ${(0, bt.stringify)(r)}`);
}
var qe = {}, K = {};
Object.defineProperty(K, "__esModule", { value: !0 });
K.validateUnion = K.validateArray = K.usePattern = K.callValidateCode = K.schemaProperties = K.allSchemaProperties = K.noPropertyInData = K.propertyInData = K.isOwnProperty = K.hasPropFunc = K.reportMissingProp = K.checkMissingProp = K.checkReportMissingProp = void 0;
const ne = G, on = X, Be = Ve, bo = X;
function Po(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ln(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ne._)`${t}` }, !0), e.error();
  });
}
K.checkReportMissingProp = Po;
function Eo({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ne.or)(...n.map((i) => (0, ne.and)(ln(e, t, i, r.ownProperties), (0, ne._)`${s} = ${i}`)));
}
K.checkMissingProp = Eo;
function So(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
K.reportMissingProp = So;
function ni(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ne._)`Object.prototype.hasOwnProperty`
  });
}
K.hasPropFunc = ni;
function cn(e, t, r) {
  return (0, ne._)`${ni(e)}.call(${t}, ${r})`;
}
K.isOwnProperty = cn;
function To(e, t, r, n) {
  const s = (0, ne._)`${t}${(0, ne.getProperty)(r)} !== undefined`;
  return n ? (0, ne._)`${s} && ${cn(e, t, r)}` : s;
}
K.propertyInData = To;
function ln(e, t, r, n) {
  const s = (0, ne._)`${t}${(0, ne.getProperty)(r)} === undefined`;
  return n ? (0, ne.or)(s, (0, ne.not)(cn(e, t, r))) : s;
}
K.noPropertyInData = ln;
function si(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
K.allSchemaProperties = si;
function Ro(e, t) {
  return si(t).filter((r) => !(0, on.alwaysValidSchema)(e, t[r]));
}
K.schemaProperties = Ro;
function No({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: i }, it: a }, l, p, u) {
  const d = u ? (0, ne._)`${e}, ${t}, ${n}${s}` : t, g = [
    [Be.default.instancePath, (0, ne.strConcat)(Be.default.instancePath, i)],
    [Be.default.parentData, a.parentData],
    [Be.default.parentDataProperty, a.parentDataProperty],
    [Be.default.rootData, Be.default.rootData]
  ];
  a.opts.dynamicRef && g.push([Be.default.dynamicAnchors, Be.default.dynamicAnchors]);
  const C = (0, ne._)`${d}, ${r.object(...g)}`;
  return p !== ne.nil ? (0, ne._)`${l}.call(${p}, ${C})` : (0, ne._)`${l}(${C})`;
}
K.callValidateCode = No;
const Oo = (0, ne._)`new RegExp`;
function Co({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, i = s(r, n);
  return e.scopeValue("pattern", {
    key: i.toString(),
    ref: i,
    code: (0, ne._)`${s.code === "new RegExp" ? Oo : (0, bo.useFunc)(e, s)}(${r}, ${n})`
  });
}
K.usePattern = Co;
function jo(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, i = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return a(() => t.assign(l, !1)), l;
  }
  return t.var(i, !0), a(() => t.break()), i;
  function a(l) {
    const p = t.const("len", (0, ne._)`${r}.length`);
    t.forRange("i", 0, p, (u) => {
      e.subschema({
        keyword: n,
        dataProp: u,
        dataPropType: on.Type.Num
      }, i), t.if((0, ne.not)(i), l);
    });
  }
}
K.validateArray = jo;
function ko(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((p) => (0, on.alwaysValidSchema)(s, p)) && !s.opts.unevaluated)
    return;
  const a = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((p, u) => {
    const d = e.subschema({
      keyword: n,
      schemaProp: u,
      compositeRule: !0
    }, l);
    t.assign(a, (0, ne._)`${a} || ${l}`), e.mergeValidEvaluated(d, l) || t.if((0, ne.not)(a));
  })), e.result(a, () => e.reset(), () => e.error(!0));
}
K.validateUnion = ko;
Object.defineProperty(qe, "__esModule", { value: !0 });
qe.validateKeywordUsage = qe.validSchemaType = qe.funcKeywordCode = qe.macroKeywordCode = void 0;
const ge = G, st = Ve, Io = K, Ao = Xt;
function Do(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: i, it: a } = e, l = t.macro.call(a.self, s, i, a), p = ii(r, n, l);
  a.opts.validateSchema !== !1 && a.self.validateSchema(l, !0);
  const u = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: ge.nil,
    errSchemaPath: `${a.errSchemaPath}/${n}`,
    topSchemaRef: p,
    compositeRule: !0
  }, u), e.pass(u, () => e.error(!0));
}
qe.macroKeywordCode = Do;
function Fo(e, t) {
  var r;
  const { gen: n, keyword: s, schema: i, parentSchema: a, $data: l, it: p } = e;
  Uo(p, t);
  const u = !l && t.compile ? t.compile.call(p.self, i, a, p) : t.validate, d = ii(n, s, u), g = n.let("valid");
  e.block$data(g, C), e.ok((r = t.valid) !== null && r !== void 0 ? r : g);
  function C() {
    if (t.errors === !1)
      S(), t.modifying && vs(e), v(() => e.error());
    else {
      const y = t.async ? j() : E();
      t.modifying && vs(e), v(() => Mo(e, y));
    }
  }
  function j() {
    const y = n.let("ruleErrs", null);
    return n.try(() => S((0, ge._)`await `), (T) => n.assign(g, !1).if((0, ge._)`${T} instanceof ${p.ValidationError}`, () => n.assign(y, (0, ge._)`${T}.errors`), () => n.throw(T))), y;
  }
  function E() {
    const y = (0, ge._)`${d}.errors`;
    return n.assign(y, null), S(ge.nil), y;
  }
  function S(y = t.async ? (0, ge._)`await ` : ge.nil) {
    const T = p.opts.passContext ? st.default.this : st.default.self, R = !("compile" in t && !l || t.schema === !1);
    n.assign(g, (0, ge._)`${y}${(0, Io.callValidateCode)(e, d, T, R)}`, t.modifying);
  }
  function v(y) {
    var T;
    n.if((0, ge.not)((T = t.valid) !== null && T !== void 0 ? T : g), y);
  }
}
qe.funcKeywordCode = Fo;
function vs(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, ge._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Mo(e, t) {
  const { gen: r } = e;
  r.if((0, ge._)`Array.isArray(${t})`, () => {
    r.assign(st.default.vErrors, (0, ge._)`${st.default.vErrors} === null ? ${t} : ${st.default.vErrors}.concat(${t})`).assign(st.default.errors, (0, ge._)`${st.default.vErrors}.length`), (0, Ao.extendErrors)(e);
  }, () => e.error());
}
function Uo({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function ii(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, ge.stringify)(r) });
}
function Lo(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
qe.validSchemaType = Lo;
function qo({ schema: e, opts: t, self: r, errSchemaPath: n }, s, i) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(i) : s.keyword !== i)
    throw new Error("ajv implementation error");
  const a = s.dependencies;
  if (a?.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${i}: ${a.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[i])) {
    const p = `keyword "${i}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(p);
    else
      throw new Error(p);
  }
}
qe.validateKeywordUsage = qo;
var Ye = {};
Object.defineProperty(Ye, "__esModule", { value: !0 });
Ye.extendSubschemaMode = Ye.extendSubschemaData = Ye.getSubschema = void 0;
const Le = G, ai = X;
function Vo(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: i, topSchemaRef: a }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, Le._)`${e.schemaPath}${(0, Le.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, Le._)`${e.schemaPath}${(0, Le.getProperty)(t)}${(0, Le.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, ai.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || i === void 0 || a === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: a,
      errSchemaPath: i
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Ye.getSubschema = Vo;
function zo(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: i, propertyName: a }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: u, dataPathArr: d, opts: g } = t, C = l.let("data", (0, Le._)`${t.data}${(0, Le.getProperty)(r)}`, !0);
    p(C), e.errorPath = (0, Le.str)`${u}${(0, ai.getErrorPath)(r, n, g.jsPropertySyntax)}`, e.parentDataProperty = (0, Le._)`${r}`, e.dataPathArr = [...d, e.parentDataProperty];
  }
  if (s !== void 0) {
    const u = s instanceof Le.Name ? s : l.let("data", s, !0);
    p(u), a !== void 0 && (e.propertyName = a);
  }
  i && (e.dataTypes = i);
  function p(u) {
    e.data = u, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, u];
  }
}
Ye.extendSubschemaData = zo;
function Ho(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: i }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), i !== void 0 && (e.allErrors = i), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Ye.extendSubschemaMode = Ho;
var he = {}, oi = function e(t, r) {
  if (t === r)
    return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor)
      return !1;
    var n, s, i;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length)
        return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s]))
          return !1;
      return !0;
    }
    if (t.constructor === RegExp)
      return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf)
      return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString)
      return t.toString() === r.toString();
    if (i = Object.keys(t), n = i.length, n !== Object.keys(r).length)
      return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, i[s]))
        return !1;
    for (s = n; s-- !== 0; ) {
      var a = i[s];
      if (!e(t[a], r[a]))
        return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, ci = { exports: {} }, Je = ci.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  mr(t, n, s, e, "", e);
};
Je.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Je.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Je.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Je.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function mr(e, t, r, n, s, i, a, l, p, u) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, i, a, l, p, u);
    for (var d in n) {
      var g = n[d];
      if (Array.isArray(g)) {
        if (d in Je.arrayKeywords)
          for (var C = 0; C < g.length; C++)
            mr(e, t, r, g[C], s + "/" + d + "/" + C, i, s, d, n, C);
      } else if (d in Je.propsKeywords) {
        if (g && typeof g == "object")
          for (var j in g)
            mr(e, t, r, g[j], s + "/" + d + "/" + Wo(j), i, s, d, n, j);
      } else
        (d in Je.keywords || e.allKeys && !(d in Je.skipKeywords)) && mr(e, t, r, g, s + "/" + d, i, s, d, n);
    }
    r(n, s, i, a, l, p, u);
  }
}
function Wo(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Ko = ci.exports;
Object.defineProperty(he, "__esModule", { value: !0 });
he.getSchemaRefs = he.resolveUrl = he.normalizeId = he._getFullPath = he.getFullPath = he.inlineRef = void 0;
const Go = X, Bo = oi, xo = Ko, Jo = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Yo(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Gr(e) : t ? li(e) <= t : !1;
}
he.inlineRef = Yo;
const Zo = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Gr(e) {
  for (const t in e) {
    if (Zo.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Gr) || typeof r == "object" && Gr(r))
      return !0;
  }
  return !1;
}
function li(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Jo.has(r) && (typeof e[r] == "object" && (0, Go.eachItem)(e[r], (n) => t += li(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function ui(e, t = "", r) {
  r !== !1 && (t = Tt(t));
  const n = e.parse(t);
  return di(e, n);
}
he.getFullPath = ui;
function di(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
he._getFullPath = di;
const Qo = /#\/?$/;
function Tt(e) {
  return e ? e.replace(Qo, "") : "";
}
he.normalizeId = Tt;
function Xo(e, t, r) {
  return r = Tt(r), e.resolve(t, r);
}
he.resolveUrl = Xo;
const ec = /^[a-z_][-a-z0-9._]*$/i;
function tc(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Tt(e[r] || t), i = { "": s }, a = ui(n, s, !1), l = {}, p = /* @__PURE__ */ new Set();
  return xo(e, { allKeys: !0 }, (g, C, j, E) => {
    if (E === void 0)
      return;
    const S = a + C;
    let v = i[E];
    typeof g[r] == "string" && (v = y.call(this, g[r])), T.call(this, g.$anchor), T.call(this, g.$dynamicAnchor), i[C] = v;
    function y(R) {
      const k = this.opts.uriResolver.resolve;
      if (R = Tt(v ? k(v, R) : R), p.has(R))
        throw d(R);
      p.add(R);
      let D = this.refs[R];
      return typeof D == "string" && (D = this.refs[D]), typeof D == "object" ? u(g, D.schema, R) : R !== Tt(S) && (R[0] === "#" ? (u(g, l[R], R), l[R] = g) : this.refs[R] = S), R;
    }
    function T(R) {
      if (typeof R == "string") {
        if (!ec.test(R))
          throw new Error(`invalid anchor "${R}"`);
        y.call(this, `#${R}`);
      }
    }
  }), l;
  function u(g, C, j) {
    if (C !== void 0 && !Bo(g, C))
      throw d(j);
  }
  function d(g) {
    return new Error(`reference "${g}" resolves to more than one schema`);
  }
}
he.getSchemaRefs = tc;
Object.defineProperty(Oe, "__esModule", { value: !0 });
Oe.getData = Oe.KeywordCxt = Oe.validateFunctionCode = void 0;
const fi = Nt, _s = er, un = He, wr = er, rc = jr, Gt = qe, Mr = Ye, L = G, z = Ve, nc = he, We = X, zt = Xt;
function sc(e) {
  if (mi(e) && (yi(e), hi(e))) {
    oc(e);
    return;
  }
  pi(e, () => (0, fi.topBoolOrEmptySchema)(e));
}
Oe.validateFunctionCode = sc;
function pi({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, i) {
  s.code.es5 ? e.func(t, (0, L._)`${z.default.data}, ${z.default.valCxt}`, n.$async, () => {
    e.code((0, L._)`"use strict"; ${ws(r, s)}`), ac(e, s), e.code(i);
  }) : e.func(t, (0, L._)`${z.default.data}, ${ic(s)}`, n.$async, () => e.code(ws(r, s)).code(i));
}
function ic(e) {
  return (0, L._)`{${z.default.instancePath}="", ${z.default.parentData}, ${z.default.parentDataProperty}, ${z.default.rootData}=${z.default.data}${e.dynamicRef ? (0, L._)`, ${z.default.dynamicAnchors}={}` : L.nil}}={}`;
}
function ac(e, t) {
  e.if(z.default.valCxt, () => {
    e.var(z.default.instancePath, (0, L._)`${z.default.valCxt}.${z.default.instancePath}`), e.var(z.default.parentData, (0, L._)`${z.default.valCxt}.${z.default.parentData}`), e.var(z.default.parentDataProperty, (0, L._)`${z.default.valCxt}.${z.default.parentDataProperty}`), e.var(z.default.rootData, (0, L._)`${z.default.valCxt}.${z.default.rootData}`), t.dynamicRef && e.var(z.default.dynamicAnchors, (0, L._)`${z.default.valCxt}.${z.default.dynamicAnchors}`);
  }, () => {
    e.var(z.default.instancePath, (0, L._)`""`), e.var(z.default.parentData, (0, L._)`undefined`), e.var(z.default.parentDataProperty, (0, L._)`undefined`), e.var(z.default.rootData, z.default.data), t.dynamicRef && e.var(z.default.dynamicAnchors, (0, L._)`{}`);
  });
}
function oc(e) {
  const { schema: t, opts: r, gen: n } = e;
  pi(e, () => {
    r.$comment && t.$comment && $i(e), fc(e), n.let(z.default.vErrors, null), n.let(z.default.errors, 0), r.unevaluated && cc(e), gi(e), mc(e);
  });
}
function cc(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, L._)`${r}.evaluated`), t.if((0, L._)`${e.evaluated}.dynamicProps`, () => t.assign((0, L._)`${e.evaluated}.props`, (0, L._)`undefined`)), t.if((0, L._)`${e.evaluated}.dynamicItems`, () => t.assign((0, L._)`${e.evaluated}.items`, (0, L._)`undefined`));
}
function ws(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, L._)`/*# sourceURL=${r} */` : L.nil;
}
function lc(e, t) {
  if (mi(e) && (yi(e), hi(e))) {
    uc(e, t);
    return;
  }
  (0, fi.boolOrEmptySchema)(e, t);
}
function hi({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function mi(e) {
  return typeof e.schema != "boolean";
}
function uc(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && $i(e), pc(e), hc(e);
  const i = n.const("_errs", z.default.errors);
  gi(e, i), n.var(t, (0, L._)`${i} === ${z.default.errors}`);
}
function yi(e) {
  (0, We.checkUnknownRules)(e), dc(e);
}
function gi(e, t) {
  if (e.opts.jtd)
    return bs(e, [], !1, t);
  const r = (0, _s.getSchemaTypes)(e.schema), n = (0, _s.coerceAndCheckDataType)(e, r);
  bs(e, r, !n, t);
}
function dc(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, We.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function fc(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, We.checkStrictMode)(e, "default is ignored in the schema root");
}
function pc(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, nc.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function hc(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function $i({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const i = r.$comment;
  if (s.$comment === !0)
    e.code((0, L._)`${z.default.self}.logger.log(${i})`);
  else if (typeof s.$comment == "function") {
    const a = (0, L.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, L._)`${z.default.self}.opts.$comment(${i}, ${a}, ${l}.schema)`);
  }
}
function mc(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: i } = e;
  r.$async ? t.if((0, L._)`${z.default.errors} === 0`, () => t.return(z.default.data), () => t.throw((0, L._)`new ${s}(${z.default.vErrors})`)) : (t.assign((0, L._)`${n}.errors`, z.default.vErrors), i.unevaluated && yc(e), t.return((0, L._)`${z.default.errors} === 0`));
}
function yc({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof L.Name && e.assign((0, L._)`${t}.props`, r), n instanceof L.Name && e.assign((0, L._)`${t}.items`, n);
}
function bs(e, t, r, n) {
  const { gen: s, schema: i, data: a, allErrors: l, opts: p, self: u } = e, { RULES: d } = u;
  if (i.$ref && (p.ignoreKeywordsWithRef || !(0, We.schemaHasRulesButRef)(i, d))) {
    s.block(() => wi(e, "$ref", d.all.$ref.definition));
    return;
  }
  p.jtd || gc(e, t), s.block(() => {
    for (const C of d.rules)
      g(C);
    g(d.post);
  });
  function g(C) {
    (0, un.shouldUseGroup)(i, C) && (C.type ? (s.if((0, wr.checkDataType)(C.type, a, p.strictNumbers)), Ps(e, C), t.length === 1 && t[0] === C.type && r && (s.else(), (0, wr.reportTypeError)(e)), s.endIf()) : Ps(e, C), l || s.if((0, L._)`${z.default.errors} === ${n || 0}`));
  }
}
function Ps(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, rc.assignDefaults)(e, t.type), r.block(() => {
    for (const i of t.rules)
      (0, un.shouldUseRule)(n, i) && wi(e, i.keyword, i.definition, t.type);
  });
}
function gc(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || ($c(e, t), e.opts.allowUnionTypes || vc(e, t), _c(e, e.dataTypes));
}
function $c(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      vi(e.dataTypes, r) || dn(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), bc(e, t);
  }
}
function vc(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && dn(e, "use allowUnionTypes to allow union type keyword");
}
function _c(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, un.shouldUseRule)(e.schema, s)) {
      const { type: i } = s.definition;
      i.length && !i.some((a) => wc(t, a)) && dn(e, `missing type "${i.join(",")}" for keyword "${n}"`);
    }
  }
}
function wc(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function vi(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function bc(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    vi(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function dn(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, We.checkStrictMode)(e, t, e.opts.strictTypes);
}
class _i {
  constructor(t, r, n) {
    if ((0, Gt.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, We.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", bi(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Gt.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", z.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, L.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, L.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, L._)`${r} !== undefined && (${(0, L.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? zt.reportExtraError : zt.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, zt.reportError)(this, this.def.$dataError || zt.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, zt.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = L.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = L.nil, r = L.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: i, def: a } = this;
    n.if((0, L.or)((0, L._)`${s} === undefined`, r)), t !== L.nil && n.assign(t, !0), (i.length || a.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== L.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: i } = this;
    return (0, L.or)(a(), l());
    function a() {
      if (n.length) {
        if (!(r instanceof L.Name))
          throw new Error("ajv implementation error");
        const p = Array.isArray(n) ? n : [n];
        return (0, L._)`${(0, wr.checkDataTypes)(p, r, i.opts.strictNumbers, wr.DataType.Wrong)}`;
      }
      return L.nil;
    }
    function l() {
      if (s.validateSchema) {
        const p = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, L._)`!${p}(${r})`;
      }
      return L.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Mr.getSubschema)(this.it, t);
    (0, Mr.extendSubschemaData)(n, this.it, t), (0, Mr.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return lc(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = We.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = We.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, L.Name)), !0;
  }
}
Oe.KeywordCxt = _i;
function wi(e, t, r, n) {
  const s = new _i(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Gt.funcKeywordCode)(s, r) : "macro" in r ? (0, Gt.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Gt.funcKeywordCode)(s, r);
}
const Pc = /^\/(?:[^~]|~0|~1)*$/, Ec = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function bi(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, i;
  if (e === "")
    return z.default.rootData;
  if (e[0] === "/") {
    if (!Pc.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, i = z.default.rootData;
  } else {
    const u = Ec.exec(e);
    if (!u)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const d = +u[1];
    if (s = u[2], s === "#") {
      if (d >= t)
        throw new Error(p("property/index", d));
      return n[t - d];
    }
    if (d > t)
      throw new Error(p("data", d));
    if (i = r[t - d], !s)
      return i;
  }
  let a = i;
  const l = s.split("/");
  for (const u of l)
    u && (i = (0, L._)`${i}${(0, L.getProperty)((0, We.unescapeJsonPointer)(u))}`, a = (0, L._)`${a} && ${i}`);
  return a;
  function p(u, d) {
    return `Cannot access ${u} ${d} levels up, current level is ${t}`;
  }
}
Oe.getData = bi;
var tr = {};
Object.defineProperty(tr, "__esModule", { value: !0 });
class Sc extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
tr.default = Sc;
var rr = {};
Object.defineProperty(rr, "__esModule", { value: !0 });
const Ur = he;
class Tc extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ur.resolveUrl)(t, r, n), this.missingSchema = (0, Ur.normalizeId)((0, Ur.getFullPath)(t, this.missingRef));
  }
}
rr.default = Tc;
var _e = {};
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.resolveSchema = _e.getCompilingSchema = _e.resolveRef = _e.compileSchema = _e.SchemaEnv = void 0;
const Te = G, Rc = tr, nt = Ve, Ne = he, Es = X, Nc = Oe;
class kr {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Ne.normalizeId)(n?.[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n?.$async, this.refs = {};
  }
}
_e.SchemaEnv = kr;
function fn(e) {
  const t = Pi.call(this, e);
  if (t)
    return t;
  const r = (0, Ne.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: i } = this.opts, a = new Te.CodeGen(this.scope, { es5: n, lines: s, ownProperties: i });
  let l;
  e.$async && (l = a.scopeValue("Error", {
    ref: Rc.default,
    code: (0, Te._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const p = a.scopeName("validate");
  e.validateName = p;
  const u = {
    gen: a,
    allErrors: this.opts.allErrors,
    data: nt.default.data,
    parentData: nt.default.parentData,
    parentDataProperty: nt.default.parentDataProperty,
    dataNames: [nt.default.data],
    dataPathArr: [Te.nil],
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: a.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Te.stringify)(e.schema) } : { ref: e.schema }),
    validateName: p,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Te.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Te._)`""`,
    opts: this.opts,
    self: this
  };
  let d;
  try {
    this._compilations.add(e), (0, Nc.validateFunctionCode)(u), a.optimize(this.opts.code.optimize);
    const g = a.toString();
    d = `${a.scopeRefs(nt.default.scope)}return ${g}`, this.opts.code.process && (d = this.opts.code.process(d, e));
    const j = new Function(`${nt.default.self}`, `${nt.default.scope}`, d)(this, this.scope.get());
    if (this.scope.value(p, { ref: j }), j.errors = null, j.schema = e.schema, j.schemaEnv = e, e.$async && (j.$async = !0), this.opts.code.source === !0 && (j.source = { validateName: p, validateCode: g, scopeValues: a._values }), this.opts.unevaluated) {
      const { props: E, items: S } = u;
      j.evaluated = {
        props: E instanceof Te.Name ? void 0 : E,
        items: S instanceof Te.Name ? void 0 : S,
        dynamicProps: E instanceof Te.Name,
        dynamicItems: S instanceof Te.Name
      }, j.source && (j.source.evaluated = (0, Te.stringify)(j.evaluated));
    }
    return e.validate = j, e;
  } catch (g) {
    throw delete e.validate, delete e.validateName, d && this.logger.error("Error compiling schema, function code:", d), g;
  } finally {
    this._compilations.delete(e);
  }
}
_e.compileSchema = fn;
function Oc(e, t, r) {
  var n;
  r = (0, Ne.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let i = kc.call(this, e, r);
  if (i === void 0) {
    const a = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    a && (i = new kr({ schema: a, schemaId: l, root: e, baseId: t }));
  }
  if (i !== void 0)
    return e.refs[r] = Cc.call(this, i);
}
_e.resolveRef = Oc;
function Cc(e) {
  return (0, Ne.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : fn.call(this, e);
}
function Pi(e) {
  for (const t of this._compilations)
    if (jc(t, e))
      return t;
}
_e.getCompilingSchema = Pi;
function jc(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function kc(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Ir.call(this, e, t);
}
function Ir(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Ne._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Ne.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Lr.call(this, r, e);
  const i = (0, Ne.normalizeId)(n), a = this.refs[i] || this.schemas[i];
  if (typeof a == "string") {
    const l = Ir.call(this, e, a);
    return typeof l?.schema != "object" ? void 0 : Lr.call(this, r, l);
  }
  if (typeof a?.schema == "object") {
    if (a.validate || fn.call(this, a), i === (0, Ne.normalizeId)(t)) {
      const { schema: l } = a, { schemaId: p } = this.opts, u = l[p];
      return u && (s = (0, Ne.resolveUrl)(this.opts.uriResolver, s, u)), new kr({ schema: l, schemaId: p, root: e, baseId: s });
    }
    return Lr.call(this, r, a);
  }
}
_e.resolveSchema = Ir;
const Ic = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Lr(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const p = r[(0, Es.unescapeFragment)(l)];
    if (p === void 0)
      return;
    r = p;
    const u = typeof r == "object" && r[this.opts.schemaId];
    !Ic.has(l) && u && (t = (0, Ne.resolveUrl)(this.opts.uriResolver, t, u));
  }
  let i;
  if (typeof r != "boolean" && r.$ref && !(0, Es.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Ne.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    i = Ir.call(this, n, l);
  }
  const { schemaId: a } = this.opts;
  if (i = i || new kr({ schema: r, schemaId: a, root: n, baseId: t }), i.schema !== i.root.schema)
    return i;
}
const Ac = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Dc = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Fc = "object", Mc = [
  "$data"
], Uc = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Lc = !1, qc = {
  $id: Ac,
  description: Dc,
  type: Fc,
  required: Mc,
  properties: Uc,
  additionalProperties: Lc
};
var pn = {}, Br = { exports: {} };
/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function(e, t) {
  (function(r, n) {
    n(t);
  })(io, function(r) {
    function n() {
      for (var f = arguments.length, c = Array(f), m = 0; m < f; m++)
        c[m] = arguments[m];
      if (c.length > 1) {
        c[0] = c[0].slice(0, -1);
        for (var P = c.length - 1, b = 1; b < P; ++b)
          c[b] = c[b].slice(1, -1);
        return c[P] = c[P].slice(1), c.join("");
      } else
        return c[0];
    }
    function s(f) {
      return "(?:" + f + ")";
    }
    function i(f) {
      return f === void 0 ? "undefined" : f === null ? "null" : Object.prototype.toString.call(f).split(" ").pop().split("]").shift().toLowerCase();
    }
    function a(f) {
      return f.toUpperCase();
    }
    function l(f) {
      return f != null ? f instanceof Array ? f : typeof f.length != "number" || f.split || f.setInterval || f.call ? [f] : Array.prototype.slice.call(f) : [];
    }
    function p(f, c) {
      var m = f;
      if (c)
        for (var P in c)
          m[P] = c[P];
      return m;
    }
    function u(f) {
      var c = "[A-Za-z]", m = "[0-9]", P = n(m, "[A-Fa-f]"), b = s(s("%[EFef]" + P + "%" + P + P + "%" + P + P) + "|" + s("%[89A-Fa-f]" + P + "%" + P + P) + "|" + s("%" + P + P)), q = "[\\:\\/\\?\\#\\[\\]\\@]", V = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", Q = n(q, V), re = f ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", ce = f ? "[\\uE000-\\uF8FF]" : "[]", J = n(c, m, "[\\-\\.\\_\\~]", re);
      s(c + n(c, m, "[\\+\\-\\.]") + "*"), s(s(b + "|" + n(J, V, "[\\:]")) + "*");
      var te = s(s("25[0-5]") + "|" + s("2[0-4]" + m) + "|" + s("1" + m + m) + "|" + s("0?[1-9]" + m) + "|0?0?" + m), le = s(te + "\\." + te + "\\." + te + "\\." + te), W = s(P + "{1,4}"), se = s(s(W + "\\:" + W) + "|" + le), fe = s(s(W + "\\:") + "{6}" + se), ie = s("\\:\\:" + s(W + "\\:") + "{5}" + se), Ke = s(s(W) + "?\\:\\:" + s(W + "\\:") + "{4}" + se), Fe = s(s(s(W + "\\:") + "{0,1}" + W) + "?\\:\\:" + s(W + "\\:") + "{3}" + se), Me = s(s(s(W + "\\:") + "{0,2}" + W) + "?\\:\\:" + s(W + "\\:") + "{2}" + se), _t = s(s(s(W + "\\:") + "{0,3}" + W) + "?\\:\\:" + W + "\\:" + se), tt = s(s(s(W + "\\:") + "{0,4}" + W) + "?\\:\\:" + se), Ee = s(s(s(W + "\\:") + "{0,5}" + W) + "?\\:\\:" + W), Ue = s(s(s(W + "\\:") + "{0,6}" + W) + "?\\:\\:"), rt = s([fe, ie, Ke, Fe, Me, _t, tt, Ee, Ue].join("|")), ze = s(s(J + "|" + b) + "+");
      s("[vV]" + P + "+\\." + n(J, V, "[\\:]") + "+"), s(s(b + "|" + n(J, V)) + "*");
      var qt = s(b + "|" + n(J, V, "[\\:\\@]"));
      return s(s(b + "|" + n(J, V, "[\\@]")) + "+"), s(s(qt + "|" + n("[\\/\\?]", ce)) + "*"), {
        NOT_SCHEME: new RegExp(n("[^]", c, m, "[\\+\\-\\.]"), "g"),
        NOT_USERINFO: new RegExp(n("[^\\%\\:]", J, V), "g"),
        NOT_HOST: new RegExp(n("[^\\%\\[\\]\\:]", J, V), "g"),
        NOT_PATH: new RegExp(n("[^\\%\\/\\:\\@]", J, V), "g"),
        NOT_PATH_NOSCHEME: new RegExp(n("[^\\%\\/\\@]", J, V), "g"),
        NOT_QUERY: new RegExp(n("[^\\%]", J, V, "[\\:\\@\\/\\?]", ce), "g"),
        NOT_FRAGMENT: new RegExp(n("[^\\%]", J, V, "[\\:\\@\\/\\?]"), "g"),
        ESCAPE: new RegExp(n("[^]", J, V), "g"),
        UNRESERVED: new RegExp(J, "g"),
        OTHER_CHARS: new RegExp(n("[^\\%]", J, Q), "g"),
        PCT_ENCODED: new RegExp(b, "g"),
        IPV4ADDRESS: new RegExp("^(" + le + ")$"),
        IPV6ADDRESS: new RegExp("^\\[?(" + rt + ")" + s(s("\\%25|\\%(?!" + P + "{2})") + "(" + ze + ")") + "?\\]?$")
        //RFC 6874, with relaxed parsing rules
      };
    }
    var d = u(!1), g = u(!0), C = function() {
      function f(c, m) {
        var P = [], b = !0, q = !1, V = void 0;
        try {
          for (var Q = c[Symbol.iterator](), re; !(b = (re = Q.next()).done) && (P.push(re.value), !(m && P.length === m)); b = !0)
            ;
        } catch (ce) {
          q = !0, V = ce;
        } finally {
          try {
            !b && Q.return && Q.return();
          } finally {
            if (q)
              throw V;
          }
        }
        return P;
      }
      return function(c, m) {
        if (Array.isArray(c))
          return c;
        if (Symbol.iterator in Object(c))
          return f(c, m);
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      };
    }(), j = function(f) {
      if (Array.isArray(f)) {
        for (var c = 0, m = Array(f.length); c < f.length; c++)
          m[c] = f[c];
        return m;
      } else
        return Array.from(f);
    }, E = 2147483647, S = 36, v = 1, y = 26, T = 38, R = 700, k = 72, D = 128, _ = "-", N = /^xn--/, A = /[^\0-\x7E]/, H = /[\x2E\u3002\uFF0E\uFF61]/g, B = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    }, ae = S - v, Z = Math.floor, be = String.fromCharCode;
    function de(f) {
      throw new RangeError(B[f]);
    }
    function Ze(f, c) {
      for (var m = [], P = f.length; P--; )
        m[P] = c(f[P]);
      return m;
    }
    function Qe(f, c) {
      var m = f.split("@"), P = "";
      m.length > 1 && (P = m[0] + "@", f = m[1]), f = f.replace(H, ".");
      var b = f.split("."), q = Ze(b, c).join(".");
      return P + q;
    }
    function ft(f) {
      for (var c = [], m = 0, P = f.length; m < P; ) {
        var b = f.charCodeAt(m++);
        if (b >= 55296 && b <= 56319 && m < P) {
          var q = f.charCodeAt(m++);
          (q & 64512) == 56320 ? c.push(((b & 1023) << 10) + (q & 1023) + 65536) : (c.push(b), m--);
        } else
          c.push(b);
      }
      return c;
    }
    var kt = function(c) {
      return String.fromCodePoint.apply(String, j(c));
    }, pt = function(c) {
      return c - 48 < 10 ? c - 22 : c - 65 < 26 ? c - 65 : c - 97 < 26 ? c - 97 : S;
    }, F = function(c, m) {
      return c + 22 + 75 * (c < 26) - ((m != 0) << 5);
    }, $ = function(c, m, P) {
      var b = 0;
      for (
        c = P ? Z(c / R) : c >> 1, c += Z(c / m);
        /* no initialization */
        c > ae * y >> 1;
        b += S
      )
        c = Z(c / ae);
      return Z(b + (ae + 1) * c / (c + T));
    }, I = function(c) {
      var m = [], P = c.length, b = 0, q = D, V = k, Q = c.lastIndexOf(_);
      Q < 0 && (Q = 0);
      for (var re = 0; re < Q; ++re)
        c.charCodeAt(re) >= 128 && de("not-basic"), m.push(c.charCodeAt(re));
      for (var ce = Q > 0 ? Q + 1 : 0; ce < P; ) {
        for (
          var J = b, te = 1, le = S;
          ;
          /* no condition */
          le += S
        ) {
          ce >= P && de("invalid-input");
          var W = pt(c.charCodeAt(ce++));
          (W >= S || W > Z((E - b) / te)) && de("overflow"), b += W * te;
          var se = le <= V ? v : le >= V + y ? y : le - V;
          if (W < se)
            break;
          var fe = S - se;
          te > Z(E / fe) && de("overflow"), te *= fe;
        }
        var ie = m.length + 1;
        V = $(b - J, ie, J == 0), Z(b / ie) > E - q && de("overflow"), q += Z(b / ie), b %= ie, m.splice(b++, 0, q);
      }
      return String.fromCodePoint.apply(String, m);
    }, w = function(c) {
      var m = [];
      c = ft(c);
      var P = c.length, b = D, q = 0, V = k, Q = !0, re = !1, ce = void 0;
      try {
        for (var J = c[Symbol.iterator](), te; !(Q = (te = J.next()).done); Q = !0) {
          var le = te.value;
          le < 128 && m.push(be(le));
        }
      } catch (Vt) {
        re = !0, ce = Vt;
      } finally {
        try {
          !Q && J.return && J.return();
        } finally {
          if (re)
            throw ce;
        }
      }
      var W = m.length, se = W;
      for (W && m.push(_); se < P; ) {
        var fe = E, ie = !0, Ke = !1, Fe = void 0;
        try {
          for (var Me = c[Symbol.iterator](), _t; !(ie = (_t = Me.next()).done); ie = !0) {
            var tt = _t.value;
            tt >= b && tt < fe && (fe = tt);
          }
        } catch (Vt) {
          Ke = !0, Fe = Vt;
        } finally {
          try {
            !ie && Me.return && Me.return();
          } finally {
            if (Ke)
              throw Fe;
          }
        }
        var Ee = se + 1;
        fe - b > Z((E - q) / Ee) && de("overflow"), q += (fe - b) * Ee, b = fe;
        var Ue = !0, rt = !1, ze = void 0;
        try {
          for (var qt = c[Symbol.iterator](), ts; !(Ue = (ts = qt.next()).done); Ue = !0) {
            var rs = ts.value;
            if (rs < b && ++q > E && de("overflow"), rs == b) {
              for (
                var ir = q, ar = S;
                ;
                /* no condition */
                ar += S
              ) {
                var or = ar <= V ? v : ar >= V + y ? y : ar - V;
                if (ir < or)
                  break;
                var ns = ir - or, ss = S - or;
                m.push(be(F(or + ns % ss, 0))), ir = Z(ns / ss);
              }
              m.push(be(F(ir, 0))), V = $(q, Ee, se == W), q = 0, ++se;
            }
          }
        } catch (Vt) {
          rt = !0, ze = Vt;
        } finally {
          try {
            !Ue && qt.return && qt.return();
          } finally {
            if (rt)
              throw ze;
          }
        }
        ++q, ++b;
      }
      return m.join("");
    }, o = function(c) {
      return Qe(c, function(m) {
        return N.test(m) ? I(m.slice(4).toLowerCase()) : m;
      });
    }, h = function(c) {
      return Qe(c, function(m) {
        return A.test(m) ? "xn--" + w(m) : m;
      });
    }, O = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      version: "2.1.0",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      ucs2: {
        decode: ft,
        encode: kt
      },
      decode: I,
      encode: w,
      toASCII: h,
      toUnicode: o
    }, M = {};
    function U(f) {
      var c = f.charCodeAt(0), m = void 0;
      return c < 16 ? m = "%0" + c.toString(16).toUpperCase() : c < 128 ? m = "%" + c.toString(16).toUpperCase() : c < 2048 ? m = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase() : m = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase(), m;
    }
    function x(f) {
      for (var c = "", m = 0, P = f.length; m < P; ) {
        var b = parseInt(f.substr(m + 1, 2), 16);
        if (b < 128)
          c += String.fromCharCode(b), m += 3;
        else if (b >= 194 && b < 224) {
          if (P - m >= 6) {
            var q = parseInt(f.substr(m + 4, 2), 16);
            c += String.fromCharCode((b & 31) << 6 | q & 63);
          } else
            c += f.substr(m, 6);
          m += 6;
        } else if (b >= 224) {
          if (P - m >= 9) {
            var V = parseInt(f.substr(m + 4, 2), 16), Q = parseInt(f.substr(m + 7, 2), 16);
            c += String.fromCharCode((b & 15) << 12 | (V & 63) << 6 | Q & 63);
          } else
            c += f.substr(m, 9);
          m += 9;
        } else
          c += f.substr(m, 3), m += 3;
      }
      return c;
    }
    function Y(f, c) {
      function m(P) {
        var b = x(P);
        return b.match(c.UNRESERVED) ? b : P;
      }
      return f.scheme && (f.scheme = String(f.scheme).replace(c.PCT_ENCODED, m).toLowerCase().replace(c.NOT_SCHEME, "")), f.userinfo !== void 0 && (f.userinfo = String(f.userinfo).replace(c.PCT_ENCODED, m).replace(c.NOT_USERINFO, U).replace(c.PCT_ENCODED, a)), f.host !== void 0 && (f.host = String(f.host).replace(c.PCT_ENCODED, m).toLowerCase().replace(c.NOT_HOST, U).replace(c.PCT_ENCODED, a)), f.path !== void 0 && (f.path = String(f.path).replace(c.PCT_ENCODED, m).replace(f.scheme ? c.NOT_PATH : c.NOT_PATH_NOSCHEME, U).replace(c.PCT_ENCODED, a)), f.query !== void 0 && (f.query = String(f.query).replace(c.PCT_ENCODED, m).replace(c.NOT_QUERY, U).replace(c.PCT_ENCODED, a)), f.fragment !== void 0 && (f.fragment = String(f.fragment).replace(c.PCT_ENCODED, m).replace(c.NOT_FRAGMENT, U).replace(c.PCT_ENCODED, a)), f;
    }
    function oe(f) {
      return f.replace(/^0*(.*)/, "$1") || "0";
    }
    function Ie(f, c) {
      var m = f.match(c.IPV4ADDRESS) || [], P = C(m, 2), b = P[1];
      return b ? b.split(".").map(oe).join(".") : f;
    }
    function ht(f, c) {
      var m = f.match(c.IPV6ADDRESS) || [], P = C(m, 3), b = P[1], q = P[2];
      if (b) {
        for (var V = b.toLowerCase().split("::").reverse(), Q = C(V, 2), re = Q[0], ce = Q[1], J = ce ? ce.split(":").map(oe) : [], te = re.split(":").map(oe), le = c.IPV4ADDRESS.test(te[te.length - 1]), W = le ? 7 : 8, se = te.length - W, fe = Array(W), ie = 0; ie < W; ++ie)
          fe[ie] = J[ie] || te[se + ie] || "";
        le && (fe[W - 1] = Ie(fe[W - 1], c));
        var Ke = fe.reduce(function(Ee, Ue, rt) {
          if (!Ue || Ue === "0") {
            var ze = Ee[Ee.length - 1];
            ze && ze.index + ze.length === rt ? ze.length++ : Ee.push({ index: rt, length: 1 });
          }
          return Ee;
        }, []), Fe = Ke.sort(function(Ee, Ue) {
          return Ue.length - Ee.length;
        })[0], Me = void 0;
        if (Fe && Fe.length > 1) {
          var _t = fe.slice(0, Fe.index), tt = fe.slice(Fe.index + Fe.length);
          Me = _t.join(":") + "::" + tt.join(":");
        } else
          Me = fe.join(":");
        return q && (Me += "%" + q), Me;
      } else
        return f;
    }
    var It = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i, At = "".match(/(){0}/)[1] === void 0;
    function we(f) {
      var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, m = {}, P = c.iri !== !1 ? g : d;
      c.reference === "suffix" && (f = (c.scheme ? c.scheme + ":" : "") + "//" + f);
      var b = f.match(It);
      if (b) {
        At ? (m.scheme = b[1], m.userinfo = b[3], m.host = b[4], m.port = parseInt(b[5], 10), m.path = b[6] || "", m.query = b[7], m.fragment = b[8], isNaN(m.port) && (m.port = b[5])) : (m.scheme = b[1] || void 0, m.userinfo = f.indexOf("@") !== -1 ? b[3] : void 0, m.host = f.indexOf("//") !== -1 ? b[4] : void 0, m.port = parseInt(b[5], 10), m.path = b[6] || "", m.query = f.indexOf("?") !== -1 ? b[7] : void 0, m.fragment = f.indexOf("#") !== -1 ? b[8] : void 0, isNaN(m.port) && (m.port = f.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? b[4] : void 0)), m.host && (m.host = ht(Ie(m.host, P), P)), m.scheme === void 0 && m.userinfo === void 0 && m.host === void 0 && m.port === void 0 && !m.path && m.query === void 0 ? m.reference = "same-document" : m.scheme === void 0 ? m.reference = "relative" : m.fragment === void 0 ? m.reference = "absolute" : m.reference = "uri", c.reference && c.reference !== "suffix" && c.reference !== m.reference && (m.error = m.error || "URI is not a " + c.reference + " reference.");
        var q = M[(c.scheme || m.scheme || "").toLowerCase()];
        if (!c.unicodeSupport && (!q || !q.unicodeSupport)) {
          if (m.host && (c.domainHost || q && q.domainHost))
            try {
              m.host = O.toASCII(m.host.replace(P.PCT_ENCODED, x).toLowerCase());
            } catch (V) {
              m.error = m.error || "Host's domain name can not be converted to ASCII via punycode: " + V;
            }
          Y(m, d);
        } else
          Y(m, P);
        q && q.parse && q.parse(m, c);
      } else
        m.error = m.error || "URI can not be parsed.";
      return m;
    }
    function Dt(f, c) {
      var m = c.iri !== !1 ? g : d, P = [];
      return f.userinfo !== void 0 && (P.push(f.userinfo), P.push("@")), f.host !== void 0 && P.push(ht(Ie(String(f.host), m), m).replace(m.IPV6ADDRESS, function(b, q, V) {
        return "[" + q + (V ? "%25" + V : "") + "]";
      })), (typeof f.port == "number" || typeof f.port == "string") && (P.push(":"), P.push(String(f.port))), P.length ? P.join("") : void 0;
    }
    var mt = /^\.\.?\//, yt = /^\/\.(\/|$)/, gt = /^\/\.\.(\/|$)/, Ft = /^\/?(?:.|\n)*?(?=\/|$)/;
    function Ae(f) {
      for (var c = []; f.length; )
        if (f.match(mt))
          f = f.replace(mt, "");
        else if (f.match(yt))
          f = f.replace(yt, "/");
        else if (f.match(gt))
          f = f.replace(gt, "/"), c.pop();
        else if (f === "." || f === "..")
          f = "";
        else {
          var m = f.match(Ft);
          if (m) {
            var P = m[0];
            f = f.slice(P.length), c.push(P);
          } else
            throw new Error("Unexpected dot segment condition");
        }
      return c.join("");
    }
    function $e(f) {
      var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, m = c.iri ? g : d, P = [], b = M[(c.scheme || f.scheme || "").toLowerCase()];
      if (b && b.serialize && b.serialize(f, c), f.host && !m.IPV6ADDRESS.test(f.host)) {
        if (c.domainHost || b && b.domainHost)
          try {
            f.host = c.iri ? O.toUnicode(f.host) : O.toASCII(f.host.replace(m.PCT_ENCODED, x).toLowerCase());
          } catch (Q) {
            f.error = f.error || "Host's domain name can not be converted to " + (c.iri ? "Unicode" : "ASCII") + " via punycode: " + Q;
          }
      }
      Y(f, m), c.reference !== "suffix" && f.scheme && (P.push(f.scheme), P.push(":"));
      var q = Dt(f, c);
      if (q !== void 0 && (c.reference !== "suffix" && P.push("//"), P.push(q), f.path && f.path.charAt(0) !== "/" && P.push("/")), f.path !== void 0) {
        var V = f.path;
        !c.absolutePath && (!b || !b.absolutePath) && (V = Ae(V)), q === void 0 && (V = V.replace(/^\/\//, "/%2F")), P.push(V);
      }
      return f.query !== void 0 && (P.push("?"), P.push(f.query)), f.fragment !== void 0 && (P.push("#"), P.push(f.fragment)), P.join("");
    }
    function $t(f, c) {
      var m = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, P = arguments[3], b = {};
      return P || (f = we($e(f, m), m), c = we($e(c, m), m)), m = m || {}, !m.tolerant && c.scheme ? (b.scheme = c.scheme, b.userinfo = c.userinfo, b.host = c.host, b.port = c.port, b.path = Ae(c.path || ""), b.query = c.query) : (c.userinfo !== void 0 || c.host !== void 0 || c.port !== void 0 ? (b.userinfo = c.userinfo, b.host = c.host, b.port = c.port, b.path = Ae(c.path || ""), b.query = c.query) : (c.path ? (c.path.charAt(0) === "/" ? b.path = Ae(c.path) : ((f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0) && !f.path ? b.path = "/" + c.path : f.path ? b.path = f.path.slice(0, f.path.lastIndexOf("/") + 1) + c.path : b.path = c.path, b.path = Ae(b.path)), b.query = c.query) : (b.path = f.path, c.query !== void 0 ? b.query = c.query : b.query = f.query), b.userinfo = f.userinfo, b.host = f.host, b.port = f.port), b.scheme = f.scheme), b.fragment = c.fragment, b;
    }
    function Mt(f, c, m) {
      var P = p({ scheme: "null" }, m);
      return $e($t(we(f, P), we(c, P), P, !0), P);
    }
    function Xe(f, c) {
      return typeof f == "string" ? f = $e(we(f, c), c) : i(f) === "object" && (f = we($e(f, c), c)), f;
    }
    function Ut(f, c, m) {
      return typeof f == "string" ? f = $e(we(f, m), m) : i(f) === "object" && (f = $e(f, m)), typeof c == "string" ? c = $e(we(c, m), m) : i(c) === "object" && (c = $e(c, m)), f === c;
    }
    function sr(f, c) {
      return f && f.toString().replace(!c || !c.iri ? d.ESCAPE : g.ESCAPE, U);
    }
    function Pe(f, c) {
      return f && f.toString().replace(!c || !c.iri ? d.PCT_ENCODED : g.PCT_ENCODED, x);
    }
    var et = {
      scheme: "http",
      domainHost: !0,
      parse: function(c, m) {
        return c.host || (c.error = c.error || "HTTP URIs must have a host."), c;
      },
      serialize: function(c, m) {
        var P = String(c.scheme).toLowerCase() === "https";
        return (c.port === (P ? 443 : 80) || c.port === "") && (c.port = void 0), c.path || (c.path = "/"), c;
      }
    }, Bn = {
      scheme: "https",
      domainHost: et.domainHost,
      parse: et.parse,
      serialize: et.serialize
    };
    function xn(f) {
      return typeof f.secure == "boolean" ? f.secure : String(f.scheme).toLowerCase() === "wss";
    }
    var Lt = {
      scheme: "ws",
      domainHost: !0,
      parse: function(c, m) {
        var P = c;
        return P.secure = xn(P), P.resourceName = (P.path || "/") + (P.query ? "?" + P.query : ""), P.path = void 0, P.query = void 0, P;
      },
      serialize: function(c, m) {
        if ((c.port === (xn(c) ? 443 : 80) || c.port === "") && (c.port = void 0), typeof c.secure == "boolean" && (c.scheme = c.secure ? "wss" : "ws", c.secure = void 0), c.resourceName) {
          var P = c.resourceName.split("?"), b = C(P, 2), q = b[0], V = b[1];
          c.path = q && q !== "/" ? q : void 0, c.query = V, c.resourceName = void 0;
        }
        return c.fragment = void 0, c;
      }
    }, Jn = {
      scheme: "wss",
      domainHost: Lt.domainHost,
      parse: Lt.parse,
      serialize: Lt.serialize
    }, zi = {}, Yn = "[A-Za-z0-9\\-\\.\\_\\~\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]", De = "[0-9A-Fa-f]", Hi = s(s("%[EFef]" + De + "%" + De + De + "%" + De + De) + "|" + s("%[89A-Fa-f]" + De + "%" + De + De) + "|" + s("%" + De + De)), Wi = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]", Ki = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]", Gi = n(Ki, '[\\"\\\\]'), Bi = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]", xi = new RegExp(Yn, "g"), vt = new RegExp(Hi, "g"), Ji = new RegExp(n("[^]", Wi, "[\\.]", '[\\"]', Gi), "g"), Zn = new RegExp(n("[^]", Yn, Bi), "g"), Yi = Zn;
    function Dr(f) {
      var c = x(f);
      return c.match(xi) ? c : f;
    }
    var Qn = {
      scheme: "mailto",
      parse: function(c, m) {
        var P = c, b = P.to = P.path ? P.path.split(",") : [];
        if (P.path = void 0, P.query) {
          for (var q = !1, V = {}, Q = P.query.split("&"), re = 0, ce = Q.length; re < ce; ++re) {
            var J = Q[re].split("=");
            switch (J[0]) {
              case "to":
                for (var te = J[1].split(","), le = 0, W = te.length; le < W; ++le)
                  b.push(te[le]);
                break;
              case "subject":
                P.subject = Pe(J[1], m);
                break;
              case "body":
                P.body = Pe(J[1], m);
                break;
              default:
                q = !0, V[Pe(J[0], m)] = Pe(J[1], m);
                break;
            }
          }
          q && (P.headers = V);
        }
        P.query = void 0;
        for (var se = 0, fe = b.length; se < fe; ++se) {
          var ie = b[se].split("@");
          if (ie[0] = Pe(ie[0]), m.unicodeSupport)
            ie[1] = Pe(ie[1], m).toLowerCase();
          else
            try {
              ie[1] = O.toASCII(Pe(ie[1], m).toLowerCase());
            } catch (Ke) {
              P.error = P.error || "Email address's domain name can not be converted to ASCII via punycode: " + Ke;
            }
          b[se] = ie.join("@");
        }
        return P;
      },
      serialize: function(c, m) {
        var P = c, b = l(c.to);
        if (b) {
          for (var q = 0, V = b.length; q < V; ++q) {
            var Q = String(b[q]), re = Q.lastIndexOf("@"), ce = Q.slice(0, re).replace(vt, Dr).replace(vt, a).replace(Ji, U), J = Q.slice(re + 1);
            try {
              J = m.iri ? O.toUnicode(J) : O.toASCII(Pe(J, m).toLowerCase());
            } catch (se) {
              P.error = P.error || "Email address's domain name can not be converted to " + (m.iri ? "Unicode" : "ASCII") + " via punycode: " + se;
            }
            b[q] = ce + "@" + J;
          }
          P.path = b.join(",");
        }
        var te = c.headers = c.headers || {};
        c.subject && (te.subject = c.subject), c.body && (te.body = c.body);
        var le = [];
        for (var W in te)
          te[W] !== zi[W] && le.push(W.replace(vt, Dr).replace(vt, a).replace(Zn, U) + "=" + te[W].replace(vt, Dr).replace(vt, a).replace(Yi, U));
        return le.length && (P.query = le.join("&")), P;
      }
    }, Zi = /^([^\:]+)\:(.*)/, Xn = {
      scheme: "urn",
      parse: function(c, m) {
        var P = c.path && c.path.match(Zi), b = c;
        if (P) {
          var q = m.scheme || b.scheme || "urn", V = P[1].toLowerCase(), Q = P[2], re = q + ":" + (m.nid || V), ce = M[re];
          b.nid = V, b.nss = Q, b.path = void 0, ce && (b = ce.parse(b, m));
        } else
          b.error = b.error || "URN can not be parsed.";
        return b;
      },
      serialize: function(c, m) {
        var P = m.scheme || c.scheme || "urn", b = c.nid, q = P + ":" + (m.nid || b), V = M[q];
        V && (c = V.serialize(c, m));
        var Q = c, re = c.nss;
        return Q.path = (b || m.nid) + ":" + re, Q;
      }
    }, Qi = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/, es = {
      scheme: "urn:uuid",
      parse: function(c, m) {
        var P = c;
        return P.uuid = P.nss, P.nss = void 0, !m.tolerant && (!P.uuid || !P.uuid.match(Qi)) && (P.error = P.error || "UUID is not valid."), P;
      },
      serialize: function(c, m) {
        var P = c;
        return P.nss = (c.uuid || "").toLowerCase(), P;
      }
    };
    M[et.scheme] = et, M[Bn.scheme] = Bn, M[Lt.scheme] = Lt, M[Jn.scheme] = Jn, M[Qn.scheme] = Qn, M[Xn.scheme] = Xn, M[es.scheme] = es, r.SCHEMES = M, r.pctEncChar = U, r.pctDecChars = x, r.parse = we, r.removeDotSegments = Ae, r.serialize = $e, r.resolveComponents = $t, r.resolve = Mt, r.normalize = Xe, r.equal = Ut, r.escapeComponent = sr, r.unescapeComponent = Pe, Object.defineProperty(r, "__esModule", { value: !0 });
  });
})(Br, Br.exports);
var Vc = Br.exports;
Object.defineProperty(pn, "__esModule", { value: !0 });
const Ei = Vc;
Ei.code = 'require("ajv/dist/runtime/uri").default';
pn.default = Ei;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Oe;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = G;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = tr, s = rr, i = lt, a = _e, l = G, p = he, u = er, d = X, g = qc, C = pn, j = (F, $) => new RegExp(F, $);
  j.code = "new RegExp";
  const E = ["removeAdditional", "useDefaults", "coerceTypes"], S = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), v = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, y = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, T = 200;
  function R(F) {
    var $, I, w, o, h, O, M, U, x, Y, oe, Ie, ht, It, At, we, Dt, mt, yt, gt, Ft, Ae, $e, $t, Mt;
    const Xe = F.strict, Ut = ($ = F.code) === null || $ === void 0 ? void 0 : $.optimize, sr = Ut === !0 || Ut === void 0 ? 1 : Ut || 0, Pe = (w = (I = F.code) === null || I === void 0 ? void 0 : I.regExp) !== null && w !== void 0 ? w : j, et = (o = F.uriResolver) !== null && o !== void 0 ? o : C.default;
    return {
      strictSchema: (O = (h = F.strictSchema) !== null && h !== void 0 ? h : Xe) !== null && O !== void 0 ? O : !0,
      strictNumbers: (U = (M = F.strictNumbers) !== null && M !== void 0 ? M : Xe) !== null && U !== void 0 ? U : !0,
      strictTypes: (Y = (x = F.strictTypes) !== null && x !== void 0 ? x : Xe) !== null && Y !== void 0 ? Y : "log",
      strictTuples: (Ie = (oe = F.strictTuples) !== null && oe !== void 0 ? oe : Xe) !== null && Ie !== void 0 ? Ie : "log",
      strictRequired: (It = (ht = F.strictRequired) !== null && ht !== void 0 ? ht : Xe) !== null && It !== void 0 ? It : !1,
      code: F.code ? { ...F.code, optimize: sr, regExp: Pe } : { optimize: sr, regExp: Pe },
      loopRequired: (At = F.loopRequired) !== null && At !== void 0 ? At : T,
      loopEnum: (we = F.loopEnum) !== null && we !== void 0 ? we : T,
      meta: (Dt = F.meta) !== null && Dt !== void 0 ? Dt : !0,
      messages: (mt = F.messages) !== null && mt !== void 0 ? mt : !0,
      inlineRefs: (yt = F.inlineRefs) !== null && yt !== void 0 ? yt : !0,
      schemaId: (gt = F.schemaId) !== null && gt !== void 0 ? gt : "$id",
      addUsedSchema: (Ft = F.addUsedSchema) !== null && Ft !== void 0 ? Ft : !0,
      validateSchema: (Ae = F.validateSchema) !== null && Ae !== void 0 ? Ae : !0,
      validateFormats: ($e = F.validateFormats) !== null && $e !== void 0 ? $e : !0,
      unicodeRegExp: ($t = F.unicodeRegExp) !== null && $t !== void 0 ? $t : !0,
      int32range: (Mt = F.int32range) !== null && Mt !== void 0 ? Mt : !0,
      uriResolver: et
    };
  }
  class k {
    constructor($ = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), $ = this.opts = { ...$, ...R($) };
      const { es5: I, lines: w } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: S, es5: I, lines: w }), this.logger = Z($.logger);
      const o = $.validateFormats;
      $.validateFormats = !1, this.RULES = (0, i.getRules)(), D.call(this, v, $, "NOT SUPPORTED"), D.call(this, y, $, "DEPRECATED", "warn"), this._metaOpts = B.call(this), $.formats && A.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), $.keywords && H.call(this, $.keywords), typeof $.meta == "object" && this.addMetaSchema($.meta), N.call(this), $.validateFormats = o;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: $, meta: I, schemaId: w } = this.opts;
      let o = g;
      w === "id" && (o = { ...g }, o.id = o.$id, delete o.$id), I && $ && this.addMetaSchema(o, o[w], !1);
    }
    defaultMeta() {
      const { meta: $, schemaId: I } = this.opts;
      return this.opts.defaultMeta = typeof $ == "object" ? $[I] || $ : void 0;
    }
    validate($, I) {
      let w;
      if (typeof $ == "string") {
        if (w = this.getSchema($), !w)
          throw new Error(`no schema with key or ref "${$}"`);
      } else
        w = this.compile($);
      const o = w(I);
      return "$async" in w || (this.errors = w.errors), o;
    }
    compile($, I) {
      const w = this._addSchema($, I);
      return w.validate || this._compileSchemaEnv(w);
    }
    compileAsync($, I) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: w } = this.opts;
      return o.call(this, $, I);
      async function o(Y, oe) {
        await h.call(this, Y.$schema);
        const Ie = this._addSchema(Y, oe);
        return Ie.validate || O.call(this, Ie);
      }
      async function h(Y) {
        Y && !this.getSchema(Y) && await o.call(this, { $ref: Y }, !0);
      }
      async function O(Y) {
        try {
          return this._compileSchemaEnv(Y);
        } catch (oe) {
          if (!(oe instanceof s.default))
            throw oe;
          return M.call(this, oe), await U.call(this, oe.missingSchema), O.call(this, Y);
        }
      }
      function M({ missingSchema: Y, missingRef: oe }) {
        if (this.refs[Y])
          throw new Error(`AnySchema ${Y} is loaded but ${oe} cannot be resolved`);
      }
      async function U(Y) {
        const oe = await x.call(this, Y);
        this.refs[Y] || await h.call(this, oe.$schema), this.refs[Y] || this.addSchema(oe, Y, I);
      }
      async function x(Y) {
        const oe = this._loading[Y];
        if (oe)
          return oe;
        try {
          return await (this._loading[Y] = w(Y));
        } finally {
          delete this._loading[Y];
        }
      }
    }
    // Adds schema to the instance
    addSchema($, I, w, o = this.opts.validateSchema) {
      if (Array.isArray($)) {
        for (const O of $)
          this.addSchema(O, void 0, w, o);
        return this;
      }
      let h;
      if (typeof $ == "object") {
        const { schemaId: O } = this.opts;
        if (h = $[O], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${O} must be string`);
      }
      return I = (0, p.normalizeId)(I || h), this._checkUnique(I), this.schemas[I] = this._addSchema($, w, I, o, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema($, I, w = this.opts.validateSchema) {
      return this.addSchema($, I, !0, w), this;
    }
    //  Validate schema against its meta-schema
    validateSchema($, I) {
      if (typeof $ == "boolean")
        return !0;
      let w;
      if (w = $.$schema, w !== void 0 && typeof w != "string")
        throw new Error("$schema must be a string");
      if (w = w || this.opts.defaultMeta || this.defaultMeta(), !w)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const o = this.validate(w, $);
      if (!o && I) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return o;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema($) {
      let I;
      for (; typeof (I = _.call(this, $)) == "string"; )
        $ = I;
      if (I === void 0) {
        const { schemaId: w } = this.opts, o = new a.SchemaEnv({ schema: {}, schemaId: w });
        if (I = a.resolveSchema.call(this, o, $), !I)
          return;
        this.refs[$] = I;
      }
      return I.validate || this._compileSchemaEnv(I);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema($) {
      if ($ instanceof RegExp)
        return this._removeAllSchemas(this.schemas, $), this._removeAllSchemas(this.refs, $), this;
      switch (typeof $) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const I = _.call(this, $);
          return typeof I == "object" && this._cache.delete(I.schema), delete this.schemas[$], delete this.refs[$], this;
        }
        case "object": {
          const I = $;
          this._cache.delete(I);
          let w = $[this.opts.schemaId];
          return w && (w = (0, p.normalizeId)(w), delete this.schemas[w], delete this.refs[w]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary($) {
      for (const I of $)
        this.addKeyword(I);
      return this;
    }
    addKeyword($, I) {
      let w;
      if (typeof $ == "string")
        w = $, typeof I == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), I.keyword = w);
      else if (typeof $ == "object" && I === void 0) {
        if (I = $, w = I.keyword, Array.isArray(w) && !w.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (de.call(this, w, I), !I)
        return (0, d.eachItem)(w, (h) => Ze.call(this, h)), this;
      ft.call(this, I);
      const o = {
        ...I,
        type: (0, u.getJSONTypes)(I.type),
        schemaType: (0, u.getJSONTypes)(I.schemaType)
      };
      return (0, d.eachItem)(w, o.type.length === 0 ? (h) => Ze.call(this, h, o) : (h) => o.type.forEach((O) => Ze.call(this, h, o, O))), this;
    }
    getKeyword($) {
      const I = this.RULES.all[$];
      return typeof I == "object" ? I.definition : !!I;
    }
    // Remove keyword
    removeKeyword($) {
      const { RULES: I } = this;
      delete I.keywords[$], delete I.all[$];
      for (const w of I.rules) {
        const o = w.rules.findIndex((h) => h.keyword === $);
        o >= 0 && w.rules.splice(o, 1);
      }
      return this;
    }
    // Add format
    addFormat($, I) {
      return typeof I == "string" && (I = new RegExp(I)), this.formats[$] = I, this;
    }
    errorsText($ = this.errors, { separator: I = ", ", dataVar: w = "data" } = {}) {
      return !$ || $.length === 0 ? "No errors" : $.map((o) => `${w}${o.instancePath} ${o.message}`).reduce((o, h) => o + I + h);
    }
    $dataMetaSchema($, I) {
      const w = this.RULES.all;
      $ = JSON.parse(JSON.stringify($));
      for (const o of I) {
        const h = o.split("/").slice(1);
        let O = $;
        for (const M of h)
          O = O[M];
        for (const M in w) {
          const U = w[M];
          if (typeof U != "object")
            continue;
          const { $data: x } = U.definition, Y = O[M];
          x && Y && (O[M] = pt(Y));
        }
      }
      return $;
    }
    _removeAllSchemas($, I) {
      for (const w in $) {
        const o = $[w];
        (!I || I.test(w)) && (typeof o == "string" ? delete $[w] : o && !o.meta && (this._cache.delete(o.schema), delete $[w]));
      }
    }
    _addSchema($, I, w, o = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let O;
      const { schemaId: M } = this.opts;
      if (typeof $ == "object")
        O = $[M];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof $ != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let U = this._cache.get($);
      if (U !== void 0)
        return U;
      w = (0, p.normalizeId)(O || w);
      const x = p.getSchemaRefs.call(this, $, w);
      return U = new a.SchemaEnv({ schema: $, schemaId: M, meta: I, baseId: w, localRefs: x }), this._cache.set(U.schema, U), h && !w.startsWith("#") && (w && this._checkUnique(w), this.refs[w] = U), o && this.validateSchema($, !0), U;
    }
    _checkUnique($) {
      if (this.schemas[$] || this.refs[$])
        throw new Error(`schema with key or id "${$}" already exists`);
    }
    _compileSchemaEnv($) {
      if ($.meta ? this._compileMetaSchema($) : a.compileSchema.call(this, $), !$.validate)
        throw new Error("ajv implementation error");
      return $.validate;
    }
    _compileMetaSchema($) {
      const I = this.opts;
      this.opts = this._metaOpts;
      try {
        a.compileSchema.call(this, $);
      } finally {
        this.opts = I;
      }
    }
  }
  e.default = k, k.ValidationError = n.default, k.MissingRefError = s.default;
  function D(F, $, I, w = "error") {
    for (const o in F) {
      const h = o;
      h in $ && this.logger[w](`${I}: option ${o}. ${F[h]}`);
    }
  }
  function _(F) {
    return F = (0, p.normalizeId)(F), this.schemas[F] || this.refs[F];
  }
  function N() {
    const F = this.opts.schemas;
    if (F)
      if (Array.isArray(F))
        this.addSchema(F);
      else
        for (const $ in F)
          this.addSchema(F[$], $);
  }
  function A() {
    for (const F in this.opts.formats) {
      const $ = this.opts.formats[F];
      $ && this.addFormat(F, $);
    }
  }
  function H(F) {
    if (Array.isArray(F)) {
      this.addVocabulary(F);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const $ in F) {
      const I = F[$];
      I.keyword || (I.keyword = $), this.addKeyword(I);
    }
  }
  function B() {
    const F = { ...this.opts };
    for (const $ of E)
      delete F[$];
    return F;
  }
  const ae = { log() {
  }, warn() {
  }, error() {
  } };
  function Z(F) {
    if (F === !1)
      return ae;
    if (F === void 0)
      return console;
    if (F.log && F.warn && F.error)
      return F;
    throw new Error("logger must implement log, warn and error methods");
  }
  const be = /^[a-z_$][a-z0-9_$:-]*$/i;
  function de(F, $) {
    const { RULES: I } = this;
    if ((0, d.eachItem)(F, (w) => {
      if (I.keywords[w])
        throw new Error(`Keyword ${w} is already defined`);
      if (!be.test(w))
        throw new Error(`Keyword ${w} has invalid name`);
    }), !!$ && $.$data && !("code" in $ || "validate" in $))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function Ze(F, $, I) {
    var w;
    const o = $?.post;
    if (I && o)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let O = o ? h.post : h.rules.find(({ type: U }) => U === I);
    if (O || (O = { type: I, rules: [] }, h.rules.push(O)), h.keywords[F] = !0, !$)
      return;
    const M = {
      keyword: F,
      definition: {
        ...$,
        type: (0, u.getJSONTypes)($.type),
        schemaType: (0, u.getJSONTypes)($.schemaType)
      }
    };
    $.before ? Qe.call(this, O, M, $.before) : O.rules.push(M), h.all[F] = M, (w = $.implements) === null || w === void 0 || w.forEach((U) => this.addKeyword(U));
  }
  function Qe(F, $, I) {
    const w = F.rules.findIndex((o) => o.keyword === I);
    w >= 0 ? F.rules.splice(w, 0, $) : (F.rules.push($), this.logger.warn(`rule ${I} is not defined`));
  }
  function ft(F) {
    let { metaSchema: $ } = F;
    $ !== void 0 && (F.$data && this.opts.$data && ($ = pt($)), F.validateSchema = this.compile($, !0));
  }
  const kt = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function pt(F) {
    return { anyOf: [F, kt] };
  }
})(Xs);
var hn = {}, mn = {}, yn = {};
Object.defineProperty(yn, "__esModule", { value: !0 });
const zc = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
yn.default = zc;
var ut = {};
Object.defineProperty(ut, "__esModule", { value: !0 });
ut.callRef = ut.getValidate = void 0;
const Hc = rr, Ss = K, ve = G, Pt = Ve, Ts = _e, cr = X, Wc = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: i, validateName: a, opts: l, self: p } = n, { root: u } = i;
    if ((r === "#" || r === "#/") && s === u.baseId)
      return g();
    const d = Ts.resolveRef.call(p, u, s, r);
    if (d === void 0)
      throw new Hc.default(n.opts.uriResolver, s, r);
    if (d instanceof Ts.SchemaEnv)
      return C(d);
    return j(d);
    function g() {
      if (i === u)
        return yr(e, a, i, i.$async);
      const E = t.scopeValue("root", { ref: u });
      return yr(e, (0, ve._)`${E}.validate`, u, u.$async);
    }
    function C(E) {
      const S = Si(e, E);
      yr(e, S, E, E.$async);
    }
    function j(E) {
      const S = t.scopeValue("schema", l.code.source === !0 ? { ref: E, code: (0, ve.stringify)(E) } : { ref: E }), v = t.name("valid"), y = e.subschema({
        schema: E,
        dataTypes: [],
        schemaPath: ve.nil,
        topSchemaRef: S,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(y), e.ok(v);
    }
  }
};
function Si(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, ve._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
ut.getValidate = Si;
function yr(e, t, r, n) {
  const { gen: s, it: i } = e, { allErrors: a, schemaEnv: l, opts: p } = i, u = p.passContext ? Pt.default.this : ve.nil;
  n ? d() : g();
  function d() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const E = s.let("valid");
    s.try(() => {
      s.code((0, ve._)`await ${(0, Ss.callValidateCode)(e, t, u)}`), j(t), a || s.assign(E, !0);
    }, (S) => {
      s.if((0, ve._)`!(${S} instanceof ${i.ValidationError})`, () => s.throw(S)), C(S), a || s.assign(E, !1);
    }), e.ok(E);
  }
  function g() {
    e.result((0, Ss.callValidateCode)(e, t, u), () => j(t), () => C(t));
  }
  function C(E) {
    const S = (0, ve._)`${E}.errors`;
    s.assign(Pt.default.vErrors, (0, ve._)`${Pt.default.vErrors} === null ? ${S} : ${Pt.default.vErrors}.concat(${S})`), s.assign(Pt.default.errors, (0, ve._)`${Pt.default.vErrors}.length`);
  }
  function j(E) {
    var S;
    if (!i.opts.unevaluated)
      return;
    const v = (S = r?.validate) === null || S === void 0 ? void 0 : S.evaluated;
    if (i.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (i.props = cr.mergeEvaluated.props(s, v.props, i.props));
      else {
        const y = s.var("props", (0, ve._)`${E}.evaluated.props`);
        i.props = cr.mergeEvaluated.props(s, y, i.props, ve.Name);
      }
    if (i.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (i.items = cr.mergeEvaluated.items(s, v.items, i.items));
      else {
        const y = s.var("items", (0, ve._)`${E}.evaluated.items`);
        i.items = cr.mergeEvaluated.items(s, y, i.items, ve.Name);
      }
  }
}
ut.callRef = yr;
ut.default = Wc;
Object.defineProperty(mn, "__esModule", { value: !0 });
const Kc = yn, Gc = ut, Bc = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Kc.default,
  Gc.default
];
mn.default = Bc;
var gn = {}, $n = {};
Object.defineProperty($n, "__esModule", { value: !0 });
const br = G, xe = br.operators, Pr = {
  maximum: { okStr: "<=", ok: xe.LTE, fail: xe.GT },
  minimum: { okStr: ">=", ok: xe.GTE, fail: xe.LT },
  exclusiveMaximum: { okStr: "<", ok: xe.LT, fail: xe.GTE },
  exclusiveMinimum: { okStr: ">", ok: xe.GT, fail: xe.LTE }
}, xc = {
  message: ({ keyword: e, schemaCode: t }) => (0, br.str)`must be ${Pr[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, br._)`{comparison: ${Pr[e].okStr}, limit: ${t}}`
}, Jc = {
  keyword: Object.keys(Pr),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: xc,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, br._)`${r} ${Pr[t].fail} ${n} || isNaN(${r})`);
  }
};
$n.default = Jc;
var vn = {};
Object.defineProperty(vn, "__esModule", { value: !0 });
const Bt = G, Yc = {
  message: ({ schemaCode: e }) => (0, Bt.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Bt._)`{multipleOf: ${e}}`
}, Zc = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Yc,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, i = s.opts.multipleOfPrecision, a = t.let("res"), l = i ? (0, Bt._)`Math.abs(Math.round(${a}) - ${a}) > 1e-${i}` : (0, Bt._)`${a} !== parseInt(${a})`;
    e.fail$data((0, Bt._)`(${n} === 0 || (${a} = ${r}/${n}, ${l}))`);
  }
};
vn.default = Zc;
var _n = {}, wn = {};
Object.defineProperty(wn, "__esModule", { value: !0 });
function Ti(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
wn.default = Ti;
Ti.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(_n, "__esModule", { value: !0 });
const it = G, Qc = X, Xc = wn, el = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, it.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, it._)`{limit: ${e}}`
}, tl = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: el,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, i = t === "maxLength" ? it.operators.GT : it.operators.LT, a = s.opts.unicode === !1 ? (0, it._)`${r}.length` : (0, it._)`${(0, Qc.useFunc)(e.gen, Xc.default)}(${r})`;
    e.fail$data((0, it._)`${a} ${i} ${n}`);
  }
};
_n.default = tl;
var bn = {};
Object.defineProperty(bn, "__esModule", { value: !0 });
const rl = K, Er = G, nl = {
  message: ({ schemaCode: e }) => (0, Er.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Er._)`{pattern: ${e}}`
}, sl = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: nl,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: i } = e, a = i.opts.unicodeRegExp ? "u" : "", l = r ? (0, Er._)`(new RegExp(${s}, ${a}))` : (0, rl.usePattern)(e, n);
    e.fail$data((0, Er._)`!${l}.test(${t})`);
  }
};
bn.default = sl;
var Pn = {};
Object.defineProperty(Pn, "__esModule", { value: !0 });
const xt = G, il = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, xt.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, xt._)`{limit: ${e}}`
}, al = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: il,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? xt.operators.GT : xt.operators.LT;
    e.fail$data((0, xt._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Pn.default = al;
var En = {};
Object.defineProperty(En, "__esModule", { value: !0 });
const Ht = K, Jt = G, ol = X, cl = {
  message: ({ params: { missingProperty: e } }) => (0, Jt.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Jt._)`{missingProperty: ${e}}`
}, ll = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: cl,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: i, it: a } = e, { opts: l } = a;
    if (!i && r.length === 0)
      return;
    const p = r.length >= l.loopRequired;
    if (a.allErrors ? u() : d(), l.strictRequired) {
      const j = e.parentSchema.properties, { definedProperties: E } = e.it;
      for (const S of r)
        if (j?.[S] === void 0 && !E.has(S)) {
          const v = a.schemaEnv.baseId + a.errSchemaPath, y = `required property "${S}" is not defined at "${v}" (strictRequired)`;
          (0, ol.checkStrictMode)(a, y, a.opts.strictRequired);
        }
    }
    function u() {
      if (p || i)
        e.block$data(Jt.nil, g);
      else
        for (const j of r)
          (0, Ht.checkReportMissingProp)(e, j);
    }
    function d() {
      const j = t.let("missing");
      if (p || i) {
        const E = t.let("valid", !0);
        e.block$data(E, () => C(j, E)), e.ok(E);
      } else
        t.if((0, Ht.checkMissingProp)(e, r, j)), (0, Ht.reportMissingProp)(e, j), t.else();
    }
    function g() {
      t.forOf("prop", n, (j) => {
        e.setParams({ missingProperty: j }), t.if((0, Ht.noPropertyInData)(t, s, j, l.ownProperties), () => e.error());
      });
    }
    function C(j, E) {
      e.setParams({ missingProperty: j }), t.forOf(j, n, () => {
        t.assign(E, (0, Ht.propertyInData)(t, s, j, l.ownProperties)), t.if((0, Jt.not)(E), () => {
          e.error(), t.break();
        });
      }, Jt.nil);
    }
  }
};
En.default = ll;
var Sn = {};
Object.defineProperty(Sn, "__esModule", { value: !0 });
const Yt = G, ul = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Yt.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Yt._)`{limit: ${e}}`
}, dl = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: ul,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Yt.operators.GT : Yt.operators.LT;
    e.fail$data((0, Yt._)`${r}.length ${s} ${n}`);
  }
};
Sn.default = dl;
var Tn = {}, nr = {};
Object.defineProperty(nr, "__esModule", { value: !0 });
const Ri = oi;
Ri.code = 'require("ajv/dist/runtime/equal").default';
nr.default = Ri;
Object.defineProperty(Tn, "__esModule", { value: !0 });
const qr = er, pe = G, fl = X, pl = nr, hl = {
  message: ({ params: { i: e, j: t } }) => (0, pe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, pe._)`{i: ${e}, j: ${t}}`
}, ml = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: hl,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: i, schemaCode: a, it: l } = e;
    if (!n && !s)
      return;
    const p = t.let("valid"), u = i.items ? (0, qr.getSchemaTypes)(i.items) : [];
    e.block$data(p, d, (0, pe._)`${a} === false`), e.ok(p);
    function d() {
      const E = t.let("i", (0, pe._)`${r}.length`), S = t.let("j");
      e.setParams({ i: E, j: S }), t.assign(p, !0), t.if((0, pe._)`${E} > 1`, () => (g() ? C : j)(E, S));
    }
    function g() {
      return u.length > 0 && !u.some((E) => E === "object" || E === "array");
    }
    function C(E, S) {
      const v = t.name("item"), y = (0, qr.checkDataTypes)(u, v, l.opts.strictNumbers, qr.DataType.Wrong), T = t.const("indices", (0, pe._)`{}`);
      t.for((0, pe._)`;${E}--;`, () => {
        t.let(v, (0, pe._)`${r}[${E}]`), t.if(y, (0, pe._)`continue`), u.length > 1 && t.if((0, pe._)`typeof ${v} == "string"`, (0, pe._)`${v} += "_"`), t.if((0, pe._)`typeof ${T}[${v}] == "number"`, () => {
          t.assign(S, (0, pe._)`${T}[${v}]`), e.error(), t.assign(p, !1).break();
        }).code((0, pe._)`${T}[${v}] = ${E}`);
      });
    }
    function j(E, S) {
      const v = (0, fl.useFunc)(t, pl.default), y = t.name("outer");
      t.label(y).for((0, pe._)`;${E}--;`, () => t.for((0, pe._)`${S} = ${E}; ${S}--;`, () => t.if((0, pe._)`${v}(${r}[${E}], ${r}[${S}])`, () => {
        e.error(), t.assign(p, !1).break(y);
      })));
    }
  }
};
Tn.default = ml;
var Rn = {};
Object.defineProperty(Rn, "__esModule", { value: !0 });
const xr = G, yl = X, gl = nr, $l = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, xr._)`{allowedValue: ${e}}`
}, vl = {
  keyword: "const",
  $data: !0,
  error: $l,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: i } = e;
    n || i && typeof i == "object" ? e.fail$data((0, xr._)`!${(0, yl.useFunc)(t, gl.default)}(${r}, ${s})`) : e.fail((0, xr._)`${i} !== ${r}`);
  }
};
Rn.default = vl;
var Nn = {};
Object.defineProperty(Nn, "__esModule", { value: !0 });
const Wt = G, _l = X, wl = nr, bl = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Wt._)`{allowedValues: ${e}}`
}, Pl = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: bl,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: i, it: a } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= a.opts.loopEnum;
    let p;
    const u = () => p ?? (p = (0, _l.useFunc)(t, wl.default));
    let d;
    if (l || n)
      d = t.let("valid"), e.block$data(d, g);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const j = t.const("vSchema", i);
      d = (0, Wt.or)(...s.map((E, S) => C(j, S)));
    }
    e.pass(d);
    function g() {
      t.assign(d, !1), t.forOf("v", i, (j) => t.if((0, Wt._)`${u()}(${r}, ${j})`, () => t.assign(d, !0).break()));
    }
    function C(j, E) {
      const S = s[E];
      return typeof S == "object" && S !== null ? (0, Wt._)`${u()}(${r}, ${j}[${E}])` : (0, Wt._)`${r} === ${S}`;
    }
  }
};
Nn.default = Pl;
Object.defineProperty(gn, "__esModule", { value: !0 });
const El = $n, Sl = vn, Tl = _n, Rl = bn, Nl = Pn, Ol = En, Cl = Sn, jl = Tn, kl = Rn, Il = Nn, Al = [
  // number
  El.default,
  Sl.default,
  // string
  Tl.default,
  Rl.default,
  // object
  Nl.default,
  Ol.default,
  // array
  Cl.default,
  jl.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  kl.default,
  Il.default
];
gn.default = Al;
var On = {}, Ct = {};
Object.defineProperty(Ct, "__esModule", { value: !0 });
Ct.validateAdditionalItems = void 0;
const at = G, Jr = X, Dl = {
  message: ({ params: { len: e } }) => (0, at.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, at._)`{limit: ${e}}`
}, Fl = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Dl,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Jr.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Ni(e, n);
  }
};
function Ni(e, t) {
  const { gen: r, schema: n, data: s, keyword: i, it: a } = e;
  a.items = !0;
  const l = r.const("len", (0, at._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, at._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Jr.alwaysValidSchema)(a, n)) {
    const u = r.var("valid", (0, at._)`${l} <= ${t.length}`);
    r.if((0, at.not)(u), () => p(u)), e.ok(u);
  }
  function p(u) {
    r.forRange("i", t.length, l, (d) => {
      e.subschema({ keyword: i, dataProp: d, dataPropType: Jr.Type.Num }, u), a.allErrors || r.if((0, at.not)(u), () => r.break());
    });
  }
}
Ct.validateAdditionalItems = Ni;
Ct.default = Fl;
var Cn = {}, jt = {};
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.validateTuple = void 0;
const Rs = G, gr = X, Ml = K, Ul = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Oi(e, "additionalItems", t);
    r.items = !0, !(0, gr.alwaysValidSchema)(r, t) && e.ok((0, Ml.validateArray)(e));
  }
};
function Oi(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: i, keyword: a, it: l } = e;
  d(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = gr.mergeEvaluated.items(n, r.length, l.items));
  const p = n.name("valid"), u = n.const("len", (0, Rs._)`${i}.length`);
  r.forEach((g, C) => {
    (0, gr.alwaysValidSchema)(l, g) || (n.if((0, Rs._)`${u} > ${C}`, () => e.subschema({
      keyword: a,
      schemaProp: C,
      dataProp: C
    }, p)), e.ok(p));
  });
  function d(g) {
    const { opts: C, errSchemaPath: j } = l, E = r.length, S = E === g.minItems && (E === g.maxItems || g[t] === !1);
    if (C.strictTuples && !S) {
      const v = `"${a}" is ${E}-tuple, but minItems or maxItems/${t} are not specified or different at path "${j}"`;
      (0, gr.checkStrictMode)(l, v, C.strictTuples);
    }
  }
}
jt.validateTuple = Oi;
jt.default = Ul;
Object.defineProperty(Cn, "__esModule", { value: !0 });
const Ll = jt, ql = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Ll.validateTuple)(e, "items")
};
Cn.default = ql;
var jn = {};
Object.defineProperty(jn, "__esModule", { value: !0 });
const Ns = G, Vl = X, zl = K, Hl = Ct, Wl = {
  message: ({ params: { len: e } }) => (0, Ns.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ns._)`{limit: ${e}}`
}, Kl = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Wl,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Vl.alwaysValidSchema)(n, t) && (s ? (0, Hl.validateAdditionalItems)(e, s) : e.ok((0, zl.validateArray)(e)));
  }
};
jn.default = Kl;
var kn = {};
Object.defineProperty(kn, "__esModule", { value: !0 });
const Se = G, lr = X, Gl = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Se.str)`must contain at least ${e} valid item(s)` : (0, Se.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Se._)`{minContains: ${e}}` : (0, Se._)`{minContains: ${e}, maxContains: ${t}}`
}, Bl = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Gl,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: i } = e;
    let a, l;
    const { minContains: p, maxContains: u } = n;
    i.opts.next ? (a = p === void 0 ? 1 : p, l = u) : a = 1;
    const d = t.const("len", (0, Se._)`${s}.length`);
    if (e.setParams({ min: a, max: l }), l === void 0 && a === 0) {
      (0, lr.checkStrictMode)(i, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && a > l) {
      (0, lr.checkStrictMode)(i, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, lr.alwaysValidSchema)(i, r)) {
      let S = (0, Se._)`${d} >= ${a}`;
      l !== void 0 && (S = (0, Se._)`${S} && ${d} <= ${l}`), e.pass(S);
      return;
    }
    i.items = !0;
    const g = t.name("valid");
    l === void 0 && a === 1 ? j(g, () => t.if(g, () => t.break())) : a === 0 ? (t.let(g, !0), l !== void 0 && t.if((0, Se._)`${s}.length > 0`, C)) : (t.let(g, !1), C()), e.result(g, () => e.reset());
    function C() {
      const S = t.name("_valid"), v = t.let("count", 0);
      j(S, () => t.if(S, () => E(v)));
    }
    function j(S, v) {
      t.forRange("i", 0, d, (y) => {
        e.subschema({
          keyword: "contains",
          dataProp: y,
          dataPropType: lr.Type.Num,
          compositeRule: !0
        }, S), v();
      });
    }
    function E(S) {
      t.code((0, Se._)`${S}++`), l === void 0 ? t.if((0, Se._)`${S} >= ${a}`, () => t.assign(g, !0).break()) : (t.if((0, Se._)`${S} > ${l}`, () => t.assign(g, !1).break()), a === 1 ? t.assign(g, !0) : t.if((0, Se._)`${S} >= ${a}`, () => t.assign(g, !0)));
    }
  }
};
kn.default = Bl;
var Ci = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = G, r = X, n = K;
  e.error = {
    message: ({ params: { property: p, depsCount: u, deps: d } }) => {
      const g = u === 1 ? "property" : "properties";
      return (0, t.str)`must have ${g} ${d} when property ${p} is present`;
    },
    params: ({ params: { property: p, depsCount: u, deps: d, missingProperty: g } }) => (0, t._)`{property: ${p},
    missingProperty: ${g},
    depsCount: ${u},
    deps: ${d}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(p) {
      const [u, d] = i(p);
      a(p, u), l(p, d);
    }
  };
  function i({ schema: p }) {
    const u = {}, d = {};
    for (const g in p) {
      if (g === "__proto__")
        continue;
      const C = Array.isArray(p[g]) ? u : d;
      C[g] = p[g];
    }
    return [u, d];
  }
  function a(p, u = p.schema) {
    const { gen: d, data: g, it: C } = p;
    if (Object.keys(u).length === 0)
      return;
    const j = d.let("missing");
    for (const E in u) {
      const S = u[E];
      if (S.length === 0)
        continue;
      const v = (0, n.propertyInData)(d, g, E, C.opts.ownProperties);
      p.setParams({
        property: E,
        depsCount: S.length,
        deps: S.join(", ")
      }), C.allErrors ? d.if(v, () => {
        for (const y of S)
          (0, n.checkReportMissingProp)(p, y);
      }) : (d.if((0, t._)`${v} && (${(0, n.checkMissingProp)(p, S, j)})`), (0, n.reportMissingProp)(p, j), d.else());
    }
  }
  e.validatePropertyDeps = a;
  function l(p, u = p.schema) {
    const { gen: d, data: g, keyword: C, it: j } = p, E = d.name("valid");
    for (const S in u)
      (0, r.alwaysValidSchema)(j, u[S]) || (d.if(
        (0, n.propertyInData)(d, g, S, j.opts.ownProperties),
        () => {
          const v = p.subschema({ keyword: C, schemaProp: S }, E);
          p.mergeValidEvaluated(v, E);
        },
        () => d.var(E, !0)
        // TODO var
      ), p.ok(E));
  }
  e.validateSchemaDeps = l, e.default = s;
})(Ci);
var In = {};
Object.defineProperty(In, "__esModule", { value: !0 });
const ji = G, xl = X, Jl = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, ji._)`{propertyName: ${e.propertyName}}`
}, Yl = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Jl,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, xl.alwaysValidSchema)(s, r))
      return;
    const i = t.name("valid");
    t.forIn("key", n, (a) => {
      e.setParams({ propertyName: a }), e.subschema({
        keyword: "propertyNames",
        data: a,
        dataTypes: ["string"],
        propertyName: a,
        compositeRule: !0
      }, i), t.if((0, ji.not)(i), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(i);
  }
};
In.default = Yl;
var Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
const ur = K, Re = G, Zl = Ve, dr = X, Ql = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Re._)`{additionalProperty: ${e.additionalProperty}}`
}, Xl = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Ql,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: i, it: a } = e;
    if (!i)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: p } = a;
    if (a.props = !0, p.removeAdditional !== "all" && (0, dr.alwaysValidSchema)(a, r))
      return;
    const u = (0, ur.allSchemaProperties)(n.properties), d = (0, ur.allSchemaProperties)(n.patternProperties);
    g(), e.ok((0, Re._)`${i} === ${Zl.default.errors}`);
    function g() {
      t.forIn("key", s, (v) => {
        !u.length && !d.length ? E(v) : t.if(C(v), () => E(v));
      });
    }
    function C(v) {
      let y;
      if (u.length > 8) {
        const T = (0, dr.schemaRefOrVal)(a, n.properties, "properties");
        y = (0, ur.isOwnProperty)(t, T, v);
      } else
        u.length ? y = (0, Re.or)(...u.map((T) => (0, Re._)`${v} === ${T}`)) : y = Re.nil;
      return d.length && (y = (0, Re.or)(y, ...d.map((T) => (0, Re._)`${(0, ur.usePattern)(e, T)}.test(${v})`))), (0, Re.not)(y);
    }
    function j(v) {
      t.code((0, Re._)`delete ${s}[${v}]`);
    }
    function E(v) {
      if (p.removeAdditional === "all" || p.removeAdditional && r === !1) {
        j(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, dr.alwaysValidSchema)(a, r)) {
        const y = t.name("valid");
        p.removeAdditional === "failing" ? (S(v, y, !1), t.if((0, Re.not)(y), () => {
          e.reset(), j(v);
        })) : (S(v, y), l || t.if((0, Re.not)(y), () => t.break()));
      }
    }
    function S(v, y, T) {
      const R = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: dr.Type.Str
      };
      T === !1 && Object.assign(R, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(R, y);
    }
  }
};
Ar.default = Xl;
var An = {};
Object.defineProperty(An, "__esModule", { value: !0 });
const eu = Oe, Os = K, Vr = X, Cs = Ar, tu = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: i } = e;
    i.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Cs.default.code(new eu.KeywordCxt(i, Cs.default, "additionalProperties"));
    const a = (0, Os.allSchemaProperties)(r);
    for (const g of a)
      i.definedProperties.add(g);
    i.opts.unevaluated && a.length && i.props !== !0 && (i.props = Vr.mergeEvaluated.props(t, (0, Vr.toHash)(a), i.props));
    const l = a.filter((g) => !(0, Vr.alwaysValidSchema)(i, r[g]));
    if (l.length === 0)
      return;
    const p = t.name("valid");
    for (const g of l)
      u(g) ? d(g) : (t.if((0, Os.propertyInData)(t, s, g, i.opts.ownProperties)), d(g), i.allErrors || t.else().var(p, !0), t.endIf()), e.it.definedProperties.add(g), e.ok(p);
    function u(g) {
      return i.opts.useDefaults && !i.compositeRule && r[g].default !== void 0;
    }
    function d(g) {
      e.subschema({
        keyword: "properties",
        schemaProp: g,
        dataProp: g
      }, p);
    }
  }
};
An.default = tu;
var Dn = {};
Object.defineProperty(Dn, "__esModule", { value: !0 });
const js = K, fr = G, ks = X, Is = X, ru = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: i } = e, { opts: a } = i, l = (0, js.allSchemaProperties)(r), p = l.filter((S) => (0, ks.alwaysValidSchema)(i, r[S]));
    if (l.length === 0 || p.length === l.length && (!i.opts.unevaluated || i.props === !0))
      return;
    const u = a.strictSchema && !a.allowMatchingProperties && s.properties, d = t.name("valid");
    i.props !== !0 && !(i.props instanceof fr.Name) && (i.props = (0, Is.evaluatedPropsToName)(t, i.props));
    const { props: g } = i;
    C();
    function C() {
      for (const S of l)
        u && j(S), i.allErrors ? E(S) : (t.var(d, !0), E(S), t.if(d));
    }
    function j(S) {
      for (const v in u)
        new RegExp(S).test(v) && (0, ks.checkStrictMode)(i, `property ${v} matches pattern ${S} (use allowMatchingProperties)`);
    }
    function E(S) {
      t.forIn("key", n, (v) => {
        t.if((0, fr._)`${(0, js.usePattern)(e, S)}.test(${v})`, () => {
          const y = p.includes(S);
          y || e.subschema({
            keyword: "patternProperties",
            schemaProp: S,
            dataProp: v,
            dataPropType: Is.Type.Str
          }, d), i.opts.unevaluated && g !== !0 ? t.assign((0, fr._)`${g}[${v}]`, !0) : !y && !i.allErrors && t.if((0, fr.not)(d), () => t.break());
        });
      });
    }
  }
};
Dn.default = ru;
var Fn = {};
Object.defineProperty(Fn, "__esModule", { value: !0 });
const nu = X, su = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, nu.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
Fn.default = su;
var Mn = {};
Object.defineProperty(Mn, "__esModule", { value: !0 });
const iu = K, au = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: iu.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Mn.default = au;
var Un = {};
Object.defineProperty(Un, "__esModule", { value: !0 });
const $r = G, ou = X, cu = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, $r._)`{passingSchemas: ${e.passing}}`
}, lu = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: cu,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const i = r, a = t.let("valid", !1), l = t.let("passing", null), p = t.name("_valid");
    e.setParams({ passing: l }), t.block(u), e.result(a, () => e.reset(), () => e.error(!0));
    function u() {
      i.forEach((d, g) => {
        let C;
        (0, ou.alwaysValidSchema)(s, d) ? t.var(p, !0) : C = e.subschema({
          keyword: "oneOf",
          schemaProp: g,
          compositeRule: !0
        }, p), g > 0 && t.if((0, $r._)`${p} && ${a}`).assign(a, !1).assign(l, (0, $r._)`[${l}, ${g}]`).else(), t.if(p, () => {
          t.assign(a, !0), t.assign(l, g), C && e.mergeEvaluated(C, $r.Name);
        });
      });
    }
  }
};
Un.default = lu;
var Ln = {};
Object.defineProperty(Ln, "__esModule", { value: !0 });
const uu = X, du = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((i, a) => {
      if ((0, uu.alwaysValidSchema)(n, i))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: a }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
Ln.default = du;
var qn = {};
Object.defineProperty(qn, "__esModule", { value: !0 });
const Sr = G, ki = X, fu = {
  message: ({ params: e }) => (0, Sr.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Sr._)`{failingKeyword: ${e.ifClause}}`
}, pu = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: fu,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, ki.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = As(n, "then"), i = As(n, "else");
    if (!s && !i)
      return;
    const a = t.let("valid", !0), l = t.name("_valid");
    if (p(), e.reset(), s && i) {
      const d = t.let("ifClause");
      e.setParams({ ifClause: d }), t.if(l, u("then", d), u("else", d));
    } else
      s ? t.if(l, u("then")) : t.if((0, Sr.not)(l), u("else"));
    e.pass(a, () => e.error(!0));
    function p() {
      const d = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(d);
    }
    function u(d, g) {
      return () => {
        const C = e.subschema({ keyword: d }, l);
        t.assign(a, l), e.mergeValidEvaluated(C, a), g ? t.assign(g, (0, Sr._)`${d}`) : e.setParams({ ifClause: d });
      };
    }
  }
};
function As(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, ki.alwaysValidSchema)(e, r);
}
qn.default = pu;
var Vn = {};
Object.defineProperty(Vn, "__esModule", { value: !0 });
const hu = X, mu = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, hu.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Vn.default = mu;
Object.defineProperty(On, "__esModule", { value: !0 });
const yu = Ct, gu = Cn, $u = jt, vu = jn, _u = kn, wu = Ci, bu = In, Pu = Ar, Eu = An, Su = Dn, Tu = Fn, Ru = Mn, Nu = Un, Ou = Ln, Cu = qn, ju = Vn;
function ku(e = !1) {
  const t = [
    // any
    Tu.default,
    Ru.default,
    Nu.default,
    Ou.default,
    Cu.default,
    ju.default,
    // object
    bu.default,
    Pu.default,
    wu.default,
    Eu.default,
    Su.default
  ];
  return e ? t.push(gu.default, vu.default) : t.push(yu.default, $u.default), t.push(_u.default), t;
}
On.default = ku;
var zn = {}, Hn = {};
Object.defineProperty(Hn, "__esModule", { value: !0 });
const ue = G, Iu = {
  message: ({ schemaCode: e }) => (0, ue.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, ue._)`{format: ${e}}`
}, Au = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Iu,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: i, schemaCode: a, it: l } = e, { opts: p, errSchemaPath: u, schemaEnv: d, self: g } = l;
    if (!p.validateFormats)
      return;
    s ? C() : j();
    function C() {
      const E = r.scopeValue("formats", {
        ref: g.formats,
        code: p.code.formats
      }), S = r.const("fDef", (0, ue._)`${E}[${a}]`), v = r.let("fType"), y = r.let("format");
      r.if((0, ue._)`typeof ${S} == "object" && !(${S} instanceof RegExp)`, () => r.assign(v, (0, ue._)`${S}.type || "string"`).assign(y, (0, ue._)`${S}.validate`), () => r.assign(v, (0, ue._)`"string"`).assign(y, S)), e.fail$data((0, ue.or)(T(), R()));
      function T() {
        return p.strictSchema === !1 ? ue.nil : (0, ue._)`${a} && !${y}`;
      }
      function R() {
        const k = d.$async ? (0, ue._)`(${S}.async ? await ${y}(${n}) : ${y}(${n}))` : (0, ue._)`${y}(${n})`, D = (0, ue._)`(typeof ${y} == "function" ? ${k} : ${y}.test(${n}))`;
        return (0, ue._)`${y} && ${y} !== true && ${v} === ${t} && !${D}`;
      }
    }
    function j() {
      const E = g.formats[i];
      if (!E) {
        T();
        return;
      }
      if (E === !0)
        return;
      const [S, v, y] = R(E);
      S === t && e.pass(k());
      function T() {
        if (p.strictSchema === !1) {
          g.logger.warn(D());
          return;
        }
        throw new Error(D());
        function D() {
          return `unknown format "${i}" ignored in schema at path "${u}"`;
        }
      }
      function R(D) {
        const _ = D instanceof RegExp ? (0, ue.regexpCode)(D) : p.code.formats ? (0, ue._)`${p.code.formats}${(0, ue.getProperty)(i)}` : void 0, N = r.scopeValue("formats", { key: i, ref: D, code: _ });
        return typeof D == "object" && !(D instanceof RegExp) ? [D.type || "string", D.validate, (0, ue._)`${N}.validate`] : ["string", D, N];
      }
      function k() {
        if (typeof E == "object" && !(E instanceof RegExp) && E.async) {
          if (!d.$async)
            throw new Error("async format in sync schema");
          return (0, ue._)`await ${y}(${n})`;
        }
        return typeof v == "function" ? (0, ue._)`${y}(${n})` : (0, ue._)`${y}.test(${n})`;
      }
    }
  }
};
Hn.default = Au;
Object.defineProperty(zn, "__esModule", { value: !0 });
const Du = Hn, Fu = [Du.default];
zn.default = Fu;
var Ot = {};
Object.defineProperty(Ot, "__esModule", { value: !0 });
Ot.contentVocabulary = Ot.metadataVocabulary = void 0;
Ot.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Ot.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(hn, "__esModule", { value: !0 });
const Mu = mn, Uu = gn, Lu = On, qu = zn, Ds = Ot, Vu = [
  Mu.default,
  Uu.default,
  (0, Lu.default)(),
  qu.default,
  Ds.metadataVocabulary,
  Ds.contentVocabulary
];
hn.default = Vu;
var Wn = {}, Ii = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.DiscrError = void 0, function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  }(e.DiscrError || (e.DiscrError = {}));
})(Ii);
Object.defineProperty(Wn, "__esModule", { value: !0 });
const Et = G, Yr = Ii, Fs = _e, zu = X, Hu = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Yr.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, Et._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, Wu = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Hu,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: i } = e, { oneOf: a } = s;
    if (!i.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const l = n.propertyName;
    if (typeof l != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!a)
      throw new Error("discriminator: requires oneOf keyword");
    const p = t.let("valid", !1), u = t.const("tag", (0, Et._)`${r}${(0, Et.getProperty)(l)}`);
    t.if((0, Et._)`typeof ${u} == "string"`, () => d(), () => e.error(!1, { discrError: Yr.DiscrError.Tag, tag: u, tagName: l })), e.ok(p);
    function d() {
      const j = C();
      t.if(!1);
      for (const E in j)
        t.elseIf((0, Et._)`${u} === ${E}`), t.assign(p, g(j[E]));
      t.else(), e.error(!1, { discrError: Yr.DiscrError.Mapping, tag: u, tagName: l }), t.endIf();
    }
    function g(j) {
      const E = t.name("valid"), S = e.subschema({ keyword: "oneOf", schemaProp: j }, E);
      return e.mergeEvaluated(S, Et.Name), E;
    }
    function C() {
      var j;
      const E = {}, S = y(s);
      let v = !0;
      for (let k = 0; k < a.length; k++) {
        let D = a[k];
        D?.$ref && !(0, zu.schemaHasRulesButRef)(D, i.self.RULES) && (D = Fs.resolveRef.call(i.self, i.schemaEnv.root, i.baseId, D?.$ref), D instanceof Fs.SchemaEnv && (D = D.schema));
        const _ = (j = D?.properties) === null || j === void 0 ? void 0 : j[l];
        if (typeof _ != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        v = v && (S || y(D)), T(_, k);
      }
      if (!v)
        throw new Error(`discriminator: "${l}" must be required`);
      return E;
      function y({ required: k }) {
        return Array.isArray(k) && k.includes(l);
      }
      function T(k, D) {
        if (k.const)
          R(k.const, D);
        else if (k.enum)
          for (const _ of k.enum)
            R(_, D);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function R(k, D) {
        if (typeof k != "string" || k in E)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        E[k] = D;
      }
    }
  }
};
Wn.default = Wu;
const Ku = "http://json-schema.org/draft-07/schema#", Gu = "http://json-schema.org/draft-07/schema#", Bu = "Core schema meta-schema", xu = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Ju = [
  "object",
  "boolean"
], Yu = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, Zu = {
  $schema: Ku,
  $id: Gu,
  title: Bu,
  definitions: xu,
  type: Ju,
  properties: Yu,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  const r = Xs, n = hn, s = Wn, i = Zu, a = ["/properties"], l = "http://json-schema.org/draft-07/schema";
  class p extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((E) => this.addVocabulary(E)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const E = this.opts.$data ? this.$dataMetaSchema(i, a) : i;
      this.addMetaSchema(E, l, !1), this.refs["http://json-schema.org/schema"] = l;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
    }
  }
  e.exports = t = p, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = p;
  var u = Oe;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return u.KeywordCxt;
  } });
  var d = G;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var g = tr;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return g.default;
  } });
  var C = rr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return C.default;
  } });
})(Wr, Wr.exports);
var Qu = Wr.exports;
const Xu = /* @__PURE__ */ ao(Qu), ed = "http://json-schema.org/schema", td = "#/definitions/Blueprint", rd = {
  Blueprint: {
    type: "object",
    properties: {
      landingPage: {
        type: "string",
        description: "The URL to navigate to after the blueprint has been run."
      },
      preferredVersions: {
        type: "object",
        properties: {
          php: {
            anyOf: [
              {
                $ref: "#/definitions/SupportedPHPVersion"
              },
              {
                type: "string",
                const: "latest"
              }
            ],
            description: "The preferred PHP version to use. If not specified, the latest supported version will be used"
          },
          wp: {
            type: "string",
            description: "The preferred WordPress version to use. If not specified, the latest supported version will be used"
          }
        },
        required: [
          "php",
          "wp"
        ],
        additionalProperties: !1,
        description: "The preferred PHP and WordPress versions to use."
      },
      steps: {
        type: "array",
        items: {
          anyOf: [
            {
              $ref: "#/definitions/StepDefinition"
            },
            {
              type: "string"
            },
            {
              not: {}
            },
            {
              type: "boolean",
              const: !1
            },
            {
              type: "null"
            }
          ]
        },
        description: "The steps to run."
      },
      $schema: {
        type: "string"
      }
    },
    additionalProperties: !1
  },
  SupportedPHPVersion: {
    type: "string",
    enum: [
      "8.2",
      "8.1",
      "8.0",
      "7.4",
      "7.3",
      "7.2",
      "7.1",
      "7.0",
      "5.6"
    ]
  },
  StepDefinition: {
    type: "object",
    discriminator: {
      propertyName: "step"
    },
    required: [
      "step"
    ],
    oneOf: [
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "activatePlugin"
          },
          pluginPath: {
            type: "string"
          },
          pluginName: {
            type: "string"
          }
        },
        required: [
          "pluginPath",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "activateTheme"
          },
          themeFolderName: {
            type: "string"
          }
        },
        required: [
          "step",
          "themeFolderName"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "applyWordPressPatches"
          },
          siteUrl: {
            type: "string"
          },
          wordpressPath: {
            type: "string"
          },
          addPhpInfo: {
            type: "boolean"
          },
          patchSecrets: {
            type: "boolean"
          },
          disableSiteHealth: {
            type: "boolean"
          },
          disableWpNewBlogNotification: {
            type: "boolean"
          }
        },
        required: [
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "cp"
          },
          fromPath: {
            type: "string"
          },
          toPath: {
            type: "string"
          }
        },
        required: [
          "fromPath",
          "step",
          "toPath"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "defineWpConfigConsts"
          },
          consts: {
            type: "object",
            additionalProperties: {},
            description: "The constants to define"
          },
          virtualize: {
            type: "boolean",
            description: "Enables the virtualization of wp-config.php and playground-consts.json files, leaving the local system files untouched. The variables defined in the /vfs-blueprints/playground-consts.json file are loaded via the auto_prepend_file directive in the php.ini file.",
            default: !1
          }
        },
        required: [
          "consts",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "defineSiteUrl"
          },
          siteUrl: {
            type: "string"
          }
        },
        required: [
          "siteUrl",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "importFile"
          },
          file: {
            $ref: "#/definitions/FileReference"
          }
        },
        required: [
          "file",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "installPlugin",
            description: "The step identifier."
          },
          pluginZipFile: {
            $ref: "#/definitions/FileReference",
            description: "The plugin zip file to install."
          },
          options: {
            $ref: "#/definitions/InstallPluginOptions",
            description: "Optional installation options."
          }
        },
        required: [
          "pluginZipFile",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "installTheme",
            description: "The step identifier."
          },
          themeZipFile: {
            $ref: "#/definitions/FileReference",
            description: "The theme zip file to install."
          },
          options: {
            type: "object",
            properties: {
              activate: {
                type: "boolean",
                description: "Whether to activate the theme after installing it."
              }
            },
            additionalProperties: !1,
            description: "Optional installation options."
          }
        },
        required: [
          "step",
          "themeZipFile"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "login"
          },
          username: {
            type: "string",
            description: "The user to log in as. Defaults to 'admin'."
          },
          password: {
            type: "string",
            description: "The password to log in with. Defaults to 'password'."
          }
        },
        required: [
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "mkdir"
          },
          path: {
            type: "string"
          }
        },
        required: [
          "path",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "mv"
          },
          fromPath: {
            type: "string"
          },
          toPath: {
            type: "string"
          }
        },
        required: [
          "fromPath",
          "step",
          "toPath"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "request"
          },
          request: {
            $ref: "#/definitions/PHPRequest"
          }
        },
        required: [
          "request",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "replaceSite"
          },
          fullSiteZip: {
            $ref: "#/definitions/FileReference"
          }
        },
        required: [
          "fullSiteZip",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "rm"
          },
          path: {
            type: "string"
          }
        },
        required: [
          "path",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "rmdir"
          },
          path: {
            type: "string"
          }
        },
        required: [
          "path",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "runPHP",
            description: "The step identifier."
          },
          code: {
            type: "string",
            description: "The PHP code to run."
          }
        },
        required: [
          "code",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "runPHPWithOptions"
          },
          options: {
            $ref: "#/definitions/PHPRunOptions"
          }
        },
        required: [
          "options",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "runWpInstallationWizard"
          },
          options: {
            $ref: "#/definitions/WordPressInstallationOptions"
          }
        },
        required: [
          "options",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "setPhpIniEntry"
          },
          key: {
            type: "string"
          },
          value: {
            type: "string"
          }
        },
        required: [
          "key",
          "step",
          "value"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "setSiteOptions",
            description: 'The name of the step. Must be "setSiteOptions".'
          },
          options: {
            type: "object",
            additionalProperties: {},
            description: "The options to set on the site."
          }
        },
        required: [
          "options",
          "step"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "unzip"
          },
          zipPath: {
            type: "string"
          },
          extractToPath: {
            type: "string"
          }
        },
        required: [
          "extractToPath",
          "step",
          "zipPath"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "updateUserMeta"
          },
          meta: {
            type: "object",
            additionalProperties: {}
          },
          userId: {
            type: "number"
          }
        },
        required: [
          "meta",
          "step",
          "userId"
        ]
      },
      {
        type: "object",
        additionalProperties: !1,
        properties: {
          progress: {
            type: "object",
            properties: {
              weight: {
                type: "number"
              },
              caption: {
                type: "string"
              }
            },
            additionalProperties: !1
          },
          step: {
            type: "string",
            const: "writeFile"
          },
          path: {
            type: "string"
          },
          data: {
            anyOf: [
              {
                $ref: "#/definitions/FileReference"
              },
              {
                type: "string"
              },
              {
                type: "object",
                properties: {
                  BYTES_PER_ELEMENT: {
                    type: "number"
                  },
                  buffer: {
                    type: "object",
                    properties: {
                      byteLength: {
                        type: "number"
                      }
                    },
                    required: [
                      "byteLength"
                    ],
                    additionalProperties: !1
                  },
                  byteLength: {
                    type: "number"
                  },
                  byteOffset: {
                    type: "number"
                  },
                  length: {
                    type: "number"
                  }
                },
                required: [
                  "BYTES_PER_ELEMENT",
                  "buffer",
                  "byteLength",
                  "byteOffset",
                  "length"
                ],
                additionalProperties: {
                  type: "number"
                }
              }
            ]
          }
        },
        required: [
          "data",
          "path",
          "step"
        ]
      }
    ]
  },
  FileReference: {
    anyOf: [
      {
        $ref: "#/definitions/VFSReference"
      },
      {
        $ref: "#/definitions/LiteralReference"
      },
      {
        $ref: "#/definitions/CoreThemeReference"
      },
      {
        $ref: "#/definitions/CorePluginReference"
      },
      {
        $ref: "#/definitions/UrlReference"
      }
    ]
  },
  VFSReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "vfs",
        description: "Identifies the file resource as Virtual File System (VFS)"
      },
      path: {
        type: "string",
        description: "The path to the file in the VFS"
      }
    },
    required: [
      "resource",
      "path"
    ],
    additionalProperties: !1
  },
  LiteralReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "literal",
        description: "Identifies the file resource as a literal file"
      },
      name: {
        type: "string",
        description: "The name of the file"
      },
      contents: {
        anyOf: [
          {
            type: "string"
          },
          {
            type: "object",
            properties: {
              BYTES_PER_ELEMENT: {
                type: "number"
              },
              buffer: {
                type: "object",
                properties: {
                  byteLength: {
                    type: "number"
                  }
                },
                required: [
                  "byteLength"
                ],
                additionalProperties: !1
              },
              byteLength: {
                type: "number"
              },
              byteOffset: {
                type: "number"
              },
              length: {
                type: "number"
              }
            },
            required: [
              "BYTES_PER_ELEMENT",
              "buffer",
              "byteLength",
              "byteOffset",
              "length"
            ],
            additionalProperties: {
              type: "number"
            }
          }
        ],
        description: "The contents of the file"
      }
    },
    required: [
      "resource",
      "name",
      "contents"
    ],
    additionalProperties: !1
  },
  CoreThemeReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "wordpress.org/themes",
        description: "Identifies the file resource as a WordPress Core theme"
      },
      slug: {
        type: "string",
        description: "The slug of the WordPress Core theme"
      }
    },
    required: [
      "resource",
      "slug"
    ],
    additionalProperties: !1
  },
  CorePluginReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "wordpress.org/plugins",
        description: "Identifies the file resource as a WordPress Core plugin"
      },
      slug: {
        type: "string",
        description: "The slug of the WordPress Core plugin"
      }
    },
    required: [
      "resource",
      "slug"
    ],
    additionalProperties: !1
  },
  UrlReference: {
    type: "object",
    properties: {
      resource: {
        type: "string",
        const: "url",
        description: "Identifies the file resource as a URL"
      },
      url: {
        type: "string",
        description: "The URL of the file"
      },
      caption: {
        type: "string",
        description: "Optional caption for displaying a progress message"
      }
    },
    required: [
      "resource",
      "url"
    ],
    additionalProperties: !1
  },
  InstallPluginOptions: {
    type: "object",
    properties: {
      activate: {
        type: "boolean",
        description: "Whether to activate the plugin after installing it."
      }
    },
    additionalProperties: !1
  },
  PHPRequest: {
    type: "object",
    properties: {
      method: {
        $ref: "#/definitions/HTTPMethod",
        description: "Request method. Default: `GET`."
      },
      url: {
        type: "string",
        description: "Request path or absolute URL."
      },
      headers: {
        $ref: "#/definitions/PHPRequestHeaders",
        description: "Request headers."
      },
      files: {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            size: {
              type: "number"
            },
            type: {
              type: "string"
            },
            lastModified: {
              type: "number"
            },
            name: {
              type: "string"
            },
            webkitRelativePath: {
              type: "string"
            }
          },
          required: [
            "lastModified",
            "name",
            "size",
            "type",
            "webkitRelativePath"
          ],
          additionalProperties: !1
        },
        description: "Uploaded files"
      },
      body: {
        type: "string",
        description: "Request body without the files."
      },
      formData: {
        type: "object",
        additionalProperties: {},
        description: "Form data. If set, the request body will be ignored and the content-type header will be set to `application/x-www-form-urlencoded`."
      }
    },
    required: [
      "url"
    ],
    additionalProperties: !1
  },
  HTTPMethod: {
    type: "string",
    enum: [
      "GET",
      "POST",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "PUT",
      "DELETE"
    ]
  },
  PHPRequestHeaders: {
    type: "object",
    additionalProperties: {
      type: "string"
    }
  },
  PHPRunOptions: {
    type: "object",
    properties: {
      relativeUri: {
        type: "string",
        description: "Request path following the domain:port part."
      },
      scriptPath: {
        type: "string",
        description: "Path of the .php file to execute."
      },
      protocol: {
        type: "string",
        description: "Request protocol."
      },
      method: {
        $ref: "#/definitions/HTTPMethod",
        description: "Request method. Default: `GET`."
      },
      headers: {
        $ref: "#/definitions/PHPRequestHeaders",
        description: "Request headers."
      },
      body: {
        type: "string",
        description: "Request body without the files."
      },
      fileInfos: {
        type: "array",
        items: {
          $ref: "#/definitions/FileInfo"
        },
        description: "Uploaded files."
      },
      code: {
        type: "string",
        description: "The code snippet to eval instead of a php file."
      }
    },
    additionalProperties: !1
  },
  FileInfo: {
    type: "object",
    properties: {
      key: {
        type: "string"
      },
      name: {
        type: "string"
      },
      type: {
        type: "string"
      },
      data: {
        type: "object",
        properties: {
          BYTES_PER_ELEMENT: {
            type: "number"
          },
          buffer: {
            type: "object",
            properties: {
              byteLength: {
                type: "number"
              }
            },
            required: [
              "byteLength"
            ],
            additionalProperties: !1
          },
          byteLength: {
            type: "number"
          },
          byteOffset: {
            type: "number"
          },
          length: {
            type: "number"
          }
        },
        required: [
          "BYTES_PER_ELEMENT",
          "buffer",
          "byteLength",
          "byteOffset",
          "length"
        ],
        additionalProperties: {
          type: "number"
        }
      }
    },
    required: [
      "key",
      "name",
      "type",
      "data"
    ],
    additionalProperties: !1
  },
  WordPressInstallationOptions: {
    type: "object",
    properties: {
      adminUsername: {
        type: "string"
      },
      adminPassword: {
        type: "string"
      }
    },
    additionalProperties: !1
  }
}, nd = {
  $schema: ed,
  $ref: td,
  definitions: rd
}, sd = [
  "6.2",
  "6.1",
  "6.0",
  "5.9",
  "nightly"
];
function id(e, {
  progress: t = new Cr(),
  semaphore: r = new Gs({ concurrency: 3 }),
  onStepCompleted: n = () => {
  }
} = {}) {
  e = {
    ...e,
    steps: (e.steps || []).filter(cd)
  };
  const { valid: s, errors: i } = od(e);
  if (!s) {
    const u = new Error(
      `Invalid blueprint: ${i[0].message} at ${i[0].instancePath}`
    );
    throw u.errors = i, u;
  }
  const a = e.steps || [], l = a.reduce(
    (u, d) => u + (d.progress?.weight || 1),
    0
  ), p = a.map(
    (u) => ld(u, {
      semaphore: r,
      rootProgressTracker: t,
      totalProgressWeight: l
    })
  );
  return {
    versions: {
      php: Ms(
        e.preferredVersions?.php,
        nn,
        Ua
      ),
      wp: Ms(
        e.preferredVersions?.wp,
        sd,
        "6.2"
      )
    },
    run: async (u) => {
      try {
        for (const { resources: d } of p)
          for (const g of d)
            g.setPlayground(u), g.isAsync && g.resolve();
        for (const { run: d, step: g } of p) {
          const C = await d(u);
          n(C, g);
        }
        try {
          await u.goTo(
            e.landingPage || "/"
          );
        } catch {
        }
      } finally {
        t.finish();
      }
    }
  };
}
const ad = new Xu({ discriminator: !0 });
let pr;
function od(e) {
  pr = ad.compile(nd);
  const t = pr(e);
  if (t)
    return { valid: t };
  const r = /* @__PURE__ */ new Set();
  for (const s of pr.errors)
    s.schemaPath.startsWith("#/properties/steps/items/anyOf") || r.add(s.instancePath);
  const n = pr.errors?.filter(
    (s) => !(s.schemaPath.startsWith("#/properties/steps/items/anyOf") && r.has(s.instancePath))
  );
  return {
    valid: t,
    errors: n
  };
}
function Ms(e, t, r) {
  return e && t.includes(e) ? e : r;
}
function cd(e) {
  return !!(typeof e == "object" && e);
}
function ld(e, {
  semaphore: t,
  rootProgressTracker: r,
  totalProgressWeight: n
}) {
  const s = r.stage(
    (e.progress?.weight || 1) / n
  ), i = {};
  for (const d of Object.keys(e)) {
    let g = e[d];
    Ya(g) && (g = dt.create(g, {
      semaphore: t
    })), i[d] = g;
  }
  const a = async (d) => {
    try {
      return s.fillSlowly(), await Ta[e.step](
        d,
        await ud(i),
        {
          tracker: s,
          initialCaption: e.progress?.caption
        }
      );
    } finally {
      s.finish();
    }
  }, l = Us(i), p = Us(i).filter(
    (d) => d.isAsync
  ), u = 1 / (p.length + 1);
  for (const d of p)
    d.progress = s.stage(u);
  return { run: a, step: e, resources: l };
}
function Us(e) {
  const t = [];
  for (const r in e) {
    const n = e[r];
    n instanceof dt && t.push(n);
  }
  return t;
}
async function ud(e) {
  const t = {};
  for (const r in e) {
    const n = e[r];
    n instanceof dt ? t[r] = await n.resolve() : t[r] = n;
  }
  return t;
}
async function dd(e, t) {
  await e.run(t);
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Ai = Symbol("Comlink.proxy"), fd = Symbol("Comlink.endpoint"), pd = Symbol("Comlink.releaseProxy"), zr = Symbol("Comlink.finalizer"), vr = Symbol("Comlink.thrown"), Di = (e) => typeof e == "object" && e !== null || typeof e == "function", hd = {
  canHandle: (e) => Di(e) && e[Ai],
  serialize(e) {
    const { port1: t, port2: r } = new MessageChannel();
    return Kn(e, t), [r, [r]];
  },
  deserialize(e) {
    return e.start(), Gn(e);
  }
}, md = {
  canHandle: (e) => Di(e) && vr in e,
  serialize({ value: e }) {
    let t;
    return e instanceof Error ? t = {
      isError: !0,
      value: {
        message: e.message,
        name: e.name,
        stack: e.stack
      }
    } : t = { isError: !1, value: e }, [t, []];
  },
  deserialize(e) {
    throw e.isError ? Object.assign(new Error(e.value.message), e.value) : e.value;
  }
}, Zt = /* @__PURE__ */ new Map([
  ["proxy", hd],
  ["throw", md]
]);
function yd(e, t) {
  for (const r of e)
    if (t === r || r === "*" || r instanceof RegExp && r.test(t))
      return !0;
  return !1;
}
function Kn(e, t = globalThis, r = ["*"]) {
  t.addEventListener("message", function n(s) {
    if (!s || !s.data)
      return;
    if (!yd(r, s.origin)) {
      console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
      return;
    }
    const { id: i, type: a, path: l } = Object.assign({ path: [] }, s.data), p = (s.data.argumentList || []).map(ot);
    let u;
    try {
      const d = l.slice(0, -1).reduce((C, j) => C[j], e), g = l.reduce((C, j) => C[j], e);
      switch (a) {
        case "GET":
          u = g;
          break;
        case "SET":
          d[l.slice(-1)[0]] = ot(s.data.value), u = !0;
          break;
        case "APPLY":
          u = g.apply(d, p);
          break;
        case "CONSTRUCT":
          {
            const C = new g(...p);
            u = Li(C);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: C, port2: j } = new MessageChannel();
            Kn(e, j), u = wd(C, [C]);
          }
          break;
        case "RELEASE":
          u = void 0;
          break;
        default:
          return;
      }
    } catch (d) {
      u = { value: d, [vr]: 0 };
    }
    Promise.resolve(u).catch((d) => ({ value: d, [vr]: 0 })).then((d) => {
      const [g, C] = Nr(d);
      t.postMessage(Object.assign(Object.assign({}, g), { id: i }), C), a === "RELEASE" && (t.removeEventListener("message", n), Fi(t), zr in e && typeof e[zr] == "function" && e[zr]());
    }).catch((d) => {
      const [g, C] = Nr({
        value: new TypeError("Unserializable return value"),
        [vr]: 0
      });
      t.postMessage(Object.assign(Object.assign({}, g), { id: i }), C);
    });
  }), t.start && t.start();
}
function gd(e) {
  return e.constructor.name === "MessagePort";
}
function Fi(e) {
  gd(e) && e.close();
}
function Gn(e, t) {
  return Zr(e, [], t);
}
function hr(e) {
  if (e)
    throw new Error("Proxy has been released and is not useable");
}
function Mi(e) {
  return St(e, {
    type: "RELEASE"
  }).then(() => {
    Fi(e);
  });
}
const Tr = /* @__PURE__ */ new WeakMap(), Rr = "FinalizationRegistry" in globalThis && new FinalizationRegistry((e) => {
  const t = (Tr.get(e) || 0) - 1;
  Tr.set(e, t), t === 0 && Mi(e);
});
function $d(e, t) {
  const r = (Tr.get(t) || 0) + 1;
  Tr.set(t, r), Rr && Rr.register(e, t, e);
}
function vd(e) {
  Rr && Rr.unregister(e);
}
function Zr(e, t = [], r = function() {
}) {
  let n = !1;
  const s = new Proxy(r, {
    get(i, a) {
      if (hr(n), a === pd)
        return () => {
          vd(s), Mi(e), n = !0;
        };
      if (a === "then") {
        if (t.length === 0)
          return { then: () => s };
        const l = St(e, {
          type: "GET",
          path: t.map((p) => p.toString())
        }).then(ot);
        return l.then.bind(l);
      }
      return Zr(e, [...t, a]);
    },
    set(i, a, l) {
      hr(n);
      const [p, u] = Nr(l);
      return St(e, {
        type: "SET",
        path: [...t, a].map((d) => d.toString()),
        value: p
      }, u).then(ot);
    },
    apply(i, a, l) {
      hr(n);
      const p = t[t.length - 1];
      if (p === fd)
        return St(e, {
          type: "ENDPOINT"
        }).then(ot);
      if (p === "bind")
        return Zr(e, t.slice(0, -1));
      const [u, d] = Ls(l);
      return St(e, {
        type: "APPLY",
        path: t.map((g) => g.toString()),
        argumentList: u
      }, d).then(ot);
    },
    construct(i, a) {
      hr(n);
      const [l, p] = Ls(a);
      return St(e, {
        type: "CONSTRUCT",
        path: t.map((u) => u.toString()),
        argumentList: l
      }, p).then(ot);
    }
  });
  return $d(s, e), s;
}
function _d(e) {
  return Array.prototype.concat.apply([], e);
}
function Ls(e) {
  const t = e.map(Nr);
  return [t.map((r) => r[0]), _d(t.map((r) => r[1]))];
}
const Ui = /* @__PURE__ */ new WeakMap();
function wd(e, t) {
  return Ui.set(e, t), e;
}
function Li(e) {
  return Object.assign(e, { [Ai]: !0 });
}
function bd(e, t = globalThis, r = "*") {
  return {
    postMessage: (n, s) => e.postMessage(n, r, s),
    addEventListener: t.addEventListener.bind(t),
    removeEventListener: t.removeEventListener.bind(t)
  };
}
function Nr(e) {
  for (const [t, r] of Zt)
    if (r.canHandle(e)) {
      const [n, s] = r.serialize(e);
      return [
        {
          type: "HANDLER",
          name: t,
          value: n
        },
        s
      ];
    }
  return [
    {
      type: "RAW",
      value: e
    },
    Ui.get(e) || []
  ];
}
function ot(e) {
  switch (e.type) {
    case "HANDLER":
      return Zt.get(e.name).deserialize(e.value);
    case "RAW":
      return e.value;
  }
}
function St(e, t, r) {
  return new Promise((n) => {
    const s = Pd();
    e.addEventListener("message", function i(a) {
      !a.data || !a.data.id || a.data.id !== s || (e.removeEventListener("message", i), n(a.data));
    }), e.start && e.start(), e.postMessage(Object.assign({ id: s }, t), r);
  });
}
function Pd() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
function qi(e) {
  Sd();
  const t = e instanceof Worker ? e : bd(e), r = Gn(t), n = Vi(r);
  return new Proxy(n, {
    get: (s, i) => i === "isConnected" ? async () => {
      for (let a = 0; a < 10; a++)
        try {
          await Ed(r.isConnected(), 200);
          break;
        } catch {
        }
    } : r[i]
  });
}
async function Ed(e, t) {
  return new Promise((r, n) => {
    setTimeout(n, t), e.then(r);
  });
}
let qs = !1;
function Sd() {
  qs || (qs = !0, Zt.set("EVENT", {
    canHandle: (e) => e instanceof CustomEvent,
    serialize: (e) => [
      {
        detail: e.detail
      },
      []
    ],
    deserialize: (e) => e
  }), Zt.set("FUNCTION", {
    canHandle: (e) => typeof e == "function",
    serialize(e) {
      console.debug("[Comlink][Performance] Proxying a function");
      const { port1: t, port2: r } = new MessageChannel();
      return Kn(e, t), [r, [r]];
    },
    deserialize(e) {
      return e.start(), Gn(e);
    }
  }), Zt.set("PHPResponse", {
    canHandle: (e) => typeof e == "object" && e !== null && "headers" in e && "bytes" in e && "errors" in e && "exitCode" in e && "httpStatusCode" in e,
    serialize(e) {
      return [e.toRawData(), []];
    },
    deserialize(e) {
      return ct.fromRawData(e);
    }
  }));
}
function Vi(e) {
  return new Proxy(e, {
    get(t, r) {
      switch (typeof t[r]) {
        case "function":
          return (...n) => t[r](...n);
        case "object":
          return t[r] === null ? t[r] : Vi(t[r]);
        case "undefined":
        case "number":
        case "string":
          return t[r];
        default:
          return Li(t[r]);
      }
    }
  });
}
async function Td({
  iframe: e,
  blueprint: t,
  remoteUrl: r,
  progressTracker: n = new Cr(),
  disableProgressBar: s,
  onBlueprintStepCompleted: i
}) {
  if (Rd(r), r = zs(r, {
    progressbar: !s
  }), n.setCaption("Preparing WordPress"), !t)
    return Vs(e, r, n);
  const a = id(t, {
    progress: n.stage(0.5),
    onStepCompleted: i
  }), l = await Vs(
    e,
    zs(r, {
      php: a.versions.php,
      wp: a.versions.wp
    }),
    n
  );
  return await dd(a, l), n.finish(), l;
}
async function Vs(e, t, r) {
  await new Promise((i) => {
    e.src = t, e.addEventListener("load", i, !1);
  });
  const n = qi(
    e.contentWindow
  );
  await n.isConnected(), r.pipe(n);
  const s = r.stage();
  return await n.onDownloadProgress(s.loadingListener), await n.isReady(), s.finish(), n;
}
const _r = "https://playground.wordpress.net";
function Rd(e) {
  const t = new URL(e, _r);
  if ((t.origin === _r || t.hostname === "localhost") && t.pathname !== "/remote.html")
    throw new Error(
      `Invalid remote URL: ${t}. Expected origin to be ${_r}/remote.html.`
    );
}
function zs(e, t) {
  const r = new URL(e, _r), n = new URLSearchParams(r.search);
  for (const [s, i] of Object.entries(t))
    i != null && i !== !1 && n.set(s, i.toString());
  return r.search = n.toString(), r.toString();
}
async function Cd(e, t) {
  if (console.warn(
    "`connectPlayground` is deprecated and will be removed. Use `startPlayground` instead."
  ), t?.loadRemote)
    return Td({
      iframe: e,
      remoteUrl: t.loadRemote
    });
  const r = qi(
    e.contentWindow
  );
  return await r.isConnected(), r;
}
export {
  Ua as LatestSupportedPHPVersion,
  nn as SupportedPHPVersions,
  Nd as SupportedPHPVersionsList,
  Hs as activatePlugin,
  Ws as activateTheme,
  ta as applyWordPressPatches,
  id as compileBlueprint,
  Cd as connectPlayground,
  oa as cp,
  fa as defineSiteUrl,
  Xr as defineWpConfigConsts,
  ya as importFile,
  va as installPlugin,
  wa as installTheme,
  ba as login,
  la as mkdir,
  ca as mv,
  Rt as phpVar,
  en as phpVars,
  ma as replaceSite,
  aa as request,
  ua as rm,
  da as rmdir,
  dd as runBlueprintSteps,
  na as runPHP,
  sa as runPHPWithOptions,
  Pa as runWpInstallationWizard,
  ia as setPhpIniEntry,
  Od as setPluginProxyURL,
  Ea as setSiteOptions,
  Td as startPlaygroundWeb,
  tn as unzip,
  Sa as updateUserMeta,
  Ks as writeFile,
  ha as zipEntireSite
};
