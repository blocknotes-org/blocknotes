import { Filesystem, Encoding } from '@capacitor/filesystem';

export async function saveData( { name, content, newName, newPath, path } ) {
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
    } else {
        await Filesystem.writeFile({
            path: name + '.html',
            data: content,
            directory: 'ICLOUD',
            encoding: Encoding.UTF8,
        });
        await Filesystem.rename({
            from: name + '.html',
            to: newName + '.html',
            directory: 'ICLOUD',
        });
    }
}