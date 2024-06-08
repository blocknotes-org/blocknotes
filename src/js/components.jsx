/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Filesystem, Encoding } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { registerCoreBlocks } from '@wordpress/block-library';
import { useStateWithHistory } from '@wordpress/compose';
import {
	BlockEditorProvider,
	BlockCanvas,
	BlockToolbar,
} from '@wordpress/block-editor';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	ToolbarButton,
	ToolbarGroup,
	Button,
} from '@wordpress/components';
import {
	chevronDown,
	undo as undoIcon,
	redo as redoIcon,
} from '@wordpress/icons';
import {
	createBlock,
	getBlockContent,
	parse,
	serialize,
} from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { set } from 'idb-keyval';
import { Preferences } from '@capacitor/preferences';
import { v4 as uuidv4 } from 'uuid';

import blockEditorContentStyleUrl from '@wordpress/block-editor/build-style/content.css?url';
import blockLibraryContentStyleUrl from '@wordpress/block-library/build-style/editor.css?url';
import componentsStyleUrl from '@wordpress/components/build-style/style.css?url';

const uuidMap = new WeakMap();

function getUniqueId(object) {
	let uuid = uuidMap.get(object);
	if (!uuid) {
		uuid = uuidv4();
		uuidMap.set(object, uuid);
	}
	return uuid;
}

async function pick() {
	const { url } = await Filesystem.pickDirectory();
	return url;
}

function sanitizeFileName(name) {
	// Replace invalid characters with their percent-encoded equivalents
	return name.replace(
		/[\\/:*?"<>|]/g,
		(char) => '%' + char.charCodeAt(0).toString(16).toUpperCase()
	);
}

function useDebouncedCallback(callback, delay) {
	const callbackRef = useRef(callback);
	const timeoutRef = useRef(null);
	const lastArgsRef = useRef();

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	const debouncedCallback = useCallback(
		(...args) => {
			lastArgsRef.current = args;
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...lastArgsRef.current);
			}, delay);
		},
		[delay]
	);

	useEffect(
		() => () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
				callbackRef.current(...lastArgsRef.current);
			}
		},
		[]
	);

	return debouncedCallback;
}

function Title({ path }) {
	const title = path?.replace(/(?:\.?[0-9]+)?\.html$/, '');
	return title ? decodeURIComponent(title) : <em>{__('Untitled')}</em>;
}

function getTitleFromBlocks(blocks) {
	function flattenBlocks(_blocks) {
		return _blocks.reduce((acc, block) => {
			if (block.innerBlocks?.length) {
				acc.push(...flattenBlocks(block.innerBlocks));
				return acc;
			}
			acc.push(block);
			return acc;
		}, []);
	}

	blocks = flattenBlocks(blocks);

	for (const block of blocks) {
		const html = getBlockContent(block);
		const textContent = sanitizeFileName(
			html.replace(/<[^>]+>/g, '').trim()
		).slice(0, 50);
		if (textContent) {
			return textContent;
		}
	}
}

function useUpdateFile({ selectedFolderURL, currentPath }) {
	return useDebouncedCallback(async (note) => {
		if (!currentPath.path) {
			currentPath.path = `${Date.now()}.html`;
		}

		const base = currentPath.path.split('/').slice(0, -1).join('/');
		const title = getTitleFromBlocks(note);
		let newPath;
		if (title) {
			newPath = base ? base + '/' + title + '.html' : title + '.html';
		}

		// First write because it's more important than renaming.
		await Filesystem.writeFile({
			path: currentPath.path,
			directory: selectedFolderURL,
			data: serialize(note),
			encoding: Encoding.UTF8,
		});

		if (newPath && newPath !== currentPath.path) {
			// Check if the wanted file name already exists.
			try {
				const exists = await Filesystem.stat({
					path: newPath,
					directory: selectedFolderURL,
				});

				// If it does, add a timestamp to the file name.
				if (exists) {
					newPath = newPath.replace('.html', `.${Date.now()}.html`);
				}
			} catch (e) {}

			await Filesystem.rename({
				from: currentPath.path,
				to: newPath,
				directory: selectedFolderURL,
			});

			// Only after the rename is successful, silently update the current
			// path.
			currentPath.path = newPath;
		}
	}, 1000);
}

