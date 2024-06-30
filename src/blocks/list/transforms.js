/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';
import { create, split, toHTMLString } from '@wordpress/rich-text';

function getListContentFlat(blocks) {
	return blocks.flatMap(({ name, attributes, innerBlocks = [] }) => {
		if (name === 'core/checklist-item') {
			return [attributes.content, ...getListContentFlat(innerBlocks)];
		}
		return getListContentFlat(innerBlocks);
	});
}

function createMap(listName, listItemName) {
	return function mapToList(attributes, innerBlocks) {
		return createBlock(
			listName,
			attributes,
			innerBlocks.map((listItemBlock) =>
				createBlock(
					listItemName,
					listItemBlock.attributes,
					listItemBlock.innerBlocks.map((listBlock) =>
						mapToList(listBlock.attributes, listBlock.innerBlocks)
					)
				)
			)
		);
	};
}

const transforms = {
	from: [
		{
			type: 'block',
			isMultiBlock: true,
			blocks: ['core/paragraph', 'core/heading'],
			transform: (blockAttributes) => {
				let childBlocks = [];
				if (blockAttributes.length > 1) {
					childBlocks = blockAttributes.map(({ content }) => {
						return createBlock('core/checklist-item', { content });
					});
				} else if (blockAttributes.length === 1) {
					const value = create({
						html: blockAttributes[0].content,
					});
					childBlocks = split(value, '\n').map((result) => {
						return createBlock('core/checklist-item', {
							content: toHTMLString({ value: result }),
						});
					});
				}
				return createBlock(
					'core/checklist',
					{
						anchor: blockAttributes.anchor,
					},
					childBlocks
				);
			},
		},
		{
			type: 'block',
			blocks: ['core/list'],
			transform: createMap('core/checklist', 'core/checklist-item'),
		},
	],
	to: [
		...['core/paragraph', 'core/heading'].map((block) => ({
			type: 'block',
			blocks: [block],
			transform: (_attributes, childBlocks) => {
				return getListContentFlat(childBlocks).map((content) =>
					createBlock(block, {
						content,
					})
				);
			},
		})),
		{
			type: 'block',
			blocks: ['core/list'],
			transform: createMap('core/list', 'core/list-item'),
		},
	],
};

export default transforms;
