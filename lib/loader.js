var bemxjst = require('bem-xjst'),
    FN_RE = /^function(?:\s+\w+)?\s*\([^\)]*\)\s*\{|\}$/g;

exports.parse = parse;
function parse(body) {
    return body.toString().replace(FN_RE, '').trim() || '[SORRY]';
}

exports.compile = compile;
function compile(body) {
    return bemxjst.compile(body, { optimize : false });
}
