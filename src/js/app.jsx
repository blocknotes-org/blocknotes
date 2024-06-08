import { Filesystem, Encoding } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useRef } from 'react';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { createBlock, parse } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { set } from 'idb-keyval';
import { Preferences } from '@capacitor/preferences';
import { v4 as uuidv4 } from 'uuid';

import Editor from './editor-with-save.jsx';
import Start from './start.jsx';

const uuidMap = new WeakMap();

function getUniqueId(object) {
	let uuid = uuidMap.get(object);
	if (!uuid) {
		uuid = uuidv4();
		uuidMap.set(object, uuid);
	}
	return uuid;
}

function Title({ path }) {
	const title = path?.replace(/(?:\.?[0-9]+)?\.html$/, '');
	return title ? decodeURIComponent(title) : <em>{__('Untitled')}</em>;
}

function Note({ currentPath, selectedFolderURL }) {
	const [note, setNote] = useState();
	const prevPath = useRef();

	if (prevPath.current !== currentPath) {
		prevPath.current = currentPath;
		setNote();
	}

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
	}, [currentPath, selectedFolderURL, setNote]);

	if (!note) {
		return null;
	}

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

	return (
		<Editor
			key={getUniqueId(currentPath)}
			state={{ blocks: note, selection }}
			setNote={setNote}
			currentPath={currentPath}
			selectedFolderURL={selectedFolderURL}
		/>
	);
}

function AppWithSelectedFolder({ selectedFolderURL, setSelectedFolderURL }) {
	const [currentPath, setCurrentPath] = useState();
	const [paths, setPaths] = useState([]);

	useEffect(() => {
		setCurrentPath();
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
	}, [selectedFolderURL, setSelectedFolderURL]);

	if (!currentPath) {
		return null;
	}

	return (
		<>
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
										<Title path={path.path} />
									</MenuItem>
								))}
							</MenuGroup>
							<MenuGroup>
								<MenuItem
									onClick={async () => {
										const { url } =
											await Filesystem.pickDirectory();
										setSelectedFolderURL(url);
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
				<Note
					currentPath={currentPath}
					selectedFolderURL={selectedFolderURL}
				/>
			</div>
		</>
	);
}

function App({ selectedFolderURL: initialSelectedFolderURL }) {
	const [selectedFolderURL, setSelectedFolderURL] = useState(
		initialSelectedFolderURL
	);
	const isMounted = useRef(false);
	useEffect(() => {
		if (isMounted.current) {
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

	if (!selectedFolderURL) {
		return <Start setSelectedFolderURL={setSelectedFolderURL} />;
	}

	return (
		<AppWithSelectedFolder
			selectedFolderURL={selectedFolderURL}
			setSelectedFolderURL={setSelectedFolderURL}
		/>
	);
}

export default (props) => <App {...props} />;
