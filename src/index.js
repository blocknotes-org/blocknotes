import { Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { get } from 'idb-keyval';
import { createRoot } from 'react-dom/client';
import { registerCoreBlocks } from '@wordpress/block-library';
import { registerFormatType } from '@wordpress/rich-text';
import tagFormat from './tag-format';

import app from './app';

import '@wordpress/format-library';

registerFormatType(tagFormat.name, tagFormat);

// It is needed for the appenders, this should be fixed in GB.
import '@wordpress/block-editor/build-style/content.css';

import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/components/build-style/style.css';
import './app.css';

export async function getSelectedFolderURL() {
	const directoryHandle = await get('directoryHandle');
	if (directoryHandle) {
		return directoryHandle;
	}
	const selectedFolderURL = await Preferences.get({
		key: 'selectedFolderURL',
	});
	if (selectedFolderURL?.value) {
		return selectedFolderURL.value;
	}

	try {
		const defaultDir = await Filesystem.getDefaultDirectory();

		if (defaultDir.url) {
			return defaultDir.url;
		}
	} catch (e) {
		// eslint-disable-next-line no-alert
		window.alert(e);
	}
}

async function load() {
	let canUseNativeFilesystem = true;
	try {
		await Filesystem.checkPermissions();
	} catch (e) {
		// eslint-disable-next-line no-alert
		canUseNativeFilesystem = false;
	}

	const selectedFolderURL = await getSelectedFolderURL();
	const root = createRoot(document.getElementById('app'));

	registerCoreBlocks();
	root.render(app({ selectedFolderURL, canUseNativeFilesystem }));
}

load();
