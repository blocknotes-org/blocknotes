import { Filesystem, Encoding } from '@capacitor/filesystem'

function isoToTime (iso) {
  // Convert iso string to Y-m-d H:i:s
  return iso.split('T').join(' ').split('.')[0]
}

export async function getData () {
  const dir = await Filesystem.readdir({
    path: '',
    directory: 'ICLOUD'
  })

  // Recursively read all files in the iCloud folder
  async function readDirRecursive (dir, name, children, icloud) {
    for (const file of dir.files) {
      console.log(file, name)
      if (file.type === 'directory') {
        if (file.name.startsWith('.') && file.name !== '.Trash') {
          continue
        }
        const item = {
          type: 'folder',
          name: file.name,
          children: []
        }
        children.push(item)
        await readDirRecursive(await Filesystem.readdir({
          path: [...name, file.name].join('/'),
          directory: 'ICLOUD'
        }), [...name, file.name], item.children, file.name === '.Trash' ? [] : icloud)
      } else if (file.name.endsWith('.html')) {
        const text = await Filesystem.readFile({
          path: [...name, file.name].join('/'),
          directory: 'ICLOUD',
          encoding: Encoding.UTF8
        })
        children.push({
          type: 'note',
          content: text.data,
          title: file.name.replace(/\.html$/i, ''),
          ctime: isoToTime((new Date(parseInt(file.ctime, 10))).toISOString()),
          mtime: isoToTime((new Date(parseInt(file.mtime, 10))).toISOString())
        })
      } else if (file.name.endsWith('.icloud')) {
        icloud.push([...name, file.name].join('/'))
      }
    }
  }

  const d = []
  const icloud = []
  await readDirRecursive(dir, [], d, icloud)
  return [d, icloud]
}
