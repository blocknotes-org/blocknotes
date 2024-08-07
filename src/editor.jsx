/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import { createPortal } from 'react-dom';
import { useStateWithHistory } from '@wordpress/compose';
import {
	BlockEditorProvider,
	BlockCanvas,
	BlockToolbar,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { undo as undoIcon, redo as redoIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

// eslint-disable-next-line import/no-unresolved
import light from './light.css?raw';
// eslint-disable-next-line import/no-unresolved
import dark from './dark.css?raw';

import blockEditorContentStyle from '@wordpress/block-editor/build-style/content.css?raw';
import blockLibraryCommonStyle from '@wordpress/block-library/build-style/common.css?raw';
// eslint-disable-next-line import/no-unresolved
import blockLibraryContentStyle from './block-types/auto-generated-content.css?raw';
import componentsStyle from '@wordpress/components/build-style/style.css?raw';

// eslint-disable-next-line import/no-unresolved
import contentStyle from './content.css?raw';

const contentStyles = [
	componentsStyle,
	blockLibraryContentStyle,
	blockLibraryCommonStyle,
	blockEditorContentStyle,
	light,
	dark,
	contentStyle,
];

export default function Editor({ initialState, setBlocks }) {
	// To do: lift up and keep track of history for all notes.
	const { value, setValue, hasRedo, hasUndo, redo, undo } =
		useStateWithHistory(initialState);
	return (
		<BlockEditorProvider
			value={value.blocks}
			selection={value.selection}
			onInput={(blocks, { selection }) => {
				setValue({ blocks, selection }, true);
				setBlocks(blocks);
			}}
			onChange={(blocks, { selection }) => {
				setValue({ blocks, selection }, false);
				setBlocks(blocks);
			}}
			settings={{
				hasFixedToolbar: true,
				__unstableResolvedAssets: {
					styles: contentStyles
						.map((css) => `<style>${css}</style>`)
						.join(''),
				},
			}}
		>
			{document.getElementById('block-toolbar') &&
				createPortal(
					<>
						<ToolbarGroup className="components-toolbar-group">
							<ToolbarButton
								className="components-toolbar-button"
								icon={undoIcon}
								label={__('Undo')}
								onClick={() => undo()}
								disabled={!hasUndo}
							/>
							<ToolbarButton
								className="components-toolbar-button"
								icon={redoIcon}
								label={__('Redo')}
								onClick={() => redo()}
								disabled={!hasRedo}
							/>
						</ToolbarGroup>
						<BlockToolbar hideDragHandle />
					</>,
					document.getElementById('block-toolbar')
				)}
			<div
				style={{ height: '100%' }}
				onKeyDown={(event) => {
					if (
						(event.ctrlKey || event.metaKey) &&
						event.key === 'z' &&
						!event.shiftKey
					) {
						event.preventDefault();
						undo();
					} else if (
						(event.ctrlKey && event.key === 'y') ||
						(event.metaKey && event.shiftKey && event.key === 'z')
					) {
						event.preventDefault();
						redo();
					}
				}}
			>
				<BlockCanvas height="100%" />
			</div>
		</BlockEditorProvider>
	);
}
