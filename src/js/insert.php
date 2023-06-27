<?php

include 'wordpress/wp-load.php';

$data = file_get_contents('wordpress/temp.json');
$data = json_decode($data, true);

function insert_items($items, $taxonomy, $parent_term_id = 0, $status = 'private') {
    foreach ($items as $item) {
        if ($item['type'] === 'folder') {
            // Ignore folders within the trash folder for now
            if ($status === 'trash') {
                continue;
            }
            // Handle .Trash folder
            if ($item['name'] === '.Trash') {
                insert_items($item['children'], $taxonomy, $parent_term_id, 'trash');
            } else {
                // Insert the directory as a term and get the term ID
                $term_info = wp_insert_term($item['name'], $taxonomy, ['parent' => $parent_term_id]);

                if (!is_wp_error($term_info)) {
                    // If the directory has children, run the function again with the children
                    if (!empty($item['children'])) {
                        insert_items($item['children'], $taxonomy, $term_info['term_id']);
                    }
                } else {
                    echo $term_info->get_error_message();
                }
            }
        } elseif ($item['type'] === 'note') {
            // Insert the note as a post and set the term as its parent
            $post_id = wp_insert_post([
				'post_type' => 'hypernote',
                'post_title'   => wp_slash( $item['title'] ),
                'post_name'    => wp_slash( $item['title'] ),
                'post_content' => wp_slash( $item['content'] ),
                'post_status'  => $status,
                'post_author'  => 1,
                'post_date_gmt' => $item['ctime'],
                'post_modified_gmt' => $item['mtime'],
            ]);

            if (!is_wp_error($post_id)) {
                wp_set_object_terms($post_id, $parent_term_id, $taxonomy);
			} else {
				echo $post_id->get_error_message();
			}
        }
    }
}

update_user_option( 1, 'admin_color', 'modern' );
update_option( 'gmt_offset', $data['gmt_offset'] );
insert_items($data['data'], 'hypernote-folder');
