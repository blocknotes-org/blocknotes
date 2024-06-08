import { Filesystem, Encoding } from '@capacitor/filesystem';
import React, { useEffect, useRef, useCallback } from 'react';
import { getBlockContent, serialize } from '@wordpress/blocks';
import Editor from './editor';

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

function useUpdateFile({ selectedFolderURL, item }) {
	return useDebouncedCallback(async (note) => {
		if (!item.path) {
			item.path = `${Date.now()}.html`;
		}

		const base = item.path.split('/').slice(0, -1).join('/');
		const title = getTitleFromBlocks(note);
		let newPath;
		if (title) {
			newPath = base ? base + '/' + title + '.html' : title + '.html';
		}

		// First write because it's more important than renaming.
		await Filesystem.writeFile({
			path: item.path,
			directory: selectedFolderURL,
			data: serialize(note),
			encoding: Encoding.UTF8,
		});

		if (newPath && newPath !== item.path) {
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
				from: item.path,
				to: newPath,
				directory: selectedFolderURL,
			});

			// Only after the rename is successful, silently update the current
			// path.
			item.path = newPath;
		}
	}, 1000);
}

export default function EditorWithSave({
	state,
	setNote,
	selectedFolderURL,
	item,
}) {
	const updateFile = useUpdateFile({ selectedFolderURL, item });
	const isMounted = useRef(false);

	useEffect(() => {
		if (isMounted.current) {
			updateFile(state.blocks);
		} else {
			isMounted.current = true;
		}
	}, [updateFile, state.blocks]);

	return <Editor state={state} setNote={setNote} />;
}
