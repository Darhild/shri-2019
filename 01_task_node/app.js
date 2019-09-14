const express = require('express');
const app = express();
const fs = require(`fs`); 
const path = require('path');
const { exec, fork } = require('child_process');
const dir_name = process.argv[2];

let repos;
let commits;
let diff;
let content;
let fileData;

app.use(express.json());
app.set('json spaces', 4);

app.get('/api/repos', (req, res) => {

    fs.readdir(dir_name, (err, fileData) => {
        if(err) {
            repos = { error: err.message };
        }

        repos = { repos: fileData };
    });

    res.json(repos);
});

app.get('/api/repos/:repositoryId/commits/:commitHash', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);
    const hash = req.params.commitHash;

    exec(`git log ${hash} --pretty=format:"%h %ad"`, {cwd: repository_name}, (err, out) => {
        if(err) {
            commits = { error: err.message };
        }

        const arr = out.split('\n');
        commits = arr.map(commit => {
            let obj = {};
            let key = commit.slice(0, 7);
            let value = commit.slice(8);
            obj[key] = value;

            return obj;
        });
       });

    res.json(commits);
});

app.get('/api/repos/:repositoryId/commits/:commitHash/diff', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);
    const hash = req.params.commitHash;

    exec(`git diff ${hash} ${hash}^~1`, {cwd: repository_name}, (err, out) => {
        if(err) {
            diff = { error: err.message };
        }

        diff = out;
       });

    res.send(diff);
});

app.get('/api/repos/:repositoryId/tree/:commitHash?/:path?', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);
    const hash = req.params.commitHash;
    const innerPath = req.params.path;

    let endpoint = repository_name;
    let branch = "master";

    if(innerPath) endpoint = path.join(repository_name, innerPath);
    if(hash) branch = hash;

    exec(`git checkout ${branch}`, {cwd: endpoint}, (err, out) => {
        if(err) {
            content = { git_error: err.message };
        }
    });

    fs.readdir(endpoint, (err, fileData) => {
        if(err) {
            content[error] = err.message;
        }

        content = { content: fileData };
    });

    res.json(content);
});


app.get('/api/repos/:repositoryId/blob/:commitHash/:pathToFile', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);
    const hash = req.params.commitHash;
    const fileName = path.join(repository_name, req.params.pathToFile);

    const child = fork(`${__dirname}/readBlob.js`, [ fileName ]);

    exec(`git checkout ${hash}`, (err, out) => {
        if(err) {
            fileData = { git_error: err.message };
        }
    });

    child.on('message', (data) => {
        fileData = data;
    })

    res.end(fileData);
});

app.delete('/api/repos/:repositoryId', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);

    exec(`RMDIR /s/q ${ repository_name }`, (err, out) => {
        if(err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.send({ "error": err.toString() });
        }

        res.send({ "message": `${ req.params.repositoryId } was successfully deleted from repos list!`})
    })
});

/*
app.get('/api/repos/:repositoryId/', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);

    res.send(repository_name);
});*/

app.post('/api/repos/:repositoryId', (req, res) => {
    const repo = req.body.url;

    exec(`git clone ${repo}.git`, {cwd: dir_name}, (err, out) => {
        if(err) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 500;
            res.send({ error: err.toString() });
        }

        res.send({ message: `${req.params.repositoryId} was succesfully added to api repos list!` })
    });
});

app.listen(3000);