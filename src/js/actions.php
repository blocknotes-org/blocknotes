<?php

function get_note_path( $post_id ) {
	$terms = [];

	if ( ! empty( $post_id ) ) {
		$terms = wp_get_object_terms( (int) $post_id, 'hypernote-folder', array( 'fields' => 'ids' ) );
		if ( is_wp_error( $terms ) ) {
			$terms = [];
		}
	}

	return count( $terms ) ? get_taxonomy_hierarchy( (int) $terms[0] ) : [];
}

function wp_update_post( $data, $wp_error = false, $fire_after_hooks = true ) {
	if ( $data['post_type'] !== 'hypernote' ) {
		return _wp_update_post( $data, $wp_error, $fire_after_hooks );
	}

	return wp_insert_post( $data, $wp_error );
}

function wp_insert_post( $data, $wp_error = false, $fire_after_hooks = true ) {
	if ( $data['post_type'] !== 'hypernote' ) {
		return _wp_insert_post( $data, $wp_error, $fire_after_hooks );
	}

	$post_title = 'new';

	if ( ! empty( $data['ID'] ) ) {
		$current_post = get_post( $data['ID'] );
		$post_title = $current_post->post_title;
	}

	$post_content = empty( $data['post_content'] ) ? '' : $data['post_content'];
	$post_content = wp_unslash( $post_content );
	$blocks = parse_blocks( $post_content );

	$i = 0;
	$text = '';

	while ( isset( $blocks[ $i ] ) ) {
		$text = wp_trim_words( $blocks[ $i ]['innerHTML'], 10, '' );
		$i++;

		if ( $text ) {
			break;
		}
	}

	if ( ! $text ) {
		$text = wp_trim_words( $post_content, 10, '' );
	}

	if ( ! $text ) {
		// To do, try to get a description of the (first) block.
		$text = 'untitled';
	}

	$path = get_note_path( $data['ID'] );
	$new_name = sanitize_title( $text );
	$return = post_message_to_js( json_encode( array(
		'name' => $post_title,
		'newName' => $new_name,
		'content' => $post_content,
		'path' => $path,
		'newPath' => $path,
	) ) );

	$response = json_decode( $return );

	if ( ! $response ) {
		if ( ! $wp_error ) return 0;
		return new WP_Error( 'hypernote_error', 'No response from JS.' );
	}

	if ( isset( $response->message ) ) {
		if ( ! $wp_error ) return 0;
		return new WP_Error( 'hypernote_error', $response->message );
	}

	if ( empty( $response->ID ) ) {
		if ( ! $wp_error ) return 0;
		return new WP_Error( 'hypernote_error', 'No ID returned.' );
	}

	wp_cache_set( $response->ID, $response, 'posts' );

	// When trashing, first update the file, then trash it.
	// if ( $data[ 'post_status' ] === 'trash' ) {
	// 	post_message_to_js( json_encode( array(
	// 		'trash' => true,
	// 		'name' => $new_name,
	// 		'path' => $path,
	// 	) ) );
	// }

	return $response->ID;
}

function wp_insert_term( $term, $taxonomy, $args = array() ) {
	if ( $taxonomy !== 'hypernote-folder' ) {
		return _wp_insert_term( $term, $taxonomy, $args );
	}

	$newPath = [];

	if ( ! empty( $args['parent'] ) ) {
		$newPath = get_taxonomy_hierarchy( (int) $args['parent'] );
	}

	$newPath[] = $term;

	$return = post_message_to_js( json_encode( array(
		'newPath' => $newPath,
	) ) );
	$response = json_decode( $return );

	return array(
		'term_id' => $response->term_id,
		'term_taxonomy_id' => $response->term_taxonomy_id,
	);
}

function wp_update_term( $term_id, $taxonomy, $args = array() ) {
	if ( $taxonomy !== 'hypernote-folder' ) {
		return _wp_update_term( $term_id, $taxonomy, $args );
	}

	$newPath = [];

	if ( ! empty( $args['parent'] ) ) {
		$newPath = get_taxonomy_hierarchy( (int) $args['parent'] );
	}

	$current_term = get_term( $term_id, $taxonomy );

	$path = $newPath;
	$path[] = $current_term->name;
	$newPath[] = $args['name'];

	$return = post_message_to_js( json_encode( array(
		'path' => $path,
		'newPath' => $newPath,
	) ) );
	$response = json_decode( $return );

	return array(
		'term_id' => $response->term_id,
		'term_taxonomy_id' => $response->term_taxonomy_id,
	);
}

