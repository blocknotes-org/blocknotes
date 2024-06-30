import fs from 'fs';
import path from 'path';

const nodeModules = path.join(import.meta.dirname, '..', '..', 'node_modules');

const names = [
	'paragraph',
	'heading',
	'list',
	'list-item',
	'code',
	'quote',
	'preformatted',
	'verse',
	'group',
	'columns',
	'column',
	'table',
	'details',
	'separator',
	'spacer',
	'button',
	'buttons',
];

const init = names
	.map((name) => `@wordpress/block-library/build-module/${name}/init`)
	.map((url) => `import '${url}';`)
	.join('\n');

const style = names
	.map((name) => `@wordpress/block-library/build-style/${name}/style.css`)
	.filter((url) => fs.existsSync(path.join(nodeModules, url)))
	.map((url) => `import '${url}';`)
	.join('\n');

const editor = names
	.map((name) => `@wordpress/block-library/build-style/${name}/editor.css`)
	.filter((url) => fs.existsSync(path.join(nodeModules, url)))
	.map((url) => fs.readFileSync(path.join(nodeModules, url), 'utf8'))
	.join('\n');

fs.writeFileSync(
	path.join(import.meta.dirname, 'auto-generated.js'),
	[init, style].join('\n\n') + '\n'
);
fs.writeFileSync(
	path.join(import.meta.dirname, 'auto-generated-content.css'),
	[editor].join('\n\n') + '\n'
);
