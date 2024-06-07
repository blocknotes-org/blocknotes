import { Filesystem } from '@capacitor/filesystem';
import { App as NativeApp } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { set, get } from 'idb-keyval';
import { createRoot } from 'react-dom/client';

import app from './components';

import '@wordpress/format-library';

// It is needed for the appenders, this should be fixed in GB.
import '@wordpress/block-editor/build-style/content.css';

import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';
import '@wordpress/components/build-style/style.css';

let __handle;

export async function getSelectedFolderURL() {
	if (__handle) {
		return __handle;
	}
	const directoryHandle = await get('directoryHandle');
	if (directoryHandle) {
		return directoryHandle;
	}
	const selectedFolderURL = await Preferences.get({
		key: 'selectedFolderURL',
	});
	return selectedFolderURL?.value;
}

window.pick = async function pick() {
	const { url } = await Filesystem.pickDirectory();
	__handle = url;
	if (typeof url === 'string') {
		await Preferences.set({ key: 'selectedFolderURL', value: url });
	} else {
		await Preferences.remove({ key: 'selectedFolderURL' });
		await set('directoryHandle', url);
	}
	load();
};

async function load() {
	try {
		await Filesystem.checkPermissions();
	} catch (e) {
		// eslint-disable-next-line no-alert
		window.alert(e.message);
		return;
	}

	let selectedFolderURL = await getSelectedFolderURL();

	if (selectedFolderURL) {
		try {
			await Filesystem.readdir({
				directory: selectedFolderURL,
				path: '',
			});
		} catch (e) {
			// eslint-disable-next-line no-alert
			window.alert(e.message + ` [${selectedFolderURL}]`);
			selectedFolderURL = null;
		}
	}

	if (!selectedFolderURL) {
		document.body.classList.remove('loading');
		const button = document.createElement('button');
		button.textContent = 'Pick Folder';
		button.addEventListener('click', async () => {
			try {
				await window.pick();
			} catch (e) {
				// eslint-disable-next-line no-alert
				window.alert(e.message);
				return;
			}

			button.remove();
		});
		button.style =
			'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);';
		document.body.appendChild(button);
		button.focus();
		return;
	}

	const root = createRoot(document.getElementById('app'));
	root.render(app({ selectedFolderURL }));

	NativeApp.addListener('appStateChange', ({ isActive }) => {
		if (!isActive) {
			// save
		}
	});
}

load();
