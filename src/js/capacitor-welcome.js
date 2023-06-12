import { startPlaygroundWeb } from './client.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

async function onClick() {
  const posts = {};

  const dir = await Filesystem.readdir({
    path: '',
    directory: Directory.Documents,
  });

  for ( const file of dir.files ) {
    if ( file.name.endsWith( '.html' ) ) {
      console.log(file)
      const text = await Filesystem.readFile({
        path: file.name,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      posts[ file.name.replace( /\.html$/i, '' ) ] = text.data.replace( "'", "\\'" );
    }
  }

  let insert = '';

  for  ( const key in posts ) {
    insert += `
      echo wp_insert_post( [
        'post_type' => 'hypernote',
        'post_title' => '${key}',
        'post_content' => '${posts[key]}',
        'post_status' => 'publish',
        'post_author' => 1,
      ] );
    `;
  }

  const PHP = `<?php
    include 'wordpress/wp-load.php';
    ${insert}
  `;
  // console.log(posts)
  const plugin = `<?php
    add_filter( 'wp_insert_post_data', function( $data ) {
      if ( $data['post_type'] !== 'hypernote' ) return $data;
      if ( $data['post_status'] !== 'private' ) return $data;
      $blocks = parse_blocks( $data['post_content'] );

      $i = 0;
      $text = '';

      while ( isset( $blocks[ $i ] ) ) {
        $text = wp_trim_words( $blocks[ $i ]['innerHTML'], 10, '' );
        $i++;

        if ( $text ) {
          break;
        }
      }
      if ( ! $text ) return $data;
      post_message_to_js( json_encode( array(
        'name' => $data['post_title'],
        'newName' => $text,
        'content' => $data['post_content'],
      ) ) );
      $data['post_title'] = $text;
      return $data;
    } );
  `;

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
        wp: '6.2',
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
        {
          step: 'runPHP',
          code: PHP,
        },
        {
          step: 'writeFile',
          path: 'wordpress/wp-content/mu-plugins/test.php',
          data: plugin,
        }
      ],
    },
  });

  client.onMessage( async ( data ) => {
    const { name, content, newName } = JSON.parse( data );
  
    await Filesystem.writeFile({
      path: name + '.html',
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    await Filesystem.rename({
      from: name + '.html',
      to: newName + '.html',
      directory: Directory.Documents,
    });
  } )

}

onClick();
