import { Filesystem, Encoding } from '@capacitor/filesystem'
import { App as NativeApp } from '@capacitor/app'
import { Preferences } from '@capacitor/preferences'
import { set, get } from 'idb-keyval'
import { getPaths } from './get-data.js'
import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { registerCoreBlocks } from '@wordpress/block-library'
import { useStateWithHistory } from '@wordpress/compose'
import {
  BlockEditorProvider,
  BlockCanvas,
  BlockToolbar
} from '@wordpress/block-editor'
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components'
import { chevronDown } from '@wordpress/icons'
import { createBlock, getBlockContent, parse, serialize } from '@wordpress/blocks'
import { __ } from '@wordpress/i18n'
import '@wordpress/format-library'

// It is needed for the appenders, this should be fixed in GB.
import '@wordpress/block-editor/build-style/content.css'

import '@wordpress/block-editor/build-style/style.css'
import '@wordpress/block-library/build-style/style.css'
import '@wordpress/components/build-style/style.css'

import blockEditorContentStyleUrl from '@wordpress/block-editor/build-style/content.css?url'
import blockLibraryContentStyleUrl from '@wordpress/block-library/build-style/editor.css?url'
import componentsStyleUrl from '@wordpress/components/build-style/style.css?url'

function sanitizeFileName (name) {
  // Replace invalid characters with their percent-encoded equivalents
  return name.replace(/[\\/:*?"<>|]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase())
}

let __handle

export async function getSelectedFolderURL () {
  if (__handle) return __handle
  const directoryHandle = await get('directoryHandle')
  if (directoryHandle) return directoryHandle
  const selectedFolderURL = await Preferences.get({ key: 'selectedFolderURL' })
  return selectedFolderURL?.value
}

window.pick = async function () {
  const { url } = await Filesystem.pickDirectory()
  __handle = url
  if (typeof url === 'string') {
    await Preferences.set({ key: 'selectedFolderURL', value: url })
  } else {
    await Preferences.remove({ key: 'selectedFolderURL' })
    await set('directoryHandle', url)
  }
  load()
}

async function load () {
  try {
    await Filesystem.checkPermissions()
  } catch (e) {
    window.alert(e.message)
    return
  }

  let selectedFolderURL = await getSelectedFolderURL()

  if (selectedFolderURL) {
    try {
      await Filesystem.readdir({ directory: selectedFolderURL, path: '' })
    } catch (e) {
      window.alert(e.message + ` [${selectedFolderURL}]`)
      selectedFolderURL = null
    }
  }

  if (!selectedFolderURL) {
    document.body.classList.remove('loading')
    const button = document.createElement('button')
    button.textContent = 'Pick Folder'
    button.addEventListener('click', async () => {
      try {
        await window.pick()
      } catch (e) {
        window.alert(e.message)
        return
      }

      button.remove()
    })
    button.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'
    document.body.appendChild(button)
    button.focus()
    return
  }

  function useDelayedEffect (effect, deps, delay) {
    const hasMounted = useRef(false)
    useEffect(() => {
      if (!hasMounted.current) {
        hasMounted.current = true
        return
      }
      const timeout = setTimeout(effect, delay)
      return () => clearTimeout(timeout)
    }, deps)
  }

  function Editor ({ blocks, currentPath, setCurrentPath, paths, setPaths }) {
    let selection

    if (!currentPath.path) {
      const [firstBlock] = blocks
      const sel = { clientId: firstBlock.clientId, attributeKey: 'content', offset: 0 }
      selection = { selectionStart: sel, selectionEnd: sel }
    }

    const { value, setValue } = useStateWithHistory({ blocks, selection })
    useDelayedEffect(async () => {
      function flattenBlocks (blocks) {
        return blocks.reduce((acc, block) => {
          if (block.innerBlocks?.length) {
            acc.push(...flattenBlocks(block.innerBlocks))
            return acc
          }
          acc.push(block)
          return acc
        }, [])
      }

      if (!currentPath.path) {
        currentPath.path = `${Date.now()}.html`
      }

      const blocks = flattenBlocks(value.blocks)
      const base = currentPath.path.split('/').slice(0, -1).join('/')
      let newPath

      for (const block of blocks) {
        const html = getBlockContent(block)
        const textContent = sanitizeFileName(html.replace(/<[^>]+>/g, '').trim()).slice(0, 50)
        if (textContent) {
          newPath = base ? base + '/' + textContent + '.html' : textContent + '.html'
          break
        }
      }

      // First write because it's more important than renaming.
      await Filesystem.writeFile({
        path: currentPath.path,
        directory: selectedFolderURL,
        data: serialize(value.blocks),
        encoding: Encoding.UTF8
      })

      if (newPath && newPath !== currentPath.path) {
        // Check if the wanted file name already exists.
        try {
          const exists = await Filesystem.stat({
            path: newPath,
            directory: selectedFolderURL
          })

          // If it does, add a timestamp to the file name.
          if (exists) {
            newPath = newPath.replace('.html', `.${Date.now()}.html`)
          }
        } catch (e) {}

        await Filesystem.rename({
          from: currentPath.path,
          to: newPath,
          directory: selectedFolderURL
        })

        // Only after the rename is successful, silently update the current
        // path.
        currentPath.path = newPath
      }
    }, [value.blocks], 1000)
    return (
      <BlockEditorProvider
        value={value.blocks}
        selection={value.selection}
        onInput={(blocks, { selection }) => {
          setValue({ blocks, selection }, true)
        }}
        onChange={(blocks, { selection }) => {
          setValue({ blocks, selection }, false)
        }}
        settings={{
          hasFixedToolbar: true,
          __unstableResolvedAssets: {
            styles: `
<link rel="stylesheet" href="${componentsStyleUrl}">
<link rel="stylesheet" href="${blockEditorContentStyleUrl}">
<link rel="stylesheet" href="${blockLibraryContentStyleUrl}">`
          }
        }}
      >
        <div id='select' class='components-accessible-toolbar'>
          <DropdownMenu
            className='blocknotes-select'
            icon={chevronDown}
            label={__('Notes')}
            toggleProps={{
              children: __('Notes')
            }}
          >
            {({ onClose }) => (
              <>
                <MenuGroup>
                  <MenuItem onClick={() => {
                    const newPath = {}
                    setPaths([newPath, ...paths])
                    setCurrentPath(newPath)
                    onClose()
                  }}
                  >
                    {__('New Note')}
                  </MenuItem>
                </MenuGroup>
                <MenuGroup>
                  {paths.map((path) => (
                    <MenuItem
                      key={path.path}
                      onClick={() => { setCurrentPath(path); onClose() }}
                      className={path === currentPath ? 'is-active' : ''}
                    >
                      {decodeURIComponent(path.path?.replace(/(?:\.?[0-9]+)?\.html$/, '') || __('New note'))}
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuGroup>
                  <MenuItem onClick={() => { window.pick(); onClose() }}>
                    {__('Pick Folder')}
                  </MenuItem>
                </MenuGroup>
              </>
            )}
          </DropdownMenu>
          <BlockToolbar hideDragHandle />
        </div>
        <div
          id='editor'
          style={{
            position: 'relative',
            overflow: 'auto',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <BlockCanvas
            height='100%'
            styles={[
              {
                css: `
body {
  max-width: 600px;
  margin: 100px auto;
  font-family: Hoefler Text;
  font-size: 20px;
  padding: 1px 1em;
}
`
              }
            ]}
          />
        </div>
      </BlockEditorProvider>
    )
  }

  function Note ({ currentPath, setCurrentPath, paths, setPaths }) {
    const [note, setNote] = useState()
    useEffect(() => {
      if (currentPath.path) {
        Filesystem.readFile({
          path: currentPath.path,
          directory: selectedFolderURL,
          encoding: Encoding.UTF8
        }).then(file => {
          setNote(parse(file.data))
        })
      } else {
        // Initialise with empty paragraph because we don't want merely clicking
        // on an empty note to save it.
        setNote([createBlock('core/paragraph')])
      }
    }, [currentPath])
    if (!note) return null
    return (
      <Editor
        key={String(currentPath.path)}
        blocks={note}
        currentPath={currentPath}
        setCurrentPath={(path) => {
          if (path === currentPath) return
          setCurrentPath(path)
          setNote()
        }}
        paths={paths}
        setPaths={setPaths}
      />
    )
  }

  function App () {
    const [paths, setPaths] = useState([])
    const [currentPath, setCurrentPath] = useState()
    useEffect(() => {
      registerCoreBlocks()
      getPaths().then((paths) => {
        const pathObjects = paths.map(path => ({ path }))
        setPaths(pathObjects)
        setCurrentPath(pathObjects[0] ?? {})
      })
    }, [])
    if (!currentPath) return null
    return (
      <Note currentPath={currentPath} setCurrentPath={setCurrentPath} paths={paths} setPaths={setPaths} />
    )
  }

  const root = createRoot(document.getElementById('app'))
  root.render(<App />)

  NativeApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      // save
    }
  })
}

load()
