import { Filesystem } from '@capacitor/filesystem';

export async function getPaths(path = '', directory) {
	const paths = [];
	const dir = await Filesystem.readdir({ path, directory });

	// Recursively read all files in the iCloud folder
	for (const file of dir.files) {
		const nestedPath = path ? [path, file.name].join('/') : file.name;
		if (file.type === 'directory') {
			if (file.name.startsWith('.')) {
				continue;
			}
			if (file.name.endsWith('.revisions')) {
				continue;
			}
			paths.push(...(await getPaths(nestedPath, directory)));
		} else if (file.name.endsWith('.html')) {
			paths.push({
				...file,
				path: nestedPath,
			});
		} else if (file.name.endsWith('.icloud')) {
			paths.push({
				...file,
				path: nestedPath,
			});
		}
	}

	return paths;
}
