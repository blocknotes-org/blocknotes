import React, { useEffect, useState, useCallback } from 'react';
import { getPaths } from './get-data';
import { RangeControl } from '@wordpress/components';
import { Filesystem, Encoding } from '@capacitor/filesystem';

function ReadRev({ rev, setRevision, selectedFolderURL }) {
	useEffect(() => {
		if (rev.path) {
			Filesystem.readFile({
				path: rev.path,
				directory: selectedFolderURL,
				encoding: Encoding.UTF8,
			}).then((file) => {
				setRevision(rev.id, { text: file.data });
			});
		}
	}, [rev.path, rev.id, setRevision, selectedFolderURL]);
	return (
		<div className="revision-content">
			{rev.text && <div dangerouslySetInnerHTML={{ __html: rev.text }} />}
			{!rev.text && <p>Loading...</p>}
		</div>
	);
}

export function Revisions({ selectedFolderURL, item: currentItem }) {
	const [revisions, setRevisions] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(revisions.length - 1);

	// fetch all revisions for the current file
	useEffect(() => {
		getPaths(currentItem.path + '.revisions', selectedFolderURL).then(
			(revs) => {
				// Sort revisions by mtime
				revs = revs.sort((a, b) => b.mtime - a.mtime).reverse();
				setRevisions(revs);
				setSelectedIndex(revs.length - 1);
			}
		);
	}, [currentItem, selectedFolderURL]);

	const setRevision = useCallback((id, item) => {
		setRevisions((_items) =>
			_items.map((_item) =>
				_item.id === id ? { ..._item, ...item } : _item
			)
		);
	}, []);

	if (revisions.length < 2) {
		return <p>No revisions yet!</p>;
	}

	const selectedRevision = revisions[selectedIndex];
	return (
		<div>
			<RangeControl
				label="Pick a revision to view"
				withInputField={false}
				marks
				value={selectedIndex}
				max={revisions.length - 1}
				min={0}
				onChange={(value) => {
					setSelectedIndex(value);
				}}
				step={1}
				renderTooltipContent={(value) => {
					const rev = revisions[value];
					const time = rev.mtime
						? new Date(rev.mtime).toLocaleString(undefined, {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})
						: 'now';
					return time;
				}}
			/>
			<ReadRev
				rev={selectedRevision}
				setRevision={setRevision}
				selectedFolderURL={selectedFolderURL}
			/>
		</div>
	);
}
