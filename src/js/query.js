import { getData } from "./get-data";

export async function queryHyperNotes() {
  const result = [];
  const [ data ] = await getData();
  data.forEach((item) => {
    if (item.type === 'folder') {
        item.children.forEach((child) => {
            if (child.type === 'note') {
                result.push({
                    post_type: 'hypernote',
                    post_content: item.content,
                    post_title: item.title,
                    post_name: item.title,
                    post_status: 'private',
                    post_author: 1,
                    post_date_gmt: item.ctime,
                    post_modified_gmt: item.mtime,
                })
            }
        })
    } else if (item.type === 'note') {
        result.push({
            post_type: 'hypernote',
            post_content: item.content,
            post_title: item.title,
            post_name: item.title,
            post_status: 'private',
            post_author: 1,
            post_date_gmt: item.ctime,
            post_modified_gmt: item.mtime,
        })
    }
  })

  return d;
}
