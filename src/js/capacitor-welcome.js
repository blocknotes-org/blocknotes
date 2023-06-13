import { startPlaygroundWeb } from './client.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

async function onClick() {
  const posts = {};

  let dir = null;
  try {
    dir = await Filesystem.readdir({
      path: '',
      directory: 'ICLOUD',
    });
  } catch (e) {
    alert( 'iCloud folder not found. Please sign into iCloud.' );
    return;
  }

  for ( const file of dir.files ) {
    if ( file.name.endsWith( '.block.html' ) ) {
      console.log(file)
      const text = await Filesystem.readFile({
        path: file.name,
        directory: 'ICLOUD',
        encoding: Encoding.UTF8,
      });
      posts[ file.name.replace( /\.block\.html$/i, '' ) ] = text.data.replace( "'", "\\'" );
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
add_action( 'init', function() {
  register_post_type( 'hypernote', array(
    'labels' => array(
      'name' => _x( 'Notes', 'Post type general name', 'hypernotes' ),
      'singular_name' => _x( 'Note', 'Post type singular name', 'hypernotes' ),
      'menu_name' => _x( 'Notes', 'Admin Menu text', 'hypernotes' ),
      'name_admin_bar' => _x( 'Notes', 'Add New on Toolbar', 'hypernotes' ),
      'add_new' => __( 'Add New', 'hypernotes' ),
      'add_new_item' => __( 'Add New Note', 'hypernotes' ),
      'new_item' => __( 'New Note', 'hypernotes' ),
      'edit_item' => __( 'Edit Note', 'hypernotes' ),
      'view_item' => __( 'View Note', 'hypernotes' ),
      'all_items' => __( 'All Notes', 'hypernotes' ),
      'search_items' => __( 'Search Notes', 'hypernotes' ),
      'parent_item_colon' => __( 'Parent Notes:', 'hypernotes' ),
      'not_found' => __( 'No notes found.', 'hypernotes' ),
      'not_found_in_trash' => __( 'No notes found in Trash.', 'hypernotes' ),
      'featured_image' => _x( 'Note Cover Image', 'Overrides the â€œFeatured Imageâ€ phrase for this post type. Added in 4.3', 'hypernotes' ),
      'set_featured_image' => _x( 'Set cover image', 'Overrides the â€œSet featured imageâ€ phrase for this post type. Added in 4.3', 'hypernotes' ),
      'remove_featured_image' => _x( 'Remove cover image', 'Overrides the â€œRemove featured imageâ€ phrase for this post type. Added in 4.3', 'hypernotes' ),
      'use_featured_image' => _x( 'Use as cover image', 'Overrides the â€œUse as featured imageâ€ phrase for this post type. Added in 4.3', 'hypernotes' ),
      'archives' => _x( 'Note archives', 'The post type archive label used in nav menus. Default â€œPost Archivesâ€. Added in 4.4', 'hypernotes' ),
      'insert_into_item' => _x( 'Insert into note', 'Overrides the â€œInsert into postâ€/â€Insert into pageâ€ phrase (used when inserting media into a post). Added in 4.4', 'hypernotes' ),
      'uploaded_to_this_item' => _x( 'Uploaded to this note', 'Overrides the â€œUploaded to this postâ€/â€Uploaded to this pageâ€ phrase (used when viewing media attached to a post). Added in 4.4', 'hypernotes' ),
      'filter_items_list' => _x( 'Filter notes list', 'Screen reader text for the filter links heading on the post type listing screen. Default â€œFilter posts listâ€/â€Filter pages listâ€. Added in 4.4', 'hypernotes' ),
      'items_list_navigation' => _x( 'Notes list navigation', 'Screen reader text for the pagination heading on the post type listing screen. Default â€œPosts list navigationâ€/â€Pages list navigationâ€. Added in 4.4', 'hypernotes' ),
      'items_list' => _x( 'Notes list', 'Screen reader text for the items list heading on the post type listing screen. Default â€œPosts listâ€/â€Pages listâ€. Added in 4.4', 'hypernotes' )
    ),
    'show_ui' => true,
    'supports' => array( 'editor' ),
    'show_in_rest' => true,
    'rewrite' => array( 'slug' => 'hypernote' ),
    'menu_icon' => 'dashicons-format-aside',
  ) );
  
  register_taxonomy( 'hypernote-folder', 'hypernote', array(
    'hierarchical'      => true,
    'labels'            => array(
      'name'              => _x( 'Folders', 'taxonomy general name', 'hypernotes' ),
      'singular_name'     => _x( 'Folder', 'taxonomy singular name', 'hypernotes' ),
      'search_items'      => __( 'Search Folders', 'hypernotes' ),
      'all_items'         => __( 'All Folders', 'hypernotes' ),
      'parent_item'       => __( 'Parent Folder', 'hypernotes' ),
      'parent_item_colon' => __( 'Parent Folder:', 'hypernotes' ),
      'edit_item'         => __( 'Edit Folder', 'hypernotes' ),
      'update_item'       => __( 'Update Folder', 'hypernotes' ),
      'add_new_item'      => __( 'Add New Folder', 'hypernotes' ),
      'new_item_name'     => __( 'New Folder Name', 'hypernotes' ),
      'menu_name'         => __( 'Manage Folders', 'hypernotes' ),
      'view_item'         => __( 'View Folder', 'hypernotes' ),
      'not_found'         => __( 'No folders found', 'hypernotes' ),
    ),
    'public'            => false,
    'show_ui'           => true,
    'show_admin_column' => true,
    'show_in_rest'      => true,
  ) );
} );

add_filter( 'wp_insert_post_data', function( $post ) {
	if ( $post['post_type'] == 'hypernote' && $post[ 'post_status' ] !== 'trash' ) {
		$post[ 'post_status' ] = 'private';
	};

	return $post;
} );

foreach ( array(
	'load-post.php',
	'load-post-new.php',
) as $tag ) {
  add_action( $tag, function() {
    if ( get_current_screen()->post_type !== 'hypernote' ) {
      return;
    }

    remove_editor_styles();
    remove_theme_support( 'editor-color-palette' );
    remove_theme_support( 'editor-font-sizes' );
    remove_theme_support( 'align-wide' );
    remove_theme_support( 'align-full' );
  }, 99999 );
}

add_filter(
	'block_editor_settings_all',
	static function( $settings ) {
		$settings['styles'][] = array(
      'css' => 'body{margin:20px}',
    );
		return $settings;
	}
);

add_action( 'admin_menu', function() {
	remove_submenu_page( 'edit.php?post_type=hypernote', 'post-new.php?post_type=hypernote' );
	$terms = get_terms( 'hypernote-folder', array( 'hide_empty' => false ) );
	foreach ( $terms as $term ) {
		add_submenu_page(
			'edit.php?post_type=hypernote',
			'',
			$term->name,
			'read',
			'edit.php?post_type=hypernote&hypernote-folder=' . $term->slug,
			'',
			1
		);
	}
} );

add_filter( 'parent_file', function( $parent_file ) {
    global $submenu_file;

    if (
		isset( $_GET['post_type'] ) &&
		$_GET['post_type'] === 'hypernote' &&
		isset( $_GET['hypernote-folder'] )
	) {
		$submenu_file .= '&hypernote-folder=' . $_GET['hypernote-folder'];
	}

    return $parent_file;
}, 10, 2 );

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
    remoteUrl: `http://localhost:3000/remote.html`,
    blueprint: {
      landingPage: '/wp-admin/edit.php?post_type=hypernote',
      preferredVersions: {
        php: '8.2',
        wp: '6.2',
      },
      steps: [
        {
          step: 'login',
        },
        {
          step: 'writeFile',
          path: 'wordpress/wp-content/mu-plugins/test.php',
          data: plugin,
        },
        {
          step: 'runPHP',
          code: PHP,
        },
      ],
    },
  });

  client.onMessage( async ( data ) => {
    const { name, content, newName } = JSON.parse( data );
  
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
  } )

}

window.onerror = function(msg, url, linenumber) {
  alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
  return true;
}

onClick();
