const fs = require('fs');

fs.readdir(process.argv[2], (err, data) => {
    if (err) {
        console.log(err);
    }

    console.log(data);
});