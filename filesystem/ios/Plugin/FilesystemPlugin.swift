import Foundation
import Capacitor
import UniformTypeIdentifiers

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(FilesystemPlugin)
public class FilesystemPlugin: CAPPlugin, UIDocumentPickerDelegate {
    private let implementation = Filesystem()

    func readRegularFile(_ fileUrl: URL, encoding: String?, call: CAPPluginCall) {
        do {
            let data = try implementation.readFile(at: fileUrl, with: encoding)
            call.resolve([
                "data": data
            ])
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    func downloadAndReadICloudFile(_ fileUrl: URL, encoding: String?, call: CAPPluginCall) {
        let fileManager = FileManager.default
        do {
            try fileManager.startDownloadingUbiquitousItem(at: fileUrl)
            // Wait for download to complete
            waitForDownload(fileUrl) { success in
                if success {
                    self.readRegularFile(fileUrl, encoding: encoding, call: call)
                } else {
                    self.handleError(call, "Failed to download iCloud file")
                }
            }
        } catch {
            handleError(call, "Error starting download: \(error.localizedDescription)", error)
        }
    }

    func waitForDownload(_ fileUrl: URL, completion: @escaping (Bool) -> Void) {
        let query = NSMetadataQuery()
        query.predicate = NSPredicate(format: "%K == %@", NSMetadataItemURLKey, fileUrl as NSURL)
        query.searchScopes = [NSMetadataQueryUbiquitousDocumentsScope]

        NotificationCenter.default.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: query, queue: .main) { _ in
            query.stop()
            if let item = query.results.first as? NSMetadataItem,
            let status = item.value(forAttribute: NSMetadataUbiquitousItemDownloadingStatusKey) as? String {
                if status == NSMetadataUbiquitousItemDownloadingStatusCurrent {
                    completion(true)
                } else {
                    completion(false)
                }
            } else {
                completion(false)
            }
        }

        query.start()
    }

    /**
     * Read a file from the filesystem.
     */
    @objc func readFile(_ call: CAPPluginCall) {
        let encoding = call.getString("encoding")

        guard let file = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }
        let directory = call.getString("directory")

        guard let fileUrl = implementation.getFileUrl(at: file, in: directory) else {
            handleError(call, "Invalid path")
            return
        }
        let fileManager = FileManager.default
        var isDirectory: ObjCBool = false
        if fileManager.fileExists(atPath: fileUrl.path, isDirectory: &isDirectory) {
            if fileUrl.pathExtension == "icloud" {
                // Handle .icloud file
                downloadAndReadICloudFile(fileUrl, encoding: encoding, call: call)
            } else {
                // Handle regular file
                readRegularFile(fileUrl, encoding: encoding, call: call)
            }
        } else {
            // File doesn't exist, check if it's in iCloud
            let originalFileUrl = fileUrl.deletingPathExtension()
            if fileManager.isUbiquitousItem(at: originalFileUrl) {
                downloadAndReadICloudFile(originalFileUrl, encoding: encoding, call: call)
            } else {
                handleError(call, "File does not exist and is not in iCloud: \(fileUrl.path)")
            }
        }
    }

