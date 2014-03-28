module.exports = function() {

block('headline')(
    function() { return apply({ block : 'bold', content : this.content }) + '\n\n' },
    mod('level', 1)(function() { return '# '      + this.content + '\n\n' }),
    mod('level', 2)(function() { return '## '     + this.content + '\n\n' }),
    mod('level', 3)(function() { return '### '    + this.content + '\n\n' }),
    mod('level', 4)(function() { return '#### '   + this.content + '\n\n' }),
    mod('level', 5)(function() { return '##### '  + this.content + '\n\n' }),
    mod('level', 6)(function() { return '###### ' + this.content + '\n\n' })
);

block('para')(function() { return this.content + '\n\n' });

block('bold')(function() { return '**' + this.content + '**' });

block('italic')(function() { return '*' + this.content + '*' });

block('link')(function() {
    var res = this.url;
    this.content && (res = '[' + this.content + '](' + res + ')');
    return res;
});

block('ulist')(
    function() {
        return '* ' + this.content + '\n';
    },
    match(this.mods)(function() {
        return Array(this.mods.level).join('  ') + applyNext();
    })
);

block('olist')(function() {
    return '1. ' + this.content + '\n';
});

block('code')(function() {
    return '`' + this.content + '`';
});

};
