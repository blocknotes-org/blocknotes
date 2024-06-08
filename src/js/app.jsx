import { Filesystem, Encoding } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { createBlock, parse } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { set } from 'idb-keyval';
import { Preferences } from '@capacitor/preferences';
import { v4 as uuidv4 } from 'uuid';

import EditorWithSave, { getTitleFromBlocks } from './editor-with-save.jsx';
import Start from './start.jsx';

function Title({ item: { path, blocks } }) {
	if (blocks) {
		return getTitleFromBlocks(blocks) || <em>{__('Untitled')}</em>;
	}

	const title = path?.replace(/(?:\.?[0-9]+)?\.html$/, '');
	return title ? decodeURIComponent(title) : <em>{__('Untitled')}</em>;
}

function Note({ item, setItem, selectedFolderURL }) {
	const { path, id } = item;
	const pathRef = useRef(path);

	useEffect(() => {
		pathRef.current = path;
	}, [path]);

	useEffect(() => {
		if (pathRef.current) {
			Filesystem.readFile({
				path: pathRef.current,
				directory: selectedFolderURL,
				encoding: Encoding.UTF8,
			}).then((file) => {
				setItem({ blocks: parse(file.data) });
			});
		} else {
			// Initialise with empty paragraph because we don't want merely clicking
			// on an empty note to save it.
			setItem({ blocks: [createBlock('core/paragraph')] });
		}
	}, [id, selectedFolderURL, setItem]);

	if (!item.blocks) {
		return null;
	}

	let selection;

	if (!path) {
		const [firstBlock] = item.blocks;
		const sel = {
			clientId: firstBlock.clientId,
			attributeKey: 'content',
			offset: 0,
		};
		selection = { selectionStart: sel, selectionEnd: sel };
	}

	return (
		<EditorWithSave
			key={id}
			state={{ blocks: item.blocks, selection }}
			setNote={(blocks) => {
				setItem({ blocks });
			}}
			item={item}
			selectedFolderURL={selectedFolderURL}
		/>
	);
}

function AppWithSelectedFolder({ selectedFolderURL, setSelectedFolderURL }) {
	const [currentId, setCurrentId] = useState();
	const [items, setItems] = useState([]);

	useEffect(() => {
		setCurrentId();
		getPaths('', selectedFolderURL)
			.then((_paths) => {
				const pathObjects = _paths.map((path) => ({
					path,
					id: uuidv4(),
				}));
				if (!pathObjects.length) {
					pathObjects.push({ id: uuidv4() });
				}
				setItems(pathObjects);
				setCurrentId(pathObjects[0].id);
			})
			.catch(() => {
				setSelectedFolderURL();
			});
	}, [selectedFolderURL, setSelectedFolderURL]);

	const setItem = useCallback(
		(item) => {
			setItems((prevItems) =>
				prevItems.map((_item) =>
					_item.id === currentId ? { ..._item, ...item } : _item
				)
			);
		},
		[currentId]
	);

	if (!currentId) {
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
										const newItem = { id: uuidv4() };
										setItems([newItem, ...items]);
										setCurrentId(newItem.id);
										onClose();
									}}
								>
									{__('New Note')}
								</MenuItem>
							</MenuGroup>
							<MenuGroup>
								{items.map((item) => (
									<MenuItem
										key={item.id}
										onClick={() => {
											setCurrentId(item.id);
											onClose();
										}}
										className={
											item.id === currentId
												? 'is-active'
												: ''
										}
									>
										<Title item={item} />
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
					item={items.find(({ id }) => id === currentId)}
					setItem={setItem}
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
