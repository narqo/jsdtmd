var log = console.error.bind(console);

match(!this.jsdocType)(function() {
    log('⇢ ANY');
    return '';
});

match(this.jsdocType === 'root')(function() {
    log('⇢ root');

    var res = '';

    local({ depth : 0, _res : '' })(function() {
        this.depth++;
        this.modules.forEach(function(ctx) {
            this._res += apply(ctx)
        }, this);
        this.depth--;

        res = this._res;
    });

    return res;
});

match(this.jsdocType === 'module')(function() {
    log('⇢ module', '@depth', this.depth);

    var name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : this.depth }, content : name });

    local({ depth : this.depth + 1, _res : '' })(function() {
        this.description && (this._res += apply({ block : 'para', content : this.description }));

        if(this.exports) {
            this._res += apply({ block : 'para', content : 'Exports:' });
            this._res += apply(this.exports)
        }

        res += this._res;
    });

    return res;
});

match(this.jsdocType === 'class')(function() {
    log('⇢ class', '@depth', this.depth);

    var depth = this.depth,
        name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : depth++ }, content : name });

    this.description && (res += apply({ block : 'para', content : this.description }));

    var cons = this.cons,
        proto = this.proto,
        members = this.members;

    if(cons) {
        local({ depth : depth, _res : '' })(function() {
            var depth = this.depth,
                consSign = local({ name : this.name })(apply('signature', cons));

            this._res += apply({ block : 'headline', mods : { level : depth++ }, content : 'Constructor' });
            this._res += apply({ block : 'headline', mods : { level : depth++ }, content : consSign });


            if(cons.params) {
                this._res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
                this._res += cons.params.map(function(ctx) { return apply(ctx) }).join('') + '\n';
            }

            res += this._res;
        });
    }

    local({ depth : depth++, _res : '' })(function() {
        if(proto) {
            this._res += apply({ block : 'headline', mods : { level : this.depth++ }, content : 'Methods:' });
            this._res += apply(proto);
            this.depth--;
        };

        if(members) {
            this._res += apply({ block : 'headline', mods : { level : this.depth++ }, content : 'Properties:' });
            this._res += apply(members);
            this.depth--;
        };

        res += this._res;
    });

    return res;
});

match(this.jsdocType === 'type')(
    match(this.jsType)(function() {
        console.log('⇢ type', this.jsType, '@depth', this.depth);

        var res = '';

        this.description &&
            (res += apply({ block : 'para', content : this.description }));

        this.jsValue &&
            (res += apply({ block : 'para', content : 'Value: "' + this.jsValue + '"' }));

        return res;
    }),
    match(this.jsType === 'Object')(function() {
        console.log('⇢ type Object', '@depth', this.depth);

        var res = '';

        this.props.forEach(function(ctx) {
            var val = ctx.val,
                valJsdocType = val.jsdocType;

            if(valJsdocType === 'class') {
                res += apply(val);
                return;
            }

            var propName = local({ name : ctx.key })(apply('signature', val));
            res += apply({ block : 'headline', mods : { level : this.depth }, content : propName });

            this.depth++;
            res += apply(val);
            this.depth--;
        }, this);

        return res;
    }),
    match(this.jsType === 'Function')(function() {
        console.log('⇢ type Function', '@depth', this.depth);

        var res = '';
        this.description && (res += apply({ block : 'para', content : this.description }));

        var depth = this.depth,
            params = this.params,
            returns = this.returns;

        if(params) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
            res += params.map(function(ctx) { return apply(ctx) }).join('') + '\n';
        }

        if(returns) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Returns:' });
            res += apply(returns);
        }

        return res;
    })
);

match(this.jsdocType === 'param')(
    match(this.jsType)(function() {
        var name = apply('jstype-name'),
            type = apply('jstype-type');
        return name + ' ' + type;
    }),
//    match(this.jsType === 'Function')(function() {
//        // TODO: proper function's signature, e.g. `Function(filePath)`
//        return local({ name : undefined })(apply('signature'));
//    }),
    function() {
        log('⇢ param', this.jsType, '@depth', this.depth);

        var res = applyNext();
        this.description && (res += '<br/>\n  ' + this.description);

        return apply({ block : 'ulist', content : res });
    }
);

match(this.jsdocType === 'returns')(function() {
    log('⇢ returns', '@depth', this.depth);

    var jsType = this.jsType,
        res = apply({ block : 'para', content : Array.isArray(jsType)? jsType.join(' | ') : jsType });

    this.description &&
        (res += apply({ block : 'para', content : this.description }));

    return res;
});

// ---

match(this._mode === 'signature')(
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
            return apply('jstype-name') + ' ' + apply('jstype-type');
        }),
        match(this.jsType === 'Function')(function() {
            var res = (this.name || '') + ' (';

            Array.isArray(this.params) &&
                (res += ' ' + this.params.map(function(ctx) { return apply('signature', ctx) }).join(', ') + ' ');

            res += ')';

            this.returns && (res += ' → ' + local({ name : undefined })(apply('signature', this.returns)));

            return res;
        })
    ),
    function() {
        log('⇢', this.jsdocType, '(signature)', '@depth', this.depth);
        return applyNext();
    }
);

match(this._mode === 'jstype')(function() {
    log('⇢ (jstype)');

    return apply('jstype-type') + ' ' + apply('jstype-name');
});

match(this._mode === 'jstype-name')(function() {
    log('⇢ (jstype / name)');

    if(!this.name) return '';

    var res = this.name;

    this.default && (res = res + '=' + this.default);
    this.isOptional && (res = '[' + res + ']');

    return res;
});

match(this._mode === 'jstype-type')(function() {
    log('⇢ (jstype / type)');

    var jsType = this.jsType;
    return jsType?
        '{' + (Array.isArray(jsType)? jsType.join(' | ') : jsType) + '}' :
        '';
});

// ---

block('headline')(
    function() { return '**' + this.content + '**\n\n' },
    mod('level', 1)(function() { return '# ' + this.content + '\n\n' }),
    mod('level', 2)(function() { return '## ' + this.content + '\n\n' }),
    mod('level', 3)(function() { return '### ' + this.content + '\n\n' }),
    mod('level', 4)(function() { return '#### ' + this.content + '\n\n' }),
    mod('level', 5)(function() { return '##### ' + this.content + '\n\n' }),
    mod('level', 6)(function() { return '###### ' + this.content + '\n\n' })
);

block('para')(function() { return this.content + '\n\n' });

block('link')(function() {
    var res = this.url;
    this.content && (res = '[' + this.content + '](' + res + ')');
    return res;
});

block('ulist')(function() {
    return '* ' + this.content + '\n';
});

block('olist')(function() {
    return '1. ' + this.content + '\n';
});

block('code')(function() {
    return '`' + this.content + '`';
});
