import { spawnPHPWorkerThread, consumeAPI } from "@php-wasm/web";
import { newMockXhr } from 'mock-xmlhttprequest';

import moduleWorkerUrl from './worker?worker&url';

let base = window.location.href

export const DOCROOT = '/wordpress';

function randomString(length) {
	const chars =
		'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=-[]/.,<>?';
	let result = '';
	for (let i = length; i > 0; --i)
		result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

export async function main() {
    const worker = await spawnPHPWorkerThread(moduleWorkerUrl, {
        wpVersion: '6.2',
        phpVersion: '8.2',
        storage: '',
        documentRoot: DOCROOT,
        absoluteUrl: base,
    })
    const php = consumeAPI( worker );
    
    await php.isReady();
    
    const config = await php.readFileAsText('/wordpress/wp-config.php');

    await php.writeFile('/wordpress/wp-config.php', `<?php
	define('WP_HOME', '${base}');
    define('WP_SITEURL', '${base}');
?>${config.replace( /put your unique phrase here/g, () => {
    return randomString(40);
} )}` );

await php.writeFile('/wordpress/wp-content/mu-plugins/login.php', `<?php
include 'wordpress/wp-load.php';
add_action( 'user_can_richedit', function() {
    return true;
}, 100 );
add_filter( 'set_url_scheme', function( $url ) {
    return str_replace( 'http://', '//', $url );
} );
` );

    async function request( args ) {
        const url = new URL(args.url, base).href;
        let response = await php.request({
            ...args,
            url,
        });
        const location = response.headers.location?.[0];
        console.log({
            ...args,
            url,
        });
        response.url = url;
        if ( location ) {
            console.log('redirecting to', location);
            response = await request({
                method: 'GET',
                url: location,
            })
        }
        return response;
    }

    let currentUrl;
    let currentBlobUrl;

    function replaceIframe( response ) {
        currentUrl = response.url;
        const blob = new Blob([`<base href="${currentUrl}">`, response.bytes], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.dataset.url = response.url;
        iframe.id = 'wp';
        iframe.src = blobUrl;
        document.body.textContent = '';
        document.body.appendChild(iframe);

        if ( currentBlobUrl ) {
            URL.revokeObjectURL( currentBlobUrl );
        }
        currentBlobUrl = blobUrl;

        iframe.contentWindow.history.pushState = (state, title, url) => {
            console.log('pushing state', state, title, url);
        }

        iframe.contentWindow.history.replaceState = (state, title, url) => {
            console.log('replacing state', state, title, url);
        }

        iframe.contentWindow.history.back = () => {
            console.log('back');
        }

        iframe.contentWindow.history.forward = () => {
            console.log('forward');
        }

        iframe.contentWindow.history.go = (delta) => {
            console.log('go', delta);
        }

        iframe.contentWindow.open = (url, name, features) => {
            console.log('open', url, name, features);
        }

        iframe.contentWindow.fetch = async (url, options) => {
            console.log(options)
            const isFormData = options.body instanceof iframe.contentWindow.FormData;
            console.log( {isFormData})
            let response = await request({
                method: options.method || 'GET',
                url: url,
                body: isFormData ? undefined : options.body,
                formData: isFormData ? options.body : undefined,
                headers: options.headers,
            });
            return new Response(response.bytes, {
                status: response.httpStatusCode,
                headers: response.headers,
            });
        }

        const xhrMock = newMockXhr();    
        xhrMock.onSend = async (_request) => { 
            let response = await request({
                method: _request.method,
                url: _request.url,
                body: _request.body,
                headers: _request.requestHeaders.getHash(),
            });
            _request.respond( response.httpStatusCode, response.headers, response.text );
        };
        iframe.contentWindow.XMLHttpRequest = xhrMock;

        iframe.contentWindow.addEventListener('click', async ( event ) => {
            console.log( 'click', event.target )
            if (event.defaultPrevented) {
                return;
            }

            const target = event.target.closest('a');

            if ( ! target ) {
                return;
            }
            
            if (target.href.startsWith('#')) {
                return;
            }

            console.log( 'clicked link', target.href )

            event.preventDefault();
            let response = await request({
                method: 'GET',
                url: ( new URL( target.href, currentUrl ) ).href,
            });
            replaceIframe(response);
        });

        // Forbid stopping propagation to the window. This is bad practice and
        // should be fixed in the WordPress codebase.
        iframe.contentWindow.addEventListener('click', async ( event ) => {
            const target = event.target.closest('a');

            if ( ! target ) {
                return;
            }

            event.stopPropagation = () => {
                console.log( 'stopPropagation' );
            }

            event.stopImmediatePropagation = () => {
                console.log( 'stopImmediatePropagation' );
            }
        }, true);

        iframe.contentWindow.addEventListener('submit', async ( event ) => {
            if (event.defaultPrevented) {
                return;
            }

            const target = event.target.closest('form');

            if ( ! target ) {
                return;
            }

            event.preventDefault();
            const formData = new FormData(target);
            const data = {};
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            let response = await request({
                method: target.getAttribute( 'method' )?.toUpperCase(),
                url: ( new URL( target.getAttribute( 'action' ) || '', currentUrl ) ).href,
                formData: data,
            });
            replaceIframe(response);
        });
    }

    await request({
		url: '/wp-login.php',
	});

	await request({
		url: '/wp-login.php',
		method: 'POST',
		formData: {
			log: 'admin',
			pwd: 'password',
			rememberme: 'forever',
		},
	});

    return {
        php,
        request: async ( args ) => {
            const response = await request(args);
            replaceIframe(response);
        },
    };
}
