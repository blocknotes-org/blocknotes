import { main } from './pg.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import plugin from './plugin.php?raw';
import actions from './actions.php?raw';
import insert from './insert.php?raw';

try {
  StatusBar.setStyle({ style: Style.Dark });
} catch (e) {}

const platform = Capacitor.getPlatform();

async function load() {
  try {
    await Filesystem.checkPermissions()
  } catch (e) {
    alert( e.message );
    return;
  }

  if ( ( await Filesystem.checkPermissions() ).publicStorage === 'prompt' ) {
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

  let dotICloud = false;

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
      } else if ( file.name.endsWith( '.html' ) ) {
        const text = await Filesystem.readFile({
          path: [ ...name, file.name ].join( '/' ),
          directory: 'ICLOUD',
          encoding: Encoding.UTF8,
        });
        children.push( {
          type: 'note',
          content: text.data,
          title: file.name.replace( /\.html$/i, '' ),
        } );
      } else if ( file.name.endsWith( '.icloud' ) ) {
        dotICloud = true;
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

  if ( dotICloud ) {
    alert( 'There are files in your iCloud folder that are not downloaded. You might want to download them and restart the app.' );
  }

  let messageChannel = null;
  let save = null;

  window.addEventListener('statusTap', function () {
    messageChannel?.postMessage( 'open' );
  });

  App.addListener('appStateChange', ({ isActive }) => {
    if ( ! isActive ) {
      save?.postMessage( '' );
    }
  });

  window.addEventListener( 'message', function( event ) {
    if ( event.data === 'hypernotes' ) {
      messageChannel = event.ports[0];
    } else if ( event.data === 'blocknotes.save' ) {
      save = event.ports[0];
    }
  } );

  const {php, request} = await main();

  await php.writeFile(
    '/wordpress/wp-content/mu-plugins/hypernotes.php',
    `<?php global $platform; $platform = '${ platform }'; ?>${ plugin }`
  );

  await php.writeFile(
    '/wordpress/temp.json',
    JSON.stringify( d )
  );

  await php.run( { code: insert } );

  await php.writeFile(
    '/wordpress/wp-content/mu-plugins/actions.php',
    actions
  );

  php.onMessage( async ( data ) => {
    const { name, content, newName, newPath, path, debug } = JSON.parse( data );

    console.log( {name, newName, newPath, path, debug} )

    try {
      if ( newPath ) {
        if ( path ) {
          const file = name ? '/' + name + '.html' : '';

          if ( content && file ) {
            console.log( 'writing file', path.join( '/' ) + file );
            await Filesystem.writeFile({
              path: path.join( '/' ) + file,
              data: content,
              directory: 'ICLOUD',
              encoding: Encoding.UTF8,
            });
          }

          const newFile = newName ? '/' + newName + '.html' : file

          console.log( 'renaming file', path.join( '/' ) + file, newPath.join( '/' ) + newFile );
          await Filesystem.rename({
            from: path.join( '/' ) + file,
            to: newPath.join( '/' ) + newFile,
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
          path: name + '.html',
          data: content,
          directory: 'ICLOUD',
          encoding: Encoding.UTF8,
        });
        await Filesystem.rename({
          from: name + '.html',
          to: newName + '.html',
          directory: 'ICLOUD',
        });
      }
    } catch (e) {
      alert( e.message );
    }
  } );

  await request( {
    url: '/wp-admin/edit.php?post_type=hypernote'
  } )
}

load();
