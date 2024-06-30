/**
 * WordPress dependencies
 */
import { published as icon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import edit from './edit';
import metadata from './block.json';
import save from './save';
import transforms from './transforms';

const { name } = metadata;

export { metadata, name };

const settings = {
	icon,
	example: {
		innerBlocks: [
			{
				name: 'core/checklist-item',
				attributes: { content: __('Alice.') },
			},
			{
				name: 'core/checklist-item',
				attributes: { content: __('The White Rabbit.') },
			},
			{
				name: 'core/checklist-item',
				attributes: { content: __('The Cheshire Cat.') },
			},
			{
				name: 'core/checklist-item',
				attributes: { content: __('The Mad Hatter.') },
			},
			{
				name: 'core/checklist-item',
				attributes: { content: __('The Queen of Hearts.') },
			},
		],
	},
	transforms,
	edit,
	save,
};

export { settings };

export const init = () => initBlock({ name, metadata, settings });
