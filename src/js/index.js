import { main } from './pg.js'
import { Filesystem, Encoding } from '@capacitor/filesystem'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App } from '@capacitor/app'
import { Preferences } from '@capacitor/preferences';
import plugin from './plugin.php?raw'
import actions from './actions.php?raw'
import insert from './insert.php?raw'
import { getPaths } from './get-data.js'
import { saveData } from './save-data.js'

const PHP_MAX_INT = 2147483647;
let paths = [];

export function convertID(id) {
  return PHP_MAX_INT - id - 1;
}

async function getIndexedPaths () {
  if ( paths.fresh === false ) return paths;
  const freshPaths = await getPaths();
  for (const freshpath of freshPaths) {
    const index = paths.indexOf(freshpath);
    if (index === -1) {
      paths.push(freshpath)
    }
  }

  paths.fresh = false;

  return paths;
}

function isoToTime (iso) {
  // Convert iso string to Y-m-d H:i:s
  return iso.split('T').join(' ').split('.')[0]
}

export async function getPostByID(id, query) {
  const path = paths[convertID(id)];
  const selectedFolderURL = await getSelectedFolderURL();
  try {
    const text = await Filesystem.readFile({
      path: path,
      directory: selectedFolderURL,
      encoding: Encoding.UTF8
    });
    const _path = path.split('/');
    const name = _path[_path.length - 1].replace('.html', '');
    const file = await Filesystem.stat({
      path: path,
      directory: selectedFolderURL,
    });
    console.log(id,path)
    return {
      ID: id,
      post_type: 'hypernote',
      post_content: text.data,
      post_title: name,
      post_name: name,
      post_status: _path.includes('.Trash') ? 'trash' : 'private',
      post_author: 1,
      post_date: isoToTime((new Date(parseInt(file.ctime, 10))).toISOString()),
      post_modified: isoToTime((new Date(parseInt(file.mtime, 10))).toISOString())
    }
  } catch (e) {
    console.log(e)
    return null;
  }
}

export function getTermByID (id) {
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

export async function getSelectedFolderURL() {
  const selectedFolderURL = await Preferences.get({ key: 'selectedFolderURL' });
  return selectedFolderURL?.value;
}


try {
  StatusBar.setStyle({ style: Style.Dark })
} catch (e) {}

const platform = window.Capacitor.getPlatform()

window.pick = async function () {
  try {
    const { url } = await Filesystem.pickDirectory();
    await Preferences.set({ key: 'selectedFolderURL', value: url });
    window.location.reload();
  } catch (e) {
    throw e;
  }
  load ()
}

async function load () {
  try {
    await Filesystem.checkPermissions()
  } catch (e) {
    window.alert(e.message)
    return
  }

  let selectedFolderURL = await getSelectedFolderURL();

  if ( selectedFolderURL ) {
    try {
      await Filesystem.readdir({ directory: selectedFolderURL, path: '' });
    } catch (e) {
      window.alert(e.message + ` [${selectedFolderURL}]` )
      selectedFolderURL = null;
    }
  }

  if (!selectedFolderURL) {
    document.body.classList.remove('loading')
    const button = document.createElement('button')
    button.textContent = 'Pick Folder'
    button.addEventListener('click', async () => {
      try {
        await window.pick();
      } catch (e) {
        window.alert(e.message)
        return;
      }

      button.remove();
    })
    button.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'
    document.body.appendChild(button)
    button.focus()
    return
  }

  const persist = await Preferences.get({ key: 'persist' });
  const last = persist?.value ? JSON.parse( persist.value ) : null;

  await main({
    url: last?.url || '/wp-admin/edit.php?post_type=hypernote',
    beforeLoad: ({url, text}) => {
      paths.fresh = true
      Preferences.set({ key: 'persist', value: JSON.stringify({ url }) });
    },
    async ready( php ) {
      await php.writeFile(
        '/wordpress/wp-content/mu-plugins/hypernotes.php',
        `<?php global $platform; $platform = '${platform}'; ?>${plugin}`
      )
    
      await php.writeFile(
        '/wordpress/temp.json',
        JSON.stringify({
          platform,
          gmt_offset: -new Date().getTimezoneOffset() / 60
        })
      )
    
      await php.run({ code: insert })
    
      await php.writeFile(
        '/wordpress/wp-content/mu-plugins/actions.php',
        actions
      )
    
      php.onMessage(async (data) => {
        const { id, name, content, newName, newPath, path, trash, statement, cache, terms_pre_query, counts } = JSON.parse(data)
    
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
            console.log('_paths', _paths);
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
              if (!directories.join('/')) return null;
              const termId = convertID( paths.indexOf(directories.join('/')) );
              return getTermByID( termId );
            }).filter((term) => term !== null);
    
            console.log('terms', terms);
    
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
              return await getPostByID( convertID(index), true );
            }) ) ).filter((term) => term !== null);
    
            return JSON.stringify(posts);
          }
          return '[]'
        }
    
        console.log({ id, name, newName, newPath, path, trash })
    
        try {
          const saved = await saveData({ id, name, content, newName, newPath, path, trash, paths });
          await Preferences.set({ key: 'inactiveTime', value: Date.now().toString() });
          return JSON.stringify( saved );
        } catch (e) {
          window.alert(e.message)
          return JSON.stringify(e);
        }
      })
    },
  })

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

  window.addEventListener('message', function (event) {
    if (event.data === 'hypernotes') {
      messageChannel = event.ports[0]
    } else if (event.data === 'blocknotes.save') {
      save = event.ports[0]
    }
  })
}

load()
