import React, { useState, useEffect, useRef } from 'react';
import { set } from 'idb-keyval';
import { Preferences } from '@capacitor/preferences';

import List from './list';
import Start from './start';
import { ErrorBoundary } from './error-boundary';

function App({ selectedFolderURL: initialSelectedFolderURL }) {
	const [selectedFolderURL, setSelectedFolderURL] = useState(
		initialSelectedFolderURL
	);
	const isMounted = useRef(false);
	useEffect(() => {
		if (isMounted.current) {
			if (typeof url === 'string') {
				Preferences.set({
					key: 'selectedFolderURL',
					value: selectedFolderURL,
				});
			} else {
				Preferences.remove({ key: 'selectedFolderURL' });
				set('directoryHandle', selectedFolderURL);
			}
		} else {
			isMounted.current = true;
		}
	}, [selectedFolderURL]);

	if (!selectedFolderURL) {
		return <Start setSelectedFolderURL={setSelectedFolderURL} />;
	}

	return (
		<List
			selectedFolderURL={selectedFolderURL}
			setSelectedFolderURL={setSelectedFolderURL}
		/>
	);
}

export default (props) => (
	<ErrorBoundary>
		<App {...props} />
	</ErrorBoundary>
);
