var fs = require('fs'),
    path = require('path'),
    bemxjst = require('bem-xjst'),
    tmplBody = fs.readFileSync('./templates/index.js', 'utf8'),
    tmpl = bemxjst.compile(tmplBody, { optimize : false }),
    TESTS_DIR = path.resolve(__dirname, 'test'),
    FIXTURES_DIR = path.resolve(TESTS_DIR, 'fixtures'),
    onlyFile = process.argv[2];

fs.readdirSync(FIXTURES_DIR).forEach(function(file) {
    if(onlyFile && onlyFile.indexOf(file) === -1) return;

    var jsdocPath = path.join(FIXTURES_DIR, file);
    if(!fs.statSync(jsdocPath).isFile() || file.indexOf('.jsdoc.json') === -1) return;

    var md = compile(jsdocPath);
    console.log('------------------');
    console.log(md.toString());
//    fs.writeFileSync(
//        path.join(TESTS_DIR, file.replace('.jsdoc.json', '.md')),
//        md);
});

function compile(jsdocPath) {
    return tmpl.apply(JSON.parse(fs.readFileSync(jsdocPath, 'utf8')));
}
