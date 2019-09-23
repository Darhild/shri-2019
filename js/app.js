const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec, execSync, fork } = require('child_process');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const checkAccess = promisify(fs.access);
const dirName = process.argv[2];
const user_os = os.type();
let repositoryId, repositoryPath, hash, innerPath, fileName;

const app = express();
app.use(express.json());
app.set('json spaces', 4);

app.param('repositoryId', (req, res, next) => {
    repositoryId = req.params.repositoryId;   
    if ( repositoryId) repositoryPath = path.join(dirName, repositoryId);
    next();
});

app.param('commitHash', (req, res, next) => {
    hash = req.params.commitHash;
    next();
});

app.param('pathToFile', (req, res, next) => {
    fileName = req.params.pathToFile;
    next();
});

app.param('path', (req, res, next) => {
    fileName = req.params.path;
    next();
});

app.use(/\/api\/repos\/.*/, checkIfREpositoryExists);

app.get('/api/repos', async(req, res) => {
    let repos;
    try {
        repos = await readdir(dirName);
    } catch (err) {
        repos = { error: err.message };
    }

    res.json(repos);
});

app.get('(/api/repos/:repositoryId/commits/:commitHash)(/diff)?', async (req, res) => {
    if(/diff$/.test(req.path)) {
        exec(`git diff ${hash} ${hash}^~1`, {cwd: repositoryPath}, (err, out) => {
            if (err) {
                out = err.message;
            }

            res.send(out);
        });
    }

    else {
        let paginatedCommits = "";

        if (req.query.showFrom || req.query.showMax) {
            const numberOfCommits = execSync(`git rev-list --count ${hash}`).toString();
            console.log(numberOfCommits);
        
            if (req.query.showFrom) {
                if(req.query.showFrom < numberOfCommits) paginatedCommits += ` --skip=${req.query.showFrom}`
            }

            if (req.query.showMax) {
                if (req.query.showMax > 0 && req.query.showMax <= numberOfCommits) {
                    paginatedCommits += ` -n ${req.query.showMax}`
                }
            }
        }

        exec(`git log ${hash} --pretty=format:"%h %ad" ${paginatedCommits}`, {cwd: repositoryPath}, (err, out) => {
            if (err) {
                out = { error: err.message };
            }

            const arr = out.split('\n');
            out = arr.map(commit => {
                let obj = {};
                let key = commit.slice(0, 7);
                let value = commit.slice(8);
                obj[key] = value;
                return obj;
            });

            res.json(out);
        });
    }
});

app.get('(/api/repos/:repositoryId)(/tree/:commitHash)?(/:path)?', (req, res) => { 
    let endpoint = repositoryPath;
    let branch = "master";

    if (innerPath) endpoint = path.join(repositoryPath, innerPath);
    if (hash) branch = hash;

    exec(`git ls-tree --name-only ${branch}`, { cwd: endpoint }, (err, out) => {
        res.json(formatCode(out));
    });

});

app.get('/api/repos/:repositoryId/blob/:commitHash/:pathToFile', (req, res) => {
    exec(`git show ${hash}:${fileName}`, {cwd: repositoryPath}, (err, out) => {
        res.end(out);
    });
});

app.get('/api/repos/:repositoryId/count/:commitHash', (req, res) => {
    if (hash) {
        exec(`git checkout ${hash}`, (err, out) => {
            if (err) {
                res.send({ git_error: err });
            }
        });
    }

    const childProcess = fork(`${__dirname}/countSymbols.js`, [ repositoryPath ]);
    childProcess.on('message', (data) => res.send(data));

});

app.delete('/api/repos/:repositoryId', (req, res) => {
    let command = `rm -r ${ repository_name }`;

    if (user_os === 'Windows_NT') command = `RMDIR /s/q ${ repository_name }`;

    exec(command, (err, out) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.send({ "error": err });
        }

        res.send({ "message": `${ req.params.repositoryId } was successfully deleted from repos list!` })
    })

});

app.post('/api/repos/:repositoryId', (req, res) => {
    const repo = req.body.url;

    exec(`git clone ${repo} ${ req.params.repositoryId }`, { cwd: dirName }, (err, out) => {
        if (err) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 500;
            res.send({ error: err });
        }

        res.send({ message: `${ req.params.repositoryId } was succesfully added to api repos list!` })
    });
});

function formatCode(string) {
    string = string.trim();
    return string.split('\n');  
}

function sendError404(res, paramType, paramValue) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 404;
    res.send({ error: `${paramType} ${paramValue} does not exist.` });
}

async function checkIfREpositoryExists(err, req, res, next) {
    console.log("checked");
    const isAccessible = await checkAccess(repositoryPath)
        .then(() => true)
        .catch(() => false);  
        
    if(!isAccessible) sendError404(res, "Repository", repositoryId);
    next();
}

app.listen(3000);


