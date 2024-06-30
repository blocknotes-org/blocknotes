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
	capturePhoto,
} from '@wordpress/icons';
import { useResizeObserver } from '@wordpress/compose';
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
import { Camera, CameraResultType } from '@capacitor/camera';
import { Ocr } from '@capacitor-community/image-to-text';
import { createBlock, serialize } from '@wordpress/blocks';
import { Capacitor } from '@capacitor/core';

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

async function refresh({ selectedFolderURL, items, setItems, setItem }) {
	await getPaths('', selectedFolderURL)
		.then((_paths) => {
			const pathObjects = _paths.map((_file) => ({
				..._file,
				mtime: +_file.mtime,
				// Reuse the existing id if it exists.
				id:
					items.find((item) => item.path === _file.path)?.id ||
					uuidv4(),
				tags: [],
			}));
			setItems(pathObjects);
			pathObjects.forEach((item) => {
				Filesystem.readFile({
					path: item.path,
					directory: selectedFolderURL,
					encoding: Encoding.UTF8,
				}).then((__file) => {
					setItem(item.id, {
						text: __file.data,
						tags: getTagsFromText(__file.data),
					});
				});
			});
		})
		.catch((error) => {
			// eslint-disable-next-line no-alert
			window.alert(error);
		});
}

export default function Frame({ selectedFolderURL, setSelectedFolderURL }) {
	const [view, setView] = useState(INITIAL_VIEW);
	const [currentId, setCurrentId] = useState();
	const [items, setItems] = useState([]);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
	const currentRevisionRef = useRef();

	const setItem = useCallback((id, item) => {
		setItems((_items) =>
			_items.map((_item) =>
				_item.id === id ? { ..._item, ...item } : _item
			)
		);
	}, []);

	useEffect(() => {
		if (isSidebarOpen) {
			return;
		}

		let startTouchX = 0;

		document.addEventListener('touchstart', handleTouchStart);
		document.addEventListener('touchmove', handleTouchMove);

		function handleTouchStart(event) {
			startTouchX = event.touches[0].clientX;
		}

		function handleTouchMove(event) {
			if (event.touches.length > 1) {
				return;
			}

			const touchX = event.touches[0].clientX;
			const deltaX = touchX - startTouchX;

			if (deltaX > 50 && startTouchX < 20) {
				setIsSidebarOpen(true);
			}
		}

		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchmove', handleTouchMove);
		};
	}, [isSidebarOpen, setIsSidebarOpen]);

	useEffect(() => {
		setItems([]);
		setCurrentId();
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
				setCurrentId(currentPath.id);
				nonSelectedPaths.forEach((item) => {
					Filesystem.readFile({
						path: item.path,
						directory: selectedFolderURL,
						encoding: Encoding.UTF8,
					}).then((__file) => {
						setItem(item.id, {
							text: __file.data,
							tags: getTagsFromText(__file.data),
						});
					});
				});
			})
			.catch(() => {
				setSelectedFolderURL();
			});
	}, [selectedFolderURL, setSelectedFolderURL, setCurrentId, setItem]);

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
					setItem,
				}).then(() => {
					document.body.classList.remove('is-loading');
				});
			}
		}
		document.addEventListener('visibilitychange', change);
		return () => {
			document.removeEventListener('visibilitychange', change);
		};
	}, [currentRevisionRef, selectedFolderURL, setItem]);

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
															setCurrentId(
																nextItem.id
															);
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
					currentId={currentId}
					setCurrentId={setCurrentId}
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
								setItem,
							});
						}}
					/>
					<Button
						icon={file}
						label={__('Pick Different Folder')}
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
					/>
					<Button
						icon={cog}
						label={__('Settings')}
						onClick={() => {
							setIsModalOpen(true);
						}}
					/>
					{Capacitor.getPlatform() !== 'web' && (
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
								setCurrentId(newItem.id);
							}}
						/>
					)}
					{isModalOpen && (
						<Modal
							title={__('Settings')}
							onRequestClose={() => setIsModalOpen(false)}
						>
							<Button
								onClick={() => {
									setSelectedFolderURL();
								}}
								variant="secondary"
							>
								{__('Forget picked Folder')}
							</Button>
						</Modal>
					)}
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
											(_item) => _item.id !== currentId
										);
										if (!nextItems.length) {
											nextItems.push({
												id: uuidv4(),
												tags: [],
											});
										}
										setCurrentId(nextItems[0].id);
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
					onClick={() => {
						if (!isWide) {
							setIsSidebarOpen(false);
						}
					}}
					className={isSidebarOpen && !isWide ? 'has-overlay' : ''}
				>
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
