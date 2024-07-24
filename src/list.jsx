import { Filesystem, Encoding } from '@capacitor/filesystem';
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
	Modal,
	Spinner,
} from '@wordpress/components';
import {
	addCard,
	archive,
	trash,
	tag,
	file,
	cog,
	update,
	backup,
	// capturePhoto,
} from '@wordpress/icons';
import { useResizeObserver, useRefEffect } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

import {
	Read,
	Write,
	saveFile,
	getTagsFromText,
	createRevisionName,
} from './read-write';
import Editor from './editor';
import Sidebar, { filterItems, INITIAL_VIEW } from './sidebar.jsx';
import { Revisions } from './revisions';
// import { Camera, CameraResultType } from '@capacitor/camera';
// import { Ocr } from '@capacitor-community/image-to-text';
// import { createBlock, serialize } from '@wordpress/blocks';
// import { Capacitor } from '@capacitor/core';

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

async function refresh({
	selectedFolderURL,
	items,
	setItems,
	setIsLoading,
	selection,
	setItem,
}) {
	setIsLoading(true);
	try {
		const _paths = await getPaths('', selectedFolderURL);
		const pathObjects = _paths.map((_file) => ({
			..._file,
			mtime: +_file.mtime,
			// Reuse the existing id if it exists.
			id: items.find((item) => item.path === _file.path)?.id || uuidv4(),
			tags: [],
		}));
		for (const id of selection) {
			const pathObject = pathObjects.find((item) => item.id === id);

			if (!pathObject) {
				continue;
			}

			const previousState = items.find(
				(item) => item.id === pathObject.id
			);

			// If loading previously failed, skip reading and don't block the
			// UI.
			if (!previousState || !previousState.blocks) {
				continue;
			}

			const __file = await Filesystem.readFile({
				path: pathObject.path,
				directory: selectedFolderURL,
				encoding: Encoding.UTF8,
			});
			pathObject.text = __file.data;
			pathObject.tags = getTagsFromText(__file.data);

			if (pathObject.text === previousState.text) {
				pathObject.blocks = previousState.blocks;
			}
		}
		const unsaved = items.filter((item) => !item.path);
		setItems([...unsaved, ...pathObjects]);
		queueMicrotask(async () => {
			const nonSelectedPaths = pathObjects.filter(
				(obj) => !selection.includes(obj.id)
			);
			const updates = new Map();
			for (const item of nonSelectedPaths) {
				const __file = await Filesystem.readFile({
					path: item.path,
					directory: selectedFolderURL,
					encoding: Encoding.UTF8,
				});
				updates.set(item.id, {
					text: __file.data,
					tags: getTagsFromText(__file.data),
				});
			}

			for (const [id, _update] of updates) {
				setItem(id, _update);
			}
		});
	} finally {
		setIsLoading(false);
	}
}

const EMPTY_SELECTION = [];
const EMPTY_ITEMS = [];

