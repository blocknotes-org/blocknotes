const Us = async (e, { pluginPath: t, pluginName: r }, n) => {
  n?.tracker.setCaption(`Activating ${r || t}`);
  const s = [
    `${await e.documentRoot}/wp-load.php`,
    `${await e.documentRoot}/wp-admin/includes/plugin.php`
  ];
  if (!s.every(
    (o) => e.fileExists(o)
  ))
    throw new Error(
      `Required WordPress files do not exist: ${s.join(", ")}`
    );
  if ((await e.run({
    code: `<?php
define( 'WP_ADMIN', true );
${s.map((o) => `require_once( '${o}' );`).join(`
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
}, Ls = async (e, { themeFolderName: t }, r) => {
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
function _r(e) {
  const t = e.split(".").shift().replace(/-/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
async function Mt(e, t, r) {
  let n = "";
  await e.fileExists(t) && (n = await e.readFileAsText(t)), await e.writeFile(t, r(n));
}
async function Ai(e) {
  return new Uint8Array(await e.arrayBuffer());
}
class Di extends File {
  constructor(t, r) {
    super(t, r), this.buffers = t;
  }
  async arrayBuffer() {
    return this.buffers[0];
  }
}
const zr = File.prototype.arrayBuffer instanceof Function ? File : Di, Jn = "/vfs-blueprints", Hr = async (e, { consts: t, virtualize: r = !1 }) => {
  const n = await e.documentRoot, s = r ? Jn : n, i = `${s}/playground-consts.json`, a = `${s}/wp-config.php`;
  return r && (e.mkdir(Jn), e.setPhpIniEntry("auto_prepend_file", a)), await Mt(
    e,
    i,
    (o) => JSON.stringify({
      ...JSON.parse(o || "{}"),
      ...t
    })
  ), await Mt(e, a, (o) => o.includes("playground-consts.json") ? o : `<?php
	$consts = json_decode(file_get_contents('${i}'), true);
	foreach ($consts as $const => $value) {
		if (!defined($const)) {
			define($const, $value);
		}
	}
?>${o}`), a;
}, Fi = async (e, t) => {
  const r = new Mi(
    e,
    t.wordpressPath || "/wordpress",
    t.siteUrl
  );
  t.addPhpInfo === !0 && await r.addPhpInfo(), t.siteUrl && await r.patchSiteUrl(), t.patchSecrets === !0 && await r.patchSecrets(), t.disableSiteHealth === !0 && await r.disableSiteHealth(), t.disableWpNewBlogNotification === !0 && await r.disableWpNewBlogNotification();
};
class Mi {
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
    await Hr(this.php, {
      consts: {
        WP_HOME: this.scopedSiteUrl,
        WP_SITEURL: this.scopedSiteUrl
      },
      virtualize: !0
    });
  }
  async patchSecrets() {
    await Mt(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      (t) => `<?php
					define('AUTH_KEY',         '${Qe(40)}');
					define('SECURE_AUTH_KEY',  '${Qe(40)}');
					define('LOGGED_IN_KEY',    '${Qe(40)}');
					define('NONCE_KEY',        '${Qe(40)}');
					define('AUTH_SALT',        '${Qe(40)}');
					define('SECURE_AUTH_SALT', '${Qe(40)}');
					define('LOGGED_IN_SALT',   '${Qe(40)}');
					define('NONCE_SALT',       '${Qe(40)}');
				?>${t.replaceAll("', 'put your unique phrase here'", "__', ''")}`
    );
  }
  async disableSiteHealth() {
    await Mt(
      this.php,
      `${this.wordpressPath}/wp-includes/default-filters.php`,
      (t) => t.replace(
        /add_filter[^;]+wp_maybe_grant_site_health_caps[^;]+;/i,
        ""
      )
    );
  }
  async disableWpNewBlogNotification() {
    await Mt(
      this.php,
      `${this.wordpressPath}/wp-config.php`,
      // The original version of this function crashes WASM PHP, let's define an empty one instead.
      (t) => `${t} function wp_new_blog_notification(...$args){} `
    );
  }
}
function Qe(e) {
  const t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?";
  let r = "";
  for (let n = e; n > 0; --n)
    r += t[Math.floor(Math.random() * t.length)];
  return r;
}
const qi = async (e, { code: t }) => await e.run({ code: t }), Ui = async (e, { options: t }) => await e.run(t), Li = async (e, { key: t, value: r }) => {
  await e.setPhpIniEntry(t, r);
}, Vi = async (e, { request: t }) => await e.request(t), zi = async (e, { fromPath: t, toPath: r }) => {
  await e.writeFile(
    r,
    await e.readFileAsBuffer(t)
  );
}, Hi = async (e, { fromPath: t, toPath: r }) => {
  await e.mv(t, r);
}, Wi = async (e, { path: t }) => {
  await e.mkdir(t);
}, Ki = async (e, { path: t }) => {
  await e.unlink(t);
}, Gi = async (e, { path: t }) => {
  await e.rmdir(t);
}, Vs = async (e, { path: t, data: r }) => {
  r instanceof File && (r = await Ai(r)), await e.writeFile(t, r);
}, Bi = async (e, { siteUrl: t }) => await Hr(e, {
  consts: {
    WP_HOME: t,
    WP_SITEURL: t
  }
});
class zs {
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
const xi = Symbol("literal");
function St(e) {
  if (typeof e == "string")
    return e.startsWith("$") ? e : JSON.stringify(e);
  if (typeof e == "number")
    return e.toString();
  if (Array.isArray(e))
    return `array(${e.map(St).join(", ")})`;
  if (e === null)
    return "null";
  if (typeof e == "object")
    return xi in e ? e.toString() : `array(${Object.entries(e).map(([r, n]) => `${JSON.stringify(r)} => ${St(n)}`).join(", ")})`;
  if (typeof e == "function")
    return e();
  throw new Error(`Unsupported value: ${e}`);
}
function Wr(e) {
  const t = {};
  for (const r in e)
    t[r] = St(e[r]);
  return t;
}
const Yn = `<?php

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
async function Ji(e) {
  const t = "wordpress-playground.zip", r = `/tmp/${t}`, n = Wr({
    zipPath: r,
    documentRoot: await e.documentRoot
  });
  await Hs(
    e,
    `zipDir(${n.documentRoot}, ${n.zipPath});`
  );
  const s = await e.readFileAsBuffer(r);
  return e.unlink(r), new File([s], t);
}
const Yi = async (e, { fullSiteZip: t }) => {
  const r = "/import.zip";
  await e.writeFile(
    r,
    new Uint8Array(await t.arrayBuffer())
  );
  const n = await e.absoluteUrl, s = await e.documentRoot;
  await e.rmdir(s), await Kr(e, { zipPath: r, extractToPath: "/" });
  const i = Wr({ absoluteUrl: n });
  await Xi(
    e,
    `${s}/wp-config.php`,
    (a) => `<?php
			if(!defined('WP_HOME')) {
				define('WP_HOME', ${i.absoluteUrl});
				define('WP_SITEURL', ${i.absoluteUrl});
			}
			?>${a}`
  );
}, Kr = async (e, { zipPath: t, extractToPath: r }) => {
  const n = Wr({
    zipPath: t,
    extractToPath: r
  });
  await Hs(
    e,
    `unzip(${n.zipPath}, ${n.extractToPath});`
  );
}, Zi = async (e, { file: t }) => {
  const r = await e.request({
    url: "/wp-admin/admin.php?import=wordpress"
  }), n = Zn(r).getElementById("import-upload-form")?.getAttribute("action"), s = await e.request({
    url: `/wp-admin/${n}`,
    method: "POST",
    files: { import: t }
  }), i = Zn(s).querySelector(
    "#wpbody-content form"
  );
  if (!i)
    throw console.log(s.text), new Error(
      "Could not find an importer form in response. See the response text above for details."
    );
  const a = Qi(i);
  a.fetch_attachments = "1";
  for (const o in a)
    if (o.startsWith("user_map[")) {
      const u = "user_new[" + o.slice(9, -1) + "]";
      a[u] = "1";
    }
  await e.request({
    url: i.action,
    method: "POST",
    formData: a
  });
};
function Zn(e) {
  return new DOMParser().parseFromString(e.text, "text/html");
}
function Qi(e) {
  return Object.fromEntries(new FormData(e).entries());
}
async function Xi(e, t, r) {
  await e.writeFile(
    t,
    r(await e.readFileAsText(t))
  );
}
async function Hs(e, t) {
  const r = await e.run({
    code: Yn + t
  });
  if (r.exitCode !== 0)
    throw console.log(Yn + t), console.log(t + ""), console.log(r.errors), r.errors;
  return r;
}
async function Ws(e, { targetPath: t, zipFile: r }) {
  const n = r.name, s = n.replace(/\.zip$/, ""), i = `/tmp/assets/${s}`, a = `/tmp/${n}`, o = () => e.rmdir(i, {
    recursive: !0
  });
  await e.fileExists(i) && await o(), await Vs(e, {
    path: a,
    data: r
  });
  const u = () => Promise.all([o, () => e.unlink(a)]);
  try {
    await Kr(e, {
      zipPath: a,
      extractToPath: i
    });
    const d = await e.listFiles(i, {
      prependPath: !0
    }), f = d.length === 1 && await e.isDir(d[0]);
    let y, E = "";
    f ? (E = d[0], y = d[0].split("/").pop()) : (E = i, y = s);
    const w = `${t}/${y}`;
    return await e.mv(E, w), await u(), {
      assetFolderPath: w,
      assetFolderName: y
    };
  } catch (d) {
    throw await u(), d;
  }
}
const ea = async (e, { pluginZipFile: t, options: r = {} }, n) => {
  const s = t.name.split("/").pop() || "plugin.zip", i = _r(s);
  n?.tracker.setCaption(`Installing the ${i} plugin`);
  try {
    const { assetFolderPath: a } = await Ws(e, {
      zipFile: t,
      targetPath: `${await e.documentRoot}/wp-content/plugins`
    });
    ("activate" in r ? r.activate : !0) && await Us(
      e,
      {
        pluginPath: a,
        pluginName: i
      },
      n
    ), await ta(e);
  } catch (a) {
    console.error(
      `Proceeding without the ${i} plugin. Could not install it in wp-admin. The original error was: ${a}`
    ), console.error(a);
  }
};
async function ta(e) {
  await e.isDir("/wordpress/wp-content/plugins/gutenberg") && !await e.fileExists("/wordpress/.gutenberg-patched") && (await e.writeFile("/wordpress/.gutenberg-patched", "1"), await Qn(
    e,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.js",
    (t) => t.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ), await Qn(
    e,
    "/wordpress/wp-content/plugins/gutenberg/build/block-editor/index.min.js",
    (t) => t.replace(
      /srcDoc:("[^"]+"|[^,]+)/g,
      'src:"/wp-includes/empty.html"'
    )
  ));
}
async function Qn(e, t, r) {
  return await e.writeFile(
    t,
    r(await e.readFileAsText(t))
  );
}
const ra = async (e, { themeZipFile: t, options: r = {} }, n) => {
  const s = _r(t.name);
  n?.tracker.setCaption(`Installing the ${s} theme`);
  try {
    const { assetFolderName: i } = await Ws(e, {
      zipFile: t,
      targetPath: `${await e.documentRoot}/wp-content/themes`
    });
    ("activate" in r ? r.activate : !0) && await Ls(
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
}, na = async (e, { username: t = "admin", password: r = "password" } = {}, n) => {
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
}, sa = async (e, { options: t }) => {
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
}, ia = async (e, { options: t }) => {
  const r = `<?php
	include 'wordpress/wp-load.php';
	$site_options = ${St(t)};
	foreach($site_options as $name => $value) {
		update_option($name, $value);
	}
	echo "Success";
	`, n = await e.run({
    code: r
  });
  return Ks(n), { code: r, result: n };
}, aa = async (e, { meta: t, userId: r }) => {
  const n = `<?php
	include 'wordpress/wp-load.php';
	$meta = ${St(t)};
	foreach($meta as $name => $value) {
		update_user_meta(${St(r)}, $name, $value);
	}
	echo "Success";
	`, s = await e.run({
    code: n
  });
  return Ks(s), { code: n, result: s };
};
async function Ks(e) {
  if (e.text !== "Success")
    throw console.log(e), new Error(`Failed to run code: ${e.text} ${e.errors}`);
}
const oa = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activatePlugin: Us,
  activateTheme: Ls,
  applyWordPressPatches: Fi,
  cp: zi,
  defineSiteUrl: Bi,
  defineWpConfigConsts: Hr,
  importFile: Zi,
  installPlugin: ea,
  installTheme: ra,
  login: na,
  mkdir: Wi,
  mv: Hi,
  replaceSite: Yi,
  request: Vi,
  rm: Ki,
  rmdir: Gi,
  runPHP: qi,
  runPHPWithOptions: Ui,
  runWpInstallationWizard: sa,
  setPhpIniEntry: Li,
  setSiteOptions: ia,
  unzip: Kr,
  updateUserMeta: aa,
  writeFile: Vs,
  zipEntireSite: Ji
}, Symbol.toStringTag, { value: "Module" })), ca = 5 * 1024 * 1024;
function la(e, t) {
  const r = e.headers.get("content-length") || "", n = parseInt(r, 10) || ca;
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
        let o = 0;
        for (; ; )
          try {
            const { done: u, value: d } = await a.read();
            if (d && (o += d.byteLength), u) {
              s(o, o), i.close();
              break;
            } else
              s(o, n), i.enqueue(d);
          } catch (u) {
            console.error({ e: u }), i.error(u);
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
const Tr = 1e-5;
class wr extends EventTarget {
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
    if (t || (t = this._selfWeight), this._selfWeight - t < -Tr)
      throw new Error(
        `Cannot add a stage with weight ${t} as the total weight of registered stages would exceed 1.`
      );
    this._selfWeight -= t;
    const n = new wr({
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
    this._selfProgress = Math.min(t, 100), this.notifyProgress(), this._selfProgress + Tr >= 100 && this.finish();
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
    return this.progress + Tr >= 100;
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
const Xn = Symbol("error"), es = Symbol("message");
class Gr extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param type The name of the event
   * @param options A dictionary object that allows for setting
   *                  attributes via object members of the same name.
   */
  constructor(t, r = {}) {
    super(t), this[Xn] = r.error === void 0 ? null : r.error, this[es] = r.message === void 0 ? "" : r.message;
  }
  get error() {
    return this[Xn];
  }
  get message() {
    return this[es];
  }
}
Object.defineProperty(Gr.prototype, "error", { enumerable: !0 });
Object.defineProperty(Gr.prototype, "message", { enumerable: !0 });
const ua = typeof globalThis.ErrorEvent == "function" ? globalThis.ErrorEvent : Gr;
class da extends EventTarget {
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
function fa(e) {
  e.asm = {
    ...e.asm
  };
  const t = new da();
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
          const a = ha(
            i,
            e.lastAsyncifyStackSource?.stack
          );
          if (e.lastAsyncifyStackSource && (i.cause = e.lastAsyncifyStackSource), !t.hasListeners())
            throw ga(a), i;
          t.dispatchEvent(
            new ua("error", {
              error: i,
              message: a
            })
          );
        }
      };
    }
  return t;
}
let Ar = [];
function pa() {
  return Ar;
}
function ha(e, t) {
  if (e.message === "unreachable") {
    let r = ma;
    t || (r += `

This stack trace is lacking. For a better one initialize 
the PHP runtime with { debug: true }, e.g. PHPNode.load('8.1', { debug: true }).

`), Ar = va(
      t || e.stack || ""
    );
    for (const n of Ar)
      r += `    * ${n}
`;
    return r;
  }
  return e.message;
}
const ma = `
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

`, ts = "\x1B[41m", ya = "\x1B[1m", rs = "\x1B[0m", ns = "\x1B[K";
let ss = !1;
function ga(e) {
  if (!ss) {
    ss = !0, console.log(`${ts}
${ns}
${ya}  WASM ERROR${rs}${ts}`);
    for (const t of e.split(`
`))
      console.log(`${ns}  ${t} `);
    console.log(`${rs}`);
  }
}
function va(e) {
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
class pt {
  constructor(t, r, n, s = "", i = 0) {
    this.httpStatusCode = t, this.headers = r, this.bytes = n, this.exitCode = i, this.errors = s;
  }
  static fromRawData(t) {
    return new pt(
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
const Br = [
  "8.2",
  "8.1",
  "8.0",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "5.6"
], $a = Br[0], bu = Br;
class _a {
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
const wa = "http://example.com";
function is(e) {
  return e.toString().substring(e.origin.length);
}
function as(e, t) {
  return !t || !e.startsWith(t) ? e : e.substring(t.length);
}
function ba(e, t) {
  return !t || e.startsWith(t) ? e : t + e;
}
class Pa {
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
    this.#o = new zs({ concurrency: 1 });
    const {
      documentRoot: n = "/www/",
      absoluteUrl: s = typeof location == "object" ? location?.href : "",
      isStaticFilePath: i = () => !1
    } = r;
    this.php = t, this.#e = n, this.#c = i;
    const a = new URL(s);
    this.#n = a.hostname, this.#r = a.port ? Number(a.port) : a.protocol === "https:" ? 443 : 80, this.#t = (a.protocol || "").replace(":", "");
    const o = this.#r !== 443 && this.#r !== 80;
    this.#i = [
      this.#n,
      o ? `:${this.#r}` : ""
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
    return r.pathname.startsWith(this.#s) && (r.pathname = r.pathname.slice(this.#s.length)), is(r);
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
      r ? void 0 : wa
    ), s = as(
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
      return new pt(
        404,
        {},
        new TextEncoder().encode("404 File not found")
      );
    const n = this.php.readFileAsBuffer(r);
    return new pt(
      200,
      {
        "content-length": [`${n.byteLength}`],
        // @TODO: Infer the content-type from the arrayBuffer instead of the file path.
        //        The code below won't return the correct mime-type if the extension
        //        was tampered with.
        "content-type": [Sa(r)],
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
        ...Gs(t.headers || {})
      }, a = [];
      if (t.files && Object.keys(t.files).length) {
        s = "POST";
        for (const d in t.files) {
          const f = t.files[d];
          a.push({
            key: d,
            name: f.name,
            type: f.type,
            data: new Uint8Array(await f.arrayBuffer())
          });
        }
        i["content-type"]?.startsWith("multipart/form-data") && (t.formData = Ea(
          t.body || ""
        ), i["content-type"] = "application/x-www-form-urlencoded", delete t.body);
      }
      let o;
      t.formData !== void 0 ? (s = "POST", i["content-type"] = i["content-type"] || "application/x-www-form-urlencoded", o = new URLSearchParams(
        t.formData
      ).toString()) : o = t.body;
      let u;
      try {
        u = this.#d(r.pathname);
      } catch {
        return new pt(
          404,
          {},
          new TextEncoder().encode("404 File not found")
        );
      }
      return await this.php.run({
        relativeUri: ba(
          is(r),
          this.#s
        ),
        protocol: this.#t,
        method: t.method || s,
        body: o,
        fileInfos: a,
        scriptPath: u,
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
    let r = as(t, this.#s);
    r.includes(".php") ? r = r.split(".php")[0] + ".php" : (r.endsWith("/") || (r += "/"), r.endsWith("index.php") || (r += "index.php"));
    const n = `${this.#e}${r}`;
    if (this.php.fileExists(n))
      return n;
    if (!this.php.fileExists(`${this.#e}/index.php`))
      throw new Error(`File not found: ${n}`);
    return `${this.#e}/index.php`;
  }
}
function Ea(e) {
  const t = {}, r = e.match(/--(.*)\r\n/);
  if (!r)
    return t;
  const n = r[1], s = e.split(`--${n}`);
  return s.shift(), s.pop(), s.forEach((i) => {
    const a = i.indexOf(`\r
\r
`), o = i.substring(0, a).trim(), u = i.substring(a + 4).trim(), d = o.match(/name="([^"]+)"/);
    if (d) {
      const f = d[1];
      t[f] = u;
    }
  }), t;
}
function Sa(e) {
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
const os = {
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
function Me(e = "") {
  return function(r, n, s) {
    const i = s.value;
    s.value = function(...a) {
      try {
        return i.apply(this, a);
      } catch (o) {
        const u = typeof o == "object" ? o?.errno : null;
        if (u in os) {
          const d = os[u], f = typeof a[0] == "string" ? a[0] : null, y = f !== null ? e.replaceAll("{path}", f) : e;
          throw new Error(`${y}: ${d}`, {
            cause: o
          });
        }
        throw o;
      }
    };
  };
}
const Ra = [];
function Ta(e) {
  return Ra[e];
}
(function() {
  return typeof process < "u" && process.release?.name === "node" ? "NODE" : typeof window < "u" ? "WEB" : typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? "WORKER" : "NODE";
})();
var Na = Object.defineProperty, Oa = Object.getOwnPropertyDescriptor, qe = (e, t, r, n) => {
  for (var s = n > 1 ? void 0 : n ? Oa(t, r) : t, i = e.length - 1, a; i >= 0; i--)
    (a = e[i]) && (s = (n ? a(t, r, s) : a(s)) || s);
  return n && s && Na(t, r, s), s;
};
const Ee = "string", _t = "number", ie = Symbol("__private__dont__use");
class Ue {
  /**
   * Initializes a PHP runtime.
   *
   * @internal
   * @param  PHPRuntime - Optional. PHP Runtime ID as initialized by loadPHPRuntime.
   * @param  serverOptions - Optional. Options for the PHPRequestHandler. If undefined, no request handler will be initialized.
   */
  constructor(t, r) {
    this.#e = [], this.#t = !1, this.#n = null, this.#r = {}, this.#i = [], t !== void 0 && this.initializeRuntime(t), r && (this.requestHandler = new _a(
      new Pa(this, r)
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
    if (this[ie])
      throw new Error("PHP runtime already initialized.");
    const r = Ta(t);
    if (!r)
      throw new Error("Invalid PHP runtime id.");
    this[ie] = r, r.onMessage = (n) => {
      for (const s of this.#i)
        s(n);
    }, this.#n = fa(r);
  }
  /** @inheritDoc */
  setPhpIniPath(t) {
    if (this.#t)
      throw new Error("Cannot set PHP ini path after calling run().");
    this[ie].ccall(
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
    this[ie].FS.chdir(t);
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
      ...Gs(t.headers || {})
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
      this[ie].ccall(
        "wasm_set_phpini_entries",
        null,
        [Ee],
        [t]
      );
    }
    this[ie].ccall("php_wasm_init", null, [], []);
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
      const i = s.indexOf(": "), a = s.substring(0, i).toLowerCase(), o = s.substring(i + 2);
      a in n || (n[a] = []), n[a].push(o);
    }
    return {
      headers: n,
      httpStatusCode: r.status
    };
  }
  #o(t) {
    if (this[ie].ccall(
      "wasm_set_request_uri",
      null,
      [Ee],
      [t]
    ), t.includes("?")) {
      const r = t.substring(t.indexOf("?") + 1);
      this[ie].ccall(
        "wasm_set_query_string",
        null,
        [Ee],
        [r]
      );
    }
  }
  #c(t, r) {
    this[ie].ccall(
      "wasm_set_request_host",
      null,
      [Ee],
      [t]
    );
    let n;
    try {
      n = parseInt(new URL(t).port, 10);
    } catch {
    }
    (!n || isNaN(n) || n === 80) && (n = r === "https" ? 443 : 80), this[ie].ccall(
      "wasm_set_request_port",
      null,
      [_t],
      [n]
    ), (r === "https" || !r && n === 443) && this.addServerGlobalEntry("HTTPS", "on");
  }
  #l(t) {
    this[ie].ccall(
      "wasm_set_request_method",
      null,
      [Ee],
      [t]
    );
  }
  #u(t) {
    t.cookie && this[ie].ccall(
      "wasm_set_cookies",
      null,
      [Ee],
      [t.cookie]
    ), t["content-type"] && this[ie].ccall(
      "wasm_set_content_type",
      null,
      [Ee],
      [t["content-type"]]
    ), t["content-length"] && this[ie].ccall(
      "wasm_set_content_length",
      null,
      [_t],
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
    this[ie].ccall(
      "wasm_set_request_body",
      null,
      [Ee],
      [t]
    ), this[ie].ccall(
      "wasm_set_content_length",
      null,
      [_t],
      [new TextEncoder().encode(t).length]
    );
  }
  #f(t) {
    this[ie].ccall(
      "wasm_set_path_translated",
      null,
      [Ee],
      [t]
    );
  }
  addServerGlobalEntry(t, r) {
    this.#r[t] = r;
  }
  #p() {
    for (const t in this.#r)
      this[ie].ccall(
        "wasm_add_SERVER_entry",
        null,
        [Ee, Ee],
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
    const o = 0;
    this[ie].ccall(
      "wasm_add_uploaded_file",
      null,
      [Ee, Ee, Ee, Ee, _t, _t],
      [r, n, s, a, o, i.byteLength]
    );
  }
  #m(t) {
    this[ie].ccall(
      "wasm_set_php_code",
      null,
      [Ee],
      [t]
    );
  }
  async #y() {
    let t, r;
    try {
      t = await new Promise((i, a) => {
        r = (u) => {
          const d = new Error("Rethrown");
          d.cause = u.error, d.betterMessage = u.message, a(d);
        }, this.#n?.addEventListener(
          "error",
          r
        );
        const o = this[ie].ccall(
          "wasm_sapi_handle_request",
          _t,
          [],
          []
        );
        return o instanceof Promise ? o.then(i, a) : i(o);
      });
    } catch (i) {
      for (const d in this)
        typeof this[d] == "function" && (this[d] = () => {
          throw new Error(
            "PHP runtime has crashed – see the earlier error for details."
          );
        });
      this.functionsMaybeMissingFromAsyncify = pa();
      const a = i, o = "betterMessage" in a ? a.betterMessage : a.message, u = new Error(o);
      throw u.cause = a, u;
    } finally {
      this.#n?.removeEventListener("error", r), this.#r = {};
    }
    const { headers: n, httpStatusCode: s } = this.#a();
    return new pt(
      s,
      n,
      this.readFileAsBuffer("/tmp/stdout"),
      this.readFileAsText("/tmp/stderr"),
      t
    );
  }
  mkdir(t) {
    this[ie].FS.mkdirTree(t);
  }
  mkdirTree(t) {
    this.mkdir(t);
  }
  readFileAsText(t) {
    return new TextDecoder().decode(this.readFileAsBuffer(t));
  }
  readFileAsBuffer(t) {
    return this[ie].FS.readFile(t);
  }
  writeFile(t, r) {
    this[ie].FS.writeFile(t, r);
  }
  unlink(t) {
    this[ie].FS.unlink(t);
  }
  mv(t, r) {
    this[ie].FS.rename(t, r);
  }
  rmdir(t, r = { recursive: !0 }) {
    r?.recursive && this.listFiles(t).forEach((n) => {
      const s = `${t}/${n}`;
      this.isDir(s) ? this.rmdir(s, r) : this.unlink(s);
    }), this[ie].FS.rmdir(t);
  }
  listFiles(t, r = { prependPath: !1 }) {
    if (!this.fileExists(t))
      return [];
    try {
      const n = this[ie].FS.readdir(t).filter(
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
    return this.fileExists(t) ? this[ie].FS.isDir(
      this[ie].FS.lookupPath(t).node.mode
    ) : !1;
  }
  fileExists(t) {
    try {
      return this[ie].FS.lookupPath(t), !0;
    } catch {
      return !1;
    }
  }
}
qe([
  Me('Could not create directory "{path}"')
], Ue.prototype, "mkdir", 1);
qe([
  Me('Could not create directory "{path}"')
], Ue.prototype, "mkdirTree", 1);
qe([
  Me('Could not read "{path}"')
], Ue.prototype, "readFileAsText", 1);
qe([
  Me('Could not read "{path}"')
], Ue.prototype, "readFileAsBuffer", 1);
qe([
  Me('Could not write to "{path}"')
], Ue.prototype, "writeFile", 1);
qe([
  Me('Could not unlink "{path}"')
], Ue.prototype, "unlink", 1);
qe([
  Me('Could not move "{path}"')
], Ue.prototype, "mv", 1);
qe([
  Me('Could not remove directory "{path}"')
], Ue.prototype, "rmdir", 1);
qe([
  Me('Could not list files in "{path}"')
], Ue.prototype, "listFiles", 1);
qe([
  Me('Could not stat "{path}"')
], Ue.prototype, "isDir", 1);
qe([
  Me('Could not stat "{path}"')
], Ue.prototype, "fileExists", 1);
function Gs(e) {
  const t = {};
  for (const r in e)
    t[r.toLowerCase()] = e[r];
  return t;
}
const Ca = [
  "vfs",
  "literal",
  "wordpress.org/themes",
  "wordpress.org/plugins",
  "url"
];
function ja(e) {
  return e && typeof e == "object" && typeof e.resource == "string" && Ca.includes(e.resource);
}
class yt {
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
        s = new ka(t, n);
        break;
      case "literal":
        s = new Ia(t, n);
        break;
      case "wordpress.org/themes":
        s = new Fa(t, n);
        break;
      case "wordpress.org/plugins":
        s = new Ma(t, n);
        break;
      case "url":
        s = new Da(t, n);
        break;
      default:
        throw new Error(`Invalid resource: ${t}`);
    }
    return s = new qa(s), r && (s = new Ua(s, r)), s;
  }
  setPlayground(t) {
    this.playground = t;
  }
  /** Whether this Resource is loaded asynchronously */
  get isAsync() {
    return !1;
  }
}
class ka extends yt {
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
    return this.progress?.set(100), new zr([t], this.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.path.split("/").pop() || "";
  }
}
class Ia extends yt {
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
    return this.progress?.set(100), new zr([this.resource.contents], this.resource.name);
  }
  /** @inheritDoc */
  get name() {
    return this.resource.name;
  }
}
class xr extends yt {
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
    if (r = await la(
      r,
      this.progress?.loadingListener ?? Aa
    ), r.status !== 200)
      throw new Error(`Could not download "${t}"`);
    return new zr([await r.blob()], this.name);
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
const Aa = () => {
};
class Da extends xr {
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
let Jr = "https://playground.wordpress.net/plugin-proxy";
function Pu(e) {
  Jr = e;
}
class Fa extends xr {
  constructor(t, r) {
    super(r), this.resource = t;
  }
  get name() {
    return _r(this.resource.slug);
  }
  getURL() {
    const t = Bs(this.resource.slug);
    return `${Jr}?theme=` + t;
  }
}
class Ma extends xr {
  constructor(t, r) {
    super(r), this.resource = t;
  }
  /** @inheritDoc */
  get name() {
    return _r(this.resource.slug);
  }
  /** @inheritDoc */
  getURL() {
    const t = Bs(this.resource.slug);
    return `${Jr}?plugin=` + t;
  }
}
function Bs(e) {
  return !e || e.endsWith(".zip") ? e : e + ".latest-stable.zip";
}
class xs extends yt {
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
class qa extends xs {
  /** @inheritDoc */
  async resolve() {
    return this.promise || (this.promise = super.resolve()), this.promise;
  }
}
class Ua extends xs {
  constructor(t, r) {
    super(t), this.semaphore = r;
  }
  /** @inheritDoc */
  async resolve() {
    return this.isAsync ? this.semaphore.run(() => super.resolve()) : super.resolve();
  }
}
var La = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Va(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Dr = { exports: {} }, Js = {}, Be = {}, ct = {}, Kt = {}, Nr = {}, Ht = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(j) {
      if (super(), !e.IDENTIFIER.test(j))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = j;
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
    constructor(j) {
      super(), this._items = typeof j == "string" ? [j] : j;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const j = this._items[0];
      return j === "" || j === '""';
    }
    get str() {
      var j;
      return (j = this._str) !== null && j !== void 0 ? j : this._str = this._items.reduce((O, A) => `${O}${A}`, "");
    }
    get names() {
      var j;
      return (j = this._names) !== null && j !== void 0 ? j : this._names = this._items.reduce((O, A) => (A instanceof r && (O[A.str] = (O[A.str] || 0) + 1), O), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(g, ...j) {
    const O = [g[0]];
    let A = 0;
    for (; A < j.length; )
      o(O, j[A]), O.push(g[++A]);
    return new n(O);
  }
  e._ = s;
  const i = new n("+");
  function a(g, ...j) {
    const O = [w(g[0])];
    let A = 0;
    for (; A < j.length; )
      O.push(i), o(O, j[A]), O.push(i, w(g[++A]));
    return u(O), new n(O);
  }
  e.str = a;
  function o(g, j) {
    j instanceof n ? g.push(...j._items) : j instanceof r ? g.push(j) : g.push(y(j));
  }
  e.addCodeArg = o;
  function u(g) {
    let j = 1;
    for (; j < g.length - 1; ) {
      if (g[j] === i) {
        const O = d(g[j - 1], g[j + 1]);
        if (O !== void 0) {
          g.splice(j - 1, 3, O);
          continue;
        }
        g[j++] = "+";
      }
      j++;
    }
  }
  function d(g, j) {
    if (j === '""')
      return g;
    if (g === '""')
      return j;
    if (typeof g == "string")
      return j instanceof r || g[g.length - 1] !== '"' ? void 0 : typeof j != "string" ? `${g.slice(0, -1)}${j}"` : j[0] === '"' ? g.slice(0, -1) + j.slice(1) : void 0;
    if (typeof j == "string" && j[0] === '"' && !(g instanceof r))
      return `"${g}${j.slice(1)}`;
  }
  function f(g, j) {
    return j.emptyStr() ? g : g.emptyStr() ? j : a`${g}${j}`;
  }
  e.strConcat = f;
  function y(g) {
    return typeof g == "number" || typeof g == "boolean" || g === null ? g : w(Array.isArray(g) ? g.join(",") : g);
  }
  function E(g) {
    return new n(w(g));
  }
  e.stringify = E;
  function w(g) {
    return JSON.stringify(g).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = w;
  function _(g) {
    return typeof g == "string" && e.IDENTIFIER.test(g) ? new n(`.${g}`) : s`[${g}]`;
  }
  e.getProperty = _;
  function b(g) {
    if (typeof g == "string" && e.IDENTIFIER.test(g))
      return new n(`${g}`);
    throw new Error(`CodeGen: invalid export name: ${g}, use explicit $id name mapping`);
  }
  e.getEsmExportName = b;
  function $(g) {
    return new n(g.toString());
  }
  e.regexpCode = $;
})(Ht);
var Or = {}, cs;
function ls() {
  return cs || (cs = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Ht;
    class r extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var n;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(n = e.UsedValueState || (e.UsedValueState = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class s {
      constructor({ prefixes: d, parent: f } = {}) {
        this._names = {}, this._prefixes = d, this._parent = f;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const f = this._names[d] || this._nameGroup(d);
        return `${d}${f.index++}`;
      }
      _nameGroup(d) {
        var f, y;
        if (!((y = (f = this._parent) === null || f === void 0 ? void 0 : f._prefixes) === null || y === void 0) && y.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = s;
    class i extends t.Name {
      constructor(d, f) {
        super(f), this.prefix = d;
      }
      setValue(d, { property: f, itemIndex: y }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(f)}[${y}]`;
      }
    }
    e.ValueScopeName = i;
    const a = (0, t._)`\n`;
    class o extends s {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? a : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new i(d, this._newName(d));
      }
      value(d, f) {
        var y;
        if (f.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const E = this.toName(d), { prefix: w } = E, _ = (y = f.key) !== null && y !== void 0 ? y : f.ref;
        let b = this._values[w];
        if (b) {
          const j = b.get(_);
          if (j)
            return j;
        } else
          b = this._values[w] = /* @__PURE__ */ new Map();
        b.set(_, E);
        const $ = this._scope[w] || (this._scope[w] = []), g = $.length;
        return $[g] = f.ref, E.setValue(f, { property: w, itemIndex: g }), E;
      }
      getValue(d, f) {
        const y = this._values[d];
        if (y)
          return y.get(f);
      }
      scopeRefs(d, f = this._values) {
        return this._reduceValues(f, (y) => {
          if (y.scopePath === void 0)
            throw new Error(`CodeGen: name "${y}" has no value`);
          return (0, t._)`${d}${y.scopePath}`;
        });
      }
      scopeCode(d = this._values, f, y) {
        return this._reduceValues(d, (E) => {
          if (E.value === void 0)
            throw new Error(`CodeGen: name "${E}" has no value`);
          return E.value.code;
        }, f, y);
      }
      _reduceValues(d, f, y = {}, E) {
        let w = t.nil;
        for (const _ in d) {
          const b = d[_];
          if (!b)
            continue;
          const $ = y[_] = y[_] || /* @__PURE__ */ new Map();
          b.forEach((g) => {
            if ($.has(g))
              return;
            $.set(g, n.Started);
            let j = f(g);
            if (j) {
              const O = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              w = (0, t._)`${w}${O} ${g} = ${j};${this.opts._n}`;
            } else if (j = E?.(g))
              w = (0, t._)`${w}${j}${this.opts._n}`;
            else
              throw new r(g);
            $.set(g, n.Completed);
          });
        }
        return w;
      }
    }
    e.ValueScope = o;
  }(Or)), Or;
}
var us;
function ee() {
  return us || (us = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Ht, r = ls();
    var n = Ht;
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
    var s = ls();
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
      optimizeNames(c, h) {
        return this;
      }
    }
    class a extends i {
      constructor(c, h, I) {
        super(), this.varKind = c, this.name = h, this.rhs = I;
      }
      render({ es5: c, _n: h }) {
        const I = c ? r.varKinds.var : this.varKind, V = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${I} ${this.name}${V};` + h;
      }
      optimizeNames(c, h) {
        if (c[this.name.str])
          return this.rhs && (this.rhs = se(this.rhs, c, h)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class o extends i {
      constructor(c, h, I) {
        super(), this.lhs = c, this.rhs = h, this.sideEffects = I;
      }
      render({ _n: c }) {
        return `${this.lhs} = ${this.rhs};` + c;
      }
      optimizeNames(c, h) {
        if (!(this.lhs instanceof t.Name && !c[this.lhs.str] && !this.sideEffects))
          return this.rhs = se(this.rhs, c, h), this;
      }
      get names() {
        const c = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return oe(c, this.rhs);
      }
    }
    class u extends o {
      constructor(c, h, I, V) {
        super(c, I, V), this.op = h;
      }
      render({ _n: c }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + c;
      }
    }
    class d extends i {
      constructor(c) {
        super(), this.label = c, this.names = {};
      }
      render({ _n: c }) {
        return `${this.label}:` + c;
      }
    }
    class f extends i {
      constructor(c) {
        super(), this.label = c, this.names = {};
      }
      render({ _n: c }) {
        return `break${this.label ? ` ${this.label}` : ""};` + c;
      }
    }
    class y extends i {
      constructor(c) {
        super(), this.error = c;
      }
      render({ _n: c }) {
        return `throw ${this.error};` + c;
      }
      get names() {
        return this.error.names;
      }
    }
    class E extends i {
      constructor(c) {
        super(), this.code = c;
      }
      render({ _n: c }) {
        return `${this.code};` + c;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(c, h) {
        return this.code = se(this.code, c, h), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class w extends i {
      constructor(c = []) {
        super(), this.nodes = c;
      }
      render(c) {
        return this.nodes.reduce((h, I) => h + I.render(c), "");
      }
      optimizeNodes() {
        const { nodes: c } = this;
        let h = c.length;
        for (; h--; ) {
          const I = c[h].optimizeNodes();
          Array.isArray(I) ? c.splice(h, 1, ...I) : I ? c[h] = I : c.splice(h, 1);
        }
        return c.length > 0 ? this : void 0;
      }
      optimizeNames(c, h) {
        const { nodes: I } = this;
        let V = I.length;
        for (; V--; ) {
          const z = I[V];
          z.optimizeNames(c, h) || (ke(c, z.names), I.splice(V, 1));
        }
        return I.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((c, h) => Y(c, h.names), {});
      }
    }
    class _ extends w {
      render(c) {
        return "{" + c._n + super.render(c) + "}" + c._n;
      }
    }
    class b extends w {
    }
    class $ extends _ {
    }
    $.kind = "else";
    class g extends _ {
      constructor(c, h) {
        super(h), this.condition = c;
      }
      render(c) {
        let h = `if(${this.condition})` + super.render(c);
        return this.else && (h += "else " + this.else.render(c)), h;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const c = this.condition;
        if (c === !0)
          return this.nodes;
        let h = this.else;
        if (h) {
          const I = h.optimizeNodes();
          h = this.else = Array.isArray(I) ? new $(I) : I;
        }
        if (h)
          return c === !1 ? h instanceof g ? h : h.nodes : this.nodes.length ? this : new g(Le(c), h instanceof g ? [h] : h.nodes);
        if (!(c === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(c, h) {
        var I;
        if (this.else = (I = this.else) === null || I === void 0 ? void 0 : I.optimizeNames(c, h), !!(super.optimizeNames(c, h) || this.else))
          return this.condition = se(this.condition, c, h), this;
      }
      get names() {
        const c = super.names;
        return oe(c, this.condition), this.else && Y(c, this.else.names), c;
      }
    }
    g.kind = "if";
    class j extends _ {
    }
    j.kind = "for";
    class O extends j {
      constructor(c) {
        super(), this.iteration = c;
      }
      render(c) {
        return `for(${this.iteration})` + super.render(c);
      }
      optimizeNames(c, h) {
        if (super.optimizeNames(c, h))
          return this.iteration = se(this.iteration, c, h), this;
      }
      get names() {
        return Y(super.names, this.iteration.names);
      }
    }
    class A extends j {
      constructor(c, h, I, V) {
        super(), this.varKind = c, this.name = h, this.from = I, this.to = V;
      }
      render(c) {
        const h = c.es5 ? r.varKinds.var : this.varKind, { name: I, from: V, to: z } = this;
        return `for(${h} ${I}=${V}; ${I}<${z}; ${I}++)` + super.render(c);
      }
      get names() {
        const c = oe(super.names, this.from);
        return oe(c, this.to);
      }
    }
    class q extends j {
      constructor(c, h, I, V) {
        super(), this.loop = c, this.varKind = h, this.name = I, this.iterable = V;
      }
      render(c) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(c);
      }
      optimizeNames(c, h) {
        if (super.optimizeNames(c, h))
          return this.iterable = se(this.iterable, c, h), this;
      }
      get names() {
        return Y(super.names, this.iterable.names);
      }
    }
    class R extends _ {
      constructor(c, h, I) {
        super(), this.name = c, this.args = h, this.async = I;
      }
      render(c) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(c);
      }
    }
    R.kind = "func";
    class k extends w {
      render(c) {
        return "return " + super.render(c);
      }
    }
    k.kind = "return";
    class M extends _ {
      render(c) {
        let h = "try" + super.render(c);
        return this.catch && (h += this.catch.render(c)), this.finally && (h += this.finally.render(c)), h;
      }
      optimizeNodes() {
        var c, h;
        return super.optimizeNodes(), (c = this.catch) === null || c === void 0 || c.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
      }
      optimizeNames(c, h) {
        var I, V;
        return super.optimizeNames(c, h), (I = this.catch) === null || I === void 0 || I.optimizeNames(c, h), (V = this.finally) === null || V === void 0 || V.optimizeNames(c, h), this;
      }
      get names() {
        const c = super.names;
        return this.catch && Y(c, this.catch.names), this.finally && Y(c, this.finally.names), c;
      }
    }
    class G extends _ {
      constructor(c) {
        super(), this.error = c;
      }
      render(c) {
        return `catch(${this.error})` + super.render(c);
      }
    }
    G.kind = "catch";
    class J extends _ {
      render(c) {
        return "finally" + super.render(c);
      }
    }
    J.kind = "finally";
    class ae {
      constructor(c, h = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = c, this._scope = new r.Scope({ parent: c }), this._nodes = [new b()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(c) {
        return this._scope.name(c);
      }
      // reserves unique name in the external scope
      scopeName(c) {
        return this._extScope.name(c);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(c, h) {
        const I = this._extScope.value(c, h);
        return (this._values[I.prefix] || (this._values[I.prefix] = /* @__PURE__ */ new Set())).add(I), I;
      }
      getScopeValue(c, h) {
        return this._extScope.getValue(c, h);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(c) {
        return this._extScope.scopeRefs(c, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(c, h, I, V) {
        const z = this._scope.toName(h);
        return I !== void 0 && V && (this._constants[z.str] = I), this._leafNode(new a(c, z, I)), z;
      }
      // `const` declaration (`var` in es5 mode)
      const(c, h, I) {
        return this._def(r.varKinds.const, c, h, I);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(c, h, I) {
        return this._def(r.varKinds.let, c, h, I);
      }
      // `var` declaration with optional assignment
      var(c, h, I) {
        return this._def(r.varKinds.var, c, h, I);
      }
      // assignment code
      assign(c, h, I) {
        return this._leafNode(new o(c, h, I));
      }
      // `+=` code
      add(c, h) {
        return this._leafNode(new u(c, e.operators.ADD, h));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        return typeof c == "function" ? c() : c !== t.nil && this._leafNode(new E(c)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...c) {
        const h = ["{"];
        for (const [I, V] of c)
          h.length > 1 && h.push(","), h.push(I), (I !== V || this.opts.es5) && (h.push(":"), (0, t.addCodeArg)(h, V));
        return h.push("}"), new t._Code(h);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(c, h, I) {
        if (this._blockNode(new g(c)), h && I)
          this.code(h).else().code(I).endIf();
        else if (h)
          this.code(h).endIf();
        else if (I)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(c) {
        return this._elseNode(new g(c));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new $());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(g, $);
      }
      _for(c, h) {
        return this._blockNode(c), h && this.code(h).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(c, h) {
        return this._for(new O(c), h);
      }
      // `for` statement for a range of values
      forRange(c, h, I, V, z = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const Z = this._scope.toName(c);
        return this._for(new A(z, Z, h, I), () => V(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(c, h, I, V = r.varKinds.const) {
        const z = this._scope.toName(c);
        if (this.opts.es5) {
          const Z = h instanceof t.Name ? h : this.var("_arr", h);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Q) => {
            this.var(z, (0, t._)`${Z}[${Q}]`), I(z);
          });
        }
        return this._for(new q("of", V, z, h), () => I(z));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(c, h, I, V = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(c, (0, t._)`Object.keys(${h})`, I);
        const z = this._scope.toName(c);
        return this._for(new q("in", V, z, h), () => I(z));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(j);
      }
      // `label` statement
      label(c) {
        return this._leafNode(new d(c));
      }
      // `break` statement
      break(c) {
        return this._leafNode(new f(c));
      }
      // `return` statement
      return(c) {
        const h = new k();
        if (this._blockNode(h), this.code(c), h.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(k);
      }
      // `try` statement
      try(c, h, I) {
        if (!h && !I)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const V = new M();
        if (this._blockNode(V), this.code(c), h) {
          const z = this.name("e");
          this._currNode = V.catch = new G(z), h(z);
        }
        return I && (this._currNode = V.finally = new J(), this.code(I)), this._endBlockNode(G, J);
      }
      // `throw` statement
      throw(c) {
        return this._leafNode(new y(c));
      }
      // start self-balancing block
      block(c, h) {
        return this._blockStarts.push(this._nodes.length), c && this.code(c).endBlock(h), this;
      }
      // end the current self-balancing block
      endBlock(c) {
        const h = this._blockStarts.pop();
        if (h === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const I = this._nodes.length - h;
        if (I < 0 || c !== void 0 && I !== c)
          throw new Error(`CodeGen: wrong number of nodes: ${I} vs ${c} expected`);
        return this._nodes.length = h, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(c, h = t.nil, I, V) {
        return this._blockNode(new R(c, h, I)), V && this.code(V).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(R);
      }
      optimize(c = 1) {
        for (; c-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(c) {
        return this._currNode.nodes.push(c), this;
      }
      _blockNode(c) {
        this._currNode.nodes.push(c), this._nodes.push(c);
      }
      _endBlockNode(c, h) {
        const I = this._currNode;
        if (I instanceof c || h && I instanceof h)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${h ? `${c.kind}/${h.kind}` : c.kind}"`);
      }
      _elseNode(c) {
        const h = this._currNode;
        if (!(h instanceof g))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = h.else = c, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const c = this._nodes;
        return c[c.length - 1];
      }
      set _currNode(c) {
        const h = this._nodes;
        h[h.length - 1] = c;
      }
    }
    e.CodeGen = ae;
    function Y(T, c) {
      for (const h in c)
        T[h] = (T[h] || 0) + (c[h] || 0);
      return T;
    }
    function oe(T, c) {
      return c instanceof t._CodeOrName ? Y(T, c.names) : T;
    }
    function se(T, c, h) {
      if (T instanceof t.Name)
        return I(T);
      if (!V(T))
        return T;
      return new t._Code(T._items.reduce((z, Z) => (Z instanceof t.Name && (Z = I(Z)), Z instanceof t._Code ? z.push(...Z._items) : z.push(Z), z), []));
      function I(z) {
        const Z = h[z.str];
        return Z === void 0 || c[z.str] !== 1 ? z : (delete c[z.str], Z);
      }
      function V(z) {
        return z instanceof t._Code && z._items.some((Z) => Z instanceof t.Name && c[Z.str] === 1 && h[Z.str] !== void 0);
      }
    }
    function ke(T, c) {
      for (const h in c)
        T[h] = (T[h] || 0) - (c[h] || 0);
    }
    function Le(T) {
      return typeof T == "boolean" || typeof T == "number" || T === null ? !T : (0, t._)`!${F(T)}`;
    }
    e.not = Le;
    const Ke = P(e.operators.AND);
    function nt(...T) {
      return T.reduce(Ke);
    }
    e.and = nt;
    const Ye = P(e.operators.OR);
    function L(...T) {
      return T.reduce(Ye);
    }
    e.or = L;
    function P(T) {
      return (c, h) => c === t.nil ? h : h === t.nil ? c : (0, t._)`${F(c)} ${T} ${F(h)}`;
    }
    function F(T) {
      return T instanceof t.Name ? T : (0, t._)`(${T})`;
    }
  }(Nr)), Nr;
}
var ne = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.checkStrictMode = e.getErrorPath = e.Type = e.useFunc = e.setEvaluated = e.evaluatedPropsToName = e.mergeEvaluated = e.eachItem = e.unescapeJsonPointer = e.escapeJsonPointer = e.escapeFragment = e.unescapeFragment = e.schemaRefOrVal = e.schemaHasRulesButRef = e.schemaHasRules = e.checkUnknownRules = e.alwaysValidSchema = e.toHash = void 0;
  const t = ee(), r = Ht;
  function n(R) {
    const k = {};
    for (const M of R)
      k[M] = !0;
    return k;
  }
  e.toHash = n;
  function s(R, k) {
    return typeof k == "boolean" ? k : Object.keys(k).length === 0 ? !0 : (i(R, k), !a(k, R.self.RULES.all));
  }
  e.alwaysValidSchema = s;
  function i(R, k = R.schema) {
    const { opts: M, self: G } = R;
    if (!M.strictSchema || typeof k == "boolean")
      return;
    const J = G.RULES.keywords;
    for (const ae in k)
      J[ae] || q(R, `unknown keyword: "${ae}"`);
  }
  e.checkUnknownRules = i;
  function a(R, k) {
    if (typeof R == "boolean")
      return !R;
    for (const M in R)
      if (k[M])
        return !0;
    return !1;
  }
  e.schemaHasRules = a;
  function o(R, k) {
    if (typeof R == "boolean")
      return !R;
    for (const M in R)
      if (M !== "$ref" && k.all[M])
        return !0;
    return !1;
  }
  e.schemaHasRulesButRef = o;
  function u({ topSchemaRef: R, schemaPath: k }, M, G, J) {
    if (!J) {
      if (typeof M == "number" || typeof M == "boolean")
        return M;
      if (typeof M == "string")
        return (0, t._)`${M}`;
    }
    return (0, t._)`${R}${k}${(0, t.getProperty)(G)}`;
  }
  e.schemaRefOrVal = u;
  function d(R) {
    return E(decodeURIComponent(R));
  }
  e.unescapeFragment = d;
  function f(R) {
    return encodeURIComponent(y(R));
  }
  e.escapeFragment = f;
  function y(R) {
    return typeof R == "number" ? `${R}` : R.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  e.escapeJsonPointer = y;
  function E(R) {
    return R.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  e.unescapeJsonPointer = E;
  function w(R, k) {
    if (Array.isArray(R))
      for (const M of R)
        k(M);
    else
      k(R);
  }
  e.eachItem = w;
  function _({ mergeNames: R, mergeToName: k, mergeValues: M, resultToName: G }) {
    return (J, ae, Y, oe) => {
      const se = Y === void 0 ? ae : Y instanceof t.Name ? (ae instanceof t.Name ? R(J, ae, Y) : k(J, ae, Y), Y) : ae instanceof t.Name ? (k(J, Y, ae), ae) : M(ae, Y);
      return oe === t.Name && !(se instanceof t.Name) ? G(J, se) : se;
    };
  }
  e.mergeEvaluated = {
    props: _({
      mergeNames: (R, k, M) => R.if((0, t._)`${M} !== true && ${k} !== undefined`, () => {
        R.if((0, t._)`${k} === true`, () => R.assign(M, !0), () => R.assign(M, (0, t._)`${M} || {}`).code((0, t._)`Object.assign(${M}, ${k})`));
      }),
      mergeToName: (R, k, M) => R.if((0, t._)`${M} !== true`, () => {
        k === !0 ? R.assign(M, !0) : (R.assign(M, (0, t._)`${M} || {}`), $(R, M, k));
      }),
      mergeValues: (R, k) => R === !0 ? !0 : { ...R, ...k },
      resultToName: b
    }),
    items: _({
      mergeNames: (R, k, M) => R.if((0, t._)`${M} !== true && ${k} !== undefined`, () => R.assign(M, (0, t._)`${k} === true ? true : ${M} > ${k} ? ${M} : ${k}`)),
      mergeToName: (R, k, M) => R.if((0, t._)`${M} !== true`, () => R.assign(M, k === !0 ? !0 : (0, t._)`${M} > ${k} ? ${M} : ${k}`)),
      mergeValues: (R, k) => R === !0 ? !0 : Math.max(R, k),
      resultToName: (R, k) => R.var("items", k)
    })
  };
  function b(R, k) {
    if (k === !0)
      return R.var("props", !0);
    const M = R.var("props", (0, t._)`{}`);
    return k !== void 0 && $(R, M, k), M;
  }
  e.evaluatedPropsToName = b;
  function $(R, k, M) {
    Object.keys(M).forEach((G) => R.assign((0, t._)`${k}${(0, t.getProperty)(G)}`, !0));
  }
  e.setEvaluated = $;
  const g = {};
  function j(R, k) {
    return R.scopeValue("func", {
      ref: k,
      code: g[k.code] || (g[k.code] = new r._Code(k.code))
    });
  }
  e.useFunc = j;
  var O;
  (function(R) {
    R[R.Num = 0] = "Num", R[R.Str = 1] = "Str";
  })(O = e.Type || (e.Type = {}));
  function A(R, k, M) {
    if (R instanceof t.Name) {
      const G = k === O.Num;
      return M ? G ? (0, t._)`"[" + ${R} + "]"` : (0, t._)`"['" + ${R} + "']"` : G ? (0, t._)`"/" + ${R}` : (0, t._)`"/" + ${R}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return M ? (0, t.getProperty)(R).toString() : "/" + y(R);
  }
  e.getErrorPath = A;
  function q(R, k, M = R.opts.strictSchema) {
    if (M) {
      if (k = `strict mode: ${k}`, M === !0)
        throw new Error(k);
      R.self.logger.warn(k);
    }
  }
  e.checkStrictMode = q;
})(ne);
var Zt = {}, ds;
function rt() {
  if (ds)
    return Zt;
  ds = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = ee(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    errors: new e.Name("errors"),
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Zt.default = t, Zt;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee(), r = ne, n = rt();
  e.keywordError = {
    message: ({ keyword: $ }) => (0, t.str)`must pass "${$}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: $, schemaType: g }) => g ? (0, t.str)`"${$}" keyword must be ${g} ($data)` : (0, t.str)`"${$}" keyword is invalid ($data)`
  };
  function s($, g = e.keywordError, j, O) {
    const { it: A } = $, { gen: q, compositeRule: R, allErrors: k } = A, M = y($, g, j);
    O ?? (R || k) ? u(q, M) : d(A, (0, t._)`[${M}]`);
  }
  e.reportError = s;
  function i($, g = e.keywordError, j) {
    const { it: O } = $, { gen: A, compositeRule: q, allErrors: R } = O, k = y($, g, j);
    u(A, k), q || R || d(O, n.default.vErrors);
  }
  e.reportExtraError = i;
  function a($, g) {
    $.assign(n.default.errors, g), $.if((0, t._)`${n.default.vErrors} !== null`, () => $.if(g, () => $.assign((0, t._)`${n.default.vErrors}.length`, g), () => $.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = a;
  function o({ gen: $, keyword: g, schemaValue: j, data: O, errsCount: A, it: q }) {
    if (A === void 0)
      throw new Error("ajv implementation error");
    const R = $.name("err");
    $.forRange("i", A, n.default.errors, (k) => {
      $.const(R, (0, t._)`${n.default.vErrors}[${k}]`), $.if((0, t._)`${R}.instancePath === undefined`, () => $.assign((0, t._)`${R}.instancePath`, (0, t.strConcat)(n.default.instancePath, q.errorPath))), $.assign((0, t._)`${R}.schemaPath`, (0, t.str)`${q.errSchemaPath}/${g}`), q.opts.verbose && ($.assign((0, t._)`${R}.schema`, j), $.assign((0, t._)`${R}.data`, O));
    });
  }
  e.extendErrors = o;
  function u($, g) {
    const j = $.const("err", g);
    $.if((0, t._)`${n.default.vErrors} === null`, () => $.assign(n.default.vErrors, (0, t._)`[${j}]`), (0, t._)`${n.default.vErrors}.push(${j})`), $.code((0, t._)`${n.default.errors}++`);
  }
  function d($, g) {
    const { gen: j, validateName: O, schemaEnv: A } = $;
    A.$async ? j.throw((0, t._)`new ${$.ValidationError}(${g})`) : (j.assign((0, t._)`${O}.errors`, g), j.return(!1));
  }
  const f = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function y($, g, j) {
    const { createErrors: O } = $.it;
    return O === !1 ? (0, t._)`{}` : E($, g, j);
  }
  function E($, g, j = {}) {
    const { gen: O, it: A } = $, q = [
      w(A, j),
      _($, j)
    ];
    return b($, g, q), O.object(...q);
  }
  function w({ errorPath: $ }, { instancePath: g }) {
    const j = g ? (0, t.str)`${$}${(0, r.getErrorPath)(g, r.Type.Str)}` : $;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, j)];
  }
  function _({ keyword: $, it: { errSchemaPath: g } }, { schemaPath: j, parentSchema: O }) {
    let A = O ? g : (0, t.str)`${g}/${$}`;
    return j && (A = (0, t.str)`${A}${(0, r.getErrorPath)(j, r.Type.Str)}`), [f.schemaPath, A];
  }
  function b($, { params: g, message: j }, O) {
    const { keyword: A, data: q, schemaValue: R, it: k } = $, { opts: M, propertyName: G, topSchemaRef: J, schemaPath: ae } = k;
    O.push([f.keyword, A], [f.params, typeof g == "function" ? g($) : g || (0, t._)`{}`]), M.messages && O.push([f.message, typeof j == "function" ? j($) : j]), M.verbose && O.push([f.schema, R], [f.parentSchema, (0, t._)`${J}${ae}`], [n.default.data, q]), G && O.push([f.propertyName, G]);
  }
})(Kt);
var fs;
function za() {
  if (fs)
    return ct;
  fs = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.boolOrEmptySchema = ct.topBoolOrEmptySchema = void 0;
  const e = Kt, t = ee(), r = rt(), n = {
    message: "boolean schema is false"
  };
  function s(o) {
    const { gen: u, schema: d, validateName: f } = o;
    d === !1 ? a(o, !1) : typeof d == "object" && d.$async === !0 ? u.return(r.default.data) : (u.assign((0, t._)`${f}.errors`, null), u.return(!0));
  }
  ct.topBoolOrEmptySchema = s;
  function i(o, u) {
    const { gen: d, schema: f } = o;
    f === !1 ? (d.var(u, !1), a(o)) : d.var(u, !0);
  }
  ct.boolOrEmptySchema = i;
  function a(o, u) {
    const { gen: d, data: f } = o, y = {
      gen: d,
      keyword: "false schema",
      data: f,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, e.reportError)(y, n, void 0, u);
  }
  return ct;
}
var Wt = {}, ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.getRules = ht.isJSONType = void 0;
const Ha = ["string", "number", "integer", "boolean", "null", "object", "array"], Wa = new Set(Ha);
function Ka(e) {
  return typeof e == "string" && Wa.has(e);
}
ht.isJSONType = Ka;
function Ga() {
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
ht.getRules = Ga;
var xe = {}, ps;
function Ys() {
  if (ps)
    return xe;
  ps = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.shouldUseRule = xe.shouldUseGroup = xe.schemaHasRulesForType = void 0;
  function e({ schema: n, self: s }, i) {
    const a = s.RULES.types[i];
    return a && a !== !0 && t(n, a);
  }
  xe.schemaHasRulesForType = e;
  function t(n, s) {
    return s.rules.some((i) => r(n, i));
  }
  xe.shouldUseGroup = t;
  function r(n, s) {
    var i;
    return n[s.keyword] !== void 0 || ((i = s.definition.implements) === null || i === void 0 ? void 0 : i.some((a) => n[a] !== void 0));
  }
  return xe.shouldUseRule = r, xe;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.reportTypeError = e.checkDataTypes = e.checkDataType = e.coerceAndCheckDataType = e.getJSONTypes = e.getSchemaTypes = e.DataType = void 0;
  const t = ht, r = Ys(), n = Kt, s = ee(), i = ne;
  var a;
  (function(O) {
    O[O.Correct = 0] = "Correct", O[O.Wrong = 1] = "Wrong";
  })(a = e.DataType || (e.DataType = {}));
  function o(O) {
    const A = u(O.type);
    if (A.includes("null")) {
      if (O.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!A.length && O.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      O.nullable === !0 && A.push("null");
    }
    return A;
  }
  e.getSchemaTypes = o;
  function u(O) {
    const A = Array.isArray(O) ? O : O ? [O] : [];
    if (A.every(t.isJSONType))
      return A;
    throw new Error("type must be JSONType or JSONType[]: " + A.join(","));
  }
  e.getJSONTypes = u;
  function d(O, A) {
    const { gen: q, data: R, opts: k } = O, M = y(A, k.coerceTypes), G = A.length > 0 && !(M.length === 0 && A.length === 1 && (0, r.schemaHasRulesForType)(O, A[0]));
    if (G) {
      const J = b(A, R, k.strictNumbers, a.Wrong);
      q.if(J, () => {
        M.length ? E(O, A, M) : g(O);
      });
    }
    return G;
  }
  e.coerceAndCheckDataType = d;
  const f = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function y(O, A) {
    return A ? O.filter((q) => f.has(q) || A === "array" && q === "array") : [];
  }
  function E(O, A, q) {
    const { gen: R, data: k, opts: M } = O, G = R.let("dataType", (0, s._)`typeof ${k}`), J = R.let("coerced", (0, s._)`undefined`);
    M.coerceTypes === "array" && R.if((0, s._)`${G} == 'object' && Array.isArray(${k}) && ${k}.length == 1`, () => R.assign(k, (0, s._)`${k}[0]`).assign(G, (0, s._)`typeof ${k}`).if(b(A, k, M.strictNumbers), () => R.assign(J, k))), R.if((0, s._)`${J} !== undefined`);
    for (const Y of q)
      (f.has(Y) || Y === "array" && M.coerceTypes === "array") && ae(Y);
    R.else(), g(O), R.endIf(), R.if((0, s._)`${J} !== undefined`, () => {
      R.assign(k, J), w(O, J);
    });
    function ae(Y) {
      switch (Y) {
        case "string":
          R.elseIf((0, s._)`${G} == "number" || ${G} == "boolean"`).assign(J, (0, s._)`"" + ${k}`).elseIf((0, s._)`${k} === null`).assign(J, (0, s._)`""`);
          return;
        case "number":
          R.elseIf((0, s._)`${G} == "boolean" || ${k} === null
              || (${G} == "string" && ${k} && ${k} == +${k})`).assign(J, (0, s._)`+${k}`);
          return;
        case "integer":
          R.elseIf((0, s._)`${G} === "boolean" || ${k} === null
              || (${G} === "string" && ${k} && ${k} == +${k} && !(${k} % 1))`).assign(J, (0, s._)`+${k}`);
          return;
        case "boolean":
          R.elseIf((0, s._)`${k} === "false" || ${k} === 0 || ${k} === null`).assign(J, !1).elseIf((0, s._)`${k} === "true" || ${k} === 1`).assign(J, !0);
          return;
        case "null":
          R.elseIf((0, s._)`${k} === "" || ${k} === 0 || ${k} === false`), R.assign(J, null);
          return;
        case "array":
          R.elseIf((0, s._)`${G} === "string" || ${G} === "number"
              || ${G} === "boolean" || ${k} === null`).assign(J, (0, s._)`[${k}]`);
      }
    }
  }
  function w({ gen: O, parentData: A, parentDataProperty: q }, R) {
    O.if((0, s._)`${A} !== undefined`, () => O.assign((0, s._)`${A}[${q}]`, R));
  }
  function _(O, A, q, R = a.Correct) {
    const k = R === a.Correct ? s.operators.EQ : s.operators.NEQ;
    let M;
    switch (O) {
      case "null":
        return (0, s._)`${A} ${k} null`;
      case "array":
        M = (0, s._)`Array.isArray(${A})`;
        break;
      case "object":
        M = (0, s._)`${A} && typeof ${A} == "object" && !Array.isArray(${A})`;
        break;
      case "integer":
        M = G((0, s._)`!(${A} % 1) && !isNaN(${A})`);
        break;
      case "number":
        M = G();
        break;
      default:
        return (0, s._)`typeof ${A} ${k} ${O}`;
    }
    return R === a.Correct ? M : (0, s.not)(M);
    function G(J = s.nil) {
      return (0, s.and)((0, s._)`typeof ${A} == "number"`, J, q ? (0, s._)`isFinite(${A})` : s.nil);
    }
  }
  e.checkDataType = _;
  function b(O, A, q, R) {
    if (O.length === 1)
      return _(O[0], A, q, R);
    let k;
    const M = (0, i.toHash)(O);
    if (M.array && M.object) {
      const G = (0, s._)`typeof ${A} != "object"`;
      k = M.null ? G : (0, s._)`!${A} || ${G}`, delete M.null, delete M.array, delete M.object;
    } else
      k = s.nil;
    M.number && delete M.integer;
    for (const G in M)
      k = (0, s.and)(k, _(G, A, q, R));
    return k;
  }
  e.checkDataTypes = b;
  const $ = {
    message: ({ schema: O }) => `must be ${O}`,
    params: ({ schema: O, schemaValue: A }) => typeof O == "string" ? (0, s._)`{type: ${O}}` : (0, s._)`{type: ${A}}`
  };
  function g(O) {
    const A = j(O);
    (0, n.reportError)(A, $);
  }
  e.reportTypeError = g;
  function j(O) {
    const { gen: A, data: q, schema: R } = O, k = (0, i.schemaRefOrVal)(O, R, "type");
    return {
      gen: A,
      keyword: "type",
      data: q,
      schema: R.type,
      schemaCode: k,
      schemaValue: k,
      parentSchema: R,
      params: {},
      it: O
    };
  }
})(Wt);
var At = {}, hs;
function Ba() {
  if (hs)
    return At;
  hs = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.assignDefaults = void 0;
  const e = ee(), t = ne;
  function r(s, i) {
    const { properties: a, items: o } = s.schema;
    if (i === "object" && a)
      for (const u in a)
        n(s, u, a[u].default);
    else
      i === "array" && Array.isArray(o) && o.forEach((u, d) => n(s, d, u.default));
  }
  At.assignDefaults = r;
  function n(s, i, a) {
    const { gen: o, compositeRule: u, data: d, opts: f } = s;
    if (a === void 0)
      return;
    const y = (0, e._)`${d}${(0, e.getProperty)(i)}`;
    if (u) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${y}`);
      return;
    }
    let E = (0, e._)`${y} === undefined`;
    f.useDefaults === "empty" && (E = (0, e._)`${E} || ${y} === null || ${y} === ""`), o.if(E, (0, e._)`${y} = ${(0, e.stringify)(a)}`);
  }
  return At;
}
var Ie = {}, X = {};
Object.defineProperty(X, "__esModule", { value: !0 });
X.validateUnion = X.validateArray = X.usePattern = X.callValidateCode = X.schemaProperties = X.allSchemaProperties = X.noPropertyInData = X.propertyInData = X.isOwnProperty = X.hasPropFunc = X.reportMissingProp = X.checkMissingProp = X.checkReportMissingProp = void 0;
const ue = ee(), Yr = ne, Xe = rt(), xa = ne;
function Ja(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Qr(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
X.checkReportMissingProp = Ja;
function Ya({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((i) => (0, ue.and)(Qr(e, t, i, r.ownProperties), (0, ue._)`${s} = ${i}`)));
}
X.checkMissingProp = Ya;
function Za(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
X.reportMissingProp = Za;
function Zs(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
X.hasPropFunc = Zs;
function Zr(e, t, r) {
  return (0, ue._)`${Zs(e)}.call(${t}, ${r})`;
}
X.isOwnProperty = Zr;
function Qa(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${Zr(e, t, r)}` : s;
}
X.propertyInData = Qa;
function Qr(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(Zr(e, t, r))) : s;
}
X.noPropertyInData = Qr;
function Qs(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
X.allSchemaProperties = Qs;
function Xa(e, t) {
  return Qs(t).filter((r) => !(0, Yr.alwaysValidSchema)(e, t[r]));
}
X.schemaProperties = Xa;
function eo({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: i }, it: a }, o, u, d) {
  const f = d ? (0, ue._)`${e}, ${t}, ${n}${s}` : t, y = [
    [Xe.default.instancePath, (0, ue.strConcat)(Xe.default.instancePath, i)],
    [Xe.default.parentData, a.parentData],
    [Xe.default.parentDataProperty, a.parentDataProperty],
    [Xe.default.rootData, Xe.default.rootData]
  ];
  a.opts.dynamicRef && y.push([Xe.default.dynamicAnchors, Xe.default.dynamicAnchors]);
  const E = (0, ue._)`${f}, ${r.object(...y)}`;
  return u !== ue.nil ? (0, ue._)`${o}.call(${u}, ${E})` : (0, ue._)`${o}(${E})`;
}
X.callValidateCode = eo;
const to = (0, ue._)`new RegExp`;
function ro({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, i = s(r, n);
  return e.scopeValue("pattern", {
    key: i.toString(),
    ref: i,
    code: (0, ue._)`${s.code === "new RegExp" ? to : (0, xa.useFunc)(e, s)}(${r}, ${n})`
  });
}
X.usePattern = ro;
function no(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, i = t.name("valid");
  if (s.allErrors) {
    const o = t.let("valid", !0);
    return a(() => t.assign(o, !1)), o;
  }
  return t.var(i, !0), a(() => t.break()), i;
  function a(o) {
    const u = t.const("len", (0, ue._)`${r}.length`);
    t.forRange("i", 0, u, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: Yr.Type.Num
      }, i), t.if((0, ue.not)(i), o);
    });
  }
}
X.validateArray = no;
function so(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((u) => (0, Yr.alwaysValidSchema)(s, u)) && !s.opts.unevaluated)
    return;
  const a = t.let("valid", !1), o = t.name("_valid");
  t.block(() => r.forEach((u, d) => {
    const f = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, o);
    t.assign(a, (0, ue._)`${a} || ${o}`), e.mergeValidEvaluated(f, o) || t.if((0, ue.not)(a));
  })), e.result(a, () => e.reset(), () => e.error(!0));
}
X.validateUnion = so;
var ms;
function io() {
  if (ms)
    return Ie;
  ms = 1, Object.defineProperty(Ie, "__esModule", { value: !0 }), Ie.validateKeywordUsage = Ie.validSchemaType = Ie.funcKeywordCode = Ie.macroKeywordCode = void 0;
  const e = ee(), t = rt(), r = X, n = Kt;
  function s(E, w) {
    const { gen: _, keyword: b, schema: $, parentSchema: g, it: j } = E, O = w.macro.call(j.self, $, g, j), A = d(_, b, O);
    j.opts.validateSchema !== !1 && j.self.validateSchema(O, !0);
    const q = _.name("valid");
    E.subschema({
      schema: O,
      schemaPath: e.nil,
      errSchemaPath: `${j.errSchemaPath}/${b}`,
      topSchemaRef: A,
      compositeRule: !0
    }, q), E.pass(q, () => E.error(!0));
  }
  Ie.macroKeywordCode = s;
  function i(E, w) {
    var _;
    const { gen: b, keyword: $, schema: g, parentSchema: j, $data: O, it: A } = E;
    u(A, w);
    const q = !O && w.compile ? w.compile.call(A.self, g, j, A) : w.validate, R = d(b, $, q), k = b.let("valid");
    E.block$data(k, M), E.ok((_ = w.valid) !== null && _ !== void 0 ? _ : k);
    function M() {
      if (w.errors === !1)
        ae(), w.modifying && a(E), Y(() => E.error());
      else {
        const oe = w.async ? G() : J();
        w.modifying && a(E), Y(() => o(E, oe));
      }
    }
    function G() {
      const oe = b.let("ruleErrs", null);
      return b.try(() => ae((0, e._)`await `), (se) => b.assign(k, !1).if((0, e._)`${se} instanceof ${A.ValidationError}`, () => b.assign(oe, (0, e._)`${se}.errors`), () => b.throw(se))), oe;
    }
    function J() {
      const oe = (0, e._)`${R}.errors`;
      return b.assign(oe, null), ae(e.nil), oe;
    }
    function ae(oe = w.async ? (0, e._)`await ` : e.nil) {
      const se = A.opts.passContext ? t.default.this : t.default.self, ke = !("compile" in w && !O || w.schema === !1);
      b.assign(k, (0, e._)`${oe}${(0, r.callValidateCode)(E, R, se, ke)}`, w.modifying);
    }
    function Y(oe) {
      var se;
      b.if((0, e.not)((se = w.valid) !== null && se !== void 0 ? se : k), oe);
    }
  }
  Ie.funcKeywordCode = i;
  function a(E) {
    const { gen: w, data: _, it: b } = E;
    w.if(b.parentData, () => w.assign(_, (0, e._)`${b.parentData}[${b.parentDataProperty}]`));
  }
  function o(E, w) {
    const { gen: _ } = E;
    _.if((0, e._)`Array.isArray(${w})`, () => {
      _.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${w} : ${t.default.vErrors}.concat(${w})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(E);
    }, () => E.error());
  }
  function u({ schemaEnv: E }, w) {
    if (w.async && !E.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(E, w, _) {
    if (_ === void 0)
      throw new Error(`keyword "${w}" failed to compile`);
    return E.scopeValue("keyword", typeof _ == "function" ? { ref: _ } : { ref: _, code: (0, e.stringify)(_) });
  }
  function f(E, w, _ = !1) {
    return !w.length || w.some((b) => b === "array" ? Array.isArray(E) : b === "object" ? E && typeof E == "object" && !Array.isArray(E) : typeof E == b || _ && typeof E > "u");
  }
  Ie.validSchemaType = f;
  function y({ schema: E, opts: w, self: _, errSchemaPath: b }, $, g) {
    if (Array.isArray($.keyword) ? !$.keyword.includes(g) : $.keyword !== g)
      throw new Error("ajv implementation error");
    const j = $.dependencies;
    if (j?.some((O) => !Object.prototype.hasOwnProperty.call(E, O)))
      throw new Error(`parent schema must have dependencies of ${g}: ${j.join(",")}`);
    if ($.validateSchema && !$.validateSchema(E[g])) {
      const A = `keyword "${g}" value is invalid at path "${b}": ` + _.errorsText($.validateSchema.errors);
      if (w.validateSchema === "log")
        _.logger.error(A);
      else
        throw new Error(A);
    }
  }
  return Ie.validateKeywordUsage = y, Ie;
}
var Je = {}, ys;
function ao() {
  if (ys)
    return Je;
  ys = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.extendSubschemaMode = Je.extendSubschemaData = Je.getSubschema = void 0;
  const e = ee(), t = ne;
  function r(i, { keyword: a, schemaProp: o, schema: u, schemaPath: d, errSchemaPath: f, topSchemaRef: y }) {
    if (a !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (a !== void 0) {
      const E = i.schema[a];
      return o === void 0 ? {
        schema: E,
        schemaPath: (0, e._)`${i.schemaPath}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${i.errSchemaPath}/${a}`
      } : {
        schema: E[o],
        schemaPath: (0, e._)`${i.schemaPath}${(0, e.getProperty)(a)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${i.errSchemaPath}/${a}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (u !== void 0) {
      if (d === void 0 || f === void 0 || y === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: d,
        topSchemaRef: y,
        errSchemaPath: f
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Je.getSubschema = r;
  function n(i, a, { dataProp: o, dataPropType: u, data: d, dataTypes: f, propertyName: y }) {
    if (d !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: E } = a;
    if (o !== void 0) {
      const { errorPath: _, dataPathArr: b, opts: $ } = a, g = E.let("data", (0, e._)`${a.data}${(0, e.getProperty)(o)}`, !0);
      w(g), i.errorPath = (0, e.str)`${_}${(0, t.getErrorPath)(o, u, $.jsPropertySyntax)}`, i.parentDataProperty = (0, e._)`${o}`, i.dataPathArr = [...b, i.parentDataProperty];
    }
    if (d !== void 0) {
      const _ = d instanceof e.Name ? d : E.let("data", d, !0);
      w(_), y !== void 0 && (i.propertyName = y);
    }
    f && (i.dataTypes = f);
    function w(_) {
      i.data = _, i.dataLevel = a.dataLevel + 1, i.dataTypes = [], a.definedProperties = /* @__PURE__ */ new Set(), i.parentData = a.data, i.dataNames = [...a.dataNames, _];
    }
  }
  Je.extendSubschemaData = n;
  function s(i, { jtdDiscriminator: a, jtdMetadata: o, compositeRule: u, createErrors: d, allErrors: f }) {
    u !== void 0 && (i.compositeRule = u), d !== void 0 && (i.createErrors = d), f !== void 0 && (i.allErrors = f), i.jtdDiscriminator = a, i.jtdMetadata = o;
  }
  return Je.extendSubschemaMode = s, Je;
}
var Pe = {}, Xs = function e(t, r) {
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
}, ei = { exports: {} }, tt = ei.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  or(t, n, s, e, "", e);
};
tt.keywords = {
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
tt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
tt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
tt.skipKeywords = {
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
function or(e, t, r, n, s, i, a, o, u, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, i, a, o, u, d);
    for (var f in n) {
      var y = n[f];
      if (Array.isArray(y)) {
        if (f in tt.arrayKeywords)
          for (var E = 0; E < y.length; E++)
            or(e, t, r, y[E], s + "/" + f + "/" + E, i, s, f, n, E);
      } else if (f in tt.propsKeywords) {
        if (y && typeof y == "object")
          for (var w in y)
            or(e, t, r, y[w], s + "/" + f + "/" + oo(w), i, s, f, n, w);
      } else
        (f in tt.keywords || e.allKeys && !(f in tt.skipKeywords)) && or(e, t, r, y, s + "/" + f, i, s, f, n);
    }
    r(n, s, i, a, o, u, d);
  }
}
function oo(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var co = ei.exports;
Object.defineProperty(Pe, "__esModule", { value: !0 });
Pe.getSchemaRefs = Pe.resolveUrl = Pe.normalizeId = Pe._getFullPath = Pe.getFullPath = Pe.inlineRef = void 0;
const lo = ne, uo = Xs, fo = co, po = /* @__PURE__ */ new Set([
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
function ho(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Fr(e) : t ? ti(e) <= t : !1;
}
Pe.inlineRef = ho;
const mo = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Fr(e) {
  for (const t in e) {
    if (mo.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Fr) || typeof r == "object" && Fr(r))
      return !0;
  }
  return !1;
}
function ti(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !po.has(r) && (typeof e[r] == "object" && (0, lo.eachItem)(e[r], (n) => t += ti(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function ri(e, t = "", r) {
  r !== !1 && (t = Et(t));
  const n = e.parse(t);
  return ni(e, n);
}
Pe.getFullPath = ri;
function ni(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Pe._getFullPath = ni;
const yo = /#\/?$/;
function Et(e) {
  return e ? e.replace(yo, "") : "";
}
Pe.normalizeId = Et;
function go(e, t, r) {
  return r = Et(r), e.resolve(t, r);
}
Pe.resolveUrl = go;
const vo = /^[a-z_][-a-z0-9._]*$/i;
function $o(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Et(e[r] || t), i = { "": s }, a = ri(n, s, !1), o = {}, u = /* @__PURE__ */ new Set();
  return fo(e, { allKeys: !0 }, (y, E, w, _) => {
    if (_ === void 0)
      return;
    const b = a + E;
    let $ = i[_];
    typeof y[r] == "string" && ($ = g.call(this, y[r])), j.call(this, y.$anchor), j.call(this, y.$dynamicAnchor), i[E] = $;
    function g(O) {
      const A = this.opts.uriResolver.resolve;
      if (O = Et($ ? A($, O) : O), u.has(O))
        throw f(O);
      u.add(O);
      let q = this.refs[O];
      return typeof q == "string" && (q = this.refs[q]), typeof q == "object" ? d(y, q.schema, O) : O !== Et(b) && (O[0] === "#" ? (d(y, o[O], O), o[O] = y) : this.refs[O] = b), O;
    }
    function j(O) {
      if (typeof O == "string") {
        if (!vo.test(O))
          throw new Error(`invalid anchor "${O}"`);
        g.call(this, `#${O}`);
      }
    }
  }), o;
  function d(y, E, w) {
    if (E !== void 0 && !uo(y, E))
      throw f(w);
  }
  function f(y) {
    return new Error(`reference "${y}" resolves to more than one schema`);
  }
}
Pe.getSchemaRefs = $o;
var gs;
function br() {
  if (gs)
    return Be;
  gs = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.getData = Be.KeywordCxt = Be.validateFunctionCode = void 0;
  const e = za(), t = Wt, r = Ys(), n = Wt, s = Ba(), i = io(), a = ao(), o = ee(), u = rt(), d = Pe, f = ne, y = Kt;
  function E(v) {
    if (q(v) && (k(v), A(v))) {
      $(v);
      return;
    }
    w(v, () => (0, e.topBoolOrEmptySchema)(v));
  }
  Be.validateFunctionCode = E;
  function w({ gen: v, validateName: S, schema: D, schemaEnv: U, opts: H }, B) {
    H.code.es5 ? v.func(S, (0, o._)`${u.default.data}, ${u.default.valCxt}`, U.$async, () => {
      v.code((0, o._)`"use strict"; ${j(D, H)}`), b(v, H), v.code(B);
    }) : v.func(S, (0, o._)`${u.default.data}, ${_(H)}`, U.$async, () => v.code(j(D, H)).code(B));
  }
  function _(v) {
    return (0, o._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${v.dynamicRef ? (0, o._)`, ${u.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function b(v, S) {
    v.if(u.default.valCxt, () => {
      v.var(u.default.instancePath, (0, o._)`${u.default.valCxt}.${u.default.instancePath}`), v.var(u.default.parentData, (0, o._)`${u.default.valCxt}.${u.default.parentData}`), v.var(u.default.parentDataProperty, (0, o._)`${u.default.valCxt}.${u.default.parentDataProperty}`), v.var(u.default.rootData, (0, o._)`${u.default.valCxt}.${u.default.rootData}`), S.dynamicRef && v.var(u.default.dynamicAnchors, (0, o._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      v.var(u.default.instancePath, (0, o._)`""`), v.var(u.default.parentData, (0, o._)`undefined`), v.var(u.default.parentDataProperty, (0, o._)`undefined`), v.var(u.default.rootData, u.default.data), S.dynamicRef && v.var(u.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function $(v) {
    const { schema: S, opts: D, gen: U } = v;
    w(v, () => {
      D.$comment && S.$comment && oe(v), J(v), U.let(u.default.vErrors, null), U.let(u.default.errors, 0), D.unevaluated && g(v), M(v), se(v);
    });
  }
  function g(v) {
    const { gen: S, validateName: D } = v;
    v.evaluated = S.const("evaluated", (0, o._)`${D}.evaluated`), S.if((0, o._)`${v.evaluated}.dynamicProps`, () => S.assign((0, o._)`${v.evaluated}.props`, (0, o._)`undefined`)), S.if((0, o._)`${v.evaluated}.dynamicItems`, () => S.assign((0, o._)`${v.evaluated}.items`, (0, o._)`undefined`));
  }
  function j(v, S) {
    const D = typeof v == "object" && v[S.schemaId];
    return D && (S.code.source || S.code.process) ? (0, o._)`/*# sourceURL=${D} */` : o.nil;
  }
  function O(v, S) {
    if (q(v) && (k(v), A(v))) {
      R(v, S);
      return;
    }
    (0, e.boolOrEmptySchema)(v, S);
  }
  function A({ schema: v, self: S }) {
    if (typeof v == "boolean")
      return !v;
    for (const D in v)
      if (S.RULES.all[D])
        return !0;
    return !1;
  }
  function q(v) {
    return typeof v.schema != "boolean";
  }
  function R(v, S) {
    const { schema: D, gen: U, opts: H } = v;
    H.$comment && D.$comment && oe(v), ae(v), Y(v);
    const B = U.const("_errs", u.default.errors);
    M(v, B), U.var(S, (0, o._)`${B} === ${u.default.errors}`);
  }
  function k(v) {
    (0, f.checkUnknownRules)(v), G(v);
  }
  function M(v, S) {
    if (v.opts.jtd)
      return Le(v, [], !1, S);
    const D = (0, t.getSchemaTypes)(v.schema), U = (0, t.coerceAndCheckDataType)(v, D);
    Le(v, D, !U, S);
  }
  function G(v) {
    const { schema: S, errSchemaPath: D, opts: U, self: H } = v;
    S.$ref && U.ignoreKeywordsWithRef && (0, f.schemaHasRulesButRef)(S, H.RULES) && H.logger.warn(`$ref: keywords ignored in schema at path "${D}"`);
  }
  function J(v) {
    const { schema: S, opts: D } = v;
    S.default !== void 0 && D.useDefaults && D.strictSchema && (0, f.checkStrictMode)(v, "default is ignored in the schema root");
  }
  function ae(v) {
    const S = v.schema[v.opts.schemaId];
    S && (v.baseId = (0, d.resolveUrl)(v.opts.uriResolver, v.baseId, S));
  }
  function Y(v) {
    if (v.schema.$async && !v.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function oe({ gen: v, schemaEnv: S, schema: D, errSchemaPath: U, opts: H }) {
    const B = D.$comment;
    if (H.$comment === !0)
      v.code((0, o._)`${u.default.self}.logger.log(${B})`);
    else if (typeof H.$comment == "function") {
      const ve = (0, o.str)`${U}/$comment`, Se = v.scopeValue("root", { ref: S.root });
      v.code((0, o._)`${u.default.self}.opts.$comment(${B}, ${ve}, ${Se}.schema)`);
    }
  }
  function se(v) {
    const { gen: S, schemaEnv: D, validateName: U, ValidationError: H, opts: B } = v;
    D.$async ? S.if((0, o._)`${u.default.errors} === 0`, () => S.return(u.default.data), () => S.throw((0, o._)`new ${H}(${u.default.vErrors})`)) : (S.assign((0, o._)`${U}.errors`, u.default.vErrors), B.unevaluated && ke(v), S.return((0, o._)`${u.default.errors} === 0`));
  }
  function ke({ gen: v, evaluated: S, props: D, items: U }) {
    D instanceof o.Name && v.assign((0, o._)`${S}.props`, D), U instanceof o.Name && v.assign((0, o._)`${S}.items`, U);
  }
  function Le(v, S, D, U) {
    const { gen: H, schema: B, data: ve, allErrors: Se, opts: _e, self: we } = v, { RULES: $e } = we;
    if (B.$ref && (_e.ignoreKeywordsWithRef || !(0, f.schemaHasRulesButRef)(B, $e))) {
      H.block(() => V(v, "$ref", $e.all.$ref.definition));
      return;
    }
    _e.jtd || nt(v, S), H.block(() => {
      for (const pe of $e.rules)
        Ne(pe);
      Ne($e.post);
    });
    function Ne(pe) {
      (0, r.shouldUseGroup)(B, pe) && (pe.type ? (H.if((0, n.checkDataType)(pe.type, ve, _e.strictNumbers)), Ke(v, pe), S.length === 1 && S[0] === pe.type && D && (H.else(), (0, n.reportTypeError)(v)), H.endIf()) : Ke(v, pe), Se || H.if((0, o._)`${u.default.errors} === ${U || 0}`));
    }
  }
  function Ke(v, S) {
    const { gen: D, schema: U, opts: { useDefaults: H } } = v;
    H && (0, s.assignDefaults)(v, S.type), D.block(() => {
      for (const B of S.rules)
        (0, r.shouldUseRule)(U, B) && V(v, B.keyword, B.definition, S.type);
    });
  }
  function nt(v, S) {
    v.schemaEnv.meta || !v.opts.strictTypes || (Ye(v, S), v.opts.allowUnionTypes || L(v, S), P(v, v.dataTypes));
  }
  function Ye(v, S) {
    if (S.length) {
      if (!v.dataTypes.length) {
        v.dataTypes = S;
        return;
      }
      S.forEach((D) => {
        T(v.dataTypes, D) || h(v, `type "${D}" not allowed by context "${v.dataTypes.join(",")}"`);
      }), c(v, S);
    }
  }
  function L(v, S) {
    S.length > 1 && !(S.length === 2 && S.includes("null")) && h(v, "use allowUnionTypes to allow union type keyword");
  }
  function P(v, S) {
    const D = v.self.RULES.all;
    for (const U in D) {
      const H = D[U];
      if (typeof H == "object" && (0, r.shouldUseRule)(v.schema, H)) {
        const { type: B } = H.definition;
        B.length && !B.some((ve) => F(S, ve)) && h(v, `missing type "${B.join(",")}" for keyword "${U}"`);
      }
    }
  }
  function F(v, S) {
    return v.includes(S) || S === "number" && v.includes("integer");
  }
  function T(v, S) {
    return v.includes(S) || S === "integer" && v.includes("number");
  }
  function c(v, S) {
    const D = [];
    for (const U of v.dataTypes)
      T(S, U) ? D.push(U) : S.includes("integer") && U === "number" && D.push("integer");
    v.dataTypes = D;
  }
  function h(v, S) {
    const D = v.schemaEnv.baseId + v.errSchemaPath;
    S += ` at "${D}" (strictTypes)`, (0, f.checkStrictMode)(v, S, v.opts.strictTypes);
  }
  class I {
    constructor(S, D, U) {
      if ((0, i.validateKeywordUsage)(S, D, U), this.gen = S.gen, this.allErrors = S.allErrors, this.keyword = U, this.data = S.data, this.schema = S.schema[U], this.$data = D.$data && S.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, f.schemaRefOrVal)(S, this.schema, U, this.$data), this.schemaType = D.schemaType, this.parentSchema = S.schema, this.params = {}, this.it = S, this.def = D, this.$data)
        this.schemaCode = S.gen.const("vSchema", Q(this.$data, S));
      else if (this.schemaCode = this.schemaValue, !(0, i.validSchemaType)(this.schema, D.schemaType, D.allowUndefined))
        throw new Error(`${U} value must be ${JSON.stringify(D.schemaType)}`);
      ("code" in D ? D.trackErrors : D.errors !== !1) && (this.errsCount = S.gen.const("_errs", u.default.errors));
    }
    result(S, D, U) {
      this.failResult((0, o.not)(S), D, U);
    }
    failResult(S, D, U) {
      this.gen.if(S), U ? U() : this.error(), D ? (this.gen.else(), D(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(S, D) {
      this.failResult((0, o.not)(S), void 0, D);
    }
    fail(S) {
      if (S === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(S), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(S) {
      if (!this.$data)
        return this.fail(S);
      const { schemaCode: D } = this;
      this.fail((0, o._)`${D} !== undefined && (${(0, o.or)(this.invalid$data(), S)})`);
    }
    error(S, D, U) {
      if (D) {
        this.setParams(D), this._error(S, U), this.setParams({});
        return;
      }
      this._error(S, U);
    }
    _error(S, D) {
      (S ? y.reportExtraError : y.reportError)(this, this.def.error, D);
    }
    $dataError() {
      (0, y.reportError)(this, this.def.$dataError || y.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, y.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(S) {
      this.allErrors || this.gen.if(S);
    }
    setParams(S, D) {
      D ? Object.assign(this.params, S) : this.params = S;
    }
    block$data(S, D, U = o.nil) {
      this.gen.block(() => {
        this.check$data(S, U), D();
      });
    }
    check$data(S = o.nil, D = o.nil) {
      if (!this.$data)
        return;
      const { gen: U, schemaCode: H, schemaType: B, def: ve } = this;
      U.if((0, o.or)((0, o._)`${H} === undefined`, D)), S !== o.nil && U.assign(S, !0), (B.length || ve.validateSchema) && (U.elseIf(this.invalid$data()), this.$dataError(), S !== o.nil && U.assign(S, !1)), U.else();
    }
    invalid$data() {
      const { gen: S, schemaCode: D, schemaType: U, def: H, it: B } = this;
      return (0, o.or)(ve(), Se());
      function ve() {
        if (U.length) {
          if (!(D instanceof o.Name))
            throw new Error("ajv implementation error");
          const _e = Array.isArray(U) ? U : [U];
          return (0, o._)`${(0, n.checkDataTypes)(_e, D, B.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function Se() {
        if (H.validateSchema) {
          const _e = S.scopeValue("validate$data", { ref: H.validateSchema });
          return (0, o._)`!${_e}(${D})`;
        }
        return o.nil;
      }
    }
    subschema(S, D) {
      const U = (0, a.getSubschema)(this.it, S);
      (0, a.extendSubschemaData)(U, this.it, S), (0, a.extendSubschemaMode)(U, S);
      const H = { ...this.it, ...U, items: void 0, props: void 0 };
      return O(H, D), H;
    }
    mergeEvaluated(S, D) {
      const { it: U, gen: H } = this;
      U.opts.unevaluated && (U.props !== !0 && S.props !== void 0 && (U.props = f.mergeEvaluated.props(H, S.props, U.props, D)), U.items !== !0 && S.items !== void 0 && (U.items = f.mergeEvaluated.items(H, S.items, U.items, D)));
    }
    mergeValidEvaluated(S, D) {
      const { it: U, gen: H } = this;
      if (U.opts.unevaluated && (U.props !== !0 || U.items !== !0))
        return H.if(D, () => this.mergeEvaluated(S, o.Name)), !0;
    }
  }
  Be.KeywordCxt = I;
  function V(v, S, D, U) {
    const H = new I(v, D, S);
    "code" in D ? D.code(H, U) : H.$data && D.validate ? (0, i.funcKeywordCode)(H, D) : "macro" in D ? (0, i.macroKeywordCode)(H, D) : (D.compile || D.validate) && (0, i.funcKeywordCode)(H, D);
  }
  const z = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Q(v, { dataLevel: S, dataNames: D, dataPathArr: U }) {
    let H, B;
    if (v === "")
      return u.default.rootData;
    if (v[0] === "/") {
      if (!z.test(v))
        throw new Error(`Invalid JSON-pointer: ${v}`);
      H = v, B = u.default.rootData;
    } else {
      const we = Z.exec(v);
      if (!we)
        throw new Error(`Invalid JSON-pointer: ${v}`);
      const $e = +we[1];
      if (H = we[2], H === "#") {
        if ($e >= S)
          throw new Error(_e("property/index", $e));
        return U[S - $e];
      }
      if ($e > S)
        throw new Error(_e("data", $e));
      if (B = D[S - $e], !H)
        return B;
    }
    let ve = B;
    const Se = H.split("/");
    for (const we of Se)
      we && (B = (0, o._)`${B}${(0, o.getProperty)((0, f.unescapeJsonPointer)(we))}`, ve = (0, o._)`${ve} && ${B}`);
    return ve;
    function _e(we, $e) {
      return `Cannot access ${we} ${$e} levels up, current level is ${S}`;
    }
  }
  return Be.getData = Q, Be;
}
var Qt = {}, vs;
function Xr() {
  if (vs)
    return Qt;
  vs = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return Qt.default = e, Qt;
}
var Xt = {}, $s;
function en() {
  if ($s)
    return Xt;
  $s = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = Pe;
  class t extends Error {
    constructor(n, s, i, a) {
      super(a || `can't resolve reference ${i} from id ${s}`), this.missingRef = (0, e.resolveUrl)(n, s, i), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return Xt.default = t, Xt;
}
var Te = {};
Object.defineProperty(Te, "__esModule", { value: !0 });
Te.resolveSchema = Te.getCompilingSchema = Te.resolveRef = Te.compileSchema = Te.SchemaEnv = void 0;
const Ae = ee(), _o = Xr(), lt = rt(), Fe = Pe, _s = ne, wo = br();
class Pr {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Fe.normalizeId)(n?.[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n?.$async, this.refs = {};
  }
}
Te.SchemaEnv = Pr;
function tn(e) {
  const t = si.call(this, e);
  if (t)
    return t;
  const r = (0, Fe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: i } = this.opts, a = new Ae.CodeGen(this.scope, { es5: n, lines: s, ownProperties: i });
  let o;
  e.$async && (o = a.scopeValue("Error", {
    ref: _o.default,
    code: (0, Ae._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const u = a.scopeName("validate");
  e.validateName = u;
  const d = {
    gen: a,
    allErrors: this.opts.allErrors,
    data: lt.default.data,
    parentData: lt.default.parentData,
    parentDataProperty: lt.default.parentDataProperty,
    dataNames: [lt.default.data],
    dataPathArr: [Ae.nil],
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: a.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ae.stringify)(e.schema) } : { ref: e.schema }),
    validateName: u,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Ae.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ae._)`""`,
    opts: this.opts,
    self: this
  };
  let f;
  try {
    this._compilations.add(e), (0, wo.validateFunctionCode)(d), a.optimize(this.opts.code.optimize);
    const y = a.toString();
    f = `${a.scopeRefs(lt.default.scope)}return ${y}`, this.opts.code.process && (f = this.opts.code.process(f, e));
    const w = new Function(`${lt.default.self}`, `${lt.default.scope}`, f)(this, this.scope.get());
    if (this.scope.value(u, { ref: w }), w.errors = null, w.schema = e.schema, w.schemaEnv = e, e.$async && (w.$async = !0), this.opts.code.source === !0 && (w.source = { validateName: u, validateCode: y, scopeValues: a._values }), this.opts.unevaluated) {
      const { props: _, items: b } = d;
      w.evaluated = {
        props: _ instanceof Ae.Name ? void 0 : _,
        items: b instanceof Ae.Name ? void 0 : b,
        dynamicProps: _ instanceof Ae.Name,
        dynamicItems: b instanceof Ae.Name
      }, w.source && (w.source.evaluated = (0, Ae.stringify)(w.evaluated));
    }
    return e.validate = w, e;
  } catch (y) {
    throw delete e.validate, delete e.validateName, f && this.logger.error("Error compiling schema, function code:", f), y;
  } finally {
    this._compilations.delete(e);
  }
}
Te.compileSchema = tn;
function bo(e, t, r) {
  var n;
  r = (0, Fe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let i = So.call(this, e, r);
  if (i === void 0) {
    const a = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: o } = this.opts;
    a && (i = new Pr({ schema: a, schemaId: o, root: e, baseId: t }));
  }
  if (i !== void 0)
    return e.refs[r] = Po.call(this, i);
}
Te.resolveRef = bo;
function Po(e) {
  return (0, Fe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : tn.call(this, e);
}
function si(e) {
  for (const t of this._compilations)
    if (Eo(t, e))
      return t;
}
Te.getCompilingSchema = si;
function Eo(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function So(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Er.call(this, e, t);
}
function Er(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Fe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Fe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Cr.call(this, r, e);
  const i = (0, Fe.normalizeId)(n), a = this.refs[i] || this.schemas[i];
  if (typeof a == "string") {
    const o = Er.call(this, e, a);
    return typeof o?.schema != "object" ? void 0 : Cr.call(this, r, o);
  }
  if (typeof a?.schema == "object") {
    if (a.validate || tn.call(this, a), i === (0, Fe.normalizeId)(t)) {
      const { schema: o } = a, { schemaId: u } = this.opts, d = o[u];
      return d && (s = (0, Fe.resolveUrl)(this.opts.uriResolver, s, d)), new Pr({ schema: o, schemaId: u, root: e, baseId: s });
    }
    return Cr.call(this, r, a);
  }
}
Te.resolveSchema = Er;
const Ro = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Cr(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const o of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const u = r[(0, _s.unescapeFragment)(o)];
    if (u === void 0)
      return;
    r = u;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Ro.has(o) && d && (t = (0, Fe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let i;
  if (typeof r != "boolean" && r.$ref && !(0, _s.schemaHasRulesButRef)(r, this.RULES)) {
    const o = (0, Fe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    i = Er.call(this, n, o);
  }
  const { schemaId: a } = this.opts;
  if (i = i || new Pr({ schema: r, schemaId: a, root: n, baseId: t }), i.schema !== i.root.schema)
    return i;
}
const To = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", No = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Oo = "object", Co = [
  "$data"
], jo = {
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
}, ko = !1, Io = {
  $id: To,
  description: No,
  type: Oo,
  required: Co,
  properties: jo,
  additionalProperties: ko
};
var rn = {}, Mr = { exports: {} };
/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function(e, t) {
  (function(r, n) {
    n(t);
  })(La, function(r) {
    function n() {
      for (var p = arguments.length, l = Array(p), m = 0; m < p; m++)
        l[m] = arguments[m];
      if (l.length > 1) {
        l[0] = l[0].slice(0, -1);
        for (var C = l.length - 1, N = 1; N < C; ++N)
          l[N] = l[N].slice(1, -1);
        return l[C] = l[C].slice(1), l.join("");
      } else
        return l[0];
    }
    function s(p) {
      return "(?:" + p + ")";
    }
    function i(p) {
      return p === void 0 ? "undefined" : p === null ? "null" : Object.prototype.toString.call(p).split(" ").pop().split("]").shift().toLowerCase();
    }
    function a(p) {
      return p.toUpperCase();
    }
    function o(p) {
      return p != null ? p instanceof Array ? p : typeof p.length != "number" || p.split || p.setInterval || p.call ? [p] : Array.prototype.slice.call(p) : [];
    }
    function u(p, l) {
      var m = p;
      if (l)
        for (var C in l)
          m[C] = l[C];
      return m;
    }
    function d(p) {
      var l = "[A-Za-z]", m = "[0-9]", C = n(m, "[A-Fa-f]"), N = s(s("%[EFef]" + C + "%" + C + C + "%" + C + C) + "|" + s("%[89A-Fa-f]" + C + "%" + C + C) + "|" + s("%" + C + C)), W = "[\\:\\/\\?\\#\\[\\]\\@]", K = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", re = n(W, K), le = p ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", he = p ? "[\\uE000-\\uF8FF]" : "[]", te = n(l, m, "[\\-\\.\\_\\~]", le);
      s(l + n(l, m, "[\\+\\-\\.]") + "*"), s(s(N + "|" + n(te, K, "[\\:]")) + "*");
      var ce = s(s("25[0-5]") + "|" + s("2[0-4]" + m) + "|" + s("1" + m + m) + "|" + s("0?[1-9]" + m) + "|0?0?" + m), me = s(ce + "\\." + ce + "\\." + ce + "\\." + ce), x = s(C + "{1,4}"), de = s(s(x + "\\:" + x) + "|" + me), ge = s(s(x + "\\:") + "{6}" + de), fe = s("\\:\\:" + s(x + "\\:") + "{5}" + de), Ze = s(s(x) + "?\\:\\:" + s(x + "\\:") + "{4}" + de), ze = s(s(s(x + "\\:") + "{0,1}" + x) + "?\\:\\:" + s(x + "\\:") + "{3}" + de), He = s(s(s(x + "\\:") + "{0,2}" + x) + "?\\:\\:" + s(x + "\\:") + "{2}" + de), $t = s(s(s(x + "\\:") + "{0,3}" + x) + "?\\:\\:" + x + "\\:" + de), at = s(s(s(x + "\\:") + "{0,4}" + x) + "?\\:\\:" + de), Ce = s(s(s(x + "\\:") + "{0,5}" + x) + "?\\:\\:" + x), We = s(s(s(x + "\\:") + "{0,6}" + x) + "?\\:\\:"), ot = s([ge, fe, Ze, ze, He, $t, at, Ce, We].join("|")), Ge = s(s(te + "|" + N) + "+");
      s("[vV]" + C + "+\\." + n(te, K, "[\\:]") + "+"), s(s(N + "|" + n(te, K)) + "*");
      var kt = s(N + "|" + n(te, K, "[\\:\\@]"));
      return s(s(N + "|" + n(te, K, "[\\@]")) + "+"), s(s(kt + "|" + n("[\\/\\?]", he)) + "*"), {
        NOT_SCHEME: new RegExp(n("[^]", l, m, "[\\+\\-\\.]"), "g"),
        NOT_USERINFO: new RegExp(n("[^\\%\\:]", te, K), "g"),
        NOT_HOST: new RegExp(n("[^\\%\\[\\]\\:]", te, K), "g"),
        NOT_PATH: new RegExp(n("[^\\%\\/\\:\\@]", te, K), "g"),
        NOT_PATH_NOSCHEME: new RegExp(n("[^\\%\\/\\@]", te, K), "g"),
        NOT_QUERY: new RegExp(n("[^\\%]", te, K, "[\\:\\@\\/\\?]", he), "g"),
        NOT_FRAGMENT: new RegExp(n("[^\\%]", te, K, "[\\:\\@\\/\\?]"), "g"),
        ESCAPE: new RegExp(n("[^]", te, K), "g"),
        UNRESERVED: new RegExp(te, "g"),
        OTHER_CHARS: new RegExp(n("[^\\%]", te, re), "g"),
        PCT_ENCODED: new RegExp(N, "g"),
        IPV4ADDRESS: new RegExp("^(" + me + ")$"),
        IPV6ADDRESS: new RegExp("^\\[?(" + ot + ")" + s(s("\\%25|\\%(?!" + C + "{2})") + "(" + Ge + ")") + "?\\]?$")
        //RFC 6874, with relaxed parsing rules
      };
    }
    var f = d(!1), y = d(!0), E = function() {
      function p(l, m) {
        var C = [], N = !0, W = !1, K = void 0;
        try {
          for (var re = l[Symbol.iterator](), le; !(N = (le = re.next()).done) && (C.push(le.value), !(m && C.length === m)); N = !0)
            ;
        } catch (he) {
          W = !0, K = he;
        } finally {
          try {
            !N && re.return && re.return();
          } finally {
            if (W)
              throw K;
          }
        }
        return C;
      }
      return function(l, m) {
        if (Array.isArray(l))
          return l;
        if (Symbol.iterator in Object(l))
          return p(l, m);
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      };
    }(), w = function(p) {
      if (Array.isArray(p)) {
        for (var l = 0, m = Array(p.length); l < p.length; l++)
          m[l] = p[l];
        return m;
      } else
        return Array.from(p);
    }, _ = 2147483647, b = 36, $ = 1, g = 26, j = 38, O = 700, A = 72, q = 128, R = "-", k = /^xn--/, M = /[^\0-\x7E]/, G = /[\x2E\u3002\uFF0E\uFF61]/g, J = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    }, ae = b - $, Y = Math.floor, oe = String.fromCharCode;
    function se(p) {
      throw new RangeError(J[p]);
    }
    function ke(p, l) {
      for (var m = [], C = p.length; C--; )
        m[C] = l(p[C]);
      return m;
    }
    function Le(p, l) {
      var m = p.split("@"), C = "";
      m.length > 1 && (C = m[0] + "@", p = m[1]), p = p.replace(G, ".");
      var N = p.split("."), W = ke(N, l).join(".");
      return C + W;
    }
    function Ke(p) {
      for (var l = [], m = 0, C = p.length; m < C; ) {
        var N = p.charCodeAt(m++);
        if (N >= 55296 && N <= 56319 && m < C) {
          var W = p.charCodeAt(m++);
          (W & 64512) == 56320 ? l.push(((N & 1023) << 10) + (W & 1023) + 65536) : (l.push(N), m--);
        } else
          l.push(N);
      }
      return l;
    }
    var nt = function(l) {
      return String.fromCodePoint.apply(String, w(l));
    }, Ye = function(l) {
      return l - 48 < 10 ? l - 22 : l - 65 < 26 ? l - 65 : l - 97 < 26 ? l - 97 : b;
    }, L = function(l, m) {
      return l + 22 + 75 * (l < 26) - ((m != 0) << 5);
    }, P = function(l, m, C) {
      var N = 0;
      for (
        l = C ? Y(l / O) : l >> 1, l += Y(l / m);
        /* no initialization */
        l > ae * g >> 1;
        N += b
      )
        l = Y(l / ae);
      return Y(N + (ae + 1) * l / (l + j));
    }, F = function(l) {
      var m = [], C = l.length, N = 0, W = q, K = A, re = l.lastIndexOf(R);
      re < 0 && (re = 0);
      for (var le = 0; le < re; ++le)
        l.charCodeAt(le) >= 128 && se("not-basic"), m.push(l.charCodeAt(le));
      for (var he = re > 0 ? re + 1 : 0; he < C; ) {
        for (
          var te = N, ce = 1, me = b;
          ;
          /* no condition */
          me += b
        ) {
          he >= C && se("invalid-input");
          var x = Ye(l.charCodeAt(he++));
          (x >= b || x > Y((_ - N) / ce)) && se("overflow"), N += x * ce;
          var de = me <= K ? $ : me >= K + g ? g : me - K;
          if (x < de)
            break;
          var ge = b - de;
          ce > Y(_ / ge) && se("overflow"), ce *= ge;
        }
        var fe = m.length + 1;
        K = P(N - te, fe, te == 0), Y(N / fe) > _ - W && se("overflow"), W += Y(N / fe), N %= fe, m.splice(N++, 0, W);
      }
      return String.fromCodePoint.apply(String, m);
    }, T = function(l) {
      var m = [];
      l = Ke(l);
      var C = l.length, N = q, W = 0, K = A, re = !0, le = !1, he = void 0;
      try {
        for (var te = l[Symbol.iterator](), ce; !(re = (ce = te.next()).done); re = !0) {
          var me = ce.value;
          me < 128 && m.push(oe(me));
        }
      } catch (It) {
        le = !0, he = It;
      } finally {
        try {
          !re && te.return && te.return();
        } finally {
          if (le)
            throw he;
        }
      }
      var x = m.length, de = x;
      for (x && m.push(R); de < C; ) {
        var ge = _, fe = !0, Ze = !1, ze = void 0;
        try {
          for (var He = l[Symbol.iterator](), $t; !(fe = ($t = He.next()).done); fe = !0) {
            var at = $t.value;
            at >= N && at < ge && (ge = at);
          }
        } catch (It) {
          Ze = !0, ze = It;
        } finally {
          try {
            !fe && He.return && He.return();
          } finally {
            if (Ze)
              throw ze;
          }
        }
        var Ce = de + 1;
        ge - N > Y((_ - W) / Ce) && se("overflow"), W += (ge - N) * Ce, N = ge;
        var We = !0, ot = !1, Ge = void 0;
        try {
          for (var kt = l[Symbol.iterator](), Kn; !(We = (Kn = kt.next()).done); We = !0) {
            var Gn = Kn.value;
            if (Gn < N && ++W > _ && se("overflow"), Gn == N) {
              for (
                var xt = W, Jt = b;
                ;
                /* no condition */
                Jt += b
              ) {
                var Yt = Jt <= K ? $ : Jt >= K + g ? g : Jt - K;
                if (xt < Yt)
                  break;
                var Bn = xt - Yt, xn = b - Yt;
                m.push(oe(L(Yt + Bn % xn, 0))), xt = Y(Bn / xn);
              }
              m.push(oe(L(xt, 0))), K = P(W, Ce, de == x), W = 0, ++de;
            }
          }
        } catch (It) {
          ot = !0, Ge = It;
        } finally {
          try {
            !We && kt.return && kt.return();
          } finally {
            if (ot)
              throw Ge;
          }
        }
        ++W, ++N;
      }
      return m.join("");
    }, c = function(l) {
      return Le(l, function(m) {
        return k.test(m) ? F(m.slice(4).toLowerCase()) : m;
      });
    }, h = function(l) {
      return Le(l, function(m) {
        return M.test(m) ? "xn--" + T(m) : m;
      });
    }, I = {
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
        decode: Ke,
        encode: nt
      },
      decode: F,
      encode: T,
      toASCII: h,
      toUnicode: c
    }, V = {};
    function z(p) {
      var l = p.charCodeAt(0), m = void 0;
      return l < 16 ? m = "%0" + l.toString(16).toUpperCase() : l < 128 ? m = "%" + l.toString(16).toUpperCase() : l < 2048 ? m = "%" + (l >> 6 | 192).toString(16).toUpperCase() + "%" + (l & 63 | 128).toString(16).toUpperCase() : m = "%" + (l >> 12 | 224).toString(16).toUpperCase() + "%" + (l >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (l & 63 | 128).toString(16).toUpperCase(), m;
    }
    function Z(p) {
      for (var l = "", m = 0, C = p.length; m < C; ) {
        var N = parseInt(p.substr(m + 1, 2), 16);
        if (N < 128)
          l += String.fromCharCode(N), m += 3;
        else if (N >= 194 && N < 224) {
          if (C - m >= 6) {
            var W = parseInt(p.substr(m + 4, 2), 16);
            l += String.fromCharCode((N & 31) << 6 | W & 63);
          } else
            l += p.substr(m, 6);
          m += 6;
        } else if (N >= 224) {
          if (C - m >= 9) {
            var K = parseInt(p.substr(m + 4, 2), 16), re = parseInt(p.substr(m + 7, 2), 16);
            l += String.fromCharCode((N & 15) << 12 | (K & 63) << 6 | re & 63);
          } else
            l += p.substr(m, 9);
          m += 9;
        } else
          l += p.substr(m, 3), m += 3;
      }
      return l;
    }
    function Q(p, l) {
      function m(C) {
        var N = Z(C);
        return N.match(l.UNRESERVED) ? N : C;
      }
      return p.scheme && (p.scheme = String(p.scheme).replace(l.PCT_ENCODED, m).toLowerCase().replace(l.NOT_SCHEME, "")), p.userinfo !== void 0 && (p.userinfo = String(p.userinfo).replace(l.PCT_ENCODED, m).replace(l.NOT_USERINFO, z).replace(l.PCT_ENCODED, a)), p.host !== void 0 && (p.host = String(p.host).replace(l.PCT_ENCODED, m).toLowerCase().replace(l.NOT_HOST, z).replace(l.PCT_ENCODED, a)), p.path !== void 0 && (p.path = String(p.path).replace(l.PCT_ENCODED, m).replace(p.scheme ? l.NOT_PATH : l.NOT_PATH_NOSCHEME, z).replace(l.PCT_ENCODED, a)), p.query !== void 0 && (p.query = String(p.query).replace(l.PCT_ENCODED, m).replace(l.NOT_QUERY, z).replace(l.PCT_ENCODED, a)), p.fragment !== void 0 && (p.fragment = String(p.fragment).replace(l.PCT_ENCODED, m).replace(l.NOT_FRAGMENT, z).replace(l.PCT_ENCODED, a)), p;
    }
    function v(p) {
      return p.replace(/^0*(.*)/, "$1") || "0";
    }
    function S(p, l) {
      var m = p.match(l.IPV4ADDRESS) || [], C = E(m, 2), N = C[1];
      return N ? N.split(".").map(v).join(".") : p;
    }
    function D(p, l) {
      var m = p.match(l.IPV6ADDRESS) || [], C = E(m, 3), N = C[1], W = C[2];
      if (N) {
        for (var K = N.toLowerCase().split("::").reverse(), re = E(K, 2), le = re[0], he = re[1], te = he ? he.split(":").map(v) : [], ce = le.split(":").map(v), me = l.IPV4ADDRESS.test(ce[ce.length - 1]), x = me ? 7 : 8, de = ce.length - x, ge = Array(x), fe = 0; fe < x; ++fe)
          ge[fe] = te[fe] || ce[de + fe] || "";
        me && (ge[x - 1] = S(ge[x - 1], l));
        var Ze = ge.reduce(function(Ce, We, ot) {
          if (!We || We === "0") {
            var Ge = Ce[Ce.length - 1];
            Ge && Ge.index + Ge.length === ot ? Ge.length++ : Ce.push({ index: ot, length: 1 });
          }
          return Ce;
        }, []), ze = Ze.sort(function(Ce, We) {
          return We.length - Ce.length;
        })[0], He = void 0;
        if (ze && ze.length > 1) {
          var $t = ge.slice(0, ze.index), at = ge.slice(ze.index + ze.length);
          He = $t.join(":") + "::" + at.join(":");
        } else
          He = ge.join(":");
        return W && (He += "%" + W), He;
      } else
        return p;
    }
    var U = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i, H = "".match(/(){0}/)[1] === void 0;
    function B(p) {
      var l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, m = {}, C = l.iri !== !1 ? y : f;
      l.reference === "suffix" && (p = (l.scheme ? l.scheme + ":" : "") + "//" + p);
      var N = p.match(U);
      if (N) {
        H ? (m.scheme = N[1], m.userinfo = N[3], m.host = N[4], m.port = parseInt(N[5], 10), m.path = N[6] || "", m.query = N[7], m.fragment = N[8], isNaN(m.port) && (m.port = N[5])) : (m.scheme = N[1] || void 0, m.userinfo = p.indexOf("@") !== -1 ? N[3] : void 0, m.host = p.indexOf("//") !== -1 ? N[4] : void 0, m.port = parseInt(N[5], 10), m.path = N[6] || "", m.query = p.indexOf("?") !== -1 ? N[7] : void 0, m.fragment = p.indexOf("#") !== -1 ? N[8] : void 0, isNaN(m.port) && (m.port = p.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? N[4] : void 0)), m.host && (m.host = D(S(m.host, C), C)), m.scheme === void 0 && m.userinfo === void 0 && m.host === void 0 && m.port === void 0 && !m.path && m.query === void 0 ? m.reference = "same-document" : m.scheme === void 0 ? m.reference = "relative" : m.fragment === void 0 ? m.reference = "absolute" : m.reference = "uri", l.reference && l.reference !== "suffix" && l.reference !== m.reference && (m.error = m.error || "URI is not a " + l.reference + " reference.");
        var W = V[(l.scheme || m.scheme || "").toLowerCase()];
        if (!l.unicodeSupport && (!W || !W.unicodeSupport)) {
          if (m.host && (l.domainHost || W && W.domainHost))
            try {
              m.host = I.toASCII(m.host.replace(C.PCT_ENCODED, Z).toLowerCase());
            } catch (K) {
              m.error = m.error || "Host's domain name can not be converted to ASCII via punycode: " + K;
            }
          Q(m, f);
        } else
          Q(m, C);
        W && W.parse && W.parse(m, l);
      } else
        m.error = m.error || "URI can not be parsed.";
      return m;
    }
    function ve(p, l) {
      var m = l.iri !== !1 ? y : f, C = [];
      return p.userinfo !== void 0 && (C.push(p.userinfo), C.push("@")), p.host !== void 0 && C.push(D(S(String(p.host), m), m).replace(m.IPV6ADDRESS, function(N, W, K) {
        return "[" + W + (K ? "%25" + K : "") + "]";
      })), (typeof p.port == "number" || typeof p.port == "string") && (C.push(":"), C.push(String(p.port))), C.length ? C.join("") : void 0;
    }
    var Se = /^\.\.?\//, _e = /^\/\.(\/|$)/, we = /^\/\.\.(\/|$)/, $e = /^\/?(?:.|\n)*?(?=\/|$)/;
    function Ne(p) {
      for (var l = []; p.length; )
        if (p.match(Se))
          p = p.replace(Se, "");
        else if (p.match(_e))
          p = p.replace(_e, "/");
        else if (p.match(we))
          p = p.replace(we, "/"), l.pop();
        else if (p === "." || p === "..")
          p = "";
        else {
          var m = p.match($e);
          if (m) {
            var C = m[0];
            p = p.slice(C.length), l.push(C);
          } else
            throw new Error("Unexpected dot segment condition");
        }
      return l.join("");
    }
    function pe(p) {
      var l = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, m = l.iri ? y : f, C = [], N = V[(l.scheme || p.scheme || "").toLowerCase()];
      if (N && N.serialize && N.serialize(p, l), p.host && !m.IPV6ADDRESS.test(p.host)) {
        if (l.domainHost || N && N.domainHost)
          try {
            p.host = l.iri ? I.toUnicode(p.host) : I.toASCII(p.host.replace(m.PCT_ENCODED, Z).toLowerCase());
          } catch (re) {
            p.error = p.error || "Host's domain name can not be converted to " + (l.iri ? "Unicode" : "ASCII") + " via punycode: " + re;
          }
      }
      Q(p, m), l.reference !== "suffix" && p.scheme && (C.push(p.scheme), C.push(":"));
      var W = ve(p, l);
      if (W !== void 0 && (l.reference !== "suffix" && C.push("//"), C.push(W), p.path && p.path.charAt(0) !== "/" && C.push("/")), p.path !== void 0) {
        var K = p.path;
        !l.absolutePath && (!N || !N.absolutePath) && (K = Ne(K)), W === void 0 && (K = K.replace(/^\/\//, "/%2F")), C.push(K);
      }
      return p.query !== void 0 && (C.push("?"), C.push(p.query)), p.fragment !== void 0 && (C.push("#"), C.push(p.fragment)), C.join("");
    }
    function gt(p, l) {
      var m = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, C = arguments[3], N = {};
      return C || (p = B(pe(p, m), m), l = B(pe(l, m), m)), m = m || {}, !m.tolerant && l.scheme ? (N.scheme = l.scheme, N.userinfo = l.userinfo, N.host = l.host, N.port = l.port, N.path = Ne(l.path || ""), N.query = l.query) : (l.userinfo !== void 0 || l.host !== void 0 || l.port !== void 0 ? (N.userinfo = l.userinfo, N.host = l.host, N.port = l.port, N.path = Ne(l.path || ""), N.query = l.query) : (l.path ? (l.path.charAt(0) === "/" ? N.path = Ne(l.path) : ((p.userinfo !== void 0 || p.host !== void 0 || p.port !== void 0) && !p.path ? N.path = "/" + l.path : p.path ? N.path = p.path.slice(0, p.path.lastIndexOf("/") + 1) + l.path : N.path = l.path, N.path = Ne(N.path)), N.query = l.query) : (N.path = p.path, l.query !== void 0 ? N.query = l.query : N.query = p.query), N.userinfo = p.userinfo, N.host = p.host, N.port = p.port), N.scheme = p.scheme), N.fragment = l.fragment, N;
    }
    function Ot(p, l, m) {
      var C = u({ scheme: "null" }, m);
      return pe(gt(B(p, C), B(l, C), C, !0), C);
    }
    function st(p, l) {
      return typeof p == "string" ? p = pe(B(p, l), l) : i(p) === "object" && (p = B(pe(p, l), l)), p;
    }
    function Ct(p, l, m) {
      return typeof p == "string" ? p = pe(B(p, m), m) : i(p) === "object" && (p = pe(p, m)), typeof l == "string" ? l = pe(B(l, m), m) : i(l) === "object" && (l = pe(l, m)), p === l;
    }
    function Bt(p, l) {
      return p && p.toString().replace(!l || !l.iri ? f.ESCAPE : y.ESCAPE, z);
    }
    function Oe(p, l) {
      return p && p.toString().replace(!l || !l.iri ? f.PCT_ENCODED : y.PCT_ENCODED, Z);
    }
    var it = {
      scheme: "http",
      domainHost: !0,
      parse: function(l, m) {
        return l.host || (l.error = l.error || "HTTP URIs must have a host."), l;
      },
      serialize: function(l, m) {
        var C = String(l.scheme).toLowerCase() === "https";
        return (l.port === (C ? 443 : 80) || l.port === "") && (l.port = void 0), l.path || (l.path = "/"), l;
      }
    }, Mn = {
      scheme: "https",
      domainHost: it.domainHost,
      parse: it.parse,
      serialize: it.serialize
    };
    function qn(p) {
      return typeof p.secure == "boolean" ? p.secure : String(p.scheme).toLowerCase() === "wss";
    }
    var jt = {
      scheme: "ws",
      domainHost: !0,
      parse: function(l, m) {
        var C = l;
        return C.secure = qn(C), C.resourceName = (C.path || "/") + (C.query ? "?" + C.query : ""), C.path = void 0, C.query = void 0, C;
      },
      serialize: function(l, m) {
        if ((l.port === (qn(l) ? 443 : 80) || l.port === "") && (l.port = void 0), typeof l.secure == "boolean" && (l.scheme = l.secure ? "wss" : "ws", l.secure = void 0), l.resourceName) {
          var C = l.resourceName.split("?"), N = E(C, 2), W = N[0], K = N[1];
          l.path = W && W !== "/" ? W : void 0, l.query = K, l.resourceName = void 0;
        }
        return l.fragment = void 0, l;
      }
    }, Un = {
      scheme: "wss",
      domainHost: jt.domainHost,
      parse: jt.parse,
      serialize: jt.serialize
    }, Pi = {}, Ln = "[A-Za-z0-9\\-\\.\\_\\~\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]", Ve = "[0-9A-Fa-f]", Ei = s(s("%[EFef]" + Ve + "%" + Ve + Ve + "%" + Ve + Ve) + "|" + s("%[89A-Fa-f]" + Ve + "%" + Ve + Ve) + "|" + s("%" + Ve + Ve)), Si = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]", Ri = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]", Ti = n(Ri, '[\\"\\\\]'), Ni = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]", Oi = new RegExp(Ln, "g"), vt = new RegExp(Ei, "g"), Ci = new RegExp(n("[^]", Si, "[\\.]", '[\\"]', Ti), "g"), Vn = new RegExp(n("[^]", Ln, Ni), "g"), ji = Vn;
    function Rr(p) {
      var l = Z(p);
      return l.match(Oi) ? l : p;
    }
    var zn = {
      scheme: "mailto",
      parse: function(l, m) {
        var C = l, N = C.to = C.path ? C.path.split(",") : [];
        if (C.path = void 0, C.query) {
          for (var W = !1, K = {}, re = C.query.split("&"), le = 0, he = re.length; le < he; ++le) {
            var te = re[le].split("=");
            switch (te[0]) {
              case "to":
                for (var ce = te[1].split(","), me = 0, x = ce.length; me < x; ++me)
                  N.push(ce[me]);
                break;
              case "subject":
                C.subject = Oe(te[1], m);
                break;
              case "body":
                C.body = Oe(te[1], m);
                break;
              default:
                W = !0, K[Oe(te[0], m)] = Oe(te[1], m);
                break;
            }
          }
          W && (C.headers = K);
        }
        C.query = void 0;
        for (var de = 0, ge = N.length; de < ge; ++de) {
          var fe = N[de].split("@");
          if (fe[0] = Oe(fe[0]), m.unicodeSupport)
            fe[1] = Oe(fe[1], m).toLowerCase();
          else
            try {
              fe[1] = I.toASCII(Oe(fe[1], m).toLowerCase());
            } catch (Ze) {
              C.error = C.error || "Email address's domain name can not be converted to ASCII via punycode: " + Ze;
            }
          N[de] = fe.join("@");
        }
        return C;
      },
      serialize: function(l, m) {
        var C = l, N = o(l.to);
        if (N) {
          for (var W = 0, K = N.length; W < K; ++W) {
            var re = String(N[W]), le = re.lastIndexOf("@"), he = re.slice(0, le).replace(vt, Rr).replace(vt, a).replace(Ci, z), te = re.slice(le + 1);
            try {
              te = m.iri ? I.toUnicode(te) : I.toASCII(Oe(te, m).toLowerCase());
            } catch (de) {
              C.error = C.error || "Email address's domain name can not be converted to " + (m.iri ? "Unicode" : "ASCII") + " via punycode: " + de;
            }
            N[W] = he + "@" + te;
          }
          C.path = N.join(",");
        }
        var ce = l.headers = l.headers || {};
        l.subject && (ce.subject = l.subject), l.body && (ce.body = l.body);
        var me = [];
        for (var x in ce)
          ce[x] !== Pi[x] && me.push(x.replace(vt, Rr).replace(vt, a).replace(Vn, z) + "=" + ce[x].replace(vt, Rr).replace(vt, a).replace(ji, z));
        return me.length && (C.query = me.join("&")), C;
      }
    }, ki = /^([^\:]+)\:(.*)/, Hn = {
      scheme: "urn",
      parse: function(l, m) {
        var C = l.path && l.path.match(ki), N = l;
        if (C) {
          var W = m.scheme || N.scheme || "urn", K = C[1].toLowerCase(), re = C[2], le = W + ":" + (m.nid || K), he = V[le];
          N.nid = K, N.nss = re, N.path = void 0, he && (N = he.parse(N, m));
        } else
          N.error = N.error || "URN can not be parsed.";
        return N;
      },
      serialize: function(l, m) {
        var C = m.scheme || l.scheme || "urn", N = l.nid, W = C + ":" + (m.nid || N), K = V[W];
        K && (l = K.serialize(l, m));
        var re = l, le = l.nss;
        return re.path = (N || m.nid) + ":" + le, re;
      }
    }, Ii = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/, Wn = {
      scheme: "urn:uuid",
      parse: function(l, m) {
        var C = l;
        return C.uuid = C.nss, C.nss = void 0, !m.tolerant && (!C.uuid || !C.uuid.match(Ii)) && (C.error = C.error || "UUID is not valid."), C;
      },
      serialize: function(l, m) {
        var C = l;
        return C.nss = (l.uuid || "").toLowerCase(), C;
      }
    };
    V[it.scheme] = it, V[Mn.scheme] = Mn, V[jt.scheme] = jt, V[Un.scheme] = Un, V[zn.scheme] = zn, V[Hn.scheme] = Hn, V[Wn.scheme] = Wn, r.SCHEMES = V, r.pctEncChar = z, r.pctDecChars = Z, r.parse = B, r.removeDotSegments = Ne, r.serialize = pe, r.resolveComponents = gt, r.resolve = Ot, r.normalize = st, r.equal = Ct, r.escapeComponent = Bt, r.unescapeComponent = Oe, Object.defineProperty(r, "__esModule", { value: !0 });
  });
})(Mr, Mr.exports);
var Ao = Mr.exports;
Object.defineProperty(rn, "__esModule", { value: !0 });
const ii = Ao;
ii.code = 'require("ajv/dist/runtime/uri").default';
rn.default = ii;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = br();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = ee();
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
  const n = Xr(), s = en(), i = ht, a = Te, o = ee(), u = Pe, d = Wt, f = ne, y = Io, E = rn, w = (L, P) => new RegExp(L, P);
  w.code = "new RegExp";
  const _ = ["removeAdditional", "useDefaults", "coerceTypes"], b = /* @__PURE__ */ new Set([
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
  ]), $ = {
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
  }, g = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, j = 200;
  function O(L) {
    var P, F, T, c, h, I, V, z, Z, Q, v, S, D, U, H, B, ve, Se, _e, we, $e, Ne, pe, gt, Ot;
    const st = L.strict, Ct = (P = L.code) === null || P === void 0 ? void 0 : P.optimize, Bt = Ct === !0 || Ct === void 0 ? 1 : Ct || 0, Oe = (T = (F = L.code) === null || F === void 0 ? void 0 : F.regExp) !== null && T !== void 0 ? T : w, it = (c = L.uriResolver) !== null && c !== void 0 ? c : E.default;
    return {
      strictSchema: (I = (h = L.strictSchema) !== null && h !== void 0 ? h : st) !== null && I !== void 0 ? I : !0,
      strictNumbers: (z = (V = L.strictNumbers) !== null && V !== void 0 ? V : st) !== null && z !== void 0 ? z : !0,
      strictTypes: (Q = (Z = L.strictTypes) !== null && Z !== void 0 ? Z : st) !== null && Q !== void 0 ? Q : "log",
      strictTuples: (S = (v = L.strictTuples) !== null && v !== void 0 ? v : st) !== null && S !== void 0 ? S : "log",
      strictRequired: (U = (D = L.strictRequired) !== null && D !== void 0 ? D : st) !== null && U !== void 0 ? U : !1,
      code: L.code ? { ...L.code, optimize: Bt, regExp: Oe } : { optimize: Bt, regExp: Oe },
      loopRequired: (H = L.loopRequired) !== null && H !== void 0 ? H : j,
      loopEnum: (B = L.loopEnum) !== null && B !== void 0 ? B : j,
      meta: (ve = L.meta) !== null && ve !== void 0 ? ve : !0,
      messages: (Se = L.messages) !== null && Se !== void 0 ? Se : !0,
      inlineRefs: (_e = L.inlineRefs) !== null && _e !== void 0 ? _e : !0,
      schemaId: (we = L.schemaId) !== null && we !== void 0 ? we : "$id",
      addUsedSchema: ($e = L.addUsedSchema) !== null && $e !== void 0 ? $e : !0,
      validateSchema: (Ne = L.validateSchema) !== null && Ne !== void 0 ? Ne : !0,
      validateFormats: (pe = L.validateFormats) !== null && pe !== void 0 ? pe : !0,
      unicodeRegExp: (gt = L.unicodeRegExp) !== null && gt !== void 0 ? gt : !0,
      int32range: (Ot = L.int32range) !== null && Ot !== void 0 ? Ot : !0,
      uriResolver: it
    };
  }
  class A {
    constructor(P = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), P = this.opts = { ...P, ...O(P) };
      const { es5: F, lines: T } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: b, es5: F, lines: T }), this.logger = Y(P.logger);
      const c = P.validateFormats;
      P.validateFormats = !1, this.RULES = (0, i.getRules)(), q.call(this, $, P, "NOT SUPPORTED"), q.call(this, g, P, "DEPRECATED", "warn"), this._metaOpts = J.call(this), P.formats && M.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), P.keywords && G.call(this, P.keywords), typeof P.meta == "object" && this.addMetaSchema(P.meta), k.call(this), P.validateFormats = c;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: P, meta: F, schemaId: T } = this.opts;
      let c = y;
      T === "id" && (c = { ...y }, c.id = c.$id, delete c.$id), F && P && this.addMetaSchema(c, c[T], !1);
    }
    defaultMeta() {
      const { meta: P, schemaId: F } = this.opts;
      return this.opts.defaultMeta = typeof P == "object" ? P[F] || P : void 0;
    }
    validate(P, F) {
      let T;
      if (typeof P == "string") {
        if (T = this.getSchema(P), !T)
          throw new Error(`no schema with key or ref "${P}"`);
      } else
        T = this.compile(P);
      const c = T(F);
      return "$async" in T || (this.errors = T.errors), c;
    }
    compile(P, F) {
      const T = this._addSchema(P, F);
      return T.validate || this._compileSchemaEnv(T);
    }
    compileAsync(P, F) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: T } = this.opts;
      return c.call(this, P, F);
      async function c(Q, v) {
        await h.call(this, Q.$schema);
        const S = this._addSchema(Q, v);
        return S.validate || I.call(this, S);
      }
      async function h(Q) {
        Q && !this.getSchema(Q) && await c.call(this, { $ref: Q }, !0);
      }
      async function I(Q) {
        try {
          return this._compileSchemaEnv(Q);
        } catch (v) {
          if (!(v instanceof s.default))
            throw v;
          return V.call(this, v), await z.call(this, v.missingSchema), I.call(this, Q);
        }
      }
      function V({ missingSchema: Q, missingRef: v }) {
        if (this.refs[Q])
          throw new Error(`AnySchema ${Q} is loaded but ${v} cannot be resolved`);
      }
      async function z(Q) {
        const v = await Z.call(this, Q);
        this.refs[Q] || await h.call(this, v.$schema), this.refs[Q] || this.addSchema(v, Q, F);
      }
      async function Z(Q) {
        const v = this._loading[Q];
        if (v)
          return v;
        try {
          return await (this._loading[Q] = T(Q));
        } finally {
          delete this._loading[Q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(P, F, T, c = this.opts.validateSchema) {
      if (Array.isArray(P)) {
        for (const I of P)
          this.addSchema(I, void 0, T, c);
        return this;
      }
      let h;
      if (typeof P == "object") {
        const { schemaId: I } = this.opts;
        if (h = P[I], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${I} must be string`);
      }
      return F = (0, u.normalizeId)(F || h), this._checkUnique(F), this.schemas[F] = this._addSchema(P, T, F, c, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(P, F, T = this.opts.validateSchema) {
      return this.addSchema(P, F, !0, T), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(P, F) {
      if (typeof P == "boolean")
        return !0;
      let T;
      if (T = P.$schema, T !== void 0 && typeof T != "string")
        throw new Error("$schema must be a string");
      if (T = T || this.opts.defaultMeta || this.defaultMeta(), !T)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const c = this.validate(T, P);
      if (!c && F) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return c;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(P) {
      let F;
      for (; typeof (F = R.call(this, P)) == "string"; )
        P = F;
      if (F === void 0) {
        const { schemaId: T } = this.opts, c = new a.SchemaEnv({ schema: {}, schemaId: T });
        if (F = a.resolveSchema.call(this, c, P), !F)
          return;
        this.refs[P] = F;
      }
      return F.validate || this._compileSchemaEnv(F);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(P) {
      if (P instanceof RegExp)
        return this._removeAllSchemas(this.schemas, P), this._removeAllSchemas(this.refs, P), this;
      switch (typeof P) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const F = R.call(this, P);
          return typeof F == "object" && this._cache.delete(F.schema), delete this.schemas[P], delete this.refs[P], this;
        }
        case "object": {
          const F = P;
          this._cache.delete(F);
          let T = P[this.opts.schemaId];
          return T && (T = (0, u.normalizeId)(T), delete this.schemas[T], delete this.refs[T]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(P) {
      for (const F of P)
        this.addKeyword(F);
      return this;
    }
    addKeyword(P, F) {
      let T;
      if (typeof P == "string")
        T = P, typeof F == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), F.keyword = T);
      else if (typeof P == "object" && F === void 0) {
        if (F = P, T = F.keyword, Array.isArray(T) && !T.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (se.call(this, T, F), !F)
        return (0, f.eachItem)(T, (h) => ke.call(this, h)), this;
      Ke.call(this, F);
      const c = {
        ...F,
        type: (0, d.getJSONTypes)(F.type),
        schemaType: (0, d.getJSONTypes)(F.schemaType)
      };
      return (0, f.eachItem)(T, c.type.length === 0 ? (h) => ke.call(this, h, c) : (h) => c.type.forEach((I) => ke.call(this, h, c, I))), this;
    }
    getKeyword(P) {
      const F = this.RULES.all[P];
      return typeof F == "object" ? F.definition : !!F;
    }
    // Remove keyword
    removeKeyword(P) {
      const { RULES: F } = this;
      delete F.keywords[P], delete F.all[P];
      for (const T of F.rules) {
        const c = T.rules.findIndex((h) => h.keyword === P);
        c >= 0 && T.rules.splice(c, 1);
      }
      return this;
    }
    // Add format
    addFormat(P, F) {
      return typeof F == "string" && (F = new RegExp(F)), this.formats[P] = F, this;
    }
    errorsText(P = this.errors, { separator: F = ", ", dataVar: T = "data" } = {}) {
      return !P || P.length === 0 ? "No errors" : P.map((c) => `${T}${c.instancePath} ${c.message}`).reduce((c, h) => c + F + h);
    }
    $dataMetaSchema(P, F) {
      const T = this.RULES.all;
      P = JSON.parse(JSON.stringify(P));
      for (const c of F) {
        const h = c.split("/").slice(1);
        let I = P;
        for (const V of h)
          I = I[V];
        for (const V in T) {
          const z = T[V];
          if (typeof z != "object")
            continue;
          const { $data: Z } = z.definition, Q = I[V];
          Z && Q && (I[V] = Ye(Q));
        }
      }
      return P;
    }
    _removeAllSchemas(P, F) {
      for (const T in P) {
        const c = P[T];
        (!F || F.test(T)) && (typeof c == "string" ? delete P[T] : c && !c.meta && (this._cache.delete(c.schema), delete P[T]));
      }
    }
    _addSchema(P, F, T, c = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let I;
      const { schemaId: V } = this.opts;
      if (typeof P == "object")
        I = P[V];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof P != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let z = this._cache.get(P);
      if (z !== void 0)
        return z;
      T = (0, u.normalizeId)(I || T);
      const Z = u.getSchemaRefs.call(this, P, T);
      return z = new a.SchemaEnv({ schema: P, schemaId: V, meta: F, baseId: T, localRefs: Z }), this._cache.set(z.schema, z), h && !T.startsWith("#") && (T && this._checkUnique(T), this.refs[T] = z), c && this.validateSchema(P, !0), z;
    }
    _checkUnique(P) {
      if (this.schemas[P] || this.refs[P])
        throw new Error(`schema with key or id "${P}" already exists`);
    }
    _compileSchemaEnv(P) {
      if (P.meta ? this._compileMetaSchema(P) : a.compileSchema.call(this, P), !P.validate)
        throw new Error("ajv implementation error");
      return P.validate;
    }
    _compileMetaSchema(P) {
      const F = this.opts;
      this.opts = this._metaOpts;
      try {
        a.compileSchema.call(this, P);
      } finally {
        this.opts = F;
      }
    }
  }
  e.default = A, A.ValidationError = n.default, A.MissingRefError = s.default;
  function q(L, P, F, T = "error") {
    for (const c in L) {
      const h = c;
      h in P && this.logger[T](`${F}: option ${c}. ${L[h]}`);
    }
  }
  function R(L) {
    return L = (0, u.normalizeId)(L), this.schemas[L] || this.refs[L];
  }
  function k() {
    const L = this.opts.schemas;
    if (L)
      if (Array.isArray(L))
        this.addSchema(L);
      else
        for (const P in L)
          this.addSchema(L[P], P);
  }
  function M() {
    for (const L in this.opts.formats) {
      const P = this.opts.formats[L];
      P && this.addFormat(L, P);
    }
  }
  function G(L) {
    if (Array.isArray(L)) {
      this.addVocabulary(L);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const P in L) {
      const F = L[P];
      F.keyword || (F.keyword = P), this.addKeyword(F);
    }
  }
  function J() {
    const L = { ...this.opts };
    for (const P of _)
      delete L[P];
    return L;
  }
  const ae = { log() {
  }, warn() {
  }, error() {
  } };
  function Y(L) {
    if (L === !1)
      return ae;
    if (L === void 0)
      return console;
    if (L.log && L.warn && L.error)
      return L;
    throw new Error("logger must implement log, warn and error methods");
  }
  const oe = /^[a-z_$][a-z0-9_$:-]*$/i;
  function se(L, P) {
    const { RULES: F } = this;
    if ((0, f.eachItem)(L, (T) => {
      if (F.keywords[T])
        throw new Error(`Keyword ${T} is already defined`);
      if (!oe.test(T))
        throw new Error(`Keyword ${T} has invalid name`);
    }), !!P && P.$data && !("code" in P || "validate" in P))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function ke(L, P, F) {
    var T;
    const c = P?.post;
    if (F && c)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let I = c ? h.post : h.rules.find(({ type: z }) => z === F);
    if (I || (I = { type: F, rules: [] }, h.rules.push(I)), h.keywords[L] = !0, !P)
      return;
    const V = {
      keyword: L,
      definition: {
        ...P,
        type: (0, d.getJSONTypes)(P.type),
        schemaType: (0, d.getJSONTypes)(P.schemaType)
      }
    };
    P.before ? Le.call(this, I, V, P.before) : I.rules.push(V), h.all[L] = V, (T = P.implements) === null || T === void 0 || T.forEach((z) => this.addKeyword(z));
  }
  function Le(L, P, F) {
    const T = L.rules.findIndex((c) => c.keyword === F);
    T >= 0 ? L.rules.splice(T, 0, P) : (L.rules.push(P), this.logger.warn(`rule ${F} is not defined`));
  }
  function Ke(L) {
    let { metaSchema: P } = L;
    P !== void 0 && (L.$data && this.opts.$data && (P = Ye(P)), L.validateSchema = this.compile(P, !0));
  }
  const nt = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function Ye(L) {
    return { anyOf: [L, nt] };
  }
})(Js);
var nn = {}, sn = {}, an = {};
Object.defineProperty(an, "__esModule", { value: !0 });
const Do = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
an.default = Do;
var mt = {};
Object.defineProperty(mt, "__esModule", { value: !0 });
mt.callRef = mt.getValidate = void 0;
const Fo = en(), ws = X, Re = ee(), wt = rt(), bs = Te, er = ne, Mo = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: i, validateName: a, opts: o, self: u } = n, { root: d } = i;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return y();
    const f = bs.resolveRef.call(u, d, s, r);
    if (f === void 0)
      throw new Fo.default(n.opts.uriResolver, s, r);
    if (f instanceof bs.SchemaEnv)
      return E(f);
    return w(f);
    function y() {
      if (i === d)
        return cr(e, a, i, i.$async);
      const _ = t.scopeValue("root", { ref: d });
      return cr(e, (0, Re._)`${_}.validate`, d, d.$async);
    }
    function E(_) {
      const b = ai(e, _);
      cr(e, b, _, _.$async);
    }
    function w(_) {
      const b = t.scopeValue("schema", o.code.source === !0 ? { ref: _, code: (0, Re.stringify)(_) } : { ref: _ }), $ = t.name("valid"), g = e.subschema({
        schema: _,
        dataTypes: [],
        schemaPath: Re.nil,
        topSchemaRef: b,
        errSchemaPath: r
      }, $);
      e.mergeEvaluated(g), e.ok($);
    }
  }
};
function ai(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Re._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
mt.getValidate = ai;
function cr(e, t, r, n) {
  const { gen: s, it: i } = e, { allErrors: a, schemaEnv: o, opts: u } = i, d = u.passContext ? wt.default.this : Re.nil;
  n ? f() : y();
  function f() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const _ = s.let("valid");
    s.try(() => {
      s.code((0, Re._)`await ${(0, ws.callValidateCode)(e, t, d)}`), w(t), a || s.assign(_, !0);
    }, (b) => {
      s.if((0, Re._)`!(${b} instanceof ${i.ValidationError})`, () => s.throw(b)), E(b), a || s.assign(_, !1);
    }), e.ok(_);
  }
  function y() {
    e.result((0, ws.callValidateCode)(e, t, d), () => w(t), () => E(t));
  }
  function E(_) {
    const b = (0, Re._)`${_}.errors`;
    s.assign(wt.default.vErrors, (0, Re._)`${wt.default.vErrors} === null ? ${b} : ${wt.default.vErrors}.concat(${b})`), s.assign(wt.default.errors, (0, Re._)`${wt.default.vErrors}.length`);
  }
  function w(_) {
    var b;
    if (!i.opts.unevaluated)
      return;
    const $ = (b = r?.validate) === null || b === void 0 ? void 0 : b.evaluated;
    if (i.props !== !0)
      if ($ && !$.dynamicProps)
        $.props !== void 0 && (i.props = er.mergeEvaluated.props(s, $.props, i.props));
      else {
        const g = s.var("props", (0, Re._)`${_}.evaluated.props`);
        i.props = er.mergeEvaluated.props(s, g, i.props, Re.Name);
      }
    if (i.items !== !0)
      if ($ && !$.dynamicItems)
        $.items !== void 0 && (i.items = er.mergeEvaluated.items(s, $.items, i.items));
      else {
        const g = s.var("items", (0, Re._)`${_}.evaluated.items`);
        i.items = er.mergeEvaluated.items(s, g, i.items, Re.Name);
      }
  }
}
mt.callRef = cr;
mt.default = Mo;
Object.defineProperty(sn, "__esModule", { value: !0 });
const qo = an, Uo = mt, Lo = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  qo.default,
  Uo.default
];
sn.default = Lo;
var on = {}, cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
const pr = ee(), et = pr.operators, hr = {
  maximum: { okStr: "<=", ok: et.LTE, fail: et.GT },
  minimum: { okStr: ">=", ok: et.GTE, fail: et.LT },
  exclusiveMaximum: { okStr: "<", ok: et.LT, fail: et.GTE },
  exclusiveMinimum: { okStr: ">", ok: et.GT, fail: et.LTE }
}, Vo = {
  message: ({ keyword: e, schemaCode: t }) => (0, pr.str)`must be ${hr[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, pr._)`{comparison: ${hr[e].okStr}, limit: ${t}}`
}, zo = {
  keyword: Object.keys(hr),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Vo,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, pr._)`${r} ${hr[t].fail} ${n} || isNaN(${r})`);
  }
};
cn.default = zo;
var ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
const qt = ee(), Ho = {
  message: ({ schemaCode: e }) => (0, qt.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, qt._)`{multipleOf: ${e}}`
}, Wo = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Ho,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, i = s.opts.multipleOfPrecision, a = t.let("res"), o = i ? (0, qt._)`Math.abs(Math.round(${a}) - ${a}) > 1e-${i}` : (0, qt._)`${a} !== parseInt(${a})`;
    e.fail$data((0, qt._)`(${n} === 0 || (${a} = ${r}/${n}, ${o}))`);
  }
};
ln.default = Wo;
var un = {}, dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
function oi(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
dn.default = oi;
oi.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(un, "__esModule", { value: !0 });
const ut = ee(), Ko = ne, Go = dn, Bo = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, ut.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, ut._)`{limit: ${e}}`
}, xo = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Bo,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, i = t === "maxLength" ? ut.operators.GT : ut.operators.LT, a = s.opts.unicode === !1 ? (0, ut._)`${r}.length` : (0, ut._)`${(0, Ko.useFunc)(e.gen, Go.default)}(${r})`;
    e.fail$data((0, ut._)`${a} ${i} ${n}`);
  }
};
un.default = xo;
var fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
const Jo = X, mr = ee(), Yo = {
  message: ({ schemaCode: e }) => (0, mr.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, mr._)`{pattern: ${e}}`
}, Zo = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Yo,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: i } = e, a = i.opts.unicodeRegExp ? "u" : "", o = r ? (0, mr._)`(new RegExp(${s}, ${a}))` : (0, Jo.usePattern)(e, n);
    e.fail$data((0, mr._)`!${o}.test(${t})`);
  }
};
fn.default = Zo;
var pn = {};
Object.defineProperty(pn, "__esModule", { value: !0 });
const Ut = ee(), Qo = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Ut.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Ut._)`{limit: ${e}}`
}, Xo = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Qo,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Ut.operators.GT : Ut.operators.LT;
    e.fail$data((0, Ut._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
pn.default = Xo;
var hn = {};
Object.defineProperty(hn, "__esModule", { value: !0 });
const Dt = X, Lt = ee(), ec = ne, tc = {
  message: ({ params: { missingProperty: e } }) => (0, Lt.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Lt._)`{missingProperty: ${e}}`
}, rc = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: tc,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: i, it: a } = e, { opts: o } = a;
    if (!i && r.length === 0)
      return;
    const u = r.length >= o.loopRequired;
    if (a.allErrors ? d() : f(), o.strictRequired) {
      const w = e.parentSchema.properties, { definedProperties: _ } = e.it;
      for (const b of r)
        if (w?.[b] === void 0 && !_.has(b)) {
          const $ = a.schemaEnv.baseId + a.errSchemaPath, g = `required property "${b}" is not defined at "${$}" (strictRequired)`;
          (0, ec.checkStrictMode)(a, g, a.opts.strictRequired);
        }
    }
    function d() {
      if (u || i)
        e.block$data(Lt.nil, y);
      else
        for (const w of r)
          (0, Dt.checkReportMissingProp)(e, w);
    }
    function f() {
      const w = t.let("missing");
      if (u || i) {
        const _ = t.let("valid", !0);
        e.block$data(_, () => E(w, _)), e.ok(_);
      } else
        t.if((0, Dt.checkMissingProp)(e, r, w)), (0, Dt.reportMissingProp)(e, w), t.else();
    }
    function y() {
      t.forOf("prop", n, (w) => {
        e.setParams({ missingProperty: w }), t.if((0, Dt.noPropertyInData)(t, s, w, o.ownProperties), () => e.error());
      });
    }
    function E(w, _) {
      e.setParams({ missingProperty: w }), t.forOf(w, n, () => {
        t.assign(_, (0, Dt.propertyInData)(t, s, w, o.ownProperties)), t.if((0, Lt.not)(_), () => {
          e.error(), t.break();
        });
      }, Lt.nil);
    }
  }
};
hn.default = rc;
var mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
const Vt = ee(), nc = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Vt.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Vt._)`{limit: ${e}}`
}, sc = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: nc,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Vt.operators.GT : Vt.operators.LT;
    e.fail$data((0, Vt._)`${r}.length ${s} ${n}`);
  }
};
mn.default = sc;
var yn = {}, Gt = {};
Object.defineProperty(Gt, "__esModule", { value: !0 });
const ci = Xs;
ci.code = 'require("ajv/dist/runtime/equal").default';
Gt.default = ci;
Object.defineProperty(yn, "__esModule", { value: !0 });
const jr = Wt, be = ee(), ic = ne, ac = Gt, oc = {
  message: ({ params: { i: e, j: t } }) => (0, be.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, be._)`{i: ${e}, j: ${t}}`
}, cc = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: oc,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: i, schemaCode: a, it: o } = e;
    if (!n && !s)
      return;
    const u = t.let("valid"), d = i.items ? (0, jr.getSchemaTypes)(i.items) : [];
    e.block$data(u, f, (0, be._)`${a} === false`), e.ok(u);
    function f() {
      const _ = t.let("i", (0, be._)`${r}.length`), b = t.let("j");
      e.setParams({ i: _, j: b }), t.assign(u, !0), t.if((0, be._)`${_} > 1`, () => (y() ? E : w)(_, b));
    }
    function y() {
      return d.length > 0 && !d.some((_) => _ === "object" || _ === "array");
    }
    function E(_, b) {
      const $ = t.name("item"), g = (0, jr.checkDataTypes)(d, $, o.opts.strictNumbers, jr.DataType.Wrong), j = t.const("indices", (0, be._)`{}`);
      t.for((0, be._)`;${_}--;`, () => {
        t.let($, (0, be._)`${r}[${_}]`), t.if(g, (0, be._)`continue`), d.length > 1 && t.if((0, be._)`typeof ${$} == "string"`, (0, be._)`${$} += "_"`), t.if((0, be._)`typeof ${j}[${$}] == "number"`, () => {
          t.assign(b, (0, be._)`${j}[${$}]`), e.error(), t.assign(u, !1).break();
        }).code((0, be._)`${j}[${$}] = ${_}`);
      });
    }
    function w(_, b) {
      const $ = (0, ic.useFunc)(t, ac.default), g = t.name("outer");
      t.label(g).for((0, be._)`;${_}--;`, () => t.for((0, be._)`${b} = ${_}; ${b}--;`, () => t.if((0, be._)`${$}(${r}[${_}], ${r}[${b}])`, () => {
        e.error(), t.assign(u, !1).break(g);
      })));
    }
  }
};
yn.default = cc;
var gn = {};
Object.defineProperty(gn, "__esModule", { value: !0 });
const qr = ee(), lc = ne, uc = Gt, dc = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, qr._)`{allowedValue: ${e}}`
}, fc = {
  keyword: "const",
  $data: !0,
  error: dc,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: i } = e;
    n || i && typeof i == "object" ? e.fail$data((0, qr._)`!${(0, lc.useFunc)(t, uc.default)}(${r}, ${s})`) : e.fail((0, qr._)`${i} !== ${r}`);
  }
};
gn.default = fc;
var vn = {};
Object.defineProperty(vn, "__esModule", { value: !0 });
const Ft = ee(), pc = ne, hc = Gt, mc = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Ft._)`{allowedValues: ${e}}`
}, yc = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: mc,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: i, it: a } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const o = s.length >= a.opts.loopEnum;
    let u;
    const d = () => u ?? (u = (0, pc.useFunc)(t, hc.default));
    let f;
    if (o || n)
      f = t.let("valid"), e.block$data(f, y);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const w = t.const("vSchema", i);
      f = (0, Ft.or)(...s.map((_, b) => E(w, b)));
    }
    e.pass(f);
    function y() {
      t.assign(f, !1), t.forOf("v", i, (w) => t.if((0, Ft._)`${d()}(${r}, ${w})`, () => t.assign(f, !0).break()));
    }
    function E(w, _) {
      const b = s[_];
      return typeof b == "object" && b !== null ? (0, Ft._)`${d()}(${r}, ${w}[${_}])` : (0, Ft._)`${r} === ${b}`;
    }
  }
};
vn.default = yc;
Object.defineProperty(on, "__esModule", { value: !0 });
const gc = cn, vc = ln, $c = un, _c = fn, wc = pn, bc = hn, Pc = mn, Ec = yn, Sc = gn, Rc = vn, Tc = [
  // number
  gc.default,
  vc.default,
  // string
  $c.default,
  _c.default,
  // object
  wc.default,
  bc.default,
  // array
  Pc.default,
  Ec.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Sc.default,
  Rc.default
];
on.default = Tc;
var $n = {}, Tt = {};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.validateAdditionalItems = void 0;
const dt = ee(), Ur = ne, Nc = {
  message: ({ params: { len: e } }) => (0, dt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, dt._)`{limit: ${e}}`
}, Oc = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Nc,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Ur.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    li(e, n);
  }
};
function li(e, t) {
  const { gen: r, schema: n, data: s, keyword: i, it: a } = e;
  a.items = !0;
  const o = r.const("len", (0, dt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, dt._)`${o} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Ur.alwaysValidSchema)(a, n)) {
    const d = r.var("valid", (0, dt._)`${o} <= ${t.length}`);
    r.if((0, dt.not)(d), () => u(d)), e.ok(d);
  }
  function u(d) {
    r.forRange("i", t.length, o, (f) => {
      e.subschema({ keyword: i, dataProp: f, dataPropType: Ur.Type.Num }, d), a.allErrors || r.if((0, dt.not)(d), () => r.break());
    });
  }
}
Tt.validateAdditionalItems = li;
Tt.default = Oc;
var _n = {}, Nt = {};
Object.defineProperty(Nt, "__esModule", { value: !0 });
Nt.validateTuple = void 0;
const Ps = ee(), lr = ne, Cc = X, jc = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return ui(e, "additionalItems", t);
    r.items = !0, !(0, lr.alwaysValidSchema)(r, t) && e.ok((0, Cc.validateArray)(e));
  }
};
function ui(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: i, keyword: a, it: o } = e;
  f(s), o.opts.unevaluated && r.length && o.items !== !0 && (o.items = lr.mergeEvaluated.items(n, r.length, o.items));
  const u = n.name("valid"), d = n.const("len", (0, Ps._)`${i}.length`);
  r.forEach((y, E) => {
    (0, lr.alwaysValidSchema)(o, y) || (n.if((0, Ps._)`${d} > ${E}`, () => e.subschema({
      keyword: a,
      schemaProp: E,
      dataProp: E
    }, u)), e.ok(u));
  });
  function f(y) {
    const { opts: E, errSchemaPath: w } = o, _ = r.length, b = _ === y.minItems && (_ === y.maxItems || y[t] === !1);
    if (E.strictTuples && !b) {
      const $ = `"${a}" is ${_}-tuple, but minItems or maxItems/${t} are not specified or different at path "${w}"`;
      (0, lr.checkStrictMode)(o, $, E.strictTuples);
    }
  }
}
Nt.validateTuple = ui;
Nt.default = jc;
Object.defineProperty(_n, "__esModule", { value: !0 });
const kc = Nt, Ic = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, kc.validateTuple)(e, "items")
};
_n.default = Ic;
var wn = {};
Object.defineProperty(wn, "__esModule", { value: !0 });
const Es = ee(), Ac = ne, Dc = X, Fc = Tt, Mc = {
  message: ({ params: { len: e } }) => (0, Es.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Es._)`{limit: ${e}}`
}, qc = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Mc,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Ac.alwaysValidSchema)(n, t) && (s ? (0, Fc.validateAdditionalItems)(e, s) : e.ok((0, Dc.validateArray)(e)));
  }
};
wn.default = qc;
var bn = {};
Object.defineProperty(bn, "__esModule", { value: !0 });
const je = ee(), tr = ne, Uc = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, je.str)`must contain at least ${e} valid item(s)` : (0, je.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, je._)`{minContains: ${e}}` : (0, je._)`{minContains: ${e}, maxContains: ${t}}`
}, Lc = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Uc,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: i } = e;
    let a, o;
    const { minContains: u, maxContains: d } = n;
    i.opts.next ? (a = u === void 0 ? 1 : u, o = d) : a = 1;
    const f = t.const("len", (0, je._)`${s}.length`);
    if (e.setParams({ min: a, max: o }), o === void 0 && a === 0) {
      (0, tr.checkStrictMode)(i, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && a > o) {
      (0, tr.checkStrictMode)(i, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, tr.alwaysValidSchema)(i, r)) {
      let b = (0, je._)`${f} >= ${a}`;
      o !== void 0 && (b = (0, je._)`${b} && ${f} <= ${o}`), e.pass(b);
      return;
    }
    i.items = !0;
    const y = t.name("valid");
    o === void 0 && a === 1 ? w(y, () => t.if(y, () => t.break())) : a === 0 ? (t.let(y, !0), o !== void 0 && t.if((0, je._)`${s}.length > 0`, E)) : (t.let(y, !1), E()), e.result(y, () => e.reset());
    function E() {
      const b = t.name("_valid"), $ = t.let("count", 0);
      w(b, () => t.if(b, () => _($)));
    }
    function w(b, $) {
      t.forRange("i", 0, f, (g) => {
        e.subschema({
          keyword: "contains",
          dataProp: g,
          dataPropType: tr.Type.Num,
          compositeRule: !0
        }, b), $();
      });
    }
    function _(b) {
      t.code((0, je._)`${b}++`), o === void 0 ? t.if((0, je._)`${b} >= ${a}`, () => t.assign(y, !0).break()) : (t.if((0, je._)`${b} > ${o}`, () => t.assign(y, !1).break()), a === 1 ? t.assign(y, !0) : t.if((0, je._)`${b} >= ${a}`, () => t.assign(y, !0)));
    }
  }
};
bn.default = Lc;
var di = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ee(), r = ne, n = X;
  e.error = {
    message: ({ params: { property: u, depsCount: d, deps: f } }) => {
      const y = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${y} ${f} when property ${u} is present`;
    },
    params: ({ params: { property: u, depsCount: d, deps: f, missingProperty: y } }) => (0, t._)`{property: ${u},
    missingProperty: ${y},
    depsCount: ${d},
    deps: ${f}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(u) {
      const [d, f] = i(u);
      a(u, d), o(u, f);
    }
  };
  function i({ schema: u }) {
    const d = {}, f = {};
    for (const y in u) {
      if (y === "__proto__")
        continue;
      const E = Array.isArray(u[y]) ? d : f;
      E[y] = u[y];
    }
    return [d, f];
  }
  function a(u, d = u.schema) {
    const { gen: f, data: y, it: E } = u;
    if (Object.keys(d).length === 0)
      return;
    const w = f.let("missing");
    for (const _ in d) {
      const b = d[_];
      if (b.length === 0)
        continue;
      const $ = (0, n.propertyInData)(f, y, _, E.opts.ownProperties);
      u.setParams({
        property: _,
        depsCount: b.length,
        deps: b.join(", ")
      }), E.allErrors ? f.if($, () => {
        for (const g of b)
          (0, n.checkReportMissingProp)(u, g);
      }) : (f.if((0, t._)`${$} && (${(0, n.checkMissingProp)(u, b, w)})`), (0, n.reportMissingProp)(u, w), f.else());
    }
  }
  e.validatePropertyDeps = a;
  function o(u, d = u.schema) {
    const { gen: f, data: y, keyword: E, it: w } = u, _ = f.name("valid");
    for (const b in d)
      (0, r.alwaysValidSchema)(w, d[b]) || (f.if(
        (0, n.propertyInData)(f, y, b, w.opts.ownProperties),
        () => {
          const $ = u.subschema({ keyword: E, schemaProp: b }, _);
          u.mergeValidEvaluated($, _);
        },
        () => f.var(_, !0)
        // TODO var
      ), u.ok(_));
  }
  e.validateSchemaDeps = o, e.default = s;
})(di);
var Pn = {};
Object.defineProperty(Pn, "__esModule", { value: !0 });
const fi = ee(), Vc = ne, zc = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, fi._)`{propertyName: ${e.propertyName}}`
}, Hc = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: zc,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Vc.alwaysValidSchema)(s, r))
      return;
    const i = t.name("valid");
    t.forIn("key", n, (a) => {
      e.setParams({ propertyName: a }), e.subschema({
        keyword: "propertyNames",
        data: a,
        dataTypes: ["string"],
        propertyName: a,
        compositeRule: !0
      }, i), t.if((0, fi.not)(i), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(i);
  }
};
Pn.default = Hc;
var Sr = {};
Object.defineProperty(Sr, "__esModule", { value: !0 });
const rr = X, De = ee(), Wc = rt(), nr = ne, Kc = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, De._)`{additionalProperty: ${e.additionalProperty}}`
}, Gc = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Kc,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: i, it: a } = e;
    if (!i)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: u } = a;
    if (a.props = !0, u.removeAdditional !== "all" && (0, nr.alwaysValidSchema)(a, r))
      return;
    const d = (0, rr.allSchemaProperties)(n.properties), f = (0, rr.allSchemaProperties)(n.patternProperties);
    y(), e.ok((0, De._)`${i} === ${Wc.default.errors}`);
    function y() {
      t.forIn("key", s, ($) => {
        !d.length && !f.length ? _($) : t.if(E($), () => _($));
      });
    }
    function E($) {
      let g;
      if (d.length > 8) {
        const j = (0, nr.schemaRefOrVal)(a, n.properties, "properties");
        g = (0, rr.isOwnProperty)(t, j, $);
      } else
        d.length ? g = (0, De.or)(...d.map((j) => (0, De._)`${$} === ${j}`)) : g = De.nil;
      return f.length && (g = (0, De.or)(g, ...f.map((j) => (0, De._)`${(0, rr.usePattern)(e, j)}.test(${$})`))), (0, De.not)(g);
    }
    function w($) {
      t.code((0, De._)`delete ${s}[${$}]`);
    }
    function _($) {
      if (u.removeAdditional === "all" || u.removeAdditional && r === !1) {
        w($);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: $ }), e.error(), o || t.break();
        return;
      }
      if (typeof r == "object" && !(0, nr.alwaysValidSchema)(a, r)) {
        const g = t.name("valid");
        u.removeAdditional === "failing" ? (b($, g, !1), t.if((0, De.not)(g), () => {
          e.reset(), w($);
        })) : (b($, g), o || t.if((0, De.not)(g), () => t.break()));
      }
    }
    function b($, g, j) {
      const O = {
        keyword: "additionalProperties",
        dataProp: $,
        dataPropType: nr.Type.Str
      };
      j === !1 && Object.assign(O, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(O, g);
    }
  }
};
Sr.default = Gc;
var En = {};
Object.defineProperty(En, "__esModule", { value: !0 });
const Bc = br(), Ss = X, kr = ne, Rs = Sr, xc = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: i } = e;
    i.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Rs.default.code(new Bc.KeywordCxt(i, Rs.default, "additionalProperties"));
    const a = (0, Ss.allSchemaProperties)(r);
    for (const y of a)
      i.definedProperties.add(y);
    i.opts.unevaluated && a.length && i.props !== !0 && (i.props = kr.mergeEvaluated.props(t, (0, kr.toHash)(a), i.props));
    const o = a.filter((y) => !(0, kr.alwaysValidSchema)(i, r[y]));
    if (o.length === 0)
      return;
    const u = t.name("valid");
    for (const y of o)
      d(y) ? f(y) : (t.if((0, Ss.propertyInData)(t, s, y, i.opts.ownProperties)), f(y), i.allErrors || t.else().var(u, !0), t.endIf()), e.it.definedProperties.add(y), e.ok(u);
    function d(y) {
      return i.opts.useDefaults && !i.compositeRule && r[y].default !== void 0;
    }
    function f(y) {
      e.subschema({
        keyword: "properties",
        schemaProp: y,
        dataProp: y
      }, u);
    }
  }
};
En.default = xc;
var Sn = {};
Object.defineProperty(Sn, "__esModule", { value: !0 });
const Ts = X, sr = ee(), Ns = ne, Os = ne, Jc = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: i } = e, { opts: a } = i, o = (0, Ts.allSchemaProperties)(r), u = o.filter((b) => (0, Ns.alwaysValidSchema)(i, r[b]));
    if (o.length === 0 || u.length === o.length && (!i.opts.unevaluated || i.props === !0))
      return;
    const d = a.strictSchema && !a.allowMatchingProperties && s.properties, f = t.name("valid");
    i.props !== !0 && !(i.props instanceof sr.Name) && (i.props = (0, Os.evaluatedPropsToName)(t, i.props));
    const { props: y } = i;
    E();
    function E() {
      for (const b of o)
        d && w(b), i.allErrors ? _(b) : (t.var(f, !0), _(b), t.if(f));
    }
    function w(b) {
      for (const $ in d)
        new RegExp(b).test($) && (0, Ns.checkStrictMode)(i, `property ${$} matches pattern ${b} (use allowMatchingProperties)`);
    }
    function _(b) {
      t.forIn("key", n, ($) => {
        t.if((0, sr._)`${(0, Ts.usePattern)(e, b)}.test(${$})`, () => {
          const g = u.includes(b);
          g || e.subschema({
            keyword: "patternProperties",
            schemaProp: b,
            dataProp: $,
            dataPropType: Os.Type.Str
          }, f), i.opts.unevaluated && y !== !0 ? t.assign((0, sr._)`${y}[${$}]`, !0) : !g && !i.allErrors && t.if((0, sr.not)(f), () => t.break());
        });
      });
    }
  }
};
Sn.default = Jc;
var Rn = {};
Object.defineProperty(Rn, "__esModule", { value: !0 });
const Yc = ne, Zc = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Yc.alwaysValidSchema)(n, r)) {
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
Rn.default = Zc;
var Tn = {};
Object.defineProperty(Tn, "__esModule", { value: !0 });
const Qc = X, Xc = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Qc.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Tn.default = Xc;
var Nn = {};
Object.defineProperty(Nn, "__esModule", { value: !0 });
const ur = ee(), el = ne, tl = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, ur._)`{passingSchemas: ${e.passing}}`
}, rl = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: tl,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const i = r, a = t.let("valid", !1), o = t.let("passing", null), u = t.name("_valid");
    e.setParams({ passing: o }), t.block(d), e.result(a, () => e.reset(), () => e.error(!0));
    function d() {
      i.forEach((f, y) => {
        let E;
        (0, el.alwaysValidSchema)(s, f) ? t.var(u, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: y,
          compositeRule: !0
        }, u), y > 0 && t.if((0, ur._)`${u} && ${a}`).assign(a, !1).assign(o, (0, ur._)`[${o}, ${y}]`).else(), t.if(u, () => {
          t.assign(a, !0), t.assign(o, y), E && e.mergeEvaluated(E, ur.Name);
        });
      });
    }
  }
};
Nn.default = rl;
var On = {};
Object.defineProperty(On, "__esModule", { value: !0 });
const nl = ne, sl = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((i, a) => {
      if ((0, nl.alwaysValidSchema)(n, i))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: a }, s);
      e.ok(s), e.mergeEvaluated(o);
    });
  }
};
On.default = sl;
var Cn = {};
Object.defineProperty(Cn, "__esModule", { value: !0 });
const yr = ee(), pi = ne, il = {
  message: ({ params: e }) => (0, yr.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, yr._)`{failingKeyword: ${e.ifClause}}`
}, al = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: il,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, pi.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Cs(n, "then"), i = Cs(n, "else");
    if (!s && !i)
      return;
    const a = t.let("valid", !0), o = t.name("_valid");
    if (u(), e.reset(), s && i) {
      const f = t.let("ifClause");
      e.setParams({ ifClause: f }), t.if(o, d("then", f), d("else", f));
    } else
      s ? t.if(o, d("then")) : t.if((0, yr.not)(o), d("else"));
    e.pass(a, () => e.error(!0));
    function u() {
      const f = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o);
      e.mergeEvaluated(f);
    }
    function d(f, y) {
      return () => {
        const E = e.subschema({ keyword: f }, o);
        t.assign(a, o), e.mergeValidEvaluated(E, a), y ? t.assign(y, (0, yr._)`${f}`) : e.setParams({ ifClause: f });
      };
    }
  }
};
function Cs(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, pi.alwaysValidSchema)(e, r);
}
Cn.default = al;
var jn = {};
Object.defineProperty(jn, "__esModule", { value: !0 });
const ol = ne, cl = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, ol.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
jn.default = cl;
Object.defineProperty($n, "__esModule", { value: !0 });
const ll = Tt, ul = _n, dl = Nt, fl = wn, pl = bn, hl = di, ml = Pn, yl = Sr, gl = En, vl = Sn, $l = Rn, _l = Tn, wl = Nn, bl = On, Pl = Cn, El = jn;
function Sl(e = !1) {
  const t = [
    // any
    $l.default,
    _l.default,
    wl.default,
    bl.default,
    Pl.default,
    El.default,
    // object
    ml.default,
    yl.default,
    hl.default,
    gl.default,
    vl.default
  ];
  return e ? t.push(ul.default, fl.default) : t.push(ll.default, dl.default), t.push(pl.default), t;
}
$n.default = Sl;
var kn = {}, In = {};
Object.defineProperty(In, "__esModule", { value: !0 });
const ye = ee(), Rl = {
  message: ({ schemaCode: e }) => (0, ye.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, ye._)`{format: ${e}}`
}, Tl = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Rl,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: i, schemaCode: a, it: o } = e, { opts: u, errSchemaPath: d, schemaEnv: f, self: y } = o;
    if (!u.validateFormats)
      return;
    s ? E() : w();
    function E() {
      const _ = r.scopeValue("formats", {
        ref: y.formats,
        code: u.code.formats
      }), b = r.const("fDef", (0, ye._)`${_}[${a}]`), $ = r.let("fType"), g = r.let("format");
      r.if((0, ye._)`typeof ${b} == "object" && !(${b} instanceof RegExp)`, () => r.assign($, (0, ye._)`${b}.type || "string"`).assign(g, (0, ye._)`${b}.validate`), () => r.assign($, (0, ye._)`"string"`).assign(g, b)), e.fail$data((0, ye.or)(j(), O()));
      function j() {
        return u.strictSchema === !1 ? ye.nil : (0, ye._)`${a} && !${g}`;
      }
      function O() {
        const A = f.$async ? (0, ye._)`(${b}.async ? await ${g}(${n}) : ${g}(${n}))` : (0, ye._)`${g}(${n})`, q = (0, ye._)`(typeof ${g} == "function" ? ${A} : ${g}.test(${n}))`;
        return (0, ye._)`${g} && ${g} !== true && ${$} === ${t} && !${q}`;
      }
    }
    function w() {
      const _ = y.formats[i];
      if (!_) {
        j();
        return;
      }
      if (_ === !0)
        return;
      const [b, $, g] = O(_);
      b === t && e.pass(A());
      function j() {
        if (u.strictSchema === !1) {
          y.logger.warn(q());
          return;
        }
        throw new Error(q());
        function q() {
          return `unknown format "${i}" ignored in schema at path "${d}"`;
        }
      }
      function O(q) {
        const R = q instanceof RegExp ? (0, ye.regexpCode)(q) : u.code.formats ? (0, ye._)`${u.code.formats}${(0, ye.getProperty)(i)}` : void 0, k = r.scopeValue("formats", { key: i, ref: q, code: R });
        return typeof q == "object" && !(q instanceof RegExp) ? [q.type || "string", q.validate, (0, ye._)`${k}.validate`] : ["string", q, k];
      }
      function A() {
        if (typeof _ == "object" && !(_ instanceof RegExp) && _.async) {
          if (!f.$async)
            throw new Error("async format in sync schema");
          return (0, ye._)`await ${g}(${n})`;
        }
        return typeof $ == "function" ? (0, ye._)`${g}(${n})` : (0, ye._)`${g}.test(${n})`;
      }
    }
  }
};
In.default = Tl;
Object.defineProperty(kn, "__esModule", { value: !0 });
const Nl = In, Ol = [Nl.default];
kn.default = Ol;
var Rt = {};
Object.defineProperty(Rt, "__esModule", { value: !0 });
Rt.contentVocabulary = Rt.metadataVocabulary = void 0;
Rt.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Rt.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(nn, "__esModule", { value: !0 });
const Cl = sn, jl = on, kl = $n, Il = kn, js = Rt, Al = [
  Cl.default,
  jl.default,
  (0, kl.default)(),
  Il.default,
  js.metadataVocabulary,
  js.contentVocabulary
];
nn.default = Al;
var An = {}, hi = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.DiscrError = void 0, function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  }(e.DiscrError || (e.DiscrError = {}));
})(hi);
Object.defineProperty(An, "__esModule", { value: !0 });
const bt = ee(), Lr = hi, ks = Te, Dl = ne, Fl = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Lr.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, bt._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, Ml = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Fl,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: i } = e, { oneOf: a } = s;
    if (!i.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = n.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!a)
      throw new Error("discriminator: requires oneOf keyword");
    const u = t.let("valid", !1), d = t.const("tag", (0, bt._)`${r}${(0, bt.getProperty)(o)}`);
    t.if((0, bt._)`typeof ${d} == "string"`, () => f(), () => e.error(!1, { discrError: Lr.DiscrError.Tag, tag: d, tagName: o })), e.ok(u);
    function f() {
      const w = E();
      t.if(!1);
      for (const _ in w)
        t.elseIf((0, bt._)`${d} === ${_}`), t.assign(u, y(w[_]));
      t.else(), e.error(!1, { discrError: Lr.DiscrError.Mapping, tag: d, tagName: o }), t.endIf();
    }
    function y(w) {
      const _ = t.name("valid"), b = e.subschema({ keyword: "oneOf", schemaProp: w }, _);
      return e.mergeEvaluated(b, bt.Name), _;
    }
    function E() {
      var w;
      const _ = {}, b = g(s);
      let $ = !0;
      for (let A = 0; A < a.length; A++) {
        let q = a[A];
        q?.$ref && !(0, Dl.schemaHasRulesButRef)(q, i.self.RULES) && (q = ks.resolveRef.call(i.self, i.schemaEnv.root, i.baseId, q?.$ref), q instanceof ks.SchemaEnv && (q = q.schema));
        const R = (w = q?.properties) === null || w === void 0 ? void 0 : w[o];
        if (typeof R != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        $ = $ && (b || g(q)), j(R, A);
      }
      if (!$)
        throw new Error(`discriminator: "${o}" must be required`);
      return _;
      function g({ required: A }) {
        return Array.isArray(A) && A.includes(o);
      }
      function j(A, q) {
        if (A.const)
          O(A.const, q);
        else if (A.enum)
          for (const R of A.enum)
            O(R, q);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function O(A, q) {
        if (typeof A != "string" || A in _)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        _[A] = q;
      }
    }
  }
};
An.default = Ml;
const ql = "http://json-schema.org/draft-07/schema#", Ul = "http://json-schema.org/draft-07/schema#", Ll = "Core schema meta-schema", Vl = {
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
}, zl = [
  "object",
  "boolean"
], Hl = {
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
}, Wl = {
  $schema: ql,
  $id: Ul,
  title: Ll,
  definitions: Vl,
  type: zl,
  properties: Hl,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  const r = Js, n = nn, s = An, i = Wl, a = ["/properties"], o = "http://json-schema.org/draft-07/schema";
  class u extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((_) => this.addVocabulary(_)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const _ = this.opts.$data ? this.$dataMetaSchema(i, a) : i;
      this.addMetaSchema(_, o, !1), this.refs["http://json-schema.org/schema"] = o;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  e.exports = t = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
  var d = br();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var f = ee();
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return f._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return f.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return f.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return f.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return f.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return f.CodeGen;
  } });
  var y = Xr();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return y.default;
  } });
  var E = en();
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(Dr, Dr.exports);
var Kl = Dr.exports;
const Gl = /* @__PURE__ */ Va(Kl), Bl = "http://json-schema.org/schema", xl = "#/definitions/Blueprint", Jl = {
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
            type: "string",
            description: "Path to the plugin directory as absolute path (/wordpress/wp-content/plugins/plugin-name); or the plugin entry file relative to the plugins directory (plugin-name/plugin-name.php)."
          },
          pluginName: {
            type: "string",
            description: "Optional. Plugin name to display in the progress bar."
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
            type: "string",
            description: "The name of the theme folder inside wp-content/themes/"
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
            type: "string",
            description: "Source path"
          },
          toPath: {
            type: "string",
            description: "Target path"
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
            type: "string",
            description: "The URL"
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
            $ref: "#/definitions/FileReference",
            description: "The file to import"
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
            type: "string",
            description: "The path of the directory you want to create"
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
            type: "string",
            description: "Source path"
          },
          toPath: {
            type: "string",
            description: "Target path"
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
            $ref: "#/definitions/PHPRequest",
            description: "Request details (See /wordpress-playground/api/universal/interface/PHPRequest)"
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
            $ref: "#/definitions/FileReference",
            description: "The zip file containing the new WordPress site"
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
            type: "string",
            description: "The path to remove"
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
            type: "string",
            description: "The path to remove"
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
            $ref: "#/definitions/PHPRunOptions",
            description: "Run options (See /wordpress-playground/api/universal/interface/PHPRunOptions)"
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
            type: "string",
            description: 'Entry name e.g. "display_errors"'
          },
          value: {
            type: "string",
            description: 'Entry value as a string e.g. "1"'
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
            type: "string",
            description: "The zip file to extract"
          },
          extractToPath: {
            type: "string",
            description: "The path to extract the zip file to"
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
            additionalProperties: {},
            description: 'An object of user meta values to set, e.g. { "first_name": "John" }'
          },
          userId: {
            type: "number",
            description: "User ID"
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
            type: "string",
            description: "The path of the file to write to"
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
            ],
            description: "The data to write"
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
}, Yl = {
  $schema: Bl,
  $ref: xl,
  definitions: Jl
}, Zl = [
  "6.2",
  "6.1",
  "6.0",
  "5.9",
  "nightly"
];
function Ql(e, {
  progress: t = new wr(),
  semaphore: r = new zs({ concurrency: 3 }),
  onStepCompleted: n = () => {
  }
} = {}) {
  e = {
    ...e,
    steps: (e.steps || []).filter(tu)
  };
  const { valid: s, errors: i } = eu(e);
  if (!s) {
    const d = new Error(
      `Invalid blueprint: ${i[0].message} at ${i[0].instancePath}`
    );
    throw d.errors = i, d;
  }
  const a = e.steps || [], o = a.reduce(
    (d, f) => d + (f.progress?.weight || 1),
    0
  ), u = a.map(
    (d) => ru(d, {
      semaphore: r,
      rootProgressTracker: t,
      totalProgressWeight: o
    })
  );
  return {
    versions: {
      php: Is(
        e.preferredVersions?.php,
        Br,
        $a
      ),
      wp: Is(
        e.preferredVersions?.wp,
        Zl,
        "6.2"
      )
    },
    run: async (d) => {
      try {
        for (const { resources: f } of u)
          for (const y of f)
            y.setPlayground(d), y.isAsync && y.resolve();
        for (const { run: f, step: y } of u) {
          const E = await f(d);
          n(E, y);
        }
      } finally {
        try {
          await d.goTo(
            e.landingPage || "/"
          );
        } catch {
        }
        t.finish();
      }
    }
  };
}
const Xl = new Gl({ discriminator: !0 });
let ir;
function eu(e) {
  ir = Xl.compile(Yl);
  const t = ir(e);
  if (t)
    return { valid: t };
  const r = /* @__PURE__ */ new Set();
  for (const s of ir.errors)
    s.schemaPath.startsWith("#/properties/steps/items/anyOf") || r.add(s.instancePath);
  const n = ir.errors?.filter(
    (s) => !(s.schemaPath.startsWith("#/properties/steps/items/anyOf") && r.has(s.instancePath))
  );
  return {
    valid: t,
    errors: n
  };
}
function Is(e, t, r) {
  return e && t.includes(e) ? e : r;
}
function tu(e) {
  return !!(typeof e == "object" && e);
}
function ru(e, {
  semaphore: t,
  rootProgressTracker: r,
  totalProgressWeight: n
}) {
  const s = r.stage(
    (e.progress?.weight || 1) / n
  ), i = {};
  for (const f of Object.keys(e)) {
    let y = e[f];
    ja(y) && (y = yt.create(y, {
      semaphore: t
    })), i[f] = y;
  }
  const a = async (f) => {
    try {
      return s.fillSlowly(), await oa[e.step](
        f,
        await nu(i),
        {
          tracker: s,
          initialCaption: e.progress?.caption
        }
      );
    } finally {
      s.finish();
    }
  }, o = As(i), u = As(i).filter(
    (f) => f.isAsync
  ), d = 1 / (u.length + 1);
  for (const f of u)
    f.progress = s.stage(d);
  return { run: a, step: e, resources: o };
}
function As(e) {
  const t = [];
  for (const r in e) {
    const n = e[r];
    n instanceof yt && t.push(n);
  }
  return t;
}
async function nu(e) {
  const t = {};
  for (const r in e) {
    const n = e[r];
    n instanceof yt ? t[r] = await n.resolve() : t[r] = n;
  }
  return t;
}
async function su(e, t) {
  await e.run(t);
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const mi = Symbol("Comlink.proxy"), iu = Symbol("Comlink.endpoint"), au = Symbol("Comlink.releaseProxy"), Ir = Symbol("Comlink.finalizer"), dr = Symbol("Comlink.thrown"), yi = (e) => typeof e == "object" && e !== null || typeof e == "function", ou = {
  canHandle: (e) => yi(e) && e[mi],
  serialize(e) {
    const { port1: t, port2: r } = new MessageChannel();
    return Dn(e, t), [r, [r]];
  },
  deserialize(e) {
    return e.start(), Fn(e);
  }
}, cu = {
  canHandle: (e) => yi(e) && dr in e,
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
}, zt = /* @__PURE__ */ new Map([
  ["proxy", ou],
  ["throw", cu]
]);
function lu(e, t) {
  for (const r of e)
    if (t === r || r === "*" || r instanceof RegExp && r.test(t))
      return !0;
  return !1;
}
function Dn(e, t = globalThis, r = ["*"]) {
  t.addEventListener("message", function n(s) {
    if (!s || !s.data)
      return;
    if (!lu(r, s.origin)) {
      console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
      return;
    }
    const { id: i, type: a, path: o } = Object.assign({ path: [] }, s.data), u = (s.data.argumentList || []).map(ft);
    let d;
    try {
      const f = o.slice(0, -1).reduce((E, w) => E[w], e), y = o.reduce((E, w) => E[w], e);
      switch (a) {
        case "GET":
          d = y;
          break;
        case "SET":
          f[o.slice(-1)[0]] = ft(s.data.value), d = !0;
          break;
        case "APPLY":
          d = y.apply(f, u);
          break;
        case "CONSTRUCT":
          {
            const E = new y(...u);
            d = _i(E);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: E, port2: w } = new MessageChannel();
            Dn(e, w), d = hu(E, [E]);
          }
          break;
        case "RELEASE":
          d = void 0;
          break;
        default:
          return;
      }
    } catch (f) {
      d = { value: f, [dr]: 0 };
    }
    Promise.resolve(d).catch((f) => ({ value: f, [dr]: 0 })).then((f) => {
      const [y, E] = $r(f);
      t.postMessage(Object.assign(Object.assign({}, y), { id: i }), E), a === "RELEASE" && (t.removeEventListener("message", n), gi(t), Ir in e && typeof e[Ir] == "function" && e[Ir]());
    }).catch((f) => {
      const [y, E] = $r({
        value: new TypeError("Unserializable return value"),
        [dr]: 0
      });
      t.postMessage(Object.assign(Object.assign({}, y), { id: i }), E);
    });
  }), t.start && t.start();
}
function uu(e) {
  return e.constructor.name === "MessagePort";
}
function gi(e) {
  uu(e) && e.close();
}
function Fn(e, t) {
  return Vr(e, [], t);
}
function ar(e) {
  if (e)
    throw new Error("Proxy has been released and is not useable");
}
function vi(e) {
  return Pt(e, {
    type: "RELEASE"
  }).then(() => {
    gi(e);
  });
}
const gr = /* @__PURE__ */ new WeakMap(), vr = "FinalizationRegistry" in globalThis && new FinalizationRegistry((e) => {
  const t = (gr.get(e) || 0) - 1;
  gr.set(e, t), t === 0 && vi(e);
});
function du(e, t) {
  const r = (gr.get(t) || 0) + 1;
  gr.set(t, r), vr && vr.register(e, t, e);
}
function fu(e) {
  vr && vr.unregister(e);
}
function Vr(e, t = [], r = function() {
}) {
  let n = !1;
  const s = new Proxy(r, {
    get(i, a) {
      if (ar(n), a === au)
        return () => {
          fu(s), vi(e), n = !0;
        };
      if (a === "then") {
        if (t.length === 0)
          return { then: () => s };
        const o = Pt(e, {
          type: "GET",
          path: t.map((u) => u.toString())
        }).then(ft);
        return o.then.bind(o);
      }
      return Vr(e, [...t, a]);
    },
    set(i, a, o) {
      ar(n);
      const [u, d] = $r(o);
      return Pt(e, {
        type: "SET",
        path: [...t, a].map((f) => f.toString()),
        value: u
      }, d).then(ft);
    },
    apply(i, a, o) {
      ar(n);
      const u = t[t.length - 1];
      if (u === iu)
        return Pt(e, {
          type: "ENDPOINT"
        }).then(ft);
      if (u === "bind")
        return Vr(e, t.slice(0, -1));
      const [d, f] = Ds(o);
      return Pt(e, {
        type: "APPLY",
        path: t.map((y) => y.toString()),
        argumentList: d
      }, f).then(ft);
    },
    construct(i, a) {
      ar(n);
      const [o, u] = Ds(a);
      return Pt(e, {
        type: "CONSTRUCT",
        path: t.map((d) => d.toString()),
        argumentList: o
      }, u).then(ft);
    }
  });
  return du(s, e), s;
}
function pu(e) {
  return Array.prototype.concat.apply([], e);
}
function Ds(e) {
  const t = e.map($r);
  return [t.map((r) => r[0]), pu(t.map((r) => r[1]))];
}
const $i = /* @__PURE__ */ new WeakMap();
function hu(e, t) {
  return $i.set(e, t), e;
}
function _i(e) {
  return Object.assign(e, { [mi]: !0 });
}
function mu(e, t = globalThis, r = "*") {
  return {
    postMessage: (n, s) => e.postMessage(n, r, s),
    addEventListener: t.addEventListener.bind(t),
    removeEventListener: t.removeEventListener.bind(t)
  };
}
function $r(e) {
  for (const [t, r] of zt)
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
    $i.get(e) || []
  ];
}
function ft(e) {
  switch (e.type) {
    case "HANDLER":
      return zt.get(e.name).deserialize(e.value);
    case "RAW":
      return e.value;
  }
}
function Pt(e, t, r) {
  return new Promise((n) => {
    const s = yu();
    e.addEventListener("message", function i(a) {
      !a.data || !a.data.id || a.data.id !== s || (e.removeEventListener("message", i), n(a.data));
    }), e.start && e.start(), e.postMessage(Object.assign({ id: s }, t), r);
  });
}
function yu() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
function wi(e) {
  vu();
  const t = e instanceof Worker ? e : mu(e), r = Fn(t), n = bi(r);
  return new Proxy(n, {
    get: (s, i) => i === "isConnected" ? async () => {
      for (let a = 0; a < 10; a++)
        try {
          await gu(r.isConnected(), 200);
          break;
        } catch {
        }
    } : r[i]
  });
}
async function gu(e, t) {
  return new Promise((r, n) => {
    setTimeout(n, t), e.then(r);
  });
}
let Fs = !1;
function vu() {
  Fs || (Fs = !0, zt.set("EVENT", {
    canHandle: (e) => e instanceof CustomEvent,
    serialize: (e) => [
      {
        detail: e.detail
      },
      []
    ],
    deserialize: (e) => e
  }), zt.set("FUNCTION", {
    canHandle: (e) => typeof e == "function",
    serialize(e) {
      console.debug("[Comlink][Performance] Proxying a function");
      const { port1: t, port2: r } = new MessageChannel();
      return Dn(e, t), [r, [r]];
    },
    deserialize(e) {
      return e.start(), Fn(e);
    }
  }), zt.set("PHPResponse", {
    canHandle: (e) => typeof e == "object" && e !== null && "headers" in e && "bytes" in e && "errors" in e && "exitCode" in e && "httpStatusCode" in e,
    serialize(e) {
      return [e.toRawData(), []];
    },
    deserialize(e) {
      return pt.fromRawData(e);
    }
  }));
}
function bi(e) {
  return new Proxy(e, {
    get(t, r) {
      switch (typeof t[r]) {
        case "function":
          return (...n) => t[r](...n);
        case "object":
          return t[r] === null ? t[r] : bi(t[r]);
        case "undefined":
        case "number":
        case "string":
          return t[r];
        default:
          return _i(t[r]);
      }
    }
  });
}
async function $u({
  iframe: e,
  blueprint: t,
  remoteUrl: r,
  progressTracker: n = new wr(),
  disableProgressBar: s,
  onBlueprintStepCompleted: i
}) {
  if (wu(r), _u(e), r = qs(r, {
    progressbar: !s
  }), n.setCaption("Preparing WordPress"), !t)
    return Ms(e, r, n);
  const a = Ql(t, {
    progress: n.stage(0.5),
    onStepCompleted: i
  }), o = await Ms(
    e,
    qs(r, {
      php: a.versions.php,
      wp: a.versions.wp
    }),
    n
  );
  return await su(a, o), n.finish(), o;
}
function _u(e) {
  e.sandbox?.length && !e.sandbox?.contains("allow-storage-access-by-user-activation") && e.sandbox.add("allow-storage-access-by-user-activation");
}
async function Ms(e, t, r) {
  await new Promise((i) => {
    e.src = t, e.addEventListener("load", i, !1);
  });
  const n = wi(
    e.contentWindow
  );
  await n.isConnected(), r.pipe(n);
  const s = r.stage();
  return await n.onDownloadProgress(s.loadingListener), await n.isReady(), s.finish(), n;
}
const fr = "https://playground.wordpress.net";
function wu(e) {
  const t = new URL(e, fr);
  if ((t.origin === fr || t.hostname === "localhost") && t.pathname !== "/remote.html")
    throw new Error(
      `Invalid remote URL: ${t}. Expected origin to be ${fr}/remote.html.`
    );
}
function qs(e, t) {
  const r = new URL(e, fr), n = new URLSearchParams(r.search);
  for (const [s, i] of Object.entries(t))
    i != null && i !== !1 && n.set(s, i.toString());
  return r.search = n.toString(), r.toString();
}
async function Eu(e, t) {
  if (console.warn(
    "`connectPlayground` is deprecated and will be removed. Use `startPlayground` instead."
  ), t?.loadRemote)
    return $u({
      iframe: e,
      remoteUrl: t.loadRemote
    });
  const r = wi(
    e.contentWindow
  );
  return await r.isConnected(), r;
}
export {
  $a as LatestSupportedPHPVersion,
  Br as SupportedPHPVersions,
  bu as SupportedPHPVersionsList,
  Us as activatePlugin,
  Ls as activateTheme,
  Fi as applyWordPressPatches,
  Ql as compileBlueprint,
  Eu as connectPlayground,
  zi as cp,
  Bi as defineSiteUrl,
  Hr as defineWpConfigConsts,
  Zi as importFile,
  ea as installPlugin,
  ra as installTheme,
  na as login,
  Wi as mkdir,
  Hi as mv,
  St as phpVar,
  Wr as phpVars,
  Yi as replaceSite,
  Vi as request,
  Ki as rm,
  Gi as rmdir,
  su as runBlueprintSteps,
  qi as runPHP,
  Ui as runPHPWithOptions,
  sa as runWpInstallationWizard,
  Li as setPhpIniEntry,
  Pu as setPluginProxyURL,
  ia as setSiteOptions,
  $u as startPlaygroundWeb,
  Kr as unzip,
  aa as updateUserMeta,
  Vs as writeFile,
  Ji as zipEntireSite
};
