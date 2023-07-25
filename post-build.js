const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'dist', 'assets');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err}`);
    return;
  }

  files.forEach((file) => {
    if (file.startsWith('php_') && ! file.startsWith('php_8_2')) {
      const filePath = path.join(directoryPath, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });
    }
  });
});