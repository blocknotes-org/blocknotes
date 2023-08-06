import { main } from './pg.js'
import { Filesystem, Encoding } from '@capacitor/filesystem'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App } from '@capacitor/app'
import plugin from './plugin.php?raw'
import actions from './actions.php?raw'
import insert from './insert.php?raw'
import { getData } from './get-data.js'
import { saveData } from './save-data.js'

const paths = [];

function isoToTime (iso) {
  // Convert iso string to Y-m-d H:i:s
  return iso.split('T').join(' ').split('.')[0]
}

// Revert to storing an array of titles, or paths rather. Read from the
// filesystem when getting from object cache so posts are fresh with each
// pageload.
function getID(path) {
  const index = paths.indexOf(path);
  if (index === -1) {
    paths.push(path)
    return - paths.length;
  }

  return - ( index + 1 );
}

async function getPostByID(id) {
  const path = paths[-id - 1];
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
    getDataWithICloudWarning(),
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
    const { name, content, newName, newPath, path, trash, statement, cache, terms_pre_query } = JSON.parse(data)

    if ( terms_pre_query ) {
      if (terms_pre_query['fields'] === 'all_with_object_id') {
        const terms = paths.map((path,index) => {
          if (!path.endsWith('.html')) {
            return null;
          }
          if (!path.includes('/')) {
            return null;
          }
          const directories = path.split('/');
          const fileName = directories.pop();
          const termId = - paths.indexOf(directories.join('/')) - 1;
          return {
            object_id: - index - 1,
            term_id: termId,
            name: directories[directories.length - 1],
            slug: directories[directories.length - 1],
            term_group: 0,
            term_taxonomy_id: termId,
            taxonomy: 'hypernote-folder',
            description: '',
            parent: - paths.indexOf(directories.slice(0, directories.length - 1).join('/')) - 1,
          }
        }).filter((term) => term !== null);
        console.log('terms_pre_query', terms)
        return JSON.stringify( terms );
      } else if (terms_pre_query['fields'] === 'all') {
        const result = [];
        const [ data ] = await getData();

        function addItem(item) {
          result.push({
            ID: getID(item.path),
            post_type: 'hypernote',
            post_content: item.content,
            post_title: item.title,
            post_name: item.title,
            post_status: 'private',
            post_author: 1,
            post_date_gmt: item.ctime,
            post_modified_gmt: item.mtime,
          });
        }

        function addItems(items) {
          items.forEach((item) => {
            if (item.type === 'folder') {
                getID(item.path);
                addItems(item.children);
            } else if (item.type === 'note') {
                addItem(item);
            }
          })
        }

        addItems(data);
        const terms = paths.map((path,index) => {
          if (path.endsWith('.html')) {
            return null;
          }
          const directories = path.split('/');
          const termId = - index - 1;
          return {
            term_id: termId,
            name: directories[directories.length - 1],
            slug: directories[directories.length - 1],
            term_group: 0,
            term_taxonomy_id: termId,
            taxonomy: 'hypernote-folder',
            description: '',
            parent: - paths.indexOf(directories.slice(0, directories.length - 1).join('/')) - 1,
          }
        }).filter((term) => term !== null);
        console.log('terms_pre_query', terms)
        return JSON.stringify( terms );
      }
    }

    if ( cache ) {
      return JSON.stringify( await getPostByID(cache) );
    }

    if (statement) {
      if (statement.post_type === 'hypernote') {
        const result = [];
        const [ data ] = await getData();

        function addItem(item) {
          result.push({
            ID: getID(item.path),
            post_type: 'hypernote',
            post_content: item.content,
            post_title: item.title,
            post_name: item.title,
            post_status: 'private',
            post_author: 1,
            post_date_gmt: item.ctime,
            post_modified_gmt: item.mtime,
          });
        }

        function addItems(items) {
          items.forEach((item) => {
            if (item.type === 'folder') {
                getID(item.path);
                addItems(item.children);
            } else if (item.type === 'note') {
                addItem(item);
            }
          })
        }

        addItems(data);
        return JSON.stringify(result);
      }
      return '[]'
    }

    console.log({ name, newName, newPath, path, trash })

    try {
      await saveData({ name, content, newName, newPath, path, trash })
    } catch (e) {
      window.alert(e.message)
    }
  })

  request({
    url: '/wp-admin/edit.php?post_type=hypernote'
  })
}

load()
