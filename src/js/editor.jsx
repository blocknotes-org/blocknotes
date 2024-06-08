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

import blockEditorContentStyleUrl from '@wordpress/block-editor/build-style/content.css?url';
import blockLibraryContentStyleUrl from '@wordpress/block-library/build-style/editor.css?url';
import componentsStyleUrl from '@wordpress/components/build-style/style.css?url';

export default function Editor({ state, setNote }) {
	// To do: lift up and keep track of history for all notes.
	const { value, setValue, hasRedo, hasUndo, redo, undo } =
		useStateWithHistory(state);
	return (
		<BlockEditorProvider
			value={value.blocks}
			selection={value.selection}
			onInput={(blocks, { selection }) => {
				setValue({ blocks, selection }, true);
				setNote(blocks);
			}}
			onChange={(blocks, { selection }) => {
				setValue({ blocks, selection }, false);
				setNote(blocks);
			}}
			settings={{
				hasFixedToolbar: true,
				__unstableResolvedAssets: {
					styles: `
<link rel="stylesheet" href="${componentsStyleUrl}">
<link rel="stylesheet" href="${blockEditorContentStyleUrl}">
<link rel="stylesheet" href="${blockLibraryContentStyleUrl}">`,
				},
			}}
		>
			{document.getElementById('select') &&
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
					document.getElementById('select')
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
				<BlockCanvas
					height="100%"
					styles={[
						{
							css: `
body {
max-width: 600px;
margin: 100px auto;
font-family: Hoefler Text;
font-size: 20px;
padding: 1px 1em;
}
`,
						},
					]}
				/>
			</div>
		</BlockEditorProvider>
	);
}
