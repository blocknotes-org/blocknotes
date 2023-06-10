import { startPlaygroundWeb } from './client.js';

async function onClick() {
//   const directoryHandle = await showDirectoryPicker( {
//     mode: 'readwrite',
//   } );

//   if (!directoryHandle) return;

//   const posts = {};

//   for await (const entry of directoryHandle.values()) {
//     if (entry.kind === "file" && entry.name.endsWith( '.html' ) ){
//       const file = await entry.getFile();
//       const text = await file.text();
//       posts[ entry.name.replace( /\.html$/i, '' ) ] = text.replace( "'", "\\'" );
//     }
//   }

//   let insert = '';

//   for  ( const key in posts ) {
//     insert += `
//       echo wp_insert_post( [
//         'post_type' => 'hypernote',
//         'post_title' => '${key}',
//         'post_content' => '${posts[key]}',
//         'post_status' => 'publish',
//         'post_author' => 1,
//       ] );
//     `;
//   }

//   const PHP = `<?php
//     include 'wordpress/wp-load.php';
//     ${insert}
//   `;
//   console.log(posts)
//   const plugin = `<?php
//     add_filter( 'wp_insert_post_data', function( $data ) {
//       if ( $data['post_type'] !== 'hypernote' ) return $data;
//       if ( $data['post_status'] !== 'private' ) return $data;
//       $blocks = parse_blocks( $data['post_content'] );

//       $i = 0;
//       $text = '';

//       while ( isset( $blocks[ $i ] ) ) {
//         $text = wp_trim_words( $blocks[ $i ]['innerHTML'], 10, '' );
//         $i++;

//         if ( $text ) {
//           break;
//         }
//       }
//       if ( ! $text ) return $data;
//       post_message_to_js( json_encode( array(
//         'name' => $data['post_title'],
//         'newName' => $text,
//         'content' => $data['post_content'],
//       ) ) );
//       $data['post_title'] = $text;
//       return $data;
//     } );
//   `;

  // register a service worker
  // if ('serviceWorker' in navigator) {
  //   console.log('Registering service worker...');
  //   const ret = await navigator.serviceWorker.register('/sw.js');
  //   console.log('Service worker registered.', ret);
  // }

  console.log('starting playground...')

  const client = await startPlaygroundWeb({
    iframe: wp,
    // disableProgressBar: true,
    remoteUrl: `http://localhost:3000/remote.html`,
    blueprint: {
      landingPage: '/wp-admin/edit.php?post_type=hypernote',
      // landingPage: '/wp-admin/plugins.php?plugin_status=mustuse',
      preferredVersions: {
        php: '8.0',
        wp: 'latest',
      },
      steps: [
        {
          step: 'login',
          username: 'admin',
          password: 'password',
        },
        {
          step: 'installPlugin',
          pluginZipFile: {
            resource: 'wordpress.org/plugins',
            slug: 'hypernotes',
          },
        },
        // {
        //   step: 'runPHP',
        //   code: PHP,
        // },
        // {
        //   step: 'writeFile',
        //   path: 'wordpress/wp-content/mu-plugins/test.php',
        //   data: plugin,
        // }
      ],
    },
  });

  // wp.src = "http://localhost:3000/hello";

  // client.onMessage( async ( data ) => {
  //   const { name, content, newName } = JSON.parse( data );
  //   console.log( newName );
  //   const fileHandle = await directoryHandle.getFileHandle( name + '.html', { create: true } );
  //   const writable = await fileHandle.createWritable();
  //   await writable.write( content );
  //   await writable.close();
  //   await fileHandle.move( newName + '.html' );
  // } )

  // const result = await client.run({
  // 	code: PHP,
  // });

  // console.log( result.text )
}

onClick();

// button.addEventListener('click', onClick);
