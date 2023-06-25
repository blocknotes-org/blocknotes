<?php

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

add_filter( 'the_title', function( $title, $id ) {
	if ( get_post_type( $id ) !== 'hypernote' ) {
        return $title;
    }

	$post = get_post( $id );
	$blocks = parse_blocks( $post->post_content );

	$i = 0;
	$text = '';

	while ( isset( $blocks[ $i ] ) ) {
		$text = wp_trim_words( $blocks[ $i ]['innerHTML'], 10 );
		$i++;

		if ( $text ) {
			break;
		}
	}
 
    return $text;
}, 10, 2 );

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

// Should do nothing except for calling add_submenu_page
class Walker_Add_Submenu_Page extends Walker_Category {
	// Should output no HTML, but instead add a submenu page
	function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {
		if ( $depth === 0 ) {
			add_menu_page(
				$category->name,
				$category->name,
				'read',
				'edit.php?post_type=hypernote&hypernote-folder=' . $category->slug,
				'',
				'',
				1
			);
		} else {
			add_submenu_page(
				'edit.php?post_type=hypernote&hypernote-folder=' . get_term( $category->parent )->slug,
				$category->name,
				$category->name,
				'read',
				'edit.php?post_type=hypernote&hypernote-folder=' . $category->slug,
				'',
				1
			);
		}
	}
}

add_action( 'admin_menu', function() {
	global $menu, $admin_page_hooks, $_registered_pages, $_parent_pages, $submenu, $_wp_real_parent_file;

	$menu = array();
	$admin_page_hooks = array();
	$_registered_pages = array();
	$_parent_pages = array();
	$submenu = array();
	$_wp_real_parent_file = array();

	add_menu_page(
		'All Notes',
		'All Notes',
		'read',
		'edit.php?post_type=hypernote',
		'',
		'',
		1
	);

	wp_list_categories( array(
		'taxonomy' => 'hypernote-folder',
		'hide_empty' => false,
		'title_li' => '',
		'show_option_none' => 'All Notes',
		'walker' => new Walker_Add_Submenu_Page(),
		'echo' => false,
	) );

	global $platform;

	if ( $platform !== 'web' ) {
		add_menu_page(
			'Manage Folders',
			'Manage Folders',
			'read',
			'edit-tags.php?taxonomy=hypernote-folder&post_type=hypernote',
			'',
			'',
			1
		);
	}
}, PHP_INT_MAX );

add_action( 'wp_before_admin_bar_render', 'my_plugin_remove_all_admin_bar_items' );

function my_plugin_remove_all_admin_bar_items() {
	global $wp_admin_bar;
	
	// Get an array of all the toolbar nodes
	$all_toolbar_nodes = $wp_admin_bar->get_nodes();
	
	// Iterate through all the toolbar nodes and remove each one
	foreach ( $all_toolbar_nodes as $node ) {
		if ( $node->id === 'top-secondary' ) continue;
		$wp_admin_bar->remove_node( $node->id );
	}

	$args = array(
		'id'    => 'my_button',
		'title' => '◀ Back',
		'href'  => '#',
		'meta'  => array( 'class' => 'my-toolbar-page' )
	);
	$wp_admin_bar->add_node( $args );

	$wp_admin_bar->add_node( array(
		'id'    => 'new-note',
		'parent' => 'top-secondary',
		'title' => 'New Note',
		'href'  => 'post-new.php?post_type=hypernote',
	) );
}

add_action( 'admin_print_scripts', function() {
	?>
	<script type="text/javascript">
		const channel = new MessageChannel();
		channel.port1.onmessage = () => {
			document.getElementById( 'wpwrap' ).classList.toggle( 'wp-responsive-open' );
		};
		window.top.postMessage( 'hypernotes', '*', [
			channel.port2
		] );
		// listen for load
		document.addEventListener( 'DOMContentLoaded', function() {
		document.querySelector( '#wp-admin-bar-my_button' ).style.display = 'block';
		document.querySelector( '#wp-admin-bar-my_button' ).style.marginLeft = '10px';
		document.querySelector( '#wp-admin-bar-my_button a' ).addEventListener( 'click', function() {
			document.getElementById( 'wpwrap' ).classList.toggle( 'wp-responsive-open' );
				event.preventDefault();
			} );
		} );

		const save = new MessageChannel();

		save.port1.onmessage = ( event ) => {
			document.querySelector( '.editor-post-publish-button' )?.click();
		};

		window.top.postMessage( 'blocknotes.save', '*', [
			save.port2
		] );
	</script>
	<style>
		body {
			width: calc( 100vw - env(safe-area-inset-left) - env(safe-area-inset-right));
			height: calc( 100vh - env(safe-area-inset-bottom) );
			margin-bottom: env(safe-area-inset-bottom);
			margin-left: env(safe-area-inset-left);
			margin-right: env(safe-area-inset-right);
		}
		#wpadminbar li#wp-admin-bar-new-note {
			display: block;
			margin-right: 10px;
		}

		#adminmenu div.wp-menu-name {
			padding-left: 14px;
		}

		.wp-menu-image {
			display: none;
		}
	</style>
	<?php
} );

add_filter( 'parent_file', function( $parent_file ) {
	global $submenu_file;

	if ( isset( $_GET['taxonomy'] ) && $_GET['taxonomy'] === 'hypernote-folder' ) {
		$submenu_file = '';
		return 'edit-tags.php?taxonomy=hypernote-folder&post_type=hypernote';
	}

	if (
		isset( $_GET['post_type'] ) &&
		$_GET['post_type'] === 'hypernote' &&
		isset( $_GET['hypernote-folder'] )
	) {
		$term = get_term_by( 'slug', $_GET['hypernote-folder'], 'hypernote-folder' );
		if ( $term->parent > 0 ) {
			$parent_term = get_term( $term->parent, 'hypernote-folder' );
			$submenu_file = 'edit.php?post_type=hypernote&hypernote-folder=' . $_GET['hypernote-folder'];
			return 'edit.php?post_type=hypernote&hypernote-folder=' . $parent_term->slug;
		}
		$submenu_file = '';
		return 'edit.php?post_type=hypernote&hypernote-folder=' . $_GET['hypernote-folder'];
	}

	return $parent_file;
}, PHP_INT_MAX, 2 );
