import UIKit
import Capacitor
import Embassy
import EnvoyAmbassador

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        DispatchQueue.global(qos: .background).async {
            let loop = try! SelectorEventLoop(selector: try! KqueueSelector())
            let server = DefaultHTTPServer(eventLoop: loop, interface: "localhost", port: 3000) {
                (
                    environ: [String: Any],
                    startResponse: ((String, [(String, String)]) -> Void),
                    sendBody: ((Data) -> Void)
                ) in
                // Get the requested path
                let pathInfo = environ["PATH_INFO"] as! String
                let requestedFile = String(pathInfo.dropFirst()) // drop the leading "/"
                
                // Find the corresponding file in the bundle
                if let filePath = Bundle.main.path(forResource: "public/" + requestedFile, ofType: nil) {
                    let url = URL(fileURLWithPath: filePath)
                    
                    // Determine MIME type
                    let pathExtension = url.pathExtension
                    var mimeType: String
                    switch pathExtension {
                    case "html":
                        mimeType = "text/html"
                    case "js":
                        mimeType = "application/javascript"
                    case "css":
                        mimeType = "text/css"
                    case "png":
                        mimeType = "image/png"
                    case "jpg":
                        mimeType = "image/jpeg"
                    case "svg":
                        mimeType = "image/svg+xml"
                    case "json":
                        mimeType = "application/json"
                    case "woff":
                        mimeType = "font/woff"
                    case "woff2":
                        mimeType = "font/woff2"
                    case "ttf":
                        mimeType = "font/ttf"
                    case "otf":
                        mimeType = "font/otf"
                    case "eot":
                        mimeType = "font/eot"
                    case "ico":
                        mimeType = "image/x-icon"
                    case "map":
                        mimeType = "application/json"
                    case "xml":
                        mimeType = "text/xml"
                    case "webp":
                        mimeType = "image/webp"
                    case "zip":
                        mimeType = "application/zip"
                    case "gz":
                        mimeType = "application/gzip"
                    case "wasm":
                        mimeType = "application/wasm"

                    default:
                        mimeType = "text/plain"
                    }
                    
                    // Load the file data
                    if let data = try? Data(contentsOf: url) {
                        // Start HTTP response with correct MIME type
                        startResponse("200 OK", [("Content-Type", mimeType)])
                        sendBody(data)
                    } else {
                        // Send an error response if the file couldn't be read
                        startResponse("500 Internal Server Error", [("Content-Type", "text/plain")])
                        sendBody(Data("500 Internal Server Error - File could not be read".utf8))
                    }
                } else {
                    // Send a 404 response if the file couldn't be found
                    startResponse("404 Not Found", [("Content-Type", "text/plain")])
                    sendBody(Data("404 Not Found - File not found".utf8))
                }
                
                // send EOF
                sendBody(Data())
            }

            // Start HTTP server to listen on the port
            try! server.start()

            // Run event loop
            loop.runForever()
        }

        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
