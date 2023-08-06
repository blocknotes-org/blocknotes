<?php

add_filter( 'wp_insert_post_data', function( $data, $postarr ) {
	if ( $data['post_type'] !== 'hypernote' ) return $data;

	if ( $data['post_status'] !== 'trash' ) {
		$data['post_status'] = 'private';
	}

	$post_title = wp_unslash( $data['post_title'] );
	$post_content = wp_unslash( $data['post_content'] );
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
	if ( ! $text ) return $data;

	$terms = wp_get_object_terms( (int) $postarr['ID'], 'hypernote-folder', array( 'fields' => 'ids' ) );

	if ( is_wp_error( $terms ) ) {
		$terms = [];
	}

	$path = count( $terms ) ? get_taxonomy_hierarchy( (int) $terms[0] ) : [];
	$new_name = wp_unique_post_slug( sanitize_title( $text ), (int) $postarr['ID'], $data['post_status'], $data['post_type'], (int) $data['post_parent'] );
	post_message_to_js( json_encode( array(
		'name' => $post_title,
		'newName' => $new_name,
		'content' => $post_content,
		'path' => $path,
		'newPath' => $path,
	) ) );

	// When trashing, first update the file, then trash it.
	if ( $data[ 'post_status' ] === 'trash' ) {
		post_message_to_js( json_encode( array(
			'trash' => true,
			'name' => $new_name,
			'path' => $path,
		) ) );
	}

	$data['post_title'] = $new_name;
	$data['post_name'] = $new_name;
	return $data;
}, 10, 2 );

function get_taxonomy_hierarchy($term_id) {
	$taxonomy_titles = [];

	// Get the term by its ID.
	$term = get_term($term_id);

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

function hypernotes_set_object_terms( $object_id, $terms, $tt_ids, $taxonomy, $append, $old_tt_ids ) {
	if ( $taxonomy !== 'hypernote-folder' ) return;
	$post = get_post( $object_id );

	if ( count( $tt_ids ) > 1 ) {
		remove_action( 'set_object_terms', 'hypernotes_set_object_terms', 10, 6 );
		wp_set_object_terms( $object_id, (int) $tt_ids[0], $taxonomy );
		add_action( 'set_object_terms', 'hypernotes_set_object_terms', 10, 6 );
	}

	post_message_to_js( json_encode( array(
		'name' => $post->post_title,
		'newPath' => get_taxonomy_hierarchy( (int) $tt_ids[0] ),
		'path' => get_taxonomy_hierarchy( (int) $old_tt_ids[0] ),
	) ) );
}

add_action( 'set_object_terms', 'hypernotes_set_object_terms', 10, 6 );

add_action( 'created_term', function( $term_id, $tt_id, $taxonomy ) {
	if ( $taxonomy !== 'hypernote-folder' ) return;
	post_message_to_js( json_encode( array(
		'newPath' => get_taxonomy_hierarchy( (int) $term_id ),
	) ) );
}, 10, 3 );

global $_hypernotes_path;

add_action( 'edited_terms', function( $term_id, $taxonomy ) {
	if ( $taxonomy !== 'hypernote-folder' ) return;
	global $_hypernotes_path;
	$_hypernotes_path = get_taxonomy_hierarchy( (int) $term_id );
}, 10, 3 );

add_action( 'edited_term', function( $term_id, $tt_id, $taxonomy ) {
	if ( $taxonomy !== 'hypernote-folder' ) return;
	global $_hypernotes_path;
	post_message_to_js( json_encode( array(
		'newPath' => get_taxonomy_hierarchy( (int) $term_id ),
		'path' => $_hypernotes_path,
	) ) );
}, 10, 3 );

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
	if ( ! in_array( 'hypernote-folder', $query->query_vars['taxonomy'] ) ) return $return;
	if ( $query->query_vars['fields'] !== 'all_with_object_id' ) return $return;
	var_dump( $query->query_vars );
	$return = post_message_to_js( json_encode( array(
		'terms_pre_query' => $query->query_vars,
	) ) );
	$data = json_decode( $return );
	return array_map( function( $term ) {
		wp_cache_add( $term->term_id, $term, 'terms' );
		return new WP_Term( (object) $term );
	}, $data );
}, 10, 2 );

class Blocknotes_Object_Cache extends WP_Object_Cache {
    public function get( $key, $group = 'default', $force = false, &$found = null ) {
		$cache = parent::get( $key, $group, $force, $found );
		if ( $cache ) return $cache;
		if ( $group !== 'posts' || $key >= 0 ) return $cache;
		$return = post_message_to_js( json_encode( array(
			'cache' => $key
		) ) );
		$post = json_decode( $return );
		wp_cache_add( $post->ID, $post, 'posts' );
        return $post;
    }
}

add_action( 'plugins_loaded', function() {
	global $wp_object_cache;
	$wp_object_cache = new Blocknotes_Object_Cache();
} );

add_filter( 'rest_endpoints', function( $endpoints ) {
    if (isset($endpoints['/wp/v2/hypernote/(?P<id>[\d]+)'])) {
        $endpoints['/wp/v2/hypernote/(?P<id>-?[\d]+)'] = $endpoints['/wp/v2/hypernote/(?P<id>[\d]+)'];
        unset($endpoints['/wp/v2/hypernote/(?P<id>[\d]+)']);
    }
    
    return $endpoints;
}, 10, 1);
