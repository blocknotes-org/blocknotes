# Blocknotes

|Dark Note|Dark List|Light Note|Light List|
|-|-|-|-|
|![image](screenshots/Simulator%20Screenshot%20-%20iPhone%2011%20Pro%20Max%20-%202024-07-21%20at%2020.43.00.png)|![image](screenshots/Simulator%20Screenshot%20-%20iPhone%2011%20Pro%20Max%20-%202024-07-21%20at%2020.44.38.png)|![image](screenshots/Simulator%20Screenshot%20-%20iPhone%2011%20Pro%20Max%20-%202024-07-21%20at%2020.45.21.png)|![image](screenshots/Simulator%20Screenshot%20-%20iPhone%2011%20Pro%20Max%20-%202024-07-21%20at%2020.45.36.png)|

![image](screenshots/mac-dark-padded.png)
![image](screenshots/mac-light-padded.png)

After cloning the repository and `npm install`, you can run `npm start` to run a
local server with the dev files.

Running the iOS and macOS apps is a bit slower, since it needs the `dist` files.
You can build the `dist` directory with `npm run build`, then `npx cap sync` to
sync the files to the `ios` directory. Open Xcode with `npx cap open ios`.

It uses [Capacitor](https://capacitorjs.com) to create the native apps from the
PWA. A modified version of `@capacitor/filesystem` is used to allow picking any
directory in the local filesystem. By default `@capacitor/filesystem` saves to
indexDB on the web, and a hidden app folder on iOS/macOS.
