const fs = require('fs');

fs.readFile(process.argv[2], (err, data) => {
    if (err) {
        return err;
    }
    return data;
});



/*
const stream = fs.createReadStream(process.argv[2]);
stream.pipe(process.stdout);


/*
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

return async() => {
    try {
        return readFile(process.argv[2]);
    } catch (err) {
        return err;
    }
})();
*/


/*
const fs = require('fs');

const stream = createReadStream(process.argv[2]);

fs.readFile(process.argv[2], (err, data) => {
    process.stdin.pipe(process.stdout);
});

*/

