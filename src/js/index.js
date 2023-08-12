import { main } from './pg.js'
import { Filesystem, Encoding } from '@capacitor/filesystem'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App } from '@capacitor/app'
import plugin from './plugin.php?raw'
import actions from './actions.php?raw'
import insert from './insert.php?raw'
import { getData, getPaths } from './get-data.js'
import { saveData } from './save-data.js'

const PHP_MAX_INT = 2147483647;
const paths = [];

export function convertID(id) {
  return PHP_MAX_INT - id - 1;
}

async function getIndexedPaths () {
  const freshPaths = await getPaths();
  for (const freshpath of freshPaths) {
    const index = paths.indexOf(freshpath);
    if (index === -1) {
      paths.push(freshpath)
    }
  }

  return paths;
}

function isoToTime (iso) {
  // Convert iso string to Y-m-d H:i:s
  return iso.split('T').join(' ').split('.')[0]
}

export async function getPostByID(id) {
  const path = paths[convertID(id)];
  const text = await Filesystem.readFile({
    path: path,
    directory: 'ICLOUD',
    encoding: Encoding.UTF8
  });
  const name = path.replace(/\.html$/i, '');
  const file = await Filesystem.stat({
    path: path,
    directory: 'ICLOUD',
  });
  return {
    ID: id,
    post_type: 'hypernote',
    post_content: text.data,
    post_title: name,
    post_name: name,
    post_status: 'private',
    post_author: 1,
    post_date_gmt: isoToTime((new Date(parseInt(file.ctime, 10))).toISOString()),
    post_modified_gmt: isoToTime((new Date(parseInt(file.mtime, 10))).toISOString())
  }
}

function getTermByID (id) {
  const path = paths[convertID(id)];
  const directories = path.split('/');
  const parentIndex = paths.indexOf(directories.slice(0, directories.length - 1).join('/'))
  return {
    term_id: id,
    name: directories[directories.length - 1],
    slug: id + '',
    term_group: 0,
    term_taxonomy_id: id,
    taxonomy: 'hypernote-folder',
    description: '',
    parent: parentIndex === -1 ? 0 : convertID( parentIndex ),
  }
}


try {
  StatusBar.setStyle({ style: Style.Dark })
} catch (e) {}

const platform = window.Capacitor.getPlatform()

async function getDataWithICloudWarning () {
  const startTime = Date.now()
  let d
  try {
    d = await getData()
  } catch (e) {
    if (e.message === 'Invalid path') {
      window.alert('iCloud folder not found. Please sign into iCloud.')
    } else {
      window.alert(e.message)
    }
    window.location.reload()
    return
  }

  console.log('Data done in ' + (Date.now() - startTime) + 'ms')

  return d
}