function wp_set_object_terms( $object_id, $terms, $taxonomy, $append = false ) {
	if ( $taxonomy !== 'hypernote-folder' ) {
		return _wp_set_object_terms( $object_id, $terms, $taxonomy, $append );
	}

	$object_id = (int) $object_id;
	$current_post = get_post( $object_id );
	$post_title = $current_post->post_title;
	$path = get_note_path( $object_id );
	$new_term = (int) is_array( $terms ) ? $terms[0] : $terms;
	$newPath = [];

	if ( ! empty( $new_term  ) ) {
		$newPath = get_taxonomy_hierarchy( $new_term );
	}

	$return = post_message_to_js( json_encode( array(
		'name' => $post_title,
		'path' => $path,
		'newPath' => $newPath,
	) ) );
	$response = json_decode( $return );

	return [ $response->term_id ];
}

function get_taxonomy_hierarchy($term_id) {
	$taxonomy_titles = [];

	// Get the term by its ID.
	$term = get_term($term_id, 'hypernote-folder');

	if ($term && !is_wp_error($term)) {
		// Add the term's name to the beginning of the array.
		array_unshift($taxonomy_titles, $term->name);

		// Get the term's ancestors.
		$ancestors = get_ancestors($term_id, $term->taxonomy);

		// For each ancestor, get its name and add it to the beginning of the array.
		foreach ($ancestors as $ancestor_id) {
			$ancestor = get_term($ancestor_id);

			if ($ancestor && !is_wp_error($ancestor)) {
				array_unshift($taxonomy_titles, $ancestor->name);
			}
		}
	}

	return $taxonomy_titles;
}

add_filter( 'posts_pre_query', function( $return, $query ) {
	if ( $query->query_vars['post_type'] !== 'hypernote' ) return $return;
	$return = post_message_to_js( json_encode( array(
		'statement' => $query->query_vars,
	) ) );
	$data = json_decode( $return );
	return array_map( function( $post ) {
		wp_cache_add( $post->ID, $post, 'posts' );
		return new WP_Post( (object) $post );
	}, $data );
}, 10, 2 );

add_filter( 'terms_pre_query', function ( $return, $query ) {
	if ( empty( $query->query_vars['taxonomy'] ) ) return $return;
	if ( ! in_array( 'hypernote-folder', $query->query_vars['taxonomy'] ) ) return $return;
	$return = post_message_to_js( json_encode( array(
		'terms_pre_query' => $query->query_vars,
	) ) );
	if ( $query->query_vars['fields'] === 'count' ) return (int) $return;
	// Map keys to integers when the field starts with "id=>".
	if ( strpos( $query->query_vars['fields'], 'id=>' ) === 0 ) {
		$data = json_decode( $return, true );
		$intKeyArray = array();
		foreach ($data as $key => $value) {
			$intKeyArray[(int)$key] = $value;
		}
		return $intKeyArray;
	}
	$data = json_decode( $return );
	return array_map( function( $term ) {
		if ( ! isset( $term->term_id ) ) return $term;
		wp_cache_add( $term->term_id, $term, 'terms' );
		return new WP_Term( (object) $term );
	}, $data );
}, 10, 2 );

class Blocknotes_Object_Cache extends WP_Object_Cache {
    public function get( $key, $group = 'default', $force = false, &$found = null ) {
		$cache = parent::get( $key, $group, $force, $found );
		if ( $cache ) return $cache;
		if ( $group === 'counts' ) {
			if ( $key !== _count_posts_cache_key( 'hypernote', '' ) ) {
				return $cache;
			}
			$return = post_message_to_js( json_encode( array(
				'counts' => 'notes'
			) ) );
			$object = json_decode( $return );
			wp_cache_add( $key, $object, $group );
			return $object;
		}
		if ( ( $group !== 'posts' && $group !== 'terms' ) || ! is_int( $key ) ) return $cache;
		$return = post_message_to_js( json_encode( array(
			'cache' => $key
		) ) );
		if ( ! $return ) return $cache;
		$object = json_decode( $return );
		wp_cache_add( $group === 'posts' ? $object->ID : $object->term_id, $object, $group );
        return $object;
    }
}

add_action( 'plugins_loaded', function() {
	global $wp_object_cache;
	$wp_object_cache = new Blocknotes_Object_Cache();
} );
