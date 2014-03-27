var log = function() {}; //console.error.bind(console);

match(!this.jsdocType)(function() {
    log('⇢ ANY');
    return '';
});

match(this.jsdocType === 'root')(
    function() {
        // Fallback if no modules exports
        return '';
    },
    match(this.modules)(function() {
        var res = '';

        local({ depth : 0 })(function() {
            this.modules.forEach(function(ctx) {
                res += apply({ depth : this.depth + 1, modules : undefined }, ctx);
            }, this);
        });

        return res;
    }),
    function() {
        log('⇢ root');
        return applyNext();
    }
);

match(this.jsdocType === 'module')(function() {
    log('⇢ module', '@depth', this.depth);

    var name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : this.depth }, content : name });

    local({
        _moduleName : this.name,
        _moduleDesc : this.description,
        name : undefined,
        description : undefined,
        depth : this.depth + 1
    })(function() {
        var _res = '';

        this._moduleDesc && (_res += apply({ block : 'para', content : this._moduleDesc }));
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

    var cons = this.cons,
        clsAugments = this.augments,
        clsProto = this.proto,
        clsStatic = this.static,
        clsMembers = this.members;

    if(clsAugments) {
        var augmentsJsType = clsAugments.jsType;
        res += apply({
            block : 'para',
            content : 'Aughtments ' +
                (Array.isArray(augmentsJsType)?
                    augmentsJsType.join(' | ') :
                    augmentsJsType)
        });
    }

    this.description && (res += apply({ block : 'para', content : this.description }));

    if(cons) {
        // TODO: constructor's description is the same as Function's
        local({ depth : depth })(function() {
            var _res = '',
                depth = this.depth,
                consSign = apply('signature', { name : this.name }, cons);

            _res += apply({ block : 'headline', mods : { level : depth++ }, content : 'Constructor' });
            _res += apply({ block : 'headline', mods : { level : depth++ }, content : consSign });

            if(cons.params) {
                _res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
                cons.params.forEach(function(ctx) { _res += apply({ params : undefined }, ctx) });
                _res += '\n'
            }

            res += _res;
        });
    }

    local({ depth : depth })(function() {
        var _res = '',
            depth = this.depth;

        if(clsMembers) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Properties:' });
            _res += apply(clsMembers, { depth : depth + 1 });
        }

        if(clsProto) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Methods:' });
            _res += apply(clsProto, { depth : depth + 1 });
        }

        if(clsStatic) {
            _res += apply({ block : 'headline', mods : { level : depth }, content : 'Static:' });
            _res += apply(clsStatic, { depth : depth + 1 });
        }

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'type')(
    match(this.jsType)(
        function() {
            var res = '';

            if(this.jsType !== 'Function') {
                // `Function`'s signature will be processed within `jsType === 'Function'`
                var objectSign = apply('signature');
                res += apply({ block : 'headline', mods : { level : this.depth }, content : objectSign });
            }

            this.description &&
                (res += apply({ block : 'para', content : this.description }));

            this.jsValue &&
                (res += apply({ block : 'para', content : 'Value: "' + this.jsValue + '"' }));

            return res;
        },
        match(function() { return this.classes && this.classes.hasOwnProperty(this.jsType) })(function() {
            log('⇢ type (custom classes)', this.jsType, '@depth', this.depth);
            return apply(this.classes[this.jsType]);
        })
    ),
    match(this.jsType === 'Object', this.props)(function() {
        var res = '';

        this.props.forEach(function(ctx) {
            local({ props : undefined })(function() {
                var val = ctx.val,
                    valJsdocType = val.jsdocType;

                if(valJsdocType === 'class') {
                    res += apply(val);
                    return;
                }

                res += apply({ name : ctx.key }, val);
            });
        });

        return res;
    }),
    match(this.jsType === 'Function')(function() {
        var res = '',
            funcSing = apply('signature');

        res += apply({ block : 'headline', mods : { level : this.depth }, content : funcSing });

        this.description && (res += apply({ block : 'para', content : this.description }));

        var params = this.params,
            returns = this.returns,
            depth = this.depth + 1;

        if(params) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
            params.forEach(function(ctx) { res += apply({ params : undefined }, ctx) });
            res += '\n';
        }

        if(returns) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Returns:' });
            res += apply(returns);
        }

        return res;
    }),
    function() {
        log('⇢ type', this.jsType, '@depth', this.depth);
        return applyNext();
    }
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
            var res = apply('jstype-name') || '',
                type = apply('jstype-type'),
                access = apply('jstype-access'),
                readonly = apply('jstype-readonly');

            return res +
                (type? ' ' + type : '') +
                (access? '  ' + access : '') +
                (readonly? '  ' + readonly : '');
        }),
        match(this.jsType === 'Function')(function() {
            var res;

            Array.isArray(this.params) &&
                (res = this.params.map(function(ctx) {
                    return apply('signature', { params : undefined }, ctx);
                }).join(', '));

            res = (this.name || '\<Function\>') + ' (' + (res? ' ' + res + ' ' : '') + ')';

            this.returns && (res += ' → ' + apply('signature', this.returns, { name : undefined }));

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

match(this._mode === 'jstype')(function() {
    log('⇢ (jstype)');
    return apply('jstype-type') + ' ' + apply('jstype-name');
});

match(this._mode === 'jstype-name')(function() {
    log('⇢ (jstype / name)');

    if(!this.name) return '\<Type\>';

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

match(this._mode === 'jstype-access')(function() {
    log('⇢ (jstype / access)');
    return this.accessLevel;
});

match(this._mode === 'jstype-readonly')(function() {
    log('⇢ (jstype / readonly)');
    return this.isReadOnly? '(readonly)' : '';
});

// ---

block('headline')(
    function() { return apply({ block : 'bold', content : this.content }) + '\n\n' },
    mod('level', 1)(function() { return '# ' + this.content + '\n\n' }),
    mod('level', 2)(function() { return '## ' + this.content + '\n\n' }),
    mod('level', 3)(function() { return '### ' + this.content + '\n\n' }),
    mod('level', 4)(function() { return '#### ' + this.content + '\n\n' }),
    mod('level', 5)(function() { return '##### ' + this.content + '\n\n' }),
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

block('ulist')(function() {
    return '* ' + this.content + '\n';
});

block('olist')(function() {
    return '1. ' + this.content + '\n';
});

block('code')(function() {
    return '`' + this.content + '`';
});
