import { Filesystem, Encoding } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useRef } from 'react';
import { registerCoreBlocks } from '@wordpress/block-library';
import { useStateWithHistory } from '@wordpress/compose';
import {
	BlockEditorProvider,
	BlockCanvas,
	BlockToolbar,
} from '@wordpress/block-editor';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import {
	createBlock,
	getBlockContent,
	parse,
	serialize,
} from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import blockEditorContentStyleUrl from '@wordpress/block-editor/build-style/content.css?url';
import blockLibraryContentStyleUrl from '@wordpress/block-library/build-style/editor.css?url';
import componentsStyleUrl from '@wordpress/components/build-style/style.css?url';

function sanitizeFileName(name) {
	// Replace invalid characters with their percent-encoded equivalents
	return name.replace(
		/[\\/:*?"<>|]/g,
		(char) => '%' + char.charCodeAt(0).toString(16).toUpperCase()
	);
}

function useDelayedEffect(effect, deps, delay) {
	const hasMounted = useRef(false);
	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true;
			return;
		}
		const timeout = setTimeout(effect, delay);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
}

function Editor({
	blocks,
	currentPath,
	setCurrentPath,
	paths,
	setPaths,
	selectedFolderURL,
}) {
	let selection;

	if (!currentPath.path) {
		const [firstBlock] = blocks;
		const sel = {
			clientId: firstBlock.clientId,
			attributeKey: 'content',
			offset: 0,
		};
		selection = { selectionStart: sel, selectionEnd: sel };
	}

	const { value, setValue } = useStateWithHistory({ blocks, selection });
	useDelayedEffect(
		async () => {
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

			if (!currentPath.path) {
				currentPath.path = `${Date.now()}.html`;
			}

			const _blocks = flattenBlocks(value.blocks);
			const base = currentPath.path.split('/').slice(0, -1).join('/');
			let newPath;

			for (const block of _blocks) {
				const html = getBlockContent(block);
				const textContent = sanitizeFileName(
					html.replace(/<[^>]+>/g, '').trim()
				).slice(0, 50);
				if (textContent) {
					newPath = base
						? base + '/' + textContent + '.html'
						: textContent + '.html';
					break;
				}
			}

			// First write because it's more important than renaming.
			await Filesystem.writeFile({
				path: currentPath.path,
				directory: selectedFolderURL,
				data: serialize(value.blocks),
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
						newPath = newPath.replace(
							'.html',
							`.${Date.now()}.html`
						);
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
		},
		[value.blocks],
		1000
	);
	return (
		<BlockEditorProvider
			value={value.blocks}
			selection={value.selection}
			onInput={(_blocks, { selection: _sel }) => {
				setValue({ blocks: _blocks, selection: _sel }, true);
			}}
			onChange={(_blocks, { selection: _sel }) => {
				setValue({ blocks: _blocks, selection: _sel }, false);
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
										setCurrentPath(newPath);
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
											setCurrentPath(path);
											onClose();
										}}
										className={
											path === currentPath
												? 'is-active'
												: ''
										}
									>
										{decodeURIComponent(
											path.path?.replace(
												/(?:\.?[0-9]+)?\.html$/,
												''
											) || __('New note')
										)}
									</MenuItem>
								))}
							</MenuGroup>
							<MenuGroup>
								<MenuItem
									onClick={() => {
										window.pick();
										onClose();
									}}
								>
									{__('Pick Folder')}
								</MenuItem>
							</MenuGroup>
						</>
					)}
				</DropdownMenu>
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
	currentPath,
	setCurrentPath,
	paths,
	setPaths,
	selectedFolderURL,
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
		<Editor
			key={String(currentPath.path)}
			blocks={note}
			currentPath={currentPath}
			setCurrentPath={(path) => {
				if (path === currentPath) {
					return;
				}
				setCurrentPath(path);
				setNote();
			}}
			paths={paths}
			setPaths={setPaths}
			selectedFolderURL={selectedFolderURL}
		/>
	);
}

function App({ selectedFolderURL }) {
	const [paths, setPaths] = useState([]);
	const [currentPath, setCurrentPath] = useState();
	useEffect(() => {
		registerCoreBlocks();
		getPaths().then((_paths) => {
			const pathObjects = _paths.map((path) => ({ path }));
			setPaths(pathObjects);
			setCurrentPath(pathObjects[0] ?? {});
		});
	}, []);
	if (!currentPath) {
		return null;
	}
	return (
		<Note
			currentPath={currentPath}
			setCurrentPath={setCurrentPath}
			paths={paths}
			setPaths={setPaths}
			selectedFolderURL={selectedFolderURL}
		/>
	);
}

export default (props) => <App {...props} />;
