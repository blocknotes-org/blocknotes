import React from 'react';

import { Filesystem } from '@capacitor/filesystem';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const info = `
<!-- wp:paragraph -->
<p>Notes are stored as simple files, so you own your data. Blocknotes never connects to the internet, so it’s completely offline and private. Files are stored natively, so you can use another service to sync them across devices (such as iCloud). It’s <a href="https://github.com/blocknotes-org/blocknotes">open source</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>On iPhone, there’s a a <a href="https://apps.apple.com/us/app/blocknotes/id6450189974">native iOS app available</a>. Unfortunately no Android support yet.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>On Desktop you have four options:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Install the <a href="https://apps.apple.com/us/app/blocknotes/id6450189974">native app (MacOS only)</a>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Click “Pick Folder” on <a href="https://blocknotes.org">blocknotes.org</a> in Chrome, Edge, or any other Chromium based browser. Check <a href="https://caniuse.com/native-filesystem-api">browser support for the File System Access API</a>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>In Chrome, you can also <a href="https://support.google.com/chrome/answer/9658361">install</a> the app through <a href="https://blocknotes.org">blocknotes.org</a> as a PWA (Progressive Web App).</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>If you feel adventurous, you could <a href="https://github.com/blocknotes-org/blocknotes">build the app yourself</a>, and run it on a local web server.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Features:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Tags, filtering, and search</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Revisions</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Dark mode</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Rich text editing</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Task lists</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Coming soon:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list"><!-- wp:list-item -->
<li>Local images</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Internal linking</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Document scanning</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Pinned notes</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>List of trashed items</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Restore revisions from the UI</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Different representations of the notes list</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Plugins</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
`;

export default function Start({
	setSelectedFolderURL,
	canUseNativeFilesystem,
}) {
	return (
		<div style={{ overflow: 'auto', height: '100%' }}>
			<main id="start">
				<h1>{__('Blocknotes')}</h1>
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
				<div dangerouslySetInnerHTML={{ __html: info }} />
			</main>
		</div>
	);
}
