var fs = require('fs'),
    path = require('path'),
    loader = require('./loader.js'),
    TESTS_DIR = path.resolve(__dirname, '../test'),
    TMPL_DIR = path.resolve(__dirname, '../templates'),
    TMPL_LISTS = [
        'jsd.js',
        'signature.js',
        'markdown.js',
        'main.js'
    ],
    tmplStr = TMPL_LISTS.map(function(file) {
        var fPath = path.resolve(TMPL_DIR, file);
        return loader.parse(require(fPath));
    }).join('\n'),
    jsdtmd = loader.compile(tmplStr),
    onlyFile = process.argv[2];

onlyFile?
    processFile(onlyFile) :
    processDir(path.resolve(TESTS_DIR, 'fixtures'));

function processFile(filePath) {
    var file = path.resolve(filePath),
        fileStat = fs.statSync(file);

    if(fileStat.isDirectory()) return processDir(file);
    else if(!fileStat.isFile()) throw 'not a file';

    compile(load(file));
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

function compile(json) {
    var md = jsdtmd.apply(json);
    console.log('\n---\n%s', md.toString());
    return md;
}

function save(file, data) {
    fs.writeFileSync(path.join(TESTS_DIR, file.replace('.jsdoc.json', '.md')), data);
}
