import { Filesystem, Encoding } from '@capacitor/filesystem';

function isoToTime( iso ) {
    // Convert iso string to Y-m-d H:i:s
    return iso.split( 'T' ).join( ' ' ).split( '.' )[0];
}

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
                if ( file.name.startsWith( '.' ) && file.name !== '.Trash' ) {
                    continue;
                }
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
                    ctime: isoToTime( ( new Date( parseInt( file.ctime, 10 ) ) ).toISOString() ),
                    mtime: isoToTime( ( new Date( parseInt( file.mtime, 10 ) ) ).toISOString() ),
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