    /**
     * Write a file to the filesystem.
     */
    @objc func writeFile(_ call: CAPPluginCall) {
        let encoding = call.getString("encoding")
        let recursive = call.getBool("recursive") ?? false

        guard let file = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        guard let data = call.getString("data") else {
            handleError(call, "Data must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")

        guard let fileUrl = implementation.getFileUrl(at: file, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        do {
            let path = try implementation.writeFile(at: fileUrl, with: data, recursive: recursive, with: encoding)
            call.resolve([
                "uri": path
            ])
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    /**
     * Append to a file.
     */
    @objc func appendFile(_ call: CAPPluginCall) {
        let encoding = call.getString("encoding")

        guard let file = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        guard let data = call.getString("data") else {
            handleError(call, "Data must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: file, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        do {
            try implementation.appendFile(at: fileUrl, with: data, recursive: false, with: encoding)
            call.resolve()
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    /**
     * Delete a file.
     */
    @objc func deleteFile(_ call: CAPPluginCall) {
        guard let file = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: file, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        do {
            try implementation.deleteFile(at: fileUrl)
            call.resolve()
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    /**
     * Make a new directory, optionally creating parent folders first.
     */
    @objc func mkdir(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        let recursive = call.getBool("recursive") ?? false
        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: path, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        do {
            try implementation.mkdir(at: fileUrl, recursive: recursive)
            call.resolve()
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    /**
     * Remove a directory.
     */
    @objc func rmdir(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: path, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        let recursive = call.getBool("recursive") ?? false

        do {
            try implementation.rmdir(at: fileUrl, recursive: recursive)
            call.resolve()
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    /**
     * Read the contents of a directory.
     */
    @objc func readdir(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: path, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        do {
            let directoryContents = try implementation.readdir(at: fileUrl)
            let directoryContent = try directoryContents.map {(url: URL) -> [String: Any] in
                let attr = try implementation.stat(at: url)
                var ctime = ""
                var mtime = ""

                if let ctimeSeconds = (attr[.creationDate] as? Date)?.timeIntervalSince1970 {
                    ctime = String(format: "%.0f", ctimeSeconds * 1000)
                }

                if let mtimeSeconds = (attr[.modificationDate] as? Date)?.timeIntervalSince1970 {
                    mtime = String(format: "%.0f", mtimeSeconds * 1000)
                }
                return [
                    "name": url.lastPathComponent,
                    "type": implementation.getType(from: attr),
                    "size": attr[.size] as? UInt64 ?? 0,
                    "ctime": ctime,
                    "mtime": mtime,
                    "uri": url.absoluteString
                ]
            }
            call.resolve([
                "files": directoryContent
            ])
        } catch {
            handleError(call, error.localizedDescription, error)
        }
    }

    @objc func stat(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: path, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        do {
            let attr = try implementation.stat(at: fileUrl)

            var ctime = ""
            var mtime = ""

            if let ctimeSeconds = (attr[.creationDate] as? Date)?.timeIntervalSince1970 {
                ctime = String(format: "%.0f", ctimeSeconds * 1000)
            }

            if let mtimeSeconds = (attr[.modificationDate] as? Date)?.timeIntervalSince1970 {
                mtime = String(format: "%.0f", mtimeSeconds * 1000)
            }

            call.resolve([
                "type": implementation.getType(from: attr),
                "size": attr[.size] as? UInt64 ?? 0,
                "ctime": ctime,
                "mtime": mtime,
                "uri": fileUrl.absoluteString
            ])
        } catch {
            handleError(call, error.localizedDescription, error)
        }
    }

    @objc func getUri(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else {
            handleError(call, "path must be provided and must be a string.")
            return
        }

        let directory = call.getString("directory")
        guard let fileUrl = implementation.getFileUrl(at: path, in: directory) else {
            handleError(call, "Invalid path")
            return
        }

        call.resolve([
            "uri": fileUrl.absoluteString
        ])

    }

    /**
     * Rename a file or directory.
     */
    @objc func rename(_ call: CAPPluginCall) {
        guard let from = call.getString("from"), let to = call.getString("to") else {
            handleError(call, "Both to and from must be provided")
            return
        }

        let directory = call.getString("directory")
        let toDirectory = call.getString("toDirectory") ?? directory

        guard let fromUrl = implementation.getFileUrl(at: from, in: directory) else {
            handleError(call, "Invalid from path")
            return
        }

        guard let toUrl = implementation.getFileUrl(at: to, in: toDirectory) else {
            handleError(call, "Invalid to path")
            return
        }
        do {
            try implementation.rename(at: fromUrl, to: toUrl)
            call.resolve()
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    /**
     * Copy a file or directory.
     */
    @objc func copy(_ call: CAPPluginCall) {
        guard let from = call.getString("from"), let to = call.getString("to") else {
            handleError(call, "Both to and from must be provided")
            return
        }

        let directory = call.getString("directory")
        let toDirectory = call.getString("toDirectory") ?? directory

        guard let fromUrl = implementation.getFileUrl(at: from, in: directory) else {
            handleError(call, "Invalid from path")
            return
        }

        guard let toUrl = implementation.getFileUrl(at: to, in: toDirectory) else {
            handleError(call, "Invalid to path")
            return
        }
        do {
            try implementation.copy(at: fromUrl, to: toUrl)
            call.resolve([
                "uri": toUrl.absoluteString
            ])
        } catch let error as NSError {
            handleError(call, error.localizedDescription, error)
        }
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        call.resolve([
            "publicStorage": "granted"
        ])
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        call.resolve([
            "publicStorage": "granted"
        ])
    }

    var currentCall: CAPPluginCall?

    @objc public func pickDirectory(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.currentCall = call

            if #available(iOS 14.0, *) {
                let documentPicker = UIDocumentPickerViewController(forOpeningContentTypes: [UTType.folder])
                documentPicker.delegate = self
                documentPicker.modalPresentationStyle = .formSheet
                // Setting the initial directory (if possible)
                if let iCloudDriveURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents") {
                    documentPicker.directoryURL = iCloudDriveURL
                }
                self.bridge?.viewController?.present(documentPicker, animated: true, completion: nil)
            } else {
                // Handle older versions or provide an alternative
                call.reject("Directory picking is not supported on this version.")
            }
        }
    }

    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let url = urls.first else {
            currentCall?.reject("No directory was picked.")
            return
        }

        do {
            let bookmarkData = try url.bookmarkData(options: [], includingResourceValuesForKeys: nil, relativeTo: nil)
            // Convert bookmark data to a base64 encoded string
            let bookmarkString = bookmarkData.base64EncodedString()

            currentCall?.resolve([
                "url": bookmarkString
            ])
        } catch {
            print("Failed to create bookmark: \(error.localizedDescription) - \(error)")
            currentCall?.reject("Failed to create bookmark for directory. \(error.localizedDescription)")
        }

        currentCall = nil
    }

    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        currentCall?.reject("Directory picking was cancelled.")
        currentCall = nil
    }

    /**
     * Helper for handling errors
     */
    private func handleError(_ call: CAPPluginCall, _ message: String, _ error: Error? = nil) {
        call.reject(message, nil, error)
    }

}
