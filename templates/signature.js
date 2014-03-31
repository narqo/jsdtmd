mode('signature')(
    match(this.jsdocType === 'module')(function() {
        return this.name + ' Module';
    }),
    match(this.jsdocType === 'class')(function() {
        return this.name + ' Class';
    }),
    match(this.jsdocType === 'param' || this.jsdocType === 'event')(function() {
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
        match(this.jsType === 'Function')(
            match(function() { return Array.isArray(this.params) })(function() {
                var namesSep = /^([^\|\s]+)\s*\|.*/,
                    res = [apply('signature', { params : undefined }, this.params[0])];

                this.params.reduce(function(param1, param2) {
                    var name1 = param1.name,
                        name2 = param2.name;

                    if(!name1 || !name2) return param2;

                    name1 = name1.replace(namesSep, '$1');
                    name2 = name2.replace(namesSep, '$1');

                    // check for nested `@param` tags like `decl` and `decl.block`
                    if(name2.indexOf(name1 + '.') !== 0) {
                        res.push(apply('signature', { params : undefined }, param2));
                        return param2;
                    }

                    return param1;
                });

                return res.join(', ');
            }),
            function() {
                var res = this.params? (' ' + applyNext() + ' ') : '';
                res = (this.name || '*function*') + ' (' + res + ')';

                this.returns && (res += ' → ' + apply('signature', { name : undefined }, this.returns));

                var access = apply('jstype-access'),
                    readonly = apply('jstype-readonly');

                return res +
                    (access? '  ' + access : '') +
                    (readonly? '  ' + readonly : '');
            }
        )
    ),
    function() {
        this.log(this.jsdocType, '(signature)', '@depth', this._depth);
        return applyNext();
    }
);

mode('jstype-name')(function() {
    this.log('(jstype / name)');

    if(!this.name) return '*type*';

    var res = this.name;
    this.default && (res = res + '=' + this.default);
    res.indexOf('|') === -1 || (res = res.replace(/\s*\|\s*/g, ' | '));
    this.isOptional && (res = '[' + res + ']');

    return res;
});

mode('jstype-type')(function() {
    this.log('(jstype / type)');

    var jsType = this.jsType;
    return jsType?
        '{' + (Array.isArray(jsType)? jsType.join(' | ') : jsType) + '}' :
        '';
});

mode('jstype-access')(function() {
    this.log('(jstype / access)');
    return this.accessLevel;
});

mode('jstype-readonly')(function() {
    this.log('(jstype / readonly)');
    return this.isReadOnly? '(readonly)' : '';
});
