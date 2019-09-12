const dir_name = process.argv[2];
const express = require('express');
const app = express();
const fs = require(`fs`); 
const path = require('path');
const { exec } = require('child_process');

let repos = null;
let commits = null;
let diff = null;
let content = null;

fs.readdir(dir_name, (err, fileData) => {
    if(err) {
        repos = { error: err.message };
    }

    repos = { repos: fileData };
});

app.get('/api/repos', (req, res) => res.json(repos));

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

app.get('/api/repos/:repositoryId(/tree/:commitHash/:path', (req, res) => {
    const repository_name = path.join(dir_name, req.params.repositoryId);
    const hash = req.params.commitHash;
    const path = req.params.path;

    const endpoint = repository_name;
    if(hash) endpoint = hash;
    if(path) endpoint = path;

    exec(`git cat-file -p ${endpoint}`, {cwd: repository_name}, (err, out) => {
        if(err) {
            diff = { error: err.message };
        }

        diff = out;
       });

    res.json(diff);
});


app.listen(3000);