export default function Frame({ selectedFolderURL, setSelectedFolderURL }) {
	const [view, setView] = useState(INITIAL_VIEW);
	const [selection, setSelection] = useState(EMPTY_SELECTION);
	const [items, setItems] = useState(EMPTY_ITEMS);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const currentRevisionRef = useRef();

	useEffect(() => {
		if (isLoading) {
			document.body.classList.add('is-loading');
		} else {
			document.body.classList.remove('is-loading');
		}
	}, [isLoading]);

	const setItem = useCallback((id, item) => {
		setItems((_items) =>
			_items.map((_item) =>
				_item.id === id ? { ..._item, ...item } : _item
			)
		);
	}, []);

	const backSwiperRef = useRefEffect(
		(element) => {
			element.addEventListener('touchstart', start);
			element.addEventListener('mousedown', start);

			let startTime = 0;
			let startX = 0;
			let newX = 0;

			function start(event) {
				startTime = Date.now();
				startX = event.touches
					? event.touches[0].clientX
					: event.clientX;
				move(event);
				element.ownerDocument.addEventListener('touchmove', move);
				element.ownerDocument.addEventListener('mousemove', move);
				element.ownerDocument.addEventListener('touchend', end);
				element.ownerDocument.addEventListener('mouseup', end);
			}

			function move(event) {
				if (event.touches && event.touches.length > 1) {
					setIsSidebarOpen(false);
					return;
				}

				event.preventDefault();
				newX = event.touches ? event.touches[0].clientX : event.clientX;
				setIsSidebarOpen(newX);
			}

			function end(event) {
				event.preventDefault();
				// Less than 300ms is considered a click.
				if (Date.now() - startTime < 300) {
					setIsSidebarOpen(() => startX < 300 && newX - startX > 20);
				} else {
					setIsSidebarOpen((value) => value > 150);
				}
				element.ownerDocument.removeEventListener('touchmove', move);
				element.ownerDocument.removeEventListener('mousemove', move);
				element.ownerDocument.removeEventListener('touchend', end);
				element.ownerDocument.removeEventListener('mouseup', end);
			}

			return () => {
				element.removeEventListener('touchstart', start);
				element.removeEventListener('mousedown', start);
				element.ownerDocument.removeEventListener('touchmove', move);
				element.ownerDocument.removeEventListener('mousemove', move);
				element.ownerDocument.removeEventListener('touchend', end);
				element.ownerDocument.removeEventListener('mouseup', end);
			};
		},
		[setIsSidebarOpen]
	);

	useEffect(() => {
		setItems(EMPTY_ITEMS);
		setSelection(EMPTY_SELECTION);
		getPaths('', selectedFolderURL)
			.then((_paths) => {
				const pathObjects = _paths.map((_file) => ({
					..._file,
					mtime: +_file.mtime,
					id: uuidv4(),
					tags: [],
				}));
				if (!pathObjects.length) {
					pathObjects.push({ id: uuidv4(), tags: [] });
				}
				const filtered = filterItems(pathObjects, INITIAL_VIEW);
				setItems(filtered);
				const nonSelectedPaths = [...filtered];
				const currentPath = nonSelectedPaths.shift();
				setSelection([currentPath.id]);
				const updates = new Map();
				queueMicrotask(async () => {
					for (const item of nonSelectedPaths) {
						const __file = await Filesystem.readFile({
							path: item.path,
							directory: selectedFolderURL,
							encoding: Encoding.UTF8,
						});
						updates.set(item.id, {
							text: __file.data,
							tags: getTagsFromText(__file.data),
						});
					}

					for (const [id, _update] of updates) {
						setItem(id, _update);
					}
				});
			})
			.catch(() => {
				setSelectedFolderURL();
			});
	}, [selectedFolderURL, setSelectedFolderURL, setSelection, setItem]);

	const [observer, { width }] = useResizeObserver();

	const itemsRef = useRef(items);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	useEffect(() => {
		function change() {
			if (document.visibilityState === 'visible') {
				currentRevisionRef.current = createRevisionName();
				document.body.classList.add('is-loading');
				refresh({
					selectedFolderURL,
					items: itemsRef.current,
					setItems,
					setIsLoading,
					selection,
					setItem,
				});
			}
		}
		document.addEventListener('visibilitychange', change);
		return () => {
			document.removeEventListener('visibilitychange', change);
		};
	}, [currentRevisionRef, selectedFolderURL, setItem, selection]);

	if (!selection.length) {
		return null;
	}

	const isWide = width > 900;
	const currentItem = items.find(({ id }) => id === selection[0]);
	const animation =
		typeof isSidebarOpen === 'boolean'
			? {
					x: isSidebarOpen ? 300 : -1,
					width:
						isSidebarOpen && isWide ? 'calc(100% - 300px)' : '100%',
				}
			: {
					x: Math.min(isSidebarOpen, 300),
					width:
						isSidebarOpen && isWide
							? `calc(100% - ${Math.min(isSidebarOpen, 300)}px)`
							: '100%',
				};
	const duration = typeof isSidebarOpen === 'boolean' ? 0.1 : 0;

	const allTags = items.reduce((acc, item) => {
		item.tags.forEach((_tag) => {
			acc.add(_tag);
		});
		return acc;
	}, new Set());

	const frame = (
		<>
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
														// Change current note
														const nextItem =
															items.find((item) =>
																item.tags.includes(
																	_tag
																)
															);
														if (nextItem) {
															setSelection([
																nextItem.id,
															]);
														}
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
					selection={selection}
					setSelection={setSelection}
					setIsSidebarOpen={setIsSidebarOpen}
					isWide={isWide}
				/>
				<div id="sidebar-bottom">
					<Button
						icon={update}
						label="Refresh"
						onClick={() => {
							refresh({
								selectedFolderURL,
								items: itemsRef.current,
								setItems,
								setIsLoading,
								selection,
								setItem,
							});
						}}
					/>

					<Button
						icon={cog}
						label={__('Settings')}
						onClick={() => {
							setIsModalOpen(true);
						}}
					/>
					{/* {Capacitor.getPlatform() !== 'web' && (
						<Button
							icon={capturePhoto}
							label={__('Scan Document')}
							onClick={async () => {
								const photo = await Camera.getPhoto({
									resultType: CameraResultType.Uri,
								});
								const data = await Ocr.detectText({
									filename: photo.path,
								});

								if (!data.textDetections.length) {
									return;
								}

								const blocks = [];

								for (const detection of data.textDetections) {
									const block = createBlock(
										'core/paragraph',
										{
											content: detection.text,
										}
									);
									blocks.push(block);
								}

								const text = serialize(blocks);
								const newItem = {
									id: uuidv4(),
									tags: getTagsFromText(text),
									blocks,
									text,
								};

								setItems([newItem, ...items]);
								setSelection([newItem.id]);
							}}
						/>
					)} */}
					{isModalOpen && (
						<Modal
							title={__('Advanced Settings')}
							onRequestClose={() => setIsModalOpen(false)}
						>
							<p>
								{__(
									'Use this to change the folder Blocknotes reads from. It could be a subfolder of your main folder. Note that with the iOS app, you can only pick the Blocknotes folder or a folder within.'
								)}
							</p>
							<Button
								variant="secondary"
								icon={file}
								onClick={async () => {
									try {
										const { url } =
											await Filesystem.pickDirectory();
										setSelectedFolderURL(url);
									} catch (e) {
										// eslint-disable-next-line no-alert
										window.alert(e.message);
									}

									setIsModalOpen(false);
								}}
							>
								{__('Pick Different Folder')}
							</Button>
						</Modal>
					)}
				</div>
			</div>
			<motion.div
				id="content"
				initial={animation}
				animate={animation}
				transition={{ ease: 'anticipate', duration }}
			>
				<div
					id="select"
					className="select-toolbar components-accessible-toolbar"
				>
					<ToolbarGroup className="components-toolbar-group">
						<ToolbarButton
							icon={archive}
							label={__('Notes')}
							isActive={
								isSidebarOpen === true || isSidebarOpen > 150
							}
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
								setSelection([newItem.id]);
								if (!isWide) {
									setIsSidebarOpen(false);
								}
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
										itemRef: {
											current: currentItem,
										},
										setItem,
										currentRevisionRef,
										trash: true,
									}).then(() => {
										const nextItems = items.filter(
											(_item) => _item.id !== selection[0]
										);
										if (!nextItems.length) {
											nextItems.push({
												id: uuidv4(),
												tags: [],
											});
										}
										setSelection([nextItems[0].id]);
										setItems(nextItems);
										setIsSidebarOpen(true);
									});
								}
							}}
						/>
						<ToolbarButton
							icon={backup}
							label={__('Revisions')}
							onClick={() => {
								setIsRevisionModalOpen(true);
							}}
						/>
						{isRevisionModalOpen && (
							<Modal
								title={__('Revisions')}
								onRequestClose={() =>
									setIsRevisionModalOpen(false)
								}
							>
								<Revisions
									item={currentItem}
									selectedFolderURL={selectedFolderURL}
								/>
							</Modal>
						)}
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
					// className={hasOverlay ? 'has-overlay' : ''}
				>
					{(isSidebarOpen !== true || !isWide) && (
						<div
							ref={backSwiperRef}
							className={
								'back-swiper' +
								(isSidebarOpen !== false ? ' is-open' : '')
							}
						></div>
					)}
					{currentItem && currentItem.blocks && (
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
					{currentItem && !currentItem.blocks && <Spinner />}
				</div>
				{currentItem &&
					((ReadWrite) => (
						<ReadWrite
							key={currentItem.id}
							item={currentItem}
							setItem={setItem}
							selectedFolderURL={selectedFolderURL}
							currentRevisionRef={currentRevisionRef}
						/>
					))(currentItem.blocks ? Write : Read)}
			</motion.div>
		</>
	);

	return (
		<div style={{ height: '100%' }}>
			{observer}
			{width && frame}
		</div>
	);
}
