// eslint-disable-next-line import/no-unresolved
import logoUrl from './assets/imgs/logo.png?url';

// Add manifest.json to the home screen
const link = document.createElement('link');
link.rel = 'manifest';
const manifest = {
	name: 'Blocknotes',
	short_name: 'Blocknotes',
	start_url: new URL('index.html', window.origin).toString(),
	display: 'standalone',
	icons: [
		{
			src: new URL(logoUrl, window.origin).toString(),
			sizes: '512x512',
			type: 'image/png',
		},
	],
	background_color: '#000000',
	theme_color: '#000000',
};

const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
link.href = URL.createObjectURL(blob);
document.head.appendChild(link);
