# Blocknotes

Uses [Capacitor](https://capacitorjs.com) to create the native apps from a PWA.
A modified version of `@capacitor/filesystem` is used to save files to your
iCloud folder and the file system for web (PWA). By default
`@capacitor/filesystem` saves to indexDB on the web, and a _local_ folder on
iOS, so this package is heavily adjusted and should probably be rewritten as a
custom Capacitor plugin.

Builds into the `dist` directory:

```
npm run build
```

Syncs the the build to `ios`:

```
npx cap sync
```

Open Xcode:

```
npx cap open ios
```
