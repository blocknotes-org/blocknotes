import { main } from './pg.js';
import { Filesystem } from '@capacitor/filesystem';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import plugin from './plugin.php?raw';
import actions from './actions.php?raw';
import insert from './insert.php?raw';
import { getData } from './get-data.js';
import { saveData } from './save-data.js';

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

  let d;
  try {
    d = await getData();
  } catch (e) {
    if ( e.message === 'Invalid path' ) {
      alert( 'iCloud folder not found. Please sign into iCloud.' );
    } else {
      alert( e.message );
    }
    window.location.reload();
    return;
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
      await saveData( { name, content, newName, newPath, path } );
    } catch (e) {
      alert( e.message );
    }
  } );

  await request( {
    url: '/wp-admin/edit.php?post_type=hypernote'
  } )
}

load();
