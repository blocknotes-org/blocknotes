import { Filesystem } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useCallback } from 'react';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';

import { Read, Write, getTitleFromBlocks } from './read-write.js';
import Editor from './editor.jsx';

function Title({ item: { path, blocks } }) {
	if (blocks) {
		return getTitleFromBlocks(blocks) || <em>{__('Untitled')}</em>;
	}

	const title = path?.replace(/(?:\.?[0-9]+)?\.html$/, '');
	return title ? decodeURIComponent(title) : <em>{__('Untitled')}</em>;
}

function getInitialSelection({ path, blocks }) {
	if (path) {
		return;
	}
	if (!blocks) {
		return;
	}
	const [firstBlock] = blocks;
	const sel = {
		clientId: firstBlock.clientId,
		attributeKey: 'content',
		offset: 0,
	};
	return { selectionStart: sel, selectionEnd: sel };
}

export default function Frame({ selectedFolderURL, setSelectedFolderURL }) {
	const [currentId, setCurrentId] = useState();
	const [items, setItems] = useState([]);

	const setItem = useCallback((id, item) => {
		setItems((_items) =>
			_items.map((_item) =>
				_item.id === id ? { ..._item, ...item } : _item
			)
		);
	}, []);

	useEffect(() => {
		setItems([]);
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
	}, [selectedFolderURL, setSelectedFolderURL, setCurrentId]);

	if (!currentId) {
		return null;
	}

	const currentItem = items.find(({ id }) => id === currentId);

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
										setItem(currentId, { blocks: null });
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
											setItem(currentId, {
												blocks: null,
											});
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
									onClick={() => {
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
				{currentItem.blocks && (
					<Editor
						// Remount the editor when the item changes.
						key={currentItem.id}
						initialState={{
							blocks: currentItem.blocks,
							selection: getInitialSelection(currentItem),
						}}
						setBlocks={(blocks) => {
							setItem(currentItem.id, { blocks });
						}}
					/>
				)}
			</div>
			{((ReadWrite) => (
				<ReadWrite
					item={currentItem}
					setItem={setItem}
					selectedFolderURL={selectedFolderURL}
				/>
			))(currentItem.blocks ? Write : Read)}
		</>
	);
}
