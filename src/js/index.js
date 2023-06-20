import { startPlaygroundWeb } from './client.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import plugin from './plugin.php?raw';
import actions from './actions.php?raw';
import insert from './insert.php?raw';

const platform = Capacitor.getPlatform();
const url = new URL( window.location );

let port = url.port;
let protocol = 'http:';

if ( url.protocol === 'https:' ) {
  protocol = 'https:';
}

if ( url.hostname === 'localhost' && ! port ) {
  port = '3000';
}

async function load() {
  try {
    await Filesystem.checkPermissions()
  } catch (e) {
    alert( e.message );
    return;
  }

  if ( ( await Filesystem.checkPermissions() ).publicStorage === 'prompt' ) {
    if ( ! ( 'showDirectoryPicker' in window ) ) {
      document.body.textContent = 'Your browser does not support the File System Access API.';
      return;
    }

    const button = document.createElement( 'button' );
    button.textContent = 'Request File System Permission';
    button.addEventListener( 'click', async () => {
      await Filesystem.requestPermissions();
      button.remove();
      load();
    } );
    document.body.textContent = '';
    document.body.appendChild( button );
    button.focus();
    return;
  }

  let dir = null;
  try {
    dir = await Filesystem.readdir({
      path: '',
      directory: 'ICLOUD',
    });
  } catch (e) {
    if ( e.message === 'Invalid path' ) {
      alert( 'iCloud folder not found. Please sign into iCloud.' );
    } else {
      alert( e.message );
    }
    window.location.reload();
    return;
  }

  // Recursively read all files in the iCloud folder
  async function readDirRecursive( dir, name, children ) {
    for ( const file of dir.files ) {
      console.log(file, name)
      if ( file.type === 'directory' ) {
        if ( file.name.startsWith( '.' ) ) continue;
        const item = {
          type: 'folder',
          name: file.name,
          children: [],
        };
        children.push( item );
        await readDirRecursive( await Filesystem.readdir({
          path: [ ...name, file.name ].join( '/' ),
          directory: 'ICLOUD',
        }), [ ...name, file.name ], item.children );
      } else if ( file.name.endsWith( '.block.html' ) ) {
        const text = await Filesystem.readFile({
          path: [ ...name, file.name ].join( '/' ),
          directory: 'ICLOUD',
          encoding: Encoding.UTF8,
        });
        children.push( {
          type: 'note',
          content: text.data,
          title: file.name.replace( /\.block\.html$/i, '' ),
        } );
      }
    }
  }

  const d = [];

  try {
    await readDirRecursive( dir, [], d );
  } catch (e) {
    alert( e.message );
    return;
  }

  const data = `<?php $data = json_decode( '${ JSON.stringify( d ).replace( "'", "\\'" ) }', true ); ?>`

  let messageChannel = null;

  window.addEventListener('statusTap', function () {
    messageChannel?.postMessage( 'open' );
  });
  window.addEventListener( 'message', function( event ) {
    if ( event.data === 'hypernotes' ) {
      messageChannel = event.ports[0];
    }
  } );

  console.log(`Starting Playground at ${protocol}//${url.hostname}${port?':':''}${port}/remote.html...`)

  const wp = document.createElement( 'iframe' );
  document.body.textContent = '';
  document.body.appendChild( wp );

  try {
    const client = await startPlaygroundWeb({
      iframe: wp,
      remoteUrl: `${protocol}//${url.hostname}${port?':':''}${port}/remote.html`,
      blueprint: {
        landingPage: '/wp-admin/edit.php?post_type=hypernote',
        preferredVersions: {
          php: '8.2',
          wp: '6.2',
        },
        steps: [
          {
            step: 'writeFile',
            path: 'wordpress/wp-content/mu-plugins/hypernotes.php',
            data: `<?php global $platform; $platform = '${ platform }'; ?>${ plugin }`,
          },
          {
            step: 'runPHP',
            code: data + insert,
          },
          {
            step: 'writeFile',
            path: 'wordpress/wp-content/mu-plugins/actions.php',
            data: actions,
          },
          {
            step: 'login',
          },
        ],
      },
    });
    client.onMessage( async ( data ) => {
      const { name, content, newName, newPath, path } = JSON.parse( data );
  
      console.log( name, newName, newPath, path )
  
      try {
        if ( newPath ) {
          if ( path ) {
            const file = name ? '/' + name + '.block.html' : '';
            await Filesystem.rename({
              from: path.join( '/' ) + file,
              to: newPath.join( '/' ) + file,
              directory: 'ICLOUD',
            });
          } else {
            await Filesystem.mkdir({
              path: newPath.join( '/' ),
              directory: 'ICLOUD',
              recursive: true,
            });
          }
        } else {
          await Filesystem.writeFile({
            path: name + '.block.html',
            data: content,
            directory: 'ICLOUD',
            encoding: Encoding.UTF8,
          });
          await Filesystem.rename({
            from: name + '.block.html',
            to: newName + '.block.html',
            directory: 'ICLOUD',
          });
        }
      } catch (e) {
        alert( e.message );
      }
    } );
  } catch (e) {
    alert( 'Failed starting Playground. ' + e.message );
    return;
  }
}

load();
