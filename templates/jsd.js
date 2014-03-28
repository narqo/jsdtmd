var log = console.error.bind(console);

match(!this.jsdocType)(function() {
    log('⇢ ANY');
    return '';
});

match(function() { return Array.isArray(this) })(function() {
    log('⇢ ARRAY');
    var res = '';
    this.forEach(function(ctx) { res += apply(ctx) });
    return res;
});

match(this.jsdocType === 'root')(
    function() {
        // Fallback if no modules exports
        return '';
    },
    match(this.modules)(function() {
        var res = '';
        this.modules.forEach(function(ctx) {
            res += apply({ _depth : this._depth + 1, modules : undefined }, ctx);
        }, this);
        return res;
    }),
    function() {
        log('⇢ root');
        return applyNext();
    }
);

match(this.jsdocType === 'module')(function() {
    log('⇢ module', '@depth', this._depth);

    var name = apply('signature'),
        res = apply({ block : 'headline', mods : { level : this._depth }, content : name });

    local({
        _depth : this._depth + 1,
        _moduleName : this.name,
        _moduleDesc : this.description,
        name : undefined,
        description : undefined
    })(function() {
        var _res = '';

        this._moduleDesc && (_res += apply({ block : 'para', content : this._moduleDesc }));
        this.exports && (_res += apply(this.exports));

        res += _res;
    });

    return res;
});

match(this.jsdocType === 'class')(function() {
    log('⇢ class', '@depth', this._depth);

    var depth = this._depth,
        classSign = apply('signature'),
        res = apply({ block : 'headline', mods : { level : depth++ }, content : classSign }),
        clsAugments = this.augments;

    if(clsAugments) {
        res += apply({
            block : 'para',
            content : 'Aughtments ' + apply('jstype-type', clsAugments)
        });
    }

    this.description && (res += apply({ block : 'para', content : this.description }));

    var clsCons = this.cons,
        clsProto = this.proto,
        clsStatic = this.static,
        clsMembers = this.members;

    if(clsCons) {
        res += apply({ block : 'headline', mods : { level : depth }, content : 'Constructor' });
        res += apply({ name : this.name, _depth : depth + 1 }, clsCons);
    }

    if(clsMembers) {
        res += apply({ block : 'headline', mods : { level : depth }, content : 'Properties:' });
        res += apply(clsMembers, { _depth : depth + 1 });
    }

    if(clsProto) {
        res += apply({ block : 'headline', mods : { level : depth }, content : 'Methods:' });
        res += apply(clsProto, { _depth : depth + 1 });
    }

    if(clsStatic) {
        res += apply({ block : 'headline', mods : { level : depth }, content : 'Static:' });
        res += apply(clsStatic, { _depth : depth + 1 });
    }

    return res;
});

match(this.jsdocType === 'type')(
    match(this.jsType)(
        function() {
            var res = '';

            if(this.jsType !== 'Function') {
                // `Function`'s signature will be processed within `jsType === 'Function'`
                var objectSign = apply('signature');
                res += apply({ block : 'headline', mods : { level : this._depth }, content : objectSign });
            }

            this.description &&
            (res += apply({ block : 'para', content : this.description }));

            this.jsValue &&
            (res += apply({ block : 'para', content : 'Value: "' + this.jsValue + '"' }));

            return res;
        },
        match(function() {
            return this.classes && this.classes.hasOwnProperty(this.jsType)
        })(function() {
            log('⇢ type (custom classes)', this.jsType, '@depth', this._depth);
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

        res += apply({ block : 'headline', mods : { level : this._depth }, content : funcSing });

        this.description && (res += apply({ block : 'para', content : this.description }));

        var depth = this._depth + 1,
            params = this.params,
            returns = this.returns;

        if(params) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Parameters:' });
            params.forEach(function(ctx) {
                res += apply({ params : undefined }, ctx);
            }, this);
            res += '\n';
        }

        if(returns) {
            res += apply({ block : 'headline', mods : { level : depth }, content : 'Returns:' });
            res += apply(returns);
        }

        return res;
    }),
    function() {
        log('⇢ type', this.jsType, '@depth', this._depth);
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
        log('⇢ param', this.jsType, '@depth', this._depth);

        var res,
            name = this.name;

        res = applyNext({ name : name });
        this.description && (res += '<br/>\n  ' + this.description);

        return apply({ block : 'ulist', mods : { level : this._paramDepth }, content : res });
    }
);

match(this.jsdocType === 'returns')(function() {
    log('⇢ returns', '@depth', this._depth);

    var jsType = apply('jstype-type'),
        res = apply({ block : 'para', content : jsType });

    this.description &&
        (res += apply({ block : 'para', content : this.description }));

    return res;
});
