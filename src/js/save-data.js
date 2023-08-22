import { Filesystem, Encoding } from '@capacitor/filesystem'

import { convertID } from './index'

export async function saveData ({ id, content, newName, newPath, path, paths }) {
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
      let to = ( newFile ? [ ...newPath, newFile ] : newPath ).join('/')

      if ( to !== from ) {
        try {
          const exists = await Filesystem.stat({
            path: to,
            directory: 'ICLOUD',
          });

          if ( exists ) {
            to = to.replace('.html', `.${Date.now()}.html`)
          }
        } catch (e) {}
      }

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
            return convertID( index )
        } else {
            // New note.
            paths.push(to)

            if ( typeof content === 'string' && file ) {
                return convertID( paths.length - 1 );
            }
        }
    } else {
      await Filesystem.mkdir({
        path: newPath.join('/'),
        directory: 'ICLOUD',
        recursive: true
      })
      paths.push(newPath.join('/'))
      return convertID( paths.length - 1 )
    }
  }
}
