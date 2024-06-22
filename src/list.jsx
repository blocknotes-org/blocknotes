import { Filesystem } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ToolbarButton, ToolbarGroup, Button } from '@wordpress/components';
import { addCard, archive, trash } from '@wordpress/icons';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

import { Read, Write, saveFile } from './read-write';
import Editor from './editor';
import Sidebar, { filterItems, INITIAL_VIEW } from './sidebar.jsx';

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
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const currentRevisionRef = useRef();

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
				const pathObjects = _paths.map((file) => ({
					...file,
					mtime: +file.mtime,
					id: uuidv4(),
				}));
				if (!pathObjects.length) {
					pathObjects.push({ id: uuidv4() });
				}
				filterItems(pathObjects, INITIAL_VIEW);
				setItems(pathObjects);
				setCurrentId(pathObjects[0].id);
			})
			.catch(() => {
				setSelectedFolderURL();
			});
	}, [selectedFolderURL, setSelectedFolderURL, setCurrentId]);

	const [observer, { width }] = useResizeObserver();

	if (!currentId) {
		return null;
	}

	const isWide = width > 900;
	const currentItem = items.find(({ id }) => id === currentId);
	const animation = {
		x: isSidebarOpen ? 300 : -1,
		width: isSidebarOpen && isWide ? 'calc(100% - 300px)' : '100%',
	};

	return (
		<div style={{ height: '100%' }}>
			{observer}
			<div id="sidebar">
				<Sidebar
					items={items}
					setItem={setItem}
					currentId={currentId}
					setCurrentId={setCurrentId}
					setIsSidebarOpen={setIsSidebarOpen}
					isWide={isWide}
				/>
				<div id="sidebar-bottom">
					<Button
						onClick={async () => {
							const { url } = await Filesystem.pickDirectory();
							setSelectedFolderURL(url);
						}}
					>
						{__('Pick Folder')}
					</Button>
					<Button
						onClick={() => {
							setSelectedFolderURL();
						}}
					>
						{__('Forget Folder')}
					</Button>
				</div>
			</div>
			<motion.div
				id="content"
				initial={animation}
				animate={animation}
				transition={{ ease: 'anticipate', duration: 0.2 }}
				style={{ borderLeft: '1px solid #e0e0e0' }}
			>
				<div id="select" className="components-accessible-toolbar">
					<ToolbarGroup className="components-toolbar-group">
						<ToolbarButton
							icon={archive}
							label={__('Notes')}
							isActive={isSidebarOpen}
							onClick={() => {
								setIsSidebarOpen(!isSidebarOpen);
							}}
						/>
					</ToolbarGroup>
					<ToolbarGroup className="components-toolbar-group">
						<ToolbarButton
							icon={addCard}
							label={__('New Note')}
							onClick={() => {
								const newItem = { id: uuidv4() };
								setItems([newItem, ...items]);
								setCurrentId(newItem.id);
								setItem(currentId, { blocks: null });
							}}
						/>
					</ToolbarGroup>
					<div id="block-toolbar"></div>
					<ToolbarGroup
						id="select-right"
						className="components-toolbar-group"
					>
						<ToolbarButton
							icon={trash}
							label={__('Trash')}
							onClick={() => {
								if (
									// eslint-disable-next-line no-alert
									window.confirm(
										__(
											'Are you sure you want to delete this note?'
										)
									)
								) {
									saveFile({
										selectedFolderURL,
										item: currentItem,
										setItem,
										currentRevisionRef,
										trash: true,
									});
									setItems((_items) => {
										const nextItems = _items.filter(
											(_item) => _item.id !== currentId
										);
										if (!nextItems.length) {
											nextItems.push({ id: uuidv4() });
										}
										setCurrentId(nextItems[0].id);
										return nextItems;
									});
								}
							}}
						/>
					</ToolbarGroup>
				</div>
				{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
					onClick={() => {
						if (!isWide) {
							setIsSidebarOpen(false);
						}
					}}
					className={isSidebarOpen && !isWide ? 'has-overlay' : ''}
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
						currentRevisionRef={currentRevisionRef}
					/>
				))(currentItem.blocks ? Write : Read)}
			</motion.div>
		</div>
	);
}
