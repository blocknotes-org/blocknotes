import { Filesystem, Encoding } from '@capacitor/filesystem'

import { getPostByID } from './index'

export async function saveData ({ name, content, newName, newPath, path, trash, paths }) {
  if (newPath) {
    if (path) {
      const file = name ? name + '.html' : ''

      if (typeof content === 'string' && file) {
        console.log('writing file', [ ...path, file ].join('/'))
        await Filesystem.writeFile({
          path: [ ...path, file ].join('/'),
          data: content,
          directory: 'ICLOUD',
          encoding: Encoding.UTF8
        })
      }

      const newFile = newName ? newName + '.html' : file
      const from = [ ...path, file ].join('/')
      const to = [ ...newPath, newFile ].join('/')

      console.log('renaming file', from, to)
      await Filesystem.rename({
        from,
        to,
        directory: 'ICLOUD'
      })
        const index = paths.indexOf(from)
        if (index !== -1) {
            paths[index] = to

            if ( typeof content === 'string' && file ) {
                return await getPostByID( - index - 1 );
            }
        } else {
            // New note.
            paths.push(to)

            if ( typeof content === 'string' && file ) {
                return await getPostByID( - paths.length );
            }
        }
    } else {
      await Filesystem.mkdir({
        path: newPath.join('/'),
        directory: 'ICLOUD',
        recursive: true
      })
    }
  } else if (trash) {
    const from = [ ...path, name + '.html' ].join('/')
    const to = [ ...path, '.Trash', name + '.html' ].join('/')
    await Filesystem.rename({
      from,
      to,
      directory: 'ICLOUD'
    })
    const index = paths.indexOf(from)
    if (index !== -1) {
        paths[index] = to
    }
  }
}
