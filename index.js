var fs = require('fs'),
    path = require('path'),
    tmpl = require('./lib/index.xjst.js'),
    TESTS_DIR = path.resolve(__dirname, 'test'),
    FIXTURES_DIR = path.resolve(TESTS_DIR, 'fixtures'),
    onlyFile = process.argv[2];

fs.readdirSync(FIXTURES_DIR).forEach(function(file) {
    if(onlyFile && onlyFile.indexOf(file) === -1) return;

    var jsdocPath = path.join(FIXTURES_DIR, file);
    if(!fs.statSync(jsdocPath).isFile() || file.indexOf('.jsdoc.json') === -1) return;

    console.log(file);

    var md = compile(jsdocPath);
    console.log('------------------');
//    console.log(md.toString());
    fs.writeFileSync(
        path.join(TESTS_DIR, file.replace('.jsdoc.json', '.md')),
        md);
});

function compile(jsdocPath) {
    return tmpl.JSDTMD.apply(JSON.parse(fs.readFileSync(jsdocPath, 'utf8')));
}
