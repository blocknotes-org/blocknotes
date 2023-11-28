import { Filesystem, Encoding } from '@capacitor/filesystem'
import { StatusBar, Style } from '@capacitor/status-bar'
import { App as NativeApp } from '@capacitor/app'
import { Preferences } from '@capacitor/preferences';
import { getPaths } from './get-data.js'
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { registerCoreBlocks } from '@wordpress/block-library';
import { useStateWithHistory } from '@wordpress/compose';
import {
	BlockEditorProvider,
	BlockCanvas,
	BlockTools,
  BlockContextualToolbar,
} from '@wordpress/block-editor';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { parse } from '@wordpress/blocks'
import { __ } from '@wordpress/i18n';
import '@wordpress/format-library';

import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/components/build-style/style.css';

let paths = [];

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

export async function getSelectedFolderURL() {
  const selectedFolderURL = await Preferences.get({ key: 'selectedFolderURL' });
  return selectedFolderURL?.value;
}


try {
  StatusBar.setStyle({ style: Style.Dark })
} catch (e) {}

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

  const freshPaths = await getIndexedPaths();

  function Editor( { blocks, index, setIndex, freshPaths } ) {
    const { value, setValue, hasUndo, hasRedo, undo, redo } =
		  useStateWithHistory( { blocks } );
    const ref = useRef();
    return (
      <BlockEditorProvider
        value={ value.blocks }
        selection={ value.selection }
        onInput={ ( blocks, { selection } ) => {
          setValue( { blocks, selection }, true )
        } }
        onChange={ ( blocks, { selection } ) => {
          setValue( { blocks, selection }, false )
        } }
        settings={ {
          hasFixedToolbar: true,
        } }
      >
        <div id="select" class="components-accessible-toolbar">
          <DropdownMenu
            className="blocknotes-select"
            icon={ chevronDown }
            label={ __( 'Notes' ) }
            toggleProps={ {
              children: __( 'Notes' ),
            } }
          >
            { ( { onClose } ) => (
              <>
                <MenuGroup>
                  <MenuItem onClick={ () => { setIndex(paths.length); onClose(); } }>
                    New Note
                  </MenuItem>
                </MenuGroup>
                <MenuGroup>
                  {freshPaths.map((path, index) => (
                    <MenuItem key={index} onClick={() => { setIndex(index); onClose(); }}>
                      {path}
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuGroup>
                  <MenuItem onClick={ () => { window.pick(); onClose(); } }>
                    Pick Folder
                  </MenuItem>
                </MenuGroup>
              </>
            ) }
          </DropdownMenu>
          <BlockContextualToolbar isFixed />
        </div>
        <div style={ {
          position: 'relative',
          overflow: 'auto',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        } }>
          <BlockTools
            __unstableContentRef={ ref }
            style={ { height: '100%' } }
          >
            <BlockCanvas height="100%" styles={ [
              {
                'css': `
body {
max-width: 600px;
margin: 100px auto;
font-family: Hoefler Text;
font-size: 20px;
}
`,
              }
            ] } contentRef={ ref } />
          </BlockTools>
        </div>
      </BlockEditorProvider>
    );
  }

  function Note( { index, setIndex, freshPaths } ) {
    const [note, setNote] = useState(null)
    useEffect(() => {
      setNote(null)
      const path = paths[index]
      Filesystem.readFile({
        path,
        directory: selectedFolderURL,
        encoding: Encoding.UTF8
      }).then(file => {
        setNote(parse(file.data))
      })
    }, [index])
    if ( ! note ) return null;
    return (
      <Editor blocks={ note } index={ index } setIndex={setIndex} freshPaths={ freshPaths } />
    )
  }

  function App() {
    const [index, setIndex] = useState(0)
    useEffect(() => {
      registerCoreBlocks()
    }, [])
    return (
      <>
        <Note index={index} setIndex={setIndex} freshPaths={ freshPaths } />
      </>
    )
  }

  const root = createRoot(document.getElementById('app'));
  root.render(<App />);

  NativeApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      // save
    }
  })
}

load()
