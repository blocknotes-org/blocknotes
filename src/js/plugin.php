<?php

// set_error_handler(function($severity, $message, $file, $line) {
//     if (error_reporting() & $severity) {
//         throw new ErrorException($message, 0, $severity, $file, $line);
//     }
// });

class WP_REST_Hypernotes_Controller extends WP_REST_Posts_Controller {
	protected function get_post( $id ) {
		$post = get_post( (int) $id );
		if ( empty( $post ) || empty( $post->ID ) || $this->post_type !== $post->post_type ) {
			return new WP_Error(
				'rest_post_invalid_id',
				__( 'Invalid post ID.' ),
				array( 'status' => 404 )
			);
		}

		return $post;
	}
}

add_action( 'init', function() {
	register_post_type( 'hypernote', array(
		'labels' => array(
			'name' => __( 'Notes', 'hypernotes' ),
			'singular_name' => __( 'Note', 'hypernotes' ),
			'add_new' => __( 'Add New', 'hypernotes' ),
			'add_new_item' => __( 'Add New Note', 'hypernotes' ),
			'edit_item' => __( 'Edit Note', 'hypernotes' ),
			'new_item' => __( 'New Note', 'hypernotes' ),
			'view_item' => __( 'View Note', 'hypernotes' ),
			'view_items' => __( 'View Notes', 'hypernotes' ),
			'search_items' => __( 'Search Notes', 'hypernotes' ),
			'not_found' => __( 'No notes found.', 'hypernotes' ),
			'not_found_in_trash' => __( 'No notes found in Trash.', 'hypernotes' ),
			'parent_item_colon' => __( 'Parent Note:', 'hypernotes' ),
			'all_items' => __( 'All Notes', 'hypernotes' ),
			'archives' => __( 'Note Archives', 'hypernotes' ),
			'attributes' => __( 'Note Attributes', 'hypernotes' ),
			'insert_into_item' => __( 'Insert into note', 'hypernotes' ),
			'uploaded_to_this_item' => __( 'Uploaded to this note', 'hypernotes' ),
			'featured_image' => __( 'Note Cover Image', 'hypernotes' ),
			'set_featured_image' => __( 'Set cover image', 'hypernotes' ),
			'remove_featured_image' => __( 'Remove cover image', 'hypernotes' ),
			'use_featured_image' => __( 'Use as cover image', 'hypernotes' ),
			'menu_name' => __( 'Notes', 'hypernotes' ),
			'filter_items_list' => __( 'Filter notes list', 'hypernotes' ),
			'filter_by_date' => __( 'Filter by date', 'hypernotes' ),
			'items_list_navigation' => __( 'Notes list navigation', 'hypernotes' ),
			'items_list' => __( 'Notes list', 'hypernotes' ),
			'item_published' => __( 'Note published.', 'hypernotes' ),
			'item_published_privately' => __( 'Note published privately.', 'hypernotes' ),
			'item_reverted_to_draft' => __( 'Note reverted to draft.', 'hypernotes' ),
			'item_scheduled' => __( 'Note scheduled.', 'hypernotes' ),
			'item_updated' => __( 'Note updated.', 'hypernotes' ),
			'item_link' => __( 'Note Link', 'hypernotes' ),
			'item_link_description' => __( 'A link to a note.', 'hypernotes' ),
		),
		'show_ui' => true,
		'supports' => array( 'editor' ),
		'show_in_rest' => true,
		'rest_controller_class' => 'WP_REST_Hypernotes_Controller',
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
				'dashicons-category',
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
		'dashicons-format-aside',
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
			999
		);
	}

	add_menu_page(
		'Refresh',
		'Refresh',
		'read',
		'#',
		'',
		'dashicons-image-rotate',
		1000
	);
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

	$wp_admin_bar->add_node( array(
		'id'    => 'menu-toggle',
		'title' => '',
		'href'  => '#',
	) );

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
			document.getElementById( 'wp-admin-bar-menu-toggle' )?.click();
			document.getElementById( 'wp-admin-bar-menu-toggle' )?.focus();
		};
		window.top.postMessage( 'hypernotes', '*', [
			channel.port2
		] );
		document.addEventListener( 'DOMContentLoaded', function() {
			// Fixes issue where clicking the menu button won't collapse the menu.
			document.getElementById( 'wp-admin-bar-menu-toggle' ).addEventListener( 'click', ( event ) => event.target.focus(), true );
			document.getElementById( 'toplevel_page_-' ).addEventListener( 'click', ( event ) => {
				event.preventDefault();
				window.location.reload();
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

		#wp-admin-bar-menu-toggle [aria-expanded="false"]:after {
			content: '◀ Folders';
		}

		#wp-admin-bar-menu-toggle [aria-expanded="true"]:after {
			content: '▶ Back';
		}

		#wpadminbar li#wp-admin-bar-new-note {
			display: block;
		}

		#wpadminbar li#wp-admin-bar-menu-toggle a,
		#wpadminbar li#wp-admin-bar-new-note a {
			padding: 0 10px;
		}

		#toplevel_page_- .dashicons-image-rotate {
			transform: scale(-1, 1);
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

/**
 * Custom wp_die handler to modify the arguments for _default_wp_die_handler.
 *
 * @param string $message Error message.
 * @param string $title   Error title (optional).
 * @param array  $args    Optional arguments to control behavior.
 */
function custom_wp_die_handler( $message, $title = '', $args = array() ) {
    // Ensure the admin bar is displayed
    add_filter( 'show_admin_bar', '__return_true' );

	list( $message, $title, $args ) = _wp_die_process_input( $message, $title, $args );

    $admin_url = admin_url( 'edit.php?post_type=hypernote' );
    $message .= sprintf( '<br><a href="%s">Return to Admin</a>', esc_url( $admin_url ) );

    // Call the default handler with the modified arguments
    _default_wp_die_handler( $message, $title, $args );
}

// Replace the default wp_die handler with our custom function
add_filter( 'wp_die_handler', function( $handler ) {
    return 'custom_wp_die_handler';
});
