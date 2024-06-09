import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { getTitleFromBlocks } from './read-write';

function Title({ item: { path, blocks } }) {
	if (blocks) {
		return getTitleFromBlocks(blocks) || <em>{__('Untitled')}</em>;
	}

	const title = path?.replace(/(?:\.?[0-9]+)?\.html$/, '');
	return title ? decodeURIComponent(title) : <em>{__('Untitled')}</em>;
}

export default function SiderBar({ items, setItem, currentId, setCurrentId }) {
	const [view, setView] = useState({
		type: 'list',
		search: '',
		filters: [],
		page: 1,
		perPage: 5,
		sort: {
			field: 'path',
			direction: 'desc',
		},
		hiddenFields: [],
		layout: {},
	});

	return (
		<DataViews
			data={items}
			view={view}
			fields={[
				{
					id: 'path',
					// To do: remove hidden text from rows.
					header: ' ',
					enableHiding: false,
					render({ item }) {
						return <Title item={item} />;
					},
				},
			]}
			onChangeView={setView}
			paginationInfo={{
				totalItems: items.length,
				totalPages: 1,
			}}
			onSelectionChange={([item]) => {
				setCurrentId(item.id);
				setItem(currentId, { blocks: null });
			}}
			supportedLayouts={['list']}
		/>
	);
}
