import { applyFormat, removeFormat } from '@wordpress/rich-text';

const name = 'blocknote/tag';

function getTagRegex() {
	return /#[\p{L}\p{N}]+/gu;
}

export default {
	name,
	title: 'Tag',
	tagName: 'u',
	className: null,
	__unstableInputRule(value) {
		const { start, end, text, formats } = value;

		// Remove any stray formats.
		let s = null;
		formats.forEach((group, i) => {
			const hasTag = group.some((format) => format.type === name);
			if (hasTag) {
				if (s === null) {
					s = i;
				}
			} else if (s !== null) {
				if (!getTagRegex().test(text.slice(s, i - 1))) {
					value = removeFormat(value, name, s, i - 1);
				}
				s = null;
			}
		});

		if (s !== null) {
			if (!getTagRegex().test(text.slice(s, text.length))) {
				value = removeFormat(value, name, s, text.length);
			}
		}

		if (start !== end) {
			return value;
		}

		const HASH = '#';
		if (text[start - 2] === HASH) {
			if (getTagRegex().test(text.slice(start - 2, start))) {
				return applyFormat(value, { type: name }, start - 2, start);
			}
		}

		const textBefore = text.slice(0, start);
		const tagRegex = getTagRegex();

		let match;
		let lastMatch;
		while ((match = tagRegex.exec(textBefore)) !== null) {
			lastMatch = match;
		}

		if (lastMatch && lastMatch.index + lastMatch[0].length === start - 1) {
			return removeFormat(value, name, start - 1, start);
		}

		return value;
	},
};
