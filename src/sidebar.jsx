import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import React, { useEffect } from 'react';
import { getTitleFromBlocks, stripTags } from './read-write';

function stripHTML(html) {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
}

function getTitleFromText({ text, blocks, path }, second) {
	if (blocks) {
		return getTitleFromBlocks(blocks, second);
	}
	if (!text) {
		return second ? '' : decodeURIComponent(path?.split('/').pop());
	}
	let start = 0;
	while (start < text.length) {
		// Find the next newline character
		let end = text.indexOf('\n', start);
		if (end === -1) {
			end = text.length; // Handle the case where there is no newline at the end
		}

		// Extract the current line
		const currentLine = text.substring(start, end);

		// Move the start index to the next character after the newline
		start = end + 1;

		// Strip HTML and trim the line
		const strippedLine = stripHTML(stripTags(currentLine)).trim();

		// Check if the line has meaningful content
		if (strippedLine) {
			if (second) {
				second = false;
				continue;
			}
			return strippedLine;
		}
	}

	return '';
}

export const INITIAL_VIEW = {
	type: 'list',
	search: '',
	filters: [],
	sort: {
		field: 'mtime',
		direction: 'desc',
	},
	hiddenFields: [],
	layout: {},
};

export function filterItems(items, view) {
	let filteredItems = items;

	if (view.search) {
		filteredItems = filteredItems.filter(({ text }) =>
			text.toLowerCase().includes(view.search.toLowerCase())
		);
	}

	if (view.sort) {
		filteredItems = filteredItems.sort((a, b) => {
			const aValue = a[view.sort.field];
			const bValue = b[view.sort.field];
			if (aValue < bValue) {
				return view.sort.direction === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return view.sort.direction === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}

	for (const filter of view.filters) {
		if (!filter.value?.length) {
			continue;
		}
		filteredItems = filteredItems.filter((item) => {
			return item[filter.field].some((tag) => filter.value.includes(tag));
		});
	}

	return filteredItems;
}

export default function SiderBar({
	view,
	setView,
	items,
	currentId,
	setCurrentId,
	setIsSidebarOpen,
	isWide,
}) {
	const allTags = items.reduce((acc, item) => {
		item.tags.forEach((tag) => {
			acc.add(tag);
		});
		return acc;
	}, new Set());

	const filteredItems = filterItems(items, view);

	// Temporary hack until we can control selection in data views.
	useEffect(() => {
		const button = document.getElementById('view-list-0-' + currentId);

		if (button?.getAttribute('aria-pressed') === 'false') {
			const { activeElement } = document;
			button.click();
			activeElement.focus();
		}
	}, [currentId]);

	return (
		<DataViews
			data={filteredItems}
			view={view}
			fields={[
				{
					id: 'path',
					// To do: remove hidden text from rows.
					header: 'First line',
					enableHiding: false,
					render({ item }) {
						return (
							<span className="note-title">
								{getTitleFromText(item) || (
									<em>{__('Untitled')}</em>
								)}
							</span>
						);
					},
				},
				{
					id: 'second-line',
					// To do: remove hidden text from rows.
					header: 'Second line',
					enableSorting: false,
					render({ item }) {
						return (
							<span style={{ opacity: 0.6 }}>
								{getTitleFromText(item, true)}
								{item.path?.endsWith('.icloud') && (
									<em>{__('Offloaded')}</em>
								)}
							</span>
						);
					},
				},
				{
					id: 'tags',
					header: 'Tags',
					enableSorting: false,
					render({ item }) {
						return item.tags
							.filter(
								(tag) => !view.filters[0]?.value.includes(tag)
							)
							.map((tag) => {
								return (
									<span key={tag} className="notes-tag">
										{tag}
									</span>
								);
							});
					},
					elements: Array.from(allTags).map((tag) => ({
						id: tag,
						label: tag,
						value: tag,
					})),
					filterBy: {
						operators: ['isAny'],
					},
				},
				{
					id: 'mtime',
					header: 'Modified',
					render({ item }) {
						const time = item.mtime
							? new Date(item.mtime).toLocaleString(undefined, {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
								})
							: 'now';
						return (
							<small style={{ opacity: 0.6 }}>
								<time dateTime={item.mtime}>{time}</time>
							</small>
						);
					},
				},
			]}
			onChangeView={setView}
			paginationInfo={{
				totalItems: items.length,
				totalPages: 1,
			}}
			onSelectionChange={([item]) => {
				if (item) {
					setCurrentId(item.id);

					if (!isWide) {
						setIsSidebarOpen(false);
					}
				}
			}}
			supportedLayouts={['list']}
		/>
	);
}
