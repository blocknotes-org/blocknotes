import React from 'react';
/**
 * WordPress dependencies
 */
import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { isRTL, __ } from '@wordpress/i18n';
import { formatOutdent, formatOutdentRTL } from '@wordpress/icons';
import { createBlock } from '@wordpress/blocks';
import { useCallback } from '@wordpress/element';

const DEFAULT_BLOCK = {
	name: 'core/checklist-item',
};
const TEMPLATE = [['core/checklist-item']];

function useOutdentList(clientId) {
	const { replaceBlocks, selectionChange } = useDispatch(blockEditorStore);
	const { getBlockRootClientId, getBlockAttributes, getBlock } =
		useSelect(blockEditorStore);

	return useCallback(() => {
		const parentBlockId = getBlockRootClientId(clientId);
		const parentBlockAttributes = getBlockAttributes(parentBlockId);
		// Create a new parent block without the inner blocks.
		const newParentBlock = createBlock(
			'core/checklist-item',
			parentBlockAttributes
		);
		const { innerBlocks } = getBlock(clientId);
		// Replace the parent block with a new parent block without inner blocks,
		// and make the inner blocks siblings of the parent.
		replaceBlocks([parentBlockId], [newParentBlock, ...innerBlocks]);
		// Select the last child of the list being outdent.
		selectionChange(innerBlocks[innerBlocks.length - 1].clientId);
	}, [clientId]);
}

function IndentUI({ clientId }) {
	const outdentList = useOutdentList(clientId);
	const canOutdent = useSelect(
		(select) => {
			const { getBlockRootClientId, getBlockName } =
				select(blockEditorStore);
			return (
				getBlockName(getBlockRootClientId(clientId)) ===
				'core/checklist-item'
			);
		},
		[clientId]
	);
	return (
		<>
			<ToolbarButton
				icon={isRTL() ? formatOutdentRTL : formatOutdent}
				title={__('Outdent')}
				describedBy={__('Outdent list item')}
				disabled={!canOutdent}
				onClick={outdentList}
			/>
		</>
	);
}

export default function Edit({ clientId }) {
	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		defaultBlock: DEFAULT_BLOCK,
		directInsert: true,
		template: TEMPLATE,
		templateLock: false,
		templateInsertUpdatesSelection: true,
		__experimentalCaptureToolbars: true,
	});

	const controls = (
		<BlockControls group="block">
			<IndentUI clientId={clientId} />
		</BlockControls>
	);

	return (
		<>
			<ul {...innerBlocksProps} />
			{controls}
		</>
	);
}
