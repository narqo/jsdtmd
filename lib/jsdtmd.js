/**
 * @module jsdtmd
 */

var fs = require('fs'),
    path = require('path'),
    bemxjst = require('bem-xjst'),
    FN_RE = /^function(?:\s+\w+)?\s*\([^\)]*\)\s*\{|\}$/g,
    TMPL_DIR = path.resolve(__dirname, '../templates'),
    templates = [
        'jsd.js',
        'include/root.js',
        'include/file.js',
        'include/module.js',
        'include/class.js',
        'include/type.js',
        'include/param.js',
        'include/returns.js',
        'include/event.js',
        'signature.js',
        'markdown.js',
        'main.js'
    ],
    JSDTMD = compile(templates);

module.exports =
    /**
     * Converts JSDoc JSON received from [bem-jsd](http://github.com/bem/bem-jsd)
     * to Markdown string.
     *
     * @exports jsdtmd
     * @param {Object} jsdocTree Parsed JSDoc
     * @returns {String}
     */
    function JSDTMD_Apply(jsdocTree) { return JSDTMD.apply(jsdocTree) };

function parse(body) {
    return body.toString().replace(FN_RE, '').trim() || '[SORRY]';
}

function compile(templates) {
    var body = templates.map(function(file) {
        var fPath = path.resolve(TMPL_DIR, file);
        return parse(fs.readFileSync(fPath, 'utf8'));
    }).join('\n');

    return bemxjst.compile(body, { optimize : false });
}
