const fs = require('fs');

fs.readdir(process.argv[2], (err, files) => {
    if (err) {
        console.log(err);
    }

    files.forEach((file) => {
        file.stat
    })
});

function checkIfIsDir(name) {
    fs.stat(name)
}