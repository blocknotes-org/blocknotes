import { Filesystem } from '@capacitor/filesystem';
import { getPaths } from './get-data.js';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	ToolbarButton,
	ToolbarGroup,
	Button,
	DropdownMenu,
	MenuItem,
	MenuGroup,
	SearchControl,
} from '@wordpress/components';
import { addCard, archive, trash, tag } from '@wordpress/icons';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

import { Read, Write, saveFile, getTagsFromText } from './read-write';
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
	const [view, setView] = useState(INITIAL_VIEW);
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
					tags: getTagsFromText(file.text),
				}));
				if (!pathObjects.length) {
					pathObjects.push({ id: uuidv4(), tags: [] });
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

	const allTags = items.reduce((acc, item) => {
		item.tags.forEach((_tag) => {
			acc.add(_tag);
		});
		return acc;
	}, new Set());

	return (
		<div style={{ height: '100%' }}>
			{observer}
			<div id="sidebar">
				<div className="select-toolbar dataviews-filters__view-actions">
					<ToolbarGroup className="components-toolbar-group">
						<DropdownMenu
							className="blocknotes-select"
							icon={tag}
							label={__('Tags')}
							toggleProps={{
								// current tag
								children: view.filters.length
									? view.filters[0].value[0]
									: __('All'),
							}}
						>
							{({ onClose }) => (
								<>
									<MenuGroup>
										<MenuItem
											className={
												!view.filters.length
													? 'is-active'
													: ''
											}
											onClick={() => {
												setView((v) => ({
													...v,
													filters: [],
												}));
												onClose();
											}}
										>
											{__('All')}
										</MenuItem>
									</MenuGroup>
									<MenuGroup>
										{Array.from(allTags).map(
											(_tag, index) => (
												<MenuItem
													key={index}
													className={
														view.filters.some(
															(filter) =>
																filter.value.includes(
																	_tag
																)
														)
															? 'is-active'
															: ''
													}
													onClick={() => {
														setView((v) => ({
															...v,
															filters: [
																{
																	field: 'tags',
																	value: [
																		_tag,
																	],
																},
															],
														}));
														onClose();
													}}
												>
													{_tag}
												</MenuItem>
											)
										)}
										{allTags.size === 0 && (
											<MenuItem disabled>
												{__(
													'Write #tags in your notes'
												)}
											</MenuItem>
										)}
									</MenuGroup>
								</>
							)}
						</DropdownMenu>
					</ToolbarGroup>
					<div style={{ padding: '7px' }}>
						<SearchControl
							__nextHasNoMarginBottom
							size="compact"
							value={view.search}
							onChange={(search) => {
								setView((v) => ({ ...v, search }));
							}}
							placeholder={__('Search')}
						/>
					</div>
				</div>
				<Sidebar
					view={view}
					setView={setView}
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
							try {
								const { url } =
									await Filesystem.pickDirectory();
								setSelectedFolderURL(url);
							} catch (e) {
								// eslint-disable-next-line no-alert
								window.alert(e.message);
							}
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
				<div
					id="select"
					className="select-toolbar components-accessible-toolbar"
				>
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
								const newItem = { id: uuidv4(), tags: [] };
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
											nextItems.push({
												id: uuidv4(),
												tags: [],
											});
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
