var fs = require('fs'),
    path = require('path'),
    bemxjst = require('bem-xjst'),
    tmplBody = fs.readFileSync(path.join(__dirname, 'templates/index.js'), 'utf8'),
    output = path.resolve(__dirname, 'lib');

var tmpl = bemxjst.generate(tmplBody, {
    wrap : true,
    optimize : false,
    exportName : 'JSDTMD'
});

fs.writeFileSync(path.join(output, 'index.xjst.js'), tmpl);
