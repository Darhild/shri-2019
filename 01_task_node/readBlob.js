const fs = require(`fs`); 
const fileData = null;

fs.readFile(process.argv[2], (err, data) => {
    if(err) {
        throw err;
    }

    fileData = data;
});

process.send(fileData);

