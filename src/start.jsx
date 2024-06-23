import React from 'react';

import { Filesystem } from '@capacitor/filesystem';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Start({
	setSelectedFolderURL,
	canUseNativeFilesystem,
}) {
	return (
		<main id="start">
			<h1>Welcome to Blocknotes!</h1>
			<p>
				Blocknotes works completely offline, and notes are stored in the
				folder you pick, so you have complete control over your data.
			</p>
			<ul>
				<li>
					There&apos;s a{' '}
					<a href="https://apps.apple.com/us/app/blocknotes/id6450189974">
						native iOS and macOS app available in the App Store.
					</a>
				</li>
				<li>
					You can also use the web version (button below), but it only
					works in Chrome and and Chromium browsers (such as Edge,
					Opera) right now, because it uses the native filesystem API.
					It does <em>not</em> work in Safari and Firefox, and neither
					does it work in <em>mobile</em> browsers, even Chrome.
				</li>
				<li>
					In Chrome, you can also install it as a PWA (Progressive Web
					App)!
				</li>
				<li>
					You can also{' '}
					<a href="https://github.com/blocknotes-org/blocknotes">
						build the app yourself
					</a>
					, and run it on a local webserver.
				</li>
			</ul>
			<p>Please pick a folder to read and write your notes.</p>
			<p>
				For the best experience, create a new cloud folder. If you use
				the iOS/macOS app, it will store notes in a “Blocknotes” folder
				within your iCloud folder.
			</p>
			<Button
				variant="primary"
				className="start-button"
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus
				disabled={!canUseNativeFilesystem}
				onClick={async () => {
					try {
						const { url } = await Filesystem.pickDirectory();
						setSelectedFolderURL(url);
					} catch (e) {
						// eslint-disable-next-line no-alert
						window.alert(e.message);
					}
				}}
			>
				{canUseNativeFilesystem
					? __('Pick Folder')
					: __('Not available in this browser')}
			</Button>
		</main>
	);
}
