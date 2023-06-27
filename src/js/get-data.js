import { Filesystem, Encoding } from '@capacitor/filesystem';

export async function getData() {
    const dir = await Filesystem.readdir({
        path: '',
        directory: 'ICLOUD',
    });

    let dotICloud = false;
    
    // Recursively read all files in the iCloud folder
    async function readDirRecursive( dir, name, children ) {
        for ( const file of dir.files ) {
            console.log(file, name)
            if ( file.type === 'directory' ) {
                if ( file.name.startsWith( '.' ) ) continue;
                const item = {
                    type: 'folder',
                    name: file.name,
                    children: [],
                };
                children.push( item );
                await readDirRecursive( await Filesystem.readdir({
                    path: [ ...name, file.name ].join( '/' ),
                    directory: 'ICLOUD',
                }), [ ...name, file.name ], item.children );
            } else if ( file.name.endsWith( '.html' ) ) {
                const text = await Filesystem.readFile({
                    path: [ ...name, file.name ].join( '/' ),
                    directory: 'ICLOUD',
                    encoding: Encoding.UTF8,
                });
                children.push( {
                    type: 'note',
                    content: text.data,
                    title: file.name.replace( /\.html$/i, '' ),
                } );
            } else if ( file.name.endsWith( '.icloud' ) ) {
                dotICloud = true;
            }
        }
    }
    
    const d = [];
    
    await readDirRecursive( dir, [], d );
    
    if ( dotICloud ) {
        alert( 'There are files in your iCloud folder that are not downloaded. You might want to download them and restart the app.' );
    } 
    
    return d;
}
