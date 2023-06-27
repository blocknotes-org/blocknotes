import { Filesystem, Encoding } from '@capacitor/filesystem';

export async function saveData( { name, content, newName, newPath, path, trash } ) {
    if ( newPath ) {
        if ( path ) {
            const file = name ? '/' + name + '.html' : '';

            if ( content && file ) {
                console.log( 'writing file', path.join( '/' ) + file );
                await Filesystem.writeFile({
                    path: path.join( '/' ) + file,
                    data: content,
                    directory: 'ICLOUD',
                    encoding: Encoding.UTF8,
                });
            }

            const newFile = newName ? '/' + newName + '.html' : file

            console.log( 'renaming file', path.join( '/' ) + file, newPath.join( '/' ) + newFile );
            await Filesystem.rename({
                from: path.join( '/' ) + file,
                to: newPath.join( '/' ) + newFile,
                directory: 'ICLOUD',
            });
        } else {
            await Filesystem.mkdir({
                path: newPath.join( '/' ),
                directory: 'ICLOUD',
                recursive: true,
            });
        }
    } else if ( trash ) {
        await Filesystem.rename({
            from: path.join( '/' ) + '/' + name + '.html',
            to: path.join( '/' ) + '/.Trash/' + name + '.html',
            directory: 'ICLOUD',
        });
    }
}