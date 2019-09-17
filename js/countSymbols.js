/*  Решение похожей задачи честно подглядела в учебнике "Профессиональный node.js". Самостоятельные попытки разобраться с асихронностью к большому результату не привели :) */

const fs = require('fs');
const path = require('path');
const dirPath = process.argv[2];

const result = new Set;
const filesToCount = [];
let completedFiles = 0;

openDir(dirPath);

function checkIfComplete() {
    completedFiles++;
    if (completedFiles === filesToCount.length) {
        process.send(result);
    }
}

function openDir(dirPath) {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            process.send(err);
        }

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            checkIfIsDir(filePath);
        })
    });
}

function checkIfIsDir(path) {
    fs.stat(path, (err, stats) => {
        if (err) {
            process.send(err);
        }

        if (stats.isDirectory()) {
            openDir(path)
        }
        else {
            (checkFileContents(path))();
            filesToCount.push(checkFileContents);
        }
    })
}

const checkFileContents = (file) => {
    return () => {
        fs.readFile(file, (err, data) => {
            const text = data.toString();
            concatObjects(countSymbols(text));
        })
    }
};

function concatObjects(obj) {
    for (let key in obj) {
        result[key] = obj[key];
    }
    checkIfComplete();
}

function countSymbols(data) {
    const result = {};
    const arr = data.split("");
    const set = [ ...new Set(arr) ];
    const shouldEscape = [ '[', '\\', '/', '^', '"','$', '.', '|', '?',  '*', '+', '(', ')'];

    for (let value of set) {
        if (shouldEscape.includes(value)) value = '\\' + value;
        let regexp = new RegExp(`${value}`, 'g');
        const count = data.match(regexp).length;
        if (value.length > 1) value = value.slice(-1);
        result[value] = count;
    }

    return result;
}