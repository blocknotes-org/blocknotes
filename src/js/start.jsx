import React from 'react';

import { Filesystem } from '@capacitor/filesystem';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Start({ setSelectedFolderURL }) {
	return (
		<main id="start">
			<h1>Welcome to Blocknotes!</h1>
			<p>Please pick a folder to read and write your notes.</p>
			<Button
				variant="primary"
				className="start-button"
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus
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
				{__('Pick Folder')}
			</Button>
			<p>
				Blocknotes works completely offline, and notes are stored in the
				folder you pick, so only you have complete control over your
				data.
			</p>
			<p>
				For the best experience, create a new cloud folder (such as
				iCloud), so you can also use Blocknotes to access the notes on
				your phone.
			</p>
		</main>
	);
}
