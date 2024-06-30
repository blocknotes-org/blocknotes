import { registerBlockType } from '@wordpress/blocks';

export default function initBlock(block) {
	if (!block) {
		return;
	}
	const { metadata, settings, name } = block;
	return registerBlockType({ name, ...metadata }, settings);
}