function Editor({ state, setNote, notesSelect }) {
	// To do: lift up and keep track of history for all notes.
	const { value, setValue, hasRedo, hasUndo, redo, undo } =
		useStateWithHistory(state);
	return (
		<BlockEditorProvider
			value={value.blocks}
			selection={value.selection}
			onInput={(blocks, { selection }) => {
				setValue({ blocks, selection }, true);
				setNote(blocks);
			}}
			onChange={(blocks, { selection }) => {
				setValue({ blocks, selection }, false);
				setNote(blocks);
			}}
			settings={{
				hasFixedToolbar: true,
				__unstableResolvedAssets: {
					styles: `
<link rel="stylesheet" href="${componentsStyleUrl}">
<link rel="stylesheet" href="${blockEditorContentStyleUrl}">
<link rel="stylesheet" href="${blockLibraryContentStyleUrl}">`,
				},
			}}
		>
			<div id="select" className="components-accessible-toolbar">
				{notesSelect}
				<ToolbarGroup className="components-toolbar-group">
					<ToolbarButton
						className="components-toolbar-button"
						icon={undoIcon}
						label={__('Undo')}
						onClick={() => undo()}
						disabled={!hasUndo}
					/>
					<ToolbarButton
						className="components-toolbar-button"
						icon={redoIcon}
						label={__('Redo')}
						onClick={() => redo()}
						disabled={!hasRedo}
					/>
				</ToolbarGroup>
				<BlockToolbar hideDragHandle />
			</div>
			<div
				id="editor"
				style={{
					position: 'relative',
					overflow: 'auto',
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
				}}
				onKeyDown={(event) => {
					if (
						(event.ctrlKey || event.metaKey) &&
						event.key === 'z' &&
						!event.shiftKey
					) {
						event.preventDefault();
						undo();
					} else if (
						(event.ctrlKey && event.key === 'y') ||
						(event.metaKey && event.shiftKey && event.key === 'z')
					) {
						event.preventDefault();
						redo();
					}
				}}
			>
				<BlockCanvas
					height="100%"
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
`,
						},
					]}
				/>
			</div>
		</BlockEditorProvider>
	);
}

function Note({
	note,
	setNote,
	paths,
	setPaths,
	currentPath,
	setCurrentPath,
	selectedFolderURL,
	setSelectedFolderURL,
}) {
	let selection;

	if (!currentPath.path) {
		const [firstBlock] = note;
		const sel = {
			clientId: firstBlock.clientId,
			attributeKey: 'content',
			offset: 0,
		};
		selection = { selectionStart: sel, selectionEnd: sel };
	}

	const updateFile = useUpdateFile({ selectedFolderURL, currentPath });
	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) {
			updateFile(note);
		} else {
			isMounted.current = true;
		}
	}, [updateFile, note]);

	function _setCurrentPath(path) {
		if (path === currentPath) {
			return;
		}
		setCurrentPath(path);
		setNote();
	}
	const notesSelect = (
		<DropdownMenu
			className="blocknotes-select"
			icon={chevronDown}
			label={__('Notes')}
			toggleProps={{
				children: __('Notes'),
			}}
		>
			{({ onClose }) => (
				<>
					<MenuGroup>
						<MenuItem
							onClick={() => {
								const newPath = {};
								setPaths([newPath, ...paths]);
								_setCurrentPath(newPath);
								onClose();
							}}
						>
							{__('New Note')}
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						{paths.map((path) => (
							<MenuItem
								key={path.path}
								onClick={() => {
									_setCurrentPath(path);
									onClose();
								}}
								className={
									path === currentPath ? 'is-active' : ''
								}
							>
								{path === currentPath ? (
									getTitleFromBlocks(note) || (
										<em>{__('Untitled')}</em>
									)
								) : (
									<Title path={path.path} />
								)}
							</MenuItem>
						))}
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							onClick={async () => {
								setSelectedFolderURL(await pick());
								onClose();
							}}
						>
							{__('Pick Folder')}
						</MenuItem>
						<MenuItem
							onClick={async () => {
								setSelectedFolderURL();
							}}
						>
							{__('Forget Folder')}
						</MenuItem>
					</MenuGroup>
				</>
			)}
		</DropdownMenu>
	);
	return (
		<Editor
			key={getUniqueId(currentPath)}
			state={{ blocks: note, selection }}
			setNote={setNote}
			currentPath={currentPath}
			selectedFolderURL={selectedFolderURL}
			notesSelect={notesSelect}
		/>
	);
}

function MaybeNote({
	currentPath,
	setCurrentPath,
	paths,
	setPaths,
	selectedFolderURL,
	setSelectedFolderURL,
}) {
	const [note, setNote] = useState();

	useEffect(() => {
		if (currentPath.path) {
			Filesystem.readFile({
				path: currentPath.path,
				directory: selectedFolderURL,
				encoding: Encoding.UTF8,
			}).then((file) => {
				setNote(parse(file.data));
			});
		} else {
			// Initialise with empty paragraph because we don't want merely clicking
			// on an empty note to save it.
			setNote([createBlock('core/paragraph')]);
		}
	}, [currentPath, selectedFolderURL]);
	if (!note) {
		return null;
	}
	return (
		<Note
			note={note}
			setNote={setNote}
			paths={paths}
			setPaths={setPaths}
			currentPath={currentPath}
			setCurrentPath={setCurrentPath}
			selectedFolderURL={selectedFolderURL}
			setSelectedFolderURL={setSelectedFolderURL}
		/>
	);
}

function App({ selectedFolderURL: initialSelectedFolderURL }) {
	const [paths, setPaths] = useState([]);
	const [currentPath, setCurrentPath] = useState();
	const [selectedFolderURL, setSelectedFolderURL] = useState(
		initialSelectedFolderURL
	);
	useEffect(() => {
		registerCoreBlocks();
	}, []);
	const isMounted = useRef(false);
	useEffect(() => {
		if (isMounted.current) {
			setCurrentPath();
			if (typeof url === 'string') {
				Preferences.set({
					key: 'selectedFolderURL',
					value: selectedFolderURL,
				});
			} else {
				Preferences.remove({ key: 'selectedFolderURL' });
				set('directoryHandle', selectedFolderURL);
			}
		} else {
			isMounted.current = true;
		}
	}, [selectedFolderURL]);
	useEffect(() => {
		getPaths('', selectedFolderURL)
			.then((_paths) => {
				const pathObjects = _paths.map((path) => ({ path }));
				if (!pathObjects.length) {
					pathObjects.push({});
				}
				setPaths(pathObjects);
				setCurrentPath(pathObjects[0]);
			})
			.catch(() => {
				setSelectedFolderURL();
			});
	}, [selectedFolderURL]);

	if (!selectedFolderURL) {
		return (
			<main id="start">
				<h1>Welcome to Blocknotes!</h1>
				<p>Please pick a folder to read and write your notes.</p>
				<Button
					variant="primary"
					className="start-button"
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					onClick={async () => {
						try {
							setSelectedFolderURL(await pick());
						} catch (e) {
							// eslint-disable-next-line no-alert
							window.alert(e.message);
						}
					}}
				>
					{__('Pick Folder')}
				</Button>
				<p>
					Blocknotes works completely offline, and notes are stored in
					the folder you pick, so only you have complete control over
					your data.
				</p>
				<p>
					For the best experience, create a new cloud folder (such as
					iCloud), so you can also use Blocknotes to access the notes
					on your phone.
				</p>
			</main>
		);
	}

	if (!currentPath) {
		return null;
	}
	return (
		<MaybeNote
			currentPath={currentPath}
			setCurrentPath={setCurrentPath}
			paths={paths}
			setPaths={setPaths}
			selectedFolderURL={selectedFolderURL}
			setSelectedFolderURL={setSelectedFolderURL}
		/>
	);
}

export default (props) => <App {...props} />;
