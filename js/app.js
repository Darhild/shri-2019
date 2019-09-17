const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec, execSync, fork } = require('child_process');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const dirName = process.argv[2];
const user_os = os.type();

const app = express();
app.use(express.json());
app.set('json spaces', 4);

app.get('/api/repos', async(req, res) => {
    let repos;
    try {
        repos = await readdir(dirName);
    } catch (err) {
        repos = { error: err.message };
    }

    res.json(repos);
});

app.get('(/api/repos/:repositoryId/commits/:commitHash)(/diff)?', (req, res) => {
    const repositoryName = req.params.repositoryId;
    const repositoryPath = path.join(dirName, repositoryName);
    const hash = req.params.commitHash;

    fs.access(repositoryPath, (err) => {
        if (err) {
            sendError404(res, "Repository", repositoryName);
            return;
        }

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
    })
});

app.get('(/api/repos/:repositoryId)(/tree/:commitHash)?(/:path)?', (req, res) => {
    const repositoryName = req.params.repositoryId;
    const repositoryPath = path.join(dirName, repositoryName);

    fs.access(repositoryPath, (err) => {
        if (err) {
            sendError404(res, "Repository", repositoryName);
            return;
        }

        const hash = req.params.commitHash;
        const innerPath = req.params.path;

        let endpoint = repositoryPath;
        let branch = "master";

        if (innerPath) endpoint = path.join(repositoryPath, innerPath);
        if (hash) branch = hash;

        exec(`git checkout ${branch}`, { cwd: endpoint }, async(err, out) => {
            if (err) {
                out = { git_error: err.message };
            }

            try {
                out = await readdir(endpoint);
            } catch (err) {
                out = { error: err.message };
            }

            res.json(out);
        });
    });
});

app.get('/api/repos/:repositoryId/blob/:commitHash/:pathToFile', (req, res) => {
    const repositoryName = req.params.repositoryId;
    const fileName = req.params.pathToFile;
    const repositoryPath = path.join(dirName, repositoryName);
    const hash = req.params.commitHash;
    let fileData;

    fs.access(repositoryPath, (err) => {
        if (err) {
            sendError404(res, "Repository", repositoryName);
            return;
        }

        exec(`git checkout ${hash}`, (err, out) => {
            if (err) {
                fileData = { git_error: err.message };
            }
        });

        const filePath = path.join(repositoryPath, fileName);

        fs.access(filePath, (err) => {
            if (err) {
                sendError404(res, "File", fileName);
                return;
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.send(err);
                }

                res.end(data);
            })
        })
    })
});

app.get('/api/repos/:repositoryId/count/:commitHash', (req, res) => {
    const repositoryName = req.params.repositoryId;
    const repositoryPath = path.join(dirName, repositoryName);
    const hash = req.params.commitHash;

    fs.access(repositoryPath, (err) => {
        if (err) {
            sendError404(res, "Repository", repositoryName);
            return;
        }

        if (hash) {
            exec(`git checkout ${hash}`, (err, out) => {
                if (err) {
                    res.send({ git_error: err });
                }
            });
        }

        const childProcess = fork(`${__dirname}/countSymbols.js`, [ repositoryPath ]);
        childProcess.on('message', (data) => res.send(data));
    })
});

app.delete('/api/repos/:repositoryId', (req, res) => {
    const repositoryName = req.params.repositoryId;
    const fileName = req.params.pathToFile;

    fs.access(repositoryPath, (err) => {
        if (err) {
            sendError404(res, "Repository", repositoryName);
            return;
        }

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

app.listen(3000);

function sendError404(res, paramType, paramValue) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 404;
    res.send({ error: `${paramType} ${paramValue} does not exist.` });
}