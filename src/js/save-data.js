import { Filesystem, Encoding } from '@capacitor/filesystem'

import { getPostByID, getTermByID, convertID } from './index'

export async function saveData ({ id, name, content, newName, newPath, path, paths }) {
  if (newPath) {
    if (path) {
      let file = ''

      if ( id === 0 ) {
        file = 'new.html';
      } else if ( id ) {
        file = paths[ convertID( id ) ];
      }

      if (typeof content === 'string' && file.endsWith('.html')) {
        console.log('writing file', file)
        await Filesystem.writeFile({
          path: file,
          data: content,
          directory: 'ICLOUD',
          encoding: Encoding.UTF8
        })
      }

      const newFile = newName ? newName + '.html' : file
      const from = file
      const to = ( newFile ? [ ...newPath, newFile ] : newPath ).join('/')

      if ( newPath.includes('.Trash') ) {
        try {
          await Filesystem.mkdir({
            path: newPath.join('/'),
            directory: 'ICLOUD',
          })
        } catch (e) {}
      }

      console.log('renaming file', from, to)
      await Filesystem.rename({
        from,
        to,
        directory: 'ICLOUD'
      })
        const index = paths.indexOf(from)
        if (index !== -1) {
            paths[index] = to

            if ( typeof content === 'string' && file.endsWith('.html') ) {
                return await getPostByID( convertID( index ) );
            } else {
                return getTermByID( convertID( index ) )
            }
        } else {
            // New note.
            paths.push(to)

            if ( typeof content === 'string' && file ) {
                const post = await getPostByID( convertID( paths.length - 1 ) );
                console.log(post)
                return post;
            }
        }
    } else {
      await Filesystem.mkdir({
        path: newPath.join('/'),
        directory: 'ICLOUD',
        recursive: true
      })
      paths.push(newPath.join('/'))
      return getTermByID( convertID( paths.length - 1 ) )
    }
  }
}
