var log = console.error.bind(console);

match(!this.jsdocType)(function() {
    log('⇢ ANY');
    return '';
});

match(this.jsdocType === 'root')(function() {
    log('⇢ root');

    var res = '';

    local({ depth : 0 })(function() {
        var _res = '';

        this.modules.forEach(function(ctx) {
            _res += apply(ctx, { depth : this.depth + 1 });
        }, this);

        res = _res;
    });

    return res;
});

match(this.jsdocType === 'module')(function() {
    log('⇢ module', '@depth', this.depth);

    var name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : this.depth }, content : name });

    local({
        moduleName : this.name,
        name : undefined,
        depth : this.depth + 1
    })(function() {
        var _res = '';

        this.description && (_res += apply({ block : 'para', content : this.description }));
        this.exports && (_res += apply(this.exports));

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'class')(function() {
    log('⇢ class', '@depth', this.depth);

    var depth = this.depth,
        classSign = apply('signature'),
        res = apply({ block : 'headline', mods : { level : depth++ }, content : classSign });

    this.description && (res += apply({ block : 'para', content : this.description }));

    var cons = this.cons,
        proto = this.proto,
        members = this.members;

    if(cons) {
        local({ depth : depth })(function() {
            var _res = '',
                depth = this.depth,
                consSign = apply('signature', { name : this.name }, cons);

            _res += apply({ block : 'headline', mods : { level : depth++ }, content : 'Constructor' });
            _res += apply({ block : 'headline', mods : { level : depth++ }, content : consSign });

            if(cons.params) {
                _res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
                cons.params.forEach(function(ctx) { _res += apply(ctx) });
                _res += '\n'
            }

            res += _res;
        });
    }

    local({ depth : depth })(function() {
        var _res = '',
            depth = this.depth;

        if(proto) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Methods:' });
            _res += apply(proto, { depth : depth + 1 });
        }

        if(members) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Properties:' });
            _res += apply(members, { depth : depth + 1 });
        }

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'type')(
    match(this.jsType)(function() {
        var res = '';

        this.description &&
            (res += apply({ block : 'para', content : this.description }));

        this.jsValue &&
            (res += apply({ block : 'para', content : 'Value: "' + this.jsValue + '"' }));

        return res;
    }),
    match(this.jsType === 'Object')(function() {
        var res = '';

        this.props.forEach(function(ctx) {
            var val = ctx.val,
                valJsdocType = val.jsdocType;

            if(valJsdocType === 'class') {
                res += apply(val);
                return;
            }

            var depth = this.depth;
            if(val.jsType !== 'Function') {
                // `Function`'s signature will be processed within `jsType === 'Function'`
                var propSign = apply('signature', val, { name : ctx.key });
                res += apply({ block : 'headline', mods : { level : depth }, content : propSign });
                depth++;
            }

            res += apply({ name : ctx.key, depth : depth }, val);
        }, this);

        return res;
    }),
    match(this.jsType === 'Function')(function() {
        var res = '',
            funcSing = apply('signature');

        res += apply({ block : 'headline', mods : { level : this.depth }, content : funcSing });

        this.description && (res += apply({ block : 'para', content : this.description }));

        var depth = this.depth + 1,
            params = this.params,
            returns = this.returns;

        if(params) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
            params.forEach(function(ctx) { res += apply(ctx) });
            res += '\n';
        }

        if(returns) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Returns:' });
            res += apply(returns);
        }

        return res;
    },
    function() {
        log('⇢ type', this.jsType, '@depth', this.depth);
        return applyNext();
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
            var res;

            Array.isArray(this.params) &&
                (res = this.params.map(function(ctx) { return apply('signature', ctx) }).join(', '));

            res = (this.name || '<Function>') + ' (' + (res? ' ' + res + ' ' : '') + ')';

            this.returns && (res += ' → ' + apply('signature', this.returns, { name : undefined }));

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

    if(!this.name) return '<Type>';

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