async function load () {
  try {
    await Filesystem.checkPermissions()
  } catch (e) {
    window.alert(e.message)
    return
  }

  if ((await Filesystem.checkPermissions()).publicStorage === 'prompt') {
    const button = document.createElement('button')
    button.textContent = 'Request File System Permission'
    button.addEventListener('click', async () => {
      await Filesystem.requestPermissions()
      button.remove()
      load()
    })
    document.body.textContent = ''
    document.body.appendChild(button)
    button.focus()
    return
  }

  const [[d, icloud], { php, request }] = await Promise.all([
    [[], []],
    main()
  ])

  if (icloud.length) {
    window.alert('The following files are not downloaded:\n' + icloud.join('\n'))
  }

  let messageChannel = null
  let save = null

  window.addEventListener('statusTap', function () {
    messageChannel?.postMessage('open')
  })

  App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      save?.postMessage('')
    }
  })

  App.addListener('pause', () => {
    console.log('pause')
  })

  window.addEventListener('message', function (event) {
    if (event.data === 'hypernotes') {
      messageChannel = event.ports[0]
    } else if (event.data === 'blocknotes.save') {
      save = event.ports[0]
    }
  })

  await php.writeFile(
    '/wordpress/wp-content/mu-plugins/hypernotes.php',
    `<?php global $platform; $platform = '${platform}'; ?>${plugin}`
  )

  await php.writeFile(
    '/wordpress/temp.json',
    JSON.stringify({
      data: d,
      platform,
      gmt_offset: -new Date().getTimezoneOffset() / 60
    })
  )

  const startTime = Date.now()

  const result = await php.run({ code: insert })

  console.log('result', result.text);

  console.log('Insert done in ' + (Date.now() - startTime) + 'ms')

  await php.writeFile(
    '/wordpress/wp-content/mu-plugins/actions.php',
    actions
  )

  php.onMessage(async (data) => {
    const { name, content, newName, newPath, path, trash, statement, cache, terms_pre_query, counts } = JSON.parse(data)

    if (counts) {
      // Get the number of posts
      const posts = ( await getIndexedPaths() ).filter((path) => path.endsWith('.html'));
      const trashed = posts.filter((path) => path.split('/').includes('.Trash'));
      return JSON.stringify({
        private: posts.length - trashed.length,
        trash: trashed.length,
      });
    }

    if ( terms_pre_query ) {
      console.log('terms_pre_query', terms_pre_query);
      if (terms_pre_query['fields'] === 'all_with_object_id') {
        const terms = ( await getIndexedPaths() ).map((path,index) => {
          if (!path.endsWith('.html')) {
            return null;
          }
          if (path.split('/').includes('.Trash')) {
            return null;
          }
          if (!path.includes('/')) {
            return null;
          }
          const directories = path.split('/');
          const fileName = directories.pop();
          const termId = convertID( paths.indexOf(directories.join('/')) );
          return {
            object_id: convertID(index),
            ...getTermByID( termId ),
          }
        }).filter((term) => term !== null);
        return JSON.stringify( terms );
      } else {
        const object_ids = terms_pre_query['object_ids'];
        const _paths = ( await getIndexedPaths() );
        const terms = ( !object_ids.length ) ? _paths.map((path,index) => {
          if (path.endsWith('.html')) {
            return null;
          }
          if (path.split('/').includes('.Trash')) {
            return null;
          }
          const termId = convertID(index);
          return getTermByID( termId );
        }).filter((term) => term !== null) : object_ids.map((object_id) => {
          const path = _paths[convertID(object_id)];
          if (!path.endsWith('.html')) {
            return null;
          }
          if (!path.includes('/')) {
            return null;
          }
          const directories = path.split('/').filter((folder) => folder !== '.Trash');
          const fileName = directories.pop();
          const termId = convertID( paths.indexOf(directories.join('/')) );
          return getTermByID( termId );
        }).filter((term) => term !== null);


        if ( terms_pre_query['fields'] === 'all' ) {
          return JSON.stringify( terms );
        } else if ( terms_pre_query['fields'] === 'ids' || terms_pre_query['fields'] === 'tt_ids' ) {
          return JSON.stringify( terms.map((term) => term.term_id) );
        } else if ( terms_pre_query['fields'] === 'names' ) {
          return JSON.stringify( terms.map((term) => term.name) );
        } else if ( terms_pre_query['fields'] === 'count' ) {
          return JSON.stringify( terms.length );
        } else if ( terms_pre_query['fields'] === 'slugs' ) {
          return JSON.stringify( terms.map((term) => term.slug) );
        } else if ( terms_pre_query['fields'] === 'id=>parent' ) {
          return JSON.stringify( terms.reduce((acc,term) => {
            acc[term.term_id] = term.parent;
            return acc;
          }, {}) );
        } else if ( terms_pre_query['fields'] === 'id=>name' ) {
          return JSON.stringify( terms.reduce((acc,term) => {
            acc[term.term_id] = term.name;
            return acc;
          }, {}) );
        } else if ( terms_pre_query['fields'] === 'id=>slug' ) {
          return JSON.stringify( terms.reduce((acc,term) => {
            acc[term.term_id] = term.slug;
            return acc;
          }, {}) );
        }
      }
    }

    if ( cache ) {
      const path = ( await getIndexedPaths() )[ convertID(cache) ];
      console.log('cache_id', cache, path);
      if (!path) return;
      if ( path.endsWith('.html') ) {
        return JSON.stringify( await getPostByID(cache) );
      } else {
        return JSON.stringify( getTermByID(cache) );
      }
    }

    if (statement) {
      if (statement.post_type === 'hypernote') {
        const trash = statement['post_status'] === 'trash';
        const _paths = await getIndexedPaths();
        let folderPath = null;

        if ( statement['hypernote-folder'] ) {
          const folderId = convertID( parseInt( statement['hypernote-folder'], 10 ) );
          folderPath = _paths[folderId];
        }

        console.log('statement',statement);
        const posts = ( await Promise.all( _paths.map(async (path,index) => {
          if (!path.endsWith('.html')) {
            return null;
          }
          if (folderPath && !path.startsWith(folderPath)) {
            return null;
          }
          const isInTrash = path.split('/').includes('.Trash');
          if ( trash !== isInTrash ) {
            return null;
          }
          return await getPostByID( convertID(index) );
        }) ) ).filter((term) => term !== null);

        return JSON.stringify(posts);
      }
      return '[]'
    }

    console.log({ name, newName, newPath, path, trash })

    try {
      const saved = await saveData({ name, content, newName, newPath, path, trash, paths });
      console.log('updating post', saved);
      return JSON.stringify( saved );
    } catch (e) {
      window.alert(e.message)
      return JSON.stringify(e);
    }
  })

  request({
    url: '/wp-admin/edit.php?post_type=hypernote'
  })
}

load()
