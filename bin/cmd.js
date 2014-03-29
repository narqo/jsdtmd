#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    jsdtmd = require('../lib/jsdtmd'),
    TESTS_DIR = path.resolve(__dirname, '../test'),
    onlyFile = process.argv[2];

if(onlyFile) {
    processFile(onlyFile);
    return;
}

var buf = '';
process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    chunk === null || (buf += chunk.toString('utf8'));
});

process.stdin.on('end', function(data) {
    data && (buf += data);
    if(buf.charAt(0) === '[' || buf.charAt(0) === '{') {
        generateMD(JSON.parse(buf));
    }
});

//processDir(path.resolve(TESTS_DIR, 'fixtures'));

function generateMD(data) {
    var md = jsdtmd(data);
    console.log('---\n%s', md.toString());
}

function processFile(filePath) {
    var file = path.resolve(filePath),
        fileStat = fs.statSync(file);

    if(fileStat.isDirectory()) return processDir(file);
    else if(!fileStat.isFile()) throw 'not a file';

    generateMD(load(file));
}

function processDir(dirPath) {
    fs.readdirSync(dirPath).forEach(function(file) {
        if(file.indexOf('.json') === -1) return;
        var jsonPath = path.join(dirPath, file);
        processFile(jsonPath);
    });
}

function load(file) {
    console.log('load %s\n', file);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function save(file, data) {
    fs.writeFileSync(path.join(TESTS_DIR, file.replace('.jsdoc.json', '.md')), data);
}
