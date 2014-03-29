/**
 * @module jsdtmd
 */

var fs = require('fs'),
    path = require('path'),
    bemxjst = require('bem-xjst'),
    FN_RE = /^function(?:\s+\w+)?\s*\([^\)]*\)\s*\{|\}$/g,
    TMPL_DIR = path.resolve(__dirname, '../templates'),
    TMPL_LISTS = [
        'jsd.js',
        'signature.js',
        'markdown.js',
        'main.js'
    ],
    JSDTMD = compile(TMPL_LISTS);

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
