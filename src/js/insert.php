<?php

include 'wordpress/wp-load.php';

$data = file_get_contents('wordpress/temp.json');
$data = json_decode($data, true);

function insert_items($items, $taxonomy, $parent_term_id = 0) {
    foreach ($items as $item) {
        if ($item['type'] === 'folder') {
            // Insert the directory as a term and get the term ID
            $term_info = wp_insert_term($item['name'], $taxonomy, ['parent' => $parent_term_id]);

            if (!is_wp_error($term_info)) {
                // If the directory has children, run the function again with the children
                if (!empty($item['children'])) {
                    insert_items($item['children'], $taxonomy, $term_info['term_id']);
                }
            } else {
                // Handle the error here
                echo $term_info->get_error_message();
            }
        } elseif ($item['type'] === 'note') {
            // Insert the note as a post and set the term as its parent
            $post_id = wp_insert_post([
				'post_type' => 'hypernote',
                'post_title'   => wp_slash( $item['title'] ),
                'post_name'    => wp_slash( $item['title'] ),
                'post_content' => wp_slash( $item['content'] ),
                'post_status'  => 'private',
                'post_author'  => 1,
            ]);

            if (!is_wp_error($post_id)) {
				wp_set_object_terms($post_id, $parent_term_id, $taxonomy);
			} else {
				// Handle the error here
				echo $post_id->get_error_message();
			}
        }
    }
}

insert_items($data, 'hypernote-folder');
update_user_option( 1, 'admin_color', 'modern' );
