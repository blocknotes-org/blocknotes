import { Filesystem } from '../filesystem/dist/esm/index.js'
import { getSelectedFolderURL } from './index'

export async function getPaths (path = '', selectedFolderURL) {
  const paths = []
  if (!selectedFolderURL) {
    selectedFolderURL = await getSelectedFolderURL()
  }
  const dir = await Filesystem.readdir({
    path,
    directory: selectedFolderURL
  })

  // Recursively read all files in the iCloud folder
  for (const file of dir.files) {
    const nestedPath = path ? [path, file.name].join('/') : file.name
    if (file.type === 'directory') {
      if (file.name.startsWith('.') && file.name !== '.Trash') {
        continue
      }
      // paths.push(nestedPath)
      paths.push(...await getPaths(nestedPath, selectedFolderURL))
    } else if (file.name.endsWith('.html')) {
      paths.push(nestedPath)
    }
  }

  return paths
}
