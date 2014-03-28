module.exports = function() {

mode('signature')(
    match(this.jsdocType === 'module')(function() {
        return this.name + ' Module';
    }),
    match(this.jsdocType === 'class')(function() {
        return this.name + ' Class';
    }),
    match(this.jsdocType === 'param')(function() {
        return apply('jstype-name');
    }),
    match(this.jsdocType === 'returns')(function() {
        return apply('jstype-type');
    }),
    match(this.jsdocType === 'type')(
        match(this.jsType)(function() {
            var res = apply('jstype-name') || '',
                type = apply('jstype-type'),
                access = apply('jstype-access'),
                readonly = apply('jstype-readonly');

            return res +
                (type? ' ' + type : '') +
                (access? ' ' + access : '') +
                (readonly? ' ' + readonly : '');
        }),
        match(this.jsType === 'Function')(function() {
            var res;

            Array.isArray(this.params) &&
                (res = this.params.map(function(ctx) {
                    return apply('signature', { params : undefined }, ctx);
                }).join(', '));

            res = (this.name || '\\<Function\\>') + ' (' + (res? ' ' + res + ' ' : '') + ')';

            this.returns && (res += ' → ' + apply('signature', { name : undefined }, this.returns));

            var access = apply('jstype-access'),
                readonly = apply('jstype-readonly');

            return res +
                (access? '  ' + access : '') +
                (readonly? '  ' + readonly : '');
        })
    ),
    function() {
        log('⇢', this.jsdocType, '(signature)', '@depth', this.depth);
        return applyNext();
    }
);

mode('jstype')(function() {
    log('⇢ (jstype)');
    return apply('jstype-type') + ' ' + apply('jstype-name');
});

mode('jstype-name')(function() {
    log('⇢ (jstype / name)');

    if(!this.name) return '\\<Type\\>';

    var res = this.name;
    this.default && (res = res + '=' + this.default);
    res.indexOf('|') !== -1 && (res = res.replace(/\s*\|\s*/g, ' | '));
    this.isOptional && (res = '[' + res + ']');

    return res;
});

mode('jstype-type')(function() {
    log('⇢ (jstype / type)');

    var jsType = this.jsType;
    return jsType?
        '{' + (Array.isArray(jsType)? jsType.join(' | ') : jsType) + '}' :
        '';
});

mode('jstype-access')(function() {
    log('⇢ (jstype / access)');
    return this.accessLevel;
});

mode('jstype-readonly')(function() {
    log('⇢ (jstype / readonly)');
    return this.isReadOnly? '(readonly)' : '';
});

};
