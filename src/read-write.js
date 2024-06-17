import { Filesystem, Encoding } from '@capacitor/filesystem';
import { useEffect, useRef, useCallback } from 'react';
import {
	createBlock,
	parse,
	getBlockContent,
	serialize,
} from '@wordpress/blocks';
import { decodeEntities } from '@wordpress/html-entities';

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

export function getTitleFromBlocks(blocks, second) {
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
		const textContent = html
			.replace(/<[^>]+>/g, '')
			.trim()
			.slice(0, 50);
		if (textContent) {
			if (second) {
				second = false;
				continue;
			}
			return decodeEntities(textContent);
		}
	}
}

function useUpdateFile({ selectedFolderURL, item, setItem }) {
	return useDebouncedCallback(async (note) => {
		let path = item.path;
		if (!path) {
			path = `${Date.now()}.html`;
		}

		const base = path.split('/').slice(0, -1).join('/');
		const title = sanitizeFileName(getTitleFromBlocks(note));
		let newPath;
		if (title) {
			newPath = base ? base + '/' + title + '.html' : title + '.html';
		}

		const text = serialize(note);

		// First write because it's more important than renaming.
		await Filesystem.writeFile({
			path,
			directory: selectedFolderURL,
			data: text,
			encoding: Encoding.UTF8,
		});

		setItem(item.id, { path, text });

		if (newPath && newPath !== path) {
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
				from: path,
				to: newPath,
				directory: selectedFolderURL,
			});

			setItem(item.id, { path: newPath });
		}
	}, 1000);
}

export function Write({ selectedFolderURL, item, setItem }) {
	const updateFile = useUpdateFile({ selectedFolderURL, item, setItem });
	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) {
			updateFile(item.blocks);
		} else {
			isMounted.current = true;
		}
	}, [updateFile, item.blocks]);

	return null;
}

export function Read({ item, setItem, selectedFolderURL }) {
	const { path, id } = item;
	useEffect(() => {
		if (path) {
			Filesystem.readFile({
				path,
				directory: selectedFolderURL,
				encoding: Encoding.UTF8,
			}).then((file) => {
				setItem(id, { blocks: parse(file.data) });
			});
		} else {
			// Initialise with empty paragraph because we don't want merely clicking
			// on an empty note to save it.
			setItem(id, { blocks: [createBlock('core/paragraph')] });
		}
	}, [path, id, selectedFolderURL, setItem]);
	return null;
}
