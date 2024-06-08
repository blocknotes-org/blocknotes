import { W as WebPlugin, E as Encoding } from "./index-B4hKZ96H.js";
function resolve(path) {
  const posix = path.split("/").filter((item) => item !== ".");
  const newPosix = [];
  posix.forEach((item) => {
    if (item === ".." && newPosix.length > 0 && newPosix[newPosix.length - 1] !== "..") {
      newPosix.pop();
    } else {
      newPosix.push(item);
    }
  });
  return newPosix.join("/");
}
function isPathParent(parent, children) {
  parent = resolve(parent);
  children = resolve(children);
  const pathsA = parent.split("/");
  const pathsB = children.split("/");
  return parent !== children && pathsA.every((value, index) => value === pathsB[index]);
}
async function moveFile(dirHandle, handle, destinationDirHandle, newName = null) {
  if (handle.move) {
    await handle.move(destinationDirHandle, newName);
    return;
  }
  const originalName = handle.name;
  const targetName = newName || originalName;
  const fileData = await handle.getFile();
  const newFileHandle = await destinationDirHandle.getFileHandle(targetName, { create: true });
  const writableStream = await newFileHandle.createWritable();
  await writableStream.write(fileData);
  await writableStream.close();
  await dirHandle.removeEntry(originalName);
}
class FilesystemWeb extends WebPlugin {
  constructor() {
    super(...arguments);
    this.DB_VERSION = 1;
    this.DB_NAME = "Disc";
    this._writeCmds = ["add", "put", "delete"];
  }
  async initDb() {
    if (this._db !== void 0) {
      return this._db;
    }
    if (!("showDirectoryPicker" in window)) {
      throw this.unavailable("This browser doesn't support showDirectoryPicker.");
    }
    return new Promise((resolve2, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = FilesystemWeb.doUpgrade;
      request.onsuccess = () => {
        this._db = request.result;
        resolve2(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn("db blocked");
      };
    });
  }
  static doUpgrade(event) {
    const eventTarget = event.target;
    const db = eventTarget.result;
    switch (event.oldVersion) {
      case 0:
      case 1:
      default: {
        if (db.objectStoreNames.contains("FileStorage")) {
          db.deleteObjectStore("FileStorage");
        }
        const store = db.createObjectStore("FileStorage", { keyPath: "path" });
        store.createIndex("by_folder", "folder");
      }
    }
  }
  async dbRequest(cmd, args) {
    const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
    return this.initDb().then((conn) => {
      return new Promise((resolve2, reject) => {
        const tx = conn.transaction(["FileStorage"], readFlag);
        const store = tx.objectStore("FileStorage");
        const req = store[cmd](...args);
        req.onsuccess = () => resolve2(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }
  async dbIndexRequest(indexName, cmd, args) {
    const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
    return this.initDb().then((conn) => {
      return new Promise((resolve2, reject) => {
        const tx = conn.transaction(["FileStorage"], readFlag);
        const store = tx.objectStore("FileStorage");
        const index = store.index(indexName);
        const req = index[cmd](...args);
        req.onsuccess = () => resolve2(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }
  getPath(directory, uriPath) {
    const cleanedUriPath = uriPath !== void 0 ? uriPath.replace(/^[/]+|[/]+$/g, "") : "";
    let fsPath = "";
    if (directory !== void 0)
      fsPath += "/" + directory;
    if (uriPath !== "")
      fsPath += "/" + cleanedUriPath;
    return fsPath;
  }
  async clear() {
    const conn = await this.initDb();
    const tx = conn.transaction(["FileStorage"], "readwrite");
    const store = tx.objectStore("FileStorage");
    store.clear();
  }
  /**
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  async readFile(options) {
    const { path } = options;
    const fileHandle = await this.getFileHandle(path, options);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return { data: text ? text : "" };
  }
  /**
   * Write a file to disk in the specified location on device
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  async writeFile(options) {
    const { path, data } = options;
    const fileHandle = await this.getFileHandle(path, { ...options, create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
  /**
   * Append to a file on disk in the specified location on device
   * @param options options for the file append
   * @return a promise that resolves with the file write result
   */
  async appendFile(options) {
    const path = this.getPath(options.directory, options.path);
    let data = options.data;
    const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf("/"));
    const now = Date.now();
    let ctime = now;
    const occupiedEntry = await this.dbRequest("get", [path]);
    if (occupiedEntry && occupiedEntry.type === "directory")
      throw Error("The supplied path is a directory.");
    const parentEntry = await this.dbRequest("get", [parentPath]);
    if (parentEntry === void 0) {
      const subDirIndex = parentPath.indexOf("/", 1);
      if (subDirIndex !== -1) {
        const parentArgPath = parentPath.substr(subDirIndex);
        await this.mkdir({
          path: parentArgPath,
          directory: options.directory,
          recursive: true
        });
      }
    }
    if (!encoding && !this.isBase64String(data))
      throw Error("The supplied data is not valid base64 content.");
    if (occupiedEntry !== void 0) {
      if (occupiedEntry.content !== void 0 && !encoding) {
        data = btoa(atob(occupiedEntry.content) + atob(data));
      } else {
        data = occupiedEntry.content + data;
      }
      ctime = occupiedEntry.ctime;
    }
    const pathObj = {
      path,
      folder: parentPath,
      type: "file",
      size: data.length,
      ctime,
      mtime: now,
      content: data
    };
    await this.dbRequest("put", [pathObj]);
  }
  /**
   * Delete a file from disk
   * @param options options for the file delete
   * @return a promise that resolves with the deleted file data result
   */
  async deleteFile(options) {
    const path = this.getPath(options.directory, options.path);
    const entry = await this.dbRequest("get", [path]);
    if (entry === void 0)
      throw Error("File does not exist.");
    const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [
      IDBKeyRange.only(path)
    ]);
    if (entries.length !== 0)
      throw Error("Folder is not empty.");
    await this.dbRequest("delete", [path]);
  }
  /**
   * Create a directory.
   * @param options options for the mkdir
   * @return a promise that resolves with the mkdir result
   */
  async mkdir(options) {
    await this.getDirectoryHandle(options.path, { ...options, create: true });
  }
  /**
   * Remove a directory
   * @param options the options for the directory remove
   */
  async rmdir(options) {
    const { path, directory, recursive } = options;
    const fullPath = this.getPath(directory, path);
    const entry = await this.dbRequest("get", [fullPath]);
    if (entry === void 0)
      throw Error("Folder does not exist.");
    if (entry.type !== "directory")
      throw Error("Requested path is not a directory");
    const readDirResult = await this.readdir({ path, directory });
    if (readDirResult.files.length !== 0 && !recursive)
      throw Error("Folder is not empty");
    for (const entry2 of readDirResult.files) {
      const entryPath = `${path}/${entry2.name}`;
      const entryObj = await this.stat({ path: entryPath, directory });
      if (entryObj.type === "file") {
        await this.deleteFile({ path: entryPath, directory });
      } else {
        await this.rmdir({ path: entryPath, directory, recursive });
      }
    }
    await this.dbRequest("delete", [fullPath]);
  }
  /**
   * Return a list of files from the directory (not recursive)
   * @param options the options for the readdir operation
   * @return a promise that resolves with the readdir directory listing result
   */
  async readdir(options) {
    const path = options.path;
    const dir = await this.getDirectoryHandle(path, options);
    const values = await dir.values();
    const files = [];
    for await (const entry of values) {
      files.push({
        name: entry.name,
        type: entry.kind === "file" ? "file" : "directory",
        size: entry.kind === "file" ? entry.size : 0,
        ctime: entry.kind === "file" ? entry.lastModified : 0,
        mtime: entry.kind === "file" ? entry.lastModified : 0,
        uri: entry.kind === "file" ? entry.name : entry.name + "/"
      });
    }
    return { files };
  }
  /**
   * Return full File URI for a path and directory
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async getUri(options) {
    const path = this.getPath(options.directory, options.path);
    let entry = await this.dbRequest("get", [path]);
    if (entry === void 0) {
      entry = await this.dbRequest("get", [path + "/"]);
    }
    return {
      uri: (entry === null || entry === void 0 ? void 0 : entry.path) || path
    };
  }
  /**
   * Return data about a file
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async stat(options) {
    const fileHandle = await this.getFileHandle(options.path, options);
    const entry = fileHandle.getFile();
    return {
      type: entry.type,
      size: entry.size,
      ctime: entry.ctime,
      mtime: entry.mtime,
      uri: entry.path
    };
  }
  async getDirectoryHandle(path, options = {}) {
    let handle = options.directory || this._dirHandle;
    if (!path)
      return handle;
    const directories = path.split("/");
    for (const directory of directories) {
      handle = await handle.getDirectoryHandle(directory, options);
    }
    return handle;
  }
  async getHandle(path, options) {
    const directories = path.split("/");
    const maybeFileName = directories.pop();
    let handle = await this.getDirectoryHandle(directories.join("/"), options);
    try {
      handle = await handle.getFileHandle(maybeFileName, options);
    } catch (e) {
      handle = await handle.getDirectoryHandle(maybeFileName, options);
    }
    return handle;
  }
  async getFileHandle(path, options) {
    const directories = path.split("/");
    const fileName = directories.pop();
    const handle = await this.getDirectoryHandle(directories.join("/"), options);
    return await handle.getFileHandle(fileName, options);
  }
  /**
   * Rename a file or directory
   * @param options the options for the rename operation
   * @return a promise that resolves with the rename result
   */
  async rename(options) {
    const { to, from } = options;
    let fileHandle;
    try {
      fileHandle = await this.getFileHandle(from, options);
    } catch (e) {
    }
    if (fileHandle) {
      const directories = from.split("/");
      directories.pop();
      const dir = directories.join("/");
      const dirHandle = await this.getDirectoryHandle(dir, options);
      const newDirectories = to.split("/");
      const newName = newDirectories.pop();
      const newDir = newDirectories.join("/");
      const newDirHandle = await this.getDirectoryHandle(newDir, options);
      await moveFile(dirHandle, fileHandle, newDirHandle, newName);
    } else {
      await this.getDirectoryHandle(to, { ...options, create: true });
      const fromDir = await this.getDirectoryHandle(from, options);
      const entries = await fromDir.values();
      for await (const entry of entries) {
        await this.rename({
          from: `${from}/${entry.name}`,
          to: `${to}/${entry.name}`
        });
      }
    }
    return;
  }
  /**
   * Copy a file or directory
   * @param options the options for the copy operation
   * @return a promise that resolves with the copy result
   */
  async copy(options) {
    return this._copy(options, false);
  }
  async requestPermissions() {
    try {
      this._dirHandle = await window.showDirectoryPicker({
        mode: "readwrite"
      });
    } catch (e) {
      return { publicStorage: "denied" };
    }
    return { publicStorage: "granted" };
  }
  async pickDirectory() {
    this._dirHandle = await window.showDirectoryPicker({
      mode: "readwrite"
    });
    return { url: this._dirHandle };
  }
  async checkPermissions() {
    if (!("showDirectoryPicker" in window)) {
      throw this.unavailable("This browser doesn't support showDirectoryPicker.");
    }
    return { publicStorage: this._dirHandle ? "granted" : "prompt" };
  }
  /**
   * Function that can perform a copy or a rename
   * @param options the options for the rename operation
   * @param doRename whether to perform a rename or copy operation
   * @return a promise that resolves with the result
   */
  async _copy(options, doRename = false) {
    let { toDirectory } = options;
    const { to, from, directory: fromDirectory } = options;
    if (!to || !from) {
      throw Error("Both to and from must be provided");
    }
    if (!toDirectory) {
      toDirectory = fromDirectory;
    }
    const fromPath = this.getPath(fromDirectory, from);
    const toPath = this.getPath(toDirectory, to);
    if (fromPath === toPath) {
      return {
        uri: toPath
      };
    }
    if (isPathParent(fromPath, toPath)) {
      throw Error("To path cannot contain the from path");
    }
    let toObj;
    try {
      toObj = await this.stat({
        path: to,
        directory: toDirectory
      });
    } catch (e) {
      const toPathComponents = to.split("/");
      toPathComponents.pop();
      const toPath2 = toPathComponents.join("/");
      if (toPathComponents.length > 0) {
        const toParentDirectory = await this.stat({
          path: toPath2,
          directory: toDirectory
        });
        if (toParentDirectory.type !== "directory") {
          throw new Error("Parent directory of the to path is a file");
        }
      }
    }
    if (toObj && toObj.type === "directory") {
      throw new Error("Cannot overwrite a directory with a file");
    }
    const fromObj = await this.stat({
      path: from,
      directory: fromDirectory
    });
    const updateTime = async (path, ctime2, mtime) => {
      const fullPath = this.getPath(toDirectory, path);
      const entry = await this.dbRequest("get", [fullPath]);
      entry.ctime = ctime2;
      entry.mtime = mtime;
      await this.dbRequest("put", [entry]);
    };
    const ctime = fromObj.ctime ? fromObj.ctime : Date.now();
    switch (fromObj.type) {
      case "file": {
        const file = await this.readFile({
          path: from,
          directory: fromDirectory
        });
        if (doRename) {
          await this.deleteFile({
            path: from,
            directory: fromDirectory
          });
        }
        let encoding;
        if (!this.isBase64String(file.data)) {
          encoding = Encoding.UTF8;
        }
        const writeResult = await this.writeFile({
          path: to,
          directory: toDirectory,
          data: file.data,
          encoding
        });
        if (doRename) {
          await updateTime(to, ctime, fromObj.mtime);
        }
        return writeResult;
      }
      case "directory": {
        if (toObj) {
          throw Error("Cannot move a directory over an existing object");
        }
        try {
          await this.mkdir({
            path: to,
            directory: toDirectory,
            recursive: false
          });
          if (doRename) {
            await updateTime(to, ctime, fromObj.mtime);
          }
        } catch (e) {
        }
        const contents = (await this.readdir({
          path: from,
          directory: fromDirectory
        })).files;
        for (const filename of contents) {
          await this._copy({
            from: `${from}/${filename.name}`,
            to: `${to}/${filename.name}`,
            directory: fromDirectory,
            toDirectory
          }, doRename);
        }
        if (doRename) {
          await this.rmdir({
            path: from,
            directory: fromDirectory
          });
        }
      }
    }
    return {
      uri: toPath
    };
  }
  isBase64String(str) {
    try {
      return btoa(atob(str)) == str;
    } catch (err) {
      return false;
    }
  }
}
FilesystemWeb._debug = true;
export {
  FilesystemWeb
};
