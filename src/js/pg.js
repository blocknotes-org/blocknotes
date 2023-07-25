import { spawnPHPWorkerThread, consumeAPI } from '@php-wasm/web'
import { newMockXhr } from 'mock-xmlhttprequest'

import moduleWorkerUrl from './worker?worker&url'

const base = window.location.href

export const DOCROOT = '/wordpress'

function randomString (length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?'
  let result = ''
  for (let i = length; i > 0; --i) { result += chars[Math.floor(Math.random() * chars.length)] }
  return result
}

export async function main () {
  const startTime = Date.now()
  const worker = await spawnPHPWorkerThread(moduleWorkerUrl, {
    wpVersion: '6.2',
    phpVersion: '8.2',
    storage: '',
    documentRoot: DOCROOT,
    absoluteUrl: base
  })
  const php = consumeAPI(worker)

  await php.isReady()

  const config = await php.readFileAsText('/wordpress/wp-config.php')

  await php.writeFile('/wordpress/wp-config.php', `<?php
define('WP_HOME', '${base}');
define('WP_SITEURL', '${base}');
?>${config.replace(/put your unique phrase here/g, () => {
    return randomString(40)
})}`)

  await php.writeFile('/wordpress/wp-content/mu-plugins/login.php', `<?php
include 'wordpress/wp-load.php';
add_action( 'user_can_richedit', function() {
    return true;
}, 100 );
add_filter( 'set_url_scheme', function( $url ) {
    return str_replace( 'http://', '//', $url );
} );
`)

  async function request (args) {
    const url = new URL(args.url, base).href
    let response = await php.request({
      ...args,
      url
    })
    const location = response.headers.location?.[0]
    console.log({
      ...args,
      url
    })
    response.url = url
    if (location) {
      console.log('redirecting to', location)
      response = await request({
        method: 'GET',
        url: location
      })
    }
    return response
  }

  function intercept (window) {
    window.history.pushState = (state, title, url) => {
      console.log('pushing state', state, title, url)
    }

    window.history.replaceState = (state, title, url) => {
      console.log('replacing state', state, title, url)
    }

    window.history.back = () => {
      console.log('back')
    }

    window.history.forward = () => {
      console.log('forward')
    }

    window.history.go = (delta) => {
      console.log('go', delta)
    }

    window.open = (url, name, features) => {
      console.log('open', url, name, features)
    }

    window.fetch = async (url, options) => {
      console.log(options)
      const isFormData = options.body instanceof window.FormData
      console.log({ isFormData })
      const response = await request({
        method: options.method || 'GET',
        url,
        body: isFormData ? undefined : options.body,
        formData: isFormData ? options.body : undefined,
        headers: options.headers
      })
      return new Response(response.bytes, {
        status: response.httpStatusCode,
        headers: response.headers
      })
    }

    const xhrMock = newMockXhr()
    xhrMock.onSend = async (_request) => {
      const response = await request({
        method: _request.method,
        url: _request.url,
        body: _request.body,
        headers: _request.requestHeaders.getHash()
      })
      _request.respond(response.httpStatusCode, response.headers, response.text)
    }
    window.XMLHttpRequest = xhrMock

    window.addEventListener('click', async (event) => {
      // Content editable links are by default non interactive.
      if (event.target.isContentEditable) {
        return
      }

      if (event.defaultPrevented) {
        return
      }

      const target = event.target.closest('a')

      if (!target) {
        return
      }

      // External URL: allow navigation.
      if (target.href.startsWith('http')) {
        target.target = '_blank'
        return
      }

      if (target.href.replace(currentUrl, '').startsWith('#')) {
        return
      }

      let returnValue
      const beforeUnloadEvent = new Event('beforeunload')

      Object.defineProperty(beforeUnloadEvent, 'returnValue', {
        get () {
          return returnValue
        },
        set (value) {
          returnValue = value
        }
      })

      window.dispatchEvent(beforeUnloadEvent)

      if (typeof returnValue === 'string') {
        const confirmResult = window.confirm(returnValue)
        if (!confirmResult) {
          return
        }
      }

      console.log('clicked link', target.href)

      event.preventDefault()
      const response = await request({
        method: 'GET',
        url: (new URL(target.href, currentUrl)).href
      })
      replaceIframe(response)
    })

    // Forbid stopping propagation to the window. This is bad practice and
    // should be fixed in the WordPress codebase.
    window.addEventListener('click', async (event) => {
      const target = event.target.closest('a')

      if (!target) {
        return
      }

      // Consider preventing default behaviour at this point.
      event.stopPropagation = () => {
        console.log('stopPropagation')
      }

      event.stopImmediatePropagation = () => {
        console.log('stopImmediatePropagation')
      }
    }, true)

    window.addEventListener('submit', async (event) => {
      if (event.defaultPrevented) {
        return
      }

      const target = event.target.closest('form')

      if (!target) {
        return
      }

      event.preventDefault()
      const formData = new FormData(target)
      const method = (target.getAttribute('method') || 'GET').toUpperCase()
      const url = (new URL(target.getAttribute('action') || '', currentUrl)).href
      let response

      if (method === 'GET') {
        const queryString = new URLSearchParams(formData).toString()
        response = await request({
          method,
          url: url + (queryString ? '?' + queryString : '')
        })
      } else {
        const data = {}
        for (const [key, value] of formData.entries()) {
          data[key] = value
        }
        response = await request({
          method,
          url,
          formData: data
        })
      }
      replaceIframe(response)
    })
  }

  let currentUrl
  let currentBlobUrl

  function replaceIframe (response) {
    currentUrl = response.url
    const blob = new window.Blob(
      [
                `<base href="${currentUrl}">`,
                // Ensures that listeners are added before the iframe is loaded,
                // and ensures that they are re-added when the window is
                // reloaded.
                '<script>window.frameElement._init(window)</script>',
                response.bytes
      ],
      { type: 'text/html' }
    )
    const blobUrl = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe._init = intercept
    iframe.dataset.url = response.url
    iframe.id = 'wp'
    iframe.src = blobUrl
    document.body.textContent = ''
    document.body.appendChild(iframe)

    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl)
    }
    currentBlobUrl = blobUrl
  }

  await request({
    url: '/wp-login.php',
    method: 'POST',
    formData: {
      log: 'admin',
      pwd: 'password',
      rememberme: 'forever'
    }
  })

  console.log('PHP done in ' + (Date.now() - startTime) + 'ms')

  return {
    php,
    request: async (args) => {
      const response = await request(args)
      replaceIframe(response)
    }
  }
}
