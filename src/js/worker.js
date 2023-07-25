import { WebPHP, exposeAPI, parseWorkerStartupOptions } from '@php-wasm/web'

// post message to parent
self.postMessage('worker-script-started')

const {
  documentRoot: DOCROOT,
  absoluteUrl: base
} = parseWorkerStartupOptions()

function getWordPressModule () {
  return import('./wp-6.2.js')
}

const isUploadedFilePath = (path) => {
  return (
    path.startsWith('/wp-content/uploads/') ||
    path.startsWith('/wp-content/plugins/') ||
    path.startsWith('/wp-content/mu-plugins/') ||
    path.startsWith('/wp-content/themes/')
  )
}

const wordPressModule = getWordPressModule()

const { php, phpReady } = WebPHP.loadSync('8.2', {
  requestHandler: {
    documentRoot: DOCROOT,
    absoluteUrl: base,
    isStaticFilePath: isUploadedFilePath
  },
  dataModules: [wordPressModule]
})

const [setApiReady, setAPIError] = exposeAPI(
  php
)

async function main () {
  try {
    await phpReady

    setApiReady()
  } catch (e) {
    setAPIError(e)
  }
}

main()
